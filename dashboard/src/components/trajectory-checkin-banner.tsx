"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  projectTrajectory,
  TRAJECTORY_FORMATTERS,
  TRAJECTORY_HORIZON_MONTHS,
} from "@/lib/trajectory-projection";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import {
  TRAJECTORY_CHECKINS_STORAGE_KEY,
  TRAJECTORY_CHECKINS_UPDATE_EVENT,
  TRAJECTORY_CHECKINS_COMPARE_WINDOW_DAYS,
  TRAJECTORY_CHECKINS_REMINDER_DAYS,
  TrajectoryCheckin,
  TrajectoryCheckinPayload,
  addTrajectoryCheckin,
  checkinWithinCompareWindow,
  computeCheckinDelta,
  daysSinceCheckin,
  deleteTrajectoryCheckin,
  fmtCheckinDate,
  fmtCheckinRelative,
  latestCheckin,
  loadTrajectoryCheckins,
  shouldShowReminder,
} from "@/lib/trajectory-checkin";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `Trajectory check-in` — quarterly review banner + history panel.
 *
 * Companion to Move #6.16's `TrajectoryPanel`. Closes the operator's
 * "when did I last look at this curve?" engagement loop.
 *
 * Behavior:
 *   - **Reminder banner** surfaces on `/` and `/today` when
 *     `daysSinceLatestCheckin >= 30` OR no check-in has ever been
 *     recorded. Click "Save current trajectory" → append a snapshot
 *     and update the "vs 30d ago" delta.
 *   - **Delta strip** appears beneath the reminder when a check-in
 *     within the comparison window (≤30d ago) exists: "vs {date}:
 *     peak revenue {Δ +/-} · Year-1 lift {Δ +/-} · {Δ} new moves
 *     shipped · AOV {Δ%}".
 *   - **History drawer** (always available below the panel) lists the
 *     last N check-ins newest-first; each row deep-links to a delete
 *     button. Operators can clear all check-ins with one click.
 *
 * Reads the same canonical localStorage keys as the panel:
 *   - `ecom-ops:your-store:v1`
 *   - `ecom-ops:shipped-playbooks:v1`
 *
 * Cross-tab sync via `storage` event + same-tab custom event
 * `ecom-ops:trajectory-checkins:update` so all open tabs see new
 * check-ins without a reload.
 *
 * `compact` variant for `/today` mount (smaller banner row);
 * the full variant for the `/` mount.
 */
export interface TrajectoryCheckinBannerProps {
  /** When true, render a tighter banner row sized for the `/today` mount. */
  compact?: boolean;
}

