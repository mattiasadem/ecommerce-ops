# Asset 25 — Move #6.5 Weekly-Rollup-Trend Slack-Compatible Alert-Payload Templates

> **Companion asset for `scripts/attribution_weekly_rollup_trend.py` (the Move #6.5 weekly-rollup-trend Track 9-12 hardening wire script) + `playbooks/06.5-weekly-rollup-trend-launch.md` (the canonical 2nd-layer operator-build companion).**
>
> The script fires when a slow-erosion trend is detected across a 12-week window of Move #6.8 cross-platform attribution rollups — three trend-rules [cumulative_match_rate_drift / cumulative_coverage_drift / consecutive_decline] + one no-fire stability path [all_stable]. This asset ships paste-ready per-voice Slack-compatible payload templates so the on-call operator sees the right message the moment the webhook lands in `#attribution-health` (or wherever the channel routes the trend alert).
>
> **Why this asset exists:** the script's payload is JSON-perfect, but operators read **messages**, not JSON. The 20 voice-variant templates below (5 voices × 4 fired-rule scenarios) bridge the gap between the script's deterministic output and the on-call's working memory — the operator copies the variant matching their brand voice + the fired-rule + pastes it into the Slack channel on-call-runbook. Per-voice density (Default / Luxury / Sustainable / Gen-Z / B2B) is documented inline so any voice-steward can spot drift at a glance.

---

## Goal

The Move #6.5 weekly-rollup-trend script outputs the canonical **15-field trend-alert-payload shape** pinned by `_canonical_trend_alert_shape_published()`:

```
alert_id, timestamp, source, severity, title, summary,
trend_window_weeks, weeks_analyzed, per_platform_trend,
cumulative_drift, consecutive_decline_platforms,
remediation, overall_passed, thresholds_used, raw_trend_state_path
```

When the alert fires, the operator wants a **paste-ready Slack message** that:

1. Names the **trend-window** (12 weeks, but the operator rarely cares about the exact count unless the data is sparse).
2. Names the **fired rule** (one of `cumulative_match_rate_drift`, `cumulative_coverage_drift`, `consecutive_decline`, or the no-fire `all_stable` confirmation path).
3. Surfaces the **per-platform direction** (`improving / declining / stable`) so the operator doesn't need to open the JSON to triage which platform is bleeding.
4. Lands the canonical **5-canonical-root-cause-hypothesis ladder** from `scripts/attribution_cross_platform_rollup.py` (theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle) — the operator reads this and knows where to start.
5. Echoes the **5 canonical trend thresholds** + the **cooldown** so the operator understands when the next alert will land.

This asset ships **20 paste-ready variants** = 5 voices × 4 fired-rule scenarios. Each variant ships:

- **JSON payload** — the raw JSON shape the webhook POSTs to the Slack-Incoming-Webhooks URL via `Content-Type: application/json`. Paste directly into the Slack-channel-on-call-runbook.
- **Slack rendered message** — the human-readable rendering of the JSON once Slack parses the fields. This is what the on-call actually sees.
- **Per-voice-density note** — a small inline annotation documenting where this variant lands on the 5 canonical voice dimensions (Formality / Humor / Brand-name / Price / Objection) so any voice-steward can spot drift.

---

## Who this is for

- **Direct-to-consumer attribution-stewards** running the weekly Move #6.8 rollup cycle on a Triple-Whale + Meta + TikTok + Snap stack (the canonical attribution-audit substrate).
- **Solo founders + small marketing teams** who can't afford a dedicated martech engineer — the on-call is the founder, and the alert lands in their DM at 2am on Sunday. The Default voice template is for them.
- **Mid-market brands** with a 2-5-person attribution team. The B2B voice template lands in `#martech-attribution` and reads like a status update, not a 2am alert.
- **Multi-brand operators** running 3-5 brands through the same Move #6.5 trend substrate — they keep a voice-template-library per brand and pick the right variant per brand at alert-time.

---

## The 5 voice profiles (canonical from `assets/02-brand-voice.md`)

| Voice | Formality | Humor | Brand-name | Price | Objection | When to use |
|-------|-----------|-------|------------|-------|-----------|-------------|
| **Default** | 2 | 3 | 2 | 2 | 3 | The canonical DTC default — $30-$200 AOV skincare / supplements / home goods / apparel / accessories. |
| **Luxury** | 4 | 1 | 3 | 4 | 2 | Heritage / elevated / quiet-luxury — $300-$2k AOV jewelry / fragrance / ready-to-wear / premium home. |
| **Sustainable** | 3 | 2 | 2 | 3 | 3 | Earnest + educational + eco-led — refillable / FSC-certified / B-Corp / climate-neutral. |
| **Gen-Z** | 1 | 4 | 1 | 1 | 2 | Lowercase + meme-fluent + fast — $15-$60 AOV beauty / fashion / social-commerce. |
| **B2B** | 4 | 1 | 3 | 3 | 3 | Precise + benefit-led + no jokes — wholesale / corporate-gifting / B2B-supply / SaaS-with-checkout. |

Each variant below is annotated with a `Voice-density: Formality N / Humor N / Brand-name N / Price N / Objection N` line so any voice-steward can verify the variant lands at the canonical position for that voice.

---

## The 4 trend-fired-rule scenarios (canonical from `scripts/attribution_weekly_rollup_trend.py` TREND_REMEDIATION + `_decide_should_fire`)

| Fired-rule key | Severity | Fires when | Canonical remediation text (from `TREND_REMEDIATION`) |
|----------------|----------|------------|------------------------------------------------------|
| `cumulative_match_rate_drift` | `warning` or `critical` (if concurrent with another rule) | Cumulative match-rate drift across the 12-week window exceeds 3.0pp threshold | "Cumulative match-rate drift across the {weeks}-week trend window exceeds {threshold}pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from `scripts/attribution_cross_platform_rollup.py`'s ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per `playbooks/06.8` §Step 5 to triage." |
| `cumulative_coverage_drift` | `warning` or `critical` | Cumulative coverage drift across the 12-week window exceeds 2.0pp threshold | "Cumulative coverage drift across the {weeks}-week trend window exceeds {threshold}pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per `playbooks/06.8` §Step 5." |
| `consecutive_decline` | `warning` or `critical` | 4+ consecutive weekly cycles show declining match-rate direction on any platform | "{decline_streak} consecutive weeks of declining match-rate direction on {platform}. Strong signal of slow erosion that 1-vs-1 drift detection misses (individual weeks may stay below the {threshold}pp MatchRate-drift threshold while the trend is clearly negative). Run the weekly cadence per `playbooks/06.8` §Step 5." |
| `all_stable` (no-fire path) | `info` | All 12 weeks show stable-or-improving per-platform match-rate + coverage | "All {weeks} weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per `playbooks/06.8` §Step 5 and re-run this trend script at next cycle." |

The Move #6.5 script fires on **any** of the three trend rules (with severity scaling: 1 rule fires = `warning`, 2+ rules fire = `critical`). The fourth scenario `all_stable` is the **no-fire confirmation path** the operator sees in the weekly archive even when nothing's wrong — it confirms the trend script ran end-to-end and saw a stable week, which is the operator's "no news is good news" signal that the canonical weekly cadence is healthy.

---

## The 20 voice-variant Slack-compatible trend-alert templates (5 voices × 4 fired-rule scenarios)

Each variant ships the canonical **15-field trend-alert-payload** [alert_id + timestamp + source + severity + title + summary + trend_window_weeks + weeks_analyzed + per_platform_trend + cumulative_drift + consecutive_decline_platforms + remediation + overall_passed + thresholds_used + raw_trend_state_path] plus the human-readable Slack rendering.

---

### Default voice × 4 fired-rule scenarios

**Voice-density: Formality 2 / Humor 3 / Brand-name 2 / Price 2 / Objection 3** — the canonical DTC default.

#### Default voice × `cumulative_match_rate_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "📉 Weekly attribution trend: match-rate is drifting",
  "summary": "Across 12 weeks we saw cumulative match-rate drift of 3.6pp (above the 3.0pp threshold). Meta dropped the most (-3.4pp cumulative over 12 weeks). No single week crossed the threshold — the trend is what's catching it.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.4, "consecutive_decline_weeks": 6}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -1.8, "consecutive_decline_weeks": 2}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 3.6, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta"],
  "remediation": "Cumulative match-rate drift across the 12-week trend window exceeds 3.0pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per playbooks/06.8 §Step 5 to triage.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```

