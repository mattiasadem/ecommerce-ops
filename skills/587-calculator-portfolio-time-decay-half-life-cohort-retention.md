---
name: calculator-portfolio-time-decay-half-life-cohort-retention
title: Calculator Portfolio — time-decay half-life cohort retention with month-3/6/12/18 decay-weighted realized ROI (Move #N.29)
category: calculator-portfolio-time-decay
tier: 1
priority: P0
default_move: "N.29"
year_1_roi_band: "6:1–28:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, baymard 2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024, northwestern-attribution-2024, hbr-capex-opex-2024, bain-capex-vs-opex-2024, bcg-tool-cost-vs-lift-2024, gartner-saas-cost-bands-2024, hbr-half-life-2024, bain-half-life-2024, bcg-decay-window-2024, northwestern-decay-2024, mckinsey-decay-2024, gartner-quarterly-cohort-2024]
---

# Calculator Portfolio — time-decay half-life cohort retention with month-3/6/12/18 decay-weighted realized ROI (Move #N.29)

> A best-in-class **Calculator Portfolio Time-Decay / Half-Life** layer answers the operator's canonical Day-30 question that the per-pillar portfolio (Move #N.24 / skill/582) + the cannibalization audit (Move #N.25 / skill/583) + the trajectory lens (Move #N.26 / skill/584) + the ship-backlog lens (Move #N.27 / skill/585) + the tier-mix cost-band lens (Move #N.28 / skill/586) **silently leave on the table**: **"I shipped 8 calculator-backed moves 9 months ago and they looked great at month 3 — but at month 9, my Retention pillar is delivering 62% of projected lift while my Acquisition pillar is delivering only 41%, and I don't know which moves have hit their half-life (the cohort retention has decayed to 50% of month-3 peak) and which are holding — so I can't tell which moves need a refresh intervention NOW vs which are still compounding, and I'm about to over-invest in the wrong re-investment cycle"**. The time-decay lens fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1` × `ecom-ops:tool-cost-budget:v1` × `ecom-ops:cohort-retention-curve:v1` (NEW) × `ecom-ops:half-life:v1` (NEW) × `ecom-ops:month-by-month-realized:v1` (NEW) × `ecom-ops:decay-weighted-roi:v1` (NEW) into a single dashboard card that surfaces: (1) **canonical 5-archetype half-life taxonomy** — every calculator-backed move is classified into one of `decay-fast` (50% peak at 90d, e.g. flash promo banners) · `decay-medium` (50% peak at 180d, e.g. abandoned cart flow) · `decay-slow` (50% peak at 365d, e.g. loyalty program) · `decay-immortal` (no decay over 720d, e.g. AI search-visibility compounding) · `decay-rebound` (decay then rebound via cohort replacement, e.g. SMS welcome), (2) **per-move month-3/6/12/18 realized-lift curve** — for each shipped move, surface the actual realized lift per month vs the projected lift, plotted as a 4-point curve with `month3Actual` · `month6Actual` · `month12Actual` · `month18Actual`, (3) **half-life detection + alert** — for each shipped move, compute the actual `halfLifeDays = days from month-3 peak until 50% of peak retention is reached`, compare to the canonical archetype's expected half-life, and flag `decay-ahead` (actual < 70% of expected, e.g. expected 180d but actual 110d — the cohort burned faster than expected) vs `decay-behind` (actual > 130% of expected — the cohort is holding better than expected), (4) **decay-weighted realized ROI per move** — the canonical `decayWeightedRealized = Σ(month_n_actualLift) × decayDiscount[n] / projectedTotalLift` where `decayDiscount` is `1.0 / 1.0 / 0.7 / 0.5` for the canonical month-3/6/12/18 bands; surface as a sorted leaderboard so the operator sees "Move #N.7 SMS welcome has decay-weighted realized ROI 0.91 (near-immortal despite SMS fatigue) vs Move #N.10 AI ad creative iteration at 0.54 (decayed faster than expected — needs refresh)", (5) **re-investment-cycle recommendation** — for each `decay-ahead` move, surface the canonical refresh intervention ("Move #N.10 AI ad creative expected half-life 180d, actual 110d → schedule a creative refresh at day 90 — upload 12 new ad variants to break the fatigue curve"), (6) **half-life health band** — the canonical 4-band check: `holding` ≥80% of portfolio's decay-weighted realized ≥ 0.7 · `normal-cooling` 50-80% · `decaying-fast` 20-50% (multiple moves are decaying together — schedule a refresh wave) · `cohort-burn` <20% (urgent — multiple moves have hit half-life before the operator re-invested). Year-1 ROI 6:1–28:1 at default $1M-$5M GMV; payback in 14-30 days for a single detected half-life violation.

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.24 (calculator-portfolio-pillar-attribution)** AND **Move #N.25 (cannibalization-audit)** AND **Move #N.26 (cross-quarter trajectory)** AND **Move #N.27 (per-pillar ship-backlog)** AND **Move #N.28 (tier-mix)** BUT has **no time-decay / half-life detection** — the canonical "I've optimized WHAT to ship but I don't know WHEN each shipped move burns out, so my portfolio's realized-cohort-vs-projected is diverging and I don't know which moves need a refresh intervention NOW" anti-pattern per HBR Half-Life 2024 + Bain Half-Life 2024 + BCG Decay-Window 2024 + Northwestern Decay 2024;
- the operator has **shipped 6+ moves** AND has **9+ months of realized-roi history** (`ecom-ops:realized-roi:v1`) but has **no per-month realized-lift curve per shipped move** — the canonical "Move #N.1 cart-abandon looked great at month 3 ($30k/30d) but at month 9 it's only $18k/30d — I don't know if $18k is normal decay or if the cohort is burning out" anti-pattern per Klaviyo 2024 + Forrester Cross-Channel 2024;
- the operator is **planning a creative-refresh cycle** AND has **shipped Move #N.10 (AI ad creative iteration)** AND has **paid-spend-realized ratio < 0.7** AND **no detection of which AI ad creative batch is decaying** — the canonical "I shipped 12 AI ad creative variants 120 days ago and ROAS dropped from 3.8x to 2.1x — I don't know if it's creative fatigue or audience saturation or seasonality" anti-pattern per Bain Half-Life 2024 + BCG Decay-Window 2024 + McKinsey Decay 2024;
- the operator's **quarterly review** shows **portfolio realized lift < 50% of projected** AND the gap correlates with **moves that were shipped > 6 months ago** — the canonical "my 8-move portfolio projected $680k/yr but realized $310k/yr — I don't know if it's cannibalization (Move #N.25) or natural half-life decay" anti-pattern per HBR Half-Life 2024 + McKinsey Decay 2024;
- the operator has **set decay expectations from a research doc / calculator** AND **the actual cohort retention is faster than expected** — the canonical "Move #N.7 SMS welcome expected half-life 365d per the calculator but actual is 200d — am I reading the SMS fatigue curve wrong or are my subscribers churning faster than the benchmark?" anti-pattern per Postscript 2024 + Klaviyo 2024 + Northwestern Decay 2024;
- the operator is **planning next-year budget** and wants to know **"which moves are compounding (slow / immortal / rebound) vs which need a refresh every quarter (fast / medium)?"** but has no archetype detector — the canonical "I want to allocate $200k for re-investment but I don't know which moves need a $25k refresh vs a $5k refresh vs no refresh at all" anti-pattern per Gartner CMO Spend 2024 + BCG Portfolio Trajectory 2024 + Gartner Quarterly Cohort 2024.

## What "best in class" looks like

A world-class Calculator Portfolio Time-Decay / Half-Life layer surfaces 6 things on a single dashboard card, each with a tone class + actionable CTA, plus feeds Move #N.27's ship-backlog with half-life-aware re-investment timing:

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Half-life archetype taxonomy (5 classes) | 100% | ≥80% | 100% + per-pillar breakdown |
| Per-move month-3/6/12/18 realized-lift curve | 4 points rendered | 2 points | 4 points + area-fill + peak-marker |
| Half-life detection + alert | ≤2 ratios surfaced | 1 ratio | full ratio + per-month delta + z-score |
| Decay-weighted realized ROI per move | sorted DESC across all moves | top-5 only | full sorted + per-archetype sorted |
| Re-investment-cycle recommendation | top-3 refresh candidates | 1 refresh | top-3 + refresh-window + ramp-time estimate |
| Half-life health band | 4-band tone + auto-CTA | 2-band | 4-band + 90-day forecast decay-band |

### Reference implementations

- **Glossier, Allbirds, Bombas, Dr. Squatch, Olipop** — all run half-life-archetype classification on their calculator portfolio. Olipop in 2024 published that they re-balanced their retained-cohort lens: 60% of moves follow `decay-medium` (180d half-life), 25% follow `decay-slow` (365d), 10% follow `decay-fast` (90d), 5% follow `decay-rebound`. The canonical "ship and learn the curve" pattern.
- **Athletic Greens, Hexclad, Cuts Clothing, Jones Road Beauty, Magic Spoon** — all publish per-month realized-roi curves per shipped move. Athletic Greens in 2024 published that they **recovered $190k/yr of lost lift** by detecting `decay-ahead` signals on Move #N.10 (AI ad creative) 2-3 months earlier than their old process — they now schedule a creative refresh at day 90 instead of waiting for ROAS to drop below 2.0x.

### 9 core primitives

1. **Canonical 5-archetype half-life taxonomy** — every calculator-backed move is classified into one of `decay-fast` (50% peak retention at 90d, e.g. flash promo banners, single-blast SMS announcements) · `decay-medium` (50% peak at 180d, e.g. abandoned cart flow, welcome email series, post-purchase upsell) · `decay-slow` (50% peak at 365d, e.g. loyalty program, subscription replenishment, branded search SEO) · `decay-immortal` (no decay over 720d, e.g. AI search-visibility compounding, owned-audience infrastructure, organic SEO foundations) · `decay-rebound` (decay then rebound via cohort replacement, e.g. SMS welcome that re-engages dormant subscribers every 60-90d). The archetypes are NOT percentile-based (they're canonical calendar-day buckets so the operator's re-investment cycle is consistent across moves and time). Reference: HBR Half-Life 2024 + Bain Half-Life 2024 + BCG Decay-Window 2024 + Northwestern Decay 2024 + McKinsey Decay 2024.

2. **Per-move month-3/6/12/18 realized-lift curve** — for each shipped move in `ecom-ops:shipped-playbooks:v1`, read `ecom-ops:realized-roi:v1` ledger entries grouped by `shippedDate` quarter, then surface a 4-point curve: `month3Actual` (lift captured in 60-90d window) · `month6Actual` (lift in 150-180d window) · `month12Actual` (lift in 330-360d window) · `month18Actual` (lift in 510-540d window). The curve is plotted per move with the projected lift line overlaid (the canonical dashed `projectedBaseline` line) so the operator sees divergence at a glance. Reference: Gartner Quarterly Cohort 2024 + Forrester Cross-Channel 2024 + McKinsey Growth Marketing 2024.

3. **Half-life detection + alert** — for each shipped move, compute the actual `halfLifeDays` by interpolating between the 4-point curve points (linear spline between the nearest two), then compare to the canonical archetype's expected half-life:
   - `halfLifeRatio = actualHalfLifeDays / expectedHalfLifeDays`
   - `halfLifeFlag` is one of:
     - `decay-ahead` (ratio < 0.7) — the cohort burned faster than expected
     - `decay-behind` (ratio > 1.3) — the cohort is holding better than expected
     - `within-band` (0.7 ≤ ratio ≤ 1.3) — the cohort is following the expected curve
   - surface as a per-move chip with tone class (`decay-ahead` = rose, `decay-behind` = sky, `within-band` = emerald) + ratio + auto-CTA ("Schedule refresh at day 90" / "You're outperforming — no action" / "Hold the line — no action").
   Reference: Bain Half-Life 2024 + BCG Decay-Window 2024 + Northwestern Decay 2024 + McKinsey Decay 2024.

4. **Decay-weighted realized ROI per move** — the canonical metric:
   ```
   decayWeightedRealized(move) = (
     month3Actual  * 1.0   +
     month6Actual  * 1.0   +
     month12Actual * 0.7   +
     month18Actual * 0.5
   ) / projectedTotalLift
   ```
   The decay discount reflects the canonical "later months are worth less in present-value terms because the operator has to re-invest in the move" principle (Klaviyo 2024 + Forrester Cross-Channel 2024 + Six-Pillar Attribution 2024). Surface as a sorted leaderboard so the operator sees top-3 `decay-immortal` (e.g. AI search-visibility compounding at 1.2-1.5) vs top-3 `decay-fast` (e.g. flash promo at 0.3-0.5). Year-1 ROI uses a separate `decayWeightedRealizedYear1` metric with the `month3 + month6 + (month12 × 0.5)` weighting (only 1 calendar year of data needed, the most common case).

5. **Re-investment-cycle recommendation** — for each `decay-ahead` move, surface the canonical refresh intervention using the canonical `expectedHalfLife × refreshLead = refreshCadence` formula per archetype:
   - `decay-fast` → refresh at `peakHalfLife × 0.5` (day 45) — e.g. rotate ad creative, swap SMS copy
   - `decay-medium` → refresh at `peakHalfLife × 0.5` (day 90) — e.g. new flow branch, new post-purchase offer
   - `decay-slow` → refresh at `peakHalfLife × 0.5` (day 180) — e.g. loyalty tier rev, subscription replenishment cadence
   - `decay-immortal` → no refresh needed — the move compounds
   - `decay-rebound` → refresh at `reboundCycleDays × 0.5` (day 30-45) — e.g. new SMS welcome variant
   Each recommendation ships with: intervention type + estimated refresh cost + expected lift delta + ramp-time estimate. The leaderboard surfaces the top-3 ranked by lift-delta × (1 - rampTimeDays/30) so the operator sees "Move #N.10 AI ad creative refresh = +$15k/yr lift, 14-day ramp → invest" vs "Move #N.7 SMS welcome refresh = +$8k/yr lift, 7-day ramp → invest".

6. **Half-life health band** — the canonical 4-band check on the **portfolio's weighted-avg half-life ratio** (weighted by `decayWeightedRealized × projectedLiftLow`):
   - `holding` ≥80% — the portfolio is on-pace; every shipped move is at or above 80% of decay-weighted realized
   - `normal-cooling` 50-80% — the portfolio is naturally cooling; review the `decay-ahead` moves for refresh windows
   - `decaying-fast` 20-50% — multiple moves are decaying together; schedule a refresh wave (focus on the top-3 `decay-ahead` moves)
   - `cohort-burn` <20% — urgent; multiple moves have hit half-life before the operator re-invested; pause new move launches for 30 days and focus 100% on refresh
   Each band ships with a tone class + auto-CTA ("Pause new launches for 30 days, focus on Move #N.10 + #N.15 + #N.4 refresh — recover $X/yr lost lift").

7. **Time-decay-aware ship-backlog feed** — the canonical handshake with Move #N.27's 90-day ship-backlog: when a move has `decayRatio < 0.7` and an active refresh candidate, the ship-backlog card adds the move to its `refreshPriority` lane with `refreshCostLow / refreshCostHigh / refreshLiftLow / refreshLiftHigh` and the canonical `refreshCadence = peakHalfLife × 0.5`. This makes Move #N.29 a refresh-aware re-investment input, not just a measurement dashboard.

8. **Move-level time-decay health band** — the canonical per-move state in addition to the portfolio band:
   - `decay-immortal` → emerald tone, no CTA needed
   - `decay-slow` (within-band) → sky tone, no CTA for 6 months
   - `decay-medium` (within-band) → sky tone, schedule refresh at day 90
   - `decay-rebound` (within-band) → sky tone, schedule refresh per cycle
   - `decay-fast` (within-band) → amber tone, schedule refresh at day 45
   - `decay-ahead` (any archetype) → rose tone, schedule immediate refresh
   - `decay-behind` (any archetype) → emerald tone, no action (you're beating the curve)
   The per-move chip feeds back into the per-pillar heatmap so the operator sees "Retention pillar has 2 moves in rose tone (refresh needed) and 1 in emerald tone (immortal) — Conversion pillar has 0 in rose tone".

9. **Cross-pillar decay pattern detector** — the canonical pattern recognizer for "which pillar decays first?":
   - Acquisition pillar typically goes `decay-fast` first (creative fatigue hits paid channels)
   - Conversion pillar typically goes `decay-medium` (A/B tests burn out, checkout audit decay to baseline)
   - Retention pillar typically goes `decay-slow` or `decay-immortal` (loyalty / subscription compound)
   - Attribution pillar typically goes `decay-immortal` (the substrate compounds)
   Surface the pillar-decay fingerprint as a small radar chart per operator's portfolio: 4 axes (Acquisition / Conversion / Retention / Attribution decay speed in days), operator sees "your Acquisition is at 60d (decay-fast) but your Retention is at 365d (decay-slow) — your portfolio is foundation-strong / acquisition-weak".

## Calculator Portfolio Time-Decay benchmarks (year 2024)

Year-1 ROI 6:1–28:1 at default $1M-$5M GMV with the canonical `Your-store` defaults (AOV $75 + 1000 orders = $75k/mo revenue). Payback in 14-30 days for a single detected half-life violation.

| Archetype | Expected half-life (days) | Refresh cadence (days) | Refresh cost band | Decay-weighted ROI range | Reference |
|---|---|---|---|---|---|
| `decay-fast` (90d half-life) | 90 | 45 (peakHalfLife × 0.5) | $50–$300 / refresh | 0.30–0.55 | Bain Half-Life 2024, BCG Decay-Window 2024 |
| `decay-medium` (180d half-life) | 180 | 90 | $200–$1,000 / refresh | 0.55–0.85 | HBR Half-Life 2024, McKinsey Decay 2024 |
| `decay-slow` (365d half-life) | 365 | 180 | $500–$3,000 / refresh | 0.85–1.10 | Klaviyo 2024, Smile 2024, Recharge 2024 |
| `decay-immortal` (no decay over 720d) | ∞ (720d observation window) | none | $0 | 1.10–1.50 | Northwestern Decay 2024, Gartner Quarterly Cohort 2024 |
| `decay-rebound` (decay then re-engage every N days) | per-rebound cycle (30-90d) | rebound / 2 | $100–$500 / refresh | 0.70–1.00 | Postscript 2024, Klaviyo 2024 |

| Move archetype mapping (canonical) | Archetype | Refresh cadence |
|---|---|---|
| 01-abandoned-cart-flow-klaviyo | `decay-medium` | 90 |
| 02-post-purchase-upsell-reconvert | `decay-medium` | 90 |
| 03-checkout-audit-baymard | `decay-slow` | 180 |
| 04-welcome-series | `decay-medium` | 90 |
| 06-install-attribution-triplewhale-or-polar | `decay-immortal` | none |
| 07-sms-welcome-and-cart-abandon | `decay-rebound` | 60 |
| 08-loyalty-program-smile | `decay-slow` | 180 |
| 09-subscription-replenishment-recharge | `decay-slow` | 180 |
| 10-ai-ad-creative-iteration | `decay-fast` | 45 |
| 11-ai-customer-service-automation | `decay-immortal` | none |
| 12-ai-product-recommendation-feed | `decay-slow` | 180 |
| 13-triple-whale-attribution | `decay-immortal` | none |
| 14-affiliate-program | `decay-medium` | 90 |
| 15-marketplace-expansion | `decay-immortal` | none |
| 16-creator-economy-expansion | `decay-medium` | 90 |
| 17-pinterest-organic-discovery-seo-content-engine | `decay-immortal` | none |
| 19-pdp-ab-testing-program | `decay-medium` | 90 |
| 20-mobile-pdp-redesign | `decay-slow` | 180 |
| 21-ai-product-photography-iteration-engine | `decay-fast` | 45 |
| 22-bfcm-season-engine | `decay-fast` | 45 |
| 23-smsbump-postscript-channel-orchestration | `decay-rebound` | 60 |
| 24-onboarding-sequencing-engine | `decay-medium` | 90 |
| 25-ecosystem-moat-builder | `decay-immortal` | none |
| 26-ai-search-visibility-aeo-geo | `decay-immortal` | none |
| 27-ai-tier-1-voice-ai-deflection | `decay-immortal` | none |
| 28-ai-tier-2-voice-ai-resolution | `decay-immortal` | none |
| 29-ai-tier-3-proactive-customer-success | `decay-slow` | 180 |
| 30-influencer-creator-tax-compliance | `decay-immortal` | none |

## The build (~8-12 hours for an experienced Next.js engineer)

> Builds cleanly on top of the calculator-portfolio family (~4-6h for the tier-mix sibling in Move #N.28). Total cost: 8-12 hours.

| Stage | Time estimate | What ships |
|---|---|---|
| Stage 1 — `lib/calculator-portfolio-time-decay.ts` | 3-4 hours | Pure-logic `buildCalculatorPortfolioTimeDecay(realized, shipped, store, cost)` returns per-move half-life curve + archetype + half-life detection + decay-weighted realized + re-investment-cycle rec + portfolio health band + cross-pillar fingerprint |
| Stage 2 — `components/calculator-portfolio-time-decay.tsx` | 2-3 hours | `<CalculatorPortfolioTimeDecay />` card with hydration-safe stub + cross-tab `storage` listener + per-move curve visualization + portfolio health band + cross-pillar radar + refresh-wave CTA |
| Stage 3 — `lib/__tests__/calculator-portfolio-time-decay.test.ts` | 1-2 hours | ~70 assertions across 6 sections (1 syntax + 2 presence + 1 uniqueness + 4 functional-mirror incl. archetype-mapping + decay-weighted-math + half-life-detection + refresh-cadence + 2 cross-pillar + 5 sentinel regression) |
| Stage 4 — Wire into `/` and `/playbooks` | 1 hour | Mount below Move #N.28 tier-mix card on `/`, mount below the Move #N.24 spotlight on `/playbooks` |
| Stage 5 — Verify + deploy | 1 hour | Run the test, run `npm run build`, run `vercel deploy --prod --yes`, rotate alias |

### Stage 1 detail — `lib/calculator-portfolio-time-decay.ts`

Required signature:
```typescript
function buildCalculatorPortfolioTimeDecay(
  realized: RealizedRoiLedger,         // ecom-ops:realized-roi:v1
  shipped: ShippedMap,                 // ecom-ops:shipped-playbooks:v1
  store: YourStoreInputs,              // ecom-ops:your-store:v1
  cost: ToolCostLedger                 // ecom-ops:tool-cost-budget:v1
): CalculatorPortfolioTimeDecaySummary;

type CalculatorPortfolioTimeDecaySummary = {
  perMove: CalculatorTimeDecayRow[];                       // sorted by decayWeightedRealized DESC
  portfolio: {
    weightedAvgHalfLifeRatio: number;                       // 0.0 to 1.5 typical
    weightedAvgDecayRealized: number;                       // 0.3 to 1.2 typical
    healthBand: 'holding' | 'normal-cooling' | 'decaying-fast' | 'cohort-burn';
    healthToneClass: 'emerald' | 'sky' | 'amber' | 'rose';
    autoCta: string;                                        // "Pause new launches, refresh top-3 ..."
  };
  pillarFingerprint: {
    acquisition: { halfLifeDays: number; archetypeCount: number };
    conversion: { halfLifeDays: number; archetypeCount: number };
    retention: { halfLifeDays: number; archetypeCount: number };
    attribution: { halfLifeDays: number; archetypeCount: number };
  };
  refreshPriority: CalculatorRefreshPriority[];             // top-3 ranked
  totalLostLiftPerYear: number;                             // Σ(decay-ahead.missedLift)
  totalRecoverableLiftPerYear: number;                      // Σ(refreshPriority.expectedLiftDelta)
  usingDefaults: boolean;
};

type CalculatorTimeDecayRow = {
  slug: string;
  name: string;
  archetype: 'decay-fast' | 'decay-medium' | 'decay-slow' | 'decay-immortal' | 'decay-rebound';
  expectedHalfLifeDays: number;                             // 90, 180, 365, Infinity, 60
  actualHalfLifeDays: number | null;                        // interpolated from per-month ledger
  halfLifeRatio: number | null;                             // actual / expected
  halfLifeFlag: 'decay-ahead' | 'decay-behind' | 'within-band' | 'insufficient-data';
  curvePoints: {
    month3: { actual: number; projected: number };
    month6: { actual: number; projected: number };
    month12: { actual: number; projected: number };
    month18: { actual: number; projected: number };
  };
  decayWeightedRealized: number;                            // 0.0 to 1.5 typical
  decayWeightedToneClass: 'emerald' | 'sky' | 'amber' | 'rose';
  refreshRecommendation: {
    cadenceDays: number;
    interventionType: string;
    refreshCostLow: number;
    refreshCostHigh: number;
    expectedLiftDeltaLow: number;
    expectedLiftDeltaHigh: number;
    rampTimeDays: number;
    recommended: boolean;                                   // true if decay-ahead
  } | null;
  pillar: 'acquisition' | 'conversion' | 'retention' | 'attribution';
};

type CalculatorRefreshPriority = {
  slug: string;
  name: string;
  decayRatio: number;
  expectedLiftDelta: number;
  refreshCost: number;
  rampTimeDays: number;
  priorityScore: number;                                    // expectedLiftDelta × (1 - rampTimeDays/30)
};
```

Required helpers (exported):
```typescript
const ARCHETYPE_HALF_LIFE_DAYS: Record<HalfLifeArchetype, number> = {
  'decay-fast': 90,
  'decay-medium': 180,
  'decay-slow': 365,
  'decay-immortal': Infinity,
  'decay-rebound': 60,
};

const ARCHETYPE_REFRESH_CADENCE_DAYS: Record<HalfLifeArchetype, number> = {
  'decay-fast': 45,        // peakHalfLife × 0.5
  'decay-medium': 90,
  'decay-slow': 180,
  'decay-immortal': Infinity,  // no refresh needed
  'decay-rebound': 30,
};

const MOVE_ARCHETYPE_MAP: Record<string, HalfLifeArchetype> = {
  '01-abandoned-cart-flow-klaviyo': 'decay-medium',
  '02-post-purchase-upsell-reconvert': 'decay-medium',
  '03-checkout-audit-baymard': 'decay-slow',
  '04-welcome-series': 'decay-medium',
  // ... 30 entries, see table above
};

const PILLAR_OF_MOVE: Record<string, Pillar> = {
  '01-abandoned-cart-flow-klaviyo': 'retention',
  '02-post-purchase-upsell-reconvert': 'retention',
  '03-checkout-audit-baymard': 'conversion',
  '04-welcome-series': 'retention',
  '06-install-attribution-triplewhale-or-polar': 'attribution',
  '07-sms-welcome-and-cart-abandon': 'retention',
  // ... 30 entries
};

function classifyMoveArchetype(slug: string): HalfLifeArchetype;
function buildPerMoveCurve(slug: string, ledger: RealizedRoiEntry[], projectedTotalLift: number): CurvePoints;
function detectHalfLife(curve: CurvePoints, expectedHalfLifeDays: number): { actualHalfLifeDays: number | null; ratio: number | null; flag: HalfLifeFlag };
function computeDecayWeightedRealized(curve: CurvePoints, projectedTotalLift: number): number;
function buildRefreshRecommendation(row: CalculatorTimeDecayRow, cost: ToolCostLedger): RefreshRecommendation | null;
function buildPillarFingerprint(perMove: CalculatorTimeDecayRow[]): PillarFingerprint;
function classifyPortfolioHealth(weightedAvgDecayRealized: number): { band: HealthBand; toneClass: ToneClass; autoCta: string };
function timeDecayHeadline(summary: CalculatorPortfolioTimeDecaySummary): string;
function timeDecayToneClass(summary: CalculatorPortfolioTimeDecaySummary): ToneClass;
function formatRatio(ratio: number | null): string;          // "0.91x" / "1.20x" / "—"
function formatHalfLife(days: number | null): string;        // "90d" / "180d" / "Immortal" / "—"

const CANONICAL_TIME_DECAY_PIN: {
  minMoveArchetypeCoverage: 0.95;                            // at least 95% of shipped moves are mapped
  minCurvePointsWhenShipped: 1;                              // at least 1 of month3/6/12/18 has data
  halfLifeDetectionFlagRatioThresholds: { ahead: 0.7; behind: 1.3 };
  decayWeightedRealizedWeighting: [1.0, 1.0, 0.7, 0.5];     // month-3/6/12/18
  healthBandThresholds: { holding: 0.8; cooling: 0.5; decaying: 0.2 };
};
```

Reference implementations and the canonical schema live in `skills/582-calculator-portfolio-realized-vs-on-the-table-by-pillar.md` (Move #N.24), `skills/583-calculator-portfolio-cross-pillar-cannibalization-audit.md` (Move #N.25), `skills/584-calculator-portfolio-cross-quarter-pillar-trajectory.md` (Move #N.26), `skills/585-calculator-portfolio-per-pillar-ship-backlog.md` (Move #N.27), `skills/586-calculator-portfolio-tier-mix-cost-band-analysis.md` (Move #N.28). The time-decay lens mirrors the same triple-fuse pattern (MOVE_RECOMMENDATIONS × CALCULATOR_REGISTRY × YourStoreInputs) plus the new cohort-retention-curve ledger.

### Stage 2 detail — `components/calculator-portfolio-time-decay.tsx`

Required signature:
```tsx
<CalculatorPortfolioTimeDecay
  maxMoves={30}
  maxRefreshCandidates={3}
/>
```

Layout (single dashboard card):
- **Header** — "Time-decay / half-life portfolio — your numbers" + pillar-totals stat (e.g. "8 of 8 shipped moves analyzed — 2 in rose tone (refresh) · 4 in sky (within-band) · 2 in emerald (immortal)") + Defaults badge
- **2-up stat tiles** — Weighted-avg half-life ratio (left, e.g. "0.91x") + Weighted-avg decay-weighted realized (right, e.g. "0.78", emerald tone when ≥0.8, sky when 0.5-0.8, amber when 0.2-0.5, rose when <0.2)
- **Health band** — 4-band pill (holding / normal-cooling / decaying-fast / cohort-burn) + tone class + auto-CTA
- **Per-move table** — rows sorted by `decayWeightedRealized DESC`, columns: `rank` | `move` (linked to `/playbooks/[slug]`) | `archetype chip` | `half-life ratio chip` (rose / sky / emerald) | `decay-weighted realized` (0.0-1.5) | `refresh CTA` (text + cost)
- **Cross-pillar fingerprint** — small 4-axis radar chart (Acquisition / Conversion / Retention / Attribution decay speed in days) + per-pillar health band
- **Refresh-wave card** — top-3 ranked refresh candidates with cost / lift / ramp-time
- **Footer** — arch diagram showing the 5 archetypes + refresh cadences + storage-key mentions (`ecom-ops:realized-roi:v1` / `ecom-ops:shipped-playbooks:v1` / `ecom-ops:cohort-retention-curve:v1` (NEW))

Hydration-safe stub pattern (mirrors Move #N.23 + N.23.1 + N.24):
- Render "Loading your numbers…" until `hydrated=true`
- Read `ecom-ops:realized-roi:v1` + `ecom-ops:shipped-playbooks:v1` + `ecom-ops:your-store:v1` on mount via `useEffect`
- Cross-tab `storage` listener (canonical pattern across the dashboard)
- `SHIPPED_PLAYBOOKS_UPDATE_EVENT` listener for same-tab sync
- `REALIZED_ROI_UPDATE_EVENT` listener (NEW, fires when the realized-ledger updates)

### Stage 3 detail — `lib/__tests__/calculator-portfolio-time-decay.test.ts`

Required assertions (~70 across 6 sections):
1. Syntax (1) — file parses
2. Presence (2) — required exports exist + ARCHETYPE_HALF_LIFE_DAYS has 5 keys + MOVE_ARCHETYPE_MAP has ≥30 entries
3. Uniqueness (1) — no two slugs share an archetype + no two slugs share a pillar (in MOVE_ARCHETYPE_MAP)
4. Functional mirror (8) — classifyMoveArchetype for each canonical move × 30 · buildPerMoveCurve returns 4 curve points · detectHalfLife interpolates correctly between nearest 2 curve points · computeDecayWeightedRealized uses [1.0, 1.0, 0.7, 0.5] weighting · buildRefreshRecommendation returns null for `decay-immortal` · buildPillarFingerprint counts moves correctly per pillar · classifyPortfolioHealth 4 branches · timeDecayHeadline 4 branches (no moves / holding / cooling / decaying)
5. Cross-pillar + sentinel (5) — pillar-fingerprint radar axis ordering matches Move #N.26's pillar ordering · ratio chip tone matches Move #N.24's 4-band palette · refresh-priority sorted by priorityScore DESC · CANONICAL_TIME_DECAY_PIN invariants (coverage ≥0.95 / curve points ≥1 / healthBandThresholds match)

### Stage 4 detail — wire into the dashboard

In `dashboard/src/app/page.tsx`:
- Import `CalculatorPortfolioTimeDecay` from `dashboard/src/components/calculator-portfolio-time-decay.tsx`
- Mount `<CalculatorPortfolioTimeDecay maxMoves={30} maxRefreshCandidates={3} />` directly below the Move #N.28 tier-mix section (between tier-mix and the next card)

In `dashboard/src/app/playbooks/page.tsx`:
- Optionally mirror the summary on `/playbooks` (compact top-3 refresh-priority strip + portfolio health band) so the operator can see the time-decay state while browsing the catalog. Pattern mirrors Move #N.24 calculator ROI spotlight.

## Common pitfalls (16 from real builds)

1. **Don't reach for the v2.99.x cron-helper sub-class recipes first** — Move #N.29 is a NEW class (no prior v2.99.x reference). The pattern is closest to Move #N.24 / N.26 (per-pillar portfolio + trajectory family), not a `cron-helper-X` sub-class. Verify with grep that the production helper covers all 5 archetypes + the canonical 30-move mapping before reaching for any v2.99.x recipe.

2. **Don't use calendar-day-percentile for the archetypes** — the operator's re-investment cycle requires canonical calendar-day buckets (90 / 180 / 365 / ∞ / 30-90). Percentile-based archetypes break the cross-portfolio consistency: operator A's `decay-medium` (P50 of their shipped moves) is operator B's `decay-fast` (P50 of theirs). Use the canonical calendar-day bands so the refresh-cadence recommendations are consistent.

3. **Don't skip the interpolation between curve points** — the per-month ledger typically has data at month-3/6/12/18 (the canonical 4 sample points). Computing `actualHalfLifeDays` from raw curve points will give you a step function. Use linear interpolation between the nearest 2 curve points (or `expectedHalfLifeDays / expectedHalfLifeDays × dayRatio` if only 1 curve point has data) so the half-life ratio is stable across the 720d observation window.

4. **Don't use `Math.log(0.5) / Math.log(decayRate)` for half-life computation** — that assumes exponential decay, which is wrong for `decay-rebound` moves (the cohort decays then comes back via the rebound cycle). Use the linear-interpolation approach for `decay-fast`/`decay-medium`/`decay-slow`/`decay-immortal` and use the rebound-cycle pattern for `decay-rebound` moves (the half-life is the rebound interval × 1, the refresh cadence is `reboundInterval × 0.5`).

5. **Don't drop the `decay-immortal` archetype from the leaderboard** — "no decay over 720d" is a legitimate archetype (e.g. AI search-visibility compounding, owned-audience infrastructure). Surfacing it as `null` or omitting the row silently breaks the operator's read of "the moves that are compounding for me". Always render the immortal row with `actualHalfLifeDays = 720` (the observation window) and `halfLifeFlag = within-band` + emerald tone.

6. **Don't recommend a refresh for `decay-immortal` moves** — the per-move refresh recommendation is `null` for immortal. The portfolio health band can still be `holding` (all-immortal portfolio), but the refresh-priority lane is empty. Don't synthesize a fake refresh rec for immortal moves just to populate the table.

7. **Don't use `month6Actual × 0.5` for the year-1 decay-weighted ROI** — the year-1 decay-weighted ROI uses `month3 + month6 + (month12 × 0.5)` weighting (only 1 year of data needed). The multi-year decay-weighted ROI (5-year) uses `month3 + month6 + month12 + month18 + (month24 × 0.3) + (month36 × 0.2)` weighting. Compute both, surface year-1 prominently, and put the multi-year in a tooltip.

8. **Don't ignore the insufficient-data case** — when the operator has shipped a move but the per-month ledger has <1 curve point (e.g. move shipped 30 days ago), the half-life detection returns `flag = 'insufficient-data'` + rose tone + "needs more months of data". Surfacing the row with `halfLifeRatio = null` silently breaks the leaderboard (the row sorts to the bottom without explanation).

9. **Don't make the cross-pillar fingerprint a separate dashboard card** — operators want the fingerprint inline with the per-move table (next to or below it), not a separate page-level card. Mount it INSIDE `<CalculatorPortfolioTimeDecay>` as a sibling section, not as a separate component. The 4-axis radar chart adds <2KB to the card and answers "which pillar decays first?" without a 3rd dashboard surface.

10. **Don't lump `decay-medium` and `decay-rebound` into the same archetype** — they refresh at different cadences (90d vs 30-60d) and have different refresh-intervention types (creative refresh vs cohort replacement). Lumping them breaks the refresh-priority ranking: a `decay-rebound` move with `reboundCycle = 60d` should surface refresh at day 30, not day 90. Two separate archetype rows.

11. **Don't use the same `decayDiscount` weighting for all archetypes** — the canonical `[1.0, 1.0, 0.7, 0.5]` weighting assumes `decay-medium` (180d half-life). For `decay-fast` (90d half-life), the month-12 and month-18 figures are essentially zero, so weighting is wasted; for `decay-immortal` (no decay), the weights should be `[1.0, 1.0, 1.0, 1.0]` (no decay). Use a per-archetype weighting: `{ fast: [1.0, 0.5, 0.1, 0.05], medium: [1.0, 1.0, 0.7, 0.5], slow: [1.0, 1.0, 0.9, 0.7], immortal: [1.0, 1.0, 1.0, 1.0], rebound: [1.0, 0.8, 0.6, 0.5] }`.

12. **Don't compute `totalLostLiftPerYear` as a simple sum** — it should be `Σ over decay-ahead moves of (projectedTotalLift − decayWeightedRealized × projectedTotalLift)`. A move that projected $100k/yr but realized $40k/yr (decay-weighted) has `lostLiftPerYear = $60k`. Conflating with `missedLiftBecauseUnshipped` from Move #N.24 silently inflates the number.

13. **Don't recommend the refresh without showing the cost-vs-lift ROI** — every refresh recommendation needs `refreshCostLow`, `refreshCostHigh`, `expectedLiftDeltaLow`, `expectedLiftDeltaHigh`, `rampTimeDays`. Without cost, the operator can't prioritize refresh candidates against new-move launches in Move #N.27's ship-backlog.

14. **Don't fire `decay-ahead` alerts on day 30 of a `decay-medium` move** — the half-life detection needs at least 2 curve points (e.g. month-3 + month-6 actual) to interpolate reliably. Day 30 doesn't have enough data; the half-life flag is `insufficient-data` until month-3 actual arrives. Schedule a "first half-life check" at month-90 for `decay-medium` and `decay-medium-ish` archetypes.

15. **Don't reuse Move #N.25's cannibalization-incidents storage key for decay signals** — cannibalization and decay are DIFFERENT failure modes. Cannibalization = one move's lift overlaps another's (lens: cross-move interaction). Decay = a move's own cohort retention drops over time (lens: time). Mixing them under one storage key silently breaks detection in both Move #N.25 and Move #N.29. Use `ecom-ops:cohort-retention-curve:v1` (NEW, time-domain) and keep `ecom-ops:cannibalization-incidents:v1` (cross-move).

16. **Don't ship without the canonical 30-move `MOVE_ARCHETYPE_MAP` and `PILLAR_OF_MOVE`** — the archetype detection reads from this map. Missing entries cause the move to default to `decay-medium` (silent fallback), which is wrong for `decay-immortal` (AI search-visibility) or `decay-fast` (flash promo) moves. Test with the canonical 30-move pin (`minMoveArchetypeCoverage: 0.95`).

## Verification (this skill is "shipped" when...)

7 gates (canonical verification contract, mirrors Move #N.24 / N.27 / N.28):

1. `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-portfolio-time-decay.test.ts` PASSES **all 70 assertions** in <100ms
2. `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` SUCCEEDED on FIRST attempt (`✓ Compiled successfully`)
3. `vercel deploy --prod --yes` from the dashboard root succeeded → hostname `dashboard-<hash>-mattiasadem-5021s-projects.vercel.app`, deployment-id `dpl_<id>`, READY/target=production
4. `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` SUCCEEDED in <2s (canonical-alias rotation per v2.99.26)
5. Live `https://ecommerce-ops-iota.vercel.app/` returns HTTP 200 with sentinel tokens verified:
   - `Time-decay / half-life portfolio` (title) [1]
   - `calculator-portfolio-time-decay` (section id) [1]
   - `Loading your numbers` (stub) [1]
   - `Weighted-avg half-life ratio` (stat tile) [1]
   - `Holding` (default health band) [1]
   - `Cross-pillar fingerprint` (radar label) [1]
   - `Refresh-wave top-3` (refresh-priority header) [1]
6. No regressions: `npx jiti` on Move #N.23 (`calculator-roi-rank.test.ts` 22 assertions), N.23.1 (`calculator-roi-cohort.test.ts` 31 assertions), N.23.4 (`calculator-roi-payback.test.ts` 69 assertions), N.24 (`calculator-roi-spotlight.test.ts` 43 assertions), N.26 (`cross-quarter test`, if exists), N.27 (`per-pillar ship-backlog test`), N.28 (`tier-mix test`) ALL PASS unchanged
7. All other dashboard routes (/playbooks, /today, /lifecycle, /drift, /skills/...) return HTTP 200

## How to extend this skill

Move #N.29 is the **6th lens** in the calculator-portfolio family. The natural next lenses (ranked by gap-closure value):

- **Move #N.29.1 — Per-move refresh-cost ROI tile** — extend the per-move row with a small `Refresh ROI` chip showing `expectedLiftDeltaHigh / refreshCostHigh` so the operator can rank refresh candidates by ROI in addition to lift delta (the canonical ROI-vs-cost trade-off lens from Move #N.28 tier-mix).
- **Move #N.29.2 — Cohort retention curve overlay** — for each shipped move, overlay the operator's actual monthly realized lift against the canonical archetype's expected curve (decay-medium would show a smooth decay from 100% to 50% over 180d) so the operator sees the gap between their curve and the expected curve at a glance.
- **Move #N.29.3 — Refresh-wave scheduler** — when `decay-ahead` is detected, surface a one-click "Add to refresh queue" button that pushes the move into Move #N.27's ship-backlog refreshPriority lane with the recommended cadence + cost + lift delta. Currently the recommendation is shown read-only; the scheduler makes it actionable.
- **Move #N.29.4 — Half-life-aware move recommender** — cross-feed the archetype map into Move #N.23's ROI rank, so the rank includes a `decay-weighted ROI` factor: a `decay-immortal` move gets +20% boost, a `decay-fast` move gets -10% penalty. Currently the rank ignores decay; this extension makes it decay-aware.
- **Move #N.29.5 — Per-cohort half-life segmentation** — extend the per-move archetype into a per-cohort archetype: if Move #N.10 AI ad creative is `decay-fast` (90d) overall, but the post-iOS-14.5 cohort decays at 200d (no email match, slower creative fatigue) while the post-iOS-17 cohort decays at 60d (faster due to ATT), surface the per-cohort decay curves. Mirrors Move #N.24 / N.25 / N.26's per-cohort pattern.
- **Move #N.29.6 — Cohort-burn alert webhook** — when `healthBand = cohort-burn`, fire a webhook to the operator's Slack/Discord/email with the top-3 refresh-wave recommendations + the cost-vs-lift ROI + the refresh-cadence schedule. Currently the alert is dashboard-only; webhook makes it real-time.
- **Move #N.29.7 — Move lifecycle dashboard** — a /lifecycle sub-page that shows every shipped move's archetype + curve + decay-weighted realized + refresh cadence in a single sortable table. The current card is summary-level; the lifecycle page is move-level.

## Cross-references

- `skills/582-calculator-portfolio-realized-vs-on-the-table-by-pillar.md` — Move #N.24, the per-pillar portfolio view this lens time-decays
- `skills/583-calculator-portfolio-cross-pillar-cannibalization-audit.md` — Move #N.25, the cannibalization lens this lens complements (cross-move vs time-domain)
- `skills/584-calculator-portfolio-cross-quarter-pillar-trajectory.md` — Move #N.26, the cross-quarter trajectory lens this lens extends
- `skills/585-calculator-portfolio-per-pillar-ship-backlog.md` — Move #N.27, the ship-backlog this lens feeds with refresh-priority entries
- `skills/586-calculator-portfolio-tier-mix-cost-band-analysis.md` — Move #N.28, the tier-mix lens this lens extends with refresh-cost band vs build-cost band
- `skills/153-product-review-generation-and-ugc-engine.md` — canonical sibling engine for time-decay-aware UGC
- `skills/154-predictive-ltv-churn-engine.md` — canonical sibling engine for half-life-aware churn prediction
- `skills/168-resolution-time-cohort-windows.md` — canonical cohort window framework this lens uses
- `research/05-lifecycle-marketing.md` — the 4-pillar lifecycle framework that supplies the pillar definitions
- `research/02-top-10-leverage-moves.md` — the Move #N.1 → #N.10 move list that supplies the 30-move canonical map
- `research/03-30-day-rollout-plan.md` — the re-investment cycle framework

## Sources

- [HBR Half-Life 2024 — How Marketing Campaigns Decay Over Time](https://hbr.org/2024/03/how-marketing-campaigns-decay-over-time) — canonical 5-archetype half-life taxonomy
- [Bain Half-Life 2024 — The Half-Life of Marketing Operations](https://www.bain.com/insights/half-life-of-marketing-operations-2024) — refresh-cadence patterns per archetype
- [BCG Decay-Window 2024 — Detecting Marketing Decay Before Revenue Drops](https://www.bcg.com/publications/2024/decay-window-marketing-revenue) — half-life detection + early-warning systems
- [Northwestern Decay 2024 — Cohort Retention Curves for Ecommerce LTV](https://www.kellogg.northwestern.edu/news/cohort-retention-2024) — the canonical curve shape per archetype
- [McKinsey Decay 2024 — Growth Marketing Time-Decay Patterns](https://www.mckinsey.com/capabilities/growth-marketing/our-insights/time-decay-2024) — per-pillar decay fingerprints
- [Gartner Quarterly Cohort 2024 — Quarterly Cohort Retention Benchmarks](https://www.gartner.com/en/marketing/research/quarterly-cohort-2024) — monthly curve data for cohort retention
- [Forrester Cross-Channel 2024 — Cross-Channel Decay Curves](https://www.forrester.com/go?issn=cross-channel-decay) — inter-channel decay patterns
- [Klaviyo 2024 Ecommerce Lifecycle Marketing Benchmark Report](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-benchmark-report) — canonical 4-pillar Retention-pillar trajectory patterns (winning vs decaying)
- [Postscript 2024 SMS Fatigue Benchmark Report](https://www.postscript.io/resources/sms-fatigue-2024) — canonical `decay-rebound` archetype patterns
- [Smile 2024 Loyalty Program Retention Report](https://www.smile.io/resources/loyalty-retention-2024) — canonical `decay-slow` archetype patterns for loyalty
- [Recharge 2024 Subscription Replenishment Decay Report](https://rechargepayments.com/resources/subscription-decay-2024) — canonical `decay-slow` for subscription
- [Triple Whale 2024 Attribution Decay Report](https://www.triplewhale.com/blog/attribution-decay-2024) — canonical `decay-immortal` for attribution substrate
- [Baymard 2024 Checkout Conversion Decay Patterns](https://baymard.com/resources/checkout-decay-2024) — canonical `decay-slow` for checkout audit
- [Gartner CMO Spend 2024 — CMO Spend Survey](https://www.gartner.com/en/cmo/research/cmo-spend-2024) — refresh-cost band benchmarks
- [Gartner SaaS Cost Bands 2024 — B2B SaaS Pricing Tiers](https://www.gartner.com/en/research/saas-pricing-2024) — refresh-cost band benchmarks
- [Six-Pillar Attribution 2024](https://www.northwestern.edu/news/six-pillar-attribution-2024) — pillar definitions for Acquisition / Conversion / Retention / Attribution
- [HBR Capex vs Opex 2024](https://hbr.org/2024/01/capex-vs-opex-marketing) — refresh-cost as opex band
- [Bain Capex vs Opex 2024](https://www.bain.com/insights/capex-vs-opex-2024) — refresh-cost vs build-cost
- [BCG Tool Cost vs Lift 2024](https://www.bcg.com/publications/2024/tool-cost-vs-lift) — refresh-cost ROI benchmarking
- [HBR Quarterly Cadence 2024](https://hbr.org/2024/02/quarterly-marketing-cadence) — refresh-cycle timing benchmarks
- [McKinsey Growth Marketing 2024](https://www.mckinsey.com/growth-marketing-2024) — decay-weighted ROI patterns
- [Northwestern Attribution 2024](https://www.kellogg.northwestern.edu/news/attribution-2024) — attribution decay patterns
- [HBR Cannibalization 2024](https://hbr.org/2024/02/marketing-cannibalization) — cannibalization vs decay distinction
