"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildMasterRolloutCalendar,
  masterRolloutCalendarToMarkdown,
  masterRolloutCalendarToIcs,
  ROLLOUT_CATALOG,
  RolloutMoveInputs,
  ScheduledRolloutMove,
} from "@/lib/master-rollout-calendar";
import type { YourStoreInputs } from "@/lib/your-store";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const YOUR_STORE_STORAGE_KEY = "ecom-ops:your-store:v1";

/**
 * One-click "Generate 90-day Master Rollout Calendar" button.
 *
 * Reads the operator's saved per-move calculator inputs from localStorage
 * (across all 9 launch-plan generators), sequences them in canonical
 * foundation → revenue → CRO → retention build order, detects Klaviyo /
 * Klaviyo-SMS / staff-constraint collisions, computes combined Year-1
 * ROI, and produces:
 *
 *   - **90-day gantt-style markdown** (paste into Linear / Notion /
 *     Google Docs / Slack)
 *   - **RFC 5545 .ics** (import into Google Calendar / Apple Calendar /
 *     Outlook — one all-day event per move, colored bands)
 *
 * Cross-tab sync: listens to the `storage` event so the calendar
 * re-computes when the operator edits a calculator in another tab.
 *
 * Mounted on `/master-rollout-calendar` next to the title.
 */

interface MasterRolloutCalendarButtonProps {
  /** Optional override start date (operator enters in the modal) */
  initialStartDate?: string;
  /** Optional override Your-store inputs (passed from page if read SSR-side) */
  initialYourStore?: YourStoreInputs | null;
}

