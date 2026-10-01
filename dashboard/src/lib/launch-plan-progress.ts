/**
 * `launch-plan-progress.ts` — Cross-page-intelligence progress tracker
 * for the 10 launch-plan generators.
 *
 * The dashboard ships 10 launch-plan pages (`/pdp-ab-launch-plan`,
 * `/welcome-series-launch-plan`, `/abandoned-cart-launch-plan`,
 * `/loyalty-launch-plan`, `/post-purchase-upsell-launch-plan`,
 * `/sms-welcome-cart-launch-plan`, `/attribution-health-alert-launch-plan`,
 * `/subscription-launch-plan`, `/3pl-launch-plan`,
 * `/checkout-audit-launch-plan`) plus `/master-rollout-calendar` which
 * synthesises them. Each generator emits a 30-day / 4-week / 30-checkbox-
 * able-action markdown checklist from the operator's saved calculator
 * inputs.
 *
 * That works. What's missing is the post-generation tracking: the
 * operator clicks Generate, pastes the markdown into Linear / Notion,
 * and then loses visibility into how many days they've actually shipped.
 * This module is the rollup — one localStorage key (`ecom-ops:launch-plan-
 * progress:v1`) holds a map of `planId -> Set<dayIndex>` for every plan
 * the operator has ticked days in. The companion route
 * `/launch-plan-progress` reads it, computes per-plan completion %,
 * surfaces a W1/W2/W3/W4 breakdown, and emits an exportable
 * paste-into-standup rollup.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import { ROLLOUT_CATALOG, RolloutCatalogEntry } from "./master-rollout-calendar";

/** Every plan ID + day count tracked by the progress rollup. */
export interface LaunchPlanCatalogEntry {
  id: string;
  title: string;
  href: string;
  moveRef: string;
  days: number; // canonical 30-day count for every generator
  /** Per-move ROI forecast summary (used for the cost-of-completion rollup). */
  defaultYear1NetMarginUsd: number;
}

export const LAUNCH_PLAN_CATALOG: LaunchPlanCatalogEntry[] = [
  {
    id: "pdp-ab",
    title: "PDP A/B Test launch plan",
    href: "/pdp-ab-launch-plan",
    moveRef: "#9.5",
    days: 30,
    defaultYear1NetMarginUsd: 180000,
  },
  {
    id: "welcome-series",
    title: "Welcome Series launch plan",
    href: "/welcome-series-launch-plan",
    moveRef: "#3.4",
    days: 30,
    defaultYear1NetMarginUsd: 96000,
  },
  {
    id: "abandoned-cart",
    title: "Abandoned-Cart launch plan",
    href: "/abandoned-cart-launch-plan",
    moveRef: "#1",
    days: 30,
    defaultYear1NetMarginUsd: 144000,
  },
  {
    id: "loyalty",
    title: "Loyalty launch plan",
    href: "/loyalty-launch-plan",
    moveRef: "#8",
    days: 30,
    defaultYear1NetMarginUsd: 108000,
  },
  {
    id: "post-purchase-upsell",
    title: "Post-Purchase Upsell launch plan",
    href: "/post-purchase-upsell-launch-plan",
    moveRef: "#9.6",
    days: 30,
    defaultYear1NetMarginUsd: 132000,
  },
  {
    id: "sms-welcome-cart",
    title: "SMS-Welcome-Cart launch plan",
    href: "/sms-welcome-cart-launch-plan",
    moveRef: "#6",
    days: 30,
    defaultYear1NetMarginUsd: 54000,
  },
  {
    id: "attribution-health-alert",
    title: "Attribution-Health-Alert launch plan",
    href: "/attribution-health-alert-launch-plan",
    moveRef: "#6.10",
    days: 30,
    defaultYear1NetMarginUsd: 84000,
  },
  {
    id: "subscription",
    title: "Subscription Program launch plan",
    href: "/subscription-launch-plan",
    moveRef: "#11",
    days: 30,
    defaultYear1NetMarginUsd: 240000,
  },
  {
    id: "3pl",
    title: "3PL Fulfillment launch plan",
    href: "/3pl-launch-plan",
    moveRef: "#52",
    days: 30,
    defaultYear1NetMarginUsd: 72000,
  },
  {
    id: "checkout-audit",
    title: "Baymard Checkout Audit launch plan",
    href: "/checkout-audit-launch-plan",
    moveRef: "#3",
    days: 30,
    defaultYear1NetMarginUsd: 168000,
  },
];

/** LocalStorage key holding the progress map. */
export const LAUNCH_PLAN_PROGRESS_STORAGE_KEY =
  "ecom-ops:launch-plan-progress:v1";

/**
 * Schema: `Record<planId, Record<dayIndex, ISO shipped-at timestamp>>`.
 * Day indices are 1-based (matching the day field in each launch-plan
 * generator's payload). Empty/missing keys = no days shipped yet.
 */
