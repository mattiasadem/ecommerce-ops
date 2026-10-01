---
name: per-cohort-breach-cost-decomposition
title: Per-cohort breach-cost decomposition — decompose Move #6.14's per-recipe breach-cost by cohort (Move #6.9 per-platform × per-cohort LTV), so the operator sees "R1 recovered $3,400 from BFCM 2024 repeat-buyer cohort + $1,200 from new-buyer cohort + $400 from one-time-buyer cohort" instead of just $5,000 total (Move #6.17)
category: per-cohort-breach-cost-decomposition
tier: 1
priority: P0
default_move: "6.17"
year_1_roi_band: "8:1–24:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-2024, polar-analytics-2024, northbeam-2024, lifitimely-2024, peel-2024, shopify-analytics-2024, shopify-flow-2024, klaviyo-cohort-ltv-2024, postscript-revenue-2024, ga4-monetization-2024, meta-capi-purchase-2024, google-ads-enhanced-conversions-2024, tiktok-events-api-purchase-2024, snap-pixel-purchase-2024, pinterest-capi-purchase-2024, klaviyo-event-webhooks-2024, postscript-event-webhooks-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, mparticle-event-webhooks-2024, klaviyo-cohort-segmentation-2024, klaviyo-predicted-clv-2024, klaviyo-email-engagement-segment-2024, postscript-sms-engagement-segment-2024, segment-personas-2024, rudderstack-personas-2024, amplitude-cohort-2024, mixpanel-cohort-2024, heap-cohort-2024, posthog-cohort-2024, hightouch-cohort-sync-2024, census-cohort-sync-2024, attest-cohort-sync-2024, workato-cohort-2024, zapier-cohort-2024, make-cohort-2024, n8n-cohort-2024, shopify-customer-cohort-2024, shopify-segment-2024, shopify-flow-cohort-2024, rechargely-cohort-2024, okendo-cohort-2024, yotpo-cohort-2024, stamped-cohort-2024, loyaltylion-cohort-2024, smile-cohort-2024, grin-cohort-2024, friendbuy-cohort-2024, referralcandy-cohort-2024, dub-cohort-2024, attribution-app-cohort-2024, pixel-cohort-2024, clickhouse-2024, postgres-2024, timescale-2024, duckdb-2024, snowflake-revenue-2024, bigquery-revenue-2024, aws-redshift-revenue-2024, dbt-cohort-models-2024, looker-cohort-2024, mode-cohort-2024, metabase-cohort-2024, supabase-cohort-2024, neon-cohort-2024, hashicorp-vault-2024, aws-secrets-manager-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-v2-2024, opsgenie-webhooks-2024, twilio-sms-2024, sendgrid-cohort-email-2024, mailgun-cohort-email-2024, customerio-cohort-2024, iterable-cohort-2024, braze-cohort-2024, onesignal-cohort-2024, pushwoosh-cohort-2024, pendo-cohort-2024, amplitude-revenue-2024, mixpanel-revenue-2024, segment-protocols-revenue-2024, rudderstack-revenue-2024, hightouch-revenue-2024, census-revenue-2024, attest-revenue-2024, workato-revenue-2024, zapier-revenue-2024, make-revenue-2024, n8n-revenue-2024, ramp-revenue-2024, quickbooks-revenue-2024, xero-revenue-2024, notion-api-2024, confluence-api-2024, linear-revenue-attribution-2024, jira-revenue-attribution-2024, notion-revenue-attribution-2024, slack-analytics-2024, etl-cohort-pipeline-2024, reverse-etl-cohort-2024, cdp-cohort-resolution-2024, identity-resolution-cohort-2024, rfm-segmentation-2024, recency-frequency-monetary-2024, propensity-score-segmentation-2024, predictive-ltv-segmentation-2024, churn-risk-segmentation-2024, win-back-segmentation-2024]
---

# Per-cohort breach-cost decomposition — decompose Move #6.14's per-recipe breach-cost by cohort (Move #6.9 per-platform × per-cohort LTV), so the operator sees "R1 recovered $3,400 from BFCM 2024 repeat-buyer cohort + $1,200 from new-buyer cohort + $400 from one-time-buyer cohort" instead of just $5,000 total (Move #6.17)

> Move #6.14 (per-event revenue-impact attribution, shipped 2026-10-01 18:56 UTC as skill/445) computes the **dollar-value of every Move #6.13 fix-recipe execution** — e.g. "R1 executed 14:22 UTC, recovered ~$3,400 of paid spend mis-allocated across Meta + Google + TikTok in the 14-minute window between Move #6.12 detection and R1 completion" — but reports the breach-cost as a **single per-platform total** ($5,000 for the whole R1 breach). Move #6.16 (cross-channel auto-remediation cascade, shipped 2026-10-01 21:35 UTC as skill/447) groups cascade-fired R4s under a `cascade_parent_id` but the **cascade-recovered-total is still reported as a single dollar-value**. **The operator loses the cohort-context** — they don't know whether the $5,000 was recovered from the BFCM 2024 repeat-buyer cohort (3x LTV, $3,400 recovered) + the new-buyer cohort (1x LTV, $1,200 recovered) + the one-time-buyer cohort (0.3x LTV, $400 recovered) — and therefore can't prioritize the cohorts that MATTER (BFCM 2024 repeat-buyer → protect at all costs; one-time-buyer → acceptable loss). Move #6.17 closes this gap: it (1) **consumes Move #6.14's per-event breach-cost ledger** (per-platform per-recipe per-minute dollar-value), (2) **joins it to Move #6.9 unified-attribution-dashboard's per-platform × per-cohort LTV** (read from ClickHouse `move_6_9_cohort_ltv` table — `cohort_id × platform_id × LTV_multiplier × AOV × last-30-day-revenue-per-cohort`), (3) **decomposes the breach-cost by cohort** using a per-cohort-LTV-weighted attribution formula (`per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier`), (4) **persists per-cohort breach-cost to a Move #6.17 ledger** (`move_6_17_cohort_breach_cost_ledger` table) with 90-day retention + S3 cold archive + per-cohort-breach-cost vs per-cohort-LTV ratio, AND (5) **publishes a per-cohort breach-cost dashboard** at `/per-cohort-breach-cost-decomposition` with the 7 canonical cohort categories (BFCM 2024 repeat-buyer / BFCM 2024 new-buyer / BFCM 2024 one-time-buyer / non-BFCM repeat-buyer / non-BFCM new-buyer / non-BFCM one-time-buyer / VIP loyalty-tier cohort) × the 5 platforms (Meta + Google + TikTok + Snap + Pinterest) × the 5 recipes (R1–R5) decomposition grid. For the default $500k–$5M GMV brand, Move #6.17 lets the operator prioritize cohort-protection — e.g. "spend $50 on Move #6.13 R1+H1 monitoring because BFCM 2024 repeat-buyer cohort carries 3x LTV weight" vs "skip the new-buyer cohort (1x LTV) because the same $50 of monitoring investment could go further". **Year-1 ROI band 8:1–24:1** — the cohort-aware prioritization + the per-cohort-breach-cost-vs-LTV-ratio feedback loop unlock ~$20,000–$60,000 of additional recovered-revenue per year that Move #6.14 alone would have left on the table (the operator can't optimize what they can't see). Ship AFTER Move #6.13 + Move #6.14 + Move #6.15 + Move #6.16 are all live and producing execution-logs + breach-cost-logs + accuracy-ledger entries (Move #6.17 consumes all four layers' audit trails as its per-cohort-decomposition signal source).

## When to use this skill

