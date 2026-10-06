/**
 * `shipped-freshness-drift.ts` — Cross-page-intelligence drift detector
 * for the shipped-playbooks tracker.
 *
 * The dashboard's `/playbooks` page ships a "Mark shipped" toggle that
 * writes `{playbookId: {shippedAt, notes?}}` to localStorage. The
 * `RecentlyShippedPlaybooksCard` on `/` shows the last 3 with a relative
 * day badge ("5d ago", "3mo ago", "1y ago").
 *
 * What's missing: the operator can ship a playbook in March 2026, and
 * the playbook's content can be touched in October 2026 — but the
 * operator has no way to know their shipped work has drifted from the
 * current playbook recommendations. Best practices move (Klaviyo adds
 * a new flow type, Baymard ships a new checkout heuristic, etc.); an
 * operator whose shipped playbook is 4 months old might be running on
 * stale tactics.
 *
 * This module is the rollup: for every shipped playbook, compute
 *   `driftDays = daysSinceShipped - daysSincePlaybookLastTouched`
 *   `driftState ∈ {none, mild, significant, severe}`
 * and return the top-N most-drifted playbooks. The companion component
 * `ShippedFreshnessDriftCard` reads this and surfaces a card on `/`
 * Overview + on `/playbooks#shipped-progress` so the operator sees
 * "your Move #1 was shipped 127d ago, the playbook was updated 23d
 * ago — re-read before your next iteration."
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import { freshnessTier } from "./content";
import type { Playbook } from "./content";
import {
  ShippedMap,
} from "./shipped-playbooks";

/** Drift states — sorted by severity. */
export type DriftState = "none" | "mild" | "significant" | "severe";

/** A shipped playbook with its freshness-drift rollup. */
export interface ShippedDriftRow {
  /** Playbook file id, e.g. `01-abandoned-cart-flow-klaviyo`. */
  id: string;
  /** Display title from the playbook's H1. */
  title: string;
  /** When the operator marked this shipped (ISO). */
  shippedAt: string;
  /** When the playbook's markdown was last touched (ISO from parse-content). */
  lastTouched: string | null;
  /** Days since the operator shipped it. Always ≥ 0. */
  daysSinceShipped: number;
  /** Days since the playbook's last touch. Always ≥ 0; null when unknown. */
  daysSincePlaybookLastTouched: number | null;
  /**
   * Drift in days. `daysSinceShipped - daysSincePlaybookLastTouched`.
   * Negative = you shipped AFTER the last update (you're current).
   * Zero = shipped the same day as the last update.
   * Positive = playbook has been updated since you shipped it
   *   (and the larger the number, the more stale your implementation
   *   may be relative to current best practice).
   * Null = no lastTouched (the playbook predates the parser or has
   *   no mtime available).
   */
  driftDays: number | null;
  /** Drift state classification. */
  driftState: DriftState | "unknown";
  /** Playbook freshness tier (fresh / aging / stale / unknown) for the badge. */
  playbookFreshnessTier: ReturnType<typeof freshnessTier>;
}

export interface ShippedDriftSummary {
  /** The most-drifted shipped playbooks, sorted driftDays desc (nulls last). */
  rows: ShippedDriftRow[];
  /** Total shipped count. */
  totalShipped: number;
  /** Number of shipped playbooks with drift > 30d (significant + severe). */
  driftedCount: number;
  /** Number with severe drift (>90d). */
  severeCount: number;
  /** Worst-case drift days across all shipped (null if no shipped). */
  maxDriftDays: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days between an ISO date and `now`, floored. Returns null for missing /
 * unparseable input. Allows negative values when the ISO is in the future
 * (e.g. a playbook's mtime is ahead of `now` due to clock skew) so the
 * caller can preserve the sign.
 */
function daysSince(iso: string | null | undefined, now: Date): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Use UTC midnight math so "shipped at 2am local" and "now at 11pm local"
  // don't yield fractional days that round inconsistently.
  const utcD = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcNow - utcD) / DAY_MS);
}

/**
 * Classify a raw drift number into a discrete state.
 *  - `drift <= 0`     → "none" (you shipped after the last update)
 *  - `0 < drift <= 30` → "mild" (small drift — check the playbook briefly)
 *  - `30 < drift <= 90`→ "significant" (re-read the playbook before next iter)
 *  - `drift > 90`      → "severe" (your implementation is a generation behind)
 *  - `null`            → "unknown" (no lastTouched available)
 */
export function classifyDrift(driftDays: number | null): DriftState | "unknown" {
  if (driftDays === null) return "unknown";
  if (driftDays <= 0) return "none";
  if (driftDays <= 30) return "mild";
  if (driftDays <= 90) return "significant";
  return "severe";
}

/** Display label for a drift state. */
export function describeDriftState(state: DriftState | "unknown"): string {
  switch (state) {
    case "none":
      return "current";
    case "mild":
      return "mild drift";
    case "significant":
      return "re-read before next iter";
    case "severe":
      return "stale — re-read now";
    case "unknown":
      return "no freshness data";
  }
}