export type LaunchPlanProgressMap = Record<
  string,
  Record<string, string>
>;

export function loadLaunchPlanProgress(): LaunchPlanProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      LAUNCH_PLAN_PROGRESS_STORAGE_KEY
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: LaunchPlanProgressMap = {};
    for (const [planId, dayMap] of Object.entries(
      parsed as LaunchPlanProgressMap
    )) {
      if (!dayMap || typeof dayMap !== "object") continue;
      const cleaned: Record<string, string> = {};
      for (const [day, ts] of Object.entries(dayMap as Record<string, string>)) {
        if (typeof ts !== "string") continue;
        const dayNum = Number(day);
        if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 60) continue;
        cleaned[day] = ts;
      }
      out[planId] = cleaned;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveLaunchPlanProgress(map: LaunchPlanProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LAUNCH_PLAN_PROGRESS_STORAGE_KEY,
      JSON.stringify(map)
    );
  } catch {
    /* quota / private-mode */
  }
}

/** Toggle a day on/off; returns a new map. */
export function toggleLaunchPlanDay(
  map: LaunchPlanProgressMap,
  planId: string,
  day: number
): LaunchPlanProgressMap {
  const next: LaunchPlanProgressMap = { ...map };
  const dayStr = String(day);
  const existing = next[planId] ? { ...next[planId] } : {};
  if (existing[dayStr]) {
    delete existing[dayStr];
  } else {
    existing[dayStr] = new Date().toISOString();
  }
  if (Object.keys(existing).length === 0) {
    delete next[planId];
  } else {
    next[planId] = existing;
  }
  return next;
}

/** Per-plan rollup. */
export interface LaunchPlanProgressSummary {
  planId: string;
  title: string;
  href: string;
  moveRef: string;
  totalDays: number;
  completedDays: number;
  /** [0..1] */
  completionRatio: number;
  /** Health band — "complete" / "on-track" / "started" / "untouched". */
  band:
    | "complete"
    | "on-track"
    | "started"
    | "untouched";
  /** W1..W4 completion counts. */
  weeks: { week: 1 | 2 | 3 | 4; completed: number; total: number }[];
  /** First completion date (ISO) for "ship started" display. */
  firstShippedAt: string | null;
  /** Last completion date (ISO). */
  lastShippedAt: string | null;
  /** Cumulative Year-1 net margin from this plan (proportional to completion). */
  realisedYear1NetMarginUsd: number;
  defaultYear1NetMarginUsd: number;
}

export function summariseLaunchPlanProgress(
  planId: string,
  entry: LaunchPlanCatalogEntry,
  dayMap: Record<string, string> | undefined
): LaunchPlanProgressSummary {
  const completedDays = dayMap ? Object.keys(dayMap).length : 0;
  const ratio = entry.days === 0 ? 0 : completedDays / entry.days;
  let band: LaunchPlanProgressSummary["band"];
  if (completedDays === 0) band = "untouched";
  else if (completedDays >= entry.days) band = "complete";
  else if (ratio >= 0.6) band = "on-track";
  else band = "started";

  const weeks: LaunchPlanProgressSummary["weeks"] = [
    { week: 1, completed: 0, total: 7 },
    { week: 2, completed: 0, total: 7 },
    { week: 3, completed: 0, total: 7 },
    { week: 4, completed: 0, total: 9 },
  ];
  if (dayMap) {
    for (const dayStr of Object.keys(dayMap)) {
      const day = Number(dayStr);
      if (!Number.isFinite(day)) continue;
      const idx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      weeks[idx].completed += 1;
    }
  }

  let firstShippedAt: string | null = null;
  let lastShippedAt: string | null = null;
  if (dayMap) {
    const tsList = Object.values(dayMap).filter((v) => typeof v === "string");
    if (tsList.length > 0) {
      tsList.sort();
      firstShippedAt = tsList[0] ?? null;
      lastShippedAt = tsList[tsList.length - 1] ?? null;
    }
  }

  const realisedYear1NetMarginUsd =
    entry.defaultYear1NetMarginUsd * Math.min(ratio, 1);

  return {
    planId,
    title: entry.title,
    href: entry.href,
    moveRef: entry.moveRef,
    totalDays: entry.days,
    completedDays,
    completionRatio: ratio,
    band,
    weeks,
    firstShippedAt,
    lastShippedAt,
    realisedYear1NetMarginUsd,
    defaultYear1NetMarginUsd: entry.defaultYear1NetMarginUsd,
  };
}

/** Aggregate rollup across all plans. */
export interface LaunchPlanProgressRollup {
  summaries: LaunchPlanProgressSummary[];
  totalDays: number;
  totalCompletedDays: number;
  overallCompletionRatio: number;
  overallRealisedYear1NetMarginUsd: number;
  overallDefaultYear1NetMarginUsd: number;
  /** "complete" / "on-track" / "started" / "untouched" counts. */
  bandCounts: {
    complete: number;
    onTrack: number;
    started: number;
    untouched: number;
  };
}