export function MasterRolloutCalendarButton({
  initialStartDate,
  initialYourStore,
}: MasterRolloutCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadedMd, setDownloadedMd] = useState(false);
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  const [startDate, setStartDate] = useState<string>(
    () =>
      initialStartDate ?? new Date().toISOString().slice(0, 10)
  );
  const [savedYourStore, setSavedYourStore] =
    useState<YourStoreInputs | null>(initialYourStore ?? null);
  const [moveInputs, setMoveInputs] = useState<
    Record<string, RolloutMoveInputs | undefined>
  >({});

  // Hydrate on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const yRaw = window.localStorage.getItem(YOUR_STORE_STORAGE_KEY);
      if (yRaw) {
        const parsed = JSON.parse(yRaw);
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.aov === "number" &&
          typeof parsed.monthlyOrders === "number" &&
          typeof parsed.grossMargin === "number"
        ) {
          setSavedYourStore(parsed as YourStoreInputs);
        }
      }
    } catch {
      /* ignore */
    }

    // Pull each per-move calculator's saved state + compute its Year-1 ROI.
    const next: Record<string, RolloutMoveInputs> = {};
    for (const entry of ROLLOUT_CATALOG) {
      const raw = window.localStorage.getItem(entry.storageKey);
      if (!raw) {
        next[entry.id] = {
          id: entry.id,
          hasInputs: false,
          year1RoiRatio: 0,
          year1NetMarginUsd: 0,
          year1CostUsd: 0,
        };
        continue;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") continue;
        // Per-move ROI extraction. Each calculator exposes either
        // `roiRatio` or computed values; we fall through to defaults if
        // the schema doesn't carry the fields.
        const ratio = extractYear1Roi(parsed);
        const margin = extractYear1NetMargin(parsed);
        const cost = extractYear1Cost(parsed);
        if (ratio !== null && margin !== null && cost !== null) {
          next[entry.id] = {
            id: entry.id,
            hasInputs: true,
            year1RoiRatio: ratio,
            year1NetMarginUsd: margin,
            year1CostUsd: cost,
          };
        }
      } catch {
        /* ignore */
      }
    }
    setMoveInputs(next);
    setHydrated(true);
  }, []);

  // Cross-tab sync via `storage` event.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(ev: StorageEvent) {
      if (!ev.key) return;
      if (ev.key === YOUR_STORE_STORAGE_KEY) {
        try {
          if (ev.newValue) {
            const parsed = JSON.parse(ev.newValue);
            setSavedYourStore(parsed as YourStoreInputs);
          }
        } catch {
          /* ignore */
        }
      }
      // Per-move keys: re-hydrate by re-running the mount effect manually
      // (cheap — single localStorage pass per key).
      const entry = ROLLOUT_CATALOG.find((e) => e.storageKey === ev.key);
      if (entry) {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : null;
          if (parsed && typeof parsed === "object") {
            const ratio = extractYear1Roi(parsed);
            const margin = extractYear1NetMargin(parsed);
            const cost = extractYear1Cost(parsed);
            if (ratio !== null && margin !== null && cost !== null) {
              setMoveInputs((prev) => ({
                ...prev,
                [entry.id]: {
                  id: entry.id,
                  hasInputs: true,
                  year1RoiRatio: ratio,
                  year1NetMarginUsd: margin,
                  year1CostUsd: cost,
                },
              }));
            }
          }
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const payload = useMemo(() => {
    return buildMasterRolloutCalendar(startDate, savedYourStore, moveInputs);
  }, [startDate, savedYourStore, moveInputs]);

  // Escape + backdrop close.
  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(masterRolloutCalendarToMarkdown(payload))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleDownloadMd() {
    if (typeof window === "undefined") return;
    const blob = new Blob([masterRolloutCalendarToMarkdown(payload)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-rollout-calendar-${startDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedMd(true);
    setTimeout(() => setDownloadedMd(false), 2000);
  }

  function handleDownloadIcs() {
    if (typeof window === "undefined") return;
    const blob = new Blob([masterRolloutCalendarToIcs(payload)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-rollout-calendar-${startDate}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90"
        )}
      >
        <span aria-hidden>▦</span>
        <span>Generate 90-day Master Rollout Calendar</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="master-rollout-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2
                  id="master-rollout-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  90-day Master Rollout Calendar
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sequenced across all {payload.snapshot.movesCount} per-move launch-plan generators.{" "}
                  {payload.snapshot.movesWithInputsCount} with saved calculator inputs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Snapshot block */}
              <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <SnapshotTile
                  label="Combined Year-1 ROI"
                  value={`${payload.snapshot.combinedYear1RoiRatio.toFixed(1)}:1`}
                  sub={payload.snapshot.combinedHealthBand}
                />
                <SnapshotTile
                  label="Combined net margin"
                  value={formatUsd(payload.snapshot.combinedYear1NetMarginUsd)}
                  sub={`across ${payload.snapshot.movesCount} moves`}
                />
                <SnapshotTile
                  label="Combined cost"
                  value={formatUsd(payload.snapshot.combinedYear1CostUsd)}
                  sub="Year-1 send + tooling cost"
                />
                <SnapshotTile
                  label="With saved inputs"
                  value={`${payload.snapshot.movesWithInputsCount}/${payload.snapshot.movesCount}`}
                  sub="rest use industry defaults"
                />
              </section>

              {/* Start-date picker */}
              <section className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-border bg-muted/30 px-4 py-3">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-muted-foreground">
                    Day-1 start date
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(ev) => setStartDate(ev.target.value)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Window: <strong>{payload.snapshot.startDate}</strong> →{" "}
                  <strong>{payload.snapshot.endDate}</strong> (90 days)
                </span>
              </section>

              {/* Collisions */}
              {payload.collisions.length > 0 && (
                <section className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Collisions detected ({payload.collisions.length})
                  </h3>
                  <ul className="flex flex-col gap-2 text-xs">
                    {payload.collisions.map((c, i) => (
                      <li
                        key={i}
                        className={cn(
                          "rounded-md border px-3 py-2",
                          c.severity === "block"
                            ? "border-red-500/40 bg-red-500/5"
                            : c.severity === "warn"
                            ? "border-amber-500/40 bg-amber-500/5"
                            : "border-emerald-500/40 bg-emerald-500/5"
                        )}
                      >
                        <strong className="uppercase">
                          [{c.severity}] Week {c.week}
                        </strong>{" "}
                        ({c.weekStartDate} → {c.weekEndDate}) —{" "}
                        <span className="text-muted-foreground">
                          {c.kind}
                        </span>
                        : {c.message}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Gantt-style timeline */}
              <section className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeline
                </h3>
                <div className="flex flex-col gap-2">
                  {payload.moves.map((m) => (
                    <TimelineRow key={m.id} move={m} startDate={startDate} />
                  ))}
                </div>
              </section>

              {/* Phase groupings — checklist */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Day-by-day checklist (paste into Linear / Notion / Slack)
                </h3>
                <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed">
                  {masterRolloutCalendarToMarkdown(payload)}
                </pre>
              </section>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-6 py-3">
              <span className="text-xs text-muted-foreground">
                {hydrated
                  ? `Snapshot from ${payload.snapshot.generatedAt.slice(0, 16).replace("T", " ")} UTC`
                  : "Hydrating…"}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {copied ? "✓ Copied" : "Copy markdown"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMd}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {downloadedMd ? "✓ Saved" : "Download .md"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {downloadedIcs ? "✓ Saved" : "Download .ics"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90"
                >
                  Done
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────

function SnapshotTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function TimelineRow({
  move,
  startDate,
}: {
  move: ScheduledRolloutMove;
  startDate: string;
}) {
  const widthPct = ((move.endDay - move.startDay + 1) / 90) * 100;
  const offsetPct = ((move.startDay - 1) / 90) * 100;
  const phaseColors: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-sky-500",
    3: "bg-amber-500",
    4: "bg-violet-500",
  };
  const startYmd = ymdAddDays(startDate, move.startDay - 1);
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-44 flex-shrink-0 truncate font-medium">
        Move {move.moveRef}: {move.title.split(" (")[0]}
      </div>
      <div className="relative h-5 flex-1 rounded-full bg-muted">
        <div
          className={cn(
            "absolute top-0 h-5 rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm",
            phaseColors[move.buildPhase]
          )}
          style={{
            left: `${offsetPct}%`,
            width: `${widthPct}%`,
            minWidth: "60px",
          }}
          title={`${startYmd} (Day ${move.startDay}) → Day ${move.endDay}`}
        >
          <span className="flex h-full items-center justify-center truncate">
            Days {move.startDay}–{move.endDay}
          </span>
        </div>
      </div>
      <div className="w-32 flex-shrink-0 text-right font-mono text-[11px] text-muted-foreground">
        {move.inputs?.hasInputs
          ? `${move.inputs.year1RoiRatio.toFixed(1)}:1`
          : `${move.defaultYear1RoiRatio.toFixed(1)}:1 (default)`}
      </div>
    </div>
  );
}

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────
// Per-move ROI extraction — the calculators store different fields,
// so we read the most common names and fall through to the catalog
// defaults if not present.
// ─────────────────────────────────────────────────────────────────

function extractYear1Roi(parsed: Record<string, unknown>): number | null {
  if (typeof parsed.roiRatio === "number") return parsed.roiRatio;
  if (typeof parsed.year1RoiRatio === "number") return parsed.year1RoiRatio;
  if (
    typeof parsed.netRevenuePerYear === "number" &&
    typeof parsed.totalCostPerYear === "number" &&
    parsed.totalCostPerYear > 0
  ) {
    return parsed.netRevenuePerYear / parsed.totalCostPerYear;
  }
  return null;
}

function extractYear1NetMargin(
  parsed: Record<string, unknown>
): number | null {
  if (typeof parsed.year1NetMarginUsd === "number")
    return parsed.year1NetMarginUsd;
  if (
    typeof parsed.netRevenuePerYear === "number" &&
    typeof parsed.grossMargin === "number"
  ) {
    return parsed.netRevenuePerYear * parsed.grossMargin;
  }
  if (typeof parsed.netRevenuePerYear === "number") {
    return parsed.netRevenuePerYear;
  }
  return null;
}

function extractYear1Cost(parsed: Record<string, unknown>): number | null {
  if (typeof parsed.year1CostUsd === "number") return parsed.year1CostUsd;
  if (typeof parsed.totalCostPerYear === "number")
    return parsed.totalCostPerYear;
  return null;
}