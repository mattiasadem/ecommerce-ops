/**
 * `Unified progress import — markdown variant` — operator handoff
 * restore from a pasted Markdown table / bullet list (NOT the canonical
 * JSON).
 *
 * Closes the "I don't have a JSON export, I have a Notion table / Slack
 * thread" gap. Move #128.af shipped the JSON export + Move #128.ag
 * shipped the JSON-import panel. This module is a third restore path
 * for teams that communicate via plain markdown:
 *
 *   # Ecom-ops handoff — 2026-09-15
 *   ## Shipped playbooks
 *   - [x] 01-abandoned-cart-flow-klaviyo — 2026-09-10 — live for 2 weeks
 *   - [x] 04-welcome-series-klaviyo — 2026-09-12
 *   ## Shipped Top-10 moves
 *   - [x] Move #1 — abandoned cart flow klaviyo
 *   - [x] Move #4 — welcome series klaviyo
 *   ## Override
 *   Pinned Move #3 instead of #1 — because checkout audit is more urgent
 *
 * The parser is forgiving: bullet markers (`-` / `*` / `+`), checkbox
 * states (`[x]` / `[X]` / `[ ]`), dates (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`
 * ISO), Move-#N references (`Move #1`, `move 4`, `#2`, `2.`), and
 * optional trailing notes (anything after `—` or `-` separator).
 * Unknown tokens are skipped (not errors) so a teammate can paste a
 * Slack thread with mixed content.
 *
 * Output: same `ProgressImportSummary` shape as `progress-import.ts` so
 * the UI side can share the render code. The `payload` field is
 * constructed in-line as a `ProgressExportPayload` so
 * `applyProgressImport()` works unchanged.
 */

import {
  PROGRESS_EXPORT_SCHEMA,
  PROGRESS_EXPORT_VERSION,
  type ProgressExportPayload,
} from "./progress-export";
import { MOVE_RECOMMENDATIONS } from "./next-move";
import { resolvePlaybookLinksForMove } from "./top10-playbook-mapping";

/** Per-row classified summary — the markdown parser hands the UI a
 *  per-block breakdown so it can render the same green ✓ badge the JSON
 *  importer uses. Mirrors `progress-import.ts`'s shape. */
export interface ProgressMarkdownImportSummary {
  /** True when at least one row was recognized (any of the 3 blocks). */
  ok: boolean;
  /** Top-level error message when `ok=false`. */
  error: string | null;
  /** The constructed payload when `ok=true`. */
  payload: ProgressExportPayload | null;
  /** Number of playbook rows recognized. */
  playbookRows: number;
  /** Number of top10 rows recognized. */
  top10Rows: number;
  /** Whether an override line was recognized. */
  overrideRow: boolean;
  /** True when the override move-id is still in the current catalog. */
  overrideValidAgainstCurrent: boolean;
  /** Free-form preview lines (for the UI "what was detected" panel). */
  previewLines: string[];
  /** Lines that looked like data but couldn't be parsed (for the UI
   *  "skipped" list). */
  skippedLines: string[];
  /** ISO of the synthesized exportedAt — the parser's now-ISO. */
  exportedAt: string;
}

/** Recognize a markdown bullet line that contains a shipped playbook slug.
 *  Matches `- [x] 01-abandoned-cart-flow-klaviyo` + optional ` — 2026-09-10` + optional ` — note`. */
const PLAYBOOK_BULLET_RE = /^\s*[-*+]\s*\[([xX ])\]\s+([a-z0-9][a-z0-9-]*)\s*(?:[—\-:|]\s*(.+?))?\s*$/;

/** Recognize a markdown bullet line that contains a shipped Top-10 move.
 *  Accepts `Move #1`, `Move 1`, `#1`, `1.` — followed by an optional name. */
