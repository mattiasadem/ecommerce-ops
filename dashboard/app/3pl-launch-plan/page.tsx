import { ThreeplLaunchPlanButton } from "@/components/threepl-launch-plan-button";
import { ThreeplPathCalculator } from "@/components/threepl-path-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "3PL Migration launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on 3PL Migration (ShipBob + ShipMonk + Red Stag + SFN + Stord + Flowspace + Extensiv) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function ThreeplLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #14 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          3PL Migration launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the 3PL Path calculator below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — 8-prereq RFQ brief + 3PL shortlist + scoring +
          reference calls, 8-SLA-defense contract clauses + WMS build +
          Triple Whale ship-cost-by-region overlay + 5-touch Klaviyo ship-event
          flows, inventory pull + per-region 3PL inbound + soft-launch 10% →
          50% → 100% ramp + D-7 per-region readout, D-21 readout + annual
          contract re-bid + QBR + 30-day program readout + Path B → C decision.
          Tweak the calculator inputs (orders/mo · AOV · current ship cost ·
          ship time · warehouse lease · SKU count · SKU complexity ·
          international % · operator capacity) and the snapshot block in the
          generated plan updates to match. If you saved AOV / monthly orders /
          margin on Overview, the Your-store row flows through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + 3PL inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as playbook 14-3pl-migration.md
          </Badge>
          <span className="ml-auto">
            <ThreeplLaunchPlanButton />
          </span>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">3PL Path calculator</CardTitle>
          <p className="text-xs text-muted-foreground">
            Browser port of <code>scripts/threepl_unit_economics.py</code>.
            Tweak the inputs below, then click{" "}
            <strong className="font-semibold text-foreground">
              Generate 30-day launch plan
            </strong>{" "}
            to emit the canonical Move #14 4-week day-by-day markdown checklist.
            State persists in <code>localStorage</code>.
          </p>
        </CardHeader>
        <CardContent>
          <ThreeplPathCalculator />
        </CardContent>
      </Card>

      <Separator />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Why a 30-day plan?</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              3PL migration is a 4-phase build (RFQ → contract → WMS →
              inventory cutover) that operators routinely under-budget. The
              canonical Move #14 playbook calls for a 6-week build with 6+1+3
              step-by-step phases — the 30-day checklist on this page is the
              most-common subset for an SMB operator running Path B (500-5,000
              orders/mo).
            </p>
            <p>
              Each day's deliverable is concrete and reviewable in a standup —
              the team pastes the markdown into Linear / Notion / Google Tasks
              and ticks the boxes as work lands.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Path-aware</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong>Path A</strong> (under 500 orders/mo): DEFER; canonical
              3PL break-even floor per research/07 §1.
            </p>
            <p>
              <strong>Path B</strong> (500-5,000 orders/mo): ShipBob +
              ShipMonk + Red Stag. W2 wires single-3PL WMS. W3 ramps
              10% → 50% → 100%.
            </p>
            <p>
              <strong>Path C</strong> (5,000+ orders/mo): ShipBob Pro +
              ShipMonk Pro + SFN + Stord + Flowspace + Extensiv orchestration.
              W2 wires multi-3PL WMS + Extensiv.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cross-page intelligence</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              Reads the same <code>ecom-ops:threepl-path:v1</code> localStorage
              key the <code>/3pl</code> calculator uses. Tweak inputs on{" "}
              <code>/3pl</code>, come back here, click Generate — the snapshot
              updates without retyping.
            </p>
            <p>
              If you saved Your-store AOV / monthly orders / margin on
              Overview, the Your-store overlay flows through the plan so a
              $3M-GMV DTC operator sees their own baseline, not industry
              medians.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}