/**
 * `top10-playbook-mapping.ts` — canonical map from Top-10 move names
 * (as they appear in `content.top10.status[i].move`) to their
 * playbook file slug (without `.md`).
 *
 * Why this lives in a lib, not inline in the component:
 *   1. The mapping is the same source-of-truth that
 *      `src/lib/thirty-day-plan.ts` and `src/lib/next-move.ts` already
 *      use for their `MOVE_TEMPLATES` and `MOVE_CATALOG` arrays.
 *   2. When a new move ships, the dashboard needs ONE place to update
 *      so the Overview card, the 30-day plan, the next-move
 *      recommender, and the Top-10 projection all stay in sync.
 *   3. The `/playbooks` deep-link anchor convention is
 *      `/playbooks#<file-without-.md>`, used identically by the
 *      retention page and the next-move widget — keep this lib
 *      consistent with that convention.
 *
 * Schema:
 *   - Keys are Top-10 move names, exactly as rendered in the source
 *     `research/02-top-10-leverage-moves.md` table and as parsed into
 *     `content.top10.status[i].move`. Sub-numbered moves use the
 *     `9.5.` / `6.5.` / `6.6.` / etc. prefix verbatim.
 *   - Values are an array of playbook file slugs because some moves
 *     cover multiple playbooks (e.g. Move #6.5 covers BOTH the
 *     attribution-quality-audit playbook AND the weekly-rollup-trend
 *     playbook). Render all of them in the Overview "Playbooks
 *     unlocked" list.
 *   - Missing key → the move has no direct playbook (e.g. a
 *     meta-move or a roadmap item still in flight). The Overview
 *     card surfaces a "playbook not yet authored" badge for those.
 *
 * Stable, deterministic. If a move's playbook gets renamed, update
 * the value here AND the matching entry in
 * `src/lib/thirty-day-plan.ts` + `src/lib/next-move.ts`.
 */
export const TOP10_PLAYBOOK_MAP: Record<string, string[]> = {
  // --- Top 10 highest-leverage moves (rank 1..10) ---
  "1. Abandoned cart flow": ["01-abandoned-cart-flow-klaviyo"],
  "2. Post-purchase upsell": ["02-post-purchase-upsell-reconvert"],
  "3. Checkout audit": ["03-checkout-audit-baymard"],
  "4. Welcome series": ["04-welcome-series-klaviyo"],
  "5. Migrate to Klaviyo+Postscript": ["05-migrate-to-klaviyo-postscript"],
  "6. Install Triple Whale": ["06-install-attribution-triplewhale-or-polar"],
  "7. SMS welcome + cart": ["06-sms-welcome-and-cart-abandon"],
  "8. Loyalty program": ["07-loyalty-program-smile"],
  "9. Mobile PDP redesign": ["09-mobile-pdp-redesign"],
  "10. AI ad creative": ["10-ai-ad-creative-iteration"],

  // --- Sub-numbered moves (the canonical "extension track" 6.x / 9.x) ---
  "9.5. PDP A/B testing": ["09.5-pdp-ab-testing-program"],
  "6.5. Attribution quality audit": [
    "06.5-attribution-quality-audit",
    "06.5-weekly-rollup-trend-launch",
  ],
  "6.6. TikTok attribution quality audit": ["06.6-tiktok-attribution-quality-audit"],
  "6.7. Snap + Pinterest attribution quality audit": [
    "06.7-snap-pinterest-attribution-quality-audit",
  ],
  "6.8. Cross-platform attribution drift unification": [
    "06.8-cross-platform-attribution-drift-unification",
  ],
  "6.9. Unified attribution dashboard": ["06.10-attribution-health-alert-webhook-launch"],
};

export interface Top10PlaybookLink {
  /** Playbook file slug without `.md` — used as the anchor id on /playbooks. */
  slug: string;
  /** Human-readable display name. Falls back to the slug if not provided. */
  title: string;
  /** Deep link to the playbook section on /playbooks. */
  href: string;
}

/**
 * Resolve a Top-10 move name into the playbook links it unlocks.
 *
 * - Empty / unknown moves → empty array (Overview card treats as
 *   "playbook not yet authored").
 * - Multiple playbooks per move → returns them in canonical order so
 *   the rendered list is stable across reloads.
 *
 * Pure / deterministic — safe to call inside `useMemo`.
 */
export function resolvePlaybookLinksForMove(move: string): Top10PlaybookLink[] {
  const slugs = TOP10_PLAYBOOK_MAP[move];
  if (!slugs || slugs.length === 0) return [];
  return slugs.map((slug) => ({
    slug,
    title: slug
      .replace(/^\d+(\.\d+)?-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: `/playbooks#${slug}`,
  }));
}

/**
 * The canonical playbook file slug for a given move, when a 1:1
 * mapping exists. Returns the first playbook if the move unlocks
 * more than one (the canonical primary). Used by components that
 * only have room for a single deep link (e.g. the 30-day-plan day
 * pills).
 *
 * Returns `null` when the move has no playbook — same contract as
 * `resolvePlaybookLinksForMove` so call sites don't need a
 * second guard.
 */
export function resolvePrimaryPlaybookSlugForMove(move: string): string | null {
  const links = resolvePlaybookLinksForMove(move);
  return links.length > 0 ? links[0].slug : null;
}
