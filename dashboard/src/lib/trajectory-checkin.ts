/**
 * `Trajectory check-in history` — operator-owned quarterly review tracker
 * for the 12-month revenue trajectory panel.
 *
 * Every time the operator clicks "Save check-in" on the TrajectoryPanel
 * (or the banner), a `{ at, aov, monthlyOrders, grossMargin,
 * peakRevenueHigh, year1LiftHigh, baselineMonthlyRevenue,
 * movesShippedCumulative }` tuple is appended to a localStorage-backed
 * ring buffer (capacity `MAX_CHECKINS = 24` — ~2 years of monthly
 * check-ins).
 *
 * Why a quarterly check-in cadence matters: AOV / orders / margin drift
 * over time; operators iterating on inputs want a longitudinal record
 * of "where was my curve 30 days ago vs now?" — the delta tells them
 * whether the trajectory is improving as they ship moves or sliding
 * backward because of margin compression or AOV drift.
 *
 * Storage: `ecom-ops:trajectory-checkins:v1` (localStorage, per-browser).
 *   Schema: `{ schema: "ecom-ops-trajectory-checkins", version: 1, checkins: TrajectoryCheckin[] }`.
 *   Each `TrajectoryCheckin`: `{ id, at (ISO), aov, monthlyOrders,
 *                                  grossMargin, baselineMonthlyRevenue,
 *                                  peakRevenueHigh, year1LiftHigh,
 *                                  year1LiftLow, movesShippedCumulative,
 *                                  totalMoves }`.
 *
 * Cross-tab sync: writers dispatch a custom DOM event
 * `ecom-ops:trajectory-checkins:update` so any open `/` or `/today` tab
 * can react without a full reload. The banner listens for the same event.
 *
 * No deps. Pure-logic helpers (load / save / add / delete / clear) live
 * here; the React-side wiring lives in
 * `components/trajectory-checkin-banner.tsx` + the panel's "Save check-in"
 * button.
 */

import type { YourStoreInputs } from "./your-store";

// ---------------------------------------------------------------------------
// Schema constants
// ---------------------------------------------------------------------------

export const TRAJECTORY_CHECKINS_STORAGE_KEY = "ecom-ops:trajectory-checkins:v1";
export const TRAJECTORY_CHECKINS_UPDATE_EVENT = "ecom-ops:trajectory-checkins:update";
export const TRAJECTORY_CHECKINS_SCHEMA = "ecom-ops-trajectory-checkins";
export const TRAJECTORY_CHECKINS_VERSION = 1;
export const TRAJECTORY_CHECKINS_MAX = 24;
/** Days since last check-in that triggers the reminder banner. */
export const TRAJECTORY_CHECKINS_REMINDER_DAYS = 30;
/** Days ago that is the canonical "previous" baseline for delta math. */
export const TRAJECTORY_CHECKINS_COMPARE_WINDOW_DAYS = 30;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrajectoryCheckin {
  /** Stable id — `${at}-${randomTag}` so delete can target. */
  id: string;
  /** ISO 8601 save-time. */
  at: string;
  /** Your-store inputs at save time. */
  aov: number;
  monthlyOrders: number;
  grossMargin: number;
  /** The projection's baseline monthly revenue (no lifts). */
  baselineMonthlyRevenue: number;
  /** Peak monthly revenue across the 12-month curve (high end). */
  peakRevenueHigh: number;
  /** Year-1 incremental lift LOW end (in dollars). */
  year1LiftLow: number;
  /** Year-1 incremental lift HIGH end (in dollars). */
  year1LiftHigh: number;
  /** Cumulative moves shipped at save time (across the full Top-10 queue). */
  movesShippedCumulative: number;
  /** Total moves in the queue at save time. */
  totalMoves: number;
}

export interface TrajectoryCheckinPayload {
  schema: typeof TRAJECTORY_CHECKINS_SCHEMA;
  version: typeof TRAJECTORY_CHECKINS_VERSION;
  checkins: TrajectoryCheckin[];
}

// ---------------------------------------------------------------------------
// Payload helpers
// ---------------------------------------------------------------------------

function emptyPayload(): TrajectoryCheckinPayload {
  return {
    schema: TRAJECTORY_CHECKINS_SCHEMA,
    version: TRAJECTORY_CHECKINS_VERSION,
    checkins: [],
  };
}

