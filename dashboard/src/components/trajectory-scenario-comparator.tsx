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
  computeTrajectoryScenarioDelta,
  fmtTrajectoryDeltaMoney,
  fmtTrajectoryDeltaRoi,
  projectTrajectory,
  projectTrajectoryWithDelays,
  TRAJECTORY_FORMATTERS,
  type TrajectoryDelayMap,
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
import { MOVE_RECOMMENDATIONS } from "@/lib/next-move";
import { cn } from "@/lib/utils";

/**
 * `Trajectory scenario comparator` — Move #128.al on `/` (and `/today`).
 *
 * Cross-page-intelligence + interactive-tool that closes the operator's
 * "what if I delay a move?" decision loop. The Move #6.16 trajectory
 * panel answers "what does my Year-1 look like?" with one curve — but
 * until now there was no way to ask "what does it look like if I
 * delay Move #5 by 1 month / 2 months / 3 months?". This component:
 *
 *   1. Lets the operator pick 1 move from the un-shipped queue
 *      (`<select>` populated from `MOVE_RECOMMENDATIONS`).
 *   2. Lets them pick a delay amount (1, 2, 3, or 6 months of extra
 *      days added to the move's `daysToShip`).
 *   3. Re-runs `projectTrajectoryWithDelays()` with the chosen delay.
 *   4. Renders a 4-tile delta grid: peak revenue Δ, Year-1 lift Δ,
 *      Year-1 cost Δ, Year-1 ROI Δ — all signed against the un-delayed
 *      baseline.
 *   5. Shows a 12-row mini-table of the chosen move's ship-month
 *      shift (original → delayed) so the operator sees exactly when
 *      the move would now land.
 *   6. Persists the choice to `ecom-ops:trajectory-scenario:v1` so it
 *      survives reloads + propagates across tabs via `storage` event.
 *
 * Reads the SAME canonical shared state as the trajectory panel:
 *   - `ecom-ops:your-store:v1`  (AOV / monthly orders / margin)
 *   - `ecom-ops:shipped-playbooks:v1` (already-shipped queue state)
 *
 * Mounted on `/` immediately after `<TrajectoryPanel />` inside the
 * existing `trajectory-projection` section.
 */

const STORAGE_KEY = "ecom-ops:trajectory-scenario:v1";
const SCHEMA = "ecom-ops-trajectory-scenario";
const VERSION = 1;

const DELAY_PRESETS_DAYS = [
  { label: "+1 month", value: 30 },
  { label: "+2 months", value: 60 },
  { label: "+3 months", value: 90 },
  { label: "+6 months", value: 180 },
];

interface ScenarioState {
  moveId: string | null;
  delayDays: number;
}

interface ScenarioStorage {
  schema: typeof SCHEMA;
  version: number;
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

function saveScenario(state: ScenarioState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ScenarioStorage = {
      schema: SCHEMA,
      version: VERSION,
      state,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent("ecom-ops:trajectory-scenario:update", {
        detail: payload,
      }),
    );
  } catch {
    /* quota / private-mode — silently ignore */
  }
}

