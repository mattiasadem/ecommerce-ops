/**
 * `launch-plan-notes-search.ts` — Full-text search across the per-day
 * ship notes for all 10 launch-plan generators (Move #N.4).
 *
 * Companion to `launch-plan-progress-notes.ts` (which stores the notes
 * map). Operators accumulate notes as they ship — "Day 5 blocked:
 * Klaviyo template QA held by brand team", "Day 8 Shop Pay live in
 * prod", "Day 12 pending legal review", etc. With 10 plans × up to 30
 * days × 280 chars each, the operator's notes become a meaningful
 * corpus quickly and a free-text search becomes load-bearing:
 *
 *   - "Find every 'blocked' mention across the 10 plans"
 *   - "Find every 'Klaviyo' reference"
 *   - "Find every note where a specific teammate is @-mentioned"
 *   - "Find every note older than 14 days that hasn't been resolved"
 *
 * The function is pure — it takes the persisted notes map + progress
 * map and a query string and returns ranked match records. No DOM, no
 * localStorage side effects (those live in the component that calls
 * this). The component wraps it with a debounced input + result list.
 */

import { planIdToTitle } from "./launch-plan-progress-notes";

/**
 * A single hit. Combines the matched day, the matched plan, the
 * surrounding note text, and a small "match preview" that highlights
 * the query position (start/end character indices) so the component
 * can render a bold span without re-parsing.
 */
export interface ShipNoteSearchHit {
  planId: string;
  planTitle: string;
  planHref: string;
  /** 1-based day index. */
  day: number;
  /** ISO shipped-at timestamp from the progress map. */
  shippedAt: string;
  /** Full note text (already capped at 280 chars upstream). */
  note: string;
  /** Lower-cased note text — used by the matcher so we don't lowercase the displayed note. */
  noteLower: string;
  /** [start, end) character indices of the match in the original `note` (NOT noteLower). */
  matchRanges: { start: number; end: number }[];
  /** Number of distinct matches in this note (length of matchRanges). */
  matchCount: number;
  /** Ranking score (higher = better). */
  score: number;
}

/** Catalog source — mirrors the canonical titles from the progress lib. */
const PLAN_HREF: Record<string, string> = {
  "pdp-ab": "/pdp-ab-launch-plan",
  "welcome-series": "/welcome-series-launch-plan",
  "abandoned-cart": "/abandoned-cart-launch-plan",
  loyalty: "/loyalty-launch-plan",
  "post-purchase-upsell": "/post-purchase-upsell-launch-plan",
  "sms-welcome-cart": "/sms-welcome-cart-launch-plan",
  "attribution-health-alert": "/attribution-health-alert-launch-plan",
  subscription: "/subscription-launch-plan",
  "3pl": "/3pl-launch-plan",
  "checkout-audit": "/checkout-audit-launch-plan",
};

/**
 * Tokenize a query string into lowercased terms. Empty / pure-whitespace
 * queries return an empty array (caller short-circuits). Quoted phrases
 * are preserved as a single term (e.g. `brand team` matches the literal
 * 5-token sequence, not either word alone).
 */
export function tokenizeQuery(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const out: string[] = [];
  // Match quoted phrases first, then bare words.
  const re = /"([^"]+)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(trimmed)) !== null) {
    const term = (m[1] ?? m[2] ?? "").toLowerCase().trim();
    if (term.length > 0) out.push(term);
  }
  return out;
}

/**
 * Build the search index — flatten the per-plan notes map into a flat
 * list of hit candidates (one per shipped day that has a non-empty
 * note). Pure: no localStorage reads.
 */
export interface ShipNoteSearchIndexEntry {
  planId: string;
  day: number;
  shippedAt: string;
  note: string;
}