export function TrajectoryCheckinBanner({
  compact = false,
}: TrajectoryCheckinBannerProps) {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [payload, setPayload] = useState<TrajectoryCheckinPayload>({
    schema: "ecom-ops-trajectory-checkins",
    version: 1,
    checkins: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Hydrate on mount + subscribe to cross-tab/same-tab updates.
  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setPayload(loadTrajectoryCheckins());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore());
      } else if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      } else if (e.key === TRAJECTORY_CHECKINS_STORAGE_KEY) {
        setPayload(loadTrajectoryCheckins());
      }
    };
    const onCustom = () => setPayload(loadTrajectoryCheckins());
    window.addEventListener("storage", onStorage);
    window.addEventListener(TRAJECTORY_CHECKINS_UPDATE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TRAJECTORY_CHECKINS_UPDATE_EVENT, onCustom);
    };
  }, []);

  const projection = useMemo(
    () => (hydrated ? projectTrajectory(store, shipped) : null),
    [hydrated, store, shipped],
  );

  // Server-side / pre-hydration: render a muted placeholder so the
  // component shape doesn't pop in late.
  if (!hydrated || !projection) {
    return (
      <div
        data-testid="trajectory-checkin-placeholder"
        className={cn(
          "text-[10px] text-muted-foreground italic",
          compact ? "py-1" : "py-2",
        )}
      >
        Loading trajectory check-in state…
      </div>
    );
  }

  const { fmtMoney } = TRAJECTORY_FORMATTERS;
  const latest = latestCheckin(payload);
  const days = daysSinceCheckin(latest ?? undefined);
  const showReminder = shouldShowReminder(payload);

  // Delta vs the most-recent check-in older than the compare window — the
  // canonical "vs last quarter" baseline. Falls back to the latest
  // snapshot when no within-window entry exists.
  const compareCandidate =
    checkinWithinCompareWindow(payload) ?? latest ?? null;

  const current = {
    aov: store?.aov ?? YOUR_STORE_DEFAULTS.aov,
    monthlyOrders: store?.monthlyOrders ?? YOUR_STORE_DEFAULTS.monthlyOrders,
    baselineMonthlyRevenue: projection.baselineMonthlyRevenue,
    peakRevenueHigh:
      projection.months[TRAJECTORY_HORIZON_MONTHS - 1].revenueHigh,
    year1LiftHigh: projection.year1LiftHigh,
    movesShippedCumulative: projection.movesAlreadyShipped,
  };
  const delta = compareCandidate
    ? computeCheckinDelta(current, compareCandidate)
    : null;

  const handleSave = () => {
    const next = addTrajectoryCheckin({
      store: {
        aov: current.aov,
        monthlyOrders: current.monthlyOrders,
        grossMargin: store?.grossMargin ?? YOUR_STORE_DEFAULTS.grossMargin,
      },
      baselineMonthlyRevenue: current.baselineMonthlyRevenue,
      peakRevenueHigh: current.peakRevenueHigh,
      year1LiftLow: projection.year1LiftLow,
      year1LiftHigh: projection.year1LiftHigh,
      movesShippedCumulative: current.movesShippedCumulative,
      totalMoves: projection.totalMoves,
    });
    setPayload(next);
    setJustSaved(true);
    // Clear the "saved" badge after a few seconds so the user sees
    // confirmation but it doesn't linger.
    window.setTimeout(() => setJustSaved(false), 3500);
  };

  const handleDelete = (id: string) => {
    const next = deleteTrajectoryCheckin(id);
    setPayload(next);
  };

  // Don't render anything if no reminder needed AND no history yet —
  // a fresh visitor has nothing to act on. Once they save the first
  // snapshot, the panel stays visible (so they can review history).
  if (payload.checkins.length === 0 && !showReminder) {
    return null;
  }

  // Variant A: nothing recorded yet — soft invitation card.
  if (payload.checkins.length === 0) {
    return (
      <Card
        id="trajectory-checkin"
        className="border-dashed border-2 border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/20"
      >
        <CardContent
          className={cn(
            "flex flex-wrap items-center gap-3",
            compact ? "py-3" : "py-4",
          )}
        >
          <div className="flex-1 min-w-[200px] space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                📅 First check-in
              </Badge>
              <span className="text-xs font-medium">
                Save your trajectory snapshot
              </span>
            </div>
            <p
              data-testid="trajectory-checkin-prompt"
              className="text-[10px] text-muted-foreground leading-relaxed"
            >
              Capture the current curve now; revisit every 30 days to see how
              peak revenue, Year-1 lift, and shipped moves trend over time.
              No history yet — your first snapshot starts the baseline.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            data-testid="trajectory-checkin-save"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            Save current trajectory
          </button>
        </CardContent>
      </Card>
    );
  }

  // Variant B: at least one snapshot — reminder banner + delta + history.
  return (
    <Card
      id="trajectory-checkin"
      className={cn(
        "border-2",
        showReminder
          ? "border-amber-300/70 bg-amber-50/40 dark:bg-amber-950/20"
          : "border-border",
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-3",
          compact ? "py-3" : "py-4",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                Trajectory check-in
              </span>
              {showReminder ? (
                <Badge
                  variant="outline"
                  className="text-[10px] border-amber-400/60 text-amber-700 dark:text-amber-300"
                >
                  📅{" "}
                  {days === null
                    ? "Reminder"
                    : `${days}d since last check-in`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  {days === null
                    ? "Latest"
                    : `${days}d since last check-in`}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {payload.checkins.length} snapshot
                {payload.checkins.length === 1 ? "" : "s"} on file
              </Badge>
              {justSaved && (
                <Badge
                  variant="success"
                  className="text-[10px]"
                  data-testid="trajectory-checkin-saved-toast"
                >
                  ✓ Saved
                </Badge>
              )}
            </div>
            <p
              data-testid="trajectory-checkin-prompt"
              className="text-[10px] text-muted-foreground leading-relaxed"
            >
              {showReminder
                ? `It's been ${days ?? "30+"} days since the last snapshot — capture the current curve to refresh the rolling comparison.`
                : `Last snapshot ${fmtCheckinRelative(latest!.at)} (${fmtCheckinDate(latest!.at)}). Reminder threshold: every ${TRAJECTORY_CHECKINS_REMINDER_DAYS}d.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              data-testid="trajectory-checkin-save"
              className={cn(
                "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                showReminder
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "border border-border bg-background hover:bg-muted",
              )}
            >
              {showReminder ? "Save current trajectory" : "Save snapshot"}
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              data-testid="trajectory-checkin-history-toggle"
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {historyOpen
                ? "Hide history"
                : `History (${payload.checkins.length})`}
            </button>
          </div>
        </div>

        {delta && compareCandidate && (
          <>
            <Separator />
            <div
              className="grid grid-cols-2 gap-2 lg:grid-cols-5"
              data-testid="trajectory-checkin-delta"
            >
              <DeltaTile
                label="Peak revenue"
                current={fmtMoney(current.peakRevenueHigh)}
                prior={fmtMoney(compareCandidate.peakRevenueHigh)}
                delta={fmtMoney(delta.peakRevenueDelta)}
                tone={deltaTone(delta.peakRevenueDelta)}
                testid="trajectory-checkin-delta-peak"
              />
              <DeltaTile
                label="Year-1 lift"
                current={fmtMoney(current.year1LiftHigh)}
                prior={fmtMoney(compareCandidate.year1LiftHigh)}
                delta={fmtMoney(delta.year1LiftDelta)}
                tone={deltaTone(delta.year1LiftDelta)}
                testid="trajectory-checkin-delta-lift"
              />
              <DeltaTile
                label="Baseline / mo"
                current={fmtMoney(current.baselineMonthlyRevenue)}
                prior={fmtMoney(compareCandidate.baselineMonthlyRevenue)}
                delta={fmtMoney(delta.baselineRevenueDelta)}
                tone={deltaTone(delta.baselineRevenueDelta, true)}
                testid="trajectory-checkin-delta-baseline"
              />
              <DeltaTile
                label="Moves shipped"
                current={String(current.movesShippedCumulative)}
                prior={String(compareCandidate.movesShippedCumulative)}
                delta={signedInt(delta.movesDelta)}
                tone={deltaTone(delta.movesDelta)}
                testid="trajectory-checkin-delta-moves"
              />
              <DeltaTile
                label="AOV"
                current={fmtMoney(current.aov)}
                prior={fmtMoney(compareCandidate.aov)}
                delta={`${delta.aovDeltaPct >= 0 ? "+" : ""}${delta.aovDeltaPct.toFixed(1)}%`}
                tone={deltaTone(delta.aovDeltaPct, true)}
                testid="trajectory-checkin-delta-aov"
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Comparing against snapshot {fmtCheckinDate(compareCandidate.at)}{" "}
              ({fmtCheckinRelative(compareCandidate.at)}
              {delta.daysAgo >= TRAJECTORY_CHECKINS_COMPARE_WINDOW_DAYS
                ? `, ${delta.daysAgo}d ago`
                : " — most recent within the 30d comparison window"}
              ).
            </p>
          </>
        )}

        {historyOpen && payload.checkins.length > 0 && (
          <HistoryTable
            checkins={payload.checkins}
            onDelete={handleDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHistoryMarkdown(checkins: TrajectoryCheckin[]): string {
  const { fmtMoney } = TRAJECTORY_FORMATTERS;
  if (checkins.length === 0) return "_No trajectory check-ins recorded yet._";
  const lines: string[] = [];
  lines.push("## Trajectory check-in history");
  lines.push("");
  for (const c of checkins) {
    lines.push(
      `- **${fmtCheckinDate(c.at)}** — AOV $${c.aov.toLocaleString("en-US")} · ${c.monthlyOrders.toLocaleString("en-US")} orders/mo · ${Math.round(c.grossMargin * 100)}% margin · baseline ${fmtMoney(c.baselineMonthlyRevenue)}/mo · peak ${fmtMoney(c.peakRevenueHigh)} · Year-1 lift ${fmtMoney(c.year1LiftLow)}–${fmtMoney(c.year1LiftHigh)} · ${c.movesShippedCumulative}/${c.totalMoves} moves`,
    );
  }
  return lines.join("\n");
}

function deltaTone(delta: number, neutral = false): "good" | "bad" | "neutral" {
  if (neutral) return "neutral";
  if (delta > 0) return "good";
  if (delta < 0) return "bad";
  return "neutral";
}

function signedInt(n: number): string {
  if (n === 0) return "±0";
  return n > 0 ? `+${n}` : `${n}`;
}

interface DeltaTileProps {
  label: string;
  current: string;
  prior: string;
  delta: string;
  tone: "good" | "bad" | "neutral";
  testid: string;
}

function DeltaTile({ label, current, prior, delta, tone, testid }: DeltaTileProps) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "bad"
        ? "text-rose-600 dark:text-rose-400"
        : "text-muted-foreground";
  return (
    <div
      data-testid={testid}
      className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1"
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold tabular-nums leading-tight">
        {current}
      </span>
      <span className="text-[10px] text-muted-foreground leading-snug tabular-nums">
        was {prior}
      </span>
      <span className={cn("text-[10px] tabular-nums font-medium", toneClass)}>
        {delta}
      </span>
    </div>
  );
}

interface HistoryTableProps {
  checkins: TrajectoryCheckin[];
  onDelete: (id: string) => void;
}

function HistoryTable({ checkins, onDelete }: HistoryTableProps) {
  const { fmtMoney } = TRAJECTORY_FORMATTERS;
  return (
    <div
      data-testid="trajectory-checkin-history"
      className="rounded-lg border border-border bg-card overflow-x-auto"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          History ({checkins.length} snapshot
          {checkins.length === 1 ? "" : "s"})
        </span>
        <CopyButton
          value={buildHistoryMarkdown(checkins)}
          label="Copy history"
          className="text-[10px]"
        />
      </div>
      <table className="w-full text-xs">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Saved</th>
            <th className="px-3 py-2 text-right font-medium">AOV</th>
            <th className="px-3 py-2 text-right font-medium">Orders / mo</th>
            <th className="px-3 py-2 text-right font-medium">Margin</th>
            <th className="px-3 py-2 text-right font-medium">Baseline</th>
            <th className="px-3 py-2 text-right font-medium">Peak</th>
            <th className="px-3 py-2 text-right font-medium">Year-1 lift</th>
            <th className="px-3 py-2 text-right font-medium">Moves</th>
            <th className="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {checkins.map((c) => (
            <tr
              key={c.id}
              className="border-t border-border hover:bg-muted/30"
              data-testid={`trajectory-checkin-row-${c.id}`}
            >
              <td className="px-3 py-2">
                <div className="font-medium">{fmtCheckinDate(c.at)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtCheckinRelative(c.at)}
                </div>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {fmtMoney(c.aov)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {c.monthlyOrders.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {Math.round(c.grossMargin * 100)}%
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {fmtMoney(c.baselineMonthlyRevenue)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {fmtMoney(c.peakRevenueHigh)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {fmtMoney(c.year1LiftLow)}–{fmtMoney(c.year1LiftHigh)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {c.movesShippedCumulative} / {c.totalMoves}
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  aria-label={`Delete check-in from ${fmtCheckinDate(c.at)}`}
                  data-testid={`trajectory-checkin-delete-${c.id}`}
                >
                  delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}