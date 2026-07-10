import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResearchTable } from "@/components/research-table";
import { UnitEconPersonalizer } from "@/components/unit-econ-personalizer";
import { content, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Unit Economics — Ecommerce Ops" };

export default function UnitEconomicsPage() {
  const research = content.research;
  const rows = findTable(research, /Unit Economics/);

  // Sub-sections: AOV by vertical.
  const aov = findTable(research, /Unit Economics/);

  // ROI by channel.
  const chRows = findTable(research, /Acquisition Channels Ranked by ROI/);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 1 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Unit Economics</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Benchmarks for healthy, top-quartile, and red-flag ranges across CAC,
          LTV, AOV, MER, contribution margin, and churn. Use these as the operating
          constraints before deciding on a channel mix or growth lever.
        </p>
      </header>

      <UnitEconPersonalizer />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headline benchmarks</CardTitle>
          <CardDescription>
            From research/00-ecommerce-ops-landscape.md · tagged{" "}
            <span className="text-success">[verified]</span> ·
            <span className="text-warning"> [directional]</span> ·
            <span className="text-muted-foreground"> [rule-of-thumb]</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={rows} highlightColumns={["Healthy (median)", "Good (top-quartile)", "Red flag"]} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key findings</CardTitle>
            <CardDescription>From the Unit Economics Findings section</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs leading-relaxed list-disc pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">LTV:CAC is the most important metric</strong> — measure
                gross-margin-adjusted (Gross LTV, not Revenue LTV). Target ≥3:1.
              </li>
              <li>
                <strong className="text-foreground">AOV must be ≥ 2× blended CAC</strong> to break even on
                the first transaction.
              </li>
              <li>
                <strong className="text-foreground">CAC payback has roughly doubled since 2021</strong> (3–6
                months → 6–9 months). Subsidize with retention — each month of LTV is
                worth 8–10% CAC tolerance.
              </li>
              <li>
                <strong className="text-foreground">MER &gt; ROAS</strong> — channel-agnostic metric captures
                organic halo and branded-search lift.
              </li>
              <li>
                <strong className="text-foreground">Contribution margin &lt; 15% is the death zone</strong>.
                Most brands that die do so at 8–10%.
              </li>
              <li>
                <strong className="text-foreground">Subscriptions change the whole equation</strong> — a
                $40/mo with 5% monthly churn = $800 LTV before gross margin.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel ROI ranking (overview)</CardTitle>
            <CardDescription>
              See the <a href="/channels" className="text-accent hover:underline">Acquisition</a> page for the full breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={chRows.slice(0, 10)} highlightColumns={["Blended ROAS / ROI"]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}