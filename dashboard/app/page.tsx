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
import { YourStoreCard } from "@/components/your-store-card";
import { BenchmarkDial } from "@/components/benchmark-dial";
import { ShippedProgressStrip } from "@/components/shipped-playbooks";
import { NextMoveCard } from "@/components/next-move";
import { IkasLiveCard } from "@/components/ikas-live-card";
import { content, findTable, fmtDate } from "@/lib/content";

export const dynamic = "force-static";

export default function Home() {
  const { research, playbooks, top10, journal, counts, generatedAt } = content;
  const landscape = research.find((r) => r.file.startsWith("00-"));
  const unitEcon = findTable(research, /Unit Economics/);
  const cacRow = unitEcon.find((r) => r["Metric"]?.includes("CAC") && r["Metric"]?.includes("consumer"));
  const ltvRow = unitEcon.find((r) => r["Metric"]?.startsWith("LTV"));
  const merRow = unitEcon.find((r) => r["Metric"]?.startsWith("MER"));

  const shippedMoves = top10.status.filter((s) => s.shipped).length;
  const totalMoves = top10.status.length;
  const pendingMoves = top10.status.filter((s) => s.pending).length;
  const moveProgress = top10.status.length
    ? (shippedMoves / top10.status.length) * 100
    : 0;

  const nextMove = top10.status.find((s) => s.pending);

  // Recommended playbook — first in priority list, ties to UI.
  const recommendedPlaybook = playbooks[0];

  return (
    <div className="flex flex-col gap-8">
      {/* === HERO: customer-facing, action-first === */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Cron running</span>
            <span>·</span>
            <span className="text-foreground">every 6h</span>
            <span className="ml-auto text-[10px] tabular-nums">
              Updated {fmtDate(generatedAt)}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient leading-[1.05]">
            Your DTC operating system.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {counts.playbooks} playbooks shipped. {counts.researchDocs} research
            docs. {counts.assets} assets. {journal.length} cron ticks so far.
            Read the <a className="underline hover:text-foreground" href="/standup">daily standup</a> first — it tells you what shipped yesterday, what's queued today, and what to focus on.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="/standup"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <span>Open today's standup</span>
              <span aria-hidden="true">→</span>
            </a>
            {nextMove && (
              <a
                href={`/playbooks#${recommendedPlaybook?.file.replace(/\.md$/, "")}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <span>Ship next: {nextMove.move.split(".")[1]?.trim() ?? nextMove.move}</span>
              </a>
            )}
            <a
              href="/top-10"
              className="inline-flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              The Top 10 queue →
            </a>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Your store at a glance</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                dev-kreisstudio
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Live once you connect your Ikas store. For now: industry medians.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Blended CAC
                </div>
                <div className="text-xl font-semibold tabular-nums">
                  {cacRow?.["Healthy (median)"]}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Target · top: {cacRow?.["Good (top-quartile)"]}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  LTV : CAC
                </div>
                <div className="text-xl font-semibold tabular-nums">
                  {ltvRow?.["Healthy (median)"]}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Target · top: {ltvRow?.["Good (top-quartile)"]}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  MER (Marketing Efficiency)
                </div>
                <Bar
                  value={(parseFloat(merRow?.["Healthy (median)"]?.split("–")[0] ?? "0") / 6) * 100}
                  intent="accent"
                  label={`Median ${merRow?.["Healthy (median)"]} · top ${merRow?.["Good (top-quartile)"]}`}
                />
              </div>
            </div>
            <Separator />
            <a
              href="/unit-economics"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              See the full benchmark table →
            </a>
          </CardContent>
        </Card>
      </section>

      {/* === DAILY STANDUP PREVIEW — operator-first, latest tick === */}
      {journal.length > 0 && (
        <section>
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                  <CardTitle className="text-sm font-semibold">
                    Latest from the daily standup
                  </CardTitle>
                </div>
                <a
                  href="/standup"
                  className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Open full standup →
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium leading-snug mb-1">
                {journal[0].heading.replace(/^\[[^\]]+\]\s*/, "")}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {journal[0].body.split("\n").filter(l => l.trim().startsWith("- **")).slice(0, 2).join(" ").replace(/\*\*/g, "").slice(0, 280)}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* === YOUR STORE — cross-page ROI inputs === */}
      <section id="your-store">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your store — feed the ROI calculators</CardTitle>
              <Badge variant="accent" className="text-[10px]">
                Live
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Set AOV, monthly orders, and gross margin once. Every interactive
              calculator on <a className="underline hover:text-foreground" href="/playbooks">/playbooks</a> reads from this card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YourStoreCard />
          </CardContent>
        </Card>
      </section>

      {/* === BENCHMARK DIAL — score my numbers vs canonical Unit Economics === */}
      <section>
        <BenchmarkDial rows={unitEcon as unknown as Parameters<typeof BenchmarkDial>[0]["rows"]} />
      </section>

      {/* === LIVE IKAS DATA — pulls from /data/.ikas/config.json on the VPS === */}
      <section id="ikas-overview">
        <IkasLiveCard />
      </section>

      {/* === NEXT-MOVE RECOMMENDATION — what to ship TODAY === */}
      <section id="next-move">
        <NextMoveCard />
      </section>

      {/* === ACTION CARDS: what you can do right now === */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight">What you can do right now</h2>
          <span className="text-xs text-muted-foreground">
            Each action ships a real artifact — playbook, script, or asset.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <a
            href={`/playbooks#${recommendedPlaybook?.file.replace(/\.md$/, "")}`}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <Badge variant="accent" className="text-[10px]">Next move</Badge>
              <span className="text-[10px] text-muted-foreground">
                {(recommendedPlaybook?.size / 1024).toFixed(0)}kb
              </span>
            </div>
            <div className="text-sm font-medium leading-snug">
              {recommendedPlaybook?.title ?? "Open the next playbook"}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {recommendedPlaybook?.meta[0] ?? "Step-by-step playbook with phases, gates, verification, and ROI math."}
            </p>
            <div className="mt-auto flex items-center gap-1 text-xs text-accent group-hover:underline">
              Open playbook <span aria-hidden="true">→</span>
            </div>
          </a>

          <ShippedProgressStrip
            playbooks={playbooks.map((p) => ({
              id: p.file.replace(/\.md$/, ""),
              title: p.title,
            }))}
          />

          <a
            href="/top-10"
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Queue</Badge>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {shippedMoves} / {totalMoves}
              </span>
            </div>
            <div className="text-sm font-medium leading-snug">
              See the {totalMoves} highest-leverage moves
            </div>
            <Bar value={moveProgress} intent="accent" />
            <div className="mt-auto flex items-center gap-1 text-xs text-accent group-hover:underline">
              Pick the next one <span aria-hidden="true">→</span>
            </div>
          </a>

          <a
            href="/journal"
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <Badge variant="success" className="text-[10px]">Live</Badge>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {counts.journalEntries} entries
              </span>
            </div>
            <div className="text-sm font-medium leading-snug line-clamp-1">
              {journal[0]?.heading ?? "No journal entries yet"}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {journal[0]?.body?.slice(0, 140) ?? "Each cron tick produces one bounded improvement and a journal entry."}
            </p>
            <div className="mt-auto flex items-center gap-1 text-xs text-accent group-hover:underline">
              Read journal <span aria-hidden="true">→</span>
            </div>
          </a>
        </div>
      </section>

      {/* === METRICS STRIP: research credibility === */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Research sources"
          value={String(counts.researchDocs)}
          sub={`${counts.tables} tables · ${counts.findings} findings`}
        />
        <MetricCard
          label="Playbooks shipped"
          value={`${counts.playbooks}`}
          sub={`${counts.playbooks * 1}+ weeks of operator work distilled`}
        />
        <MetricCard
          label="Top 10 progress"
          value={`${shippedMoves} / ${totalMoves}`}
          sub={`${pendingMoves} pending moves in queue`}
          intent="accent"
        />
        <MetricCard
          label="Updates per day"
          value="2×"
          sub="Cron-driven, bounded improvements"
          intent="positive"
        />
      </section>

      {/* === RESEARCH: condensed, scannable === */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">The 5 truths every DTC operator should know</CardTitle>
            <CardDescription>
              Pulled from {landscape?.file} — the canonical landscape brief.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <ul className="space-y-2 list-decimal pl-5">
              <li>
                <strong>Unit economics are tighter than 2021–22.</strong> LTV:CAC
                has moved from "3:1 is good" to <strong>3:1 minimum, 4:1 healthy</strong>.
              </li>
              <li>
                <strong>Email + SMS is now the #1 profit channel</strong> —{" "}
                $36–$40 per $1 sent. Already-acquired customers.
              </li>
              <li>
                <strong>Cart abandonment is the biggest leak.</strong> 70.19% global
                average · 35% conversion lift available from a checkout overhaul.
              </li>
              <li>
                <strong>The retention stack is now a checklist, not a moat</strong>:
                Klaviyo + Postscript + loyalty + subscriptions. $500–$3k/mo at $1–10M GMV.
              </li>
              <li>
                <strong>AI is table-stakes</strong>, not a differentiator — biggest
                wins: support deflection, ad creative iteration, PDP personalization.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel ROI ranking</CardTitle>
            <CardDescription>Estimated revenue per $1 spent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Email + SMS", roi: 40, color: "accent" as const, label: "$36–$40×" },
              { name: "Google Search", roi: 6, color: "success" as const, label: "4–8×" },
              { name: "Meta Ads", roi: 3.25, color: "warning" as const, label: "2.5–4×" },
              { name: "TikTok Ads", roi: 2.75, color: "danger" as const, label: "2.0–3.5×" },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums font-mono text-muted-foreground">{c.label}</span>
                </div>
                <Bar value={Math.min(100, c.roi * 2)} intent={c.color} />
              </div>
            ))}
            <Separator />
            <a
              href="/channels"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Full benchmark table →
            </a>
          </CardContent>
        </Card>
      </section>

      {/* === LIBRARY: every page is a tool === */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">The full operating system</CardTitle>
            <CardDescription>
              Every page is a tool tied to a benchmark or a playbook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                { href: "/unit-economics", title: "Unit Economics", desc: "CAC, AOV, LTV, MER" },
                { href: "/channels", title: "Acquisition", desc: "Channel ROI + mix" },
                { href: "/retention", title: "Retention", desc: "Email/SMS, loyalty" },
                { href: "/cro", title: "CRO", desc: "Checkout, PDP, AOV" },
                { href: "/inventory", title: "Inventory", desc: "3PL, forecasting" },
                { href: "/ai", title: "AI / Automation", desc: "Top use cases by ROI" },
                { href: "/top-10", title: "Top 10 Moves", desc: "Ranked by ROI/hr" },
                { href: "/playbooks", title: "Playbooks", desc: "Step-by-step ops" },
                { href: "/journal", title: "Journal", desc: "Every shipped change" },
                { href: "/store", title: "Your Store", desc: "Live Ikas data", soon: true },
              ].map((c) => (
                <a
                  key={c.href + c.title}
                  href={c.href}
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <span className="text-xs font-medium flex items-center justify-between">
                    {c.title}
                    {c.soon && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        soon
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}