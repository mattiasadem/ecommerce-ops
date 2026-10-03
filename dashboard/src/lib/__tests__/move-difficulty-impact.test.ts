/**
 * Smoke tests for `dashboard/src/lib/move-difficulty-impact.ts` — the
 * 2D bubble-chart engine that complements the per-move Top-10 projection
 * on `/top-10`.
 *
 * Run with: `npx jiti src/lib/__tests__/move-difficulty-impact.test.ts`
 *
 * Coverage:
 *   - `classifyMove` (shipped / eligible / prereq-blocked)
 *   - `countDownstreamUnlocks` (counts moves whose prereqs include the
 *     target id, ignoring already-shipped moves)
 *   - `buildMoveDifficultyImpactMap` (10 entries, blocker-chain correct,
 *     empty-shipped edge case, defaults personalization flag)
 *   - `renderDifficultyImpactMarkdown` (header + per-move table rows
 *     with status glyphs)
 */

import {
  buildMoveDifficultyImpactMap,
  classifyMove,
  countDownstreamUnlocks,
  renderDifficultyImpactMarkdown,
} from "../move-difficulty-impact";
import { MOVE_RECOMMENDATIONS } from "../next-move";
import { YOUR_STORE_DEFAULTS } from "../your-store";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const STORE_5K = { aov: 100, monthlyOrders: 50, grossMargin: 0.6 }; // $5k/mo

// === classifyMove ============================================================

const abandoned = MOVE_RECOMMENDATIONS.find((m) => m.id === "01-abandoned-cart-flow-klaviyo")!;
const smsCart = MOVE_RECOMMENDATIONS.find((m) => m.id === "06-sms-welcome-and-cart-abandon")!;
const migrate = MOVE_RECOMMENDATIONS.find((m) => m.id === "05-migrate-to-klaviyo-postscript")!;
const aiCreative = MOVE_RECOMMENDATIONS.find((m) => m.id === "10-ai-ad-creative-iteration")!;

check("classifyMove: shipped returns shipped", classifyMove(abandoned, new Set([abandoned.id])).status === "shipped");
check(
  "classifyMove: eligible when no prereqs",
  classifyMove(abandoned, new Set()).status === "eligible"
);
check(
  "classifyMove: prereq-blocked when missing prereq",
  classifyMove(smsCart, new Set()).status === "prereq-blocked" &&
    classifyMove(smsCart, new Set()).missingPrereqId === migrate.id
);
check(
  "classifyMove: eligible when prereq shipped",
  classifyMove(smsCart, new Set([migrate.id])).status === "eligible"
);
check(
  "classifyMove: shipped wins over missing prereq",
  classifyMove(aiCreative, new Set([aiCreative.id])).status === "shipped"
);

// === countDownstreamUnlocks ==================================================

check(
  "countDownstreamUnlocks: migrate has 1 downstream (sms-cart)",
  countDownstreamUnlocks(migrate.id, new Set()).count === 1
);
check(
  "countDownstreamUnlocks: attribution has 1 downstream (ai-creative)",
  countDownstreamUnlocks("06-install-attribution-triplewhale-or-polar", new Set()).count === 1
);
check(
  "countDownstreamUnlocks: abandoned has 0 downstream",
  countDownstreamUnlocks(abandoned.id, new Set()).count === 0
);
check(
  "countDownstreamUnlocks: shipped targets don't count",
  countDownstreamUnlocks(migrate.id, new Set([smsCart.id])).count === 0
);

// === buildMoveDifficultyImpactMap ============================================

const emptyMap = buildMoveDifficultyImpactMap(STORE_5K, {});
check("build: 10 entries always", emptyMap.moves.length === 10);
check("build: 0 shipped on empty input", emptyMap.shippedCount === 0);
check("build: monthly revenue = aov × orders", emptyMap.monthlyRevenue === 5000);
check("build: usingDefaults false on custom store", emptyMap.usingDefaults === false);
check("build: maxLiftDollars > 0 on real data", emptyMap.maxLiftDollars > 0);
check("build: maxCostDollars > 0", emptyMap.maxCostDollars > 0);
check("build: maxDays >= 14 (longest move)", emptyMap.maxDays >= 14);

// shipped-3 case
const shipped3 = buildMoveDifficultyImpactMap(STORE_5K, {
  [abandoned.id]: { shippedAt: "2026-09-01T00:00:00Z" },
  [migrate.id]: { shippedAt: "2026-09-02T00:00:00Z" },
  ["03-checkout-audit-baymard"]: { shippedAt: "2026-09-03T00:00:00Z" },
});
check("build: shippedCount=3 on 3 shipped", shipped3.shippedCount === 3);
check("build: eligibleCount=6 on 3 shipped (no prereqs block those)", shipped3.eligibleCount === 6);
check("build: prereqBlockedCount=1 (smsCart still blocked on migrate)", shipped3.prereqBlockedCount === 1);

// Blocker chain: after 3 shipped, ai-creative (which still needs attribution) 
// is blocked. If we ship attribution next, it unblocks ai-creative. So the
// blocker-chain should recommend the attribution move (priorityRank 6) as
// it has 1 downstream unlock (ai-creative).
const blockerExists = shipped3.blockerChain !== null;
check("build: blocker chain exists when eligible move has downstream", blockerExists);
if (shipped3.blockerChain) {
  check(
    "build: blocker chain names attribution move",
    shipped3.blockerChain.move.id === "06-install-attribution-triplewhale-or-polar"
  );
  check(
    "build: blocker chain says 1 downstream unlock",
    shipped3.blockerChain.downstreamUnlocks === 1
  );
  check(
    "build: blocker chain rationale mentions unblocks",
    /unblocks\s+1\s+downstream/.test(shipped3.blockerChain.rationale)
  );
}

// All-shipped case
const allShipped = buildMoveDifficultyImpactMap(
  STORE_5K,
  Object.fromEntries(MOVE_RECOMMENDATIONS.map((m) => [m.id, { shippedAt: "2026-01-01" }]))
);
check("build: all-shipped → shippedCount=10", allShipped.shippedCount === 10);
check("build: all-shipped → eligibleCount=0", allShipped.eligibleCount === 0);
check("build: all-shipped → blockerChain=null", allShipped.blockerChain === null);

// Null store → defaults
const nullStore = buildMoveDifficultyImpactMap(null, {});
check("build: null store → usingDefaults true", nullStore.usingDefaults === true);
check("build: null store → monthlyRevenue=defaults*defaults", nullStore.monthlyRevenue > 0);

// === renderDifficultyImpactMarkdown ==========================================

const md = renderDifficultyImpactMarkdown(emptyMap, { ...STORE_5K, aov: 100, monthlyOrders: 50 });
check("md: header contains 'Move Difficulty'", /Move Difficulty/.test(md));
check("md: monthly revenue line", /Monthly revenue base: \$5,000/.test(md));
check("md: contains all 10 priority ranks", (md.match(/\|\s+\d+\s+\|/g) ?? []).length >= 10);
check("md: contains shipped count", /0 shipped/.test(md));
check("md: contains 'eligible' status", /eligible/.test(md));
check("md: contains 'blocked' status", /blocked on/.test(md));
check("md: table header row", /\| # \| Move \| Status \| Days \| Lift\/mo \| Cost\/mo \| Unlocks \|/.test(md));

// Summary
console.log("");
console.log(`Total: ${passed + failed}, passed: ${passed}, failed: ${failed}`);
if (failed > 0) {
  console.error("\nFailures:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
process.exit(0);
