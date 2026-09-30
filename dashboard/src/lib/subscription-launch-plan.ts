/**
 * `subscription-launch-plan.ts` — Pure generator for the 30-day
 * Subscription Program launch plan (Move #11 — recurring-revenue + 2.0-3.5x
 * LTV-multiplier layer that US-centric Shopify-DTC brands implicitly defer).
 *
 * Reads the operator's saved SubscriptionInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders / gross
 * margin (when present), and produces a calendar-ready, day-by-day markdown
 * checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1-7)   - Path picker + Recharge/Skio/Bold/Stay AI/Appstle install + Subscribe-and-Save widget + Triple Whale cohort LTV wiring
 *   W2 (Days 8-14)  - Discount-tier matrix + Klaviyo welcome/SMS + dunning + customer portal + churn-saver
 *   W3 (Days 15-21) - Soft-launch to 10% then 50% then 100% ramp + per-platform subscriber-conversion readouts + smart-cancellation flow
 *   W4 (Days 22-30) - D-7 / D-14 / D-21 subscriber-LTV-multiplier readout + replenishment-cadence audit + winback + 30-day program readout
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (path verdict +
 * Year-1 ROI band + Year-1 incremental subscription revenue + Year-1 cost
 * stack + Year-1 subscriber count + LTV-multiplier band + smart-cancellation
 * recovery + dunning recovery + winback recovery + canonical build sequence)
 * so when the plan is shared in a standup, the team sees "what does this
 * look like" without opening the playbook.
 *
 * Pure - no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import {
  SUBSCRIPTION_DEFAULTS,
  SubscriptionInputs,
  recommendSubscriptionPath,
} from "@/lib/subscription";
import { loadYourStore } from "@/lib/your-store";

export interface SubscriptionLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface SubscriptionLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string;   // operator-pickable plan start (default = today)
  inputs: SubscriptionInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  recommendation: ReturnType<typeof recommendSubscriptionPath>;
  days: SubscriptionLaunchPlanDay[];
}

const PLAN_DAYS: Omit<SubscriptionLaunchPlanDay, "day">[] = [
  // --- Week 1 — Path picker + platform install + Subscribe-and-Save widget
  {
    week: 1,
    title: "Audit the consumables revenue share + 30-day repeat-purchase pattern",
    action:
      "Pull the trailing-30-day SKU and reorder-pattern from Shopify (or Triple Whale): which SKUs have a 30-120 day repeat-purchase cadence, what % of revenue is from those SKUs, what is the canonical hero-SKU repeat-purchase rate within 30-90 days. Save the snapshot so the W4 replenishment-cadence audit has a baseline that matches the calculator's consumablesRevenueSharePct input. The canonical deferral gate 'consumables < 30%' is enforced by the calculator.",
    deliverable:
      "SKU-consumables ledger CSV (SKU / 30d revenue / reorder-rate / hero-SKU-flag)",
  },
  {
    week: 1,
    title: "Confirm Move #1 + Move #4 + Move #6 + Move #8 prerequisites are live",
    action:
      "Verify Move #1 (abandoned-cart flow in Klaviyo), Move #4 (welcome series in Klaviyo), Move #6 (Triple Whale attribution), Move #8 (loyalty program in Smile.io) are all shipped before subscription-program launch. Without these, you cannot measure the subscriber-LTV-multiplier, the churn rate, or the 2x loyalty-points-on-subscription-orders incentive. STOP and ship the prereqs first if any are missing - the canonical deferral gate moves the program to Path A only if at least Move #1 is live.",
    deliverable:
      "Prereq matrix doc with Move #1/#4/#6/#8 status recorded + sign-off",
  },
  {
    week: 1,
    title: "Pick Path A / B / C from the calculator's verdict",
    action:
      "Open the Subscription-path calculator on /subscriptions and confirm the Path verdict matches your team reality. Path A = <$500k GMV + <1,000 subscribers + Appstle Starter $25-99/mo OR Recharge Starter $49/mo OR Bold Starter $49/mo (lean starter). Path B = $500k-$10M GMV + 1,000-10,000 subscribers + Recharge Plus $499/mo OR Stay AI Plus $299/mo (DEFAULT; canonical 8.3:1 Year-1 ROI). Path C = $10M+ GMV + 10,000+ subscribers + Recharge Enterprise $999+/mo OR Skio Enterprise $1,200/mo (with international-subscription-shipping for EU + UK + CA + AU + JP). The W2/W3 plan below re-shapes around your chosen path.",
    deliverable:
      "Path verdict recorded + platform pick + ops-lead sign-off",
  },
  {
    week: 1,
    title: "Install Recharge / Skio / Bold / Stay AI / Appstle / Seal / Loop on Shopify",
    action:
      "If Path A: install Appstle ($25-99/mo) OR Recharge Starter ($49/mo) OR Bold Starter ($49/mo) - Shopify-native only. If Path B: install Recharge Plus ($499/mo) OR Stay AI Plus ($299/mo) OR Bold Plus ($299/mo) - includes churn-saver + Klaviyo deep-integration + Smile.io loyalty-integration + LTV cohorts. If Path C: install Recharge Enterprise ($999+/mo) OR Skio Enterprise ($1,200/mo) - includes dedicated CSM + multi-warehouse + international-subscription-shipping + advanced churn-saver + AI cadencing + winback-AI. Confirm the billing connection (Stripe is Recharge default) is live and a test subscription cycle succeeds.",
    deliverable:
      "Platform installed + Stripe billing live + test subscription cycle verified",
  },
  {
    week: 1,
    title: "Configure the Subscribe-and-Save widget on every PDP + cart + collection",
    action:
      "Wire the canonical 5-discount-tier matrix [5% / 10% / 15% / 20% / 25% off depending on cadence: 30-day / 45-day / 60-day / 90-day / 120-day] from research/08 Pillar 1 into the widget. The default 60-day cadence = 15% off is canonical for personal care / oral care / household. Confirm the widget renders on desktop + mobile + collection-page + cart-page + PDP for the hero consumable SKUs. The widget copy must include the explicit 'cancel anytime' footer.",
    deliverable:
      "Subscribe-and-Save widget live on PDP + cart + collection + 5-tier discount matrix configured",
  },
  {
    week: 1,
    title: "Wire subscriber-cohort LTV into Triple Whale + Klaviyo + Smile.io",
    action:
      "Confirm the canonical Move #6 Triple Whale subscriber-cohort-LTV export is wired. The canonical subscriber-cohort-LTV-signal requires: (a) Triple Whale custom-property 'is_subscriber' with values true/false, (b) Klaviyo flow-branch on 'is_subscriber' for the subscription-welcome + replenishment-reminder + pause-reactivation + cancellation-confirmation + winback flows, (c) Smile.io 2x-points-on-subscription-orders integration. Without these, the 2.0-3.5x LTV-multiplier hypothesis cannot be validated.",
    deliverable:
      "Triple Whale + Klaviyo + Smile.io subscriber-cohort wiring verified end-to-end",
  },
  {
    week: 1,
    title: "Lock the 30-day success metric + horizon + readout cadence",
    action:
      "Decide the 30-day success metric: Year-1 ROI ratio (canonicalRoi from the recommendation). Capture the subscription-revenue-share target (% of US GMV), the year-1 subscriber-count target, and the LTV-multiplier target. Confirm the calculator's downgrade gates (AOV < $30 floor, hasSubscriberAttribution gate) match what the team expects. Lock a weekly Monday 09:00 UTC readout cadence for the 30-day run.",
    deliverable:
      "Metric + horizon doc signed off + readout cadence locked + downgrade gates acknowledged",
  },

  // --- Week 2 — Discount-tier matrix + Klaviyo welcome/SMS + dunning + customer portal + churn-saver
  {
    week: 2,
    title: "Configure customer portal + cancel-anytime + skip + change-frequency",
    action:
      "Wire the canonical customer portal per research/08 Pillar 3: (a) cancel-anytime with no-questions-asked option, (b) skip-next-shipment, (c) change-frequency (every 30/45/60/90/120 days), (d) change-product (swap to a different consumable SKU at the same price tier), (e) update-payment-method, (f) update-shipping-address. Confirm the portal is reachable from the order-confirmation email + the post-purchase account-page. Path B/C also expose pause-subscription (up to 90 days).",
    deliverable:
      "Customer portal live with cancel-anytime + skip + change-frequency + pause (Path B/C)",
  },
  {
    week: 2,
    title: "Wire the dunning-flow for failed payments (3-attempt cadence)",
    action:
      "Stand up the canonical 3-attempt dunning-flow per research/08 Pillar 3 recovering 50-70% of would-be subscription-renewals vs the canonical 1-attempt industry-baseline. Sequence: Day 0 = Stripe auto-retry + email 'card declined, update here' (Klaviyo). Day 3 = email + SMS retry. Day 7 = email + SMS with a 10%-off-code if customer updates payment within 7d. Day 14 = cancel-subscription + winback-flow entry. Recharge default has 3-attempt dunning built-in; for Skio / Bold / Stay AI / Appstle / Seal / Loop, build the dunning in Klaviyo + Postscript.",
    deliverable:
      "3-attempt dunning-flow live (Day 0/3/7/14 cadence) + 10% recovery-incentive configured",
  },
  {
    week: 2,
    title: "Build the Klaviyo subscription-welcome flow + SMS confirmation",
    action:
      "Create the Klaviyo flow 'Subscription-Welcome' triggered by 'is_subscriber' property = true. Sequence: Day 0 = welcome email with subscription-onboarding tips + account-portal link. Day 1 = 'how to manage your subscription' email with cancel-anytime + skip + change-frequency callouts. Day 3 = 'first-shipment-tracking' email + SMS. Day 7 = 'second-shipment-expectation' email with replenishment-cadence reminder. Path B/C also add a Day 14 + Day 30 NPS-loop. Confirm the SMS branch is wired through Postscript with explicit TCPA opt-in copy.",
    deliverable:
      "Klaviyo subscription-welcome flow live (5-email + 2-SMS) + TCPA opt-in copy verified",
  },
  {
    week: 2,
    title: "Stand up the replenishment-reminder + reorder-cadence flow",
    action:
      "Wire the canonical replenishment-reminder flow per research/08 Pillar 3 triggered by the subscriber's first-shipment-date + their chosen cadence. Sequence: 7 days before next-shipment = email + SMS 'your next shipment is in 7 days, skip/pause/change here'. 3 days before = email 'next shipment in 3 days'. Day-of-shipment = shipping-confirmation email + tracking. 3 days after = 'how's it going' email with reorder-portal link. The canonical reordering-recovery-rate target is 60-80% of subscribers opt to reorder without skipping or canceling.",
    deliverable:
      "Replenishment-reminder flow live (4-email + 2-SMS cadence) + 60-80% reorder target documented",
  },
  {
    week: 2,
    title: "Build the smart-cancellation flow (4-alternative recovery)",
    action:
      "Wire the canonical 4-alternative smart-cancellation flow [pause / skip / change-frequency / 25%-discount] per research/08 Pillar 3 recovering 20-35% of would-be cancellations vs the canonical 0-alternative cancel-only industry-baseline. The cancel-page must present the 4 alternatives BEFORE the cancel-confirmation button: pause-for-30/60/90-days (Path B/C), skip-next-shipment, change-frequency (every 30/45/60/90/120 days), 25%-off-next-3-shipments (Path B/C only). Only after the customer dismisses all 4 alternatives does the cancel-confirmation button surface. Recharge + Skio have built-in 4-alternative flows; for Bold/Stay AI/Appstle/Seal/Loop, build the smart-cancellation in Klaviyo + Postscript.",
    deliverable:
      "Smart-cancellation flow live (4-alternative recovery) + 20-35% recovery target documented",
  },
  {
    week: 2,
    title: "Wire the winback-flow for cancelled subscribers (60-90 day post-cancel sequence)",
    action:
      "Stand up the Klaviyo winback-flow per research/08 Pillar 3 for cancelled subscribers with the canonical 60-90 day post-cancel email sequence: Day 7 = 'we miss you' + 15% off code. Day 30 = 'new products you might like' email. Day 60 = 'we saved your discount' email with the 25% off code (the canonical Path B/C discount). Day 90 = 'last chance to come back' + 30% off code + cancel-anytime reminder. Confirm the winback-flow only sends to subscribers who consented to marketing-email post-cancel.",
    deliverable:
      "Winback-flow live (4-email cadence over 60-90 days) + 10-20% recovery target documented",
  },
  {
    week: 2,
    title: "Configure 3PL or in-house warehouse for subscription-fulfillment (FIFO + lot/date)",
    action:
      "Configure the canonical subscription-3PL per research/08 Pillar 5: ShipBob subscription-team OR ShipMonk subscription-team OR BoxOnLogix OR eFulfillment. Confirm FIFO + lot/date tracking + 30-50% lower pick-pack-error-rate than generic 3PLs per Recharge 2024 subscription-box benchmarks. For in-house: WMS-real-time-sync + lot/date/expiry-tracking + shelf-life-management for supplements / vitamins / food / pet. Path C also requires multi-warehouse routing + international-subscription-shipping (EU + UK + CA + AU + JP).",
    deliverable:
      "3PL subscription-team configured (FIFO + lot/date) OR in-house WMS wired (multi-warehouse for Path C)",
  },

  // --- Week 3 — Soft-launch to 10% then 50% then 100% ramp + per-platform subscriber-conversion readouts + smart-cancellation flow
  {
    week: 3,
    title: "Soft-launch the Subscribe-and-Save widget to 10% of traffic",
    action:
      "Roll the widget out to 10% of PDP-traffic via Google Optimize / VWO / Optimizely (Move #47). Confirm the subscriber-conversion-rate vs the canonical 15-30% benchmark for consumables (research/08 Pillar 2). If the per-platform subscriber-conversion-rate is < 10% on a platform, pause the widget on that platform for 7 days and audit the discount-band + copy. Path B/C also A/B-test the widget headline ('Subscribe & Save X%' vs 'Subscribe & Never Run Out') on desktop + mobile.",
    deliverable:
      "10% soft-launch live + per-platform subscriber-conversion-rate read",
  },
  {
    week: 3,
    title: "Ramp the Subscribe-and-Save widget to 50% of traffic (D+7)",
    action:
      "If the 10% soft-launch subscriber-conversion-rate is >= 10% and the discount-band holds the gross-margin above 0, ramp the widget to 50% of PDP-traffic on Day 8. Continue monitoring the per-platform subscriber-conversion-rate + the churn-rate + the smart-cancellation recovery-rate daily. Pause the ramp if the cancel-rate spikes > 30% in a 24h window OR if the winback-rate drops below 5%.",
    deliverable:
      "50% ramp live (D+7) + daily read on subscriber-conversion + churn + smart-cancellation recovery",
  },
  {
    week: 3,
    title: "Ramp the Subscribe-and-Save widget to 100% of traffic (D+14)",
    action:
      "If the 50% ramp shows stable metrics, ramp the widget to 100% of PDP-traffic on Day 15. Confirm the canonical 2.0-3.5x LTV-multiplier is tracking in the Triple Whale subscriber-cohort-LTV export. Pause the full-launch if the discount-cost is dragging the gross-margin below zero OR if the dunning-recovery-rate drops below 50% (canonical Path B baseline). Path C also extends the ramp to multi-warehouse routing + international-subscription-shipping at this point.",
    deliverable:
      "100% full-launch live (D+14) + LTV-multiplier tracking in Triple Whale",
  },
  {
    week: 3,
    title: "Wire the per-platform subscriber-conversion-rate readout (Move #6 attribution)",
    action:
      "Confirm the canonical Move #6 Triple Whale subscriber-conversion-rate readout is wired per platform (Meta / Google / TikTok / Snap / Pinterest). The canonical benchmark: consumables 15-30% subscriber-conversion-rate vs apparel 5-10% vs luxury 3-7%. If any platform's subscriber-conversion-rate is below the floor, add a platform-specific discount-band (e.g. 20% on TikTok vs 15% default) OR exclude that platform from the subscription-widget.",
    deliverable:
      "Per-platform subscriber-conversion-rate readout live + canonical-benchmark comparison",
  },
  {
    week: 3,
    title: "Tune the smart-cancellation recovery-rate (target 20-35%)",
    action:
      "Walk through every cancellation from the trailing 14 days. For each cancel, log: (a) which of the 4 alternatives was offered (pause / skip / change-frequency / 25%-discount), (b) which alternative the customer picked (if any), (c) the recovery-rate. The canonical Path B baseline is 20-35% recovery. If actual is below 20%, tune the alternatives order + copy: surface 'pause-for-30-days' first (lowest friction) and '25%-discount' last (highest cost).",
    deliverable:
      "Smart-cancellation recovery-rate audit + alternative-order tuning",
  },
  {
    week: 3,
    title: "Tune the dunning-flow recovery-rate (target 50-70%)",
    action:
      "Walk through every failed payment from the trailing 14 days. For each failure, log: (a) the dunning-attempt number (1/2/3), (b) the recovery-day (Day 0/3/7/14), (c) the recovery-rate. The canonical Path B baseline is 50-70% recovery across the 3 attempts. If actual is below 50%, add a Day-3 SMS retake (if not already live) OR tighten the Day-7 10%-off-code to a 15%-off-code for high-value subscribers (>$75 AOV).",
    deliverable:
      "Dunning-flow recovery-rate audit + cadence/incentive tuning",
  },
  {
    week: 3,
    title: "Run the Smile.io 2x-points-on-subscription-orders incentive",
    action:
      "Confirm Smile.io is configured for 2x-points-on-subscription-orders per research/08 Pillar 5. The canonical incentive: 2x loyalty-points-on-subscription-orders (vs 1x for one-time-orders) drives a 10-20% lift in subscription-onboarding rate per Smile.io 2024 benchmarks. Path B/C also expose a 5x-points-on-3rd-reorder milestone for habit-formation. Confirm the Smile.io ↔ Recharge (or Skio/Bold/Stay AI) integration is live and the points-credit is firing within 24h of each subscription-shipment.",
    deliverable:
      "Smile.io 2x-points-on-subscription-orders incentive live + habit-formation milestone",
  },

  // --- Week 4 — D-7 / D-14 / D-21 subscriber-LTV-multiplier readout + replenishment-cadence audit + winback + 30-day program readout
  {
    week: 4,
    title: "Subscriber-cohort-LTV-multiplier readout (the canonical Move #11 deliverable)",
    action:
      "Pull the trailing-30-day Triple Whale subscriber-cohort-LTV export. Compare the subscriber-LTV to the one-time-purchase-LTV for the same acquisition window. The canonical research/08 Pillar 4 deliverable: subscriber-LTV-multiplier >= 2.0x (Path A) / >= 2.5x (Path B) / >= 3.0x (Path C). If the multiplier is below the path baseline, audit the discount-cost vs the LTV-multiplier and consider tightening the discount-band.",
    deliverable:
      "Subscriber-cohort-LTV-multiplier readout (vs canonical 2.0-3.5x target)",
  },
  {
    week: 4,
    title: "Replenishment-cadence audit (30-90 day reorder-rate target)",
    action:
      "Walk through every subscriber-shipment from the trailing 30 days. For each shipment, log: (a) the chosen cadence (30/45/60/90/120 day), (b) the actual reorder-day, (c) the skip-rate, (d) the cancel-rate. The canonical replenishment-rate target is 60-80% of subscribers opt to reorder without skipping or canceling. If actual is below 60%, tune the replenishment-reminder cadence (e.g. shift from 7-days-before to 10-days-before for low-AOV consumables).",
    deliverable:
      "Replenishment-cadence audit (vs canonical 60-80% reorder target)",
  },
  {
    week: 4,
    title: "Winback-flow recovery-rate readout (target 10-20%)",
    action:
      "Walk through every cancelled subscriber from the trailing 30 days. For each cancel, log: (a) the winback-email number (1/2/3/4 over the 60-90 day sequence), (b) the recovery-day (Day 7/30/60/90), (c) the winback-recovery-rate. The canonical Path B baseline is 10-20% recovery. If actual is below 10%, tune the discount-band (Day 7 15% off + Day 30 new-products + Day 60 25% off + Day 90 30% off last-chance).",
    deliverable:
      "Winback-flow recovery-rate audit + discount-band tuning",
  },
  {
    week: 4,
    title: "Path B vs Path C decision (when to upgrade)",
    action:
      "If your trailing-30-day subscriber-count is approaching the Path B ceiling (10,000 subscribers) OR your trailing-30-day international-shipment rate is > 5%, plan the Path C upgrade. Path C requires Recharge Enterprise ($999+/mo) or Skio Enterprise ($1,200/mo), a 90-day migration window, and a dedicated CSM. Confirm the upgrade window doesn't overlap with BFCM (November-December) or any other high-traffic window.",
    deliverable:
      "Path C upgrade decision recorded + 90-day migration window planned",
  },
  {
    week: 4,
    title: "Quarterly subscriber-cohort-review plan + ongoing-readout cadence",
    action:
      "Lock a quarterly subscriber-cohort-review cadence (every Q1+Q2+Q3+Q4) with the canonical 5-metric readout (subscriber-count + subscription-revenue-share + LTV-multiplier + churn-rate + replenishment-rate). Each quarter, also re-validate the discount-tier-matrix + the smart-cancellation recovery-rate + the dunning recovery-rate + the winback recovery-rate + the Smile.io 2x-points incentive. Path B/C also adds a quarterly dedicated retention-manager review.",
    deliverable:
      "Quarterly subscriber-cohort-review plan + 5-metric readout cadence locked",
  },
  {
    week: 4,
    title: "Path C international-subscription-shipping plan (for $10M+ brands)",
    action:
      "If you're a Path C operator ($10M+ GMV), plan the international-subscription-shipping expansion: EU + UK + CA + AU + JP. Each market requires: (a) local 3PL partner with subscription-experience (BoxOnLogix EU + eFulfillment UK + ShipBob CA + eFulfillment AU + eFulfillment JP), (b) local-currency pricing with the canonical 5-tier discount matrix translated, (c) VAT/GST-registered subscription-billing, (d) local-language subscription-welcome flow. Confirm the multi-warehouse routing is wired before launching each market.",
    deliverable:
      "International-subscription-shipping plan (EU/UK/CA/AU/JP) + per-market 3PL partner pick",
  },
  {
    week: 4,
    title: "Dedicated retention-manager hire plan (for $10M+ brands)",
    action:
      "If you're a Path C operator ($10M+ GMV), plan the dedicated retention-manager hire. Canonical role: $70k-$100k FTE + 4-week onboarding + ownership of the smart-cancellation flow + the dunning flow + the winback flow + the quarterly subscriber-cohort-review. Without a dedicated owner, the canonical research/08 Pillar 4 subscriber-cohort-LTV-multiplier degrades by ~30% within 6 months per Skio 2024 benchmarks.",
    deliverable:
      "Retention-manager job description + $70k-$100k FTE budget + 4-week onboarding plan",
  },
  {
    week: 4,
    title: "30-day subscription-program readout deck + exec-summary",
    action:
      "Compile a single deck / Notion page that captures: (a) the path you shipped (Path A/B/C), (b) the platform you picked, (c) the Year-1 cost stack (oneTimeCost + recurringMonthlyCost x 12), (d) the trailing-30-day subscriber-count + subscription-revenue-share, (e) the trailing-30-day LTV-multiplier vs the canonical 2.0-3.5x target, (f) the smart-cancellation + dunning + winback recovery-rates, (g) the Smile.io 2x-points lift, (h) the 90-day iteration backlog. Share with ops + analytics + finance lead.",
    deliverable:
      "30-day program readout deck + exec-summary shared + sign-off from leads",
  },
  {
    week: 4,
    title: "Wire Move #11 into the next-quarter subscription-roadmap",
    action:
      "Add Move #11 to the canonical subscription-roadmap doc (research/08). Mark it as shipped with the chosen path + platform + Year-1 cost stack + Year-1 incremental subscription-revenue + LTV-multiplier. Reference this Move #11 launch plan (this document) in the 'How to extend' section so the next operator can re-run the 30-day sequence without re-discovering the build steps.",
    deliverable:
      "Subscription-roadmap updated + Move #11 marked shipped + cross-ref added",
  },
];

// ---------------------------------------------------------------------------
// Generator + markdown renderer
// ---------------------------------------------------------------------------

export interface BuildSubscriptionLaunchPlanOptions {
  inputs?: Partial<SubscriptionInputs>;
  startDate?: string;
}

export function buildSubscriptionLaunchPlan(
  opts?: BuildSubscriptionLaunchPlanOptions
): SubscriptionLaunchPlanPayload {
  const inputs: SubscriptionInputs = {
    ...SUBSCRIPTION_DEFAULTS,
    ...(opts?.inputs ?? {}),
  } as SubscriptionInputs;

  const recommendation = recommendSubscriptionPath(inputs);

  const yourStore = loadYourStore();

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  const days: SubscriptionLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    inputs,
    yourStore,
    recommendation,
    days,
  };
}

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function subscriptionLaunchPlanDayDate(
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
export function subscriptionLaunchPlanToMarkdown(
  plan: SubscriptionLaunchPlanPayload
): string {
  const r = plan.recommendation;
  const path = r.path;

  const canonicalRoiLow = r.canonicalRoi[0].toFixed(1);
  const canonicalRoiHigh = r.canonicalRoi[1].toFixed(1);

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(2)} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(plan.yourStore.grossMargin * 100).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# Subscription Program Launch Plan — ${plan.startDate}`,
    "",
    `> Move #11 — recurring-revenue + 2.0-3.5x LTV-multiplier layer the US-centric Shopify-DTC stack implicitly defers. Same math as the \`/subscriptions\` calculator (browser port of canonical benchmarks from \`playbooks/15-subscription-program-launch.md\`).${yourStoreLine}`,
    "",
    `## Snapshot`,
    "",
    `- **Path verdict:** ${path} — ${r.defaultPlatformPick.split("—")[0].trim()}`,
    `- **Canonical Year-1 ROI band:** ${canonicalRoiLow}:1 (low) – ${canonicalRoiHigh}:1 (high)`,
    `- **Year-1 cost stack:** $${r.year1Cost[0].toLocaleString()} (low) – $${r.year1Cost[1].toLocaleString()} (high)`,
    `- **Year-1 incremental subscription revenue:** $${Math.round(r.year1SubscriptionRevenue[0]).toLocaleString()} (low) – $${Math.round(r.year1SubscriptionRevenue[1]).toLocaleString()} (high)`,
    `- **Subscription revenue share of US GMV:** ${r.subscriptionRevenueSharePct[0]}% – ${r.subscriptionRevenueSharePct[1]}%`,
    `- **Year-1 subscriber count (midpoint):** ${r.midpoint.subscriberCount.toLocaleString()}`,
    `- **LTV multiplier:** ${r.ltvMultiplier[0]}x – ${r.ltvMultiplier[1]}x`,
    `- **Smart-cancellation recovery:** ${r.smartCancellationRecoveryPct[0]}% – ${r.smartCancellationRecoveryPct[1]}%`,
    `- **Dunning recovery:** ${r.dunningRecoveryPct[0]}% – ${r.dunningRecoveryPct[1]}%`,
    `- **Winback recovery:** ${r.winbackRecoveryPct[0]}% – ${r.winbackRecoveryPct[1]}%`,
    `- **Default platform pick:** ${r.defaultPlatformPick}`,
    "",
  ];

  // Defer the plan if calculator says so
  if (r.isDeferred) {
    lines.push(
      "## ⚠️  DEFER",
      "",
      `Path ${path} verdict with deferral gate fired. Reasons: ${r.deferralReasons.join(" ")} The plan below is still paste-ready for the day the prerequisites are met.`,
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
    const dayDate = subscriptionLaunchPlanDayDate(plan.startDate, d.day);
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
    `_Generated by Ecommerce Ops dashboard · /subscription-launch-plan · Move #11 always-on Subscription Program (Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop)._`
  );

  return lines.join("\n");
}

/** Plan summary string for sidebar badges / chips — "30-day / 4-week / 30 actions". */
export const SUBSCRIPTION_PLAN_SUMMARY = {
  totalDays: 30,
  totalActions: 30,
  weeks: 4,
};