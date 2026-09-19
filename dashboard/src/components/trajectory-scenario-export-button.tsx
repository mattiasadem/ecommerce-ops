"use client";

import { useEffect, useMemo, useState } from "react";

import {
  projectTrajectory,
  projectTrajectoryWithDelays,
  type TrajectoryDelayMap,
} from "@/lib/trajectory-projection";
import { cn } from "@/lib/utils";
import {
  YOUR_STORE_DEFAULTS,
  type YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  type ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import {
  type ScenarioExportSlot,
  buildScenarioExportCsv,
  buildScenarioExportSlots,
  scenarioExportFilename,
} from "@/lib/trajectory-scenario-export";
import { MOVE_RECOMMENDATIONS } from "@/lib/next-move";

/**
 * `Trajectory scenario export` — one-click CSV download of the comparator's
 * current Scenario A (and Scenario B, when enabled).
 *
 * Companion to Move #128.al (Scenario A) and Move #128.am (Scenario B). Closes
 * the "share my what-if with the team" loop. The comparator card on `/` (and
 * the compact variant on `/today`) shows the active scenarios in the delta
 * grid — now operators can hit one button and download a CSV containing:
 *   - metadata block (schema, version, exportedAt, AOV, orders, margin)
 *   - per-scenario × per-month revenue / cost / ships / delta rows
 *   - baseline row (always emitted) for comparison anchoring
 *
 * Reads the same canonical localStorage keys as the comparator:
 *   - `ecom-ops:your-store:v1`
 *   - `ecom-ops:shipped-playbooks:v1`
 *   - `ecom-ops:trajectory-scenario:v1` (Scenario A)
 *   - `ecom-ops:trajectory-scenario-b:v1` (Scenario B)
 *
 * Cross-tab sync via `storage` event so the export reflects the latest
 * operator state without a page reload.
 *
 * Mirrors the canonical `TrajectoryExportButton` / `Top10ExportButton` /
 * `ProgressExportButton` visual style so the dashboard's "export" surfaces
 * stay consistent.
 */

interface ScenarioStorageA {
  schema: "ecommerce-ops-trajectory-scenario";
  version: 1;
  state: { moveId: string | null; delayDays: number };
}

interface ScenarioStorageB {
  schema: "ecommerce-ops-trajectory-scenario-b";
  version: 1;
  enabled: boolean;
  state: { moveId: string | null; delayDays: number };
}

const STORAGE_KEY_A = "ecom-ops:trajectory-scenario:v1";
const STORAGE_KEY_B = "ecom-ops:trajectory-scenario-b:v1";

function loadScenarioA(): { moveId: string | null; delayDays: number } {
  if (typeof window === "undefined") return { moveId: null, delayDays: 30 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_A);
    if (!raw) return { moveId: null, delayDays: 30 };
    const parsed = JSON.parse(raw) as ScenarioStorageA;
    if (parsed?.schema !== "ecommerce-ops-trajectory-scenario") {
      return { moveId: null, delayDays: 30 };
    }
    return {
      moveId: typeof parsed.state?.moveId === "string" ? parsed.state.moveId : null,
      delayDays:
        typeof parsed.state?.delayDays === "number" && parsed.state.delayDays > 0
          ? parsed.state.delayDays
          : 30,
    };
  } catch {
    return { moveId: null, delayDays: 30 };
  }
}

function loadScenarioB(): {
  enabled: boolean;
  state: { moveId: string | null; delayDays: number };
} {
  if (typeof window === "undefined") {
    return { enabled: false, state: { moveId: null, delayDays: 60 } };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_B);
    if (!raw) return { enabled: false, state: { moveId: null, delayDays: 60 } };
    const parsed = JSON.parse(raw) as ScenarioStorageB;
    if (parsed?.schema !== "ecommerce-ops-trajectory-scenario-b") {
      return { enabled: false, state: { moveId: null, delayDays: 60 } };
    }
    return {
      enabled: parsed.enabled === true,
      state: {
        moveId: typeof parsed.state?.moveId === "string" ? parsed.state.moveId : null,
        delayDays:
          typeof parsed.state?.delayDays === "number" && parsed.state.delayDays > 0
            ? parsed.state.delayDays
            : 60,
      },
    };
  } catch {
    return { enabled: false, state: { moveId: null, delayDays: 60 } };
  }
}

export interface TrajectoryScenarioExportButtonProps {
  /** When true, render a compact pill row that fits inside an Overview card. */
  compact?: boolean;
  /** Optional className to allow parent callers to slot the button row. */
  className?: string;
}