**Slack rendered message:**

> 📉 **Weekly attribution trend: match-rate is drifting**
>
> Hey — across the last 12 weeks we saw cumulative match-rate drift of **3.6pp** (above the 3.0pp threshold). Meta's been the slow-bleeder at **-3.4pp cumulative over 12 weeks** and has been declining for 6 straight weeks. No single week crossed the threshold on its own — the *trend* is what's catching it.
>
> **First 15 minutes:** check `playbooks/06.8` §Step 5 for the weekly cadence, then run `scripts/attribution_cross_platform_rollup.py` for the latest rollup. The 5 things to look for are theme.liquid changes, CAPI token rotations, iOS consent banner updates, app uninstalls, and Advanced Matching / EMQ toggles.
>
> **Trend window:** 12 weeks · **Cooldown:** 86400s (next alert earliest 2026-07-11 18:30 UTC). Full payload attached.

#### Default voice × `cumulative_coverage_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "📉 Weekly attribution trend: pixel coverage is shrinking",
  "summary": "Across 12 weeks we saw cumulative pixel coverage drift of 2.4pp (above the 2.0pp threshold). TikTok coverage dropped the most (-2.1pp cumulative). Likely a pixel fire-rate regression — Meta pixel coverage is stable, TikTok pixel coverage is bleeding.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.4, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": -0.6, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "stable", "cumulative_delta": -0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "declining", "cumulative_delta": -2.1, "consecutive_decline_weeks": 3}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 0.4, "coverage_max_drift_pp": 2.4},
  "consecutive_decline_platforms": [],
  "remediation": "Cumulative coverage drift across the 12-week trend window exceeds 2.0pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```

**Slack rendered message:**

> 📉 **Weekly attribution trend: pixel coverage is shrinking**
>
> Hey — across the last 12 weeks we saw cumulative pixel coverage drift of **2.4pp** (above the 2.0pp threshold). TikTok coverage is bleeding at **-2.1pp cumulative over 12 weeks** — pixel fire-rate regression is the most likely cause.
>
> **First 15 minutes:** check `playbooks/06.8` §Step 5 for the weekly cadence + run `scripts/tiktok_attribution_audit.py` for the per-platform audit. The same 5 things to look for apply: theme.liquid changes, CAPI token rotations, iOS consent banner updates, app uninstalls, and Advanced Matching / EMQ toggles.
>
> **Trend window:** 12 weeks · **Cooldown:** 86400s. Full payload attached.

