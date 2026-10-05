/**
 * `next-move-plan-calendar.ts` — Move #N.14 — per-move ship-by date + ICS export
 * for the what-if scenario simulator.
 *
 * Move #N.13 ships the what-if toggle grid + cumulative-lift / SROI-delta
 * tiles. The plan is point-in-time ("here are the moves I want to ship") but
 * has no concrete calendar. This module closes the canonical "I have a plan,
 * but when do I ship each move and how do I drag the dates into Google
 * Calendar?" gap.
 *
 * Given:
 *   - A `WhatIfMap` (the operator's hypothetical plan from Move #N.13)
 *   - The `MOVE_RECOMMENDATIONS` catalog (each has `daysToShip`)
 *   - A plan-start date (default = today)
 *
 * Compute, for every move in the plan (in priority order):
 *   - `shipByDate` — ISO date string `YYYY-MM-DD` for the move's ship deadline
 *   - `startDate`  — ISO date string for the move's kickoff (1 day after the
 *                    previous move ships; or the plan start for the first move)
 *   - `cumulativeDays` — running calendar-day total (serial; no parallelization)
 *
 * Then emit TWO exports the operator can drag into their actual calendar:
 *   1. **`.ics`** — RFC 5545 with one all-day event per move + a master
 *      "Plan start" event. Imports into Google / Apple / Outlook.
 *   2. **Markdown timeline** — a paste-ready 30-/60-/90-day timeline with
 *      one row per move showing start → ship-by + cumulative days.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component layer in `next-move-plan-calendar.tsx`).
 */

import { MOVE_RECOMMENDATIONS, type MoveRecommendation } from "./next-move";
import type { WhatIfMap } from "./next-move-what-if";
import { runWhatIf } from "./next-move-what-if";
import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";

// ─────────────────────────────────────────────────────────────────────────
// Storage layer — the plan-start date is operator-owned, separate from the
// what-if map so editing the start date doesn't disturb the plan list.
// ─────────────────────────────────────────────────────────────────────────

export const PLAN_START_STORAGE_KEY = "ecom-ops:next-move-plan-start:v1";
export const PLAN_START_UPDATE_EVENT = "ecom-ops:next-move-plan-start:update";

const DEFAULT_PLAN_START_KEY = "ecom-ops:next-move-plan-start:v1";

export function loadPlanStartDate(): string {
  if (typeof window === "undefined") return todayIso();
  try {
    const raw = window.localStorage.getItem(DEFAULT_PLAN_START_KEY);
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  } catch {
    /* quota / private-mode */
  }
  return todayIso();
}

export function savePlanStartDate(iso: string): void {
  if (typeof window === "undefined") return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
  try {
    window.localStorage.setItem(DEFAULT_PLAN_START_KEY, iso);
    window.dispatchEvent(
      new CustomEvent(PLAN_START_UPDATE_EVENT, { detail: { startDate: iso } }),
    );
  } catch {
    /* quota / private-mode */
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────
// Pure logic
// ─────────────────────────────────────────────────────────────────────────

export interface PlanEntry {
  /** Canonical move (resolved from the WhatIfMap). */
  move: MoveRecommendation;
  /** Plan order (0-indexed; matches what `runWhatIf` returns). */
  planOrder: number;
  /** ISO date `YYYY-MM-DD` when the move should start (1 day after the prior move ships). */
  startDate: string;
  /** ISO date `YYYY-MM-DD` when the move should ship (= startDate + daysToShip - 1). */
  shipByDate: string;
  /** Cumulative days-to-ship at this point in the plan (sum of all prior `daysToShip`). */
  cumulativeDays: number;
}

export interface PlanCalendar {
  /** Plan start date (operator input). */
  startDate: string;
  /** Resolved, ordered plan entries (priority-sorted, mirrors `runWhatIf` order). */
  entries: PlanEntry[];
  /** Total calendar days (sum of all entries' `daysToShip`). */
  totalDays: number;
  /** Final ship-by date (= last entry's `shipByDate`); null when plan is empty. */
  finalShipByDate: string | null;
  /** Count of moves in the plan (excludes unknowns). */
  planSize: number;
  /** Unknown move ids in the WhatIfMap (e.g. retired moves). */
  unknownMoveIds: string[];
}

/** Sort a WhatIfMap's keys by `MOVE_RECOMMENDATIONS.priorityRank` asc, then by `addedAt` asc.
 *  Mirrors `runWhatIf`'s ordering so the plan calendar matches the simulator's view. */
function resolveAndSortMoves(plan: WhatIfMap): {
  resolved: MoveRecommendation[];
  unknown: string[];
} {
  const recById = new Map(MOVE_RECOMMENDATIONS.map((m) => [m.id, m]));
  const resolved: MoveRecommendation[] = [];
  const unknown: string[] = [];
  for (const id of Object.keys(plan)) {
    const rec = recById.get(id);
    if (rec) resolved.push(rec);
    else unknown.push(id);
  }
  resolved.sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    return a.id.localeCompare(b.id);
  });
  return { resolved, unknown };
}

