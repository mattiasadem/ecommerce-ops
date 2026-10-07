/**
 * `recipe-reread.ts` — Pure logic for the Move #N.20 recipe-re-read
 * progress tracker. Closes the canonical loop on the Move #N.18 drift
 * fix recipe: the recipe tells the operator which sections to
 * re-read first; this lib tracks which sections the operator has
 * ACTUALLY re-read, so the operator can see "3 of 7 sections re-read"
 * instead of "drift 97d — go re-read something".
 *
 * Storage shape: `ecom-ops:recipe-reread:v1` is a JSON object keyed
 * by `playbookId` (the shipped-map key), with each value being a map
 * of `sectionHash -> {reReadAt: ISO}`. We key by hash (not heading)
 * because the same heading can exist at different nesting levels in
 * different playbooks, and the hash is the canonical anchor used by
 * the recipe links.
 *
 * Why a separate storage key (not folded into shipped-playbooks):
 * the shipped map tracks "did I ship this playbook?" — a one-shot
 * event. The re-read map tracks "which sections have I re-read since
 * shipping it?" — a continuous state. Folding them in would muddy
 * the schema for both; keeping them separate also means clearing
 * the re-read state (e.g. when the operator unships + reships a
 * playbook to start a fresh review cycle) doesn't touch the shipped
 * state.
 *
 * Pure logic: no React, no DOM, no localStorage side effects.
 * `loadReReadMap` / `saveReReadMap` / `markReRead` / `clearReRead`
 * are thin localStorage wrappers used by the component layer; the
 * core rollup `buildReReadSummary` is deterministic and testable.
 */

import {
  type DriftFixRecipe,
  type DriftFixRecipeSummary,
} from "./drift-fix-recipe";

/** Per-section re-read record. `reReadAt` is the ISO timestamp of the
 *  last mark. We only keep the last mark so the storage entry stays
 *  small (operator may mark/unmark many times). */
export interface ReReadRecord {
  reReadAt: string;
}

/** Map of `playbookId -> { sectionHash -> { reReadAt } }`. */
export type ReReadMap = Record<string, Record<string, ReReadRecord>>;

export const RE_READ_STORAGE_KEY = "ecom-ops:recipe-reread:v1";

/** Same-tab CustomEvent name so siblings (e.g. the drift fix recipe
 *  card) can react to local changes in addition to cross-tab
 *  `storage` events. */
export const RE_READ_UPDATE_EVENT = "ecom-ops:recipe-reread:update";

/** -------------------------------------------------------------------------
 *  localStorage I/O — thin wrappers, safe in SSR (return empty map when
 *  `window` is undefined).
 *  ------------------------------------------------------------------------- */

