import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AbandonedCartROICalculator } from "@/components/abandoned-cart-roi";
import { WelcomeSeriesROICalculator } from "@/components/welcome-series-roi";
import { PostPurchaseUpsellROICalculator } from "@/components/post-purchase-upsell-roi";
import { AiAdCreativeROICalculator } from "@/components/ai-ad-creative-roi";
import { PdpAbTestCalculator } from "@/components/pdp-ab-test-calculator";
import { ShippedPlaybooks as ShippedPlaybooksTracker } from "@/components/shipped-playbooks";
import { PlaybookSearch } from "@/components/playbook-search";
import { content, freshnessTier } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Playbooks — Ecommerce Ops" };

// Freshness badge color — driven by lastTouched mtime from the parser.
const TIER_STYLES: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  aging: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  stale: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function PlaybooksPage() {
  const { playbooks } = content;

  // Aggregate freshness summary for the header strip.
  const freshCount = playbooks.filter((p) => freshnessTier(p.lastTouched) === "fresh").length;
  const agingCount = playbooks.filter((p) => freshnessTier(p.lastTouched) === "aging").length;
  const staleCount = playbooks.filter((p) => freshnessTier(p.lastTouched) === "stale").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Step-by-step ops
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Playbooks</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Every shipped playbook for the cron-driven DTC operator. Each playbook
          is a runbook — phases, gates, verification, pitfalls, ROI math.
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

      <AbandonedCartROICalculator />

      <PostPurchaseUpsellROICalculator />

      <WelcomeSeriesROICalculator />

      <AiAdCreativeROICalculator />

      <PdpAbTestCalculator />

      <ShippedPlaybooksTracker
        playbooks={playbooks.map((p) => ({
          id: p.file.replace(/\.md$/, ""),
          title: p.title,
        }))}
      />

      <PlaybookSearch
        playbooks={playbooks.map((p) => ({
          id: p.file.replace(/\.md$/, ""),
          title: p.title,
          file: p.file,
          meta: p.meta,
          numberedSections: p.numberedSections,
          lastTouched: p.lastTouched,
          sectionCount: p.sectionCount,
          size: p.size,
        }))}
      />
    </div>
  );
}