const MOVE_BULLET_RE = /^\s*[-*+]\s*\[([xX ])\]\s*(?:move\s*#?(\d+)|#(\d+)|(\d+)\.)\s*(?:[—\-:|]\s*(.+?))?\s*$/i;

/** Recognize a markdown heading + the override line below it.
 *  Matches `## Override` (or `# Override`, `**Override**`, etc.) followed
 *  by a non-list line that says "pinned Move #X" or "pinned Move X" etc. */
const OVERRIDE_HEADING_RE = /^\s*(?:#{1,6}\s*|>\s*|\*\*)?\s*override\b/i;
const OVERRIDE_BODY_RE = /(?:pinned|override|pinning)\s+move\s*#?(\d+)\b/i;

/** Date-ish patterns to look for in the trailing note of a playbook bullet. */
const DATE_ISO_RE = /\b(\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?)\b/;

/** Map a Top-10 move rank (e.g. 1) to the canonical move id. Returns
 *  null when no move has that rank in the current catalog. */
function moveIdFromRank(rank: number): string | null {
  const m = MOVE_RECOMMENDATIONS.find((mr) => mr.priorityRank === rank);
  return m ? m.id : null;
}

/** Map a move-id back to its rank (for the preview UI). */
function rankFromMoveId(moveId: string): number | null {
  const m = MOVE_RECOMMENDATIONS.find((mr) => mr.id === moveId);
  return m ? m.priorityRank : null;
}

/** Recognize a playbook slug — must match an actual playbook file in
 *  content.json. We accept any slug-shaped token for the "skipped" list
 *  to surface, but only mark a row as `recognized` when it's a known
 *  catalog entry. The actual catalog lookup happens in the component
 *  (this module is pure + catalog-agnostic so the test surface stays small).
 */
function isKnownPlaybookSlug(slug: string, knownPlaybookSlugs: ReadonlySet<string>): boolean {
  return knownPlaybookSlugs.has(slug);
}

function emptyMarkdownSummary(error: string): ProgressMarkdownImportSummary {
  return {
    ok: false,
    error,
    payload: null,
    playbookRows: 0,
    top10Rows: 0,
    overrideRow: false,
    overrideValidAgainstCurrent: false,
    previewLines: [],
    skippedLines: [],
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Parse + classify a pasted markdown string into a `ProgressImportSummary`.
 *
 * Pure: no localStorage access, no event dispatch. Caller passes the
 * canonical playbook slug set (from content.json) so the parser can
 * distinguish "recognized playbook" from "skipped unknown slug", AND
 * the canonical `top10Names` map (rank → "N. Name" display string) so
 * the constructed payload's `move` field uses the same shape the JSON
 * exporter uses (and that TOP10_PLAYBOOK_MAP keys against).
 */
export function parseProgressMarkdownImport(args: {
  text: string;
  knownPlaybookSlugs: ReadonlySet<string>;
  /** Map from rank (1..N) to the canonical "N. Name" string the JSON
   *  exporter uses. E.g. `{ 1: "1. Abandoned cart flow", 2: "2. Post-purchase upsell" }`. */
  top10Names: Readonly<Record<number, string>>;
}): ProgressMarkdownImportSummary {
  const trimmed = args.text.trim();
  if (!trimmed) {
    return emptyMarkdownSummary("Pasted content is empty.");
  }

  const lines = trimmed.split(/\r?\n/);
  const playbookRows: { slug: string; shippedAt: string; notes?: string }[] = [];
  const top10Rows: { moveId: string; shippedAt: string }[] = [];
  const previewLines: string[] = [];
  const skippedLines: string[] = [];
  let overrideMoveId: string | null = null;

  // Two-pass scan:
  //   Pass 1: collect bullet rows (playbook + top10) line by line.
  //   Pass 2: scan for the `## Override` block (heading + 1 body line).
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    // Playbook bullet?
    const pbMatch = PLAYBOOK_BULLET_RE.exec(line);
    if (pbMatch) {
      const [, checked, slug, tail] = pbMatch;
      if (!isKnownPlaybookSlug(slug, args.knownPlaybookSlugs)) {
        skippedLines.push(`Unknown playbook slug: \`${slug}\``);
        continue;
      }
      const dateMatch = tail ? DATE_ISO_RE.exec(tail) : null;
      const shippedAt = dateMatch
        ? new Date(dateMatch[1]).toISOString()
        : new Date().toISOString();
      const notes = tail
        ? tail.replace(DATE_ISO_RE, "").replace(/^[—\-:|]\s*/, "").trim() || undefined
        : undefined;
      playbookRows.push({ slug, shippedAt, notes });
      previewLines.push(
        checked.toLowerCase() === "x"
          ? `Playbook ✓ \`${slug}\` (${shippedAt.slice(0, 10)})${notes ? ` — ${notes}` : ""}`
          : `Playbook ○ \`${slug}\` (not shipped — ignored)`,
      );
      continue;
    }

    // Top-10 move bullet?
    const mvMatch = MOVE_BULLET_RE.exec(line);
    if (mvMatch) {
      const [, checked, rankA, rankB, rankC] = mvMatch;
      const rankRaw = rankA ?? rankB ?? rankC;
      const rank = rankRaw ? parseInt(rankRaw, 10) : NaN;
      if (Number.isNaN(rank)) {
        skippedLines.push(`Unrecognized move rank: \`${line.trim()}\``);
        continue;
      }
      const moveId = moveIdFromRank(rank);
      if (!moveId) {
        skippedLines.push(`Move rank #${rank} not in current Top-10 catalog`);
        continue;
      }
      if (checked.toLowerCase() !== "x") {
        previewLines.push(`Move #${rank} ○ (not checked — ignored)`);
        continue;
      }
      top10Rows.push({ moveId, shippedAt: new Date().toISOString() });
      previewLines.push(`Move #${rank} ✓ (\`${moveId}\`)`);
      continue;
    }
  }

  // Override: scan ALL non-empty lines (not just after `## Override`
  // heading — operators paste Slack threads without proper heading
  // discipline, so be forgiving). Use the body regex on every line.
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Skip bullets (already handled above).
    if (PLAYBOOK_BULLET_RE.test(line) || MOVE_BULLET_RE.test(line)) continue;
    const ovMatch = OVERRIDE_BODY_RE.exec(line);
    if (ovMatch) {
      const rank = parseInt(ovMatch[1], 10);
      const moveId = moveIdFromRank(rank);
      if (moveId) {
        overrideMoveId = moveId;
        previewLines.push(`Override ✓ Move #${rank} (\`${moveId}\`) — "${line}"`);
      } else {
        skippedLines.push(`Override references retired Move #${rank}`);
      }
      break;
    }
  }

  // If we didn't recognize ANY rows, the input is probably garbage —
  // surface that as an error so the UI shows red, not a confusing
  // empty-success state.
  if (playbookRows.length === 0 && top10Rows.length === 0 && !overrideMoveId) {
    return emptyMarkdownSummary(
      `No progress rows recognized. Expected markdown like:
        - [x] 01-abandoned-cart-flow-klaviyo — 2026-09-10
        - [x] Move #1 — abandoned cart flow
        ## Override
        Pinned Move #3 because checkout audit is more urgent`,
    );
  }

  const overrideValidAgainstCurrent = overrideMoveId
    ? MOVE_RECOMMENDATIONS.some((m) => m.id === overrideMoveId)
    : false;

  const now = new Date().toISOString();
  // The canonical payload's `top10.rows` shape is per-move × per-playbook.
  // For the markdown variant we don't know which playbook each Move was
  // shipped for, so each row uses the move's primary playbook (or empty
  // fields when none). This keeps `applyProgressImport()` working
  // unchanged — it only reads `r.move` and `r.shipped_at` from these
  // rows (see `progress-import.ts:243-248`). The `move` field uses the
  // canonical "N. Name" display string (looked up from the top10Names
  // map passed in by the caller) so it matches TOP10_PLAYBOOK_MAP keys
  // and the JSON export's shape byte-for-byte.
  const top10BlockRows = top10Rows.map((r) => {
    const rank = rankFromMoveId(r.moveId);
    const canonicalName =
      rank !== null ? args.top10Names[rank] ?? `Move #${rank}` : r.moveId;
    const links = resolvePlaybookLinksForMove(canonicalName);
    const primary = links[0];
    return {
      rank: rank !== null ? String(rank) : "?",
      move: canonicalName,
      shipped_at: r.shippedAt,
      playbook_slug: primary ? primary.slug : "",
      playbook_title: primary ? primary.title : "",
      playbook_href: primary ? primary.href : "",
    };
  });
  const payload: ProgressExportPayload = {
    schema: PROGRESS_EXPORT_SCHEMA,
    version: PROGRESS_EXPORT_VERSION,
    exportedAt: now,
    top10: {
      shipped_count: top10BlockRows.length,
      total_count: top10BlockRows.length,
      rows: top10BlockRows,
      pending_moves: [],
    },
    shipped_playbooks: {
      shipped_count: playbookRows.length,
      total_count: playbookRows.length,
      rows: playbookRows.map((r) => ({
        slug: r.slug,
        title: "",
        shipped_at: r.shippedAt,
        notes: r.notes ?? "",
      })),
    },
    override: overrideMoveId
      ? (() => {
          const overrideMove = MOVE_RECOMMENDATIONS.find(
            (m) => m.id === overrideMoveId,
          );
          return {
            move_id: overrideMoveId,
            move_name: overrideMove ? overrideMove.name : "",
            set_at: now,
            reason: extractOverrideReason(lines, overrideMoveId) ?? "",
            algorithmic_pick_id: "",
            algorithmic_pick_name: "",
            matches_algorithm: false,
          };
        })()
      : null,
  };

  return {
    ok: true,
    error: null,
    payload,
    playbookRows: playbookRows.length,
    top10Rows: top10Rows.length,
    overrideRow: overrideMoveId !== null,
    overrideValidAgainstCurrent,
    previewLines,
    skippedLines,
    exportedAt: now,
  };
}

/** Pull the reason text from the override line that matched. */
function extractOverrideReason(lines: string[], _moveId: string): string | undefined {
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (PLAYBOOK_BULLET_RE.test(line) || MOVE_BULLET_RE.test(line)) continue;
    if (OVERRIDE_BODY_RE.test(line)) {
      // Strip everything up to (and including) the matched Move #N.
      const cleaned = line
        .replace(OVERRIDE_HEADING_RE, "")
        .replace(OVERRIDE_BODY_RE, "")
        .replace(/^[—\-:|]\s*/, "")
        .trim();
      return cleaned || undefined;
    }
  }
  return undefined;
}
