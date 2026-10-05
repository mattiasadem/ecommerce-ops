/**
 * `next-move-plan-share.ts` — Move #N.15 — encode / decode a what-if plan
 * into a URL hash so an operator can paste the link into Slack and have the
 * recipient open the dashboard and see the same plan auto-loaded.
 *
 * Why this exists: the what-if plan in Move #N.13 + Move #N.14 is purely
 * local (lives in `ecom-ops:next-move-what-if:v1`). When an operator wants
 * to share "here's my 4-week plan, what do you think?" with a co-founder /
 * growth partner / agency, they currently have to screenshot the calendar
 * and type the IDs by hand. That's a 30-second copy-paste to a 5-minute
 * round-trip — and the recipient ends up looking at a stale screenshot
 * rather than the live plan.
 *
 * Move #N.15 closes that gap with a one-click "Copy share link" button
 * that encodes the plan into the URL hash. The hash format is:
 *
 *   #plan=<csv-move-ids>&start=<YYYY-MM-DD>
 *
 * - `<csv-move-ids>` — comma-separated list of move IDs that are in the
 *   what-if plan (priority order is implicit — the URL preserves the order
 *   they were added by the operator's toggles).
 * - `<start>` — optional plan-start date (defaults to today if absent).
 *
 * The component layer reads the hash on mount, validates every entry
 * against `MOVE_RECOMMENDATIONS`, and (1) loads the plan into the what-if
 * localStorage if the recipient is on a fresh browser, (2) displays a
 * sky-tinted banner "Loaded shared plan (N moves) from link" so the
 * recipient knows where the plan came from.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component).
 */

import { MOVE_RECOMMENDATIONS } from "./next-move";
import type { WhatIfMap } from "./next-move-what-if";

// -- URL hash format constants ------------------------------------------------

/** URL hash key that identifies a plan-share link. The bare key is
 *  used for parsing (we add the `&` / `^` boundary when matching).
 *  Bump suffix if the encoding format changes incompatibly. */
export const PLAN_SHARE_HASH_KEY = "plan";

/** URL hash key for the plan-start date (optional). */
export const PLAN_SHARE_START_KEY = "start";

/** Storage key used to track "the most recently auto-imported plan" so the
 *  banner can read its move count and the operator can re-share. */
export const PLAN_SHARE_LAST_IMPORTED_KEY =
  "ecom-ops:next-move-plan-share:last-imported:v1";

export const PLAN_SHARE_LAST_IMPORTED_EVENT =
  "ecom-ops:next-move-plan-share:last-imported:update";

// -- Hash parser -------------------------------------------------------------

export interface ParsedPlanShareHash {
  /** Move IDs in the order they appear in the URL (the operator's priority). */
  moveIds: string[];
  /** Plan-start date as YYYY-MM-DD (defaults to today). */
  startDate: string;
  /** True when the hash had a valid prefix + non-empty move list. */
  valid: boolean;
}

/**
 * Parse a URL hash fragment into a plan-share struct. Tolerant: missing /
 * malformed prefixes return `valid: false` so the caller can decide to
 * skip the import rather than throw.
 *
 * @param hash  The value of `window.location.hash` (with or without leading `#`).
 */
