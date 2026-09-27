import { WelcomeSeriesLaunchPlanButton } from "@/components/welcome-series-launch-plan-button";
import { WelcomeSeriesROICalculator } from "@/components/welcome-series-roi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Welcome Series launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Welcome Series (Klaviyo + Postscript) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function WelcomeSeriesLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #3.4 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome Series launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the welcome-series calculator below.
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — opt-in source audit, 5-email build, SMS opt-in +
          first-touch, soft-launch to 10%, ramp to 100%, then 14-day CVR
          readout, iteration backlog, and a 30-day program readout. Tweak the
          calculator inputs (opt-ins / CVR / AOV / margin / discount / send
          cost) and the snapshot block in the generated plan updates to match.
          If you saved AOV / monthly orders / margin on Overview, the
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
            State-aware (reads Your-store + Welcome inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/welcome_series_roi.py
          </Badge>
          <span className="ml-auto">
            <WelcomeSeriesLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #3.4
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan's snapshot. The
          calculator's saved state is what the plan reads; if you reload this
          page on a different device (no localStorage), the plan still works
          — it just falls back to the canonical 1k-optin / 3% CVR / $75 AOV /
          70% margin defaults.
        </p>
        <WelcomeSeriesROICalculator />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">What&apos;s in the 30-day plan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">W1 — Audit + scaffold:</strong>{" "}
              pull opt-in source volume, pick the welcome-discount band,
              stand up Klaviyo + Postscript flow skeletons, import historical
              cohort, lock the success metric, publish the plan to #lifecycle.
            </p>
            <p>
              <strong className="text-foreground">W2 — Build + instrument:</strong>{" "}
              5 emails (welcome → social-proof → education → founder →
              last-chance), SMS opt-in wiring, Triple Whale mapping, placed-
              order zero-ping after conversion.
            </p>
            <p>
              <strong className="text-foreground">W3 — Soft-launch + ramp:</strong>{" "}
              10% soft-launch cohort, day-1 delivery + open-rate sanity check,
              day-3 soft-launch CVR readout, ramp to 100% if above breakeven,
              cascade telemetry.
            </p>
            <p>
              <strong className="text-foreground">W4 — Readout + iteration:</strong>{" "}
              14-day CVR readout, per-email engagement deep-dive, unsub cohort
              analysis, SMS attribution readout, paid-acquisition segment
              split, queue next-month A/B (subject + cadence), 30-day program
              readout.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Where the math comes from</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              The snapshot block (opt-ins, CVR, AOV, margin, discount, send
              cost, net revenue, ROI ratio, breakeven CVR) comes from{" "}
              <code className="font-mono text-[11px]">
                forecastWelcomeSeries()
              </code>{" "}
              in{" "}
              <code className="font-mono text-[11px]">
                src/lib/welcome-series-roi.ts
              </code>{" "}
              — same math as{" "}
              <code className="font-mono text-[11px]">
                scripts/welcome_series_roi.py
              </code>
              .
            </p>
            <p>
              Your-store flows through automatically: AOV + margin from{" "}
              <code className="font-mono text-[11px]">
                ecom-ops:your-store:v1
              </code>{" "}
              when present.
            </p>
            <p>
              The day-by-day actions are the canonical Move #3.4 build
              sequence — same 30-day checklist the playbook markdown
              describes, just pre-baked into a paste-ready list.
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
              new project; each - [ ] line becomes a sub-task on the
              lifecycle roadmap.
            </p>
            <p>
              <strong className="text-foreground">Notion:</strong> paste as a
              toggle-list sub-page under the Welcome Series playbook doc.
            </p>
            <p>
              <strong className="text-foreground">Google Cal:</strong> download
              the .md, then convert checkboxes to dated tasks via Calendar
              Tasks or Zapier.
            </p>
            <p>
              <strong className="text-foreground">Slack / Discord:</strong> the
              snippet is small enough to paste as a thread message in
              #lifecycle with @here.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
