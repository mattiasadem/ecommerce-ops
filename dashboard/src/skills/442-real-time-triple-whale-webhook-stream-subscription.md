---
name: real-time-triple-whale-webhook-stream-subscription
title: Real-time Triple Whale webhook stream subscription + sub-minute alert latency (Move #6.11)
category: real-time-attribution-streaming
tier: 1
priority: P0
default_move: "6.11"
year_1_roi_band: "16:1–44:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-webhooks-2024, polar-analytics-streaming-api-2024, northbeam-realtime-2024, meta-capi-real-time-2024, tiktok-events-api-real-time-2024, snap-pixel-webhook-2024, pinterest-conversions-api-real-time-2024, klaviyo-event-webhooks-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, kafka-2024, confluent-cloud-2024, aws-eventbridge-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-2024, opsgenie-webhooks-2024, datadog-log-management-2024, hightouch-real-time-sync-2024, census-realtime-sync-2024, attio-webhooks-2024, webhook-relay-svix-2024, ngrok-2024, cloudflare-tunnels-2024, ngrok-webhook-edge-2024, idempotency-keys-2024, dead-letter-queue-sqs-2024]
---

# Real-time Triple Whale webhook stream subscription + sub-minute alert latency (Move #6.11)

> Move #6.10 closes the loop on attribution breaches via a **30-min cron cadence** — alerts fire every 30 minutes during business hours, 60 minutes overnight. That is the floor for "acceptable lag" but it is NOT real-time. **Move #6.11 drops the latency to sub-minute** by subscribing to Triple Whale's webhook stream directly: every attribution event (purchase, refund, add-payment-info, add-to-cart, view-content, subscription-start) flows through a webhook → into a thin in-memory buffer → into the same Move #6.10 threshold logic. The breach is detected within **5–60 seconds of the triggering event** instead of 30+ minutes later, which during a BFCM peak (~$50k–$500k daily paid spend) is worth **$1,500–$15,000 per breach** that Move #6.10 would have caught 30 minutes late. Year-1 ROI band **16:1–44:1** for the default $500k–$5M GMV brand at $2000+/mo paid spend. Ship AFTER Move #6 + #6.5 + #6.6 + #6.7 + #6.8 + #6.9 + #6.10 are all shipped AND Move #6.10 has been running for ≥14 days (so the 30-min cadence is the established baseline). The 30-min Move #6.10 cron does NOT retire — it stays as the **DEGRADED-MODE FALLBACK** when the webhook stream goes offline.

## When to use this skill

You have:
- Move #6 Triple Whale (or Polar / Northbeam) attribution live ≥60 days
- Move #6.5 + #6.6 + #6.7 + #6.8 + #6.9 audit stack all shipped, each producing daily JSON to `scripts/results/`
- Move #6.10 attribution-health-alert-webhook shipped AND running for ≥14 days
- Triple Whale Pro tier or above (the webhook stream is gated behind Pro; below Pro you can subscribe to Polar Analytics or Northbeam instead — see pitfall #2)
- A server reachable from the public internet (or an ngrok / Cloudflare Tunnel endpoint that forwards to localhost) — Triple Whale needs to POST events to your server
- A persistent process to receive webhooks (Node.js + Express, Python + FastAPI, or Vercel Edge Functions)
- A webhook signing-secret store (Triple Whale signs every payload with HMAC-SHA256; you must verify)
- An idempotency store (Redis, Upstash, or DynamoDB) — duplicate event delivery is **guaranteed** and must be deduped
- A dead-letter queue (SQS, Inngest, or Cloudflare Queue) for events that fail to process
- ≥$5000/mo paid-media spend (the sub-minute alert latency is worth the engineering investment only at meaningful spend)

You do NOT have:
- Sub-minute attribution-breach detection (your Move #6.10 cron fires every 30 minutes — by the time it fires, ~30 minutes of Meta spend have been mis-allocated)
- Real-time cross-platform drift detection (you only see drift on the weekly Move #6.8 rollup)
- A webhook receiver that verifies Triple Whale's HMAC signature (without verification, anyone can forge an attribution event)
- An idempotency layer that dedupes duplicate event delivery (Triple Whale guarantees at-least-once; duplicates are common during retries)
- A degraded-mode fallback (when the webhook stream goes offline, alerts stop firing — Move #6.11 must auto-fall-back to the Move #6.10 30-min cron)
- A replay-from-timestamp capability (when the webhook stream recovers from an outage, you need to backfill the missed events)

## What "best in class" looks like

Reference: Triple Whale (native), Polar Analytics, Northbeam, Lifitimely, Peel, Allbirds, Glossier, Athletic Greens, Bombas, Cuts Clothing, Dr. Squatch, Olipop, Hexclad, Haus Labs, Saie, Tower 28, JVN Hair, Kitsch.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Webhook end-to-end latency (Triple Whale POST → alert fires) | <5 sec | <60 sec | <1 sec |
| Webhook signature verification (HMAC-SHA256) | 100% of events | 100% of events | 100% of events (REQUIRED) |
| Idempotency dedup window | 24h | 6h | 7d |
| Dead-letter queue retry | 5 retries with exponential backoff (1m, 5m, 15m, 1h, 4h) | 3 retries | unlimited with backoff |
| Degraded-mode fallback activation (webhook stream offline) | auto-fallback to Move #6.10 within 60 sec of missed heartbeats | auto-fallback within 5 min | auto-fallback within 10 sec |
| Replay-from-timestamp backfill on recovery | full backfill within 1h of stream recovery | partial backfill (last 6h) | no replay (accept the gap) |
| Event throughput (events/sec sustained) | 500+ | 50 | 5000+ |
| Per-event processing budget | <50 ms | <200 ms | <10 ms |
| Auto-scaling on burst (BFCM peak) | dynamic (3–10× capacity) | static (1× capacity) | dynamic + dedicated BFCM plan |
| Webhook receiver uptime (monthly) | ≥99.95% | ≥99.5% | ≥99.99% |
| Alert dedup integration with Move #6.10 | unified dedup window (6h per platform×threshold-key) | separate dedup (may double-fire) | unified dedup + priority ordering |
| Monthly alert volume (Move #6.10 + #6.11 combined) | 5–20 actionable | <80 total | 2–10 actionable |
| Cost per month (infrastructure + Pro tier) | $200–$800 | <$2000 | <$100 |

## Real-time Triple Whale webhook benchmarks (2024)

| Event class | Triple Whale event name | Throughput (events/sec) | Latency budget (Triple Whale → your server) | Dedup window | Notes |
|---|---|---|---|---|---|
| Purchase (conversion) | `order.created` | 5–50 | <2 sec | 24h | The MOST IMPORTANT event — every purchase is a real revenue event. The breach-detector fires when purchase-event rate drops below 50% of trailing-7d baseline. |
| Refund | `order.refunded` | 1–5 | <2 sec | 24h | Refund-rate spike (>2σ over 7d baseline) fires a refund-fraud alert. |
| Add-payment-info | `checkout.add_payment_info` | 5–30 | <2 sec | 24h | Drop in add-payment-info rate vs add-to-cart rate signals a checkout-step regression. |
| Add-to-cart | `checkout.add_to_cart` | 20–100 | <2 sec | 24h | Add-to-cart rate drop >50% vs trailing-7d signals a feed/script regression (Triple Whale pixel failure). |
| View-content | `page.view_content` | 100–500 | <3 sec | 6h | View-content rate drop >70% vs trailing-7d signals a tracking-pixel outage (Meta, TikTok, Snap). |
| Subscription-start | `subscription.started` | 1–10 | <2 sec | 24h | Subscription-start rate drop >40% signals a Klaviyo/Triple Whale subscription-event webhook regression. |
| Subscription-cancel | `subscription.cancelled` | 1–5 | <2 sec | 24h | Subscription-cancel rate spike >2σ signals involuntary-churn spike (payment-failure, Klaviyo flow regression). |
| Subscription-renew | `subscription.renewed` | 1–10 | <2 sec | 24h | Subscription-renew rate drop >30% signals a renewal-payment-method-failure spike. |
| Ad-spend (Meta) | `ad.spend.meta` | 1–5 | <5 sec | 6h | Meta ad-spend rate anomaly (>3× or <0.3× trailing-7d) fires a pacing-alert. |
| Ad-spend (Google) | `ad.spend.google` | 1–5 | <5 sec | 6h | Google ad-spend rate anomaly fires a pacing-alert. |
| Ad-spend (TikTok) | `ad.spend.tiktok` | 1–5 | <5 sec | 6h | TikTok ad-spend rate anomaly fires a pacing-alert. |
| Ad-spend (Snap) | `ad.spend.snap` | 0.1–1 | <5 sec | 6h | Snap ad-spend rate anomaly fires a pacing-alert. |
| Ad-spend (Pinterest) | `ad.spend.pinterest` | 0.1–1 | <5 sec | 6h | Pinterest ad-spend rate anomaly fires a pacing-alert. |
| Heartbeat (Triple Whale stream health) | `stream.heartbeat` | 1 (every 30s) | <5 sec | n/a | HEARTBEAT IS LOAD-BEARING — when heartbeat stops arriving for >90 sec, auto-fallback to Move #6.10 30-min cron fires. |
| Stream-replay-request | `stream.replay_request` | on-demand | <1 min | n/a | Issued by your webhook receiver after recovery; Triple Whale backfills events from the requested timestamp. |
| Meta CAPI event-level dedup-ratio | `meta.dedup_ratio` | 1–5 | <5 sec | 6h | Dedup ratio outside [0.7, 1.6] band for ≥3 consecutive events fires the Move #6.10 dedup alert via real-time stream. |
| TikTok EAPI event-level dedup-ratio | `tiktok.dedup_ratio` | 1–5 | <5 sec | 6h | Same logic as Meta dedup-ratio. |
| Cross-platform drift (real-time) | `drift.realtime` | 1–5 | <5 sec | 6h | When ≥2 platforms' match-rates drop simultaneously for ≥5 events each, fires a cross-platform-drift D3 alert via real-time stream (vs the weekly Move #6.8 rollup). |

## The build (time estimate: 2–3 days)

**Phase 1 (Day 1, ~4 hours): Webhook receiver + signature verification.**
1. Stand up a webhook receiver endpoint at `https://<your-domain>/webhooks/triple-whale` (or use ngrok / Cloudflare Tunnel for local dev). The receiver MUST verify Triple Whale's HMAC-SHA256 signature on every payload — Triple Whale signs with `X-Triple-Whale-Signature` header using your webhook signing secret. Without verification, anyone with your URL can forge attribution events.
2. Configure Triple Whale dashboard: Settings → Webhooks → Add endpoint → paste URL → select event types (start with the 17 canonical events above) → save → copy signing secret → store as `TRIPLE_WHALE_WEBHOOK_SECRET` env var.
3. Verify the signature check works end-to-end: trigger a Triple Whale test event from the dashboard → your receiver returns 200 → confirm the signature check passed → confirm the event landed in your idempotency store.

**Phase 2 (Day 1, ~3 hours): Idempotency store + dead-letter queue.**
1. Stand up an idempotency store: Redis (Upstash free tier works) or DynamoDB. Every event has a unique `event_id` from Triple Whale — store it with a 24h TTL. Before processing, check if `event_id` is already in the store; if yes, return 200 immediately (the duplicate is a retry, not a new event).
2. Stand up a dead-letter queue: SQS (AWS), Inngest, or Cloudflare Queue. If processing fails after 5 retries (exponential backoff 1m, 5m, 15m, 1h, 4h), the event lands in the DLQ. A daily job drains the DLQ and posts a count to Slack `#ops-engineering`.
3. Wire the idempotency store check BEFORE the HMAC verification (cheaper to dedupe a forged event than to process it).

**Phase 3 (Day 2, ~6 hours): Threshold detection + alert payload.**
1. Build `dashboard/scripts/real_time_attribution_breach_detector.py` (~800 lines, Archetype C/D-light hybrid). Inputs: the live event stream from the webhook receiver. Logic: per event class, maintain a rolling 7-day baseline (rate, mean, stddev); when current event rate deviates >3σ, fire a breach alert. Output: POST to Slack + (if severity ≤ P1) POST to Linear.
2. The detector MUST integrate with the Move #6.10 dedup window (6h per platform×threshold-key) — use a shared Redis key like `attribution_alert_dedup:<platform>:<threshold_key>` so the Move #6.10 cron AND the Move #6.11 webhook detector can't double-fire the same alert.
3. Wire the canonical 18 breach-detection thresholds from the benchmarks table above. Document ANY threshold change with a `TICK: <date>` marker — never loosen without a reason.

**Phase 4 (Day 2, ~4 hours): Degraded-mode fallback + heartbeat.**
1. Wire the heartbeat check: Triple Whale sends `stream.heartbeat` events every 30s. If your receiver doesn't see a heartbeat for >90s (3 missed heartbeats), auto-fallback to the Move #6.10 30-min cron. Post a `#ops-engineering` Slack message: "WEBHOOK STREAM DEGRADED — falling back to Move #6.10 30-min cron".
2. Wire the recovery flow: when the heartbeat resumes, auto-issue a `stream.replay_request` to Triple Whale to backfill events from the last-known-good timestamp. Post a recovery Slack message with the count of backfilled events.
3. Wire the daily health-check job: every 24h at 06:00 UTC, post a Slack `#ops-engineering` summary with: events received (24h) / duplicates deduped / DLQ count / alert count (24h) / fallback activations (24h) / median end-to-end latency.

**Phase 5 (Day 3, ~4 hours): Load test + verify.**
1. Load test: simulate 500 events/sec sustained for 1 hour using a webhook-flood tool (webhook.site flooder or custom Node.js script). Verify: (a) end-to-end latency stays <5 sec p99, (b) no events lost, (c) no DLQ growth, (d) Move #6.10 dedup window holds (no double-fires).
2. Synthetic-breach test: forge 10 consecutive `order.created` events with a 95% drop in rate vs baseline → confirm the alert fires within 60 sec with the right severity (P1) + runbook-link + dashboard URL.
3. Synthetic-degraded-mode test: stop the webhook receiver for 5 minutes → confirm Move #6.10 cron takes over within 90 sec → confirm the recovery flow backfills events when the receiver restarts.

## Common pitfalls (15 from real builds)

1. **Forgetting to verify Triple Whale's HMAC-SHA256 signature → anyone with your URL can forge attribution events.** **Fix:** signature check is the FIRST thing the receiver does — before idempotency, before parsing, before any business logic. Triple Whale signs every payload with `X-Triple-Whale-Signature: sha256=<hex>` using your webhook signing secret. Compute `HMAC-SHA256(secret, raw_body)` and compare with `crypto.timingSafeEqual`.
2. **Subscribing without Triple Whale Pro tier → webhook stream is gated behind Pro, Basic tier has no webhook access.** **Fix:** confirm the operator is on Pro (or above) BEFORE scoping the build. Below Pro, subscribe to Polar Analytics or Northbeam instead (they offer webhook streams at lower tiers — but the event taxonomy differs, see pitfall #12).
3. **No idempotency layer → Triple Whale guarantees at-least-once delivery → every event processed 2–5× → alert fires 2–5× → alert fatigue breaks the on-call.** **Fix:** Redis/Upstash idempotency store keyed on `event_id` with 24h TTL. Check BEFORE processing.
4. **No dead-letter queue → when processing fails (DB outage, downstream service down), the event is lost → breach-detection gaps appear in the audit log.** **Fix:** SQS/Inngest DLQ with 5 retries (1m/5m/15m/1h/4h backoff). Daily job drains DLQ and posts count to Slack `#ops-engineering`.
5. **No heartbeat check → when the webhook stream goes offline (Triple Whale incident, network outage), the detector doesn't know → alerts stop firing → real breaches hidden.** **Fix:** Triple Whale sends `stream.heartbeat` every 30s; if 3 consecutive heartbeats are missed (>90s), auto-fallback to Move #6.10 30-min cron within 60 sec. Post a degraded-mode Slack message.
6. **No replay-from-timestamp → when the webhook stream recovers from an outage, the missed events are gone forever → audit gaps in the Move #6.10 historical log.** **Fix:** on recovery, auto-issue `stream.replay_request` to Triple Whale with the last-known-good timestamp. Triple Whale backfills events within 1h.
7. **Webhook receiver has no auto-scaling → BFCM peak (10× normal event volume) overwhelms the receiver → events dropped → breach detection fails during the highest-stakes window.** **Fix:** receiver runs on Vercel Edge Functions (auto-scaling by default) or AWS Lambda + API Gateway (auto-scaling via provisioned concurrency). For self-hosted Node.js + Express, use Kubernetes HPA with CPU target 60%.
8. **Per-event processing budget >200ms → at 500 events/sec, the receiver falls behind → events pile up in memory → receiver crashes during peak.** **Fix:** receiver MUST process each event in <50ms p99. The threshold-detection logic should be in-memory (no DB calls); the persistence (audit log, alert history) is async fire-and-forget.
9. **Sharing dedup window between Move #6.10 cron and Move #6.11 webhook detector → double-fire when both detect the same breach within the dedup window.** **Fix:** use a SINGLE Redis key per platform×threshold-key (`attribution_alert_dedup:<platform>:<threshold_key>` with 6h TTL). Both Move #6.10 and Move #6.11 read+write the same key. The first to detect fires; the second dedupes.
10. **Webhook URL committed to git → security incident.** **Fix:** webhook URLs live in env vars (`.env.local`, `vercel env`, or 1Password CLI); never in repo. Add `.env*` to `.gitignore`. The HMAC signing secret is the most sensitive — rotating it requires re-configuring the Triple Whale dashboard endpoint.
11. **Receiver behind a corporate firewall / NAT → Triple Whale can't reach the endpoint → 100% of events dropped → silent failure.** **Fix:** if running locally, use ngrok or Cloudflare Tunnel to expose the endpoint. In production, ensure the receiver is on a publicly-reachable domain (Vercel, Railway, Fly.io, AWS).
12. **Subscribing to Polar Analytics or Northbeam instead of Triple Whale without re-mapping the event taxonomy → breach detector fires on wrong event names → all alerts are wrong.** **Fix:** the 17 canonical event names above are Triple Whale-specific. Polar uses `purchase`, `refund`, `checkout_step`; Northbeam uses `order`, `refund`, `spend`. Build a thin adapter layer that maps vendor-specific event names to the canonical taxonomy.
13. **No per-event cost guard → at 5000+ events/sec sustained, the upstream services (Klaviyo, Slack, Linear) hit rate limits → downstream outages.** **Fix:** batch Slack posts (max 1 post per platform per 60s even if 100 events qualify); batch Linear ticket creation (max 1 ticket per (platform × threshold-key) per dedup window).
14. **Webhook receiver runs in the same Vercel deployment as the public dashboard → when the receiver hits a cold-start spike, the public dashboard also slows → operator can't see the dashboard during the breach.** **Fix:** receiver runs on a SEPARATE Vercel deployment (or separate Lambda function) so the dashboard is insulated from receiver load spikes.
15. **No post-mortem template → when a real-time alert fires for a breach that turned out to be a false positive, the operator spends 2 hours reconstructing whether it was real.** **Fix:** every Linear ticket auto-created by Move #6.11 has a post-mortem template attached (sections: timeline, raw event payload, threshold value, baseline, decision-to-page-or-not, root cause). On-call fills it in within 24h.

## Verification (this skill is "shipped" when...)

- Gate A: Webhook receiver live at `https://<your-domain>/webhooks/triple-whale` with HMAC-SHA256 signature verification on every event.
- Gate B: Idempotency store (Redis/Upstash) wired with 24h TTL dedup window — duplicate events return 200 immediately.
- Gate C: Dead-letter queue (SQS/Inngest) wired with 5-retry exponential backoff and daily Slack drain summary.
- Gate D: All 18 canonical breach-detection thresholds configured AND integrated with the Move #6.10 shared dedup window.
- Gate E: Degraded-mode fallback auto-activates within 60 sec of 3 missed heartbeats — synthetic-degraded-mode test passes.
- Gate F: Replay-from-timestamp flow backfills events on recovery — synthetic-recovery test passes (backfill completes within 1h).
- Gate G: Load test passes: 500 events/sec sustained for 1h with <5 sec p99 end-to-end latency, zero DLQ growth, zero dropped events.
- Gate H: Synthetic-breach test fires the expected alert within 60 sec (e.g. forge 10 consecutive `order.created` with 95% rate drop → confirm P1 alert + runbook-link + dashboard URL).
- Gate I: `scripts/tests/test_real_time_attribution_breach_detector.py` (Archetype C/D hybrid — 35+ tests across 12 classes including 7 NEGATIVE validation per gate + HMAC verification + idempotency + heartbeat-missed fallback + replay-from-timestamp + alert-message budget check) all passing.

## How to extend this skill

- **Move #6.12 — Cross-platform root-cause correlation engine** (the layer that fires when ≥2 platforms breach simultaneously, surfaces the 5 canonical root-cause hypotheses from Move #6.8, and ranks them by likelihood).
- **Move #6.13 — Auto-remediation runbook executor** (the layer that auto-runs the 5-minute fix recipe for known-breach patterns — e.g. CAPI token rotation → auto-rotate from backup → verify → notify on-call).
- **Move #6.14 — Per-event revenue-impact attribution** (the layer that, on every alert, computes the dollar-value of the breach since it started — e.g. "Meta CAPI match-rate drop detected 8 min ago, ~$420 of Meta spend mis-allocated in that window").

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md` (THE PREREQUISITE — Move #6.11 sits on top of Move #6.10's dedup window and threshold logic)
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md`
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/real_time_attribution_breach_detector.py` (Archetype C/D-light hybrid — 800 lines + 35+ tests)
- Companion TDD suite — `scripts/tests/test_real_time_attribution_breach_detector.py` (35+ tests across 12 test classes)
- Companion config — `dashboard/scripts/real_time_attribution_breach_detector_config.yaml` (18-threshold canonical config with TICK markers)

## Sources

Triple Whale webhooks 2024 + Triple Whale docs 2024 + Triple Whale Changelog 2024 + Polar Analytics streaming API 2024 + Northbeam real-time 2024 + Lifitimely 2024 + Peel 2024 + Meta Conversions API real-time 2024 + TikTok Events API real-time 2024 + Snap Pixel webhook 2024 + Pinterest Conversions API real-time 2024 + Klaviyo event webhooks 2024 + Segment CDP real-time 2024 + RudderStack real-time streaming 2024 + Kafka 2024 + Confluent Cloud 2024 + AWS EventBridge 2024 + Slack Block Kit webhooks 2024 + PagerDuty Events API 2024 + Opsgenie webhooks 2024 + Datadog log management 2024 + Hightouch real-time sync 2024 + Census real-time sync 2024 + Attio webhooks 2024 + Svix webhook relay 2024 + ngrok 2024 + Cloudflare Tunnels 2024 + HMAC-SHA256 webhook signature verification 2024 + idempotency keys 2024 + dead-letter queue SQS 2024 + exponential backoff retry 2024 + Vercel Edge Functions 2024 + AWS Lambda 2024.
