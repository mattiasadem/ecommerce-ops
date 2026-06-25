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

export const metadata = { title: "Inventory & Ops — Ecommerce Ops" };

export default function InventoryPage() {
  const research = content.research;
  const compare = findTable(research, /3PL vs in-house/);
  const threepl = findTable(research, /Major 3PLs/);
  const forecast = findTable(research, /forecasting basics/);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 5 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory & Operations</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          3PL vs in-house, the major 3PL cost stack, demand forecasting basics, and
          cash conversion cycle for DTC.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3PL vs in-house</CardTitle>
          <CardDescription>Cost & control tradeoff</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={compare} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Major 3PLs and rough pricing (2025/26)</CardTitle>
          <CardDescription>Pick + pack · storage · minimums · best for</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={threepl} highlightColumns={["Pick+pack", "Storage", "Min/mo"]} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demand forecasting basics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={forecast} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cash Conversion Cycle (CCC)</CardTitle>
            <CardDescription>Underrated health metric for DTC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs leading-relaxed">
            <div className="font-mono text-xs">
              CCC = DIO + DSO − DPO
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div>• DIO = 45–90 days (stock on shelf; you own it)</div>
              <div>• DSO = 0–3 days (paid at order, mostly)</div>
              <div>• DPO = 15–45 days (net-30 from suppliers common; 60+ negotiable)</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Target
              </div>
              <div className="font-mono text-sm">
                CCC ≈ 30–75 days · healthy &lt; 60 · &gt; 90 = growing inventory faster than cash
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li><strong className="text-foreground">3PL break-even</strong> for most DTC is around $3–5M GMV / 2,000–5,000 orders/mo.</li>
            <li><strong className="text-foreground">Negotiate pick/pack tiers</strong>, not list price — most 3PLs drop $5 + $0.50/unit to $3.50 + $0.30 at volume.</li>
            <li><strong className="text-foreground">Biggest ops win is reducing stockouts</strong>, not reducing inventory. Target in-stock rate &gt; 97% on A-items, &gt; 92% overall.</li>
            <li><strong className="text-foreground">FIFO, lot/date tracking, serialized SKUs from day one.</strong></li>
            <li><strong className="text-foreground">Demand forecasting at SKU level</strong> with MAPE &lt; 25% is achievable at $1M+ GMV with Inventory Planner or SoStocked.</li>
            <li><strong className="text-foreground">Returns are 15–25% of orders</strong> for apparel, 5–10% for most other verticals — build a returns portal on day one.</li>
            <li><strong className="text-foreground">Don't build a custom WMS</strong> — Cin7, Brightpearl, NetSuite, Linnworks cover 95% of needs.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}