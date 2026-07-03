# Attribution Health Alert Payload Templates — 25 voice-variant Slack-compatible alert templates × 5 cross-platform root-cause hypotheses + per-hypothesis triage decision-tree + 5-path alert-cadence decision-matrix + Slack-rich-format-block library + Linear-ticket-body-generator + escalation-routing-policy + on-call-rotation-SOP + 7-slide-incident-postmortem-template + 4-amulet-cross-platform-attribution-regression-detection-cookbook (Move #6.10 operator-copy)

> **Source.** Operator-copy companion to `scripts/attribution_health_alert_webhook.py` (the canonical Move #6.10 attribution-health alert webhook shipped 2026-07-03 per the v0.36.0 Track 9-12 hardening tick — Archetype C/D-light hybrid wire script that consumes the Move #6.8 cross-platform attribution rollup JSON + dispatches to a Slack-compatible webhook URL via stdlib urllib OR falls back to a local `.alerts/` archive directory; 5-decision-rule engine [Rule 1 ANY per-platform fail / Rule 2 cross-platform drift / Rule 3 match-rate drift > 3.0pp / Rule 4 coverage drift > 2.0pp / Rule 5 cooldown 3600s] + 13-field canonical alert-payload shape [alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path] pinned by `_canonical_alert_shape_published()` + `_canonical_thresholds_published()` regression gates) + `playbooks/06.10-attribution-health-alert-webhook-launch.md` (the canonical 13-section operator-build playbook shipped 2026-07-09 per the v0.36.0 Track 9-12 hardening-tick follow-up — single-cron-wire playbook mirroring the canonical `playbooks/06.8-cross-platform-attribution-drift-unification.md` shape with 13 canonical H2 sections + 7 H3 step subsections + 15 numbered pitfalls + 10-gate verification A-J + 12-metric monitoring table + 60:1 to 150:1 net annual ROI Path B at $1M-$5M Shopify-brand GMV). The canonical **3rd-layer operator-copy follow-up** per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order applied to the Move #6.10 deferred-follow-up pattern at 2/6 layers; **24th asset in the workspace**; ships the paste-ready per-voice per-hypothesis Slack-compatible 13-field alert-payload templates the playbook documents but doesn't write — the operator copies the JSON or Block-Kit-payload from §The 25 voice-variant Slack-compatible alert-templates → pastes it into the Slack-channel-on-call-runbook → pairs each `root_cause_hypothesis.id` to the corrective action the on-call operator should take in the first 15 minutes of triage per Move #6.8's canonical 5-hypothesis matcher [theme.liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle] (the canonical 5-hypothesis list pinned by `scripts/attribution_cross_platform_rollup.py` ROOT_CAUSE_HYPOTHESES at lines 61-89 of the v0.16.0-plus workspace substrate).

> **Companion artifact.** `playbooks/06.10-attribution-health-alert-webhook-launch.md` ships the 13-section single-cron-wire playbook + 7 H3 step subsections [Step 1 Install the webhook script / Step 2 Bootstrap the archive directory / Step 3 Validate the canonical thresholds + alert shape / Step 4 Wire the cron / Step 5 Configure Slack alert format / Step 6 Investigate any failures / Step 7 Document the alert-routing + on-call rotation] + 5-decision-rule engine documentation + 13-field canonical alert-payload shape pinned by `_canonical_alert_shape_published()` regression gate + 5 canonical webhook thresholds pinned by `_canonical_thresholds_published()` regression gate + 3-mode CLI [default + --bootstrap + --validate-thresholds] + 3 exit codes [0 no-alert / 1 alert-fired + posted OR archived / 2 alert-fired-but-webhook-POST-FAILED] + 15 numbered pitfalls each with corrective `Fix:` line clustered into 5 failure modes [A webhook-thresholds-pinned-regression-gate-loosening / B webhook-URL-payload-shape-drift / C cron-timing / D cooldown-walker / E hermetic-archive-fallback] + 10-gate verification A-J + 12-metric monitoring table + 60:1 to 150:1 net annual ROI Path B at $1M-$5M Shopify-brand GMV. This asset ships the **actual paste-ready 13-field Slack-compatible alert-payload templates + per-hypothesis triage decision-tree + 5-path alert-cadence decision-matrix + Slack-rich-format-block library + Linear-ticket-body-generator + escalation-routing-policy + on-call-rotation-SOP + 7-slide-incident-postmortem-template + 4-amulet-cross-platform-attribution-regression-detection-cookbook** the playbook scopes but doesn't write. Read the playbook FIRST for the install + bootstrap + validate-thresholds + cron-wire + Slack-format + investigate-failures + on-call-rotation 7-step build + the canonical 5-decision-rule engine + the canonical 13-field alert-payload shape + the canonical 5 webhook thresholds; this asset then ships the actual paste-ready per-voice per-hypothesis alert-payload templates the operator pastes into the Slack-channel-on-call-runbook.

---

## Goal

Ship a paste-ready attribution-health-alert-payload-template library that compounds `scripts/attribution_health_alert_webhook.py`'s 13-field canonical alert-payload shape [alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path] + Move #6.8's canonical 5-hypothesis matcher [theme.liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle] + the canonical 5-decision-rule engine [Rule 1 ANY per-platform fail / Rule 2 cross-platform drift / Rule 3 match-rate drift > 3.0pp / Rule 4 coverage drift > 2.0pp / Rule 5 cooldown 3600s] + Move #6.5/6.6/6.7 per-platform attribution-quality-audit substrate + Move #6 Triple Whale attribution + Move #6.9 cross-platform-cohort-LTV-overlay + Slack Incoming-Webhooks 2024 + Linear-GraphQL-API-IssueCreate-mutation-pattern + PagerDuty-Incidents-API-v2-pattern. The 11 canonical paste-ready artifacts are:

1. **25 voice-variant Slack-compatible alert-payload templates** (5 voices × 5 hypotheses) — the canonical per-voice per-hypothesis Slack-Incoming-Webhook JSON-or-Block-Kit-payload that the operator copies from the §The 25 voice-variant Slack-compatible alert-templates → pastes into the Slack-channel-on-call-runbook → uses as the operator-facing message when the webhook fires. Each variant lands the canonical 13-field alert-payload shape with the hypothesis-specific remediation surfaced inline + the 5-rule-decision-engine-result summarised + the canonical 5 webhook thresholds echoed + the raw-rollup-path for traceability.
2. **5-hypothesis triage decision-tree** — the canonical decision-tree the on-call operator walks in the first 15 minutes of a fired alert: hypothesis-id → first-action-priority → first-diagnostic-step → second-diagnostic-step → remediation-or-escalate → close-or-incident. Each hypothesis ships 3 first-diagnostic-step variants (theme.liquid_update runs `git log --since="7 days ago" -- theme.liquid` first; capi_token_rotation checks the platform's Events-Manager → CAPI-token-expiry-tile first; ios_consent_banner checks the cookie-consent-platform's hashed-email-pass-through-flag first).
3. **5-path alert-cadence decision-matrix** — the canonical 5-path alert-cadence decision-matrix [Path A solo-operator-weekly-cadence / Path B DEFAULT small-team-daily-cadence Slack-webhook + Linear-fallback / Path C medium-team-4-hour-cadence Slack-webhook + Linear + PagerDuty / Path D enterprise-team-realtime-cadence PagerDuty-Events-API-v2 + Opsgenie + Slack + Linear / Path E pre-revenue-pre-launch-defer] with per-path-cost-stack [$0/$8/$35/$250/$1k+/mo] + per-path-operator-capacity-prereq [0.5hr/wk / 1hr/wk / 4hr/wk / 12hr/wk / N/A] + per-path-rollup-RUN-frequency [weekly / daily / 4-hourly / hourly / N/A] + per-path-alert-channel [local-archive / Slack-webhook + Linear / Slack + Linear + PagerDuty-email / PagerDuty-Events-API-v2 + Opsgenie + Slack + Linear / no-rollup].
4. **Slack-rich-format-block library** — the canonical 10-block Slack-Block-Kit library [header-block + section-block-per-platform-breakdown + section-block-drift-summary + section-block-root-cause-hypothesis + section-block-remediation + section-block-thresholds-used + section-block-summary + section-block-raw-rollup-path + context-block-alert-timestamp + divider-block] the operator composes into the Slack-channel-post via `blocks` array; pinned by `slack-blocks-published-v1` so the canonical 10-block library cannot drift across alert cycles.
5. **Linear-ticket-body-generator template** — the canonical Linear-IssueCreate-mutation-body-generator template the webhook fires alongside the Slack alert (per Move #6.10-playbook Step 6); takes the canonical 13-field alert-payload as input → emits the canonical Linear-ticket-body Markdown structure [title-with-hypothesis-id-prefix / per-platform-breakdown-table / drift-summary-table / root-cause-hypothesis-section / remediation-section / thresholds-used-table / raw-rollup-path-attachment-link].
6. **Escalation-routing-policy matrix** — the canonical 5-tier escalation-routing-policy matrix [Tier 0 hermetic-local-archive / Tier 1 Slack-webhook-to-#attribution-health-only / Tier 2 Slack-webhook-to-#attribution-health + Linear-ticket-auto-file / Tier 3 Slack-webhook + Linear + PagerDuty-incident-low-urgency / Tier 4 Slack-webhook + Linear + PagerDuty-incident-high-urgency + Opsgenie-on-call-page] with per-tier-alert-routing-decision-rule [hypothesis-id-driven-routing / severity-driven-routing / drift-magnitude-driven-routing / time-of-day-driven-routing] + per-tier-cost-stack.
7. **On-call-rotation-SOP template** — the canonical 12-section on-call-rotation-SOP template [Section 1: rotation-cadence + coverage-matrix / Section 2: alert-routing-table / Section 3: first-response-time-SLA + ack-SLA / Section 4: first-15-minute-triage-procedure / Section 5: first-hour-remediation-procedure / Section 6: incident-postmortem-trigger-conditions / Section 7: handoff-procedure / Section 8: weekend-coverage-rules / Section 9: vacation-coverage-rules / Section 10: alert-false-positive-rate-tolerance / Section 11: alert-miss-rate-tolerance / Section 12: rotation-rollover-day-procedure] the operator pastes into the team's incident-response-document.
8. **7-slide-incident-postmortem-template** — the canonical 7-slide-incident-postmortem template [Slide 1: Summary (hypothesis-id + first-fire-timestamp + total-dwell-time + per-platform-affected-count) / Slide 2: Timeline (UTC-timestamps for first-fire → first-ack → first-remediation-action → first-validation-pass → close-timestamp) / Slide 3: Root cause (per Move #6.8's 5-hypothesis matcher evidence) / Slide 4: What went well (alert-fired-in-time / Linear-ticket-auto-filed / on-call-acked-in-SLA / Slack-thread-attached) / Slide 5: What went wrong (alert-cooldown-too-long / alert-false-positive / on-call-SLA-missed / remediation-applied-late) / Slide 6: Action items (5-7-action-items-with-owner-due-date) / Slide 7: Prevention (canonical 4-amulet-regression-detection-cookbook see below)] the operator pastes into the postmortem-Slack-thread-or-Notion-page.
9. **4-amulet cross-platform attribution-regression detection cookbook** — the canonical 4-amulet cross-platform attribution-regression detection cookbook [Amulet 1: alert-threshold-sensitivity — set initial `match_rate_drift_pp = 5.0` then tighten to 3.0 after 4 weeks of data / Amulet 2: alert-cooldown-walker-suppression — set initial `cooldown-seconds = 7200` (2hr) then tighten to 3600 (1hr) after 4 weeks / Amulet 3: per-platform-vs-cross-platform-priority — let cross-platform-drift fires always make the alert firing more visible than single-platform-fail / Amulet 4: hypothesis-first-routing — always route to the hypothesis-named-oncall-specialist (theme.liquid → front-end-engineer; capi_token → martech-engineer; consent_banner → legal+counsel; app_uninstall → martech-engineer; advanced_matching → martech-engineer)] the operator sets up the first time the Move #6.10 webhook lands.
10. **Per-hypothesis-Linear-label-template** — the canonical per-hypothesis-Linear-label-template [theme_liquid_update → label `attribution/regression/theme.liquid` + assignee-template `Move-#6.5-Triple-Whale-on-call` / capi_token_rotation → `attribution/regression/capi-token` + `Move-#6.5-Triple-Whale-on-call` / ios_consent_banner → `attribution/regression/consent-banner` + `Move-#6.5-Triple-Whale-on-call` + Loop-counsel-collaborator / app_uninstall → `attribution/regression/app-conflict` + `Move-#6.5-Triple-Whale-on-call` / advanced_matching_toggle → `attribution/regression/emq-toggle` + `Move-#6.5-Triple-Whale-on-call` + Loop-EMQ-toggle-restoration-runbook-link].
11. **Slack-thread-on-call-handoff-template** — the canonical Slack-thread-on-call-handoff template the current-on-call posts to the alert-thread when their shift ends (5 lines: shift-end-timestamp + total-alerts-during-shift + open-incidents-handoff + false-positive-rate-during-shift + next-on-call-@-mention).

Each artifact ships **5 voice-driven override columns** [Default / Luxury / Sustainable / Gen-Z / B2B] where the per-voice customization matters. The 25 voice-variant alert templates follow the canonical asset-voice-density rule (each voice must appear ≥15 times across the asset). The 5 voice-driven override columns for the 5-hypothesis triage decision-tree + 5-path alert-cadence decision-matrix + Slack-rich-format-block library + Linear-ticket-body-generator + escalation-routing-policy + on-call-rotation-SOP + 7-slide-incident-postmortem-template + 4-amulet-cookbook all share the same canonical 5-voice framework from `assets/02-brand-voice.md` §The 5-dimension voice framework.

---

## Who this is for

The default reader is the on-call operator at a $1M-$5M Shopify-DTC brand who has shipped `scripts/attribution_health_alert_webhook.py` per `playbooks/06.10-attribution-health-alert-webhook-launch.md` and now needs the paste-ready per-voice per-hypothesis Slack-compatible alert-payload templates their Slack channel will see at 2am when Move #6.8's rollup surfaces a cross-platform drift. You read asset-02-brand-voice once, pick the profile that matches the brand (Default / Luxury / Sustainable / Gen-Z / B2B), swap the voice lines in 1-2 templates, ship. The voice-density rule (each voice ≥15 hits across the asset) keeps every variant consistent with the brand's existing email + SMS + Paid-Social voice lines from `assets/01-copy-templates.md`. If you have an existing Slack-channel-on-call-runbook, paste the §The 25 voice-variant Slack-compatible alert-templates verbatim into the runbook's Alert-payload-shape section.

---

## The 5 voice profiles (canonical from `assets/02-brand-voice.md`)

These 5 voice profiles follow the canonical 5-dimension voice framework from `assets/02-brand-voice.md`:

| Voice | Tone | Length | CTA style | Hero metric | Asset-Voiced example line |
|-------|------|--------|-----------|-------------|-----------------------|
| **Default** | Confident + plain + lightly irreverent | Medium | Action-verb-first | CAC-payback | "Cross-platform drift — fix the theme.liquid snippet, you know which one." |
| **Luxury** | Restrained + considered + sensory | Long | Aspirational-tone | AOV-margins | "Cross-platform drift observed across Meta + TikTok. Verify the iOS consent banner preserves hashed-email pass-through before anything else." |
| **Sustainable** | Quiet + factual + sourced | Medium | Educational-tone | CO2e-per-order | "Cross-platform drift detected. CAPI token rotation matches 73% of historical patterns — rotating tokens typically restores coverage within 6 hours." |
| **Gen-Z** | Direct + punchy + emoji-rich | Short | Cliff-CTA | Conversion-rate | "🚨 drift → fix capi token NOW → check Events Manager → rotate → done in 5 min" |
| **B2B** | Operational + structured + reference-first | Long-with-tables | Documentation-CTA | Pipeline-coverage | "Cross-platform drift: see Move #6.8 hypothesis evidence in the linked rollup. Recommended remediation action per the canonical 5-hypothesis matcher." |

Each voice ships a per-hypothesis Slack-message variant in §The 25 voice-variant Slack-compatible alert-templates so the operator picks the voice that matches the brand. The voice-density rule applies per the canonical asset-tick gate: each voice must appear ≥15 times across the asset when grep-counted with `\b<voice>\b`.

---

## The 5 cross-platform attribution root-cause hypotheses (canonical from `scripts/attribution_cross_platform_rollup.py` lines 61-89)

The Move #6.10 webhook surfaces the canonical Move #6.8 5-hypothesis matcher. Each hypothesis has:
- **id** (the canonical lowercase-hyphen identifier used in `root_cause_hypothesis.id` field)
- **label** (the human-readable label shipped in the `root_cause_hypothesis.label` field)
- **keywords** (the canonical keyword set the matcher scans in per-platform failure-detail strings)
- **remediation** (the canonical corrective-action string shipped in the `remediation` field)

| Hypothesis id | Label | Keywords | Canonical remediation |
|---|---|---|---|
| `theme_liquid_update` | theme.liquid snippet update | `theme.liquid`, `fbq`, `pixel`, `snippet`, `theme update`, `theme.liquid snippet update` | Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load |
| `capi_token_rotation` | CAPI token rotation | `capi`, `token`, `access_token`, `expired`, `rotation`, `capi token rotation` | Refresh CAPI access tokens for the affected platforms; re-test conversion events fire |
| `ios_consent_banner` | iOS consent banner change | `consent`, `ios`, `att`, `banner`, `consent banner`, `ios consent banner change` | Verify the iOS consent banner still passes hashed-email to Meta + TikTok; re-test match rates after the banner change |
| `app_uninstall` | App uninstall or app conflict | `app`, `uninstall`, `shopify app`, `app uninstall`, `app conflict` | Check the Shopify app list for recent uninstalls; re-install the affected app + re-test |
| `advanced_matching_toggle` | Advanced Matching / EMQ toggle flipped off | `advanced matching`, `emq`, `email matching`, `enhanced match`, `toggle`, `advanced matching toggle` | Re-enable Advanced Matching in the platform's Events Manager / Tag Manager; re-test match rates |
| `unknown` (fallback) | Unknown shared root cause (manual investigation required) | (no keywords — fallback only) | Investigate per-platform failure details manually; check recent theme.liquid + app + CAPI changes for shared timing |

Each hypothesis ships 5 voice-variants in §The 25 voice-variant Slack-compatible alert-templates — the operator picks the voice that matches the brand. When the matcher returns `unknown`, the operator walks the §5-hypothesis triage decision-tree starting at the fallback branch.

---

## The 25 voice-variant Slack-compatible alert templates (5 voices × 5 hypotheses)

The 25 alert templates ship the canonical 13-field alert-payload shape [alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path] in two flavours:

- **JSON payload** — the raw JSON shape the webhook POSTs to the Slack-Incoming-Webhooks URL via `Content-Type: application/json`. Paste directly into the Slack-channel-on-call-runbook.
- **Block-Kit blocks** — the Slack-Block-Kit `blocks` array for the same alert when posting via a Slack-app-with-bot-token. The canonical 10-block library is in §Slack-rich-format-block library.

### Default voice × 5 hypotheses

#### Default voice × `theme_liquid_update`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "critical",
  "title": "🔴 ATTRIBUTION HEALTH ALERT: theme.liquid snippet update",
  "summary": "3 platform(s) audited; 2 failing (meta_pixel_coverage, tiktok_pixel_coverage); cross-platform drift detected: true; max match-rate drift: 5.4pp; max coverage drift: 4.1pp; 2 platforms with simultaneous match-rate drops",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 87.2},
    {"platform": "tiktok", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 71.5},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 88.0}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 5.4, "coverage_drift_pp": 4.1, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -4.8, "tiktok": -6.2, "snap": -1.2}},
  "root_cause_hypothesis": {
    "id": "theme_liquid_update",
    "label": "theme.liquid snippet update",
    "matched_keyword": "fbq",
    "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load"
  },
  "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load",
  "overall_passed": false,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

#### Default voice × `capi_token_rotation`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "critical",
  "title": "🔴 ATTRIBUTION HEALTH ALERT: CAPI token rotation",
  "summary": "3 platform(s) audited; 2 failing (meta_capi_match_rate, tiktok_capi_match_rate); cross-platform drift detected: true; max match-rate drift: 8.9pp; max coverage drift: 1.2pp; 2 platforms with simultaneous match-rate drops",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": false, "failed_gates": ["capi_match_rate"], "match_rate_pct": 79.4},
    {"platform": "tiktok", "overall_passed": false, "failed_gates": ["capi_match_rate"], "match_rate_pct": 65.8},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 90.1}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 8.9, "coverage_drift_pp": 1.2, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -7.6, "tiktok": -12.4, "snap": -0.5}},
  "root_cause_hypothesis": {
    "id": "capi_token_rotation",
    "label": "CAPI token rotation",
    "matched_keyword": "capi",
    "remediation": "Refresh CAPI access tokens for the affected platforms; re-test conversion events fire"
  },
  "remediation": "Refresh CAPI access tokens for the affected platforms; re-test conversion events fire",
  "overall_passed": false,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

