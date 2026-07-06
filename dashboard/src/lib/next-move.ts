/**
 * `Next-move recommender` — the "what should I do TODAY?" engine.
 *
 * Cross-page-intelligence that ranks the canonical Top-10 move queue by:
 *   1. **Priority** — order from `content.top10.status` (already shipped
 *      moves drop to the bottom of the queue).
 *   2. **Personalized ROI** — projects the move's expected lift against
 *      Your-store's monthly revenue (AOV × orders × margin). A $75 AOV /
 *      1k orders store sees a $3,750/mo lift from Move #1; a $150 AOV /
 *      4k orders store sees $30,000/mo from the same move.
 *   3. **Prerequisite check** — flags "ship prerequisites first" if the
 *      operator hasn't yet shipped the dependency the playbook itself calls
 *      out (e.g. "Triple Whale attribution" before "AI ad creative iteration"
 *      per playbooks/10).
 *   4. **Skipped-move rationale** — explains why a higher-priority move
 *      wasn't picked (already shipped / dependency missing).
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component).
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";

// -- Move recommendation data -----------------------------------------------
// Each entry: playbook-id (matches content.json), display name, one-line
// rationale, prereq playbook-ids (that the operator should have shipped
// first per the playbook's own §Prerequisites), and a projected
// low/high lift band (additive but capped when summed, matches MOVE_LIFT
// in thirty-day-plan.ts).

export interface MoveRecommendation {
  id: string;                    // matches playbook file id (no .md)
  name: string;                  // human-readable name
  /** Canonical priority rank from Top-10 status (1 = highest). 99 if not in Top-10. */
  priorityRank: number;
  /** One-line "why this move" — short, action-oriented. */
  rationale: string;
  /** Playbook ids that should be shipped first (per the playbook's §Prerequisites). */
  prereqIds: string[];
  /** Expected lift band (low/high, fraction of monthly revenue). */
  liftLow: number;
  liftHigh: number;
  /** Estimated calendar days from kickoff to live (for "do this week" pacing). */
  daysToShip: number;
  /** Cost band: $/mo operator cost for the tools/stack this move needs. */
  costLow: number;
  costHigh: number;
}

export const MOVE_RECOMMENDATIONS: MoveRecommendation[] = [
  {
    id: "01-abandoned-cart-flow-klaviyo",
    name: "Abandoned cart flow (Klaviyo)",
    priorityRank: 1,
    rationale: "Highest-ROI email flow — recovers 5-10% of abandoned carts within 48h, no new tools needed beyond Klaviyo.",
    prereqIds: [],
    liftLow: 0.05,
    liftHigh: 0.10,
    daysToShip: 3,
    costLow: 0,
    costHigh: 60,
  },
  {
    id: "03-checkout-audit-baymard",
    name: "Checkout audit (Baymard 24-pt)",
    priorityRank: 2,
    rationale: "Baymard's top 24 fixes unlock 20-35% CVR lift. Free to ship, every Severity-L fix is in your existing theme.",
    prereqIds: [],
    liftLow: 0.20,
    liftHigh: 0.35,
    daysToShip: 5,
    costLow: 0,
    costHigh: 0,
  },
  {
    id: "04-welcome-series-klaviyo",
    name: "Welcome series (Klaviyo)",
    priorityRank: 3,
    rationale: "Welcome flows convert at 3-5x newsletter CTR — captures the highest-intent cohort before they churn.",
    prereqIds: [],
    liftLow: 0.01,
    liftHigh: 0.03,
    daysToShip: 3,
    costLow: 0,
    costHigh: 30,
  },
  {
    id: "02-post-purchase-upsell-reconvert",
    name: "Post-purchase upsell (ReConvert/AfterSell)",
    priorityRank: 4,
    rationale: "Post-purchase page is 4x more likely to convert — 15% acceptance at $35 incremental AOV compounds the existing order stream.",
    prereqIds: [],
    liftLow: 0.10,
    liftHigh: 0.15,
    daysToShip: 4,
    costLow: 60,
    costHigh: 250,
  },
  {
    id: "05-migrate-to-klaviyo-postscript",
    name: "Migrate to Klaviyo + Postscript",
    priorityRank: 5,
    rationale: "Consolidate email + SMS into one CDP — unlocks cross-channel flows, attribute revenue properly, cut ESP costs 30-50%.",
    prereqIds: [],
    liftLow: 0.02,
    liftHigh: 0.05,
    daysToShip: 14,
    costLow: 100,
    costHigh: 600,
  },
  {
    id: "06-install-attribution-triplewhale-or-polar",
    name: "Install Triple Whale or Polar Analytics",
    priorityRank: 6,
    rationale: "Without attribution you can't measure any other move. Triple Whale or Polar pays for itself in week 1 by exposing wasted spend.",
    prereqIds: [],
    liftLow: 0.10,
    liftHigh: 0.25,
    daysToShip: 2,
    costLow: 100,
    costHigh: 350,
  },
  {
    id: "06-sms-welcome-and-cart-abandon",
    name: "SMS welcome + cart abandon",
    priorityRank: 7,
    rationale: "SMS opt-in delivers 95%+ open rates. Stacks on top of the email flows from Moves 1/4 to recover another 3-5% of carts.",
    prereqIds: ["05-migrate-to-klaviyo-postscript"],
    liftLow: 0.03,
    liftHigh: 0.05,
    daysToShip: 3,
    costLow: 100,
    costHigh: 400,
  },
  {
    id: "07-loyalty-program-smile",
    name: "Loyalty program (Smile.io)",
    priorityRank: 8,
    rationale: "Repeat customers spend 67% more. Smile.io's free tier covers 90% of DTC stores; paid tier pays for itself at $500k+ GMV.",
    prereqIds: [],
    liftLow: 0.05,
    liftHigh: 0.15,
    daysToShip: 5,
    costLow: 0,
    costHigh: 250,
  },
  {
    id: "09-mobile-pdp-redesign",
    name: "Mobile PDP redesign",
    priorityRank: 9,
    rationale: "73% of traffic is mobile at ~half the desktop CVR. Closing half the gap ≈ +50% mobile CVR ≈ 10-15% total revenue lift.",
    prereqIds: [],
    liftLow: 0.10,
    liftHigh: 0.20,
    daysToShip: 14,
    costLow: 0,
    costHigh: 2000,
  },
  {
    id: "10-ai-ad-creative-iteration",
    name: "AI ad creative iteration",
    priorityRank: 10,
    rationale: "Ad creative is the #1 lever for paid ROAS. 2-4x creative iteration velocity translates to 15-30% ROAS lift in 90 days.",
    prereqIds: ["06-install-attribution-triplewhale-or-polar"],
    liftLow: 0.15,
    liftHigh: 0.30,
    daysToShip: 30,
    costLow: 200,
    costHigh: 2000,
  },
];

