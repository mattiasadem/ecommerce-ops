/**
 * `sms-welcome-cart-launch-plan.ts` — Pure generator for the 30-day
 * SMS Welcome + Cart-Abandon (Postscript) launch plan.
 *
 * Reads the operator's saved SmsWelcomeCartInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Opt-in sources + SMS-keyword setup, Postscript account + 10DLC
 *   W2 (Days 8–14)  — SMS-1 Welcome + SMS-2 Cart-Soft + SMS-3 Cart-Escalation + SMS-4 Review build
 *   W3 (Days 15–21) — Soft launch → 10% → 50% → 100% ramp + suppression reads
 *   W4 (Days 22–30) — CVR / recovery / discount / reviews-submitted readouts → iteration backlog
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (verdict + ROI ratio +
 * net revenue / month + reviews submitted / month) so when the plan is
 * shared in a standup, the team sees "what does this look like" without
 * opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { SmsWelcomeCartInputs } from "@/lib/sms-welcome-cart-roi";
import {
  SMS_WELCOME_CART_DEFAULTS,
  forecastSmsWelcomeCart,
} from "@/lib/sms-welcome-cart-roi";
import { loadYourStore } from "@/lib/your-store";

export interface SmsWelcomeCartLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface SmsWelcomeCartLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string;   // operator-pickable plan start (default = today)
  inputs: SmsWelcomeCartInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastSmsWelcomeCart>;
  days: SmsWelcomeCartLaunchPlanDay[];
}

const PLAN_DAYS: Omit<SmsWelcomeCartLaunchPlanDay, "day">[] = [
  // --- Week 1 — Opt-in sources, SMS-keyword setup, Postscript account ----
  {
    week: 1,
    title: "Audit current opt-in sources + 30-day SMS-keyword volume",
    action:
      "Pull the trailing-30-day SMS opt-in volume from each source: footer keyword, exit-intent popup, quiz completion, post-purchase SMS checkbox, in-person POS signup. Save the snapshot so the SMS-1 Welcome flow has a feeder baseline that matches the calculator's smsOptinsPerMonth input.",
    deliverable:
      "SMS-opt-in source ledger CSV exported (source / 30d volume / confirmed-opt-in rate)",
  },
  {
    week: 1,
    title: "Stand up Postscript account + 10DLC brand + campaign registration",
    action:
      "If Postscript isn't live, sign up + register your brand through 10DLC (US carriers require it for any SMS volume > 5/mo). Submit TCR brand + campaign registration at least 5 business days before the SMS-1 Welcome soft-launch so the carriers have vetted your throughput. Confirm the SMS sending number is provisioned and a test message lands in the inboxes of your QA team.",
    deliverable:
      "Postscript account live + 10DLC brand approved + campaign registered + QA send verified",
  },
  {
    week: 1,
    title: "Pick the SMS-1 + SMS-3 discount band (5% / 10% / 15%)",
    action:
      "Decide the welcome + cart-escalation discount. SMS-1 Welcome and SMS-3 Cart-Escalation carry the code; SMS-2 Cart-Soft and SMS-4 Review do not. Use the calculator's snapshot to validate that the discount band keeps the total net margin above zero — if the calculator shows totalNetRevenue going negative, drop the discount one band and re-forecast.",
    deliverable:
      "SMS-1 + SMS-3 discount decision doc with breakeven-CVR read from calculator",
  },
  {
    week: 1,
    title: "Wire the SMS opt-in flow into Klaviyo + Shopify",
    action:
      "Make sure every SMS opt-in source writes the explicit-consent timestamp + the keyword + the source URL into Klaviyo. TCPA compliance is non-negotiable: opt-in date / source / explicit-confirmation text must be in the profile. Confirm the Postscript ↔ Klaviyo two-way sync is active so unsubscribes propagate within 60 seconds.",
    deliverable:
      "SMS opt-in flow live on site + Klaviyo SMS consent property populated",
  },
  {
    week: 1,
    title: "Import the historical SMS-opt-in cohort",
    action:
      "Export the trailing-90-day explicit SMS opt-ins from Klaviyo and import into Postscript. Confirm opt-in date metadata is preserved so the welcome SMS timing is correct (5 min after opt-in, not 5 min after import).",
    deliverable:
      "Historical SMS cohort imported + verified in Postscript",
  },
  {
    week: 1,
    title: "Lock the 30-day success metric + horizon",
    action:
      "Decide the 30-day success metric: SMS-attributed orders × AOV × gross margin minus SMS send cost minus SMS-1/SMS-3 discount cost. Capture the ROI ratio + reviews-submitted-per-month readout cadence. Confirm the calculator's health-band thresholds (great >= 30:1, good >= 15:1) match what the team expects.",
    deliverable:
      "Metric + horizon doc signed off + readout cadence locked",
  },
  {
    week: 1,
    title: "Pre-launch copy + frequency QA",
    action:
      "Walk the design + copy leads through the 4-SMS skeleton. Confirm: each SMS is under 160 characters (single-segment), every SMS has the explicit opt-out footer ('Reply STOP to unsubscribe'), brand voice matches the rest of the lifecycle program, and frequency cap is set to 1 transactional + 1 marketing SMS per contact per 24h.",
    deliverable:
      "Design + copy sign-off recorded + frequency-cap policy doc",
  },

  // --- Week 2 — 4-SMS build + instrumentation ----------------------------
  {
    week: 2,
    title: "Build SMS-1 Welcome (5 min after explicit SMS opt-in)",
    action:
      "Create SMS-1 in Postscript: trigger = 'SMS consent received', delay = 5 min, copy = 1-2 sentences welcoming the customer + a clear CTA. SMS-1 carries the welcome discount code (decision from W1). Validate the dynamic discount code pulls the right value per contact.",
    deliverable:
      "SMS-1 built + Postscript preview + test contact verified",
  },
  {
    week: 2,
    title: "Build SMS-2 Cart-Abandon Soft (1h after cart start)",
    action:
      "Create SMS-2 in Postscript: trigger = 'Checkout Started', filter = 'SMS opted-in', delay = 1h, copy = soft reminder referencing the cart item + a clear 'complete your order' link. SMS-2 does NOT carry a discount — it's the gentle nudge. Confirm the dynamic cart link works on iOS + Android.",
    deliverable:
      "SMS-2 built + Postscript preview + dynamic cart link tested on iOS + Android",
  },
  {
    week: 2,
    title: "Build SMS-3 Cart-Abandon Escalation (24h after cart start)",
    action:
      "Create SMS-3 in Postscript: trigger = 'Checkout Started' (no purchase after 24h), delay = 24h, copy = last-chance framing + the escalation discount code (same code as SMS-1 by default — or a more aggressive one if the calculator projects weak recovery). Confirm the SMS doesn't fire if the customer already purchased or unsubscribed.",
    deliverable:
      "SMS-3 built + suppression verified (purchase + unsubscribe)",
  },
  {
    week: 2,
    title: "Build SMS-4 Post-Purchase Review Request (7d after fulfillment)",
    action:
      "Create SMS-4 in Postscript: trigger = 'Order fulfilled' (use Klaviyo webhook → Postscript), delay = 7d, copy = review request + a link to the review form (Judge.me / Yotpo / Stamped). SMS-4 does NOT carry a discount — review requests work better with a clean incentive (UGC value, not a coupon). Confirm the review value-per-submission input on the calculator reflects your brand's UGC economics.",
    deliverable:
      "SMS-4 built + review-submission funnel verified end-to-end",
  },
  {
    week: 2,
    title: "Wire Triple Whale / Polar / Segment attribution events",
    action:
      "Wire the Postscript 'SMS sent' / 'SMS clicked' / 'Placed Order' events into Triple Whale + Polar + Segment. Confirm SMS-attributed orders are captured with the original UTM source so the ROI ratio readout is comparable to email + paid channels.",
    deliverable:
      "Triple Whale + Polar events verified end-to-end on a test contact",
  },
  {
    week: 2,
    title: "Wire Klaviyo suppression: SMS-2/SMS-3 don't fire if email cart-recovery already converted",
    action:
      "Add a suppression rule: if a contact has 'Placed Order' event between SMS-2 fire time and SMS-3 fire time, suppress SMS-3. Same for SMS-1 if the contact already converted via the welcome-discount email. This prevents double-discounting and double-attributing the same order.",
    deliverable:
      "Suppression rules live + verified with two-cohort test send",
  },
  {
    week: 2,
    title: "QA across mobile carriers + spam-folder preview",
    action:
      "Send a test seed list (10 contacts across AT&T / Verizon / T-Mobile / Google Fi) through the full SMS flow at 5min / 1h / 24h / 7d. Verify deliverability on each carrier (not flagged spam), preview across iPhone Messages / Android Messages / Google Messages apps, confirm CTAs render with no broken links, and check that every SMS has the explicit STOP opt-out footer.",
    deliverable:
      "QA report recorded + sign-off from design + ops lead",
  },

  // --- Week 3 — Soft-launch + ramp + baseline reads ----------------------
  {
    week: 3,
    title: "Soft-launch SMS-1 Welcome to 10% of new SMS opt-ins",
    action:
      "Move SMS-1 from draft to live. Set a 10% send-time condition (split by SHA-256 of phone number) so 1 in 10 new SMS opt-ins receives the welcome SMS in the first week. Monitor Postscript send queues, deliverability, and Triple Whale SMS-attributed-revenue for 48h before ramping.",
    deliverable:
      "10% segment live for SMS-1 + monitoring dashboard live",
  },
  {
    week: 3,
    title: "Ramp SMS-1 to 50% + monitor deliverability + spam complaints",
    action:
      "After 48h clean read at 10%, raise the condition to 50%. Monitor spam-rate, unsubscribe-rate, post-purchase complaints. If complaints > 0.1%, pause and audit copy + opt-out footer. If unsubscribe-rate > 2% in the first week, audit the discount framing — too aggressive a discount drives one-time-buyer opt-outs.",
    deliverable:
      "50% segment live + 48h read-clean + deliverability doc",
  },
  {
    week: 3,
    title: "Ramp SMS-1 to 100% + soft-launch SMS-2 + SMS-3 to 10%",
    action:
      "After 48h clean read at 50%, raise SMS-1 to 100%. Soft-launch SMS-2 + SMS-3 to 10% of new cart-starts. Communicate the launch in the team channel; freeze any cadence / copy / discount changes for the next 14 days so the readouts in W4 are statistically clean.",
    deliverable:
      "SMS-1 at 100% + SMS-2/SMS-3 at 10% + freeze-policy doc signed off",
  },
  {
    week: 3,
    title: "Ramp SMS-2 + SMS-3 to 100% + soft-launch SMS-4",
    action:
      "After 48h clean read at 10% for SMS-2 + SMS-3, ramp to 100%. Soft-launch SMS-4 (review request) to 10% of fulfilled orders. Confirm the review-form link works on mobile (most reviews are submitted on phones).",
    deliverable:
      "SMS-2/SMS-3/SMS-4 all live + review-form link tested on mobile",
  },
  {
    week: 3,
    title: "D-7 baseline: SMS-1 conversion rate + SMS-1 + SMS-3 recovery rate",
    action:
      "Pull the trailing-7-day SMS-1 conversion rate (SMS-attributed first orders / SMS-1 deliveries) and the combined SMS-2 + SMS-3 cart recovery rate. Compare against the calculator's forecast. If SMS-1 conversion is materially below the calculator's firstPurchaseCvr × (1 + welcomeLiftPct), audit the welcome-discount code delivery.",
    deliverable:
      "D-7 baseline readout doc (SMS-1 CVR + cart recovery)",
  },
  {
    week: 3,
    title: "D-14 readout: SMS-4 review-submission rate",
    action:
      "Pull the trailing-14-day review-submission rate from SMS-4 (reviews submitted / SMS-4 deliveries). Compare against the calculator's reviewCvr input. If SMS-4 conversion is below the input, audit the SMS copy + the review-form friction — most reviews are abandoned because the form is too long, asks for photos upfront, or doesn't load on mobile.",
    deliverable:
      "D-14 readout doc (SMS-4 review CVR + form-friction audit)",
  },
  {
    week: 3,
    title: "Pre-W4 checkin: every SMS has correct opt-out footer + suppression",
    action:
      "Walk through every live SMS and confirm: (a) explicit 'Reply STOP to unsubscribe' footer, (b) opt-out propagation to Klaviyo < 60s, (c) double-conversion suppression between SMS-2/SMS-3 and the Klaviyo email cart-recovery flow, (d) no SMS fires if contact is SMS-opted-out at fire time.",
    deliverable:
      "Pre-W4 compliance audit + suppression check",
  },

  // --- Week 4 — Readouts + iteration backlog -----------------------------
  {
    week: 4,
    title: "D-21 readout: full SMS-attributed order + revenue per SMS",
    action:
      "Pull the trailing-21-day SMS-attributed order count + revenue + net margin + ROI ratio from Triple Whale + Postscript. Compare against the calculator's forecast at the same inputs. Identify the weakest SMS (lowest recovery or review-submission CVR) — this is the candidate for the iteration backlog.",
    deliverable:
      "D-21 readout doc + weakest-SMS identification",
  },
  {
    week: 4,
    title: "D-21 iteration: tighten SMS-2 + SMS-3 cadence based on actual cart-start latency",
    action:
      "If actual cart-start-to-SMS-2 latency is meaningfully different from 1h (e.g. 90% of carts are abandoned within 30 min or 4h), re-time the SMS-2 + SMS-3 fires. The calculator's cartRecoveryRate1 + cartRecoveryRate2 are best-fit to canonical mid-DTC cart-abandon latency curves — if your store has a different curve, the iteration is to retune, not to redo the calculator.",
    deliverable:
      "SMS-2 + SMS-3 cadence tuning doc with new send-time conditions",
  },
  {
    week: 4,
    title: "D-21 iteration: SMS-1 copy variants if first-purchase CVR is below forecast",
    action:
      "If SMS-1 attributed first-purchase CVR is below the calculator's baseline × (1 + welcomeLiftPct), A/B test SMS-1 copy variants: discount framing (code-first vs value-first), CTA (link vs reply-keyword), sender (brand name vs personal name). Run each variant for 7 days, pick the winner, freeze for 30 days.",
    deliverable:
      "SMS-1 A/B variant doc + winner selection",
  },
  {
    week: 4,
    title: "D-21 iteration: SMS-4 review-incentive tuning (UGC value vs coupon)",
    action:
      "If SMS-4 review-submission rate is below the calculator's reviewCvr input, audit the incentive model. Pure discount codes drive low-quality reviews (incentive-only reviewers). Try: UGC-feature-back (review-submitter gets featured on the PDP), loyalty-points-back (reviewers earn 50 points), or no-incentive with a friction-free 1-tap rating form.",
    deliverable:
      "SMS-4 incentive tuning doc + variant rollout plan",
  },
  {
    week: 4,
    title: "D-25 readout: SMS unsubscribe rate + spam complaint rate",
    action:
      "Pull the trailing-25-day unsubscribe rate + spam complaint rate from Postscript. Industry baseline: < 2% unsubscribe, < 0.1% spam complaints. If unsubscribe rate is > 2%, audit the discount framing + send cadence. If spam complaints > 0.1%, pause the affected SMS and audit the copy + the opt-in confirmation flow.",
    deliverable:
      "D-25 deliverability health doc",
  },
  {
    week: 4,
    title: "D-28 iteration: lock or rotate the discount band based on margin math",
    action:
      "Re-run the calculator with the trailing-28-day actuals. If the actual ROI ratio is below the calculator's projection, decide: (a) drop the SMS-1 + SMS-3 discount one band (10% → 5%), (b) increase the cart recovery rate via better SMS-2 copy + dynamic cart link, or (c) move some of the discount budget into a loyalty-points-back model.",
    deliverable:
      "D-28 discount-band decision doc with revised calculator snapshot",
  },
  {
    week: 4,
    title: "D-30 readout: full program ROI + reviews-submitted + 30-day readout to team",
    action:
      "Compile the trailing-30-day SMS program readout: orders attributed × AOV × gross margin minus SMS send cost minus SMS-1/SMS-3 discount cost. Surface: ROI ratio, net revenue / month, reviews submitted / month, cart recovery combined %, unsubscribe rate, spam complaint rate. Share in the team channel + product weekly.",
    deliverable:
      "D-30 program readout doc + team-channel share + iteration backlog (top 5)",
  },
  {
    week: 4,
    title: "Set the 60-day iteration roadmap",
    action:
      "Based on the D-30 readout, pick the top 3 highest-leverage iterations for the next 30 days. Common ones: tighten SMS-2/SMS-3 cadence based on actual cart-start latency, A/B test SMS-1 copy variants, add SMS-5 (replenishment) for consumable products, integrate with the loyalty program so SMS-driven purchases earn double points.",
    deliverable:
      "60-day iteration roadmap doc with prioritized backlog",
  },
  {
    week: 4,
    title: "Archive the plan + capture the iteration cadence",
    action:
      "Move the 30-day launch plan markdown to the team's playbook archive. Capture the iteration cadence: weekly SMS program review (every Monday), monthly ROI ratio re-forecast from the calculator, quarterly A/B test cadence (SMS-1 + SMS-2 + SMS-3). The 30-day plan is one-shot — the iteration cadence is the durable asset.",
    deliverable:
      "Plan archived + iteration cadence doc signed off",
  },
];

/**
 * Build the 30-day plan payload. Pure — no DOM, no localStorage side effects.
 *
 * - Reads the operator's saved SmsWelcomeCartInputs from `inputs` (when
 *   passed) and falls back to the canonical $1M-GMV DTC defaults.
 * - Overlays the Your-store AOV / monthly orders / gross margin from the
 *   shared `ecom-ops:your-store:v1` localStorage key (when present).
 * - Produces 30 day-checklist items (W1: 7, W2: 7, W3: 7, W4: 9) and a
 *   fresh forecast snapshot.
 */
