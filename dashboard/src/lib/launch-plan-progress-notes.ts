/**
 * `launch-plan-progress-notes.ts` — Per-day ship notes for the 10
 * launch-plan generators.
 *
 * The companion to `launch-plan-progress.ts`. The progress tracker
 * records WHICH days shipped (and when); this module records WHY each
 * day shipped (a short note the operator attaches — e.g. "Day 1 —
 * guest checkout live in dev; Shop Pay pending review" or "Day 5 —
 * blocked: Klaviyo template QA held by brand team").
 *
 * Each note is bounded to 280 characters (Twitter-length, copy-paste-
 * friendly into Slack / Linear / Notion standup blocks) so the operator
 * can capture a real artifact without typing a full retrospective.
 *
 * Storage: separate localStorage key (`ecom-ops:launch-plan-progress-
 * notes:v1`) holding `Record<planId, Record<dayIndex, note>>`. Day
 * indices are 1-based, matching the progress map's keys. Notes are
 * independent of the progress map — un-ticking a day does NOT delete
 * its note (operators may want to keep notes for retros); ticking a
 * day that has no note just shows the empty-state "Add a note".
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

/** Hard cap per note. Matches Twitter / Slack-message brevity. */
export const NOTE_MAX_LENGTH = 280;

/** LocalStorage key for the notes map. */
export const LAUNCH_PLAN_PROGRESS_NOTES_STORAGE_KEY =
  "ecom-ops:launch-plan-progress-notes:v1";

/**
 * Schema: `Record<planId, Record<dayIndex, note string>>`. Day indices
 * are 1-based (string-typed for localStorage round-trip stability,
 * matching the progress map).
 */
export type LaunchPlanNotesMap = Record<string, Record<string, string>>;

export function loadLaunchPlanNotes(): LaunchPlanNotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      LAUNCH_PLAN_PROGRESS_NOTES_STORAGE_KEY
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: LaunchPlanNotesMap = {};
    for (const [planId, dayMap] of Object.entries(
      parsed as LaunchPlanNotesMap
    )) {
      if (!dayMap || typeof dayMap !== "object") continue;
      const cleaned: Record<string, string> = {};
      for (const [day, note] of Object.entries(dayMap as Record<string, string>)) {
        if (typeof note !== "string") continue;
        const dayNum = Number(day);
        if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 60) continue;
        const trimmed = note.slice(0, NOTE_MAX_LENGTH);
        if (trimmed.trim().length === 0) continue;
        cleaned[day] = trimmed;
      }
      if (Object.keys(cleaned).length > 0) out[planId] = cleaned;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveLaunchPlanNotes(map: LaunchPlanNotesMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LAUNCH_PLAN_PROGRESS_NOTES_STORAGE_KEY,
      JSON.stringify(map)
    );
  } catch {
    /* quota / private-mode */
  }
}

/** Set or replace a note. Empty/whitespace-only notes are removed. */
export function setLaunchPlanNote(
  map: LaunchPlanNotesMap,
  planId: string,
  day: number,
  note: string
): LaunchPlanNotesMap {
  const next: LaunchPlanNotesMap = { ...map };
  const dayStr = String(day);
  const existing = next[planId] ? { ...next[planId] } : {};
  const trimmed = note.slice(0, NOTE_MAX_LENGTH);
  if (trimmed.trim().length === 0) {
    delete existing[dayStr];
  } else {
    existing[dayStr] = trimmed;
  }
  if (Object.keys(existing).length === 0) {
    delete next[planId];
  } else {
    next[planId] = existing;
  }
  return next;
}

/** Clear all notes for one plan. */
export function clearLaunchPlanNotesForPlan(
  map: LaunchPlanNotesMap,
  planId: string
): LaunchPlanNotesMap {
  const next = { ...map };
  delete next[planId];
  return next;
}

/** Aggregate notes stats across all plans. */
export interface LaunchPlanNotesRollup {
  totalNotes: number;
  /** Per-plan counts. */
  perPlan: Record<string, number>;
  /** Plans with ≥ 1 note. */
  plansWithNotes: number;
}

/**
 * Cross-reference notes map against a progress map — only counts notes
 * on days the operator actually marked shipped (so un-ticked-day
 * stragglers don't inflate the rollup).
 */
export function summariseLaunchPlanNotes(
  notes: LaunchPlanNotesMap,
  progress: Record<string, Record<string, string>>
): LaunchPlanNotesRollup {
  let total = 0;
  const perPlan: Record<string, number> = {};
  let plansWithNotes = 0;
  for (const [planId, dayMap] of Object.entries(notes)) {
    const shippedDays = progress[planId] ?? {};
    let count = 0;
    for (const [day, note] of Object.entries(dayMap)) {
      if (typeof shippedDays[day] === "string" && note.trim().length > 0) {
        count += 1;
      }
    }
    perPlan[planId] = count;
    if (count > 0) {
      total += count;
      plansWithNotes += 1;
    }
  }
  return { totalNotes: total, perPlan, plansWithNotes };
}

