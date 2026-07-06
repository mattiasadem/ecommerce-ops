/**
 * `30-day plan generator` — cross-page-intelligence on top of Your-store + Shipped-playbooks.
 *
 * The generator reads:
 *   - YourStore (AOV / monthly orders / gross margin) — for personalized revenue projections
 *   - ShippedPlaybooks — to skip already-shipped moves and build on momentum
 *   - Top10 status — to respect the canonical priority order
 *
 * Output: 30-day calendar (4 weeks × ~5 work days) where each day has 2-4 specific
 * tasks with verification gates, drawn from the existing playbook + ROI-script library.
 * The plan auto-skips moves already shipped and fills remaining days with the
 * next-priority items so an operator who's shipped 8 moves gets a sharper,
 * higher-leverage 30 days than someone starting from zero.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the component).
 */

import type { YourStoreInputs } from "./your-store";

// -- Top-10 move catalog (matches content.json top10.status order) -----------
// Each entry: playbook-id (file id without .md), display name, week bucket,
// estimated CVR/revenue lift, ROI-calculator that pairs with the move (for
// cross-linking), and the 3-4 concrete operator tasks per day group.

export interface MoveTemplate {
  id: string;             // matches playbook file id (no .md)
  name: string;           // human-readable name (e.g. "Abandoned cart flow")
  playbook: string;       // playbook file id (without .md) — for deep linking
  week: 1 | 2 | 3 | 4;    // canonical week bucket in the default 30-day sequence
  daysToShip: number;     // typical calendar days from kickoff to live
  // Each move contributes 2-4 concrete tasks (with verification gates).
  tasks: PlanTask[];
}

export interface PlanTask {
  label: string;
  // Optional verification gate — what proves the task shipped.
  verify?: string;
  // Optional ROI estimate — what revenue / lift this task contributes (relative lift).
  estLift?: string;
}

export interface PlanDay {
  day: number;          // 1..30
  weekday: string;      // "Mon" / "Tue" / ...
  weekLabel: string;    // "Week 1 · Foundation"
  theme: string;        // short theme line
  tasks: PlanTask[];    // 2-4 tasks per day
  // Top-10 moves shipped on this day (for cross-link pills).
  moveIds: string[];
}

export interface PlanSummary {
  totalDays: number;
  weeks: number;
  shippedCount: number;     // how many moves the operator had already shipped
  plannedCount: number;     // moves planned for the next 30 days
  projectedMonthlyRevenue: number;     // monthly revenue from Your-store
  projectedLiftLow: number;            // 0..1 — low end cumulative lift
  projectedLiftHigh: number;           // 0..1 — high end cumulative lift
  projectedLiftDollarsLow: number;     // monthly $ lift at low end
  projectedLiftDollarsHigh: number;    // monthly $ lift at high end
  skipRationale: string;   // human-readable explanation of what was skipped
  startDate: string;       // ISO date the plan starts (today)
}

// ---------------------------------------------------------------------------
// Move templates. Ordered by canonical priority (matches Top-10 + the proven
// Day 1-30 sequence shipped in /30-day-plan). Tasks reference the actual
// verification gates from the underlying playbooks / ROI scripts.
// ---------------------------------------------------------------------------

