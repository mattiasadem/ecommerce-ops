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
import { MetricCard } from "@/components/metric-card";
import { Bar } from "@/components/bar";
import { content, findTable, fmtDate } from "@/lib/content";

export const dynamic = "force-static";

export default function Home() {
  const { research, playbooks, top10, journal, counts, generatedAt } = content;
  const landscape = research.find((r) => r.file.startsWith("00-"));
  const execSummary = landscape?.sections.find((s) => s.heading === "Executive Summary");

  const shippedMoves = top10.status.filter((s) => s.shipped).length;
  const pendingMoves = top10.status.filter((s) => s.pending).length;
  const moveProgress = top10.status.length
    ? (shippedMoves / top10.status.length) * 100
    : 0;

  // Channel mix from acquisition section (60/30/10 default).
  const channelMix = [
    { name: "Email + SMS", roi: 40, share: 0, color: "accent" as const },
    { name: "Google Search", roi: 6, share: 30, color: "success" as const },
    { name: "Meta Ads", roi: 3.25, share: 60, color: "warning" as const },
    { name: "TikTok Ads", roi: 2.75, share: 10, color: "danger" as const },
  ];

  // Quick benchmarks extracted from landscape.md.
  const unitEcon = findTable(research, /Unit Economics/);
  const cacRow = unitEcon.find((r) => r["Metric"]?.includes("CAC") && r["Metric"]?.includes("consumer"));
  const ltvRow = unitEcon.find((r) => r["Metric"]?.startsWith("LTV"));
  const crRow = unitEcon.find((r) => r["Metric"] === "MER (Marketing Efficiency Ratio)");

  // Latest journal entry.
  const latest = journal[0];

  // 30-day rollout plan (synthesis doc — auto-indexed in content.json).
  const rollout = research.find((r) => r.file.startsWith("03-30-day"));
  const weekTables = rollout?.tables ?? [];
  const weeks = weekTables.slice(0, 4).map((t) => {
    const moveCount = t.rows.filter(
      (r) => /Move\s*#\d+/.test(String(r["Move"] ?? ""))
    ).length;
    const totalTime = t.rows.reduce((acc, r) => {
      const t = String(r["Time"] ?? "");
      const m = /(\d+(?:\.\d+)?)\s*hr/i.exec(t);
      return acc + (m ? parseFloat(m[1]) : 0);
    }, 0);
    return { heading: t.heading, moveCount, totalTime };
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-foreground">ecommerce-ops</span>
          <span className="ml-auto text-[10px] tabular-nums">
            content synced {fmtDate(generatedAt)}
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-gradient leading-tight">
          DTC operating system, one tab per lever.
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Sourced 2025–26 benchmarks across unit economics, acquisition, retention,
          CRO, inventory, and AI. Every page is generated from{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/research/*.md</code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/playbooks/*.md</code>.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Research docs"
          value={String(counts.researchDocs)}
          sub={`${counts.tables} tables · ${counts.findings} findings`}
        />
        <MetricCard
          label="Playbooks shipped"
          value={`${counts.playbooks}`}
          sub={`${counts.playbooks} of 7 (full track) · ${counts.playbooks * 1000}+ lines`}
        />
        <MetricCard
          label="Top 10 progress"
          value={`${shippedMoves} / ${top10.status.length}`}
          sub={`${pendingMoves} pending moves`}
          intent="accent"
        />
        <MetricCard
          label="Journal entries"
          value={String(counts.journalEntries)}
          sub="Cron-driven · every bounded improvement"
        />
      </section>

      {rollout && (
        <section>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <CardTitle className="text-base">
                    30-day rollout plan
                  </CardTitle>
                  <Badge variant="accent">synthesis</Badge>
                </div>
                <CardDescription className="font-mono text-[11px]">
                  /research/{rollout.file}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {weeks.map((w, i) => (
                  <div
                    key={w.heading}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Week {i + 1}
                    </div>
                    <div className="mt-1 text-sm font-medium leading-tight">
                      {w.heading.replace(/^Week\s+\d+\s+[—-]\s+/, "").split(" (")[0]}
                    </div>
                    <div className="mt-2 font-mono tabular-nums text-xs text-muted-foreground">
                      {w.moveCount} {w.moveCount === 1 ? "move" : "moves"} ·{" "}
                      {w.totalTime > 0 ? `${w.totalTime.toFixed(1)} hr` : "buffer"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <p className="max-w-2xl text-muted-foreground leading-relaxed">
                  All <strong>16 moves</strong> sequenced day-by-day for a brand
                  starting from zero. Each move&apos;s prerequisite ships in the
                  prior week — no tool without its measurement first.
                </p>
                <Link
                  href="/30-day-plan"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-accent px-3 py-1.5 font-medium text-accent-foreground hover:bg-accent/90"
                >
                  Open the full plan →
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Executive Summary</CardTitle>
            <CardDescription>
              Pulled from {landscape?.file} — the canonical landscape brief.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <ul className="space-y-2 list-decimal pl-5">
              <li>
                <strong>Unit economics are tighter than 2021–22.</strong> Blended DTC
                CAC is $60–$120 in consumer; LTV:CAC has moved from 3:1 is good to{" "}
                <strong>3:1 minimum, 4:1 healthy, 5:1+ capital-efficient</strong>.
              </li>
              <li>
                <strong>Acquisition mix has flipped.</strong> Meta CPMs are 20–40%
                higher YoY; <strong>Email/SMS is now the #1 profit channel</strong> at
                $36–$40 per $1 sent.
              </li>
              <li>
                <strong>Cart abandonment is the single biggest leak</strong> — 70.19%
                global average, with a 35% conversion lift available from a typical
                checkout overhaul.
              </li>
              <li>
                <strong>The retention stack is now a checklist, not a moat:</strong>{" "}
                Klaviyo + Postscript + loyalty + subscriptions. $500–$3,000/mo at
                $1–10M GMV.
              </li>
              <li>
                <strong>AI is table-stakes</strong>, not a differentiator — biggest
                wins are support deflection, ad creative iteration, and PDP
                personalization.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">North-star numbers</CardTitle>
            <CardDescription>From the unit-economics table</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Blended CAC (consumer)
              </div>
              <div className="font-mono tabular-nums">
                {cacRow?.["Healthy (median)"]} → top-quartile{" "}
                {cacRow?.["Good (top-quartile)"]}
              </div>
              <div className="text-xs text-muted-foreground">
                Red flag: {cacRow?.["Red flag"]}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                LTV : CAC ratio
              </div>
              <div className="font-mono tabular-nums">{ltvRow?.["Healthy (median)"]}</div>
              <div className="text-xs text-muted-foreground">
                Red flag: {ltvRow?.["Red flag"]}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                MER target
              </div>
              <div className="font-mono tabular-nums">{crRow?.["Healthy (median)"]}</div>
              <div className="text-xs text-muted-foreground">
                Top-quartile: {crRow?.["Good (top-quartile)"]}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel ROI ranking</CardTitle>
            <CardDescription>Revenue per $1 spent (estimated)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channelMix.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums font-mono">
                    {c.roi >= 10 ? `${c.roi}×` : `${c.roi.toFixed(2)}×`}
                  </span>
                </div>
                <Bar value={Math.min(100, c.roi * 2)} intent={c.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top-10 progress</CardTitle>
            <CardDescription>
              {shippedMoves} shipped · {pendingMoves} pending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Bar value={moveProgress} label="Shipped" intent="accent" />
            <div className="space-y-1 text-xs">
              {top10.status.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="truncate text-muted-foreground">{m.move}</span>
                  <Badge
                    variant={m.shipped ? "success" : m.pending ? "outline" : "secondary"}
                    className="shrink-0"
                  >
                    {m.shipped ? "shipped" : m.pending ? "pending" : "—"}
                  </Badge>
                </div>
              ))}
            </div>
            <Link
              href="/top-10"
              className="inline-flex items-center text-xs text-accent hover:underline"
            >
              See the full Top-10 ranking →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest journal entry</CardTitle>
            <CardDescription>
              {latest ? latest.heading : "no journal yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-muted-foreground">
            {latest ? (
              <p className="line-clamp-[14]">{latest.body}</p>
            ) : (
              <p>No journal entries parsed.</p>
            )}
            <Link
              href="/journal"
              className="mt-3 inline-flex items-center text-accent hover:underline"
            >
              All journal entries →
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where to go next</CardTitle>
            <CardDescription>
              Each page is a focused lever. Open the one that maps to the move you&apos;re shipping today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                { href: "/unit-economics", title: "Unit economics", desc: "CAC, AOV, LTV, MER" },
                { href: "/channels", title: "Acquisition", desc: "Channel ROI + mix" },
                { href: "/retention", title: "Retention", desc: "Email/SMS, loyalty" },
                { href: "/cro", title: "CRO", desc: "Checkout, PDP, AOV" },
                { href: "/inventory", title: "Inventory", desc: "3PL, forecasting" },
                { href: "/ai", title: "AI / Automation", desc: "Top use cases by ROI" },
                { href: "/top-10", title: "Top 10 moves", desc: "Ranked by ROI/hr" },
                { href: "/playbooks", title: "Playbooks", desc: "Step-by-step ops" },
                { href: "/journal", title: "Journal", desc: "Cron-driven changes" },
                { href: "/playbooks", title: "Run a script", desc: "ROI calculators" },
              ].map((c) => (
                <Link
                  key={c.href + c.title}
                  href={c.href}
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <span className="text-xs font-medium">{c.title}</span>
                  <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}