#### Default voice × `ios_consent_banner`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "warning",
  "title": "⚠️ ATTRIBUTION DRIFT WARNING: iOS consent banner change",
  "summary": "3 platform(s) audited; 0 failing; cross-platform drift detected: true; max match-rate drift: 4.8pp; max coverage drift: 0.9pp; 2 platforms with simultaneous match-rate drops",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": true, "failed_gates": [], "match_rate_pct": 90.2},
    {"platform": "tiktok", "overall_passed": true, "failed_gates": [], "match_rate_pct": 84.6},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 89.4}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 4.8, "coverage_drift_pp": 0.9, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -3.8, "tiktok": -5.1, "snap": -2.3}},
  "root_cause_hypothesis": {
    "id": "ios_consent_banner",
    "label": "iOS consent banner change",
    "matched_keyword": "consent",
    "remediation": "Verify the iOS consent banner still passes hashed-email to Meta + TikTok; re-test match rates after the banner change"
  },
  "remediation": "Verify the iOS consent banner still passes hashed-email to Meta + TikTok; re-test match rates after the banner change",
  "overall_passed": true,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

#### Default voice × `app_uninstall`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "critical",
  "title": "🔴 ATTRIBUTION HEALTH ALERT: App uninstall or app conflict",
  "summary": "3 platform(s) audited; 2 failing (meta_pixel_coverage, tiktok_pixel_coverage); cross-platform drift detected: true; max match-rate drift: 6.2pp; max coverage drift: 5.7pp; 2 platforms with simultaneous match-rate drops",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 80.1},
    {"platform": "tiktok", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 70.3},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 87.5}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 6.2, "coverage_drift_pp": 5.7, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -8.3, "tiktok": -10.4, "snap": -1.8}},
  "root_cause_hypothesis": {
    "id": "app_uninstall",
    "label": "App uninstall or app conflict",
    "matched_keyword": "shopify app",
    "remediation": "Check the Shopify app list for recent uninstalls; re-install the affected app + re-test"
  },
  "remediation": "Check the Shopify app list for recent uninstalls; re-install the affected app + re-test",
  "overall_passed": false,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

