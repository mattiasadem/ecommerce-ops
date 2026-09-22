"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  STUDIED_SKILLS_STORAGE_KEY,
  StudiedEntry,
  StudiedMap,
  clearStudiedSkills,
  confidenceLabel,
  confidenceTone,
  loadStudiedSkills,
  progressTierFor,
} from "@/lib/skills-studied";
import { cn } from "@/lib/utils";

/**
 * `Skills Progress Dashboard` — operator-owned learning dashboard for the
 * 278-skill library (state-persistence + cross-page-intelligence +
 * one-click-action).
 *
 * Sits on the /skills index, just below the top stat row, so the operator
 * sees their coverage % + confidence tier breakdown + P0 vs P1..P3 mix
 * BEFORE they pick the next skill to study. Reads the SAME
 * `ecom-ops:skills:studied:v1` key that:
 *   - the /skills index uses (SkillsSearch row toggles)
 *   - the /skills/[slug] detail page uses (SkillDetailToggle)
 *   - the /today NextSkillToStudy card uses (priority-ordered recommendation)
 *   - the /skills NextSkillToStudy card uses (same)
 *
 * So a "Mark studied" click ANYWHERE in the dashboard updates this card
 * instantly via the same-tab CustomEvent listener AND via the cross-tab
 * `storage` event.
 *
 * What it shows:
 *   - Headline KPI: total studied / total skills / coverage %
 *   - Progress tier badge (starter / rolling / scaling / complete) with
 *     tone matching the canonical `progressTierFor()` color ladder
 *   - Confidence breakdown (studied / applied / shipped counts + bars)
 *   - Priority coverage (P0 / P1 / P2 / P3 studied vs total)
 *   - Last-7-days study pace (line of dots)
 *   - Recently-studied list (top 5 most recent, with timestamps + skill
 *     link back to /skills/[slug])
 *   - One-click JSON export of the full studied map
 *   - One-click reset (with confirm) for fresh-start scenarios
 *
 * Why this matters: 278 skills is past the point where the operator can
 * remember what they've internalized. A persistent dashboard with
 * coverage + recency + priority-mix gives them the "where am I in the
 * library" signal the rest of the dashboard gives for /playbooks
 * (Top-10 shipped) and /today (NextMove).
 *
 * Hydration safety: identical pattern to SkillDetailToggle — starts with
 * `hydrated=false`, renders deterministic stub counts that match what
 * the server-rendered page would have produced (everything = 0 / N).
 * After mount, real localStorage reads populate the actual numbers.
 */

interface SkillRow {
  file: string;
  title: string;
  category: string;
  priority: string;
  tier: number | null;
}

interface SkillsProgressDashboardProps {
  skills: SkillRow[];
}

interface CoverageStats {
  total: number;
  studied: number;
  applied: number;
  shipped: number;
  pct: number;
  p0: { studied: number; total: number };
  p1: { studied: number; total: number };
  p2: { studied: number; total: number };
  p3: { studied: number; total: number };
}

function computeCoverage(
  skills: SkillRow[],
  map: StudiedMap,
): CoverageStats {
  const total = skills.length;
  let studied = 0;
  let applied = 0;
  let shipped = 0;
  const byPriority = { P0: { studied: 0, total: 0 }, P1: { studied: 0, total: 0 }, P2: { studied: 0, total: 0 }, P3: { studied: 0, total: 0 } } as Record<"P0" | "P1" | "P2" | "P3", { studied: number; total: number }>;

  for (const s of skills) {
    const id = s.file.replace(/\.md$/, "");
    const entry = map[id];
    const bucket = byPriority[(s.priority as "P0" | "P1" | "P2" | "P3") || "P3"];
    if (!bucket) continue;
    bucket.total += 1;
    if (entry) {
      studied += 1;
      bucket.studied += 1;
      if (entry.confidence === "shipped") shipped += 1;
      else if (entry.confidence === "applied") applied += 1;
    }
  }

  const pct = total === 0 ? 0 : (studied / total) * 100;
  return {
    total,
    studied,
    applied,
    shipped,
    pct,
    p0: byPriority.P0,
    p1: byPriority.P1,
    p2: byPriority.P2,
    p3: byPriority.P3,
  };
}

interface DailyDot {
  iso: string;
  count: number;
}

function dailyPace(map: StudiedMap, days = 7): DailyDot[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const out: DailyDot[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = Object.values(map).filter((e) =>
      typeof e.studiedAt === "string" && e.studiedAt.slice(0, 10) === iso,
    ).length;
    out.push({ iso, count });
  }
  return out;
}