export function buildSmsWelcomeCartLaunchPlan(opts?: {
  inputs?: Partial<SmsWelcomeCartInputs>;
  startDate?: string;
}): SmsWelcomeCartLaunchPlanPayload {
  const inputs: SmsWelcomeCartInputs = {
    ...SMS_WELCOME_CART_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as SmsWelcomeCartInputs;

  const yourStore = loadYourStore();

  const forecast = forecastSmsWelcomeCart(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: SmsWelcomeCartLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
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
export function smsWelcomeCartPlanDayDate(
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
export function smsWelcomeCartPlanToMarkdown(
  plan: SmsWelcomeCartLaunchPlanPayload
): string {
  const roiRatio = plan.forecast.roiRatio;
  const roiStr = Number.isFinite(roiRatio)
    ? `${roiRatio.toFixed(1)}×`
    : roiRatio > 0
      ? "∞"
      : "—";

  const verdict = plan.forecast.healthBand;

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(2)} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(plan.yourStore.grossMargin * 100).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# SMS Welcome + Cart-Abandon Launch Plan — ${plan.startDate}`,
    "",
    "> Move #6 — always-on SMS Welcome + Cart-Abandon (Postscript). Same math as `/sms-welcome-cart-roi` calculator (browser port of canonical benchmarks from `playbooks/06-sms-welcome-and-cart-abandon.md`).",
    yourStoreLine.trim() ? yourStoreLine : "",
    "",
    `## Snapshot`,
    "",
    `- **Verdict:** ${verdict}`,
    `- **ROI ratio:** ${roiStr} (net margin / total SMS send cost)`,
    `- **Total orders / month:** ${Math.round(plan.forecast.totalOrders).toLocaleString()}`,
    `- **Total net revenue / month:** $${Math.round(plan.forecast.totalNetRevenue).toLocaleString()}`,
    `- **Cart recovery combined:** ${(plan.forecast.cartRecoveryCombinedPct * 100).toFixed(2)}% (SMS-2 + SMS-3 / carts)`,
    `- **Reviews submitted / month:** ${Math.round(plan.forecast.reviewsSubmitted).toLocaleString()} (SMS-4 funnel)`,
    `- **Total discount cost / month:** $${Math.round(plan.forecast.totalDiscountCost).toLocaleString()} (SMS-1 + SMS-3)`,
    "",
  ].filter((l) => l !== "");

  // Day-by-day
  let lastWeek: number | null = null;
  for (const d of plan.days) {
    if (d.week !== lastWeek) {
      lines.push("");
      lines.push(`## Week ${d.week}`);
      lines.push("");
      lastWeek = d.week;
    }
    const dayDate = smsWelcomeCartPlanDayDate(plan.startDate, d.day);
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
    `_Generated by Ecommerce Ops dashboard · /sms-welcome-cart-launch-plan · Move #6 always-on SMS Welcome + Cart-Abandon._`
  );

  return lines.join("\n");
}