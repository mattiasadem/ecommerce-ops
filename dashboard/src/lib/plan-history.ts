/**
 * `Saved 30-day plan history` — operator-owned progression tracker for
 * `/30-day-plan` generations.
 *
 * Every time the operator clicks "Generate my 30-day plan" (or "Regenerate"),
 * the resulting `{ days, summary, inputs, markdown }` tuple is appended to a
 * localStorage-backed ring buffer (capacity `MAX_PLANS = 10`). The panel on
 * `/30-day-plan` shows the last N plans sorted newest-first, each row deep-
 * linked to a one-click restore (load the saved PlanDay[] + PlanSummary back
 * into the in-page generator state without re-running the algorithm).
 *
 * Why a ring buffer and not "append forever": AOV / orders / margin drift
 * over time. Operators iterating on inputs want the last 5-10 plans as a
 * working set, not an audit log of every parameter tweak. 10 is enough for
 * ~1 quarter of weekly iteration; once it overflows the oldest is dropped.
 *
 * Storage: `ecom-ops:plan-history:v1` (localStorage, per-browser).
 *   Schema: `{ schema: "ecom-ops-plan-history", version: 1, plans: SavedPlan[] }`.
 *   Each `SavedPlan`: `{ id, savedAt, label, inputs, summary, dayCount,
 *                          days: PlanDay[] }` (markdown is excluded — it's
 *   regenerable from `days + summary + inputs` via `renderPlanMarkdown`).
 *
 * Cross-tab sync: writers dispatch a custom DOM event
 * `ecom-ops:plan-history:update` so any open `/30-day-plan` tab can react
 * without a full reload. The history panel listens for the same event.
 *
 * No deps. Pure-logic helpers (load / save / add / delete / clear) live
 * here; the React-side wiring lives in `components/thirty-day-plan.tsx`.
 */

import type { PlanDay, PlanSummary } from "./thirty-day-plan";
import type { YourStoreInputs } from "./your-store";

// ---------------------------------------------------------------------------
// Schema constants
// ---------------------------------------------------------------------------

export const PLAN_HISTORY_STORAGE_KEY = "ecom-ops:plan-history:v1";
export const PLAN_HISTORY_UPDATE_EVENT = "ecom-ops:plan-history:update";
export const PLAN_HISTORY_SCHEMA = "ecom-ops-plan-history";
export const PLAN_HISTORY_VERSION = 1;
export const PLAN_HISTORY_MAX_PLANS = 10;

export interface SavedPlan {
  /** Stable id — `${startDate}-${counter}-${randomTag}` so restore can target. */
  id: string;
  /** ISO 8601 save-time. */
  savedAt: string;
  /** Optional operator-set label e.g. "Q4 launch". Empty string = no label. */
  label: string;
  /** The Your-store inputs snapshot at save time. */
  inputs: YourStoreInputs;
  /** Plan summary — projected lift / dollars / days / startDate. */
  summary: PlanSummary;
  /** The 30-day plan walk. */
  days: PlanDay[];
}

export interface PlanHistoryPayload {
  schema: typeof PLAN_HISTORY_SCHEMA;
  version: typeof PLAN_HISTORY_VERSION;
  plans: SavedPlan[];
}

export interface AddPlanResult {
  next: PlanHistoryPayload;
  /** The id of the saved plan — for callers that want to highlight it. */
  savedId: string;
  /** True when the oldest plan was dropped to make room. */
  trimmed: boolean;
}

function makePlanId(startDate: string): string {
  const randomTag = Math.random().toString(36).slice(2, 8);
  return `${startDate}-${Date.now().toString(36)}-${randomTag}`;
}

// ---------------------------------------------------------------------------
// Pure helpers (testable in isolation, no window / localStorage deps)
// ---------------------------------------------------------------------------

export function emptyHistory(): PlanHistoryPayload {
  return { schema: PLAN_HISTORY_SCHEMA, version: PLAN_HISTORY_VERSION, plans: [] };
}

export function isSavedPlan(value: unknown): value is SavedPlan {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.savedAt !== "string") return false;
  if (typeof v.label !== "string") return false;
  if (!v.inputs || typeof v.inputs !== "object") return false;
  if (!v.summary || typeof v.summary !== "object") return false;
  if (!Array.isArray(v.days)) return false;
  return true;
}

export function isPlanHistoryPayload(value: unknown): value is PlanHistoryPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.schema !== PLAN_HISTORY_SCHEMA) return false;
  if (v.version !== PLAN_HISTORY_VERSION) return false;
  if (!Array.isArray(v.plans)) return false;
  return v.plans.every(isSavedPlan);
}

