/**
 * `attribution-health-alert-launch-plan.ts` — Pure generator for the 30-day
 * Move #6.10 Attribution-Health-Alert webhook launch plan.
 *
 * Reads the operator's saved `AttributionAlertInputs` from localStorage (via
 * the component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Baseline + Move #6.8 pre-flight + alert-payload contract sign-off
 *   W2 (Days 8–14)  — Webhook / Slack / Linear / PagerDuty build + 13-field payload shape
 *   W3 (Days 15–21) — Soft-launch → 10% → 50% → 100% + per-channel alert-readout
 *   W4 (Days 22–30) — D-7 / D-14 / D-21 readouts + attribution-recovery audit + iteration backlog
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The plan
 * surfaces a one-line health snapshot (path + Year-1 ROI band + cadence +
 * Year-1 cost stack + avoided-incidents projection) so when the plan is
 * shared in a standup, the team sees "what does this look like" without
 * opening the playbook.
 *
 * Path-aware: the W2 build sequence + W3 ramp cadence + W4 readouts all
 * reference the operator's Path A / B / C / D / E verdict (with Path E
 * deferring the whole plan — surfaces a "DEFER" snapshot instead).
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type {
  AttributionAlertForecast,
  AttributionAlertInputs,
  AttributionAlertPath,
} from "@/lib/attribution-health-alert";
import {
  ATTRIBUTION_ALERT_DEFAULTS,
  forecastAttributionAlert,
} from "@/lib/attribution-health-alert";
import { loadYourStore } from "@/lib/your-store";

export interface AttributionHealthAlertLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface AttributionHealthAlertLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: AttributionAlertInputs;
  forecast: AttributionAlertForecast;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  days: AttributionHealthAlertLaunchPlanDay[];
  path: AttributionAlertPath;
  pathLabel: string;
}

// ---------------------------------------------------------------------------
// Canonical 30-day / 4-week / 30-checkbox-able-action sequence for Move #6.10
// ---------------------------------------------------------------------------

const PLAN_DAYS: Omit<AttributionHealthAlertLaunchPlanDay, "day">[] = [
  // --- Week 1 — Baseline + Move #6.8 pre-flight + payload contract --------
  {
    week: 1,
    title: "Audit current attribution health + 30-day incident history",
    action:
      "Pull the trailing-30-day attribution incidents from Triple Whale / Polar alerts logs (or, if Move #6.10 is brand-new, list the 3 attribution anomalies the team noticed by hand in the past month). For each incident, record: (a) which platform (Meta / Google / TikTok / Snap / Pinterest), (b) the alert type (drift > 30%, CAPI failure, pixel load latency, EMQ drop, post-purchase-DLP-spike), (c) the time-to-detect and time-to-mitigate, (d) the recovered revenue. Save the ledger so the W4 audit has a baseline.",
    deliverable:
      "Attribution-incident ledger CSV (date / platform / alert-type / time-to-detect / time-to-mitigate / recovered-revenue)",
  },
  {
    week: 1,
    title: "Confirm Move #6.8 (cross-platform drift rollup) is live first",
    action:
      "Verify the Move #6.8 cross-platform attribution-drift rollup job is running (weekly Monday 09:00 UTC = Path B DEFAULT). If Move #6.8 is not yet live, STOP and ship it first — Move #6.10 is a downstream alert that requires the canonical Move #6.8 drift metric + per-platform split as its input. The canonical deferral gate 'move_6_8_cadence = none' is enforced by the calculator.",
    deliverable:
      "Move #6.8 cron entry confirmed live OR deferral rationale documented",
  },
  {
    week: 1,
    title: "Pick Path A / B / C / D / E from the calculator's verdict",
    action:
      "Open the Attribution-Health-Alert calculator and confirm the Path verdict matches your team reality. Path A = solo / <$5k/mo paid (hermetic-local-archive-only). Path B = small team / $5k-$50k/mo paid (Slack-webhook + Linear-fallback; DEFAULT). Path C = larger team / $50k-$250k/mo paid (Slack + Linear + PagerDuty-low; every-4h cadence). Path D = enterprise / $250k+/mo paid (PagerDuty-high + Opsgenie + Slack + Linear; hourly cadence). Path E = <$500/mo paid = DEFER. The W2/W3 plan below re-shapes around your chosen path.",
    deliverable:
      "Path verdict recorded + ops-lead sign-off on alert cadence + cooldown",
  },
  {
    week: 1,
    title: "Sign off on the 13-field canonical alert-payload contract",
    action:
      "Review the 13 canonical alert-payload fields (canonicalAlertPayloadFields from the calculator's forecast). For each field, agree on the unit (USD / fraction / count / seconds / timestamp-ISO / string-id). Confirm the payload contract is the same shape that downstream Slack / Linear / PagerDuty / Opsgenie will receive — drift in the field shape forces a webhook rewrite later.",
    deliverable:
      "13-field payload contract doc signed off by ops + analytics lead",
  },
  {
    week: 1,
    title: "Sign off on the 5 canonical webhook thresholds",
    action:
      "Review the 5 canonical webhook thresholds (canonicalWebhookThresholds). For each threshold, agree on the floor / ceiling. The canonical Path B defaults are: drift-floor 0.30, capi-failure-rate 0.05, emq-floor 0.70, pixel-load-latency-ms 2000, post-purchase-DLP-spike-usd 5000. Path C / D tighten each by ~20%. Path A relaxes each by ~50%.",
    deliverable:
      "Threshold doc signed off by ops + finance lead",
  },
  {
    week: 1,
    title: "Pick the Slack channel + Linear team + PagerDuty service",
    action:
      "Provision the destination surfaces: a dedicated Slack channel (#attribution-alerts or similar), a Linear team + project, and a PagerDuty service (Path C / D only). Confirm the Slack channel has its own retention policy (90-day rolling) so the archive storage input on the calculator matches reality. Path A uses no Slack channel — only the local .alerts/ archive directory.",
    deliverable:
      "Slack channel live + Linear team live + PagerDuty service live (if applicable)",
  },
  {
    week: 1,
    title: "Lock the 30-day success metric + alert cadence + cooldown",
    action:
      "Decide the 30-day success metric: Year-1 ROI ratio (year1NetRoiLow / year1NetRoiHigh from the forecast). Capture the alert cadence (Monday 09:00 / every-4-hours / hourly) and cooldown (Path B DEFAULT = 3600s; tighten to 1800s for Path C; 600s for Path D). Confirm the calculator's health-band thresholds match what the team expects.",
    deliverable:
      "Metric + cadence + cooldown doc signed off + readout cadence locked",
  },

  // --- Week 2 — Webhook / Slack / Linear / PagerDuty build + payload ------
  {
    week: 2,
    title:
      "Stand up the webhook dispatcher + 13-field payload emitter (Move #6.10 script)",
    action:
      "Deploy scripts/attribution_health_alert_webhook.py as the canonical webhook dispatcher. The script reads .alerts/*.json files emitted by Move #6.8 + emits the 13-field payload to the destination URL. Confirm a test payload lands in the destination with all fields populated. Use ngrok / cloudflared trycloudflare for local QA before pointing at production.",
    deliverable:
      "Webhook dispatcher live + 13-field payload verified end-to-end on a test alert",
  },
  {
    week: 2,
    title: "Wire Slack Incoming Webhook + Block-Kit template",
    action:
      "Generate a Slack Incoming Webhook URL from the dedicated channel. Add a Block-Kit template that renders: (a) the platform + alert-type header, (b) the 13 payload fields as a section, (c) the drill-down link to the Move #6.8 dashboard, (d) the Linear-create-issue button, (e) the Acknowledge button. Confirm the test payload renders correctly on Slack desktop + mobile.",
    deliverable:
      "Slack Incoming Webhook live + Block-Kit template verified on desktop + mobile",
  },
  {
    week: 2,
    title: "Wire Linear API + auto-create-issue on threshold breach",
    action:
      "Generate a Linear API token (OAuth scope = write:issues). Add a Linear-create-issue action that fires when a threshold breach is sustained for > 24h. The issue body includes the 13 payload fields + a link to the Move #6.8 drill-down. Confirm the issue auto-assigns to the on-call rotation if Path C / D; for Path A / B the issue is unassigned and the ops lead triages manually.",
    deliverable:
      "Linear auto-create-issue live + 24h-sustained-breach verification on test alert",
  },
  {
    week: 2,
    title: "Wire PagerDuty (Path C / D) + Opsgenie fallback + escalation policy",
    action:
      "For Path C / D: provision a PagerDuty service, add an Events API v2 integration key, and configure an escalation policy (L1 = on-call analyst, L2 = ops lead, L3 = engineering). Path C uses PagerDuty-low-urgency; Path D uses PagerDuty-high + Opsgenie fallback. Path A / B = no PagerDuty. Confirm the escalation policy fires on a test alert.",
    deliverable:
      "PagerDuty + Opsgenie integration live (Path C / D) + escalation policy verified",
  },
  {
    week: 2,
    title: "Wire alert cooldown + duplicate-suppression",
    action:
      "Confirm the cooldown window (canonical Path B = 3600s; tighten for Path C / D; relax for Path A) prevents the same alert-type from firing more than once per cooldown window. Add a duplicate-suppression rule keyed on (platform, alert-type, threshold-direction) so a sustained breach only emits one alert per cooldown window.",
    deliverable:
      "Cooldown + duplicate-suppression verified with 24h replay test",
  },
  {
    week: 2,
    title: "Wire Move #6.8 cross-platform drift metric + per-platform split input",
    action:
      "Confirm the Move #6.8 cross-platform drift rollup script writes .alerts/*.json files that Move #6.10 consumes. Verify each alert file contains: (a) the canonical 13 payload fields, (b) the per-platform split (Meta / Google / TikTok / Snap / Pinterest), (c) the 30-day-rolling drift metric. Confirm the alert-payload emitter picks up the latest .alerts/ file on each run.",
    deliverable:
      "Move #6.8 + Move #6.10 cross-script contract verified end-to-end",
  },
  {
    week: 2,
    title: "QA across Slack / Linear / PagerDuty / Opsgenie / archive",
    action:
      "Send a test alert through the full dispatcher → Slack / Linear / PagerDuty / Opsgenie (Path C / D) pipeline. Verify: Slack renders the Block-Kit correctly, Linear auto-creates the issue, PagerDuty fires the escalation policy, Opsgenie receives the fallback (Path D), and the local .alerts/ archive receives the JSON dump. Confirm the 13 payload fields are identical across all destinations.",
    deliverable:
      "End-to-end QA report recorded + sign-off from ops + on-call lead",
  },

  // --- Week 3 — Soft-launch + ramp + per-channel readout -------------------
  {
    week: 3,
    title: "Soft-launch to 10% of attribution incidents",
    action:
      "Move the dispatcher from dry-run to live. Set a 10% send-time condition (split by SHA-256 of platform + alert-type) so 1 in 10 attribution incidents routes through the full Slack / Linear / PagerDuty / Opsgenie (Path C / D) pipeline in the first 7 days. The remaining 90% stay in the local .alerts/ archive. Monitor Slack delivery + Linear issue-create + PagerDuty escalation latency.",
    deliverable:
      "10% segment live + Slack / Linear / PagerDuty delivery monitored for 48h",
  },
  {
    week: 3,
    title:
      "Ramp to 50% + monitor alert volume + unsubscribe / acknowledge-rate",
    action:
      "After 48h clean read at 10%, raise the condition to 50%. Monitor Slack channel volume + Linear auto-issue-count + PagerDuty escalation count. If the channel becomes noise (alert volume > 5/day for a team of 3), tighten thresholds by 20% OR widen the cooldown window by 50%. If auto-issue-count exceeds 10/day, downgrade to a daily digest (collapse 24h of alerts into one summary).",
    deliverable:
      "50% segment live + alert-volume doc + threshold-tuning plan",
  },
  {
    week: 3,
    title:
      "Ramp to 100% + soft-launch Path-C/D escalation policies to 10%",
    action:
      "After 48h clean read at 50%, raise to 100%. For Path C / D, soft-launch the PagerDuty escalation policy to 10% of incidents. For Path A, the local-archive-only pipeline is already at 100%. Communicate the launch in the team channel; freeze any threshold / cadence / cooldown changes for the next 14 days so the W4 readouts are statistically clean.",
    deliverable:
      "100% segment live + escalation policies live (Path C / D) + freeze-policy signed",
  },
  {
    week: 3,
    title:
      "D-7 baseline: per-platform alert-type breakdown + time-to-detect / time-to-mitigate",
    action:
      "Pull the trailing-7-day alert breakdown by platform (Meta / Google / TikTok / Snap / Pinterest) and by alert-type (drift / CAPI-failure / pixel-latency / EMQ-drop / DLP-spike). Compute time-to-detect (alert-fire-time vs incident-start-time) and time-to-mitigate (ack-time vs fire-time). Compare against the calculator's forecast (year1AvoidedIncidentsLow / High).",
    deliverable:
      "D-7 per-platform + per-alert-type readout recorded + drift vs forecast",
  },
  {
    week: 3,
    title: "D-14 drill: Slack noise + Linear ack latency + PagerDuty escalation count",
    action:
      "Audit the Slack channel noise (false-positive rate, alert volume / day, ack-time), Linear ack latency (issue-create-to-ack), and PagerDuty escalation count (Path C / D). Confirm the year-1 ROI forecast holds: if year1NetRoiLow from the calculator projected 60:1 (Path B) and the readouts show 30:1 at D-14, the W4 audit may need a threshold / cadence adjustment.",
    deliverable:
      "D-14 channel-noise + ack-latency + escalation-count readout recorded",
  },
  {
    week: 3,
    title:
      "D-21 attribution-recovery attribution + attribution-vs-roi sanity check",
    action:
      "For each alert in the trailing 21 days, record whether the recovery action actually moved the attribution metric back within tolerance. Compute the per-alert recovery delta (recovered-attribution-revenue) and the cumulative attribution recovery (year1IncrementalAttributionRecoveryLow / High from the calculator). Compare against the forecast — if D-21 cumulative recovery is materially below the low-end forecast, the operator may need to widen the thresholds OR shorten the cadence.",
    deliverable:
      "D-21 per-alert recovery delta + cumulative recovery + vs-forecast drift report",
  },
  {
    week: 3,
    title: "Lock the 30-day success metric + horizon for the W4 readout",
    action:
      "Decide the W4 readout format: cumulative avoided-incidents (year1AvoidedIncidentsLow / High from forecast), cumulative recovered-attribution-revenue (year1IncrementalAttributionRecoveryLow / High), cumulative net ROI (year1NetRoiLow / High), alert volume / day, ack-time breakdown, and a forward-looking 90-day iteration backlog. Capture the team's verdict on whether to widen / tighten the thresholds.",
    deliverable:
      "W4 readout format + metrics agreed + iteration-backlog template ready",
  },

  // --- Week 4 — Final readouts + attribution-recovery audit + iteration ----
  {
    week: 4,
    title:
      "Final 30-day avoided-incidents readout + Year-1 avoided-incidents projection",
    action:
      "Compile the final 30-day avoided-incidents count. Project the count out to Year-1 (multiply by 12 for monthly alert cadence; by 365 for hourly Path D cadence) and compare against the calculator's year1AvoidedIncidentsLow / High forecast. If the projection is materially below the low-end, the operator may need to tighten the thresholds OR widen the alert-coverage scope (more platforms, more alert-types).",
    deliverable:
      "Final 30-day + projected Year-1 avoided-incidents readout recorded",
  },
  {
    week: 4,
    title:
      "Final 30-day attribution-recovery readout + cumulative recovered-revenue",
    action:
      "Compile the cumulative recovered-attribution-revenue from the trailing 30 days. Project out to Year-1 (multiply by 12 for Path A / B; by 365 for Path D) and compare against the calculator's year1IncrementalAttributionRecoveryLow / High forecast. Capture the breakdown by platform + by alert-type so the iteration backlog can prioritize the highest-recovery alert-types.",
    deliverable:
      "Final 30-day + projected Year-1 recovered-attribution-revenue readout",
  },
  {
    week: 4,
    title:
      "Final 30-day Year-1 net ROI readout + cost-stack reconciliation",
    action:
      "Compute the actual Year-1 net ROI (year1NetRoiLow / High from forecast). Reconcile the actual cost stack (one-time + recurring) against the calculator's forecast costOneTimeLow / High + costRecurringLow / High. If actual is materially above the high-end (over-spending), the operator may need to downgrade path (C → B) or drop a destination (PagerDuty → Slack-only).",
    deliverable:
      "Final Year-1 net ROI + cost-stack reconciliation recorded",
  },
  {
    week: 4,
    title:
      "Slack / Linear / PagerDuty / archive storage reconciliation + 90-day rotation policy",
    action:
      "Audit the trailing-30-day Slack retention (channels OR files), Linear issue-count, PagerDuty incident-count, and the local .alerts/ archive storage (alertArchiveStorageGbPerYear from inputs). Confirm the actual storage stays under the calculator's 10-GB/year deferral gate. If actual exceeds 10 GB/year, rotate archives older than 90 days to cold storage OR move to a 30-day Slack retention policy.",
    deliverable:
      "Storage reconciliation recorded + 90-day rotation policy signed off",
  },
  {
    week: 4,
    title: "Threshold / cadence / cooldown retrospective + 90-day tuning plan",
    action:
      "Walk through each of the 5 canonical webhook thresholds + the cooldown + the cadence. For each, record: (a) the original value, (b) the actual fire-rate during the 30-day run, (c) the false-positive rate, (d) the recommendation (tighten / hold / relax). Output a 90-day tuning plan that the team can execute in the next tick.",
    deliverable:
      "Threshold / cadence / cooldown retrospective + 90-day tuning plan recorded",
  },
  {
    week: 4,
    title: "Voice-profile downgrade check + Linear / PagerDuty prerequisites",
    action:
      "Confirm the voice-profile downgrade rules held for the full 30 days: if voiceProfile = luxury and PagerDuty is not in the stack, downgrade to C (or B if downgrading from C). If voiceProfile = b2b and Linear is not in the stack, downgrade to C (or B if downgrading from C). Record any incidents where the downgrade was triggered and how the team adapted.",
    deliverable:
      "Voice-profile downgrade log recorded + Linear / PagerDuty pre-recs updated",
  },
  {
    week: 4,
    title: "Cross-platform coverage audit + Move #6.8 input quality check",
    action:
      "Confirm Move #6.10 covers all 5 canonical paid platforms (Meta / Google / TikTok / Snap / Pinterest). Audit the Move #6.8 input quality: each .alerts/*.json file should contain the canonical 13 payload fields. If a platform is missing, extend Move #6.8 first OR exclude the platform from Move #6.10's alert-payload emitter.",
    deliverable:
      "Cross-platform coverage + Move #6.8 input-quality audit recorded",
  },
  {
    week: 4,
    title: "30-day program readout deck + exec-summary",
    action:
      "Compile a single deck / Notion page that captures: (a) the path you shipped, (b) the Year-1 cost stack, (c) the 30-day + Year-1-projected avoided-incidents, (d) the 30-day + Year-1-projected recovered-attribution-revenue, (e) the actual Year-1 net ROI vs forecast, (f) the 90-day iteration backlog. Share with ops + analytics + finance lead.",
    deliverable:
      "30-day program readout deck + exec-summary shared + sign-off from leads",
  },
  {
    week: 4,
    title: "Wire Move #6.10 into the next-quarter attribution-roadmap",
    action:
      "Add Move #6.10 to the canonical attribution-roadmap doc (research/06 or playbook 06 / 06.5). Mark it as shipped with the chosen path + cost stack + Year-1 net ROI. Reference the Move #6.10 launch plan (this document) in the 'How to extend' section so the next operator can re-run the 30-day sequence without re-discovering the build steps.",
    deliverable:
      "Attribution-roadmap updated + Move #6.10 marked shipped + cross-ref added",
  },
];

// ---------------------------------------------------------------------------
// Generator + markdown renderer
// ---------------------------------------------------------------------------

export interface BuildAttributionHealthAlertLaunchPlanOptions {
  inputs?: Partial<AttributionAlertInputs>;
  startDate?: string;
}

export function buildAttributionHealthAlertLaunchPlan(
  opts?: BuildAttributionHealthAlertLaunchPlanOptions
): AttributionHealthAlertLaunchPlanPayload {
  const inputs: AttributionAlertInputs = {
    ...ATTRIBUTION_ALERT_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as AttributionAlertInputs;

  const forecast = forecastAttributionAlert(inputs);

  const yourStore = loadYourStore();

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  const days: AttributionHealthAlertLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    inputs,
    forecast,
    yourStore,
    days,
    path: forecast.path,
    pathLabel: forecast.pathLabel,
  };
}

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function attributionHealthAlertPlanDayDate(
  startIso: string,
  day: number
): string {
  return isoDateAt(new Date(startIso + "T00:00:00Z"), day - 1);
}

/**
 * Render the plan as a paste-ready markdown checklist. Each day has a
 * `- [ ] ` checkbox so when the operator pastes into Linear / Notion /
 * GitHub Issues / Google Tasks, ticks remain functional.
 */
