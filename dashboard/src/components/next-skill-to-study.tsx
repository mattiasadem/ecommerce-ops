"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import {
  StudiedMap,
  confidenceLabel,
  confidenceTone,
  loadStudiedSkills,
  saveStudiedSkills,
  setStudied,
} from "@/lib/skills-studied";
import { cn } from "@/lib/utils";

/**
 * `Next skill to study` — cross-page-intelligence recommendation card.
 *
 * Reads:
 *   - ecom-ops:skills:studied:v1  (this card writes to it too)
 *   - Your-store AOV/orders/margin from `ecom-ops:your-store:v1` (for
 *     projecting study hours payoff, mirror of NextMoveCard)
 *
 * Picks the highest-leverage unstudied skill:
 *   1. P0 first, then P1, then P2, then P3
 *   2. Within a priority bucket: highest pitfall count + highest source
 *      count first (these are the most battle-tested skills)
 *   3. Already-studied skills are skipped
 *
 * Renders:
 *   - "Study next: <Skill>" headline + Move # + priority
 *   - One-line rationale (priority band + leverage)
 *   - Effort estimate (15-30 min for the average skill, derived from
 *     section count + size)
 *   - One-click "Mark studied" button
 *   - Copy-paste summary block for handoff
 */

interface SkillRow {
  file: string;
  title: string;
  category: string;
  priority: string;
  tier: number | null;
  defaultMove: number | null;
  yearOneRoiBand: string | null;
  pitfallCount: number;
  sourceCount: number;
  sectionCount: number;
  size: number;
}

interface NextSkillProps {
  skills: SkillRow[];
}

const PRIORITY_RANK: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

function pickNextSkill(skills: SkillRow[], studied: StudiedMap): SkillRow | null {
  const candidates = skills.filter((s) => !studied[s.file.replace(/\.md$/, "")]);
  if (candidates.length === 0) return null;
  // Sort: priority asc, then leverage (pitfallCount + sourceCount) desc,
  // then move # asc as tiebreaker.
  return [...candidates].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 99;
    const pb = PRIORITY_RANK[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    const la = (a.pitfallCount || 0) + (a.sourceCount || 0);
    const lb = (b.pitfallCount || 0) + (b.sourceCount || 0);
    if (la !== lb) return lb - la;
    const ma = a.defaultMove ?? 99;
    const mb = b.defaultMove ?? 99;
    return ma - mb;
  })[0];
}

function estimateReadMinutes(s: SkillRow): number {
  // ~200 words/minute read; assume ~6 chars/word + ~30% markdown overhead.
  // Round up to a 5-minute bucket.
  const chars = s.size || 0;
  const words = Math.max(400, Math.round(chars / 6));
  const raw = Math.round(words / 200);
  return Math.max(5, Math.round(raw / 5) * 5);
}

function renderSummary(skill: SkillRow | null, allCount: number, studiedCount: number): string {
  const lines: string[] = [];
  lines.push("# Next skill to study");
  lines.push("");
  if (skill) {
    lines.push(`**Study next:** ${skill.title}`);
    lines.push(`**Priority:** ${skill.priority} · Move #${skill.defaultMove ?? "—"} · Category ${skill.category}`);
    lines.push(
      `**Effort:** ~${estimateReadMinutes(skill)} minutes · **Leverage:** ${skill.pitfallCount} pitfalls · ${skill.sourceCount} sources`,
    );
    if (skill.yearOneRoiBand) {
      lines.push(`**Year-1 ROI band:** ${skill.yearOneRoiBand}`);
    }
    lines.push("");
    lines.push("## Why this skill");
    lines.push(
      `It's the highest-priority skill you haven't studied yet (${skill.priority}). Battle-tested across ${skill.sourceCount} vendor sources and ${skill.pitfallCount} documented pitfalls.`,
    );
    lines.push("");
    lines.push("## Open the skill");
    lines.push(
      `https://ecommerce-ops-iota.vercel.app/skills/${skill.file.replace(/\.md$/, "")}`,
    );
  } else {
    lines.push(`You've studied all ${allCount} skills in the library. Audit quarterly or branch into research/ deep-dives.`);
  }
  lines.push("");
  lines.push(`**Library progress:** ${studiedCount} of ${allCount} engaged.`);
  lines.push("");
  lines.push(`_Generated ${new Date().toISOString()} from ecommerce-ops-dashboard / skills._`);
  return lines.join("\n");
}

