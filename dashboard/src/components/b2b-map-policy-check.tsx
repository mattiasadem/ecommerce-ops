"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertSeverity,
  MAP_LEVERS,
  MAP_POLICY_DEFAULTS,
  MAP_POLICY_THRESHOLDS,
  MapLeverId,
  MapPolicyAlert,
  MapPolicyInputs,
  buildAlertPayload,
  clampMapPolicyNumber,
  loadStoredMapPolicy,
  renderMapPolicyMarkdown,
  saveMapPolicyInputs,
  validateMapPolicyInputs,
} from "@/lib/b2b-map-policy";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `B2B MAP-policy self-check` — interactive form on `/b2b`.
 *
 * Operator enters their MAP-policy posture across the 5 canonical Pillar-4
 * levers (research/10 §Pillar 4) + 3 optional reinforcement levers, plus
 * DTC cannibalization % and last-30d violation counts. The rule engine
 * (port of `scripts/b2b_map_policy_check.py::_decide_should_fire` +
 * `_build_alert_payload`) instantly classifies the state as
 * critical / warning / info / pass and returns a Slack-ready alert payload.
 *
 * Outputs:
 *  - Severity badge + 1-line summary
 *  - Per-lever status grid (✅ / ❌) with the canonical lever tagged
 *  - Root-cause remediation card (the lever most likely to fix it)
 *  - One-click "Copy alert markdown" → paste-ready Slack block
 *  - One-click "Download alert JSON" → saved as `b2b-map-policy-alert-YYYY-MM-DD.json`
 *
 * State persists in localStorage (`ecom-ops:b2b-map-policy:v1`). No
 * server round-trip, no new dependency, no inputs to type that aren't
 * already in research/10.
 */

const SEVERITY_TONE: Record<
  AlertSeverity,
  { label: string; classes: string }
