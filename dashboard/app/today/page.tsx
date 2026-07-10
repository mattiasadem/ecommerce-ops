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
import { AbandonedCartROICalculator as AbandonedCartRoi } from "@/components/abandoned-cart-roi";
import { PostPurchaseUpsellROICalculator as PostPurchaseUpsellRoi } from "@/components/post-purchase-upsell-roi";
import { WelcomeSeriesROICalculator as WelcomeSeriesRoi } from "@/components/welcome-series-roi";
import { YourStoreCard } from "@/components/your-store-card";
import { NextMoveCard } from "@/components/next-move";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Today — Ecommerce Ops",
  description: "Your daily operator cockpit. KPIs, tasks, calculators.",
};

function parseHeadingTimestamp(heading: string): Date | null {
  const m = /^\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/.exec(heading);
  if (!m) return null;
  return new Date(`${m[1]}T${m[2]}:00Z`);
}

function shortTitle(heading: string): string {
  return heading.replace(/^\[[^\]]+\]\s*/, "").split(/[.:]/)[0].slice(0, 100);
}

export default function TodayPage() {
  const { journal, counts, generatedAt, top10 } = content;

  // Today's ticks (last 24h)
  const today = new Date(generatedAt);
  const yesterday = new Date(today);
  yesterday.setUTCHours(yesterday.getUTCHours() - 24);
  const todayTicks = journal.filter((e) => {
    const ts = parseHeadingTimestamp(e.heading);
    return ts && ts >= yesterday;
  });

  // Project start
  const projectStart = new Date("2026-06-23");
  const daysRunning = Math.max(
    1,
    Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Top 10 progress
  const shipped = top10.status.filter((s) => s.shipped).length;
  const pending = top10.status.filter((s) => s.pending).length;

  // Latest journal entry's "Next action"
  const nextActionMatch = journal[0]
    ? /-\s+\*\*Next action:\*\*\s*(.+?)(?:\n|$)/.exec(journal[0].body)
    : null;
  const nextAction = nextActionMatch ? nextActionMatch[1].trim() : null;

  // Pull 3 most recent journal entries for "what shipped"
  const recentTicks = journal.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* === Header — operator daily cockpit === */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operator cockpit</span>
          <span>·</span>
          <span>Day {daysRunning}</span>
          <span className="ml-auto text-[10px] tabular-nums">
            {fmtDate(generatedAt)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Your store at a glance, the move to ship next, and the ROI calculators
          that drive it.
        </p>
      </header>

      {/* === Top KPI row === */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Ticks today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{todayTicks.length}</div>
            <div className="text-[10px] text-muted-foreground">last 24 hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Playbooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{counts.playbooks}</div>
            <div className="text-[10px] text-muted-foreground">shipped, ready to use</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Top 10 progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {shipped}<span className="text-base text-muted-foreground">/{shipped + pending}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">highest-leverage moves</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{daysRunning}</div>
            <div className="text-[10px] text-muted-foreground">of the build</div>
          </CardContent>
        </Card>
      </section>

      {/* === Your store at top — single source of truth === */}
      <section>
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Your store</CardTitle>
                <CardDescription className="text-xs">
                  Set once. All three ROI calculators below read from this.
                </CardDescription>
              </div>
              <Link
                href="/settings"
                className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Edit in Settings →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <YourStoreCard />
          </CardContent>
        </Card>
      </section>

      {/* === Next move — what to ship === */}
      <section>
        <NextMoveCard />
      </section>

      {/* === Three ROI calculators side by side === */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
            Run the numbers
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Personalized from Your store above
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Abandoned cart</CardTitle>
                <Badge variant="outline" className="text-[10px]">Move #1</Badge>
              </div>
              <CardDescription className="text-xs">
                Single highest-ROI flow in DTC. Recovers 5–15% of lost carts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AbandonedCartRoi />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Post-purchase upsell</CardTitle>
                <Badge variant="outline" className="text-[10px]">Move #2</Badge>
              </div>
              <CardDescription className="text-xs">
                Cheapest AOV lift. 10–20% AOV jump from one good offer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostPurchaseUpsellRoi />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Welcome series</CardTitle>
                <Badge variant="outline" className="text-[10px]">Move #4</Badge>
              </div>
              <CardDescription className="text-xs">
                Lifts 90-day LTV 10–20% on a flow that runs itself.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WelcomeSeriesRoi />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* === Today's focus + what shipped === */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
              <CardTitle className="text-sm font-semibold">Today's focus</CardTitle>
            </div>
            <CardDescription className="text-xs">
              What the cron picked for the next tick.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextAction ? (
              <p className="text-sm leading-relaxed">{nextAction}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No next action set yet.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Link
                href="/top-10"
                className="text-[10px] uppercase tracking-wider text-foreground hover:underline"
              >
                Top 10 queue →
              </Link>
              <span className="text-border">·</span>
              <Link
                href="/playbooks"
                className="text-[10px] uppercase tracking-wider text-foreground hover:underline"
              >
                All playbooks →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                <CardTitle className="text-sm font-semibold">What shipped</CardTitle>
              </div>
              <Link
                href="/standup"
                className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Full standup →
              </Link>
            </div>
            <CardDescription className="text-xs">
              The 3 most recent cron ticks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {recentTicks.map((entry, idx) => {
                const ts = parseHeadingTimestamp(entry.heading);
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs leading-snug border-l-2 border-emerald-500/30 pl-2"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {shortTitle(entry.heading)}
                      </div>
                      {ts && (
                        <div className="text-[10px] text-muted-foreground tabular-nums">
                          {ts.toISOString().slice(0, 10)} · {ts.toISOString().slice(11, 16)} UTC
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}