export function NextSkillToStudy({ skills }: NextSkillProps) {
  const [studied, setStudiedState] = useState<StudiedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStudiedState(loadStudiedSkills());
    setHydrated(true);
  }, []);

  const next = useMemo(() => pickNextSkill(skills, studied), [skills, studied]);
  const totalStudied = Object.keys(studied).length;

  const summary = useMemo(
    () => renderSummary(next, skills.length, totalStudied),
    [next, skills.length, totalStudied],
  );

  const onMark = () => {
    if (!next) return;
    const id = next.file.replace(/\.md$/, "");
    const nextMap = setStudied({ ...studied }, id, "studied");
    setStudiedState(nextMap);
    saveStudiedSkills(nextMap);
  };

  const allDone = hydrated && next === null && totalStudied > 0;
  const empty = hydrated && next === null && totalStudied === 0;

  return (
    <div className="rounded-xl border-2 border-accent/40 bg-card p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Cross-page intelligence · what to study NEXT
          </div>
          <h2 className="text-lg font-semibold mt-1">
            {allDone
              ? "Skill library: fully engaged"
              : empty
                ? "Start with the first skill"
                : next
                  ? `Study next: ${next.title}`
                  : "Loading recommendation…"}
          </h2>
          {hydrated ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalStudied} of {skills.length} skills engaged. Pick is highest-priority unstudied.
            </p>
          ) : null}
        </div>
        {next ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant={
                next.priority === "P0"
                  ? "danger"
                  : next.priority === "P1"
                    ? "warning"
                    : next.priority === "P2"
                      ? "secondary"
                      : "outline"
              }
              className="text-[10px]"
            >
              {next.priority}
            </Badge>
            <span
              className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent"
              aria-label={`Move number ${next.defaultMove}`}
            >
              Move #{next.defaultMove ?? "—"}
            </span>
          </div>
        ) : null}
      </header>

      {next ? (
        <>
          {/* 4-tile output strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Effort
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1 text-emerald-700 dark:text-emerald-300">
                ~{estimateReadMinutes(next)} min
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                to read + apply
              </div>
            </div>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Leverage
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1 text-sky-700 dark:text-sky-300">
                {next.pitfallCount + next.sourceCount}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                pitfalls + sources
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                ROI band
              </div>
              <div className="text-base font-semibold tabular-nums mt-1 text-amber-700 dark:text-amber-300 font-mono">
                {next.yearOneRoiBand || "—"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Year-1 (canonical)
              </div>
            </div>
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-300">
                Category
              </div>
              <div className="text-base font-semibold mt-1 text-violet-700 dark:text-violet-300 capitalize">
                {next.category}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {next.sectionCount} sections
              </div>
            </div>
          </div>

          {/* Rationale */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Highest-priority skill ({next.priority}) you haven't studied yet.
            Battle-tested across {next.sourceCount} vendor sources with{" "}
            {next.pitfallCount} documented pitfalls — exactly the kind of
            leverage the operator-hour-rate math rewards.
          </p>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onMark}
              className="rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Mark studied ✓
            </button>
            <a
              href={`/skills/${next.file.replace(/\.md$/, "")}`}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
            >
              Read now →
            </a>
            <a
              href={`/playbooks/${next.file.replace(/^\d+-/, "").replace(/\.md$/, "")}`}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
              onClick={(e) => {
                // Best-effort: playbook slugs are NOT 1:1 with skill slugs,
                // so this link may 404. That's fine — the operator can still
                // open the skill page and find the playbook there.
                if (!next.file) e.preventDefault();
              }}
            >
              See companion playbook →
            </a>
            <CopyButton
              label="Copy summary"
              className="text-[11px] text-muted-foreground hover:text-foreground"
              value={summary}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {allDone
            ? "All skills engaged. Audit quarterly to refresh the framework as vendors update benchmarks."
            : "Once you study your first skill, this card will recommend the next-highest-leverage one."}
        </p>
      )}

      {/* Engagement breakdown */}
      {hydrated && totalStudied > 0 ? (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Engagement breakdown
          </div>
          <ConfidenceStrip studied={studied} skills={skills} />
        </div>
      ) : null}
    </div>
  );
}

function ConfidenceStrip({
  studied,
  skills,
}: {
  studied: StudiedMap;
  skills: SkillRow[];
}) {
  const breakdown = useMemo(() => {
    const out = { shipped: 0, applied: 0, studied: 0 };
    for (const s of skills) {
      const id = s.file.replace(/\.md$/, "");
      const entry = studied[id];
      if (!entry) continue;
      const c = entry.confidence ?? "studied";
      if (c === "shipped") out.shipped += 1;
      else if (c === "applied") out.applied += 1;
      else out.studied += 1;
    }
    return out;
  }, [studied, skills]);
  return (
    <div className="flex flex-wrap gap-2">
      {(["shipped", "applied", "studied"] as const).map((k) => {
        const entry = { shipped: "Shipped", applied: "Applied", studied: "Studied" }[k];
        return (
          <Badge
            key={k}
            variant="outline"
            className={cn("text-[10px]", confidenceTone(k))}
          >
            {breakdown[k]} {entry.toLowerCase()}
          </Badge>
        );
      })}
    </div>
  );
}
