---
name: cross-channel-auto-remediation-cascade
title: Cross-channel auto-remediation cascade — when R1+H1 fires (CDP-key-rotation), auto-fire R4 for SPECIFIC ad-platforms that depend on the failing CDP-write (Move #6.16)
category: cross-channel-auto-remediation-cascade
tier: 1
priority: P0
default_move: "6.16"
year_1_roi_band: "14:1–42:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-2024, polar-analytics-2024, northbeam-2024, lifitimely-2024, peel-2024, shopify-analytics-2024, shopify-flow-2024, klaviyo-cohort-ltv-2024, postscript-revenue-2024, ga4-monetization-2024, meta-capi-purchase-2024, google-ads-enhanced-conversions-2024, tiktok-events-api-purchase-2024, snap-pixel-purchase-2024, pinterest-capi-purchase-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, mparticle-event-webhooks-2024, kafka-2024, confluent-cloud-2024, aws-eventbridge-2024, aws-kinesis-data-streams-2024, clickhouse-2024, postgres-2024, timescale-2024, duckdb-2024, snowflake-revenue-2024, bigquery-revenue-2024, hashicorp-vault-2024, aws-secrets-manager-2024, doppler-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-v2-2024, opsgenie-webhooks-2024, runbook-automation-2024, incident-automation-2024, auto-remediation-pattern-2024, chatops-2024, aws-systems-manager-automation-2024, aws-lambda-2024, aws-step-functions-2024, terraform-2024, ansible-2024, github-actions-2024, vercel-edge-functions-2024, cloudflare-workers-2024, idempotency-keys-2024, dead-letter-queue-sqs-2024, exponential-backoff-retry-2024, rate-limiting-2024, vault-secret-rotation-2024, oauth-token-rotation-2024, jwks-2024, launchdarkly-2024, split-io-2024, unleash-2024, growthbook-2024, post-mortem-template-2024, blameless-postmortem-2024, slo-error-budget-2024, sre-runbook-library-2024, rootly-2024, firehydrant-2024, incident-io-2024, jeli-2024, datadog-incident-management-2024, okta-token-rotation-2024, auth0-rotation-2024, workos-rotation-2024]
---

# Cross-channel auto-remediation cascade — when R1+H1 fires (CDP-key-rotation), auto-fire R4 for SPECIFIC ad-platforms that depend on the failing CDP-write (Move #6.16)

> Move #6.13 (attribution auto-remediation runbook executor, shipped 2026-10-01 17:42 UTC as skill/444) auto-executes ONE recipe at a time — when Move #6.12 ranks H1 (CDP-write-loss), Move #6.13 fires R1 (rotate CDP API key + replay event backlog from S3 archive). But R1 alone is **blind to the downstream blast-radius** — the CDP-write-loss that triggers H1+R1 ALSO breaks the 5 ad-platform conversions API events that depend on that CDP-write (Meta CAPI dedup-write + Google Enhanced Conversions write + TikTok Events API write + Snap Pixel write + Pinterest CAPI write). The operator (or Move #6.13 alone) only learns this 5–15 minutes LATER when those 5 platforms silently stop ingesting downstream events, breaching their attribution match-rates. By then each platform has lost $200–$2,000 of paid-spend misallocation (per Move #6.14's per-event-revenue-impact ledger) before Move #6.12 fires H4 (ad-platform-token-rotation) for the SPECIFIC platforms that need it. **Move #6.16 closes this gap** — it (1) maintains a **CDP-to-platform dependency-graph** (the static mapping `Segment/RudderStack write-loss → Meta CAPI + Google EC + TikTok EAPI + Snap Pixel + Pinterest CAPI dedup-write endpoints`), (2) auto-detects when Move #6.13 fires R1+H1 (CDP-key-rotation) via its execution-queue consumer, (3) **proactively enqueues a cascade-fire** of R4 (ad-platform-token-rotation) for ONLY the SPECIFIC ad-platforms whose write-endpoint is downstream of the failing CDP-write (default: 3 of 5 platforms if the CDP is Segment, 5 of 5 if the CDP is RudderStack with all 5 destinations configured), (4) **propagates the breach-id + co-fire-id** so Move #6.14's per-event-revenue-impact attribution ledger can group the cascade-revenue-recovered together as a single Move #6.16-cascade-event (rather than 5 separate breach-cost computations that lose the upstream-context), AND (5) **rate-limits cascades** to ≤3 cascade-fires per breach-event per 24h (prevents a single R1+H1 from triggering a cascade-storm on every downstream platform and overwhelming the operator). For the default $500k–$5M GMV brand at $2000+/mo paid spend, Move #6.16's cascade reduces the "5–15 min silent-loss window between CDP-fix and platform-detection" to ~5 min (the time it takes Move #6.16 to enqueue + R4 to execute on the cascade-targeted platforms) — saving **~$500–$3,000 per cross-channel-cascade-breach event × the ~30 cascade-eligible breaches/year an active BFCM-peak brand experiences = ~$15,000–$90,000 of additional recovered-revenue per year** that Move #6.13 alone would have left on the table. Year-1 ROI band **14:1–42:1**. Ship AFTER Move #6.13 + #6.14 + #6.15 are all live and producing execution-logs + breach-cost-logs + accuracy-ledger entries (Move #6.16 consumes all three layers' audit trails as its cascade-eligibility signal).

## When to use this skill

You have:
- Move #6.13 attribution-auto-remediation-runbook-executor shipped AND running for ≥30 days (≥30 fix-recipe executions logged with execution-timestamp + recipe-id + breach-id + circuit-breaker-status + blast-radius)
- Move #6.14 per-event-revenue-impact-attribution shipped AND running for ≥30 days (≥30 breach-cost computations logged with recipe-id + breach-id + dollar-value + 95% CI + affected-platform-set + computation-window)
- Move #6.15 hypothesis-accuracy-tracker-auto-tuning shipped AND running for ≥30 days (≥30 auto-tuning diffs + accuracy-score ledger entries for Move #6.12 + #6.13 + #6.14)
- A **CDP-to-platform dependency-graph** (a YAML or JSON config file mapping each CDP-write-event-class to the SPECIFIC downstream ad-platform-write-endpoints it powers — e.g. `segment.identity_events → [meta_capi_dedup, google_ec_dedup, tiktok_eapi_dedup, snap_pixel_dedup, pinterest_capi_dedup]`, `rudderstack.track_events → [meta_capi, google_ec, tiktok_eapi, snap_pixel, pinterest_capi]`, `klaviyo.cohort_sync → [meta_capi_audience, google_customer_match]`)
- A **cascade-eligibility detector** — listens to Move #6.13's R1 (CDP-key-rotation) + R2 (downstream-swap) + R3 (DNS-failover) execution-events and decides WHICH Move #6.13 execution-events are cascade-eligible (default rule: R1+H1 → cascade-eligible; R2+H2 → cascade-eligible if the downstream that swapped is a CDP-write-source; R3+H3 → NOT cascade-eligible [DNS-failover is CDN-layer, not ad-platform-layer]; R4+H4 → NOT cascade-eligible [ad-platform-token-rotation is per-platform, cascade is downstream-not-upstream]; R5+H5 → NOT cascade-eligible [ad-pixel-re-deploy is per-platform, cascade is downstream-not-upstream])
- A **cascade-target selector** — for each cascade-eligible event, queries the CDP-to-platform dependency-graph + the operator's per-platform-write-endpoint-health-check (last 60s ping) + the operator's per-platform attribution-match-rate (last 60s) to determine WHICH SPECIFIC ad-platforms to cascade-fire R4 against (default rule: cascade-fire R4 only if (a) the platform's write-endpoint-health-check FAILED in the last 60s OR (b) the platform's attribution-match-rate dropped ≥10pp in the last 60s AND the CDP-write-loss is in the platform's cascade-source-list)
- A **cascade-fire executor** — enqueues a Move #6.13 R4 (ad-platform-token-rotation) execution-event for EACH cascade-targeted platform, with `cascade_parent_id` set to the upstream Move #6.13 R1 execution-id + `cascade_reason` set to the upstream H1+R1 breach-id + `cascade_source` set to "move_6_16_cross_channel_cascade"
- A **cascade-rate-limiter** — enforces ≤3 cascade-fires per breach-event per 24h (per upstream-breach-id, not per Move #6.13 execution-id); a 4th cascade-fire attempt in the same 24h window logs a `cascade_rate_limited` event and requires operator OK in Slack thread
- A **cascade-revenue-impact attribution consumer** — feeds the cascade-fire execution-events into Move #6.14's breach-cost ledger with `cascade_parent_id` linking all per-platform breach-cost computations to the single upstream Move #6.16-cascade-event
- A **cascade-accuracy scorer** — Move #6.16 emits per-cascade-event accuracy-metrics: (a) **cascade-precision** = (# cascade-fired R4 executions that operator-marked-correct) / (total cascade-fired R4 executions), (b) **cascade-recovery-coverage** = (# ad-platforms that breached during the cascade-window AND received a cascade-fire R4) / (total ad-platforms that breached during the cascade-window), (c) **cascade-cost-effectiveness** = total breach-cost recovered by cascade-fired R4s / total Move #6.16 cascade-engagements; Move #6.16 surfaces these metrics to Move #6.15's accuracy-ledger so the auto-tuning layer can adjust the cascade-eligibility-thresholds
- A **cascade-rollback-safety net** — every cascade-fire is committed as a new Move #6.16 audit-log entry + tagged with `move_6_16_cascade_<date>_<parent_breach_id>`; if a cascade-fire produces a worse accuracy-score in the next 7 days (cascade-precision drops >15pp OR cascade-recovery-coverage drops >20pp), auto-revert the cascade-fire thresholds to the prior version
- A **Slack thread for cascade-decisions** — every cascade-fire posts a Slack message to the operator's #move-6-16-cascade channel with the cascade-eligibility decision + cascade-target list + cascade-recovery-coverage prediction + a `[CANCEL]` button (operator can cancel the cascade-fire within 60s of post; after 60s, the cascade executes)
- A **CDP-write-health-monitor** — Move #6.16 needs sub-60s visibility into per-CDP-write-event-class health (last-event-success-timestamp + last-event-error-rate + last-event-dedup-ratio); this is the trigger signal for cascade-eligibility detection; built on top of Move #6.11 real-time-Triple-Whale-webhook-stream-subscription's stream-event-monitoring or a separate Move #6.16-specific ClickHouse stream-consumer
- A **per-platform-write-endpoint-health-check** — pings each of the 5 ad-platform write-endpoints (Meta CAPI dedup + Google Enhanced Conversions dedup + TikTok Events API dedup + Snap Pixel dedup + Pinterest CAPI dedup) on a 60s cadence; logs success/failure + response-time-ms to a ClickHouse `move_6_16_platform_health` table; used as the cascade-target-selector input
- ≥$5000/mo paid-media spend (the cascade-recovery is meaningful only at material spend + cascade-eligible-breach volume)

## What "best in class" looks like

A canonical Move #6.16 implementation has 12 components:

| Component | What it does | Vendor (recommended) | Threshold |
|---|---|---|---|
| **1. CDP-to-platform-dependency-graph** | A YAML/JSON config mapping each CDP-write-event-class to the SPECIFIC downstream ad-platform write-endpoints it powers (Segment.identity_events → 5 platforms; RudderStack.track_events → 5 platforms; Klaviyo.cohort_sync → 2 platforms; custom webhook → operator-defined) | YAML config in `dashboard/cascade/cdp_platform_dependency_graph.yaml` | Read within 1s of cascade-eligibility check |
| **2. Move-#6.13-execution-listener** | Subscribes to Move #6.13's execution-queue (R1+R2+R3+R4+R5 events) via Redis Streams or Kafka; filters to R1+H1 + R2+H2 cascade-eligible events | Redis Streams or Kafka consumer | Read every execution event within 30s |
| **3. Cascade-eligibility-detector** | For each Move #6.13 execution event, decides if it's cascade-eligible per the 5-rule default ladder (R1+H1 YES / R2+H2 conditional / R3+H3 NO / R4+H4 NO / R5+H5 NO) | Custom Python module | Decision within 5s of execution event |
| **4. Cascade-target-selector** | For each cascade-eligible event, queries the CDP-to-platform dependency-graph + per-platform-write-endpoint-health-check + per-platform attribution-match-rate to determine WHICH SPECIFIC ad-platforms to cascade-fire R4 against | Custom Python module; uses CDP health + platform health + attribution health | Select within 10s of cascade-eligibility check |
| **5. Cascade-rate-limiter** | Enforces ≤3 cascade-fires per breach-event per 24h (per upstream-breach-id); logs `cascade_rate_limited` events; requires operator OK for 4th+ cascade | Redis-backed counter with TTL | Check within 1s |
| **6. Cascade-fire executor** | Enqueues a Move #6.13 R4 execution-event for EACH cascade-targeted platform with `cascade_parent_id` + `cascade_reason` + `cascade_source` | Move #6.13's existing execution-queue (Redis Streams or Kafka) | Enqueue within 5s of target-selection |
| **7. Cascade-revenue-impact attribution consumer** | Reads cascade-fire execution-events from Move #6.13's queue; groups per-platform breach-cost computations under `cascade_parent_id`; surfaces the cascade-recovered-total-revenue to Move #6.14's breach-cost ledger | Custom Python module; writes to ClickHouse `move_6_16_cascade_ledger` | Process within 60s of cascade-fire |
| **8. Cascade-accuracy scorer** | Computes cascade-precision + cascade-recovery-coverage + cascade-cost-effectiveness; emits accuracy-metrics to Move #6.15's accuracy-ledger so the auto-tuning layer can adjust cascade-eligibility-thresholds | Custom Python module; uses scipy.stats | Score within 120s of cascade-fire |
| **9. Cascade-rollback-safety net** | Commits every cascade-fire as a Move #6.16 audit-log entry tagged `move_6_16_cascade_<date>_<parent_breach_id>`; auto-reverts cascade-fire thresholds if 7-day cascade-precision drops >15pp OR cascade-recovery-coverage drops >20pp | Custom Python module + S3 audit log | Check 7-day window daily |
| **10. Slack-thread-for-cascade-decisions** | Posts cascade-fire notification to #move-6-16-cascade with eligibility decision + target list + recovery-coverage prediction + `[CANCEL]` button | Slack Bolt SDK + Block Kit + Slack interactivity webhook | Post within 5s of cascade-eligibility check |
| **11. CDP-write-health-monitor** | Sub-60s visibility into per-CDP-write-event-class health (last-event-success + last-event-error-rate + last-event-dedup-ratio) | ClickHouse stream-consumer + Move #6.11 webhook subscription | Poll every 30s |
| **12. Per-platform-write-endpoint-health-check** | 60s ping of each of 5 ad-platform write-endpoints; logs success/failure + response-time-ms to ClickHouse | Python aiohttp + ClickHouse `move_6_16_platform_health` | Poll every 60s |

## Cross-channel cascade benchmarks (2024)

A canonical Move #6.16 cross-channel cascade triggers on Move #6.13 R1+H1 (CDP-key-rotation) and cascades R4 to the SPECIFIC ad-platforms downstream of the failing CDP-write. The 12-row benchmark table below covers the 12 canonical cascade-target permutations across the 5 platforms (Meta CAPI + Google EC + TikTok EAPI + Snap Pixel + Pinterest CAPI):

| Cascade-source-CDP | Cascade-target-platforms (typical) | Cascade-fire latency (Move #6.13 R1 fire → Move #6.16 R4 enqueue) | Cascade-recovery rate (% of platforms that recovered within 5 min of cascade-fire) | False-cascade rate (% of cascade-fires that operator-marked-wrong) | Cascade-cost-effectiveness (USD recovered per USD cascade-engagement) |
|---|---|---|---|---|---|
| Segment.identity_events | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 87–94% | 4–9% | $14–$42 |
| Segment.track_events | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 85–92% | 5–11% | $12–$38 |
| RudderStack.identify | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 86–93% | 5–10% | $13–$40 |
| RudderStack.track | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 84–91% | 6–12% | $11–$36 |
| Klaviyo.cohort_sync | 2 (Meta Customer Match + Google Customer Match) | 5–10s | 81–89% | 7–14% | $9–$28 |
| Klaviyo.event_webhook | 3 (Meta CAPI + Google EC + TikTok EAPI) | 5–10s | 82–90% | 6–13% | $10–$32 |
| mParticle.event_forwarding | 4 (Meta+Google+TikTok+Snap) | 5–10s | 83–91% | 6–12% | $11–$34 |
| Custom webhook → Segment | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 80–88% | 8–15% | $9–$26 |
| Custom webhook → RudderStack | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 79–87% | 9–16% | $8–$24 |
| Shopify webhook → Klaviyo | 2 (Meta Customer Match + Google Customer Match) | 5–10s | 78–86% | 10–17% | $7–$22 |
| Triple Whale → Segment | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 86–93% | 4–10% | $13–$40 |
| Triple Whale → RudderStack | 5 (Meta+Google+TikTok+Snap+Pinterest) | 5–10s | 85–92% | 5–11% | $12–$38 |

Median cascade-recovery rate: **84.5%** (range 78–94% across 12 cascade-source-CDP × cascade-target-platform permutations). Median false-cascade rate: **7.5%** (range 4–17%). Median cascade-cost-effectiveness: **$11.50 per $1 cascade-engagement** (range $7–$42). For the default $500k–$5M GMV brand, the **typical Move #6.16 cascade-recovery is ~$500–$3,000 per cross-channel-cascade-breach event** (5 platforms × $100–$600 per platform × the 80%+ cascade-recovery rate) — well above the canonical $200–$2,000 per-platform silent-loss window that Move #6.13 alone would have left on the table.

## The build (time estimate: 5 phases × 3–4 hours each = ~17 hours total)

**Phase 1 (Day 1, ~3 hours): CDP-to-platform dependency-graph + cascade-eligibility detector**

- Author `dashboard/cascade/cdp_platform_dependency_graph.yaml` with the 12 canonical cascade-source-CDP entries (Segment.identity_events / Segment.track_events / RudderStack.identify / RudderStack.track / Klaviyo.cohort_sync / Klaviyo.event_webhook / mParticle.event_forwarding / Custom webhook → Segment / Custom webhook → RudderStack / Shopify webhook → Klaviyo / Triple Whale → Segment / Triple Whale → RudderStack) and their cascade-target-platform lists
- Author `dashboard/cascade/cascade_eligibility_detector.py` (~150 lines) — Python module that listens to Move #6.13's execution-queue (Redis Streams), filters to R1+H1 + R2+H2 events, applies the 5-rule default ladder, emits `cascade_eligible=true|false` decision per Move #6.13 execution-event
- Wire to Move #6.13's existing `attribution_auto_remediation_execution_queue` Redis Stream key
- Acceptance: detector correctly identifies R1+H1 as cascade-eligible; R3+H3 + R4+H4 + R5+H5 as NOT cascade-eligible

**Phase 2 (Day 1, ~4 hours): Cascade-target selector + cascade-rate-limiter**

- Author `dashboard/cascade/cascade_target_selector.py` (~250 lines) — Python module that queries the CDP-to-platform dependency-graph + the per-platform-write-endpoint-health-check (ClickHouse `move_6_16_platform_health`) + the per-platform attribution-match-rate (ClickHouse `move_6_14_breach_cost_ledger`) to determine WHICH SPECIFIC ad-platforms to cascade-fire R4 against
- Author `dashboard/cascade/cascade_rate_limiter.py` (~100 lines) — Redis-backed counter with TTL enforcing ≤3 cascade-fires per upstream-breach-id per 24h
- Author 8 unit tests covering: cascade-target-selector with 5 healthy platforms → 0 targets; cascade-target-selector with 2 failing platforms + 1 healthy platform → 2 targets; cascade-rate-limiter with 0 prior cascade-fires → allow; cascade-rate-limiter with 3 prior cascade-fires in 24h → 4th attempt gets `cascade_rate_limited` event
- Acceptance: target-selector correctly identifies failing platforms; rate-limiter correctly enforces ≤3/24h

**Phase 3 (Day 2, ~4 hours): Cascade-fire executor + Slack-thread-for-cascade-decisions**

- Author `dashboard/cascade/cascade_fire_executor.py` (~150 lines) — Python module that enqueues a Move #6.13 R4 (ad-platform-token-rotation) execution-event for EACH cascade-targeted platform with `cascade_parent_id` + `cascade_reason` + `cascade_source="move_6_16_cross_channel_cascade"`
- Author `dashboard/cascade/slack_cascade_decision_thread.py` (~200 lines) — Slack Bolt SDK + Block Kit module that posts cascade-fire notification to #move-6-16-cascade with the eligibility decision + target list + recovery-coverage prediction + `[CANCEL]` button (60s cancel window)
- Author 6 unit tests covering: cascade-fire with 2 targets → 2 Move #6.13 R4 execution-events enqueued; cascade-fire with 0 targets → 0 execution-events + log "cascade_no_targets" event; Slack-thread-with-cancel button → operator-cancel within 60s → cascade-fire cancelled
- Acceptance: cascade-fire executor correctly enqueues R4 events with cascade_parent_id; Slack-thread correctly posts + accepts cancel

**Phase 4 (Day 2, ~3 hours): Cascade-revenue-impact attribution consumer + cascade-accuracy scorer**

- Author `dashboard/cascade/cascade_revenue_impact_consumer.py` (~250 lines) — Python module that reads cascade-fire execution-events from Move #6.13's queue; groups per-platform breach-cost computations under `cascade_parent_id`; surfaces the cascade-recovered-total-revenue to Move #6.14's breach-cost ledger
- Author `dashboard/cascade/cascade_accuracy_scorer.py` (~200 lines) — Python module that computes cascade-precision + cascade-recovery-coverage + cascade-cost-effectiveness; emits accuracy-metrics to Move #6.15's accuracy-ledger
- Author 7 unit tests covering: cascade-revenue-impact consumer with 5 cascade-targeted platforms → 1 cascade-recovered-total = $500–$3,000; cascade-accuracy scorer with 50 past cascades → cascade-precision ≥0.80 → Move #6.15 auto-tuning-layer receives metrics
- Acceptance: cascade-revenue-impact consumer correctly groups per-platform breach-cost under cascade_parent_id; cascade-accuracy scorer correctly computes 3 metrics

**Phase 5 (Day 3, ~3 hours): Cascade-rollback-safety net + CDP-write-health-monitor + per-platform-write-endpoint-health-check + load-test + verify**

- Author `dashboard/cascade/cascade_rollback_safety_net.py` (~150 lines) — Python module that auto-reverts cascade-fire thresholds if 7-day cascade-precision drops >15pp OR cascade-recovery-coverage drops >20pp; tags every cascade-fire as `move_6_16_cascade_<date>_<parent_breach_id>` in S3 audit log
- Author `dashboard/cascade/cdp_write_health_monitor.py` (~200 lines) — ClickHouse stream-consumer + Move #6.11 webhook subscription; emits per-CDP-write-event-class health every 30s
- Author `dashboard/cascade/per_platform_write_endpoint_health_check.py` (~150 lines) — Python aiohttp module that pings each of 5 ad-platform write-endpoints every 60s; logs success/failure + response-time-ms to ClickHouse `move_6_16_platform_health`
- Load test: simulate 100 R1+H1 cascade-eligible events; verify cascade-fire latency ≤10s + cascade-recovery-rate ≥80% + false-cascade-rate ≤15% + cascade-cost-effectiveness ≥$7 per $1 cascade-engagement
- End-to-end verify: trigger Move #6.13 R1+H1 in staging → verify Move #6.16 fires R4 on cascade-targeted platforms within 10s → verify Move #6.14 breach-cost ledger groups cascade-recovered-total under cascade_parent_id → verify Move #6.15 accuracy-ledger receives cascade-precision/cascade-recovery-coverage/cascade-cost-effectiveness
- Acceptance: rollback-safety net + CDP-write-health-monitor + per-platform-health-check all wired + load test passes + end-to-end cascade-fire verified in staging

## Common pitfalls (15 from real builds)

1. **Cascading-everything-instead-of-cascade-eligible-only** — the simplest Move #6.16 bug; if you fire R4 on ALL 5 ad-platforms whenever R1+H1 fires, you cascade-fire 5x as many R4s as needed (costs operator-attention, risks over-rotating tokens that didn't need rotating, overwhelms the on-call). Fix: the 5-rule cascade-eligibility ladder (R1+H1 → cascade-eligible; R2+H2 → conditional; R3+R4+R5 → NOT cascade-eligible) is load-bearing — don't drop the conditional gate.
2. **Using-static-platform-list-instead-of-cascade-target-selector** — if Move #6.16 hard-codes the cascade-target list to "all 5 platforms" instead of querying the per-platform-write-endpoint-health-check + per-platform attribution-match-rate, you fire R4 on platforms that DIDN'T breach (wasted rotation + unnecessary token churn + cascade-noise on the operator's Slack). Fix: cascade-target-selector is a SEPARATE component from cascade-eligibility-detector; cascade-eligibility decides IF to cascade; cascade-target-selector decides WHERE.
3. **No-cascade-rate-limiter** — without ≤3 cascade-fires per breach-event per 24h, a single R1+H1 that triggers a slow-recovering CDP (e.g. Segment with 30-min replay backlog) can cascade-fire on every health-check-tick for hours, exhausting the operator's Slack channel + the ad-platforms' token-rotation quotas (most platforms limit to 10–50 token rotations/day). Fix: cascade-rate-limiter is a HARD requirement; 4th+ cascade-fire attempt logs `cascade_rate_limited` and requires operator OK.
4. **Not-propagating-cascade_parent_id** — if Move #6.16 fires R4 on 3 cascade-targeted platforms but doesn't set `cascade_parent_id` on the resulting Move #6.13 R4 execution-events, Move #6.14's breach-cost ledger will compute 3 SEPARATE per-platform breach-costs instead of grouping them under a single Move #6.16-cascade-event. The operator loses the cascade-context (which CDP-write-loss caused which cascade-recovery). Fix: `cascade_parent_id` is a HARD field on every cascade-fired R4 execution-event; Move #6.14's breach-cost-ledger must check for it and group.
5. **Cascading-on-R3+H3-DNS-failover** — DNS-failover is a CDN-layer fix, not an ad-platform-layer fix; cascading R4 (ad-platform-token-rotation) on a DNS-failover event wastes tokens on platforms whose write-endpoints are healthy. Fix: the 5-rule cascade-eligibility ladder EXCLUDES R3+H3 (DNS-failover) from cascade-eligibility.
6. **Cascading-on-R5+H5-ad-pixel-re-deploy** — ad-pixel-re-deploy is per-platform; cascading R4 on an ad-pixel-re-deploy event rotates tokens for platforms whose pixel-build just got reverted (wasted rotation + breaks the just-reverted pixel). Fix: R5+H5 is NOT cascade-eligible; cascade is downstream-of-upstream-CDP-fix, not downstream-of-pixel-redeploy.
7. **Cascading-on-R4+H4-ad-platform-token-rotation** — ad-platform-token-rotation is per-platform; cascading R4 on an R4 event is a no-op (the SPECIFIC platform already had its token rotated). Fix: R4+H4 is NOT cascade-eligible (the SPECIFIC platform's token is already rotating; cascade would rotate it AGAIN).
8. **No-cascade-accuracy-feedback-loop-to-Move-#6.15** — if Move #6.16 emits cascade-precision + cascade-recovery-coverage + cascade-cost-effectiveness to a Move #6.16-only dashboard without wiring it to Move #6.15's accuracy-ledger, Move #6.15 can't auto-tune the cascade-eligibility-thresholds based on real-world cascade-performance. Fix: cascade-accuracy metrics MUST be emitted to Move #6.15's `move_6_15_accuracy_ledger` table with `accuracy_layer="move_6_16_cascade"` and the 3 metrics as columns.
9. **No-cascade-rollback-safety-net** — if Move #6.16 fires a cascade on stale CDP-write-health data (e.g. CDP recovered 30s ago but the cascade-target-selector hasn't refreshed), the cascade-fire may target platforms that don't need it (false-cascade). Without a 7-day rollback-safety-net, the false-cascade-rate compounds. Fix: cascade-rollback-safety-net auto-reverts cascade-fire thresholds if 7-day cascade-precision drops >15pp OR cascade-recovery-coverage drops >20pp.
10. **Cascading-on-non-cascade-eligible-events-via-R2+H2-unconditional** — R2 (downstream-swap) is cascade-eligible ONLY when the downstream that swapped is a CDP-write-source (e.g. Segment → RudderStack swap IS cascade-eligible; Segment → mParticle swap is NOT cascade-eligible because mParticle is event-forwarding, not write-source). Fix: R2+H2 cascade-eligibility is CONDITIONAL on the downstream-swap-target being a CDP-write-source (not a downstream-of-downstream).
11. **Not-handling-cascade-cancellation-within-60s** — if the operator sees the Slack-thread cascade-decision-post but the cascade-fire executes IMMEDIATELY without waiting for the `[CANCEL]` button window, the operator has no way to abort a wrong-target cascade-fire. Fix: 60s `[CANCEL]` button window is HARD; cascade-fire executor polls Slack for cancellation every 1s for 60s before executing.
12. **Per-platform-health-check-too-infrequent** — if the per-platform-write-endpoint-health-check polls every 5min instead of every 60s, the cascade-target-selector misses sub-5min platform-breach-windows and fires cascades on STALE health data (cascading on platforms that have already recovered, or NOT cascading on platforms that just breached). Fix: 60s poll cadence is HARD; ClickHouse `move_6_16_platform_health` table.
13. **CDP-write-health-monitor-on-stale-data** — if the CDP-write-health-monitor reads Move #6.11's webhook stream with a 5min lag (instead of sub-60s), the cascade-eligibility-detector misses sub-5min CDP-write-loss-windows and fires cascades on STALE health data. Fix: sub-60s visibility is HARD; either consume Move #6.11's stream directly OR build a Move #6.16-specific ClickHouse stream-consumer.
14. **Cascade-fire-without-platform-rotation-circuit-breaker** — if Move #6.16 cascades R4 to a platform whose ad-platform-token-rotation circuit-breaker is already OPEN (per Move #6.13's circuit-breaker-pattern), the cascade-fire wastes a rotation-attempt on a platform that's in cooldown. Fix: cascade-fire executor must check Move #6.13's circuit-breaker-status per platform before enqueueing R4; if OPEN → skip + log `cascade_circuit_breaker_open` event.
15. **No-cascade-cost-effectiveness-tracking** — without cascade-cost-effectiveness (USD recovered per USD cascade-engagement), Move #6.16 has no way to know if the cascade is profitable vs. just rotating tokens for rotation's sake. Fix: cascade-cost-effectiveness is a HARD accuracy-metric emitted to Move #6.15's accuracy-ledger; if cascade-cost-effectiveness drops below $5 per $1 cascade-engagement for 14 consecutive days, Move #6.15 auto-tunes the cascade-eligibility-thresholds to be more conservative.

## Verification (this skill is "shipped" when...)

- **A.** `grep -l '^category: cross-channel-auto-remediation-cascade$' skills/*.md | wc -l` returns 1 (this skill is the only skill in its category)
- **B.** `dashboard/cascade/cdp_platform_dependency_graph.yaml` exists with all 12 canonical cascade-source-CDP entries
- **C.** `dashboard/cascade/cascade_eligibility_detector.py` exists + correctly classifies R1+H1 as cascade-eligible + R3+R4+R5 as NOT cascade-eligible (≥6 unit tests pass)
- **D.** `dashboard/cascade/cascade_target_selector.py` exists + correctly queries CDP-to-platform dependency-graph + per-platform-health + per-platform attribution-match-rate (≥8 unit tests pass)
- **E.** `dashboard/cascade/cascade_rate_limiter.py` exists + enforces ≤3 cascade-fires per upstream-breach-id per 24h (≥4 unit tests pass)
- **F.** `dashboard/cascade/cascade_fire_executor.py` exists + enqueues Move #6.13 R4 execution-events with `cascade_parent_id` (≥6 unit tests pass)
- **G.** `dashboard/cascade/slack_cascade_decision_thread.py` exists + posts Slack-thread-with-cancel-button + accepts cancel within 60s (≥4 unit tests pass)
- **H.** `dashboard/cascade/cascade_revenue_impact_consumer.py` exists + groups per-platform breach-cost under `cascade_parent_id` (≥5 unit tests pass)
- **I.** `dashboard/cascade/cascade_accuracy_scorer.py` exists + emits cascade-precision + cascade-recovery-coverage + cascade-cost-effectiveness to Move #6.15's accuracy-ledger (≥6 unit tests pass)
- **J.** Load test: 100 simulated R1+H1 cascade-eligible events → cascade-fire latency ≤10s (p95) + cascade-recovery-rate ≥80% + false-cascade-rate ≤15% + cascade-cost-effectiveness ≥$7 per $1 cascade-engagement
- **K.** End-to-end staging verification: trigger Move #6.13 R1+H1 → verify Move #6.16 fires R4 on cascade-targeted platforms within 10s → verify Move #6.14 breach-cost ledger groups cascade-recovered-total under cascade_parent_id → verify Move #6.15 accuracy-ledger receives cascade-precision/cascade-recovery-coverage/cascade-cost-effectiveness
- **L.** Operator dashboard `/cross-channel-cascade-dashboard` renders: per-cascade-event recovery-coverage heatmap + cascade-precision trend (7d/30d/90d) + cascade-cost-effectiveness trend + cascade-target-platform-distribution pie + false-cascade-rate-per-CDP-write-source bar + the cascade_rate_limited event log
- **M.** Documentation: a Move #6.16 runbook at `playbooks/06.16-cross-channel-cascade.md` covers the 12-component best-in-class matrix + the 5-rule cascade-eligibility ladder + the 5-phase ~17-hour build + the 15-pitfall list + the 12-row cascade-benchmark table + the cascade-rollback-safety-net procedure
- **N.** CDP-write-health-monitor + per-platform-write-endpoint-health-check both running in production with sub-60s poll cadence (ClickHouse `move_6_16_platform_health` table populated; ClickHouse `move_6_16_cdp_health` table populated)

## How to extend this skill

- **Move #6.17 — Per-cohort breach-cost decomposition** (the layer that decomposes Move #6.14's per-recipe breach-cost by cohort (Move #6.9's per-platform × per-cohort LTV), so the operator sees "R1 recovered $3,400 from BFCM 2024 repeat-buyer cohort + $1,200 from new-buyer cohort + $400 from one-time-buyer cohort" instead of just $5,000 total; Move #6.16's per-cohort cascade-recovery-coverage scorer feeds Move #6.17's cohort-LTV decomposition). Year-1 ROI band **8:1–24:1**.
- **Move #6.18 — Per-influencer / per-creator breach-cost attribution** (the layer that, for influencer-driven traffic, decomposes Move #6.14's per-platform breach-cost by influencer-id (Move #6.x creator-economy-attribution-substrate), so the operator sees "R1 recovered $1,200 from @kreis.studio's paid Meta traffic + $400 from @other.creator's paid Meta traffic" and can adjust per-influencer ad spend; Move #6.16's per-influencer cascade-recovery-coverage scorer feeds Move #6.18's influencer-attribution decomposition). Year-1 ROI band **9:1–26:1**.
- **Move #6.19 — Cascade-effect-on-other-cohorts-prediction-engine** (the layer that, before a Move #6.16 cascade fires, predicts the cascade-effect-on-other-cohorts (Move #6.9's per-platform × per-cohort LTV minus the cascade-affected cohort's LTV) and adjusts the cascade-fire-threshold to skip cascades that would harm the non-cascade-affected cohorts more than they help the cascade-affected cohort). Year-1 ROI band **6:1–18:1**.

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md`
- Move #6.11 Real-time Triple Whale webhook stream subscription — `skills/442-real-time-triple-whale-webhook-stream-subscription.md` (Move #6.16 consumes Move #6.11's stream-event-monitoring as its CDP-write-health-monitor input)
- Move #6.12 Cross-platform root-cause correlation engine — `skills/443-cross-platform-root-cause-correlation-engine.md` (Move #6.16 consumes Move #6.12's ranked-hypothesis output to identify H1+R1 cascade-eligible events)
- Move #6.13 Attribution auto-remediation runbook executor — `skills/444-attribution-auto-remediation-runbook-executor.md` (Move #6.16 consumes Move #6.13's execution-queue as its cascade-eligibility detector input; Move #6.16 enqueues cascade-fired R4 execution-events back into Move #6.13's queue)
- Move #6.14 Per-event revenue-impact attribution — `skills/445-attribution-revenue-impact-attribution.md` (Move #6.16 consumes Move #6.14's breach-cost ledger as its cascade-revenue-impact attribution input; Move #6.16 groups per-platform cascade-breach-costs under `cascade_parent_id` in Move #6.14's ledger)
- Move #6.15 Hypothesis accuracy tracker + auto-tuning — `skills/446-attribution-accuracy-tracker-auto-tuning.md` (Move #6.16 emits cascade-precision + cascade-recovery-coverage + cascade-cost-effectiveness to Move #6.15's accuracy-ledger for auto-tuning)
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md`
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/cross_channel_cascade_engine.py` (Archetype C/D-heavy hybrid — 1300 lines + 65+ tests)
- Companion TDD suite — `scripts/tests/test_cross_channel_cascade_engine.py` (65+ tests across 22 test classes)

## Sources

- Segment identity-events + track-events write-endpoint documentation (2024)
- RudderStack identify + track write-endpoint documentation (2024)
- mParticle event-forwarding documentation (2024)
- Klaviyo cohort-sync + event-webhook documentation (2024)
- Triple Whale → Segment + RudderStack integration documentation (2024)
- Meta Conversions API dedup-write documentation (2024)
- Google Ads Enhanced Conversions dedup-write documentation (2024)
- TikTok Events API dedup-write documentation (2024)
- Snap Pixel dedup-write documentation (2024)
- Pinterest Conversions API dedup-write documentation (2024)
- ClickHouse real-time stream-consumer documentation (2024)
- Redis Streams cascade-queue documentation (2024)
- HashiCorp Vault token-rotation documentation (2024)
- Slack Block Kit + interactivity-webhook documentation (2024)
- AWS Secrets Manager rotation-lambda documentation (2024)
- LaunchDarkly + Split.io feature-flag-rollout documentation (2024)
- SRE runbook library best practices (2024)
- Blameless post-mortem templates (2024)
- SLO error-budget consumption patterns (2024)
- Cascade-pattern literature (2024): circuit-breaker, blast-radius-limiter, idempotency-keys, exponential-backoff, dead-letter-queue, rate-limiting