export const MOVE_TEMPLATES: MoveTemplate[] = [
  {
    id: "01-abandoned-cart-flow-klaviyo",
    name: "Abandoned cart flow (Klaviyo)",
    playbook: "01-abandoned-cart-flow-klaviyo",
    week: 1,
    daysToShip: 3,
    tasks: [
      { label: "Create the cart-abandon flow in Klaviyo — 3-email series (1h / 12h / 24h)", verify: "Flow is in draft state, all 3 emails have subject + preview copy" },
      { label: "Wire cart-abandon trigger to fire on Shopify checkout_abandoned event", verify: "Test cart → wait 5 minutes → email lands in inbox" },
      { label: "Configure cart-value segments (low <$50 / mid $50-150 / high >$150) and route SMS for high-cart-value", verify: "Segments render in Klaviyo → Profiles tab" },
      { label: "Run the in-browser abandoned-cart ROI calculator on /playbooks with your real AOV + orders to confirm projected lift", verify: "Calculator shows net revenue per month and revenue-per-$1-sent ratio" },
      { label: "Suppress already-converted profiles + sunset branch for repeat abandoners (3+ carts in 14d)", verify: "Flow filters show 'Placed Order' suppression + dynamic sunset branch" },
      { label: "Ship flow live and monitor 48h revenue attributed", estLift: "+5–10% revenue recovery from abandoned carts" },
    ],
  },
  {
    id: "03-checkout-audit-baymard",
    name: "Checkout audit (Baymard 24-pt)",
    playbook: "03-checkout-audit-baymard",
    week: 1,
    daysToShip: 2,
    tasks: [
      { label: "Run the in-browser checkout audit on /cro — answer 24 yes/no questions", verify: "Score 0-100 + Baymard health band renders" },
      { label: "Copy the prioritized fix-list to a Linear/Jira ticket per Severity-L item", verify: "All Severity-L items have a ticket assigned" },
      { label: "Enable guest checkout + Shop Pay + Apple Pay/Google Pay", verify: "Test mobile checkout completes in <60 seconds without account creation" },
      { label: "Add inline validation + remove required phone number + add address autocomplete", verify: "Run /cro audit again — score should jump ≥15 points" },
      { label: "Add sticky Place Order on mobile + 44px touch targets", verify: "Test on real iPhone — no zoom required, button reachable one-handed" },
      { label: "Verify +20–35% CVR on the fixed checkout over 7 days", estLift: "+20–35% checkout CVR" },
    ],
  },
  {
    id: "04-welcome-series-klaviyo",
    name: "Welcome series (Klaviyo)",
    playbook: "04-welcome-series-klaviyo",
    week: 1,
    daysToShip: 3,
    tasks: [
      { label: "Create welcome flow — 3-email series (immediate / +24h / +72h)", verify: "Flow draft has all 3 emails with subject + preview" },
      { label: "Wire signup trigger to fire on newsletter form submit OR quiz completion", verify: "Test signup → first email within 5 minutes" },
      { label: "Set welcome discount (10% default) — track redemption via unique code", verify: "Klaviyo coupon code is configured and tied to flow" },
      { label: "Build 12-input welcome-series ROI projection on /playbooks to verify breakeven", verify: "Net margin per $1 sent should be >10× before shipping" },
      { label: "Ship flow + monitor first-order CVR for 14 days", estLift: "+1–3% first-purchase CVR" },
    ],
  },
  {
    id: "02-post-purchase-upsell-reconvert",
    name: "Post-purchase upsell (ReConvert/AfterSell)",
    playbook: "02-post-purchase-upsell-reconvert",
    week: 2,
    daysToShip: 2,
    tasks: [
      { label: "Install ReConvert (or AfterSell) and configure 3 upsell offers per product", verify: "Test order → upsell page renders after Place Order" },
      { label: "Set upsell acceptance rate target (15% default) and AOV target ($35 default)", verify: "Run /playbooks post-purchase ROI calculator with your numbers" },
      { label: "Wire acceptance tracking + cancel-anytime policy on upsell page", verify: "Customer can decline without leaving thank-you page" },
      { label: "Ship + monitor acceptance rate + blended AOV lift for 14 days", estLift: "+10–15% blended AOV" },
    ],
  },
  {
    id: "05-migrate-to-klaviyo-postscript",
    name: "Migrate to Klaviyo + Postscript",
    playbook: "05-migrate-to-klaviyo-postscript",
    week: 2,
    daysToShip: 4,
    tasks: [
      { label: "Inventory all active flows on source ESP (Mailchimp / Klaviyo old / Omnisend) and tag each with equivalent Klaviyo/Postscript target", verify: "Spreadsheet: source flow → target flow mapping, 100% coverage" },
      { label: "Migrate email subscribers (consent + segments + suppression lists)", verify: "Klaviyo audience count matches source ESP within ±2%" },
      { label: "Migrate SMS subscribers to Postscript + wire DLR monitoring suite", verify: "Postscript shows accurate delivered/undelivered counts" },
      { label: "Cut over on a low-traffic day — verify all critical automations fire", verify: "Test signup, cart-abandon, post-purchase flows all fire correctly" },
      { label: "Decommission source ESP after 14-day parallel-run with no regressions", verify: "Zero flow-fire failures logged during 14-day overlap" },
    ],
  },
  {
    id: "06-install-attribution-triplewhale-or-polar",
    name: "Install Triple Whale or Polar Analytics",
    playbook: "06-install-attribution-triplewhale-or-polar",
    week: 3,
    daysToShip: 2,
    tasks: [
      { label: "Pick the attribution platform — Triple Whale (DTC native, $) or Polar Analytics (Shopify-native, $)", verify: "Trial account created on chosen platform" },
      { label: "Install pixel + connect Shopify + connect Meta Ads + Google Ads + TikTok Ads", verify: "All 4 sources show 'connected' status in dashboard" },
      { label: "Verify channel-level MER (Marketing Efficiency Ratio) renders", verify: "Dashboard shows ≥7 day of data, MER = revenue / spend by channel" },
      { label: "Set up weekly rollup email or Slack alert", verify: "First weekly rollup lands in inbox / channel" },
      { label: "Start weekly attribution review every Monday — kill any channel where MER <2.0 for 3 consecutive weeks", estLift: "+10–25% paid-media ROI from reallocation" },
    ],
  },
  {
    id: "06-sms-welcome-and-cart-abandon",
    name: "SMS welcome + cart abandon",
    playbook: "06-sms-welcome-and-cart-abandon",
    week: 3,
    daysToShip: 2,
    tasks: [
      { label: "Wire SMS opt-in to checkout + footer + post-purchase pages", verify: "Opt-in rate ≥5% of orders" },
      { label: "Create SMS welcome (single message, 5 minutes after opt-in)", verify: "Test opt-in → SMS lands within 5 minutes" },
      { label: "Create SMS cart-abandon (single message, 30 minutes after cart abandoned)", verify: "Test cart → SMS lands within 30 minutes" },
      { label: "Set up DLR (delivery rate) monitoring suite — alert if DLR <85%", verify: "Postscript / Klaviyo SMS dashboard shows DLR >85%" },
      { label: "Ship + monitor 14-day attributed revenue from SMS", estLift: "+3–5% incremental revenue from SMS channel" },
    ],
  },
  {
    id: "07-loyalty-program-smile",
    name: "Loyalty program (Smile.io)",
    playbook: "07-loyalty-program-smile",
    week: 4,
    daysToShip: 3,
    tasks: [
      { label: "Install Smile.io + configure points-per-dollar + VIP tiers", verify: "Test order → points awarded, tier upgrade triggered" },
      { label: "Wire post-purchase enrollment (auto-enroll ≥60% of new customers)", verify: "Smile dashboard shows >60% enrollment rate at 30d" },
      { label: "Create redeemable rewards catalog (100 / 250 / 500 / 1000 points)", verify: "Customer can redeem each tier from account page" },
      { label: "Set up monthly loyalty email via Klaviyo (points balance + new rewards)", verify: "First monthly loyalty email sends to all enrolled customers" },
      { label: "Ship + monitor repeat-purchase rate lift for 60 days", estLift: "+5–15% repeat-purchase rate from enrolled cohort" },
    ],
  },
  {
    id: "09-mobile-pdp-redesign",
    name: "Mobile PDP redesign",
    playbook: "09-mobile-pdp-redesign",
    week: 4,
    daysToShip: 4,
    tasks: [
      { label: "Audit current PDP against Core Web Vitals targets — LCP <2.5s, INP <200ms, CLS <0.1", verify: "PageSpeed Insights mobile score ≥80" },
      { label: "Compress all hero images to WebP/AVIF + lazy-load below-fold", verify: "LCP improves to <2.5s on mobile" },
      { label: "Move Add to Cart above the fold on mobile + sticky on scroll", verify: "Add to Cart reachable without scrolling" },
      { label: "Add trust badges + payment icons near Add to Cart", verify: "Trust badges visible without scrolling on mobile" },
      { label: "Test on real iPhone + Android device — verify no zoom required, no horizontal scroll", verify: "Real-device test on both iOS and Android passes" },
      { label: "Ship + monitor mobile CVR + bounce rate for 14 days", estLift: "+10–20% mobile CVR" },
    ],
  },
  {
    id: "10-ai-ad-creative-iteration",
    name: "AI ad creative iteration",
    playbook: "10-ai-ad-creative-iteration",
    week: 4,
    daysToShip: 3,
    tasks: [
      { label: "Pick AI tool — Pencil (Pro) or AdCreative.ai or in-house ComfyUI workflow", verify: "Trial account created, 5 variants generated" },
      { label: "Generate 5-10 new creative variants per week (target cadence)", verify: "Variants logged in your AI tool dashboard" },
      { label: "Test each variant in Meta/TikTok Ads at $50/day spend for 7 days", verify: "Each variant has 7d spend + CPA data" },
      { label: "Kill any variant with CPA >150% of baseline, scale winners", verify: "Weekly creative-review meeting scheduled" },
      { label: "Iterate continuously — target 4 tests per month", estLift: "+15–30% paid-social ROAS from creative freshness" },
    ],
  },
];

