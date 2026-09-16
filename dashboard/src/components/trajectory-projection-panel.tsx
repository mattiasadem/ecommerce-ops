"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  projectTrajectory,
  TRAJECTORY_FORMATTERS,
  TRAJECTORY_HORIZON_MONTHS,
  type TrajectoryProjection,
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
import { CopyButton } from "@/components/copy-button";
import { TrajectoryExportButton } from "@/components/trajectory-export-button";
import { cn } from "@/lib/utils";

/**
 * `Trajectory projection` — 12-month revenue curve on `/` (and `/today`).
 *
 * Cross-page-intelligence + interactive-tool that answers the operator's
 * "what does my next year look like?" question. Reads Your-store (AOV /
 * monthly orders / gross margin) + shipped-playbooks from the canonical
 * shared keys, computes a per-month revenue + cost curve based on the
 * phased rollout of every remaining Top-10 move, and renders:
 *
 *   - 4 stat tiles (Year-1 lift band · peak-month revenue · Year-1 ROI
 *     band · moves shipped by month 12)
 *   - 12-month bar chart with baseline + lift-band bars per month
 *   - Per-month hover detail (which moves ship that month + cumulative
 *     lift contributed)
 *   - Per-month "what ships" row underneath each bar
 *   - Copy-to-clipboard Markdown summary for handoff to the team
 *
 * Edge cases handled:
 *   - All moves shipped → flat baseline curve; "every move already shipped"
 *     message.
 *   - Your-store never set → defaults render with a
 *     "Defaults · edit on Overview to personalize" chip.
 *   - `monthlyRevenue = 0` → zero-curve (no NaN, no "Infinity:1" leak).
 *   - Cross-tab sync via `storage` event.
 *   - All 12 months on a single row (mobile-friendly via horizontal
 *     overflow fallback below the chart row).
 *
 * Math lives in `dashboard/src/lib/trajectory-projection.ts`. This
 * component is rendering + event-wiring only — every number on screen
 * is recomputed on every render, no caching layer between.
 */