export function TrajectoryScenarioExportButton({
  compact = false,
  className,
}: TrajectoryScenarioExportButtonProps) {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [scenarioA, setScenarioA] = useState<{
    moveId: string | null;
    delayDays: number;
  }>({ moveId: null, delayDays: 30 });
  const [scenarioB, setScenarioB] = useState<{
    enabled: boolean;
    state: { moveId: string | null; delayDays: number };
  }>({ enabled: false, state: { moveId: null, delayDays: 60 } });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setScenarioA(loadScenarioA());
    setScenarioB(loadScenarioB());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1" || e.key === null) {
        setStore(loadYourStore());
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1" || e.key === null) {
        setShipped(loadShippedPlaybooks());
      }
      if (e.key === STORAGE_KEY_A || e.key === null) {
        setScenarioA(loadScenarioA());
      }
      if (e.key === STORAGE_KEY_B || e.key === null) {
        setScenarioB(loadScenarioB());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const slots: ScenarioExportSlot[] | null = useMemo(() => {
    if (!hydrated) return null;
    const baseProjection = projectTrajectory(
      store ?? YOUR_STORE_DEFAULTS,
      shipped,
    );
    const shippedSet = new Set(Object.keys(shipped));
    const eligible = MOVE_RECOMMENDATIONS.filter((m) => !shippedSet.has(m.id));

    // Resolve Scenario A move — same fallback the comparator uses.
    const selectedA = scenarioA.moveId
      ? eligible.find((m) => m.id === scenarioA.moveId) ?? null
      : null;
    const effectiveA = selectedA ?? eligible[0] ?? null;
    if (!effectiveA) return null;
    const moveNameA = effectiveA.name;
    const delaysA: TrajectoryDelayMap = {
      [effectiveA.id]: scenarioA.delayDays,
    };
    const delayedA = projectTrajectoryWithDelays(
      store ?? YOUR_STORE_DEFAULTS,
      shipped,
      delaysA,
    );
    const originalEntryA = baseProjection.movesOnHorizon.find(
      (e) => e.move.id === effectiveA.id,
    );

    let delayedB: ReturnType<typeof projectTrajectoryWithDelays> | null = null;
    let moveNameB: string | null = null;
    let effectiveBId: string | null = null;
    if (scenarioB.enabled && eligible.length > 1) {
      const selectedB = scenarioB.state.moveId
        ? eligible.find((m) => m.id === scenarioB.state.moveId) ?? null
        : null;
      const fallbackB =
        eligible.find((m) => m.id !== effectiveA.id) ?? eligible[1] ?? null;
      const effectiveB = selectedB ?? fallbackB;
      if (effectiveB) {
        effectiveBId = effectiveB.id;
        moveNameB = effectiveB.name;
        const delaysB: TrajectoryDelayMap = {
          [effectiveB.id]: scenarioB.state.delayDays,
        };
        delayedB = projectTrajectoryWithDelays(
          store ?? YOUR_STORE_DEFAULTS,
          shipped,
          delaysB,
        );
      }
    }

    return buildScenarioExportSlots({
      baseline: baseProjection,
      delayedA,
      delayedB,
      moveA: {
        moveId: effectiveA.id,
        moveName: moveNameA,
        delayDays: scenarioA.delayDays,
        originalShipMonth: originalEntryA?.shipMonth ?? null,
        delayedShipMonth:
          delayedA.movesOnHorizon.find((e) => e.move.id === effectiveA.id)
            ?.shipMonth ?? null,
      },
      moveB: effectiveBId
        ? {
            moveId: effectiveBId,
            moveName: moveNameB ?? "",
            delayDays: scenarioB.state.delayDays,
            originalShipMonth:
              baseProjection.movesOnHorizon.find(
                (e) => e.move.id === effectiveBId,
              )?.shipMonth ?? null,
            delayedShipMonth:
              delayedB?.movesOnHorizon.find(
                (e) => e.move.id === effectiveBId,
              )?.shipMonth ?? null,
          }
        : null,
      scenarioBEnabled: scenarioB.enabled && delayedB !== null,
    });
  }, [hydrated, store, shipped, scenarioA, scenarioB]);

  const handleExport = () => {
    if (!slots || !store) return;
    const exportedAt = new Date().toISOString().slice(0, 10);
    const csv = buildScenarioExportCsv(slots, {
      aov: store.aov,
      monthlyOrders: store.monthlyOrders,
      grossMargin: store.grossMargin,
      exportedAt,
    });
    const filename = scenarioExportFilename(
      exportedAt,
      scenarioB.enabled && slots.length === 3,
    );
    // Trigger a browser download via Blob + temporary anchor.
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* download blocked — silently ignore */
    }
  };

  if (!hydrated || !slots) {
    return (
      <div
        data-testid="trajectory-scenario-export-placeholder"
        className={cn(
          "rounded border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
      >
        Loading scenario export…
      </div>
    );
  }

  const includesB = scenarioB.enabled && slots.length === 3;
  const label = includesB
    ? "Export scenarios A + B (CSV)"
    : "Export scenario A (CSV)";

  return (
    <div
      data-testid="trajectory-scenario-export-row"
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleExport}
        data-testid="trajectory-scenario-export-csv"
        aria-label={label}
        title={
          includesB
            ? "Download a CSV with baseline + Scenario A + Scenario B (12-month × 3 scenarios × all deltas)"
            : "Download a CSV with baseline + Scenario A (12-month × 2 scenarios × all deltas)"
        }
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono uppercase tracking-wider transition-colors",
          "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        <span aria-hidden="true">↓</span>
        <span>{label}</span>
      </button>
      <span
        data-testid="trajectory-scenario-export-hint"
        className="text-[10px] text-muted-foreground italic"
      >
        {includesB
          ? `Baseline + A (${scenarioA.delayDays}d) + B (${scenarioB.state.delayDays}d) → 36 rows`
          : `Baseline + A (${scenarioA.delayDays}d) → 24 rows`}
      </span>
    </div>
  );
}
