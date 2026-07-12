"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STUDIED_SKILLS_STORAGE_KEY,
  StudiedEntry,
  StudiedMap,
  confidenceLabel,
  confidenceTone,
  loadStudiedSkills,
  saveStudiedSkills,
  setStudied,
} from "@/lib/skills-studied";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";

const CONFIDENCE_OPTIONS: Array<{
  value: NonNullable<StudiedEntry["confidence"]>;
  label: string;
  hint: string;
}> = [
  {
    value: "studied",
    label: "Studied",
    hint: "Read once, internalized the framework",
  },
  {
    value: "applied",
    label: "Applied",
    hint: "Ran it in a sandbox or staging replica",
  },
  {
    value: "shipped",
    label: "Shipped",
    hint: "Running in production — highest tier",
  },
];

const PILL_TONE: Record<NonNullable<StudiedEntry["confidence"]>, string> = {
  studied:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
  applied:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20",
  shipped:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
};

const ACTIVE_TONE: Record<NonNullable<StudiedEntry["confidence"]>, string> = {
  studied:
    "border-amber-500 bg-amber-500 text-white shadow-sm hover:bg-amber-500/90",
  applied:
    "border-sky-500 bg-sky-500 text-white shadow-sm hover:bg-sky-500/90",
  shipped:
    "border-emerald-500 bg-emerald-500 text-white shadow-sm hover:bg-emerald-500/90",
};

/**
 * `Skill detail — Mark studied` one-click action.
 *
 * The /skills index already has a "Mark studied" toggle (via skills-search),
 * but the actual reading page (/skills/[slug]) didn't — the operator had to
 * scroll back to the index to mark a skill as studied. This component
 * closes that gap.
 *
 * Hydration-safe: starts with `hydrated=false`, renders a stub that matches
 * what the server would have rendered. After mount, if the skill was
 * already studied (per localStorage), the button is replaced with a
 * 3-pill confidence picker + clear control + a copy-to-MD summary of the
 * operator's engagement trail.
 *
 * Storage key: ecom-ops:skills:studied:v1 (same key the index reads from,
 * so a toggle here instantly reflects on the index's progress strip and
 * on /today — cross-page-intelligence).
 *
 * Defensive: SSR-safe (`typeof window` guards), handles corrupted
 * localStorage JSON, listens for storage events from other tabs.
 */
export interface SkillDetailToggleProps {
  skillId: string;
  skillTitle: string;
}

export function SkillDetailToggle({
  skillId,
  skillTitle,
}: SkillDetailToggleProps) {
  const [hydrated, setHydrated] = useState(false);
  const [map, setMap] = useState<StudiedMap>({});

  useEffect(() => {
    setMap(loadStudiedSkills());
    setHydrated(true);

    // Cross-tab sync — if the operator toggles "studied" on the index in
    // another tab, the detail page re-hydrates instantly.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDIED_SKILLS_STORAGE_KEY) {
        setMap(loadStudiedSkills());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const entry = map[skillId];
  const isOn = Boolean(entry);

  const markStudied = useCallback(() => {
    setMap((prev) => {
      const next = setStudied(prev, skillId, "studied");
      saveStudiedSkills(next);
      return next;
    });
  }, [skillId]);

  const updateConfidence = useCallback(
    (next: NonNullable<StudiedEntry["confidence"]>) => {
      setMap((prev) => {
        const cur = prev[skillId];
        const updated: StudiedMap = {
          ...prev,
          [skillId]: {
            ...(cur ?? {}),
            confidence: next,
            studiedAt: new Date().toISOString(),
          },
        };
        saveStudiedSkills(updated);
        return updated;
      });
    },
    [skillId]
  );

  const clearStudied = useCallback(() => {
    setMap((prev) => {
      const next: StudiedMap = { ...prev };
      delete next[skillId];
      saveStudiedSkills(next);
      return next;
    });
  }, [skillId]);

  const summary = useMemo(() => {
    if (!entry) return null;
    const lines: string[] = [];
    lines.push(`## Studied: ${skillTitle}`);
    lines.push("");
    lines.push(`- Tier: ${confidenceLabel(entry.confidence)}`);
    if (entry.studiedAt) {
      lines.push(
        `- Marked: ${entry.studiedAt.replace("T", " ").slice(0, 16)} UTC`
      );
    }
    if (entry.notes) lines.push(`- Notes: ${entry.notes}`);
    lines.push("");
    lines.push(`Skill ID: ${skillId}`);
    return lines.join("\n");
  }, [entry, skillTitle, skillId]);

  // Pre-hydration: render a deterministic, server-equivalent button so the
  // first paint matches the SSR output (no hydration mismatch).
  if (!hydrated) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mark studied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
            Mark studied
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">Mark studied</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Track your engagement with this skill. State syncs across the
              <span className="font-mono"> /skills </span>index and the
              <span className="font-mono"> today </span>page via localStorage.
            </p>
          </div>
          {isOn && (
            <Badge
              variant="outline"
              className={cn("text-[10px]", confidenceTone(entry?.confidence))}
            >
              {confidenceLabel(entry?.confidence)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isOn ? (
          <button
            type="button"
            onClick={markStudied}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <span className="text-base leading-none">+</span> Mark studied
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Confidence tier
              </div>
              <div className="flex flex-wrap gap-2">
                {CONFIDENCE_OPTIONS.map((opt) => {
                  const active = entry?.confidence === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateConfidence(opt.value)}
                      title={opt.hint}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                        active ? ACTIVE_TONE[opt.value] : PILL_TONE[opt.value]
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Marked
                </div>
                <div className="font-mono text-xs text-foreground">
                  {entry?.studiedAt
                    ? `${entry.studiedAt.slice(0, 10)} ${entry.studiedAt.slice(
                        11,
                        16
                      )} UTC`
                    : "—"}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Skill ID
                </div>
                <div className="font-mono text-xs text-foreground break-all">
                  {skillId}
                </div>
              </div>
            </div>

            {summary && (
              <div className="rounded-md bg-muted px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Engagement trail
                  </span>
                  <CopyButton value={summary} label="Copy" />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] font-mono leading-snug">
                  {summary}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearStudied}
                className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Clear studied state
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
