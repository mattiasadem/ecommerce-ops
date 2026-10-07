/**
 * `reread-freshness-gap.ts` — Move #N.21 pure logic. Closes the
 * final leg of the shipped-tracker trio:
 *
 *   Move #N.16 (drift detector)        → "is this playbook stale?"
 *   Move #N.18 (drift fix recipe)      → "where should I re-read first?"
 *   Move #N.20 (re-read progress)      → "have I marked the recipe as re-read?"
 *   Move #N.21 (re-read freshness gap) → "is the playbook I just re-read STILL
 *                                          current, or has it been touched
 *                                          since I marked it?"
 *
 * Problem the lib solves: an operator marks a section as re-read
 * (Move #N.20). The dashboard then forgets to remind the operator
 * that the playbook itself can keep evolving. Two weeks later the
 * operator opens the page and discovers the section they thought
 * they'd "mastered" has been updated by a sister-cron tick — the
 * mark is technically still there, but the underlying material has
 * shifted under it. The canonical "I re-read this a month ago, has
 * it changed since?" question has no answer.
 *
 * This lib compares, for every (playbook, section) re-read mark, the
 * mark's `reReadAt` against the playbook's `lastTouched`. If the
 * playbook was updated after the mark, the section is "stale since
 * re-read" (rose); if the mark is at or after the touch, the section
 * is "current as of re-read" (emerald); if the playbook has no
 * `lastTouched`, the section is "unknown" (muted). A "freshness gap"
 * measured in days is also surfaced so the operator can prioritize.
 *
 * Why a separate lib (not folded into recipe-reread): the recipe
 * re-read progress card already has four things on it (per-section
 * Mark / Unmark, per-playbook Reset, progress bar, Copy log). Adding
 * a fifth dimension (stale-vs-current badge per section, plus a
 * dedicated card) would overload the existing card. A separate card
 * keeps each surface focused on one canonical question, which is
 * the same pattern Move #N.16 / N.18 / N.20 use.
 *
 * Pure logic: no React, no DOM, no localStorage side effects. Caller
 * passes the recipe (Move #N.18) + the re-read map (Move #N.20) +
 * the playbook catalog (parsed at build time, includes `lastTouched`).
 */

import type { Playbook } from "./content";
import {
  type DriftFixRecipe,
  type DriftFixRecipeSummary,
  findPlaybook,
} from "./drift-fix-recipe";
import {
  type ReReadMap,
  type ReReadSection as ReReadProgressSection,
  type ReReadSummary,
} from "./recipe-reread";

/** ---------------------------------------------------------------------------
 *  Freshness state of a single (playbook, section) re-read mark vs the
 *  playbook's lastTouched timestamp.
 *  ------------------------------------------------------------------------- */
export type SectionFreshnessState =
  /** Playbook was updated AFTER the operator's re-read mark. */
  | "stale-since-reread"
  /** Playbook was last touched at or before the re-read mark. */
  | "current-as-of-reread"
  /** No `lastTouched` recorded for the playbook, so we cannot tell. */
  | "unknown";

export interface SectionFreshness {
  /** Section heading text (mirrors ReReadSection.heading). */
  heading: string;
  /** Short label from the priority keyword (e.g. "pitfalls"). */
  label: string;
  /** Anchor hash used by `/playbooks/[slug]#[hash]` links. */
  hash: string;
  /** Operator's re-read mark, or null when not marked. */
  reReadAt: string | null;
  /** Days since the mark, or null when not marked. */
  reReadDaysAgo: number | null;
  /** Playbook's lastTouched, or null when missing. */
  lastTouched: string | null;
  /** Days since the playbook was last touched, or null when missing. */
  lastTouchedDaysAgo: number | null;
  /** Freshness verdict. */
  state: SectionFreshnessState;
  /** Days between the playbook's lastTouched and the re-read mark.
   *  Positive → stale (playbook touched AFTER mark). Negative →
   *  current (mark is AFTER touch). Null → unknown (missing input). */
  gapDays: number | null;
}

/** Per-shipped-playbook re-read freshness rollup. */
export interface ReReadFreshnessRow {
  /** Playbook id. */
  id: string;
  /** Display title. */
  title: string;
  /** Total recipe sections on this playbook. */
  totalSections: number;
  /** Number of sections marked re-read (regardless of freshness). */
  markedCount: number;
  /** Number of those marks that are now stale (playbook updated since). */
  staleCount: number;
  /** Number of those marks that are still current. */
  currentCount: number;
  /** Number of marks we cannot classify (missing lastTouched). */
  unknownCount: number;
  /** Worst-case `gapDays` (largest positive) across this playbook's
   *  stale sections. Null when no stale section exists. */
  maxGapDays: number | null;
  /** Per-section rollup, in the same order as the recipe. */
  sections: SectionFreshness[];
}

