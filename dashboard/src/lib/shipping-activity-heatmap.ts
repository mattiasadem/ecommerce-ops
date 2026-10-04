/**
 * `shipping-activity-heatmap.ts` — Cross-page-intelligence shipping
 * activity heatmap for the 10 launch-plan generators (Move #N.11).
 *
 * The companion to `launch-plan-progress.ts`. The progress tracker
 * records WHICH (plan, day) pair shipped and WHEN (ISO timestamp).
 * The notes module records WHY (the per-day note). What's missing is
 * the **temporal** view: a calendar / heatmap of the operator's
 * actual shipping velocity over time.
 *
 * This module turns the same localStorage key
 * (`ecom-ops:launch-plan-progress:v1`) into a GitHub-style activity
 * heatmap plus the four momentum metrics operators actually need:
 *
 *   - **Current streak** — consecutive days (counting back from
 *     today) with ≥ 1 ship
 *   - **Longest streak** — best run of consecutive shipping days
 *     ever recorded
 *   - **Days since last ship** — integer day-count from today to
 *     the most recent ship; "—" if never shipped
 *   - **Last 30 / 60 / 90 days shipped** — count of unique days
 *     with ≥ 1 ship in the trailing window
 *   - **Heatmap cells** — 13 weeks (91 days) ending today, with
 *     per-day ship count + 5-level intensity bucket
 *   - **Weekday breakdown** — Mon..Sun totals across all-time
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this). Tests in
 * `__tests__/shipping-activity-heatmap.test.ts`.
 */

/** Number of weeks rendered in the heatmap (≈ one quarter). */
export const SHIPPING_HEATMAP_WEEKS = 13;

/** Number of days rendered in the heatmap. */
export const SHIPPING_HEATMAP_DAYS = SHIPPING_HEATMAP_WEEKS * 7;

/** One cell in the 13×7 heatmap grid. */
export interface ShippingHeatmapCell {
  /** ISO date string YYYY-MM-DD in UTC. */
  date: string;
  /** Day-of-week index 0=Sun..6=Sat. */
  weekday: number;
  /** Number of days since today (0 = today, 1 = yesterday, …). */
  daysAgo: number;
  /** Count of ships on this date (across all plans). */
  ships: number;
  /** Which plans shipped on this date (plan IDs). */
  planIds: string[];
  /** Intensity bucket 0..4 for the cell colour. */
  intensity: 0 | 1 | 2 | 3 | 4;
  /** True iff this date is in the future (no ships possible). */
  isFuture: boolean;
}

/** Heatmap shape returned to the component. */
export interface ShippingHeatmap {
  /** Today as YYYY-MM-DD in UTC. */
  today: string;
  /** Earliest date in the heatmap (YYYY-MM-DD). */
  startDate: string;
  /** 13 weeks × 7 days, indexed by `[weekIndex][weekday]`. */
  weeks: ShippingHeatmapCell[][];
  /** Total ships across the heatmap window. */
  totalShips: number;
  /** Unique days with ≥ 1 ship in the window. */
  activeDays: number;
  /** The maximum ship count in any single day in the window. */
  maxShips: number;
}

/** Momentum rollup. */
export interface ShippingMomentum {
  /** Consecutive days with ≥ 1 ship, ending today (or yesterday if no ship today). */
  currentStreak: number;
  /** Best run of consecutive shipping days ever recorded. */
  longestStreak: number;
  /** Integer day-count from today to the most recent ship; null if never shipped. */
  daysSinceLastShip: number | null;
  /** ISO date of the most recent ship; null if never shipped. */
  lastShipDate: string | null;
  /** Trailing 30/60/90 days shipped. */
  last30: number;
  last60: number;
  last90: number;
  /** Per-weekday totals across all-time: Sun..Sat. */
  weekdayTotals: number[];
  /** Per-weekday breakdown as records of {weekday, ships, activeDays, ratio}. */
  weekdayBreakdown: {
    weekday: number;
    label: string;
    ships: number;
    activeDays: number;
    ratio: number;
  }[];
  /** Shipments in the past 7 days / 30 days — for momentum glyph. */
  trend7vs30: {
    last7: number;
    last30: number;
    /** (last7 / 7) / (last30 / 30) — 1.0 = steady, >1 = accelerating, <1 = decelerating. */
    velocityRatio: number;
  };
  /** True iff no ships have ever been recorded. */
  isEmpty: boolean;
}

