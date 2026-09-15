/**
 * `Unified progress export` — operator handoff artifact builder.
 *
 * Closes the operator-progress export loop. The dashboard already has:
 *   - `/workspace-backup-card` — exports EVERY ecom-ops:* localStorage key
 *     as JSON (great for full restore, terrible for human handoff).
 *   - `/top-10` Top10ExportButton — exports JUST the Top-10 shipped map
 *     as CSV/JSON (great for per-move handoff, misses the other 2 trackers).
 *
 * This module builds the unified human-readable export artifact:
 *   - `top10_progress`:  shipped Top-10 moves × matched playbooks (uses
 *                        `resolvePlaybookLinksForMove` from top10-playbook-mapping).
 *   - `shipped_playbooks`:  per-playbook `{ shippedAt, notes }` map
 *                        resolved against canonical playbook titles.
 *   - `override`:  the current Next-move override (if any) resolved
 *                        against the algorithmic pick so the receiver sees
 *                        what was overridden.
 *
 * Pure data — no DOM, no localStorage side effects. Inputs are the
 * already-serialized browser objects from each tracker's `load*` helper.
 * Bump the suffix (`v1` → `v2`) when the schema changes incompatibly.
 *
 * Output schema (`ProgressExportPayload`):
 *   {
 *     schema: "ecommerce-ops-progress",
 *     version: 1,
 *     exportedAt: ISOString,
 *     top10: { ... },                    // see `Top10ProgressBlock`
 *     shipped_playbooks: { ... },        // see `ShippedPlaybooksBlock`
 *     override: { ... } | null,          // see `OverrideBlock`
 *   }
 */

import type { Top10Status, Playbook } from "./content";
import { MOVE_RECOMMENDATIONS, pickNextMove } from "./next-move";
import type { ShippedMap } from "./shipped-playbooks";
import type { NextMoveOverride } from "./next-move-override";
import { resolvePlaybookLinksForMove } from "./top10-playbook-mapping";
import type { YourStoreInputs } from "./your-store";

export const PROGRESS_EXPORT_SCHEMA = "ecommerce-ops-progress" as const;
export const PROGRESS_EXPORT_VERSION = 1 as const;

export interface ProgressExportPayload {
  schema: typeof PROGRESS_EXPORT_SCHEMA;
  version: typeof PROGRESS_EXPORT_VERSION;
  exportedAt: string;
  top10: Top10ProgressBlock;
  shipped_playbooks: ShippedPlaybooksBlock;
  override: OverrideBlock | null;
}

export interface Top10ProgressRow {
  rank: string;
  move: string;
  shipped_at: string;
  playbook_slug: string;
  playbook_title: string;
  playbook_href: string;
}

export interface Top10ProgressBlock {
  shipped_count: number;
  total_count: number;
  /** Per-move × per-playbook rows. Only shipped moves appear here. */
  rows: Top10ProgressRow[];
  /** Canonical Top-10 moves that are NOT yet shipped (for handoff context). */
  pending_moves: string[];
}

export interface ShippedPlaybooksRow {
  slug: string;
  title: string;
  shipped_at: string;
  notes: string;
}

export interface ShippedPlaybooksBlock {
  shipped_count: number;
  total_count: number;
  rows: ShippedPlaybooksRow[];
}

export interface OverrideBlock {
  move_id: string;
  move_name: string;
  set_at: string;
  reason: string;
  /** The move id the algorithm would have picked at the same store inputs. */
  algorithmic_pick_id: string;
  algorithmic_pick_name: string;
  /** True when the override exactly matches the algorithmic pick. */
  matches_algorithm: boolean;
}

/**
 * Mirror of `moveIdFromStatus` from `/components/top10-shipped-tracker.tsx`
 * and `/components/top10-export-button.tsx`. Kept identical across all
 * three sites to avoid drift.
 */
function moveIdFromStatus(s: Top10Status): string {
  const rankMatch = /#(\d+)/.exec(s.move);
  if (rankMatch && rankMatch[1]) {
    return `top10:#${rankMatch[1]}`;
  }
  const slug = s.move
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `top10:${slug || "unknown"}`;
}

function playbookBySlugMap(playbooks: Playbook[]): Record<string, Playbook> {
  const out: Record<string, Playbook> = {};
  for (const p of playbooks) {
    const slug = p.file.replace(/\.md$/, "");
    out[slug] = p;
  }
  return out;
}

function buildTop10Block(
  status: Top10Status[],
  playbooks: Playbook[],
  shipped: Record<string, { shippedAt: string }>,
): Top10ProgressBlock {
  const playbookBySlug = playbookBySlugMap(playbooks);
  const rows: Top10ProgressRow[] = [];
  const pending: string[] = [];

  for (const s of status) {
    const id = moveIdFromStatus(s);
    const entry = shipped[id];
    if (!entry) {
      if (s.move && !s.shipped) pending.push(s.move);
      continue;
    }
    const links = resolvePlaybookLinksForMove(s.move);
    if (links.length === 0) {
      // Move has no direct playbook — surface a placeholder row.
      rows.push({
        rank: s.move.split(".")[0] ?? "",
        move: s.move,
        shipped_at: entry.shippedAt.slice(0, 10),
        playbook_slug: "",
        playbook_title: "(no playbook unlocked)",
        playbook_href: "",
      });
      continue;
    }
    for (const link of links) {
      const pb = playbookBySlug[link.slug];
      rows.push({
        rank: s.move.split(".")[0] ?? "",
        move: s.move,
        shipped_at: entry.shippedAt.slice(0, 10),
        playbook_slug: link.slug,
        playbook_title: pb?.title ?? link.title,
        playbook_href: link.href,
      });
    }
  }

  const shippedCount = status.filter((s) => s.shipped).length;
  return {
    shipped_count: shippedCount,
    total_count: status.length,
    rows,
    pending_moves: pending,
  };
}

