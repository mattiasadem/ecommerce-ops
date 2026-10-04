"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LAUNCH_PLAN_CATALOG,
  LaunchPlanProgressMap,
  loadLaunchPlanProgress,
} from "@/lib/launch-plan-progress";
import {
  SHIPPING_HEATMAP_WEEKS,
  SHIPPING_HEATMAP_DAYS,
  SHIPPING_WEEKDAY_LABELS,
  ShippingActivity,
  buildShippingActivity,
  cellTooltip,
  daysSinceToneClass,
  describeDaysSince,
  describeVelocityRatio,
  formatStreak,
  intensityToneClass,
  shippingActivityToMarkdown,
  streakToneClass,
} from "@/lib/shipping-activity-heatmap";
import { cn } from "@/lib/utils";

/**
 * `ShippingActivityHeatmap` — Cross-page-intelligence temporal view
 * of launch-plan shipping (Move #N.11).
 *
 * The companion to `LaunchPlanProgressTracker`. The tracker records
 * WHICH (plan, day) pair shipped; this widget turns the same
 * localStorage key into a GitHub-style activity heatmap plus the
 * momentum metrics operators actually need to know:
 *
 *   - **Current streak** — consecutive shipping days, ending today
 *     or yesterday
 *   - **Longest streak** — best run of consecutive shipping days
 *   - **Days since last ship** — integer day-count from today to
 *     the most recent ship (urgency signal)
 *   - **Last 30 / 60 / 90 days shipped** — count of unique days
 *     with ≥ 1 ship in the trailing window
 *   - **Velocity (7d vs 30d)** — `last7Rate / last30Rate` →
 *     "accelerating" / "steady" / "slowing" / "stalled" / "idle"
 *   - **13×7 heatmap** — 91 days ending today, 5-level intensity
 *     bucket (0 ships = muted, 1 = faint, 2 = light, 3 = medium,
 *     4+ = deep emerald)
 *   - **Weekday breakdown** — Mon..Sun totals with a "shipping
 *     rate" column (active days per weekday since first ship)
 *   - **Recent ship days list** — newest-first up to 14 cells with
 *     ship count + which plans shipped
 *
 * Hydration-safe: SSR renders the empty-state stub; the client
 * hydrates from localStorage on mount. Cross-tab + same-tab sync
 * via the `storage` event + the
 * `ecom-ops:launch-plan-progress:update` custom event.
 */