export function buildLaunchPlanProgressRollup(
  map: LaunchPlanProgressMap
): LaunchPlanProgressRollup {
  const summaries = LAUNCH_PLAN_CATALOG.map((entry) =>
    summariseLaunchPlanProgress(entry.id, entry, map[entry.id])
  );
  const totalDays = summaries.reduce((s, x) => s + x.totalDays, 0);
  const totalCompletedDays = summaries.reduce(
    (s, x) => s + x.completedDays,
    0
  );
  const overallCompletionRatio =
    totalDays === 0 ? 0 : totalCompletedDays / totalDays;
  const overallRealisedYear1NetMarginUsd = summaries.reduce(
    (s, x) => s + x.realisedYear1NetMarginUsd,
    0
  );
  const overallDefaultYear1NetMarginUsd = summaries.reduce(
    (s, x) => s + x.defaultYear1NetMarginUsd,
    0
  );
  const bandCounts = {
    complete: summaries.filter((s) => s.band === "complete").length,
    onTrack: summaries.filter((s) => s.band === "on-track").length,
    started: summaries.filter((s) => s.band === "started").length,
    untouched: summaries.filter((s) => s.band === "untouched").length,
  };
  return {
    summaries,
    totalDays,
    totalCompletedDays,
    overallCompletionRatio,
    overallRealisedYear1NetMarginUsd,
    overallDefaultYear1NetMarginUsd,
    bandCounts,
  };
}

/** Health tag for the rollup. */
export function launchPlanRollupHealthTag(
  rollup: LaunchPlanProgressRollup
): string {
  if (rollup.bandCounts.complete === rollup.summaries.length)
    return "all-shipped";
  if (rollup.overallCompletionRatio >= 0.6) return "on-track";
  if (rollup.overallCompletionRatio >= 0.1) return "started";
  return "untouched";
}

/**
 * Cross-reference with the master rollout catalog. Same 10 plans (with
 * identical IDs) appear there too. We surface the move-ref prefix from
 * there as a sanity check that the two catalogs agree.
 */
export function crossReferenceRolloutCatalog(): {
  matched: string[];
  missingInRollout: string[];
  missingInMaster: string[];
} {
  const rolloutIds = new Set(LAUNCH_PLAN_CATALOG.map((c) => c.id));
  const masterIds = new Set(ROLLOUT_CATALOG.map((c: RolloutCatalogEntry) => c.id));
  const matched: string[] = [];
  const missingInRollout: string[] = [];
  const missingInMaster: string[] = [];
  for (const id of rolloutIds) {
    if (masterIds.has(id)) matched.push(id);
    else missingInMaster.push(id);
  }
  for (const id of masterIds) {
    if (!rolloutIds.has(id)) missingInRollout.push(id);
  }
  return { matched, missingInRollout, missingInMaster };
}

/**
 * Render the rollup as a paste-ready markdown standup block. Each plan
 * becomes one row: `[X/Y days] Title — Move #N.x — $realisedMargin / $defaultMargin`.
 */
export function launchPlanProgressToMarkdown(
  rollup: LaunchPlanProgressRollup
): string {
  const lines: string[] = [];
  lines.push("# Launch-plan progress rollup");
  lines.push("");
  lines.push(
    `- **Total completion:** ${rollup.totalCompletedDays} / ${rollup.totalDays} days (${(rollup.overallCompletionRatio * 100).toFixed(1)}%)`
  );
  lines.push(
    `- **Realised Year-1 net margin:** $${rollup.overallRealisedYear1NetMarginUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} of $${rollup.overallDefaultYear1NetMarginUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  );
  lines.push(
    `- **Plans:** ${rollup.bandCounts.complete} complete · ${rollup.bandCounts.onTrack} on-track · ${rollup.bandCounts.started} started · ${rollup.bandCounts.untouched} untouched`
  );
  lines.push("");
  lines.push("## Per-plan");
  lines.push("");
  for (const s of rollup.summaries) {
    const tick =
      s.band === "complete"
        ? "✅"
        : s.band === "on-track"
        ? "🟢"
        : s.band === "started"
        ? "🟡"
        : "⚪";
    const weeks = s.weeks
      .map((w) => `W${w.week} ${w.completed}/${w.total}`)
      .join(" · ");
    lines.push(
      `- ${tick} **[${s.completedDays}/${s.totalDays}]** [${s.title}](${s.href}) — Move ${s.moveRef} — ${weeks} — $${s.realisedYear1NetMarginUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / $${s.defaultYear1NetMarginUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    );
  }
  return lines.join("\n");
}
