import { PdpAbLaunchPlanButton } from "@/components/pdp-ab-launch-plan-button";
import { PdpAbTestCalculator } from "@/components/pdp-ab-test-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "PDP A/B launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on PDP A/B testing launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function PdpAbLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #9.5 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">PDP A/B launch plan</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the calculator below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work. Tweak the calculator inputs (sessions / CVR / lift /
          cadence) and the snapshot block in the generated plan updates to
          match. If you saved AOV / monthly orders / margin on Overview, the
          Your-store row flows through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + PDP inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/pdp_ab_test.py
          </Badge>
          <span className="ml-auto">
            <PdpAbLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #9.5
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan's snapshot. The
          calculator's saved state is what the plan reads; if you reload this
          page on a different device (no localStorage), the plan still works
          — it just falls back to the canonical 10k/10k/20% winner defaults.
        </p>
        <PdpAbTestCalculator />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">What's in the 30-day plan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">W1 — Tools, backlog, baseline:</strong>{" "}
              pick the A/B tool, wire analytics, pull baseline metrics, rank 8
              hypotheses, write the brief, set the cadence, publish the plan.
            </p>
            <p>
              <strong className="text-foreground">W2 — Build, QA, launch:</strong>{" "}
              build variant #1, QA across breakpoints, add to the registry,
              configure monitoring + early-stop, vote go/no-go, launch Day 14.
            </p>
            <p>
              <strong className="text-foreground">W3 — Monitor:</strong>{" "}
              traffic split + guardrail hygiene, peer review of the analysis
              plan, optional interim read only when sample size is reached.
            </p>
            <p>
              <strong className="text-foreground">W4 — Readout + scale:</strong>{" "}
              final readout Day 22, ship or revert, credit realized lift,
              launch Test #2 Day 26, run the 30-day program readout Day 30.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Where the math comes from</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              The snapshot block (AOV, margin, sessions, tests / month,
              annualized ratio, verdict) comes from{" "}
              <code className="font-mono text-[11px]">forecastPdpAbTest()</code>{" "}
              in{" "}
              <code className="font-mono text-[11px]">src/lib/pdp-ab-test.ts</code>{" "}
              — same math as{" "}
              <code className="font-mono text-[11px]">scripts/pdp_ab_test.py</code>.
            </p>
            <p>
              Your-store flows through automatically: AOV + margin from{" "}
              <code className="font-mono text-[11px]">
                ecom-ops:your-store:v1
              </code>{" "}
              via{" "}
              <code className="font-mono text-[11px]">
                mergeFromYourStore()
              </code>
              .
            </p>
            <p>
              The day-by-day actions are the canonical Move #9.5 build
              sequence — same checklist the playbook markdown describes, just
              pre-baked into a paste-ready list.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Where to paste the result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Linear:</strong> paste into a
              new project; each - [ ] line becomes a sub-task on the project's
              roadmap.
            </p>
            <p>
              <strong className="text-foreground">Notion:</strong> paste as a
              toggle-list sub-page under the playbook doc.
            </p>
            <p>
              <strong className="text-foreground">Google Cal:</strong> download
              the .md, then convert checkboxes to dated tasks via Calendar
              Tasks or Zapier.
            </p>
            <p>
              <strong className="text-foreground">Slack / Discord:</strong> the
              snippet is small enough to paste as a thread message in #cro
              with @here.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
