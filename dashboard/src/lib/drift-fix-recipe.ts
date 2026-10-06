/**
 * `drift-fix-recipe.ts` — Pure logic for the Move #N.18 drift-fix-recipe
 * rollup. Extends Move #N.16 (shipped-freshness-drift) with the
 * "which sections to re-read first" answer.
 *
 * Problem the lib solves: the shipped-freshness-drift card tells the
 * operator "you shipped Move #1 four months ago, the playbook was updated
 * three weeks ago — drift 97d". But the operator still has to open the
 * playbook, scroll, and figure out *which* section is the load-bearing
 * one to re-read. A 12-section playbook has 12 possible re-read targets
 * and most operators default to the first one (often the intro / Why /
 * TL;DR) and miss the real changes buried in Common pitfalls / How to
 * ship / Verification.
 *
 * This lib answers: for each drifted playbook, what is the ranked
 * "read-first" list of section headings, where:
 *   - The first entry is the section most likely to have changed in a
 *     load-bearing way (Common pitfalls / How to ship / Verification /
 *     Recipe / What to ship / How to extend / Pitfalls).
 *   - Subsequent entries are the other H2 sections in priority order.
 *   - We never return more than `maxSectionsPerRow` (default 3) so the
 *     UI card stays compact.
 *   - We always return at least one section if the playbook has any
 *     `numberedSections`, so the operator never sees a "no recipe" row.
 *
 * Why this matters: Move #N.16 ships the WHAT (drift score). Move #N.18
 * ships the WHERE (read these sections first). Together they answer
 * the canonical "I shipped Move #1 4 months ago — has the playbook
 * changed? If so, what do I need to re-learn?" question with one
 * click. Future Move #N.18.x can layer on per-section diff (compare
 * the operator's previously-read notes against the current section
 * body) and per-section "did this section get rewritten since your
 * shipped date" badges.
 *
 * Storage contract: this lib is pure read. The component layer is
 * responsible for any localStorage interaction (it reads the same
 * `ecom-ops:shipped-playbooks:v1` map Move #N.16 reads).
 */

import type { Playbook } from "./content";

/** Section priority hints (case-insensitive substring matches). The
 *  first match in this list wins as the "read first" candidate. */
const PRIORITY_SECTION_KEYWORDS: Array<{ needle: string; weight: number; label: string }> = [
  { needle: "common pitfalls",   weight: 100, label: "pitfalls" },
  { needle: "how to ship",       weight: 95,  label: "ship recipe" },
  { needle: "how to extend",     weight: 92,  label: "extend" },
  { needle: "verification",      weight: 90,  label: "verification" },
  { needle: "what to ship",      weight: 88,  label: "ship list" },
  { needle: "ship list",         weight: 87,  label: "ship list" },
  { needle: "recipe",            weight: 85,  label: "recipe" },
  { needle: "step-by-step",      weight: 80,  label: "step-by-step" },
  { needle: "how it works",      weight: 70,  label: "how it works" },
  { needle: "implementation",    weight: 68,  label: "implementation" },
  { needle: "playbook",          weight: 60,  label: "playbook body" },
  { needle: "tactics",           weight: 55,  label: "tactics" },
  { needle: "checklist",         weight: 50,  label: "checklist" },
  { needle: "tools",             weight: 40,  label: "tools" },
  { needle: "examples",          weight: 30,  label: "examples" },
  { needle: "case study",        weight: 28,  label: "case study" },
  { needle: "kpis",              weight: 25,  label: "kpis" },
  { needle: "metrics",           weight: 24,  label: "metrics" },
  { needle: "expected lift",     weight: 22,  label: "expected lift" },
  { needle: "roi",               weight: 20,  label: "roi" },
  { needle: "tradeoffs",         weight: 18,  label: "tradeoffs" },
  { needle: "background",        weight: 10,  label: "background" },
  { needle: "why",               weight: 5,   label: "why" },
  { needle: "intro",             weight: 3,   label: "intro" },
  { needle: "tl;dr",             weight: 2,   label: "tl;dr" },
  { needle: "tldr",              weight: 2,   label: "tl;dr" },
  { needle: "overview",          weight: 1,   label: "overview" },
];

/** Compute a single section's priority weight. Higher = read first. */
export function sectionPriority(heading: string): { weight: number; label: string; matched: boolean } {
  const h = (heading || "").toLowerCase();
  for (const { needle, weight, label } of PRIORITY_SECTION_KEYWORDS) {
    if (h.includes(needle)) {
      return { weight, label, matched: true };
    }
  }
  // Unmatched sections get a baseline weight based on their position
  // (earlier sections first) so the rollup is at least deterministic.
  return { weight: 0, label: "section", matched: false };
}

/** Slugify a heading into a URL hash fragment. Mirrors how Next.js
 *  auto-generates heading anchors from H2 → h2 id = slug. */