/** Add `n` calendar days to a `YYYY-MM-DD` ISO date. Uses UTC to avoid TZ drift. */
export function addDays(iso: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Days between two ISO dates (end - start). Both inclusive, treated as UTC. */
export function daysBetween(startIso: string, endIso: string): number {
  const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startIso);
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endIso);
  if (!m1 || !m2) return 0;
  const d1 = Date.UTC(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3]));
  const d2 = Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/** Build the plan calendar — pure, no DOM. */
export function buildPlanCalendar(
  plan: WhatIfMap,
  startDate: string,
): PlanCalendar {
  const { resolved, unknown } = resolveAndSortMoves(plan);
  const entries: PlanEntry[] = [];
  let cursorDate = startDate;
  let cumulative = 0;

  for (let i = 0; i < resolved.length; i++) {
    const move = resolved[i];
    const days = Math.max(0, move.daysToShip);
    // startDate for move N: the cursor (which is 1 day after prior move's ship-by)
    const entryStart = i === 0 ? startDate : cursorDate;
    const shipBy = addDays(entryStart, Math.max(0, days - 1));
    cumulative += days;
    entries.push({
      move,
      planOrder: i,
      startDate: entryStart,
      shipByDate: shipBy,
      cumulativeDays: cumulative,
    });
    // Cursor for next move: ship-by + 1 (calendar day rollover)
    cursorDate = addDays(shipBy, 1);
  }

  return {
    startDate,
    entries,
    totalDays: cumulative,
    finalShipByDate: entries.length > 0 ? entries[entries.length - 1].shipByDate : null,
    planSize: entries.length,
    unknownMoveIds: unknown,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// SROI integration — reuse the simulator so the calendar's $ lift matches
// the what-if card exactly. This is a thin wrapper.
// ─────────────────────────────────────────────────────────────────────────

export interface PlanCalendarWithSroi {
  plan: PlanCalendar;
  /** Per-entry SROI (sourced from `runWhatIf` baseline ranking). */
  perEntrySroi: Array<{ entry: PlanEntry; sroiUsdPerDay: number }>;
  /** Cumulative monthly $ lift (low/high), matches the simulator. */
  cumulativeLiftLowUsd: number;
  cumulativeLiftHighUsd: number;
  /** Cumulative cost / month (midpoint). */
  cumulativeCostMidUsd: number;
  /** SROI delta vs no-plan baseline (USD/day). */
  sroiDeltaUsdPerDay: number;
}

export function buildPlanCalendarWithSroi(
  plan: WhatIfMap,
  startDate: string,
  yourStore: YourStoreInputs = YOUR_STORE_DEFAULTS,
): PlanCalendarWithSroi {
  const planCal = buildPlanCalendar(plan, startDate);
  const sim = runWhatIf(yourStore, {}, plan);
  const sroiByMoveId = new Map<string, number>();
  for (const r of sim.baselineSroiRanking) sroiByMoveId.set(r.moveId, r.sroiUsdPerDay);
  const perEntrySroi = planCal.entries.map((entry) => ({
    entry,
    sroiUsdPerDay: sroiByMoveId.get(entry.move.id) ?? 0,
  }));
  return {
    plan: planCal,
    perEntrySroi,
    cumulativeLiftLowUsd: sim.cumulativeLiftLowUsd,
    cumulativeLiftHighUsd: sim.cumulativeLiftHighUsd,
    cumulativeCostMidUsd: sim.cumulativeCostMidUsd,
    sroiDeltaUsdPerDay: sim.sroiDeltaUsdPerDay,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Exports — RFC 5545 .ics + markdown timeline
// ─────────────────────────────────────────────────────────────────────────

/** Fold a single text line to RFC 5545 (max 75 octets per content line). */
function icsFold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + 75);
    out.push(i === 0 ? chunk : ` ${chunk}`);
    i += 75;
  }
  return out.join("\r\n");
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsDateUtc(iso: string): string {
  // For all-day events RFC 5545 wants DATE-only `YYYYMMDD` (no time, no Z).
  return iso.replace(/-/g, "");
}

function icsDateUtcWithTime(iso: string): string {
  // For a master "plan start" event with a specific time (midnight UTC).
  return `${iso.replace(/-/g, "")}T000000Z`;
}

/** Emit a stable, content-hashed UID for an event so re-exporting the same plan
 *  doesn't create duplicate events in the operator's calendar. */
function icsUid(planStart: string, suffix: string): string {
  return `${planStart}-${suffix}@ecommerce-ops-dashboard`;
}

/** Build the .ics content for the plan calendar. */
export function planCalendarToIcs(plan: PlanCalendar): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//ecommerce-ops-dashboard//next-move-plan-calendar//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(`X-WR-CALNAME:${icsEscape("What-if move plan")}`);

  // Master "Plan start" event
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${icsUid(plan.startDate, "plan-start")}`);
  lines.push(`DTSTAMP:${icsDateUtcWithTime(plan.startDate)}`);
  lines.push(`DTSTART:${icsDateUtcWithTime(plan.startDate)}`);
  lines.push(`DTEND:${icsDateUtcWithTime(addDays(plan.startDate, 1))}`);
  lines.push(`SUMMARY:${icsEscape("What-if move plan — start")}`);
  lines.push(
    `DESCRIPTION:${icsEscape(
      `Kickoff for the ${plan.planSize}-move what-if plan. Total calendar days: ${plan.totalDays}. Ship-by: ${plan.finalShipByDate ?? "n/a"}.`,
    )}`,
  );
  lines.push("TRANSP:OPAQUE");
  lines.push("END:VEVENT");

  // One all-day event per move
  for (const entry of plan.entries) {
    const start = entry.startDate;
    const end = addDays(entry.shipByDate, 1); // DTEND is exclusive in all-day events
    const liftPerMove = (() => {
      // Lift is on the entry's move; we don't recompute it here, just include
      // a stable description with cumulative context.
      return `Move #${entry.move.priorityRank} — ${entry.move.name}`;
    })();
    const summary = `Move #${entry.move.priorityRank}: ${entry.move.name}`;
    const description =
      `${liftPerMove}\n` +
      `Days to ship: ${entry.move.daysToShip}\n` +
      `Plan order: ${entry.planOrder + 1} of ${plan.planSize}\n` +
      `Cumulative days: ${entry.cumulativeDays} of ${plan.totalDays}`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${icsUid(plan.startDate, entry.move.id)}`);
    lines.push(`DTSTAMP:${icsDateUtcWithTime(plan.startDate)}`);
    lines.push(`DTSTART;VALUE=DATE:${icsDateUtc(start)}`);
    lines.push(`DTEND;VALUE=DATE:${icsDateUtc(end)}`);
    lines.push(`SUMMARY:${icsEscape(summary)}`);
    lines.push(`DESCRIPTION:${icsEscape(description)}`);
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(icsFold).join("\r\n") + "\r\n";
}

/** Format USD with the canonical rounding rules from the dashboard's
 *  `format.ts` (we re-implement to avoid a circular import in tests). */
function fmtUsd(n: number): string {
  if (!isFinite(n)) return "$0";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

/** Build the markdown timeline for the plan calendar. */
export function planCalendarToMarkdown(
  cal: PlanCalendarWithSroi,
): string {
  const { plan, perEntrySroi, cumulativeLiftLowUsd, cumulativeLiftHighUsd, cumulativeCostMidUsd, sroiDeltaUsdPerDay } = cal;
  if (plan.planSize === 0) {
    return [
      "# What-if move plan",
      "",
      "_No moves in the plan yet. Toggle any move in the what-if simulator to add it._",
      "",
    ].join("\n");
  }
  const head = [
    `# What-if move plan — ${plan.planSize} move${plan.planSize === 1 ? "" : "s"} starting ${plan.startDate}`,
    "",
    `- **Plan start:** ${plan.startDate}`,
    `- **Final ship-by:** ${plan.finalShipByDate}`,
    `- **Total calendar days:** ${plan.totalDays}`,
    `- **Cumulative lift:** ${fmtUsd(cumulativeLiftLowUsd)} – ${fmtUsd(cumulativeLiftHighUsd)} / month`,
    `- **Cumulative cost:** ${fmtUsd(cumulativeCostMidUsd)} / month`,
    `- **SROI delta vs baseline:** ${sroiDeltaUsdPerDay >= 0 ? "+" : ""}${fmtUsd(sroiDeltaUsdPerDay)}/day`,
    "",
    "## Timeline",
    "",
    "| # | Move | Start | Ship-by | Days | SROI |",
    "|---|------|-------|---------|------|------|",
  ];
  const rows = perEntrySroi.map(({ entry, sroiUsdPerDay }) => {
    return `| ${entry.planOrder + 1} | Move #${entry.move.priorityRank} — ${entry.move.name} | ${entry.startDate} | ${entry.shipByDate} | ${entry.move.daysToShip}d | ${fmtUsd(sroiUsdPerDay)}/d |`;
  });
  const tail = [
    "",
    "_Generated by the ecommerce-ops dashboard what-if plan calendar (Move #N.14)._",
  ];
  return [...head, ...rows, ...tail].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────

/** 5-band tone class for the SROI delta tile (matches the what-if simulator). */
export function sroiDeltaToneClass(delta: number): string {
  if (!isFinite(delta)) return "border-border bg-muted/30 text-muted-foreground";
  if (delta > 1000) return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  if (delta > 0) return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (delta === 0) return "border-border bg-muted/30 text-muted-foreground";
  if (delta > -1000) return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

/** Returns a human-friendly description for the SROI delta. */
export function describeSroiDelta(delta: number): string {
  if (!isFinite(delta) || delta === 0) return "Best unchanged";
  const sign = delta > 0 ? "+" : "−";
  const mag = Math.abs(delta);
  if (mag >= 1_000_000) return `${sign}${fmtUsd(mag)}/d`;
  if (mag >= 1000) return `${sign}${fmtUsd(mag)}/d`;
  return `${sign}$${Math.round(mag)}/d`;
}

/** 4-band tone class for the plan-size tile (size 0 = muted, 1-3 = sky, 4-6 = amber, 7+ = emerald). */
export function planSizeToneClass(planSize: number): string {
  if (planSize === 0) return "border-border bg-muted/30 text-muted-foreground";
  if (planSize <= 3) return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  if (planSize <= 6) return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}
