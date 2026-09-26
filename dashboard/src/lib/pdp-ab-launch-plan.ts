/**
 * `pdp-ab-launch-plan.ts` — Pure generator for the 30-day PDP A/B launch plan.
 *
 * Reads the operator's saved PdpAbTest inputs + their Your-store AOV /
 * monthly orders / gross margin (when present) and produces a calendar-
 * ready, day-by-day markdown checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)  — Tools, hypothesis backlog, baseline metrics
 *   W2 (Days 8–14) — Variant build, QA, instrumentation
 *   W3 (Days 15–21) — Test 1 launch → monitoring → decision
 *   W4 (Days 22–30) — Test 1 readout → Test 2 kickoff / queue draining
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (verdict + annualized
 * ROI ratio) so when the plan is shared in a standup, the team sees
 * "what does this look like" without opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { AbTestInputs } from "@/lib/pdp-ab-test";
import { forecastPdpAbTest } from "@/lib/pdp-ab-test";
import { loadYourStore } from "@/lib/your-store";

export interface LaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
  dependsOn?: number[];
}

export interface LaunchPlanPayload {
  generatedAt: string;       // ISO timestamp
  startDate: string;         // operator-pickable plan start (default = today)
  inputs: AbTestInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastPdpAbTest>;
  days: LaunchPlanDay[];
}

const PLAN_DAYS: Omit<LaunchPlanDay, "day">[] = [
  // --- Week 1 — Tools, hypothesis backlog, baseline ------------------------
  {
    week: 1,
    title: "Pick the A/B tool and Growth-tier plan",
    action:
      "Stand up a Convert.com / VWO / Shoplift account. Confirm the test volume tier covers your monthly PDP sessions at the price you projected. Add the admin user, billing, and SSO.",
    deliverable: "A/B tool is live · Growth-tier invoice approved",
  },
  {
    week: 1,
    title: "Wire the PDP analytics instrumentation",
    action:
      "Confirm PDP-view → add-to-cart → checkout events all flow into your analytics source with stable event names. Validate that the A/B tool can read those events (no double-counting, no PII leak).",
    deliverable: "Triple Whale / GA4 events verified firing on 5+ PDPs",
  },
  {
    week: 1,
    title: "Pull baseline PDP funnel metrics",
    action:
      "Export the trailing-90-day PDP CVR, ATC rate, bounce rate, and AOV. Save the snapshot to the playbook folder so the test lift has a comparator.",
    deliverable: "Baseline CSV exported → /playbooks/09.5-pdp-ab-testing-program/baseline.csv",
  },
  {
    week: 1,
    title: "Backlog 8 hypotheses ranked by ICE",
    action:
      "Use the hypothesis backlog format from the playbook (Impact × Confidence × Ease). Score each hypothesis, rank them, and pin the top 3 for the first month.",
    deliverable: "ICE-ranked backlog doc, top 3 hypotheses starred",
  },
  {
    week: 1,
    title: "Pick the first hypothesis & write the brief",
    action:
      "Translate the #1 ICE hypothesis into an If/Then/Because statement. List the variant types you'll test (headline / hero / price / reviews / layout). Decide success + guardrail metrics.",
    deliverable: "Hypothesis brief doc with metric set + sample-size target",
  },
  {
    week: 1,
    title: "Set the team review cadence",
    action:
      "Block a 30-min daily standup during test ramp + a 60-min readout when each test concludes. Add the cadence to the operator's calendar.",
    deliverable: "Daily 30-min + readout 60-min events on calendar",
  },
  {
    week: 1,
    title: "Publish the 30-day launch plan to the team channel",
    action:
      "Paste the plan into the #cro channel. Tag the assignee for each week. Pin the doc for the duration of the program.",
    deliverable: "Plan pinned in #cro with owners tagged",
  },

  // --- Week 2 — Variant build, QA, instrumentation -------------------------
  {
    week: 2,
    title: "Build variant #1 (the #1 ICE hypothesis)",
    action:
      "Use the design system tokens — no one-off variants. Implement headline + hero copy first, then supporting modules. Keep variant distinct enough that the test has power.",
    deliverable: "Variant #1 published to staging, behind A/B tool flag",
  },
  {
    week: 2,
    title: "Run a 24-hour QA session",
    action:
      "Smoke-test on desktop + mobile, slow 3G + fibre, signed-in + guest, all major browsers. Confirm event firing, no console errors, no broken CTAs.",
    deliverable: "QA sign-off doc with screenshots of every breakpoint",
  },
  {
    week: 2,
    title: "Add the test to the experiment registry",
    action:
      "Log test ID, owner, hypothesis, success metric, guardrails, decision rule, and planned sample size in the experiment registry.",
    deliverable: "Registry entry created, owner pinged in #experiments",
  },
  {
    week: 2,
    title: "Set up the live monitoring dashboard",
    action:
      "Pin a Triple Whale / Looker dashboard that shows the test's primary + guardrail metrics updated hourly. Add the link to the playbook doc.",
    deliverable: "Live test dashboard URL saved to playbook doc",
  },
  {
    week: 2,
    title: "Configure early-stop + sample-size alerts",
    action:
      "Enable the A/B tool's sample-size-reached + early-stop alert (peeking risk noted in pitfalls). Default to running to planned sample size.",
    deliverable: "Alerts enabled + threshold reviewed by analytics lead",
  },
  {
    week: 2,
    title: "Pre-launch checklist + go/no-go vote",
    action:
      "Run through the playbook pre-launch checklist with the analytics lead and the designer. Vote go or no-go. Document the outcome.",
    deliverable: "Go/no-go vote doc with both sign-offs",
  },
  {
    week: 2,
    title: "Launch test #1 — Day 0",
    action:
      "Flip the variant live at 09:00 local. Confirm analytics events for both arms fire within the first hour. Send the launch note in #experiments.",
    deliverable: "Variant live · launch note in #experiments · first hour events verified",
  },

  // --- Week 3 — Test 1 launch → monitoring → decision ----------------------
  {
    week: 3,
    title: "Day 1 monitoring — SR + A/A sanity check",
    action:
      "Sample first 100 PDP visitors per arm; check traffic split is 50/50 ±2%, event firing is symmetric, and no anomalies in the SR. Don't peek at CVR yet.",
    deliverable: "Day-1 SR note saved to playbook doc",
  },
  {
    week: 3,
    title: "Day 2 monitoring — guardrail review",
    action:
      "Confirm zero impact on the guardrail metrics (bounce, AOV, support tickets). If any guardrail moves, freeze the test and investigate.",
    deliverable: "Day-2 guardrail dashboard screenshot saved",
  },
  {
    week: 3,
    title: "Day 3 peer review of the test setup",
    action:
      "Walk the analytics lead through the test config: traffic allocation, success metric, decision rule, sample size. Lock the analysis plan before the readout.",
    deliverable: "Peer-review sign-off doc with both signatures",
  },
  {
    week: 3,
    title: "Day 4-5 mid-test health check",
    action:
      "Confirm sample size is on pace. If under, check for traffic-exclusion issues, broken variant rendering on key devices. No CVR reads yet — this is hygiene only.",
    deliverable: "Mid-test hygiene note saved",
  },
  {
    week: 3,
    title: "Day 6 — interim read (optional)",
    action:
      "If sample-size-reached is crossed early, run the planned analysis. If not, no read. Document the decision either way.",
    deliverable: "Interim-read doc OR no-read note saved",
  },
  {
    week: 3,
    title: "Day 7 — wrap week 3 with the team",
    action:
      "Quick standup note: traffic pace, any anomalies, what's coming next week. Update the playbook doc.",
    deliverable: "Week-3 standup summary in #cro",
  },

  // --- Week 4 — Test 1 readout → Test 2 kickoff / queue draining -----------
  {
    week: 4,
    title: "Day 22 — final readout once sample size is reached",
    action:
      "Run the planned z-test, document z + p + confidence + decision. Apply the decision rule exactly. No retro-fitting the rule to the result.",
    deliverable: "Final readout doc with z / p / confidence / decision",
  },
  {
    week: 4,
    title: "Day 23 — interpret + action plan",
    action:
      "If winner: ship it 100% + add to evergreen variant library. If loser: revert + queue next hypothesis. If inconclusive: extend or stop per the decision rule.",
    deliverable: "Action plan written — ship / revert / extend decided",
  },
  {
    week: 4,
    title: "Day 24 — credit the lift in the dashboard",
    action:
      "Add the confirmed lift to the realized-ROI section on /playbooks/09.5-pdp-ab-testing-program. Use the same z-test output as the credit source.",
    deliverable: "Realized-ROI row updated with the confirmed win",
  },
  {
    week: 4,
    title: "Day 25 — kickoff test #2 (backlog #2 hypothesis)",
    action:
      "Pick hypothesis #2 from the ICE-ranked backlog. Build variant, QA, configure test #2 in the A/B tool.",
    deliverable: "Test #2 staged, launch scheduled for Day 26",
  },
  {
    week: 4,
    title: "Day 26 — launch test #2 + live monitoring",
    action:
      "Flip variant live at 09:00 local. Confirm analytics events for both arms fire within the first hour. Send the launch note in #experiments.",
    deliverable: "Test #2 live · launch note in #experiments",
  },
  {
    week: 4,
    title: "Day 27-29 — monitor test #2 ramp",
    action:
      "Run hygiene checks on traffic split, event firing, guardrails. No CVR peeks. Note any anomalies for the readout.",
    deliverable: "Test #2 hygiene note saved",
  },
  {
    week: 4,
    title: "Day 30 — 30-day program readout",
    action:
      "30-day readout doc: launch velocity (#tests launched), decision rate (% winners / losers / inconclusive), realized lift, next quarter backlog. Present in the weekly standup.",
    deliverable: "30-day program readout doc + next-quarter backlog queued",
  },
];

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d2.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/**
 * Build the canonical LaunchPlanPayload from the operator's saved
 * PdpAbTest inputs (or the calculator's defaults if nothing saved yet).
 * `startDate` defaults to today; callers can override.
 */