export function loadReReadMap(): ReReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RE_READ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: ReReadMap = {};
    for (const [pbId, sections] of Object.entries(parsed as ReReadMap)) {
      if (!sections || typeof sections !== "object" || Array.isArray(sections)) {
        continue;
      }
      const sec: Record<string, ReReadRecord> = {};
      for (const [hash, rec] of Object.entries(sections as Record<string, ReReadRecord>)) {
        if (!rec || typeof rec !== "object") continue;
        if (typeof (rec as ReReadRecord).reReadAt !== "string") continue;
        const t = new Date((rec as ReReadRecord).reReadAt);
        if (Number.isNaN(t.getTime())) continue;
        sec[hash] = { reReadAt: (rec as ReReadRecord).reReadAt };
      }
      if (Object.keys(sec).length > 0) {
        out[pbId] = sec;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveReReadMap(map: ReReadMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RE_READ_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private-mode — silently no-op */
  }
}

/** Mark a single section as re-read. Idempotent (re-marking just
 *  bumps the timestamp). Returns a NEW map; the caller persists. */
export function markReRead(
  map: ReReadMap,
  playbookId: string,
  sectionHash: string,
  at: Date = new Date()
): ReReadMap {
  const pbId = (playbookId || "").trim();
  const hash = (sectionHash || "").trim();
  if (!pbId || !hash) return map;
  const next: ReReadMap = { ...map };
  const sections = { ...(next[pbId] || {}) };
  sections[hash] = { reReadAt: at.toISOString() };
  next[pbId] = sections;
  return next;
}

/** Remove the re-read record for a single section. Returns a NEW
 *  map; the caller persists. Cleans up empty playbook entries so
 *  storage doesn't grow stale branches. */
export function clearReRead(
  map: ReReadMap,
  playbookId: string,
  sectionHash: string
): ReReadMap {
  const pbId = (playbookId || "").trim();
  const hash = (sectionHash || "").trim();
  if (!pbId || !hash) return map;
  if (!map[pbId] || !map[pbId][hash]) return map;
  const next: ReReadMap = { ...map };
  const sections = { ...next[pbId] };
  delete sections[hash];
  if (Object.keys(sections).length === 0) {
    delete next[pbId];
  } else {
    next[pbId] = sections;
  }
  return next;
}

/** Reset all re-read state for a playbook. Used when the operator
 *  unships + reships a playbook to start a fresh review cycle. */
export function resetReReadForPlaybook(
  map: ReReadMap,
  playbookId: string
): ReReadMap {
  const pbId = (playbookId || "").trim();
  if (!pbId || !map[pbId]) return map;
  const next: ReReadMap = { ...map };
  delete next[pbId];
  return next;
}

/** -------------------------------------------------------------------------
 *  Rollup — turns a recipe summary + the operator's re-read map into
 *  per-row progress + a card-level headline.
 *  ------------------------------------------------------------------------- */

/** A single section in the re-read rollup, with the operator's mark. */
export interface ReReadSection {
  /** Section heading text. */
  heading: string;
  /** Short label from the priority keyword (e.g. "pitfalls"). */
  label: string;
  /** Anchor hash used by `/playbooks/[slug]#[hash]` links. */
  hash: string;
  /** ISO timestamp when the operator marked this section re-read,
   *  or null when unmarked. */
  reReadAt: string | null;
  /** Days since the mark, computed against `now`. Null when unmarked. */
  reReadDaysAgo: number | null;
}

/** Per-shipped-playbook re-read rollup. */
export interface ReReadRow {
  /** Playbook id, mirrors DriftFixRecipe.id. */
  id: string;
  /** Display title from the catalog. */
  title: string;
  /** Total sections in the recipe (maxSectionsPerRow from the recipe,
   *  i.e. the "read first" list, not the full playbook). */
  totalSections: number;
  /** Number of recipe sections marked re-read. */
  reReadCount: number;
  /** Whether every recipe section is marked re-read. */
  isFullyReRead: boolean;
  /** Percent 0–100 of recipe sections re-read. */
  percent: number;
  /** Sections in the same order the recipe card shows them. */
  sections: ReReadSection[];
}

export interface ReReadSummary {
  /** Rows in the same order as the input recipe. */
  rows: ReReadRow[];
  /** Total shipped playbooks in the input. */
  totalShipped: number;
  /** Number of shipped playbooks with at least one section re-read. */
  withReRead: number;
  /** Number fully re-read (every recipe section marked). */
  fullyReRead: number;
  /** Total re-read marks across all rows. */
  totalMarks: number;
  /** Total recipe sections surfaced. */
  totalSections: number;
  /** Worst-case percent NOT-re-read across rows. Null when no recipe
   *  sections at all (no shipped playbook has parsed sections). */
  worstIncompletePercent: number | null;
}

/** Tone class for the card border. Mirrors Move #N.16's severity
 *  scaling so the trio of cards (drift, recipe, re-read) visually
 *  pair. */
export function reReadToneClass(summary: ReReadSummary): string {
  if (summary.totalShipped === 0 || summary.totalSections === 0) {
    return "border-border bg-card";
  }
  if (summary.fullyReRead === summary.totalShipped && summary.totalShipped > 0) {
    return "border-emerald-500/30 bg-emerald-500/5";
  }
  if (summary.worstIncompletePercent === null) {
    return "border-border bg-card";
  }
  if (summary.worstIncompletePercent >= 75) {
    return "border-rose-500/30 bg-rose-500/5";
  }
  if (summary.worstIncompletePercent >= 35) {
    return "border-amber-500/30 bg-amber-500/5";
  }
  return "border-emerald-500/30 bg-emerald-500/5";
}

/** Headline copy for the card. Picks the most actionable signal. */
export function reReadHeadline(summary: ReReadSummary): string {
  if (summary.totalShipped === 0) {
    return "No shipped playbooks yet";
  }
  if (summary.totalSections === 0) {
    return "No recipe sections to re-read yet";
  }
  if (summary.fullyReRead === summary.totalShipped) {
    return `All ${summary.totalShipped} shipped recipe${summary.totalShipped === 1 ? "" : "s"} fully re-read`;
  }
  if (summary.fullyReRead > 0) {
    return `${summary.fullyReRead} of ${summary.totalShipped} shipped recipes fully re-read · ${summary.totalMarks}/${summary.totalSections} sections marked`;
  }
  if (summary.withReRead > 0) {
    return `${summary.totalMarks} of ${summary.totalSections} recipe sections re-read across ${summary.withReRead} playbook${summary.withReRead === 1 ? "" : "s"}`;
  }
  return `${summary.totalSections} recipe section${summary.totalSections === 1 ? "" : "s"} across ${summary.totalShipped} shipped playbook${summary.totalShipped === 1 ? "" : "s"} — none re-read yet`;
}

/** Markdown export of the re-read progress table — paste-ready for
 *  the operator's standup / Notion / Linear project. */
export function renderReReadMarkdown(summary: ReReadSummary): string {
  if (summary.rows.length === 0) {
    return "_No shipped playbooks yet — mark one shipped on /playbooks to see re-read progress._";
  }
  const lines: string[] = [];
  lines.push("## Re-read progress — shipped playbook recipe sections");
  lines.push("");
  lines.push("| Playbook | Re-read | Last re-read |");
  lines.push("|---|---|---|");
  for (const r of summary.rows) {
    if (r.totalSections === 0) {
      lines.push(`| ${r.title} | _(no recipe)_ | — |`);
      continue;
    }
    const last = r.sections
      .map((s) => s.reReadAt)
      .filter((v): v is string => v !== null)
      .sort()
      .pop();
    const lastStr = last ? last.slice(0, 10) : "—";
    lines.push(
      `| ${r.title} | ${r.reReadCount}/${r.totalSections} (${r.percent}%) | ${lastStr} |`
    );
  }
  lines.push("");
  lines.push(
    `_Generated ${new Date().toISOString().slice(0, 10)} · ${summary.totalMarks}/${summary.totalSections} recipe sections marked · ${summary.fullyReRead}/${summary.totalShipped} shipped recipes fully re-read._`
  );
  return lines.join("\n");
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const utcD = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcNow - utcD) / DAY_MS);
}

