/**
 * `loyalty-launch-plan.ts` — Pure generator for the 30-day Loyalty Program
 * (Smile.io / Yotpo Loyalty / LoyaltyLion) launch plan.
 *
 * Reads the operator's saved LoyaltyInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — App install, points/tiers/referrals config, suppression
 *                       import, Klaviyo webhook + Triple Whale cohort overlay
 *   W2 (Days 8–14)  — 6-touch launch sequence build (3 emails + 3 SMS),
 *                       on-site widget, post-purchase page, account-page embed
 *   W3 (Days 15–21) — Soft-launch to 10% then ramp to 50%; enrollment-rate
 *                       and tier-progress check-ins
 *   W4 (Days 22–30) — 90-day repeat-rate readout, loyalty-cohort revenue
 *                       readout, iteration backlog (mechanic tuning + bonus
 *                       calibration + referral program tuning), 30-day
 *                       program readout with the team's Q2 priorities
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The plan
 * also surfaces a one-line health snapshot (verdict + ROI ratio + net
 * revenue / month + payback months) so when the plan is shared in a
 * standup, the team sees "what does this look like" without opening the
 * playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { LoyaltyInputs } from "@/lib/loyalty-roi";
import {
  LOYALTY_DEFAULTS,
  forecastLoyalty,
} from "@/lib/loyalty-roi";
import { loadYourStore } from "@/lib/your-store";

export interface LoyaltyLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface LoyaltyLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: LoyaltyInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastLoyalty>;
  days: LoyaltyLaunchPlanDay[];
}

const PLAN_DAYS: Omit<LoyaltyLaunchPlanDay, "day">[] = [
  // --- Week 1 — App install, points + tiers config, webhooks ---------------
  {
    week: 1,
    title: "Audit the trailing 90-day repeat-purchase baseline",
    action:
      "Pull the trailing-90-day repeat-order count from Shopify / Triple Whale Starter (or Polar Analytics). Confirm the volume matches the calculator input (default = 5,000 existing customers · 25% baseline 90-day repeat rate). Save as the baseline so the +5 to +9 pts lift the playbook forecasts is measured against a real number, not aspirational.",
    deliverable:
      "Baseline repeat-rate CSV exported (date / customer_id / AOV / days_to_repeat)",
  },
  {
    week: 1,
    title: "Pick the loyalty app (Smile.io / Yotpo Loyalty / LoyaltyLion)",
    action:
      "Decide the app per the playbook's 5-row matrix. Default for a Shopify SMB is Smile.io Growth $249/mo. Yotpo Loyalty if already on Yotpo Reviews. LoyaltyLion for non-Shopify or if RFM segmentation is the priority. Document the chosen path + monthly cost in the calculator's `programCostMonthly` field so the plan snapshot reflects reality.",
    deliverable:
      "App-pick doc with monthly cost + the 3 integration touchpoints (Shopify · Klaviyo · Triple Whale)",
  },
  {
    week: 1,
    title: "Install the loyalty app on Shopify + run the 6-step onboarding",
    action:
      "Shopify → Apps → search Smile.io (or Yotpo / LoyaltyLion) → click Add app → approve permissions (read products, read orders, read customers, write customer metafields). Walk through Smile's 6-step onboarding wizard. Accept the defaults except Brand colors — match the site's primary + secondary so the on-site widget doesn't look bolted-on. Confirm Dashboard shows Connected to Shopify = ✅.",
    deliverable:
      "App installed, connected, brand colors matched, draft state (no live invites sent)",
  },
  {
    week: 1,
    title: "Configure points rules + VIP tiers + referral + birthday reward",
    action:
      "In Smile → Settings: Ways to earn → Place an order 1 pt per $1 · Create an account 100 pts · Birthday 200 pts · Refer a friend 500 pts referrer + 500 pts referee (≥$30 qualifying order). Ways to redeem → Discount 100 pts = $1 off · Free shipping 500 pts · Max redemption 50% of order value. Tiers → Insider (0+ pts) / VIP (500+ lifetime pts OR 3+ orders · 1.25× multiplier · free standard shipping) / Elite (2,500+ lifetime pts OR 10+ orders · 1.5× multiplier · free express shipping + dedicated support).",
    deliverable:
      "Points/tiers/referral config screenshot + per-tier benefit table signed off",
  },
  {
    week: 1,
    title: "Wire Klaviyo webhooks (the critical integration step)",
    action:
      "In Smile → Integrations → Klaviyo: enable webhook for points-earned · tier-up · referral-success · birthday-reward. Verify each event lands in Klaviyo as a custom metric + profile property (Customer → profile → properties → smile_points_balance). Then add the 4 webhooks to the Klaviyo flow-builder as profile-property triggers so tier-up fires the right email + SMS touch.",
    deliverable:
      "Klaviyo webhook integration verified end-to-end (test event in profile properties)",
  },
  {
    week: 1,
    title: "Connect Triple Whale Starter (or Polar) cohort overlay",
    action:
      "Triple Whale → Cohorts → New cohort → name 'Loyalty Members' → filter customers where smile_points_balance > 0 OR smile_tier ∈ (VIP, Elite). Confirm the cohort re-syncs nightly and shows up in the dashboard as a distinct revenue line. Without this, the +5 to +9 pts repeat-rate lift cannot be attributed to the loyalty program vs. the welcome series / SMS work.",
    deliverable:
      "Loyalty Members cohort created in Triple Whale, dashboard shows separate revenue line",
  },
  {
    week: 1,
    title: "Lock the success metric + horizon + measurement cadence",
    action:
      "Decide the 30-day success metric: net revenue / month (incremental - program cost - email/SMS overhead). Capture the ROI ratio + payback months from the calculator as the readout targets. Lock the cadence: daily enrollment-rate check, weekly tier-progress check, 30-day repeat-rate readout. Confirm with the team before launch so the post-launch readouts have a target.",
    deliverable:
      "Metric + horizon doc signed off · readout cadence locked with the team",
  },

  // --- Week 2 — 6-touch launch sequence, on-site + post-purchase embed ----
  {
    week: 2,
    title: "Build the 6-touch launch sequence in Klaviyo (3 emails + 3 SMS)",
    action:
      "Klaviyo → Flows → Create 'Loyalty Launch' → trigger = Profile property 'smile_points_balance' first set · 6 touches over 14 days · Email 1 (Day 0 — welcome to the program) · SMS 1 (Day 1 — show 100 pts signup bonus) · Email 2 (Day 4 — how points work + 500 pts = $5 reward) · SMS 2 (Day 7 — first-tier progress reminder) · Email 3 (Day 10 — VIP-tier unlock criteria + social proof) · SMS 3 (Day 14 — birthday + referral bonus reminder). Suppress converters + recent unsubscribers per playbook 01.",
    deliverable:
      "6-touch launch flow built in Klaviyo, in draft state, with all 6 touchpoints QA-reviewed",
  },
  {
    week: 2,
    title: "Ship the on-site loyalty widget (header + PDP + cart drawer)",
    action:
      "Smile → Onsite → enable the launcher widget. Position: header-right (or a floating action button on mobile). Show points balance when the customer is logged in; show 'Join the program' CTA when logged-out. Add the same widget to the PDP (under price) and the cart drawer (above the checkout button). Brand-color match confirmed on mobile + desktop breakpoints.",
    deliverable:
      "On-site widget live on header · PDP · cart drawer · mobile + desktop QA screenshots",
  },
  {
    week: 2,
    title: "Wire the post-purchase page loyalty enrollment CTA",
    action:
      "Shopify → Settings → Checkout → Post-purchase page → add the loyalty app's post-purchase block. Default copy: 'You earned [N] points on this order. Join the program to start redeeming — first-time members get a 100-pt signup bonus.' Set the CTA to open the loyalty widget in a side panel. Confirm the post-purchase page renders on mobile + desktop.",
    deliverable:
      "Post-purchase page loyalty CTA live, mobile + desktop verified",
  },
  {
    week: 2,
    title: "Add the account-page loyalty widget (points balance + tier progress)",
    action:
      "Smile → Onsite → enable the account-page widget. Position: top of /account · under /account/orders. Show points balance, tier name, progress bar to next tier, referral link. Brand-color match + responsive QA across breakpoints. The account page is the highest-intent touchpoint for repeat visits — make sure the loyalty widget is the first thing a returning customer sees.",
    deliverable:
      "Account-page loyalty widget live with points balance + tier-progress bar",
  },
  {
    week: 2,
    title: "Wire the Klaviyo welcome-series tie-in (Email 5 = loyalty enrollment)",
    action:
      "Klaviyo → Welcome Series flow → add a new Email 5 at Day 7: 'You're invited to [Brand]'s Loyalty Program — 100 pts signup bonus'. CTA → loyalty program landing page. Suppression: do not send to customers who already have smile_points_balance > 0. This ties the welcome series (playbook 04) to the loyalty enrollment so every new customer gets one consistent CTA to enroll.",
    deliverable:
      "Welcome Email 5 loyalty CTA live, suppression rule wired",
  },
  {
    week: 2,
    title: "Build the win-back flow for non-enrolled 30-day customers",
    action:
      "Klaviyo → Flows → Create 'Loyalty Win-back' → trigger = Placed order ≥ 1 time AND smile_points_balance = 0 AND last_order ≥ 30 days ago. 3-touch sequence over 10 days · Email 1 (Day 0 — you missed 100 pts signup bonus, expires in 7 days) · SMS 1 (Day 4 — last chance, +200 pts bonus if enrolled today) · Email 2 (Day 10 — final reminder, bonus expires). Suppression: enrolled + recently unsubscribed.",
    deliverable:
      "3-touch win-back flow built in Klaviyo, suppression wired",
  },
  {
    week: 2,
    title: "Pre-launch flow design + brand voice QA",
    action:
      "Open every Klaviyo flow + the on-site widget + the post-purchase page on mobile + desktop. Check brand voice matches the rest of the marketing (no 'Dear Valued Customer' from a Gen-Z brand; no '💖 slay bestie' from a Luxury brand). Verify all links resolve, all images load, all unsubscribe links work. Have at least 1 teammate not on the launch team QA each touchpoint.",
    deliverable:
      "Pre-launch QA sign-off doc with screenshots from mobile + desktop for every touchpoint",
  },

  // --- Week 3 — Soft-launch + ramp + enrollment readouts --------------------
  {
    week: 3,
    title: "Soft-launch to 10% of new customers (D-1 enrollment-rate baseline)",
    action:
      "In Smile → Settings → Customer segmentation → enable the launch flow for 10% of new customers (randomized, exclude top-100 existing customers for the soft launch). Capture D-1 enrollment-rate baseline: total enrolled / total customers targeted. The baseline becomes the floor for the 50% + 100% ramp success metrics. Document the soft-launch cohort in a tracking sheet for comparison.",
    deliverable:
      "Soft-launch 10% cohort enabled, D-1 baseline enrollment rate captured",
  },
  {
    week: 3,
    title: "D-7 soft-launch readout (enrollment rate + tier-progress check)",
    action:
      "Pull the 7-day post-soft-launch enrollment rate from Smile → Customers → Cohort filter (launch-cohort = enrolled). Compare against D-1 baseline + the calculator's 60% enrollment-rate target. If below 40%, investigate the post-purchase CTA + the on-site widget visibility. Capture the tier-progress distribution: how many at Insider vs VIP vs Elite (expect mostly Insider at D-7).",
    deliverable:
      "D-7 enrollment rate readout · tier-progress distribution chart",
  },
  {
    week: 3,
    title: "Ramp to 50% of new customers",
    action:
      "If D-7 enrollment rate is on-track (≥40%): ramp the launch-cohort to 50% in Smile → Customer segmentation. If below 40%: pause the ramp, fix the post-purchase CTA + widget visibility, then re-test at 10% for another 7 days. Document the ramp decision in the tracking sheet — the team needs to know the program is shipping or paused.",
    deliverable:
      "50% ramp decision documented (or pause + iterate decision with fix list)",
  },
  {
    week: 3,
    title: "D-14 readout (tier-progress + first repeat orders from loyalty cohort)",
    action:
      "Pull D-14 enrollment rate + tier-progress + first-repeat-order count from the loyalty cohort (Triple Whale Starter → Loyalty Members cohort). Compare first-repeat-order rate vs the calculator's projected repeat-rate lift. If first-repeat-order rate is tracking +5 to +9 pts vs baseline, the program is on pace. If not, check the points/tier thresholds — too aggressive thresholds delay tier-up and erode perceived value.",
    deliverable:
      "D-14 readout · first-repeat-order rate vs projected +5-9 pts lift",
  },
  {
    week: 3,
    title: "Ramp to 100% (full launch) if D-14 is on-track",
    action:
      "If D-14 readout is on-track: ramp the launch-cohort to 100% — every new customer from this point forward gets the 6-touch launch sequence + on-site widget + post-purchase CTA + account-page widget. If D-14 is below the +5-9 pts repeat-rate target: pause at 50%, run an iteration sprint (tier-threshold tuning + bonus calibration), then re-launch.",
    deliverable:
      "100% full-launch decision documented (or 50% pause + iteration sprint decision)",
  },
  {
    week: 3,
    title: "Triple Whale cohort-overlay sanity check",
    action:
      "Triple Whale → Cohorts → Loyalty Members → confirm the cohort is re-syncing nightly + the revenue line is increasing. Cross-check against the calculator's projected loyaltyCohortPctOfRevenue (default = ~15%). If cohort revenue share is below 5% at D-21, the cohort overlay is misconfigured or the repeat-rate lift hasn't compounded yet — wait another 14 days.",
    deliverable:
      "Cohort-overlay revenue share chart (vs the projected 15% by months 3-6)",
  },
  {
    week: 3,
    title: "Customer support briefing (5 most common loyalty questions)",
    action:
      "Brief the support team on the 5 most common loyalty questions: (1) 'where do I see my points?' → account page; (2) 'do points expire?' → no, per the playbook default; (3) 'can I combine with a discount code?' → one reward per order, configurable; (4) 'what counts as a qualifying purchase?' → post-discount, pre-tax subtotal; (5) 'how does the VIP tier work?' → 500 pts OR 3 orders = VIP, 2500 pts OR 10 orders = Elite. Make sure at least 1 agent knows how to look up + manually adjust points.",
    deliverable:
      "Support team briefing doc + agent acknowledgment + a quick-reference card",
  },

  // --- Week 4 — Readouts, iteration, program readout ------------------------
  {
    week: 4,
    title: "D-21 readout (enrollment-rate plateau + repeat-rate trend)",
    action:
      "Pull the D-21 enrollment rate + 30-day repeat-rate from the loyalty cohort. Compare against the calculator's projected repeat-rate lift. By D-21, the enrollment rate should be plateauing at ~60% (the calculator default). If enrollment is still climbing past 60%, the launch sequence is over-converting (consider tightening to engaged customers only). Document the D-21 numbers in the program's tracking sheet.",
    deliverable:
      "D-21 readout · enrollment-rate plateau chart · 30-day repeat-rate trend",
  },
  {
    week: 4,
    title: "D-25 readout (90-day repeat rate proxy + tier distribution)",
    action:
      "Pull the 90-day repeat-rate proxy (use a 60-90 day window for the soft-launch cohort, since they're 25 days in). Compare against the calculator's projected 30-36% loyalty 90-day repeat rate. Tier distribution should be ~75% Insider / ~20% VIP / ~5% Elite at this point (rough — depends on AOV and order frequency). Document the tier distribution and any tier-promotion patterns.",
    deliverable:
      "D-25 readout · 90-day repeat-rate proxy · tier distribution chart",
  },
  {
    week: 4,
    title: "Net revenue + payback-month readout",
    action:
      "Pull the net revenue / month from the loyalty cohort + program cost + overhead. Compute payback months = program cost / net revenue. Compare against the calculator's projected payback months (default ~0.04 months at the canonical defaults — i.e. the program pays for itself in days, not months). If payback months > 2, the program is over-built for the current customer base — consider trimming the program-cost or boosting enrollment.",
    deliverable:
      "Payback-month readout · net revenue / month chart · cost-trim recommendation",
  },
  {
    week: 4,
    title: "Iteration backlog (mechanic tuning + bonus calibration + referral)",
    action:
      "Build the iteration backlog based on the D-21 / D-25 / payback readouts. Common items: (a) tier threshold tuning — too high = no VIPs, too low = everyone is Elite, the points value erodes; (b) bonus calibration — referral 500 pts might be too low for the brand's AOV (consider 1000 pts = $10); (c) on-site widget visibility — A/B test the launcher position; (d) launch-sequence cadence — too many touches in 14 days might fatigue customers, consider stretching to 21 days.",
    deliverable:
      "Iteration backlog doc · prioritization (HIGH / MED / LOW) · owner assigned per item",
  },
  {
    week: 4,
    title: "Cross-feature readiness check (Klaviyo · Postscript · Smile · Triple Whale)",
    action:
      "Verify the full integration matrix is healthy: Klaviyo webhooks still firing · Postscript SMS touches still delivering · Smile dashboard still connected · Triple Whale cohort still re-syncing nightly. Run a test event through each integration (e.g. make a $5 test order, verify points land in Klaviyo + tier shows in Triple Whale). If any integration is broken, fix before the 30-day readout — broken integrations compound the attribution problem.",
    deliverable:
      "Cross-feature readiness sign-off · test-event screenshots for each integration",
  },
  {
    week: 4,
    title: "Q2 loyalty-program priorities (referral push · birthday campaign · tier expansion)",
    action:
      "Based on the 30-day readouts, propose the Q2 loyalty-program priorities. Typical items: (a) referral push — add a 'give $10 / get $10' bonus for 30 days to spike referrals; (b) birthday campaign — wire the birthday-reward SMS via Postscript for a 30% open-rate boost; (c) tier expansion — if Insider → VIP conversion is healthy at D-21, consider adding a Platinum tier at 5,000+ pts; (d) integration with the SMS welcome series (playbook 06) to enroll SMS-engaged customers at a higher rate.",
    deliverable:
      "Q2 priorities doc · 3 priorities with owners + target metrics + 30-day success criteria",
  },
  {
    week: 4,
    title: "30-day program readout (deck-ready summary)",
    action:
      "Build the 30-day program readout in 1 page: snapshot (verdict · ROI ratio · net revenue / month · payback months) · enrollment-rate trend chart · 90-day repeat-rate trend · tier distribution · iteration backlog summary · Q2 priorities · 1 ask for the team. This is the artifact the founder/CEO sees in the all-hands. Save as a deck-ready doc (Notion / Google Slides / Loom).",
    deliverable:
      "1-page 30-day readout deck · shared with founder/CEO · archived in the team's drive",
  },
];

/**
 * Build the 30-day launch plan from the operator's saved loyalty inputs.
 * Falls back to the canonical 5,000 customers / $75 AOV / 25% baseline /
 * +7 pts lift / 60% enrollment / $249/mo Smile Growth / $60/mo overhead
 * defaults if no inputs are supplied.
 *
 * Reads Your-store from localStorage via `loadYourStore()`; if absent,
 * `yourStore` is null and the snapshot uses only the loyalty inputs.
 */
