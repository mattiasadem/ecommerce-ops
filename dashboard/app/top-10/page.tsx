import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar } from "@/components/bar";
import { content } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Top 10 Moves — Ecommerce Ops" };

export default function Top10Page() {
  const { top10 } = content;
  const main = top10.tables.find((t) => /highest-leverage/i.test(t.heading));
  const shipped = top10.status.filter((s) => s.shipped).length;
  const total = top10.status.length;
  const pct = (shipped / Math.max(1, total)) * 100;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          The prioritized list
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Top 10 Highest-Leverage Moves</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          If you only do 10 things in 2026, do these. Ranked by expected revenue
          impact per hour of operator time — not effort, not &quot;good practice.&quot;
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
          <CardDescription>
            {shipped} shipped of {total} · pending moves are next-up for the cron
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Bar value={pct} intent="accent" label={`${shipped}/${total} shipped`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The ranked list</CardTitle>
          <CardDescription>
            From research/02-top-10-leverage-moves.md
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {main?.rows.map((row, i) => {
            const status = top10.status.find((s) =>
              s.move.toLowerCase().includes((row["Move"] ?? "").split(".")[0]?.toLowerCase() ?? "___")
            );
            const rank = (row["#"] ?? row["Move"] ?? "").toString();
            return (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-border p-4 md:flex-row md:items-start md:gap-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background font-mono text-sm">
                  {rank.match(/^\d+/)?.[0] ?? i + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{row["Move"]}</span>
                    {status && (
                      <Badge
                        variant={status.shipped ? "success" : status.pending ? "outline" : "secondary"}
                      >
                        {status.shipped ? "shipped" : status.pending ? "pending" : "—"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {row["Why it ranks"]}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-muted-foreground">
                    <span>
                      <span className="uppercase tracking-wider">Effort:</span>{" "}
                      <span className="text-foreground">{row["Estimated effort"]}</span>
                    </span>
                    <span>
                      <span className="uppercase tracking-wider">Expected ROI:</span>{" "}
                      <span className="text-foreground">{row["Expected ROI"]}</span>
                    </span>
                    {status?.touched && (
                      <span>
                        <span className="uppercase tracking-wider">Last touched:</span>{" "}
                        <span className="text-foreground">{status.touched}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cron selection logic</CardTitle>
          <CardDescription>
            How the cron picks the next move when there&apos;s no in-progress one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1 text-xs leading-relaxed text-muted-foreground list-decimal pl-5">
            <li>Prefer unfinished items from <code className="rounded bg-muted px-1">/playbooks/</code> over starting new ones.</li>
            <li>Prefer items #1–#5 in the list above if no playbook is in progress.</li>
            <li>Never start a new move if there&apos;s an in-progress one — finish first.</li>
            <li>Cap each move at ~1 day of work. If it balloons, split into a new playbook.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}