export function ShippingActivityHeatmap() {
  const [progress, setProgress] = useState<LaunchPlanProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    setProgress(loadLaunchPlanProgress());
    setHydrated(true);
  }, []);

  // Cross-tab + same-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(ev: StorageEvent) {
      if (ev.key === "ecom-ops:launch-plan-progress:v1") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
          setProgress(parsed ?? {});
        } catch {
          /* ignore */
        }
      }
    }
    function onCustom() {
      setProgress(loadLaunchPlanProgress());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:launch-plan-progress:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:launch-plan-progress:update", onCustom);
    };
  }, []);

  // Activity rollup.
  const activity: ShippingActivity = useMemo(
    () => buildShippingActivity(progress, new Date()),
    [progress]
  );

  const { heatmap, momentum } = activity;
  const isEmpty = momentum.isEmpty;

  // Plan-title lookup for tooltips + recent-days list.
  const planTitleById = useMemo(() => {
    const out: Record<string, string> = {};
    for (const p of LAUNCH_PLAN_CATALOG) out[p.id] = p.title;
    return out;
  }, []);

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(shippingActivityToMarkdown(activity, planTitleById))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleDownload() {
    if (typeof window === "undefined") return;
    const md = shippingActivityToMarkdown(activity, planTitleById);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipping-activity-heatmap-${heatmap.today}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const vel = describeVelocityRatio(momentum.trend7vs30.velocityRatio);
  const velToneClass = (() => {
    switch (vel.tone) {
      case "emerald":
        return "text-emerald-600";
      case "sky":
        return "text-sky-600";
      case "amber":
        return "text-amber-600";
      case "rose":
        return "text-rose-600";
      case "muted":
        return "text-muted-foreground";
    }
  })();

  // Recent ship days (newest-first, up to 14) for the "what shipped" list.
  const recentDays = useMemo(() => {
    const entries: { date: string; ships: number; planIds: string[] }[] = [];
    for (const week of heatmap.weeks) {
      for (const c of week) {
        if (c.ships > 0) {
          entries.push({ date: c.date, ships: c.ships, planIds: c.planIds });
        }
      }
    }
    entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return entries.slice(0, 14);
  }, [heatmap]);

  return (
    <section
      id="shipping-activity-heatmap"
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                Move #N.11
              </Badge>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {SHIPPING_HEATMAP_DAYS}-day shipping heatmap
              </span>
            </div>
            <CardTitle className="text-lg">
              Shipping activity heatmap
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isEmpty}
              className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              data-testid="shipping-heatmap-copy"
            >
              {copied ? "Copied!" : "Copy markdown"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isEmpty}
              className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              data-testid="shipping-heatmap-download"
            >
              Download .md
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Momentum strip — 4 tiles + velocity */}
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            data-testid="shipping-heatmap-momentum"
          >
            <MomentumTile
              label="Current streak"
              value={formatStreak(momentum.currentStreak)}
              toneClass={streakToneClass(momentum.currentStreak)}
              testId="shipping-heatmap-streak-current"
            />
            <MomentumTile
              label="Longest streak"
              value={formatStreak(momentum.longestStreak)}
              toneClass={
                momentum.longestStreak >= 7
                  ? "text-emerald-600"
                  : momentum.longestStreak >= 3
                    ? "text-sky-600"
                    : "text-foreground"
              }
              testId="shipping-heatmap-streak-longest"
            />
            <MomentumTile
              label="Last ship"
              value={describeDaysSince(momentum.daysSinceLastShip)}
              toneClass={daysSinceToneClass(momentum.daysSinceLastShip)}
              testId="shipping-heatmap-last-ship"
            />
            <MomentumTile
              label="Velocity (7d vs 30d)"
              value={vel.label}
              toneClass={velToneClass}
              testId="shipping-heatmap-velocity"
            />
          </div>

          {/* 30/60/90 strip */}
          <div
            className="grid grid-cols-3 gap-3"
            data-testid="shipping-heatmap-windows"
          >
            <WindowTile
              label="Last 30 days"
              value={momentum.last30}
              max={30}
              testId="shipping-heatmap-last30"
            />
            <WindowTile
              label="Last 60 days"
              value={momentum.last60}
              max={60}
              testId="shipping-heatmap-last60"
            />
            <WindowTile
              label="Last 90 days"
              value={momentum.last90}
              max={90}
              testId="shipping-heatmap-last90"
            />
          </div>

          <Separator />

          {/* The heatmap itself */}
          <div
            className="flex flex-col gap-2"
            data-testid="shipping-heatmap-grid"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Daily shipping activity · {SHIPPING_HEATMAP_WEEKS} weeks
              </span>
              <Legend />
            </div>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <div className="flex gap-1">
                <div className="flex flex-col justify-between gap-1 pt-3 text-[9px] uppercase text-muted-foreground">
                  {SHIPPING_WEEKDAY_LABELS.map((l, i) => (
                    <span
                      key={l}
                      className={cn(
                        "h-3 leading-3",
                        i % 2 === 0 ? "visible" : "invisible"
                      )}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex h-3 text-[9px] uppercase text-muted-foreground">
                    {heatmap.weeks.map((week, wi) => {
                      const startCell = week[0];
                      const d = new Date(`${startCell.date}T00:00:00Z`);
                      const showLabel = d.getUTCMonth() !== new Date(`${heatmap.weeks[wi - 1]?.[0]?.date ?? "x"}T00:00:00Z`).getUTCMonth() || wi === 0;
                      return (
                        <div
                          key={wi}
                          className="flex-1"
                          title={startCell.date}
                        >
                          {showLabel
                            ? d.toLocaleDateString("en-US", {
                                month: "short",
                                timeZone: "UTC",
                              })
                            : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-1">
                    {heatmap.weeks.map((week, wi) => (
                      <div
                        key={wi}
                        className="flex flex-1 flex-col gap-1"
                      >
                        {week.map((cell) => (
                          <div
                            key={cell.date}
                            className={cn(
                              "aspect-square h-3 w-full rounded-[2px] border border-border/40",
                              intensityToneClass(cell.intensity),
                              cell.isFuture && "opacity-30"
                            )}
                            title={cellTooltip(cell)}
                            aria-label={cellTooltip(cell)}
                            data-testid={`shipping-cell-${cell.date}`}
                            data-ships={cell.ships}
                            data-intensity={cell.intensity}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weekday breakdown + recent ship days */}
          <div
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            data-testid="shipping-heatmap-breakdown"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekday breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isEmpty ? (
                  <p className="text-xs text-muted-foreground">
                    No shipping history yet. Tick a day cell on the tracker to
                    start.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {momentum.weekdayBreakdown.map((w) => (
                      <div
                        key={w.weekday}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-16 text-muted-foreground">
                          {SHIPPING_WEEKDAY_LABELS[w.weekday]}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
                            <div
                              className="h-full bg-emerald-500/60"
                              style={{
                                width: `${Math.min(100, w.ratio * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-12 text-right tabular-nums">
                          {w.ships}/{w.activeDays}
                        </span>
                        <span className="w-10 text-right tabular-nums text-muted-foreground">
                          {(w.ratio * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent ship days</CardTitle>
              </CardHeader>
              <CardContent>
                {recentDays.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No ship days in the last {SHIPPING_HEATMAP_DAYS} days.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {recentDays.map((d) => (
                      <li
                        key={d.date}
                        className="flex flex-wrap items-baseline gap-2 text-xs"
                      >
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 tabular-nums text-foreground">
                          {d.date}
                        </span>
                        <span className="text-foreground">
                          {d.ships} ship{d.ships === 1 ? "" : "s"}
                        </span>
                        <span className="text-muted-foreground">
                          ·{" "}
                          {d.planIds
                            .map((id) => planTitleById[id] ?? id)
                            .join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span>Reads from</span>
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
              ecom-ops:launch-plan-progress:v1
            </code>
            <span>·</span>
            <Link
              href="/launch-plan-progress"
              className="text-foreground underline"
            >
              Open tracker
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface MomentumTileProps {
  label: string;
  value: string;
  toneClass: string;
  testId?: string;
}

function MomentumTile({ label, value, toneClass, testId }: MomentumTileProps) {
  return (
    <div
      className="rounded-md border border-border bg-background px-3 py-2"
      data-testid={testId}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-base font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}

interface WindowTileProps {
  label: string;
  value: number;
  max: number;
  testId?: string;
}

function WindowTile({ label, value, max, testId }: WindowTileProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      className="rounded-md border border-border bg-background px-3 py-2"
      data-testid={testId}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-muted">
        <div
          className={cn(
            "h-full",
            pct >= 60
              ? "bg-emerald-500/70"
              : pct >= 25
                ? "bg-sky-500/60"
                : pct > 0
                  ? "bg-amber-500/60"
                  : "bg-muted-foreground/30"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
      <span>Less</span>
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-[2px] border border-border/40",
          intensityToneClass(0)
        )}
        aria-label="0 ships"
      />
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-[2px] border border-border/40",
          intensityToneClass(1)
        )}
        aria-label="1 ship"
      />
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-[2px] border border-border/40",
          intensityToneClass(2)
        )}
        aria-label="2 ships"
      />
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-[2px] border border-border/40",
          intensityToneClass(3)
        )}
        aria-label="3-4 ships"
      />
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-[2px] border border-border/40",
          intensityToneClass(4)
        )}
        aria-label="5+ ships"
      />
      <span>More</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-md border border-dashed border-border bg-muted/30 px-6 py-8 text-center"
      data-testid="shipping-heatmap-empty"
    >
      <p className="text-sm font-medium text-foreground">
        No shipping activity yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tick a day cell on the{" "}
        <Link
          href="/launch-plan-progress"
          className="text-foreground underline"
        >
          launch-plan tracker
        </Link>{" "}
        to start the heatmap. After 7+ days of shipping, you&apos;ll see
        streaks, velocity, and weekday trends here.
      </p>
    </div>
  );
}