/** Tone class for a drift state — drives the pill color. */
export function driftToneClass(state: DriftState | "unknown"): string {
  switch (state) {
    case "none":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "mild":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "significant":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "severe":
      return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "unknown":
      return "border-border bg-muted text-muted-foreground";
  }
}

/** Tone class for the headline card border. */
export function summaryToneClass(severeCount: number, driftedCount: number): string {
  if (severeCount > 0) {
    return "border-rose-500/40 bg-rose-500/5";
  }
  if (driftedCount > 0) {
    return "border-amber-500/40 bg-amber-500/5";
  }
  return "border-emerald-500/30 bg-emerald-500/5";
}

/** Headline label for the card — picks the most actionable summary. */
export function summaryHeadline(summary: ShippedDriftSummary): string {
  if (summary.totalShipped === 0) {
    return "No shipped playbooks yet";
  }
  if (summary.severeCount > 0) {
    return `${summary.severeCount} shipped playbook${summary.severeCount === 1 ? "" : "s"} >90d behind current best practice`;
  }
  if (summary.driftedCount > 0) {
    return `${summary.driftedCount} shipped playbook${summary.driftedCount === 1 ? "" : "s"} drifting from the current version`;
  }
  return `All ${summary.totalShipped} shipped playbook${summary.totalShipped === 1 ? " is" : "s are"} current`;
}

/**
 * Build the freshness-drift summary from the operator's shipped map and the
 * canonical playbook catalog. Pure — no DOM, no I/O.
 *
 * @param shipped         Map of `playbookId -> {shippedAt, notes?}`.
 * @param playbooks       Canonical playbook list (from `content.playbooks`).
 * @param now             Reference "now" — defaults to `new Date()`. Test seam.
 * @param maxRows         Max rows in the result. Default 5.
 */
export function buildShippedFreshnessDrift(
  shipped: ShippedMap,
  playbooks: Pick<Playbook, "file" | "title" | "lastTouched">[],
  now: Date = new Date(),
  maxRows: number = 5
): ShippedDriftSummary {
  // Build a lookup so we can resolve a shipped id to a known playbook.
  // (The shipped map is keyed by file id without `.md`; the catalog uses
  // `file` with `.md`. We normalize on both sides.)
  const byId = new Map<string, Pick<Playbook, "file" | "title" | "lastTouched">>();
  for (const p of playbooks) {
    byId.set(stripMd(p.file), p);
    byId.set(p.file, p);
  }

  const rows: ShippedDriftRow[] = [];
  for (const [id, entry] of Object.entries(shipped)) {
    if (!entry || typeof entry.shippedAt !== "string") continue;
    const pb = byId.get(id);
    if (!pb) continue; // shipped a playbook that no longer exists in the catalog
    const daysSinceShipped = daysSince(entry.shippedAt, now);
    // Skip unparseable or future shippedAt (future = clock skew on the
    // operator's machine; we can't compute a meaningful drift).
    if (daysSinceShipped === null || daysSinceShipped < 0) continue;
    const daysSincePlaybookLastTouched = daysSince(pb.lastTouched, now);
    const driftDays =
      daysSincePlaybookLastTouched === null
        ? null
        : daysSinceShipped - daysSincePlaybookLastTouched;
    rows.push({
      id,
      title: pb.title,
      shippedAt: entry.shippedAt,
      lastTouched: pb.lastTouched ?? null,
      daysSinceShipped,
      daysSincePlaybookLastTouched,
      driftDays,
      driftState: classifyDrift(driftDays),
      playbookFreshnessTier: freshnessTier(pb.lastTouched, now),
    });
  }

  // Sort: drift desc (nulls last), then daysSinceShipped desc.
  rows.sort((a, b) => {
    if (a.driftDays === null && b.driftDays === null) {
      return b.daysSinceShipped - a.daysSinceShipped;
    }
    if (a.driftDays === null) return 1;
    if (b.driftDays === null) return -1;
    if (b.driftDays !== a.driftDays) return b.driftDays - a.driftDays;
    return b.daysSinceShipped - a.daysSinceShipped;
  });

  const top = rows.slice(0, Math.max(0, maxRows));
  const driftedCount = rows.filter(
    (r) => r.driftState === "significant" || r.driftState === "severe"
  ).length;
  const severeCount = rows.filter((r) => r.driftState === "severe").length;
  const maxDriftDays = rows.reduce<number | null>((acc, r) => {
    if (r.driftDays === null) return acc;
    if (acc === null) return r.driftDays;
    return Math.max(acc, r.driftDays);
  }, null);

  return {
    rows: top,
    totalShipped: rows.length,
    driftedCount,
    severeCount,
    maxDriftDays,
  };
}

function stripMd(file: string): string {
  return file.replace(/\.md$/, "");
}

/** Human-readable relative day string — mirrors the `RecentlyShipped` card. */
export function relativeDay(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return "today";
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