> = {
  critical: {
    label: "critical — alert",
    classes:
      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  warning: {
    label: "warning — drift",
    classes:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  info: {
    label: "info — pass",
    classes:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

function severityBadge(severity: AlertSeverity): string {
  const tone = SEVERITY_TONE[severity];
  return tone.label;
}

export function B2bMapPolicyCheck() {
  const [inputs, setInputs] = useState<MapPolicyInputs>(MAP_POLICY_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [brandId, setBrandId] = useState("operator-store");

  // Hydrate from localStorage on mount (server renders with defaults so
  // the markup matches between server and client — no hydration mismatch).
  useEffect(() => {
    const stored = loadStoredMapPolicy();
    if (stored) {
      setInputs(stored);
    }
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveMapPolicyInputs(inputs);
  }, [inputs, hydrated]);

  // Live alert payload — recomputes on every keystroke.
  const alert: MapPolicyAlert = useMemo(
    () => buildAlertPayload(inputs, brandId),
    [inputs, brandId],
  );

  const validationErrors = useMemo(() => validateMapPolicyInputs(inputs), [inputs]);

  const markdown = useMemo(
    () => renderMapPolicyMarkdown(alert, brandId),
    [alert, brandId],
  );

  function toggleLever(lever: MapLeverId) {
    setInputs((prev) => ({
      ...prev,
      levers: { ...prev.levers, [lever]: !prev.levers[lever] },
    }));
  }

  function setNumber<K extends keyof MapPolicyInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetToDefaults() {
    setInputs(MAP_POLICY_DEFAULTS);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ inputs, alert }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `b2b-map-policy-alert-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const severityClasses = SEVERITY_TONE[alert.severity].classes;

  return (
    <div className="flex flex-col gap-6">
      {/* === HEADER === */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #14.5 companion · direct port of scripts/b2b_map_policy_check.py
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          B2B MAP-policy self-check
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Walk through the 5 canonical Pillar-4 MAP-policy levers from
          research/10 + the 3 optional reinforcement levers. Add your
          last-30d violation counts and DTC cannibalization %. The rule
          engine instantly decides whether to fire a critical / warning / pass
          alert with the exact root-cause hypothesis + remediation text you
          can copy to Slack or paste into the operator-build handoff.
        </p>
      </div>

      {/* === TOP ROW: inputs === */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-brand"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Brand ID
          </label>
          <input
            id="b2b-map-brand"
            type="text"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            placeholder="operator-store"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-sku"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Wholesale SKUs
          </label>
          <input
            id="b2b-map-sku"
            type="number"
            min={0}
            step={1}
            value={inputs.wholesaleSkuCount}
            onChange={(e) =>
              setNumber(
                "wholesaleSkuCount",
                clampMapPolicyNumber(Number(e.target.value), 0, 100000),
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-arpu"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            ARPU ratio (wholesale / DTC)
          </label>
          <input
            id="b2b-map-arpu"
            type="number"
            min={0}
            max={5}
            step={0.05}
            value={inputs.wholesaleArpuRatioVsDtc}
            onChange={(e) =>
              setNumber(
                "wholesaleArpuRatioVsDtc",
                clampMapPolicyNumber(Number(e.target.value), 0, 5),
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-cann"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            DTC cannibalization %
          </label>
          <input
            id="b2b-map-cann"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={inputs.dtcCannibalizationPct}
            onChange={(e) =>
              setNumber(
                "dtcCannibalizationPct",
                clampMapPolicyNumber(Number(e.target.value), 0, 100),
              )
            }
            className={cn(
              "rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring",
              inputs.dtcCannibalizationPct > MAP_POLICY_THRESHOLDS.fire_on_dtc_cannibalization_pct &&
                "border-rose-500/50",
            )}
          />
          <span className="text-[10px] text-muted-foreground">
            threshold: {MAP_POLICY_THRESHOLDS.fire_on_dtc_cannibalization_pct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={inputs.wholesaleChannelActive}
            onChange={(e) =>
              setInputs((prev) => ({
                ...prev,
                wholesaleChannelActive: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-border"
          />
          <span>Wholesale channel active</span>
        </label>
        <button
          type="button"
          onClick={resetToDefaults}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
        >
          Reset to defaults
        </button>
      </div>

      {/* === LEVERS === */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MAP_LEVERS.map((lever) => {
          const active = inputs.levers[lever.id];
          return (
            <button
              type="button"
              key={lever.id}
              onClick={() => toggleLever(lever.id)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-rose-500/40 bg-rose-500/5",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {lever.canonical ? "[canonical]" : "[optional]"}
                  </span>
                  <span className="text-sm font-medium leading-tight">
                    {lever.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lever.description}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                    active
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/20 text-rose-700 dark:text-rose-300",
                  )}
                >
                  {active ? "✅ active" : "❌ missing"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* === VIOLATIONS === */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-violations"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            MAP violations (30d)
          </label>
          <input
            id="b2b-map-violations"
            type="number"
            min={0}
            step={1}
            value={inputs.mapViolationsLast30d}
            onChange={(e) =>
              setNumber(
                "mapViolationsLast30d",
                clampMapPolicyNumber(Number(e.target.value), 0, 100000),
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-warn"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            1st-violation warnings (30d)
          </label>
          <input
            id="b2b-map-warn"
            type="number"
            min={0}
            step={1}
            value={inputs.firstViolationWarningsLast30d}
            onChange={(e) =>
              setNumber(
                "firstViolationWarningsLast30d",
                clampMapPolicyNumber(Number(e.target.value), 0, 100000),
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-susp"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            2nd-violation suspensions (30d)
          </label>
          <input
            id="b2b-map-susp"
            type="number"
            min={0}
            step={1}
            value={inputs.secondViolationSuspensionsLast30d}
            onChange={(e) =>
              setNumber(
                "secondViolationSuspensionsLast30d",
                clampMapPolicyNumber(Number(e.target.value), 0, 100000),
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="b2b-map-term"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            3rd-violation terminations (30d)
          </label>
          <input
            id="b2b-map-term"
            type="number"
            min={0}
            step={1}
            value={inputs.thirdViolationTerminationsLast30d}
            onChange={(e) =>
              setNumber(
                "thirdViolationTerminationsLast30d",
                clampMapPolicyNumber(Number(e.target.value), 0, 100000),
              )
            }
            className={cn(
              "rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring",
              inputs.thirdViolationTerminationsLast30d >=
                MAP_POLICY_THRESHOLDS.fire_on_3rd_violation_terminations_30d &&
                "border-amber-500/50",
            )}
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          <strong>Validation:</strong>
          <ul className="mt-1 list-disc pl-5">
            {validationErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* === ALERT PAYLOAD === */}
      <div
        className={cn(
          "rounded-lg border p-4",
          severityClasses,
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-widest">
            {severityBadge(alert.severity)}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            rule engine output
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-tight">
          {alert.title}
        </h3>
        <p className="mt-1 text-sm">{alert.summary}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <Metric label="canonical missing" value={`${alert.missingPillar4.length} / 5`} />
          <Metric label="optional missing" value={`${alert.missingOptional.length} / 3`} />
          <Metric label="cannibalization" value={fmtPct(alert.cannibalizationPct)} />
          <Metric label="3rd-viol terms (30d)" value={fmtInt(alert.thirdTerminations30d)} />
        </div>
      </div>

      {/* === ROOT CAUSE === */}
      {alert.rootCause && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            root-cause hypothesis
          </span>
          <h4 className="mt-1 text-base font-semibold">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {alert.rootCause.id}
            </code>
          </h4>
          <p className="mt-2 text-sm">{alert.rootCause.remediation}</p>
          {alert.rootCause.additionalMissingLevers.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Also missing (in priority order):{" "}
              {alert.rootCause.additionalMissingLevers.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* === PER-LEVER REMEDIATION TABLE === */}
      {alert.missingPillar4.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            per-lever remediation
          </span>
          <h4 className="mt-1 text-base font-semibold">
            What to fix for each missing canonical lever
          </h4>
          <div className="mt-3 flex flex-col gap-3">
            {alert.leverBreakdown
              .filter((l) => l.canonical && !l.active)
              .map((lever) => (
                <div
                  key={lever.id}
                  className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm"
                >
                  <div className="font-medium">
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {lever.id}
                    </code>{" "}
                    — {lever.label}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {lever.remediation}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* === ALERT PAYLOAD EXPORT === */}
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            paste-ready alert payload
          </span>
          <div className="flex gap-2">
            <CopyButton value={markdown} label="Copy alert markdown" />
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-md border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
            >
              Download JSON
            </button>
          </div>
        </div>
        <pre className="mt-2 max-h-96 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs leading-relaxed">
          {markdown}
        </pre>
      </div>

      {/* === FOOTNOTE === */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Scoring rules + thresholds + remediation text mirror{" "}
        <code className="rounded bg-muted px-1 py-0.5">
          scripts/b2b_map_policy_check.py
        </code>{" "}
        byte-for-byte (canonical 5 Pillar-4 levers + 3 optional levers per
        research/10 §Pillar 4 + 4 fire-rules from the operator-build
        playbook). State persists across reloads via localStorage
        (key <code className="rounded bg-muted px-1 py-0.5">
          ecom-ops:b2b-map-policy:v1
        </code>
        ).
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}