export function buildLaunchPlan(opts?: {
  inputs?: Partial<AbTestInputs>;
  startDate?: string;
}): LaunchPlanPayload {
  const defaults: AbTestInputs = {
    controlSessions: 10000,
    controlConversions: 200,
    variantSessions: 10000,
    variantConversions: 240,
    aov: 75,
    margin: 0.7,
    monthlyPdpSessions: 10000,
    toolMonthlyCost: 200,
    operatorHoursPerMonth: 2,
    operatorHourlyRate: 50,
    confidenceTarget: 0.95,
    avgRelativeLift: 0.05,
    testsPerMonth: 4,
  };
  const inputs: AbTestInputs = { ...defaults, ...(opts?.inputs ?? {}) };

  const yourStore = loadYourStore();

  const forecast = forecastPdpAbTest(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // Map the 30-day canonical plan: indices 0..6 → W1 (days 1-7), 7..13 → W2
  // (days 8-14), 14..20 → W3 (days 15-21), 21..28 → W4 (days 22-30). Note
  // the last week has 9 days (22..30) so the plan is week-1=7 + week-2=7 +
  // week-3=7 + week-4=9 = 30 days.
  const days: LaunchPlanDay[] = PLAN_DAYS.map((p, i) => {
    const day = i + 1;
    const dependsOn: number[] = [];
    if (p.week === 2) dependsOn.push(PLAN_DAYS[3].title.length > 0 ? 4 : 0); // <- legacy
    return { day, ...p, dependsOn: dependsOn.length ? dependsOn : undefined };
  });

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
export function dayDate(startIso: string, day: number): string {
  return isoDateAt(new Date(startIso + "T00:00:00Z"), day - 1);
}

/**
 * Render the plan as a paste-ready markdown checklist. Each day has a
 * `- [ ] ` checkbox so when the operator pastes into Linear / Notion /
 * GitHub Issues / Google Tasks, ticks remain functional.
 */
export function planToMarkdown(plan: LaunchPlanPayload): string {
  const yrRatio = plan.forecast.program.annualizedRatio;
  const yrRatioStr = Number.isFinite(yrRatio) ? `${yrRatio.toFixed(1)}×` : "∞";
  const verdict = plan.forecast.program.healthBandShort;
  const decision = plan.forecast.analysis.decision;

  const lines: string[] = [];

  lines.push("# PDP A/B testing — 30-day launch plan");
  lines.push("");
  lines.push(`> Plan start: **${plan.startDate}** · Generated ${plan.generatedAt.slice(0, 16).replace("T", " ")} UTC`);
  lines.push(
    `> Program verdict: **${verdict}** (${yrRatioStr} annualized) · Sample test decision: **${decision}**`
  );
  if (plan.yourStore) {
    lines.push(
      `> Using Your-store: AOV $${plan.yourStore.aov}, ${plan.yourStore.monthlyOrders}/mo orders, ${(plan.yourStore.grossMargin * 100).toFixed(0)}% margin`
    );
  }
  lines.push("");
  lines.push("Move #9.5 — always-on PDP A/B testing program. Same math as `scripts/pdp_ab_test.py`.");
  lines.push("");

  // Snapshot block
  lines.push("## Snapshot");
  lines.push("");
  lines.push(`- AOV: $${plan.inputs.aov}`);
  lines.push(`- Gross margin: ${(plan.inputs.margin * 100).toFixed(0)}%`);
  lines.push(`- Monthly PDP sessions: ${plan.inputs.monthlyPdpSessions.toLocaleString()}`);
  lines.push(`- Tests / month: ${plan.inputs.testsPerMonth}`);
  lines.push(`- Confidence target: ${(plan.inputs.confidenceTarget * 100).toFixed(0)}%`);
  lines.push(`- Avg relative lift / test: ${(plan.inputs.avgRelativeLift * 100).toFixed(2)}%`);
  lines.push(`- Tool / month: $${plan.inputs.toolMonthlyCost}`);
  lines.push(`- Operator hr / month × $/hr: ${plan.inputs.operatorHoursPerMonth.toFixed(1)} h × $${plan.inputs.operatorHourlyRate}`);
  lines.push(`- Net revenue / month: $${Math.round(plan.forecast.program.netRevenuePerMonth).toLocaleString()}`);
  lines.push(`- Net revenue / year: $${Math.round(plan.forecast.program.netRevenuePerYear).toLocaleString()}`);
  lines.push(`- Annualized ratio: ${yrRatioStr} · Verdict: ${verdict}`);
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
    lines.push(`### Day ${d.day} — ${dayDate(plan.startDate, d.day)} — ${d.title}`);
    lines.push("");
    lines.push(`- [ ] **${d.action}**`);
    lines.push("");
    lines.push(`  Deliverable: _${d.deliverable}_`);
    lines.push("");
  }

  lines.push("");
  lines.push("---");
  lines.push(
    `_Generated by Ecommerce Ops dashboard · /pdp-ab-launch-plan · Move #9.5 always-on PDP A/B testing._`
  );

  return lines.join("\n");
}