export function parsePlanShareHash(hash: string): ParsedPlanShareHash {
  const todayIso = new Date().toISOString().slice(0, 10);
  if (!hash || typeof hash !== "string") {
    return { moveIds: [], startDate: todayIso, valid: false };
  }
  // Strip leading # if present.
  const stripped = hash.replace(/^#/, "");

  // Look for a `plan=...` segment. The hash can contain other fragments
  // (e.g. FlowFixRecipe's `#1.1_browse_abandon`); we tolerate extra bits.
  // The CSV body excludes both `&` (next fragment) AND `=` (e.g. the next
  // `start=` segment, in case anyone URL-encodes the hash differently).
  const planMatch = new RegExp(
    `(?:^|&)${escapeRegex(PLAN_SHARE_HASH_KEY)}=([^&]+)`
  ).exec(stripped);
  if (!planMatch) {
    return { moveIds: [], startDate: todayIso, valid: false };
  }
  const rawIds = planMatch[1];

  // Optional `start=YYYY-MM-DD`.
  const startMatch = new RegExp(
    `(?:^|&)${escapeRegex(PLAN_SHARE_START_KEY)}=(\\d{4}-\\d{2}-\\d{2})`
  ).exec(stripped);
  const startDate =
    startMatch && isValidIsoDate(startMatch[1]) ? startMatch[1] : todayIso;

  // Split CSV. Tolerate stray whitespace + empty entries.
  const moveIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (moveIds.length === 0) {
    return { moveIds: [], startDate, valid: false };
  }

  return { moveIds, startDate, valid: true };
}

/**
 * Encode a what-if map + plan-start date into a URL hash fragment (without
 * the leading `#`). Empty plan returns "" so the caller can skip the hash
 * entirely.
 *
 * The CSV preserves the order of `Object.keys(whatIf)` (insertion order in
 * modern JS), which matches the operator's priority-by-add order.
 *
 * @param whatIf     The operator's hypothetical plan map.
 * @param startDate  The plan-start date (YYYY-MM-DD). If omitted, today's date is used.
 */
export function encodePlanShareHash(
  whatIf: WhatIfMap,
  startDate?: string
): string {
  const ids = Object.keys(whatIf);
  if (ids.length === 0) return "";
  const todayIso = new Date().toISOString().slice(0, 10);
  const sd = startDate && isValidIsoDate(startDate) ? startDate : todayIso;
  return `${PLAN_SHARE_HASH_KEY}=${ids.join(",")}&${PLAN_SHARE_START_KEY}=${sd}`;
}

/**
 * Resolve a parsed hash against `MOVE_RECOMMENDATIONS`, returning the
 * canonical moves the recipient should see, plus a list of unrecognized
 * IDs (so the caller can flag typos / retired moves in the banner).
 *
 * @param parsed  The output of `parsePlanShareHash`.
 */
export function resolveSharedPlan(parsed: ParsedPlanShareHash): {
  moves: { id: string; priorityRank: number; name: string }[];
  unknownMoveIds: string[];
} {
  const known = new Map(
    MOVE_RECOMMENDATIONS.map((m) => [m.id, m] as const)
  );
  const moves: { id: string; priorityRank: number; name: string }[] = [];
  const unknownMoveIds: string[] = [];
  for (const id of parsed.moveIds) {
    const m = known.get(id);
    if (m) {
      moves.push({ id: m.id, priorityRank: m.priorityRank, name: m.name });
    } else {
      unknownMoveIds.push(id);
    }
  }
  return { moves, unknownMoveIds };
}

// -- Plan import (writes to what-if map + plan-start) ------------------------

/**
 * Build a what-if map from a parsed share hash. Pure — caller is
 * responsible for writing it to localStorage via `saveWhatIf` /
 * `savePlanStartDate`.
 *
 * Each entry is stamped with the current `addedAt` timestamp so the
 * recipient's `runWhatIf` shows the original move order (the hash
 * preserves order, and `addedAt` is monotone).
 */
export function whatIfFromSharedPlan(parsed: ParsedPlanShareHash): WhatIfMap {
  const known = new Set(MOVE_RECOMMENDATIONS.map((m) => m.id));
  const out: WhatIfMap = {};
  // Increment addedAt by 1 second per position so the order is stable even
  // when the recipient re-shares the link within the same minute.
  const base = Date.now();
  let i = 0;
  for (const id of parsed.moveIds) {
    if (!known.has(id)) continue;
    out[id] = { addedAt: new Date(base + i * 1000).toISOString() };
    i++;
  }
  return out;
}

// -- Display helpers ---------------------------------------------------------

/**
 * Build a one-line summary of a parsed share hash for the toast / banner.
 * "Loaded shared plan: Move #1 (abandoned cart), Move #3 (welcome series)..."
 * Truncates with " +N more" past 3 moves to keep the banner compact.
 */
export function describeSharedPlan(parsed: ParsedPlanShareHash): string {
  if (!parsed.valid || parsed.moveIds.length === 0) {
    return "Empty plan";
  }
  const known = new Map(
    MOVE_RECOMMENDATIONS.map((m) => [m.id, m] as const)
  );
  const MAX_INLINE = 3;
  const inline = parsed.moveIds.slice(0, MAX_INLINE);
  const parts = inline.map((id) => {
    const m = known.get(id);
    return m ? `Move #${m.priorityRank}` : id;
  });
  const head = parts.join(", ");
  const more = parsed.moveIds.length - inline.length;
  return more > 0 ? `${head} +${more} more` : head;
}

/** Tone class for the share-banner — sky for "loaded shared plan". */
export function planShareBannerToneClass(): string {
  return "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-300";
}

// -- Internal helpers --------------------------------------------------------

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isFinite(d.getTime());
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}