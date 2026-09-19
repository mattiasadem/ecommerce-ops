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
import {
  resetScenarioA,
  resetScenarioB,
  resetScenarioBoth,
} from "@/lib/trajectory-scenario-reset";
import { TrajectoryScenarioExportButton } from "@/components/trajectory-scenario-export-button";
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
const STORAGE_KEY_B = "ecom-ops:trajectory-scenario-b:v1";
const SCHEMA = "ecom-ops-trajectory-scenario";
const SCHEMA_B = "ecom-ops-trajectory-scenario-b";
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

function loadScenarioB(): { enabled: boolean; state: ScenarioState } {
  if (typeof window === "undefined")
    return { enabled: false, state: { moveId: null, delayDays: 30 } };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_B);
    if (!raw) return { enabled: false, state: { moveId: null, delayDays: 30 } };
    const parsed = JSON.parse(raw);
    if (!isValidShapeB(parsed))
      return { enabled: false, state: { moveId: null, delayDays: 30 } };
    const s = parsed.state;
    return {
      enabled: parsed.enabled,
      state: {
        moveId: typeof s.moveId === "string" ? s.moveId : null,
        delayDays:
          typeof s.delayDays === "number" && s.delayDays > 0 ? s.delayDays : 30,
      },
    };
  } catch {
    return { enabled: false, state: { moveId: null, delayDays: 30 } };
  }
}

