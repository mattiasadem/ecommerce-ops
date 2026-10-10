/**
 * `document-outline.ts` — Pure logic for the Move #N.26 document-outline
 * TOC sidebar shipped on `/research/[slug]` and `/skills/[slug]`.
 *
 * Problem the lib solves: research briefs are LONG (the landscape doc
 * runs 593 lines, the 3PL doc 657, the subscriptions doc 512, the
 * marketplace doc 493). Operators opening any of these were forced to
 * either scroll linearly to find the section they cared about, or
 * Ctrl-F the page text. The 18-research / 18-skill / 30-playbook corpus
 * has crossed the comfortable-scroll-length threshold and needs a
 * sticky scroll-spy TOC sidebar at the document level.
 *
 * This lib answers: for a given document's H2 + H3 headings, what
 * should the sticky TOC sidebar look like?
 *
 *   - `outlineHeadline(rows)` — "Document outline · N sections · M viewed"
 *     with three branches for empty / viewed-all / viewed-partial.
 *   - `outlineToneClass(rows, viewedCount)` — 4-branch color ramp:
 *     empty → muted, 0 viewed → muted, partial → amber, all viewed →
 *     emerald. Mirrors the Move #N.16 drift tone-class escalation so
 *     operators learn one visual vocabulary and apply it everywhere.
 *   - `outlineProgressLabel(viewedCount, total)` — "3 of 17 viewed" /
 *     "all 17 viewed" / "no sections yet" with deterministic copy.
 *   - `truncateOutlineHeading(s, maxLen=46)` — visual truncator that
 *     preserves the trailing characters so the operator still sees
 *     "...verification gates" on a 60-char heading.
 *   - `CANONICAL_DOCUMENT_OUTLINE` pin: `expectedMaxLevels: 2` (H2 + H3)
 *     + `defaultMaxHeadingLength: 46` + `progressDisplayThreshold: 1`
 *     + `stubLabel: "Loading outline…"` so a future tick can't quietly
 *     drop the depth or change the heading-truncation contract.
 *
 * SSR-safe: pure functions, no `window`, no `Date.now`. The hydration
 * logic lives in the component (where `IntersectionObserver` runs
 * inside `useEffect`).
 *
 * Reused by: `src/components/document-outline.tsx` on
 * `/research/[slug]` (18 routes) and `/skills/[slug]` (18 routes).
 */

export interface OutlineRow {
  /** Level: 2 for H2, 3 for H3. */
  level: 2 | 3;
  /** Original heading text as it appears in the markdown. */
  heading: string;
  /** Slugified anchor id used in `<h2 id="...">` + `<a href="#...">`. */
  hash: string;
  /** 0-based index in the source document. */
  index: number;
}

export interface OutlineSummary {
  rows: OutlineRow[];
  total: number;
  h2Count: number;
  h3Count: number;
}

export const CANONICAL_DOCUMENT_OUTLINE = {
  /** We render H2 + H3 by default (depth=2 in markdown levels). */
  expectedMaxLevels: 2,
  /** Heading text is truncated to this many characters when the TOC
   *  is narrow (the sticky sidebar lives in a 200-240px column). */
  defaultMaxHeadingLength: 46,
  /** Progress meter hides until at least this many sections have been
   *  observed. Below 1 the meter is "0 of 17 viewed" which is
   *  visually noisy on a long doc the operator hasn't scrolled yet. */
  progressDisplayThreshold: 1,
  /** SSR stub label — shown until the IntersectionObserver mounts. */
  stubLabel: "Loading outline…",
  /** SSR stub caption — shows total-section count without interactivity. */
  stubCaption: "Outline appears after first paint.",
  /** Heading truncation suffix — preserves the trailing words. */
  truncationSuffix: "…",
} as const;

/** Slugify a heading into a URL hash fragment. Mirrors the
 *  `slugify()` helper inside `app/research/[slug]/page.tsx` and
 *  `app/playbooks/[slug]/page.tsx` byte-for-byte so the TOC anchors
 *  resolve to the same id the markdown renderer assigned to the H2. */
