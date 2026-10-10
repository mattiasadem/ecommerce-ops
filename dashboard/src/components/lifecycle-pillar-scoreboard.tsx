"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/format";
import type { FlowKpis, FlowVerdict } from "@/lib/lifecycle-flow-health";
import {
  PILLAR_IDS,
  type LifecyclePillarScoreboardResult,
  buildPillarScoreboard,
  renderPillarScoreboardMarkdown,
} from "@/lib/lifecycle-pillar-scoreboard";

/**
 * `Lifecycle Pillar Scoreboard` — Move #N.13 — interactive cross-tool
 * on `/lifecycle` between the audit table and the per-flow fix
 * recipe card.
 *
 * Reads the same `ecom-ops:lifecycle-flow-health:v1` storage key the
 * Lifecycle Flow Health Audit writes (so editing a KPI snapshot
 * upstream re-flows this card instantly) and groups the 13 Path-B
 * flows into the 5 canonical pillars (P1 Browse-abandon / P2 Winback
 * / P3 Post-purchase-loyalty / P4 Replenishment / P5 Celebratory).
 *
 * Renders:
 *   - 5 per-pillar cards (avg score · verdict counts · worst flow ·
 *     worst gate · at-risk revenue/mo band)
 *   - Fleet rollup strip (total at-risk revenue/mo + worst pillar)
 *   - One-click "Copy markdown" button for Slack/Discord/email handoff
 *   - Empty-state CTA → "Open the audit →" when no flows have been
 *     audited yet (mirrors the Lifecycle Fleet Rollup empty-state
 *     pattern)
 *
 * Cross-tab sync via the standard `storage` event (so a flip in
 * another tab re-hydrates) AND via the
 * `ecom-ops:lifecycle-flow-health:update` custom event the audit
 * fires after each save (so this card sees same-tab edits without
 * waiting for a remount). Same pattern as
 * LifecycleFlowAuditWithExport.
 *
 * State-persistence: reads only. The audit component is the single
 * source of truth for the 13-flow KPI map; this scoreboard is a
 * read-only rollup view.
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

const VERDICT_PILL: Record<FlowVerdict, string> = {
  PASS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  WARN: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  NEEDS_WORK:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  FAIL: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

function pillarIntent(p: {
  average_score: number;
  verdict_counts: { FAIL: number; NEEDS_WORK: number };
}): "success" | "warning" | "danger" {
  if (p.verdict_counts.FAIL > 0) return "danger";
  if (p.verdict_counts.NEEDS_WORK > 0 || p.average_score < 75) return "warning";
  return "success";
}

function pillarIntentClass(intent: "success" | "warning" | "danger"): string {
  if (intent === "danger")
    return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400";
  if (intent === "warning")
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
}

export function LifecyclePillarScoreboard() {
  const [kpisByFlow, setKpisByFlow] = useState<Record<string, FlowKpis>>({});
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setKpisByFlow(loadStored());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    const onUpdate = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, onUpdate);
    };
  }, [refresh]);

  const result: LifecyclePillarScoreboardResult = useMemo(
    () => buildPillarScoreboard(kpisByFlow),
    [kpisByFlow],
  );

  const markdown = useMemo(
    () => renderPillarScoreboardMarkdown(result),
    [result],
  );

  if (!hydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lifecycle Pillar Scoreboard</CardTitle>
          <CardDescription>
            Per-pillar rollup of the 13-flow Lifecycle Health Audit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Loading…</div>
        </CardContent>
      </Card>
    );
  }

  if (result.flows_scored === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lifecycle Pillar Scoreboard</CardTitle>
          <CardDescription>
            Per-pillar rollup of the 13-flow Lifecycle Health Audit. Reads the
            same storage key the audit table writes — fill out the audit above
            and this card re-flows instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-sm">
            <p className="text-muted-foreground">
              No flows audited yet. Open the Lifecycle Health Audit above, click{" "}
              <span className="font-mono text-xs">Seed canonical pass</span> or
              enter your own 30-day KPI snapshots, and the per-pillar scoreboard
              renders here.
            </p>
            <p className="text-xs text-muted-foreground">
              Pillar rollup uses the canonical{" "}
              <span className="font-mono">REVENUE_FLOORS_PER_PILLAR</span> table
              from <span className="font-mono">scripts/lifecycle_flow_health_check.py</span>
              — P1 $300–$800, P2 $400–$1200, P3 $500–$1500, P4 $800–$2500, P5
              $200–$800 (revenue / 1k sent).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const failTotal = result.pillars.reduce((n, p) => n + p.verdict_counts.FAIL, 0);
  const needsWorkTotal = result.pillars.reduce(
    (n, p) => n + p.verdict_counts.NEEDS_WORK,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">
              Lifecycle Pillar Scoreboard
            </CardTitle>
            <CardDescription>
              {result.flows_scored}/13 flows audited · {result.pillars_scored}/5
              pillars scored · per-pillar avg, worst flow, worst gate, at-risk
              revenue.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                failTotal > 0
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  : "border-border text-muted-foreground",
              )}
            >
              {failTotal} FAIL
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                needsWorkTotal > 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-border text-muted-foreground",
              )}
            >
              {needsWorkTotal} NEEDS_WORK
            </Badge>
            <CopyButton
              value={markdown}
              label="Copy scoreboard"
              className="text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fleet rollup strip */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Total at-risk revenue/mo
            </div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums">
              {formatUsd(result.total_at_risk_revenue_monthly)}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              Band {formatUsd(result.total_lost_revenue_band[0])}–
              {formatUsd(result.total_lost_revenue_band[1])}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Worst pillar
            </div>
            <div className="mt-0.5 text-base font-semibold">
              {result.worst_pillar
                ? result.worst_pillar.pillar_label
                : "All passing"}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {result.worst_pillar
                ? `avg ${result.worst_pillar.average_score} · ${result.worst_pillar.flows_scored} flows`
                : "Fix the worst gate per pillar next."}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Pillars covered
            </div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums">
              {result.pillars_scored}
              <span className="text-base text-muted-foreground font-normal ml-1">
                /5
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {PILLAR_IDS.length - result.pillars_scored === 0
                ? "All 5 pillars have data"
                : `${PILLAR_IDS.length - result.pillars_scored} pillar(s) need auditing`}
            </div>
          </div>
        </div>

        <Separator />

        {/* Per-pillar cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {result.pillars.map((p) => {
            const intent = pillarIntent(p);
            return (
              <div
                key={p.pillar}
                className={cn(
                  "rounded-md border px-3 py-3 transition-colors",
                  intent === "danger"
                    ? "border-rose-500/30 bg-rose-500/5"
                    : intent === "warning"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-emerald-500/30 bg-emerald-500/5",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-medium">{p.pillar_label}</div>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", pillarIntentClass(intent))}
                  >
                    avg {p.average_score}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5",
                      VERDICT_PILL.PASS,
                    )}
                  >
                    {p.verdict_counts.PASS} PASS
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5",
                      VERDICT_PILL.WARN,
                    )}
                  >
                    {p.verdict_counts.WARN} WARN
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5",
                      VERDICT_PILL.NEEDS_WORK,
                    )}
                  >
                    {p.verdict_counts.NEEDS_WORK} NEEDS_WORK
                  </span>
                  {p.verdict_counts.FAIL > 0 && (
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5",
                        VERDICT_PILL.FAIL,
                      )}
                    >
                      {p.verdict_counts.FAIL} FAIL
                    </span>
                  )}
                </div>

                {p.worst_flow && (
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">Worst flow:</span>{" "}
                    <span className="font-medium">{p.worst_flow.flow_name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      (score {p.worst_flow.overall_score} ·{" "}
                      {p.worst_flow.verdict})
                    </span>
                  </div>
                )}
                {p.worst_gate && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Worst gate:{" "}
                    <span className="font-mono">{p.worst_gate.gate}</span> ×
                    {p.worst_gate.count} — {p.worst_gate.message}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-muted-foreground">
                  At-risk revenue/mo:{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {formatUsd(p.at_risk_revenue_monthly)}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    (band {formatUsd(p.lost_revenue_band[0])}–
                    {formatUsd(p.lost_revenue_band[1])})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Reads the same storage key as the Lifecycle Health Audit above
          (<span className="font-mono">{STORAGE_KEY}</span>) + the canonical{" "}
          <span className="font-mono">REVENUE_FLOORS_PER_PILLAR</span> table
          from <span className="font-mono">scripts/lifecycle_flow_health_check.py</span>.
          Same numbers, same verdict bands — Python CLI ↔ browser parity.
        </p>
      </CardContent>
    </Card>
  );
}