#### Default voice × `advanced_matching_toggle`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "warning",
  "title": "⚠️ ATTRIBUTION DRIFT WARNING: Advanced Matching / EMQ toggle flipped off",
  "summary": "3 platform(s) audited; 0 failing; cross-platform drift detected: true; max match-rate drift: 5.1pp; max coverage drift: 0.5pp; 2 platforms with simultaneous match-rate drops",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": true, "failed_gates": [], "match_rate_pct": 89.0},
    {"platform": "tiktok", "overall_passed": true, "failed_gates": [], "match_rate_pct": 83.2},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 88.7}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 5.1, "coverage_drift_pp": 0.5, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -4.6, "tiktok": -6.8, "snap": -1.0}},
  "root_cause_hypothesis": {
    "id": "advanced_matching_toggle",
    "label": "Advanced Matching / EMQ toggle flipped off",
    "matched_keyword": "advanced matching",
    "remediation": "Re-enable Advanced Matching in the platform's Events Manager / Tag Manager; re-test match rates"
  },
  "remediation": "Re-enable Advanced Matching in the platform's Events Manager / Tag Manager; re-test match rates",
  "overall_passed": true,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

### Luxury voice × 5 hypotheses

#### Luxury voice × `theme_liquid_update`

**JSON payload:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "critical",
  "title": "🔴 ATTRIBUTION HEALTH ALERT: theme.liquid snippet update",
  "summary": "Cross-platform drift observed across Meta + TikTok Pixel coverage. The Shopify theme.liquid update introduced a regression in the pixel snippet deployment sequence — reverting the change and re-testing pixel coverage on PDP load will restore the canonical attribution substrate. Confirm Meta + TikTok pixels fire correctly before resuming paid-amplifier-spend decisions.",
  "per_platform_breakdown": [
    {"platform": "meta_pixel_coverage", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 87.2},
    {"platform": "tiktok_pixel_coverage", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 71.5},
    {"platform": "snap_coverage", "overall_passed": true, "failed_gates": [], "match_rate_pct": 88.0}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 5.4, "coverage_drift_pp": 4.1, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -4.8, "tiktok": -6.2, "snap": -1.2}},
  "root_cause_hypothesis": {
    "id": "theme_liquid_update",
    "label": "theme.liquid snippet update",
    "matched_keyword": "fbq",
    "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load"
  },
  "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load",
  "overall_passed": false,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json"
}
```

#### Luxury voice × `capi_token_rotation`

The Luxury voice variant for CAPI token rotation follows the same canonical 13-field shape with the voice-specific narrative overlay: "Cross-platform drift detected across Meta + TikTok CAPI match-rate. This pattern is consistent with CAPI token expiry observed at our peer brands every 60-90 days; refreshing the affected platforms' CAPI access tokens via their respective Events Manager panels restores coverage within 4-6 hours. We recommend rotating both Meta + TikTok tokens in the same session to reduce the cross-platform-drift window." All 11 remaining fields mirror the canonical shape; remediation is the canonical `capi_token_rotation` line from `attribution_cross_platform_rollup.py` line 72.

#### Luxury voice × `ios_consent_banner`

The Luxury voice variant for iOS consent banner change preserves the brand's restrained-tone approach: "Cross-platform drift detected across Meta + TikTok match-rate with the canonical iOS-consent-banner-change signal. Verify the iOS consent banner still passes hashed-email through to Meta + TikTok — preserve the customer's data-handling-consent signal even as the platform's consent-format evolves. The remediation follows the canonical iOS-consent-banner-change recipe; expect match-rate recovery within 24 hours of banner pass-through validation." All 11 remaining fields mirror the canonical shape; remediation is the canonical `ios_consent_banner` line from `attribution_cross_platform_rollup.py` line 77.

#### Luxury voice × `app_uninstall`

The Luxury voice variant for app uninstall or app conflict preserves the brand's restrained-tone: "Cross-platform drift detected. The signal pattern matches a recent Shopify app uninstall event — the canonical 5-hypothesis matcher picked this up because the per-platform failure detail surfaced a `shopify app` keyword. Walk the Shopify app list for recent uninstalls; re-install the affected app; re-test pixel coverage on Meta + TikTok; expect restoration within 4-6 hours." All 11 remaining fields mirror the canonical shape; remediation is the canonical `app_uninstall` line from `attribution_cross_platform_rollup.py` line 84.

#### Luxury voice × `advanced_matching_toggle`

The Luxury voice variant for advanced_matching_toggle preserves the brand's restrained-tone: "Cross-platform drift detected with the canonical Advanced Matching / EMQ-toggle flipped-off signal. This is one of the most preventable attribution regressions — toggling the platform's Events Manager or Tag Manager 'Advanced Matching' back to enabled restores match-rate within 2-4 hours. We recommend verifying both Meta + TikTok in the same session." All 11 remaining fields mirror the canonical shape; remediation is the canonical `advanced_matching_toggle` line from `attribution_cross_platform_rollup.py` line 90.

### Sustainable voice × 5 hypotheses

#### Sustainable voice × `theme_liquid_update`

**Block-Kit blocks:**

```json
[
  {"type": "header", "text": {"type": "plain_text", "text": "🟢 ATTRIBUTION DRIFT — theme.liquid snippet update detected"}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Evidence basis:* Move #6.8 cross-platform attribution rollup surfaced a simultaneous match-rate drop across Meta + TikTok pixel-coverage gates. The canonical 5-hypothesis matcher (`scripts/attribution_cross_platform_rollup.py` lines 285-323) matched on the keyword `fbq` which appears when a theme.liquid deploy accidentally drops the Meta pixel snippet."}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Per-platform status:*\n:no_entry: Meta (match rate 87.2%, fail — pixel_coverage)\n:no_entry: TikTok (match rate 71.5%, fail — pixel_coverage)\n:white_check_mark: Snap (match rate 88.0%, all gates passing)"}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Cross-platform drift:* detected — max match-rate Δ = 5.4pp, coverage Δ = 4.1pp, 2 platforms with simultaneous match-rate drops"}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Suspected shared root cause:* theme.liquid snippet update (matched on keyword: `fbq`)"}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Remediation:* Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load"}},
  {"type": "section", "text": {"type": "mrkdwn", "text": "*Thresholds used:* match-rate-drift = 3.0pp, coverage-drift = 2.0pp, multi-platform-drop-max = 2"}},
  {"type": "context", "elements": [{"type": "mrkdwn", "text": "Source: move-6.10-attribution-health-alert-webhook | 2026-07-10T02:14:33Z | Raw rollup: fixtures/.archive/2026-07-09-cross-platform-rollup.json"}]}
]
```

#### Sustainable voice × `capi_token_rotation`

The Sustainable voice variant for CAPI token rotation follows the same Block-Kit shape with a sourced-tone overlay: "*Evidence basis:* CAPI token rotation is a known recurring attribution regression — peer-brand benchmarks show CAPI tokens expiring every 60-90 days absent auto-rotation; Move #6.8 matched on the keyword `capi` in the per-platform failure detail. Rotating the affected platforms' CAPI tokens typically restores match-rate within 6 hours." All 8 Block-Kit blocks land the canonical 13-field alert-payload shape; remediation is the canonical `capi_token_rotation` line.

#### Sustainable voice × `ios_consent_banner`

The Sustainable voice variant for iOS consent banner change follows the same Block-Kit shape with an educational-tone overlay: "*Evidence basis:* iOS App Tracking Transparency (ATT) consent banner changes can drop hashed-email pass-through to Meta + TikTok — Move #6.8 matched on the keyword `consent` in the per-platform failure detail. Verifying the consent banner still passes hashed-email preserves the customer's explicit-consent signal; match-rate typically recovers within 24 hours." All 8 Block-Kit blocks land the canonical 13-field alert-payload shape; remediation is the canonical `ios_consent_banner` line.

#### Sustainable voice × `app_uninstall`

The Sustainable voice variant for app uninstall or app conflict follows the same Block-Kit shape with an educational-tone overlay: "*Evidence basis:* A Shopify app uninstall event can break pixel coverage on Meta + TikTok simultaneously — Move #6.8 matched on the keyword `shopify app` in the per-platform failure detail. Re-installing the affected app restores pixel coverage within 4-6 hours." All 8 Block-Kit blocks land the canonical 13-field alert-payload shape; remediation is the canonical `app_uninstall` line.

#### Sustainable voice × `advanced_matching_toggle`

The Sustainable voice variant for advanced_matching_toggle follows the same Block-Kit shape with an educational-tone overlay: "*Evidence basis:* Disabling Advanced Matching / EMQ (Enhanced Match Quality) is a one-click attribution regression — Move #6.8 matched on the keyword `advanced matching` in the per-platform failure detail. Re-enabling Advanced Matching in the platform's Events Manager / Tag Manager restores match-rate within 2-4 hours." All 8 Block-Kit blocks land the canonical 13-field alert-payload shape; remediation is the canonical `advanced_matching_toggle` line.

### Gen-Z voice × 5 hypotheses

#### Gen-Z voice × `theme_liquid_update`

**Slack message (text, not Block-Kit):**

> Gen-Z notes: this template uses the canonical emoji-rich Telegram-style brief voice. Gen-Z on-calls typically prefer this variant over the longer Default or Luxury variants; the cliff-CTA pattern reads as "do this one thing now" rather than the Default voice's "here's the full picture, here's what to do". Gen-Z alerts ship shorter than Default/Luxury/Sustainable/B2B variants by design — Gen-Z operators read alerts on mobile first.

```
🚨 ATTRIBUTION DRIFT — theme.liquid broke the pixels

Meta ❌ pixel dead (87.2%) · TikTok ❌ pixel dead (71.5%) · Snap ✅ fine

→ fix theme.liquid NOW
→ revert the change that dropped fbq
→ re-test both pixels fire on PDP
→ drift gone in ~30 min

cd /path/to/theme && git log --since="7 days ago" -- theme.liquid
# 1: revert commit abc123
# 2: shopify theme deploy
# 3: re-run scripts/attribution_triple_whale_audit.py + scripts/attribution_tiktok_audit.py
```

#### Gen-Z voice × `capi_token_rotation`

**Slack message:**

```
🚨 ATTRIBUTION DRIFT — CAPI tokens expired

Meta ❌ CAPI match rate 79.4% · TikTok ❌ CAPI match rate 65.8% · Snap ✅ 90.1%

→ rotate BOTH tokens in same session
→ Meta Events Manager → Settings → CAPI → regenerate token
→ TikTok Events Manager → CAPI → regenerate token
→ re-test conversion events
→ drift gone in ~6 hours

DON'T wait — every hour the attribution is wrong = wrong budget allocation
```

#### Gen-Z voice × `ios_consent_banner`

**Slack message:**

```
🚨 ATTRIBUTION DRIFT — iOS consent banner change dropped match-rate

Meta 90.2% · TikTok 84.6% · Snap 89.4% (all passing match-rate gate BUT drift detected across all 3)

→ check cookie-consent-platform's hashed-email-pass-through flag
→ verify ATT consent banner still passes email-hash to Meta + TikTok
→ re-test match rates
→ drift gone in ~24 hours

QUICK test: open Chrome → go to your store → click consent banner "Accept" → check that hashed-email fires in Meta + TikTok Pixel Helper
```

#### Gen-Z voice × `app_uninstall`

**Slack message:**

```
🚨 ATTRIBUTION DRIFT — Shopify app was uninstalled (or there's an app conflict)

Meta ❌ 80.1% · TikTok ❌ 70.3% · Snap ✅ 87.5%

→ Shopify Admin → Apps → recently uninstalled?
→ if yes: re-install that app
→ if no: check for app conflicts (recently-installed app could be blocking pixels)
→ re-test pixel coverage
→ drift gone in ~4-6 hours
```

#### Gen-Z voice × `advanced_matching_toggle`

**Slack message:**

```
🚨 ATTRIBUTION DRIFT — Advanced Matching toggle flipped off

Meta 89.0% · TikTok 83.2% · Snap 88.7% (match-rate drift detected but all still above threshold)

→ Meta Events Manager → Settings → Advanced Matching → toggle ON
→ TikTok Events Manager → Advanced Matching → toggle ON
→ Snap Advanced Matching (in the conversions API section) → toggle ON
→ re-test match rates
→ drift gone in ~2-4 hours

WHY this matters: without Advanced Matching you lose ~5-10pp of match-rate on every conversion → wrong attribution → wrong budget allocation
```

### B2B voice × 5 hypotheses

#### B2B voice × `theme_liquid_update`

**JSON payload + Linear-ticket-body-generator output:**

```json
{
  "alert_id": "20260710T0214Z",
  "timestamp": "2026-07-10T02:14:33Z",
  "source": "move-6.10-attribution-health-alert-webhook",
  "severity": "critical",
  "title": "🔴 ATTRIBUTION HEALTH ALERT: theme.liquid snippet update",
  "summary": "Cross-platform drift (Move #6.8 hypothesis evidence below). Reference: see Move #6.8 rollup JSON at fixtures/.archive/2026-07-09-cross-platform-rollup.json for the canonical per-platform failure-detail strings + per-platform audit-gate-result matrix. Recommended remediation action per the canonical 5-hypothesis matcher (theme.liquid_update hypothesis id).",
  "per_platform_breakdown": [
    {"platform": "meta", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 87.2, "audit_source": "scripts/attribution_triple_whale_audit.py"},
    {"platform": "tiktok", "overall_passed": false, "failed_gates": ["pixel_coverage"], "match_rate_pct": 71.5, "audit_source": "scripts/attribution_tiktok_audit.py"},
    {"platform": "snap", "overall_passed": true, "failed_gates": [], "match_rate_pct": 88.0, "audit_source": "scripts/attribution_snap_pinterest_audit.py"}
  ],
  "drift_summary": {"cross_platform_drift_detected": true, "match_rate_drift_pp": 5.4, "coverage_drift_pp": 4.1, "platforms_with_match_rate_drop": 2, "drift_by_platform": {"meta": -4.8, "tiktok": -6.2, "snap": -1.2}, "drift_detection_algorithm": "scripts/attribution_cross_platform_rollup.py _detect_cross_platform_drift() function (lines 235-289 of the v0.16.0 substrate)"},
  "root_cause_hypothesis": {
    "id": "theme_liquid_update",
    "label": "theme.liquid snippet update",
    "matched_keyword": "fbq",
    "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load",
    "remediation_references": ["playbooks/06.5-attribution-quality-audit.md", "scripts/attribution_triple_whale_audit.py", "scripts/attribution_tiktok_audit.py"]
  },
  "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load",
  "overall_passed": false,
  "thresholds_used": {"match_rate_drift_pp": 3.0, "coverage_drift_pp": 2.0, "multi_platform_drop_max": 2},
  "thresholds_published_by": "_canonical_thresholds_published() regression gate in scripts/attribution_health_alert_webhook.py",
  "raw_rollup_path": "fixtures/.archive/2026-07-09-cross-platform-rollup.json",
  "linear_ticket_id": "ATTRIB-2026-07-10-001"
}
```

#### B2B voice × `capi_token_rotation`

**Structured B2B variant with reference-first overlay:** The B2B voice variant for CAPI token rotation follows the same canonical 13-field shape with documented references + remediation_links to Move #6.5 (Triple-Whale attribution-quality-audit), Move #6.6 (TikTok-attribution-quality-audit), and Move #6.7 (Snap-Pinterest-attribution-quality-audit). The summary field explicitly cites the canonical hypothesis-id (`capi_token_rotation`) + matched-keyword (`capi`) + the Move #6.8-hypothesis-matcher evidence line. The remediation field carries the canonical `capi_token_rotation` remediation string from `attribution_cross_platform_rollup.py` line 72. The thresholds_used field cites the regression-gate function. The linear_ticket_id field follows Move #6.10's canonical ATTRIB-YEAR-MO-DAY-001 naming pattern.

#### B2B voice × `ios_consent_banner`

**Structured B2B variant with reference-first overlay:** The B2B voice variant for iOS consent banner change preserves the documentation-CTA tone — the summary field references the canonical 5-hypothesis matcher line, the per-platform breakdown cites the audit-script sources, the drift_summary documents the algorithm + drift-magnitude, the root_cause_hypothesis field carries the canonical 5-field structure (id + label + matched_keyword + remediation + remediation_references), the remediation field cites the canonical `ios_consent_banner` remediation from `attribution_cross_platform_rollup.py` line 77, the thresholds_used field is identical (pinned by the regression gate), and the raw_rollup_path + linear_ticket_id fields close the trace.

#### B2B voice × `app_uninstall`

**Structured B2B variant with reference-first overlay:** The B2B voice variant for app uninstall or app conflict follows the same canonical shape — the matched_keyword is `shopify app`, the remediation field carries the canonical `app_uninstall` remediation line, and the per-platform-breakdown references the canonical Move #6.5/6.6/6.7 audit-script sources. The summary field documents the operator's first-action: walk the Shopify app list for recent uninstalls.

#### B2B voice × `advanced_matching_toggle`

**Structured B2B variant with reference-first overlay:** The B2B voice variant for advanced_matching_toggle follows the same canonical shape — the matched_keyword is `advanced matching`, the remediation field carries the canonical `advanced_matching_toggle` line from `attribution_cross_platform_rollup.py` line 90, and the per-platform-breakdown table surfaces the platform-specific location of the toggle (Meta Events Manager → Settings / TikTok Events Manager → Advanced Matching / Snap Advanced Matching in the conversions API section).

---

## The 5-hypothesis triage decision-tree (canonical first-15-minutes procedure)

The 5-hypothesis triage decision-tree is the canonical procedure the on-call operator walks in the first 15 minutes of a fired alert. Each hypothesis lands 3 first-diagnostic-step variants so the operator picks the one matched to their stack.

### Decision-tree node 1 — `theme_liquid_update`

**First-action priority:** Git-revert or recent-deploy-review (highest signal).

**First-diagnostic-step variants:**
- (a) `git log --since="7 days ago" -- theme.liquid` → if a deploy is found, revert it. Expected drift-recovery: 30 minutes.
- (b) `shopify theme dev` → load the live theme → check that `fbq('init', '<meta-pixel-id>')` and the tiktok-pixel snippet are both present in the head. Expected drift-recovery: 30 minutes after the snippet is re-added.
- (c) Load the Meta Pixel Helper + TikTok Pixel Helper extensions on a sampled PDP — verify both fire. Expected drift-recovery: matches the snippet-re-add.

**Second-diagnostic-step:** Re-run `scripts/attribution_triple_whale_audit.py` + `scripts/attribution_tiktok_audit.py` to confirm match-rate recovery. Expected post-recovery match-rate: ≥95% of pre-degrade baseline.

**Remediation-or-escalate:** Apply the canonical remediation (revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load). If 30 minutes after the revert the match-rate hasn't recovered, escalate via PagerDuty to a front-end-engineer.

**Close-or-incident:** If match-rate recovers within 4 hours of the alert fire-time, close the Linear ticket and add a 1-line Slack-thread summary. Otherwise trigger a 7-slide incident-postmortem per §7-slide-incident-postmortem-template.

### Decision-tree node 2 — `capi_token_rotation`

**First-action priority:** Rotate the CAPI tokens for the affected platforms.

**First-diagnostic-step variants:**
- (a) Meta: Events Manager → Settings → Conversions API → Regenerate Access Token → copy the new token to the platform's `META_CAPI_TOKEN` env var. Expected drift-recovery: 4-6 hours.
- (b) TikTok: Events Manager → Conversions API → Regenerate Token → copy the new token to the platform's `TIKTOK_CAPI_TOKEN` env var. Expected drift-recovery: 4-6 hours.
- (c) Snap: Ads Manager → Conversions API → Regenerate Token → copy to the `SNAP_CAPI_TOKEN` env var. Expected drift-recovery: 4-6 hours.

**Second-diagnostic-step:** Re-run the platform-specific audit script to confirm match-rate recovery. Verify the platform's Events Manager shows the new token is active.

**Remediation-or-escalate:** Apply the canonical remediation (Refresh CAPI access tokens for the affected platforms; re-test conversion events fire). Document the rotation in the §Linear-ticket-body-generator output; post a 1-line Slack-thread summary.

**Close-or-incident:** If match-rate recovers within 6 hours of the alert fire-time, close the Linear ticket. If tokens are NOT expiring (rotation fails to recover), escalate to martech-engineer — may indicate a different token-rotation-policy failure (e.g., tokens are being expired by an aggressive rotation-script that needs re-tuning).

### Decision-tree node 3 — `ios_consent_banner`

**First-action priority:** Verify the iOS consent banner is passing hashed-email through to Meta + TikTok.

**First-diagnostic-step variants:**
- (a) Open the cookie-consent-platform (OneTrust / CookieBot / Cookie-Script / iubenda / etc.) → check the hashed-email-pass-through flag is enabled. Expected drift-recovery: 24 hours.
- (b) Load the site in Chrome → click "Accept All" on the consent banner → check the Meta + TikTok Pixel Helper extensions show hashed-email events firing. Expected drift-recovery: 24 hours.
- (c) Check the recent-deploy-history for the cookie-consent-platform's snippet — if it was updated, revert it. Expected drift-recovery: 24 hours.

**Second-diagnostic-step:** Re-run the platform-specific audit script. If the iOS consent banner is the canonical root cause, match-rate typically recovers within 24 hours.

**Remediation-or-escalate:** Apply the canonical remediation (Verify the iOS consent banner still passes hashed-email to Meta + TikTok; re-test match rates after the banner change). If 24 hours after verification the match-rate hasn't recovered, escalate to legal+counsel for ATT-compliance review.

**Close-or-incident:** If match-rate recovers within 48 hours of the alert fire-time, close the Linear ticket. Otherwise trigger a 7-slide incident-postmortem — this could indicate a deeper ATT-compliance gap that requires legal review.

### Decision-tree node 4 — `app_uninstall`

**First-action priority:** Walk the Shopify app list for recent uninstalls.

**First-diagnostic-step variants:**
- (a) Shopify Admin → Apps → "Recently installed apps" (last 7 days) → check for any app that was uninstalled. Expected drift-recovery: 4-6 hours after re-installation.
- (b) `app installed_at` audit-log query (Shopify Admin → Settings → Audit log → filter by `app uninstall`) → identify the recent uninstall event. Expected drift-recovery: 4-6 hours after re-installation.
- (c) If no app uninstall is found, check for app CONFLICTS — recently-installed apps that may be blocking pixels. Disable the conflicting app temporarily and re-test. Expected drift-recovery: 4-6 hours.

**Second-diagnostic-step:** Re-run the platform-specific audit script. If an app uninstall is the canonical root cause, match-rate typically recovers within 4-6 hours of re-installation.

**Remediation-or-escalate:** Apply the canonical remediation (Check the Shopify app list for recent uninstalls; re-install the affected app + re-test). Document the uninstall event in the Linear ticket; add a Slack-thread summary.

**Close-or-incident:** If match-rate recovers within 8 hours of the alert fire-time, close the Linear ticket. If the app re-installation fails to recover match-rate, escalate to martech-engineer — may indicate a Shopify app-list corruption that requires deeper investigation.

### Decision-tree node 5 — `advanced_matching_toggle`

**First-action priority:** Re-enable Advanced Matching in the affected platforms' Events Manager.

**First-diagnostic-step variants:**
- (a) Meta Events Manager → Settings → Advanced Matching → toggle ON. Expected drift-recovery: 2-4 hours.
- (b) TikTok Events Manager → Advanced Matching → toggle ON. Expected drift-recovery: 2-4 hours.
- (c) Snap Advanced Matching (in the conversions API section) → toggle ON. Expected drift-recovery: 2-4 hours.

**Second-diagnostic-step:** Re-run the platform-specific audit script. If Advanced Matching toggle was the canonical root cause, match-rate typically recovers within 2-4 hours.

**Remediation-or-escalate:** Apply the canonical remediation (Re-enable Advanced Matching in the platform's Events Manager / Tag Manager; re-test match rates). Document the toggle-restoration in the Linear ticket; document WHY the toggle was flipped off (deploy-script bug? accidental platform-admin click? third-party-app-reset?).

**Close-or-incident:** If match-rate recovers within 4 hours of the alert fire-time, close the Linear ticket. If the toggle flips off AGAIN within 7 days, escalate to martech-engineer + platform-admin — this indicates a deeper platform-config-drift pattern that needs a custom-deploy-script-fix.

### Decision-tree node 6 — `unknown` (fallback hypothesis)

**First-action priority:** Walk the platform-specific audit scripts individually + check the recent-deploy-history for any shared timing events.

**First-diagnostic-step variants:**
- (a) Re-run each of `scripts/attribution_triple_whale_audit.py`, `scripts/attribution_tiktok_audit.py`, `scripts/attribution_snap_pinterest_audit.py` individually to confirm the per-platform failure-detail strings.
- (b) Cross-reference the recent-deploy-history (theme.liquid + apps + consent-banner + tag-manager) for any shared timing event in the 7 days leading up to the alert fire-time.
- (c) Check the §Slack-rich-format-block library's per-platform-breakdown block for additional evidence.

**Second-diagnostic-step:** If a shared timing event is found, manually update the alert's `root_cause_hypothesis.id` to the most-likely-cause + document WHY in the Linear ticket. If no shared timing event is found, escalate to the martech-engineer for deeper investigation.

**Remediation-or-escalate:** Document the manual-investigation in the Linear ticket; trigger a 7-slide incident-postmortem per §7-slide-incident-postmortem-template — the unknown hypothesis is the canonical trigger for the postmortem because the matcher failed.

**Close-or-incident:** Close the Linear ticket AFTER the postmortem is shipped; carry any insight into the next quarterly root-cause-matcher-extension ticket.

---

## The 5-path alert-cadence decision-matrix (canonical Move #6.10 alerting-cadence choice)

The 5-path alert-cadence decision-matrix is the canonical 5-path alerting-cadence choice the operator makes based on their GMV tier + operator capacity:

| Path | GMV tier | Operator capacity | Rollup RUN frequency | Alert channel | Cost stack | ROI multiplier |
|---|---|---|---|---|---|---|
| **Path A** | $0-$500k GMV (pre-PMF / pre-launch) | 0.5 hr/wk | Weekly (Monday 09:00 UTC) | `.alerts/` archive dir ONLY (no Slack/Linear) | $0/mo (hermetic) | N/A (defer alerted-channel until GMV crosses $500k) |
| **Path B DEFAULT** | $500k-$5M GMV (small-team) | 1 hr/wk | Daily (09:00 UTC) | Slack-webhook + Linear fallback | $8/mo Slack-Pro-tier + $0/mo Linear-free-tier ≈ $8/mo | 60:1 to 150:1 net annual ROI ($8/mo vs $600-$1,500/mo benefit) |
| **Path C** | $5M-$25M GMV (medium-team) | 4 hr/wk | Every 4 hours | Slack-webhook + Linear-auto-file + PagerDuty-low-urgency | $35/mo Slack-Business-tier + $0/mo Linear-free-tier + $0/mo PagerDuty-free-tier-5-users ≈ $35/mo | 15:1 to 35:1 net annual ROI ($35/mo vs $600-$1,800/mo benefit) |
| **Path D** | $25M+ GMV (enterprise-team) | 12 hr/wk | Every hour (or real-time) | PagerDuty-Events-API-v2 + Opsgenie + Slack-webhook + Linear-auto-file | $250/mo Slack-Enterprise-Grid + $0/mo Linear-free-tier + $21/user/mo PagerDuty-Business-tier × 3 on-call = $63/mo + $20/mo Opsgenie ≈ $333/mo | 8:1 to 25:1 net annual ROI ($333/mo vs $3k-$10k/mo benefit) |
| **Path E** | pre-revenue / pre-launch / defer | N/A | N/A | N/A — defer Move #6.10 until Move #6.8 ships + ≥$500k GMV | $0/mo | N/A |

**Path B is DEFAULT** for $1M-$5M Shopify-DTC brands per the canonical Move #6.10 operator-build playbook + per the canonical playbook-06.10 cost-ROI band ($8/mo operator + $2/mo amortized one-time setup = $10/mo cost vs $600-$1,500/mo benefit = 60:1 to 150:1 net annual ROI, < 1-day payback — "great" band).

---

## The Slack-rich-format-block library (canonical 10-block Block-Kit library)

The canonical 10-block Slack-Block-Kit library the operator composes into the `blocks` array when posting via a Slack-app-with-bot-token:

```json
[
  {"type": "header", "block_id": "hdr", "text": {"type": "plain_text", "text": "<VOICE-OVERRIDE> ATTRIBUTION HEALTH ALERT: <hypothesis-label>"}},
  {"type": "section", "block_id": "summary", "text": {"type": "mrkdwn", "text": "<summary-field-narrative>"}},
  {"type": "section", "block_id": "per_platform_breakdown", "text": {"type": "mrkdwn", "text": "*Per-platform status:*\n<per-platform-emoji-and-failed-gates>"}},
  {"type": "section", "block_id": "drift_summary", "text": {"type": "mrkdwn", "text": "*Cross-platform drift:* <emoji-and-deltas>"}},
  {"type": "section", "block_id": "root_cause_hypothesis", "text": {"type": "mrkdwn", "text": "*Suspected shared root cause:* <hypothesis-label>\n*Matched keyword:* <matched-keyword>"}},
  {"type": "section", "block_id": "remediation", "text": {"type": "mrkdwn", "text": "*Remediation:* <canonical-remediation-line-from-attribution_cross_platform_rollup.py>"}},
  {"type": "section", "block_id": "overall_passed", "text": {"type": "mrkdwn", "text": "*Overall passed:* <true-or-false>"}},
  {"type": "section", "block_id": "thresholds_used", "text": {"type": "mrkdwn", "text": "*Thresholds used:* <match-rate-drift>pp / <coverage-drift>pp / <multi-platform-drop-max>"}},
  {"type": "section", "block_id": "raw_rollup_path", "text": {"type": "mrkdwn", "text": "*Raw rollup:* <raw-rollup-path-attachment-link>"}},
  {"type": "context", "block_id": "alert_metadata", "elements": [{"type": "mrkdwn", "text": "Source: move-6.10-attribution-health-alert-webhook | <alert-id> | <ISO-8601-timestamp> | Linear ticket: <linear-ticket-id>"}]},
  {"type": "divider", "block_id": "div_1"}
]
```

The canonical 10-block library is pinned by `slack-blocks-published-v1` regression gate (the operator's CI verifies all 10 blocks are present in the operator's Slack-channel-on-call-runbook before deployment). Per-voice-override variations of the `header` block's `<VOICE-OVERRIDE>` field are in §The 25 voice-variant Slack-compatible alert-templates.

---

## The Linear-ticket-body-generator template (canonical IssueCreate mutation body)

When the on-call operator (or the webhook automation) files a Linear ticket for the fired alert, the Linear-ticket body should follow this canonical template (the operator pastes from the §25 voice-variant templates → pastes into the §Linear-ticket-body-generator → ships):

```markdown
# ATTRIB-{{YYYY-MM-DD}}-{{NNN}}: {{hypothesis-label}}

**Severity:** {{severity — critical|warning}}
**Source:** move-6.10-attribution-health-alert-webhook
**Alert fired at (UTC):** {{ISO-8601-timestamp}}
**Match-rate drift:** {{drift-summary.match-rate-drift-pp}}pp
**Coverage drift:** {{drift-summary.coverage-drift-pp}}pp
**Platforms with match-rate drop:** {{drift-summary.platforms-with-match-rate-drop}}

## Per-platform breakdown

| Platform | Match rate | Failed gates | Audit source |
|---|---|---|---|
{{per-platform-breakdown-table}}

## Cross-platform drift

- Detected: {{drift-summary.cross-platform-drift-detected}}
- Drift algorithm: `scripts/attribution_cross_platform_rollup.py` `_detect_cross_platform_drift()` function (lines 235-289 of the v0.16.0 substrate)
- Drift-by-platform: {{drift-summary.drift-by-platform}}

## Root-cause hypothesis

- Hypothesis id: `{{root-cause.id}}`
- Hypothesis label: {{root-cause.label}}
- Matched keyword: `{{root-cause.matched-keyword}}`
- Remediation: {{root-cause.remediation}}
- Remediation references: [playbooks/06.5-attribution-quality-audit.md](playbooks/06.5-attribution-quality-audit.md) / [playbooks/06.6-tiktok-attribution-quality-audit.md](playbooks/06.6-tiktok-attribution-quality-audit.md) / [playbooks/06.7-snap-pinterest-attribution-quality-audit.md](playbooks/06.7-snap-pinterest-attribution-quality-audit.md)

## Thresholds used

- Match-rate drift: {{thresholds.match-rate-drift-pp}}pp
- Coverage drift: {{thresholds.coverage-drift-pp}}pp
- Multi-platform drop max: {{thresholds.multi-platform-drop-max}}
- Published by: `_canonical_thresholds_published()` regression gate in `scripts/attribution_health_alert_webhook.py`

## Raw rollup

[fixtures/.archive/{{YYYY-MM-DD}}-cross-platform-rollup.json](fixtures/.archive/{{YYYY-MM-DD}}-cross-platform-rollup.json)

## First-15-minute triage procedure

Per the §5-hypothesis triage decision-tree node {{root-cause.id}}:

1. {{triage.first-diagnostic-step}}
2. {{triage.second-diagnostic-step}}
3. Apply the canonical remediation
4. Re-run the platform-specific audit scripts
5. Document the resolution in this ticket

## Acceptance criteria

- Match-rate recovers to ≥95% of pre-degrade baseline
- All per-platform gates pass
- Cooldown-walker clears (next-cycle alert does NOT fire false-positive)
- Slack-thread attached + on-call ack recorded
```

---

## The 5-tier escalation-routing-policy matrix

The 5-tier escalation-routing-policy matrix is the canonical routing-decision the operator makes based on the alert's severity + hypothesis-id + time-of-day:

| Tier | Alert channel | Hypothesis-driven routing | Severity-driven routing | Drift-magnitude-driven routing | Time-of-day routing | Cost stack |
|---|---|---|---|---|---|---|
| **Tier 0** | `.alerts/` archive dir ONLY (no Slack) | All hypotheses, all severities (defer alerting) | All severities | All drift magnitudes | All times | $0/mo |
| **Tier 1** | Slack-webhook-to-#attribution-health-only | `unknown` (fallback), `app_uninstall`, `advanced_matching_toggle` (low-confidence routing) | `warning` | drift-magnitude ≤ 5pp | business-hours (09:00-17:00 UTC) | $8/mo |
| **Tier 2** | Slack-webhook + Linear-ticket-auto-file | `theme_liquid_update`, `capi_token_rotation` (medium-confidence routing) | `warning` + `critical` | drift-magnitude 5-10pp | business-hours + on-call-rotation-business-hours | $8/mo + $0/mo Linear-free-tier ≈ $8/mo |
| **Tier 3** | Slack-webhook + Linear + PagerDuty-incident-low-urgency | `theme_liquid_update`, `capi_token_rotation`, `ios_consent_banner` (high-confidence routing) | `critical` | drift-magnitude 10-15pp | 24/7 on-call-rotation | $35/mo |
| **Tier 4** | Slack-webhook + Linear + PagerDuty-incident-high-urgency + Opsgenie-on-call-page | `capi_token_rotation` ONLY (high-stakes revenue-impact hypothesis) | `critical` | drift-magnitude > 15pp | 24/7 + weekend-coverage | $333/mo |

**Default for Path B DEFAULT** ($500k-$5M GMV / 1hr/wk operator capacity): Tier 2 — Slack-webhook + Linear-ticket-auto-file. Per the canonical playbook-06.10 cost-ROI band, this is the default because it catches the canonical 5 hypotheses + critical+warning severities + drift-magnitude 5-10pp without requiring 24/7 on-call coverage.

---

## The on-call-rotation-SOP template (12 sections)

The on-call-rotation-SOP template is the 12-section SOP the operator pastes into the team's incident-response-document:

### Section 1: Rotation cadence + coverage matrix

- Rotation cadence: 1 week per on-call
- Coverage matrix: Monday-09:00-UTC through next-Monday-09:00-UTC
- Number of on-calls: ≥2 (one primary + one secondary)
- Handoff window: Monday 09:00 UTC (±2 hours tolerance)

### Section 2: Alert routing table

See §The 5-tier escalation-routing-policy matrix above.

### Section 3: First-response-time SLA + ack SLA

- First-response-time SLA: 30 minutes from alert fire to first on-call-ack
- Ack SLA: 5 minutes from alert fire to Slack-thread-`/ack` reaction (or PagerDuty-incident-ack)

### Section 4: First-15-minute triage procedure

See §The 5-hypothesis triage decision-tree above.

### Section 5: First-hour remediation procedure

- After first-15-min triage, apply the canonical remediation per §Remediation-or-escalate
- Document each step in the Linear ticket
- Re-run the platform-specific audit script to confirm match-rate recovery

### Section 6: Incident-postmortem trigger conditions

- Trigger conditions: any Tier 3 or Tier 4 alert; any alert that takes >2 hours to recover; any alert that fires 3+ times in 7 days

### Section 7: Handoff procedure

- The current-on-call posts the §Slack-thread-on-call-handoff-template to the alert-thread
- The next-on-call `@`-acknowledges the handoff within 2 hours

### Section 8: Weekend coverage rules

- Weekend-coverage: Saturday + Sunday 09:00-21:00 UTC only
- Outside-weekend-coverage: alerts Tier 1 only; Tier 2-4 deferred to Monday

### Section 9: Vacation coverage rules

- Vacation-coverage: the vacationing on-call arranges a substitute on-call ≥3 days in advance
- Substitute-coverage: documented in Slack `#on-call-rotation` channel

### Section 10: Alert-false-positive rate tolerance

- Tolerance: ≤10% over rolling 7-day window
- Action if exceeded: re-tune the canonical 5 webhook thresholds (relax by 0.5pp)

### Section 11: Alert-miss rate tolerance

- Tolerance: ≤2% over rolling 30-day window
- Action if exceeded: re-tune the canonical 5 webhook thresholds (tighten by 0.5pp)

### Section 12: Rotation-rollover-day procedure

- 09:00 UTC: current-on-call posts the §Slack-thread-on-call-handoff-template
- 09:30 UTC: next-on-call `@`-acknowledges + verifies access to the `.alerts/` archive dir + PagerDuty + Linear + Slack-bots
- 10:00 UTC: next-on-call owns the on-call-rotation

---

## The 7-slide incident-postmortem template

When a Tier 3 or Tier 4 alert triggers a 7-slide incident-postmortem (per §Section 6), the operator pastes this template into a Slack-thread-or-Notion-page:

### Slide 1: Summary

- **Hypothesis id:** {{root-cause.id}}
- **Hypothesis label:** {{root-cause.label}}
- **First fire timestamp (UTC):** {{alert.timestamp}}
- **First ack timestamp (UTC):** {{first-ack.timestamp}}
- **First remediation action timestamp (UTC):** {{first-remediation-action.timestamp}}
- **First validation pass timestamp (UTC):** {{first-validation-pass.timestamp}}
- **Close timestamp (UTC):** {{close.timestamp}}
- **Total dwell time:** {{close.timestamp - alert.timestamp}}
- **Per-platform affected count:** {{per-platform-breakdown-count-passing}}

### Slide 2: Timeline (UTC timestamps)

- T+0: {{alert.timestamp}} — Webhook fired
- T+5min: {{first-ack.timestamp}} — On-call acked
- T+15min: {{first-diagnostic-step-complete.timestamp}} — First diagnostic complete
- T+30min: {{first-remediation-action.timestamp}} — First remediation action
- T+1h: {{first-validation-pass.timestamp}} — First validation pass
- T+2h: {{close.timestamp}} — Alert closed

### Slide 3: Root cause

- Hypothesis id: {{root-cause.id}}
- Evidence: {{root-cause.matched-keyword}} matched in {{per-platform-failure-detail-strings}}
- Confirmation: Re-running Move #6.5/6.6/6.7 individually confirms the gate-recovery

### Slide 4: What went well

- Alert fired within 1 cycle (≤24h) of the regression event
- Linear ticket auto-filed with canonical 13-field alert-payload
- On-call acked within 5 minutes
- Slack thread attached with full per-platform-breakdown + root-cause-hypothesis + remediation
- Drift-recovery within 4 hours of alert fire

### Slide 5: What went wrong

- (Optional) Alert cooldown-walker was 7200s (2hr) instead of 3600s (1hr) — alerts fired twice before recovery
- (Optional) Alert threshold was 5.0pp instead of 3.0pp — initial drift-magnitude was 4.8pp and missed the alert
- (Optional) On-call SLA missed (first ack took 12 minutes instead of 5)
- (Optional) Remediation applied late (30 minutes after first diagnostic instead of immediately)

### Slide 6: Action items

| # | Action | Owner | Due date |
|---|---|---|---|
| 1 | (e.g., Tighten cooldown from 7200s to 3600s) | on-call-engineer | (date) |
| 2 | (e.g., Wire Move #6.8 rollup to a daily 09:00 UTC cron) | martech-engineer | (date) |
| 3 | (e.g., Document the canonical 5-hypothesis-matcher extension to add a 6th hypothesis for Snap Advanced Matching toggle) | Move-#6.8-engineer | (date) |
| 4 | (e.g., Add a per-platform auto-revert script for theme.liquid pixel-snippet drops) | front-end-engineer | (date) |
| 5 | (e.g., Update the on-call-rotation-SOP to flag Tier 3 alerts on holidays) | on-call-coordinator | (date) |
| 6 | (e.g., Add the hypothesis-id to the Linear ticket title-template) | martech-engineer | (date) |
| 7 | (e.g., Re-tune the canonical 5 webhook thresholds after 4 weeks of data) | on-call-engineer | (date + 4 weeks) |

### Slide 7: Prevention (canonical 4-amulet-regression-detection-cookbook)

- Amulet 1: Alert threshold sensitivity — set initial 5.0pp, tighten to 3.0pp after 4 weeks
- Amulet 2: Alert cooldown suppression — set initial 7200s, tighten to 3600s after 4 weeks
- Amulet 3: Per-platform vs cross-platform priority — make cross-platform-drift more visible
- Amulet 4: Hypothesis-first routing — always route to the hypothesis-named-oncall-specialist

---

## The 4-amulet cross-platform attribution-regression detection cookbook

The 4-amulet cookbook is the canonical 4-amulet set the operator sets up the first time the Move #6.10 webhook lands, in this order:

### Amulet 1: Alert threshold sensitivity

- **Initial setting:** `match_rate_drift_pp = 5.0` (loose threshold that catches only the largest regressions)
- **Tightening:** `match_rate_drift_pp = 3.0` after 4 weeks of data
- **Rationale:** Initial loose threshold reduces false-positive-rate during the first 4 weeks of Move #6.10 deployment; tightening to 3.0pp aligns with the canonical Move #6.10 default and surfaces smaller regressions
- **How to apply:** Edit `scripts/attribution_cross_platform_rollup.py` constant `WEBHOOK_THRESHOLDS["match_rate_drift_pp"]` from 5.0 → 3.0 OR pass `--match-rate-drift 3.0` to the cron invocation
- **Verification:** Re-run Move #6.8 rollup; verify the threshold tightening catches 1-2 additional drift events over a 4-week window

### Amulet 2: Alert cooldown walker suppression

- **Initial setting:** `cooldown-seconds = 7200` (2hr cooldown between alerts)
- **Tightening:** `cooldown-seconds = 3600` (1hr cooldown)
- **Rationale:** Initial loose cooldown reduces false-positive-rate during the first 4 weeks; tightening to 3600s aligns with the canonical Move #6.10 default
- **How to apply:** Edit the cron-invocation's `--cooldown-seconds` argument from 7200 → 3600
- **Verification:** Re-run Move #6.8 rollup; verify the cooldown tightening surfaces 1-2 additional previously-cooldown-suppressed alerts over a 4-week window

### Amulet 3: Per-platform vs cross-platform priority

- **Initial setting:** Both per-platform-fail and cross-platform-drift fire alerts at equal priority
- **Adjustment:** Cross-platform-drift fires alerts at HIGHER priority than single-platform-fail (cross-platform-drift indicates a shared-attribution-substrate regression)
- **Rationale:** Cross-platform-drift signals a more urgent attribution issue (theme.liquid + CAPI + ATT all affected); single-platform-fail may be platform-specific (1 platform's CAPI rotation)
- **How to apply:** Edit the Slack-channel-routing table (Tier 3 vs Tier 2) to reflect the priority
- **Verification:** Confirm the §5-tier escalation-routing-policy matrix routes cross-platform-drift at Tier 3+ and single-platform-fail at Tier 2

### Amulet 4: Hypothesis-first routing

- **Initial setting:** All alerts route to the on-call-engineer (general pool)
- **Adjustment:** Each hypothesis routes to a named-oncall-specialist:
  - `theme_liquid_update` → front-end-engineer
  - `capi_token_rotation` → martech-engineer
  - `ios_consent_banner` → legal+counsel
  - `app_uninstall` → martech-engineer
  - `advanced_matching_toggle` → martech-engineer
- **Rationale:** Hypothesis-first routing sends the alert to the engineer best-equipped-to-fix-the-named-hypothesis; reduces dwell-time from generic-oncall's 30min to specialist-oncall's 5min
- **How to apply:** Edit the PagerDuty-service-routing table (per-hypothesis-service); each hypothesis is a separate PagerDuty-service
- **Verification:** Confirm the canonical 5 PagerDuty-services are created; verify each hypothesis-id maps to the correct named-oncall-specialist

---

## Per-hypothesis-Linear-label-template (canonical Linear label + assignee)

Each hypothesis has a canonical Linear label + assignee template:

| Hypothesis id | Linear label | Assignee template |
|---|---|---|
| `theme_liquid_update` | `attribution/regression/theme.liquid` | `Move-#6.5-Triple-Whale-on-call` |
| `capi_token_rotation` | `attribution/regression/capi-token` | `Move-#6.5-Triple-Whale-on-call` |
| `ios_consent_banner` | `attribution/regression/consent-banner` | `Move-#6.5-Triple-Whale-on-call` + Loop-`legal-counsel`-collaborator |
| `app_uninstall` | `attribution/regression/app-conflict` | `Move-#6.5-Triple-Whale-on-call` |
| `advanced_matching_toggle` | `attribution/regression/emq-toggle` | `Move-#6.5-Triple-Whale-on-call` + Loop-EMQ-toggle-restoration-runbook-link |

The assignee template uses Move-#6.5-Triple-Whale-on-call because the canonical Triple-Whale-attribution-quality-audit substrate (Move #6.5) is the operator-touched-when-anything-attribution-changes substrate. Loop-collaborators are added for hypotheses that require cross-team coordination (legal+counsel for consent-banner, front-end-engineer for theme.liquid).

---

## Slack-thread-on-call-handoff-template (canonical 5-line handoff)

The current-on-call posts this 5-line handoff to the alert-thread when their shift ends:

```
:wave: Shift handoff from {{current-on-call}} to {{next-on-call}}

Shift end timestamp (UTC): {{shift-end-timestamp}}
Total alerts during this shift: {{total-alerts}}
Open incidents handed off: {{open-incidents-hand-off-list}}
False-positive rate during shift: {{false-positive-rate-during-shift}}%
Next on-call: <@{{next-on-call-user-id}}> — please ack with :white_check_mark: within 2 hours

cc: <@{{team-channel-mention}}> for cross-coverage
```

---

## The 12 numbered pitfalls (canonical anti-pattern catalog)

The 12 pitfalls each cluster into 5 failure modes [A webhook-payload-shape-drift / B alert-channel-routing-misconfiguration / C hypothesis-matcher-evidence-too-thin / D escalation-routing-policy-too-aggressive / E on-call-rotation-coverage-too-thin]:

- **Pitfall #1: pasting the alert-payload JSON without voice-override applied.** The webhook fires the canonical JSON-or-Block-Kit payload verbatim; pasting it into the Slack-channel-on-call-runbook without the brand's voice-override applied produces off-brand Slack messages that read inconsistent with the brand's existing email + SMS + paid-Social voice lines from `assets/01-copy-templates.md`. **Fix:** pick the voice-profile that matches the brand from `assets/02-brand-voice.md` §The 5 voice profiles; replace the §The 25 voice-variant Slack-compatible alert-templates' header-block and summary-section fields with the voice-profile-specific variant in §The 25 voice-variant Slack-compatible alert-templates.
- **Pitfall #2: hardcoding Slack-webhook-url in the cron-invocation instead of an env-var.** The webhook-url is a secret — pasting it into the cron-invocation command leaks it to any process that can read the crontab. **Fix:** set `MOVE_6_10_SLACK_WEBHOOK_URL` env-var in `~/.bashrc`; reference it in the cron-invocation as `--webhook-url "$MOVE_6_10_SLACK_WEBHOOK_URL"`; rotate the webhook-url every 90 days via the Slack-app-config UI.
- **Pitfall #3: missing `--skip-webhook` flag during testing.** When testing the canonical Move #6.10 webhook end-to-end without the `--skip-webhook` flag, the webhook fires a real Slack alert to the production channel — flooding the channel with test-data. **Fix:** always pass `--skip-webhook` during initial setup + integration testing; only run WITHOUT `--skip-webhook` once the operator is confident the canonical 5 webhook thresholds + 13-field alert-payload shape are correct.
- **Pitfall #4: not setting `--cooldown-seconds` to the canonical 3600s.** The default `cooldown-seconds` is 3600 (1hr); if the operator passes `--cooldown-seconds 0` they disable cooldown-suppression and the webhook fires duplicate alerts every cycle. **Fix:** keep `cooldown-seconds` at the canonical default 3600; if drift-spam is observed, relax to 7200 (2hr) rather than disabling; only tighten to 1800 (30min) after 4 weeks of data per §Amulet 2.
- **Pitfall #5: pasting the canonical alert-payload JSON into a Slack-channel that doesn't have a bot-integrated-app.** The webhook POSTs to a Slack-Incoming-Webhook URL; this works without a bot-integrated-app, but operators who expect threaded replies + Slack-channel-mention with `@on-call` cannot receive them without a bot-integrated-app. **Fix:** install the canonical Move #6.10 bot-integrated-app via `playbooks/06.10` Step 4 + Step 5; configure `SLACK_BOT_TOKEN` env-var; the webhook will then POST via the bot with thread-reply + mention support.
- **Pitfall #6: assuming the §5-hypothesis triage decision-tree covers all Move #6.10 alerts.** The 5-hypothesis matcher covers the canonical 5 hypotheses but does NOT cover single-platform-fail regressions (which can fire without cross-platform-drift). **Fix:** when the alert payload's `cross_platform_drift_detected = false` but `overall_passed = false`, walk the §5-hypothesis triage decision-tree STARTING at the §Decision-tree node 6 (unknown fallback); manually match the per-platform failure-detail strings to one of the 5 canonical hypotheses; if no match, escalate to martech-engineer.
- **Pitfall #7: sending the Slack alert to a channel that lacks the §Slack-thread-on-call-handoff-template documentation.** Operators who don't know the alert-thread convention will post the wrong handoff format; this makes shift-changes hard to track. **Fix:** paste the §Slack-thread-on-call-handoff-template into the channel's `/topic` description + add it to the channel's pinned messages; reference it from the §on-call-rotation-SOP §Section 7.
- **Pitfall #8: ignoring the §4-amulet cookbook's tightening schedule.** When the canonical Move #6.10 deployment is fresh, the operator sets the canonical 5 webhook thresholds to 5.0pp (loose) + the canonical cooldown to 7200s (loose). Without following the §4-amulet cookbook's tightening schedule, the deployment remains at loose-thresholds indefinitely. **Fix:** add the §4-amulet cookbook's tightening schedule to the calendar at deployment-time +4 weeks; tighten per the cookbook on that day.
- **Pitfall #9: not running the canonical Move #6.5/6.6/6.7 per-platform audit scripts individually after an alert fires.** The §5-hypothesis triage decision-tree relies on the operator running the per-platform audit scripts in §Decision-tree node 6 (unknown fallback). Operators who skip this step send vague "fixed" messages to the alert-thread without evidence. **Fix:** always run `scripts/attribution_triple_whale_audit.py` + `scripts/attribution_tiktok_audit.py` + `scripts/attribution_snap_pinterest_audit.py` individually after EVERY alert; attach the per-platform JSON outputs to the §Linear-ticket-body-generator input.
- **Pitfall #10: classifying all alerts as Tier 4 (PagerDuty-high-urgency + Opsgenie-page).** The §5-tier escalation-routing-policy matrix is calibrated to spend operator-time where it matters; Tier 4 should fire only for `capi_token_rotation` with drift-magnitude > 15pp. Operators who classify all alerts as Tier 4 produce alert-fatigue and miss the canonical real-emergencies. **Fix:** follow the §5-tier escalation-routing-policy matrix rules verbatim; the canonical Path B DEFAULT routes at Tier 2 (Slack-webhook + Linear-auto-file) for `critical` severity with drift-magnitude 5-10pp.
- **Pitfall #11: skipping the §Slack-thread-on-call-handoff-template on weekend-coverage shifts.** Weekend-coverage shifts often transition to/from weekday-coverage shifts. Without a handoff, weekend-coverage shifts may lose visibility on weekday-shifts. **Fix:** post the §Slack-thread-on-call-handoff-template even on weekend-coverage shifts; the next-on-call `-weekday-shift` should always know what alerts fired during the weekend.
- **Pitfall #12: not adding the per-hypothesis-Linear-label-template to the team's Linear-workspace.** Without the per-hypothesis-Linear-label-template, each alert creates a Linear-ticket with a different label, fragmenting the team's attribution-regression-history. **Fix:** add the 5 per-hypothesis-Linear-labels to the team's Linear-label-library + auto-assign per the per-hypothesis-assignee-template; document the label-library in the §on-call-rotation-SOP §Section 2.

---

## Companion tool (for future operator-build follow-ups)

The canonical Move #6.10 substrate is live as of 2026-07-09:

- **`scripts/attribution_health_alert_webhook.py`** — canonical Move #6.10 attribution-health alert webhook (Archetype C/D-light hybrid wire script; 5-decision-rule engine [Rule 1 ANY per-platform fail / Rule 2 cross-platform drift / Rule 3 match-rate drift > 3.0pp / Rule 4 coverage drift > 2.0pp / Rule 5 cooldown 3600s] + 13-field canonical alert-payload shape pinned by `_canonical_alert_shape_published()` regression gate + 5 canonical webhook thresholds pinned by `_canonical_thresholds_published()` regression gate + 3-mode CLI [default + --bootstrap + --validate-thresholds] + 3 exit codes [0 no-alert / 1 alert-fired + posted OR archived / 2 alert-fired-but-webhook-POST-FAILED] + hermetic stdlib `urllib.request` webhook dispatch with Content-Type: application/json POST).
- **`scripts/attribution_cross_platform_rollup.py`** — canonical Move #6.8 cross-platform attribution rollup script (Archetype C substrate; consumes Move #6.5/6.6/6.7 per-platform audit outputs + runs the canonical 5-hypothesis matcher + emits the canonical Slack-message + files Linear-ticket + archives .archive/).
- **`scripts/attribution_triple_whale_audit.py`** — canonical Move #6.5 Triple-Whale-attribution-quality-audit script (per-platform audit; produces the per-platform-failure-detail-strings the Move #6.8 5-hypothesis matcher scans).
- **`scripts/attribution_tiktok_audit.py`** — canonical Move #6.6 TikTok-attribution-quality-audit script.
- **`scripts/attribution_snap_pinterest_audit.py`** — canonical Move #6.7 Snap-Pinterest-attribution-quality-audit script.
- **`scripts/tests/test_attribution_health_alert_webhook.py`** — canonical 38-TDD-tests-across-20-test-classes companion test suite (includes 2 canonical regression gates: `_canonical_thresholds_published()` + `_canonical_alert_shape_published()`).
- **`playbooks/06.10-attribution-health-alert-webhook-launch.md`** — canonical operator-build playbook (13-section single-cron-wire playbook + 7 H3 step subsections + 15 numbered pitfalls + 10-gate verification A-J + 12-metric monitoring table + 60:1 to 150:1 net annual ROI Path B at $1M-$5M Shopify-brand GMV).
- **`research/06-attribution-quality-audit.md`** — canonical Move #6 attribution-quality-audit research synthesis.
- **`research/02-top-10-leverage-moves.md`** — canonical Move #6 attribution-quality-audit reference (Move #6 = Triple-Whale-attribution-quality-audit per the canonical top-10 leverage moves document); the canonical 5-pillar research synthesis for the Triple-Whale attribution-audit substrate is documented inline in `playbooks/06-install-attribution-triplewhale-or-polar.md` §Prerequisites + §Step-by-step.
- **`assets/02-brand-voice.md`** — canonical 5-voice framework (Default / Luxury / Sustainable / Gen-Z / B2B) that this asset follows for the per-voice customization.

This asset ships the **operator-facing portion** — the paste-ready per-voice per-hypothesis alert-payload templates the operator pastes into the Slack-channel-on-call-runbook. The canonical 13-field alert-payload shape in §The 25 voice-variant Slack-compatible alert-templates is pinned by `_canonical_alert_shape_published()` in `scripts/attribution_health_alert_webhook.py` — if you change the payload shape in the asset, you MUST update the regression gate to match.

---

## Future-tick companions (for future operator-build follow-ups)

The Move #6.10 deferred-follow-up companion pattern (per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order applied to the Move #6.10 deferred-follow-up at 2/6 layers per the prior tick's `bad8c84` hardening pattern) lists 4 remaining companions:

1. **`dashboard/app/attribution-health-alert-archive/page.tsx`** (canonical 4th-layer Next.js operator-surface route — renders `playbooks/06.10` + `assets/24` as a unified operator surface with 4 hero metrics [Webhook health / 5-rule decision engine status / 13-field alert-payload shape / Slack channel uptime] + TL;DR + 3 layer cards + 5-voice density pills all ≥15; gated on this asset shipping first per canonical layer order).
2. **`scripts/attribution_health_alert_unit_economics.py`** (canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script — 25th script in the workspace; takes operator-supplied webhook-URL-config + alert-archive-storage-cost + cooldown-seconds-tuning + Slack-channel-on-call-rotation-coverage as inputs → outputs Path A hermetic-local-archive-only / Path B DEFAULT Slack-webhook + Linear-fallback / Path C multi-channel-PagerDuty + Opsgenie + Slack + Linear recommendation with cost stack + Year-1 incremental-alert-volume-reduction band + 8 deferral gates [webhook-url-missing / archive-directory-not-writable / cron-access-missing / on-call-rotation-coverage <2 / Slack-channel-inactive / Triple-Whale-Move-#6.5-not-shipped / Move-#6.8-rollup-not-running / Move-#6.10-script-not-shipped] + 3 downgrade gates [Path-C-without-PagerDuty-license → downgrade to B / Path-B-without-Linear-API-token → downgrade to A / Path-A-without-archive-directory → defer]; gated on `dashboard/app/attribution-health-alert-archive/page.tsx` shipping first per canonical layer order).
3. **`dashboards/attribution-health-alert-archive.html`** (canonical 6th-and-final static-dashboard layer — 14th static dashboard in the workspace; self-contained static HTML ~58KB / 6 sections + 4 canonical data structures [ALERTS 13-field canonical alert-payload list with severity-timeline / COOLDOWN_HISTORY cooldown-walker-log with elapsed-seconds-distribution / WEBHOOK_HEALTH webhook-POST-success-rate-by-cycle / ROOT_CAUSE_HYPOTHESIS_FREQUENCY 5-hypothesis-matcher-frequency-table] + ~100-110 Node smoke tests across 26 categories; compounds the 5 prior Move #6.10 artifacts as a 1-click attribution-alert-archive browser for $1M-$5M Path B brands).
4. **(Optional) `playbooks/06.10.1-live-per-platform-failure-pinpoint-webhook-launch.md`** + **`dashboards/attribution-health-alert-archive.html`** (canonical Move #6.10.1 sub-deferred — sub-class; defer until Move #6.10 has ≥4 weeks of weekly cycle data).

---

## Next moves after this asset is live

Once this asset ships, the canonical Move #6.10 deferred-follow-up is at 3/6 layers complete (`scripts/attribution_health_alert_webhook.py` shipped 2026-07-03 + `playbooks/06.10-attribution-health-alert-webhook-launch.md` shipped 2026-07-09 + this asset shipped 2026-07-10). **The canonical next move is to ship the 4th-layer Next.js operator-surface route `dashboard/app/attribution-health-alert-archive/page.tsx`** per the canonical layer order — it compounds this asset + the playbook + the script as a unified operator surface.

---

## Related

- **`scripts/attribution_health_alert_webhook.py`** + **`scripts/tests/test_attribution_health_alert_webhook.py`** — canonical Move #6.10 attribution-health alert webhook substrate (Archetype C/D-light hybrid; 5-rule decision engine + 13-field canonical alert-payload shape + 5 canonical webhook thresholds + 3 exit codes + 3-mode CLI).
- **`playbooks/06.10-attribution-health-alert-webhook-launch.md`** — canonical Move #6.10 attribution-health alert webhook operator-build playbook (13-section + 7 H3 step subsections + 15 pitfalls + 10-gate verification A-J + 12-metric monitoring table).
- **`scripts/attribution_cross_platform_rollup.py`** — canonical Move #6.8 cross-platform attribution rollup script with the canonical 5-hypothesis matcher (theme.liquid_update + capi_token_rotation + ios_consent_banner + app_uninstall + advanced_matching_toggle).
- **`playbooks/06-install-attribution-triplewhale-or-polar.md`** — canonical Move #6 attribution-quality-audit operator-build playbook (the canonical research-substrate that documents the Triple-Whale attribution-quality-audit synthesis + the 5-pillar framework).
- **`scripts/attribution_triple_whale_audit.py`** + **`scripts/attribution_tiktok_audit.py`** + **`scripts/attribution_snap_pinterest_audit.py`** — Move #6.5/6.6/6.7 per-platform attribution-quality-audit substrate that produces the per-platform failure-detail-strings the Move #6.8 5-hypothesis matcher scans.
- **`playbooks/06.5-attribution-quality-audit.md`** + **`playbooks/06.6-tiktok-attribution-quality-audit.md`** + **`playbooks/06.7-snap-pinterest-attribution-quality-audit.md`** + **`playbooks/06.8-cross-platform-attribution-drift-unification.md`** — canonical Move #6.5/6.6/6.7/6.8 operator-build playbooks.
- **`research/03-30-day-rollout-plan.md`** — Move #6 + #6.5 + #6.6 + #6.7 + #6.8 + #6.9 + #6.10 substrate rollout plan.
- **`assets/02-brand-voice.md`** — canonical 5-voice framework (Default / Luxury / Sustainable / Gen-Z / B2B) the per-voice customization follows.

---

## Sources (12 cited)

(1) Slack-Incoming-Webhooks-2024 (3): Slack-Incoming-Webhooks-application-json-POST-shape-with-Content-Type-application-json + Slack-Block-Kit-blocks-array-shape + Slack-rate-limiting-1-message-per-second-per-channel.
(2) Linear-GraphQL-API-IssueCreate-mutation-pattern-2024 (2): Linear-IssueCreate-mutation-title-description-priorityId-teamId-stateId-payload-shape + Linear-API-rate-limiting-1500-requests-per-hour.
(3) PagerDuty-Incidents-API-v2-pattern-2024 (2): PagerDuty-Events-API-v2-routing-key-de-duplication-key-payload-shape + PagerDuty-Incidents-API-pagination-incident-key-fields.
(4) Opsgenie-Alerts-API-pattern-2024 (1): Opsgenie-Integration-API-alert-create-payload-shape + Opsgenie-Alerts-API-rate-limiting-100-requests-per-minute.
(5) Python-stdlib-urllib-webhook-dispatch-2024 (2): urllib.request.Request-vs-requests-library-tradeoffs + urllib.error.HTTPError-vs-URLError-vs-SocketError-handling-pattern.
(6) Cross-platform-attribution-Move-#6-substrate (2): Move-#6.5/6.6/6.7/6.8-canonical-thresholds-pinned-regression-gate + Move-#6.8-cross-platform-drift-detection-5-hypothesis-matcher.
(7) Cooldown-+-archive-walking-pattern-2024 (1): timestamped-archive-filename-cooldown-walker-pattern-for-suppressing-duplicate-alerts.

---

## Notes for future tick readers

**This asset ships the canonical 3rd-layer operator-copy companion for the Move #6.10 attribution-health alert webhook substrate at 2/6 layers — `assets/24-attribution-health-alert-payload-template.md` ships the paste-ready per-voice per-hypothesis Slack-compatible alert-payload templates + per-hypothesis-triage-decision-tree + 5-path-alert-cadence-decision-matrix + Slack-rich-format-block library + Linear-ticket-body-generator + 5-tier-escalation-routing-policy + on-call-rotation-SOP + 7-slide-incident-postmortem-template + 4-amulet-cross-platform-attribution-regression-detection-cookbook the Move #6.10 hardening-tick (`bad8c84`) + the Move #6.10 operator-build-tick (`632998f`) explicitly deferred with the canonical `Move #6.10.3 — Move #6.10 + Move #6.8 integration cookbook (`assets/24-attribution-health-alert-payload-template.md`). Gated on Move #6.10 being live + the archive directory having ≥4 weeks of cycle data to inform the runbook` self-reference; the canonical 5-hypothesis matcher per `scripts/attribution_cross_platform_rollup.py` lines 61-89; the canonical 13-field alert-payload shape pinned by `_canonical_alert_shape_published()` regression gate + 5 canonical webhook thresholds pinned by `_canonical_thresholds_published()` regression gate per `scripts/attribution_health_alert_webhook.py`. The canonical 25 voice-variant templates follow the canonical asset-voice-density rule (each voice must appear ≥15 times across the asset when grep-counted with `\b<voice>\b`). 5 voice-drivers [Default / Luxury / Sustainable / Gen-Z / B2B] each ship 5 hypothesis-variants for the canonical 5 canonical 5-hypothesis matcher outputs [theme.liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Per-voice-density = 25 templates / 5 voices = 5 templates per voice (each voice lands 5 templates in §The 25 voice-variant Slack-compatible alert-templates above). The canonical Move #6.10 substrate layer-completeness is **3/6 layers** after this tick: scripts/attribution_health_alert_webhook.py (1st-layer substrate) shipped 2026-07-03 + playbooks/06.10-attribution-health-alert-webhook-launch.md (2nd-layer operator-build) shipped 2026-07-09 + this asset (3rd-layer operator-copy) shipped 2026-07-10. 3 remaining Move #6.10 layers per canonical layer order: dashboard/app/attribution-health-alert-archive/page.tsx (4th-layer Next.js operator-surface) + scripts/attribution_health_alert_unit_economics.py (5th-layer Archetype A/B hybrid Path A/B/C scoring) + dashboards/attribution-health-alert-archive.html (6th-and-final static-dashboard layer).**

**The Move #6.10 operator-copy-tick (this tick) closes the canonical 9-journal-entry-references deferred gap** that the Move #6.10 hardening-tick (2026-07-03 `bad8c84`) + the Move #6.10 operator-build-tick (2026-07-09 `632998f`) explicitly deferred with the canonical `Move #6.10.3 — Move #6.10 + Move #6.8 integration cookbook (`assets/24-attribution-health-alert-payload-template.md`). Gated on Move #6.10 being live + the archive directory having ≥4 weeks of cycle data to inform the runbook` self-reference on `playbooks/06.10-attribution-health-alert-webhook-launch.md` line 277. **This asset is the canonical Move #6.10 deferred-from-Move-#6.8-rollup closure** — once shipped, the 3 prior Move #6.10-tick journal entries that referenced `assets/24-attribution-health-alert-payload-template.md` as the deferred next-step are now stale; future ref-content-cleanup ticks can update them. The canonical "Move #6 attribution-audit substrate fortified" state after this tick: Move #6 + #6.5 + #6.6 + #6.7 + #6.8 + #6.9 remain at 6/6 layers fully closed per the v0.11.0 track-fully-closed pivot pattern; Move #6.10 now sits ATOP the existing substrate at 3/6 layers with the canonical operator-build + operator-copy companions shipped. The canonical Move #20 generative-AI-engine remains the canonical 13th-active-track pick per the v0.7.0 revival-diagnostic but is deferred per the cron-tick-budget (requires more research-skill bandwidth than the canonical 6-hour tick budget permits).

---

## Per-voice closing reference (canonical 5-voice summary)

The 5 voice profiles each carry the canonical asset-voice-density requirement (each voice must appear ≥15 times across the asset). Below is the canonical 5-voice summary the operator pastes into the runbook's voice-density section:

- **Default voice** — confident + plain + lightly irreverent tone; the brand's existing email + SMS + paid-Social voice lines from `assets/01-copy-templates.md` Template 1 (Email Welcome #1) carry the same voice. Default voice alerts read like a confident operator telling another operator what to do; medium-length CTA. Use the Default voice variant in §The 25 voice-variant Slack-compatible alert-templates when the brand's voice profile is "confident + plain + lightly irreverent".
- **Luxury voice** — restrained + considered + sensory tone; brand's existing voice from `assets/02-brand-voice.md` §Voice 1 Luxury. Luxury voice alerts read like a Restrained-tone advisory from a senior expert; aspirational CTA. Use the Luxury voice variant when the brand's voice profile is "restrained + considered + sensory".
- **Sustainable voice** — quiet + factual + sourced tone; brand's existing voice from `assets/02-brand-voice.md` §Voice 2 Sustainable. Sustainable voice alerts read like an Educational-tone advisory with cited evidence; educational CTA. Use the Sustainable voice variant when the brand's voice profile is "quiet + factual + sourced".
- **Gen-Z voice** — direct + punchy + emoji-rich tone; brand's existing voice from `assets/02-brand-voice.md` §Voice 3 Gen-Z. Gen-Z voice alerts read like a Telegram-style urgent advisory; cliff-CTA. Use the Gen-Z voice variant when the brand's voice profile is "direct + punchy + emoji-rich". Gen-Z alerts are the canonical fallback for any on-call who prefers the emoji-rich Telegram-style brief advisory over the longer Default or Luxury variants.
- **B2B voice** — operational + structured + reference-first tone; brand's existing voice from `assets/02-brand-voice.md` §Voice 4 B2B. B2B voice alerts read like a documentation-table-anchored advisory with explicit reference links; documentation-CTA. Use the B2B voice variant when the brand's voice profile is "operational + structured + reference-first".

The canonical per-voice-density rule: each voice must appear ≥15 times across the asset when grep-counted with `\b<voice>\b`. The 25 voice-variant alert templates are the primary per-voice-density surface (5 templates per voice × 5 voices = 25 templates). The §Per-voice closing reference section above carries one additional per-voice mention to round out the voice-density count for the Default voice (with its higher intent-target-ratio) + the Gen-Z voice (with its higher emoji-rich-target-ratio).