#### Default voice × `consecutive_decline` (critical when concurrent with cumulative)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "critical",
  "title": "🔴 Weekly attribution trend: 4+ weeks of decline on Meta + TikTok",
  "summary": "Two trend-rules fired concurrently: cumulative match-rate drift 4.1pp (above 3.0pp threshold) AND 4+ consecutive weeks of declining match-rate direction on Meta (5 weeks) and TikTok (4 weeks). Severity escalated to critical.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.8, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.5, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -2.4, "consecutive_decline_weeks": 4}, "coverage": {"direction": "stable", "cumulative_delta": -0.3, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 4.1, "coverage_max_drift_pp": 0.6},
  "consecutive_decline_platforms": ["meta", "tiktok"],
  "remediation": "5 consecutive weeks of declining match-rate direction on meta. Strong signal of slow erosion that 1-vs-1 drift detection misses (individual weeks may stay below the 4 weeks MatchRate-drift threshold while the trend is clearly negative). Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-critical.json"
}
```

**Slack rendered message:**

> 🔴 **Weekly attribution trend: 4+ weeks of decline on Meta + TikTok**
>
> Heads up — two trend-rules fired at once this week:
>
> 1. **Cumulative match-rate drift:** 4.1pp over 12 weeks (above 3.0pp threshold)
> 2. **Consecutive decline:** Meta has dropped for 5 straight weeks; TikTok for 4
>
> No single week has crossed the 3.0pp 1-vs-1 threshold on its own — but the trend is clearly negative. This is exactly what 1-vs-1 drift detection misses: the kind of slow erosion that compounds.
>
> **First 30 minutes:** check `playbooks/06.8` §Step 5 + run the per-platform audit scripts (Move #6.5/6.6/6.7) to triangulate which root-cause hypothesis (theme.liquid / CAPI token / iOS consent / app uninstall / EMQ toggle) is firing.
>
> **Trend window:** 12 weeks · **Severity:** critical (concurrent rules) · **Cooldown:** 86400s. Full payload attached.

#### Default voice × `all_stable` (info — no-fire confirmation path)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "info",
  "title": "✅ Weekly attribution trend: all stable across 12 weeks",
  "summary": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. No fired rules; the canonical weekly cadence is healthy.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.4, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "improving", "cumulative_delta": 1.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 1.1, "coverage_max_drift_pp": 0.3},
  "consecutive_decline_platforms": [],
  "remediation": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend script at next cycle.",
  "overall_passed": true,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-info.json"
}
```

**Slack rendered message:**

> ✅ **Weekly attribution trend: all stable across 12 weeks**
>
> Quick confirmation — the trend script ran end-to-end on this week's cycle and saw stable-or-improving per-platform match-rate + coverage across all 12 weeks of the window. TikTok is slightly improving at +1.1pp cumulative; everything else is within ±0.5pp.
>
> **This is the "no news is good news" signal.** No remediation needed — continue the canonical weekly cadence per `playbooks/06.8` §Step 5 and the next trend run will land at the next scheduled cycle.
>
> **Trend window:** 12 weeks · **Severity:** info · **Cooldown:** 86400s. Full payload attached.

---

### Luxury voice × 4 fired-rule scenarios

**Voice-density: Formality 4 / Humor 1 / Brand-name 3 / Price 4 / Objection 2** — refined + quiet + maximalist grammar.

#### Luxury voice × `cumulative_match_rate_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "Attribution Trend Notice — Cumulative Match-Rate Drift",
  "summary": "Over the twelve-week trend window, the cumulative match-rate drift has reached 3.4 percentage points, surpassing the 3.0 percentage point threshold. Meta exhibits the most pronounced downward trajectory, at -3.2 percentage points cumulative across the period.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.2, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -1.6, "consecutive_decline_weeks": 2}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 3.4, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta"],
  "remediation": "Cumulative match-rate drift across the 12-week trend window exceeds 3.0pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per playbooks/06.8 §Step 5 to triage.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```

**Slack rendered message:**

> **Attribution Trend Notice — Cumulative Match-Rate Drift**
>
> The cumulative match-rate drift across the twelve-week window has reached 3.4 percentage points, marginally above the 3.0 percentage point threshold. Meta exhibits the most pronounced trajectory, at -3.2 percentage points cumulative over the period.
>
> No single weekly cycle has crossed the threshold in isolation. The trend itself is the signal — a slow erosion that the canonical 1-vs-1 comparison would not surface.
>
> We recommend the on-call review `playbooks/06.8` §Step 5 for the canonical weekly cadence and run the Move #6.5/6.6/6.7 per-platform audit fixtures. The five canonical hypotheses — theme.liquid update, CAPI token rotation, iOS consent banner change, app uninstall, Advanced Matching toggle — apply.
>
> Trend window: 12 weeks. Cooldown: 86,400 seconds. Full payload attached.

#### Luxury voice × `cumulative_coverage_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "Attribution Trend Notice — Pixel Coverage Contraction",
  "summary": "Across the twelve-week window, cumulative pixel coverage has contracted by 2.3 percentage points, exceeding the 2.0 percentage point threshold. TikTok coverage exhibits the most pronounced decline, at -2.0 percentage points cumulative.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": -0.5, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "declining", "cumulative_delta": -2.0, "consecutive_decline_weeks": 3}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 0.3, "coverage_max_drift_pp": 2.3},
  "consecutive_decline_platforms": [],
  "remediation": "Cumulative coverage drift across the 12-week trend window exceeds 2.0pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```

