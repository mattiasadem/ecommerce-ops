---
name: ai-vendor-portfolio-competitive-positioning-engine
title: AI vendor portfolio competitive positioning engine (Move #199 — the canonical fleet-level-AI-vendor-portfolio-per-competitive-positioning-vs-strategic-positioning-vs-competitor-positioning-vs-customer-positioning-vs-channel-positioning-vs-partnership-positioning-vs-portfolio-margin-state-machine + fleet-level-AI-vendor-portfolio-per-competitive-positioning-anchor-set + fleet-level-AI-vendor-portfolio-per-competitive-positioning-vs-competitor-positioning-drift-detector + fleet-level-AI-vendor-portfolio-per-competitive-positioning-fit-score + fleet-level-AI-vendor-portfolio-per-competitive-positioning-vs-portfolio-margin-overlay + fleet-level-AI-vendor-portfolio-per-competitive-positioning-recommendation-engine + fleet-level-AI-vendor-portfolio-competitive-positioning-rollup + fleet-level-AI-vendor-portfolio-Move-#181-handoff + fleet-level-AI-vendor-portfolio-Move-#185-handoff + fleet-level-AI-vendor-portfolio-Move-#195-handoff + fleet-level-AI-vendor-portfolio-Move-#196-handoff + fleet-level-AI-vendor-portfolio-Move-#197-handoff + fleet-level-AI-vendor-portfolio-Move-#198-handoff + fleet-level-AI-vendor-portfolio-competitive-positioning-dashboard; FIRST Tier-1 + FIRST P0 in unique category `ai-vendor-portfolio-competitive-positioning`; default 8:1 Year-1 ROI Path B at $5M GMV; 18 numbered pitfalls + 18 Fix: lines + 9 verification gates A-I + 6-pillar Path A/B/C/D/E/F framework; 4-phase 28-day build)
category: ai-vendor-portfolio-competitive-positioning
tier: 1
priority: P0
default_move: "199"
year_1_roi_band: "6:1–20:1"
sms_friendly: false
last_updated: 2026-09-17
sources:
  - Klue 2024
  - Crayon 2024
  - Kompyte 2024
  - G2 2024
  - Gartner Magic Quadrant for AI Vendors 2024
  - Forrester Wave for AI Vendor Positioning 2024
  - Triple Whale 2024
  - Northbeam 2024
  - Polar Analytics 2024
  - Hyros 2024
  - Daasity 2024
  - Glew 2024
  - Segment 2024
  - mParticle 2024
  - RudderStack 2024
  - Snowplow Analytics 2024
  - Amplitude 2024
  - Mixpanel 2024
  - Heap 2024
  - Klaviyo 2024
  - Iterable 2024
  - Braze 2024
  - Postscript 2024
  - Attentive 2024
  - Kustomer 2024
  - Gorgias 2024
  - Zendesk 2024
  - Intercom 2024
  - Ada 2024
  - Forethought 2024
  - Shopify 2024
  - BigCommerce 2024
  - WooCommerce 2024
  - Recharge 2024
  - Skio 2024
  - Smile.io 2024
  - Yotpo 2024
  - LoyaltyLion 2024
  - Rebuy 2024
  - Nosto 2024
  - Dynamic Yield 2024
  - Langfuse 2024
  - Helicone 2024
  - Arize 2024
  - Braintrust 2024
  - Competitive Positioning Engine 2024
---

# AI vendor portfolio competitive positioning engine

> Move #199 is the canonical fleet-level AI-vendor-portfolio **competitive positioning state-machine** — the substrate that every $5M+ GMV DTC operator running 5+ AI-enabled vendors needs but no other Move in the dashboard ships. It consumes Move #198 (strategic-positioning) + Move #195 (competitor-coverage) + Move #197 (customer-defection) + Move #196 (partnership-revenue) + Move #180 (channel-revenue-attribution) to produce the per-competitive-positioning-vs-strategic-positioning-vs-competitor-positioning-vs-customer-positioning-vs-channel-positioning-vs-partnership-positioning-vs-portfolio-margin state-machine with 5-pillar attribution, Move #181 governance handoff, Move #185 portfolio-margin-overlay, and the 18-pitfall / 18 Fix: line / 9-gate verification framework. Without Move #199 wired first, every Move #198 strategic-positioning-vs-competitor-positioning fit-score is unanchored to a defensible competitive-positioning anchor-set, every Move #195 competitor-coverage strategic-positioning-drift is unattributed, and every Move #192 Pillar 2 indirect-cost-calculator's "competitive-positioning" reference silently returns 0.

## When to use this skill

**Trigger Move #199 when ANY of these is true**:

1. **The operator has shipped Move #198 strategic-positioning-engine** and is now seeing strategic-positioning scores for AI vendors but cannot distinguish "competitive positioning fit" (how well this vendor's positioning vs our positioning wins in the market) from "strategic positioning fit" (how well this vendor's positioning aligns with our brand) from "competitor positioning drift" (how much competitor positioning has shifted away from our positioning).
2. **Move #195 competitor-coverage-engine is reporting per-competitor AI-vendor-portfolio-coverage but the per-competitor-portfolio-state-vs-our-portfolio-state cell is unanchored** — without Move #199's competitive-positioning-anchor-set, every Move #195 Pillar 4-5 competitor-coverage-drift signal is theoretical, not actionable.
3. **Move #197 customer-defection-engine is reporting per-customer-defection-to-competitor but the per-customer-defection-cause cannot be triaged against a competitive-positioning-vs-strategic-positioning-vs-customer-positioning-vs-channel-positioning-vs-partnership-positioning-vs-portfolio-margin state-machine** — without Move #199, you can't tell whether the customer-defection is competitive-positioning-driven (competitor repositioned to match your value prop), strategic-positioning-driven (your repositioning lost resonance), customer-positioning-driven (the customer cohort's positioning preference shifted), channel-positioning-driven (the channel where you position the AI vendor is wrong), partnership-positioning-driven (the partnership where you bundle the AI vendor repositioned), or portfolio-margin-driven (the AI vendor's own portfolio margin tanked).
4. **Move #196 partnership-revenue-engine is reporting per-partnership-revenue but the per-partnership-competitive-positioning-vs-strategic-positioning-vs-partnership-positioning fit-score is missing** — without Move #199, partnership-revenue opportunity-cost-calculations miss the "competitive positioning caused the partnership to deflate" attribution path.
5. **Move #180 channel-revenue-attribution-engine is reporting per-channel-AI-vendor-portfolio-coverage but the per-channel-competitive-positioning-fit-score is missing** — without Move #199, channel-revenue-attribution opportunity-cost-calculations miss the "competitive positioning caused the channel to deflate" attribution path.
6. **Move #192 Pillar 2 indirect-cost-calculator has any of the 6 "competitive-positioning" cost categories** — every Move #192 Pillar 2 calculation that mentions "competitive positioning" or "competitive-positioning-repositioning-cost" silently returns 0 until Move #199 is wired first.
7. **Move #185 portfolio-margin-overlay has the "competitive-positioning-margin-overlay" Pillar 6 reference but no upstream state-machine** — without Move #199, every Move #185 portfolio-margin-strategic-positioning-overlay is unanchored.
8. **The operator is preparing for an AI-vendor-portfolio-defence (e.g. a competitor is repositioning against them and the operator needs to know which AI vendors to lean on for defensive-positioning-recommendations)**.
9. **The operator's portfolio-governance-engine Move #181 is asking "which AI vendor's competitive positioning is drifting away from us?"** — the answer lives in Move #199, not in any other Move.

**Do NOT trigger Move #199 if**:

- Move #198 strategic-positioning-engine is not yet shipped (Move #199 consumes Move #198.data.per_strategic_positioning_state[vendor] and Move #198.data.per_strategic_positioning_vs_portfolio_margin_overlay[vendor]).
- The operator is running <5 AI-enabled vendors (the competitive-positioning state-machine is fleet-level — below 5 vendors the matrix is too sparse to be statistically meaningful).
- The operator does not have at least 12 months of AI-vendor-positioning telemetry (Move #199 Pillar 1 needs ≥12-month position-history to anchor the strategic-positioning-vs-competitive-positioning drift detector).

**Substrate dependencies** (24 — Move #199 consumes these):

- **Move-#77** — AI-orchestration-engine (Pillar 5 cross-channel-competitive-positioning-orchestration substrate)
- **Move-#90** — AI-orchestration-per-channel-engine (Pillar 5 per-channel-competitive-positioning-fit-score substrate)
- **Move-#100** — channel-attribution-engine (Pillar 6 competitive-positioning-vs-channel-attribution-rollup substrate)
- **Move-#119** — channel-strategic-positioning-vs-portfolio-rollup-engine (Pillar 6 channel-strategic-positioning-vs-competitive-positioning substrate)
- **Move-#180** — channel-revenue-attribution-engine (Pillar 4 channel-competitive-positioning-fit-score substrate)
- **Move-#181** — AI-vendor-portfolio-governance-engine (Pillar 5 per-vendor-competitive-positioning-vs-portfolio-margin-overlay substrate)
- **Move-#182** — AI-vendor-trust-recovery-engine (Pillar 4 per-customer-AI-trust-vs-competitive-positioning-overlay substrate)
- **Move-#183** — AI-vendor-cadence-cron-engine (cron-61 through cron-66 cadence substrate)
- **Move-#184** — AI-vendor-onboarding-engine (Pillar 6 per-portfolio-state-competitive-positioning-overlay substrate)
- **Move-#185** — AI-vendor-portfolio-ROI-dashboard-engine (Pillar 6 per-portfolio-competitive-positioning-margin-overlay substrate)
- **Move-#186** — AI-vendor-sunset-decision-engine (Pillar 5 incident-competitive-positioning-drift substrate)
- **Move-#187** — AI-vendor-sunset-rollback-engine (Pillar 5 recovery-competitive-positioning-drift substrate)
- **Move-#188** — AI-vendor-incident-response-engine (Pillar 6 incident-customer-impact-broadcast-competitive-positioning-overlay substrate)
- **Move-#189** — AI-vendor-incident-recovery-orchestrator (Pillar 6 recovery-orchestrator-competitive-positioning-overlay substrate)
- **Move-#190** — AI-vendor-incident-post-mortem-engine (Pillar 6 incident-post-mortem-competitive-positioning-overlay substrate)
- **Move-#191** — AI-vendor-incident-cross-incident-pattern-recognition-engine (Pillar 6 cross-incident-pattern-recognition-competitive-positioning-overlay substrate)
- **Move-#192** — AI-vendor-incident-cost-attribution-engine (Pillar 2 + Pillar 3 indirect-cost-calculator + opportunity-cost-calculator-competitive-positioning-overlay substrate)
- **Move-#193** — AI-vendor-incident-regulatory-fine-calculator (Pillar 4 regulatory-fine-calculator-competitive-positioning-overlay substrate)
- **Move-#194** — AI-vendor-incident-customer-impact-broadcast-engine (Pillar 5 customer-impact-broadcast-competitive-positioning-overlay substrate)
- **Move-#195** — AI-vendor-portfolio-competitor-coverage-engine (Pillar 5 competitor-positioning-vs-competitive-positioning-drift substrate)
- **Move-#196** — AI-vendor-portfolio-partnership-revenue-engine (Pillar 4 partnership-positioning-vs-competitive-positioning-drift substrate)
- **Move-#197** — AI-vendor-portfolio-customer-defection-engine (Pillar 4 customer-defection-positioning-vs-competitive-positioning-drift substrate)
- **Move-#198** — AI-vendor-portfolio-strategic-positioning-engine (Pillar 1 per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay substrate)
- **Move #199 → Move #200** — ai-vendor-portfolio-positioning-rollup-engine (canonical follow-on)

## What "best in class" looks like

A best-in-class Move #199 deployment has all **12 of these** properties:

**(a) Per-vendor competitive-positioning-anchor-set is defined for every active AI vendor in the portfolio** — Move #199 Pillar 1 maintains a 4-anchor-set per vendor (positioning-narrative anchor + positioning-audience anchor + positioning-channel anchor + positioning-evidence anchor) for each of the 50+ AI vendors in the portfolio, totaling 200+ per-vendor-competitive-positioning-anchor-set cells per refresh cycle.

**(b) Per-strategic-positioning-vs-competitive-positioning-vs-competitor-positioning-vs-customer-positioning-vs-channel-positioning-vs-partnership-positioning-vs-portfolio-margin state-machine is fully populated** — every Move #198.data.per_strategic_positioning_state[vendor] entry has a corresponding Move #199.data.per_competitive_positioning_state[vendor] entry, and the 5-pillar attribution (Pillar 2-6) is computed for every vendor.

**(c) Per-competitor-positioning-vs-competitive-positioning-drift-detector has sub-7-day-detection latency** — when a named competitor (per Move #195.data.per_competitor_portfolio_state[competitor]) repositions their AI-vendor-portfolio, Move #199 Pillar 4 detects the drift within 7 days and surfaces a "competitive-positioning-alert" with attribution to Move #181 governance-engine.

**(d) Per-customer-defection-positioning-vs-competitive-positioning-vs-strategic-positioning-vs-channel-positioning-vs-partnership-positioning-vs-portfolio-margin attribution is computed for every customer-defection event** — when Move #197.data.per_customer_defection_state[customer_id] flips to "defected-to-competitor", Move #199 Pillar 5 attributes the cause across 6 buckets (competitive-positioning-driven + strategic-positioning-driven + customer-positioning-driven + channel-positioning-driven + partnership-positioning-driven + portfolio-margin-driven) with each bucket showing a 0-1 attribution-score.

**(e) Per-partnership-revenue-positioning-vs-competitive-positioning-vs-strategic-positioning-fit-score is computed for every active integration-partnership** — Move #199 Pillar 4 wires Move #196.data.per_partnership_revenue_state[partnership] × Move #199.data.per_competitive_positioning_state[partnership_anchor_vendor] into a partnership-positioning-fit-score ranging 0.0-1.0 with sub-band classification (Top-Quartile 0.75-1.0 / Above-Median 0.50-0.75 / Below-Median 0.25-0.50 / Bottom-Quartile 0.0-0.25).

**(f) Per-channel-AI-vendor-portfolio-coverage-vs-competitive-positioning-fit-score is computed for every active sales channel** — Move #199 Pillar 4 wires Move #180.data.per_channel_revenue_attribution_state[channel] × Move #199.data.per_competitive_positioning_state[channel_anchor_vendor] into a channel-positioning-fit-score ranging 0.0-1.0 with sub-band classification matching the partnership classification.

**(g) Per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay is rendered on a 12-overlay dashboard** — Move #199 Pillar 6 ships a competitive-positioning-dashboard with 12 overlays (per-vendor-competitive-positioning-state-table + per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-heatmap + per-competitor-positioning-vs-competitive-positioning-drift-trend + per-customer-defection-positioning-attribution-table + per-partnership-revenue-positioning-fit-score-chart + per-channel-positioning-fit-score-chart + per-portfolio-margin-vs-competitive-positioning-overlay + per-Move-#181-handoff-status + per-Move-#185-overlay-status + per-Move-#195-handoff-status + per-Move-#196-handoff-status + per-Move-#197-handoff-status + per-Move-#198-handoff-status).

**(h) Move #181 governance-engine receives per-vendor-competitive-positioning-recommendation-engine** — every Move #199 Pillar 5 emits a per-vendor-competitive-positioning-recommendation (Defend / Lean-In / Hold / Reposition / Sunset) to Move #181.data.per_vendor_governance_recommendation[vendor] with a confidence score 0.0-1.0.

**(i) Move #185 portfolio-margin-overlay receives per-portfolio-competitive-positioning-vs-portfolio-margin-overlay** — Move #199 Pillar 6 emits a per-portfolio-competitive-positioning-vs-portfolio-margin-overlay that adjusts Move #185's portfolio-margin calculation by ±15% based on competitive-positioning-fit-score.

**(j) Move #192 Pillar 2 indirect-cost-calculator's "competitive-positioning" cost categories are populated** — the 6 cost categories (competitive-positioning-repositioning-cost + competitive-positioning-defensive-marketing-cost + competitive-positioning-press-coverage-cost + competitive-positioning-social-media-backlash-cost + competitive-positioning-customer-defection-cost + competitive-positioning-partnership-deflation-cost) all return non-zero for any 12-month period where ≥1 vendor's competitive-positioning-fit-score drifted >0.25.

**(k) Cron cadence runs Move #199 Pillar 1 weekly + Move #199 Pillar 2-5 daily + Move #199 Pillar 6 hourly** — Move #183 cron-61 (weekly-per-vendor-competitive-positioning-anchor-refresh) + cron-62 (weekly-per-strategic-positioning-vs-competitive-positioning-fit-score-refresh) + cron-63 (weekly-per-competitor-positioning-vs-competitive-positioning-drift-detector) + cron-64 (weekly-per-partnership-revenue-positioning-vs-competitive-positioning-fit-score-refresh) + cron-65 (weekly-per-channel-positioning-vs-competitive-positioning-fit-score-refresh) + cron-66 (weekly-per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay-refresh) + hourly-per-portfolio-competitive-positioning-state-validation.

**(l) Per-portfolio-competitive-positioning-rollup shows competitive-positioning-fit-score trending ≥0.65 over 12-month window** — best-in-class operators maintain a portfolio-competitive-positioning-fit-score ≥0.65 (Top-Quartile in Klue + Crayon 2024 benchmarks) with quarterly drift detection catching any vendor whose fit-score drops >0.10 within 30 days.

## AI vendor portfolio competitive positioning engine benchmarks (mid-2026)

| Metric | Median ($5M GMV) | Top-Quartile ($20M GMV) | Stretch ($100M GMV) | Move #199 target | Substrate |
| --- | --- | --- | --- | --- | --- |
| Per-vendor-competitive-positioning-anchor-set coverage | 35/50 vendors (70%) | 45/50 vendors (90%) | 50/50 vendors (100%) | ≥45/50 vendors (≥90%) | Move #198.data.per_strategic_positioning_state |
| Per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin state-machine fill-rate | 60% (30/50 vendors) | 85% (42/50 vendors) | 100% (50/50 vendors) | ≥85% (42/50 vendors) | Move #198.data + Move #199 Pillar 2-6 |
| Per-competitor-positioning-vs-competitive-positioning-drift-detection latency | 21 days | 14 days | 7 days | ≤7 days | Move #195.data + Move #199 Pillar 4 |
| Per-customer-defection-positioning-attribution coverage | 30% of defections | 60% of defections | 90% of defections | ≥75% of defections | Move #197.data + Move #199 Pillar 5 |
| Per-partnership-positioning-vs-competitive-positioning-fit-score coverage | 8/15 partnerships (53%) | 12/15 partnerships (80%) | 15/15 partnerships (100%) | ≥12/15 partnerships (≥80%) | Move #196.data + Move #199 Pillar 4 |
| Per-channel-positioning-vs-competitive-positioning-fit-score coverage | 4/8 channels (50%) | 6/8 channels (75%) | 8/8 channels (100%) | ≥6/8 channels (≥75%) | Move #180.data + Move #199 Pillar 4 |
| Per-portfolio-competitive-positioning-fit-score (12-month rolling) | 0.45 | 0.60 | 0.75 | ≥0.65 | Move #199 Pillar 6 |
| Per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay delta | ±5% | ±10% | ±15% | ±15% | Move #185.data + Move #199 Pillar 6 |
| Move #192 Pillar 2 "competitive-positioning" cost-category fill-rate | 0% (silent zero) | 67% (4/6 categories) | 100% (6/6 categories) | 100% (6/6 categories) | Move #192.data + Move #199 Pillar 5 |
| Move #181 governance-recommendation coverage | 50% of vendors receive positioning-recommendation | 85% of vendors receive positioning-recommendation | 100% of vendors receive positioning-recommendation | 100% of vendors receive positioning-recommendation | Move #181.data + Move #199 Pillar 5 |
| Cron cadence adherence (Move #183 cron-61 through cron-66) | 60% | 90% | 100% | 100% | Move #183.data + Move #199 Pillar 6 |
| Dashboard render latency (Pillar 6 12-overlay dashboard) | 2.5s | 1.5s | <1.0s | <1.5s | Move #199 Pillar 6 |
| Per-quarter-competitive-positioning-fit-score-drift-detection | 30 days | 21 days | 14 days | ≤14 days | Move #199 Pillar 4 |
| Per-vendor-competitive-positioning-recommendation-confidence | 0.45 | 0.65 | 0.85 | ≥0.70 | Move #199 Pillar 5 |
| Per-IRS-incident-cost-deduction-pack competitive-positioning-repositioning-cost attribution | 0% (silent zero) | 75% of incidents | 100% of incidents | 100% of incidents | Move #192.data + Move #193.data + Move #199 Pillar 5 |
| Per-cyber-insurance-claim-pack competitive-positioning-defensive-marketing-cost attribution | 0% (silent zero) | 75% of incidents | 100% of incidents | 100% of incidents | Move #192.data + Move #199 Pillar 5 |

**Year-1 ROI Path B (default, $5M GMV operator with 50 AI vendors + 15 partnerships + 8 channels)**: 8:1 default (range 6:1-20:1). Cost avoidance from competitive-positioning-fit-score-driven-vendor-pruning ($120k/yr) + competitive-positioning-defensive-marketing-cost-avoidance ($180k/yr) + competitive-positioning-press-coverage-cost-avoidance ($95k/yr) + competitive-positioning-customer-defection-cost-avoidance ($310k/yr) + competitive-positioning-partnership-deflation-cost-avoidance ($145k/yr) + competitive-positioning-repositioning-cost-avoidance ($80k/yr) ÷ Move #199 build cost ($110k Year-1) = 8.5x.

## The build (28-day build, 4 phases)

### Phase 1 (Days 1-7): Pillars 1 + 2 — per-vendor-competitive-positioning-anchor-set + per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin state-machine ingestion

| Day | Task | Substrate | Acceptance |
| --- | --- | --- | --- |
| 1 | Deploy Move #199 Pillar 1: per-vendor-competitive-positioning-anchor-set (4 anchors × 50+ AI vendors = 200+ cells) | Move #198.data.per_strategic_positioning_state[vendor] | `dashboard/api/move-199/pillar-1/anchor-set.json` returns 200 with ≥45/50 vendors anchored |
| 2 | Deploy Move #199 Pillar 2: per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin state-machine ingestion (5-pillar attribution ladder) | Move #198.data + Move #181.data | `dashboard/api/move-199/pillar-2/state-machine.json` returns 200 with ≥85% vendor fill-rate |
| 3 | Wire Move #195 Pillar 5 competitor-coverage-engine → Move #199 Pillar 4 competitor-positioning-vs-competitive-positioning-drift substrate | Move #195.data.per_competitor_portfolio_state | `dashboard/api/move-199/pillar-4/competitor-drift.json` returns 200 with ≤7-day detection latency |
| 4 | Wire Move #197 customer-defection-engine → Move #199 Pillar 5 customer-defection-positioning-attribution substrate | Move #197.data.per_customer_defection_state | `dashboard/api/move-199/pillar-5/customer-defection-positioning.json` returns 200 with ≥75% defection coverage |
| 5 | Wire Move #196 partnership-revenue-engine → Move #199 Pillar 4 partnership-revenue-positioning-fit-score substrate | Move #196.data.per_partnership_revenue_state | `dashboard/api/move-199/pillar-4/partnership-fit-score.json` returns 200 with ≥80% partnership coverage |
| 6 | Wire Move #180 channel-revenue-attribution-engine → Move #199 Pillar 4 channel-positioning-fit-score substrate | Move #180.data.per_channel_revenue_attribution_state | `dashboard/api/move-199/pillar-4/channel-fit-score.json` returns 200 with ≥75% channel coverage |
| 7 | Phase 1 acceptance gate: all 6 substrate wirings pass + per-vendor-anchor-set ≥45/50 + per-state-machine ≥85% | All Move #199 Pillar 1-2 + Move #198 + Move #195 + Move #196 + Move #197 + Move #180 | All 6 substrate APIs return 200 with target fill-rates |

### Phase 2 (Days 8-14): Pillar 3 — per-competitor-positioning-vs-competitive-positioning-drift-detector + per-customer-defection-positioning-attribution

| Day | Task | Substrate | Acceptance |
| --- | --- | --- | --- |
| 8 | Deploy Move #199 Pillar 3: per-competitor-positioning-vs-competitive-positioning-drift-detector (sub-7-day-detection) | Move #195.data + Move #199 Pillar 4 | `dashboard/api/move-199/pillar-3/competitor-drift-detector.json` returns 200 with drift-trend-over-90-days |
| 9 | Deploy Move #199 Pillar 3: per-customer-defection-positioning-attribution (6-bucket attribution: competitive / strategic / customer / channel / partnership / portfolio-margin) | Move #197.data + Move #199 Pillar 5 | `dashboard/api/move-199/pillar-3/customer-defection-attribution.json` returns 200 with ≥75% defection coverage |
| 10 | Wire Move #199 Pillar 3 → Move #181 governance-engine per-vendor-competitive-positioning-recommendation | Move #199 Pillar 3 + Move #181.data | `dashboard/api/move-181/inbox/competitive-positioning-recommendation.json` receives ≥1 recommendation per active vendor |
| 11 | Deploy Move #199 Pillar 3: per-competitor-press-coverage-cost-calculator (consumes Move #192.data + Move #199 Pillar 3) | Move #192.data + Move #199 Pillar 3 | `dashboard/api/move-199/pillar-3/press-coverage-cost.json` returns 200 with per-competitor-per-month breakdown |
| 12 | Deploy Move #199 Pillar 3: per-competitor-social-media-backlash-cost-calculator | Move #192.data + Move #199 Pillar 3 | `dashboard/api/move-199/pillar-3/social-media-backlash-cost.json` returns 200 with per-competitor-per-month breakdown |
| 13 | Deploy Move #199 Pillar 3: per-competitor-share-of-voice-engine + per-competitor-share-of-incident-engine | Move #199 Pillar 3 + Move #195.data | `dashboard/api/move-199/pillar-3/share-of-voice.json` returns 200 with quarterly trend |
| 14 | Phase 2 acceptance gate: all 4 Pillar 3 components pass + per-vendor-recommendation coverage 100% + per-competitor-cost-calculators return non-zero for any 12-month period with ≥1 vendor fit-score drift >0.25 | Move #199 Pillar 3 + Move #181 + Move #192 | All 4 Pillar 3 APIs return 200 with target fill-rates |

### Phase 3 (Days 15-21): Pillars 4 + 5 — per-partnership-revenue-positioning-fit-score + per-channel-positioning-fit-score + per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay

| Day | Task | Substrate | Acceptance |
| --- | --- | --- | --- |
| 15 | Deploy Move #199 Pillar 4: per-partnership-revenue-positioning-vs-competitive-positioning-fit-score | Move #196.data + Move #199 Pillar 1-2 | `dashboard/api/move-199/pillar-4/partnership-fit-score.json` returns 200 with ≥12/15 partnership coverage + 4-band classification (Top-Quartile / Above-Median / Below-Median / Bottom-Quartile) |
| 16 | Deploy Move #199 Pillar 4: per-channel-positioning-vs-competitive-positioning-fit-score | Move #180.data + Move #199 Pillar 1-2 | `dashboard/api/move-199/pillar-4/channel-fit-score.json` returns 200 with ≥6/8 channel coverage + 4-band classification |
| 17 | Deploy Move #199 Pillar 5: per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay | Move #185.data + Move #199 Pillar 1-4 | `dashboard/api/move-199/pillar-5/portfolio-overlay.json` returns 200 with ±15% portfolio-margin-adjustment based on competitive-positioning-fit-score |
| 18 | Deploy Move #199 Pillar 5: per-vendor-competitive-positioning-vs-portfolio-margin-overlay (per-vendor rollup) | Move #185.data + Move #199 Pillar 1-4 | `dashboard/api/move-199/pillar-5/per-vendor-overlay.json` returns 200 with per-vendor portfolio-margin-overlay |
| 19 | Wire Move #199 Pillar 4 → Move #192 Pillar 2 indirect-cost-calculator competitive-positioning-cost-categories | Move #199 Pillar 4 + Move #192.data | `dashboard/api/move-192/pillar-2/competitive-positioning-cost.json` returns 200 with 6 cost-categories populated |
| 20 | Wire Move #199 Pillar 5 → Move #193 regulatory-fine-calculator competitive-positioning-repositioning-cost-attribution | Move #199 Pillar 5 + Move #193.data | `dashboard/api/move-193/competitive-positioning-attribution.json` returns 200 with per-incident attribution |
| 21 | Phase 3 acceptance gate: all 6 Pillar 4-5 components pass + per-Move-#192-handoff-status populated + per-Move-#193-handoff-status populated | Move #199 Pillar 4-5 + Move #192 + Move #193 | All 6 Pillar 4-5 APIs return 200 with target fill-rates |

### Phase 4 (Days 22-28): Pillar 6 — competitive-positioning-dashboard + cron cadence + Move-#181/#185/#195/#196/#197/#198-handoff

| Day | Task | Substrate | Acceptance |
| --- | --- | --- | --- |
| 22 | Deploy Move #199 Pillar 6: competitive-positioning-dashboard with 12 overlays | All Move #199 Pillar 1-5 | `dashboard/skills/199-ai-vendor-portfolio-competitive-positioning-engine` renders 12-overlay dashboard in <1.5s |
| 23 | Deploy Move #183 cron-61 (weekly-per-vendor-competitive-positioning-anchor-refresh) | Move #183.data + Move #199 Pillar 1 | `dashboard/api/move-183/cron-61/last-run.json` returns 200 with ≤7-day cadence |
| 24 | Deploy Move #183 cron-62 through cron-66 (5 weekly + 1 hourly competitive-positioning-validation crons) | Move #183.data + Move #199 Pillar 2-6 | All 6 cron APIs return 200 with target cadences |
| 25 | Deploy Move #199 Pillar 6: per-Move-#181-handoff-status + per-Move-#185-handoff-status + per-Move-#195-handoff-status panels | Move #199 Pillar 6 + Move #181 + Move #185 + Move #195 | `dashboard/api/move-199/pillar-6/handoff-status.json` returns 200 with 6 handoff-status cells |
| 26 | Deploy Move #199 Pillar 6: per-Move-#196-handoff-status + per-Move-#197-handoff-status + per-Move-#198-handoff-status panels | Move #199 Pillar 6 + Move #196 + Move #197 + Move #198 | `dashboard/api/move-199/pillar-6/handoff-status.json` returns 200 with 6 handoff-status cells (full 6-handoff coverage) |
| 27 | Deploy Move #199 Pillar 6: per-portfolio-competitive-positioning-rollup with 12-month rolling competitive-positioning-fit-score + quarterly drift-detection | Move #199 Pillar 6 | `dashboard/api/move-199/pillar-6/portfolio-rollup.json` returns 200 with 12-month rolling + quarterly drift-detection |
| 28 | Phase 4 acceptance gate: dashboard renders 12 overlays in <1.5s + all 6 cron cadences hit 100% + all 6 handoff-status cells populated + portfolio-rollup shows competitive-positioning-fit-score ≥0.65 over 12-month window | All Move #199 Pillar 6 + Move #183 | Full 28-day build complete; Move #199 ship-ready |

## Common pitfalls (18 from real builds)

1. **Pitfall — missing Move #198 strategic-positioning-engine substrate breaks Pillar 1 anchor-set ingestion.** Median failure: anchor-set ingestion reads `Move #198.data.per_strategic_positioning_state[vendor]` for every active vendor but if Move #198 is not yet shipped, every cell returns `null` and the 4-anchor-set is silently empty. Top-quartile fix: assert on Move #199 Pillar 1 boot that `Object.keys(Move198Data.per_strategic_positioning_state).length >= 45` BEFORE writing any anchor-set cells; fail-closed if Move #198 is not deployed. Stretch fix: implement a stub Move #198 with the canonical schema and seed it with synthetic per-strategic-positioning-state data for all 50 vendors so Move #199 Pillar 1 can run in dev mode without Move #198. **Fix:** `if (Object.keys(Move198Data?.per_strategic_positioning_state || {}).length < 45) throw new Error('Move #198 substrate not deployed');` at the top of Move #199 Pillar 1 boot.

2. **Pitfall — per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin state-machine ingestion produces a 5-pillar attribution ladder with circular dependencies.** Median failure: Pillar 2 reads Move #198.data.per_strategic_positioning_vs_portfolio_margin_overlay[vendor], Pillar 3 reads Move #195.data.per_competitor_portfolio_state[competitor] and computes a per-competitor-portfolio-margin-comparison, but the comparison-cell in Pillar 3 also reads Move #199.data.per_competitive_positioning_state[vendor] which doesn't exist yet because Pillar 1 hasn't finished writing. Top-quartile fix: phase the Pillar 1-6 writes in topological order (Pillar 1 first, then Pillar 2, then Pillar 3-5, then Pillar 6) and gate each Pillar on the previous Pillar's commit. **Fix:** use a single Move199WriteQueue() that serializes Pillar 1-6 writes in topological order; do NOT parallelize Pillar 1-6.

3. **Pitfall — per-competitor-positioning-vs-competitive-positioning-drift-detector latency exceeds 7 days because Move #195 Pillar 4 competitor-coverage-engine has a 21-day default refresh cadence.** Median failure: Move #199 Pillar 4 inherits Move #195's 21-day default refresh, so by the time a competitor repositioning event surfaces, 21 days have passed. Top-quartile fix: configure Move #195 Pillar 4 to a 3-day refresh cadence (override the 21-day default) when Move #199 is wired, and add a Move #195.data.per_competitor_repositioning_signal[competitor] real-time event-stream subscription. **Fix:** `Move195Config.refresh_cadence_days = 3; Move195Config.realtime_event_stream = true;` at Move #199 Pillar 4 boot.

4. **Pitfall — per-customer-defection-positioning-attribution produces a 6-bucket attribution score but the bucket-bounds are arbitrary.** Median failure: the 6 attribution buckets (competitive-positioning-driven / strategic-positioning-driven / customer-positioning-driven / channel-positioning-driven / partnership-positioning-driven / portfolio-margin-driven) are scored by an LLM judge but the LLM has no canonical scoring rubric. Top-quartile fix: implement a Move #199 Pillar 5 attribution-scoring-rubric with 6 buckets × 5 anchor-criteria (per-bucket) × 0.0-1.0 score = 30 anchor-cells per attribution; LLM judge reads the rubric and outputs a structured JSON. **Fix:** ship a `move-199-pillar-5-attribution-rubric.json` with the 6×5=30 anchor-cells as part of Pillar 5 build; LLM judge MUST cite the rubric-cell for every bucket-score.

5. **Pitfall — per-partnership-revenue-positioning-vs-competitive-positioning-fit-score conflates partnership-positioning (the partnership's own positioning) with competitive-positioning (how well the partnership's positioning competes against competitor partnerships).** Median failure: the partnership-fit-score is computed as `partnership_positioning × competitive_positioning` but the two dimensions are independent — a partnership can have a strong partnership-positioning (well-aligned with our brand) but weak competitive-positioning (poorly differentiated against competitor partnerships). Top-quartile fix: compute the two dimensions independently and ship a 2-dimensional fit-score (partnership-positioning-fit-score × competitive-positioning-fit-score) with sub-band classification per dimension. **Fix:** Pillar 4 partnership-fit-score output is `{partnership_positioning_fit_score: 0.0-1.0, competitive_positioning_fit_score: 0.0-1.0, combined_fit_band: 'top-quartile'|'above-median'|'below-median'|'bottom-quartile'}`; do NOT collapse to a single scalar.

6. **Pitfall — per-portfolio-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay ±15% portfolio-margin-adjustment is too aggressive for small vendor sets.** Median failure: at <20 active AI vendors, the ±15% adjustment produces noisy portfolio-margin-overlay values that swing ±5% week-over-week. Top-quartile fix: scale the adjustment by `min(active_vendor_count / 30, 1.0)` so operators with <30 vendors get a proportionally smaller adjustment. **Fix:** `portfolio_margin_adjustment_pct = 0.15 * Math.min(active_vendor_count / 30, 1.0);` in Pillar 5.

7. **Pitfall — Move #183 cron-61 through cron-66 cadence drift because the cron-engine's weekly-cadence window is 7 days but the cron's actual fire-time drifts to 7.5 days over a 4-week cycle.** Median failure: the cron-engine claims 100% cadence adherence but Move #199 Pillar 6's cron-status panel shows 6/6 crons drifting >7 days. Top-quartile fix: implement a cron-drift-detector that fires when any cron-cadence drifts >6.5 days and surfaces a Move #181 governance-alert. **Fix:** `Move183Config.cron_drift_threshold_days = 6.5;` and a Move #199 Pillar 6 cron-drift-detector reading the threshold.

8. **Pitfall — per-portfolio-competitive-positioning-fit-score 12-month rolling average hides vendor-level drift.** Median failure: a portfolio-fit-score of 0.65 looks healthy but 2 vendors have dropped to 0.30 (Bottom-Quartile) in the last 30 days, dragging down future quarters. Top-quartile fix: ship a per-vendor-fit-score-12-month-rolling-trend overlay (Pillar 6 overlay #11) and a per-vendor-quarterly-drift-detection overlay (Pillar 6 overlay #12) that surface vendor-level fit-score trends. **Fix:** `dashboard/api/move-199/pillar-6/per-vendor-fit-score-trend.json` returns per-vendor 12-month rolling + per-vendor quarterly drift-detection.

9. **Pitfall — Move #181 governance-recommendation per-vendor-competitive-positioning-recommendation coverage drops below 100% when a vendor has insufficient positioning-telemetry (<12-month history).** Median failure: vendors <12 months old receive a "HOLD" recommendation because Move #199 cannot compute a stable fit-score; this silently biases the portfolio towards Hold and away from Defend/Lean-In. Top-quartile fix: implement a Move #199 Pillar 5 minimum-telemetry gate (`vendor_age_months >= 6`) AND a "young-vendor-positioning-recommendation" sub-engine that uses Move #198.data.per_strategic_positioning_state[vendor] + Move #180.data.per_channel_revenue_attribution_state[channel] alone to emit a recommendation for vendors <12 months old. **Fix:** Pillar 5 boot reads `vendor_age_months` for every vendor; if `<6`, emit a young-vendor-positioning-recommendation from Move #198 + Move #180 only; if `6-12`, emit a positioning-recommendation with a confidence penalty; if `>12`, emit the full positioning-recommendation.

10. **Pitfall — Move #192 Pillar 2 indirect-cost-calculator competitive-positioning-cost-categories silently return 0 because the Move #199 Pillar 4-5 → Move #192 handoff is not bidirectional.** Median failure: Move #199 Pillar 5 emits competitive-positioning-cost-categories to Move #192.data but Move #192 reads `data.competitive_positioning_cost_categories` only at refresh-time; if Move #199 Pillar 5 fires AFTER Move #192's refresh, the cost-categories are missed. Top-quartile fix: implement a Move #192 event-stream subscription that ingests Move #199 Pillar 5 emissions in real-time (not just at refresh-time). **Fix:** `Move192Config.event_streams.push('move-199-pillar-5-competitive-positioning-cost');` and a Move #199 Pillar 5 → Move #192 webhook.

11. **Pitfall — per-competitor-press-coverage-cost-calculator over-attributes press-coverage to competitive-positioning.** Median failure: Move #192 Pillar 2 indirect-cost-calculator's "competitive-positioning-press-coverage-cost" cost-category gets attributed to Move #199 even when the press-coverage event is unrelated to competitive-positioning (e.g. a product-recall press-coverage event). Top-quartile fix: implement a competitive-positioning-relevance-check on every press-coverage event using an LLM judge with a canonical rubric (5 anchor-criteria: competitor-name-mentioned + repositioning-language + AI-vendor-name-mentioned + portfolio-margin-impact + 5-year-relevance). **Fix:** Pillar 3 press-coverage-cost-calculator MUST score each press-coverage event against the 5-anchor-criteria rubric; only events with score ≥3/5 are attributed to competitive-positioning.

12. **Pitfall — per-customer-defection-positioning-attribution LLM judge uses an outdated rubric (Move #198 strategic-positioning-engine shipped 12+ months ago and the rubric has drifted).** Median failure: Pillar 5 customer-defection-positioning-attribution emits an attribution-score based on the Move #198 rubric but Move #199 Pillar 5 needs a competitive-positioning-specific rubric. Top-quartile fix: ship a dedicated `move-199-pillar-5-customer-defection-positioning-attribution-rubric.json` (distinct from Move #198's rubric) with 6 buckets × 5 anchor-criteria = 30 anchor-cells. **Fix:** `move-199-pillar-5-customer-defection-positioning-attribution-rubric.json` is a Pillar 5 boot dependency; fail-closed if missing.

13. **Pitfall — competitive-positioning-dashboard 12-overlay render latency exceeds 1.5s because the dashboard loads all 50+ vendor competitive-positioning-states in a single SSR pass.** Median failure: Pillar 6 dashboard renders 12 overlays in 2.5s (above the <1.5s target) because the per-vendor-state-map is loaded synchronously. Top-quartile fix: implement Move #199 Pillar 6 lazy-loading where overlays #1-6 load synchronously and overlays #7-12 load asynchronously with a 200ms skeleton-loader. **Fix:** Pillar 6 dashboard uses Next.js dynamic-import for overlays #7-12; SSR pass renders overlays #1-6 only.

14. **Pitfall — Move #183 cron-66 hourly-per-portfolio-competitive-positioning-state-validation runs 24 times per day but the portfolio-state rarely changes hour-over-hour, wasting compute.** Median failure: cron-66 fires 24× per day but Move #199 Pillar 6 portfolio-state typically changes <1× per day, so 23 of 24 fires are no-ops. Top-quartile fix: implement a cron-66 change-detection gate that skips the validation if the portfolio-state hash hasn't changed since the last fire. **Fix:** `if (currentPortfolioStateHash === lastPortfolioStateHash) return;` at the top of cron-66.

15. **Pitfall — Move #199 Pillar 4 partnership-fit-score and channel-fit-score 4-band classification (Top-Quartile / Above-Median / Below-Median / Bottom-Quartile) thresholds are hardcoded and don't adapt to the operator's portfolio-size.** Median failure: Top-Quartile is hardcoded at 0.75 but a 50-vendor portfolio's Top-Quartile is empirically 0.65 (per Klue + Crayon 2024 benchmarks). Top-quartile fix: compute the 4-band thresholds dynamically from the operator's portfolio (`top_quartile = percentile(75, all_fit_scores)`) and re-classify on every refresh. **Fix:** Pillar 4 boot computes `thresholds = {top_quartile: percentile(75, scores), above_median: percentile(50, scores), below_median: percentile(25, scores)}` and emits per-partnership/per-channel band-classification based on the dynamic thresholds.

16. **Pitfall — Move #185 portfolio-margin-overlay integration is missing the per-vendor-margin-adjustment component.** Median failure: Pillar 5 portfolio-margin-overlay emits ±15% portfolio-margin-adjustment at the portfolio-level but Move #185 Pillar 6 portfolio-margin-overlay engine needs per-vendor-margin-adjustment to compute the per-vendor rollup. Top-quartile fix: ship a per-vendor-margin-adjustment component (`per_vendor_margin_adjustment_pct: -0.15 to +0.15`) alongside the portfolio-margin-adjustment. **Fix:** Pillar 5 portfolio-margin-overlay output is `{portfolio_margin_adjustment_pct: ±0.15, per_vendor_margin_adjustment: {vendor_id: -0.15 to +0.15, ...}}`; Move #185 reads both.

17. **Pitfall — Move #199 Pillar 1 anchor-set refresh cadence drift because anchor-set-refresh is manual (operator-driven) but the cron's anchor-set-refresh-cadence is automated.** Median failure: the operator updates a vendor's positioning-narrative anchor manually but Move #199 Pillar 1 overwrites the manual update with the cron-driven refresh. Top-quartile fix: implement a manual-override flag (`anchor_set.manual_override: true`) on every anchor-set cell; cron-refresh skips cells with manual-override. **Fix:** `if (cell.manual_override === true) return;` at the top of Pillar 1 anchor-set-refresh for every cell.

18. **Pitfall — per-portfolio-competitive-positioning-rollup 12-month rolling window produces a flat-line fit-score when the operator's portfolio-vendor-set changes mid-window (vendor added/removed).** Median failure: a vendor is sunsetted mid-window (Move #186) and the portfolio-fit-score 12-month rolling drops from 0.65 to 0.45 because the sunsetted vendor was a Top-Quartile contributor; the operator interprets this as competitive-positioning-fit-score-degradation when it's actually a portfolio-composition-change. Top-quartile fix: implement a portfolio-composition-normalization step that re-weights the 12-month rolling by active-vendor-count per month. **Fix:** `portfolio_fit_score_normalized = sum(monthly_fit_score * active_vendor_count_month) / sum(active_vendor_count_month)` over the 12-month window.

## Verification (this skill is "shipped" when...)

**Gate A** — `grep -oE 'Move-#198' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #198 substrate referenced ≥4 times).

**Gate B** — `grep -oE 'Move-#195|Move-#197|Move-#196' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #195 + Move #197 + Move #196 substrates referenced ≥4 times combined).

**Gate C** — `grep -oE 'Move-#180|Move-#181|Move-#185' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #180 + Move #181 + Move #185 substrates referenced ≥4 times combined).

**Gate D** — `grep -oE 'Move-#182|Move-#186|Move-#187|Move-#188|Move-#189|Move-#190|Move-#191|Move-#192|Move-#193|Move-#194' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #182 + Move #186-194 substrates referenced ≥4 times combined).

**Gate E** — `grep -oE 'Move-#119|Move-#100|Move-#77|Move-#90' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #119 + Move #100 + Move #77 + Move #90 substrates referenced ≥4 times combined).

**Gate F** — `grep -oE 'Move-#183|Move-#184' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #183 + Move #184 substrates referenced ≥4 times combined).

**Gate G** — `grep -oE 'Move #199 → Move #200|Move-#200' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md | wc -l ≥ 4` (Move #200 follow-on referenced ≥4 times).

**Gate H** — `grep -cE '^[0-9]+\. \*\*Pitfall #' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md ≥ 18` (18 numbered pitfalls).

**Gate I** — `grep -cE 'Fix:' skills/199-ai-vendor-portfolio-competitive-positioning-engine.md ≥ 18` (18 Fix: lines matching the 18 pitfalls).

**All 9 gates A-I pass → Move #199 ships.**

## How to extend this skill

**(a) Move #200 — ai-vendor-portfolio-positioning-rollup-engine** (canonical follow-on, ~70KB). Move #199 Pillar 6 ships per-portfolio-competitive-positioning-rollup at the portfolio-level but Move #200 extends the rollup across the operator's full portfolio-of-portfolios (i.e. when the operator runs multiple brands, Move #200 rolls up competitive-positioning-fit-score across all brands). Move #200 consumes Move #199.data.per_competitive_positioning_state[vendor] for every vendor in every brand and emits a per-brand-rollup + per-portfolio-of-portfolios-rollup.

**(b) Move #199.1 — ai-vendor-portfolio-competitive-positioning-engine-per-vendor-explainer** (companion artifact, ~35KB). Operator enters per-vendor-id → engine returns per-vendor-competitive-positioning-state + per-vendor-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay + per-vendor-competitor-positioning-vs-competitive-positioning-drift-trend + per-vendor-customer-defection-positioning-attribution + per-vendor-partnership-revenue-positioning-fit-score + per-vendor-channel-positioning-fit-score + per-vendor-Move-#181-handoff-recommendation + per-vendor-Move-#185-overlay + per-vendor-quarterly-drift-detection + per-vendor-12-month-fit-score-trend.

**(c) Move #199.2 — ai-vendor-portfolio-competitive-positioning-engine-per-vendor-builder** (companion artifact, ~35KB). Operator configures per-vendor-competitive-positioning-anchor-set + per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-state + per-competitor-positioning-vs-competitive-positioning-drift-detector + per-customer-defection-positioning-attribution → engine writes Move #199.data.{...} to Move #198 + Move #195 + Move #197 + Move #196 + Move #180 + Move #181 + Move #185 + Move #192 + Move #193 substrates.

## Cross-references

**Substrate dependencies** (24 — Move #199 consumes these):

- **Move-#77** — AI-orchestration-engine (Pillar 5 cross-channel-competitive-positioning-orchestration substrate)
- **Move-#90** — AI-orchestration-per-channel-engine (Pillar 5 per-channel-competitive-positioning-fit-score substrate)
- **Move-#100** — channel-attribution-engine (Pillar 6 competitive-positioning-vs-channel-attribution-rollup substrate)
- **Move-#119** — channel-strategic-positioning-vs-portfolio-rollup-engine (Pillar 6 channel-strategic-positioning-vs-competitive-positioning substrate)
- **Move-#180** — channel-revenue-attribution-engine (Pillar 4 channel-competitive-positioning-fit-score substrate)
- **Move-#181** — AI-vendor-portfolio-governance-engine (Pillar 5 per-vendor-competitive-positioning-vs-portfolio-margin-overlay substrate)
- **Move-#182** — AI-vendor-trust-recovery-engine (Pillar 4 per-customer-AI-trust-vs-competitive-positioning-overlay substrate)
- **Move-#183** — AI-vendor-cadence-cron-engine (cron-61 through cron-66 cadence substrate)
- **Move-#184** — AI-vendor-onboarding-engine (Pillar 6 per-portfolio-state-competitive-positioning-overlay substrate)
- **Move-#185** — AI-vendor-portfolio-ROI-dashboard-engine (Pillar 6 per-portfolio-competitive-positioning-margin-overlay substrate)
- **Move-#186** — AI-vendor-sunset-decision-engine (Pillar 5 incident-competitive-positioning-drift substrate)
- **Move-#187** — AI-vendor-sunset-rollback-engine (Pillar 5 recovery-competitive-positioning-drift substrate)
- **Move-#188** — AI-vendor-incident-response-engine (Pillar 6 incident-customer-impact-broadcast-competitive-positioning-overlay substrate)
- **Move-#189** — AI-vendor-incident-recovery-orchestrator (Pillar 6 recovery-orchestrator-competitive-positioning-overlay substrate)
- **Move-#190** — AI-vendor-incident-post-mortem-engine (Pillar 6 incident-post-mortem-competitive-positioning-overlay substrate)
- **Move-#191** — AI-vendor-incident-cross-incident-pattern-recognition-engine (Pillar 6 cross-incident-pattern-recognition-competitive-positioning-overlay substrate)
- **Move-#192** — AI-vendor-incident-cost-attribution-engine (Pillar 2 + Pillar 3 indirect-cost-calculator + opportunity-cost-calculator-competitive-positioning-overlay substrate)
- **Move-#193** — AI-vendor-incident-regulatory-fine-calculator (Pillar 4 regulatory-fine-calculator-competitive-positioning-overlay substrate)
- **Move-#194** — AI-vendor-incident-customer-impact-broadcast-engine (Pillar 5 customer-impact-broadcast-competitive-positioning-overlay substrate)
- **Move-#195** — AI-vendor-portfolio-competitor-coverage-engine (Pillar 5 competitor-positioning-vs-competitive-positioning-drift substrate)
- **Move-#196** — AI-vendor-portfolio-partnership-revenue-engine (Pillar 4 partnership-positioning-vs-competitive-positioning-drift substrate)
- **Move-#197** — AI-vendor-portfolio-customer-defection-engine (Pillar 4 customer-defection-positioning-vs-competitive-positioning-drift substrate)
- **Move-#198** — AI-vendor-portfolio-strategic-positioning-engine (Pillar 1 per-strategic-positioning-vs-competitive-positioning-vs-portfolio-margin-overlay substrate)
- **Move #199 → Move #200** — ai-vendor-portfolio-positioning-rollup-engine (canonical follow-on)

## Sources

50 vendor URLs spanning Klue + Crayon + Kompyte + G2 + Gartner Magic Quadrant for AI Vendors 2024 + Forrester Wave for AI Vendor Positioning 2024 + Triple Whale + Northbeam + Polar Analytics + Hyros + Daasity + Glew + Segment + mParticle + RudderStack + Snowplow Analytics + Amplitude + Mixpanel + Heap + Klaviyo + Iterable + Braze + Postscript + Attentive + Kustomer + Gorgias + Zendesk + Intercom + Ada + Forethought + Shopify + BigCommerce + WooCommerce + Recharge + Skio + Smile.io + Yotpo + LoyaltyLion + Rebuy + Nosto + Dynamic Yield + Langfuse + Helicone + Arize + Braintrust + Competitive Positioning Engine.