/**
 * Append a new plan to a history payload (cap at MAX_PLANS). Pure — does
 * not touch localStorage. Newest plans sort to the front on read.
 */
export function addPlanToHistory(
  payload: PlanHistoryPayload,
  plan: { inputs: YourStoreInputs; summary: PlanSummary; days: PlanDay[]; label?: string },
): AddPlanResult {
  const saved: SavedPlan = {
    id: makePlanId(plan.summary.startDate),
    savedAt: new Date().toISOString(),
    label: (plan.label ?? "").trim(),
    inputs: plan.inputs,
    summary: plan.summary,
    days: plan.days,
  };
  const next = [saved, ...payload.plans];
  let trimmed = false;
  if (next.length > PLAN_HISTORY_MAX_PLANS) {
    next.length = PLAN_HISTORY_MAX_PLANS;
    trimmed = true;
  }
  return {
    next: { ...payload, plans: next },
    savedId: saved.id,
    trimmed,
  };
}

export function removePlanFromHistory(
  payload: PlanHistoryPayload,
  planId: string,
): PlanHistoryPayload {
  return { ...payload, plans: payload.plans.filter((p) => p.id !== planId) };
}

export function clearHistory(): PlanHistoryPayload {
  return emptyHistory();
}

export function findPlanById(
  payload: PlanHistoryPayload,
  planId: string,
): SavedPlan | undefined {
  return payload.plans.find((p) => p.id === planId);
}

/**
 * Diff two plans — used by the "Compare" panel to surface what changed
 * between saved iterations. Returns the union of changed fields plus
 * per-field delta strings.
 */
export interface PlanDelta {
  aovDelta: number;
  ordersDelta: number;
  marginDelta: number;
  monthlyRevenueDelta: number;
  liftDollarsDeltaLow: number;
  liftDollarsDeltaHigh: number;
  plannedCountDelta: number;
  shippedCountDelta: number;
  startDateChanged: boolean;
}

export function diffPlans(a: SavedPlan, b: SavedPlan): PlanDelta {
  return {
    aovDelta: b.inputs.aov - a.inputs.aov,
    ordersDelta: b.inputs.monthlyOrders - a.inputs.monthlyOrders,
    marginDelta:
      Math.round((b.inputs.grossMargin - a.inputs.grossMargin) * 1000) / 1000,
    monthlyRevenueDelta:
      b.summary.projectedMonthlyRevenue - a.summary.projectedMonthlyRevenue,
    liftDollarsDeltaLow:
      b.summary.projectedLiftDollarsLow - a.summary.projectedLiftDollarsLow,
    liftDollarsDeltaHigh:
      b.summary.projectedLiftDollarsHigh - a.summary.projectedLiftDollarsHigh,
    plannedCountDelta: b.summary.plannedCount - a.summary.plannedCount,
    shippedCountDelta: b.summary.shippedCount - a.summary.shippedCount,
    startDateChanged: a.summary.startDate !== b.summary.startDate,
  };
}

// ---------------------------------------------------------------------------
// localStorage-bound helpers — only call from the browser
// ---------------------------------------------------------------------------

export function loadPlanHistory(): PlanHistoryPayload {
  if (typeof window === "undefined") return emptyHistory();
  try {
    const raw = window.localStorage.getItem(PLAN_HISTORY_STORAGE_KEY);
    if (!raw) return emptyHistory();
    const parsed = JSON.parse(raw);
    if (isPlanHistoryPayload(parsed)) return parsed;
    return emptyHistory();
  } catch {
    return emptyHistory();
  }
}

export function savePlanHistory(payload: PlanHistoryPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PLAN_HISTORY_STORAGE_KEY,
      JSON.stringify(payload),
    );
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(PLAN_HISTORY_UPDATE_EVENT, {
          detail: { count: payload.plans.length },
        }),
      );
    }
  } catch {
    // Quota / private-mode failure — silently no-op. The in-memory state
    // in the calling component is still authoritative for the current
    // session.
  }
}

/**
 * High-level "save this just-generated plan" entrypoint.
 * Returns the saved id so the caller can show a confirmation toast.
 */
export function persistGeneratedPlan(args: {
  inputs: YourStoreInputs;
  summary: PlanSummary;
  days: PlanDay[];
  label?: string;
}): { savedId: string; trimmed: boolean } {
  const current = loadPlanHistory();
  const { next, savedId, trimmed } = addPlanToHistory(current, args);
  savePlanHistory(next);
  return { savedId, trimmed };
}

export function deletePlanFromHistory(planId: string): void {
  const current = loadPlanHistory();
  savePlanHistory(removePlanFromHistory(current, planId));
}

export function clearPlanHistory(): void {
  savePlanHistory(clearHistory());
}