**Slack rendered message:**

> **Attribution Trend Notice — Pixel Coverage Contraction**
>
> Across the twelve-week window, cumulative pixel coverage has contracted by 2.3 percentage points, exceeding the 2.0 percentage point threshold. TikTok coverage exhibits the most pronounced decline, at -2.0 percentage points cumulative.
>
> We recommend the on-call review `playbooks/06.8` §Step 5 for the canonical weekly cadence and run `scripts/tiktok_attribution_audit.py` for the per-platform audit. The five canonical hypotheses — theme.liquid update, CAPI token rotation, iOS consent banner change, app uninstall, Advanced Matching toggle — apply.
>
> Trend window: 12 weeks. Cooldown: 86,400 seconds. Full payload attached.

#### Luxury voice × `consecutive_decline` (critical when concurrent with cumulative)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "critical",
  "title": "Attribution Trend Critical — Consecutive Decline on Meta + TikTok",
  "summary": "Two trend-rules have fired concurrently: cumulative match-rate drift of 4.0 percentage points (above the 3.0 percentage point threshold), and 4+ consecutive weeks of declining match-rate direction on Meta (5 weeks) and TikTok (4 weeks). Severity has been escalated to critical.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.7, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -2.3, "consecutive_decline_weeks": 4}, "coverage": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 4.0, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta", "tiktok"],
  "remediation": "5 consecutive weeks of declining match-rate direction on meta. Strong signal of slow erosion that 1-vs-1 drift detection misses (individual weeks may stay below the 4 weeks MatchRate-drift threshold while the trend is clearly negative). Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-critical.json"
}
```

**Slack rendered message:**

> **Attribution Trend Critical — Consecutive Decline on Meta + TikTok**
>
> Two trend-rules have fired concurrently this cycle:
>
> 1. **Cumulative match-rate drift:** 4.0 percentage points over the twelve-week window (above the 3.0 percentage point threshold)
> 2. **Consecutive decline:** Meta has declined for five consecutive weeks; TikTok for four
>
> No single weekly cycle has crossed the 3.0 percentage point 1-vs-1 threshold in isolation. The trend itself is the signal — exactly the kind of slow erosion that 1-vs-1 drift detection would not surface.
>
> We recommend the on-call review `playbooks/06.8` §Step 5 and run the Move #6.5/6.6/6.7 per-platform audit fixtures to triangulate which of the five canonical hypotheses is firing.
>
> Trend window: 12 weeks. Severity: critical (concurrent rules). Cooldown: 86,400 seconds. Full payload attached.

#### Luxury voice × `all_stable` (info — no-fire confirmation path)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "info",
  "title": "Attribution Trend Confirmation — All Stable Across the Twelve-Week Window",
  "summary": "All twelve weeks of trend data exhibit stable-or-improving per-platform match-rate and coverage. No trend-rules have fired. The canonical weekly cadence is operating within tolerance.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "improving", "cumulative_delta": 1.0, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": -0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 1.0, "coverage_max_drift_pp": 0.2},
  "consecutive_decline_platforms": [],
  "remediation": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend script at next cycle.",
  "overall_passed": true,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-info.json"
}
```

**Slack rendered message:**

> **Attribution Trend Confirmation — All Stable Across the Twelve-Week Window**
>
> The trend script has executed end-to-end on this cycle and observed stable-or-improving per-platform match-rate and coverage across all twelve weeks. TikTok is exhibiting slight improvement at +1.0 percentage points cumulative; all other platforms remain within ±0.5 percentage points.
>
> No remediation required. We recommend the on-call continue the canonical weekly cadence per `playbooks/06.8` §Step 5; the next trend run will land at the next scheduled cycle.
>
> Trend window: 12 weeks. Severity: informational. Cooldown: 86,400 seconds. Full payload attached.

---

### Sustainable voice × 4 fired-rule scenarios

**Voice-density: Formality 3 / Humor 2 / Brand-name 2 / Price 3 / Objection 3** — warm + earnest + educational.

#### Sustainable voice × `cumulative_match_rate_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "🌱 Weekly attribution trend: small drift, real signal",
  "summary": "Across 12 weeks we noticed cumulative match-rate drift of 3.5pp (just above the 3.0pp threshold). Meta is the largest contributor at -3.2pp cumulative over 12 weeks. Each week alone looked fine — but the trend tells a different story.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.2, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.3, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -1.5, "consecutive_decline_weeks": 2}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 3.5, "coverage_max_drift_pp": 0.4},
  "consecutive_decline_platforms": ["meta"],
  "remediation": "Cumulative match-rate drift across the 12-week trend window exceeds 3.0pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per playbooks/06.8 §Step 5 to triage.",  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```

**Slack rendered message:**

> 🌱 **Weekly attribution trend: small drift, real signal**
>
> Across 12 weeks we noticed cumulative match-rate drift of **3.5pp** (just above the 3.0pp threshold). Meta is the largest contributor at **-3.2pp cumulative over 12 weeks**. Each week alone looked fine — but the trend tells a different story.
>
> **First 15 minutes:** step away from the weekly cadence pressure, open `playbooks/06.8` §Step 5 for the canonical weekly walkthrough, and run the per-platform audit scripts (Move #6.5/6.6/6.7). The five things worth checking are theme.liquid changes, CAPI token rotations, iOS consent banner updates, app uninstalls, and Advanced Matching / EMQ toggles.
>
> **Trend window:** 12 weeks · **Cooldown:** 86400s. Full payload attached.

#### Sustainable voice × `cumulative_coverage_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "🌱 Weekly attribution trend: pixel coverage is contracting",
  "summary": "Across 12 weeks we noticed cumulative pixel coverage drift of 2.3pp (above the 2.0pp threshold). TikTok coverage is the largest contributor at -2.0pp cumulative.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "declining", "cumulative_delta": -2.0, "consecutive_decline_weeks": 3}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 0.3, "coverage_max_drift_pp": 2.3},
  "consecutive_decline_platforms": [],
  "remediation": "Cumulative coverage drift across the 12-week trend window exceeds 2.0pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```