function isValidShape(raw: unknown): raw is TrajectoryCheckinPayload {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Partial<TrajectoryCheckinPayload>;
  if (p.schema !== TRAJECTORY_CHECKINS_SCHEMA) return false;
  if (p.version !== TRAJECTORY_CHECKINS_VERSION) return false;
  if (!Array.isArray(p.checkins)) return false;
  for (const c of p.checkins) {
    if (!c || typeof c !== "object") return false;
    if (typeof c.id !== "string" || !c.id) return false;
    if (typeof c.at !== "string" || Number.isNaN(Date.parse(c.at))) return false;
    if (typeof c.aov !== "number" || !Number.isFinite(c.aov)) return false;
    if (typeof c.monthlyOrders !== "number" || !Number.isFinite(c.monthlyOrders))
      return false;
    if (typeof c.grossMargin !== "number" || !Number.isFinite(c.grossMargin))
      return false;
    if (
      typeof c.baselineMonthlyRevenue !== "number" ||
      !Number.isFinite(c.baselineMonthlyRevenue)
    )
      return false;
    if (
      typeof c.peakRevenueHigh !== "number" ||
      !Number.isFinite(c.peakRevenueHigh)
    )
      return false;
    if (
      typeof c.year1LiftLow !== "number" ||
      !Number.isFinite(c.year1LiftLow)
    )
      return false;
    if (
      typeof c.year1LiftHigh !== "number" ||
      !Number.isFinite(c.year1LiftHigh)
    )
      return false;
    if (
      typeof c.movesShippedCumulative !== "number" ||
      !Number.isFinite(c.movesShippedCumulative)
    )
      return false;
    if (typeof c.totalMoves !== "number" || !Number.isFinite(c.totalMoves))
      return false;
  }
  return true;
}

export function loadTrajectoryCheckins(): TrajectoryCheckinPayload {
  if (typeof window === "undefined") return emptyPayload();
  try {
    const raw = window.localStorage.getItem(TRAJECTORY_CHECKINS_STORAGE_KEY);
    if (!raw) return emptyPayload();
    const parsed = JSON.parse(raw);
    if (!isValidShape(parsed)) return emptyPayload();
    return parsed;
  } catch {
    return emptyPayload();
  }
}

export function saveTrajectoryCheckins(payload: TrajectoryCheckinPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TRAJECTORY_CHECKINS_STORAGE_KEY,
      JSON.stringify(payload),
    );
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(TRAJECTORY_CHECKINS_UPDATE_EVENT, {
          detail: { count: payload.checkins.length },
        }),
      );
    }
  } catch {
    /* quota / private-mode */
  }
}

// ---------------------------------------------------------------------------
// Mutation helpers
// ---------------------------------------------------------------------------

export interface AddCheckinInput {
  store: YourStoreInputs;
  baselineMonthlyRevenue: number;
  peakRevenueHigh: number;
  year1LiftLow: number;
  year1LiftHigh: number;
  movesShippedCumulative: number;
  totalMoves: number;
}

/**
 * Append a new check-in. Returns the resulting payload (sorted newest-first).
 * Ring-buffer semantics: when length exceeds MAX_CHECKINS the oldest is dropped.
 */
export function addTrajectoryCheckin(
  input: AddCheckinInput,
): TrajectoryCheckinPayload {
  const current = loadTrajectoryCheckins();
  const now = new Date();
  const at = now.toISOString();
  const id = `${at}-${Math.random().toString(36).slice(2, 8)}`;
  const entry: TrajectoryCheckin = {
    id,
    at,
    aov: input.store.aov,
    monthlyOrders: input.store.monthlyOrders,
    grossMargin: input.store.grossMargin,
    baselineMonthlyRevenue: input.baselineMonthlyRevenue,
    peakRevenueHigh: input.peakRevenueHigh,
    year1LiftLow: input.year1LiftLow,
    year1LiftHigh: input.year1LiftHigh,
    movesShippedCumulative: input.movesShippedCumulative,
    totalMoves: input.totalMoves,
  };
  const next = [...current.checkins, entry]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, TRAJECTORY_CHECKINS_MAX);
  const payload: TrajectoryCheckinPayload = {
    schema: TRAJECTORY_CHECKINS_SCHEMA,
    version: TRAJECTORY_CHECKINS_VERSION,
    checkins: next,
  };
  saveTrajectoryCheckins(payload);
  return payload;
}

