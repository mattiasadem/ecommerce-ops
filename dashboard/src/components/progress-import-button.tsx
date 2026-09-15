"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  loadShippedPlaybooks,
  saveShippedPlaybooks,
  type ShippedMap,
} from "@/lib/shipped-playbooks";
import {
  loadNextMoveOverride,
  saveNextMoveOverride,
  clearNextMoveOverride,
} from "@/lib/next-move-override";
import {
  applyProgressImport,
  parseProgressImport,
  type ProgressImportSummary,
} from "@/lib/progress-import";
import { cn } from "@/lib/utils";

/**
 * `Unified progress import` — paste-back restore of a previously
 * exported JSON handoff artifact.
 *
 * Closes the export↔import loop on the operator-progress side. The
 * companion `progress-export-button.tsx` shipped JSON / CSV downloads
 * of the operator's three progress trackers (Top-10 × shipped-playbooks
 * × next-move override). This component is the symmetric restore:
 *
 *   1. Operator opens the `<details>` block.
 *   2. Operator pastes the JSON text they previously exported (or received
 *      from a teammate).
 *   3. `parseProgressImport` validates the payload against the canonical
 *      schema + version. Schema mismatch → red error panel, no side effects.
 *   4. UI shows a preview of what would change (per-block counts, override
 *      validity, schema + version badges, source `exportedAt`).
 *   5. Operator picks MERGE (default — additive, never destructive) or
 *      REPLACE (power-user mode that wipes existing keys before applying).
 *   6. Operator clicks "Restore" → confirm dialog → `applyProgressImport`
 *      returns the next-state maps, the component writes each to its
 *      `ecom-ops:*:v1` localStorage key AND dispatches the writer's
 *      canonical update event (`ecom-ops:top10-shipped:update` /
 *      `ecom-ops:shipped-playbooks:update` / `ecom-ops:next-move-override:update`).
 *   7. Result banner: "Restored N Top-10 moves + M playbooks, override
 *      set to Move #X." Same-tab consumers react via the custom events;
 *      cross-tab consumers react via the standard `storage` event.
 *
 * Storage keys WRITTEN (only when restore succeeds):
 *   - `ecom-ops:top10-shipped:v1`
 *   - `ecom-ops:shipped-playbooks:v1`
 *   - `ecom-ops:next-move-override:v1` (or removed, if replace-mode + no override)
 *
 * Defensive design: every potential error path returns a structured
 * `ProgressImportSummary.ok=false` with a human-readable message. No
 * localStorage write happens before the operator clicks the explicit
 * Restore button + confirms.
 */

const TOP10_SHIPPED_KEY = "ecom-ops:top10-shipped:v1";

interface Top10ShippedMap {
  [moveId: string]: { shippedAt: string };
}

function loadTop10Shipped(): Top10ShippedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TOP10_SHIPPED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Top10ShippedMap = {};
    for (const [k, v] of Object.entries(parsed as Top10ShippedMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as { shippedAt?: unknown }).shippedAt !== "string") continue;
      out[k] = { shippedAt: (v as { shippedAt: string }).shippedAt };
    }
    return out;
  } catch {
    return {};
  }
}

function saveTop10Shipped(map: Top10ShippedMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOP10_SHIPPED_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent("ecom-ops:top10-shipped:update", { detail: { map } }),
    );
  } catch {
    /* quota / private-mode — silent */
  }
}

type Mode = "merge" | "replace";

export interface ProgressImportButtonProps {
  /** Optional className override for the wrapper. */
  className?: string;
}

