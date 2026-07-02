import contentJson from "./content.json";

// Loosely typed mirror of scripts/parse-content.mjs output.
export type ConfidenceTag = "verified" | "directional" | "rule-of-thumb" | string;

export interface TableRow {
  [key: string]: string;
}

export interface ContentSection {
  heading: string;
  level: number;
  table: TableRow[] | null;
  body: string;
}

export interface ResearchDoc {
  file: string;
  title: string | null;
  sections: ContentSection[];
  tables: { heading: string; rows: TableRow[] }[];
  findings: string[];
}

export interface Playbook {
  file: string;
  title: string;
  meta: string[];
  sectionCount: number;
  numberedSections: { heading: string; body: string }[];
  size: number;
  lastTouched?: string;
}

export interface Asset {
  file: string;
  title: string;
  meta: string[];
  sectionCount: number;
  size: number;
  numberedSections?: { heading: string; body: string }[];
  assetNumber?: number;
  voiceGated?: boolean;
  voiceCounts?: Record<string, number>;
  lastTouched?: string;
}

export interface Top10Status {
  move: string;
  status: string;
  owner: string;
  touched: string;
  shipped: boolean;
  pending: boolean;
}

export interface JournalEntry {
  heading: string;
  body: string;
}

export interface Content {
  generatedAt: string;
  research: ResearchDoc[];
  playbooks: Playbook[];
  assets: Asset[];
  top10: { tables: { heading: string; rows: TableRow[] }[]; status: Top10Status[] };
  journal: JournalEntry[];
  counts: {
    researchDocs: number;
    playbooks: number;
    assets: number;
    tables: number;
    findings: number;
    journalEntries: number;
  };
}

export const content: Content = contentJson as unknown as Content;

// Helpers used across pages.
export function findTable(rows: ResearchDoc[], headingMatch: RegExp): TableRow[] {
  for (const d of rows) {
    for (const t of d.tables) {
      if (headingMatch.test(t.heading)) return t.rows;
    }
  }
  return [];
}

export function findDoc(rows: ResearchDoc[], fileMatch: RegExp): ResearchDoc | undefined {
  return rows.find((d) => fileMatch.test(d.file));
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Freshness label: "today" / "Nd ago" / "Nmo ago" / "Nyr ago" / null.
// Used by playbooks/assets pages to show how stale a doc is.
export function freshnessLabel(iso?: string, now: Date = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return null;
  const days = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}yr ago`;
}

// Stale tier: "fresh" (<14d) / "aging" (14-60d) / "stale" (>60d).
// Drives badge color on the playbooks/assets cards.
export function freshnessTier(iso?: string, now: Date = new Date()): "fresh" | "aging" | "stale" | "unknown" {
  if (!iso) return "unknown";
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return "unknown";
  const days = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (days < 14) return "fresh";
  if (days < 60) return "aging";
  return "stale";
}