**Slack rendered message:**

> 🌱 **Weekly attribution trend: pixel coverage is contracting**
>
> Across 12 weeks we noticed cumulative pixel coverage drift of **2.3pp** (above the 2.0pp threshold). TikTok coverage is bleeding at **-2.0pp cumulative over 12 weeks**. Pixel fire-rate regression is the most likely cause.
>
> **First 15 minutes:** open `playbooks/06.8` §Step 5 + run `scripts/tiktok_attribution_audit.py` for the per-platform audit. The same five canonical hypotheses apply: theme.liquid changes, CAPI token rotations, iOS consent banner updates, app uninstalls, and Advanced Matching / EMQ toggles.
>
> **Trend window:** 12 weeks · **Cooldown:** 86400s. Full payload attached.

#### Sustainable voice × `consecutive_decline` (critical when concurrent with cumulative)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "critical",
  "title": "🌱 Weekly attribution trend: 4+ weeks of decline on Meta + TikTok",
  "summary": "Two trend-rules fired concurrently: cumulative match-rate drift of 4.0pp (above 3.0pp threshold) AND 4+ consecutive weeks of declining match-rate direction on Meta (5 weeks) and TikTok (4 weeks). Severity escalated to critical.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.7, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -2.3, "consecutive_decline_weeks": 4}, "coverage": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 4.0, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta", "tiktok"],
  "remediation": "5 consecutive weeks of declining match-rate direction on meta. Strong signal of slow erosion that 1-vs-1 drift detection misses. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-critical.json"
}
```
**Slack rendered message:**

> 🌱 **Weekly attribution trend: 4+ weeks of decline on Meta + TikTok**
>
> Two trend-rules fired at once this week: cumulative match-rate drift of **4.0pp** over 12 weeks (above 3.0pp threshold) AND 4+ consecutive weeks of decline on Meta (5 weeks) and TikTok (4 weeks). No single week has crossed the threshold on its own — but the trend is clearly negative.
>
> **First 30 minutes:** open `playbooks/06.8` §Step 5 + run the per-platform audit scripts (Move #6.5/6.6/6.7) to triangulate which root-cause hypothesis (theme.liquid / CAPI token / iOS consent / app uninstall / EMQ toggle) is firing.
>
> **Trend window:** 12 weeks · **Severity:** critical (concurrent rules) · **Cooldown:** 86400s. Full payload attached.

#### Sustainable voice × `all_stable` (info — no-fire confirmation path)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "info",
  "title": "🌱 Weekly attribution trend: all stable across 12 weeks",
  "summary": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. No fired rules; the canonical weekly cadence is healthy.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "improving", "cumulative_delta": 1.0, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": -0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 1.0, "coverage_max_drift_pp": 0.2},
  "consecutive_decline_platforms": [],
  "remediation": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend script at next cycle.",
  "overall_passed": true,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-info.json"
}
```
**Slack rendered message:**

> 🌱 **Weekly attribution trend: all stable across 12 weeks**
>
> The trend script ran end-to-end on this week's cycle and saw stable-or-improving per-platform match-rate + coverage across all 12 weeks. TikTok is slightly improving at +1.0pp cumulative; everything else is within ±0.5pp.
>
> **This is the "no news is good news" signal.** No remediation needed — continue the canonical weekly cadence per `playbooks/06.8` §Step 5 and the next trend run will land at the next scheduled cycle.
>
> **Trend window:** 12 weeks · **Severity:** info · **Cooldown:** 86400s. Full payload attached.

---

### Gen-Z voice × 4 fired-rule scenarios

**Voice-density: Formality 1 / Humor 4 / Brand-name 1 / Price 1 / Objection 2** — lowercase + meme-fluent + fast.

#### Gen-Z voice × `cumulative_match_rate_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "📉 yo the trend caught something",
  "summary": "ok so over 12 weeks meta match-rate dropped -3.4pp cumulative, that's above the 3.0pp line. single weeks looked fine but the trend's like 🫠. check it pls.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.4, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.3, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -1.7, "consecutive_decline_weeks": 2}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 3.4, "coverage_max_drift_pp": 0.4},
  "consecutive_decline_platforms": ["meta"],
  "remediation": "Cumulative match-rate drift across the 12-week trend window exceeds 3.0pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per playbooks/06.8 §Step 5 to triage.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```
**Slack rendered message:**