export function deleteTrajectoryCheckin(id: string): TrajectoryCheckinPayload {
  const current = loadTrajectoryCheckins();
  const payload: TrajectoryCheckinPayload = {
    schema: TRAJECTORY_CHECKINS_SCHEMA,
    version: TRAJECTORY_CHECKINS_VERSION,
    checkins: current.checkins.filter((c) => c.id !== id),
  };
  saveTrajectoryCheckins(payload);
  return payload;
}

export function clearTrajectoryCheckins(): TrajectoryCheckinPayload {
  const payload = emptyPayload();
  saveTrajectoryCheckins(payload);
  return payload;
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function daysSinceCheckin(checkin: TrajectoryCheckin | undefined): number | null {
  if (!checkin) return null;
  const at = Date.parse(checkin.at);
  if (Number.isNaN(at)) return null;
  const now = Date.now();
  return Math.max(0, Math.floor((now - at) / (1000 * 60 * 60 * 24)));
}

export function latestCheckin(payload: TrajectoryCheckinPayload): TrajectoryCheckin | null {
  return payload.checkins[0] ?? null;
}

export function checkinWithinCompareWindow(
  payload: TrajectoryCheckinPayload,
  now: Date = new Date(),
): TrajectoryCheckin | null {
  // Find the most recent check-in older than `windowDays` ago (or nearest to it).
  // Used to compute a clean "vs 30d ago" delta.
  const cutoffMs = now.getTime() - TRAJECTORY_CHECKINS_COMPARE_WINDOW_DAYS * 86400000;
  // Walk newest → oldest; return the FIRST entry whose `at` is `<= cutoffMs`.
  // If no entry is older than the cutoff, return null (delta is "no baseline yet").
  for (const c of payload.checkins) {
    const t = Date.parse(c.at);
    if (Number.isNaN(t)) continue;
    if (t <= cutoffMs) return c;
  }
  return null;
}

export function shouldShowReminder(
  payload: TrajectoryCheckinPayload,
  now: Date = new Date(),
): boolean {
  const latest = latestCheckin(payload);
  if (!latest) return true; // never set — invite the first snapshot
  const days = daysSinceCheckin(latest);
  if (days === null) return false;
  return days >= TRAJECTORY_CHECKINS_REMINDER_DAYS;
}

export function fmtCheckinDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const d = new Date(t);
  // YYYY-MM-DD in UTC to match the rest of the dashboard's date format.
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function fmtCheckinRelative(iso: string, now: Date = new Date()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffDays = Math.floor((now.getTime() - t) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export interface CheckinDelta {
  daysAgo: number;
  priorAt: string;
  peakRevenueDelta: number; // signed
  year1LiftDelta: number; // signed (using HIGH end)
  baselineRevenueDelta: number; // signed
  movesDelta: number; // signed
  aovDeltaPct: number; // signed percent
}

export function computeCheckinDelta(
  current: {
    aov: number;
    monthlyOrders: number;
    baselineMonthlyRevenue: number;
    peakRevenueHigh: number;
    year1LiftHigh: number;
    movesShippedCumulative: number;
  },
  prior: TrajectoryCheckin,
  now: Date = new Date(),
): CheckinDelta {
  const priorAtMs = Date.parse(prior.at);
  const daysAgo = Number.isNaN(priorAtMs)
    ? 0
    : Math.max(0, Math.floor((now.getTime() - priorAtMs) / 86400000));
  const aovDeltaPct =
    prior.aov > 0 ? ((current.aov - prior.aov) / prior.aov) * 100 : 0;
  return {
    daysAgo,
    priorAt: prior.at,
    peakRevenueDelta: current.peakRevenueHigh - prior.peakRevenueHigh,
    year1LiftDelta: current.year1LiftHigh - prior.year1LiftHigh,
    baselineRevenueDelta:
      current.baselineMonthlyRevenue - prior.baselineMonthlyRevenue,
    movesDelta: current.movesShippedCumulative - prior.movesShippedCumulative,
    aovDeltaPct,
  };
}