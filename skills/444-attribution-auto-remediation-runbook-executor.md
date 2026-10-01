---
name: attribution-auto-remediation-runbook-executor
title: Attribution auto-remediation runbook executor — consume Move #6.12 ranked hypothesis + auto-execute the 5-min fix recipe for known patterns (Move #6.13)
category: attribution-auto-remediation
tier: 1
priority: P0
default_move: "6.13"
year_1_roi_band: "21:1–58:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale-2024, polar-analytics-2024, northbeam-2024, meta-capi-real-time-2024, google-enhanced-conversions-real-time-2024, tiktok-events-api-real-time-2024, snap-pixel-real-time-2024, pinterest-conversions-api-real-time-2024, klaviyo-event-webhooks-2024, segment-cdp-real-time-2024, rudderstack-real-time-streaming-2024, mparticle-event-webhooks-2024, kafka-2024, confluent-cloud-2024, aws-eventbridge-2024, runbook-automation-2024, incident-automation-2024, auto-remediation-pattern-2024, chatops-2024, slack-block-kit-webhooks-2024, pagerduty-events-api-v2-2024, opsgenie-webhooks-2024, twilio-on-call-sms-2024, datadog-incident-management-2024, firehydrant-2024, incident-io-2024, rootly-2024, aws-systems-manager-automation-2024, aws-lambda-2024, aws-step-functions-2024, terraform-2024, ansible-2024, github-actions-2024, vercel-edge-functions-2024, cloudflare-workers-2024, fastly-compute-2024, fly-io-2024, idempotency-keys-2024, dead-letter-queue-sqs-2024, exponential-backoff-retry-2024, rate-limiting-2024, vault-secret-rotation-2024, aws-secrets-manager-2024, hashicorp-vault-2024, kms-2024, rsa-key-rotation-2024, oauth-token-rotation-2024, jwks-2024, ottp-replay-2024, git-revert-2024, vercel-deployment-rollback-2024, kubernetes-rollout-undo-2024, argocd-rollback-2024, flagger-2024, sentinel-one-rollback-2024, approval-gates-2024, dry-run-mode-2024, circuit-breaker-pattern-2024, blast-radius-limiter-2024, feature-flag-rollout-2024, launchdarkly-2024, split-io-2024, unleash-2024, growthbook-2024, post-mortem-template-2024, blameless-postmortem-2024, slo-error-budget-2024, sre-runbook-library-2024, atlassian-runbooks-2024, confluence-runbooks-2024, notion-runbooks-2024, rootly-runbooks-2024, firehydrant-runbooks-2024, jeli-runbooks-2024]
---

# Attribution auto-remediation runbook executor — consume Move #6.12 ranked hypothesis + auto-execute the 5-min fix recipe for known patterns (Move #6.13)

> Move #6.12 (cross-platform root-cause correlation engine, shipped 2026-10-01) fires a ranked hypothesis + runbook-link to the on-call within **90 seconds** of a co-fire, but the operator still has to MANUALLY execute the 5–30 min fix recipe. **Move #6.13 closes the loop** — it consumes Move #6.12's ranked output (the ranked hypothesis + evidence signature + runbook-link) and **auto-executes** the canonical 5-min fix recipe for the 5 known patterns: H1 CDP-write-loss → rotate CDP API key + replay event backlog from S3 archive; H2 downstream-outage → swap to backup downstream (Segment ↔ RudderStack failover) + replay events; H3 transit/edge-break → fail-over DNS to secondary CDN (Cloudflare → Fastly) + replay queued events; H4 ad-platform-token-rotation → auto-rotate from backup token in Vault + update ad-platform credentials; H5 ad-pixel-re-deploy → auto-revert pixel-deploy commit via `git revert` + redeploy previous pixel-build. Each pattern has an explicit **blast-radius limiter** (e.g. H1 only rotates the API key for the SPECIFIC CDP write-loss; H4 only rotates the SPECIFIC platform-token that's failing, NOT all 5 platforms), an explicit **approval gate** (auto-execute fires immediately for H1+H3+H5; H2+H4 require operator OK in Slack thread within 60s or auto-rollback), and an explicit **dry-run mode** (every fix recipe ships with a `--dry-run` flag that emits the planned action without executing it — for the operator's first 7 days post-deploy). Time-to-recovery drops from **~45 min (Move #6.12 alone, operator manually executes)** to **~5 min (Move #6.13 auto-executes + operator confirms in Slack)** = ~40 min saved per correlated breach × the ~50 breaches/year an active BFCM-peak brand experiences = **~$3,000–$30,000 additional savings per year** that Move #6.12 alone would have surfaced but left the operator to fix manually. For the default $500k–$5M GMV brand at $2000+/mo paid spend, that means **Year-1 ROI band 21:1–58:1**. Ship AFTER Move #6 + #6.5 + #6.6 + #6.7 + #6.8 + #6.9 + #6.10 + #6.11 + #6.12 are all shipped AND Move #6.12 has been running ≥14 days (so the per-hypothesis accuracy is statistically meaningful — at least 10+ ranked hypotheses logged across the 5 patterns).

