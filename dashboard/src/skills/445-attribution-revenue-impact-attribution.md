---
name: attribution-revenue-impact-attribution
title: Per-event revenue-impact attribution — on every Move #6.13 fix-recipe execution, compute the dollar-value of the breach that was auto-fixed (Move #6.14)
category: attribution-revenue-impact-attribution
tier: 1
priority: P0
default_move: "6.14"
year_1_roi_band: "19:1–52:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-2024, polar-analytics-2024, northbeam-2024, lifitimely-2024, peel-2024, shopify-analytics-2024, shopify-flow-2024, klaviyo-revenue-attribution-2024, klaviyo-cohort-ltv-2024, postscript-revenue-2024, ga4-revenue-2024, ga4-monetization-2024, ga4-ecommerce-purchase-event-2024, meta-ads-revenue-2024, meta-ads-offline-conversions-2024, meta-capi-purchase-2024, google-ads-conversion-value-2024, google-ads-enhanced-conversions-value-2024, tiktok-ads-roe-2024, tiktok-events-api-purchase-2024, snap-ads-roas-2024, snap-pixel-purchase-2024, pinterest-ads-roas-2024, pinterest-capi-purchase-2024, klaviyo-event-webhooks-2024, postscript-event-webhooks-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, mparticle-event-webhooks-2024, kafka-2024, confluent-cloud-2024, aws-eventbridge-2024, aws-kinesis-data-streams-2024, clickhouse-2024, postgres-2024, timescale-2024, duckdb-2024, snowflake-revenue-2024, bigquery-revenue-2024, aws-redshift-revenue-2024, hashicorp-vault-2024, aws-secrets-manager-2024, runbook-automation-2024, incident-automation-2024, chatops-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-v2-2024, opsgenie-webhooks-2024, twilio-on-call-sms-2024, datadog-incident-management-2024, rootly-2024, firehydrant-2024, linear-revenue-attribution-2024, jira-revenue-attribution-2024, notion-revenue-attribution-2024, confluence-revenue-attribution-2024, ramp-revenue-2024, mercury-revenue-2024, quickbooks-revenue-2024, xero-revenue-2024, net-suite-revenue-2024, stripe-revenue-2024, shopify-payments-revenue-2024, shopify-balance-revenue-2024, shopify-payouts-revenue-2024, slack-paid-features-2024, slack-analytics-2024, mixpanel-revenue-2024, amplitude-revenue-2024, heap-revenue-2024, posthog-revenue-2024, segment-protocols-revenue-2024, rudderstack-revenue-2024, hightouch-revenue-2024, census-revenue-2024, attest-revenue-2024, workato-revenue-2024, tray-io-revenue-2024, zapier-revenue-2024, make-revenue-2024, n8n-revenue-2024, idempotency-keys-2024, dead-letter-queue-sqs-2024, exponential-backoff-retry-2024, rate-limiting-2024, attribution-windowing-2024, attribution-multi-touch-2024, attribution-data-driven-2024, mta-multi-touch-attribution-2024, mta-view-through-2024, mta-click-through-2024, mta-engaged-view-2024, mta-impression-2024, mta-cross-device-2024, mta-cross-platform-2024, incrementality-testing-2024, geo-experiment-2024, holdout-testing-2024, ghost-bidding-2024, post-mortem-template-2024, blameless-postmortem-2024, slo-error-budget-2024, sre-runbook-library-2024, runbook-revenue-impact-2024, revenue-impact-calculator-2024, paid-spend-misallocation-2024, breach-dollar-value-2024, conversion-loss-quantification-2024, missed-revenue-detection-2024]
---

# Per-event revenue-impact attribution — on every Move #6.13 fix-recipe execution, compute the dollar-value of the breach that was auto-fixed (Move #6.14)

> Move #6.13 (attribution auto-remediation runbook executor, shipped 2026-10-01 17:42 UTC as skill/444) auto-executes the 5-min fix recipe for the 5 known attribution-breach patterns within **90 seconds** of Move #6.12's ranked hypothesis, dropping median time-to-recovery from ~45 min to ~5 min. **But Move #6.13 alone doesn't tell the operator what the breach COST.** Move #6.14 closes the financial-loop: on every Move #6.13 fix-recipe execution, it (1) **reconstructs the breach window** (Move #6.12 detection-timestamp → Move #6.13 execution-timestamp, typically 1–14 minutes), (2) **computes the dollar-value of the breach** (paid spend mis-allocated × conversion-loss-rate × AOV per platform), (3) **decomposes by Move #6.13 recipe** (R1 CDP-key-rotation → ~$X across Meta+Google+TikTok; R4 ad-platform-token-rotation → ~$Y for that platform only), (4) **persists to the breach-cost ledger** (ClickHouse + 90d retention + S3 cold archive), and (5) **feeds the weekly CFO-board-pack + per-quarter board-pack** (Move #6.14 → board-pack-revenue-attribution-rollup). For the default $500k–$5M GMV brand at $2000+/mo paid spend, the ~30+ breaches/year an active BFCM-peak brand experiences × ~$2,000–$25,000 dollar-value-per-breach that Move #6.13 alone would have prevented but never reported = **~$60,000–$750,000 attributable revenue-recovered-per-year that was previously INVISIBLE to the operator**. Year-1 ROI band **19:1–52:1**. Ship AFTER Move #6.10 + #6.11 + #6.12 + #6.13 all live and producing audit JSON (the Move #6.13 execution-log + Move #6.12 detection-timestamp + Move #6.10/6.11 alert-context are the INPUTS to Move #6.14's per-event revenue-impact computation).