export function buildLoyaltyLaunchPlan(opts?: {
  inputs?: Partial<LoyaltyInputs>;
  startDate?: string;
}): LoyaltyLaunchPlanPayload {
  const inputs: LoyaltyInputs = { ...LOYALTY_DEFAULTS, ...(opts?.inputs ?? {}) };
  const yourStore = loadYourStore();
  const forecast = forecastLoyalty(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: LoyaltyLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
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
export function loyaltyPlanDayDate(
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
export function loyaltyPlanToMarkdown(
  plan: LoyaltyLaunchPlanPayload
): string {
  const roi = plan.forecast.netPerProgramDollar;
  const roiStr = !Number.isFinite(roi)
    ? roi > 0
      ? "∞:1"
      : "—"
    : Math.abs(roi) >= 100
      ? `${roi.toFixed(0)}:1`
      : `${roi.toFixed(2)}:1`;

  const paybackStr = !Number.isFinite(plan.forecast.paybackMonths)
    ? "—"
    : plan.forecast.paybackMonths < 0.1
      ? "<0.1 mo (immediate)"
      : `${plan.forecast.paybackMonths.toFixed(1)} mo`;

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(
        2
      )} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(
        plan.yourStore.grossMargin * 100
      ).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# Loyalty Program Launch Plan — ${plan.startDate}`,
    "",
    "> Move #8 — always-on Loyalty Program (Smile.io / Yotpo Loyalty / LoyaltyLion) with 3-tier VIP mechanics + 6-touch launch sequence + Triple Whale cohort overlay. Same math as `scripts/loyalty_roi_unit_economics.py` (canonical playbook 07 math).",
    "",
    `## Snapshot`,
    "",
    `- **Verdict:** ${plan.forecast.healthBand}`,
    `- **Net revenue / month:** $${plan.forecast.netRevenueMonthly.toFixed(
      2
    )}`,
    `- **Net per $1 of program cost:** ${roiStr}`,
    `- **Payback months:** ${paybackStr}`,
    `- **Total incremental revenue / month:** $${plan.forecast.totalIncrementalMonthly.toFixed(
      2
    )}`,
    `- **Loyalty cohort share of revenue:** ${(
      plan.forecast.loyaltyCohortPctOfRevenue * 100
    ).toFixed(1)}%`,
    `- **Enrolled customers (steady state):** ${Math.round(
      plan.forecast.enrolledCustomers
    ).toLocaleString()}`,
    yourStoreLine.trim(),
    `## 30-day checklist`,
    "",
  ];

  for (const d of plan.days) {
    const dayDate = loyaltyPlanDayDate(plan.startDate, d.day);
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
    "_Generated by Ecommerce Ops dashboard · /loyalty-launch-plan · Move #8 always-on Loyalty Program._"
  );

  return lines.join("\n");
}
