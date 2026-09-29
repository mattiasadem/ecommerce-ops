/**
 * `post-purchase-upsell-launch-plan.ts` — Pure generator for the 30-day
 * Post-Purchase One-Click Upsell (ReConvert / AfterSell / Bold) launch plan.
 *
 * Reads the operator's saved PostPurchaseUpsellInputs from localStorage (via
 * the component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Tool pick, offer design, audience + product segmentation,
 *                      analytics wiring, suppression, soft-launch threshold
 *   W2 (Days 8–14)  — Page build (headline + offer card + CTA), creative +
 *                      copy QA, attribution events, A/B on offer headline
 *   W3 (Days 15–21) — Soft-launch to 10%, ramp to 50% then 100%, Day-1/7/14
 *                      readouts (acceptance rate, AOV lift, margin, ROI ratio)
 *   W4 (Days 22–30) — Day-21/25/30 readouts (acceptance-rate by offer,
 *                      AOV-band breakdown, repeat-buyer behavior), iteration
 *                      backlog, final 30-day program readout
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The plan
 * also surfaces a one-line health snapshot (verdict + ROI ratio + incremental
 * margin/month + AOV lift %) so when the plan is shared in a standup, the
 * team sees "what does this look like" without opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { PostPurchaseUpsellInputs } from "@/lib/post-purchase-upsell-roi";
import {
  POST_PURCHASE_UPSELL_DEFAULTS,
  forecastPostPurchaseUpsell,
} from "@/lib/post-purchase-upsell-roi";
import { loadYourStore } from "@/lib/your-store";

export interface PostPurchaseUpsellLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface PostPurchaseUpsellLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: PostPurchaseUpsellInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  forecast: ReturnType<typeof forecastPostPurchaseUpsell>;
  days: PostPurchaseUpsellLaunchPlanDay[];
}

const PLAN_DAYS: Omit<PostPurchaseUpsellLaunchPlanDay, "day">[] = [
  // --- Week 1 — Tool pick, offer design, segmentation, instrumentation -----
  {
    week: 1,
    title: "Pick the upsell tool (ReConvert / AfterSell / Bold)",
    action:
      "Decide on ReConvert vs AfterSell vs Bold based on the platform (Shopify / Shopify Plus / WooCommerce / BigCommerce), the upsell app's flat-fee-vs-revenue-share pricing, and your existing Klaviyo + Triple Whale stack. Confirm Growth-tier pricing covers monthly order volume. Add the admin user, billing, and SSO.",
    deliverable:
      "Upsell tool is live · Growth-tier invoice approved · admin user added",
  },
  {
    week: 1,
    title: "Pull trailing-30-day baseline order metrics",
    action:
      "Export the trailing-30-day orders/month, base AOV, and product-category mix from Shopify + your analytics source. Confirm the volume matches the calculator input (default = 1,000/mo). Save as the baseline so the incremental revenue you forecast against is real, not aspirational.",
    deliverable:
      "Baseline CSV exported (date / order_id / AOV / category / buyer)",
  },
  {
    week: 1,
    title: "Decide the offer: single-product vs bundle vs subscription",
    action:
      "Pick the offer format. Single-product upsell is the easiest to QA (10–20% acceptance per ReConvert/AfterSell case studies). Bundle upsell requires inventory synchronization. Subscription upsell (e.g. ReConvert Subscriptions) requires a separate retention strategy. Document the chosen format and the rationale.",
    deliverable: "Offer-format doc signed off with rationale + expected acceptance band",
  },
  {
    week: 1,
    title: "Pick the offer product (margin-weighted, in-stock, complementary)",
    action:
      "Choose the offer SKU(s). Validate: (a) gross margin ≥ 50% (calculator's default is 70%), (b) stock > 2× expected monthly upsell units, (c) complementary to the original-order product (not a substitute), (d) average review rating ≥ 4.3 stars. Avoid offering the same product the customer just bought (substitute risk).",
    deliverable: "Offer-SKU shortlist doc (3 candidates ranked by margin × rating × stock)",
  },
  {
    week: 1,
    title: "Set acceptance-rate target by offer format",
    action:
      "Set the acceptance-rate target. Single-product default is 12–18% (calculator default = 15%). Bundle default is 6–10%. Subscription default is 3–6%. Document the chosen band + the health-band readouts (great ≥30:1, good ≥15:1, marginal ≥5:1, weak <5:1 — same as scripts/post_purchase_upsell_roi.py).",
    deliverable:
      "Acceptance-rate target doc with health-band thresholds + ramp schedule",
  },
  {
    week: 1,
    title: "Wire checkout → upsell → thank-you page instrumentation",
    action:
      "Confirm Shopify checkout_completed → ReConvert upsell_page_view → upsell_accept → thank_you_page event flow. Validate that Triple Whale / Segment / GA4 capture each event with the original order_id so the ROI ratio readout is comparable to other channels.",
    deliverable:
      "Triple Whale + Segment events verified end-to-end with order_id propagation",
  },
  {
    week: 1,
    title: "Pre-launch flow design + copy QA",
    action:
      "Walk the design + copy leads through the upsell-page skeleton. Confirm headline, offer-image, value-prop, CTA ('Add to my order' / 'Yes, upgrade my order'), and the decline CTA ('No thanks, continue to confirmation'). Validate the page renders correctly on mobile + desktop + dark mode.",
    deliverable: "Design + copy sign-off recorded across breakpoints",
  },

  // --- Week 2 — Page build, creative QA, attribution, A/B ------------------
  {
    week: 2,
    title: "Build the upsell page (headline + offer card + CTA)",
    action:
      "Implement the upsell page: dynamic offer-product block (image + title + price + savings), headline ('Add this to your order for $X'), sub-copy (1–2 sentences on why it complements the original order), primary CTA ('Yes, add it to my order'), and decline link ('No thanks'). Use the design system tokens — no one-off variants.",
    deliverable:
      "Upsell page published to staging, behind the upsell-app flag",
  },
  {
    week: 2,
    title: "Wire the offer-image + dynamic product fetch",
    action:
      "Confirm the offer-image + offer-title + offer-price blocks pull dynamically from the chosen SKU. If the SKU goes out-of-stock, the page should fall back to a secondary offer (already pre-loaded). Validate the dynamic block on 5+ different cart contents (different SKUs / quantities / bundles).",
    deliverable: "Dynamic product fetch verified on 5+ cart variations",
  },
  {
    week: 2,
    title: "Run a 24-hour QA across breakpoints + browsers",
    action:
      "Smoke-test on desktop + mobile (iOS Safari + Android Chrome), slow 3G + fibre, signed-in + guest, all major browsers. Confirm event firing, no console errors, no broken CTAs, the offer-image loads correctly, and the decline link returns to the thank-you page.",
    deliverable:
      "QA sign-off doc with screenshots of every breakpoint + cart variation",
  },
  {
    week: 2,
    title: "Wire Triple Whale / Segment / GA4 attribution events",
    action:
      "Confirm the upsell_accept event fires with: original order_id, original order AOV, upsell SKU, upsell price, upsell margin. Validate that the incremental_revenue and incremental_margin fields are correctly attributed to the upsell-app source in Triple Whale.",
    deliverable:
      "Triple Whale + Segment events verified end-to-end with order_id + SKU",
  },
  {
    week: 2,
    title: "Set up the live monitoring dashboard",
    action:
      "Pin a Triple Whale / Looker dashboard that shows upsell_accept_rate, upsell_units_per_month, incremental_revenue_per_month, incremental_margin_per_month, AOV lift %, and ROI ratio updated hourly. Add the link to the playbook doc.",
    deliverable: "Live upsell dashboard URL saved to playbook doc",
  },
  {
    week: 2,
    title: "Run a 50/50 A/B on offer headline (control vs urgency)",
    action:
      "Split the upsell-page headline 50/50: control ('Add this to your order for $X') vs urgency ('Limited stock — add this to your order for $X'). Validate via the upsell-app's built-in A/B reporter over 14 days; promote the winner. Cap at 14 days to keep the readout statistically clean.",
    deliverable: "Headline A/B plan + 14-day readout scheduled",
  },
  {
    week: 2,
    title: "Pre-launch checklist + go/no-go vote",
    action:
      "Run through the playbook pre-launch checklist with the analytics lead and the designer. Vote go or no-go. Document the outcome. Confirm suppression lists are wired (declined customers don't see the same upsell twice within 30 days).",
    deliverable: "Go/no-go vote doc with both sign-offs + suppression verified",
  },

  // --- Week 3 — Soft-launch + ramp + readouts ------------------------------
  {
    week: 3,
    title: "Soft-launch to 10% of orders + monitor for 24h",
    action:
      "Move the upsell page from draft to live. Set a 10% send-time condition (split by SHA-256 of order_id) so 1 in 10 orders sees the upsell. Monitor the upsell-app send queue, deliverability, and Triple Whale incremental_revenue attribution for 24h before ramping.",
    deliverable: "10% segment live + monitoring dashboard live",
  },
  {
    week: 3,
    title: "Ramp to 50% + monitor deliverability + decline-rate",
    action:
      "After 24h clean read at 10%, raise the condition to 50%. Monitor decline-rate (should stay < 90% — i.e. acceptance rate ≥ 10%), upsell-app error logs, and post-purchase complaints. If decline-rate > 95%, pause and audit headline + offer-image + CTA.",
    deliverable: "50% segment live + 24h read-clean",
  },
  {
    week: 3,
    title: "Ramp to 100% + freeze creative changes for 14 days",
    action:
      "After 24h clean read at 50%, raise to 100%. Communicate the launch in the team channel; freeze any headline / image / CTA / offer-SKU changes for 14 days so the readouts below are statistically clean.",
    deliverable: "100% segment live + freeze-policy doc signed off",
  },
  {
    week: 3,
    title: "Day-1 read: acceptance-rate + AOV lift per trail",
    action:
      "Pull the day-1 read from the upsell-app + Triple Whale: upsell_accept_rate, incremental_revenue_per_order, AOV lift %. Compare against the calculator's projected acceptance rate (default = 15%) and AOV lift (default = +6.6% at the canonical defaults).",
    deliverable: "Day-1 read recorded in the dashboard readout tab",
  },
  {
    week: 3,
    title: "Day-7 read: incremental margin + ROI ratio",
    action:
      "Pull the trailing-7-day incremental_margin from Triple Whale + the upsell-app. Compute the trailing-7-day ROI ratio (incremental_margin / platform_cost_per_order_total). Compare against the calculator's projected ratio (default = 35.7× great band).",
    deliverable: "Day-7 readout sheet (acceptance / margin / AOV lift / ROI)",
  },
  {
    week: 3,
    title: "Day-14 read: acceptance-rate vs breakeven + headline A/B winner",
    action:
      "Compare the trailing-14-day acceptance-rate against the calculator's breakeven (acceptance rate that produces ROI ≥ 5:1). Also pull the headline A/B results from the upsell-app — promote the winner, schedule a new test (A/B if applicable).",
    deliverable: "Acceptance-vs-breakeven comparison + headline A/B winner promoted",
  },

  // --- Week 4 — Final readouts + iteration backlog + 30-day readout --------
  {
    week: 4,
    title: "Day-21 read: acceptance-rate by offer-SKU",
    action:
      "Pull the trailing-21-day acceptance-rate sliced by offer-SKU. Identify the highest-acceptance offer (queue for 2nd-priority upsell page) and the lowest-acceptance offer (replace with the secondary offer pre-loaded in W2).",
    deliverable: "Per-SKU acceptance-rate matrix + replacement SKU queued",
  },
  {
    week: 4,
    title: "Day-21 read: AOV-band breakdown (top quartile vs median vs bottom)",
    action:
      "Slice the trailing-21-day upsell_accept data by AOV band (top quartile, median, bottom quartile). Validate that the upsell is converting hardest on the highest-AOV orders (which have the most absolute revenue per upsell) and identify whether the bottom-quartile AOV orders should see a lower-priced offer.",
    deliverable: "AOV-band acceptance-rate matrix",
  },
  {
    week: 4,
    title: "Day-21 read: subscription / repeat-buyer behavior",
    action:
      "Pull the trailing-21-day upsell_accept data sliced by repeat-buyer flag. Identify whether the upsell is converting new buyers, repeat buyers, or both. Adjust the offer-SKU if the split is off-target (e.g. new buyers convert on a lower-priced entry SKU).",
    deliverable: "Repeat-vs-new buyer acceptance-rate matrix",
  },
  {
    week: 4,
    title: "Day-25 read: complaint + refund trend",
    action:
      "Pull the trailing-25-day post-purchase complaint + refund rate for upsell orders (vs normal orders). If either is climbing vs baseline, audit the headline + offer-image + CTA + decline-link copy. Pause and rewrite the affected step if complaint rate > 0.3%.",
    deliverable: "Complaint + refund trend report + action threshold",
  },
  {
    week: 4,
    title: "Day-25 read: cohort persistence (upsell-accepted vs declined)",
    action:
      "Pull the trailing-25-day 'upsell-accepted' cohort and re-check 14-day retention. Identify whether customers who accepted the upsell subsequently placed a second order within 14 days vs customers who declined. This validates the upsell's LTV impact, not just first-order ROI.",
    deliverable: "Upsell-accepted-customer LTV cohort snapshot",
  },
  {
    week: 4,
    title: "Iteration backlog: weakest offer-SKU replacement",
    action:
      "Take the lowest-acceptance offer-SKU from the Day-21 readout and put it in the iteration backlog. Schedule the replacement for the next 7–14 days with explicit owner + design + copy + ops leads assigned.",
    deliverable:
      "Iteration backlog doc + replacement SKU owner assigned + timeline",
  },
  {
    week: 4,
    title: "Iteration backlog: 2nd-priority upsell page (cart total ≥ $X)",
    action:
      "Queue a 2nd-priority upsell page that fires only on carts ≥ $X (e.g. $100+ for apparel). Test single-A/B 90 days; promote if 2nd-priority ROI ratio > primary. Document in the iteration backlog.",
    deliverable: "2nd-priority upsell page spec + 90-day readout scheduled",
  },
  {
    week: 4,
    title: "Iteration backlog: bundle vs single-product A/B",
    action:
      "Run a 50/50 split test: single-product upsell (control, calculator default) vs bundle upsell (test). Monitor for 14 days, then promote the winner to the live upsell page. Cap the test at 14 days to keep the readout statistically clean.",
    deliverable: "Bundle-vs-single A/B plan + 14-day readout scheduled",
  },
  {
    week: 4,
    title: "Final 30-day readout: acceptance-rate + ROI ratio + AOV lift",
    action:
      "Compile the trailing-30-day final readout: upsell_accept_rate / upsell_units_per_month / incremental_revenue / incremental_margin / platform_cost / ROI ratio / AOV lift %. Compare against the calculator's projection; flag any gap > 20%.",
    deliverable:
      "Final 30-day readout doc + on-brand summary for the team",
  },
  {
    week: 4,
    title: "Program readout: locked offer + next-quarter roadmap",
    action:
      "Commit the offer + headline + creative to the live upsell page. Write a 1-page next-quarter roadmap covering the 2nd-priority upsell page, bundle-vs-single A/B results, and any additional moves (e.g. move-to-subscription-upsell or move-to-thank-you-page-upsell). Distribute to the team channel.",
    deliverable: "Next-quarter roadmap + signed-off offer + headline commit",
  },
];

/** Build the canonical PostPurchaseUpsellLaunchPlanPayload. */
export function buildPostPurchaseUpsellLaunchPlan(opts?: {
  inputs?: Partial<PostPurchaseUpsellInputs>;
  startDate?: string;
}): PostPurchaseUpsellLaunchPlanPayload {
  const inputs: PostPurchaseUpsellInputs = {
    ...POST_PURCHASE_UPSELL_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as PostPurchaseUpsellInputs;

  const yourStore = loadYourStore();

  const forecast = forecastPostPurchaseUpsell(inputs);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: PostPurchaseUpsellLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
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
export function postPurchaseUpsellPlanDayDate(
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
export function postPurchaseUpsellPlanToMarkdown(
  plan: PostPurchaseUpsellLaunchPlanPayload
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
    `# Post-Purchase Upsell Launch Plan — ${plan.startDate}`,
    "",
    "> Move #9.6 — always-on Post-Purchase One-Click Upsell (ReConvert / AfterSell / Bold). Same math as `scripts/post_purchase_upsell_roi.py`.",
    "",
    `## Snapshot`,
    "",
    `- **Verdict:** ${plan.forecast.healthBand}`,
    `- **ROI ratio:** ${roiStr} (incremental margin / platform cost)`,
    `- **Upsell units / month:** ${plan.forecast.upsellUnitsPerMonth.toFixed(1)}`,
    `- **Incremental revenue / month:** $${plan.forecast.incrementalRevenuePerMonth.toFixed(
      2
    )}`,
    `- **Incremental margin / month:** $${plan.forecast.incrementalMarginPerMonth.toFixed(
      2
    )}`,
    `- **New blended AOV:** $${plan.forecast.newBlendedAov.toFixed(
      2
    )} (+${(plan.forecast.aovLiftPct * 100).toFixed(2)}% AOV lift)`,
    yourStoreLine.trim(),
    `## 30-day checklist`,
    "",
  ];

  for (const d of plan.days) {
    const dayDate = postPurchaseUpsellPlanDayDate(plan.startDate, d.day);
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
    "_Generated by Ecommerce Ops dashboard · /post-purchase-upsell-launch-plan · Move #9.6 always-on Post-Purchase Upsell._"
  );

  return lines.join("\n");
}