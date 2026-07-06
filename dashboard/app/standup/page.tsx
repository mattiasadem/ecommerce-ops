import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { content, fmtDate } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "Daily Standup — Ecommerce Ops",
  description: "What shipped, what's in progress, and what to focus on today.",
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getUTCDay()]}, ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function parseHeadingTimestamp(heading: string): Date | null {
  // Journal headings look like: [2026-07-10 03:00] Title
  const m = /^\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/.exec(heading);
  if (!m) return null;
  return new Date(`${m[1]}T${m[2]}:00Z`);
}

function timeAgo(target: Date, from: Date): string {
  const diffMs = from.getTime() - target.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

// Extract the short one-line title from a journal heading
function shortTitle(heading: string): string {
  // Strip the [timestamp] prefix
  const cleaned = heading.replace(/^\[[^\]]+\]\s*/, "");
  // If too long, take first sentence
  const firstSentence = cleaned.split(/[.:]/)[0];
  return firstSentence.length > 110
    ? firstSentence.slice(0, 107) + "..."
    : firstSentence;
}

function extractBullets(body: string, marker: string): string[] {
  // Match "- **Foo:** bar" lines
  const re = new RegExp(`-\\s+\\*\\*${marker}:\\*\\*\\s*(.+)`, "g");
  const bullets: string[] = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    bullets.push(m[1].trim().replace(/\s+\*\*[^*]+:\*\*\s+.*$/, "")); // strip trailing fields
    if (bullets.length >= 5) break;
  }
  return bullets;
}

function extractNextAction(body: string): string | null {
  const m = /-\s+\*\*Next action:\*\*\s*(.+?)(?:\n|$)/.exec(body);
  return m ? m[1].trim() : null;
}

export default function StandupPage() {
  const { journal, generatedAt, counts } = content;
  const today = new Date(generatedAt);

  // Group entries by day
  const last7Days: { date: Date; entries: typeof journal }[] = [];
  for (let dOffset = 0; dOffset < 7; dOffset++) {
    const dayStart = new Date(today);
    dayStart.setUTCDate(dayStart.getUTCDate() - dOffset);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const entries = journal.filter((e) => {
      const ts = parseHeadingTimestamp(e.heading);
      return ts && ts >= dayStart && ts < dayEnd;
    });
    last7Days.push({ date: dayStart, entries });
  }

  // Today's entries = shipped in last 24h
  const today24h = new Date(today);
  today24h.setUTCHours(today24h.getUTCHours() - 24);
  const recentEntries = journal.filter((e) => {
    const ts = parseHeadingTimestamp(e.heading);
    return ts && ts >= today24h;
  });

  // Latest entry's "Next action" = today's focus
  const latestNextAction = journal.length > 0
    ? extractNextAction(journal[0].body)
    : null;

  // Total ticks since project start
  const projectStart = new Date("2026-06-23");
  const daysRunning = Math.max(
    1,
    Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* === HEADER: Today's standup === */}
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Daily standup</span>
          <span>·</span>
          <span>Day {daysRunning} of the build</span>
          <span className="ml-auto text-[10px] tabular-nums">
            Updated {fmtDate(generatedAt)}
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          {formatDate(generatedAt)}
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl">
          What shipped, what's in progress, what to focus on today. Read this
          first — every morning.
        </p>
      </header>

      {/* === TOP ROW: Status pills === */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Shipped today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {recentEntries.length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              cron ticks in last 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Playbooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {counts.playbooks}
            </div>
            <div className="text-[10px] text-muted-foreground">
              shipped across {counts.researchDocs} research docs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Active tracks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">17</div>
            <div className="text-[10px] text-muted-foreground">
              15 closed at 6/6 layers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Deploy cadence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">6h</div>
            <div className="text-[10px] text-muted-foreground">
              cron tick interval
            </div>
          </CardContent>
        </Card>
      </section>

      {/* === TODAY'S FOCUS === */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
          Today's focus
        </h2>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            {latestNextAction ? (
              <p className="text-base leading-relaxed">{latestNextAction}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No next action set yet — check back after the next cron tick.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* === LAST 7 DAYS, human-readable === */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
          What shipped this week
        </h2>
        {last7Days.map((day) => {
          if (day.entries.length === 0) {
            return (
              <Card key={day.date.toISOString()} className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatDate(day.date.toISOString())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground italic">
                    No ticks this day.
                  </p>
                </CardContent>
              </Card>
            );
          }
          return (
            <Card key={day.date.toISOString()}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {formatDate(day.date.toISOString())}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {day.entries.length} tick{day.entries.length === 1 ? "" : "s"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {day.entries.map((entry, idx) => {
                    const ts = parseHeadingTimestamp(entry.heading);
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm leading-relaxed border-l-2 border-emerald-500/40 pl-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {shortTitle(entry.heading)}
                          </div>
                          {ts && (
                            <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                              {ts.toISOString().slice(11, 16)} UTC · {timeAgo(ts, today)}
                            </div>
                          )}
                          {(() => {
                            const bullets = [
                              ...extractBullets(entry.body, "What shipped"),
                              ...extractBullets(entry.body, "Why this move"),
                            ];
                            if (bullets.length > 0) {
                              return (
                                <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                                  {bullets.slice(0, 2).map((b, j) => (
                                    <li key={j} className="leading-snug">
                                      · {b}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator />

      {/* === FOOTER: link out === */}
      <section className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          All entries come from <code className="rounded bg-muted px-1">docs/journal.md</code>.
        </span>
        <a
          href="/journal"
          className="text-foreground hover:underline underline-offset-4"
        >
          Full journal (raw, chronological) →
        </a>
      </section>
    </div>
  );
}