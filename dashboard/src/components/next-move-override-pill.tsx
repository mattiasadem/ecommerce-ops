"use client";

import { useEffect, useState } from "react";
import {
  NEXT_MOVE_OVERRIDE_STORAGE_KEY,
  NextMoveOverride,
  clearNextMoveOverride,
  loadNextMoveOverride,
} from "@/lib/next-move-override";
import { MOVE_RECOMMENDATIONS, pickNextMove } from "@/lib/next-move";
import {
  YOUR_STORE_DEFAULTS,
  loadYourStore,
} from "@/lib/your-store";
import {
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

/**
 * `Next-move override pill` — cross-page-intelligence confirmation widget.
 *
 * Shows a small dismissible banner at the top of any page that mounts it
 * (currently `/` and the standup preview) whenever an override is active
 * in `ecom-ops:next-move-override:v1`. The widget:
 *
 *   1. Hydrates the override from localStorage on mount (no SSR markup —
 *      server can't read localStorage so we render nothing until
 *      `hydrated = true`).
 *   2. Subscribes to BOTH the `storage` event (cross-tab) AND the
 *      `ecom-ops:next-move-override:update` custom DOM event (same-tab —
 *      fires from `saveNextMoveOverride` / `clearNextMoveOverride`).
 *   3. Renders a single-line pill: "Override active — algorithmic pick is
 *      Move #X but you pinned Move #Y — Name" with a one-click
 *      "Clear override" link that calls `clearNextMoveOverride()`
 *      (which itself dispatches the same-tab event so the originating
 *      `<NextMoveCard />` reverts to the algorithmic #1).
 *   4. Returns `null` when no override is set or before hydration — no
 *      SSR drift, no empty-state noise.
 *
 * The widget intentionally duplicates NO state with `<NextMoveCard />` —
 * it reads from the same localStorage key and lets the same custom DOM
 * event fan-out keep both views in sync. This is the canonical
 * cross-page-intelligence bridge for Move #128.ae.
 */
export function NextMoveOverridePill() {
  const [override, setOverride] = useState<NextMoveOverride | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function refresh() {
      setOverride(loadNextMoveOverride());
    }
    refresh();
    setHydrated(true);

    function handleStorage(e: StorageEvent) {
      if (e.key && e.key === NEXT_MOVE_OVERRIDE_STORAGE_KEY) {
        refresh();
      }
    }
    function handleSameTab() {
      refresh();
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "ecom-ops:next-move-override:update",
      handleSameTab as EventListener
    );
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "ecom-ops:next-move-override:update",
        handleSameTab as EventListener
      );
    };
  }, []);

  function handleClear() {
    clearNextMoveOverride();
    // Optimistic — the dispatched event will arrive in the next tick and
    // set `override = null`, but for one render the state is still
    // "stale" from the call site. setState is fine: the local effect
    // re-reads and the banner goes away.
    setOverride(null);
  }

  if (!hydrated || !override) return null;

  // Resolve the algorithmic pick so the pill can show the delta.
  const store = loadYourStore() ?? YOUR_STORE_DEFAULTS;
  const shipped = loadShippedPlaybooks();
  const algo = pickNextMove(store, shipped, null);
  const pinned = MOVE_RECOMMENDATIONS.find((m) => m.id === override.moveId);
  if (!pinned) return null;

  const algoRank = algo.move?.priorityRank ?? null;
  const pinnedRank = pinned.priorityRank;
  const isAlgoSame = algoRank === pinnedRank;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-[11px] text-sky-700 dark:text-sky-300"
      data-testid="next-move-override-pill"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="inline-flex shrink-0 items-center rounded-md border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          aria-label="Operator override active"
        >
          Override active
        </span>
        <span className="truncate">
          {isAlgoSame || algoRank === null ? (
            <>
              Algorithm also picks Move #{pinnedRank} —{" "}
              <span className="font-medium">{pinned.name}</span>. Your
              override is pinned but matches the algorithm.
            </>
          ) : (
            <>
              Algorithm picked Move #{algoRank} but you pinned Move #
              {pinnedRank} — <span className="font-medium">{pinned.name}</span>
              {override.reason ? (
                <>
                  {" "}
                  <span className="text-sky-600/80 dark:text-sky-400/80">
                    ({override.reason.length > 60
                      ? `${override.reason.slice(0, 60)}…`
                      : override.reason}
                    )
                  </span>
                </>
              ) : null}
              .
            </>
          )}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href="/today"
          className="text-[11px] underline hover:no-underline"
          data-testid="next-move-override-pill-jump"
        >
          Open Next-move card →
        </a>
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "rounded-md border border-sky-500/40 bg-background px-2 py-1 text-[11px] font-medium",
            "text-sky-700 dark:text-sky-300",
            "hover:bg-sky-500/10 transition-colors"
          )}
          data-testid="next-move-override-pill-clear"
        >
          Clear override
        </button>
      </div>
    </div>
  );
}
