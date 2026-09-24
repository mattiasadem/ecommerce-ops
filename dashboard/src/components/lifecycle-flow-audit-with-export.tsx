"use client";

import { useEffect, useState } from "react";
import {
  LifecycleFlowHealthAudit,
} from "@/components/lifecycle-flow-health-audit";
import { LifecycleFlowExportButton } from "@/components/lifecycle-flow-export-button";
import type { FlowKpis } from "@/lib/lifecycle-flow-health";

/**
 * `LifecycleFlowAuditWithExport` — client wrapper that bridges the
 * `<LifecycleFlowHealthAudit />` panel (which owns the localStorage
 * hydration of `ecom-ops:lifecycle-flow-health:v1`) and the new
 * `<LifecycleFlowExportButton />` (which builds CSV/JSON from the same
 * KPI snapshot map).
 *
 * Why this exists: the audit component is the single source of truth
 * for the 13-flow KPI map in the browser. It loads from localStorage on
 * mount and re-renders on every input change. Mounting the export
 * button directly on the server page would force the page to ship a
 * second hydrating client component, doubling the network round-trip
 * and risking state drift between the two readers. This wrapper loads
 * the KPI map ONCE (in this client component) and passes it to both
 * children via props, so the export button always reflects the exact
 * state the audit is showing — no second localStorage read, no drift.
 *
 * Cross-tab sync: listens to the standard `storage` event (so a flip in
 * another tab re-hydrates), and listens to the
 * `ecom-ops:lifecycle-flow-health:update` custom event the audit fires
 * after each save (so the export button sees same-tab edits without
 * waiting for a remount).
 *
 * Mounted on `/lifecycle` between the static Cost & ROI card and the
 * per-pillar breakdown.
 */

const STORAGE_KEY = "ecom-ops:lifecycle-flow-health:v1";
const UPDATE_EVENT = "ecom-ops:lifecycle-flow-health:update";

function loadStored(): Record<string, FlowKpis> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, FlowKpis>;
  } catch {
    /* ignore */
  }
  return {};
}

export function LifecycleFlowAuditWithExport() {
  const [kpisByFlow, setKpisByFlow] = useState<Record<string, FlowKpis>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setKpisByFlow(loadStored());
    setHydrated(true);
    function refresh() {
      setKpisByFlow(loadStored());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <LifecycleFlowHealthAudit />
      {hydrated && <LifecycleFlowExportButton kpisByFlow={kpisByFlow} />}
    </div>
  );
}