export interface ReReadFreshnessSummary {
  rows: ReReadFreshnessRow[];
  totalShipped: number;
  /** Playbooks with at least one re-read mark. */
  withMarks: number;
  /** Total re-read marks across all rows. */
  totalMarks: number;
  /** Total marks classified as stale. */
  totalStale: number;
  /** Total marks classified as current. */
  totalCurrent: number;
  /** Total marks classified as unknown. */
  totalUnknown: number;
  /** Worst-case `gapDays` across all stale sections. Null when no
   *  stale section exists. */
  worstGapDays: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Exported for unit tests + tooling. Returns the integer number of
 *  UTC calendar days between `iso` and `now`, or null when `iso` is
 *  missing or unparseable. Negative when `iso` is in the future. */
export function daysSinceUTC(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const utcD = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcNow - utcD) / DAY_MS);
}

/** Compute a single section's freshness state from a re-read mark +
 *  a playbook lastTouched. Returns `null` when the section is not
 *  marked re-read (the caller filters those out at the row level).
 *  Exported for unit tests. */
export function classifySection(
  reReadAt: string | null,
  lastTouched: string | null,
  now: Date
): { state: SectionFreshnessState; gapDays: number | null } {
  if (!reReadAt) {
    return { state: "unknown", gapDays: null };
  }
  if (!lastTouched) {
    return { state: "unknown", gapDays: null };
  }
  const reReadDate = new Date(reReadAt);
  const touchDate = new Date(lastTouched);
  if (Number.isNaN(reReadDate.getTime()) || Number.isNaN(touchDate.getTime())) {
    return { state: "unknown", gapDays: null };
  }
  // Positive gapDays → lastTouched is MORE recent than reReadAt → stale.
  // Negative gapDays → reReadAt is at or after lastTouched → current.
  const gapDays = Math.floor((touchDate.getTime() - reReadDate.getTime()) / DAY_MS);
  if (gapDays > 0) {
    return { state: "stale-since-reread", gapDays };
  }
  return { state: "current-as-of-reread", gapDays };
}

/** Build the re-read freshness summary by joining the recipe (Move
 *  #N.18) + the re-read map (Move #N.20) + the playbook catalog.
 *  Pure: deterministic given the same inputs + `now`. */
export function buildReReadFreshness(
  recipe: DriftFixRecipeSummary,
  reReadMap: ReReadMap,
  playbooks: Playbook[],
  now: Date = new Date()
): ReReadFreshnessSummary {
  const rows: ReReadFreshnessRow[] = [];
  let withMarks = 0;
  let totalMarks = 0;
  let totalStale = 0;
  let totalCurrent = 0;
  let totalUnknown = 0;
  let worstGapDays: number | null = null;

  for (const recipeRow of recipe.rows) {
    const pb = findPlaybook(playbooks, recipeRow.id);
    const lastTouched = pb?.lastTouched ?? null;
    const sections: SectionFreshness[] = recipeRow.readFirst.map((s) => {
      const rec = reReadMap[recipeRow.id]?.[s.hash] ?? null;
      const reReadAt = rec?.reReadAt ?? null;
      const { state, gapDays } = classifySection(reReadAt, lastTouched, now);
      return {
        heading: s.heading,
        label: s.label,
        hash: s.hash,
        reReadAt,
        reReadDaysAgo: daysSinceUTC(reReadAt, now),
        lastTouched,
        lastTouchedDaysAgo: daysSinceUTC(lastTouched, now),
        state,
        gapDays,
      };
    });
    const marked = sections.filter((s) => s.reReadAt !== null);
    const stale = marked.filter((s) => s.state === "stale-since-reread");
    const current = marked.filter((s) => s.state === "current-as-of-reread");
    const unknown = marked.filter((s) => s.state === "unknown");
    const maxGap = stale.reduce<number | null>(
      (acc, s) => (acc === null || (s.gapDays !== null && s.gapDays > acc) ? s.gapDays : acc),
      null
    );
    if (worstGapDays === null || (maxGap !== null && maxGap > worstGapDays)) {
      worstGapDays = maxGap;
    }
    if (marked.length > 0) {
      withMarks += 1;
      totalMarks += marked.length;
      totalStale += stale.length;
      totalCurrent += current.length;
      totalUnknown += unknown.length;
    }
    rows.push({
      id: recipeRow.id,
      title: recipeRow.title,
      totalSections: recipeRow.readFirst.length,
      markedCount: marked.length,
      staleCount: stale.length,
      currentCount: current.length,
      unknownCount: unknown.length,
      maxGapDays: maxGap,
      sections,
    });
  }

  return {
    rows,
    totalShipped: recipe.rows.length,
    withMarks,
    totalMarks,
    totalStale,
    totalCurrent,
    totalUnknown,
    worstGapDays,
  };
}