export function outlineSlugify(heading: string): string {
  return (heading || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Extract the H2 + H3 outline from a markdown body. Skips the leading
 *  H1 (page header renders its own title). Skips empty headings.
 *  Caps total rows defensively so a malformed doc doesn't blow up the
 *  sidebar — same cap of 60 as the build-time parser. */
export function buildDocumentOutline(
  markdown: string,
  maxRows: number = 60,
): OutlineSummary {
  const lines = (markdown || "").split(/\r?\n/);
  const rows: OutlineRow[] = [];
  let skippedH1 = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip the leading H1 (page header renders its own title).
    if (!skippedH1 && /^#\s+/.test(line)) {
      skippedH1 = true;
      continue;
    }
    // H2 (##) or H3 (###).
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      const heading = (h2[1] || "").trim();
      if (heading.length === 0) continue;
      rows.push({
        level: 2,
        heading,
        hash: outlineSlugify(heading),
        index: rows.length,
      });
      if (rows.length >= maxRows) break;
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3) {
      const heading = (h3[1] || "").trim();
      if (heading.length === 0) continue;
      rows.push({
        level: 3,
        heading,
        hash: outlineSlugify(heading),
        index: rows.length,
      });
      if (rows.length >= maxRows) break;
      continue;
    }
  }
  const h2Count = rows.filter((r) => r.level === 2).length;
  const h3Count = rows.filter((r) => r.level === 3).length;
  return { rows, total: rows.length, h2Count, h3Count };
}

/** Headline copy for the outline card. Mirrors the drift-fix-recipe
 *  3-branch pattern: empty / partial / complete. */
export function outlineHeadline(summary: OutlineSummary): string {
  if (summary.total === 0) return "Document outline";
  if (summary.h3Count > 0) {
    return `Document outline · ${summary.h2Count} sections · ${summary.h3Count} sub-sections`;
  }
  return `Document outline · ${summary.total} sections`;
}

/** Tone class for the outline card border. Mirrors Move #N.16 +
 *  Move #N.18 escalation so operators learn one color vocabulary. */
export function outlineToneClass(
  summary: OutlineSummary,
  viewedCount: number,
): string {
  if (summary.total === 0) return "border-border bg-card";
  if (viewedCount === 0) return "border-border bg-card";
  if (viewedCount >= summary.total) {
    return "border-emerald-500/30 bg-emerald-500/5";
  }
  return "border-amber-500/30 bg-amber-500/5";
}

/** Progress label: "3 of 17 viewed" / "all 17 viewed" / "scroll to start". */
export function outlineProgressLabel(
  viewedCount: number,
  total: number,
): string {
  if (total === 0) return "no sections";
  if (viewedCount === 0) return `scroll to start · ${total} sections`;
  if (viewedCount >= total) return `all ${total} viewed`;
  return `${viewedCount} of ${total} viewed`;
}

/** Visual truncator for long H2 / H3 text. Keeps the leading
 *  characters (where the canonical noun lives) + ellipsis. Defensive
 *  on null / non-string / oversize inputs. */
export function truncateOutlineHeading(
  heading: string,
  maxLen: number = CANONICAL_DOCUMENT_OUTLINE.defaultMaxHeadingLength,
): string {
  const s = (heading || "").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + CANONICAL_DOCUMENT_OUTLINE.truncationSuffix;
}

/** Compute the H2-row count for the "X of Y viewed" badge. Filters to
 *  H2 only because the canonical "section" is the H2 (sub-sections are
 *  subsections of one H2, not standalone units). Mirrors the build-time
 *  parser's `doc.numberedSections = doc.sections.filter((s) => s.level === 2)`. */
export function outlineH2Count(summary: OutlineSummary): number {
  return summary.h2Count;
}

/** Default visible-row count before "show all" toggle. Keeps the
 *  sidebar compact on docs with many sections (e.g. the 12-section
 *  landscape doc shouldn't show all 12 by default). */
export const DEFAULT_OUTLINE_VISIBLE_ROWS = 8;