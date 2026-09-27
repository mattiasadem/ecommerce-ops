/**
 * `welcome-series-launch-plan.ts` — Pure generator for the 30-day Welcome-Series
 * launch plan.
 *
 * Reads the operator's saved WelcomeSeriesInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Opt-in sources, welcome-discount math, audience import
 *   W2 (Days 8–14)  — Email build (5 emails), SMS opt-in, instrumentation
 *   W3 (Days 15–21) — Soft launch → first-touch send → baseline metrics
 *   W4 (Days 22–30) — Open-rate + CVR readout → iteration backlog → 30-day readout
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (verdict + ROI ratio)
 * so when the plan is shared in a standup, the team sees "what does
 * this look like" without opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { WelcomeSeriesInputs } from "@/lib/welcome-series-roi";
import { forecastWelcomeSeries } from "@/lib/welcome-series-roi";
import { loadYourStore } from "@/lib/your-store";
import { WELCOME_SERIES_DEFAULTS } from "@/lib/welcome-series-roi";

export interface WelcomeLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface WelcomeLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: WelcomeSeriesInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastWelcomeSeries>;
  days: WelcomeLaunchPlanDay[];
}

const PLAN_DAYS: Omit<WelcomeLaunchPlanDay, "day">[] = [
  // --- Week 1 — Opt-in sources, welcome-discount math, audience import -----
  {
    week: 1,
    title: "Audit current opt-in sources + 14-day volume",
    action:
      "Pull the trailing-30-day opt-in volume from each source: newsletter footer, exit-intent popup, quiz, post-purchase, SMS keyword. Save the snapshot so the welcome flow has a feeder baseline.",
    deliverable:
      "Opt-in source ledger CSV exported (source / 30d volume / CVR)",
  },
  {
    week: 1,
    title: "Pick the welcome-discount band (5% / 10% / 15%)",
    action:
      "Decide the welcome discount. Use the calculator's breakeven CVR readout to validate the band covers your send cost. Lower = healthier margin; higher = higher first-order CVR. Document the chosen band and the trade-off.",
    deliverable: "Welcome-discount decision doc with breakeven-CVR read",
  },
  {
    week: 1,
    title: "Stand up Klaviyo + Postscript flows skeleton",
    action:
      "Create the master 'Welcome Series' flow container in Klaviyo with 5 email slots. Create the matching Postscript SMS container with 1-3 SMS slots keyed to the Klaviyo flow timing.",
    deliverable:
      "Klaviyo flow + Postscript SMS containers created, draft state",
  },
  {
    week: 1,
    title: "Import the historical opt-in cohort",
    action:
      "Export the trailing-90-day opt-ins from Klaviyo and import into the new welcome flow as a 'starter list'. Confirm opt-in date metadata is preserved so the cadence is correct.",
    deliverable: "Historical opt-in cohort imported + verified",
  },
  {
    week: 1,
    title: "Lock the success metric + horizon",
    action:
      "Decide the 30-day success metric: first-purchase CVR × AOV × gross margin minus welcome-discount minus send cost. Capture the ROI ratio readout cadence (daily / weekly).",
    deliverable: "Metric + horizon doc signed off",
  },
  {
    week: 1,
    title: "Pre-launch flow design QA",
    action:
      "Walk the design + copy leads through the welcome series skeleton. Confirm subject lines, preview text, hero copy, and CTAs are on-brand and reflect the welcome-discount math.",
    deliverable: "Design + copy sign-off recorded",
  },
  {
    week: 1,
    title: "Publish the 30-day plan to the team channel",
    action:
      "Paste the plan into the #lifecycle channel. Tag the assignee for each week. Pin the doc for the duration of the program.",
    deliverable: "Plan pinned in #lifecycle with owners tagged",
  },

  // --- Week 2 — Email build (5 emails), SMS opt-in, instrumentation --------
  {
    week: 2,
    title: "Build Email #1 (the welcome + discount reveal)",
    action:
      "Send within 5 minutes of opt-in. Subject: brand voice + discount hint. Body: thank-you, discount code, CTA to shop best-sellers. Mobile-first design.",
    deliverable: "Email #1 published in Klaviyo, mobile preview screenshotted",
  },
  {
    week: 2,
    title: "Build Email #2 (the social-proof email, day 2-3)",
    action:
      "Lead with a customer review, UGC photo, or 'as featured in' press hit. Drive to a curated collection. Keep the discount secondary.",
    deliverable: "Email #2 published in Klaviyo",
  },
  {
    week: 2,
    title: "Build Email #3 (the education email, day 4-5)",
    action:
      "Drop the discount. Lead with 'how to pick the right [product type]' or founder story. Position the brand as the expert. Re-anchor on shop CTA at the bottom.",
    deliverable: "Email #3 published in Klaviyo, brand voice validated",
  },
  {
    week: 2,
    title: "Build Email #4 (the founder / mission email, day 6-8)",
    action:
      "Founder-written note. Mission, sourcing, sustainability, or craftsmanship. Drive to brand story page. Last-chance discount nudge if applicable.",
    deliverable: "Email #4 published in Klaviyo",
  },
  {
    week: 2,
    title: "Build Email #5 (the last-chance email, day 10-12)",
    action:
      "Discount expiration or 'last chance' reminder. Urgency + scarcity language. Drive to cart or PDP. Stop the flow if they convert.",
    deliverable: "Email #5 published in Klaviyo, exit-on-conversion verified",
  },
  {
    week: 2,
    title: "Wire the SMS opt-in + first-touch SMS",
    action:
      "Add the SMS opt-in capture at the bottom of the welcome email. Confirm the Postscript keyword flow triggers the welcome SMS within 10 minutes of opt-in.",
    deliverable:
      "SMS opt-in live · Postscript flow triggers first-touch SMS",
  },
  {
    week: 2,
    title: "Wire analytics instrumentation + Triple Whale mapping",
    action:
      "Confirm the email-click → PDP-view → add-to-cart → checkout events all flow into Triple Whale / GA4. Validate the Klaviyo metric mapping (placed-order zero-pings after conversion).",
    deliverable: "Triple Whale mapping verified · placed-order zero-ping set",
  },

  // --- Week 3 — Soft launch → first-touch send → baseline metrics ----------
  {
    week: 3,
    title: "Soft-launch to 10% of new opt-ins",
    action:
      "Enable the flow for 10% of new opt-ins as the soft-launch cohort. Confirm the first-touch email + SMS send within 10 minutes for the first 50 opt-ins.",
    deliverable: "Soft-launch live · first 50 sends verified",
  },
  {
    week: 3,
    title: "Day 1 monitoring — delivery + open rate sanity check",
    action:
      "Sample the first 100 sends per channel; verify Klaviyo delivery > 95%, Postscript delivery > 97% (US carriers), open rate within 40-60%. Don't peek at CVR yet.",
    deliverable: "Day-1 delivery + open-rate note saved",
  },
  {
    week: 3,
    title: "Day 2 monitoring — unsubscribe + spam complaint rates",
    action:
      "Confirm unsubscribe rate < 0.5%, spam complaint rate < 0.08% (Klaviyo thresholds). Above that = flow content mismatch with the opt-in promise. Pause and revisit.",
    deliverable:
      "Day-2 unsub + spam-rate note saved · pause threshold documented",
  },
  {
    week: 3,
    title: "Day 3 — soft-launch CVR readout (no peeking after this)",
    action:
      "Pull first-purchase CVR for the soft-launch cohort. If breakeven-CVR from the calculator is exceeded, ramp to 100%. Otherwise pause and iterate subject lines + send cadence.",
    deliverable:
      "Day-3 soft-launch CVR readout doc · ramp/iterate decision recorded",
  },
  {
    week: 3,
    title: "Day 4 — ramp to 100% of new opt-ins",
    action:
      "If the soft-launch CVR > breakeven: enable the flow for 100% of new opt-ins. Send launch note to #lifecycle. Confirm Triple Whale is mapping the events correctly.",
    deliverable: "Flow live at 100% · launch note in #lifecycle",
  },
  {
    week: 3,
    title: "Day 5-6 — first-touch conversion telemetry",
    action:
      "Monitor first-purchase CVR + revenue per opt-in for the rolling cohort. Confirm the email-1 → email-2 → email-3 → email-4 → email-5 cascade is delivering (not premature drop-off).",
    deliverable: "Day-5-6 cascade telemetry saved",
  },
  {
    week: 3,
    title: "Day 7 — wrap W3 with the team",
    action:
      "Quick standup: opt-in volume, open rate, CVR, anomaly log. Update the playbook doc with the ramp-to-100% results.",
    deliverable: "Week-3 standup summary in #lifecycle",
  },

  // --- Week 4 — Open-rate + CVR readout → iteration backlog → 30-day readout
  {
    week: 4,
    title: "Day 22 — final 14-day first-touch CVR readout",
    action:
      "Pull the trailing-14-day first-purchase CVR × AOV × margin minus send cost. Compare to the calculator's pre-launch forecast. If actual < 70% forecast → investigate copy + cadence.",
    deliverable: "Day-22 14-day CVR readout doc saved",
  },
  {
    week: 4,
    title: "Day 23 — open-rate + click-rate deep-dive",
    action:
      "Per-email open rate and click rate. Identify the weakest email in the series. Hypothesis for A/B (subject, hero copy, CTA). Add to next-month iteration backlog.",
    deliverable: "Email-level engagement doc + iteration backlog updated",
  },
  {
    week: 4,
    title: "Day 24 — unsubscribe cohort deep-dive",
    action:
      "Identify which email in the series drives the most unsubscribes. Common culprit = email #4 or #5 (mission/story fatigue). Adjust or shorten if > 0.4% per email.",
    deliverable: "Unsub-by-email doc saved · shorten/edit decision recorded",
  },
  {
    week: 4,
    title: "Day 25 — SMS attribution + opt-in rate readout",
    action:
      "Pull SMS opt-in rate from the welcome flow footers (target 30%+). First-touch SMS conversion rate vs control cohort. Decide if SMS is outperforming enough to keep or to deprioritize.",
    deliverable: "SMS attribution readout doc saved",
  },
  {
    week: 4,
    title: "Day 26 — paid acquisition segment split",
    action:
      "Slice the welcome-flow revenue by opt-in source (paid Meta vs organic vs referral vs direct). Adjust CAC ceiling per source if conversion varies > 2x.",
    deliverable: "Paid-acquisition segment split saved to doc",
  },
  {
    week: 4,
    title: "Day 27 — queue next-month A/B tests (subject + cadence)",
    action:
      "Top 3 hypotheses for next month: subject line A/B (2 variants), send time A/B (morning vs evening), cadence compression (5 emails → 4). Pick 1, queue the other 2 for the following month.",
    deliverable:
      "Next-month A/B test chosen · backlog doc updated with 3 hypotheses",
  },
  {
    week: 4,
    title: "Day 28 — flow documentation + handoff",
    action:
      "Update the Klaviyo flow doc with the actual send cadence + measured CVR. Pin the doc in #lifecycle. Hand off to the analyst on rotation.",
    deliverable: "Klaviyo flow doc updated · handoff note in #lifecycle",
  },
  {
    week: 4,
    title: "Day 29 — next-month owner + review cadence",
    action:
      "Block a 30-min weekly review (Mon morning) for the welcome series. Assign the next-month owner. Add the cadence to the operator's calendar.",
    deliverable: "Weekly 30-min review on calendar · owner assigned",
  },
  {
    week: 4,
    title: "Day 30 — 30-day program readout",
    action:
      "30-day readout doc: opt-in volume, first-purchase CVR, revenue per opt-in, ROI ratio, send-cost %, unsub rate, top 3 learnings, next-quarter backlog. Present in the weekly standup.",
    deliverable:
      "30-day program readout doc + next-quarter backlog queued",
  },
];

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Build the canonical WelcomeLaunchPlanPayload. */
export function buildWelcomeLaunchPlan(opts?: {
  inputs?: Partial<WelcomeSeriesInputs>;
  startDate?: string;
}): WelcomeLaunchPlanPayload {
  const inputs: WelcomeSeriesInputs = {
    ...WELCOME_SERIES_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as WelcomeSeriesInputs;

  const yourStore = loadYourStore();

  const forecast = forecastWelcomeSeries(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: WelcomeLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    inputs,
    yourStore,
    forecast,
    days,
  };
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function welcomePlanDayDate(startIso: string, day: number): string {
  return isoDateAt(new Date(startIso + "T00:00:00Z"), day - 1);
}

/**
 * Render the plan as a paste-ready markdown checklist. Each day has a
 * `- [ ] ` checkbox so when the operator pastes into Linear / Notion /
 * GitHub Issues / Google Tasks, ticks remain functional.
 */
export function welcomePlanToMarkdown(plan: WelcomeLaunchPlanPayload): string {
  const roiRatio = plan.forecast.roiRatio;
  const roiStr = Number.isFinite(roiRatio)
    ? `${roiRatio.toFixed(1)}×`
    : roiRatio > 0
      ? "∞"
      : "—";
  const verdict = plan.forecast.healthBand;
  const netMonthly = Math.round(plan.forecast.netRevenuePerMonth);

  const lines: string[] = [];

  lines.push("# Welcome Series — 30-day launch plan");
  lines.push("");
  lines.push(
    `> Plan start: **${plan.startDate}** · Generated ${plan.generatedAt.slice(0, 16).replace("T", " ")} UTC`
  );
  lines.push(
    `> Verdict: **${verdict}** (${roiStr} ROI ratio, $${netMonthly.toLocaleString()} net / month)`
  );
  if (plan.yourStore) {
    lines.push(
      `> Using Your-store: AOV $${plan.yourStore.aov}, ${plan.yourStore.monthlyOrders}/mo orders, ${(plan.yourStore.grossMargin * 100).toFixed(0)}% margin`
    );
  }
  lines.push("");
  lines.push(
    "Move #3.4 — always-on Welcome Series. Same math as `scripts/welcome_series_roi.py`."
  );
  lines.push("");

  // Snapshot block
  lines.push("## Snapshot");
  lines.push("");
  lines.push(`- Opt-ins / month: ${plan.inputs.optinsPerMonth.toLocaleString()}`);
  lines.push(
    `- First-purchase CVR: ${(plan.inputs.firstPurchaseCvr * 100).toFixed(2)}%`
  );
  lines.push(`- AOV: $${plan.inputs.aov}`);
  lines.push(`- Gross margin: ${(plan.inputs.grossMargin * 100).toFixed(0)}%`);
  lines.push(
    `- Welcome discount: ${(plan.inputs.welcomeDiscount * 100).toFixed(0)}%`
  );
  lines.push(`- Emails / series: ${plan.inputs.emailCount}`);
  lines.push(
    `- Email delivery rate: ${(plan.inputs.emailDeliveryRate * 100).toFixed(0)}%`
  );
  lines.push(`- SMS / opted-in subscriber: ${plan.inputs.smsCount}`);
  lines.push(
    `- SMS opt-in rate: ${(plan.inputs.smsOptinRate * 100).toFixed(0)}%`
  );
  lines.push(`- Horizon: ${plan.inputs.horizonDays} days`);
  lines.push(
    `- First orders / month: ${Math.round(plan.forecast.firstOrdersPerMonth).toLocaleString()}`
  );
  lines.push(
    `- Revenue / month: $${Math.round(plan.forecast.revenuePerMonth).toLocaleString()}`
  );
  lines.push(
    `- Discount cost / month: $${Math.round(plan.forecast.discountCostPerMonth).toLocaleString()}`
  );
  lines.push(
    `- Send cost / month: $${Math.round(plan.forecast.totalSendCostPerMonth).toLocaleString()}`
  );
  lines.push(
    `- Net revenue / month: $${netMonthly.toLocaleString()} (annualized $${(netMonthly * 12).toLocaleString()})`
  );
  lines.push(
    `- ROI ratio: ${roiStr} per $1 of send cost · Breakeven CVR: ${(plan.forecast.breakevenCvr * 100).toFixed(2)}%`
  );
  lines.push("");

  // Day-by-day
  let lastWeek: number | null = null;
  for (const d of plan.days) {
    if (d.week !== lastWeek) {
      lines.push("");
      lines.push(`## Week ${d.week}`);
      lines.push("");
      lastWeek = d.week;
    }
    lines.push(
      `### Day ${d.day} — ${welcomePlanDayDate(plan.startDate, d.day)} — ${d.title}`
    );
    lines.push("");
    lines.push(`- [ ] **${d.action}**`);
    lines.push("");
    lines.push(`  Deliverable: _${d.deliverable}_`);
    lines.push("");
  }

  lines.push("");
  lines.push("---");
  lines.push(
    `_Generated by Ecommerce Ops dashboard · /welcome-series-launch-plan · Move #3.4 always-on Welcome Series._`
  );

  return lines.join("\n");
}
