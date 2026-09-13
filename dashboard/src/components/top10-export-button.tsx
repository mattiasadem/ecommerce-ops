"use client";

import { useEffect, useMemo, useState } from "react";
import { type Top10Status, type Playbook } from "@/lib/content";
import { resolvePlaybookLinksForMove } from "@/lib/top10-playbook-mapping";

/**
 * `Top 10 — export my shipped progress` — one-click CSV / JSON export of
 * the operator's personal `ecom-ops:top10-shipped:v1` map plus the matched
 * playbook(s) each move unlocks.
 *
 * Closes the operator-progress loop with a portable handoff: an operator
 * who has shipped Moves 1, 3, 6, 6.5 in their store can hit "Download CSV"
 * on `/top-10` (or `/`) and get a one-row-per-(move × playbook) export
 * that they can paste into a Slack thread, email, or Notion handoff.
 *
 * Why this lives in its own component (vs being inlined in the tracker):
 *   1. The CSV row schema is the canonical "operator progress artifact"
 *      — it is consumed by humans AND by future tooling (a script that
 *      reads `ecom-ops-top10-shipped-2026-09-13.csv` to update a team
 *      tracker, or a one-click "post to Slack" webhook).
 *   2. The component is reused on BOTH `/top-10` (full per-move export)
 *      and `/` (compact per-playbook export from the Overview card).
 *   3. Hydration / `loadShipped()` lives here so neither call site has
 *      to repeat the localStorage + custom-event + storage-event wiring.
 *
 * Storage key: `ecom-ops:top10-shipped:v1` (canonical, same as the
 * `/top-10` per-row toggle and the Overview card).
 *
 * Cross-tab + same-tab sync: subscribes to the same `ecom-ops:top10-shipped:update`
 * custom DOM event the toggle fires, so the export button always
 * reflects the latest operator state without a page reload.
 */

const STORAGE_KEY = "ecom-ops:top10-shipped:v1";
const UPDATE_EVENT = "ecom-ops:top10-shipped:update";

interface ShippedEntry {
  shippedAt: string;
}
type ShippedMap = Record<string, ShippedEntry>;

function loadShipped(): ShippedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: ShippedMap = {};
    for (const [k, v] of Object.entries(parsed as ShippedMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as ShippedEntry).shippedAt !== "string") continue;
      out[k] = { shippedAt: (v as ShippedEntry).shippedAt };
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Mirror of `moveIdFromStatus` from `/components/top10-shipped-tracker.tsx`.
 * Kept identical to avoid drift — if you change one, change both.
 */
function moveIdFromStatus(s: Top10Status): string {
  const rankMatch = /#(\d+)/.exec(s.move);
  if (rankMatch && rankMatch[1]) {
    return `top10:#${rankMatch[1]}`;
  }
  const slug = s.move
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `top10:${slug || "unknown"}`;
}

/** RFC 4180 cell escape for CSV. */
function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Render the full export payload — one row per (move × playbook). */
function buildRows(
  status: Top10Status[],
  playbooks: Playbook[],
  shipped: ShippedMap,
): Array<Record<string, string>> {
  const playbookBySlug: Record<string, Playbook> = {};
  for (const p of playbooks) {
    playbookBySlug[p.file.replace(/\.md$/, "")] = p;
  }
  const rows: Array<Record<string, string>> = [];
  for (const s of status) {
    const id = moveIdFromStatus(s);
    const entry = shipped[id];
    if (!entry) continue; // skip moves the operator hasn't shipped
    const shippedDate = entry.shippedAt.slice(0, 10);
    const links = resolvePlaybookLinksForMove(s.move);
    if (links.length === 0) {
      // Move has no direct playbook — surface that explicitly so the
      // handoff receiver knows the move shipped but no playbook was
      // unlocked (e.g. a meta-move or a roadmap-only item).
      rows.push({
        rank: s.move.split(".")[0] ?? "",
        move: s.move,
        move_id: id,
        shipped_at: shippedDate,
        playbook_slug: "",
        playbook_title: "(no playbook unlocked)",
        playbook_href: "",
        canonical_shipped: s.shipped ? "yes" : "no",
        canonical_pending: s.pending ? "yes" : "no",
      });
      continue;
    }
    for (const link of links) {
      const pb = playbookBySlug[link.slug];
      rows.push({
        rank: s.move.split(".")[0] ?? "",
        move: s.move,
        move_id: id,
        shipped_at: shippedDate,
        playbook_slug: link.slug,
        playbook_title: pb?.title ?? link.title,
        playbook_href: link.href,
        canonical_shipped: s.shipped ? "yes" : "no",
        canonical_pending: s.pending ? "yes" : "no",
      });
    }
  }
  return rows;
}