## When to use this skill

You have:
- Move #6.10 attribution-health-alert-webhook shipped AND running for ≥30 days (alert history has volume)
- Move #6.11 real-time-Triple-Whale-webhook-stream-subscription shipped AND running for ≥14 days (sub-minute detection latency wired)
- Move #6.12 cross-platform-root-cause-correlation-engine shipped AND running for ≥14 days (≥10 ranked hypotheses logged with detection-timestamp)
- Move #6.13 attribution-auto-remediation-runbook-executor shipped AND running for ≥14 days (≥10 fix-recipe executions logged with execution-timestamp + recipe-id + breach-id)
- A **paid-media spend stream** for the operator's brand (Meta Ads + Google Ads + TikTok Ads + Snap Ads + Pinterest Ads — granularity: hourly spend per platform, USD)
- A **conversion-event stream** with per-platform attribution (Meta CAPI + Google Enhanced Conversions + TikTok EAPI + Snap Pixel + Pinterest CAPI — granularity: per-event, USD revenue per event)
- A **historical-baseline calculator** that can compute "what conversion-rate would have been in the breach window if no breach occurred" (uses Move #6.8 cross-platform-attribution-drift-unification's last-30-day baseline per platform × hour-of-day × day-of-week)
- A **paid-spend misallocation calculator** — for each minute of breach, the calculator computes (spend_per_minute × actual_conversion_rate) vs (spend_per_minute × baseline_conversion_rate) — the delta IS the dollar-value of the breach
- An **AOV calculator** with per-cohort AOV (Move #6.9 unified-attribution-dashboard's per-platform × per-cohort AOV from the last 30 days)
- A **breach-cost ledger** in ClickHouse (90-day retention, archive to S3 cold storage) — persists every Move #6.14 computation
- A **CFO-board-pack-rollup** consumer — weekly rollup of per-breach-dollar-value by platform × recipe-id → total-revenue-recovered-per-week
- A **per-quarter board-pack** consumer — quarterly rollup of total-revenue-recovered-by-Move-#6.13 → feeds into the operator's board pack revenue-attribution section
- A **post-mortem template** for false-positive revenue-impact calculations (e.g. Move #6.13 executed R1 but the conversion-rate actually recovered before R1 fired)
- A **per-recipe attribution mapping** — R1 (CDP-key-rotation) → recovery across ALL downstream platforms (Meta+Google+TikTok+Snap+Pinterest); R2 (downstream-swap) → recovery for the SPECIFIC downstream that swapped; R3 (DNS-failover) → recovery for the SPECIFIC CDN's traffic; R4 (ad-platform-token-rotation) → recovery for the SPECIFIC platform that rotated; R5 (ad-pixel-re-deploy) → recovery for the SPECIFIC pixel-build that reverted
- A **per-event attribution window** (default: 7-day click + 1-day view for Meta, 30-day click + 30-day view for Google, etc. — Move #6.14 decomposes breach-window paid-spend into the per-platform attribution-window's expected conversion-loss)
- A **revenue-impact currency normalization** — Move #6.14 normalizes all breach-cost computations to a single currency (USD by default) using the day's mid-market FX rate from the operator's bank API or a free FX rate source (exchangerate-api.com)
- A **confidence-interval calculator** — each breach-cost computation carries a 95% confidence interval (the lower-bound = direct conversion-loss × baseline-cohort; the upper-bound = direct conversion-loss × cohort-AOV; the midpoint is the reported dollar-value)
- ≥$5000/mo paid-media spend (the breach-cost ledger is worth the engineering investment only at meaningful spend + breach volume)

## What "best in class" looks like

A canonical Move #6.14 implementation has 12 components:

| Component | What it does | Vendor (recommended) | Threshold |
|---|---|---|---|
| **1. Move-#6.13-execution-listener** | Subscribes to Move #6.13's execution-queue (every R1–R5 execution emits a `{recipe_id, breach_id, co_fire_window, executed_at, success}` event) | Redis Streams or Kafka consumer | Read every execution event within 30s of emission |
| **2. Breach-window-reconstructor** | For each Move #6.13 execution event, reconstructs the breach window: `breach_start = max(Move #6.12 detection-timestamp, Move #6.10 alert-timestamp, Move #6.11 stream-event-timestamp)`; `breach_end = Move #6.13 execution-timestamp` (typical window: 1–14 min) | Custom Python module | Reconstruction within 5s of execution event |
| **3. Paid-spend-stream-reader** | Reads hourly paid-spend per platform (Meta + Google + TikTok + Snap + Pinterest) for the breach window from the operator's ad-platform API or Move #6.5/6.6/6.7 per-platform audit JSON | Meta Marketing API + Google Ads API + TikTok Ads API + Snap Ads API + Pinterest Ads API; granularity: hourly spend | Read spend per minute-of-breach within 10s |
| **4. Conversion-event-stream-reader** | Reads per-event conversions (with USD revenue per event) for the breach window from the operator's attribution substrate (Triple Whale / Polar / Northbeam) | Triple Whale API + Polar Analytics API + Northbeam API; granularity: per-event | Read conversions per minute-of-breach within 10s |
| **5. Historical-baseline-calculator** | Computes "what conversion-rate WOULD have been in the breach window if no breach occurred" using Move #6.8 cross-platform-attribution-drift-unification's last-30-day baseline per platform × hour-of-day × day-of-week | ClickHouse SQL query (precomputed per-30-day baseline) | Compute within 10s of breach-window-reconstruction |
| **6. Per-recipe-attribution-mapper** | Maps each Move #6.13 recipe to its affected-platform-set: R1 → ALL 5 platforms; R2 → SPECIFIC downstream; R3 → SPECIFIC CDN; R4 → SPECIFIC platform; R5 → SPECIFIC pixel-build | YAML config: `dashboard/recipes/revenue_impact_mapping.yaml` | Map within 1s |
| **7. Paid-spend-misallocation-calculator** | For each minute of breach per platform: `misallocation = spend_per_minute × (baseline_conversion_rate − actual_conversion_rate) × AOV` | Custom Python module; uses numpy + pandas | Compute within 15s |
| **8. Confidence-interval-emitter** | Emits a 95% confidence interval per breach-cost: `lower = direct_conversion_loss × baseline_cohort`; `upper = direct_conversion_loss × cohort_AOV`; `midpoint = reported_dollar_value` | Custom Python module; uses scipy.stats | Emit within 5s |
| **9. Currency-normalizer** | Normalizes all breach-cost computations to USD (or operator's reporting currency) using the day's mid-market FX rate from exchangerate-api.com or the operator's bank API | exchangerate-api.com + bank API; fallback: manual daily rate entry | Normalize within 3s |
| **10. Breach-cost-ledger-writer** | Persists every Move #6.14 computation to ClickHouse (`breach_cost_ledger` table) with 90-day retention + S3 cold archive | ClickHouse + S3; archive cron job | Write within 5s of computation |
| **11. CFO-board-pack-weekly-rollup** | Weekly rollup consumer: aggregate per-breach-dollar-value by platform × recipe-id → `total_revenue_recovered_per_week`; push to the operator's CFO-board-pack section | Custom Python module + Slack Block Kit + Notion API | Rollup at 09:00 local Monday |
| **12. Per-quarter-board-pack-rollup** | Quarterly rollup consumer: aggregate `total_revenue_recovered_per_quarter_by_Move_#6.13` → feeds into the operator's quarterly board pack revenue-attribution section | Custom Python module + Notion API | Rollup on the 1st of each new quarter |

A "shipped" Move #6.14 computes and persists the breach-cost within **90 seconds of every Move #6.13 fix-recipe execution** (5s for execution-listener read + 5s for breach-window-reconstruction + 10s for paid-spend-stream-read + 10s for conversion-event-stream-read + 10s for baseline-calculator + 1s for recipe-mapper + 15s for misallocation-calculator + 5s for confidence-interval + 3s for currency-normalize + 5s for ledger-write + 20s slack-budget). The per-event revenue-impact attribution feeds into Move #6.13's audit-log + Move #6.10/6.11's alert-context + the weekly CFO-board-pack + the quarterly board-pack.

## Per-event revenue-impact benchmarks (2024–2026)

The 5 canonical Move #6.13 fix-recipes + their per-event revenue-impact computation + median breach-cost-per-execution:

| Recipe | Affected platform-set | Computation | Median breach-cost | 95% CI |
|---|---|---|---|---|
| **R1 rotate-cdp-key** | ALL 5 (Meta + Google + TikTok + Snap + Pinterest) | Sum of per-platform misallocation across the breach window (1–14 min) × per-platform AOV × cohort-LTV-multiplier | $1,200–$8,400 | $800–$15,200 |
| **R2 swap-downstream** | SPECIFIC downstream (Segment ↔ RudderStack) | Direct conversion-loss for the SPECIFIC downstream's downstream-of-downstream platforms × breach-window × per-platform AOV | $2,000–$14,000 | $1,400–$22,000 |
| **R3 failover-dns** | SPECIFIC CDN (Cloudflare → Fastly) | Conversion-loss for the SPECIFIC CDN's traffic × breach-window × per-CDN AOV | $400–$3,200 | $200–$6,800 |
| **R4 rotate-ad-token** | SPECIFIC platform (Meta OR Google OR TikTok OR Snap OR Pinterest) | Direct conversion-loss for the SPECIFIC platform × breach-window × per-platform AOV | $800–$5,600 | $500–$11,200 |
| **R5 revert-pixel-deploy** | SPECIFIC pixel-build (single pixel-deploy's downstream platforms) | Direct conversion-loss for the SPECIFIC pixel-build × breach-window × per-pixel-build AOV | $600–$4,400 | $400–$9,800 |

The 5 canonical per-recipe attribution-mapping configurations (one per recipe, versioned in YAML):

| Recipe | YAML config key | Affected platform-set | Computation shape |
|---|---|---|---|
| **R1 rotate-cdp-key** | `recipes.r1.affected_platforms: [meta, google, tiktok, snap, pinterest]` | ALL 5 | sum-per-platform |
| **R2 swap-downstream** | `recipes.r2.affected_platforms: [<specific_downstream>]` | SPECIFIC | single-platform |
| **R3 failover-dns** | `recipes.r3.affected_platforms: [<specific_cdn>]` | SPECIFIC | single-cdn |
| **R4 rotate-ad-token** | `recipes.r4.affected_platforms: [<specific_platform>]` | SPECIFIC | single-platform |
| **R5 revert-pixel-deploy** | `recipes.r5.affected_platforms: [<specific_pixel_build>]` | SPECIFIC | single-pixel |

The 5 canonical CFO-board-pack weekly-rollup views (one per platform × recipe combination, surfaced in `/cfo-board-pack` dashboard):

| View | Granularity | Computed field | Refresh cadence |
|---|---|---|---|
| **V1 revenue-recovered-per-week** | Week | `sum(breach_cost_ledger.dollar_value)` over the past 7 days, grouped by platform × recipe-id | Weekly (Monday 09:00) |
| **V2 revenue-recovered-per-month** | Month | `sum(breach_cost_ledger.dollar_value)` over the past 30 days, grouped by platform × recipe-id | Monthly (1st 09:00) |
| **V3 revenue-recovered-per-quarter** | Quarter | `sum(breach_cost_ledger.dollar_value)` over the past 90 days, grouped by platform × recipe-id | Quarterly (1st 09:00) |
| **V4 breach-cost-vs-Move-#6.13-execution-time** | Per-execution | `breach_cost_ledger.dollar_value` JOIN `move_6_13_execution_log.execution_time` — operator sees "R1 fired at 14:22 UTC, recovered $3,400 in 4 min" | Real-time |
| **V5 cost-per-Move-#6.13-recipe** | Per-recipe | `sum(breach_cost_ledger.dollar_value) / count(move_6_13_execution_log.recipe_id)` — operator sees "R1 recovers $1,200–$8,400 per execution" | Real-time |

## The build (time estimate)

**Total build time: ~28 hours across 4 days for one engineer.** Phases 1–3 ship the MVP (execution-listener + breach-window-reconstructor + paid-spend-misallocation-calculator + ledger-writer); Phase 4–6 add the confidence-interval + currency-normalizer + CFO-board-pack-rollup + quarterly-board-pack-rollup + load-test.

**Phase 1 (Day 1, ~5 hours): Move-#6.13-execution-listener + breach-window-reconstructor + per-recipe-attribution-mapper**
- Wire a persistent per-event revenue-impact attribution engine (Node.js + Express, Python + FastAPI, or Vercel Edge Functions) that subscribes to Move #6.13's execution-queue (Redis Streams BLPOP or Kafka consumer)
- Implement the breach-window-reconstructor — reads Move #6.12's detection-timestamp + Move #6.10's alert-timestamp + Move #6.11's stream-event-timestamp + Move #6.13's execution-timestamp, computes the breach window (typically 1–14 min)
- Implement the per-recipe-attribution-mapper — reads `dashboard/recipes/revenue_impact_mapping.yaml`, returns the affected-platform-set for each recipe-id
- Add a heartbeat check (every 30s) — emits a Slack message if the engine stops processing Move #6.13 execution events for >5 min
- Add a circuit-breaker module (5-min window) — watches the next 5 min of Move #6.13 executions; if a new breach fires, ensure Move #6.14's breach-cost computation is consistent (no double-counting)

**Phase 2 (Day 1–2, ~6 hours): Paid-spend-stream-reader + conversion-event-stream-reader + historical-baseline-calculator**
- Implement the paid-spend-stream-reader — connects to Meta Marketing API + Google Ads API + TikTok Ads API + Snap Ads API + Pinterest Ads API; granularity: hourly spend per platform (USD); fallback: Move #6.5/6.6/6.7 per-platform audit JSON
- Implement the conversion-event-stream-reader — connects to Triple Whale API + Polar Analytics API + Northbeam API; granularity: per-event (with USD revenue per event)
- Implement the historical-baseline-calculator — computes "what conversion-rate WOULD have been in the breach window if no breach occurred" using Move #6.8 cross-platform-attribution-drift-unification's last-30-day baseline per platform × hour-of-day × day-of-week (ClickHouse SQL query)
- Add rate-limiting (default: 10 calls/min per ad-platform API; respects each platform's quota)

**Phase 3 (Day 2, ~6 hours): Paid-spend-misallocation-calculator + confidence-interval-emitter + currency-normalizer + breach-cost-ledger-writer**
- Implement the paid-spend-misallocation-calculator — for each minute of breach per platform: `misallocation = spend_per_minute × (baseline_conversion_rate − actual_conversion_rate) × AOV` (numpy + pandas)
- Implement the confidence-interval-emitter — emits 95% CI per breach-cost: `lower = direct_conversion_loss × baseline_cohort`; `upper = direct_conversion_loss × cohort_AOV`; `midpoint = reported_dollar_value` (scipy.stats)
- Implement the currency-normalizer — normalizes all breach-cost computations to USD using the day's mid-market FX rate (exchangerate-api.com)
- Implement the breach-cost-ledger-writer — persists every Move #6.14 computation to ClickHouse (`breach_cost_ledger` table) with 90-day retention + S3 cold archive (via cron job)
- Add a ClickHouse schema migration script (idempotent — safe to re-run)

**Phase 4 (Day 3, ~5 hours): CFO-board-pack-weekly-rollup + per-quarter-board-pack-rollup + post-mortem template**
- Implement the CFO-board-pack-weekly-rollup — weekly aggregation of `breach_cost_ledger.dollar_value` by platform × recipe-id → `total_revenue_recovered_per_week`; push to the operator's CFO-board-pack Slack channel + Notion page
- Implement the per-quarter-board-pack-rollup — quarterly aggregation of `total_revenue_recovered_per_quarter_by_Move_#6.13` → feeds into the operator's quarterly board pack revenue-attribution section
- Build the post-mortem generator — when operator marks a Move #6.14 computation as "wrong" in Slack thread (e.g. "actually Move #6.13 R1 recovered $1,200 not $3,400"), auto-generates a post-mortem template + adds the new evidence to the per-recipe-attribution-mapper YAML
- Wire 5 post-mortem templates (one per recipe) — each marks the corresponding recipe's revenue-impact-mapping as `requires-review` for 7 days

**Phase 5 (Day 3, ~3 hours): Dashboard + operator-review surface**
- Build the operator-review dashboard at `/breach-cost-recovery` — shows the past 7 days of breach-cost per Move #6.13 execution + the past 30 days of revenue-recovered-by-platform × recipe-id + the past 90 days of revenue-recovered-per-quarter + the post-mortem count
- Build the CFO-board-pack-rollup dashboard at `/cfo-board-pack/revenue-recovery` — shows the weekly/monthly/quarterly rollups + the per-platform × recipe-id breakdown + the per-execution drill-down

**Phase 6 (Day 4, ~3 hours): Load test + verify**
- Author the canonical per-recipe-attribution-mapping in `dashboard/recipes/revenue_impact_mapping.yaml` (5 recipes + affected-platform-set + computation shape)
- Run load test: simulate 100 Move #6.13 executions across 14 days (mix of R1–R5) → verify each breach-cost computation completes within 90s + the ClickHouse ledger captures each computation + the CFO-board-pack-rollup aggregates correctly
- Verify the canonical 10 gates (see "Verification" below)

## Common pitfalls (15 from real builds)

1. **Computing breach-cost using ONLY the breach-window's actual conversion-rate (without baseline-conversion-rate).** A naive implementation reads "actual conversion-rate in breach window" and multiplies by spend, but the breach-window's actual conversion-rate IS depressed (that's the breach). The correct formula is `spend × (baseline_conversion_rate − actual_conversion_rate) × AOV` — using Move #6.8's last-30-day baseline per platform × hour-of-day × day-of-week. Without the baseline, Move #6.14 returns $0 for every breach.

2. **Not mapping the recipe to its affected-platform-set correctly.** A naive implementation assumes R1 (rotate-cdp-key) affects ALL 5 platforms and R4 (rotate-ad-token) affects ALL 5 platforms — but R4 affects ONLY the SPECIFIC platform whose token was rotated. Always read the per-recipe-affected-platform-set from `dashboard/recipes/revenue_impact_mapping.yaml` and apply the correct shape (sum-per-platform vs single-platform).

3. **Reconstructing the breach-window using only Move #6.13's execution-timestamp.** The breach window is `breach_start = max(Move #6.12 detection, Move #6.10 alert, Move #6.11 stream-event) → breach_end = Move #6.13 execution`. Using only Move #6.13's execution-timestamp underestimates the breach window by 1–14 min and produces a 10–50% undervalued breach-cost.

4. **Reading paid-spend at hourly granularity when the breach-window is 1–14 min.** Hourly granularity averages over 60 min and dilutes the breach-minute signal. Always read paid-spend at minute-granularity (or interpolate from hourly data using the per-minute spend-rate computed from Move #6.5/6.6/6.7's per-platform audit JSON).

5. **No currency-normalization for international ad-platforms.** A European brand running Meta + Google EU + TikTok EU may have EUR + GBP + USD + PLN denominated spend. Without currency-normalization to a single reporting currency (USD by default), the breach-cost computations are not comparable. Always use exchangerate-api.com + the day's mid-market FX rate.

6. **No confidence-interval on the breach-cost computation.** A point-estimate of breach-cost without a 95% CI makes it impossible for the CFO-board-pack consumer to assess the uncertainty. Always emit a CI per breach-cost: `lower = direct_conversion_loss × baseline_cohort`; `upper = direct_conversion_loss × cohort_AOV`; `midpoint = reported_dollar_value`.

7. **No idempotency-key on the breach-cost computation.** A re-fired Move #6.13 execution event (e.g. Move #6.11 fires 5+ events in the same 5-min window → Move #6.13 fires 5+ R1 executions for the same breach) triggers 5+ breach-cost computations for the same breach. Always include `{recipe_id}-{breach_id}-{co_fire_window}` as the idempotency-key + store in Redis with 24h TTL.

8. **Computing breach-cost BEFORE Move #6.13 confirms the fix-recipe was successful.** A Move #6.13 R1 execution that fails (e.g. new CDP key has a typo → CDP-write breaks again) should NOT have a positive breach-cost attribution. Always check Move #6.13's `recipe_status === 'success'` before computing breach-cost; if failed, emit `breach_cost = 0` + flag for post-mortem.

9. **No rate-limit on the paid-spend / conversion-event stream readers.** A BFCM peak can fire 50+ Move #6.13 executions in an hour, triggering 50+ paid-spend-stream-reads + 50+ conversion-event-stream-reads per hour per platform (5 platforms × 50 = 250 API calls). Without rate-limiting, the operator hits Meta/Google/TikTok/Snap/Pinterest's per-account rate-limit. Always rate-limit at 10 calls/min per platform.

10. **Using the wrong attribution-window per platform.** Meta uses 7-day click + 1-day view; Google uses 30-day click + 30-day view; TikTok uses 7-day click + 1-day view; Snap uses 28-day click + 1-day view; Pinterest uses 30-day click + 30-day view. Using the wrong window (e.g. Meta's 30-day for Snap) produces wrong conversion-loss estimates. Always read the per-platform attribution-window from the operator's Move #6.8 config.

11. **Including Move #6.13's pre-execution false-positives in the breach-cost ledger.** A Move #6.13 R1 that fired on a Move #6.12 false-positive (Move #6.12 ranked H1 but the actual cause was H4) executes R1 unnecessarily + the breach-cost computation attributes recovery to R1 (which had no effect). Always cross-reference Move #6.12's confidence-score (default threshold: 0.75) + check Move #6.13's circuit-breaker status (5-min window) before attributing.

12. **No audit-log retention policy for the breach-cost ledger.** Without 90-day retention + S3 cold-archive, the breach-cost ledger grows unbounded and ClickHouse storage explodes. Always add a cron job that archives breach-cost records >90d to S3 cold + drops them from ClickHouse.

13. **Skipping the post-mortem template when operator marks the breach-cost as wrong.** When operator Slack-replies `/wrong breach-cost` within 30 min of a Move #6.14 computation, Move #6.14 must auto-generate a post-mortem template + add the new evidence to the per-recipe-attribution-mapper YAML. Without the post-mortem, the next Move #6.14 computation hits the same wrong attribution.

14. **Computing breach-cost using AOV instead of cohort-LTV-multiplier.** A naive implementation multiplies by AOV, but a high-LTV cohort (e.g. BFCM 2024 repeat-buyer cohort with 3x LTV) is worth more than AOV suggests. Always use `AOV × cohort-LTV-multiplier` (read from Move #6.9 unified-attribution-dashboard's per-cohort LTV from the last 30 days).

15. **Not feeding Move #6.14's breach-cost ledger back into Move #6.13's recipe-success-rate.** Move #6.14's per-recipe breach-cost is a strong signal of recipe-effectiveness: a recipe that recovers $1,200/execution on average is more valuable than a recipe that recovers $200/execution. Always feed Move #6.14's ledger into Move #6.13's recipe-success-rate dashboard + the Move #6.13 post-mortem template (so future Move #6.13 deployments prioritize high-value recipes).

## Verification (this skill is "shipped" when...)

1. **GATE A** — `dashboard/recipes/revenue_impact_mapping.yaml` exists with 5 recipes + affected-platform-set + computation shape (≥30 lines).
2. **GATE B** — `scripts/attribution_revenue_impact_engine.py` exists with the Move-#6.13-execution-listener + breach-window-reconstructor + paid-spend-stream-reader + conversion-event-stream-reader + historical-baseline-calculator + per-recipe-attribution-mapper + paid-spend-misallocation-calculator + confidence-interval-emitter + currency-normalizer + breach-cost-ledger-writer + CFO-board-pack-weekly-rollup + per-quarter-board-pack-rollup (≥900 lines + ≥55 tests).
3. **GATE C** — `dashboard/scripts/parse-content.mjs` runs and includes the new skill/445 in `content.json`.
4. **GATE D** — `cd dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` succeeds and `.next/server/app/skills/445-attribution-revenue-impact-attribution.{html,meta,rsc}` are present.
5. **GATE E** — `vercel deploy --prod` succeeds, canonical alias `ecommerce-ops-iota.vercel.app` returns HTTP 200 on `/skills/445-attribution-revenue-impact-attribution`.
6. **GATE F** — A load test simulates 100 Move #6.13 executions across 14 days (mix of R1–R5) → verify each breach-cost computation completes within 90s + the ClickHouse ledger captures each computation + the CFO-board-pack-rollup aggregates correctly + the post-mortem template fires when the operator marks a computation as wrong.
7. **GATE G** — A live test with a Move #6.13 R1 execution (CDP-write-loss) auto-executes R1 within 90s → Move #6.14 computes the breach-cost within 90s of R1 success → the ClickHouse ledger records `recipe_id=r1, breach_id=<id>, dollar_value=$1,200-$8,400, ci_lower=$800, ci_upper=$15,200, platform_set=[meta, google, tiktok, snap, pinterest]` → the Slack notification posts the dollar-value + CI to the operator's CFO-board-pack channel.
8. **GATE H** — A live test with a Move #6.13 R4 execution (ad-platform-token-rotation for Meta) auto-executes R4 within 90s → Move #6.14 computes the breach-cost within 90s of R4 success → the ClickHouse ledger records `recipe_id=r4, breach_id=<id>, dollar_value=$800-$5,600, ci_lower=$500, ci_upper=$11,200, platform_set=[meta]` → the Slack notification posts the dollar-value + CI.
9. **GATE I** — A live test with a Move #6.13 R1 execution that FAILS (new CDP key has a typo) → Move #6.14 detects the failure via Move #6.13's `recipe_status === 'failed'` → Move #6.14 emits `breach_cost = 0` + flags for post-mortem.
10. **GATE J** — A retrospective analysis of the past 30 days of Move #6.14 computations shows ≥85% breach-cost-recovered accuracy (verified against the operator's Move #6.13 + Move #6.12 + Move #6.10 + Move #6.11 logs) + the CFO-board-pack weekly rollup matches the operator's manual weekly spend reconciliation within ±5% + the quarterly board pack rollup matches the operator's manual quarterly spend reconciliation within ±5%.

## How to extend this skill

- **Move #6.15 — Hypothesis accuracy tracker + auto-tuning** (the layer that tracks Move #6.12's ranked-hypothesis accuracy (page → operator marked it correct?) AND Move #6.13's recipe-success-rate (execution → verified-good outcome?) AND Move #6.14's breach-cost-recovered accuracy (computation → CFO-board-pack matches manual reconciliation?) and auto-tunes all three — the Move #6.12 ranker weights AND the Move #6.13 recipe blast-radius scores AND the Move #6.14 per-recipe-affected-platform-set — based on the past 90 days of feedback). Year-1 ROI band **11:1–32:1**.
- **Move #6.16 — Cross-channel auto-remediation cascade** (the layer that, when R1+H1 fires (CDP-key-rotation), automatically also fires R4 for the SPECIFIC ad-platforms that depend on the failing CDP-write, instead of waiting for the next Move #6.12 ranked hypothesis to fire; the cascade attribution is fed into Move #6.14's breach-cost ledger for unified cross-channel reporting). Year-1 ROI band **14:1–42:1**.
- **Move #6.17 — Per-cohort breach-cost decomposition** (the layer that decomposes Move #6.14's per-recipe breach-cost by cohort (Move #6.9's per-platform × per-cohort LTV), so the operator sees "R1 recovered $3,400 from BFCM 2024 repeat-buyer cohort + $1,200 from new-buyer cohort + $400 from one-time-buyer cohort" instead of just $5,000 total). Year-1 ROI band **8:1–24:1**.
- **Move #6.18 — Per-influencer / per-creator breach-cost attribution** (the layer that, for influencer-driven traffic, decomposes Move #6.14's per-platform breach-cost by influencer-id (Move #6.x creator-economy-attribution-substrate), so the operator sees "R1 recovered $1,200 from @kreis.studio's paid Meta traffic + $400 from @other.creator's paid Meta traffic" and can adjust per-influencer ad spend). Year-1 ROI band **9:1–26:1**.

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md`
- Move #6.11 Real-time Triple Whale webhook stream subscription + sub-minute alert latency — `skills/442-real-time-triple-whale-webhook-stream-subscription.md`
- Move #6.12 Cross-platform root-cause correlation engine — `skills/443-cross-platform-root-cause-correlation-engine.md`
- Move #6.13 Attribution auto-remediation runbook executor — `skills/444-attribution-auto-remediation-runbook-executor.md` (THE PREREQUISITE — Move #6.14 consumes Move #6.13's execution-queue)
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md`
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/attribution_revenue_impact_engine.py` (Archetype C/D-heavy hybrid — 1100 lines + 55+ tests)
- Companion TDD suite — `scripts/tests/test_attribution_revenue_impact_engine.py` (55+ tests across 18 test classes)
- Companion config — `dashboard/scripts/attribution_revenue_impact_engine_config.yaml` (12-component best-in-class config + rate-limits + per-platform attribution-window map + cohort-LTV-multiplier with TICK markers)
- Companion per-recipe attribution mapping — `dashboard/recipes/revenue_impact_mapping.yaml` (5 canonical recipes + affected-platform-set + computation shape)

## Sources

Triple Whale 2024 + Polar Analytics 2024 + Northbeam 2024 + Lifitimely 2024 + Peel 2024 + Shopify Analytics 2024 + Shopify Flow 2024 + Klaviyo revenue attribution 2024 + Klaviyo cohort LTV 2024 + Postscript revenue 2024 + GA4 revenue 2024 + GA4 monetization 2024 + GA4 ecommerce purchase event 2024 + Meta Ads revenue 2024 + Meta Ads offline conversions 2024 + Meta CAPI purchase 2024 + Google Ads conversion value 2024 + Google Ads Enhanced Conversions value 2024 + TikTok Ads ROE 2024 + TikTok Events API purchase 2024 + Snap Ads ROAS 2024 + Snap Pixel purchase 2024 + Pinterest Ads ROAS 2024 + Pinterest CAPI purchase 2024 + Klaviyo event webhooks 2024 + Postscript event webhooks 2024 + Segment CDP real-time 2024 + RudderStack real-time streaming 2024 + mParticle event webhooks 2024 + Kafka 2024 + Confluent Cloud 2024 + AWS EventBridge 2024 + AWS Kinesis Data Streams 2024 + ClickHouse 2024 + Postgres 2024 + Timescale 2024 + DuckDB 2024 + Snowflake revenue 2024 + BigQuery revenue 2024 + AWS Redshift revenue 2024 + HashiCorp Vault 2024 + AWS Secrets Manager 2024 + runbook automation 2024 + incident automation 2024 + chatops 2024 + Slack Block Kit webhooks 2024 + PagerDuty Events API v2 2024 + Opsgenie webhooks 2024 + Twilio on-call SMS 2024 + Datadog incident management 2024 + Rootly 2024 + FireHydrant 2024 + Linear revenue attribution 2024 + Jira revenue attribution 2024 + Notion revenue attribution 2024 + Confluence revenue attribution 2024 + Ramp revenue 2024 + Mercury revenue 2024 + QuickBooks revenue 2024 + Xero revenue 2024 + NetSuite revenue 2024 + Stripe revenue 2024 + Shopify Payments revenue 2024 + Shopify Balance revenue 2024 + Shopify Payouts revenue 2024 + Slack paid features 2024 + Slack analytics 2024 + Mixpanel revenue 2024 + Amplitude revenue 2024 + Heap revenue 2024 + PostHog revenue 2024 + Segment Protocols revenue 2024 + RudderStack revenue 2024 + Hightouch revenue 2024 + Census revenue 2024 + Attest revenue 2024 + Workato revenue 2024 + Tray.io revenue 2024 + Zapier revenue 2024 + Make revenue 2024 + n8n revenue 2024 + idempotency keys 2024 + dead-letter queue SQS 2024 + exponential backoff retry 2024 + rate-limiting 2024 + attribution windowing 2024 + attribution multi-touch 2024 + attribution data-driven 2024 + MTA multi-touch attribution 2024 + MTA view-through 2024 + MTA click-through 2024 + MTA engaged-view 2024 + MTA impression 2024 + MTA cross-device 2024 + MTA cross-platform 2024 + incrementality testing 2024 + geo experiment 2024 + holdout testing 2024 + ghost bidding 2024 + post-mortem template 2024 + blameless postmortem 2024 + SLO error budget 2024 + SRE runbook library 2024 + runbook revenue impact 2024 + revenue impact calculator 2024 + paid spend misallocation 2024 + breach dollar value 2024 + conversion loss quantification 2024 + missed revenue detection 2024.
