import { PostPurchaseUpsellLaunchPlanButton } from "@/components/post-purchase-upsell-launch-plan-button";
import { PostPurchaseUpsellROICalculator } from "@/components/post-purchase-upsell-roi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Post-Purchase Upsell launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Post-Purchase One-Click Upsell (ReConvert / AfterSell / Bold) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function PostPurchaseUpsellLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #9.6 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Post-Purchase Upsell launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the post-purchase upsell calculator
          below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — tool pick (ReConvert / AfterSell / Bold), offer-SKU
          selection, analytics + Triple Whale attribution wiring, page build +
          creative QA, soft-launch to 10% then ramp to 50% / 100%, Day-1 / 7 /
          14 acceptance-rate + ROI-ratio readouts, per-SKU / per-AOV-band
          readouts at D-21 / D-25, headline A/B iteration backlog, and a final
          30-day program readout with the iteration backlog. Tweak the
          calculator inputs (orders / base AOV / acceptance / upsell AOV /
          margin / platform cost) and the snapshot block in the generated plan
          updates to match. If you saved AOV / monthly orders / margin on
          Overview, the Your-store row flows through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + PPU inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/post_purchase_upsell_roi.py
          </Badge>
          <span className="ml-auto">
            <PostPurchaseUpsellLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #2
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical 1,000 orders/mo / $80
          base AOV / 15% acceptance / $35 upsell AOV / 70% margin / $0.10
          ReConvert defaults (35.7:1 great band).
        </p>
        <PostPurchaseUpsellROICalculator />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              What&apos;s in the 30-day plan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">W1</strong> — Tool pick,
              baseline orders, offer format (single / bundle / subscription),
              offer-SKU shortlist, analytics + Triple Whale instrumentation
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — Upsell-page
              build, dynamic offer-SKU fetch, creative QA across breakpoints,
              attribution events, headline A/B plan
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10%, ramp to 50% then 100%, D-1 / D-7 / D-14 acceptance +
              ROI-ratio readouts
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — D-21 /
              D-25 / D-30 readouts (per-SKU acceptance, AOV-band breakdown,
              repeat-buyer behavior, complaint trend, LTV cohort), headline
              A/B winner promoted, iteration backlog, final 30-day program
              readout
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">How the snapshot is built</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p>
              Snapshot uses{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                forecastPostPurchaseUpsell()
              </code>{" "}
              — same function the calculator on{" "}
              <code>/playbooks</code> runs in your browser. Health-band
              thresholds (great / good / marginal / weak) match{" "}
              <code>scripts/post_purchase_upsell_roi.py</code> and the
              ReConvert published case-study benchmark (35:1).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">What you do with it</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p>
              Click <strong className="text-foreground">Generate</strong> →
              modal opens with copy-to-clipboard and download-as-markdown
              buttons → paste into Linear, Notion, Google Cal, Slack, or
              GitHub Issues. Tick the action items off as the team works
              through W1–W4.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}