> 📉 **yo the trend caught something**
>
> ok so meta match-rate dropped -3.4pp cumulative over 12 weeks (above the 3.0pp line). single weeks looked fine but the trend's like 🫠. tiktok's down a bit too (-1.7pp cumulative).
>
> **first 15 mins:** peep `playbooks/06.8` §Step 5 + run the per-platform audit scripts. the usual 5 suspects: theme.liquid update, CAPI token rotation, iOS consent banner change, app uninstall, EMQ toggle.
>
> **window:** 12 weeks · **cooldown:** 86400s. full payload attached.

#### Gen-Z voice × `cumulative_coverage_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "📉 tiktok pixel is dying slowly",
  "summary": "ok tiktok pixel coverage dropped -2.0pp cumulative over 12 weeks (above the 2.0pp threshold). that's like. not nothing. probably pixel fire-rate regression.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": -0.5, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "declining", "cumulative_delta": -2.0, "consecutive_decline_weeks": 3}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 0.3, "coverage_max_drift_pp": 2.0},
  "consecutive_decline_platforms": [],
  "remediation": "Cumulative coverage drift across the 12-week trend window exceeds 2.0pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```
**Slack rendered message:**

> 📉 **tiktok pixel is dying slowly**
>
> ok tiktok pixel coverage dropped -2.0pp cumulative over 12 weeks (above the 2.0pp line). not nothing. probably pixel fire-rate regression.
>
> **first 15 mins:** peep `playbooks/06.8` §Step 5 + run `scripts/tiktok_attribution_audit.py`. same 5 suspects: theme.liquid, CAPI token, iOS consent, app uninstall, EMQ toggle.
>
> **window:** 12 weeks · **cooldown:** 86400s. full payload attached.

#### Gen-Z voice × `consecutive_decline` (critical when concurrent with cumulative)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "critical",
  "title": "🚨 meta + tiktok both trending down for weeks",
  "summary": "uh oh. cumulative match-rate drift 4.0pp (above 3.0pp threshold) AND meta's been declining 5 weeks in a row + tiktok 4 weeks. critical severity unlocked.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.7, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -2.3, "consecutive_decline_weeks": 4}, "coverage": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 4.0, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta", "tiktok"],
  "remediation": "5 consecutive weeks of declining match-rate direction on meta. Strong signal of slow erosion that 1-vs-1 drift detection misses. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-critical.json"
}
```
**Slack rendered message:**

> 🚨 **meta + tiktok both trending down for weeks**
>
> uh oh. two things fired at once: cumulative match-rate drift 4.0pp over 12 weeks (above 3.0pp) AND meta's been declining 5 weeks straight + tiktok 4 weeks. critical severity unlocked.
>
> no single week crossed the threshold alone. the trend caught it — exactly the slow erosion thing 1-vs-1 misses.
>
> **first 30 mins:** peep `playbooks/06.8` §Step 5 + run the per-platform audits (Move #6.5/6.6/6.7) to figure out which of the 5 usual suspects is firing.
>
> **window:** 12 weeks · **severity:** critical · **cooldown:** 86400s. full payload attached.

#### Gen-Z voice × `all_stable` (info — no-fire confirmation path)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "info",
  "title": "✨ all good, no fires",
  "summary": "12 weeks of trend data all stable-or-improving. no fired rules. vibes are immaculate. carry on with the weekly cadence.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "improving", "cumulative_delta": 1.0, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": -0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 1.0, "coverage_max_drift_pp": 0.2},
  "consecutive_decline_platforms": [],
  "remediation": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend script at next cycle.",
  "overall_passed": true,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-info.json"
}
```

**Slack rendered message:**

> ✨ **all good, no fires**
>
> 12 weeks of trend data all stable-or-improving. no fired rules. vibes are immaculate.
>
> keep the weekly cadence going per `playbooks/06.8` §Step 5. next trend run lands at the next scheduled cycle.
>
> **window:** 12 weeks · **severity:** info · **cooldown:** 86400s. full payload attached.

---

### B2B voice × 4 fired-rule scenarios

**Voice-density: Formality 4 / Humor 1 / Brand-name 3 / Price 3 / Objection 3** — precise + benefit-led + no jokes.
#### B2B voice × `cumulative_match_rate_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "Weekly Attribution Trend — Cumulative Match-Rate Drift Threshold Breach",
  "summary": "Over the 12-week trend window, cumulative match-rate drift reached 3.4pp, exceeding the 3.0pp threshold. Meta contributed the largest single-platform delta at -3.2pp cumulative. The trend signal (not the per-cycle signal) is the differentiating indicator.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.2, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.3, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -1.6, "consecutive_decline_weeks": 2}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 3.4, "coverage_max_drift_pp": 0.4},
  "consecutive_decline_platforms": ["meta"],
  "remediation": "Cumulative match-rate drift across the 12-week trend window exceeds 3.0pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses from scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES [theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle]. Run the weekly cadence per playbooks/06.8 §Step 5 to triage.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```
**Slack rendered message:**

> **Weekly Attribution Trend — Cumulative Match-Rate Drift Threshold Breach**
>
> The cumulative match-rate drift across the twelve-week trend window has reached 3.4 percentage points, exceeding the 3.0 percentage point threshold. Meta contributed the largest single-platform delta at -3.2 percentage points cumulative over the period.
>
> No single weekly cycle has crossed the threshold in isolation. The trend signal — not the per-cycle signal — is the differentiating indicator for slow-erosion patterns.
>
> Recommended on-call actions: review `playbooks/06.8` §Step 5 and run the Move #6.5/6.6/6.7 per-platform audit fixtures. The five canonical hypotheses from `scripts/attribution_cross_platform_rollup.py` apply (theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle).
>
> Trend window: 12 weeks. Cooldown: 86,400 seconds. Full payload attached.

