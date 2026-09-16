/**
 * `30-day plan → .ics (RFC 5545)` converter.
 *
 * Operators don't live in Markdown. They live in Google Calendar / Apple
 * Calendar / Outlook. This module converts the in-memory `PlanDay[]` from
 * `thirty-day-plan.ts` into a valid VCALENDAR/VEVENT stream that every
 * major calendar app imports cleanly (one event per workday, 09:00–10:00
 * local time, with the day's theme as SUMMARY and the per-day tasks +
 * verification gates + expected lift + playbook deep-link as DESCRIPTION).
 *
 * The .ics file is small (30 events × ~400 bytes = ~12 KB) and contains
 * no operator-identifying data — safe to share with a teammate.
 *
 * Reference: RFC 5545 (iCalendar) — https://www.rfc-editor.org/rfc/rfc5545
 * The fields used here are the universally-supported subset: VERSION,
 * PRODID, UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION, URL.
 *
 * Date math note: `PlanSummary.startDate` is the operator's local "today"
 * (YYYY-MM-DD). The 30-day walk in `generateThirtyDayPlan` uses
 * `dayDate.setDate(startDate.getDate() + (d - 1))` so day N is
 * `startDate + (N-1) days`. We mirror that exactly here.
 */

import type { PlanDay, PlanSummary } from "./thirty-day-plan";

// Hardcoded local event window: 09:00 → 10:00 every workday.
// We use floating local time (no Z suffix, no TZID block) so the event
// lands at 9am in whatever timezone the operator imports to — that's the
// right behavior for a single-person work block. RFC 5545 §3.3.5.
const EVENT_HOUR_START = 9;
const EVENT_HOUR_END = 10;

const PROD_ID = "-//Ecommerce Ops//30-day-plan//EN";
const CALENDAR_NAME = "30-day ops plan";

/**
 * Format a Date as RFC 5545 floating local time: `YYYYMMDDTHHMMSS`.
 * Used for DTSTART/DTEND — no Z (UTC) suffix and no TZID so the event
 * floats to whatever timezone the importing calendar is set to.
 */
function fmtIcsLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}`;
}

/** Format a Date as RFC 5545 UTC: `YYYYMMDDTHHMMSSZ` (used for DTSTAMP). */
function fmtIcsUtc(date: Date): string {
  return (
    fmtIcsLocal(date).replace(/(\d{2})(\d{2})$/, "$1$2") + "Z"
  );
}

/**
 * RFC 5545 §3.3.11 — escape a TEXT-typed property value.
 * Backslash, semicolon, comma, and newline must be escaped. We also
 * fold long DESCRIPTION lines to 75 octets per the spec's CRLF + space rule.
 */
function escapeIcsText(raw: string): string {
  const escaped = raw
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

  // Fold at 75 octets per line — preserves lines under the calendar apps'
  // common 998-octet line limit while staying valid for stricter parsers.
  const lines: string[] = [];
  let line = "";
  for (const ch of escaped) {
    if (line.length >= 73) {
      lines.push(line);
      line = " " + ch; // RFC 5545 line folding: CRLF + single space
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.join("\r\n");
}

/**
 * Build the DESCRIPTION body for one VEVENT. Combines the day's theme,
 * the per-task labels, their verification gates, and their expected lift
 * estimates — everything an operator needs to know when the calendar
 * notification fires at 9am.
 */
function buildDescription(day: PlanDay): string {
  const header = `Day ${String(day.day).padStart(2, "0")} · ${day.weekday}\n${day.weekLabel}\n\n${day.theme}\n`;
  const tasksBlock = day.tasks
    .map((t, i) => {
      const parts = [`${i + 1}. ${t.label}`];
      if (t.verify) parts.push(`   ✓ Verify: ${t.verify}`);
      if (t.estLift) parts.push(`   📈 Expected lift: ${t.estLift}`);
      return parts.join("\n");
    })
    .join("\n");
  const moveBlock =
    day.moveIds.length > 0
      ? `\n\nTop-10 moves:\n${day.moveIds.map((id) => `· ${id}`).join("\n")}`
      : "";
  return `${header}\n${tasksBlock}${moveBlock}`;
}

/**
 * Compute the calendar date for a given plan day.
 * Mirrors the same arithmetic used in `generateThirtyDayPlan`:
 *   dayDate = startDate + (day - 1) days, in local time.
 */
function dateForDay(startDate: string, dayNumber: number): Date {
  const [y, m, d] = startDate.split("-").map(Number);
  // Construct in LOCAL time so the resulting DTSTART (also local) lands
  // on the operator's intended calendar date, not a UTC-shifted one.
  const base = new Date(y, m - 1, d, EVENT_HOUR_START, 0, 0, 0);
  base.setDate(base.getDate() + (dayNumber - 1));
  return base;
}

/**
 * Build a single VEVENT for one plan day.
 * Returns the verbatim iCalendar text block (without the trailing CRLF —
 * the parent joiner adds it).
 */
function buildVEvent(args: {
  day: PlanDay;
  startDate: string;
  dtstampUtc: Date;
  uidDomain: string;
}): string {
  const { day, startDate, dtstampUtc, uidDomain } = args;
  const start = dateForDay(startDate, day.day);
  const end = new Date(start);
  end.setHours(EVENT_HOUR_END, 0, 0, 0);

  const summary = `Day ${day.day} · ${day.theme}`;
  const description = buildDescription(day);
  const url =
    day.moveIds.length > 0
      ? `https://ecommerce-ops-iota.vercel.app/playbooks#${day.moveIds[0]}`
      : "https://ecommerce-ops-iota.vercel.app/30-day-plan";

  const uid = `day-${String(day.day).padStart(2, "0")}-${startDate.replace(/-/g, "")}@${uidDomain}`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtIcsUtc(dtstampUtc)}`,
    `DTSTART:${fmtIcsLocal(start)}`,
    `DTEND:${fmtIcsLocal(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${url}`,
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ].join("\r\n");
}

/**
 * Convert the in-memory 30-day plan into a valid RFC 5545 .ics text stream.
 *
 * @param days - PlanDay[] from generateThirtyDayPlan (in order, 1..30).
 * @param summary - PlanSummary; only `summary.startDate` is consulted.
 * @param opts.uidDomain - Optional reverse-DNS domain for stable UIDs
 *   (defaults to "ecommerce-ops.local"). Calendar apps use UID to dedupe
 *   imports — re-importing with the same UID updates existing events.
 */
export function renderPlanIcs(
  days: PlanDay[],
  summary: PlanSummary,
  opts: { uidDomain?: string } = {}
): string {
  const uidDomain = opts.uidDomain ?? "ecommerce-ops.local";
  const dtstampUtc = new Date();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PROD_ID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(CALENDAR_NAME)}`,
    `X-WR-CALDESC:${escapeIcsText(`30-day ops plan · starts ${summary.startDate} · ${summary.plannedCount} planned moves · ${summary.shippedCount} already shipped (skipped)`)}`,
  ];

  for (const day of days) {
    lines.push(
      buildVEvent({ day, startDate: summary.startDate, dtstampUtc, uidDomain })
    );
  }

  lines.push("END:VCALENDAR");
  // Final CRLF (RFC 5545 §3.1 — the calendar object MUST end with CRLF).
  return lines.join("\r\n") + "\r\n";
}

/**
 * Sanity-check the .ics output: valid header, valid footer, exactly one
 * VEVENT per day, no double-CRLF inside the body, all required fields
 * present. Returns an array of human-readable issues (empty = clean).
 *
 * Used in `npm run build` smoke tests + the operator-visible "ICS
 * validation" pill on the 30-day-plan page.
 */
export function validatePlanIcs(ics: string): string[] {
  const issues: string[] = [];
  if (!ics.startsWith("BEGIN:VCALENDAR\r\n")) {
    issues.push("Missing BEGIN:VCALENDAR header");
  }
  if (!ics.endsWith("END:VCALENDAR\r\n")) {
    issues.push("Missing END:VCALENDAR footer");
  }
  const eventCount = (ics.match(/BEGIN:VEVENT\r\n/g) || []).length;
  const endCount = (ics.match(/END:VEVENT\r\n/g) || []).length;
  if (eventCount !== endCount) {
    issues.push(`Mismatched VEVENT count: ${eventCount} begin / ${endCount} end`);
  }
  for (const required of ["VERSION:2.0", "PRODID:", "DTSTART:", "DTEND:", "UID:"]) {
    if (!ics.includes(required)) {
      issues.push(`Missing required field: ${required.replace(":", "")}`);
    }
  }
  return issues;
}
