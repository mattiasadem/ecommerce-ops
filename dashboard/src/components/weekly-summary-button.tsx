"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import type { JournalEntry } from "@/lib/content";

/**
 * `Weekly summary` — one-click Slack / Discord / email handoff generator
 * for the operator's cron-driven build.
 *
 * Reads the `journal: JournalEntry[]` already loaded by `force-static`
 * parse at build time, groups entries by day for the last 7 days, and
 * renders a single "Copy weekly summary" button that copies a
 * paste-ready markdown report to the clipboard.
 *
 * Why this exists: a DTC operator running the cron-driven dashboard
 * needs to share progress with their team (Slack #ops-updates channel,
 * weekly investor email, Monday standup deck). Reformatting the raw
 * journal by hand every Monday is friction — this is one click.
 *
 * Output format (Slack-friendly):
 *
 *   **Ecommerce Ops — Week of 2026-09-23**
 *
 *   *12 ticks · 11 keep · 1 no-status*
 *
 *   **Tue Sep 23**
 *   · 16:09 UTC — Skill: Move #287.15 … [keep]
 *   · 11:45 UTC — Dashboard: global Cmd-K command palette [keep]
 *   …
 *
 *   **Mon Sep 22**
 *   · 09:53 UTC — Skill: Move #287.10 44-axis … [keep]
 *
 *   **Next action:** Move #287.16 — Per-affiliate-recovery-…
 *
 *   —
 *   Full journal: https://ecommerce-ops-iota.vercel.app/journal
 *   Standup: https://ecommerce-ops-iota.vercel.app/standup
 *
 * The format survives Slack's mrkdwn parser (single asterisks for bold
 * render as bold), Discord (triple-backtick code-blocks unnecessary —
 * no code), Gmail (markdown renders as plain-text bullets).
 */

const DAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseHeadingTimestamp(heading: string): Date | null {
  const m = /^\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/.exec(heading);
  if (!m) return null;
  return new Date(`${m[1]}T${m[2]}:00Z`);
}

function shortTitle(heading: string): string {
  return heading.replace(/^\[[^\]]+\]\s*/, "").split(/[.:]/)[0].slice(0, 110);
}

function detectTickType(heading: string): "dashboard" | "skill" | "static" | "infra" | "other" {
  if (/^Skill tick:/i.test(heading)) return "skill";
  if (/^Dashboard tick:/i.test(heading)) return "dashboard";
  if (/^Static tick:/i.test(heading)) return "static";
  if (/^Infra tick:/i.test(heading)) return "infra";
  return "other";
}

function detectStatus(body: string): "keep" | "blocked" | "no-status" {
  if (/\*\*Status:\*\*\s*keep/i.test(body)) return "keep";
  if (/\*\*Status:\*\*\s*discard/i.test(body)) return "blocked";
  if (/deploy[\s_-]?blocked/i.test(body)) return "blocked";
  return "no-status";
}

function extractNextAction(body: string): string | null {
  const m = /-\s+\*\*Next action:\*\*\s*(.+?)(?:\n|$)/.exec(body);
  if (!m) return null;
  const t = m[1].trim();
  return t.length > 140 ? t.slice(0, 137) + "..." : t;
}

interface DayBucket {
  isoDate: string;
  prettyDate: string;
  entries: JournalEntry[];
}

interface WeeklySummary {
  weekHeading: string;
  totalTicks: number;
  statusCounts: { keep: number; blocked: number; "no-status": number };
  typeCounts: { skill: number; dashboard: number; static: number; infra: number; other: number };
  days: DayBucket[];
  nextAction: string | null;
  dayCount: number;
}