/** Card border tone. Mirrors the trio (drift / recipe / re-read):
 *  rose when any mark is stale, amber when unknown exists but no
 *  stale, emerald when every mark is current, neutral when no marks
 *  at all or no shipped playbooks. */
export function rereadFreshnessToneClass(summary: ReReadFreshnessSummary): string {
  if (summary.totalShipped === 0 || summary.totalMarks === 0) {
    return "border-border bg-card";
  }
  if (summary.totalStale > 0) {
    return "border-rose-500/30 bg-rose-500/5";
  }
  if (summary.totalUnknown > 0) {
    return "border-amber-500/30 bg-amber-500/5";
  }
  return "border-emerald-500/30 bg-emerald-500/5";
}

/** Headline copy. Picks the most actionable signal. */
export function rereadFreshnessHeadline(summary: ReReadFreshnessSummary): string {
  if (summary.totalShipped === 0) {
    return "No shipped playbooks yet";
  }
  if (summary.totalMarks === 0) {
    return "No re-read marks to freshness-check yet";
  }
  if (summary.totalStale > 0) {
    const worst = summary.worstGapDays;
    const tail =
      worst !== null
        ? ` · worst ${worst}d since re-read`
        : "";
    return `${summary.totalStale} of ${summary.totalMarks} marked section${summary.totalStale === 1 ? "" : "s"} stale (playbook updated since re-read)${tail}`;
  }
  if (summary.totalUnknown > 0) {
    return `${summary.totalUnknown} of ${summary.totalMarks} marked section${summary.totalUnknown === 1 ? "" : "s"} can't be freshness-checked (no lastTouched on playbook)`;
  }
  return `All ${summary.totalMarks} marked section${summary.totalMarks === 1 ? "" : "s"} are current as of re-read`;
}

/** Per-row tone for the playbook title row in the card body. */
export function rereadFreshnessRowTone(row: ReReadFreshnessRow): string {
  if (row.markedCount === 0) return "text-muted-foreground";
  if (row.staleCount > 0) return "text-rose-700 dark:text-rose-300";
  if (row.unknownCount > 0) return "text-amber-700 dark:text-amber-300";
  return "text-emerald-700 dark:text-emerald-300";
}

/** Per-section tone for a freshness chip. */
export function rereadFreshnessSectionTone(state: SectionFreshnessState): string {
  if (state === "stale-since-reread") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }
  if (state === "current-as-of-reread") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "border-border bg-muted/30 text-muted-foreground";
}

/** Human-readable section-state label, used in the chip text + table. */
export function rereadFreshnessSectionLabel(
  section: SectionFreshness
): string {
  if (section.state === "stale-since-reread") {
    const gap = section.gapDays !== null ? section.gapDays : 0;
    return `stale · +${gap}d since re-read`;
  }
  if (section.state === "current-as-of-reread") {
    return "current as of re-read";
  }
  return "no lastTouched on playbook";
}

/** Markdown export of the re-read freshness table — paste-ready for
 *  the operator's standup / Notion / Linear project. */
export function renderReReadFreshnessMarkdown(summary: ReReadFreshnessSummary): string {
  if (summary.rows.length === 0) {
    return "_No shipped playbooks yet — mark one shipped on /playbooks to see re-read freshness._";
  }
  const lines: string[] = [];
  lines.push("## Re-read freshness — playbook changes since you marked the section");
  lines.push("");
  lines.push("| Playbook | Stale / marked | Worst gap | Notes |");
  lines.push("|---|---|---|---|");
  for (const r of summary.rows) {
    if (r.markedCount === 0) {
      lines.push(`| ${r.title} | 0/${r.totalSections} marked | — | (no marks yet) |`);
      continue;
    }
    const worst = r.maxGapDays !== null ? `${r.maxGapDays}d` : "—";
    const notes: string[] = [];
    if (r.staleCount > 0) notes.push(`${r.staleCount} stale`);
    if (r.currentCount > 0) notes.push(`${r.currentCount} current`);
    if (r.unknownCount > 0) notes.push(`${r.unknownCount} unknown`);
    lines.push(
      `| ${r.title} | ${r.staleCount}/${r.markedCount} stale | ${worst} | ${notes.join(" · ") || "—"} |`
    );
  }
  lines.push("");
  lines.push(
    `_Generated ${new Date().toISOString().slice(0, 10)} · ${summary.totalStale}/${summary.totalMarks} marked sections stale (playbook updated after re-read) · worst gap ${summary.worstGapDays ?? 0}d._`
  );
  return lines.join("\n");
}

/** Re-export the upstream types so callers only need to import from
 *  this file when they only care about freshness. */
export type { ReReadMap, ReReadProgressSection, ReReadSummary, DriftFixRecipe };