/** Truncate a note with an ellipsis indicator for display. */
export function previewLaunchPlanNote(
  note: string,
  maxLen = 60
): string {
  if (note.length <= maxLen) return note;
  return note.slice(0, maxLen - 1).trimEnd() + "…";
}

/** Per-plan progress-summary enriched with the operator's notes. */
export interface LaunchPlanProgressWithNotes {
  /** Per-day entries for shipped days only, in day-order. */
  days: {
    day: number;
    shippedAt: string;
    note: string | null;
  }[];
  /** Total shipped days that have a note attached. */
  daysWithNotes: number;
  /** Total shipped days. */
  totalShippedDays: number;
}

/**
 * Build the per-day view for one plan — chronological, shipped-only,
 * with notes inlined. Returns the data the tracker uses to render the
 * per-plan note list / timeline.
 */
export function buildLaunchPlanProgressWithNotes(
  planId: string,
  progress: Record<string, Record<string, string>>,
  notes: LaunchPlanNotesMap
): LaunchPlanProgressWithNotes {
  const shipped = progress[planId] ?? {};
  const noteMap = notes[planId] ?? {};
  const days: LaunchPlanProgressWithNotes["days"] = [];
  for (const [dayStr, ts] of Object.entries(shipped)) {
    if (typeof ts !== "string") continue;
    const dayNum = Number(dayStr);
    if (!Number.isFinite(dayNum)) continue;
    const note = noteMap[dayStr];
    days.push({
      day: dayNum,
      shippedAt: ts,
      note: note && note.trim().length > 0 ? note : null,
    });
  }
  days.sort((a, b) => a.day - b.day);
  return {
    days,
    daysWithNotes: days.filter((d) => d.note !== null).length,
    totalShippedDays: days.length,
  };
}

/**
 * Render the rollup as a paste-ready markdown standup block — same
 * shape as `launch-plan-progress.ts::launchPlanProgressToMarkdown` but
 * with operator notes appended under each shipped day (only days that
 * have a note are listed; tick-only days without notes still appear
 * in the summary line via the existing `[X/Y]` counter).
 */
export function launchPlanNotesRollupToMarkdown(
  notes: LaunchPlanNotesMap,
  progress: Record<string, Record<string, string>>
): string {
  const rollup = summariseLaunchPlanNotes(notes, progress);
  const lines: string[] = [];
  lines.push("# Launch-plan ship notes rollup");
  lines.push("");
  lines.push(
    `- **Total notes:** ${rollup.totalNotes} across ${rollup.plansWithNotes} plan(s)`
  );
  lines.push("");
  const planIds = Object.keys(rollup.perPlan).filter(
    (id) => (rollup.perPlan[id] ?? 0) > 0
  );
  if (planIds.length === 0) {
    lines.push("_No notes yet — open any ticked day on a plan and type a short note._");
    return lines.join("\n");
  }
  for (const planId of planIds) {
    const enriched = buildLaunchPlanProgressWithNotes(planId, progress, notes);
    const title = planIdToTitle(planId);
    lines.push(`## ${title}`);
    lines.push("");
    for (const d of enriched.days) {
      if (d.note === null) continue;
      lines.push(
        `- **Day ${d.day}** (${d.shippedAt.slice(0, 10)}): ${d.note}`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Friendly plan-id → human-readable title lookup. Mirrors the canonical
 * titles from `launch-plan-progress.ts::LAUNCH_PLAN_CATALOG` so the
 * notes rollup is readable without the catalog import.
 */
export function planIdToTitle(planId: string): string {
  switch (planId) {
    case "pdp-ab":
      return "PDP A/B Test launch plan";
    case "welcome-series":
      return "Welcome Series launch plan";
    case "abandoned-cart":
      return "Abandoned-Cart launch plan";
    case "loyalty":
      return "Loyalty launch plan";
    case "post-purchase-upsell":
      return "Post-Purchase Upsell launch plan";
    case "sms-welcome-cart":
      return "SMS-Welcome-Cart launch plan";
    case "attribution-health-alert":
      return "Attribution-Health-Alert launch plan";
    case "subscription":
      return "Subscription Program launch plan";
    case "3pl":
      return "3PL Fulfillment launch plan";
    case "checkout-audit":
      return "Baymard Checkout Audit launch plan";
    default:
      return planId;
  }
}