/** Combined return from `buildShippingActivity`. */
export interface ShippingActivity {
  heatmap: ShippingHeatmap;
  momentum: ShippingMomentum;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_LABELS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Pad an integer to 2 digits. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format a Date as YYYY-MM-DD in UTC. */
export function isoDateUtc(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** Parse YYYY-MM-DD into a UTC Date at 00:00. */
export function parseIsoDateUtc(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** Pure UTC-day diff: b - a in days, ignoring time-of-day. */
export function dayDiffUtc(a: Date, b: Date): number {
  const aMs = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bMs = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bMs - aMs) / 86400000);
}

/**
 * Bucket a per-day ship count into a 0..4 intensity for the cell
 * colour. The buckets are deliberately coarse so the heatmap looks
 * readable at 13px-per-cell:
 *
 *   - 0 ships → bucket 0 (no fill / muted)
 *   - 1 ship   → bucket 1 (faint)
 *   - 2 ships  → bucket 2 (light)
 *   - 3–4 ships → bucket 3 (medium)
 *   - 5+ ships  → bucket 4 (deep)
 */
export function intensityBucket(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/** Tailwind class for a given intensity bucket. */
export function intensityToneClass(b: 0 | 1 | 2 | 3 | 4): string {
  switch (b) {
    case 0:
      return "bg-muted/40";
    case 1:
      return "bg-emerald-500/15";
    case 2:
      return "bg-emerald-500/30";
    case 3:
      return "bg-emerald-500/55";
    case 4:
      return "bg-emerald-500/85";
  }
}

/** Tooltip text for a single heatmap cell. */
export function cellTooltip(cell: ShippingHeatmapCell): string {
  if (cell.isFuture) return `${cell.date} — future (no ships possible)`;
  if (cell.ships === 0) return `${cell.date} — 0 ships`;
  return `${cell.date} — ${cell.ships} ship${cell.ships === 1 ? "" : "s"} (${cell.planIds.length} plan${cell.planIds.length === 1 ? "" : "s"})`;
}

/**
 * Aggregate a `LaunchPlanProgressMap` (planId → dayIndex → ISO date
 * string) into a per-UTC-day count of ships. The result is keyed by
 * `YYYY-MM-DD` and lists the plan IDs that shipped on that day.
 */
export function aggregateShipsByDay(
  progress: Record<string, Record<string, string>>
): Map<string, { ships: number; planIds: string[] }> {
  const out = new Map<string, { ships: number; planIds: string[] }>();
  for (const planId of Object.keys(progress ?? {})) {
    const dayMap = progress[planId];
    if (!dayMap || typeof dayMap !== "object") continue;
    for (const dayKey of Object.keys(dayMap)) {
      const iso = dayMap[dayKey];
      if (typeof iso !== "string" || iso.length < 10) continue;
      const day = iso.slice(0, 10);
      const existing = out.get(day);
      if (existing) {
        existing.ships += 1;
        if (!existing.planIds.includes(planId)) existing.planIds.push(planId);
      } else {
        out.set(day, { ships: 1, planIds: [planId] });
      }
    }
  }
  return out;
}

/**
 * Build the 13×7 heatmap (oldest Sunday in week 0 to today in the
 * last column). `now` is a `Date` for testability.
 */
export function buildShippingHeatmap(
  progress: Record<string, Record<string, string>>,
  now: Date
): ShippingHeatmap {
  const today = isoDateUtc(now);
  const todayDate = parseIsoDateUtc(today)!;
  // Find the Sunday on/before (todayDate - 12 weeks * 7 days).
  const start = new Date(todayDate);
  start.setUTCDate(start.getUTCDate() - (SHIPPING_HEATMAP_WEEKS - 1) * 7);
  // Roll back to the Sunday of that week.
  const startWeekday = start.getUTCDay(); // 0=Sun
  start.setUTCDate(start.getUTCDate() - startWeekday);

  const byDay = aggregateShipsByDay(progress);
  const weeks: ShippingHeatmapCell[][] = [];
  let totalShips = 0;
  let activeDays = 0;
  let maxShips = 0;

  for (let w = 0; w < SHIPPING_HEATMAP_WEEKS; w++) {
    const weekCells: ShippingHeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(start);
      cellDate.setUTCDate(cellDate.getUTCDate() + w * 7 + d);
      const dateStr = isoDateUtc(cellDate);
      const daysAgo = dayDiffUtc(cellDate, todayDate);
      const isFuture = daysAgo < 0;
      const entry = byDay.get(dateStr);
      const ships = entry?.ships ?? 0;
      const planIds = entry?.planIds ?? [];
      const intensity = intensityBucket(ships);
      weekCells.push({
        date: dateStr,
        weekday: cellDate.getUTCDay(),
        daysAgo,
        ships,
        planIds,
        intensity,
        isFuture,
      });
      if (ships > 0) {
        totalShips += ships;
        activeDays += 1;
        if (ships > maxShips) maxShips = ships;
      }
    }
    weeks.push(weekCells);
  }

  return {
    today,
    startDate: isoDateUtc(start),
    weeks,
    totalShips,
    activeDays,
    maxShips,
  };
}

/**
 * Compute momentum metrics (current / longest streak, days-since-last,
 * 30/60/90 totals, weekday breakdown, 7-vs-30 velocity) from the same
 * per-day map. Independent of the heatmap window — uses ALL history.
 */
export function buildShippingMomentum(
  progress: Record<string, Record<string, string>>,
  now: Date
): ShippingMomentum {
  const byDay = aggregateShipsByDay(progress);
  const todayDate = parseIsoDateUtc(isoDateUtc(now))!;
  const dates = Array.from(byDay.keys())
    .map((d) => parseIsoDateUtc(d))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const isEmpty = dates.length === 0;
  const lastShipDate = isEmpty ? null : isoDateUtc(dates[dates.length - 1]);
  const daysSinceLastShip = isEmpty
    ? null
    : dayDiffUtc(parseIsoDateUtc(lastShipDate!)!, todayDate);

  // Per-weekday counts.
  const weekdayShips = [0, 0, 0, 0, 0, 0, 0];
  const weekdayActiveDays = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dates) {
    weekdayShips[d.getUTCDay()] += 1;
    weekdayActiveDays[d.getUTCDay()] += 1;
  }
  // Per-weekday "active days" also needs to include inactive days up
  // to today, but only from the first ship forward (so the ratio
  // makes sense — we don't penalise "you have 0 Sunday ships" if
  // you've only been shipping for 2 days).
  const firstShipDate = isEmpty ? null : dates[0];
  if (firstShipDate) {
    for (let wd = 0; wd < 7; wd++) {
      // For each weekday, count the number of occurrences of that
      // weekday between firstShipDate (inclusive) and today (inclusive).
      const first = new Date(firstShipDate);
      const offset = (wd - first.getUTCDay() + 7) % 7;
      first.setUTCDate(first.getUTCDate() + offset);
      const days = Math.floor(dayDiffUtc(first, todayDate) / 7) + 1;
      weekdayActiveDays[wd] = Math.max(weekdayActiveDays[wd], days);
    }
  }

