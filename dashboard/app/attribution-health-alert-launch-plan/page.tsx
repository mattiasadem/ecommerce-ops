import { AttributionHealthAlertLaunchPlanButton } from "@/components/attribution-health-alert-launch-plan-button";
import { AttributionHealthAlertCalculator } from "@/components/attribution-health-alert-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Attribution-Health Alert launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Move #6.10 Attribution-Health Alert webhook launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function AttributionHealthAlertLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #6.10 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Attribution-Health Alert launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the Attribution-Health Alert calculator
          below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — Move #6.8 pre-flight + 13-field alert-payload contract
          sign-off, Slack + Linear + PagerDuty + Opsgenie webhook build, alert
          cooldown + duplicate-suppression, soft-launch to 10% then ramp to 50%
          then 100%, baseline readouts at D-7 / D-14 / D-21, and a final 30-day
          program readout with the attribution-recovery audit + 90-day iteration
          backlog. Tweak the calculator inputs (paid-spend / team-size /
          voice-profile / Move #6.8 cadence / on-call coverage / archive
          storage) and the snapshot block in the generated plan updates to
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
            State-aware (reads Your-store + Attribution-Alert inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as the Attribution-Alert calculator
          </Badge>
          <span className="ml-auto">
            <AttributionHealthAlertLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #6.10
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical Path B defaults
          ($10k/mo paid-spend, small team, default voice, weekly Move #6.8
          cadence, 3600s cooldown, 0.5 GB/yr archive storage).
        </p>
        <AttributionHealthAlertCalculator />
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
              <strong className="text-foreground">W1</strong> — Baseline
              attribution-incident audit + Move #6.8 pre-flight + 13-field
              alert-payload contract sign-off + 5 webhook thresholds + Slack /
              Linear / PagerDuty destination provision
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — Webhook
              dispatcher + Slack Incoming Webhook + Linear API auto-create +
              PagerDuty / Opsgenie escalation policies + cooldown +
              duplicate-suppression + Move #6.8 input contract + end-to-end
              QA
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10% → 50% → 100% ramp + D-7 per-platform alert-type
              breakdown + D-14 channel-noise + ack-latency readout + D-21
              attribution-recovery attribution
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — Final 30-day
              avoided-incidents + recovered-revenue + Year-1 net ROI +
              cost-stack reconciliation + Slack/Linear/PagerDuty storage
              reconciliation + threshold retrospective + voice-profile
              downgrade check + 30-day program readout deck + cross-roadmap
              update
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
                forecastAttributionAlert()
              </code>{" "}
              — same function the calculator on{" "}
              <code>/playbooks/06.10-attribution-health-alert-webhook-launch</code>{" "}
              runs in your browser. Path verdict (A / B / C / D / E), Year-1
              cost stack + avoided incidents + recovered-revenue + net ROI,
              alert cadence, cooldown, and health band are byte-identical to
              the canonical Move #6.10 Path A/B/C/D/E scoring engine.
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
              through W1–W4. The plan is derived state — no new localStorage
              key is created.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}