#### B2B voice × `cumulative_coverage_drift` (warning)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "warning",
  "title": "Weekly Attribution Trend — Cumulative Pixel Coverage Drift Threshold Breach",
  "summary": "Across the 12-week trend window, cumulative pixel coverage drift reached 2.3pp, exceeding the 2.0pp threshold. TikTok contributed the largest single-platform delta at -2.0pp cumulative. Pixel fire-rate regression is the leading hypothesis.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "declining", "cumulative_delta": -2.0, "consecutive_decline_weeks": 3}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 0.3, "coverage_max_drift_pp": 2.3},
  "consecutive_decline_platforms": [],
  "remediation": "Cumulative coverage drift across the 12-week trend window exceeds 2.0pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 apply. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-warning.json"
}
```
**Slack rendered message:**

> **Weekly Attribution Trend — Cumulative Pixel Coverage Drift Threshold Breach**
>
> Across the twelve-week trend window, cumulative pixel coverage drift reached 2.3 percentage points, exceeding the 2.0 percentage point threshold. TikTok contributed the largest single-platform delta at -2.0 percentage points cumulative. Pixel fire-rate regression is the leading hypothesis.
>
> Recommended on-call actions: review `playbooks/06.8` §Step 5 and run `scripts/tiktok_attribution_audit.py` for the per-platform audit. The five canonical hypotheses from `scripts/attribution_cross_platform_rollup.py` apply.
>
> Trend window: 12 weeks. Cooldown: 86,400 seconds. Full payload attached.

#### B2B voice × `consecutive_decline` (critical when concurrent with cumulative)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "critical",
  "title": "Weekly Attribution Trend — Critical: Concurrent Match-Rate Drift + Consecutive Decline",
  "summary": "Two trend-rules fired concurrently: cumulative match-rate drift reached 4.0pp (above 3.0pp threshold), and 4+ consecutive weeks of declining match-rate direction were observed on Meta (5 weeks) and TikTok (4 weeks). Severity has been escalated to critical.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "declining", "cumulative_delta": -3.7, "consecutive_decline_weeks": 5}, "coverage": {"direction": "stable", "cumulative_delta": -0.4, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "declining", "cumulative_delta": -2.3, "consecutive_decline_weeks": 4}, "coverage": {"direction": "stable", "cumulative_delta": -0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 4.0, "coverage_max_drift_pp": 0.5},
  "consecutive_decline_platforms": ["meta", "tiktok"],
  "remediation": "5 consecutive weeks of declining match-rate direction on meta. Strong signal of slow erosion that 1-vs-1 drift detection misses. Run the weekly cadence per playbooks/06.8 §Step 5.",
  "overall_passed": false,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-critical.json"
}
```

**Slack rendered message:**

> **Weekly Attribution Trend — Critical: Concurrent Match-Rate Drift + Consecutive Decline**
>
> Two trend-rules fired concurrently this cycle:
>
> 1. **Cumulative match-rate drift:** 4.0 percentage points over the twelve-week window (above 3.0 percentage point threshold)
> 2. **Consecutive decline:** Meta has declined for five consecutive weeks; TikTok for four
>
> No single weekly cycle has crossed the 3.0 percentage point 1-vs-1 threshold in isolation. The trend signal — not the per-cycle signal — is the differentiating indicator for slow-erosion patterns.
>
> Recommended on-call actions: review `playbooks/06.8` §Step 5 and run the Move #6.5/6.6/6.7 per-platform audit fixtures to triangulate which of the five canonical hypotheses is firing.
>
> Trend window: 12 weeks. Severity: critical (concurrent rules). Cooldown: 86,400 seconds. Full payload attached.
#### B2B voice × `all_stable` (info — no-fire confirmation path)

**JSON payload:**

```json
{
  "alert_id": "20260710T1830Z",
  "timestamp": "2026-07-10T18:30:14Z",
  "source": "move-6.5-attribution-weekly-rollup-trend",
  "severity": "info",
  "title": "Weekly Attribution Trend — Confirmation: All Stable Across the Twelve-Week Window",
  "summary": "All twelve weeks of trend data exhibit stable-or-improving per-platform match-rate and coverage. No trend-rules have fired. The canonical weekly cadence is operating within tolerance.",
  "trend_window_weeks": 12,
  "weeks_analyzed": 12,
  "per_platform_trend": {
    "meta": {"match_rate": {"direction": "stable", "cumulative_delta": 0.3, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.1, "consecutive_decline_weeks": 0}},
    "tiktok": {"match_rate": {"direction": "improving", "cumulative_delta": 1.0, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.2, "consecutive_decline_weeks": 0}},
    "snap": {"match_rate": {"direction": "stable", "cumulative_delta": -0.1, "consecutive_decline_weeks": 0}, "coverage": {"direction": "stable", "cumulative_delta": 0.0, "consecutive_decline_weeks": 0}}
  },
  "cumulative_drift": {"match_rate_max_drift_pp": 1.0, "coverage_max_drift_pp": 0.2},
  "consecutive_decline_platforms": [],
  "remediation": "All 12 weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend script at next cycle.",
  "overall_passed": true,
  "thresholds_used": {"trend_window_weeks": 12, "fire_on_cumulative_match_rate_drift_pp": 3.0, "fire_on_cumulative_coverage_drift_pp": 2.0, "fire_on_consecutive_decline_weeks": 4, "cooldown_seconds": 86400},
  "raw_trend_state_path": "fixtures/.trend-alerts/2026-07-10-trend-info.json"
}
```
**Slack rendered message:**

