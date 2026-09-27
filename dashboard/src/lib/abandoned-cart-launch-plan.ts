/**
 * `abandoned-cart-launch-plan.ts` — Pure generator for the 30-day
 * Abandoned-Cart (Klaviyo + Postscript) launch plan.
 *
 * Reads the operator's saved AbandonedCartInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Trigger wiring, audience import, Klaviyo + Postscript scaffolds
 *   W2 (Days 8–14)  — 3-email + 2-SMS build, suppression config, instrumentation
 *   W3 (Days 15–21) — Soft-launch to 10%, then ramp to 100%; baseline readouts
 *   W4 (Days 22–30) — CVR / AOV / revenue readout → iteration backlog → 30-day readout
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (verdict + ROI ratio +
 * recovered orders / month) so when the plan is shared in a standup, the
 * team sees "what does this look like" without opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { AbandonedCartInputs } from "@/lib/abandoned-cart-roi";
import {
  ABANDONED_CART_DEFAULTS,
  forecastAbandonedCart,
} from "@/lib/abandoned-cart-roi";
import { loadYourStore } from "@/lib/your-store";

export interface AbandonedCartLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface AbandonedCartLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: AbandonedCartInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastAbandonedCart>;
  days: AbandonedCartLaunchPlanDay[];
}

const PLAN_DAYS: Omit<AbandonedCartLaunchPlanDay, "day">[] = [
  // --- Week 1 — Trigger wiring, audience import, scaffolds ----------------
  {
    week: 1,
    title: "Audit the trailing 30 days of Checkout-Started events",
    action:
      "Pull the trailing-30-day Checkout-Started event count from Shopify / Klaviyo / Segment. Confirm the volume matches the calculator input (default = 1,200/mo). Save as the baseline so the recovery rate you forecast against is real, not aspirational.",
    deliverable:
      "Checkout-Started volume CSV exported (date / cart_id / AOV / device)",
  },
  {
    week: 1,
    title: "Pick the recovery-rate target (8% / 10% / 15% / 20%)",
    action:
      "Decide the recovery-rate target. Use the calculator's health-band thresholds (>=30:1 great, >=15:1 good) to validate. Higher = more recovered revenue but more aggressive suppression noise. Document the chosen band + the ramp schedule (10% → 50% → 100%).",
    deliverable: "Recovery-rate target doc with 3-ramp schedule",
  },
  {
    week: 1,
    title: "Stand up Klaviyo abandoned-cart flow container",
    action:
      "Create the master 'Abandoned Cart' flow in Klaviyo. Wire the Checkout-Started trigger with a 1-hour delay; confirm the flow is in draft state and not currently sending.",
    deliverable: "Klaviyo flow container created, draft state, trigger verified",
  },
  {
    week: 1,
    title: "Stand up Postscript abandoned-cart SMS container",
    action:
      "Create the matching Postscript SMS flow keyed to Klaviyo's checkout-started trigger. Set send-time slots 4h and 24h after Klaviyo's first email. Confirm the flow is in draft and the opt-in filter is wired.",
    deliverable: "Postscript flow created, draft state, opt-in filter verified",
  },
  {
    week: 1,
    title: "Import suppression lists (delivered + recent converters)",
    action:
      "Export the trailing-90-day converters and bounced/unsubscribed contacts from Klaviyo. Import as suppression lists on both flows so a customer who just purchased or just opted out does not get a 'you left something in your cart' email 5 minutes later.",
    deliverable: "Suppression lists imported + verified on both flows",
  },
  {
    week: 1,
    title: "Lock the success metric + horizon",
    action:
      "Decide the 30-day success metric: recovered orders × AOV × gross margin minus send cost. Capture the ROI-ratio readout cadence (daily / weekly). Confirm the breakeven CVR from the calculator matches the historical baseline.",
    deliverable: "Metric + horizon doc signed off + readout cadence locked",
  },
  {
    week: 1,
    title: "Pre-launch flow design QA",
    action:
      "Walk the design + copy leads through the abandoned-cart skeleton. Confirm subject lines, preview text, hero copy, discount framing, and CTAs are on-brand. Validate the 3-email and 2-SMS cadence fits Klaviyo + Postscript best practice (1h / 24h / 72h email + 4h / 24h SMS).",
    deliverable: "Design + copy sign-off recorded + cadence validation",
  },

  // --- Week 2 — Email + SMS build + instrumentation -----------------------
  {
    week: 2,
    title: "Build email #1 (1h after abandonment — soft reminder)",
    action:
      "Create email #1 in Klaviyo: subject referencing the abandoned item, hero block with the product image, 'Complete your order' CTA, optional 5-10% welcome-back incentive if AOV > $100. Wire dynamic cart block from the Klaviyo template library.",
    deliverable: "Email #1 built + Klaviyo preview + dev link tested",
  },
  {
    week: 2,
    title: "Build email #2 (24h after abandonment — social proof / urgency)",
    action:
      "Create email #2 in Klaviyo: review-snippet block, urgency framing (stock count / free shipping cutoff), static-image hero, 'Complete your order' CTA. Increase discount if AOV supports it (10-15% band).",
    deliverable: "Email #2 built + Klaviyo preview + dev link tested",
  },
  {
    week: 2,
    title: "Build email #3 (72h after abandonment — final reminder)",
    action:
      "Create email #3 in Klaviyo: subject line with explicit time-bound incentive, last-chance hero, FAQ block (returns / shipping / secure checkout), 'Complete your order' CTA. Cap discount at the breakeven CVR the calculator surfaced.",
    deliverable: "Email #3 built + Klaviyo preview + dev link tested",
  },
  {
    week: 2,
    title: "Build SMS #1 (4h after abandonment — soft reminder)",
    action:
      "Build Postscript SMS #1: <160 char, link to dynamic cart, opt-out footer, soft tone, no aggressive discount. Validate on a test contact.",
    deliverable: "SMS #1 built + Postscript preview tested",
  },
  {
    week: 2,
    title: "Build SMS #2 (24h after abandonment — final reminder)",
    action:
      "Build Postscript SMS #2: <160 char, last-chance framing, link to dynamic cart, opt-out footer. Cap discount at the breakeven CVR band. Validate on a test contact.",
    deliverable: "SMS #2 built + Postscript preview tested",
  },
  {
    week: 2,
    title: "Wire Triple Whale / Segment / GA4 attribution events",
    action:
      "Wire Klaviyo's 'Email Opened' / 'Email Clicked' / 'Placed Order' events into Triple Whale + Segment + GA4. Confirm recovered-order attribution is captured with the original UTM source so the ROI ratio readout is comparable to other channels.",
    deliverable: "Triple Whale + Segment events verified end-to-end",
  },
  {
    week: 2,
    title: "QA across mobile + desktop + dark mode + spam-folder preview",
    action:
      "Send a test seed list through the full flow at 1h / 24h / 72h email + 4h / 24h SMS. Verify deliverability (Litmus / GlockApps), preview across iPhone Mail / Gmail / Outlook / Yahoo mobile + desktop, confirm CTAs render with no broken links, check spam-folder preview.",
    deliverable: "QA report recorded + sign-off from design + ops lead",
  },

  // --- Week 3 — Soft-launch + ramp + baseline ----------------------------
  {
    week: 3,
    title: "Soft-launch to 10% of audience + monitor for 24h",
    action:
      "Move both flows from draft to live. Set a 10% send-time condition (split by SHA-256 of email) so 1 in 10 carts enters the flow. Monitor Klaviyo + Postscript send queues, deliverability, and Triple Whale recovered-revenue attribution for 24h before ramping.",
    deliverable: "10% segment live + monitoring dashboard live",
  },
  {
    week: 3,
    title: "Ramp to 50% + monitor deliverability",
    action:
      "After 24h clean read at 10%, raise the condition to 50%. Monitor spam-rate, unsubscribe-rate, post-purchase complaints. If complaints > 0.1%, pause and audit subject lines + suppression lists.",
    deliverable: "50% segment live + 24h read-clean",
  },
  {
    week: 3,
    title: "Ramp to 100% + freeze cadence changes for 14 days",
    action:
      "After 24h clean read at 50%, raise to 100%. Communicate the launch in the team channel; freeze any cadence / copy / discount changes for 14 days so the readouts below are statistically clean.",
    deliverable: "100% segment live + freeze-policy doc signed off",
  },
  {
    week: 3,
    title: "Day-1 read: open-rate + click-rate per email + per SMS",
    action:
      "Pull the day-1 read from Klaviyo + Postscript: open-rate / click-rate / unsubscribe-rate per email and per SMS. Compare against benchmarks (Klaviyo abandoned-cart open-rate 40-45%, click-rate 5-10%; Postscript SMS click-rate 10-20%).",
    deliverable: "Day-1 read recorded in the dashboard readout tab",
  },
  {
    week: 3,
    title: "Day-7 read: recovered orders + recovered revenue",
    action:
      "Pull the trailing-7-day recovered-orders count from Triple Whale + Klaviyo's 'Placed Order' event log. Compute the trailing-7-day recovery rate and compare against the calculator's projected rate.",
    deliverable: "Day-7 readout sheet (orders / revenue / rate / ROI)",
  },
  {
    week: 3,
    title: "Day-14 read: per-email / per-SMS attribution",
    action:
      "Pull the per-email + per-SMS attributed revenue split. Identify the lowest-ROI step in the 3-email + 2-SMS cadence and queue it for the Week-4 iteration backlog.",
    deliverable: "Per-step attribution sheet + weakest-step ranked",
  },
  {
    week: 3,
    title: "Day-14 read: recovery-rate vs breakeven CVR",
    action:
      "Compare the trailing-14-day recovery rate against the calculator's breakeven CVR readout. If recovery rate < breakeven CVR, escalate to the iteration backlog immediately; if above, lock the cadence for the next 14 days.",
    deliverable: "Recovery-vs-breakeven comparison + action plan",
  },

  // --- Week 4 — Readout + iteration + 30-day program readout ------------
  {
    week: 4,
    title: "Day-21 read: full-flow recovered revenue + ROI ratio",
    action:
      "Pull the trailing-21-day recovered revenue from Triple Whale + Klaviyo + Postscript. Compute the ROI ratio (recovered revenue / total send cost). Compare against the calculator's projected ratio and identify any gap > 20%.",
    deliverable: "Trailing-21-day ROI readout vs projection",
  },
  {
    week: 4,
    title: "Day-21 read: AOV-shifted recovered orders",
    action:
      "Slice the recovered-order data by AOV band (top quartile, median, bottom quartile). Validate that the cadence (1h / 24h / 72h email + 4h / 24h SMS) is working hardest on the highest-AOV abandoned carts, not just the lowest.",
    deliverable: "AOV-band recovery-rate matrix",
  },
  {
    week: 4,
    title: "Day-21 read: subscription / repeat-buyer behavior",
    action:
      "Pull the trailing-21-day recovered-orders data sliced by repeat-buyer flag. Identify whether the flow is converting new buyers, repeat buyers, or both. Adjust the cadence (especially the 72h email) if the split is off-target.",
    deliverable: "Repeat-vs-new buyer recovery-rate matrix",
  },
  {
    week: 4,
    title: "Day-25 read: list-unsubscribe + complaint trend",
    action:
      "Pull the trailing-25-day list-unsubscribe + spam-complaint rate from Klaviyo + Postscript. If either is climbing vs baseline, audit suppression + cadence + discount framing. Pause the flow and rewrite the affected step if complaint rate > 0.3%.",
    deliverable: "Unsubscribe + complaint trend report + action threshold",
  },
  {
    week: 4,
    title: "Day-25 read: cohort persistence (first-touch + repeat flows)",
    action:
      "Pull the trailing-25-day 'flow-converted' cohort and re-check 14-day retention. Identify whether customers recovered via abandoned-cart subsequently placed a second order within 14 days. This validates the flow's LTV impact, not just first-order ROI.",
    deliverable: "Recovered-customer LTV cohort snapshot",
  },
  {
    week: 4,
    title: "Iteration backlog: weakest step rewrite",
    action:
      "Take the weakest-attributed step from the Day-14 / Day-21 readouts and put it in the iteration backlog. Schedule the rewrite for the next 7-14 days with explicit owner + design + copy + ops leads assigned.",
    deliverable: "Iteration backlog doc + owner assigned + timeline",
  },
  {
    week: 4,
    title: "Iteration backlog: cadence test (3-email vs 4-email)",
    action:
      "Run a 50/50 split test on cadence: 3 emails + 2 SMS (control, calculator default) vs 4 emails + 2 SMS (test). Monitor for 14 days, then promote the winner to the live flow. Cap the test at 14 days to keep the readout statistically clean.",
    deliverable: "Cadence-split test plan + 14-day readout scheduled",
  },
  {
    week: 4,
    title: "Iteration backlog: subject-line A/B test",
    action:
      "Run a 50/50 split test on email #1's subject line: brand + product reference vs brand + time-bound urgency. Validate via Klaviyo's built-in A/B reporter over 14 days; promote the winner.",
    deliverable: "Subject-line A/B plan + 14-day readout scheduled",
  },
  {
    week: 4,
    title: "Final 30-day readout: ROI ratio + net revenue + per-step attribution",
    action:
      "Compile the trailing-30-day final readout: recovered orders / recovered revenue / total send cost / net revenue / ROI ratio, plus per-email + per-SMS attributed revenue split. Compare against the calculator's projection; flag any gap > 20%.",
    deliverable: "Final 30-day readout doc + on-brand summary for the team",
  },
  {
    week: 4,
    title: "Program readout: locked cadence + next-quarter roadmap",
    action:
      "Commit the cadence to the live flow. Write a 1-page next-quarter roadmap covering the cadence-split test, subject-line A/B test results, and any additional moves (e.g. move-to-JSON-LD-on-cart-page or move-to-Klaviyo-AI-recommendations). Distribute to the team channel.",
    deliverable: "Next-quarter roadmap + signed-off cadence commit",
  },
];

/** Build the canonical AbandonedCartLaunchPlanPayload. */
export function buildAbandonedCartLaunchPlan(opts?: {
  inputs?: Partial<AbandonedCartInputs>;
  startDate?: string;
}): AbandonedCartLaunchPlanPayload {
  const inputs: AbandonedCartInputs = {
    ...ABANDONED_CART_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as AbandonedCartInputs;

  const yourStore = loadYourStore();

  const forecast = forecastAbandonedCart(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: AbandonedCartLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
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

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function abandonedCartPlanDayDate(
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
export function abandonedCartPlanToMarkdown(
  plan: AbandonedCartLaunchPlanPayload
): string {
  const roiRatio = plan.forecast.roiRatio;
  const roiStr = Number.isFinite(roiRatio)
    ? `${roiRatio.toFixed(1)}×`
    : roiRatio > 0
      ? "∞"
      : "—";

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(
        2
      )} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(
        plan.yourStore.grossMargin * 100
      ).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# Abandoned-Cart Launch Plan — ${plan.startDate}`,
    "",
    "> Move #1 — always-on Abandoned-Cart (3-email + 2-SMS Klaviyo + Postscript). Same math as `scripts/abandoned_cart_roi.py`.",
    "",
    `## Snapshot`,
    "",
    `- **Verdict:** ${plan.forecast.healthBand}`,
    `- **ROI ratio:** ${roiStr} (recovered revenue / total send cost)`,
    `- **Recovered orders / month:** ${plan.forecast.recoveredOrdersPerMonth.toFixed(1)}`,
    `- **Recovered revenue / month:** $${plan.forecast.recoveredRevenuePerMonth.toFixed(
      2
    )}`,
    `- **Total send cost / month:** $${plan.forecast.totalSendCostPerMonth.toFixed(
      2
    )}`,
    `- **Net revenue / month:** $${plan.forecast.netRevenuePerMonth.toFixed(
      2
    )}`,
    yourStoreLine.trim(),
    `## 30-day checklist`,
    "",
  ];

  for (const d of plan.days) {
    const dayDate = abandonedCartPlanDayDate(plan.startDate, d.day);
    lines.push(
      `### Day ${d.day} — ${dayDate} — ${d.title}`,
      "",
      `- [ ] **Action:** ${d.action}`,
      "",
      `- [ ] **Deliverable:** ${d.deliverable}`,
      ""
    );
  }

  lines.push(
    "_Generated by Ecommerce Ops dashboard · /abandoned-cart-launch-plan · Move #1 always-on Abandoned-Cart._"
  );

  return lines.join("\n");
}
