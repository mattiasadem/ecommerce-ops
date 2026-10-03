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
import { CopyButton } from "@/components/copy-button";
import {
  buildMoveDifficultyImpactMap,
  type MoveDifficultyImpactMap as MapResult,
  renderDifficultyImpactMarkdown,
} from "@/lib/move-difficulty-impact";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { loadShippedPlaybooks, ShippedMap } from "@/lib/shipped-playbooks";
import { formatUsd, formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `Move difficulty × impact map` — 2D bubble chart on `/top-10`.
 *
 * Complements the existing per-move Top-10 projection by showing ALL
 * 10 Top-10 moves at once on a single visual, with three encoded
 * dimensions:
 *
 *   X axis  = days-to-ship (calendar cost)
 *   Y axis  = projected $ lift per month (personalized to Your-store)
 *   bubble  = $/month operator cost (high side)
 *   color   = status: shipped (green) / eligible (blue) / blocked (amber)
 *
 * Below the chart sits the "blocker chain" banner — the move that, if
 * shipped next, unblocks the most downstream moves. The math lives in
 * `src/lib/move-difficulty-impact.ts`; this component is rendering +
 * event-wiring only.
 *
 * Why a 2D chart vs a table: an operator with 7-10 unshipped moves
 * needs a SINGLE GLANCE answer to "what's the next 2-3 weeks look
 * like?" — not a sortable table. Bubble chart compresses 4 dimensions
 * (status, difficulty, lift, cost) into one visual.
 *
 * Storage:
 *   - Reads `ecom-ops:your-store:v1` (shared with all calculators)
 *   - Reads `ecom-ops:shipped-playbooks:v1` (shared with shipped tracker)
 *   - Stores NO additional local state — single source of truth.
 *
 * Edge cases:
 *   - 0 unshipped moves → "all shipped" card; no chart.
 *   - All moves prereq-blocked → all bubbles amber; no blocker chain
 *     recommendation (the recommended-action falls back to the highest
 *     priority prereq-blocked move's missing prereq).
 *   - Your-store never set → defaults render with "Defaults · edit
 *     on Overview" chip.
 *   - Cross-tab sync via `storage` event.
 *
 * Why pure SVG instead of a chart library: no new dependency, the
 * chart is small (10 dots), and pure SVG keeps the bundle under
 * control. d3 / recharts would be overkill for 10 circles + axes.
 */

const STORAGE_KEY_YOUR_STORE = "ecom-ops:your-store:v1";
const STORAGE_KEY_SHIPPED = "ecom-ops:shipped-playbooks:v1";

const STATUS_STYLES: Record<
  "shipped" | "eligible" | "prereq-blocked",
  { dot: string; text: string; label: string; ring: string }
> = {
  shipped: {
    dot: "fill-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "shipped",
    ring: "stroke-emerald-500",
  },
  eligible: {
    dot: "fill-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    label: "eligible",
    ring: "stroke-blue-500",
  },
  "prereq-blocked": {
    dot: "fill-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    label: "blocked",
    ring: "stroke-amber-500",
  },
};

export function MoveDifficultyImpactMap() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);
  const fromYourStore = store !== null;

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_YOUR_STORE) setStore(loadYourStore());
      if (e.key === STORAGE_KEY_SHIPPED) setShipped(loadShippedPlaybooks());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const map: MapResult | null = useMemo(() => {
    if (!hydrated) return null;
    return buildMoveDifficultyImpactMap(store, shipped);
  }, [hydrated, store, shipped]);

  if (!map) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Move difficulty × impact
          </CardTitle>
          <CardDescription>Loading your shipped moves…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const everythingShipped = map.shippedCount === map.moves.length;
  const noEligible = map.eligibleCount === 0 && !everythingShipped;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-base">
                Move difficulty × impact
              </CardTitle>
              {fromYourStore && hydrated && (
                <span
                  data-testid="move-difficulty-impact-ys-badge"
                  className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  Prefilled from Your store on Overview
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              All {map.moves.length} Top-10 moves plotted by days-to-ship vs
              $ lift/month. Bubble size = operator cost.{" "}
              {map.usingDefaults ? (
                <span className="ml-1">
                  Defaults · edit on{" "}
                  <a
                    href="/"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Overview
                  </a>{" "}
                  to personalize.
                </span>
              ) : (
                <span className="ml-1">
                  Personalized to {formatUsd(store?.aov ?? 0)} AOV ·{" "}
                  {formatInt(store?.monthlyOrders ?? 0)} orders/mo.
                </span>
              )}
            </CardDescription>
          </div>
          <CopyButton
            value={renderDifficultyImpactMarkdown(
              map,
              store ?? YOUR_STORE_DEFAULTS
            )}
            label="Copy as markdown"
            className="shrink-0"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* === Status legend + counts === */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] mb-4">
          <Badge variant="success" className="text-[10px]">
            {map.shippedCount} shipped
          </Badge>
          <Badge variant="default" className="text-[10px]">
            {map.eligibleCount} eligible
          </Badge>
          <Badge variant="warning" className="text-[10px]">
            {map.prereqBlockedCount} blocked
          </Badge>
          <span className="ml-auto text-muted-foreground">
            Monthly revenue base:{" "}
            <span className="font-mono text-foreground">
              {formatUsd(map.monthlyRevenue)}
            </span>
          </span>
        </div>

        {/* === Blocker-chain banner === */}
        {map.blockerChain ? (
          <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-lg leading-none">
                🔓
              </span>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-foreground">
                  Ship "{map.blockerChain.move.name}" to unblock{" "}
                  {map.blockerChain.downstreamUnlocks} downstream move
                  {map.blockerChain.downstreamUnlocks === 1 ? "" : "s"}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {map.blockerChain.downstreamNames.join(", ")}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {everythingShipped ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <div className="text-2xl mb-1">🎉</div>
            <div className="text-sm font-semibold text-foreground">
              All Top-10 moves shipped.
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              You have executed the canonical roadmap. Refresh the queue from{" "}
              <a
                href="/research"
                className="underline underline-offset-2 hover:text-foreground"
              >
                research
              </a>
              .
            </div>
          </div>
        ) : noEligible ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 mb-4">
            <div className="text-xs font-semibold text-foreground">
              No eligible moves remain.
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Every unshipped move is waiting on a prerequisite. Ship the
              highest-priority blocker first:
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              {map.moves
                .filter((x) => x.status === "prereq-blocked")
                .slice(0, 3)
                .map((x) => (
                  <li key={x.move.id} className="text-muted-foreground">
                    ·{" "}
                    <span className="text-foreground font-medium">
                      {x.move.name}
                    </span>{" "}
                    needs{" "}
                    <code className="rounded bg-muted px-1 text-[10px]">
                      {x.missingPrereqId}
                    </code>{" "}
                    shipped first.
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {/* === The 2D bubble chart === */}
        {!everythingShipped ? (
          <DifficultyChart map={map} />
        ) : null}

        {/* === Per-move table for screen readers / copy-paste === */}
        {!everythingShipped ? (
          <div className="mt-6 border-t border-border pt-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Per-move breakdown
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {map.moves.map((m) => {
                const s = STATUS_STYLES[m.status];
                return (
                  <div
                    key={m.move.id}
                    className="flex items-start gap-2 rounded-md border border-border p-2 text-xs"
                  >
                    <span
                      className={cn(
                        "mt-1 inline-block h-2 w-2 shrink-0 rounded-full",
                        s.dot
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          #{m.move.priorityRank}
                        </span>
                        <span className="font-medium text-foreground truncate">
                          {m.move.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                        {m.daysToShip}d · {formatUsd(m.liftDollarsLow)}-
                        {formatUsd(m.liftDollarsHigh)}/mo · {formatUsd(m.costDollars)}/mo
                        {m.downstreamUnlocks > 0 ? (
                          <span
                            className={cn("ml-1.5 font-semibold", s.text)}
                          >
                            · unblocks {m.downstreamUnlocks}
                          </span>
                        ) : null}
                      </div>
                      {m.status === "prereq-blocked" && m.missingPrereqId ? (
                        <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
                          🔒 needs {m.missingPrereqId}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Pure-SVG bubble chart. Width is responsive via viewBox.
 *
 * Layout:
 *   - 720x360 viewport, 60px left margin (Y axis labels), 40px bottom
 *     margin (X axis labels), 30px top/right margin.
 *   - Y axis: $ lift/month, 0 → maxLiftDollars, 4 grid lines.
 *   - X axis: 0 → maxDays, 4 grid lines.
 *   - Each bubble: cx = (xNorm * plotW), cy = plotH - (yNorm * plotH),
 *     r = 8 + (cost / maxCost) * 24 (so cost=0 → r=8, cost=max → r=32).
 *   - Each bubble has a click target overlay (invisible circle) that
 *     links to the corresponding playbook.
 */
function DifficultyChart({ map }: { map: MapResult }) {
  const VB_W = 720;
  const VB_H = 360;
  const M = { top: 30, right: 30, bottom: 40, left: 80 };
  const plotW = VB_W - M.left - M.right;
  const plotH = VB_H - M.top - M.bottom;

  const xFor = (days: number) => M.left + (days / map.maxDays) * plotW;
  const yFor = (lift: number) =>
    M.top + plotH - (lift / Math.max(1, map.maxLiftDollars)) * plotH;
  const rFor = (cost: number) => 8 + (cost / map.maxCostDollars) * 24;

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(p * map.maxDays));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (p) => Math.round(p * map.maxLiftDollars)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto min-w-[640px]"
        role="img"
        aria-label="Move difficulty vs impact bubble chart"
      >
        {/* === Y axis grid lines + labels === */}
        {yTicks.map((tick, i) => {
          const y = yFor(tick);
          return (
            <g key={`y-${i}`}>
              <line
                x1={M.left}
                y1={y}
                x2={M.left + plotW}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              <text
                x={M.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {formatUsd(tick)}
              </text>
            </g>
          );
        })}

        {/* === X axis grid lines + labels === */}
        {xTicks.map((tick, i) => {
          const x = xFor(tick);
          return (
            <g key={`x-${i}`}>
              <line
                x1={x}
                y1={M.top}
                x2={x}
                y2={M.top + plotH}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              <text
                x={x}
                y={M.top + plotH + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {tick}d
              </text>
            </g>
          );
        })}

        {/* === Axes (drawn after grid for solid line) === */}
        <line
          x1={M.left}
          y1={M.top}
          x2={M.left}
          y2={M.top + plotH}
          className="stroke-foreground/40"
          strokeWidth={1.5}
        />
        <line
          x1={M.left}
          y1={M.top + plotH}
          x2={M.left + plotW}
          y2={M.top + plotH}
          className="stroke-foreground/40"
          strokeWidth={1.5}
        />

        {/* === Axis titles === */}
        <text
          x={M.left + plotW / 2}
          y={VB_H - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] uppercase tracking-widest"
        >
          Days to ship (difficulty) →
        </text>
        <text
          x={14}
          y={M.top + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${M.top + plotH / 2})`}
          className="fill-muted-foreground text-[10px] uppercase tracking-widest"
        >
          $ lift / month (impact) →
        </text>

        {/* === Bubbles === */}
        {map.moves.map((m) => {
          const x = xFor(m.daysToShip);
          // Position on the Y axis at the MID of the lift band so the
          // operator sees the band, not just one endpoint.
          const y = yFor((m.liftDollarsLow + m.liftDollarsHigh) / 2);
          const r = rFor(m.costDollars);
          const style = STATUS_STYLES[m.status];
          return (
            <g key={m.move.id}>
              {/* Lift band line (low → high) */}
              <line
                x1={x}
                y1={yFor(m.liftDollarsHigh)}
                x2={x}
                y2={yFor(m.liftDollarsLow)}
                className={cn(style.text)}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.4}
              />
              {/* Bubble */}
              <circle
                cx={x}
                cy={y}
                r={r}
                className={cn(style.dot, "opacity-70")}
                strokeWidth={2}
                stroke="currentColor"
              />
              {/* Label */}
              <text
                x={x}
                y={y - r - 4}
                textAnchor="middle"
                className={cn("text-[9px] font-semibold", style.text)}
              >
                #{m.move.priorityRank}
              </text>
              {/* Invisible click target for accessibility */}
              <a
                href={`/playbooks/${m.move.id}`}
                aria-label={`Open playbook for ${m.move.name}`}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(r, 16)}
                  fill="transparent"
                  className="cursor-pointer hover:opacity-80"
                />
              </a>
            </g>
          );
        })}

        {/* === Legend (bubble size) === */}
        <g transform={`translate(${M.left + 8}, ${M.top + 8})`}>
          <text
            x={0}
            y={0}
            className="fill-muted-foreground text-[9px] uppercase tracking-widest"
          >
            bubble = $/mo cost
          </text>
          <circle cx={6} cy={14} r={4} className="fill-foreground/30" />
          <text x={14} y={17} className="fill-muted-foreground text-[9px]">
            $0
          </text>
          <circle cx={36} cy={14} r={9} className="fill-foreground/30" />
          <text x={50} y={17} className="fill-muted-foreground text-[9px]">
            ${Math.round(map.maxCostDollars / 2).toLocaleString()}
          </text>
          <circle cx={86} cy={14} r={14} className="fill-foreground/30" />
          <text x={104} y={17} className="fill-muted-foreground text-[9px]">
            ${Math.round(map.maxCostDollars).toLocaleString()}
          </text>
        </g>
      </svg>
    </div>
  );
}