export function SkillsProgressDashboard({
  skills,
}: SkillsProgressDashboardProps) {
  const [hydrated, setHydrated] = useState(false);
  const [map, setMap] = useState<StudiedMap>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    setMap(loadStudiedSkills());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDIED_SKILLS_STORAGE_KEY) {
        setMap(loadStudiedSkills());
        setNow(Date.now());
      }
    };
    const onStudied = () => {
      setMap(loadStudiedSkills());
      setNow(Date.now());
    };

    window.addEventListener("storage", onStorage);
    // Same-tab CustomEvent fired by SkillsSearch / SkillDetailToggle so
    // the dashboard updates without a reload.
    window.addEventListener("ecom-ops:skills:studied-changed", onStudied);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:skills:studied-changed", onStudied);
    };
  }, []);

  const coverage = useMemo(() => computeCoverage(skills, map), [skills, map]);
  const tier = useMemo(() => progressTierFor(coverage.pct), [coverage.pct]);
  const recent = useMemo(() => {
    const rows = Object.entries(map)
      .filter(([, v]) => v && typeof v.studiedAt === "string")
      .map(([id, v]) => {
        const skill = skills.find((s) => s.file.replace(/\.md$/, "") === id);
        return {
          id,
          studiedAt: v.studiedAt,
          confidence: v.confidence,
          title: skill?.title ?? id,
          category: skill?.category ?? "general",
          priority: skill?.priority ?? "P3",
        };
      })
      .sort((a, b) => b.studiedAt.localeCompare(a.studiedAt))
      .slice(0, 5);
    return rows;
  }, [map, skills]);
  const pace = useMemo(() => (hydrated ? dailyPace(map, 7) : []), [map, hydrated]);

  const exportJson = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            storageKey: STUDIED_SKILLS_STORAGE_KEY,
            skillCount: Object.keys(map).length,
            map,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skills-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [map]);

  const onReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    const cleared = clearStudiedSkills();
    setMap(cleared);
    setConfirmReset(false);
    setNow(Date.now());
    window.dispatchEvent(new CustomEvent("ecom-ops:skills:studied-changed"));
  }, [confirmReset]);

  const summaryText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# Skills Progress — ${new Date().toISOString().slice(0, 16)} UTC`);
    lines.push("");
    lines.push(
      `- **Coverage:** ${coverage.studied}/${coverage.total} (${coverage.pct.toFixed(1)}%) — ${tier.label}`,
    );
    lines.push(
      `- **Confidence:** ${coverage.studied} studied · ${coverage.applied} applied · ${coverage.shipped} shipped`,
    );
    lines.push(
      `- **P0:** ${coverage.p0.studied}/${coverage.p0.total} · **P1:** ${coverage.p1.studied}/${coverage.p1.total} · **P2:** ${coverage.p2.studied}/${coverage.p2.total} · **P3:** ${coverage.p3.studied}/${coverage.p3.total}`,
    );
    if (recent.length > 0) {
      lines.push("");
      lines.push("## Recently studied");
      for (const r of recent) {
        lines.push(
          `- ${r.title} — ${r.studiedAt.slice(0, 16).replace("T", " ")} UTC · ${confidenceLabel(r.confidence)}`,
        );
      }
    }
    return lines.join("\n");
  }, [coverage, tier, recent]);

  // Pre-hydration stub — matches what the server-rendered page would
  // have produced (everything = 0 / N). Same shape so no layout shift
  // on first paint.
  if (!hydrated) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">Your skill progress</CardTitle>
              <CardDescription className="text-xs mt-1">
                Loading studied-skill map from localStorage…
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  …
                </div>
                <div className="text-2xl font-semibold tabular-nums text-muted-foreground">
                  —
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base">Your skill progress</CardTitle>
            <CardDescription className="text-xs mt-1">
              Reads the same studied-skill map the index toggles, the
              detail page marks, and the /today NextSkillToStudy card
              ranks. Updates instantly when you mark a skill anywhere in
              the dashboard.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px] whitespace-nowrap", tier.tone)}
          >
            {tier.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* === Headline KPIs === */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiTile
            label="Coverage"
            value={`${coverage.studied}/${coverage.total}`}
            sub={`${coverage.pct.toFixed(1)}%`}
            tone="text-foreground"
          />
          <KpiTile
            label="Studied"
            value={coverage.studied - coverage.applied - coverage.shipped}
            sub="read once"
            tone="text-amber-700 dark:text-amber-300"
          />
          <KpiTile
            label="Applied"
            value={coverage.applied}
            sub="in sandbox"
            tone="text-sky-700 dark:text-sky-300"
          />
          <KpiTile
            label="Shipped"
            value={coverage.shipped}
            sub="in production"
            tone="text-emerald-700 dark:text-emerald-300"
          />
        </section>

        {/* === Coverage bar === */}
        <CoverageBar pct={coverage.pct} tierKey={tier.key} />

        {/* === Priority coverage grid === */}
        <section>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Coverage by priority
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <PriorityTile
              label="P0"
              tone="border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
              studied={coverage.p0.studied}
              total={coverage.p0.total}
            />
            <PriorityTile
              label="P1"
              tone="border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
              studied={coverage.p1.studied}
              total={coverage.p1.total}
            />
            <PriorityTile
              label="P2"
              tone="border-slate-500/30 bg-slate-500/5 text-slate-700 dark:text-slate-300"
              studied={coverage.p2.studied}
              total={coverage.p2.total}
            />
            <PriorityTile
              label="P3"
              tone="border-border bg-muted/40 text-muted-foreground"
              studied={coverage.p3.studied}
              total={coverage.p3.total}
            />
          </div>
        </section>

        {/* === Last-7-days pace === */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Last 7 days — study pace
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {pace.reduce((n, d) => n + d.count, 0)} marked ·{" "}
              {(pace.reduce((n, d) => n + d.count, 0) / 7).toFixed(1)}/day
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {pace.map((d) => {
              const max = Math.max(1, ...pace.map((x) => x.count));
              const h = d.count === 0 ? 4 : Math.max(8, (d.count / max) * 44);
              return (
                <div
                  key={d.iso}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${d.iso} — ${d.count} skill${d.count === 1 ? "" : "s"} marked`}
                >
                  <div
                    className={cn(
                      "w-full rounded-sm transition-colors",
                      d.count === 0
                        ? "bg-border"
                        : d.count >= 3
                          ? "bg-emerald-500"
                          : d.count >= 1
                            ? "bg-amber-500"
                            : "bg-border",
                    )}
                    style={{ height: `${h}px` }}
                  />
                  <div className="text-[9px] text-muted-foreground tabular-nums">
                    {d.iso.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* === Recently studied === */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recently studied
            </div>
            <Link
              href="/skills"
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Browse all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No skills studied yet — flip one to "studied" on the index or
              detail page and it'll show up here.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] flex-shrink-0",
                      confidenceTone(r.confidence),
                    )}
                  >
                    {confidenceLabel(r.confidence)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/skills/${r.id}`}
                      className="text-xs font-medium hover:underline truncate block"
                    >
                      {r.title}
                    </Link>
                    <div className="text-[10px] text-muted-foreground tabular-nums">
                      {r.studiedAt.slice(0, 16).replace("T", " ")} UTC · {r.priority}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator />

        {/* === Actions: export / copy / reset === */}
        <section className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportJson}
            disabled={coverage.studied === 0}
            className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Export progress JSON
          </button>
          <CopyButton value={summaryText} label="Copy progress summary" />
          <button
            type="button"
            onClick={onReset}
            disabled={coverage.studied === 0}
            className={cn(
              "ml-auto rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              confirmReset
                ? "border-red-500 bg-red-500 text-white hover:bg-red-500/90"
                : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
              coverage.studied === 0 && "opacity-40 cursor-not-allowed",
            )}
          >
            {confirmReset ? "Confirm reset (click again)" : "Reset all"}
          </button>
        </section>

        <p className="text-[10px] text-muted-foreground">
          Snapshot taken {new Date(now).toISOString().slice(0, 16).replace("T", " ")} UTC ·
          Storage key <span className="font-mono">{STUDIED_SKILLS_STORAGE_KEY}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function KpiTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", tone)}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function CoverageBar({
  pct,
  tierKey,
}: {
  pct: number;
  tierKey: "starter" | "rolling" | "scaling" | "complete";
}) {
  const tone = {
    starter: "bg-border",
    rolling: "bg-amber-500",
    scaling: "bg-sky-500",
    complete: "bg-emerald-500",
  }[tierKey];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Coverage
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums">
          {pct.toFixed(1)}%
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full transition-all", tone)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

function PriorityTile({
  label,
  tone,
  studied,
  total,
}: {
  label: string;
  tone: string;
  studied: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : (studied / total) * 100;
  return (
    <div className={cn("rounded-md border px-3 py-2", tone)}>
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className="text-[10px] tabular-nums opacity-70">
          {pct.toFixed(0)}%
        </div>
      </div>
      <div className="text-xl font-semibold tabular-nums mt-1">
        {studied}
        <span className="text-xs opacity-60">/{total}</span>
      </div>
      <div className="h-1 mt-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-current opacity-60"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
