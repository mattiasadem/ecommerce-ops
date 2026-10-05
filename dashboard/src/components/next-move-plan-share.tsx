"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  loadWhatIf,
  saveWhatIf,
  NEXT_MOVE_WHAT_IF_STORAGE_KEY,
  NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
  type WhatIfMap,
} from "@/lib/next-move-what-if";
import {
  loadPlanStartDate,
  savePlanStartDate,
  PLAN_START_STORAGE_KEY,
  PLAN_START_UPDATE_EVENT,
} from "@/lib/next-move-plan-calendar";
import {
  PLAN_SHARE_LAST_IMPORTED_EVENT,
  PLAN_SHARE_LAST_IMPORTED_KEY,
  describeSharedPlan,
  encodePlanShareHash,
  parsePlanShareHash,
  planShareBannerToneClass,
  resolveSharedPlan,
  whatIfFromSharedPlan,
} from "@/lib/next-move-plan-share";

/**
 * `Next-move plan share-link` — Move #N.15 — one-click URL hash share for
 * the what-if plan.
 *
 * Closes the canonical "I want to send my 4-week plan to a co-founder /
 * growth partner / agency — currently I have to screenshot the calendar"
 * gap. The component renders a compact action bar at the bottom of the
 * plan calendar with:
 *
 *   1. **Copy share link** — encodes the current what-if map + plan-start
 *      date into the URL hash (`#plan=M1,M3,M6&start=2026-10-08`) and
 *      copies the absolute URL to the clipboard. The recipient opens it
 *      and sees the same plan auto-imported.
 *
 *   2. **Hash-change listener** — when the URL hash contains a plan-share
 *      payload AND the user has not yet imported it (tracked in
 *      `ecom-ops:next-move-plan-share:last-imported:v1`), the component
 *      validates the payload, writes it to the what-if + plan-start
 *      localStorage keys, fires the corresponding `update` events, and
 *      shows a sky-tinted banner "Loaded shared plan (N moves) from link".
 *
 *   3. **Clear imported banner** — a tiny "× dismiss" button on the banner
 *      removes the last-imported marker so re-imports from a fresh link
 *      work the same way.
 *
 * Hydration: same `useState(false)` + `useEffect` mirror as the rest of
 * the plan module family so the SSR markup byte-matches the first client
 * render. Pre-hydration the bar shows a compact "Loading share…" stub.
 *
 * Pure consumer: writes to `ecom-ops:next-move-what-if:v1` +
 * `ecom-ops:next-move-plan-start:v1` only when auto-importing a fresh
 * hash payload (never on `Copy share link` — that just builds a URL).
 */