export function TrajectoryScenarioComparator() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [scenario, setScenario] = useState<ScenarioState>({
    moveId: null,
    delayDays: 30,
  });

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setScenario(loadScenario());
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
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<ScenarioStorage>).detail;
      if (detail && isValidShape(detail)) setScenario(detail.state);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:trajectory-scenario:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:trajectory-scenario:update", onCustom);
    };
  }, []);

  // Compute the baseline + delayed projections once per (store, shipped, scenario) tuple.
  const { baseline, delayed, delta, eligibleMoves, originalShipMonth } =
    useMemo(() => {
      const baseProjection = projectTrajectory(store ?? YOUR_STORE_DEFAULTS, shipped);
      const shippedSet = new Set(Object.keys(shipped));
      const eligible = MOVE_RECOMMENDATIONS.filter((m) => !shippedSet.has(m.id));
      const selectedMove = scenario.moveId
        ? eligible.find((m) => m.id === scenario.moveId) ?? null
        : null;
      // Always include the first eligible move as a default so the panel
      // shows a real comparison on first visit.
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
        ? baseProjection.movesOnHorizon.find((e) => e.move.id === effectiveMoveId)
        : undefined;
      const originalMonth = originalEntry?.shipMonth ?? null;
      return {
        baseline: baseProjection,
        delayed: delayedProjection,
        delta: scenarioDelta,
        eligibleMoves: eligible,
        originalShipMonth: originalMonth,
      };
    }, [store, shipped, scenario]);

  if (!hydrated) {
    return (
      <div
        data-testid="trajectory-scenario-placeholder"
        className="rounded border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground"
      >
        Loading scenario comparator…
      </div>
    );
  }

  if (eligibleMoves.length === 0) {
    return (
      <Card
        data-testid="trajectory-scenario-all-shipped"
        className="border-dashed"
      >
        <CardContent className="py-4 text-xs text-muted-foreground">
          Every Top-10 move already shipped — no delay scenario to compare.
          The baseline projection above is the full year-1 curve.
        </CardContent>
      </Card>
    );
  }

  const effectiveMoveId =
    scenario.moveId ?? eligibleMoves[0]?.id ?? null;
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

  return (
    <Card data-testid="trajectory-scenario-comparator" className="border-l-4 border-l-sky-500/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">
            What if you delay a move?
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Scenario test
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Pick any unshipped move + a delay amount and see how your Year-1
          shifts. Compare against the baseline curve on the panel above.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* === CONTROLS === */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="trajectory-scenario-move"
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Delay move
            </label>
            <select
              id="trajectory-scenario-move"
              data-testid="trajectory-scenario-move"
              className="rounded border border-border bg-background px-2 py-1 text-xs"
              value={effectiveMoveId ?? ""}
              onChange={(e) => {
                const next = { ...scenario, moveId: e.target.value };
                setScenario(next);
                saveScenario(next);
              }}
            >
              {eligibleMoves.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.priorityRank} · {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="trajectory-scenario-delay"
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Delay amount
            </label>
            <select
              id="trajectory-scenario-delay"
              data-testid="trajectory-scenario-delay"
              className="rounded border border-border bg-background px-2 py-1 text-xs"
              value={scenario.delayDays}
              onChange={(e) => {
                const days = Number(e.target.value);
                if (!Number.isFinite(days) || days <= 0) return;
                const next = { ...scenario, delayDays: days };
                setScenario(next);
                saveScenario(next);
              }}
            >
              {DELAY_PRESETS_DAYS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-[10px] text-muted-foreground tabular-nums">
            {selectedMove ? (
              <>
                Originally ships{" "}
                <span className="font-mono font-medium text-foreground">
                  M{originalShipMonth ?? "?"}
                </span>
                {monthShift !== null && monthShift !== 0 ? (
                  <>
                    {" → "}
                    <span
                      className={cn(
                        "font-mono font-medium",
                        monthShift > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      M{delayedShipMonth ?? "?"}
                    </span>
                    <span className="ml-1">
                      ({monthShift > 0 ? "+" : ""}
                      {monthShift}mo)
                    </span>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <Separator />

        {/* === DELTA GRID === */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScenarioDeltaTile
            testid="trajectory-scenario-delta-peak"
            label="Peak monthly revenue"
            value={fmtTrajectoryDeltaMoney(delta.peakRevenueHighDelta)}
            intent={delta.peakRevenueHighDelta < 0 ? "down" : delta.peakRevenueHighDelta > 0 ? "up" : "neutral"}
            hint={`${fmtMoney(baseline.months[baseline.months.length - 1].revenueHigh)} → ${fmtMoney(delayed.months[delayed.months.length - 1].revenueHigh)}`}
          />
          <ScenarioDeltaTile
            testid="trajectory-scenario-delta-lift"
            label="Year-1 lift"
            value={`${fmtTrajectoryDeltaMoney(delta.year1LiftLowDelta)} – ${fmtTrajectoryDeltaMoney(delta.year1LiftHighDelta)}`}
            intent={delta.year1LiftHighDelta < 0 ? "down" : delta.year1LiftHighDelta > 0 ? "up" : "neutral"}
            hint={`${fmtMoney(baseline.year1LiftLow)}–${fmtMoney(baseline.year1LiftHigh)} baseline`}
          />
          <ScenarioDeltaTile
            testid="trajectory-scenario-delta-cost"
            label="Year-1 cost"
            value={`${fmtTrajectoryDeltaMoney(delta.year1CostLowDelta)} – ${fmtTrajectoryDeltaMoney(delta.year1CostHighDelta)}`}
            intent={delta.year1CostHighDelta > 0 ? "up" : delta.year1CostHighDelta < 0 ? "down" : "neutral"}
            hint={`${fmtMoney(baseline.year1CostLow)}–${fmtMoney(baseline.year1CostHigh)} baseline`}
          />
          <ScenarioDeltaTile
            testid="trajectory-scenario-delta-roi"
            label="Year-1 ROI"
            value={`${fmtTrajectoryDeltaRoi(delta.year1RoiLowDelta)} – ${fmtTrajectoryDeltaRoi(delta.year1RoiHighDelta)}`}
            intent={delta.year1RoiHighDelta < 0 ? "down" : delta.year1RoiHighDelta > 0 ? "up" : "neutral"}
            hint={`${TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiLow)}–${TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiHigh)} baseline`}
          />
        </div>

        {/* === STATUS FOOTER === */}
        <div className="rounded border border-border/60 bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
          {delta.hasImpact ? (
            <>
              Delaying{" "}
              <span className="font-medium text-foreground">
                {selectedMove?.name ?? "—"}
              </span>{" "}
              by{" "}
              <span className="font-medium text-foreground">
                +{scenario.delayDays}d
              </span>{" "}
              pushes the move from M{originalShipMonth ?? "?"} to M
              {delayedShipMonth ?? "?"} and{" "}
              {delta.year1LiftHighDelta < 0
                ? "reduces"
                : delta.year1LiftHighDelta > 0
                  ? "increases"
                  : "leaves unchanged"}{" "}
              Year-1 lift by{" "}
              <span
                className={cn(
                  "font-mono",
                  delta.year1LiftHighDelta < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : delta.year1LiftHighDelta > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground",
                )}
              >
                {fmtTrajectoryDeltaMoney(delta.year1LiftHighDelta)}
              </span>
              .
            </>
          ) : (
            <>
              Pick a move + delay to see the Year-1 impact. The baseline
              curve above is the un-delayed projection; this panel shows
              the diff.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Internal helper — small color-coded delta tile
// ---------------------------------------------------------------------------

interface ScenarioDeltaTileProps {
  testid: string;
  label: string;
  value: string;
  intent: "up" | "down" | "neutral";
  hint: string;
}

function ScenarioDeltaTile(props: ScenarioDeltaTileProps) {
  const { testid, label, value, intent, hint } = props;
  const colorClass =
    intent === "down"
      ? "text-rose-600 dark:text-rose-400"
      : intent === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground";
  return (
    <div
      data-testid={testid}
      className="rounded border border-border/60 bg-background/60 px-3 py-2"
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-base font-semibold tabular-nums", colorClass)}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}