export interface NextMoveResult {
  /** The recommended next move. `null` if every Top-10 move is shipped. */
  move: MoveRecommendation | null;
  /** Moves skipped because they're already shipped. */
  shippedSkipped: MoveRecommendation[];
  /** Moves skipped because a prerequisite hasn't been shipped yet. */
  prereqBlocked: Array<{ move: MoveRecommendation; missingPrereq: string }>;
  /** Personalized $ lift / month at low end (capped, additive). */
  projectedLiftDollarsLow: number;
  /** Personalized $ lift / month at high end (capped, additive). */
  projectedLiftDollarsHigh: number;
  /** Monthly revenue base from Your-store (for context). */
  monthlyRevenue: number;
  /** Days-to-ship the recommended move (for "this week" pacing). */
  daysToShip: number;
  /** Operator cost / month (low..high) for the recommended move. */
  costLow: number;
  costHigh: number;
  /** Human-readable explanation of why this move was picked. */
  rationale: string;
}

/**
 * Pick the next move for the operator based on:
 *   - what's already shipped (skip)
 *   - what the operator's store numbers look like (project $ lift)
 *   - prerequisite dependencies (block, not skip)
 *
 * @param inputs           Your-store numbers. Falls back to defaults if null.
 * @param shippedPlaybooks Map of playbook-id → shipped entry. Already-shipped
 *                         moves are excluded from the queue.
 */
export function pickNextMove(
  inputs: YourStoreInputs | null,
  shippedPlaybooks: Record<string, unknown>
): NextMoveResult {
  const store: YourStoreInputs = inputs ?? YOUR_STORE_DEFAULTS;
  const shippedSet = new Set(Object.keys(shippedPlaybooks));

  // 1. Filter out shipped moves.
  const queued = MOVE_RECOMMENDATIONS.filter((m) => !shippedSet.has(m.id));
  const shippedSkipped = MOVE_RECOMMENDATIONS.filter((m) => shippedSet.has(m.id));

  // 2. Among queued moves, filter out prereq-blocked ones (collect them
  //    separately for the rationale).
  const prereqBlocked: Array<{ move: MoveRecommendation; missingPrereq: string }> = [];
  const eligible: MoveRecommendation[] = [];
  for (const m of queued) {
    const missing = m.prereqIds.find((pid) => !shippedSet.has(pid));
    if (missing) {
      prereqBlocked.push({ move: m, missingPrereq: missing });
    } else {
      eligible.push(m);
    }
  }

  // 3. Sort eligible by priority rank (1 = top of Top-10).
  eligible.sort((a, b) => a.priorityRank - b.priorityRank);

  const move = eligible[0] ?? null;
  const monthlyRevenue = store.aov * store.monthlyOrders;

  // 4. Project $ lift for the recommended move. We surface the
  //    recommended move's lift (not cumulative), so the operator sees
  //    "this single move unlocks $X/mo" — easier to act on than
  //    "shipping all 10 moves unlocks $Y/mo".
  const liftDollarsLow = monthlyRevenue * (move?.liftLow ?? 0);
  const liftDollarsHigh = monthlyRevenue * (move?.liftHigh ?? 0);

  // 5. Build rationale string. Two flavors:
  //    - "Pick this next" — short, when a clean pick is available.
  //    - "Everything shipped" — when queue is empty.
  //    - "Top priority blocked by prerequisite" — when only prereq-blocked remain.
  let rationale: string;
  if (!move) {
    rationale =
      shippedSkipped.length === MOVE_RECOMMENDATIONS.length
        ? `All ${MOVE_RECOMMENDATIONS.length} Top-10 moves shipped. You are running a best-in-class stack — re-audit quarterly or branch into Move #11+ (affiliate / B2B / international).`
        : "Every remaining Top-10 move is blocked by a prerequisite. Open your shipped-playbooks tracker and confirm the prerequisite IDs above are ticked.";
  } else {
    const prereqNote = prereqBlocked.length
      ? ` Skipped ${prereqBlocked.length} higher-priority move${prereqBlocked.length > 1 ? "s" : ""} waiting on a prerequisite.`
      : "";
    rationale = `${move.rationale}${prereqNote}`;
  }

  return {
    move,
    shippedSkipped,
    prereqBlocked,
    projectedLiftDollarsLow: liftDollarsLow,
    projectedLiftDollarsHigh: liftDollarsHigh,
    monthlyRevenue,
    daysToShip: move?.daysToShip ?? 0,
    costLow: move?.costLow ?? 0,
    costHigh: move?.costHigh ?? 0,
    rationale,
  };
}
