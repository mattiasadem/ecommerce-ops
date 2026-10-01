---
name: attribution-health-alert-webhook-on-call-rotation
title: Attribution health alert webhook + on-call rotation (Move #6.10)
category: attribution-health-alerting
tier: 1
priority: P0
default_move: "6.10"
year_1_roi_band: "12:1–38:1"
sms_friendly: false
last_updated: 2026-10-01
sources: [triple-whale 2024, polar 2024, northbeam 2024, meta-capi 2024, google-ads-enhanced-conversions 2024, tiktok-events-api 2024, snap-pixel 2024, pinterest-tag 2024, slack-webhooks 2024, pagerduty-2024, opsgenie-2024, victorops-2024, datadog-2024, klaviyo 2024, shopify-flow-2024, zapier-2024, make-2024, n8n-2024, sales-tax-vat-automation-2024, klaviyo-cohort-ltv-2024]
---

# Attribution health alert webhook + on-call rotation (Move #6.10)

> Move #6.5 / #6.6 / #6.7 audits ATTRIBUTION QUALITY weekly and posts a JSON to `scripts/results/`. Move #6.8 rollups CROSS-PLATFORM DRIFT. Move #6.9 paints a DASHBOARD. **Move #6.10 closes the loop**: the second a Meta CAPI match rate drops below 90%, the second a TikTok EAPI dedup ratio breaks the [0.7, 1.6] band, the second a Klaviyo↔TW cohort roundtrip falls under 95%, an alert fires into Slack + Linear (or PagerDuty / Opsgenie) and an on-call human gets paged. Without Move #6.10 the operator runs the weekly cadence but the actual breakage hides between audits — by the time Monday's audit runs, 7 days of Meta spend have been mis-allocated at $500+/day, which is $3,500 in wasted spend per missed alert. With Move #6.10 the median time-to-detect drops from 7 days (next weekly cadence) to <5 minutes (alert fires the moment the threshold breaks). Year-1 ROI band **12:1–38:1** for the default $500k–$5M GMV brand at $2000+/mo paid spend. Ship AFTER Move #6.5 + #6.6 + #6.7 + #6.8 + #6.9 are all shipped AND each is producing daily JSON to `scripts/results/`. The on-call rotation is the canonical "the whole thing depends on this" prerequisite — without a 4-hour-first-response SLA the alerts pile up and trust falls.

## When to use this skill

You have:
- Move #6 Triple Whale (or Polar / Northbeam) attribution live ≥30 days
- Move #6.5 + #6.6 + #6.7 + #6.8 + #6.9 stack all shipped, each with `scripts/results/<audit>.json` updating daily
- ≥$2000/mo paid-media spend across Meta + Google + TikTok (combined)
- A Slack workspace with webhook permissions OR PagerDuty / Opsgenie account
- A Linear (or Jira / Asana) workspace for ticket auto-creation
- A team of ≥1 person who can rotate as on-call (solo operators use personal SMS / phone)
- ≥1 platform's attribution health that's currently in "green" state (the alert fires on the transition green→yellow→red, not on already-red)

You do NOT have:
- An automated alert that fires when Meta CAPI match drops below 90% (the canonical "we just lost $3k in 24h" scenario)
- A daily dedup-ratio breach detector (the canonical "Meta + TikTok are double-counting the same conversion" scenario)
- A Klaviyo↔TW cohort-roundtrip daily check (the canonical "our cohort LTV numbers are silently stale" scenario)
- A cross-platform drift detector that fires inside 5 minutes (Move #6.8 produces weekly rollups, not real-time)
- An on-call rotation with a 4-hour-first-response SLA (most operators just have an email digest that nobody reads)
- A Linear ticket auto-creation flow that includes the runbook-link + the dashboard URL + the suspect platform + the breach magnitude

## What "best in class" looks like

Reference: Allbirds, Glossier, Athletic Greens, Bombas, Cuts Clothing, Dr. Squatch, Olipop, Hexclad.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Time-to-detect (TTP) — single platform breach | <5 min | <60 min | <30 sec |
| Time-to-detect — cross-platform drift | <15 min | <120 min | <5 min |
| False-positive rate per week | <5% | <15% | <2% |
| Alert-to-action (on-call first response) | <30 min | <4 hr | <5 min |
| Auto-remediation coverage (% breaches where the runbook runs in <10 min) | ≥80% | ≥40% | ≥95% |
| Weekly alert volume (across all platforms) | 5–15 actionable | <50 total | 2–8 actionable |
| Monthly alert fatigue score (operator survey 1–10) | ≥7 | ≥4 | ≥9 |
| On-call rotation length (per person) | 1 week | 1 day | 2 weeks |
| Runbook-link attached to every alert | yes | yes (Slack) | yes (Slack + Linear + dashboard) |
| Alert-to-revenue-loss-prevented ratio | 1:5 | 1:1 | 1:20 |

## Attribution health alert benchmarks (2024)

| Alert category | Threshold | Action | Severity |
|---|---|---|---|
| Meta CAPI match rate drop | <90% (down from ≥90% baseline) | Page on-call + Linear ticket | P1 |
| Meta CAPI match rate critical | <80% | Page on-call + Linear ticket + Slack #ops-alerts | P0 |
| Meta pixel coverage drop | <95% | Slack #ops-alerts (info) | P3 |
| Meta pixel coverage critical | <85% | Page on-call | P2 |
| Meta dedup ratio out of band | outside [0.8, 1.5] | Slack #ops-alerts (warn) | P2 |
| Meta dedup ratio extreme | outside [0.5, 2.0] | Page on-call | P1 |
| Google EC quality tier drop | from Good/Excellent → Fair/Poor | Page on-call | P1 |
| Google EC email coverage | <80% | Slack #ops-alerts (warn) | P2 |
| GA4↔TW revenue delta | >5% over 7d | Slack #ops-alerts (warn) | P2 |
| GA4↔TW revenue delta critical | >10% over 7d | Page on-call | P1 |
| GA4↔TW order-count delta | >3% | Slack #ops-alerts (info) | P3 |
| Klaviyo↔TW cohort match | <95% on ≥5 sample orders | Page on-call | P1 |
| Klaviyo↔TW cohort match critical | <85% | Page on-call + Linear ticket + Slack #ops-alerts | P0 |
| TikTok EAPI match rate | <85% | Page on-call | P1 |
| TikTok EAPI match rate critical | <75% | Page on-call + Slack #ops-alerts | P0 |
| TikTok dedup ratio out of band | outside [0.7, 1.6] | Slack #ops-alerts (warn) | P2 |
| TikTok Advanced Matching | <75% | Slack #ops-alerts (info) | P3 |
| Snap CAPI match | <80% | Page on-call | P2 |
| Snap CAPI match critical | <70% | Page on-call + Slack #ops-alerts | P1 |
| Pinterest CAPI match | <85% | Page on-call | P2 |
| Pinterest CAPI match critical | <75% | Page on-call + Slack #ops-alerts | P1 |
| Cross-platform drift D1 (single platform match-rate) | >3.0pp drop week-over-week | Slack #ops-alerts (info) | P3 |
| Cross-platform drift D2 (single platform coverage) | >2.0pp drop week-over-week | Slack #ops-alerts (info) | P3 |
| Cross-platform drift D3 (multi-platform) | ≥2 platforms breach simultaneously | Page on-call + Linear ticket | P1 |
| Triple-Whale webhook 5xx error rate | >5% over 1h | Page on-call | P1 |
| Triple-Whale webhook 5xx critical | >15% over 1h | Page on-call + Linear ticket + Slack #ops-alerts | P0 |
| Audit script overall_passed = false | any audit | Page on-call | P1 |
| Stale audit JSON (no update in 25h) | any platform | Slack #ops-alerts (warn) | P2 |

## The build (time estimate: 2 days)

**Phase 1 (Day 1, ~4 hours): Slack webhook + Linear API setup.**
1. Create a Slack incoming webhook for `#ops-alerts` channel: Slack → Apps → Manage apps → Custom integrations → Incoming webhooks → Add to Slack → pick `#ops-alerts` → copy webhook URL → store as `SLACK_OPS_WEBHOOK_URL` env var. Verify by curl-posting a test payload.
2. Create a Linear API token: Linear → Settings → API → Personal API keys → Create new key → grant `issues:create` + `issues:update` + `comments:create` scopes → store as `LINEAR_API_TOKEN` env var. Get the Linear team ID from URL (`/team/<TEAM_ID>/...`) → store as `LINEAR_TEAM_ID`.
3. Set up PagerDuty (or Opsgenie / VictorOps) if team is ≥2 people. Solo operators can skip — use personal SMS via Twilio webhook instead.

**Phase 2 (Day 1, ~3 hours): Alert thresholds config.**
1. Copy `dashboard/scripts/attribution_health_alert_config.yaml` (the canonical 27-threshold config). Set up the 26 canonical thresholds per the benchmarks table above. Document ANY threshold change with a `TICK: <date>` marker — never loosen without a reason.
2. Configure severity routing: P0 → Slack `#ops-alerts` (red) + Linear ticket (P0 priority) + PagerDuty page; P1 → Slack `#ops-alerts` (orange) + Linear ticket (P1 priority); P2 → Slack `#ops-alerts` (yellow) + Linear ticket (P2 priority); P3 → Slack `#ops-alerts` (info blue, no ticket).
3. Configure rate-limit guard: max 1 alert per (platform × threshold-key) per 60 min. Max 1 P0 per platform per 30 min (otherwise alert fatigue breaks the on-call).

**Phase 3 (Day 2, ~4 hours): Webhook script + cron wiring.**
1. Build `dashboard/scripts/attribution_health_alert_webhook.py` (~600 lines, Archetype C/D-light hybrid). Inputs: the 4 audit JSONs (Move #6.5 + #6.6 + #6.7 + #6.8) + the daily Triple-Whale webhook 5xx log. Logic: per threshold check, emit 0..N alerts with severity + runbook-link + dashboard URL + last-3-cycles baseline. Output: POST to Slack + (if severity ≤ P1) POST to Linear.
2. Wire the cron: every 30 min during business hours (08:00–22:00 in operator's timezone), every 60 min overnight. Verify with a manual `--validate-config` + `--dry-run` first.
3. Wire the on-call rotation. Calendar-based (PagerDuty / Opsgenie) for ≥2-person teams, single-recipient SMS for solo. The rotation MUST be 7×24 — no "after-hours" blind spots.

**Phase 4 (Day 2, ~3 hours): Runbook authoring.**
1. Author one runbook per alert (or one mega-runbook with one section per alert). Each section includes: (a) the alert message in the operator's words, (b) the 5-minute fix recipe, (c) the 30-minute deep-investigation recipe, (d) the escalation path (who to page if you can't fix in 30 min), (e) the post-mortem template.
2. Verify the runbook-link is attached to every alert payload. Test: trigger a synthetic breach → confirm the alert payload contains the runbook URL → click through the URL → confirm the runbook loads in <2 sec.

## Common pitfalls (15 from real builds)

1. **Loosening the canonical thresholds to make alerts stop firing.** The 26 thresholds are pinned by `scripts/tests/test_attribution_health_alert_config_pinned.py`. **Fix:** NEVER loosen without a `TICK: <date>` marker AND a documented reason. The thresholds reflect what Meta/TikTok/Google/Snap/Pinterest "normally" deliver; tightening the thresholds to make dashboards pass silently false-fails the audit.
2. **No rate-limit on alerts → alert fatigue → operator mutes channel → real breaches hidden.** **Fix:** rate-limit per (platform × threshold-key) per 60 min, max 1 P0 per platform per 30 min.
3. **No runbook link in the alert → on-call has to context-switch to find the fix recipe → MTTR doubles.** **Fix:** every alert payload MUST include the runbook URL + the dashboard URL + the suspect platform + the breach magnitude. Test with the synthetic-breach integration test.
4. **Single-person on-call with no backup → if primary is on PTO the alert goes to voicemail.** **Fix:** rotation MUST be 7×24, with at least 1 secondary for primary's PTO.
5. **Solo operator with no PagerDuty / no Opsgenie → falls back to email → email digest that nobody reads.** **Fix:** solo operators wire a Twilio webhook that sends the alert to the operator's personal SMS, with a 4-hour-first-response SLA.
6. **Slack webhook URL committed to git → security incident.** **Fix:** webhook URLs live in env vars (`.env.local`, `vercel env`, or 1Password CLI); never in repo. Add `.env*` to `.gitignore`.
7. **Noisy "stale audit JSON" alert fires every 26 hours → operator stops trusting the alerts.** **Fix:** the stale-JSON check has a 4-hour grace period AND auto-resolves when the audit script next updates.
8. **Cross-platform drift D1 alert fires on every single platform's normal 1pp week-over-week drift → 100+ alerts per week.** **Fix:** D1 is INFORMATIONAL only (P3) — page only on multi-platform simultaneous drift (D3 ≥ 2 platforms breach). The D1 single-platform drift is data the operator checks in Move #6.9 dashboard, not an alert.
10. **Linear API token committed to git → security incident.** Same fix as pitfall #6.
11. **Webhook script runs once per hour → up to 60-min lag on a critical breach.** **Fix:** wire the cron every 30 min during business hours + every 60 min overnight. The 30-min cadence is the floor for "acceptable lag"; real-time would require a webhook subscription to Triple Whale (out of scope for v1).
12. **Alert payload doesn't include the breach baseline → on-call has to context-switch to find "what was the baseline?".** **Fix:** every alert payload includes the last-3-cycles baseline (e.g. "Meta CAPI match: 87.3% (baseline 92.1% over last 3 cycles; -4.8pp)").
13. **No dedup on identical alerts in 6h → 8 PagerDuty pages for the same Meta breach.** **Fix:** dedup window of 6h per (platform × threshold-key); after dedup, the alert fires once with "STILL BREACHING" prefix.
14. **Alert on audit JSON that's stale (no update in 48h) → operator investigates a phantom breach.** **Fix:** if the audit JSON's last_update is >48h old, the webhook script should NOT process that platform's audit; instead emit a "stale audit JSON" alert (P2 severity) and skip the per-threshold checks until the audit updates.
15. **No post-mortem template → when a real breach happens the operator spends 2 hours reconstructing what happened.** **Fix:** every Linear ticket auto-created by an alert has a post-mortem template attached (sections: timeline, root cause, fix, prevention). The on-call fills it in within 24h of resolution.

## Verification (this skill is "shipped" when...)

- Gate A: Slack webhook + Linear API + PagerDuty (or Twilio for solo) wired and producing test alerts.
- Gate B: All 26 canonical thresholds configured AND rate-limit + dedup working.
- Gate C: Synthetic-breach test fires the expected alert (e.g. set Meta CAPI match rate to 50% in the test fixture → confirm P0 alert fires within 30 min).
- Gate D: Runbook-link + dashboard URL attached to every alert payload.
- Gate E: On-call rotation set up with 4-hour-first-response SLA AND a backup for PTO.
- Gate F: Post-mortem template attached to every Linear ticket.
- Gate G: `scripts/tests/test_attribution_health_alert_webhook.py` (Archetype C/D hybrid — 30+ tests across 11 classes including 6 NEGATIVE validation per gate + subprocess roundtrip + bootstrap-mode canonical-pass fixtures + alert-message budget check) all passing.

## How to extend this skill

- **Move #6.11 — Real-time webhook subscription to Triple Whale** (the layer that subscribes to Triple Whale's webhook stream for sub-minute alert latency vs the 30-min cron cadence).
- **Move #6.12 — Cross-platform root-cause correlation engine** (the layer that fires when ≥2 platforms breach simultaneously, surfaces the 5 canonical root-cause hypotheses from Move #6.8, and ranks them by likelihood).
- **Move #6.13 — Auto-remediation runbook executor** (the layer that auto-runs the 5-minute fix recipe for known-breach patterns — e.g. CAPI token rotation → auto-rotate from backup → verify → notify on-call).

## Cross-references

- Move #6 Triple Whale attribution foundation — `skills/13-triple-whale-attribution.md`
- Move #6.5 Meta + Google + GA4 attribution quality audit — `playbooks/06.5-attribution-quality-audit.md`
- Move #6.6 TikTok attribution quality audit — `playbooks/06.6-tiktok-attribution-quality-audit.md`
- Move #6.7 Snap + Pinterest attribution quality audit — `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`
- Move #6.8 Cross-platform attribution drift unification — `playbooks/06.8-cross-platform-attribution-drift-unification.md`
- Move #6.9 Unified attribution dashboard — `dashboards/unified-attribution-health.html`
- Companion script — `scripts/attribution_health_alert_webhook.py` (Archetype C/D-light hybrid — 600 lines + 30+ tests)
- Companion TDD suite — `scripts/tests/test_attribution_health_alert_webhook.py` (30+ tests across 11 test classes)
- Companion config — `dashboard/scripts/attribution_health_alert_config.yaml` (27-threshold canonical config with TICK markers)

## Sources

Triple Whale 2024 + Polar Analytics 2024 + Northbeam 2024 + Lifitimely 2024 + Peel 2024 + Meta Conversions API 2024 + Google Ads Enhanced Conversions 2024 + TikTok Events API 2024 + Snap Pixel 2024 + Pinterest Tag 2024 + Slack webhooks 2024 + PagerDuty 2024 + Opsgenie 2024 + VictorOps 2024 + Datadog 2024 + Klaviyo cohort LTV 2024 + Shopify Flow 2024 + Zapier 2024 + Make 2024 + n8n 2024.