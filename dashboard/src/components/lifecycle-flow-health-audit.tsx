"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PATH_B_FLOWS,
  FlowKpis,
  FlowScore,
  FlowVerdict,
  LifecycleFlow,
  buildHealthReport,
  canonicalPassKpis,
  pillarShort,
  verdictBadgeClasses,
  verdictShortLabel,
} from "@/lib/lifecycle-flow-health";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Interactive Lifecycle Flow Health Audit.
 *
 * Direct browser port of `scripts/lifecycle_flow_health_check.py`. The
 * operator enters per-flow 30-day KPI snapshots (sent, opens, clicks,
 * conversions, unsubscribes, revenue, flow_attributed) for each of the 13
 * Path-B live flows, and the panel scores every flow against the 6 canonical
 * gates (open_rate, click_rate, cvr, unsub_rate, revenue_per_1k vs per-pillar
 * floor, flow_attribution_match) and returns a 0–100 score + 4-tier verdict
 * (PASS · WARN · NEEDS_WORK · FAIL) per flow plus a fleet-wide summary.
 *
 * A "Seed canonical pass" button fills all 13 flows with the canonical-pass
 * KPI set (42% open, 6% click, 1.2% CVR, 0.15% unsub, mid-floor revenue,
 * 70% attribution match) — useful for demoing the PASS band without typing
 * 91 inputs. A "Stress-test fail" button shifts every flow's CVR -30% so the
 * operator can see the FAIL band without manual data entry.
 *
 * Inputs persist to localStorage (`ecom-ops:lifecycle-flow-health:v1`) so the
 * operator's real KPI snapshots survive reloads. Copy-report emits a paste-
 * ready markdown audit to the clipboard. Reset-defaults clears all 13 flows.
 *
 * Mounted on `/lifecycle` between the asset-14 card and the "Future-tick
 * companions" footer (replacing the now-shipped #1 entry of that list).
 */

const STORAGE_KEY = "ecom-ops:lifecycle-flow-health:v1";
type KpiField = keyof FlowKpis;

const NUMBER_FIELDS: Array<{
  field: KpiField;
  label: string;
  step: number;
  min: number;
  prefix?: string;
  suffix?: string;
}> = [
  { field: "sent", label: "Sent", step: 100, min: 0, suffix: "events" },
  { field: "opens", label: "Opens", step: 10, min: 0, suffix: "events" },
  { field: "clicks", label: "Clicks", step: 10, min: 0, suffix: "events" },
  { field: "conversions", label: "Conversions", step: 1, min: 0, suffix: "events" },
  { field: "unsubscribes", label: "Unsubscribes", step: 1, min: 0, suffix: "events" },
  { field: "revenue", label: "Revenue", step: 50, min: 0, prefix: "$", suffix: "USD" },
  { field: "flow_attributed", label: "Flow-attributed", step: 1, min: 0, suffix: "conversions" },
];

function emptyKpis(): FlowKpis {
  return { sent: 0, opens: 0, clicks: 0, conversions: 0, unsubscribes: 0, revenue: 0, flow_attributed: 0 };
}

function clamp(value: number, min: number): number {
  if (Number.isNaN(value)) return min;
  return value < min ? min : value;
}

function loadStored(): Record<string, FlowKpis> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, FlowKpis>;
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(kpisByFlow: Record<string, FlowKpis>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kpisByFlow));
  } catch {
    /* quota / private mode */
  }
}