function saveScenarioB(
  enabled: boolean,
  state: ScenarioState,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ScenarioBStorage = {
      schema: SCHEMA_B,
      version: VERSION,
      enabled,
      state,
    };
    window.localStorage.setItem(STORAGE_KEY_B, JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent("ecom-ops:trajectory-scenario-b:update", {
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
  const [scenarioBEnabled, setScenarioBEnabled] = useState(false);
  const [scenarioB, setScenarioB] = useState<ScenarioState>({
    moveId: null,
    delayDays: 60,
  });

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setScenario(loadScenario());
    const initialB = loadScenarioB();
    setScenarioBEnabled(initialB.enabled);
    setScenarioB(initialB.state);
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
      if (e.key === STORAGE_KEY_B || e.key === null) {
        const next = loadScenarioB();
        setScenarioBEnabled(next.enabled);
        setScenarioB(next.state);
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
        setScenarioB(detail.state);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:trajectory-scenario:update", onCustom);
    window.addEventListener(
      "ecom-ops:trajectory-scenario-b:update",
      onCustomB,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:trajectory-scenario:update", onCustom);
      window.removeEventListener(
        "ecom-ops:trajectory-scenario-b:update",
        onCustomB,
      );
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

  // Scenario B — independent second scenario, same engine. When
  // `scenarioBEnabled` is false, `delayedProjectionB === delayed` and
  // `deltaB === delta` so the side-by-side grid renders a single
  // "Scenario B = Scenario A" row.
  const { delayedB, deltaB, eligibleMovesB, originalShipMonthB } =
    useMemo(() => {
      const shippedSet = new Set(Object.keys(shipped));
      const eligible = MOVE_RECOMMENDATIONS.filter(
        (m) => !shippedSet.has(m.id),
      );
      const selectedMoveB = scenarioB.moveId
        ? eligible.find((m) => m.id === scenarioB.moveId) ?? null
        : null;
      // Default: pick the 2nd eligible move so A and B aren't the same.
      const fallbackMoveB =
        scenarioBEnabled && !selectedMoveB
          ? eligible.find((m) => m.id !== scenario.moveId) ?? eligible[0]
          : null;
      const effectiveMoveIdB = selectedMoveB
        ? selectedMoveB.id
        : fallbackMoveB?.id ?? null;
      const delaysB: TrajectoryDelayMap =
        scenarioBEnabled && effectiveMoveIdB
          ? { [effectiveMoveIdB]: scenarioB.delayDays }
          : {};
      const projB = projectTrajectoryWithDelays(
        store ?? YOUR_STORE_DEFAULTS,
        shipped,
        delaysB,
      );
      const deltaB = computeTrajectoryScenarioDelta(baseline, projB);
      const originalEntryB = effectiveMoveIdB
        ? baseline.movesOnHorizon.find(
            (e) => e.move.id === effectiveMoveIdB,
          )
        : undefined;
      const originalMonthB = originalEntryB?.shipMonth ?? null;
      return {
        delayedB: projB,
        deltaB,
        eligibleMovesB: eligible,
        originalShipMonthB: originalMonthB,
      };
    }, [store, shipped, scenario, scenarioB, scenarioBEnabled, baseline]);

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

  // Scenario B resolved ids — used in JSX
  const effectiveMoveIdB =
    scenarioB.moveId ??
    (scenarioBEnabled && eligibleMovesB.length > 1
      ? eligibleMovesB.find((m) => m.id !== scenario.moveId)?.id ??
        eligibleMovesB[1]?.id
      : null) ??
    null;
  const selectedMoveB = effectiveMoveIdB
    ? eligibleMovesB.find((m) => m.id === effectiveMoveIdB) ?? null
    : null;
  const delayedEntryB = effectiveMoveIdB
    ? delayedB.movesOnHorizon.find((e) => e.move.id === effectiveMoveIdB)
    : undefined;
  const delayedShipMonthB = delayedEntryB?.shipMonth ?? null;
  const monthShiftB =
    originalShipMonthB !== null && delayedShipMonthB !== null
      ? delayedShipMonthB - originalShipMonthB
      : null;

  // Verdict: which scenario is "less painful" — i.e. whose Year-1 lift
  // loss is smaller. Ties go to A.
  const lossA = Math.abs(delta.year1LiftHighDelta);
  const lossB = scenarioBEnabled ? Math.abs(deltaB.year1LiftHighDelta) : 0;
  const verdictLabel =
    scenarioBEnabled && effectiveMoveId !== effectiveMoveIdB
      ? lossA < lossB
        ? "Scenario A loses less Year-1 lift"
        : lossA > lossB
          ? "Scenario B loses less Year-1 lift"
          : "Both scenarios lose the same Year-1 lift"
      : null;

  // Reset actions — Move #128.an. The helpers in `trajectory-scenario-reset.ts`
  // clear the localStorage keys + dispatch the same-tab event the comparator
  // already listens for, so the UI re-hydrates to defaults with no extra wiring.
  // Reset Both handles the `confirm()` dialog so a stray click can't wipe the
  // operator's selected scenarios.
  const handleResetA = () => {
    const result = resetScenarioA();
    if (result.removed && typeof window !== "undefined") {
      // Bump the in-memory scenario state so the delta tiles + status
      // footer re-render instantly; the storage event covers cross-tab
      // and the helper's own dispatch covers same-tab mounts, but the
      // originating component needs an explicit setter to redraw its
      // delta grid before the storage event returns.
      setScenario({ moveId: null, delayDays: 30 });
      setScenarioB((prev) => prev); // no-op to force re-render
    }
  };

  const handleResetB = () => {
    const result = resetScenarioB();
    if (result.removed && typeof window !== "undefined") {
      setScenarioBEnabled(false);
      setScenarioB({ moveId: null, delayDays: 30 });
    }
  };

  const handleResetBoth = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset both Scenario A and Scenario B? Your selected moves + delays will clear, but Your-store / shipped-playbooks / override stay untouched.",
      );
      if (!ok) return;
    }
    const summary = resetScenarioBoth();
    if (summary.a.removed || summary.b.removed) {
      setScenario({ moveId: null, delayDays: 30 });
      setScenarioBEnabled(false);
      setScenarioB({ moveId: null, delayDays: 30 });
    }
  };

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

        {/* === SCENARIO B TOGGLE === */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              data-testid="trajectory-scenario-b-toggle"
              className="h-3.5 w-3.5 rounded border-border accent-sky-500"
              checked={scenarioBEnabled}
              onChange={(e) => {
                const next = e.target.checked;
                setScenarioBEnabled(next);
                saveScenarioB(next, scenarioB);
              }}
            />
            <span>Compare against a 2nd scenario (B)</span>
          </label>
          <div
            data-testid="trajectory-scenario-reset-row"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              data-testid="trajectory-scenario-reset-a"
              onClick={handleResetA}
              title="Clear Scenario A back to the default unshipped #1 + 30-day delay"
              aria-label="Reset Scenario A to defaults"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
            >
              Reset A
            </button>
            {scenarioBEnabled ? (
              <button
                type="button"
                data-testid="trajectory-scenario-reset-b"
                onClick={handleResetB}
                title="Uncheck Scenario B and clear its move + delay back to defaults"
                aria-label="Reset Scenario B to defaults"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
              >
                Reset B
              </button>
            ) : null}
            <button
              type="button"
              data-testid="trajectory-scenario-reset-both"
              onClick={handleResetBoth}
              title="Reset both Scenario A and Scenario B at once — wipe localStorage keys for the comparator only"
              aria-label="Reset both scenarios to defaults"
              className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-500/10 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
            >
              Reset both
            </button>
          </div>
        </div>
        {scenarioBEnabled && (
          <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="trajectory-scenario-b-move"
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  Scenario B move
                </label>
                <select
                  id="trajectory-scenario-b-move"
                  data-testid="trajectory-scenario-b-move"
                  className="rounded border border-border bg-background px-2 py-1 text-xs"
                  value={effectiveMoveIdB ?? ""}
                  onChange={(e) => {
                    const next = { ...scenarioB, moveId: e.target.value };
                    setScenarioB(next);
                    saveScenarioB(scenarioBEnabled, next);
                  }}
                >
                  {eligibleMovesB.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.priorityRank} · {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="trajectory-scenario-b-delay"
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  Scenario B delay
                </label>
                <select
                  id="trajectory-scenario-b-delay"
                  data-testid="trajectory-scenario-b-delay"
                  className="rounded border border-border bg-background px-2 py-1 text-xs"
                  value={scenarioB.delayDays}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    if (!Number.isFinite(days) || days <= 0) return;
                    const next = { ...scenarioB, delayDays: days };
                    setScenarioB(next);
                    saveScenarioB(scenarioBEnabled, next);
                  }}
                >
                  {DELAY_PRESETS_DAYS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {selectedMoveB ? (
                  <>
                    Originally ships{" "}
                    <span className="font-mono font-medium text-foreground">
                      M{originalShipMonthB ?? "?"}
                    </span>
                    {monthShiftB !== null && monthShiftB !== 0 ? (
                      <>
                        {" → "}
                        <span
                          className={cn(
                            "font-mono font-medium",
                            monthShiftB > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          M{delayedShipMonthB ?? "?"}
                        </span>
                        <span className="ml-1">
                          ({monthShiftB > 0 ? "+" : ""}
                          {monthShiftB}mo)
                        </span>
                      </>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          )}

        <Separator />

        {/* === DELTA GRID — Scenario A (always) + Scenario B (when enabled) === */}
        <div
          className={cn(
            "grid gap-4",
            scenarioBEnabled ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1",
          )}
        >
          {/* Scenario A row */}
          <div
            data-testid="trajectory-scenario-row-a"
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-sky-500/70 text-[10px] text-sky-700 dark:text-sky-300"
              >
                Scenario A
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {selectedMove
                  ? `Delaying ${selectedMove.name} by +${scenario.delayDays}d`
                  : "Pick a move + delay"}
              </span>
            </div>
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
          </div>

          {/* Scenario B row — only when toggled on */}
          {scenarioBEnabled && (
            <div
              data-testid="trajectory-scenario-row-b"
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-violet-500/70 text-[10px] text-violet-700 dark:text-violet-300"
                >
                  Scenario B
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {selectedMoveB
                    ? `Delaying ${selectedMoveB.name} by +${scenarioB.delayDays}d`
                    : "Pick a move + delay"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ScenarioDeltaTile
                  testid="trajectory-scenario-b-delta-peak"
                  label="Peak monthly revenue"
                  value={fmtTrajectoryDeltaMoney(deltaB.peakRevenueHighDelta)}
                  intent={deltaB.peakRevenueHighDelta < 0 ? "down" : deltaB.peakRevenueHighDelta > 0 ? "up" : "neutral"}
                  hint={`${fmtMoney(baseline.months[baseline.months.length - 1].revenueHigh)} → ${fmtMoney(delayedB.months[delayedB.months.length - 1].revenueHigh)}`}
                />
                <ScenarioDeltaTile
                  testid="trajectory-scenario-b-delta-lift"
                  label="Year-1 lift"
                  value={`${fmtTrajectoryDeltaMoney(deltaB.year1LiftLowDelta)} – ${fmtTrajectoryDeltaMoney(deltaB.year1LiftHighDelta)}`}
                  intent={deltaB.year1LiftHighDelta < 0 ? "down" : deltaB.year1LiftHighDelta > 0 ? "up" : "neutral"}
                  hint={`${fmtMoney(baseline.year1LiftLow)}–${fmtMoney(baseline.year1LiftHigh)} baseline`}
                />
                <ScenarioDeltaTile
                  testid="trajectory-scenario-b-delta-cost"
                  label="Year-1 cost"
                  value={`${fmtTrajectoryDeltaMoney(deltaB.year1CostLowDelta)} – ${fmtTrajectoryDeltaMoney(deltaB.year1CostHighDelta)}`}
                  intent={deltaB.year1CostHighDelta > 0 ? "up" : deltaB.year1CostHighDelta < 0 ? "down" : "neutral"}
                  hint={`${fmtMoney(baseline.year1CostLow)}–${fmtMoney(baseline.year1CostHigh)} baseline`}
                />
                <ScenarioDeltaTile
                  testid="trajectory-scenario-b-delta-roi"
                  label="Year-1 ROI"
                  value={`${fmtTrajectoryDeltaRoi(deltaB.year1RoiLowDelta)} – ${fmtTrajectoryDeltaRoi(deltaB.year1RoiHighDelta)}`}
                  intent={deltaB.year1RoiHighDelta < 0 ? "down" : deltaB.year1RoiHighDelta > 0 ? "up" : "neutral"}
                  hint={`${TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiLow)}–${TRAJECTORY_FORMATTERS.fmtRoi(baseline.year1RoiHigh)} baseline`}
                />
              </div>
            </div>
          )}
        </div>

        {/* === EXPORT ROW — Move #128.ao === */}
        <div className="rounded border border-dashed border-border/60 bg-muted/30 px-3 py-2">
          <TrajectoryScenarioExportButton compact />
        </div>

        {/* === STATUS FOOTER + VERDICT === */}
        <div className="rounded border border-border/60 bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
          {verdictLabel ? (
            <div
              data-testid="trajectory-scenario-verdict"
              className="mb-2 flex flex-wrap items-baseline gap-2 rounded border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-violet-700 dark:text-violet-300"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Compare verdict
              </span>
              <span className="text-foreground">{verdictLabel}.</span>
              <span className="text-muted-foreground">
                A loss {fmtTrajectoryDeltaMoney(-delta.year1LiftHighDelta)} · B loss {fmtTrajectoryDeltaMoney(-deltaB.year1LiftHighDelta)}.
              </span>
            </div>
          ) : null}
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