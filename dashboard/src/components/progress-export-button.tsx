"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  loadShippedPlaybooks,
  type ShippedMap,
} from "@/lib/shipped-playbooks";
import {
  loadNextMoveOverride,
  NEXT_MOVE_OVERRIDE_STORAGE_KEY,
  type NextMoveOverride,
} from "@/lib/next-move-override";
import {
  YOUR_STORE_DEFAULTS,
  loadYourStore,
} from "@/lib/your-store";
import {
  buildProgressExport,
  progressExportToCsv,
  type ProgressExportPayload,
} from "@/lib/progress-export";
import type { Playbook, Top10Status } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * `Unified progress export` — one-click download of the operator's
 * three progress trackers (Top-10 shipped × shipped-playbooks ×
 * next-move override) as either JSON or CSV.
 *
 * Closes the operator-handoff loop:
 *   - `workspace-backup-card` exports EVERY ecom-ops key as JSON — fine for
 *     full restore, noisy for handoff.
 *   - `top10-export-button` exports just the Top-10 map — misses the
 *     playbook tracker and the override.
 *   - This component bundles all three into ONE human-readable artifact
 *     so an operator can paste a single file into Slack, Notion, or an
 *     email and have the receiver see the full picture.
 *
 * Storage keys consumed:
 *   - `ecom-ops:top10-shipped:v1` (read directly — same key the
 *     `/top-10` per-row toggle writes to).
 *   - `ecom-ops:shipped-playbooks:v1` (via `loadShippedPlaybooks`).
 *   - `ecom-ops:next-move-override:v1` (via `loadNextMoveOverride`).
 *   - `ecom-ops:your-store:v1` (via `loadYourStore` — used to resolve the
 *     algorithmic #1 pick for the override block).
 *
 * Cross-tab + same-tab sync: subscribes to BOTH the standard `storage`
 * event (cross-tab) AND the `ecom-ops:top10-shipped:update` +
 * `ecom-ops:shipped-playbooks:update` + `ecom-ops:next-move-override:update`
 * custom DOM events the writers fire on each save. So a freshly
 * downloaded export always reflects the latest in-memory state without
 * requiring a reload.
 */

interface Top10ShippedMap {
  [moveId: string]: { shippedAt: string };
}

const TOP10_SHIPPED_KEY = "ecom-ops:top10-shipped:v1";

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

function downloadBlob(filename: string, mime: string, content: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isoDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ProgressExportButtonProps {
  /** Canonical top-10 status array from content.json. */
  top10Status: Top10Status[];
  /** All parsed playbooks, used to resolve titles for the Top-10 and shipped-playbooks blocks. */
  playbooks: Playbook[];
  /**
   * If true, render a compact one-button-pair row that fits inside an
   * Overview or card. If false, render a wider toolbar with explicit
   * labels (default — used in the dedicated Progress card).
   */
  compact?: boolean;
  /** Optional label override for the testid / aria labels. */
  label?: string;
}

export function ProgressExportButton({
  top10Status,
  playbooks,
  compact = false,
  label = "Progress — unified export",
}: ProgressExportButtonProps) {
  const [top10Shipped, setTop10Shipped] = useState<Top10ShippedMap>({});
  const [shippedPlaybooks, setShippedPlaybooks] = useState<ShippedMap>({});
  const [override, setOverride] = useState<NextMoveOverride | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function refresh() {
      setTop10Shipped(loadTop10Shipped());
      setShippedPlaybooks(loadShippedPlaybooks());
      setOverride(loadNextMoveOverride());
    }
    refresh();
    setHydrated(true);

    function handleStorage(e: StorageEvent) {
      if (
        e.key === TOP10_SHIPPED_KEY ||
        e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY ||
        e.key === NEXT_MOVE_OVERRIDE_STORAGE_KEY
      ) {
        refresh();
      }
    }
    function handleTop10() {
      setTop10Shipped(loadTop10Shipped());
    }
    function handleShipped() {
      setShippedPlaybooks(loadShippedPlaybooks());
    }
    function handleOverride() {
      setOverride(loadNextMoveOverride());
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "ecom-ops:top10-shipped:update",
      handleTop10 as EventListener,
    );
    window.addEventListener(
      "ecom-ops:shipped-playbooks:update",
      handleShipped as EventListener,
    );
    window.addEventListener(
      "ecom-ops:next-move-override:update",
      handleOverride as EventListener,
    );
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "ecom-ops:top10-shipped:update",
        handleTop10 as EventListener,
      );
      window.removeEventListener(
        "ecom-ops:shipped-playbooks:update",
        handleShipped as EventListener,
      );
      window.removeEventListener(
        "ecom-ops:next-move-override:update",
        handleOverride as EventListener,
      );
    };
  }, []);

  const payload: ProgressExportPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildProgressExport({
      top10Status,
      playbooks,
      top10Shipped,
      shippedPlaybooks,
      override,
      store: loadYourStore() ?? YOUR_STORE_DEFAULTS,
    });
  }, [
    hydrated,
    top10Status,
    playbooks,
    top10Shipped,
    shippedPlaybooks,
    override,
  ]);

  const csvText = useMemo(() => {
    if (!payload) return "";
    return progressExportToCsv(payload);
  }, [payload]);

  const jsonText = useMemo(() => {
    if (!payload) return "";
    return `${JSON.stringify(payload, null, 2)}\n`;
  }, [payload]);

  const totalTracked = payload
    ? payload.top10.shipped_count + payload.shipped_playbooks.shipped_count
    : 0;
  const isEmpty = !payload || totalTracked === 0;
  const disabled = !hydrated || isEmpty;

  const title = isEmpty
    ? "Mark at least one Top-10 move or playbook as shipped to enable export"
    : `Export my ${totalTracked} tracked item${totalTracked === 1 ? "" : "s"} (${payload?.top10.shipped_count ?? 0} Top-10 + ${payload?.shipped_playbooks.shipped_count ?? 0} playbook${(payload?.shipped_playbooks.shipped_count ?? 0) === 1 ? "" : "s"}${payload?.override ? " + override" : ""}) as JSON / CSV`;

  const filenameBase = `ecom-ops-progress-${isoDateStamp()}`;

  function onDownloadJson() {
    if (!jsonText) return;
    downloadBlob(`${filenameBase}.json`, "application/json", jsonText);
  }
  function onDownloadCsv() {
    if (!csvText) return;
    downloadBlob(`${filenameBase}.csv`, "text/csv", csvText);
  }

  return (
    <div
      data-testid="progress-export"
      className={cn(
        compact
          ? "flex flex-wrap items-center gap-1.5 pt-1"
          : "flex flex-wrap items-center gap-2 pt-1",
      )}
    >
      <button
        type="button"
        onClick={onDownloadJson}
        disabled={disabled}
        aria-label={`${label} as JSON`}
        title={title}
        data-testid="progress-export-json"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          disabled
            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
      >
        <span aria-hidden="true">↓</span>
        <span>JSON</span>
      </button>
      <button
        type="button"
        onClick={onDownloadCsv}
        disabled={disabled}
        aria-label={`${label} as CSV`}
        title={title}
        data-testid="progress-export-csv"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          disabled
            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
      >
        <span aria-hidden="true">↓</span>
        <span>CSV</span>
      </button>
      {!hydrated ? (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          hydrating…
        </span>
      ) : isEmpty ? (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          no shipped moves or playbooks yet
        </span>
      ) : null}
    </div>
  );
}
