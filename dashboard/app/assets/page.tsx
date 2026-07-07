import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content, freshnessLabel, freshnessTier } from "@/lib/content";
import {
  ContentSearch,
  type ContentSearchItem as ContentSearchItemType,
} from "@/components/content-search";

export const dynamic = "force-static";

export const metadata = { title: "Assets — Ecommerce Ops" };

// Freshness badge color — driven by lastTouched mtime from the parser.
// Mirrors /playbooks tier styling so users learn the visual once and apply it everywhere.
const TIER_STYLES: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  aging: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  stale: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function AssetsPage() {
  const { assets, counts } = content;

  const voiceGated = assets.filter((a) => a.voiceGated).length;
  const totalSize = assets.reduce((n, a) => n + a.size, 0);

  // Aggregate freshness summary for the header strip.
  const freshCount = assets.filter((a) => freshnessTier(a.lastTouched) === "fresh").length;
  const agingCount = assets.filter((a) => freshnessTier(a.lastTouched) === "aging").length;
  const staleCount = assets.filter((a) => freshnessTier(a.lastTouched) === "stale").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Paste-ready content library
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          {counts.assets} paste-ready artifacts — copy templates, brand-voice
          framework, UGC briefs, promo calendar, retention reference card, NPS
          toolkit, competitive teardown, CS response library, impact-reporting
          framework, affiliate-program playbook, CS training program, and
          impact-data pipeline. Each ships with a 5-voice override column so the
          same artifact adapts to Default / Luxury / Sustainable / Gen-Z / B2B
          brand profiles.
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
            <CardTitle className="text-base">Total assets</CardTitle>
            <CardDescription>On-disk paste-ready artifacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {counts.assets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice-gated</CardTitle>
            <CardDescription>
              All 5 voice profiles clear the ≥15 density threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {voiceGated}
              <span className="text-base text-muted-foreground font-normal ml-1">
                / {counts.assets}
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
              <span className="text-base text-muted-foreground font-normal ml-1">
                KB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

    <div className="flex flex-col gap-3">
      <ContentSearch
        kind="assets"
        routePrefix="/assets"
        items={assets.map((a) => ({
          id: a.file.replace(/\.md$/, ""),
          title: a.title,
          file: a.file,
          meta: a.meta,
          numberedSections: a.numberedSections,
          lastTouched: a.lastTouched ?? null,
          sectionCount: a.sectionCount,
          size: a.size,
          voiceGated: a.voiceGated,
          voiceCounts: a.voiceCounts,
          assetNumber: a.assetNumber ?? null,
        }))}
        itemNumberField={"assetNumber" as keyof ContentSearchItemType}
      />
    </div>
    </div>
  );
}