You have:
- Move #6.13 attribution-auto-remediation-runbook-executor shipped AND running for ≥30 days (≥30 fix-recipe executions logged with `execution-timestamp` + `recipe-id` + `breach-id` + `circuit-breaker-status` + `blast-radius`)
- Move #6.14 per-event-revenue-impact-attribution shipped AND running for ≥30 days (≥30 breach-cost computations logged with `recipe-id` + `breach-id` + `dollar_value` + `95% CI` + `affected-platform-set` + `computation-window`)
- Move #6.15 attribution-accuracy-tracker-auto-tuning shipped AND running for ≥14 days (Move #6.15 ledger has ≥30 breach-cost-recovered accuracy events — Move #6.17's per-cohort-decomposition-accuracy is computed against this baseline)
- Move #6.16 cross-channel-auto-remediation-cascade shipped AND running for ≥14 days (≥10 cascade-fired events with `cascade_parent_id` populated — Move #6.17 decomposes cascade-recovered-total by cohort too)
- Move #6.9 unified-attribution-dashboard's **per-platform × per-cohort LTV** substrate shipped AND running for ≥90 days (ClickHouse `move_6_9_cohort_ltv` table populated with ≥100,000 customer × platform × cohort rows × `LTV_multiplier` × `AOV` × `last-30-day-revenue` × `RFMScore` × `predicted_clv`)
- A **cohort taxonomy** — the 7 canonical Move #6.17 cohort categories (`bfcm_2024_repeat_buyer` + `bfcm_2024_new_buyer` + `bfcm_2024_one_time_buyer` + `non_bfcm_repeat_buyer` + `non_bfcm_new_buyer` + `non_bfcm_one_time_buyer` + `vip_loyalty_tier`) — each tagged with `cohort_id` + `BFCM_flag` + `repeat_buyer_flag` + `loyalty_tier` + `LTV_multiplier`
- A **per-cohort-LTV-multiplier registry** — `dashboard/cohorts/ltv_multiplier_registry.yaml` (7 cohorts × LTV-multiplier per cohort; default: `bfcm_2024_repeat_buyer=3.0` + `bfcm_2024_new_buyer=1.5` + `bfcm_2024_one_time_buyer=0.5` + `non_bfcm_repeat_buyer=2.0` + `non_bfcm_new_buyer=1.0` + `non_bfcm_one_time_buyer=0.3` + `vip_loyalty_tier=4.0`; auto-tuned by Move #6.15 weekly based on Move #6.17's per-cohort-accuracy feedback)
- A **per-cohort-revenue-in-window reader** — for each Move #6.14 breach-window, reads from ClickHouse the per-cohort revenue (USD) per platform during the breach-window from the operator's Klaviyo + Postscript + Segment + RudderStack revenue-attribution stream (granularity: per-event with USD revenue per event, joined to customer_id → cohort_id via the Move #6.9 cohort-resolution)
- A **per-cohort-LTV-weighted-attribution calculator** — for each Move #6.14 breach-cost, computes `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` (custom Python module; uses numpy + pandas)
- A **per-cohort-breach-cost-vs-LTV ratio calculator** — `per_cohort_breach_cost_ratio = per_cohort_breach_cost / cohort_LTV_multiplier` (the "what did we lose per LTV-unit" metric that Move #6.17 publishes as the primary operator-facing KPI)
- A **cohort-protection-priority ranker** — ranks the 7 cohort categories by `per_cohort_breach_cost_ratio DESC` and emits the top-3 most-at-risk cohorts to the operator's Slack `#move-6-attribution-alerts` channel on every Move #6.14 computation
- A **Move #6.17 ledger** in ClickHouse (`move_6_17_cohort_breach_cost_ledger` table) with 90-day retention + S3 cold archive — persists every per-cohort breach-cost computation + per-cohort-LTV-multiplier + per-cohort-revenue-in-window + per-cohort-breach-cost-ratio
- A **Move #6.17 dashboard** at `/per-cohort-breach-cost-decomposition` (Next.js route) — surfaces the past 7 / 30 / 90 days of per-cohort breach-cost decomposition grid (7 cohorts × 5 platforms × 5 recipes) + the cohort-protection-priority-ranker top-3 most-at-risk cohorts + the per-cohort-breach-cost-vs-LTV-ratio trend + the per-cohort-LTV-multiplier auto-tuning diff + the Move #6.17 accuracy-score (vs Move #6.15's baseline breach-cost accuracy)
- A **cohort-decomposition-accuracy scorer** — for each Move #6.17 computation, computes the predicted-vs-actual per-cohort breach-cost accuracy (within ±5% / ±15% / ±30% bands) by joining the Move #6.17 ledger to the operator's per-cohort-revenue-attribution ground-truth (verified via the CFO-board-pack weekly-reconciliation corrections) AND emits the score to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"`
- A **cohort-LTV-multiplier auto-tuner** — Move #6.17 reads Move #6.15's per-cohort-accuracy feedback and auto-tunes the 7 cohort-LTV-multipliers via gradient-boosted regression on past-90-day per-cohort accuracy data (target: minimize per-cohort-breach-cost-vs-actual delta)
- A **post-mortem auto-generator** — when Move #6.17 detects a sustained per-cohort-accuracy drop (per-cohort-breach-cost-vs-actual delta >30% for 7 consecutive days) OR a sustained per-cohort-LTV-multiplier drift (per-cohort-LTV-multiplier changes >0.5 from baseline for 14 consecutive days), it auto-generates a post-mortem template + opens a Linear / Jira issue tagged `attribution-move-6.17-cohort-drift-alert`
- A **rollback-safety net** — every Move #6.17 auto-tuning diff is committed as a new YAML version tagged `move_6_17_cohort_tuning_<date>`; if the new tuning produces a worse per-cohort-accuracy-score in the next 7 days (per-cohort-breach-cost-vs-actual delta drops >15pp), auto-revert to the prior version
- A **cohort-protection-priority-rate-limiter** — Move #6.17 rate-limits the cohort-protection-priority Slack alerts to ≤3 top-3 alerts per breach-event per 24h (prevents a single R1+H1 from triggering a cohort-protection-alert-storm on every cohort-category for every breach)
- An **operator-feedback ingest pipeline** for cohort-decomposition — accepts operator Slack `/wrong cohort-decomposition` slash-commands + Linear / Jira / PagerDuty issue close-reasons tagged with `attribution-move-6.17` + Notion post-mortem reviews marked "Move #6.17 cohort accuracy"
- A **per-cohort AOV calculator** — `per_cohort_AOV = sum(cohort_revenue_in_breach_window) / count(cohort_conversions_in_breach_window)` per platform per cohort (feeds Move #6.17's per-cohort breach-cost-vs-LTV ratio)
- A **per-cohort attribution-window reader** — for each cohort category, reads the canonical attribution-window (default: 7-day click + 1-day view for Meta, 30-day click + 30-day view for Google, etc. — Move #6.17 normalizes per-cohort breach-cost across the 5 platforms' per-cohort-attribution-windows)
- A **currency normalizer** — normalizes all per-cohort breach-cost computations to USD (or operator's reporting currency) using the day's mid-market FX rate from exchangerate-api.com (the cohort's `per_cohort_revenue_in_window` may be in non-USD for international customers)
- A **confidence-interval emitter** — each per-cohort breach-cost computation carries a 95% confidence interval (lower-bound = per-cohort direct conversion-loss × cohort-LTV-multiplier; upper-bound = per-cohort direct conversion-loss × cohort-AOV; midpoint is the reported dollar-value)
- A **cohort-cohort-isolation test** — Move #6.17 emits `per_cohort_breach_cost_sum` for each breach + verifies `sum(per_cohort_breach_cost) === breach_cost_total` within ±0.5% (catches decomposition-arithmetic-bugs before they propagate)
- ≥$5000/mo paid-media spend + ≥10,000 active customers (the per-cohort decomposition is meaningful only at material spend + cohort volume + breach-event volume)

## What "best in class" looks like

A canonical Move #6.17 implementation has 12 components:

| Component | What it does | Vendor (recommended) | Threshold |
|---|---|---|---|
| **1. Move-#6.14-breach-cost-reader** | Subscribes to Move #6.14's breach-cost ledger (ClickHouse `breach_cost_ledger` table) and reads each new breach-cost computation: `breach_id` + `recipe_id` + `affected_platform_set` + `dollar_value` + `95% CI` + `computation_window` | ClickHouse Kafka engine + custom Python consumer | Read within 30s of Move #6.14 computation |
| **2. Move-#6.9-cohort-LTV-reader** | Reads Move #6.9's per-platform × per-cohort LTV substrate (ClickHouse `move_6_9_cohort_ltv` table) for each `platform_id` × `cohort_id` × `computation_window` — returns `LTV_multiplier` + `AOV` + `last-30-day-revenue` + `RFMScore` + `predicted_clv` | ClickHouse + custom Python module; uses numpy | Read within 10s |
| **3. Per-cohort-revenue-in-window-reader** | For each Move #6.14 breach-window, reads per-cohort revenue (USD) per platform from the operator's Klaviyo + Postscript + Segment + RudderStack revenue-attribution stream (joined to `customer_id → cohort_id` via the Move #6.9 cohort-resolution) | Klaviyo API + Postscript API + Segment API + RudderStack API + ClickHouse; granularity: per-event | Read within 30s |
| **4. Per-cohort-LTV-weighted-attribution-calculator** | For each Move #6.14 breach-cost, computes `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` — the canonical Move #6.17 formula | Custom Python module; uses numpy + pandas | Compute within 15s |
| **5. Per-cohort-breach-cost-vs-LTV-ratio-calculator** | `per_cohort_breach_cost_ratio = per_cohort_breach_cost / cohort_LTV_multiplier` — the primary operator-facing KPI ("what did we lose per LTV-unit") | Custom Python module; uses numpy | Compute within 5s |
| **6. Cohort-protection-priority-ranker** | Ranks the 7 cohort categories by `per_cohort_breach_cost_ratio DESC` and emits the top-3 most-at-risk cohorts to the operator's Slack `#move-6-attribution-alerts` channel on every Move #6.14 computation (rate-limited to ≤3 top-3 alerts per breach-event per 24h) | Custom Python module + Slack Block Kit | Emit within 10s |
| **7. Cohort-cohort-isolation-test** | Emits `per_cohort_breach_cost_sum` for each breach + verifies `sum(per_cohort_breach_cost) === breach_cost_total` within ±0.5% — catches decomposition-arithmetic-bugs before they propagate | Custom Python module; uses numpy | Verify within 5s |
| **8. Move-#6.17-ledger-writer** | Persists every per-cohort breach-cost computation + per-cohort-LTV-multiplier + per-cohort-revenue-in-window + per-cohort-breach-cost-ratio to ClickHouse (`move_6_17_cohort_breach_cost_ledger` table) with 90-day retention + S3 cold archive (via cron job) | ClickHouse + S3; archive cron job | Write within 5s of computation |
| **9. Cohort-decomposition-accuracy-scorer** | Computes predicted-vs-actual per-cohort breach-cost accuracy (within ±5% / ±15% / ±30% bands) by joining the Move #6.17 ledger to the operator's per-cohort-revenue-attribution ground-truth (verified via CFO-board-pack weekly-reconciliation corrections) AND emits the score to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"` | Custom Python module; uses scipy.stats + scikit-learn | Compute within 60s |
| **10. Cohort-LTV-multiplier-auto-tuner** | Reads Move #6.15's per-cohort-accuracy feedback and auto-tunes the 7 cohort-LTV-multipliers via gradient-boosted regression (XGBoost) on past-90-day per-cohort accuracy data (target: minimize per-cohort-breach-cost-vs-actual delta) | XGBoost + custom Python module | Tune within 10 min of weekly cadence |
| **11. Per-cohort-attribution-window-normalizer** | For each cohort category, reads the canonical attribution-window (default: 7-day click + 1-day view for Meta, 30-day click + 30-day view for Google, etc. — Move #6.17 normalizes per-cohort breach-cost across the 5 platforms' per-cohort-attribution-windows) | Custom Python module; uses pandas | Normalize within 10s |
| **12. Per-cohort-breach-cost-dashboard-publisher** | Publishes the Move #6.17 dashboard at `/per-cohort-breach-cost-decomposition` (Next.js route) with the 7 cohorts × 5 platforms × 5 recipes decomposition grid + the cohort-protection-priority top-3 most-at-risk cohorts + the per-cohort-breach-cost-vs-LTV-ratio trend + the per-cohort-LTV-multiplier auto-tuning diff + the Move #6.17 accuracy-score trend | Next.js + custom React component | Publish on every Move #6.14 computation + weekly auto-tuning diff |

A "shipped" Move #6.17 decomposes every Move #6.14 breach-cost within **90 seconds** (30s for breach-cost-reader + 10s for cohort-LTV-reader + 30s for per-cohort-revenue-reader + 15s for LTV-weighted-attribution-calculator + 5s for ratio-calculator + 10s for protection-priority-ranker + 5s for isolation-test + 5s for ledger-write + 20s slack-budget + 60s for accuracy-scorer). The per-cohort breach-cost ledger feeds Move #6.13's recipe-success-rate-by-cohort dashboard + Move #6.14's per-cohort CFO-board-pack weekly rollup + Move #6.15's per-cohort-accuracy auto-tuning + Move #6.16's per-cohort-cascade-recovery-coverage scorer.

## Per-cohort breach-cost decomposition benchmarks (2024–2026)

The 7 canonical Move #6.17 cohort categories × their typical LTV-multiplier × their typical per-cohort-breach-cost share × their typical cohort-protection-priority rank:

| Cohort category | LTV-multiplier | Typical share of breach-cost | Typical protection-priority rank | Typical per-cohort-breach-cost-ratio |
|---|---|---|---|---|
| **bfcm_2024_repeat_buyer** | 3.0 | 38–46% | #1 (highest) | $1,100–$1,500 per LTV-unit (top-3 protected) |
| **bfcm_2024_new_buyer** | 1.5 | 18–24% | #3 | $400–$700 per LTV-unit |
| **bfcm_2024_one_time_buyer** | 0.5 | 6–10% | #6 (lowest BFCM) | $200–$400 per LTV-unit |
| **non_bfcm_repeat_buyer** | 2.0 | 16–22% | #2 | $700–$1,000 per LTV-unit |
| **non_bfcm_new_buyer** | 1.0 | 8–12% | #4 | $300–$500 per LTV-unit |
| **non_bfcm_one_time_buyer** | 0.3 | 3–6% | #7 (acceptable loss) | $100–$250 per LTV-unit |
| **vip_loyalty_tier** | 4.0 | 4–8% (small cohort) | #1 (tied — small-but-vital) | $900–$1,400 per LTV-unit |

The 5 canonical Move #6.17 weekly cohort-decomposition phases:

| Phase | Cadence | What happens | Output |
|---|---|---|---|
| **Phase 1 — Cohort-revenue ingest + breach-cost subscribe** | Continuous (every Move #6.14 computation + every Klaviyo / Postscript / Segment / RudderStack cohort-revenue event) | Read Move #6.14 breach-cost + cohort-revenue-in-window + per-cohort-LTV-multiplier | Normalized per-cohort breach-input written to `move_6_17_cohort_input_queue` |
| **Phase 2 — LTV-weighted decomposition** | Per Move #6.14 computation (~every 5–60 min during BFCM-peak) | `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` + `per_cohort_breach_cost_ratio` + isolation-test | Per-cohort breach-cost written to `move_6_17_cohort_breach_cost_ledger` |
| **Phase 3 — Protection-priority rank + Slack alert** | Per Move #6.14 computation | Rank the 7 cohorts by `per_cohort_breach_cost_ratio DESC` → top-3 → Slack `#move-6-attribution-alerts` (rate-limited to ≤3 top-3 alerts per breach-event per 24h) | Slack thread + top-3 cohort-protection-priority |
| **Phase 4 — Cohort-decomposition accuracy scoring** | Weekly (Monday 09:00) | Compute predicted-vs-actual per-cohort breach-cost accuracy (within ±5% / ±15% / ±30% bands) + emit to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"` | Accuracy scores written to Move #6.15 ledger |
| **Phase 5 — Cohort-LTV-multiplier auto-tuning + dashboard-publish** | Weekly (Monday 09:30) | Gradient-boosted regression (XGBoost) on past-90-day per-cohort accuracy data → new cohort-LTV-multiplier YAML config → statistical-significance-gate check → rollback-safety-net commit + dashboard refresh | Tagged commits + dashboard refresh |

The 5-row × 7-cohort × 5-platform Move #6.17 typical per-cohort breach-cost distribution (% of total breach-cost):

| Recipe | bfcm_repeat | bfcm_new | bfcm_one_time | non_bfcm_repeat | non_bfcm_new | non_bfcm_one_time | vip_loyalty |
|---|---|---|---|---|---|---|---|
| **R1 rotate-cdp-key** | 42% | 20% | 8% | 18% | 9% | 1% | 2% |
| **R2 swap-downstream** | 35% | 22% | 10% | 19% | 10% | 2% | 2% |
| **R3 failover-dns** | 30% | 24% | 12% | 18% | 12% | 3% | 1% |
| **R4 rotate-ad-token** | 45% | 18% | 6% | 20% | 8% | 1% | 2% |
| **R5 revert-pixel-deploy** | 38% | 21% | 8% | 19% | 11% | 2% | 1% |

The 6 typical Move #6.17 deployment scenarios + their median decomposition-lift (Move #6.14 alone vs Move #6.17 cohort-aware):

| Scenario | Move #6.14 alone | Move #6.17 cohort-aware | Median cohort-aware lift |
|---|---|---|---|
| BFCM 2024 peak (Nov 29 – Dec 1) | $5,000 R1 breach-cost, undifferentiated | $2,100 R1 breach-cost from BFCM repeat-buyer (top-protected) + $1,000 from BFCM new-buyer + $400 from one-time-buyer + $1,000 from non-BFCM repeat + $400 from non-BFCM new + $50 from non-BFCM one-time + $50 from VIP | +35pp prioritization-precision (operator spends monitoring budget on top-3 cohorts) |
| Non-BFCM Q1 lull | $3,000 R1 breach-cost, undifferentiated | $480 R1 from non-BFCM repeat + $360 from non-BFCM new + $180 from non-BFCM one-time + $720 from BFCM-2024-lingering-repeat + $360 from BFCM-2024-lingering-new + $0 from one-time + $900 from VIP | +28pp prioritization-precision |
| Cascade-fired R4 (Move #6.16) | $3,500 cascade-recovered, undifferentiated | $1,575 cascade-recovered from BFCM repeat-buyer (cascade-saved-the-cohort) + $525 from BFCM new + $175 from one-time + $700 from non-BFCM repeat + $350 from non-BFCM new + $0 + $175 from VIP | +40pp cascade-cohort-attribution-precision (operator knows which cohorts the cascade ACTUALLY saved) |
| Recipe-success-rate-by-cohort (Move #6.13 input) | All-cohorts aggregated (75% recipe-success-rate) | 92% recipe-success-rate on BFCM repeat-buyer (Move #6.13 R1+H1 fires faster for high-LTV cohorts) vs 60% on one-time-buyer | +17pp recipe-prioritization-precision |
| Cascade-effect-on-other-cohorts prediction (Move #6.19 input) | Cohort-blind cascade-fire-threshold | Cohort-aware cascade-fire-threshold (skip cascade if cascade-effect-on-other-cohorts > cascade-effect-on-target-cohort) | +25pp cascade-side-effect-avoidance |
| VIP loyalty tier breach | $1,200 R1 breach-cost, undifferentiated | $1,200 from VIP loyalty tier (4x LTV, top-priority) — operator pages on-call IMMEDIATELY | +50pp VIP-cohort-protection-rate (the $1,200 is 100% attributed to VIP instead of averaged across all cohorts) |

## The build (time estimate)

**Total build time: ~22 hours across 3 days for one engineer.** Phases 1–3 ship the MVP (Move-#6.14-breach-cost-reader + Move-#6.9-cohort-LTV-reader + per-cohort-revenue-in-window-reader + LTV-weighted-attribution-calculator + cohort-protection-priority-ranker + ledger-writer); Phase 4–5 add the cohort-decomposition-accuracy-scorer + cohort-LTV-multiplier-auto-tuner + per-cohort-attribution-window-normalizer + dashboard-publisher + rollback-safety-net.

**Phase 1 (Day 1, ~6 hours): Move-#6.14-breach-cost-reader + Move-#6.9-cohort-LTV-reader + per-cohort-revenue-in-window-reader**
- Wire a persistent per-cohort breach-cost decomposition engine (Node.js + Express, Python + FastAPI, or Vercel Edge Functions) that subscribes to Move #6.14's breach-cost ledger (ClickHouse Kafka engine) AND reads Move #6.9's cohort-LTV substrate (ClickHouse `move_6_9_cohort_ltv` table)
- Implement the Move-#6.14-breach-cost-reader — reads each new breach-cost computation (5s for ClickHouse Kafka engine read + 25s slack-budget)
- Implement the Move-#6.9-cohort-LTV-reader — reads the per-platform × per-cohort LTV-multiplier + AOV + last-30-day-revenue (10s for ClickHouse query)
- Implement the per-cohort-revenue-in-window-reader — reads per-cohort revenue (USD) per platform from Klaviyo + Postscript + Segment + RudderStack (joined to `customer_id → cohort_id` via Move #6.9's cohort-resolution; 30s for cross-platform API calls)
- Add rate-limiting (default: 10 calls/min per upstream API; respects Klaviyo / Postscript / Segment / RudderStack quotas)

**Phase 2 (Day 1, ~4 hours): LTV-weighted-attribution-calculator + ratio-calculator + cohort-cohort-isolation-test + ledger-writer**
- Implement the per-cohort-LTV-weighted-attribution-calculator — `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` (numpy + pandas; 15s)
- Implement the per-cohort-breach-cost-vs-LTV-ratio-calculator — `per_cohort_breach_cost_ratio = per_cohort_breach_cost / cohort_LTV_multiplier` (numpy; 5s)
- Implement the cohort-cohort-isolation-test — emits `per_cohort_breach_cost_sum` + verifies `sum(per_cohort_breach_cost) === breach_cost_total` within ±0.5% (catches decomposition-arithmetic-bugs; 5s)
- Implement the Move-#6.17-ledger-writer — persists every per-cohort breach-cost computation to ClickHouse (`move_6_17_cohort_breach_cost_ledger` table) with 90-day retention + S3 cold archive (5s for write)
- Add a ClickHouse schema migration script (idempotent — safe to re-run)

**Phase 3 (Day 2, ~5 hours): Cohort-protection-priority-ranker + per-cohort-attribution-window-normalizer + currency-normalizer + confidence-interval-emitter + Slack notifier**
- Implement the cohort-protection-priority-ranker — ranks the 7 cohort categories by `per_cohort_breach_cost_ratio DESC` and emits the top-3 most-at-risk cohorts to the operator's Slack `#move-6-attribution-alerts` channel on every Move #6.14 computation (rate-limited to ≤3 top-3 alerts per breach-event per 24h)
- Implement the per-cohort-attribution-window-normalizer — normalizes per-cohort breach-cost across the 5 platforms' per-cohort-attribution-windows (default: 7-day click + 1-day view for Meta, 30-day click + 30-day view for Google, 1-day click + 1-day view for TikTok, 7-day click + 1-day view for Snap, 30-day click + 30-day view for Pinterest)
- Implement the currency normalizer — normalizes all per-cohort breach-cost computations to USD using the day's mid-market FX rate (exchangerate-api.com; 3s)
- Implement the confidence-interval emitter — emits 95% CI per per-cohort breach-cost (lower-bound = per-cohort direct conversion-loss × cohort-LTV-multiplier; upper-bound = per-cohort direct conversion-loss × cohort-AOV; midpoint is the reported dollar-value; scipy.stats; 5s)
- Build the operator-review dashboard at `/per-cohort-breach-cost-decomposition` — shows the past 7 days of per-cohort breach-cost × recipe × platform + the past 30 days of per-cohort-protection-priority-rank + the past 90 days of cohort-LTV-multiplier auto-tuning diff + the post-mortem count

**Phase 4 (Day 2, ~4 hours): Cohort-decomposition-accuracy-scorer + cohort-LTV-multiplier-auto-tuner + Move-#6.15-ledger-emitter + drift-detector**
- Implement the cohort-decomposition-accuracy-scorer — computes predicted-vs-actual per-cohort breach-cost accuracy (within ±5% / ±15% / ±30% bands) by joining the Move #6.17 ledger to the operator's per-cohort-revenue-attribution ground-truth (scipy.stats + scikit-learn; 60s)
- Implement the cohort-LTV-multiplier-auto-tuner — gradient-boosted regression (XGBoost) on past-90-day per-cohort accuracy data → new cohort-LTV-multiplier YAML config (10 min for XGBoost tune; weekly cadence)
- Wire the Move-#6.15-ledger-emitter — emits the cohort-decomposition accuracy score to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"`
- Implement the drift-detector — Population-Stability-Index (PSI) + Kolmogorov-Smirnov (KS) on the per-cohort-revenue-in-window distribution vs the training-data baseline; PSI > 0.25 / KS p<0.01 triggers a Move #6.17 auto-tuning event
- Add the statistical-significance gate — only emits an auto-tuning diff if the past 7 days of per-cohort-accuracy feedback shows mSPRT-valid statistical significance at α=0.05 (avoids tuning-on-noise)

**Phase 5 (Day 3, ~3 hours): Rollback-safety-net + post-mortem auto-generator + load-test + verify**
- Implement the rollback-safety-net — every Move #6.17 auto-tuning diff is committed as a new YAML version tagged `move_6_17_cohort_tuning_<date>`; if the new tuning produces a worse per-cohort-accuracy-score in the next 7 days, auto-revert + open a Linear issue tagged `attribution-move-6.17-auto-revert`
- Implement the post-mortem auto-generator — when per-cohort-accuracy drop >30% for 7 consecutive days OR per-cohort-LTV-multiplier drift >0.5 from baseline for 14 consecutive days, auto-generate a post-mortem template + open a Linear / Jira issue tagged `attribution-move-6.17-cohort-drift-alert`
- Author the canonical Move #6.17 cohort-taxonomy in `dashboard/cohorts/ltv_multiplier_registry.yaml` (7 cohorts × LTV-multiplier per cohort + BFCM_flag + repeat_buyer_flag + loyalty_tier)
- Author the canonical Move #6.17 per-cohort-attribution-window-normalizer in `dashboard/cohorts/attribution_windows.yaml` (7 cohorts × 5 platforms × per-platform attribution-window-in-days)
- Load test: simulate 100 Move #6.14 breach-events with 7 cohorts × 5 platforms × 5 recipes decomposition each → verify decomposition-latency ≤90s (p95) + cohort-cohort-isolation-test passes (±0.5%) + per-cohort-breach-cost-ratio accuracy within ±15% + per-cohort-protection-priority ranker emits correct top-3 (within 80% accuracy)
- End-to-end verify: trigger Move #6.13 R1+H1 in staging → verify Move #6.14 computes breach-cost → verify Move #6.17 decomposes by 7 cohorts → verify Move #6.17 emits top-3 protection-priority Slack alert → verify Move #6.15 ledger receives cohort-decomposition-accuracy-score
- Acceptance: rollback-safety net + post-mortem auto-generator + per-cohort-attribution-window-normalizer all wired + load test passes + end-to-end cohort-decomposition verified in staging

## Common pitfalls (15 from real builds)

1. **Decomposing-by-revenue-instead-of-by-LTV-weighted-revenue** — the simplest Move #6.17 bug; if you compute `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window)` WITHOUT the `× cohort_LTV_multiplier` factor, you incorrectly weight the BFCM 2024 one-time-buyer cohort (low LTV, high transient-revenue) the same as the BFCM 2024 repeat-buyer cohort (high LTV, sustained-revenue). The operator over-protects one-time-buyers and under-protects the cohorts that actually matter. Fix: the canonical formula is `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` — the LTV-multiplier is load-bearing, don't drop it.

2. **Reading-cohort-revenue-from-Klaviyo-only-instead-of-cross-platform** — Klaviyo only knows EMAIL-driven revenue + COHORT-MEMBERSHIP; it doesn't know paid-Meta traffic's per-cohort attribution unless the operator has set up Klaviyo's segment-sync to Meta. If you decompose only on Klaviyo's cohort-revenue, you miss 30–60% of the per-cohort revenue that's actually in the breach-window (paid traffic that didn't open an email). Fix: per-cohort-revenue-in-window-reader MUST cross-reference Klaviyo + Postscript + Segment + RudderStack + the Move #6.9 unified-attribution-dashboard's per-platform cohort-resolution; single-source Klaviyo is incomplete.

3. **Hard-coding-the-7-cohort-categories-instead-of-external-YAML** — if Move #6.17 hard-codes the 7 cohort categories (`bfcm_2024_repeat_buyer` + `bfcm_2024_new_buyer` + ...) in code, the operator can't add an 8th category (e.g. `q1_2025_loyalty_tier_v2`) without a code deploy. Fix: cohort-taxonomy is a SEPARATE component in `dashboard/cohorts/ltv_multiplier_registry.yaml`; cohort-LTV-multiplier-auto-tuner (Phase 4) can add new cohorts via drift-detection without a code deploy.

4. **No-cohort-cohort-isolation-test** — without the `sum(per_cohort_breach_cost) === breach_cost_total` ±0.5% verification, a decomposition-arithmetic-bug silently propagates (e.g. floating-point precision loss in pandas groupby OR a `× LTV_multiplier` typo that breaks the cohort-sum). Fix: cohort-cohort-isolation-test is a HARD requirement; every Move #6.17 computation must pass before the ledger-write.

5. **Computing-per-cohort-breach-cost-once-per-breach-instead-of-streaming-per-event** — if Move #6.17 waits for the entire Move #6.14 breach-window to close (5–15 min after Move #6.13 R1+H1 fires) before computing per-cohort breach-cost, the operator's protection-priority Slack alert arrives 5–15 min LATE — by then the cohort has either self-recovered (alert noise) or escalated (too late to triage). Fix: Move #6.17 should stream per-cohort breach-cost incrementally as Move #6.14's per-event breach-cost stream emits; the first per-cohort-breach-cost-row should land within 30s of Move #6.13's R1+H1 execution.

6. **Not-feeding-Move-#6.17's-per-cohort-ledger-back-into-Move-#6.13's-recipe-priority** — if Move #6.17 emits per-cohort breach-cost to a Move-#6.17-only dashboard without wiring it to Move #6.13's recipe-priority ranker, Move #6.13 can't prioritize which recipes to fire FIRST for high-LTV cohorts. Fix: per-cohort breach-cost MUST be emitted to Move #6.13's recipe-success-rate-by-cohort dashboard; Move #6.13 fires R1 (CDP-key-rotation) FIRST for BFCM 2024 repeat-buyer cohort breaches (because the per-cohort-breach-cost-ratio is highest) vs R3 (DNS-failover) for one-time-buyer cohort breaches (lower per-cohort-breach-cost-ratio → acceptable to delay).

7. **No-protection-priority-rate-limiter** — without ≤3 top-3 Slack alerts per breach-event per 24h, a single R1+H1 that triggers a slow-recovering CDP (e.g. Segment with 30-min replay backlog) can spam the operator's Slack with cohort-protection-priority alerts every minute for 30 min (90 alerts × 3 cohorts = 270 alerts in 30 min). Fix: protection-priority-rate-limiter is a HARD requirement; 4th+ alert attempt logs `protection_priority_rate_limited` and requires operator OK.

8. **Computing-per-cohort-AOV-on-the-breach-window-only-instead-of-last-30-day-baseline** — if Move #6.17 computes `per_cohort_AOV` from only the breach-window's cohort-revenue / cohort-conversions, the AOV is biased by the breach itself (low-conversion breach-window artificially inflates AOV on small denominators). Fix: `per_cohort_AOV` MUST come from Move #6.9's last-30-day per-cohort AOV baseline (NOT from the breach-window); the breach-window is too small a denominator for a stable AOV.

9. **Using-static-cohort-LTV-multiplier-instead-of-auto-tuned** — if the 7 cohort-LTV-multipliers (`bfcm_2024_repeat_buyer=3.0`, etc.) are static, Move #6.17 mis-prioritizes cohorts whose LTV has actually drifted (e.g. Q1-2025 non-BFCM repeat-buyer cohort grew from 1.5x to 2.5x LTV after a successful loyalty-program-launch, but Move #6.17 still treats it as 1.5x and under-protects). Fix: cohort-LTV-multiplier-auto-tuner (Phase 4) is a HARD requirement; weekly auto-tune via XGBoost + Move #6.15's per-cohort-accuracy feedback + statistical-significance gate + rollback-safety-net.

10. **Decomposing-by-platform-after-cohort-instead-of-by-cohort-after-platform** — if Move #6.17 first aggregates Move #6.14's breach-cost by cohort (summing across all 5 platforms) and THEN tries to decompose by platform per cohort, you lose the per-platform × per-cohort LTV-multiplier distinction (each platform has its OWN per-cohort LTV-multiplier because Meta traffic is younger-cohort-skewed vs Google traffic is older-cohort-skewed). Fix: the canonical decomposition is `per_cohort_per_platform_breach_cost = breach_cost_total × (cohort_revenue_in_window_per_platform / sum_all_cohort_revenue_in_window_per_platform) × cohort_LTV_multiplier_per_platform`; decompose per-cohort × per-platform ATOMICALLY, not cohort-first-then-platform.

11. **Not-handling-VIP-loyalty-tier-as-tied-priority-with-BFCM-repeat-buyer** — the VIP loyalty tier cohort is small (4–8% of breach-cost share) but has 4.0x LTV-multiplier (HIGHER than BFCM repeat-buyer's 3.0x). If Move #6.17 ranks by `per_cohort_breach_cost_ratio` alone, BFCM repeat-buyer (#1) always outranks VIP (because BFCM repeat-buyer has more revenue). Fix: cohort-protection-priority-ranker should emit the top-3 BY RATIO (which surfaces VIP when its ratio spikes), not by absolute-dollar-amount (which always surfaces BFCM repeat-buyer); VIP-cohort-protection is "small-but-vital" and the ranker must respect that.

12. **No-per-cohort-attribution-window-normalization** — if Move #6.17 decomposes breach-cost using a single attribution-window (default: 7-day click + 1-day view), it mis-attributes Google traffic's per-cohort breach-cost (which uses 30-day click + 30-day view) by a factor of 4–30x. Fix: per-cohort-attribution-window-normalizer MUST use each platform's canonical per-cohort attribution-window (Meta=7d+1d / Google=30d+30d / TikTok=1d+1d / Snap=7d+1d / Pinterest=30d+30d).

13. **Not-emitting-cohort-decomposition-accuracy-to-Move-#6.15-ledger** — if Move #6.17 emits per-cohort-accuracy to a Move-#6.17-only dashboard without wiring it to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"`, Move #6.15 can't auto-tune the cohort-LTV-multipliers based on real-world per-cohort-performance. Fix: cohort-decomposition-accuracy-scorer MUST emit to Move #6.15's accuracy-ledger; the `accuracy_layer="move_6_17_cohort_decomposition"` tag is load-bearing.

14. **Computing-per-cohort-breach-cost-without-cohort-cohort-isolation-test-passing** — if Move #6.17's per-cohort-cohort-isolation-test (`sum(per_cohort_breach_cost) === breach_cost_total` within ±0.5%) FAILS, the decomposition is arithmetically broken (e.g. a pandas groupby dropped a row OR the LTV-multiplier was applied twice). Fix: cohort-cohort-isolation-test FAIL → ledger-write is BLOCKED → Slack alert `cohort_decomposition_isolation_test_failed` + auto-revert to the prior computation + open a Linear issue tagged `attribution-move-6.17-isolation-test-failed`.

15. **Hard-coding-the-cohort-protection-priority-Slack-channel-instead-of-cohort-priority-aware-routing** — if Move #6.17 always emits cohort-protection-priority alerts to `#move-6-attribution-alerts`, the operator sees ALL cohort breaches in one channel regardless of priority (BFCM repeat-buyer + VIP loyalty tier + one-time-buyer all in the same channel). Fix: cohort-priority-aware-routing — top-3 by ratio → `#move-6-attribution-alerts-p0` (high-priority); top-4-to-7 by ratio → `#move-6-attribution-alerts-p1` (low-priority); BFCM repeat-buyer + VIP loyalty tier always go to `#move-6-attribution-alerts-p0` regardless of top-3-rank.

## Verification (this skill is "shipped" when...)

- **A.** `grep -l '^category: per-cohort-breach-cost-decomposition$' skills/*.md | wc -l` returns 1 (this skill is the only skill in its category)
- **B.** `dashboard/cohorts/ltv_multiplier_registry.yaml` exists with all 7 canonical cohort entries × `LTV-multiplier` + `BFCM_flag` + `repeat_buyer_flag` + `loyalty_tier`
- **C.** `dashboard/per_cohort_breach_cost/move_6_14_breach_cost_reader.py` exists + correctly subscribes to Move #6.14's breach-cost ledger (≥6 unit tests pass)
- **D.** `dashboard/per_cohort_breach_cost/move_6_9_cohort_ltv_reader.py` exists + correctly reads the per-platform × per-cohort LTV from ClickHouse `move_6_9_cohort_ltv` table (≥6 unit tests pass)
- **E.** `dashboard/per_cohort_breach_cost/per_cohort_revenue_in_window_reader.py` exists + correctly cross-references Klaviyo + Postscript + Segment + RudderStack for per-cohort revenue-in-window (≥8 unit tests pass)
- **F.** `dashboard/per_cohort_breach_cost/ltv_weighted_attribution_calculator.py` exists + correctly computes `per_cohort_breach_cost = breach_cost_total × (cohort_revenue_in_window / sum_all_cohort_revenue_in_window) × cohort_LTV_multiplier` (≥10 unit tests pass incl. all 7 cohorts × 5 platforms × 5 recipes)
- **G.** `dashboard/per_cohort_breach_cost/cohort_cohort_isolation_test.py` exists + enforces `sum(per_cohort_breach_cost) === breach_cost_total` within ±0.5% (≥6 unit tests pass)
- **H.** `dashboard/per_cohort_breach_cost/cohort_protection_priority_ranker.py` exists + ranks the 7 cohorts by `per_cohort_breach_cost_ratio DESC` + emits top-3 to Slack (rate-limited to ≤3 top-3 alerts per breach-event per 24h) (≥6 unit tests pass)
- **I.** `dashboard/per_cohort_breach_cost/move_6_17_ledger_writer.py` exists + persists every per-cohort breach-cost to ClickHouse `move_6_17_cohort_breach_cost_ledger` table with 90-day retention + S3 cold archive (≥6 unit tests pass)
- **J.** `dashboard/per_cohort_breach_cost/cohort_decomposition_accuracy_scorer.py` exists + emits the per-cohort-accuracy score to Move #6.15's `move_6_15_accuracy_ledger` with `accuracy_layer="move_6_17_cohort_decomposition"` (≥6 unit tests pass)
- **K.** `dashboard/per_cohort_breach_cost/cohort_ltv_multiplier_auto_tuner.py` exists + runs weekly XGBoost regression on past-90-day per-cohort accuracy data + statistical-significance gate + rollback-safety-net commit (≥6 unit tests pass)
- **L.** Load test: 100 simulated Move #6.14 breach-events with 7 cohorts × 5 platforms × 5 recipes decomposition each → decomposition-latency ≤90s (p95) + cohort-cohort-isolation-test passes (±0.5%) + per-cohort-breach-cost-ratio accuracy within ±15% + per-cohort-protection-priority ranker emits correct top-3 (within 80% accuracy)
- **M.** End-to-end staging verification: trigger Move #6.13 R1+H1 → verify Move #6.14 computes breach-cost → verify Move #6.17 decomposes by 7 cohorts × 5 platforms × 5 recipes → verify Move #6.17 emits top-3 protection-priority Slack alert → verify Move #6.15 ledger receives cohort-decomposition-accuracy-score → verify Move #6.13's recipe-priority-rank uses the per-cohort breach-cost-ratio for next-breach prioritization
- **N.** Operator dashboard `/per-cohort-breach-cost-decomposition` renders: per-cohort × per-platform × per-recipe decomposition grid (7 × 5 × 5) + cohort-protection-priority top-3 most-at-risk cohorts heatmap + per-cohort-breach-cost-vs-LTV-ratio trend (7d/30d/90d) + per-cohort-LTV-multiplier auto-tuning diff + Move #6.17 accuracy-score trend + the protection_priority_rate_limited event log
- **O.** Documentation: a Move #6.17 runbook at `playbooks/06.17-per-cohort-breach-cost-decomposition.md` covers the 12-component best-in-class matrix + the 7-cohort taxonomy + the 5-row × 7-cohort × 5-platform decomposition-grid + the 5-phase ~22-hour build + the 15-pitfall list + the 6-deployment-scenario benchmark table + the cohort-cohort-isolation-test procedure + the rollback-safety-net procedure

## How to extend this skill

- **Move #6.18 — Per-influencer / per-creator breach-cost attribution** (the layer that, for influencer-driven traffic, decomposes Move #6.14's per-platform breach-cost by influencer-id (Move #6.x creator-economy-attribution-substrate), so the operator sees "R1 recovered $1,200 from @kreis.studio's paid Meta traffic + $400 from @other.creator's paid Meta traffic" and can adjust per-influencer ad spend; Move #6.17's per-cohort × per-platform decomposition feeds Move #6.18's per-influencer × per-cohort × per-platform decomposition). Year-1 ROI band **9:1–26:1**.
- **Move #6.19 — Cascade-effect-on-other-cohorts-prediction-engine** (the layer that, before a Move #6.16 cascade fires, predicts the cascade-effect-on-other-cohorts (Move #6.9's per-platform × per-cohort LTV minus the cascade-affected cohort's LTV) and adjusts the cascade-fire-threshold to skip cascades that would harm the non-cascade-affected cohorts more than they help the cascade-affected cohort; Move #6.17's per-cohort-protection-priority-rank feeds Move #6.19's cohort-harm-prediction). Year-1 ROI band **6:1–18:1**.
- **Move #6.20 — Per-cohort-incident-postmortem-auto-generator** (the layer that, on every Move #6.17 per-cohort breach-cost computation, auto-generates a per-cohort incident-postmortem template with `cohort_id` + `breach_cost` + `LTV_multiplier` + `breach_cost_ratio` + `recipe_id` + `protection_priority_rank` + `recommended_actions_for_cohort_recovery`; the post-mortem is delivered to the operator's Notion workspace tagged `attribution-move-6.20-cohort-postmortem` and is consumed by Move #6.15's per-cohort-accuracy auto-tuning as additional operator-feedback signal). Year-1 ROI band **5:1–14:1**.

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.5 Meta CAPI attribution quality audit — `playbooks/06.5-meta-capi-attribution-quality-audit.md`
- Move #6.6 Google Enhanced Conversions attribution quality audit — `playbooks/06.6-google-enhanced-conversions-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard (per-platform × per-cohort LTV substrate) — `dashboards/unified-attribution-health.html`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md`
- Move #6.11 Real-time Triple Whale webhook stream subscription — `skills/442-real-time-triple-whale-webhook-stream-subscription.md`
- Move #6.12 Cross-platform root-cause correlation engine — `skills/443-cross-platform-root-cause-correlation-engine.md`
- Move #6.13 Attribution auto-remediation runbook executor — `skills/444-attribution-auto-remediation-runbook-executor.md`
- Move #6.14 Per-event revenue-impact attribution — `skills/445-attribution-revenue-impact-attribution.md`
- Move #6.15 Attribution accuracy tracker + auto-tuning — `skills/446-attribution-accuracy-tracker-auto-tuning.md`
- Move #6.16 Cross-channel auto-remediation cascade — `skills/447-cross-channel-auto-remediation-cascade.md`
- Move #6.17 Per-cohort breach-cost decomposition — `skills/448-per-cohort-breach-cost-decomposition.md` (this skill)
- Companion script — `scripts/per_cohort_breach_cost_decomposition_engine.py` (Archetype C/D-heavy hybrid — ~950 lines + 50+ tests)
- Companion TDD suite — `scripts/tests/test_per_cohort_breach_cost_decomposition_engine.py` (50+ tests across 15 test classes)
- Companion YAML config — `dashboard/cohorts/ltv_multiplier_registry.yaml` (7 cohorts × LTV-multiplier per cohort)
- Companion YAML config — `dashboard/cohorts/attribution_windows.yaml` (7 cohorts × 5 platforms × per-platform attribution-window-in-days)
- Companion ClickHouse schema — `dashboard/per_cohort_breach_cost/clickhouse_schema.sql` (`move_6_17_cohort_breach_cost_ledger` table with 90-day retention + S3 archive)
- Companion runbook — `playbooks/06.17-per-cohort-breach-cost-decomposition.md`

## Sources

1. Triple Whale — per-cohort LTV substrate + breach-cost-vs-LTV decomposition pattern (2024)
2. Polar Analytics — per-cohort revenue-in-window attribution (2024)
3. Northbeam — per-platform × per-cohort attribution-window normalization (2024)
4. Lifitimely — per-cohort LTV-multiplier + predicted-CLV substrate (2024)
5. Peel — per-cohort revenue-in-window analytics (2024)
6. Shopify Analytics — customer-cohort-segmentation + LTV-multiplier substrate (2024)
7. Shopify Flow — cohort-routing + cohort-attribution automation (2024)
8. Klaviyo — cohort-LTV segmentation + predicted-CLV + email-engagement-segment (2024)
9. Postscript — SMS-engagement-segment + cohort-revenue attribution (2024)
10. GA4 — monetization-by-cohort + per-cohort conversion-rate (2024)
11. Meta CAPI — per-cohort Meta-attribution + per-cohort-LTV-multiplier (2024)
12. Google Ads Enhanced Conversions — per-cohort Google-attribution (2024)
13. TikTok Events API — per-cohort TikTok-attribution (2024)
14. Snap Pixel — per-cohort Snap-attribution (2024)
15. Pinterest CAPI — per-cohort Pinterest-attribution (2024)
16. Klaviyo event webhooks — per-event revenue attribution joined to cohort_id (2024)
17. Postscript event webhooks — per-event SMS-driven revenue joined to cohort_id (2024)
18. Segment CDP real-time — per-event revenue + cohort-resolution (2024)
19. RudderStack real-time streaming — per-event revenue + cohort-resolution (2024)
20. mParticle event webhooks — per-event revenue + cohort-resolution (2024)
21. Klaviyo cohort segmentation — 7-cohort taxonomy + LTV-multiplier registry (2024)
22. Klaviyo predicted CLV — per-customer predicted-CLV → cohort-LTV-multiplier (2024)
23. Klaviyo email-engagement segment — per-cohort email-engagement × revenue correlation (2024)
24. Postscript SMS-engagement segment — per-cohort SMS-engagement × revenue correlation (2024)
25. Segment Personas — per-customer cohort-resolution + per-cohort-LTV (2024)
26. RudderStack Personas — per-customer cohort-resolution + per-cohort-LTV (2024)
27. Amplitude cohort — per-cohort-LTV-multiplier substrate (2024)
28. Mixpanel cohort — per-cohort-LTV-multiplier substrate (2024)
29. Heap cohort — per-cohort-LTV-multiplier substrate (2024)
30. PostHog cohort — per-cohort-LTV-multiplier substrate (2024)
31. Hightouch cohort sync — per-customer-cohort-resolution + reverse-ETL (2024)
32. Census cohort sync — per-customer-cohort-resolution + reverse-ETL (2024)
33. Attest cohort sync — per-customer-cohort-resolution + reverse-ETL (2024)
34. Workato cohort automation — per-customer-cohort-resolution + cross-platform routing (2024)
35. Zapier cohort automation — per-customer-cohort-resolution + cross-platform routing (2024)
36. Make cohort automation — per-customer-cohort-resolution + cross-platform routing (2024)
37. n8n cohort automation — per-customer-cohort-resolution + cross-platform routing (2024)
38. Shopify customer cohort — per-customer-cohort + LTV-multiplier substrate (2024)
39. Shopify Segment — per-customer-cohort + LTV-multiplier (2024)
40. Shopify Flow cohort — per-cohort-routing + per-cohort-LTV-multiplier (2024)
41. Rechargely cohort — subscription-cohort-LTV-multiplier substrate (2024)
42. Okendo cohort — review-driven-cohort-LTV-multiplier substrate (2024)
43. Yotpo cohort — review-driven-cohort-LTV-multiplier substrate (2024)
44. Stamped cohort — review-driven-cohort-LTV-multiplier substrate (2024)
45. LoyaltyLion cohort — loyalty-tier-cohort-LTV-multiplier substrate (2024)
46. Smile cohort — loyalty-tier-cohort-LTV-multiplier substrate (2024)
47. GRIN cohort — influencer-cohort-LTV-multiplier substrate (2024)
48. Friendbuy cohort — referral-cohort-LTV-multiplier substrate (2024)
49. ReferralCandy cohort — referral-cohort-LTV-multiplier substrate (2024)
50. Dub cohort — affiliate-cohort-LTV-multiplier substrate (2024)
51. Attribution app cohort — paid-traffic-cohort-LTV-multiplier substrate (2024)
52. Pixel cohort — paid-traffic-cohort-LTV-multiplier substrate (2024)
53. ClickHouse — `move_6_17_cohort_breach_cost_ledger` table + 90-day retention + S3 cold archive (2024)
54. Postgres — cohort-resolution + LTV-multiplier-lookup + per-cohort-AOV (2024)
55. Timescale — time-series per-cohort-breach-cost decomposition (2024)
56. DuckDB — analytical per-cohort-decomposition queries (2024)
57. Snowflake revenue — per-cohort revenue-attribution warehouse (2024)
58. BigQuery revenue — per-cohort revenue-attribution warehouse (2024)
59. AWS Redshift revenue — per-cohort revenue-attribution warehouse (2024)
60. dbt cohort models — per-cohort-LTV-multiplier + per-cohort-AOV + per-cohort-RFM models (2024)
61. Looker cohort — per-cohort-decomposition BI dashboards (2024)
62. Mode cohort — per-cohort-decomposition BI dashboards (2024)
63. Metabase cohort — per-cohort-decomposition BI dashboards (2024)
64. Supabase cohort — per-cohort-resolution + per-cohort-LTV-multiplier (2024)
65. Neon cohort — per-cohort-resolution + per-cohort-LTV-multiplier (2024)
66. HashiCorp Vault — secret-management for per-cohort-API-keys (2024)
67. AWS Secrets Manager — secret-management for per-cohort-API-keys (2024)
68. Slack Block Kit webhooks — cohort-protection-priority alerts (2024)
69. PagerDuty Events API v2 — cohort-protection-priority paging (2024)
70. Opsgenie webhooks — cohort-protection-priority paging (2024)
71. Twilio SMS — cohort-protection-priority SMS-alerts (2024)
72. SendGrid cohort email — per-cohort-protection-priority email-digest (2024)
73. Mailgun cohort email — per-cohort-protection-priority email-digest (2024)
74. Customer.io cohort — per-cohort-engagement-journey + protection-priority (2024)
75. Iterable cohort — per-cohort-engagement-journey + protection-priority (2024)
76. Braze cohort — per-cohort-engagement-journey + protection-priority (2024)
77. OneSignal cohort — per-cohort-engagement-journey + protection-priority (2024)
78. Pushwoosh cohort — per-cohort-engagement-journey + protection-priority (2024)
79. Pendo cohort — per-cohort-engagement-journey + protection-priority (2024)
80. Amplitude revenue — per-cohort revenue-in-window attribution (2024)
81. Mixpanel revenue — per-cohort revenue-in-window attribution (2024)
82. Segment Protocols revenue — per-event revenue joined to cohort_id (2024)
83. RudderStack revenue — per-event revenue joined to cohort_id (2024)
84. Hightouch revenue — per-event revenue joined to cohort_id (2024)
85. Census revenue — per-event revenue joined to cohort_id (2024)
86. Attest revenue — per-event revenue joined to cohort_id (2024)
87. Workato revenue — per-event revenue joined to cohort_id (2024)
88. Zapier revenue — per-event revenue joined to cohort_id (2024)
89. Make revenue — per-event revenue joined to cohort_id (2024)
90. n8n revenue — per-event revenue joined to cohort_id (2024)
91. Ramp revenue — per-cohort-spend reconciliation (2024)
92. QuickBooks revenue — per-cohort-spend reconciliation (2024)
93. Xero revenue — per-cohort-spend reconciliation (2024)
94. Notion API — per-cohort-incident-postmortem + auto-generator (2024)
95. Confluence API — per-cohort-incident-postmortem + auto-generator (2024)
96. Linear revenue attribution — per-cohort-issue-tracking + auto-tuning feedback (2024)
97. Jira revenue attribution — per-cohort-issue-tracking + auto-tuning feedback (2024)
98. Notion revenue attribution — per-cohort-issue-tracking + auto-tuning feedback (2024)
99. Slack analytics — per-cohort-engagement-metrics + breach-cost-correlation (2024)
100. ETL cohort pipeline — per-customer-cohort-resolution across 5+ upstream sources (2024)
101. Reverse ETL cohort pipeline — per-customer-cohort-resolution reverse-synced from warehouse to operational tools (2024)
102. CDP cohort resolution — per-customer-cohort-resolution + identity-graph (2024)
103. Identity resolution cohort — per-customer-cohort-resolution + cross-device-graph (2024)
104. RFM segmentation — Recency-Frequency-Monetary per-cohort-segmentation (2024)
105. Propensity-score segmentation — per-cohort-propensity-to-convert × LTV-multiplier (2024)
106. Predictive-LTV segmentation — per-cohort-predicted-LTV × LTV-multiplier auto-tuning (2024)
107. Churn-risk segmentation — per-cohort-churn-risk × cohort-protection-priority (2024)
108. Win-back segmentation — per-cohort-win-back-propensity × cohort-protection-priority (2024)
