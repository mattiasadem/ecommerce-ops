/**
 * `Unified progress import` — operator handoff restore.
 *
 * Closes the export↔import loop on the operator-progress side. Move #128.af
 * shipped `progress-export.ts` — the export half that bundles Top-10,
 * shipped-playbooks, and Next-move override into one JSON/CSV artifact
 * for handoff. This module is the symmetric import half: take a pasted
 * JSON string, validate it against the same `ecommerce-ops-progress`
 * schema, and return a structured view of what would change.
 *
 * The actual localStorage writes live in `progress-import-button.tsx`
 * (a React component) — this file is pure: parse + validate + classify,
 * side-effect-free. It mirrors `progress-export.ts` line-for-line so a
 * future reader who learns one side learns the other.
 *
 * Default merge mode = additive. Existing localStorage keys are kept;
 * pasted values fill in missing keys OR update existing entries when
 * the pasted `shippedAt` is later than the stored `shippedAt`. This
 * matches the operator's mental model — "import should ADD what I have
 * on this other device, never silently erase what I have here." A
 * destructive `replace` mode is exposed as an explicit boolean for the
 * rare case the operator wants to overwrite (e.g. device migration).
 *
 * Bump the suffix (`v1` → `v2`) in both this file and `progress-export.ts`
 * when the payload schema changes incompatibly.
 */

import {
  PROGRESS_EXPORT_SCHEMA,
  PROGRESS_EXPORT_VERSION,
  type ProgressExportPayload,
} from "./progress-export";
import { MOVE_RECOMMENDATIONS } from "./next-move";

export interface ProgressImportSummary {
  /** True when the input parsed cleanly against the canonical schema. */
  ok: boolean;
  /** Top-level error message when `ok=false`. */
  error: string | null;
  /** The structured payload when `ok=true`. */
  payload: ProgressExportPayload | null;
  /** Per-block classified counts (for the preview UI). */
  top10IncomingRows: number;
  /** Number of incoming rows that would CHANGE the existing shipped map
   *  (i.e. new moves OR existing moves with newer shippedAt). */
  top10DiffRows: number;
  shippedPlaybooksIncomingRows: number;
  shippedPlaybooksDiffRows: number;
  overrideIncoming: boolean;
  /** True when the override in the payload is still valid against the
   *  current MOVE_RECOMMENDATIONS list. */
  overrideValidAgainstCurrent: boolean;
  /** ISO of the source payload's `exportedAt` for display. */
  exportedAt: string | null;
  /** Sanity-check: schema + version that was matched. */
  schemaMatched: string | null;
  versionMatched: number | null;
}

/**
 * Parse + validate a pasted JSON string against the canonical export
 * schema. **Pure** — does not touch localStorage, does not dispatch
 * events. Returns a summary describing what was found; the caller
 * decides whether to apply it.
 */