  const weekdayBreakdown = weekdayShips.map((ships, weekday) => {
    const activeDays = weekdayActiveDays[weekday];
    return {
      weekday,
      label: WEEKDAY_LABELS_LONG[weekday],
      ships,
      activeDays,
      ratio: activeDays === 0 ? 0 : ships / activeDays,
    };
  });

  // Streaks: walk dates in reverse from today (or last ship).
  let currentStreak = 0;
  if (!isEmpty) {
    // The streak ends on the most recent shipping day. If that day is
    // today or yesterday, the streak is "active". If it's older than
    // yesterday, the streak is broken at 0.
    const lastShip = parseIsoDateUtc(lastShipDate!)!;
    const gap = dayDiffUtc(lastShip, todayDate);
    if (gap <= 1) {
      // Walk back from today (if gap=0) or lastShip (if gap=1).
      let cursor = gap === 0 ? new Date(todayDate) : new Date(lastShip);
      while (true) {
        const ds = isoDateUtc(cursor);
        if (byDay.has(ds)) {
          currentStreak += 1;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of dates) {
    if (prev && dayDiffUtc(prev, d) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prev = d;
  }

  // Trailing windows.
  function countInWindow(days: number): number {
    // Cutoff is exactly N days before today. "Last N days" includes
    // the Nth day (e.g. 30 days ago is still in "last 30 days"), so
    // we use `>=` (strictly older than N days would exclude it).
    const cutoff = new Date(todayDate);
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    let c = 0;
    for (const d of dates) {
      if (d.getTime() >= cutoff.getTime() && d.getTime() <= todayDate.getTime()) c += 1;
    }
    return c;
  }
  const last30 = countInWindow(30);
  const last60 = countInWindow(60);
  const last90 = countInWindow(90);
  const last7 = countInWindow(7);

  const last30Rate = last30 / 30;
  const last7Rate = last7 / 7;
  const velocityRatio =
    last30Rate === 0 ? (last7 > 0 ? Infinity : 0) : last7Rate / last30Rate;

  return {
    currentStreak,
    longestStreak,
    daysSinceLastShip,
    lastShipDate,
    last30,
    last60,
    last90,
    weekdayTotals: weekdayShips,
    weekdayBreakdown,
    trend7vs30: { last7, last30, velocityRatio },
    isEmpty,
  };
}

/** Combined activity rollup. */
export function buildShippingActivity(
  progress: Record<string, Record<string, string>>,
  now: Date
): ShippingActivity {
  return {
    heatmap: buildShippingHeatmap(progress, now),
    momentum: buildShippingMomentum(progress, now),
  };
}

/** Format a velocity ratio as a human label. */
export function describeVelocityRatio(r: number): {
  label: string;
  tone: "emerald" | "sky" | "amber" | "rose" | "muted";
} {
  if (!isFinite(r)) return { label: "new", tone: "emerald" };
  if (r === 0) return { label: "idle", tone: "muted" };
  if (r >= 1.5) return { label: "accelerating", tone: "emerald" };
  if (r >= 0.8) return { label: "steady", tone: "sky" };
  if (r >= 0.4) return { label: "slowing", tone: "amber" };
  return { label: "stalled", tone: "rose" };
}

/** Short label for a streak count. */
export function formatStreak(n: number): string {
  if (n === 0) return "0 days";
  if (n === 1) return "1 day";
  return `${n} days`;
}

/** Tone class for a streak count. */
export function streakToneClass(n: number): string {
  if (n === 0) return "text-muted-foreground";
  if (n >= 7) return "text-emerald-600";
  if (n >= 3) return "text-sky-600";
  return "text-amber-600";
}

/** Tone class for "days since last ship". */
export function daysSinceToneClass(d: number | null): string {
  if (d === null) return "text-muted-foreground";
  if (d === 0) return "text-emerald-600";
  if (d <= 2) return "text-sky-600";
  if (d <= 6) return "text-amber-600";
  return "text-rose-600";
}

/** Label for "days since last ship". */
export function describeDaysSince(d: number | null): string {
  if (d === null) return "—";
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

/** Month label for a column header in the heatmap. */
export function monthLabelForColumn(weekStart: ShippingHeatmapCell): string {
  const d = parseIsoDateUtc(weekStart.date);
  if (!d) return "";
  return WEEKDAY_LABELS[d.getUTCDay()] === "Sun" || weekStart.daysAgo % 7 === 0
    ? d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    : "";
}

/** Convenience: weekday short labels. */
export const SHIPPING_WEEKDAY_LABELS = WEEKDAY_LABELS;
export const SHIPPING_WEEKDAY_LABELS_LONG = WEEKDAY_LABELS_LONG;

/** Markdown export for the activity heatmap. */
export function shippingActivityToMarkdown(
  activity: ShippingActivity,
  planTitleById: Record<string, string>
): string {
  const { heatmap, momentum } = activity;
  const lines: string[] = [];
  lines.push("# Shipping activity heatmap");
  lines.push("");
  lines.push(
    `Generated ${heatmap.today} · last ${SHIPPING_HEATMAP_DAYS} days window.`
  );
  lines.push("");
  lines.push("## Momentum");
  lines.push("");
  lines.push(
    `- Current streak: **${formatStreak(momentum.currentStreak)}**`
  );
  lines.push(
    `- Longest streak: **${formatStreak(momentum.longestStreak)}**`
  );
  lines.push(
    `- Last ship: **${momentum.lastShipDate ?? "—"}** (${describeDaysSince(
      momentum.daysSinceLastShip
    )})`
  );
  lines.push(
    `- Last 7d / 30d / 60d / 90d: **${momentum.trend7vs30.last7} / ${momentum.last30} / ${momentum.last60} / ${momentum.last90} active days**`
  );
  const vel = describeVelocityRatio(momentum.trend7vs30.velocityRatio);
  lines.push(`- Velocity (7d vs 30d): **${vel.label}**`);
  lines.push("");
  lines.push("## Weekday breakdown");
  lines.push("");
  lines.push("| Day | Ships | Active days | Rate |");
  lines.push("|---|---:|---:|---:|");
  for (const w of momentum.weekdayBreakdown) {
    lines.push(
      `| ${w.label} | ${w.ships} | ${w.activeDays} | ${(w.ratio * 100).toFixed(0)}% |`
    );
  }
  lines.push("");
  if (momentum.lastShipDate) {
    lines.push("## Recent ship days");
    lines.push("");
    const recent = new Set<string>();
    for (const week of heatmap.weeks) {
      for (const c of week) {
        if (c.ships > 0) recent.add(c.date);
      }
    }
    const sorted = Array.from(recent).sort().reverse().slice(0, 14);
    for (const d of sorted) {
      const entry = heatmap.weeks
        .flat()
        .find((c) => c.date === d);
      if (!entry) continue;
      const planList = entry.planIds
        .map((id) => planTitleById[id] ?? id)
        .join(", ");
      lines.push(`- **${d}** — ${entry.ships} ship${entry.ships === 1 ? "" : "s"} (${planList})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Storage-key constant re-exported for the component. */
export const SHIPPING_ACTIVITY_HEATMAP_STORAGE_KEY =
  "ecom-ops:launch-plan-progress:v1";

export const SHIPPING_ACTIVITY_HEATMAP_UPDATE_EVENT =
  "ecom-ops:launch-plan-progress:update";