function FlowRow({
  flow,
  kpis,
  onChange,
}: {
  flow: LifecycleFlow;
  kpis: FlowKpis;
  onChange: (next: FlowKpis) => void;
}) {
  const setField = (field: KpiField, raw: string) => {
    const num = parseFloat(raw);
    onChange({ ...kpis, [field]: clamp(Number.isNaN(num) ? 0 : num, 0) });
  };
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-muted-foreground">
            {flow.flow_id} · T{flow.tier} · {flow.channel}
          </span>
          <span className="text-sm font-semibold leading-tight">{flow.flow_name}</span>
          <span className="text-[10px] text-muted-foreground">{pillarShort(flow.pillar)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4 lg:grid-cols-7">
        {NUMBER_FIELDS.map((cfg) => (
          <label key={cfg.field} className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{cfg.label}</span>
            <div className="flex items-center gap-1">
              {cfg.prefix && (
                <span className="text-[10px] text-muted-foreground font-mono">{cfg.prefix}</span>
              )}
              <input
                type="number"
                inputMode="decimal"
                step={cfg.step}
                min={cfg.min}
                value={kpis[cfg.field]}
                onChange={(e) => setField(cfg.field, e.target.value)}
                className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function FlowScoreRow({ score }: { score: FlowScore }) {
  return (
    <div className={cn("rounded-lg border p-3 flex flex-col gap-1.5", verdictBadgeClasses(score.verdict))}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] opacity-70">
            {score.flow_id} · {score.channel} · T{score.tier}
          </span>
          <span className="text-sm font-semibold leading-tight">{score.flow_name}</span>
          <span className="text-[10px] opacity-70">{pillarShort(score.pillar)}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-2xl font-semibold tabular-nums">{score.overall_score}</span>
          <span className="text-[10px] uppercase tracking-wider opacity-70">{score.verdict}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[10px] tabular-nums md:grid-cols-6">
        <span>open {formatPercent(score.open_rate, 1)}</span>
        <span>click {formatPercent(score.click_rate, 1)}</span>
        <span>cvr {formatPercent(score.cvr, 2)}</span>
        <span>unsub {formatPercent(score.unsubscribe_rate, 2)}</span>
        <span>rev/1k {formatUsd(score.revenue_per_1k)}</span>
        <span>attr {formatPercent(score.flow_attribution_match, 0)}</span>
      </div>
      {score.failed_gates.length > 0 && (
        <ul className="text-[10px] leading-relaxed opacity-80 list-disc pl-4 mt-1">
          {score.failed_gates.map((fg, idx) => (
            <li key={idx}>
              <span className="font-mono font-semibold">Gate {fg.gate}</span> — {fg.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LifecycleFlowHealthAudit() {
  const [kpisByFlow, setKpisByFlow] = useState<Record<string, FlowKpis>>(() => {
    const init: Record<string, FlowKpis> = {};
    for (const f of PATH_B_FLOWS) init[f.flow_id] = emptyKpis();
    return init;
  });
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTier, setActiveTier] = useState<"all" | 1 | 2 | 3>("all");

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      // Merge stored over defaults so missing keys fall back to zeros
      const merged: Record<string, FlowKpis> = {};
      for (const f of PATH_B_FLOWS) {
        merged[f.flow_id] = { ...emptyKpis(), ...(stored[f.flow_id] ?? {}) };
      }
      setKpisByFlow(merged);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(kpisByFlow);
  }, [kpisByFlow, hydrated]);

  const report = useMemo(() => buildHealthReport(kpisByFlow), [kpisByFlow]);

  const flowsForTier = useMemo(() => {
    if (activeTier === "all") return PATH_B_FLOWS;
    return PATH_B_FLOWS.filter((f) => f.tier === activeTier);
  }, [activeTier]);

  const scoresByFlowId = useMemo(() => {
    const m: Record<string, FlowScore> = {};
    for (const s of report.scores) m[s.flow_id] = s;
    return m;
  }, [report]);

  const setFlowKpis = (flowId: string, next: FlowKpis) => {
    setKpisByFlow((prev) => ({ ...prev, [flowId]: next }));
  };

  const seedCanonicalPass = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Seed all 13 flows with the canonical-pass KPI set?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    const next: Record<string, FlowKpis> = {};
    for (const f of PATH_B_FLOWS) next[f.flow_id] = canonicalPassKpis(f);
    setKpisByFlow(next);
  };

  const stressTestFail = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Stress-test: shift every flow's CVR -30% (open, click, attribution unchanged) to surface the FAIL band?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    const next: Record<string, FlowKpis> = {};
    for (const f of PATH_B_FLOWS) {
      const base = canonicalPassKpis(f);
      const stressedConversions = Math.round(base.conversions * 0.7);
      next[f.flow_id] = {
        ...base,
        conversions: stressedConversions,
        revenue: Math.round(base.revenue * 0.7 * 100) / 100,
        flow_attributed: Math.round(stressedConversions * 0.7),
      };
    }
    setKpisByFlow(next);
  };

  const resetAll = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset all 13 flows to empty (no KPI data entered)?");
      if (!ok) return;
    }
    const next: Record<string, FlowKpis> = {};
    for (const f of PATH_B_FLOWS) next[f.flow_id] = emptyKpis();
    setKpisByFlow(next);
  };

  const copyReport = async () => {
    const lines: string[] = [];
    lines.push("# Lifecycle Flow Health Audit");
    lines.push("");
    lines.push(`Floors — open ≥35%, click ≥4%, cvr ≥0.8%, unsub ≤0.3%, revenue/1k per pillar, attribution ≥60%.`);
    lines.push(`Verdicts — PASS 90–100 / WARN 75–89 / NEEDS_WORK 50–74 / FAIL 0–49.`);
    lines.push("");
    lines.push(`Fleet: ${report.summary.total} flows scored — ${report.summary.PASS} PASS · ${report.summary.WARN} WARN · ${report.summary.NEEDS_WORK} NEEDS_WORK · ${report.summary.FAIL} FAIL.`);
    lines.push(`Overall: ${report.overall_passed ? "ALL FLOWS AT OR ABOVE WARN FLOOR ✓" : "AT LEAST ONE FLOW BELOW WARN FLOOR ✗"}`);
    lines.push("");

    const order: FlowVerdict[] = ["FAIL", "NEEDS_WORK", "WARN", "PASS"];
    for (const v of order) {
      const scores = report.scores.filter((s) => s.verdict === v);
      if (scores.length === 0) continue;
      lines.push(`## ${v} (${scores.length})`);
      for (const s of scores) {
        lines.push(
          `- **${s.flow_id} ${s.flow_name}** (${pillarShort(s.pillar)} · T${s.tier}) — score **${s.overall_score}/100**`,
        );
        lines.push(
          `  open ${formatPercent(s.open_rate, 1)} · click ${formatPercent(s.click_rate, 1)} · cvr ${formatPercent(s.cvr, 2)} · unsub ${formatPercent(s.unsubscribe_rate, 2)} · rev/1k ${formatUsd(s.revenue_per_1k)} · attr ${formatPercent(s.flow_attribution_match, 0)}`,
        );
        for (const fg of s.failed_gates) {
          lines.push(`  - Gate ${fg.gate} — ${fg.message}`);
        }
      }
      lines.push("");
    }

    lines.push("_Same math as scripts/lifecycle_flow_health_check.py — research/05 §Pillars + playbook 12 §Verification._");
    const md = lines.join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // Sort scores worst-first for the summary view
  const sortedScores = useMemo(() => {
    const order: FlowVerdict[] = ["FAIL", "NEEDS_WORK", "WARN", "PASS"];
    return [...report.scores].sort((a, b) => {
      const oa = order.indexOf(a.verdict);
      const ob = order.indexOf(b.verdict);
      if (oa !== ob) return oa - ob;
      return a.overall_score - b.overall_score;
    });
  }, [report]);

  const fleetRingColor =
    report.summary.FAIL > 0
      ? "border-rose-500/40 bg-rose-500/5"
      : report.summary.NEEDS_WORK > 0
        ? "border-amber-500/40 bg-amber-500/5"
        : report.summary.WARN > 0
          ? "border-sky-500/40 bg-sky-500/5"
          : "border-emerald-500/40 bg-emerald-500/5";

  return (
    <div
      id="lifecycle-flow-health-audit"
      className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", fleetRingColor)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive audit · research/05 + playbook 12 + asset 14
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Lifecycle flow health — score all 13 Path-B flows in 2 minutes
          </h3>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/lifecycle_flow_health_check.py</code>.
            Enter each flow&apos;s last-30-days Klaviyo/Postscript KPI snapshot — the
            panel scores every flow against the 6 canonical gates (open ≥35%, click
            ≥4%, CVR ≥0.8%, unsub ≤0.3%, revenue/1k per pillar floor, attribution
            ≥60%) and surfaces a 0–100 score + verdict + prioritized fix-list.
            Inputs persist to your browser; use the seed/stress buttons to demo
            the PASS and FAIL bands without typing 91 numbers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={seedCanonicalPass}
            className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Seed canonical pass
          </button>
          <button
            type="button"
            onClick={stressTestFail}
            className="inline-flex items-center rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Stress-test FAIL
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={copyReport}
            className={cn(
              "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {copied ? "Copied ✓" : "Copy report"}
          </button>
        </div>
      </div>

      {/* Fleet summary strip */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Flows scored</span>
          <span className="text-xl font-semibold tabular-nums">
            {report.summary.total}<span className="text-base text-muted-foreground font-normal"> / {PATH_B_FLOWS.length}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            {report.summary.total === 0 ? "Enter KPIs below to score" : `${report.summary.total} of ${PATH_B_FLOWS.length} Path-B flows`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">PASS</span>
          <span className="text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {report.summary.PASS}
          </span>
          <span className="text-[10px] text-muted-foreground">90–100 · all 6 gates</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">WARN</span>
          <span className="text-xl font-semibold tabular-nums text-sky-700 dark:text-sky-400">
            {report.summary.WARN}
          </span>
          <span className="text-[10px] text-muted-foreground">75–89 · ≤1 gate failed</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">NEEDS_WORK</span>
          <span className="text-xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
            {report.summary.NEEDS_WORK}
          </span>
          <span className="text-[10px] text-muted-foreground">50–74 · 2–3 gates failed</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">FAIL</span>
          <span className="text-xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {report.summary.FAIL}
          </span>
          <span className="text-[10px] text-muted-foreground">0–49 · ≥4 gates failed</span>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-[11px]">
        <span className="text-muted-foreground">Filter by tier:</span>
        {(["all", 1, 2, 3] as const).map((t) => (
          <button
            key={String(t)}
            type="button"
            onClick={() => setActiveTier(t)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              activeTier === t
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {t === "all" ? "All 13 flows" : `Tier ${t}`}
          </button>
        ))}
      </div>

      {/* KPI input grid (per flow) */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          KPI inputs (last 30 days)
        </span>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {flowsForTier.map((f) => (
            <FlowRow
              key={f.flow_id}
              flow={f}
              kpis={kpisByFlow[f.flow_id] ?? emptyKpis()}
              onChange={(next) => setFlowKpis(f.flow_id, next)}
            />
          ))}
        </div>
      </div>

      {/* Per-flow score list (worst-first) */}
      {report.scores.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Per-flow scores (worst-first)
            </span>
            <span className="text-[10px] text-muted-foreground">
              {sortedScores.length} scored · click to copy
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {sortedScores.map((s) => (
              <FlowScoreRow key={s.flow_id} score={s} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match a $5M-GMV DTC brand (Path B, 13 flows live 30+ days).
          Open playbook{" "}
          <code className="font-mono text-[11px]">12-lifecycle-flow-library</code>{" "}
          below for the per-tier launch ladder + verification gates.
        </span>
        <span className="font-mono text-[10px]">
          {verdictShortLabel("PASS")} · {verdictShortLabel("WARN")} · {verdictShortLabel("NEEDS_WORK")} · {verdictShortLabel("FAIL")}
        </span>
      </div>
    </div>
  );
}