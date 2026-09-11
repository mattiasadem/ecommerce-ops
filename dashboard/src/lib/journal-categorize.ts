/**
 * `journal-categorize` — pure functions that classify each journal
 * entry by tick type + status, and surface searchable facets.
 *
 * The journal is the canonical changelog of every cron tick. With 100+
 * entries shipping over the project's life, operators need to filter
 * for "show me all skill ticks that DEPLOY BLOCKED last week" or
 * "what dashboard features shipped in July?". This module is the
 * data layer for the on-page `<JournalSearch />` component.
 *
 * Two patterns exist in /docs/journal.md headings:
 *   1. `[YYYY-MM-DD HH:MM] Skill tick: <verb> — <title>` (skill-builder cron)
 *   2. `YYYY-MM-DD HH:MM — <title>` (dashboard-improver cron)
 *
 * Tick types detected:
 *   - skill           — Skill tick heading
 *   - feature         — dashboard-improver interactive/calculator port
 *   - static          — research doc, playbook, or asset shipped (rare in journal)
 *   - infra           — workspace infrastructure (backup, deploy hook, etc.)
 *   - unknown         — fallback for headings that match none of the above
 *
 * Status detected from body bullets:
 *   - keep / metric-positive / ship
 *   - failed / blocked / deploy-blocked
 *   - no-status (when no `**Status:**` bullet present)
 */

export type TickType = "skill" | "feature" | "static" | "infra" | "unknown";
export type TickStatus = "keep" | "blocked" | "no-status";

export interface CategorizedJournalEntry {
  index: number;             // 0-based position in the original journal array (newest = 0)
  timestamp: string | null;  // ISO YYYY-MM-DDTHH:MM:00Z or null if unparseable
  displayDate: string | null;// "Sep 11, 04:02 UTC" pretty-printed
  shortTitle: string;        // ≤110 char heading without timestamp
  tickType: TickType;
  tickStatus: TickStatus;
  searchHaystack: string;    // lowercased heading + body used for substring filtering
  body: string;
}

const HEADING_PATTERNS: Array<{
  rx: RegExp;
  tickType: TickType;
}> = [
  { rx: /^Skill tick:/i, tickType: "skill" },
  { rx: /^Dashboard tick:/i, tickType: "feature" },
  { rx: /^Static tick:/i, tickType: "static" },
  { rx: /^Infra tick:/i, tickType: "infra" },
];

const ISO_RX = /^\[?(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]?/;

const STATUS_KEEP_RX = /\*\*Status:\*\*\s*(keep|ship|metric-positive|complete)/i;
const STATUS_BLOCKED_RX = /\*\*Status:\*\*\s*(failed|blocked|deploy-blocked|aborted)/i;
const DEPLOY_BLOCKED_FALLBACK_RX = /deploy\s+blocked|api-deployments-free-per-day/i;

export function parseTimestamp(heading: string): {
  iso: string | null;
  displayDate: string | null;
} {
  const m = ISO_RX.exec(heading);
  if (!m) return { iso: null, displayDate: null };
  const iso = `${m[1]}T${m[2]}:00Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { iso: null, displayDate: null };
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const displayDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${m[2]} UTC`;
  return { iso, displayDate };
}

export function detectTickType(heading: string): TickType {
  // Strip the [timestamp] / YYYY-MM-DD HH:MM prefix so the type detector
  // sees the actual label.
  const stripped = heading
    .replace(/^\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\]\s*/, "")
    .replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s*[—-]?\s*/, "");

  for (const { rx, tickType } of HEADING_PATTERNS) {
    if (rx.test(stripped)) return tickType;
  }

  // Fallback heuristics from body patterns — useful for old entries that
  // pre-date the "Skill tick:" prefix convention.
  return "unknown";
}

export function detectTickStatus(body: string): TickStatus {
  if (STATUS_KEEP_RX.test(body)) return "keep";
  if (STATUS_BLOCKED_RX.test(body)) return "blocked";
  if (DEPLOY_BLOCKED_FALLBACK_RX.test(body)) return "blocked";
  return "no-status";
}