> **Weekly Attribution Trend — Confirmation: All Stable Across the Twelve-Week Window**
>
> The trend script has executed end-to-end on this cycle and observed stable-or-improving per-platform match-rate and coverage across all twelve weeks. TikTok is exhibiting slight improvement at +1.0 percentage points cumulative; all other platforms remain within ±0.5 percentage points.
>
> No remediation required. We recommend the on-call continue the canonical weekly cadence per `playbooks/06.8` §Step 5; the next trend run will land at the next scheduled cycle.
>
> Trend window: 12 weeks. Severity: informational. Cooldown: 86,400 seconds. Full payload attached.

---

## Per-voice-density recap (20 variants × 5 dimensions)

Each of the 20 variants above lands at the canonical 5-dimension position for its voice:

- **Default (5 variants):** Formality 2 / Humor 3 / Brand-name 2 / Price 2 / Objection 3
- **Luxury (5 variants):** Formality 4 / Humor 1 / Brand-name 3 / Price 4 / Objection 2
- **Sustainable (5 variants):** Formality 3 / Humor 2 / Brand-name 2 / Price 3 / Objection 3
- **Gen-Z (5 variants):** Formality 1 / Humor 4 / Brand-name 1 / Price 1 / Objection 2
- **B2B (5 variants):** Formality 4 / Humor 1 / Brand-name 3 / Price 3 / Objection 3

The canonical 5 dimensions are documented at `assets/02-brand-voice.md` §The 5 voice profiles. Per-voice-density for each variant is annotated inline above; voice-stewards can spot drift by comparing the variant's title prefix + summary phrasing + Slack rendered message against the canonical position.

---

## Companion artifacts

- `scripts/attribution_weekly_rollup_trend.py` — the canonical Move #6.5 weekly-rollup-trend Track 9-12 hardening wire script (Track 9-12 hardening tick shipped 2026-07-06 per commit `8eeb286`). Consumes the last 12 weekly Move #6.8 cross-platform attribution rollup JSON outputs and fires on cumulative match-rate drift / cumulative coverage drift / consecutive decline (any of the three, with severity scaling).
- `scripts/tests/test_attribution_weekly_rollup_trend.py` — the canonical Move #6.5 TDD test file (59 tests across 13 test classes, including 2 canonical regression gates for thresholds + alert shape pinning).
- `playbooks/06.5-weekly-rollup-trend-launch.md` — the canonical Move #6.5 weekly-rollup-trend operator-build companion (2nd-layer operator-build tick shipped 2026-07-10 per commit `ccd129f`).
- `scripts/attribution_cross_platform_rollup.py` — the Move #6.8 cross-platform attribution rollup that produces the per-week rollup.json files this script consumes.
- `scripts/attribution_health_alert_webhook.py` — the Move #6.10 per-cycle cross-platform drift alert webhook that this Move #6.5 weekly-rollup-trend script is the multi-cycle TREND companion to.
- `playbooks/06.8-cross-platform-attribution-drift-unification.md` — the Move #6.8 operator-build playbook that ships the per-cycle rollup.
- `research/06-marketplace-expansion.md` + `research/14-amazon-dsp-amazon-attribution-audit.md` — the research substrate that motivates the multi-platform rollup.
- `dashboards/unified-attribution-health.html` — the per-cycle dashboard; this Move #6.5 weekly-rollup-trend script produces trend data that a future multi-week dashboard can render.
- `assets/24-attribution-health-alert-payload-template.md` — the Move #6.10 per-cycle alert-payload template companion (different substrate: per-cycle, not per-trend-window; 5 hypotheses × 5 voices = 25 variants).
- `assets/02-brand-voice.md` — the canonical brand-voice reference document that this asset's per-voice-density annotations derive from.

---

## Notes for future tick readers

- **Voice-density discipline:** the 20 variants above land at the canonical 5-dimension positions per `assets/02-brand-voice.md`. If a future tick adds a new variant (e.g., a 5th canonical fired-rule for Move #6.5.1 — `cross_platform_drift_aggregate`), the per-voice-density annotation must continue to hold for all 5 voices. The pattern is the same as `assets/24-attribution-health-alert-payload-template.md`'s 25 variants.
- **Cooldown discipline:** the canonical cooldown per `playbooks/06.5` §Step 6 is 86,400 seconds (24 hours). The `cooldown_seconds` field in the `thresholds_used` block reflects this; the operator should not edit this value without updating the canonical Move #6.5 script + regression gate.
- **Severity escalation:** when 2+ rules fire concurrently, severity escalates from `warning` to `critical`. The B2B variant's `consecutive_decline` JSON above demonstrates this — severity is `critical` because both `cumulative_match_rate_drift` and `consecutive_decline` fired concurrently. Single-rule fires always emit `warning`; the `all_stable` no-fire path always emits `info`.
- **Archive path convention:** the canonical archive path is `fixtures/.trend-alerts/<YYYY-MM-DD>-trend-<severity>.json`. The `raw_trend_state_path` field in each JSON payload reflects this convention; the operator should not edit this value without updating the canonical Move #6.5 script + the `playbooks/06.5` Step 3 archive-creation step.
