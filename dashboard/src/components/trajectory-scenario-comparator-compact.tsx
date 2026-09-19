"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  computeTrajectoryScenarioDelta,
  fmtTrajectoryDeltaMoney,
  projectTrajectory,
  projectTrajectoryWithDelays,
  TRAJECTORY_FORMATTERS,
  type TrajectoryDelayMap,
} from "@/lib/trajectory-projection";
import {
  YOUR_STORE_DEFAULTS,
  type YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  type ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { MOVE_RECOMMENDATIONS } from "@/lib/next-move";
import { resetScenarioA } from "@/lib/trajectory-scenario-reset";
import { TrajectoryScenarioExportButton } from "@/components/trajectory-scenario-export-button";
import { TrajectoryScenarioPresetsPanel } from "@/components/trajectory-scenario-presets-panel";
import { cn } from "@/lib/utils";

/**
 * `Trajectory scenario comparator — compact mode` — Move #128.ap on `/today`.
 *
 * Cross-page-intelligence + interactive-tool that closes the comparator
 * loop on the operator's daily cockpit. The Move #128.al + Move #128.am
 * full comparator ships on `/` with a 4-tile delta grid, Scenario B
 * toggle, and reset row — but until now the operator's `/today` daily
 * cockpit had no way to peek at the active scenario without leaving the
 * page. Move #128.ap ships a compact variant for `/today` that:
 *
 *   1. Reads the SAME `ecom-ops:trajectory-scenario:v1` localStorage
 *      key the full comparator writes. Zero schema drift — switching
 *      scenarios on `/` instantly re-renders this card.
 *   2. Renders the chosen Scenario A in a single tight 2-tile strip
 *      (Year-1 lift Δ + Year-1 ROI Δ) plus the move name + delay +
 *      month shift. No Scenario B (operators who want side-by-side
 *      comparison click "Open on /" → go to the full comparator).
 *   3. Exposes a single one-click "Reset A" button so the operator
 *      can dismiss the active scenario from `/today` without leaving
 *      the page. Reuses `resetScenarioA()` from Move #128.an so the
 *      full comparator on `/` re-hydrates to defaults via the
 *      same-tab `ecom-ops:trajectory-scenario:update` event.
 *   4. Provides a "Open on /" link to the full comparator for the
 *      deep-edit flow (change move / change delay / enable Scenario B).
 *
 * Sized for the `/today` 1-column operator-cockpit layout: the card is
 * ~5× shorter than the full comparator and uses the same `border-l-4
 * border-l-sky-500/70` accent stripe so a `/` ↔ `/today` dual-open
 * operator recognizes the two as the same feature at different
 * zoom levels.
 */

// Mirror the full comparator's schema constants — keeping them in lockstep
// is the load-bearing detail. If `trajectory-scenario-comparator.tsx` ever
// renames a key, this file must be updated in the same commit.
const STORAGE_KEY = "ecom-ops:trajectory-scenario:v1";
const SCHEMA = "ecom-ops-trajectory-scenario";
const SCHEMA_B = "ecom-ops-trajectory-scenario-b";
const VERSION = 1;
const EVENT_NAME = "ecom-ops:trajectory-scenario:update";
const EVENT_NAME_B = "ecom-ops:trajectory-scenario-b:update";

interface ScenarioState {
  moveId: string | null;
  delayDays: number;
}

interface ScenarioStorage {
  schema: typeof SCHEMA;
  version: number;
  state: ScenarioState;
}

interface ScenarioBStorage {
  schema: typeof SCHEMA_B;
  version: number;
  enabled: boolean;
  state: ScenarioState;
}

function isValidShape(value: unknown): value is ScenarioStorage {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ScenarioStorage>;
  return (
    v.schema === SCHEMA &&
    v.version === VERSION &&
    typeof v.state === "object" &&
    v.state !== null
  );
}

function isValidShapeB(value: unknown): value is ScenarioBStorage {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ScenarioBStorage>;
  return (
    v.schema === SCHEMA_B &&
    v.version === VERSION &&
    typeof v.state === "object" &&
    v.state !== null &&
    typeof v.enabled === "boolean"
  );
}

function loadScenario(): ScenarioState {
  if (typeof window === "undefined") return { moveId: null, delayDays: 30 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { moveId: null, delayDays: 30 };
    const parsed = JSON.parse(raw);
    if (!isValidShape(parsed)) return { moveId: null, delayDays: 30 };
    const s = parsed.state;
    return {
      moveId: typeof s.moveId === "string" ? s.moveId : null,
      delayDays:
        typeof s.delayDays === "number" && s.delayDays > 0 ? s.delayDays : 30,
    };
  } catch {
    return { moveId: null, delayDays: 30 };
  }
}

function loadScenarioBEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("ecom-ops:trajectory-scenario-b:v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!isValidShapeB(parsed)) return false;
    return parsed.enabled === true;
  } catch {
    return false;
  }
}