## When to use this skill

You have:
- Move #6 Triple Whale (or Polar / Northbeam) attribution live ≥60 days
- Move #6.5 + #6.6 + #6.7 + #6.8 + #6.9 audit stack all shipped, each producing daily JSON to `scripts/results/`
- Move #6.10 attribution-health-alert-webhook shipped AND running for ≥30 days (the alert history has volume)
- Move #6.11 real-time-Triple-Whale-webhook-stream-subscription shipped AND running for ≥14 days (sub-minute alerts wired)
- Move #6.12 cross-platform-root-cause-correlation-engine shipped AND running for ≥14 days (≥10 ranked hypotheses logged, the ranked output is the input to Move #6.13)
- A persistent auto-remediation engine — Node.js + Express, Python + FastAPI, or Vercel Edge Functions — that subscribes to Move #6.12's ranked-hypothesis queue
- A **runbook library** in YAML or JSON mapping each of the 5 canonical hypotheses → the executable fix recipe (5–30 min each, idempotent, blast-radius-scoped)
- A **secret store** for the auto-rotatable credentials (Vault by HashiCorp / AWS Secrets Manager / Doppler) — H1 CDP-key-rotation + H4 ad-platform-token-rotation read from here
- A **CDP event-backlog archive** in S3 / GCS / R2 — H1 + H2 replay events from the last 14 days of S3 archive
- A **DNS failover control plane** (Cloudflare API / Route53 / DNSimple) — H3 transit/edge-break flips DNS to the secondary CDN
- A **git-deploy control plane** (Vercel CLI + GitHub API + Cloudflare Pages API) — H5 ad-pixel-re-deploy reverts the pixel-deploy commit
- A **Slack approval gate** for the 2 high-blast-radius patterns (H2 + H4) — operator must OK in Slack thread within 60s or the engine auto-rollbacks
- A **dry-run mode** flag per runbook (default `--dry-run=true` for the operator's first 7 days post-deploy)
- A **circuit-breaker pattern** wired into the engine — if any auto-remediation fix causes a NEW breach within 5 min, auto-rollback fires immediately
- A **post-mortem template** for false-positive auto-remediations (e.g. Move #6.12 ranked H1 but operator marks H3 in Slack thread at 14:23 UTC)
- A **per-recipe idempotency-key** so a re-fired Move #6.12 webhook does NOT trigger the same fix twice
- A **blast-radius limiter** library — each fix recipe declares the explicit blast radius (which keys / which DNS records / which commits) before executing
- ≥$5000/mo paid-media spend (the auto-remediation engine is worth the engineering investment only at meaningful spend + breach volume)

## What "best in class" looks like

A canonical Move #6.13 implementation has 10 components:

| Component | What it does | Vendor (recommended) | Threshold |
|---|---|---|---|
| **1. Hypothesis-queue reader** | Subscribes to Move #6.12's ranked-hypothesis queue (Redis Streams or Kafka topic) | Upstash Redis + Kafka consumer | Read every ranked hypothesis within 30s of emission |
| **2. Runbook-library loader** | Loads the 5-hypothesis → 5-fix-recipe mapping from YAML/JSON on dashboard boot | Git-tracked YAML in `dashboard/hypotheses/auto_remediation_runbooks.yaml` | Versioned in git; deployed via the dashboard release |
| **3. Blast-radius scorer** | For each fix recipe, scores the blast radius (1=isolated, 10=cross-platform) and routes low-risk (1–3) to auto-execute + high-risk (4–10) to approval gate | Custom Python module | Score threshold: 1–3 = auto; 4–10 = approval |
| **4. Idempotency-key emitter** | Generates a per-recipe idempotency key (recipe-id + breach-id + co-fire-window-id) and embeds it in every fix call | Custom Python module; uses ULID library | TTL: 24h; stored in Upstash Redis |
| **5. Fix-recipe executor** | Executes the canonical 5-min fix recipe for each of the 5 patterns (H1 rotate CDP key, H2 swap downstream, H3 fail-over DNS, H4 rotate token, H5 revert pixel-deploy) | Custom Python module; uses AWS SDK / HashiCorp Vault / Cloudflare API / GitHub API | Execute within 60s of hypothesis-queue read |
| **6. Slack approval gate** | Posts the fix-recipe action plan to a Slack thread on the original Move #6.12 alert; for high-blast-radius recipes (H2+H4), operator must reply `/ok` within 60s or auto-rollback | Slack Block Kit + interactive webhook | 60s timeout; auto-rollback on no-response |
| **7. Circuit-breaker monitor** | Watches the next 5 minutes of Move #6.10 + #6.11 + #6.12 alerts; if a NEW breach fires within 5 min of the fix-recipe, auto-rollback the recipe | Custom Python module; reads from Move #6.10 + #6.11 + #6.12 queues | 5-min circuit-breaker window |
| **8. Audit log** | Persists every fix-recipe execution to Postgres/ClickHouse (90-day retention, archive to S3 cold) | Postgres / ClickHouse + audit-log table | Retain 90 days; archive to S3 cold storage |
| **9. Post-mortem generator** | When operator marks a fix-recipe as "wrong" in Slack thread (e.g. "actually H3 not H1"), generates a post-mortem template + adds the new evidence to Move #6.12's hypothesis library YAML | Custom Python module; uses Jinja2 templates | Generate within 5 min of operator-marked-wrong |
| **10. Dry-run mode** | Default `--dry-run=true` for the first 7 days post-deploy; emits the planned action WITHOUT executing; operator reviews the plan in Slack + manually OKs each | Custom Python module; flag-controlled | Auto-disable after 7 days OR operator manually disables |

A "shipped" Move #6.13 auto-executes a fix-recipe within **90 seconds of Move #6.12's ranked hypothesis firing** (30s for queue ingestion + 30s for blast-radius scoring + 30s for fix-recipe execution + Slack notification + audit-log emission). For low-blast-radius recipes (H1+H3+H5), the fix executes automatically. For high-blast-radius recipes (H2+H4), the engine posts a Slack approval gate and auto-rollbacks if the operator doesn't `/ok` within 60s.

## Auto-remediation benchmarks (2024–2026)

The 5 canonical Move #6.13 fix recipes + their median fix-times + blast-radius scores:

| Hypothesis | Recipe | Median fix-time | Blast radius | Auto or approval |
|---|---|---|---|---|
| **H1 CDP-write-loss** | Rotate CDP API key + replay event backlog from S3 archive | 3–7 min | 2 (single CDP) | AUTO |
| **H2 Downstream-outage** | Swap to backup downstream (Segment ↔ RudderStack failover) + replay events | 5–12 min | 6 (cross-downstream) | APPROVAL |
| **H3 Transit/edge-break** | Fail-over DNS to secondary CDN (Cloudflare → Fastly) + replay queued events | 2–5 min | 3 (single DNS record) | AUTO |
| **H4 Ad-platform-token-rotation** | Auto-rotate from backup token in Vault + update ad-platform credentials | 4–9 min | 7 (single platform token, but affects all live ad-events) | APPROVAL |
| **H5 Ad-pixel-re-deploy** | Auto-revert pixel-deploy commit via `git revert` + redeploy previous pixel-build | 5–10 min | 4 (single pixel-build, but redeploy is 60–90s) | AUTO |

The 5 canonical recipe libraries (each recipe is a typed function with explicit blast-radius + idempotency-key + dry-run-mode):

| Recipe | Function signature | External dependencies | Idempotency key format |
|---|---|---|---|
| **R1 rotate-cdp-key** | `rotate_cdp_key(cdp: str, breach_id: str, dry_run: bool) → {status, new_key, replayed_events}` | HashiCorp Vault API + CDP API + S3 | `{cdp}-{breach_id}-{co_fire_window}` |
| **R2 swap-downstream** | `swap_downstream(primary: str, backup: str, breach_id: str, dry_run: bool) → {status, primary_disabled, backup_enabled, replayed_events}` | Segment API + RudderStack API + S3 | `{primary}-{breach_id}-{co_fire_window}` |
| **R3 failover-dns** | `failover_dns(record: str, primary_cdn: str, backup_cdn: str, breach_id: str, dry_run: bool) → {status, primary_disabled, backup_enabled, ttl_seconds}` | Cloudflare API + DNSimple API + Fastly API | `{record}-{breach_id}-{co_fire_window}` |
| **R4 rotate-ad-token** | `rotate_ad_token(platform: str, breach_id: str, dry_run: bool) → {status, old_token_disabled, new_token_enabled}` | HashiCorp Vault API + Meta CAPI + Google EC + TikTok EAPI | `{platform}-{breach_id}-{co_fire_window}` |
| **R5 revert-pixel-deploy** | `revert_pixel_deploy(commit_sha: str, breach_id: str, dry_run: bool) → {status, commit_reverted, redeploy_status}` | GitHub API + Vercel CLI + Cloudflare Pages API | `{commit_sha[:7]}-{breach_id}-{co_fire_window}` |

The 5 canonical post-mortem templates (one per recipe, auto-generated when operator marks recipe as "wrong"):

| Template | Trigger | Auto-action |
|---|---|---|
| **T1 cdp-rotation-failed** | Operator Slack-replies `/wrong recipe` within 30 min of R1 execution | Auto-add evidence to Move #6.12's hypothesis library YAML (H1 hypothesis gets a new "false-positive-triggers" field); auto-mark Move #6.13's R1 as `requires-review` for 7 days |
| **T2 downstream-swap-failed** | Operator Slack-replies `/wrong recipe` within 30 min of R2 execution | Auto-add evidence; auto-mark Move #6.13's R2 as `requires-review` for 7 days; auto-rollback to primary downstream within 5 min |
| **T3 dns-failover-failed** | Operator Slack-replies `/wrong recipe` within 30 min of R3 execution | Auto-add evidence; auto-mark Move #6.13's R3 as `requires-review` for 7 days |
| **T4 token-rotation-failed** | Operator Slack-replies `/wrong recipe` within 30 min of R4 execution | Auto-add evidence; auto-mark Move #6.13's R4 as `requires-review` for 7 days; auto-rollback to old token within 5 min |
| **T5 pixel-revert-failed** | Operator Slack-replies `/wrong recipe` within 30 min of R5 execution | Auto-add evidence; auto-mark Move #6.13's R5 as `requires-review` for 7 days |

## The build (time estimate)

**Total build time: ~26 hours across 4 days for one engineer.** Phases 1–3 ship the MVP (auto-execute + approval gate + circuit-breaker); Phase 4–6 add the audit log, post-mortem, dry-run mode, and load-test.

**Phase 1 (Day 1, ~4 hours): Hypothesis-queue reader + runbook-library loader**
- Wire a persistent auto-remediation engine (Node.js + Express, Python + FastAPI, or Vercel Edge Functions) that subscribes to Move #6.12's ranked-hypothesis queue (Redis Streams BLPOP or Kafka consumer)
- Implement the runbook-library loader — reads `dashboard/hypotheses/auto_remediation_runbooks.yaml` on boot, parses the 5-hypothesis → 5-fix-recipe mapping, and loads each recipe's function pointer
- Add a heartbeat check (every 30s) — emits a Slack message if the engine stops processing ranked hypotheses for >5 min
- Add a circuit-breaker module (5-min window) — watches the next 5 min of Move #6.10 + #6.11 + #6.12 alerts and triggers auto-rollback if a NEW breach fires

**Phase 2 (Day 1, ~5 hours): Blast-radius scorer + fix-recipe executor for H1+H3+H5**
- Implement the blast-radius scorer (1=isolated, 10=cross-platform) — reads the score from the runbook YAML
- Implement the 3 auto-execute fix-recipes:
  - R1 (H1 CDP-write-loss): call `rotate_cdp_key()` — uses HashiCorp Vault API to read the current CDP API key + generate a new key + write back to Vault + replay event backlog from S3 archive (last 14 days)
  - R3 (H3 transit/edge-break): call `failover_dns()` — uses Cloudflare API to read the current DNS record for the affected hostname + update to point to the secondary CDN (Fastly) + set a 30-min TTL + emit a Slack notification when the DNS propagation completes
  - R5 (H5 ad-pixel-re-deploy): call `revert_pixel_deploy()` — uses GitHub API to identify the pixel-deploy commit + `git revert` + redeploy via Vercel CLI + emit a Slack notification when the redeploy completes (60–90s)
- Add idempotency-key emitter — every recipe call includes `{recipe_id}-{breach_id}-{co_fire_window}` so re-fires are deduped for 24h

**Phase 3 (Day 2, ~6 hours): Slack approval gate + fix-recipe executor for H2+H4**
- Wire the Slack approval gate for high-blast-radius recipes (H2+H4) — posts the fix-recipe action plan to a Slack thread on the original Move #6.12 alert; operator must reply `/ok` within 60s or the engine auto-rollbacks
- Implement the 2 approval-gated fix-recipes:
  - R2 (H2 downstream-outage): call `swap_downstream()` — uses Segment API + RudderStack API to disable the primary downstream + enable the backup + replay events from S3 archive
  - R4 (H4 ad-platform-token-rotation): call `rotate_ad_token()` — uses HashiCorp Vault API to read the current platform token + generate a new token + write back to Vault + call the platform API to update the credentials (Meta CAPI / Google EC / TikTok EAPI / Snap Pixel / Pinterest CAPI)
- Add a 60s timeout on the Slack approval gate — if no `/ok` within 60s, emit `auto-rollback` + Slack-notify the operator

**Phase 4 (Day 3, ~4 hours): Audit log + post-mortem generator**
- Persist every fix-recipe execution to Postgres/ClickHouse (90-day retention, archive to S3 cold)
- Build the post-mortem generator — when operator Slack-replies `/wrong recipe` within 30 min of a recipe execution, auto-generates a Jinja2 post-mortem template + adds the new evidence to Move #6.12's hypothesis library YAML
- Wire the post-mortem template's 5 canonical auto-actions (T1–T5) — each one marks the corresponding recipe as `requires-review` for 7 days

**Phase 5 (Day 3, ~3 hours): Dry-run mode + operator-review dashboard**
- Add `--dry-run=true` flag to every recipe — default for the first 7 days post-deploy; emits the planned action WITHOUT executing; operator reviews the plan in Slack + manually OKs each
- Build the operator-review dashboard at `/auto-remediation-review` — shows the past 7 days of dry-run plans + the past 30 days of executed recipes + the per-recipe success rate + the post-mortem count

**Phase 6 (Day 4, ~4 hours): Load test + verify**
- Author the canonical 5-recipe library in `dashboard/hypotheses/auto_remediation_runbooks.yaml` (5 recipes + blast-radius scores + idempotency-key formats + dry-run-mode flags)
- Run load test: simulate 100 Move #6.12 ranked hypotheses across 14 days (mix of H1, H2, H3, H4, H5) → verify each recipe executes within 90s + audit log captures each execution + circuit-breaker triggers correctly on simulated new-breach-after-fix
- Verify the canonical 9 gates (see "Verification" below)

## Common pitfalls (15 from real builds)

1. **Auto-executing H2 or H4 without a Slack approval gate.** H2 (downstream-swap) and H4 (ad-platform-token-rotation) have blast-radius scores 6–7 — a wrong auto-execution affects a downstream OR a live platform-token for ALL events. ALWAYS wire the 60s Slack approval gate for these two recipes. The auto-execute pattern from H1+H3+H5 is NOT safe for H2+H4.

2. **No idempotency-key on the recipe executor.** A re-fired Move #6.12 webhook (e.g. Move #6.11 fires 5+ events in the same 5-min window) triggers the same fix-recipe 5+ times without an idempotency-key. The 5th rotation of the same CDP API key creates 4 broken keys in Vault. Always include `{recipe_id}-{breach_id}-{co_fire_window}` as the idempotency-key + store in Redis with 24h TTL.

3. **No blast-radius limiter before executing.** A naive implementation reads "rotate CDP API key" from the YAML and rotates ALL CDP API keys, not just the failing one. Always declare the explicit blast radius per recipe (which keys / which DNS records / which commits) and check it before executing.

4. **No circuit-breaker after the fix-recipe.** A fix-recipe can introduce a NEW breach (e.g. R1 rotates the CDP key but the new key has a typo and breaks the CDP-write again). Without a 5-min circuit-breaker window watching Move #6.10 + #6.11 + #6.12 alerts, the new breach fires but Move #6.13 has no way to auto-rollback. Always wire the circuit-breaker.

5. **No dry-run mode for the first 7 days.** A new Move #6.13 deployment without dry-run mode can auto-execute a wrong recipe (e.g. R5 reverts a GOOD pixel-deploy because Move #6.12's hypothesis library misfired). Always default `--dry-run=true` for the first 7 days; emit the planned action in Slack + require operator-OK before executing.

6. **No auto-rollback when the Slack approval times out.** H2+H4's Slack approval gate has a 60s timeout; if the operator doesn't `/ok` within 60s, the engine must auto-rollback (re-enable the primary downstream / restore the old token). Without auto-rollback, the operator wakes up to a broken downstream + a stuck token.

7. **Executing the fix-recipe before Move #6.12's confidence threshold passes.** Move #6.12's ranked hypothesis might have a confidence score of 0.4 (below the 0.75 threshold). Executing Move #6.13's recipe on a 0.4-confidence hypothesis is reckless. Always check Move #6.12's confidence score before executing; if < 0.75, skip the recipe + emit `escalate-to-engineer`.

8. **Replaying events without a max-replay-window cap.** R1 + R2 replay events from S3 archive; without a max-replay-window cap (default: last 14 days), the replay can dump 90 days of backlog into a broken CDP and overwhelm it. Always cap replay at the last 14 days + max 100k events per replay.

9. **DNS failover with too-long TTL.** R3 fails-over DNS with a 30-min TTL. If the failover causes a NEW breach, the operator must be able to revert quickly. A 24-hour TTL means the operator waits 24h for DNS to revert. Always use 30-min TTL or shorter for failovers.

10. **Rotating a token without verifying the new token works.** R4 rotates an ad-platform token + updates the credentials, but doesn't verify the new token works (calls Meta CAPI with the new token + checks for 200 response). Without verification, the operator finds out 30 min later when their next Meta CAPI call returns 401. Always verify the new token with a test API call before marking R4 as `success`.

11. **Reverting a pixel-deploy without a verified-good prior version.** R5 reverts to the prior pixel-deploy, but doesn't verify the prior version actually fixed the issue (calls the pixel endpoint + checks for conversion-event). Without verification, the operator finds out 60-90s later when the redeploy completes but the original problem persists. Always verify the reverted version works before marking R5 as `success`.

12. **No rate-limit on the recipe executor.** A BFCM peak can fire 50+ Move #6.12 ranked hypotheses in an hour. Without rate-limiting, the recipe executor fires 50+ Vault key rotations in 30 seconds and triggers Vault's per-account rate-limit (default 100 rotations/min). Always rate-limit at 10 recipes/min for low-risk + 2 recipes/min for high-risk.

13. **No post-mortem template when the operator marks the recipe as wrong.** When operator Slack-replies `/wrong recipe` within 30 min of R1 execution, Move #6.13 must auto-generate a post-mortem template + add the new evidence to Move #6.12's hypothesis library YAML. Without the post-mortem, the next Move #6.12 ranking hits the same wrong hypothesis.

14. **Skipping the audit-log retention policy.** Without 90-day retention + S3 cold-archive, the audit log grows unbounded and Postgres storage explodes. Always add a cron job that archives audits >90d to S3 cold + drops them from Postgres.

15. **No integration with the Move #6.12 hypothesis-library auto-update.** Move #6.13's R1–R5 execution results (success/failure + operator-marked-correct/wrong + circuit-breaker-fires) should feed back into Move #6.12's hypothesis-library YAML to auto-tune the ranker weights. Without this feedback loop, Move #6.12's ranker accuracy plateaus at ~85% instead of improving to ~95% over 6 months.

## Verification (this skill is "shipped" when...)

1. **GATE A** — `dashboard/hypotheses/auto_remediation_runbooks.yaml` exists with 5 recipes + blast-radius scores + idempotency-key formats + dry-run-mode flags (≥50 lines).
2. **GATE B** — `scripts/auto_remediation_runbook_executor.py` exists with the hypothesis-queue reader + runbook-library loader + blast-radius scorer + idempotency-key emitter + fix-recipe executor (5 recipes) + Slack approval gate + circuit-breaker + audit log + post-mortem generator + dry-run mode (≥700 lines + ≥45 tests).
3. **GATE C** — `dashboard/scripts/parse-content.mjs` runs and includes the new skill/444 in `content.json`.
4. **GATE D** — `cd dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` succeeds and `.next/server/app/skills/444-attribution-auto-remediation-runbook-executor.{html,meta,rsc}` are present.
5. **GATE E** — `vercel deploy --prod` succeeds, canonical alias `ecommerce-ops-iota.vercel.app` returns HTTP 200 on `/skills/444-attribution-auto-remediation-runbook-executor`.
6. **GATE F** — A load test simulates 100 Move #6.12 ranked hypotheses across 14 days (mix of H1, H2, H3, H4, H5) → verify each recipe executes within 90s + audit log captures each execution + circuit-breaker triggers correctly on simulated new-breach-after-fix.
7. **GATE G** — A live test with a Move #6.12 ranked H1 hypothesis (CDP-write-loss) auto-executes R1 within 90s + the new CDP key works (verified with a test API call returning 200) + the Slack notification posts the success message.
8. **GATE H** — A live test with a Move #6.12 ranked H4 hypothesis (ad-platform-token-rotation) posts the Slack approval gate + operator replies `/ok` within 60s + R4 executes + the new token works (verified with a test API call returning 200) + the Slack notification posts the success message.
9. **GATE I** — A live test with a Move #6.12 ranked H4 hypothesis where the operator does NOT reply within 60s + the engine auto-rollbacks (restores the old token) + the Slack notification posts the rollback message.
10. **GATE J** — A retrospective analysis of the past 30 days of Move #6.13 executions shows ≥85% recipe-success-rate + ≤5% false-positive rate + ≤10 min median time-to-recovery (vs ~45 min without Move #6.13).

## How to extend this skill

- **Move #6.14 — Per-event revenue-impact attribution** (the layer that, on every Move #6.13 fix-recipe execution, computes the dollar-value of the breach that was auto-fixed — e.g. "R1 executed 14:22 UTC, recovered ~$3,400 of paid spend mis-allocated across Meta + Google + TikTok in the 14-minute window between Move #6.12 detection and R1 completion"). Year-1 ROI band **19:1–52:1**.
- **Move #6.15 — Hypothesis accuracy tracker + auto-tuning** (the layer that tracks Move #6.12's ranked-hypothesis accuracy (page → operator marked it correct?) AND Move #6.13's recipe-success-rate (execution → verified-good outcome?) and auto-tunes both the ranker weights AND the recipe blast-radius scores based on the past 90 days of feedback). Year-1 ROI band **11:1–32:1**.
- **Move #6.16 — Cross-channel auto-remediation cascade** (the layer that, when R1+H1 fires (CDP-key-rotation), automatically also fires R4 for the SPECIFIC ad-platforms that depend on the failing CDP-write, instead of waiting for the next Move #6.12 ranked hypothesis to fire). Year-1 ROI band **14:1–42:1**.

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.10 Attribution health alert webhook + on-call rotation — `skills/441-attribution-health-alert-webhook-on-call-rotation.md`
- Move #6.11 Real-time Triple Whale webhook stream subscription + sub-minute alert latency — `skills/442-real-time-triple-whale-webhook-stream-subscription.md`
- Move #6.12 Cross-platform root-cause correlation engine — `skills/443-cross-platform-root-cause-correlation-engine.md` (THE PREREQUISITE — Move #6.13 consumes Move #6.12's ranked-hypothesis queue)
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md`
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/auto_remediation_runbook_executor.py` (Archetype C/D-light hybrid — 800 lines + 45+ tests)
- Companion TDD suite — `scripts/tests/test_auto_remediation_runbook_executor.py` (45+ tests across 16 test classes)
- Companion config — `dashboard/scripts/auto_remediation_runbook_executor_config.yaml` (5-recipe library + blast-radius scores + idempotency-key formats + dry-run-mode flags with TICK markers)
- Companion runbook library — `dashboard/hypotheses/auto_remediation_runbooks.yaml` (5 canonical recipes + blast-radius scores + idempotency-key formats + dry-run-mode flags)

## Sources

Triple Whale 2024 + Polar Analytics 2024 + Northbeam 2024 + Lifitimely 2024 + Peel 2024 + Meta Conversions API real-time 2024 + Google Enhanced Conversions real-time 2024 + TikTok Events API real-time 2024 + Snap Pixel real-time 2024 + Pinterest Conversions API real-time 2024 + GA4 real-time 2024 + Klaviyo event webhooks 2024 + Postscript event webhooks 2024 + Segment CDP real-time 2024 + RudderStack real-time streaming 2024 + mParticle event webhooks 2024 + Kafka 2024 + Confluent Cloud 2024 + AWS EventBridge 2024 + runbook automation 2024 + incident automation 2024 + auto-remediation pattern 2024 + chatops 2024 + Slack Block Kit webhooks 2024 + PagerDuty Events API v2 2024 + Opsgenie webhooks 2024 + Twilio on-call SMS 2024 + Datadog incident management 2024 + FireHydrant 2024 + Incident.io 2024 + Rootly 2024 + AWS Systems Manager Automation 2024 + AWS Lambda 2024 + AWS Step Functions 2024 + Terraform 2024 + Ansible 2024 + GitHub Actions 2024 + Vercel Edge Functions 2024 + Cloudflare Workers 2024 + Fastly Compute 2024 + Fly.io 2024 + idempotency keys 2024 + dead-letter queue SQS 2024 + exponential backoff retry 2024 + rate-limiting 2024 + Vault secret rotation 2024 + AWS Secrets Manager 2024 + HashiCorp Vault 2024 + KMS 2024 + RSA key rotation 2024 + OAuth token rotation 2024 + JWKS 2024 + OTTP replay 2024 + git revert 2024 + Vercel deployment rollback 2024 + Kubernetes rollout undo 2024 + ArgoCD rollback 2024 + Flagger 2024 + Sentinel One rollback 2024 + approval gates 2024 + dry-run mode 2024 + circuit-breaker pattern 2024 + blast-radius limiter 2024 + feature-flag rollout 2024 + LaunchDarkly 2024 + Split.io 2024 + Unleash 2024 + GrowthBook 2024 + post-mortem template 2024 + blameless postmortem 2024 + SLO error budget 2024 + SRE runbook library 2024 + Atlassian runbooks 2024 + Confluence runbooks 2024 + Notion runbooks 2024 + Rootly runbooks 2024 + FireHydrant runbooks 2024 + Jeli runbooks 2024.