// Projected lift per move (low/high, additive but capped).
const MOVE_LIFT: Record<string, [number, number]> = {
  "01-abandoned-cart-flow-klaviyo": [0.05, 0.10],
  "03-checkout-audit-baymard":      [0.20, 0.35],
  "04-welcome-series-klaviyo":       [0.01, 0.03],
  "02-post-purchase-upsell-reconvert": [0.10, 0.15],
  "05-migrate-to-klaviyo-postscript": [0.02, 0.05],
  "06-install-attribution-triplewhale-or-polar": [0.10, 0.25],
  "06-sms-welcome-and-cart-abandon": [0.03, 0.05],
  "07-loyalty-program-smile":        [0.05, 0.15],
  "09-mobile-pdp-redesign":          [0.10, 0.20],
  "10-ai-ad-creative-iteration":     [0.15, 0.30],
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WEEK_THEMES: Record<number, { label: string; theme: string }> = {
  1: { label: "Week 1 · Foundation", theme: "Lock in the high-ROI retention flows" },
  2: { label: "Week 2 · Conversion", theme: "Stack the post-purchase + ESP migration wins" },
  3: { label: "Week 3 · Data + Channels", theme: "Wire attribution + SMS so you can measure what ships" },
  4: { label: "Week 4 · Compounding", theme: "Loyalty + mobile PDP + AI creative — the long-game plays" },
};

/**
 * Generate a 30-day plan from the operator's current state.
 *
 * @param inputs            Your-store numbers (AOV / monthly orders / gross margin).
 * @param shippedPlaybooks  Map of playbook-id → ShippedEntry. Already-shipped
 *                          moves are excluded from the 30-day sequence.
 * @param now               Reference "today" date (defaults to new Date()).
 */
export function generateThirtyDayPlan(
  inputs: YourStoreInputs,
  shippedPlaybooks: Record<string, unknown>,
  now: Date = new Date()
): { days: PlanDay[]; summary: PlanSummary } {
  // 1. Decide which moves to include (skip already-shipped).
  const plannedMoves = MOVE_TEMPLATES.filter(
    (m) => !shippedPlaybooks[m.playbook]
  );
  const shippedCount = MOVE_TEMPLATES.length - plannedMoves.length;

  // 2. Walk 30 calendar days, starting today (snap to next Monday if today is
  //    Sunday — gives operators a clean kickoff cadence).
  const startDate = new Date(now);
  // If today is Sunday, snap to Monday. Otherwise start today.
  if (startDate.getDay() === 0) startDate.setDate(startDate.getDate() + 1);

  const days: PlanDay[] = [];
  let moveIdx = 0;
  let taskIdx = 0;
  let currentWeek = 1;

  for (let d = 1; d <= 30; d++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (d - 1));
    const weekday = WEEKDAY_LABELS[dayDate.getDay()];

    // Week boundary: every 7 days bump the week counter.
    currentWeek = Math.min(4, Math.ceil(d / 7));

    const dayTasks: PlanTask[] = [];
    const dayMoveIds: string[] = [];

    // Skip weekends (Sat = 6, Sun = 0) — operators usually don't ship on Sat/Sun.
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
      days.push({
        day: d,
        weekday,
        weekLabel: WEEK_THEMES[currentWeek].label,
        theme: "Rest / catch-up day",
        tasks: [
          { label: "Catch up on any verification gates from earlier in the week" },
          { label: "Review the dashboard journal at https://ecommerce-ops-iota.vercel.app/journal" },
        ],
        moveIds: [],
      });
      continue;
    }

    // Greedy task allocation: take from current move until its tasks run out,
    // then advance to next move. Cap at 3 tasks per day. Allow pulling
    // future-week moves forward if the current week has no remaining tasks
    // — operators shouldn't sit on buffer days when there's queued work.
    while (dayTasks.length < 3 && moveIdx < plannedMoves.length) {
      const move = plannedMoves[moveIdx];
      const remaining = move.tasks.length - taskIdx;
      if (remaining <= 0) {
        // Move done — advance.
        moveIdx++;
        taskIdx = 0;
        continue;
      }
      const take = Math.min(3 - dayTasks.length, remaining);
      for (let i = 0; i < take; i++) {
        dayTasks.push(move.tasks[taskIdx + i]);
      }
      taskIdx += take;
      if (!dayMoveIds.includes(move.playbook)) dayMoveIds.push(move.playbook);

      if (taskIdx >= move.tasks.length) {
        moveIdx++;
        taskIdx = 0;
      }
    }

    const theme = dayTasks.length
      ? `${WEEK_THEMES[currentWeek].theme} — ${plannedMoves.slice(0, moveIdx + 1).filter((m) => m.week === currentWeek).length} move(s) in flight`
      : WEEK_THEMES[currentWeek].theme;

    days.push({
      day: d,
      weekday,
      weekLabel: WEEK_THEMES[currentWeek].label,
      theme,
      tasks: dayTasks.length
        ? dayTasks
        : [
            { label: "Buffer day — catch up on verification gates from this week" },
            { label: "If caught up: open /playbooks and mark shipped playbooks to update your progress" },
          ],
      moveIds: dayMoveIds,
    });
  }

  // 3. Compute summary stats.
  const plannedCount = plannedMoves.length;
  let liftLow = 0;
  let liftHigh = 0;
  for (const m of plannedMoves) {
    const [lo, hi] = MOVE_LIFT[m.id] ?? [0, 0];
    liftLow += lo;
    liftHigh += hi;
  }
  // Cap at +80% to match the same cap the checkout-audit script uses.
  liftLow = Math.min(0.80, liftLow);
  liftHigh = Math.min(0.80, liftHigh);

  const monthlyRevenue = inputs.aov * inputs.monthlyOrders;
  const liftDollarsLow = monthlyRevenue * liftLow;
  const liftDollarsHigh = monthlyRevenue * liftHigh;

  let skipRationale: string;
  if (shippedCount === 0) {
    skipRationale =
      "All 10 Top-10 moves are queued for the next 30 days. Default sequence: 3 moves per week starting with abandoned-cart + checkout audit + welcome series in Week 1.";
  } else if (shippedCount === MOVE_TEMPLATES.length) {
    skipRationale =
      "All 10 Top-10 moves are already shipped — this plan is empty. Open /playbooks to revisit any playbook, or ship Move #9.5 / 6.5-6.9 attribution extensions to deepen what's live.";
  } else {
    const skippedNames = MOVE_TEMPLATES.filter(
      (m) => shippedPlaybooks[m.playbook]
    )
      .map((m) => m.name)
      .join(", ");
    skipRationale = `Skipped ${shippedCount} already-shipped move(s): ${skippedNames}. The remaining ${plannedCount} move(s) are sequenced by canonical Top-10 priority.`;
  }

  const summary: PlanSummary = {
    totalDays: 30,
    weeks: 4,
    shippedCount,
    plannedCount,
    projectedMonthlyRevenue: monthlyRevenue,
    projectedLiftLow: liftLow,
    projectedLiftHigh: liftHigh,
    projectedLiftDollarsLow: liftDollarsLow,
    projectedLiftDollarsHigh: liftDollarsHigh,
    skipRationale,
    startDate: startDate.toISOString().slice(0, 10),
  };

  return { days, summary };
}