export function buildShipNoteSearchIndex(
  notes: Record<string, Record<string, string>>,
  progress: Record<string, Record<string, string>>
): ShipNoteSearchIndexEntry[] {
  const out: ShipNoteSearchIndexEntry[] = [];
  for (const [planId, dayMap] of Object.entries(notes)) {
    const shippedDays = progress[planId] ?? {};
    const planDays = Object.entries(dayMap)
      .map(([dayStr, note]) => ({
        dayStr,
        note: typeof note === "string" ? note : "",
      }))
      .filter((e) => e.note.trim().length > 0);
    for (const { dayStr, note } of planDays) {
      const ts = shippedDays[dayStr];
      if (typeof ts !== "string") continue; // only count notes on ticked days
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      out.push({ planId, day, shippedAt: ts, note });
    }
  }
  // Sort newest-day first for stable output.
  out.sort((a, b) => {
    if (a.shippedAt < b.shippedAt) return 1;
    if (a.shippedAt > b.shippedAt) return -1;
    return a.planId.localeCompare(b.planId) || a.day - b.day;
  });
  return out;
}

/**
 * Find every occurrence of `term` in `textLower` (already lowercased).
 * Returns [start, end) indices into `textLower`. Used to render a bold
 * span in the displayed note (which is the original case — indices
 * match because case is preserved 1:1 between original and lower).
 */
function findTermIndices(textLower: string, term: string): number[] {
  if (!term) return [];
  const out: number[] = [];
  let from = 0;
  while (from <= textLower.length - term.length) {
    const idx = textLower.indexOf(term, from);
    if (idx < 0) break;
    out.push(idx);
    from = idx + term.length;
  }
  return out;
}

/**
 * Merge overlapping [start, end) ranges into disjoint spans.
 */
function mergeRanges(
  ranges: { start: number; end: number }[]
): { start: number; end: number }[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: { start: number; end: number }[] = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.start <= cur.end) {
      cur.end = Math.max(cur.end, r.end);
    } else {
      out.push(cur);
      cur = { ...r };
    }
  }
  out.push(cur);
  return out;
}

/**
 * Run the search. Returns up to `limit` ranked matches plus the total
 * hit count (before truncation). Empty query = empty result set.
 */
export function searchShipNotes(
  index: ShipNoteSearchIndexEntry[],
  query: string,
  limit = 50
): { hits: ShipNoteSearchHit[]; total: number; terms: string[] } {
  const terms = tokenizeQuery(query);
  if (terms.length === 0 || index.length === 0) {
    return { hits: [], total: 0, terms: [] };
  }
  const total = index.length;
  const hits: ShipNoteSearchHit[] = [];
  for (const entry of index) {
    const noteLower = entry.note.toLowerCase();
    const allRanges: { start: number; end: number }[] = [];
    let termsHit = 0;
    let firstTermMatchAt = -1;
    for (const term of terms) {
      const idxs = findTermIndices(noteLower, term);
      if (idxs.length > 0) {
        termsHit += 1;
        if (firstTermMatchAt < 0 || idxs[0] < firstTermMatchAt) {
          firstTermMatchAt = idxs[0];
        }
        for (const i of idxs) {
          allRanges.push({ start: i, end: i + term.length });
        }
      }
    }
    if (allRanges.length === 0) continue;
    const merged = mergeRanges(allRanges);
    // Score:
    //   +100 per matched term (distinct terms matter more than one term twice)
    //   +5 per match occurrence
    //   +20 if the note starts with the first term (likely headline)
    //   +30 if terms.length > 1 and ALL terms match (multi-term AND — most
    //       important signal for "find notes that mention every concept")
    //   -0.01 * firstMatchIndex (earlier in the note ranks higher; weak)
    const allMatched = termsHit === terms.length ? 30 : 0;
    const headline = firstTermMatchAt === 0 ? 20 : 0;
    const score =
      100 * termsHit +
      5 * allRanges.length +
      headline +
      allMatched -
      0.01 * Math.max(firstTermMatchAt, 0);
    hits.push({
      planId: entry.planId,
      planTitle: planIdToTitle(entry.planId),
      planHref: PLAN_HREF[entry.planId] ?? "#",
      day: entry.day,
      shippedAt: entry.shippedAt,
      note: entry.note,
      noteLower,
      matchRanges: merged,
      matchCount: merged.length,
      score,
    });
  }
  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.shippedAt < b.shippedAt) return 1;
    if (a.shippedAt > b.shippedAt) return -1;
    return a.planId.localeCompare(b.planId) || a.day - b.day;
  });
  return { hits: hits.slice(0, limit), total, terms };
}

