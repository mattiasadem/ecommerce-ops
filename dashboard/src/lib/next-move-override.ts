/**
 * `Next-move override` — operator-owned "pick a different move than the
 * algorithm picked" preference.
 *
 * Some weeks the operator deliberately wants to ship Move #4 (post-purchase
 * upsell) before Move #1 (abandoned cart) because they just onboarded
 * Klaviyo last week and the abandoned cart flow is already half-built.
 * The algorithm doesn't know that. This module lets the operator override
 * the algorithmic #1 pick without breaking the compare view — the override
 * is a single move id, and clearing it falls back to the algorithm.
 *
 * State is per-browser (localStorage). Single key holds the override id
 * plus a `setAt` ISO timestamp + an optional `reason` note ("already
 * shipped Klaviyo last week — cart flow is half done, ship the upsell
 * first"). Survives reloads. Bump the suffix (`v1` → `v2`) when the
 * schema changes incompatibly.
 *
 * Schema:
 *   {
 *     moveId: string,        // matches a MoveRecommendation.id
 *     setAt: string,         // ISO 8601 — when the override was last written
 *     reason?: string,       // operator note (free-form, optional)
 *   }
 *
 * Missing key or invalid shape = no override.
 */

import { MOVE_RECOMMENDATIONS, type MoveRecommendation } from "./next-move";

export const NEXT_MOVE_OVERRIDE_STORAGE_KEY = "ecom-ops:next-move-override:v1";

export interface NextMoveOverride {
  moveId: string;
  setAt: string;
  reason?: string;
}

/** Validate that an override object points at a real Top-10 move id. */
function isValidOverride(value: unknown): value is NextMoveOverride {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<NextMoveOverride>;
  if (typeof v.moveId !== "string") return false;
  if (typeof v.setAt !== "string") return false;
  const valid = MOVE_RECOMMENDATIONS.some((m) => m.id === v.moveId);
  if (!valid) return false;
  if (v.reason !== undefined && typeof v.reason !== "string") return false;
  return true;
}

/** Load the override from localStorage. Returns null when no override set
 *  or when the stored value is invalid (e.g. the move id was retired). */
export function loadNextMoveOverride(): NextMoveOverride | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NEXT_MOVE_OVERRIDE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidOverride(parsed)) return null;
    return {
      moveId: parsed.moveId,
      setAt: parsed.setAt,
      reason: parsed.reason,
    };
  } catch {
    return null;
  }
}

/** Persist an override. Always overwrites the previous value (the operator
 *  is replacing one pick with another). The `setAt` timestamp is auto-set
 *  to the current ISO time. */
export function saveNextMoveOverride(
  moveId: string,
  reason?: string
): NextMoveOverride {
  const value: NextMoveOverride = {
    moveId,
    setAt: new Date().toISOString(),
    reason: reason && reason.trim() ? reason.trim() : undefined,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        NEXT_MOVE_OVERRIDE_STORAGE_KEY,
        JSON.stringify(value)
      );
      // Dispatch a same-tab broadcast so other components on the page
      // (rare, but possible if there are multiple NextMoveCard mounts)
      // pick up the change immediately.
      window.dispatchEvent(
        new CustomEvent("ecom-ops:next-move-override:update", {
          detail: value,
        })
      );
    } catch {
      // localStorage may be unavailable (Safari private mode, etc).
      // We still return the value so the UI can show the optimistic state
      // for this session.
    }
  }
  return value;
}

/** Clear the override. Returns true if there was something to clear. */
export function clearNextMoveOverride(): boolean {
  if (typeof window === "undefined") return false;
  let had = false;
  try {
    had = window.localStorage.getItem(NEXT_MOVE_OVERRIDE_STORAGE_KEY) !== null;
    window.localStorage.removeItem(NEXT_MOVE_OVERRIDE_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("ecom-ops:next-move-override:update", {
        detail: null,
      })
    );
  } catch {
    // ignore — same as saveNextMoveOverride
  }
  return had;
}

/** Look up the full MoveRecommendation for an override id. Returns null
 *  when the move id doesn't match anything in MOVE_RECOMMENDATIONS. */
export function resolveOverrideMove(
  override: NextMoveOverride | null
): MoveRecommendation | null {
  if (!override) return null;
  return (
    MOVE_RECOMMENDATIONS.find((m) => m.id === override.moveId) ?? null
  );
}