/** Build the re-read summary from the recipe (Move #N.18) + the
 *  operator's re-read map. Pure — no DOM, no I/O. */
export function buildReReadSummary(
  recipe: DriftFixRecipeSummary,
  reReadMap: ReReadMap,
  now: Date = new Date()
): ReReadSummary {
  const rows: ReReadRow[] = [];
  let totalMarks = 0;
  let totalSections = 0;
  let withReRead = 0;
  let fullyReRead = 0;
  let worstIncompletePercent: number | null = null;

  for (const recipeRow of recipe.rows) {
    const sections: ReReadSection[] = recipeRow.readFirst.map((s) => {
      const rec = reReadMap[recipeRow.id]?.[s.hash] ?? null;
      const reReadAt = rec ? rec.reReadAt : null;
      return {
        heading: s.heading,
        label: s.label,
        hash: s.hash,
        reReadAt,
        reReadDaysAgo: daysSince(reReadAt, now),
      };
    });

    const reReadCount = sections.filter((s) => s.reReadAt !== null).length;
    const totalSec = sections.length;
    const percent =
      totalSec === 0 ? 0 : Math.round((reReadCount / totalSec) * 100);
    const isFullyReRead = totalSec > 0 && reReadCount === totalSec;

    totalSections += totalSec;
    totalMarks += reReadCount;
    if (reReadCount > 0) withReRead += 1;
    if (isFullyReRead) fullyReRead += 1;

    if (totalSec > 0 && !isFullyReRead) {
      const incomplete = 100 - percent;
      if (
        worstIncompletePercent === null ||
        incomplete > worstIncompletePercent
      ) {
        worstIncompletePercent = incomplete;
      }
    }

    rows.push({
      id: recipeRow.id,
      title: recipeRow.title,
      totalSections: totalSec,
      reReadCount,
      isFullyReRead,
      percent,
      sections,
    });
  }

  return {
    rows,
    totalShipped: recipe.totalShipped,
    withReRead,
    fullyReRead,
    totalMarks,
    totalSections,
    worstIncompletePercent,
  };
}

/** Helper for the section pill tone — same color language as the
 *  drift fix recipe card. */
export function reReadSectionTone(
  reReadAt: string | null
): { label: string; tone: string } {
  if (reReadAt) {
    return {
      label: "re-read",
      tone: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
    };
  }
  return {
    label: "not re-read",
    tone: "border-border text-muted-foreground",
  };
}

/** Per-row progress-bar tone. Mirrors `reReadToneClass` but scoped
 *  to a single row so the operator can scan which playbook is the
 *  laggard. */
export function reReadRowTone(percent: number, totalSections: number): string {
  if (totalSections === 0) {
    return "border-border bg-muted text-muted-foreground";
  }
  if (percent === 100) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (percent >= 50) {
    return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (percent > 0) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-border bg-muted text-muted-foreground";
}

/** Relative day string for the re-read timestamp. Mirrors Move #N.16
 *  `relativeDay` so the operator gets the same "5d ago" language. */
export function reReadRelativeDay(
  iso: string | null,
  now: Date = new Date()
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return "today";
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