export function NextMovePlanShare() {
  const [whatIf, setWhatIf] = useState<WhatIfMap>({});
  const [planStart, setPlanStart] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [hydrated, setHydrated] = useState(false);
  const [importedBanner, setImportedBanner] = useState<{
    moveCount: number;
    summary: string;
    unknownCount: number;
  } | null>(null);

  // Hydrate on mount. Also scan window.location.hash for a fresh payload
  // (one that has not yet been imported into this browser).
  useEffect(() => {
    setWhatIf(loadWhatIf());
    setPlanStart(loadPlanStartDate());
    setHydrated(true);

    function tryImportFromHash() {
      const hash =
        typeof window !== "undefined" ? window.location.hash : "";
      const parsed = parsePlanShareHash(hash);
      if (!parsed.valid || parsed.moveIds.length === 0) return;

      // Skip if we already imported this exact payload (re-renders /
      // back-button).
      const last = (() => {
        try {
          return JSON.parse(
            window.localStorage.getItem(PLAN_SHARE_LAST_IMPORTED_KEY) ||
              "null"
          );
        } catch {
          return null;
        }
      })() as { hash: string; moveIds: string[] } | null;
      if (
        last &&
        last.hash === hash &&
        parsed.moveIds.join(",") === (last.moveIds || []).join(",")
      ) {
        return;
      }

      // Resolve + write.
      const { moves, unknownMoveIds } = resolveSharedPlan(parsed);
      const nextWhatIf = whatIfFromSharedPlan(parsed);
      saveWhatIf(nextWhatIf);
      savePlanStartDate(parsed.startDate);
      setWhatIf(nextWhatIf);
      setPlanStart(parsed.startDate);

      const banner = {
        moveCount: moves.length,
        summary: describeSharedPlan(parsed),
        unknownCount: unknownMoveIds.length,
      };
      setImportedBanner(banner);
      try {
        window.localStorage.setItem(
          PLAN_SHARE_LAST_IMPORTED_KEY,
          JSON.stringify({
            hash,
            moveIds: parsed.moveIds,
            importedAt: new Date().toISOString(),
          })
        );
        window.dispatchEvent(
          new CustomEvent(PLAN_SHARE_LAST_IMPORTED_EVENT, { detail: banner })
        );
      } catch {
        /* ignore */
      }
    }

    // Initial scan + listen for back / forward navigation.
    tryImportFromHash();
    window.addEventListener("hashchange", tryImportFromHash);

    // Cross-tab sync — listen to what-if / plan-start changes (e.g.
    // operator toggles another move in the same tab → share link
    // updates on next copy).
    function handleStorage(e: StorageEvent) {
      if (e.key && e.key === NEXT_MOVE_WHAT_IF_STORAGE_KEY) {
        setWhatIf(loadWhatIf());
      } else if (e.key && e.key === PLAN_START_STORAGE_KEY) {
        setPlanStart(loadPlanStartDate());
      } else if (e.key && e.key === PLAN_SHARE_LAST_IMPORTED_KEY) {
        tryImportFromHash();
      }
    }
    function handleSameTabWhatIf() {
      setWhatIf(loadWhatIf());
    }
    function handleSameTabPlanStart() {
      setPlanStart(loadPlanStartDate());
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
      handleSameTabWhatIf as EventListener
    );
    window.addEventListener(
      PLAN_START_UPDATE_EVENT,
      handleSameTabPlanStart as EventListener
    );

    return () => {
      window.removeEventListener("hashchange", tryImportFromHash);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
        handleSameTabWhatIf as EventListener
      );
      window.removeEventListener(
        PLAN_START_UPDATE_EVENT,
        handleSameTabPlanStart as EventListener
      );
    };
  }, []);

  const shareHash = useMemo(
    () => encodePlanShareHash(whatIf, planStart),
    [whatIf, planStart]
  );
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${window.location.pathname}`;
    return shareHash ? `${base}#${shareHash}` : "";
  }, [shareHash]);

  // Hydration-safe stub
  if (!hydrated) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-[10px] text-muted-foreground"
        data-testid="plan-share-loading"
      >
        Loading share…
      </div>
    );
  }

  const planSize = Object.keys(whatIf).length;

  return (
    <div
      className="mt-2 rounded-lg border border-border bg-background/40 p-2"
      data-testid="plan-share-card"
    >
      {/* Imported banner — only shown right after a hash-import */}
      {importedBanner ? (
        <div
          className={cn(
            "mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-[10px]",
            planShareBannerToneClass()
          )}
          data-testid="plan-share-imported-banner"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className="text-[9px] border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
              data-testid="plan-share-imported-badge"
            >
              Loaded shared plan
            </Badge>
            <span className="truncate">
              <strong className="font-semibold">
                {importedBanner.moveCount} move
                {importedBanner.moveCount === 1 ? "" : "s"}
              </strong>{" "}
              from link — {importedBanner.summary}
              {importedBanner.unknownCount > 0
                ? ` · ${importedBanner.unknownCount} unknown ID${
                    importedBanner.unknownCount === 1 ? "" : "s"
                  } ignored`
                : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                window.localStorage.removeItem(PLAN_SHARE_LAST_IMPORTED_KEY);
              } catch {
                /* ignore */
              }
              setImportedBanner(null);
            }}
            className="shrink-0 rounded border border-sky-500/40 bg-background px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 transition-colors"
            data-testid="plan-share-imported-dismiss"
            aria-label="Dismiss imported banner"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-[10px] uppercase tracking-wider text-muted-foreground"
          data-testid="plan-share-label"
        >
          Share plan
        </span>
        {planSize === 0 ? (
          <span
            className="text-[10px] text-muted-foreground"
            data-testid="plan-share-empty"
          >
            Add at least one move to your plan above to generate a share
            link.
          </span>
        ) : (
          <>
            <CopyButton
              value={shareUrl}
              label="Copy share link"
              className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
            />
            <span
              className="text-[10px] text-muted-foreground tabular-nums"
              data-testid="plan-share-count"
            >
              {planSize} move{planSize === 1 ? "" : "s"} ·{" "}
              <code
                className="rounded bg-muted/40 px-1 py-0.5 text-[9px]"
                data-testid="plan-share-hash-preview"
              >
                #plan=
                {Object.keys(whatIf).slice(0, 3).join(",")}
                {Object.keys(whatIf).length > 3
                  ? `+${Object.keys(whatIf).length - 3}`
                  : ""}
              </code>
            </span>
          </>
        )}
      </div>
      <p
        className="mt-1 text-[9px] text-muted-foreground"
        data-testid="plan-share-help"
      >
        Recipient opens the link and sees your plan auto-loaded. The hash
        carries the move IDs + plan-start date — no server round-trip, no
        cookies, fully client-side.
      </p>
    </div>
  );
}