/**
 * Render a snippet of the note that brackets the matched range(s).
 * Returns a 3-tuple: `[prefix, matched, suffix]` where `matched` is the
 * substring spanning every match range (plus a small pad if the note
 * is long). Caller renders the middle with a bold span around the
 * in-range character indices.
 */
export function snippetForHit(
  hit: ShipNoteSearchHit,
  pad = 30
): {
  prefix: string;
  matched: string;
  suffix: string;
  /** Local start index of the first match within the returned `matched`. */
  localMatchStart: number;
  /** Local end index (exclusive) of the last match within the returned `matched`. */
  localMatchEnd: number;
} {
  const note = hit.note;
  if (hit.matchRanges.length === 0) {
    return {
      prefix: note.length > 2 * pad ? note.slice(0, pad) + "…" : note,
      matched: "",
      suffix: "",
      localMatchStart: 0,
      localMatchEnd: 0,
    };
  }
  const first = hit.matchRanges[0];
  const last = hit.matchRanges[hit.matchRanges.length - 1];
  const start = Math.max(0, first.start - pad);
  const end = Math.min(note.length, last.end + pad);
  const prefix = (start > 0 ? "…" : "") + note.slice(start, first.start);
  const matched = note.slice(first.start, last.end);
  const suffix = note.slice(last.end, end) + (end < note.length ? "…" : "");
  const localMatchStart = first.start - first.start; // always 0
  const localMatchEnd = last.end - first.start;
  return { prefix, matched, suffix, localMatchStart, localMatchEnd };
}

/**
 * Highlight helper — split a string at the given character index pair
 * and return the three pieces as an array so the component can render
 * `<mark>` around the middle piece.
 */
export interface HighlightedSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Apply the merged match ranges to `matched` text and produce a list of
 * segments the component renders with a highlight. The input is
 * assumed to already be the matched substring (not the whole note);
 * the local start/end are absolute indices into `matched`.
 */
export function highlightMatchedText(
  matched: string,
  localMatchStart: number,
  localMatchEnd: number
): HighlightedSegment[] {
  if (matched.length === 0) return [];
  if (localMatchStart >= localMatchEnd) {
    return [{ text: matched, highlighted: false }];
  }
  const before = matched.slice(0, localMatchStart);
  const mid = matched.slice(localMatchStart, localMatchEnd);
  const after = matched.slice(localMatchEnd);
  const out: HighlightedSegment[] = [];
  if (before) out.push({ text: before, highlighted: false });
  if (mid) out.push({ text: mid, highlighted: true });
  if (after) out.push({ text: after, highlighted: false });
  return out;
}

/**
 * Render the search results as a paste-ready standup block. Each hit
 * becomes one `- **<plan title>** — Day N (YYYY-MM-DD): <note>`
 * bullet. Empty result = a single line "_no matches — try a broader
 * term or shorter phrase_".
 */
export function searchShipNotesToMarkdown(
  result: ReturnType<typeof searchShipNotes>
): string {
  const lines: string[] = [];
  lines.push("# Launch-plan ship-notes search");
  lines.push("");
  if (result.terms.length === 0) {
    lines.push("_No query — type to search across all 10 plans._");
    return lines.join("\n");
  }
  lines.push(`- **Query:** \`${result.terms.join(" ")}\``);
  lines.push(`- **Matches:** ${result.hits.length} (of ${result.total} indexed notes)`);
  lines.push("");
  if (result.hits.length === 0) {
    lines.push("_No matches — try a broader term or shorter phrase._");
    return lines.join("\n");
  }
  for (const h of result.hits) {
    lines.push(
      `- **${h.planTitle}** — Day ${h.day} (${h.shippedAt.slice(0, 10)}): ${h.note}`
    );
  }
  return lines.join("\n");
}