export function shortTitle(heading: string): string {
  // Strip leading timestamp.
  let stripped = heading
    .replace(/^\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\]\s*/, "")
    .replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s*[—-]\s*/, "");

  // If the heading starts with "Skill tick: keep — " or similar, strip the
  // boilerplate prefix so the title fits.
  stripped = stripped.replace(/^Skill tick:\s*(keep|ship|skip|fail)\s*[—-]\s*/i, "");
  stripped = stripped.replace(/^Dashboard tick:\s*[—-]\s*/i, "");
  stripped = stripped.replace(/^Static tick:\s*[—-]\s*/i, "");
  stripped = stripped.replace(/^Infra tick:\s*[—-]\s*/i, "");

  // Truncate at first sentence-ish delimiter if too long.
  if (stripped.length > 110) {
    const firstSentence = stripped.split(/[.—-]/)[0];
    if (firstSentence.length >= 40 && firstSentence.length <= 110) {
      stripped = firstSentence;
    } else {
      stripped = stripped.slice(0, 107) + "…";
    }
  }
  return stripped.trim();
}

export interface RawJournalEntry {
  heading: string;
  body: string;
}

export function categorizeJournal(
  raw: RawJournalEntry[],
): CategorizedJournalEntry[] {
  return raw.map((entry, index) => {
    const { iso, displayDate } = parseTimestamp(entry.heading);
    const tickType = detectTickType(entry.heading);
    const tickStatus = detectTickStatus(entry.body);
    return {
      index,
      timestamp: iso,
      displayDate,
      shortTitle: shortTitle(entry.heading),
      tickType,
      tickStatus,
      searchHaystack: `${entry.heading}\n${entry.body}`.toLowerCase(),
      body: entry.body,
    };
  });
}

export interface JournalFilters {
  query: string;
  tickTypes: TickType[];      // empty = all types
  tickStatuses: TickStatus[];  // empty = all statuses
}

export const EMPTY_FILTERS: JournalFilters = {
  query: "",
  tickTypes: [],
  tickStatuses: [],
};

export function applyJournalFilters(
  entries: CategorizedJournalEntry[],
  filters: JournalFilters,
): CategorizedJournalEntry[] {
  const q = filters.query.trim().toLowerCase();
  return entries.filter((e) => {
    if (filters.tickTypes.length > 0 && !filters.tickTypes.includes(e.tickType)) {
      return false;
    }
    if (filters.tickStatuses.length > 0 && !filters.tickStatuses.includes(e.tickStatus)) {
      return false;
    }
    if (q.length > 0 && !e.searchHaystack.includes(q)) {
      return false;
    }
    return true;
  });
}

// ---------- Convenience constants for filter chips ----------

export const ALL_TICK_TYPES: TickType[] = [
  "skill",
  "feature",
  "static",
  "infra",
  "unknown",
];

export const TICK_TYPE_LABEL: Record<TickType, string> = {
  skill: "Skill",
  feature: "Feature",
  static: "Static",
  infra: "Infra",
  unknown: "Other",
};

export const TICK_TYPE_TONE: Record<TickType, string> = {
  skill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  feature: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  static: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  infra: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export const ALL_TICK_STATUSES: TickStatus[] = ["keep", "blocked", "no-status"];

export const TICK_STATUS_LABEL: Record<TickStatus, string> = {
  keep: "Kept",
  blocked: "Blocked",
  "no-status": "No status",
};

export const TICK_STATUS_TONE: Record<TickStatus, string> = {
  keep: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  blocked: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  "no-status": "bg-muted text-muted-foreground border-border",
};

// ---------- Aggregate stats for the header strip ----------

export interface JournalStats {
  total: number;
  byType: Record<TickType, number>;
  byStatus: Record<TickStatus, number>;
  last7Days: number;
}

export function computeJournalStats(
  entries: CategorizedJournalEntry[],
): JournalStats {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const byType: Record<TickType, number> = {
    skill: 0,
    feature: 0,
    static: 0,
    infra: 0,
    unknown: 0,
  };
  const byStatus: Record<TickStatus, number> = {
    keep: 0,
    blocked: 0,
    "no-status": 0,
  };
  let last7Days = 0;
  for (const e of entries) {
    byType[e.tickType]++;
    byStatus[e.tickStatus]++;
    if (e.timestamp) {
      const t = new Date(e.timestamp).getTime();
      if (now - t <= sevenDaysMs) last7Days++;
    }
  }
  return { total: entries.length, byType, byStatus, last7Days };
}
