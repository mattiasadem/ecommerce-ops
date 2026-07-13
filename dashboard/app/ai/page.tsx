import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResearchTable } from "@/components/research-table";
import { AiAdCreativeROICalculator } from "@/components/ai-ad-creative-roi";
import { content, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "AI & Automation — Ecommerce Ops" };

export default function AiPage() {
  const research = content.research;
  const aiTable = findTable(research, /current AI value stack/);
  const phase1 = findTable(research, /Phase 1 — Foundation/);
  const phase2 = findTable(research, /Phase 2 — Growth/);
  const phase3 = findTable(research, /Phase 3 — Scale/);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 6 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">AI & Automation</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          AI is no longer experimental — it's a baseline expectation. The
          question is not whether to use AI but where it produces the highest
          ROI per dollar.
        </p>
      </header>

      {/* === INTERACTIVE CALCULATOR (Move #10 AI ad-creative iteration) === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            AI ad-creative iteration — will it pay for itself?
          </CardTitle>
          <CardDescription>
            Enter your monthly ad spend + baseline ROAS → see live revenue
            uplift, payback days, and the per-$1-AI-tool-cost verdict.
            Persisted to your browser; mirrors{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
              scripts/ai_ad_creative_roi.py
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiAdCreativeROICalculator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The AI value stack</CardTitle>
          <CardDescription>
            14 use cases ranked by impact × ease of implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable
            rows={aiTable}
            highlightColumns={["Typical impact", "Cost", "Implementation"]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended stack & budget</CardTitle>
          <CardDescription>
            Target brand: DTC US, consumables/apparel, $1M–$10M GMV, Shopify.
            Total: ~$25K–$100K / yr.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Phase 1 — Foundation (months 1–3) · ~$500–$1,500/mo
            </div>
            <ResearchTable rows={phase1} highlightColumns={["Cost"]} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Phase 2 — Growth (months 3–12) · ~$1,500–$3,500/mo
            </div>
            <ResearchTable rows={phase2} highlightColumns={["Cost"]} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Phase 3 — Scale (months 12+) · ~$3,500–$10,000/mo
            </div>
            <ResearchTable rows={phase3} highlightColumns={["Cost"]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top AI findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">AI support is the highest-ROI, lowest-risk AI deployment</strong> for any brand doing $500K+ GMV. Gorgias / Klaviyo Customer Agent deflect 30–60% of WISMO tickets at $0.10–$0.30/resolved.
            </li>
            <li>
              <strong className="text-foreground">AI ad creative</strong> is now a 3–5× throughput multiplier — top 5–10% of AI variants often beat human creative.
            </li>
            <li>
              <strong className="text-foreground">Product description AI is the unsung hero</strong> — 50-SKU launches go from 2 weeks to 2 days. Shopify Magic is free.
            </li>
            <li>
              <strong className="text-foreground">Dynamic pricing at the PDP</strong> (Rebuy, Nosto) is the next big CRO-AI unlock. 5–15% AOV/CR lift.
            </li>
            <li>
              <strong className="text-foreground">AI demand forecasting</strong> (Inventory Planner, SoStocked) is the highest-impact operational AI — 20–40% reduction in stockouts.
            </li>
            <li>
              <strong className="text-foreground">AI-generated video</strong> for ads is the 2025 sleeper — Synthesia, HeyGen, Runway cut costs 5–10×. $5–$50 instead of $500–$5,000.
            </li>
            <li>
              <strong className="text-foreground">Meta Advantage+ & Google PMax</strong> are AI bidding by default — don't fight them, feed them good creative + signals.
            </li>
            <li>
              <strong className="text-foreground">Don't deploy LLM agents</strong> on customer-facing financial flows (refunds, cancellations, account changes) without human-in-the-loop.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}