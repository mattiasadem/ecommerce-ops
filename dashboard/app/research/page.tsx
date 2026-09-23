import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content, freshnessTier } from "@/lib/content";
import {
  ContentSearch,
  type ContentSearchItem as ContentSearchItemType,
} from "@/components/content-search";

export const dynamic = "force-static";

export const metadata = { title: "Research — Ecommerce Ops" };

const TIER_STYLES: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  aging: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  stale: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function ResearchIndexPage() {
  const docs = content.research;
  // Sort by file number (00, 01, …) so the reader sees them in the canonical
  // numbered order.
  const sorted = [...docs].sort((a, b) => a.file.localeCompare(b.file));

  // Aggregate freshness summary for the header strip — mirrors the
  // /assets header pattern so operators learn one visual and apply
  // it everywhere.
  const freshCount = sorted.filter(
    (d) => freshnessTier(d.lastTouched ?? undefined) === "fresh",
  ).length;
  const agingCount = sorted.filter(
    (d) => freshnessTier(d.lastTouched ?? undefined) === "aging",
  ).length;
  const staleCount = sorted.filter(
    (d) => freshnessTier(d.lastTouched ?? undefined) === "stale",
  ).length;
  const totalFindings = sorted.reduce(
    (n, d) => n + (d.findings?.length ?? 0),
    0,
  );
  const totalTables = sorted.reduce((n, d) => n + (d.tables?.length ?? 0), 0);
  const totalSize = sorted.reduce((n, d) => n + (d.size ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          The raw, sourced research
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Research docs</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          {docs.length} long-form research briefs. Each one drives one or more
          pages on the dashboard (channels, lifecycle, 3PL, etc.). Click any
          card to open the full SSR-rendered document with a permanent URL
          you can share.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Freshness
          </span>
          <Badge variant="outline" className={TIER_STYLES.fresh}>
            {freshCount} fresh
          </Badge>
          <Badge variant="outline" className={TIER_STYLES.aging}>
            {agingCount} aging
          </Badge>
          <Badge variant="outline" className={TIER_STYLES.stale}>
            {staleCount} stale
          </Badge>
          <span className="text-[10px] text-muted-foreground ml-1">
            (fresh &lt;14d · aging 14–60d · stale &gt;60d since last edit)
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total research docs</CardTitle>
            <CardDescription>On-disk long-form briefs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {sorted.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tables + findings</CardTitle>
            <CardDescription>Aggregated structured data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {totalTables}
              <span className="ml-1 text-base text-muted-foreground font-normal">
                tables
              </span>
              <span className="mx-1.5 text-base text-muted-foreground">·</span>
              {totalFindings}
              <span className="ml-1 text-base text-muted-foreground font-normal">
                findings
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total size</CardTitle>
            <CardDescription>
              Combined markdown content (no build step)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {(totalSize / 1024).toFixed(0)}
              <span className="ml-1 text-base text-muted-foreground font-normal">
                KB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ContentSearch — same component shape as /assets + /playbooks:
          text query across title + file + meta + section headings, plus
          a freshness-tier chip group. State persists to localStorage
          under a `research`-kind discriminator so the asset and research
          filter state don't collide. */}
      <ContentSearch
        kind="research"
        routePrefix="/research"
        items={sorted.map((d) => {
          // Pull the leading number from the filename so the chip can
          // display RD-00 / RD-01 / … RD-17 in the canonical order.
          const m = /^(\d+)-/.exec(d.file);
          const researchNumber = m ? parseInt(m[1], 10) : null;
          return {
            id: d.file.replace(/\.md$/, ""),
            title:
              d.title ??
              d.file
                .replace(/\.md$/, "")
                .replace(/^\d+-/, "")
                .replace(/-/g, " "),
            file: d.file,
            meta: d.findings,
            numberedSections: d.numberedSections,
            lastTouched: d.lastTouched ?? null,
            sectionCount: d.sectionCount,
            size: d.size,
            assetNumber: researchNumber ?? undefined,
          } satisfies ContentSearchItemType;
        })}
        itemNumberField={"assetNumber" as keyof ContentSearchItemType}
      />
    </div>
  );
}