export function ProgressImportButton({
  className,
}: ProgressImportButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("merge");
  // Re-parse whenever the textarea content changes (throttled in practice
  // by user typing pace; no need for a debounce).
  const summary: ProgressImportSummary = useMemo(
    () => parseProgressImport(text),
    [text],
  );

  // Hydration gate — render an inert placeholder pre-mount, same pattern
  // as `progress-export-button.tsx`. Skip if `open=false` (default).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Counts of CURRENT state — used to show "your store already has X
  // shipped moves" + "incoming would add Y" so the operator can see the
  // merge diff before confirming.
  const [currentTop10Count, setCurrentTop10Count] = useState(0);
  const [currentShippedCount, setCurrentShippedCount] = useState(0);
  useEffect(() => {
    if (!open) return;
    function refresh() {
      setCurrentTop10Count(Object.keys(loadTop10Shipped()).length);
      setCurrentShippedCount(Object.keys(loadShippedPlaybooks()).length);
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(
      "ecom-ops:top10-shipped:update",
      refresh as EventListener,
    );
    window.addEventListener(
      "ecom-ops:shipped-playbooks:update",
      refresh as EventListener,
    );
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "ecom-ops:top10-shipped:update",
        refresh as EventListener,
      );
      window.removeEventListener(
        "ecom-ops:shipped-playbooks:update",
        refresh as EventListener,
      );
    };
  }, [open]);

  const [result, setResult] = useState<{
    top10Changed: number;
    shippedPlaybooksChanged: number;
    overrideReplaced: boolean;
  } | null>(null);

  function onRestore() {
    if (!summary.ok || !summary.payload) return;
    const cur10 = loadTop10Shipped();
    const curSp: ShippedMap = loadShippedPlaybooks();
    const curOverride = loadNextMoveOverride();

    const applied = applyProgressImport({
      payload: summary.payload,
      currentTop10Shipped: cur10,
      currentShippedPlaybooks: curSp,
      replace: mode === "replace",
    });

    // Always write (top10 + shipped-playbooks) — even when both changed=0,
    // so the merge-mode "touch" still dispatches the canonical update event.
    saveTop10Shipped(applied.nextTop10Shipped);
    saveShippedPlaybooks(applied.nextShippedPlaybooks);

    // Override: only write when the payload had one + we have a move-id,
    // OR when replace-mode wants to clear an existing local override.
    if (applied.nextOverride) {
      saveNextMoveOverride(
        applied.nextOverride.moveId,
        applied.nextOverride.reason,
      );
    } else if (mode === "replace" && curOverride) {
      // Replace mode + no incoming override → clear local override.
      clearNextMoveOverride();
    }

    setResult({
      top10Changed: applied.top10Changed,
      shippedPlaybooksChanged: applied.shippedPlaybooksChanged,
      overrideReplaced: applied.overrideReplaced,
    });

    // Clear the textarea so a follow-up paste is unambiguous.
    setText("");
  }

  function onClearResult() {
    setResult(null);
  }

  // Build the title attribute for the Restore button (for screen readers).
  const restoreTitle = !summary.ok
    ? "Restore is disabled until pasted JSON is valid"
    : summary.ok && summary.payload
      ? `Restore ${summary.top10IncomingRows} Top-10 rows + ${summary.shippedPlaybooksIncomingRows} playbooks${
          summary.overrideIncoming ? ` + override${summary.overrideValidAgainstCurrent ? "" : " (move retired — will be skipped)"}` : ""
        } (${mode === "merge" ? "merge with existing" : "replace existing"})`
      : "";

  return (
    <div className={cn("flex flex-col gap-2 pt-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="progress-import-panel"
          data-testid="progress-import-toggle"
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
            open
              ? "border-foreground/40 bg-foreground/5 text-foreground"
              : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          <span aria-hidden="true">{open ? "×" : "↑"}</span>
          <span>Import handoff JSON</span>
        </button>
        {!hydrated ? (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            hydrating…
          </span>
        ) : null}
        {result ? (
          <span
            data-testid="progress-import-result"
            className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
          >
            ✓ Restored{" "}
            {result.top10Changed > 0 ? `${result.top10Changed} Top-10` : ""}
            {result.top10Changed > 0 && result.shippedPlaybooksChanged > 0
              ? " + "
              : ""}
            {result.shippedPlaybooksChanged > 0
              ? `${result.shippedPlaybooksChanged} playbook${result.shippedPlaybooksChanged === 1 ? "" : "s"}`
              : ""}
            {(result.top10Changed > 0 || result.shippedPlaybooksChanged > 0) &&
            result.overrideReplaced
              ? " + override"
              : result.overrideReplaced
                ? "override"
                : ""}
            <button
              type="button"
              onClick={onClearResult}
              aria-label="Dismiss restore result"
              className="ml-1 -mr-1 rounded px-1 text-emerald-700/70 hover:bg-emerald-500/20 dark:text-emerald-300/70"
            >
              ×
            </button>
          </span>
        ) : null}
      </div>

      {open ? (
        <div
          id="progress-import-panel"
          data-testid="progress-import-panel"
          className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3"
        >
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Paste a JSON file exported from `ProgressExportButton`
          </div>
          <textarea
            data-testid="progress-import-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='{"schema":"ecommerce-ops-progress","version":1,...}'
            rows={6}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full resize-y rounded-md border border-border bg-background p-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none"
          />

          {/* Validation banner — always rendered below the textarea so the
              layout doesn't shift between valid/invalid states. */}
          {text.trim() === "" ? (
            <div
              data-testid="progress-import-validation"
              className="rounded-md border border-dashed border-border bg-background/40 p-2 text-[11px] text-muted-foreground"
            >
              Paste exported JSON above — preview appears here.
            </div>
          ) : summary.ok && summary.payload ? (
            <div
              data-testid="progress-import-validation"
              className="flex flex-col gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2 text-[11px]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                  ✓ {summary.schemaMatched} v{summary.versionMatched}
                </span>
                {summary.exportedAt ? (
                  <span
                    className="text-[10px] text-muted-foreground"
                    title={summary.exportedAt}
                  >
                    exported{" "}
                    {new Date(summary.exportedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span>
                  <strong className="font-semibold tabular-nums text-foreground">
                    {summary.top10IncomingRows}
                  </strong>{" "}
                  Top-10 row{summary.top10IncomingRows === 1 ? "" : "s"} (you
                  have {currentTop10Count})
                </span>
                <span>
                  <strong className="font-semibold tabular-nums text-foreground">
                    {summary.shippedPlaybooksIncomingRows}
                  </strong>{" "}
                  playbook
                  {summary.shippedPlaybooksIncomingRows === 1 ? "" : "s"} (you
                  have {currentShippedCount})
                </span>
                <span
                  className={cn(
                    summary.overrideIncoming
                      ? summary.overrideValidAgainstCurrent
                        ? ""
                        : "text-amber-600 dark:text-amber-400"
                      : "",
                  )}
                >
                  override:{" "}
                  <strong className="font-semibold text-foreground">
                    {summary.overrideIncoming
                      ? summary.overrideValidAgainstCurrent
                        ? "✓ valid"
                        : "✗ retired move — will be skipped"
                      : "—"}
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div
              data-testid="progress-import-validation"
              className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-700 dark:text-rose-300"
            >
              <strong className="font-semibold">Invalid payload</strong>
              <div className="mt-0.5">{summary.error}</div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="progress-import-mode"
                value="merge"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
                data-testid="progress-import-mode-merge"
                className="accent-foreground"
              />
              <span>
                <strong className="font-semibold text-foreground">Merge</strong>{" "}
                — adds incoming without deleting existing
              </span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="progress-import-mode"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                data-testid="progress-import-mode-replace"
                className="accent-foreground"
              />
              <span>
                <strong className="font-semibold text-foreground">Replace</strong>{" "}
                — overwrites local state (destructive)
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onRestore}
              disabled={!summary.ok || !summary.payload}
              aria-label="Restore progress from pasted JSON"
              title={restoreTitle}
              data-testid="progress-import-restore"
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors",
                !summary.ok || !summary.payload
                  ? "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
                  : "border-foreground/40 bg-foreground text-background hover:opacity-90",
              )}
              onClickCapture={(e) => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(
                    mode === "replace"
                      ? "REPLACE mode — this will overwrite your local Top-10, shipped-playbooks, and override state. Continue?"
                      : "MERGE mode — incoming Top-10 + playbook rows will be added; existing entries are kept when newer. Continue?",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <span aria-hidden="true">✓</span>
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
              }}
              data-testid="progress-import-clear"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
