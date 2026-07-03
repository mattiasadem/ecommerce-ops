import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { AbandonedCartROICalculator } from "@/components/abandoned-cart-roi";
import { WelcomeSeriesROICalculator } from "@/components/welcome-series-roi";
import { PostPurchaseUpsellROICalculator } from "@/components/post-purchase-upsell-roi";
import { content, freshnessLabel, freshnessTier } from "@/lib/content";

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

      <div className="flex flex-col gap-3">
        {playbooks.map((p, i) => {
          const tier = freshnessTier(p.lastTouched);
          const label = freshnessLabel(p.lastTouched);
          const playbookId = p.file.replace(/\.md$/, "");
          return (
            <Card key={p.file} id={playbookId}>
              <CardHeader>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    PB-{String(i + 1).padStart(2, "0")}
                  </span>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    {label && (
                      <Badge
                        variant="outline"
                        className={TIER_STYLES[tier] ?? TIER_STYLES.unknown}
                        title={p.lastTouched ? `Last edited ${p.lastTouched}` : undefined}
                      >
                        {label}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {p.sectionCount} sections · {(p.size / 1024).toFixed(1)}kb
                    </Badge>
                    <CopyButton value={playbookId} label="Copy ID" />
                  </div>
                </div>
                <CardDescription className="font-mono text-[11px]">
                  /playbooks/{p.file}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.meta.length > 0 && (
                  <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                    {p.meta.slice(0, 6).map((m, j) => (
                      <li key={j}>{m}</li>
                    ))}
                  </ul>
                )}
                {(p.numberedSections ?? []).length > 0 && (
                  <details className="rounded-lg border border-border p-3">
                    <summary className="cursor-pointer text-xs font-medium">
                      Section preview ({(p.numberedSections ?? []).length})
                    </summary>
                    <ol className="mt-2 space-y-1 text-[11px] text-muted-foreground list-decimal pl-5">
                      {(p.numberedSections ?? []).slice(0, 12).map((s, k) => (
                        <li key={k}>
                          <span className="text-foreground">{s.heading}</span>
                          {s.body && (
                            <span className="block text-muted-foreground line-clamp-2 mt-0.5">
                              {s.body.replace(/\n+/g, " ").slice(0, 220)}…
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}