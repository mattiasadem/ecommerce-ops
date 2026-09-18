/**
 * Trajectory scenario reset — Move #128.an on `/` (and `/today`).
 *
 * Three lightweight helpers to close the comparator loop. The comparator
 * panel writes scenario state to `ecom-ops:trajectory-scenario:v1` (A) and
 * `ecom-ops:trajectory-scenario-b:v1` (B), plus dispatches the
 * `ecom-ops:trajectory-scenario:update` and `ecom-ops:trajectory-scenario-b:update`
 * same-tab events. Before this helper shipped, an operator could only
 * reset by (a) manually editing the dropdowns, (b) opening DevTools and
 * calling `localStorage.removeItem(...)` for both keys, or (c) clearing
 * site data (which wipes every Dashboard setting — Your-store,
 * shipped-playbooks, override, top10-shipped — collateral damage).
 *
 * Move #128.an ships three pure helpers + the corresponding CustomEvent
 * dispatchers so the originating `<TrajectoryScenarioComparator />`
 * re-hydrates to defaults without any extra wiring. Mirrors the schema
 * constants from `trajectory-scenario-comparator.tsx` so a future change
 * in either side is a one-line edit.
 */

// ---------------------------------------------------------------------------
// Constants — mirror of the comparator's STORAGE_KEY / SCHEMA / VERSION so
// a future rename in the comparator only needs one edit here.
// ---------------------------------------------------------------------------

export const RESET_STORAGE_KEY_A = "ecom-ops:trajectory-scenario:v1";
export const RESET_STORAGE_KEY_B = "ecom-ops:trajectory-scenario-b:v1";
export const RESET_EVENT_A = "ecom-ops:trajectory-scenario:update";
export const RESET_EVENT_B = "ecom-ops:trajectory-scenario-b:update";

export interface ResetSummary {
  /** Key that was cleared */
  key: string;
  /** True when something was actually removed (false if the key was absent) */
  removed: boolean;
}

/**
 * Clear the Scenario A override on top of the baseline. Returns a
 * per-key summary so the caller can render a confirmation toast or
 * update a count badge (e.g. "Reset Scenario A — cleared 1 key").
 */
export function resetScenarioA(): ResetSummary {
  return clearOne(RESET_STORAGE_KEY_A, RESET_EVENT_A);
}

/**
 * Clear the Scenario B override (if it's enabled). When B is enabled,
 * the comparator writes `{ enabled, state }` to the B key — reset
 * additionally rebuilds the default payload with `enabled: false` so
 * the comparator un-checks the "Compare against a 2nd scenario" toggle.
 */
export function resetScenarioB(): ResetSummary {
  return clearOne(
    RESET_STORAGE_KEY_B,
    RESET_EVENT_B,
    /* rewriteDisabledPayload */ true,
  );
}

/**
 * Reset both Scenario A and Scenario B in one call. Returns a 2-row
 * summary; useful for the "Reset both" button on the comparator.
 */
export function resetScenarioBoth(): { a: ResetSummary; b: ResetSummary } {
  return { a: resetScenarioA(), b: resetScenarioB() };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function clearOne(
  key: string,
  eventName: string,
  rewriteDisabledPayload = false,
): ResetSummary {
  // SSR / non-browser guard. The comparator already guards localStorage
  // access inside try/catch, but doing it once here keeps the helper
  // safe to call from React useEffect or event handlers without
  // crashing during build-time prerender.
  if (typeof window === "undefined") {
    return { key, removed: false };
  }

  let removed = false;
  let disabledPayload: unknown = undefined;

  try {
    const before = window.localStorage.getItem(key);
    if (before !== null) {
      window.localStorage.removeItem(key);
      removed = true;
    }
    // When rewriting the B key to a "disabled" payload, mirror the
    // comparator's `{ schema, version, enabled, state }` shape so the
    // comparator un-checks the toggle AND clears the move/delay pickers.
    // We only know the exact shape from inside the comparator module,
    // but a minimal `{ enabled: false, schema: "ecom-ops-trajectory-scenario-b", version: 1 }`
    // payload is enough to make the comparator treat B as off on next
    // mount.
    if (rewriteDisabledPayload && eventName === RESET_EVENT_B) {
      disabledPayload = {
        schema: "ecom-ops-trajectory-scenario-b",
        version: 1,
        enabled: false,
        state: { moveId: null, delayDays: 30 },
      };
      window.localStorage.setItem(key, JSON.stringify(disabledPayload));
    }
  } catch {
    // Quota exceeded / private mode — silently ignore. The reset is a
    // UX convenience, not a guarantee.
    return { key, removed: false };
  }

  // Same-tab notification. The comparator already listens for this via
  // the addEventListener in its mount effect, so re-hydrating to
  // defaults is automatic.
  try {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: rewriteDisabledPayload
          ? disabledPayload
          : { schema: "ecom-ops-trajectory-scenario", version: 1, state: { moveId: null, delayDays: 30 } },
      }),
    );
  } catch {
    /* no-op */
  }

  // Cross-tab notification. Event fires only on OTHER tabs — the
  // current tab already re-hydrates via the same-tab listener above.
  return { key, removed };
}