function buildShippedPlaybooksBlock(
  playbooks: Playbook[],
  shipped: ShippedMap,
): ShippedPlaybooksBlock {
  const playbookBySlug = playbookBySlugMap(playbooks);
  const rows: ShippedPlaybooksRow[] = [];
  for (const [slug, entry] of Object.entries(shipped)) {
    if (!entry || typeof entry.shippedAt !== "string") continue;
    const pb = playbookBySlug[slug];
    rows.push({
      slug,
      title: pb?.title ?? slug,
      shipped_at: entry.shippedAt.slice(0, 10),
      notes: typeof entry.notes === "string" ? entry.notes : "",
    });
  }
  rows.sort((a, b) => (a.shipped_at < b.shipped_at ? 1 : -1));
  return {
    shipped_count: rows.length,
    total_count: playbooks.length,
    rows,
  };
}

function buildOverrideBlock(
  override: NextMoveOverride | null,
  shipped: ShippedMap,
  store: YourStoreInputs,
): OverrideBlock | null {
  if (!override) return null;
  const move = MOVE_RECOMMENDATIONS.find((m) => m.id === override.moveId);
  if (!move) return null;
  const algorithmic = pickNextMove(store, shipped, null);
  return {
    move_id: move.id,
    move_name: move.name,
    set_at: override.setAt,
    reason: typeof override.reason === "string" ? override.reason : "",
    algorithmic_pick_id: algorithmic?.move?.id ?? "",
    algorithmic_pick_name: algorithmic?.move?.name ?? "",
    matches_algorithm: algorithmic?.move?.id === move.id,
  };
}

/**
 * Build the full export payload. Caller must already have loaded each
 * tracker's state via its respective `load*` helper.
 */
export function buildProgressExport(args: {
  top10Status: Top10Status[];
  playbooks: Playbook[];
  top10Shipped: Record<string, { shippedAt: string }>;
  shippedPlaybooks: ShippedMap;
  override: NextMoveOverride | null;
  store: YourStoreInputs;
  now?: Date;
}): ProgressExportPayload {
  const now = args.now ?? new Date();
  return {
    schema: PROGRESS_EXPORT_SCHEMA,
    version: PROGRESS_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    top10: buildTop10Block(args.top10Status, args.playbooks, args.top10Shipped),
    shipped_playbooks: buildShippedPlaybooksBlock(args.playbooks, args.shippedPlaybooks),
    override: buildOverrideBlock(args.override, args.shippedPlaybooks, args.store),
  };
}

/** RFC 4180 cell escape. */
function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Flatten the export payload into a single CSV with section headers.
 * Sections are separated by a blank line and each starts with a `# `
 * comment line (CSV parsers ignore lines that don't match the column
 * count when configured permissively). The receiver can split sections
 * on the `# ` prefix or copy each section independently.
 */
export function progressExportToCsv(payload: ProgressExportPayload): string {
  const lines: string[] = [];

  lines.push(`# ecommerce-ops-progress v${payload.version} — exported ${payload.exportedAt}`);
  lines.push("");

  // top10 section
  lines.push("# section: top10");
  lines.push(
    ["rank", "move", "shipped_at", "playbook_slug", "playbook_title", "playbook_href"]
      .map(csvEscape)
      .join(","),
  );
  for (const r of payload.top10.rows) {
    lines.push(
      [r.rank, r.move, r.shipped_at, r.playbook_slug, r.playbook_title, r.playbook_href]
        .map(csvEscape)
        .join(","),
    );
  }
  lines.push("");

  // shipped_playbooks section
  lines.push("# section: shipped_playbooks");
  lines.push(["slug", "title", "shipped_at", "notes"].map(csvEscape).join(","));
  for (const r of payload.shipped_playbooks.rows) {
    lines.push(
      [r.slug, r.title, r.shipped_at, r.notes].map(csvEscape).join(","),
    );
  }
  lines.push("");

  // override section (single row, blank when no override)
  lines.push("# section: override");
  lines.push(
    [
      "move_id",
      "move_name",
      "set_at",
      "reason",
      "algorithmic_pick_id",
      "algorithmic_pick_name",
      "matches_algorithm",
    ]
      .map(csvEscape)
      .join(","),
  );
  if (payload.override) {
    const o = payload.override;
    lines.push(
      [
        o.move_id,
        o.move_name,
        o.set_at,
        o.reason,
        o.algorithmic_pick_id,
        o.algorithmic_pick_name,
        o.matches_algorithm ? "yes" : "no",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  lines.push("");
  return lines.join("\n");
}