function buildWeeklySummary(
  journal: JournalEntry[],
  generatedAt: string,
  daysBack = 7
): WeeklySummary {
  const today = new Date(generatedAt);

  // Group entries by day (UTC) for the last `daysBack` days.
  const days: DayBucket[] = [];
  for (let dOffset = 0; dOffset < daysBack; dOffset++) {
    const dayStart = new Date(today);
    dayStart.setUTCDate(dayStart.getUTCDate() - dOffset);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const entries = journal.filter((e) => {
      const ts = parseHeadingTimestamp(e.heading);
      return ts && ts >= dayStart && ts < dayEnd;
    });

    const d = dayStart;
    const prettyDate = `${DAY_NAMES[d.getUTCDay()]} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
    days.push({
      isoDate: d.toISOString().slice(0, 10),
      prettyDate,
      entries,
    });
  }

  const totalTicks = days.reduce((acc, d) => acc + d.entries.length, 0);
  const statusCounts = { keep: 0, blocked: 0, "no-status": 0 };
  const typeCounts = { skill: 0, dashboard: 0, static: 0, infra: 0, other: 0 };
  for (const day of days) {
    for (const e of day.entries) {
      statusCounts[detectStatus(e.body)]++;
      typeCounts[detectTickType(e.heading)]++;
    }
  }

  // First day's first entry with a Next-action is the most-recent next action.
  let nextAction: string | null = null;
  outer: for (const day of days) {
    for (const e of day.entries) {
      const na = extractNextAction(e.body);
      if (na) {
        nextAction = na;
        break outer;
      }
    }
  }

  // ISO week start (Monday) for the heading.
  const weekStart = new Date(today);
  const dow = weekStart.getUTCDay();
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  weekStart.setUTCDate(weekStart.getUTCDate() + offsetToMonday);
  const isoDate = weekStart.toISOString().slice(0, 10);
  const dayCount = days.filter((d) => d.entries.length > 0).length;

  return {
    weekHeading: `Week of ${isoDate}`,
    totalTicks,
    statusCounts,
    typeCounts,
    days,
    nextAction,
    dayCount,
  };
}

function renderMarkdown(summary: WeeklySummary): string {
  const lines: string[] = [];
  lines.push(`**Ecommerce Ops — ${summary.weekHeading}**`);
  lines.push("");

  // Summary line
  const parts: string[] = [];
  parts.push(`${summary.totalTicks} tick${summary.totalTicks === 1 ? "" : "s"}`);
  if (summary.statusCounts.keep > 0) parts.push(`${summary.statusCounts.keep} keep`);
  if (summary.statusCounts.blocked > 0)
    parts.push(`${summary.statusCounts.blocked} blocked`);
  if (summary.statusCounts["no-status"] > 0)
    parts.push(`${summary.statusCounts["no-status"]} no-status`);
  lines.push(`*${parts.join(" · ")}*`);
  lines.push("");

  for (const day of summary.days) {
    if (day.entries.length === 0) continue;
    lines.push(`**${day.prettyDate}**`);
    for (const entry of day.entries) {
      const ts = parseHeadingTimestamp(entry.heading);
      const time = ts ? ts.toISOString().slice(11, 16) + " UTC" : "?";
      const type = detectTickType(entry.heading);
      const status = detectStatus(entry.body);
      const statusToken =
        status === "keep" ? "✓ keep" : status === "blocked" ? "✗ blocked" : "— no-status";
      const title = shortTitle(entry.heading);
      // Avoid "Skill tick: keep —" since the status badge replaces it
      const cleanTitle = title.replace(/^Skill tick:\s*(keep|discard)\s*[—-]\s*/i, "");
      lines.push(`· ${time} — ${type}: ${cleanTitle} [${statusToken}]`);
    }
    lines.push("");
  }

  if (summary.nextAction) {
    lines.push(`**Next action:** ${summary.nextAction}`);
    lines.push("");
  }

  lines.push("—");
  lines.push("Full journal: https://ecommerce-ops-iota.vercel.app/journal");
  lines.push("Standup: https://ecommerce-ops-iota.vercel.app/standup");
  lines.push("");
  return lines.join("\n");
}

export function WeeklySummaryButton({
  journal,
  generatedAt,
  className,
}: {
  journal: JournalEntry[];
  generatedAt: string;
  className?: string;
}) {
  const [showPreview, setShowPreview] = useState(false);

  const summary = useMemo(
    () => buildWeeklySummary(journal, generatedAt, 7),
    [journal, generatedAt]
  );
  const markdown = useMemo(() => renderMarkdown(summary), [summary]);

  // Don't render if there's literally nothing to share.
  if (summary.totalTicks === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly summary</CardTitle>
          <CardDescription>
            No ticks in the last 7 days — shareable summary will appear here
            once the next cron run lands.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm">Weekly summary</CardTitle>
            <CardDescription>
              Paste-ready update for Slack, Discord, or your Monday standup.
              {summary.dayCount > 0 && (
                <>
                  {" "}
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    {summary.totalTicks} ticks · {summary.dayCount} day
                    {summary.dayCount === 1 ? "" : "s"}
                  </Badge>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPreview((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-expanded={showPreview}
            >
              {showPreview ? "Hide preview" : "Preview"}
            </button>
            <CopyButton
              value={markdown}
              label="Copy weekly summary"
              className="text-foreground border-foreground/30 hover:bg-foreground/5"
            />
          </div>
        </div>
      </CardHeader>
      {showPreview && (
        <CardContent>
          <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words font-mono">
            {markdown}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
