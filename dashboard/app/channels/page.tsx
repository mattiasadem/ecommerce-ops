import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResearchTable } from "@/components/research-table";
import { Bar } from "@/components/bar";
import { ChannelMixAllocator } from "@/components/channel-mix-allocator";
import { ChannelBenchmarkExportButton } from "@/components/channel-benchmark-export-button";
import { content, findTable } from "@/lib/content";
import type { ChannelBenchmarkBlock } from "@/lib/channel-benchmark-export";

/**
 * Extract the canonical column headers from a research-table block —
 * mirrors the `ResearchTable` reducer so the bundled CSV uses the same
 * header order the operator sees in the dashboard.
 */
function tableHeaders(rows: Array<Record<string, string>>): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r)) set.add(k);
  }
  return Array.from(set);
}

export const dynamic = "force-static";

export const metadata = { title: "Acquisition Channels — Ecommerce Ops" };

export default function ChannelsPage() {
  const research = content.research;
  const ranking = findTable(research, /Channel ranking/);
  const meta = findTable(research, /^Meta \(Facebook/);
  const google = findTable(research, /^Google Ads$/);
  const tiktok = findTable(research, /^TikTok Ads$/);
  const organic = findTable(research, /^Organic/);
  const email = findTable(research, /^Email \+ SMS$/);
  const influencer = findTable(research, /^Influencer/);

  // Build the 6-channel benchmark bundle for the one-click CSV export.
  // Mirrors the canonical header order the operator sees in each
  // `<ResearchTable>` block above so the bundled CSV matches the on-screen
  // column ordering row-for-row.
  const benchmarkBlocks: ChannelBenchmarkBlock[] = [
    {
      id: "meta",
      title: "Meta (Facebook + Instagram) benchmarks",
      headers: tableHeaders(meta),
      rows: meta,
    },
    {
      id: "google",
      title: "Google Ads benchmarks",
      headers: tableHeaders(google),
      rows: google,
    },
    {
      id: "tiktok",
      title: "TikTok Ads · 2025 typical range",
      headers: tableHeaders(tiktok),
      rows: tiktok,
    },
    {
      id: "organic",
      title: "Organic (SEO + UGC)",
      headers: tableHeaders(organic),
      rows: organic,
    },
    {
      id: "email",
      title: "Email + SMS engagement",
      headers: tableHeaders(email),
      rows: email,
    },
    {
      id: "influencer",
      title: "Influencer / Creator rates (US 2025)",
      headers: tableHeaders(influencer),
      rows: influencer,
    },
  ];

  // Visualize Meta ROAS via a bar.
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 2 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Acquisition Channels</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          2025–26 channel-by-channel ROI for $1M–$50M DTC consumer. Ranked by
          blended ROAS / ROI per dollar spent.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 channels by ROI</CardTitle>
          <CardDescription>
            From research/00-ecommerce-ops-landscape.md § 2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={ranking} highlightColumns={["Blended ROAS / ROI"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel ROI · relative scale</CardTitle>
          <CardDescription>
            Normalized bars · Email/SMS dwarfs everything else by revenue per $1
            spent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranking.map((r, i) => {
            const roi = parseFloat(String(r["Blended ROAS / ROI"] ?? "0").replace(/×|~/g, "").split("–")[0]) || 0;
            const max = 40;
            const pct = Math.min(100, (roi / max) * 100);
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate pr-2">{r["Channel"] ?? r["Rank"] ?? `Row ${i + 1}`}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {r["Blended ROAS / ROI"]}
                  </span>
                </div>
                <Bar value={pct} intent={i === 0 ? "accent" : i < 3 ? "success" : i < 6 ? "warning" : "danger"} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Interactive Channel Mix Budget Allocator — closes the operator loop
          from "which channels rank highest ROI" (research/00 § 2) to
          "what does MY split project in revenue + margin $ tied to MY
          AOV/orders/margin on Overview". State persists to localStorage so
          the allocation survives reloads. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Channel mix budget allocator — split your monthly budget
          </CardTitle>
          <CardDescription>
            Enter your monthly marketing budget + drag the 10 channel sliders.
            Per-channel ROAS band × Your-store gross margin projects the
            blended ROAS, revenue, and net margin. State auto-saved to your
            browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ChannelMixAllocator />
          {/* One-click CSV bundle of every channel benchmark table below —
              closes the operator's "I want one file with all 6 channels" loop
              so they can pivot across channels in their own spreadsheet
              without copy-pasting between per-table CSVs. */}
          <ChannelBenchmarkExportButton blocks={benchmarkBlocks} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta (Facebook + Instagram) benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={meta} highlightColumns={["CPM (USD)", "CTR (link)", "CPC (link)", "CVR (post-click)"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Ads benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={google} highlightColumns={["Search CPC", "Search CTR", "Display CPM", "Shopping CPC"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TikTok Ads · 2025 typical range</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={tiktok} highlightColumns={["2025 typical range"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organic (SEO + UGC)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={organic} highlightColumns={["2025 typical range"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email + SMS engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={email} highlightColumns={["Open rate", "CTR", "CTOR", "Revenue/$1 spent"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Influencer / Creator rates (US 2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={influencer} highlightColumns={["Cost per post (US, 2025)", "Cost per 1k views"]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}