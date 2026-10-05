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
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  PATH_B_FLOWS,
  buildHealthReport,
  verdictBadgeClasses,
  verdictShortLabel,
  type FlowKpis,
  type FlowScore,
} from "@/lib/lifecycle-flow-health";
import {
  buildFlowFixRecipe,
  formatUsdPer1k,
  formatSroiPerDay,
  formatEffortDays,
  recipeToMarkdown,
  sroiToneClass,
  type FlowFixRecipe,
} from "@/lib/flow-fix-recipe";

/**
 * `Flow fix recipe` — Move #N.12 — per-flow prioritized fix drilldown on `/lifecycle`.
 *
 * The Move #N.9 operator-action-digest on `/today` lists P0 BLOCK actions like
 * "Lifecycle flow 1.1_browse_abandon FAIL → /lifecycle#1.1_browse_abandon" but
 * when the operator lands on `/lifecycle`, the existing audit panel only shows
 * the SCORE + the failed-gate error messages ("Open rate 12% < 35% floor").
 * The operator is then left asking: "OK so which gate do I fix FIRST, what does
 * the fix look like in Klaviyo/Postscript, and how much monthly revenue will
 * it recover?" — exactly the questions this component answers.
 *
 * The recipe is built from the same `ecom-ops:lifecycle-flow-health:v1`
 * localStorage key the audit panel writes to, so a real input change on the
 * audit propagates here in <1 second via the `storage` event + the audit's
 * `ecom-ops:lifecycle-flow-health:update` custom event.
 *
 * Three layouts the operator can pick from:
 *   1. **All 13 flows in a table** (default view) — verdict badge · score ·
 *      failed-gate count · top-fix gate · top-fix SROI · total at-risk $/mo
 *      · deep-link to the per-flow drilldown. Click a row → /lifecycle#<flow-id>.
 *   2. **Per-flow drilldown** (when the URL has a `#<flow-id>` hash) — the
 *      recipe card with the prioritized gate-fix list + per-gate diagnostic
 *      tab + concrete changes + expected lift band + effort + SROI + the
 *      canonical playbook ref + a "Back to all flows" link.
 *   3. **Empty state** (no KPI inputs yet) — friendly "Score any flow first"
 *      CTA pointing at the audit panel.
 *
 * Hash-anchor deep-link: the per-flow drilldown reads `window.location.hash`
 * on mount and listens to the `hashchange` event. Clicking a row in the
 * "all flows" table uses `window.location.hash = flow.flow_id` (not pushState)
 * so the back button works as expected. The Move #N.9 digest's `/lifecycle#<id>`
 * deep-link lands here automatically because the URL hash is honored on mount.
 *
 * Cross-tab sync: listens to the audit's `storage` event + same-tab
 * `ecom-ops:lifecycle-flow-health:update` event so an operator who types a
 * KPI in tab A and clicks back to /lifecycle in tab B sees the recipe update
 * without a reload.
 *
 * Hydration: uses the standard `useState(false)` + `useEffect` mirror so
 * the SSR markup byte-matches the first client render. Pre-hydration the
 * card shows a "Loading recipes…" stub.
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

function readHashFlowId(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash.replace(/^#/, "").trim();
  if (!h) return null;
  // Accept both raw flow_id and `flow=<id>` query style
  const m = /^flow=([\w.]+)$/.exec(h);
  if (m) return m[1];
  // Direct id like "1.1_browse_abandon" or just "1.1_browse_abandon"
  if (PATH_B_FLOWS.some((f) => f.flow_id === h)) return h;
  return null;
}

const VERDICT_TONE: Record<string, string> = {
  PASS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  WARN: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  NEEDS_WORK: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  FAIL: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function FlowFixRecipeCard() {
  const [kpisByFlow, setKpisByFlow] = useState<Record<string, FlowKpis>>({});
  const [hydrated, setHydrated] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  // Hydrate on mount.
  useEffect(() => {
    setKpisByFlow(loadStored());
    setActiveFlowId(readHashFlowId());
    setHydrated(true);
  }, []);

  // Cross-tab sync via `storage` event.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setKpisByFlow(loadStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab sync via the audit's custom event.
  useEffect(() => {
    function refresh() {
      setKpisByFlow(loadStored());
    }
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => window.removeEventListener(UPDATE_EVENT, refresh);
  }, []);

  // Hash-anchor deep-link: react to /lifecycle#1.1_browse_abandon.
  useEffect(() => {
    function onHashChange() {
      setActiveFlowId(readHashFlowId());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const report = useMemo(() => buildHealthReport(kpisByFlow), [kpisByFlow]);

  const recipesByFlowId: Record<string, FlowFixRecipe> = useMemo(() => {
    const out: Record<string, FlowFixRecipe> = {};
    for (const score of report.scores) {
      const kpis = kpisByFlow[score.flow_id];
      if (!kpis) continue;
      out[score.flow_id] = buildFlowFixRecipe(score, kpis.sent);
    }
    return out;
  }, [report, kpisByFlow]);

  const recipeList: FlowFixRecipe[] = useMemo(
    () => Object.values(recipesByFlowId).sort((a, b) => {
      // FAIL first, then NEEDS_WORK, then WARN, then PASS
      const order: Record<string, number> = { FAIL: 0, NEEDS_WORK: 1, WARN: 2, PASS: 3 };
      const diff = (order[a.verdict] ?? 9) - (order[b.verdict] ?? 9);
      if (diff !== 0) return diff;
      // Within same verdict, highest at-risk revenue first
      return b.monthlyRevenueAtRiskUsd - a.monthlyRevenueAtRiskUsd;
    }),
    [recipesByFlowId],
  );

  const scoredCount = recipeList.length;
  const failingCount = recipeList.filter((r) => r.verdict === "FAIL").length;
  const needsWorkCount = recipeList.filter((r) => r.verdict === "NEEDS_WORK").length;
  const totalAtRiskUsd = recipeList.reduce((s, r) => s + r.monthlyRevenueAtRiskUsd, 0);

  // Pre-hydration stub: deterministic "Loading recipes…" card so SSR
  // markup matches first client render.
  if (!hydrated) {
    return (
      <Card id="flow-fix-recipe" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
            <CardTitle className="text-sm font-semibold">Per-flow fix recipe</CardTitle>
            <Badge variant="outline" className="text-[10px]">Move #N.12</Badge>
          </div>
          <CardDescription className="text-xs">
            Loading recipes from your local audit inputs…
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state: no KPIs entered yet.
  if (scoredCount === 0) {
    return (
      <Card id="flow-fix-recipe" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
            <CardTitle className="text-sm font-semibold">Per-flow fix recipe</CardTitle>
            <Badge variant="outline" className="text-[10px]">Move #N.12</Badge>
          </div>
          <CardDescription className="text-xs">
            No flow has been scored yet. Open the audit panel above, click{" "}
            <strong>Seed canonical pass</strong> to demo, then come back to see
            the prioritized fix recipes for any FAIL or NEEDS_WORK flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="#lifecycle-flow-health-audit"
            className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            ↑ Jump to the audit panel
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Active flow drilldown view (from /lifecycle#<flow-id> deep-link).
  if (activeFlowId && recipesByFlowId[activeFlowId]) {
    const recipe = recipesByFlowId[activeFlowId];
    const score = report.scores.find((s: FlowScore) => s.flow_id === activeFlowId);
    if (!score) return null;
    return (
      <FlowDrilldown
        recipe={recipe}
        score={score}
        onBack={() => {
          window.location.hash = "";
          setActiveFlowId(null);
        }}
      />
    );
  }

  // All-flows table view.
  return (
    <Card id="flow-fix-recipe" className="border-amber-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
            <CardTitle className="text-sm font-semibold">Per-flow fix recipe</CardTitle>
            <Badge variant="outline" className="text-[10px]">Move #N.12</Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
              {failingCount} FAIL
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              {needsWorkCount} NEEDS_WORK
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {scoredCount - failingCount - needsWorkCount} PASS/WARN
            </span>
          </div>
        </div>
        <CardDescription className="text-xs">
          For every scored flow, the recipe surfaces the prioritized list of
          failed gates sorted by expected $/1k-sent lift (with SROI as the
          tie-break) — so the operator knows which gate to fix FIRST and how
          much monthly revenue the fix recovers. Click a row to see the
          diagnostic tab + concrete changes for that flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="rounded-md border border-border/60 bg-muted/30 p-2">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
              Scored flows
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {scoredCount} / {PATH_B_FLOWS.length}
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/30 p-2">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
              At-risk flows (FAIL+NEEDS_WORK)
            </div>
            <div className="text-2xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
              {failingCount + needsWorkCount}
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/30 p-2">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
              Total monthly revenue at risk
            </div>
            <div className="text-2xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
              {totalAtRiskUsd === 0 ? "$0" : `$${totalAtRiskUsd.toLocaleString()}`}
            </div>
          </div>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="text-left py-2 pr-2">Flow</th>
                <th className="text-left py-2 pr-2">Verdict</th>
                <th className="text-right py-2 pr-2">Score</th>
                <th className="text-right py-2 pr-2">Failed gates</th>
                <th className="text-left py-2 pr-2">Top fix</th>
                <th className="text-right py-2 pr-2">Top fix SROI</th>
                <th className="text-right py-2">$ at risk /mo</th>
              </tr>
            </thead>
            <tbody>
              {recipeList.map((r) => (
                <tr
                  key={r.flowId}
                  data-flow-row={r.flowId}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.hash = r.flowId;
                    setActiveFlowId(r.flowId);
                  }}
                >
                  <td className="py-2 pr-2">
                    <div className="font-medium">{r.flowName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {r.flowId} · T{r.tier}
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <Badge variant="outline" className={cn("text-[10px]", VERDICT_TONE[r.verdict] ?? "")}>
                      {r.verdict}
                    </Badge>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.score}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {r.gateFixes.length === 0 ? "—" : r.gateFixes.length}
                  </td>
                  <td className="py-2 pr-2">
                    {r.topFixGate ? (
                      <span className="font-mono text-[10px]">
                        Gate {r.topFixGate} · {formatUsdPer1k(r.topFixLiftHighUsd)}/1k
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {r.topFixGate ? (
                      <span className={sroiToneClass(
                        r.gateFixes[0]?.sroiUsdPerDay ?? 0,
                      )}>
                        {formatSroiPerDay(r.gateFixes[0]?.sroiUsdPerDay ?? 0)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {r.monthlyRevenueAtRiskUsd === 0
                      ? "$0"
                      : `$${r.monthlyRevenueAtRiskUsd.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Click any row to open the per-flow drilldown (deep-link{" "}
          <code className="rounded bg-muted px-1">/lifecycle#{`{flow_id}`}</code>).
          Storage key: <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Per-flow drilldown view
// ---------------------------------------------------------------------------

interface FlowDrilldownProps {
  recipe: FlowFixRecipe;
  score: FlowScore;
  onBack: () => void;
}

function FlowDrilldown({ recipe, score, onBack }: FlowDrilldownProps) {
  return (
    <Card
      id="flow-fix-recipe-drilldown"
      data-flow-drilldown={recipe.flowId}
      className="border-amber-500/30"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
            <CardTitle className="text-sm font-semibold">
              {recipe.flowName} — fix recipe
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">Move #N.12</Badge>
            <Badge variant="outline" className={cn("text-[10px]", VERDICT_TONE[recipe.verdict] ?? "")}>
              {verdictShortLabel(recipe.verdict)}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-[10px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ← Back to all flows
          </button>
        </div>
        <CardDescription className="text-xs">
          <span className="font-mono">{recipe.flowId}</span> · {recipe.pillar} · T{recipe.tier} · {recipe.channel}.
          Score {recipe.score}/100. {recipe.gateFixes.length === 0
            ? "All gates passing — no fixes needed."
            : `${recipe.gateFixes.length} gate${recipe.gateFixes.length === 1 ? "" : "s"} failed; fix the top one first (Gate ${recipe.topFixGate} → ${formatSroiPerDay(recipe.gateFixes[0]?.sroiUsdPerDay ?? 0)}).`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipe.gateFixes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border/60 bg-muted/30 p-2">
              <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                Top fix (gate {recipe.topFixGate})
              </div>
              <div className="text-2xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                {formatUsdPer1k(recipe.topFixLiftHighUsd)}
                <span className="text-base font-normal text-muted-foreground ml-1">/1k sent</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {recipe.gateFixes[0]?.name}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-2">
              <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                Top fix SROI
              </div>
              <div className={cn("text-2xl font-semibold tabular-nums", sroiToneClass(recipe.gateFixes[0]?.sroiUsdPerDay ?? 0))}>
                {formatSroiPerDay(recipe.gateFixes[0]?.sroiUsdPerDay ?? 0)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Effort: {formatEffortDays(recipe.gateFixes[0]?.effortDays ?? 0)}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-2">
              <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                Monthly $ at risk (fix all)
              </div>
              <div className="text-2xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                {recipe.monthlyRevenueAtRiskUsd === 0 ? "$0" : `$${recipe.monthlyRevenueAtRiskUsd.toLocaleString()}`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Band: {formatUsdPer1k(recipe.totalExpectedLiftLowUsd)}–{formatUsdPer1k(recipe.totalExpectedLiftHighUsd)}/1k
              </div>
            </div>
          </div>
        )}

        {recipe.playbook && (
          <div className="rounded-md border border-sky-500/30 bg-sky-500/5 p-3 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-sky-700 dark:text-sky-400 font-semibold">
                  Read first
                </div>
                <Link
                  href={recipe.playbook.href}
                  className="text-sm font-medium underline underline-offset-4 hover:text-foreground"
                >
                  {recipe.playbook.title}
                </Link>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {recipe.playbook.reason}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Prioritized fixes ({recipe.gateFixes.length})
          </h3>
          <div className="space-y-3">
            {recipe.gateFixes.map((fix, idx) => (
              <div
                key={fix.gate}
                data-gate-fix={fix.gate}
                data-gate-rank={idx + 1}
                className="rounded-md border border-border/60 bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Gate {fix.gate}
                    </span>
                    <span className="font-semibold text-xs">{fix.name}</span>
                    {idx === 0 && (
                      <Badge variant="outline" className="text-[9px] border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        Top fix
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="tabular-nums">
                      <span className="text-muted-foreground">Lift</span>{" "}
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {formatUsdPer1k(fix.expectedLiftLowUsd)}–{formatUsdPer1k(fix.expectedLiftHighUsd)}
                      </span>
                      <span className="text-muted-foreground"> /1k</span>
                    </span>
                    <span className="tabular-nums">
                      <span className="text-muted-foreground">Effort</span>{" "}
                      <span className="font-semibold">{formatEffortDays(fix.effortDays)}</span>
                    </span>
                    <span className="tabular-nums">
                      <span className="text-muted-foreground">SROI</span>{" "}
                      <span className={cn("font-semibold", sroiToneClass(fix.sroiUsdPerDay))}>
                        {formatSroiPerDay(fix.sroiUsdPerDay)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Measured:</strong> {fix.measuredMessage}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Diagnostic:</strong> {fix.diagnosticTab}
                </div>
                <ul className="mt-1.5 ml-4 list-disc text-[11px] text-foreground/90 space-y-0.5">
                  {fix.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[10px] text-muted-foreground">
            Recipe data: <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
            Hash deep-link: <code className="rounded bg-muted px-1">#{recipe.flowId}</code>.
          </p>
          <CopyButton
            value={recipeToMarkdown(recipe)}
            label="Copy recipe"
            className="text-[10px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