export function TrajectoryScenarioComparatorCompact() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [scenario, setScenario] = useState<ScenarioState>({
    moveId: null,
    delayDays: 30,
  });
  const [scenarioBEnabled, setScenarioBEnabled] = useState(false);

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setScenario(loadScenario());
    setScenarioBEnabled(loadScenarioBEnabled());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1" || e.key === null) {
        setStore(loadYourStore());
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1" || e.key === null) {
        setShipped(loadShippedPlaybooks());
      }
      if (e.key === STORAGE_KEY || e.key === null) {
        setScenario(loadScenario());
      }
      if (
        e.key === "ecom-ops:trajectory-scenario-b:v1" ||
        e.key === null
      ) {
        setScenarioBEnabled(loadScenarioBEnabled());
      }
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<ScenarioStorage>).detail;
      if (detail && isValidShape(detail)) setScenario(detail.state);
    };
    const onCustomB = (e: Event) => {
      const detail = (e as CustomEvent<ScenarioBStorage>).detail;
      if (detail && isValidShapeB(detail)) {
        setScenarioBEnabled(detail.enabled);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_NAME, onCustom);
    window.addEventListener(EVENT_NAME_B, onCustomB);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_NAME, onCustom);
      window.removeEventListener(EVENT_NAME_B, onCustomB);
    };
  }, []);

  const { baseline, delayed, delta, eligibleMoves, originalShipMonth } =
    useMemo(() => {
      const baseProjection = projectTrajectory(
        store ?? YOUR_STORE_DEFAULTS,
        shipped,
      );
      const shippedSet = new Set(Object.keys(shipped));
      const eligible = MOVE_RECOMMENDATIONS.filter(
        (m) => !shippedSet.has(m.id),
      );
      const selectedMove = scenario.moveId
        ? eligible.find((m) => m.id === scenario.moveId) ?? null
        : null;
      const effectiveMoveId = selectedMove
        ? selectedMove.id
        : eligible[0]?.id ?? null;
      const delays: TrajectoryDelayMap = effectiveMoveId
        ? { [effectiveMoveId]: scenario.delayDays }
        : {};
      const delayedProjection = projectTrajectoryWithDelays(
        store ?? YOUR_STORE_DEFAULTS,
        shipped,
        delays,
      );
      const scenarioDelta = computeTrajectoryScenarioDelta(
        baseProjection,
        delayedProjection,
      );
      const originalEntry = effectiveMoveId
        ? baseProjection.movesOnHorizon.find(
            (e) => e.move.id === effectiveMoveId,
          )
        : undefined;
      return {
        baseline: baseProjection,
        delayed: delayedProjection,
        delta: scenarioDelta,
        eligibleMoves: eligible,
        originalShipMonth: originalEntry?.shipMonth ?? null,
      };
    }, [store, shipped, scenario]);

  if (!hydrated) {
    return (
      <div
        data-testid="trajectory-scenario-compact-placeholder"
        className="rounded border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground"
      >
        Loading scenario…
      </div>
    );
  }

  if (eligibleMoves.length === 0) {
    return (
      <Card
        data-testid="trajectory-scenario-compact-all-shipped"
        className="border-l-4 border-l-emerald-500/70"
      >
        <CardContent className="py-3 text-xs text-muted-foreground">
          Every Top-10 move already shipped — no delay scenario to compare.
        </CardContent>
      </Card>
    );
  }

  const effectiveMoveId = scenario.moveId ?? eligibleMoves[0]?.id ?? null;
  const selectedMove = effectiveMoveId
    ? eligibleMoves.find((m) => m.id === effectiveMoveId) ?? null
    : null;
  const delayedEntry = effectiveMoveId
    ? delayed.movesOnHorizon.find((e) => e.move.id === effectiveMoveId)
    : undefined;
  const delayedShipMonth = delayedEntry?.shipMonth ?? null;
  const monthShift =
    originalShipMonth !== null && delayedShipMonth !== null
      ? delayedShipMonth - originalShipMonth
      : null;
  const fmtMoney = TRAJECTORY_FORMATTERS.fmtMoney;

  const handleResetA = () => {
    const result = resetScenarioA();
    if (result.removed && typeof window !== "undefined") {
      // Mirror the full comparator's behaviour — explicitly set local
      // state so the delta strip re-renders before the storage event
      // bounces back.
      setScenario({ moveId: null, delayDays: 30 });
    }
  };

  // The two most-impactful deltas for the daily-cockpit view. Operators
  // don't need 4 tiles on /today — they need the answer to "if I delay
  // move X by Y days, what's the Year-1 hit?" in one glance.
  const liftIntent =
    delta.year1LiftHighDelta < 0
      ? "down"
      : delta.year1LiftHighDelta > 0
        ? "up"
        : "neutral";
  const roiIntent =
    delta.year1RoiHighDelta < 0
      ? "down"
      : delta.year1RoiHighDelta > 0
        ? "up"
        : "neutral";
  const liftColor =
    liftIntent === "down"
      ? "text-rose-600 dark:text-rose-400"
      : liftIntent === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground";
  const roiColor =
    roiIntent === "down"
      ? "text-rose-600 dark:text-rose-400"
      : roiIntent === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground";

  return (
    <Card
      data-testid="trajectory-scenario-compact"
      className="border-l-4 border-l-sky-500/70"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">
              Delay scenario
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Compact
            </Badge>
            {scenarioBEnabled ? (
              <Badge
                variant="outline"
                className="border-violet-500/70 text-[10px] text-violet-700 dark:text-violet-300"
              >
                B on
              </Badge>
            ) : null}
          </div>
          <Link
            href="/"
            data-testid="trajectory-scenario-compact-open-full"
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
          >
            Open on / →
          </Link>
        </div>
        <CardDescription className="text-xs">
          {selectedMove ? (
            <>
              Delaying{" "}
              <span className="font-medium text-foreground">
                #{selectedMove.priorityRank} · {selectedMove.name}
              </span>{" "}
              by{" "}
              <span className="font-medium text-foreground">
                +{scenario.delayDays}d
              </span>
              {monthShift !== null && monthShift !== 0 ? (
                <>
                  {" "}
                  — ships M{originalShipMonth ?? "?"} →{" "}
                  <span
                    className={cn(
                      "font-mono",
                      monthShift > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    M{delayedShipMonth ?? "?"}
                  </span>{" "}
                  ({monthShift > 0 ? "+" : ""}
                  {monthShift}mo)
                </>
              ) : null}
            </>
          ) : (
            <>No scenario set yet — open the full comparator on / to pick one.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* === TWO-TILE DELTA STRIP ===
            The compact variant collapses the full comparator's 4-tile grid
            (peak revenue / Year-1 lift / Year-1 cost / Year-1 ROI) into a
            single 2-column strip showing the two deltas the operator cares
            about most on the daily cockpit: Year-1 lift (the headline
            number) and Year-1 ROI (the secondary number). */}
        <div className="grid grid-cols-2 gap-3">
          <div
            data-testid="trajectory-scenario-compact-delta-lift"
            className="rounded border border-border/60 bg-background/60 px-3 py-2"
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Year-1 lift Δ
            </div>
            <div
              className={cn(
                "text-base font-semibold tabular-nums",
                liftColor,
              )}
            >
              {fmtTrajectoryDeltaMoney(delta.year1LiftHighDelta)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {fmtMoney(baseline.year1LiftLow)}–{fmtMoney(baseline.year1LiftHigh)}{" "}
              baseline
            </div>
          </div>
          <div
            data-testid="trajectory-scenario-compact-delta-roi"
            className="rounded border border-border/60 bg-background/60 px-3 py-2"
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Year-1 ROI Δ
            </div>
            <div
              className={cn(
                "text-base font-semibold tabular-nums",
                roiColor,
              )}
            >
              {TRAJECTORY_FORMATTERS.fmtRoi(delta.year1RoiHighDelta)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiLow)}–
              {TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiHigh)} baseline
            </div>
          </div>
        </div>

        {/* === ACTION ROW ===
            Reset A is the one-click dismiss path. The compact card never
            exposes Reset B because Scenario B lives only on the full
            comparator — operators who want to manage B should open /.
            The Reset A handler reuses the Move #128.an helper so both
            pages stay in sync via the same-tab CustomEvent. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="trajectory-scenario-compact-reset-a"
              onClick={handleResetA}
              title="Clear Scenario A back to the default unshipped #1 + 30-day delay. Works from /today — no need to leave the daily cockpit."
              aria-label="Reset Scenario A to defaults"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
            >
              Reset A
            </button>
            <span className="text-[10px] text-muted-foreground">
              Cross-page: changes on / reflect here instantly.
            </span>
          </div>
          <TrajectoryScenarioExportButton compact />
          <TrajectoryScenarioPresetsPanel compact defaultSlot="A" />
          {delta.hasImpact ? (
            <span
              data-testid="trajectory-scenario-compact-verdict"
              className={cn(
                "text-[10px] font-medium",
                liftIntent === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : liftIntent === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {liftIntent === "down"
                ? `Delay costs ${fmtTrajectoryDeltaMoney(delta.year1LiftHighDelta)} Year-1`
                : liftIntent === "up"
                  ? `Delay actually gains ${fmtTrajectoryDeltaMoney(delta.year1LiftHighDelta)} Year-1`
                  : "Delay leaves Year-1 unchanged"}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