export function parseProgressImport(text: string): ProgressImportSummary {
  const trimmed = text.trim();
  if (!trimmed) {
    return emptySummary("Pasted content is empty.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return emptySummary(`Invalid JSON: ${msg}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptySummary("Root must be a JSON object.");
  }

  const p = parsed as Partial<ProgressExportPayload>;
  if (p.schema !== PROGRESS_EXPORT_SCHEMA) {
    return emptySummary(
      `Schema mismatch: expected "${PROGRESS_EXPORT_SCHEMA}" but got "${String(
        p.schema,
      )}".`,
    );
  }
  if (p.version !== PROGRESS_EXPORT_VERSION) {
    return emptySummary(
      `Version mismatch: this build understands v${PROGRESS_EXPORT_VERSION} but the pasted payload is v${String(
        p.version,
      )}.`,
    );
  }

  // Per-block defensive validation. We don't drop the whole payload for
  // a single malformed block — we surface it via `top10IncomingRows = 0`
  // and let the UI show "no top10 rows in payload".
  const top10Rows = Array.isArray(p.top10?.rows) ? p.top10!.rows : [];
  const shipRows = Array.isArray(p.shipped_playbooks?.rows)
    ? p.shipped_playbooks!.rows
    : [];

  const validTop10 = top10Rows.filter(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as { move?: unknown }).move === "string",
  );

  const validShip = shipRows.filter((r) => {
    if (!r || typeof r !== "object") return false;
    const x = r as { slug?: unknown; shipped_at?: unknown };
    return typeof x.slug === "string" && typeof x.shipped_at === "string";
  });

  // Override: must reference a move that exists in the current catalog.
  // If a teammate exports a payload and the move was retired locally,
  // we surface the bad news but still let the rest of the blocks through.
  let overrideValid = false;
  let overrideIncoming = false;
  if (p.override && typeof p.override === "object") {
    overrideIncoming = true;
    const ov = p.override as { move_id?: unknown };
    if (typeof ov.move_id === "string") {
      overrideValid = MOVE_RECOMMENDATIONS.some((m) => m.id === ov.move_id);
    }
  }

  // For "diff" counts without a real existing state, we can only return
  // the incoming counts here. The component computes the merge diff
  // inline against the live localStorage state.
  return {
    ok: true,
    error: null,
    payload: p as ProgressExportPayload,
    top10IncomingRows: validTop10.length,
    top10DiffRows: validTop10.length,
    shippedPlaybooksIncomingRows: validShip.length,
    shippedPlaybooksDiffRows: validShip.length,
    overrideIncoming,
    overrideValidAgainstCurrent: overrideValid,
    exportedAt: typeof p.exportedAt === "string" ? p.exportedAt : null,
    schemaMatched: PROGRESS_EXPORT_SCHEMA,
    versionMatched: PROGRESS_EXPORT_VERSION,
  };
}

function emptySummary(error: string): ProgressImportSummary {
  return {
    ok: false,
    error,
    payload: null,
    top10IncomingRows: 0,
    top10DiffRows: 0,
    shippedPlaybooksIncomingRows: 0,
    shippedPlaybooksDiffRows: 0,
    overrideIncoming: false,
    overrideValidAgainstCurrent: false,
    exportedAt: null,
    schemaMatched: null,
    versionMatched: null,
  };
}

/**
 * Moved-to-id helper. Mirrors `moveIdFromStatus` in `progress-export.ts`
 * + `top10-shipped-tracker.tsx` — kept identical across all three sites
 * so a "Move #1" row in the export reconstructs to the same key it was
 * written from on the source device.
 */
export function moveIdFromImportedRank(moveName: string): string {
  const rankMatch = /#(\d+)/.exec(moveName);
  if (rankMatch && rankMatch[1]) {
    return `top10:#${rankMatch[1]}`;
  }
  const slug = moveName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `top10:${slug || "unknown"}`;
}

/**
 * Merge-shape compute: given the parsed payload + the CURRENTLY STORED
 * shipped maps, return the three next-state maps the caller should
 * write to localStorage. Pure: returns maps, does not write.
 *
 * Merge rules (per tracker):
 *   - top10 shipped: rows are 1:many with moves. Group by move-id, take
 *     the latest `shipped_at` per move, then add to / overwrite the
 *     stored map only when the incoming `shipped_at` is later than the
 *     stored one (or the key is missing).
 *   - shipped_playbooks: per-slug. Same latest-wins rule. Per-slug notes
 *     overwrite when the incoming entry has a note and the stored one
 *     does not — to preserve any local-only notes that came after.
 *   - override: replace only when the payload's move-id still exists in
 *     the current `MOVE_RECOMMENDATIONS`. Otherwise leave untouched.
 */
export interface ApplyProgressImportArgs {
  payload: ProgressExportPayload;
  currentTop10Shipped: Record<string, { shippedAt: string }>;
  currentShippedPlaybooks: Record<string, { shippedAt: string; notes?: string }>;
  replace?: boolean;
}