function rowsToCsv(headers: string[], rows: Array<Record<string, string>>): string {
  const headerLine = headers.map(csvEscape).join(",");
  const lines = rows.map((r) => headers.map((h) => csvEscape(r[h] ?? "")).join(","));
  return [headerLine, ...lines].join("\n") + "\n";
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

export interface Top10ExportButtonProps {
  /** Canonical top-10 status array from content.json. */
  status: Top10Status[];
  /** All parsed playbooks, used to look up canonical titles. */
  playbooks: Playbook[];
  /**
   * If true, render a compact button row that fits inside an Overview
   * card. If false, render a wider toolbar with explicit "CSV" and "JSON"
   * labels that fits inside the `/top-10` Progress card.
   */
  compact?: boolean;
  /** Optional label override for the testid / aria labels. */
  label?: string;
}

export function Top10ExportButton({
  status,
  playbooks,
  compact = false,
  label = "Top 10 shipped — export",
}: Top10ExportButtonProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShipped());
    setHydrated(true);
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ map: ShippedMap }>;
      if (ce.detail && ce.detail.map) setShipped(ce.detail.map);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setShipped(loadShipped());
    };
    window.addEventListener(UPDATE_EVENT, onUpdate as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onUpdate as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const headers = useMemo(
    () => [
      "rank",
      "move",
      "move_id",
      "shipped_at",
      "playbook_slug",
      "playbook_title",
      "playbook_href",
      "canonical_shipped",
      "canonical_pending",
    ],
    [],
  );

  const rows = useMemo(
    () => buildRows(status, playbooks, shipped),
    [status, playbooks, shipped],
  );

  const csvText = useMemo(() => rowsToCsv(headers, rows), [headers, rows]);
  const jsonText = useMemo(
    () =>
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          source_key: STORAGE_KEY,
          move_count: rows.length,
          shipped_move_ids: Object.keys(shipped).filter((id) =>
            status.some((s) => moveIdFromStatus(s) === id),
          ),
          rows,
        },
        null,
        2,
      ) + "\n",
    [rows, shipped, status],
  );

  const filenameBase = `ecom-ops-top10-shipped-${isoDateStamp()}`;

  function onDownloadCsv() {
    downloadBlob(`${filenameBase}.csv`, "text/csv", csvText);
  }
  function onDownloadJson() {
    downloadBlob(`${filenameBase}.json`, "application/json", jsonText);
  }

  const isEmpty = rows.length === 0;
  const disabled = !hydrated || isEmpty;

  const title = isEmpty
    ? "Mark at least one move as shipped on /top-10 to enable export"
    : `Export my ${rows.length} shipped move${rows.length === 1 ? "" : "s"} as CSV / JSON`;

  return (
    <div
      data-testid="top10-export"
      className={
        compact
          ? "flex flex-wrap items-center gap-1.5 pt-1"
          : "flex flex-wrap items-center gap-2 pt-1"
      }
    >
      <button
        type="button"
        onClick={onDownloadCsv}
        disabled={disabled}
        aria-label={`${label} as CSV`}
        title={title}
        data-testid="top10-export-csv"
        className={
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors " +
          (disabled
            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground")
        }
      >
        <span aria-hidden="true">↓</span>
        <span>CSV</span>
      </button>
      <button
        type="button"
        onClick={onDownloadJson}
        disabled={disabled}
        aria-label={`${label} as JSON`}
        title={title}
        data-testid="top10-export-json"
        className={
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors " +
          (disabled
            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground")
        }
      >
        <span aria-hidden="true">↓</span>
        <span>JSON</span>
      </button>
      {!hydrated ? (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          hydrating…
        </span>
      ) : isEmpty ? (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          no shipped moves yet
        </span>
      ) : null}
    </div>
  );
}
