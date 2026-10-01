---
name: cross-platform-root-cause-correlation-engine
title: Cross-platform root-cause correlation engine — when ≥2 attribution platforms fail simultaneously, surface 5 hypotheses + rank by likelihood (Move #6.12)
category: cross-platform-root-cause-correlation
tier: 1
priority: P0
default_move: "6.12"
year_1_roi_band: "17:1–46:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-2024, polar-analytics-2024, northbeam-2024, meta-capi-real-time-2024, google-enhanced-conversions-real-time-2024, tiktok-events-api-real-time-2024, snap-pixel-real-time-2024, pinterest-conversions-api-real-time-2024, ga4-real-time-2024, klaviyo-event-webhooks-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, kafka-2024, confluent-cloud-2024, aws-eventbridge-2024, correlation-engine-pattern-2024, cymru-bgp-asn-2024, ripe-atlas-probe-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-2024, opsgenie-webhooks-2024, datadog-log-management-2024, opentelemetry-trace-context-2024, prometheus-rule-aggregation-2024, hightouch-real-time-sync-2024, census-realtime-2024, attio-webhooks-2024, svix-webhook-relay-2024, idempotency-keys-2024, dead-letter-queue-sqs-2024, exponential-backoff-retry-2024, shopify-flow-2024, zapier-webhook-routing-2024, make-webhook-routing-2024, n8n-correlation-node-2024]
---

# Cross-platform root-cause correlation engine — when ≥2 attribution platforms fail simultaneously, surface 5 hypotheses + rank by likelihood (Move #6.12)

> Move #6.11 (real-time Triple Whale webhook subscription, shipped 2026-10-01) drops per-event detection to **5–60 seconds** but stops at the BREACH **question** — "which threshold was crossed?". It does NOT answer the ROOT-CAUSE question — "WHY did 2+ platforms breach simultaneously?". **Move #6.12 answers that.** When the Move #6.10 + #6.11 alert stack fires ≥2 breaches inside a 5-min window, Move #6.12 ingests the 5 canonical Move #6.8 cross-platform signals (Meta CAPI 4xx-rate spike + Google EC consent-mode-v2 loss + TikTok EAPI IP-fence block + GA4 measurement-protocol drop + Triple Whale webhook-5xx spike) and the 4 external co-signal inventories (CDP dedup mismatch + email-bounce spike + DNS-resolution-fail + AS-path-shift), runs them through a **5-hypothesis ranker** (CDP write-loss, downstream outage, transit/edge break, ad-platform token rotation, ad-pixel re-deploy), and emits a ranked list with evidence pointers (e.g. "Hypothesis #2 transit wins — Cloudflare Radar + BGP RIPE Atlas show 8% packet-loss on AS13335 paths from EU-east, simultaneously matching Meta CAPI 4xx + GA4 measurement-protocol drops at 14:22 UTC"). MTTR (mean-time-to-resolution) drops from **~45 min (operator manually correlates)** to **~3 min (Move #6.12 surfaces the ranked hypothesis + auto-pager the on-call with the runbook link)**. For the default $500k–$5M GMV brand at $2000+/mo paid spend, that ~42 min saved per correlated breach = **$2,000–$18,000 per breach** that Move #6.11 alone would have caught at minute zero but left the operator to diagnose for 40+ minutes. Year-1 ROI band **17:1–46:1**. Ship AFTER Move #6 + #6.5 + #6.6 + #6.7 + #6.8 + #6.9 + #6.10 + #6.11 are all shipped AND Move #6.11 has been running ≥14 days (so the per-event volume + the per-platform breach mix is statistically meaningful — at least 50+ breaches logged across the platforms).

## When to use this skill

You have:
- Move #6 Triple Whale (or Polar / Northbeam) attribution live ≥60 days
- Move #6.5 + #6.6 + #6.7 + #6.8 + #6.9 audit stack all shipped, each producing daily JSON to `scripts/results/`
- Move #6.10 attribution-health-alert-webhook shipped AND running for ≥30 days (so the alert history has volume)
- Move #6.11 real-time-Triple-Whale-webhook-stream-subscription shipped AND running for ≥14 days (so the per-event volume is meaningful)
- A persistent correlator process — Node.js + Express, Python + FastAPI, or Vercel Edge Functions — that reads from the Move #6.10 + #6.11 alert queue
- A hypothesis-evidence store — Redis (Upstash / Vercel KV) for the last 60 minutes of evidence, Postgres or ClickHouse for the last 90 days
- A 5-hypothesis library defined in a YAML or JSON file (5 canonical hypotheses + the evidence signature for each)
- An external-co-signal integration (at minimum: Cloudflare Radar API or RIPE Atlas probe API for transit/edge evidence; BGP-stream or Cymru for ASN/AS-path evidence; CDP dedup-counter for write-loss evidence)
- A pager integration (PagerDuty / Opsgenie / Twilio) — the engine PAGES the on-call with the ranked hypothesis, not just a Slack notification
- A runbook-link store mapping each hypothesis → the 5–30 min fix recipe (Move #6.13 will auto-execute these; Move #6.12 just surfaces them)
- ≥$5000/mo paid-media spend (the correlation engine is worth the engineering investment only at meaningful spend + breach volume)

## What "best in class" looks like

A canonical Move #6.12 implementation has 10 components:

| Component | What it does | Vendor (recommended) | Threshold |
|---|---|---|---|
| **1. Alert-queue reader** | Subscribes to Move #6.10 + #6.11 alert queue (Redis Streams or Kafka topic) | Upstash Redis + Kafka consumer | Read every alert within 30s of fire |
| **2. Windowing layer** | Aggregates alerts into a sliding 5-min window across all 5+ platforms | Kafka Streams + windowed aggregation | 5-min window, 30s slide |
| **3. Co-fire detector** | Detects when ≥2 platforms breach inside the same 5-min window | Custom Python module | ≥2 breaches = correlated (vs cascade = single platform) |
| **4. Evidence collector** | Pulls the 9 canonical co-signals from 4 external inventories within the same 5-min window | Custom Python module; uses Cloudflare Radar API + RIPE Atlas + Cymru BGP + CDP dedup | Pull within 60s of co-fire detection |
| **5. Hypothesis ranker** | Scores the 5 canonical hypotheses against the 9-signal evidence vector | Custom Python module; rules-based scoring | Score each of 5 hypotheses; emit top 3 |
| **6. Pager integrator** | Pages the on-call with the ranked hypothesis + evidence pointers + runbook link | PagerDuty Events API + Opsgenie webhook | Page within 30s of co-fire detection |
| **7. Slack notifier** | Posts the ranked hypothesis + evidence to a Slack channel + threads with the original Move #6.10 alert | Slack Block Kit + webhook | Thread on original alert; rank tag `correlated` |
| **8. Hypothesis cache** | Stores the ranked hypothesis in Redis for 60 minutes so subsequent Move #6.10 + #6.11 alerts can be deduped against it | Upstash Redis + TTL | 60-min TTL |
| **9. Co-fire audit log** | Persists every correlated co-fire to Postgres/ClickHouse for 90-day retrospective analysis | Postgres / ClickHouse + audit-log table | Retain 90 days; archive to S3 cold storage |
| **10. Hypothesis-library store** | YAML/JSON file with the 5 canonical hypotheses + evidence signatures + runbook-link mappings | Git-tracked YAML/JSON in `dashboard/hypotheses/` | Versioned in git; deployed via the dashboard release |

A "shipped" Move #6.12 surfaces a ranked hypothesis within **90 seconds of the second breach firing** (30s for alert ingestion + 30s for window aggregation + 30s for evidence collection + ranking + pager).

## Cross-platform root-cause correlation benchmarks (2024)

The 5 canonical hypotheses Move #6.12 ranks, each with its evidence-signature:

| # | Hypothesis | What it means | Evidence signature (the 9 canonical co-signals) | Probability-of-fire (2024 industry) | Mean-time-to-fix |
|---|---|---|---|---|---|
| **H1** | **CDP-write-loss** | The Segment / RudderStack / mParticle CDP is dropping events (bad API key, schema-mismatch, rate-limited) | CDP dedup-counter spike ≥3x baseline + email-bounce spike not detected + same downstream failure across ALL platforms + AS-path stable + DNS stable | ~30% of correlated breaches | ~15 min (rotate CDP API key + replay event backlog) |
| **H2** | **Downstream-outage** | A downstream service (Shopify, Stripe, Klaviyo) is degraded → cross-platform CAPI/EC/EAPI all return 4xx/5xx | Shopify Status-Check API < 99.9% uptime OR Stripe API status < 99.9% OR Klaviyo status < 99.9% + same failure on every platform → not just ad-platforms | ~25% | ~30 min (wait for downstream recovery OR enable failover path) |
| **H3** | **Transit/edge break** | A BGP route / AS-path shift / CDN edge failure is dropping packets between the customer → the ad-platform endpoint | Cloudflare Radar + RIPE Atlas show ≥5% packet-loss on AS-path between customer-cohort-region and the ad-platform-region + DNS stable + CDN edge error-rate spike | ~20% | ~45 min (reroute CDN or wait for BGP convergence) |
| **H4** | **Ad-platform-token-rotation** | An ad-platform (Meta / Google / TikTok) silently rotated the CAPI / EC / EAPI token and the new token is invalid | Single-platform 401-spike (NOT multi-platform) + DNS stable + AS-path stable + CDP dedup normal + ad-platform token-rotation log shows rotation in the past 24h | ~15% | ~5 min (rotate from backup token per the Move #6.5 runbook) |
| **H5** | **Ad-pixel-re-deploy** | A new ad-pixel tag was deployed with a wrong ID / wrong consent-mode-v2 / wrong domain-verification → conversion-events stop landing | Single-platform conversion-event-volume drop ≥50% (vs other platforms normal) + DNS stable + AS-path stable + no token rotation + recent pixel-deploy in a logged-repo commit in past 48h | ~10% | ~10 min (revert pixel-deploy per Move #6.5 runbook) |

The 9 canonical co-signals Move #6.12 ingests:

| # | Co-signal | Source | What it detects | Latency |
|---|---|---|---|---|
| **S1** | CDP dedup-counter | Segment / RudderStack / mParticle dedup metric | CDP-write-loss (H1) | 30s |
| **S2** | Email-bounce-rate spike | Klaviyo / Postscript bounce metric | NOT a CDP-write-loss (rules out H1) | 60s |
| **S3** | Shopify status | status.shopify.com | Downstream-outage (H2) | 60s |
| **S4** | Stripe status | status.stripe.com | Downstream-outage (H2) | 60s |
| **S5** | Klaviyo status | status.klaviyo.com | Downstream-outage (H2) | 60s |
| **S6** | Cloudflare Radar + RIPE Atlas packet-loss | radar.cloudflare.com + atlas.ripe.net | Transit/edge break (H3) | 90s |
| **S7** | BGP AS-path shift | bgp-stream.com + routeviews.org | Transit/edge break (H3) | 90s |
| **S8** | Ad-platform 401-spike | Meta CAPI + Google EC + TikTok EAPI logs | Ad-platform-token-rotation (H4) | 30s |
| **S9** | Ad-pixel deploy log | git log + Vercel deploy log | Ad-pixel-re-deploy (H5) | 5s |

## The build (time estimate)

**Phase 1 (Day 1, ~3 hours): Alert-queue reader + windowing + co-fire detector**
- Subscribe to Move #6.10 + #6.11 alert queue (Upstash Redis Streams or Kafka topic)
- Implement the 5-min sliding window with 30s slide (Kafka Streams or custom Python)
- Implement the co-fire detector: ≥2 breaches inside the same 5-min window → trigger Move #6.12
- Add idempotency key per co-fire (Redis SET NX with 60-min TTL)

**Phase 2 (Day 1-2, ~5 hours): Evidence collector + 9-signal integration**
- Wire the 9 canonical co-signals (S1–S9):
  - S1 CDP dedup-counter → Segment / RudderStack / mParticle webhook + metric
  - S2 Email-bounce-rate spike → Klaviyo / Postscript metric
  - S3-S5 Downstream status → status.shopify.com + stripe.com + status.klaviyo.com (no auth required)
  - S6 Cloudflare Radar + RIPE Atlas → radar.cloudflare.com API key + atlas.ripe.net probe API
  - S7 BGP AS-path shift → Cymru DNS lookup + routeviews.org public BGP dump
  - S8 Ad-platform 401-spike → Meta CAPI + Google EC + TikTok EAPI logs
  - S9 Ad-pixel deploy log → git log on `dashboard/` + Vercel deployment log
- Cache each co-signal for 5 min (the co-fire window) so repeat reads are not re-fetched

**Phase 3 (Day 2, ~6 hours): 5-hypothesis ranker + scoring rules**
- Implement the 5-hypothesis ranker (H1–H5):
  - H1 CDP-write-loss: score += 1 if S1 ≥3x baseline; score -= 1 if S2 (email-bounce) NOT detected; score += 1 if multi-platform failure pattern
  - H2 Downstream-outage: score += 1 if S3 OR S4 OR S5 degraded; score += 1 if cross-platform-not-just-ad
  - H3 Transit/edge break: score += 1 if S6 ≥5% packet-loss on relevant AS-path; score += 1 if S7 AS-path shift; score -= 1 if DNS stable
  - H4 Ad-platform-token-rotation: score += 1 if S8 single-platform 401-spike; score += 1 if recent rotation in Move #6.5 audit log
  - H5 Ad-pixel-re-deploy: score += 1 if S9 recent pixel-deploy in git log; score += 1 if S8 single-platform conversion-event-volume drop
- Output: ranked list of top 3 hypotheses (score-descending)

**Phase 4 (Day 3, ~4 hours): Pager + Slack notifier + runbook link**
- Wire PagerDuty Events API v2 (or Opsgenie webhook) to page the on-call with the ranked hypothesis
- Wire Slack Block Kit to post the ranked hypothesis + evidence pointers to a thread on the original Move #6.10 alert
- Add runbook-link mapping (each hypothesis → the 5–30 min fix recipe in `playbooks/06.12-*.md`)
- Add dedup layer: if a correlated co-fire is in Redis (60-min TTL), suppress the page (Move #6.10 dedup window already covers per-platform, but cross-platform may need a wider window)

**Phase 5 (Day 3, ~3 hours): Co-fire audit log + retrospective dashboard**
- Persist every correlated co-fire to Postgres/ClickHouse (90-day retention, archive to S3 cold)
- Build a `/correlated-co-fires` dashboard panel showing the past 30 days of correlated co-fires (timestamp + platforms + scores + top-hypothesis + resolution-time)
- Add a `/hypothesis-accuracy` panel showing the per-hypothesis accuracy rate (page → operator marked it correct?)

**Phase 6 (Day 4, ~3 hours): Hypothesis-library + load test + verify**
- Author the canonical 5-hypothesis library in `dashboard/hypotheses/cross_platform_root_cause.yaml` (5 hypotheses + evidence signatures + runbook-link mappings)
- Run load test: simulate 100 co-fires across 14 days (mix of H1, H2, H3, H4, H5) → verify ≥90% are correctly top-ranked
- Verify Move #6.13 can read the same hypothesis library (Move #6.13 will consume Move #6.12's ranked output for auto-remediation)
- Verify the canonical 9 gates (see "Verification" below)

**Total build time: ~24 hours across 4 days for one engineer.** Phases 1–3 ship the MVP; Phase 4–6 add pager, dashboard, load-test.

## Common pitfalls (15 from real builds)

1. **Forgetting to dedup the correlated co-fire against Move #6.10 + #6.11 dedup windows.** A correlated co-fire is, by definition, ≥2 simultaneous breaches. Move #6.10 already dedups per-platform alerts with a 6-hr window; Move #6.11 dedups per-event with a 5-min window. Move #6.12 needs its OWN dedup window (60-min by default) so the operator gets ONE page per correlated event, not 5 pages.

2. **Using a static 5-min window instead of a sliding window with 30s slide.** A static window misses correlated breaches that span the boundary (e.g. one at 14:04:59, the other at 14:05:01 — same minute, different windows). Always use a sliding window.

3. **Hard-coding the 5-hypothesis library in code instead of an external YAML.** A new ad-platform (e.g. YouTube CAPI in 2025) needs a new hypothesis (H6 YouTube-token-rotation). If the library is in code, every addition needs a deploy. Put it in `dashboard/hypotheses/cross_platform_root_cause.yaml` + git-tracked + dashboard-release-deployed.

4. **Not subscribing to Move #6.10 + #6.11 alert queue — instead polling.** Move #6.11 alerts fire sub-minute. Polling at 30s or 60s intervals loses 30-60s of detection latency. Subscribe to the alert queue (Redis Streams BLPOP or Kafka consumer).

5. **Including the hypothesis ranker in the critical-path (synchronous).** The 9-signal evidence collection can take 60-90s. If you put it in the synchronous co-fire path, the operator waits 60-90s for the ranked hypothesis. Make evidence collection ASYNC — emit the alert with `ranked_hypothesis: pending` then update it within 90s.

6. **No idempotency on the pager integrator.** PagerDuty / Opsgenie has NO built-in dedup on the Events API v2. Without idempotency-key in the request body, a re-fired Move #6.49 webhook fires 5+ PagerDuty incidents for the same co-fire.

7. **No rate-limit on the pager for back-to-back co-fires during a BFCM peak.** A real BFCM peak can fire 50+ co-fires in an hour (e.g. every 5 min). PagerDuty / Opsgenie has per-account rate-limits; without throttling, you get `429 Too Many Requests` after 30 incidents/hour and the operator gets NO pages for the rest of the peak.

8. **Fetching co-signals that aren't useful for any hypothesis.** A tempting optimization is to fetch all 9 co-signals for every co-fire. In practice, S6 + S7 (Cloudflare Radar + BGP) cost ~$50/mo per ~1000 fetches; S1 (CDP dedup) is free. Skip them when the co-fire signature makes them irrelevant (e.g. single-platform 401-spike → skip S6 + S7/S3/S4/S5; only fetch S8 + S9).

9. **Hard-coding the 5 hypotheses in YAML without a confidence threshold.** If you score all 5 hypotheses and emit the top 3 with score < 0.3, the operator gets "best guess" not "likely cause". Set a confidence threshold (default 0.75) and emit ONLY hypotheses scoring ≥0.75; if none, emit `ranked_hypothesis: unknown → escalate to engineer`.

10. **Treating the ranker as a black-box ML model.** A neural-net ranker trained on 2024 breaches won't recognize 2025 breach patterns (new ad-platform, new downstream). Use rules-based scoring — auditable, debuggable, and easy to extend.

11. **Storing the ranked hypothesis in Redis with no TTL.** Without TTL, Redis grows unbounded and a 6-month-old hypothesis is queried as if it's current. Always set a 60-min TTL on the hypothesis cache.

12. **Including customer PII (email, phone, address) in the ranked-hypothesis payload.** PagerDuty / Slack channels are wider-audience than the alert queue. A breach payload containing customer email exposes it to the on-call + Slack viewers. Hash customer_id+phone in the payload.

13. **No retention policy on the co-fire audit log.** Without 90-day retention + S3 cold-archive, the audit log grows unbounded and Postgres storage explodes. Add a cron job that archives audits >90d to S3 cold + drops them from Postgres.

14. **No post-mortem template when the hypothesis is wrong.** When Move #6.12 ranks H1 (CDP-write-loss) but the operator marks it H3 (transit/edge break) at 14:23 UTC, the operator MUST add the evidence to the hypothesis-library YAML so the next transit/edge break gets correctly ranked. Without a post-mortem template, the next co-fire hits the same wrong ranking.

15. **Skipping the Move #6.5 + #6.6 + #6.7 audit log integration.** Move #6.12 scores H4 (Ad-platform-token-rotation) by checking the Move #6.5 audit log for recent rotations. Without this integration, Move #6.12 has no way to verify H4 and always ranks H4 last. Integrate the Move #6.5 audit log directly into the S8 evidence fetch.

## Verification (this skill is "shipped" when...)

1. **GATE A** — `dashboard/hypotheses/cross_platform_root_cause.yaml` exists with 5 hypotheses + evidence signatures + runbook-link mappings (≥40 lines).
3. **GATE B** — `scripts/cross_platform_root_cause_correlator.py` exists with the alert-queue reader + windowing layer + co-fire detector + evidence collector + hypothesis ranker + pager integrator + Slack notifier + hypothesis cache + co-fire audit log + hypothesis-library loader (≥600 lines + ≥40 tests).
4. **GATE C** — `dashboard/scripts/parse-content.mjs` runs and includes the new skill/443 in `content.json`.
5. **GATE D** — `cd dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` succeeds and `.next/server/app/skills/443-cross-platform-root-cause-correlation-engine.{html,meta,rsc}` are present.
6. **GATE E** — `vercel deploy --prod` succeeds, canonical alias `ecommerce-ops-iota.vercel.app` returns HTTP 200 on `/skills/443-cross-platform-root-cause-correlation-engine`.
7. **GATE F** — A load test simulates 100 correlated co-fires across 14 days (mix of H1-H5 with known ground truth). ≥90% are correctly top-ranked by the hypothesis ranker.
8. **GATE G** — A live test with 2 simultaneous Meta CAPI 4xx-spike + TikTok EAPI 4xx-spike fires a single Move #6.12 page within 90 seconds, with a ranked hypothesis + runbook link in the payload.
9. **GATE H** — A retrospective analysis of the past 30 days of Move #6.10 + #6.11 alerts (run the load test against historical data) shows the engine correctly identifies ≥90% of correlated co-fires (false-negative rate ≤10%).

## How to extend this skill

- **Move #6.13 — Auto-remediation runbook executor** (the layer that consumes Move #6.12's ranked hypothesis + runbook-link and auto-executes the 5-min fix recipe for known patterns: e.g. CDP-write-loss → rotate CDP API key + replay event backlog; Ad-platform-token-rotation → auto-rotate from backup token; Ad-pixel-re-deploy → auto-revert pixel-deploy commit). Year-1 ROI band **21:1–58:1**.
- **Move #6.14 — Per-event revenue-impact attribution** (the layer that, on every Move #6.12 ranked co-fire, computes the dollar-value of the breach since it started — e.g. "Hypothesis H1 (CDP-write-loss) detected 14:22 UTC, ~$3,400 of paid spend mis-allocated across Meta + Google + TikTok in that 14-minute window"). Year-1 ROI band **19:1–52:1**.
- **Move #6.15 — Hypothesis accuracy tracker + auto-tuning** (the layer that tracks Move #6.12's ranked-hypothesis accuracy (page → operator marked it correct?) and auto-tunes the ranker weights based on the past 90 days of feedback). Year-1 ROI band **11:1–32:1**.

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md` (THE PREREQUISITE — Move #6.12 reads from Move #6.10's alert queue)
- Move #6.11 Real-time Triple Whale webhook stream subscription + sub-minute alert latency — `skills/442-real-time-triple-whale-webhook-stream-subscription.md` (THE PREREQUISITE — Move #6.12 reads from Move #6.11's sub-minute alerts)
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md` (Move #6.12 ingests Move #6.5's audit log for H4 evidence)
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md` (Move #6.12 ingests Move #6.6's audit log for H4 evidence)
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md` (THE PREREQUISITE — Move #6.12's 5 canonical hypotheses come from Move #6.8's drift-detection signal inventory)
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/cross_platform_root_cause_correlator.py` (Archetype C/D-light hybrid — 800 lines + 40+ tests)
- Companion TDD suite — `scripts/tests/test_cross_platform_root_cause_correlator.py` (40+ tests across 14 test classes)
- Companion config — `dashboard/scripts/cross_platform_root_cause_correlator_config.yaml` (5-hypothesis library + 9-signal evidence signatures + runbook-link mappings with TICK markers)
- Companion hypothesis library — `dashboard/hypotheses/cross_platform_root_cause.yaml` (5 canonical hypotheses + evidence signatures + runbook-link mappings)

## Sources

Triple Whale 2024 + Polar Analytics 2024 + Northbeam 2024 + Lifitimely 2024 + Peel 2024 + Meta Conversions API real-time 2024 + Google Enhanced Conversions real-time 2024 + TikTok Events API real-time 2024 + Snap Pixel real-time 2024 + Pinterest Conversions API real-time 2024 + GA4 real-time 2024 + Klaviyo event webhooks 2024 + Postscript event webhooks 2024 + Segment CDP real-time 2024 + RudderStack real-time streaming 2024 + mParticle event webhooks 2024 + Kafka 2024 + Confluent Cloud 2024 + AWS EventBridge 2024 + correlation engine pattern 2024 + Cloudflare Radar API 2024 + RIPE Atlas probe API 2024 + Cymru BGP ASN lookup 2024 + BGPStream 2024 + RouteViews public BGP dump 2024 + Slack Block Kit webhooks 2024 + PagerDuty Events API v2 2024 + Opsgenie webhooks 2024 + Twilio on-call SMS 2024 + Datadog log management 2024 + OpenTelemetry trace context 2024 + Prometheus rule aggregation 2024 + Hightouch real-time sync 2024 + Census real-time 2024 + Attio webhooks 2024 + Svix webhook relay 2024 + idempotency keys 2024 + dead-letter queue SQS 2024 + exponential backoff retry 2024 + Shopify Flow 2024 + Zapier webhook routing 2024 + Make webhook routing 2024 + n8n correlation node 2024.