export function TrajectoryPanel() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadYourStore();
    setStore(loaded);
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore());
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const projection: TrajectoryProjection | null = useMemo(
    () => (hydrated ? projectTrajectory(store, shipped) : null),
    [hydrated, store, shipped],
  );

  const { fmtMoney, fmtRoi } = TRAJECTORY_FORMATTERS;
  const storeForDisplay = store ?? YOUR_STORE_DEFAULTS;
  const usingDefaults = store === null && hydrated;
  const storePersonalized =
    typeof window !== "undefined" &&
    window.localStorage.getItem("ecom-ops:your-store:v1") !== null;

  // For the bar chart: each month's bar height = `month.revenueHigh / peakRevenue * 100%`.
  const peakRevenue = projection
    ? Math.max(
        projection.baselineMonthlyRevenue,
        ...projection.months.map((m) => m.revenueHigh),
      )
    : 0;

  // ROI tone for the headline tile.
  const roiTone =
    !projection
      ? "muted"
      : projection.year1RoiHigh >= 5
        ? "good"
        : projection.year1RoiHigh >= 2
          ? "fair"
          : "red-flag";

  return (
    <Card id="trajectory-projection" className="border-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-base">
              12-month revenue trajectory — your store
            </CardTitle>
            <CardDescription>
              {projection?.headline ?? "Computing trajectory…"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {storePersonalized ? (
              <Badge variant="success" className="text-[10px]">
                Your-store · live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Defaults · edit on Overview to personalize
              </Badge>
            )}
            {projection && projection.movesBeyondHorizon.length > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {projection.movesBeyondHorizon.length} moves roll past month 12
              </Badge>
            )}
            {projection && (
              <>
                <CopyButton
                  value={projection.summaryMarkdown}
                  label="Copy report"
                  className="text-[10px]"
                />
                <TrajectoryExportButton />
              </>
            )}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono pt-1">
          AOV {fmtMoney(storeForDisplay.aov)} ×{" "}
          {storeForDisplay.monthlyOrders.toLocaleString("en-US")} orders/mo ×{" "}
          {(storeForDisplay.grossMargin * 100).toFixed(0)}% margin ={" "}
          <span className="text-foreground">
            {fmtMoney(projection?.baselineMonthlyRevenue ?? 0)}/mo
          </span>{" "}
          baseline
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {!projection ? (
          <p className="text-sm text-muted-foreground">
            Loading trajectory…
          </p>
        ) : projection.months.every((m) => m.revenueHigh === projection.baselineMonthlyRevenue) ? (
          <EmptyTrajectory projection={projection} />
        ) : (
          <>
            {/* === STAT TILES === */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile
                label="Year-1 incremental lift"
                value={`${fmtMoney(projection.year1LiftLow)}-${fmtMoney(projection.year1LiftHigh)}`}
                sub={`On top of ${fmtMoney(projection.baselineAnnualRevenue)} baseline`}
                tone="accent"
              />
              <StatTile
                label="Peak monthly revenue"
                value={fmtMoney(projection.months[TRAJECTORY_HORIZON_MONTHS - 1].revenueHigh)}
                sub={`By month 12 · ${fmtMoney(projection.months[TRAJECTORY_HORIZON_MONTHS - 1].revenueLow)} low end`}
                tone="accent"
              />
              <StatTile
                label="Year-1 ROI"
                value={`${fmtRoi(projection.year1RoiLow)} – ${fmtRoi(projection.year1RoiHigh)}`}
                sub="Year-1 lift ÷ Year-1 cost (high side)"
                tone={roiTone}
              />
              <StatTile
                label="Moves shipped by M12"
                value={`${projection.movesOnHorizon.length + projection.movesAlreadyShipped}`}
                sub={`${projection.movesAlreadyShipped} already · ${projection.movesOnHorizon.length} phased in`}
                tone="muted"
              />
            </div>

            {/* === 12-MONTH BAR CHART === */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Monthly revenue (low · high) — peak {fmtMoney(peakRevenue)}/mo
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  Hover a bar for the moves that ship that month
                </span>
              </div>
              <div
                className="grid grid-cols-12 gap-1.5 items-end h-32"
                role="img"
                aria-label={`12-month revenue trajectory; baseline ${fmtMoney(projection.baselineMonthlyRevenue)} per month, peaking at ${fmtMoney(projection.months[TRAJECTORY_HORIZON_MONTHS - 1].revenueHigh)} by month 12.`}
              >
                {projection.months.map((m) => {
                  const lowPct = peakRevenue > 0 ? (m.revenueLow / peakRevenue) * 100 : 0;
                  const highPct = peakRevenue > 0 ? (m.revenueHigh / peakRevenue) * 100 : 0;
                  const isHovered = hoveredMonth === m.month;
                  return (
                    <button
                      key={m.month}
                      type="button"
                      onMouseEnter={() => setHoveredMonth(m.month)}
                      onMouseLeave={() =>
                        setHoveredMonth((cur) => (cur === m.month ? null : cur))
                      }
                      onFocus={() => setHoveredMonth(m.month)}
                      onBlur={() =>
                        setHoveredMonth((cur) => (cur === m.month ? null : cur))
                      }
                      className="group relative flex h-full flex-col items-stretch justify-end gap-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Month ${m.month}: revenue ${fmtMoney(m.revenueLow)} to ${fmtMoney(m.revenueHigh)}, ${m.movesShippedThisMonth.length > 0 ? `ships: ${m.movesShippedThisMonth.join(", ")}` : "no new ships"}.`}
                    >
                      {/* Lift band (high minus low) sits on top — accent color. */}
                      <div
                        className={cn(
                          "w-full transition-colors",
                          isHovered ? "bg-accent" : "bg-accent/40",
                        )}
                        style={{ height: `${Math.max(0, highPct - lowPct)}%` }}
                      />
                      {/* Baseline floor sits at the bottom — foreground color. */}
                      <div
                        className={cn(
                          "w-full transition-colors",
                          isHovered ? "bg-foreground" : "bg-foreground/70",
                        )}
                        style={{ height: `${lowPct}%` }}
                      />
                      <span
                        className={cn(
                          "mt-1 text-[9px] tabular-nums text-center transition-colors",
                          isHovered ? "text-foreground font-medium" : "text-muted-foreground",
                        )}
                      >
                        M{m.month}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hover detail strip */}
              <Separator className="my-3" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailBlock
                  label="Baseline revenue / mo"
                  value={fmtMoney(projection.baselineMonthlyRevenue)}
                  tone="muted"
                />
                <DetailBlock
                  label={
                    hoveredMonth === null
                      ? "Peak monthly revenue"
                      : `Month ${hoveredMonth} revenue (low–high)`
                  }
                  value={
                    hoveredMonth === null
                      ? fmtMoney(projection.months[TRAJECTORY_HORIZON_MONTHS - 1].revenueHigh)
                      : `${fmtMoney(projection.months[hoveredMonth - 1].revenueLow)} – ${fmtMoney(projection.months[hoveredMonth - 1].revenueHigh)}`
                  }
                  tone="accent"
                />
                <DetailBlock
                  label={
                    hoveredMonth === null
                      ? "Total moves shipped by M12"
                      : `Ships in month ${hoveredMonth}`
                  }
                  value={
                    hoveredMonth === null
                      ? `${projection.movesOnHorizon.length + projection.movesAlreadyShipped} of ${projection.totalMoves}`
                      : projection.months[hoveredMonth - 1].movesShippedThisMonth.length > 0
                        ? projection.months[hoveredMonth - 1].movesShippedThisMonth.join(", ")
                        : "—"
                  }
                  tone="muted"
                />
              </div>
            </div>

            {/* === MONTH TABLE === */}
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Month</th>
                    <th className="px-3 py-2 text-right font-medium">Revenue (low–high)</th>
                    <th className="px-3 py-2 text-right font-medium">Monthly cost</th>
                    <th className="px-3 py-2 text-right font-medium">Cumulative moves</th>
                    <th className="px-3 py-2 text-left font-medium">Ships this month</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.months.map((m) => (
                    <tr
                      key={m.month}
                      className={cn(
                        "border-t border-border transition-colors",
                        hoveredMonth === m.month ? "bg-muted/40" : "hover:bg-muted/20",
                      )}
                      onMouseEnter={() => setHoveredMonth(m.month)}
                      onMouseLeave={() =>
                        setHoveredMonth((cur) => (cur === m.month ? null : cur))
                      }
                    >
                      <td className="px-3 py-2 font-mono text-muted-foreground tabular-nums">
                        M{m.month}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmtMoney(m.revenueLow)}–{fmtMoney(m.revenueHigh)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {fmtMoney(m.costLow)}–{fmtMoney(m.costHigh)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {m.movesShippedCumulative + projection.movesAlreadyShipped} / {projection.totalMoves}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {m.movesShippedThisMonth.length > 0
                          ? m.movesShippedThisMonth.join(", ")
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Bars show low–high revenue bands per month (foreground = baseline floor, accent = lift band up to high end). Ship-month for each Top-10 move = <code className="rounded bg-muted px-1 py-0.5">ceil(cumulative days-to-ship ÷ 30)</code>, clamped to month 12. Moves whose total cumulative days exceed 360 days roll past month 12 (they still contribute from month 12 in this chart; their full lifetime lift lands in Year-2+). Costs are summed HIGH side (operator realistically budgets the upper band). Cross-page with Your-store + Top-10 shipped + Top-10 projection. Math lives in{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                dashboard/src/lib/trajectory-projection.ts
              </code>
              .
            </p>
          </>
        )}

        {projection && usingDefaults && (
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            Showing the canonical DTC median ($75 AOV · 1,000 orders · 70% margin). Edit{" "}
            <a className="underline hover:text-foreground" href="/#your-store">
              Your-store
            </a>{" "}
            to see your own numbers.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Small inline helpers — kept local so we don't bloat shared component lib.
function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "accent" | "muted" | "good" | "fair" | "red-flag";
}) {
  const toneClass =
    tone === "accent"
      ? "text-foreground"
      : tone === "good"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "fair"
          ? "text-amber-600 dark:text-amber-400"
          : tone === "red-flag"
            ? "text-rose-600 dark:text-rose-400"
            : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-lg font-semibold tabular-nums leading-tight", toneClass)}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground leading-snug">
        {sub}
      </span>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "accent";
}) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-medium tabular-nums leading-snug",
          tone === "accent" ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyTrajectory({ projection }: { projection: TrajectoryProjection }) {
  const { fmtMoney } = TRAJECTORY_FORMATTERS;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground space-y-2">
      <p className="font-medium text-foreground">
        Every Top-10 move is already shipped.
      </p>
      <p>
        Your 12-month revenue trajectory is flat at{" "}
        <span className="text-foreground font-medium tabular-nums">
          {fmtMoney(projection.baselineMonthlyRevenue)}/mo
        </span>{" "}
        ({fmtMoney(projection.baselineAnnualRevenue)}/yr baseline). The
        queued moves in /top-10 are zero — branch into Move #11+ (affiliate
        / B2B / international) for incremental lift.
      </p>
      <a
        className="inline-block text-xs underline hover:text-foreground"
        href="/top-10"
      >
        Open the Top-10 queue →
      </a>
    </div>
  );
}