/**
 * Render a 30-day plan to paste-ready markdown. Matches the cadence of the
 * existing /30-day-plan static doc (Day N · Weekday · Theme + bullets + gates).
 */
export function renderPlanMarkdown(
  days: PlanDay[],
  summary: PlanSummary,
  inputs: YourStoreInputs
): string {
  const lines: string[] = [];
  lines.push("# Your 30-day launch plan");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)} · Starts: ${summary.startDate}`);
  lines.push("");
  lines.push("## Inputs (from Your-store)");
  lines.push(`- AOV: $${inputs.aov.toLocaleString("en-US")}`);
  lines.push(`- Monthly orders: ${inputs.monthlyOrders.toLocaleString("en-US")}`);
  lines.push(`- Gross margin: ${(inputs.grossMargin * 100).toFixed(0)}%`);
  lines.push(
    `- Current monthly revenue: $${summary.projectedMonthlyRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  );
  lines.push(`- Already shipped: ${summary.shippedCount} Top-10 moves`);
  lines.push(`- Planned: ${summary.plannedCount} Top-10 moves in next 30 days`);
  lines.push("");
  lines.push("## Projected lift");
  lines.push(
    `- Low end: +${(summary.projectedLiftLow * 100).toFixed(0)}% monthly revenue (≈ +$${summary.projectedLiftDollarsLow.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo)`
  );
  lines.push(
    `- High end: +${(summary.projectedLiftHigh * 100).toFixed(0)}% monthly revenue (≈ +$${summary.projectedLiftDollarsHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo)`
  );
  lines.push("- (Cap: +80% — beyond that is cart/PDP work, not flow work)");
  lines.push("");
  lines.push("## Rationale");
  lines.push(summary.skipRationale);
  lines.push("");
  lines.push("## Calendar");
  lines.push("");

  for (const day of days) {
    lines.push(`### Day ${day.day} · ${day.weekday} · ${day.weekLabel}`);
    lines.push(`_Theme: ${day.theme}_`);
    if (day.moveIds.length > 0) {
      const links = day.moveIds
        .map((id) => `[${id}](https://ecommerce-ops-iota.vercel.app/playbooks#${id})`)
        .join(" · ");
      lines.push(`_Moves in flight:_ ${links}`);
    }
    lines.push("");
    for (const task of day.tasks) {
      const verify = task.verify ? `  - ✓ _Verify:_ ${task.verify}` : "";
      const lift = task.estLift ? `  - 📈 _Expected lift:_ ${task.estLift}` : "";
      lines.push(`- ${task.label}${verify}${lift}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("Generated by the [30-day plan generator](https://ecommerce-ops-iota.vercel.app/30-day-plan) — re-run after each shipped playbook to refresh your queue.");
  lines.push("");
  return lines.join("\n");
}