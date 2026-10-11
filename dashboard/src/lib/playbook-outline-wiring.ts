/**
 * `playbook-outline-wiring.ts` — Move #N.27.1 wiring decisions for
 * adding the sticky `<DocumentOutline>` TOC sidebar to
 * `/playbooks/[slug]` (30 detail pages).
 *
 * Problem the lib solves: playbook bodies are LONG (the abandon-cart
 * playbook has 50+ sections, the post-purchase upsell playbook 40+,
 * the welcome-series playbook 35+, etc.) — far longer than the
 * research + skill docs. Operators opening any of these were forced
 * to either scroll linearly or Ctrl-F the page text. The 30-playbook
 * catalog has crossed the comfortable-scroll-length threshold and
 * needs the same sticky scroll-spy TOC treatment the research +
 * skill pages already got in Move #N.26.
 *
 * This lib is intentionally tiny — just the wiring constants the
 * playbook detail page needs to mount `<DocumentOutline>` correctly.
 * The component itself lives in `src/components/document-outline.tsx`;
 * the pure outline logic lives in `src/lib/document-outline.ts`; the
 * tests for that lib live in `src/lib/__tests__/document-outline.test.ts`.
 * Re-exporting them through this file would only add a level of
 * indirection with no payoff.
 *
 * What this lib DOES hold:
 *
 *   - `PLAYBOOK_OUTLINE_WIRING` pin: the 2-column grid template
 *     (`md:grid-cols-[220px_minmax(0,1fr)]`) + sticky top offset
 *     (`top-20`) + auto-expand-first-N-H2s count (2) + outer / content
 *     max-w + `data-document-body` attribute names — so a future tick
 *     can't quietly change the sticky offset, the column ratio, or
 *     drop the IntersectionObserver scoping attribute without bumping
 *     the canonical pin.
 *   - `PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH` (46, identical to
 *     `CANONICAL_DOCUMENT_OUTLINE.defaultMaxHeadingLength`) — kept as
 *     a separate export so the playbook page's heading-truncation
 *     contract is grep-able from the playbook context.
 *   - `playbookOutlineIsWorthMounting(summary)` — guard against
 *     rendering the outline on playbooks with only 0-1 H2s. On those
 *     playbooks the outline takes sidebar real-estate for one row,
 *     which is more noise than signal. Returns false for total < 2
 *     rows; the playbook page can short-circuit to null.
 *
 * The headline copy ("Playbook outline · N sections · M sub-sections")
 * is rendered by the existing `<DocumentOutline>` component which
 * calls `outlineHeadline()` from the shared `document-outline.ts`
 * lib. To preserve a Playbook-specific label, the playbook page
 * passes a `headlineOverride` prop (added in this tick) that the
 * `<DocumentOutline>` component renders in place of the default
 * "Document outline" prefix when supplied.
 *
 * SSR-safe: pure constants + a single pure helper, no `window`,
 * no `Date.now`. Mounted in `app/playbooks/[slug]/page.tsx` between
 * the header cards (PlaybookShippedToggle + RealizedRoiLedgerPanel +
 * CalculatorRoiChip + PlaybookCalculator) and the rendered markdown
 * body.
 */

import type { OutlineSummary } from "./document-outline";

export const PLAYBOOK_OUTLINE_WIRING = {
  /** Sticky offset for the outline sidebar. Matches the existing
   *  site header height so the outline pins below it on desktop. */
  stickyTopClass: "top-20",
  /** 2-column grid template (220px sidebar + flexible content). Matches
   *  research + skill pages so the operator learns one layout. */
  gridTemplateClass: "md:grid-cols-[220px_minmax(0,1fr)]",
  /** Gap between the sidebar and content columns. Same 6 (24px) as
   *  research + skill pages. */
  gridGapClass: "gap-6",
  /** Outline sidebar column placement. `order-1 md:order-1` keeps
   *  the outline at the top on mobile (single column) and on the left
   *  on desktop. */
  sidebarOrderClass: "order-1 md:order-1",
  /** Content column placement. `order-2 md:order-2` stacks the
   *  content under the outline on mobile, to the right on desktop. */
  contentOrderClass: "order-2 md:order-2",
  /** Auto-expand the first N H2s in the outline so the operator sees
   *  sub-sections immediately. Matches Move #N.26's research + skill
   *  behavior (first 2). */
  autoExpandFirstNH2s: 2,
  /** Outer container max-w. Raised from `max-w-3xl` to `max-w-5xl` so
   *  the 2-column grid + sticky sidebar fits inside the viewport
   *  without the prose line-length blowing out. The right content
   *  column keeps `max-w-3xl` for line-length. */
  outerMaxWidthClass: "max-w-5xl",
  /** Right-column max-w. Same 3xl as research + skill pages so prose
   *  line-length is consistent across detail pages. */
  contentMaxWidthClass: "max-w-3xl",
  /** `data-document-body="true"` attribute on the markdown article
   *  scopes the IntersectionObserver so it only picks up H2/H3 from
   *  THIS article (not sibling cards above). */
  documentBodyAttribute: "data-document-body",
  documentBodyValue: "true",
  /** Headline override passed to <DocumentOutline headlinePrefix=...>
   *  so the operator sees "Playbook outline · N sections" instead of
   *  the generic "Document outline · N sections". */
  headlinePrefix: "Playbook outline",
} as const;

/** Heading-truncation length for the outline sidebar. Mirrors
 *  `CANONICAL_DOCUMENT_OUTLINE.defaultMaxHeadingLength` from
 *  `document-outline.ts` so the playbook page's heading-truncation
 *  contract is grep-able from the playbook context. */
export const PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH = 46;

/** Guard against mounting the outline on playbooks with too few H2s.
 *  Below 2 rows the outline takes sidebar real-estate for one
 *  row, which is more noise than signal. The playbook page can
 *  short-circuit to null when this returns false. */
export function playbookOutlineIsWorthMounting(
  summary: OutlineSummary,
): boolean {
  return summary.total >= 2;
}

/** Content-column max-w class. Reused by both the outer 2-col grid
 *  (raised to `max-w-5xl`) and the inner content column (kept at
 *  `max-w-3xl`) so the prose line-length stays readable. */
export const playbookOutlineContentColumnClass =
  PLAYBOOK_OUTLINE_WIRING.contentMaxWidthClass;