export function headingToHash(heading: string): string {
  return (heading || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface DriftFixRecipe {
  /** Playbook id (file id without .md). */
  id: string;
  /** Playbook title. */
  title: string;
  /** Drift in days, may be null if no lastTouched. */
  driftDays: number | null;
  /** Ordered list of section headings to re-read first. */
  readFirst: Array<{
    heading: string;
    label: string;
    hash: string;
  }>;
  /** Total numberedSections on the playbook. */
  totalSections: number;
}

export interface DriftFixRecipeSummary {
  rows: DriftFixRecipe[];
  totalShipped: number;
  withRecipe: number;
  noSections: number;
  maxDriftDays: number | null;
}

interface InputRow {
  id: string;
  title: string;
  driftDays: number | null;
  numberedSections: { heading: string; body: string }[];
}

export function buildDriftFixRecipe(
  shippedRows: InputRow[],
  maxRows: number = 5,
  maxSectionsPerRow: number = 3
): DriftFixRecipeSummary {
  const capped = Math.max(0, maxRows);
  const maxSections = Math.max(1, maxSectionsPerRow);
  const rows: DriftFixRecipe[] = [];

  for (const r of shippedRows.slice(0, capped)) {
    const sections = Array.isArray(r.numberedSections) ? r.numberedSections : [];
    const totalSections = sections.length;

    // Rank sections by priority weight (desc), preserving source order
    // as the tiebreak so the rollup is deterministic.
    const ranked = sections
      .map((s, idx) => {
        const p = sectionPriority(s.heading);
        return { heading: s.heading, body: s.body, idx, ...p };
      })
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return a.idx - b.idx;
      })
      .slice(0, maxSections)
      .map((s) => ({
        heading: s.heading,
        label: s.label,
        hash: headingToHash(s.heading),
      }));

    rows.push({
      id: r.id,
      title: r.title,
      driftDays: r.driftDays,
      readFirst: ranked,
      totalSections,
    });
  }

  const withRecipe = rows.filter((r) => r.readFirst.length > 0).length;
  const noSections = rows.filter((r) => r.readFirst.length === 0).length;
  const maxDriftDays = rows.reduce<number | null>((acc, r) => {
    if (r.driftDays === null) return acc;
    if (acc === null) return r.driftDays;
    return Math.max(acc, r.driftDays);
  }, null);

  return {
    rows,
    totalShipped: shippedRows.length,
    withRecipe,
    noSections,
    maxDriftDays,
  };
}

/** Tone class for the recipe card border (escalates with the worst
 *  drift across rows). Mirrors Move #N.16's severity scaling so the
 *  two cards visually pair on Overview. */
export function recipeToneClass(summary: DriftFixRecipeSummary): string {
  if (summary.rows.length === 0) {
    return "border-border bg-card";
  }
  if (summary.maxDriftDays === null) {
    return "border-border bg-card";
  }
  if (summary.maxDriftDays > 90) {
    return "border-rose-500/30 bg-rose-500/5";
  }
  if (summary.maxDriftDays > 30) {
    return "border-amber-500/30 bg-amber-500/5";
  }
  return "border-emerald-500/30 bg-emerald-500/5";
}

/** Headline copy for the card. Mirrors Move #N.16's tone so a
 *  returning operator doesn't have to re-learn the language. */
export function recipeHeadline(summary: DriftFixRecipeSummary): string {
  if (summary.totalShipped === 0) {
    return "No shipped playbooks yet";
  }
  if (summary.noSections === summary.totalShipped) {
    return `${summary.totalShipped} shipped · sections not yet parsed`;
  }
  if (summary.withRecipe < summary.totalShipped) {
    return `${summary.withRecipe} of ${summary.totalShipped} shipped have a re-read recipe`;
  }
  return `${summary.totalShipped} shipped · all have a re-read recipe`;
}

/** Markdown export of the recipe table — paste-ready for the
 *  operator's standup / Notion / Linear project. */
export function renderRecipeMarkdown(summary: DriftFixRecipeSummary): string {
  if (summary.rows.length === 0) {
    return "_No shipped playbooks yet — mark one shipped on /playbooks to see a re-read recipe._";
  }
  const lines: string[] = [];
  lines.push("## Re-read recipe — shipped playbooks drift");
  lines.push("");
  lines.push("| Playbook | Drift | Read first |");
  lines.push("|---|---|---|");
  for (const r of summary.rows) {
    const drift = r.driftDays === null ? "—" : `${r.driftDays}d`;
    const first = r.readFirst.length
      ? r.readFirst
          .map((s) => `\`${s.heading}\` (${s.label})`)
          .join(" → ")
      : "_(no sections parsed)_";
    lines.push(`| ${r.title} | ${drift} | ${first} |`);
  }
  lines.push("");
  lines.push(
    `_Generated ${new Date().toISOString().slice(0, 10)} · ${summary.withRecipe}/${summary.totalShipped} shipped have a re-read recipe._`
  );
  return lines.join("\n");
}

/** Find the playbook in a catalog by its shipped id (with or without .md). */
export function findPlaybook(
  playbooks: Playbook[],
  shippedId: string
): Playbook | undefined {
  for (const p of playbooks) {
    if (p.file === shippedId) return p;
    if (p.file === `${shippedId}.md`) return p;
    if (p.file.replace(/\.md$/, "") === shippedId) return p;
  }
  return undefined;
}