export function attributionHealthAlertPlanToMarkdown(
  plan: AttributionHealthAlertLaunchPlanPayload
): string {
  const f = plan.forecast;
  const path = plan.path;

  const roiLow = Number.isFinite(f.year1NetRoiLow)
    ? `${f.year1NetRoiLow.toFixed(1)}:1`
    : "∞";
  const roiHigh = Number.isFinite(f.year1NetRoiHigh)
    ? `${f.year1NetRoiHigh.toFixed(1)}:1`
    : "∞";

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(2)} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(plan.yourStore.grossMargin * 100).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# Attribution-Health Alert Launch Plan — ${plan.startDate}`,
    "",
    `> Move #6.10 — always-on attribution-health alert webhook dispatcher (Slack + Linear + PagerDuty + Opsgenie). Same math as the \`/attribution-health-alert\` calculator (browser port of canonical Move #6.10 script \`scripts/attribution_health_alert_webhook.py\`).${yourStoreLine}`,
    "",
    `## Snapshot`,
    "",
    `- **Path verdict:** ${path} — ${f.pathLabel}`,
    `- **Year-1 net ROI:** ${roiLow} conservative / ${roiHigh} expected`,
    `- **Year-1 cost stack:** $${f.year1CostLow.toLocaleString()} (low) – $${f.year1CostHigh.toLocaleString()} (high)`,
    `- **Year-1 avoided incidents:** ${f.year1AvoidedIncidentsLow} (low) – ${f.year1AvoidedIncidentsHigh} (high)`,
    `- **Year-1 incremental attribution recovery:** $${f.year1IncrementalAttributionRecoveryLow.toLocaleString()} (low) – $${f.year1IncrementalAttributionRecoveryHigh.toLocaleString()} (high)`,
    `- **Alert cadence:** ${f.alertCadence}`,
    `- **Cooldown (recommended):** ${f.cooldownSecondsRecommended.toLocaleString("en-US")}s`,
    `- **Default platform pick:** ${f.defaultPlatformPick}`,
    `- **Health band:** ${f.healthBand}`,
    "",
  ];

  // Path E: defer the plan
  if (path === "E") {
    lines.push(
      "## ⚠️  DEFER",
      "",
      "Path E verdict = Move #6.10 should be deferred (canonical gate: paid-spend < $500/mo). The plan below is still paste-ready for the day you ship the first dollar of paid spend.",
      ""
    );
  }

  // Day-by-day
  let lastWeek: number | null = null;
  for (const d of plan.days) {
    if (d.week !== lastWeek) {
      lines.push("");
      lines.push(`## Week ${d.week}`);
      lines.push("");
      lastWeek = d.week;
    }
    const dayDate = attributionHealthAlertPlanDayDate(plan.startDate, d.day);
    lines.push(`### Day ${d.day} — ${dayDate} — ${d.title}`);
    lines.push("");
    lines.push(`- [ ] **${d.action}**`);
    lines.push("");
    lines.push(`  Deliverable: _${d.deliverable}_`);
    lines.push("");
  }

  lines.push("");
  lines.push("---");
  lines.push(
    `_Generated by Ecommerce Ops dashboard · /attribution-health-alert-launch-plan · Move #6.10 always-on Attribution-Health Alert webhook._`
  );

  return lines.join("\n");
}

/** Plan summary string for sidebar badges / chips — "30-day / 4-week / 30 actions". */
export const ATTRIBUTION_HEALTH_ALERT_PLAN_SUMMARY = {
  totalDays: 30,
  totalActions: 30,
  weeks: 4,
};