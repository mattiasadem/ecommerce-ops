import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResearchTable } from "@/components/research-table";
import { content, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Conversion Rate Optimization — Ecommerce Ops" };

export default function CroPage() {
  const research = content.research;
  const landscape = findTable(research, /conversion-rate landscape/);
  const levers = findTable(research, /moves the needle most/);
  const vertical = findTable(research, /CR by vertical/);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 4 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Conversion Rate Optimization</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The fastest way to grow is converting more of the traffic you already
          have. Mobile is the largest unrealized lever — 73% of traffic,
          ~half the desktop CVR.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Site-wide CR</CardTitle>
            <CardDescription>Global ecommerce median (Q3 2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">1.9–2.0%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Top 20%: 3.2%+ · Top 10%: 4.7%+
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cart abandonment</CardTitle>
            <CardDescription>Baymard 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-danger">70.19%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              35% conversion lift available from a typical checkout overhaul.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mobile vs desktop CVR</CardTitle>
            <CardDescription>The largest unrealized lever</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              1.8% <span className="text-base text-muted-foreground">mobile</span> · 3.9%{" "}
              <span className="text-base text-muted-foreground">desktop</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Closing half the gap ≈ +50% mobile CVR ≈ 10–15% total revenue lift.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The 2026 conversion-rate landscape</CardTitle>
          <CardDescription>Median · Top 20% · Top 10% · by source</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={landscape} highlightColumns={["Median", "Top 20%", "Top 10%"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What moves the needle most</CardTitle>
          <CardDescription>15 levers ranked by typical CR lift</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={levers} highlightColumns={["Typical CR lift"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CR by vertical</CardTitle>
          <CardDescription>Where the benchmarks sit, by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={vertical} highlightColumns={["Median"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top checkout fixes</CardTitle>
          <CardDescription>Baymard's 35 guidelines — minimum bar for any DTC store</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2 text-xs leading-relaxed text-muted-foreground md:grid-cols-2 list-disc pl-5">
            <li><strong className="text-foreground">Guest checkout</strong> — no forced account creation.</li>
            <li><strong className="text-foreground">One-page / accordion checkout</strong> — fewer clicks to "Place order".</li>
            <li><strong className="text-foreground">Shop Pay / Apple Pay / Google Pay</strong> as default on mobile.</li>
            <li><strong className="text-foreground">Inline validation</strong> — no required phone number, no captcha friction.</li>
            <li><strong className="text-foreground">Show order summary + total cost</strong> before the "Place order" CTA.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}