export interface ApplyProgressImportResult {
  /** Next-state top10 shipped map (write to localStorage). */
  nextTop10Shipped: Record<string, { shippedAt: string }>;
  /** Next-state shipped playbooks map (write to localStorage). */
  nextShippedPlaybooks: Record<string, { shippedAt: string; notes?: string }>;
  /** Override to write, or null to keep current / clear when `replace`. */
  nextOverride: { moveId: string; reason?: string } | null;
  /** Number of top10 moves that changed (added or newer shippedAt). */
  top10Changed: number;
  /** Number of playbook slugs that changed. */
  shippedPlaybooksChanged: number;
  /** True when the override was replaced. */
  overrideReplaced: boolean;
}

export function applyProgressImport(
  args: ApplyProgressImportArgs,
): ApplyProgressImportResult {
  const replace = args.replace === true;
  const next10 = replace ? {} : { ...args.currentTop10Shipped };
  const nextSp = replace ? {} : { ...args.currentShippedPlaybooks };

  // --- Top10 rows: collapse 1:many move × playbook → 1 entry per move ---
  let top10Changed = 0;
  const incomingByMove = new Map<
    string,
    { shippedAt: string }
  >();
  for (const row of args.payload.top10.rows ?? []) {
    if (!row || typeof row !== "object") continue;
    const moveName = (row as { move?: unknown }).move;
    const shippedAt = (row as { shipped_at?: unknown }).shipped_at;
    if (typeof moveName !== "string" || typeof shippedAt !== "string") continue;
    const id = moveIdFromImportedRank(moveName);
    const prev = incomingByMove.get(id);
    if (!prev || prev.shippedAt < shippedAt) {
      incomingByMove.set(id, { shippedAt });
    }
  }
  for (const [id, entry] of incomingByMove) {
    const cur = next10[id];
    if (!cur || cur.shippedAt < entry.shippedAt) {
      const isNew = !cur;
      next10[id] = entry;
      if (isNew || cur.shippedAt !== entry.shippedAt) top10Changed += 1;
    }
  }

  // --- Shipped-playbooks rows: 1:1 per slug, latest shippedAt wins ---
  let shipChanged = 0;
  for (const row of args.payload.shipped_playbooks.rows ?? []) {
    if (!row || typeof row !== "object") continue;
    const slug = (row as { slug?: unknown }).slug;
    const shippedAt = (row as { shipped_at?: unknown }).shipped_at;
    const notes = (row as { notes?: unknown }).notes;
    if (typeof slug !== "string" || typeof shippedAt !== "string") continue;
    const cur = nextSp[slug];
    const incomingNotes = typeof notes === "string" ? notes : undefined;
    if (!cur) {
      nextSp[slug] = {
        shippedAt,
        ...(incomingNotes ? { notes: incomingNotes } : {}),
      };
      shipChanged += 1;
      continue;
    }
    // Existing entry — only update if incoming is later
    if (cur.shippedAt < shippedAt) {
      nextSp[slug] = {
        shippedAt,
        notes: incomingNotes ?? cur.notes,
      };
      shipChanged += 1;
    }
  }

  // --- Override: replace only when move-id is still valid ---
  let nextOverride: { moveId: string; reason?: string } | null = null;
  let overrideReplaced = false;
  if (args.payload.override) {
    const ov = args.payload.override;
    if (
      typeof ov.move_id === "string" &&
      MOVE_RECOMMENDATIONS.some((m) => m.id === ov.move_id)
    ) {
      nextOverride = {
        moveId: ov.move_id,
        reason:
          typeof (ov as { reason?: unknown }).reason === "string"
            ? (ov as { reason?: string }).reason
            : undefined,
      };
      overrideReplaced = true;
    }
  } else if (replace) {
    // No incoming override + replace mode → clear local override.
    nextOverride = null;
    overrideReplaced = true;
  }

  return {
    nextTop10Shipped: next10,
    nextShippedPlaybooks: nextSp,
    nextOverride,
    top10Changed,
    shippedPlaybooksChanged: shipChanged,
    overrideReplaced,
  };
}
