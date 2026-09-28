import { LoyaltyLaunchPlanButton } from "@/components/loyalty-launch-plan-button";
import { LoyaltyROICalculator } from "@/components/loyalty-roi-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Loyalty Program launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Loyalty Program (Smile.io / Yotpo Loyalty / LoyaltyLion) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function LoyaltyLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #8 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Loyalty Program launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the loyalty-program calculator below.
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — app install + points/tiers/referral config + Klaviyo
          + Triple Whale webhook wiring, 6-touch launch sequence build (3
          emails + 3 SMS), on-site widget + post-purchase + account-page
          embed, soft-launch to 10% then ramp to 50%/100%, D-7 / D-14 / D-21
          enrollment-rate readouts, and a final 30-day program readout with
          the iteration backlog + Q2 priorities. Tweak the calculator inputs
          (existing customers / AOV / baseline repeat-rate / expected lift /
          enrollment rate / AOV uplift / program cost / overhead / attribution
          toggle) and the snapshot block in the generated plan updates to
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
            State-aware (reads Your-store + Loyalty inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as playbook 07-loyalty-program-smile.md
          </Badge>
          <span className="ml-auto">
            <LoyaltyLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #8
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical 5,000 customers / $75
          AOV / 25% baseline 90-day repeat / +7 pts lift / 60% enrollment /
          $249/mo Smile.io Growth / $60/mo overhead defaults.
        </p>
        <LoyaltyROICalculator />
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
              <strong className="text-foreground">W1</strong> — App install,
              points + 3-tier VIP config, Klaviyo webhook wiring, Triple
              Whale cohort overlay, baseline + success-metric lock
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — 6-touch launch
              sequence (3 emails + 3 SMS), on-site widget, post-purchase
              CTA, account-page embed, win-back flow for non-enrolled
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10%, ramp to 50% then 100%, D-7 / D-14 enrollment-rate
              readouts, support-team briefing
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — D-21 / D-25
              readouts, payback-month readout, iteration backlog
              (mechanic tuning + bonus calibration + tier expansion), Q2
              priorities, 30-day program readout deck
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Why this complements the playbook
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              Playbook 07 already ships the canonical 5-pillar framework + 3
              GMV-tier paths (Smile / Yotpo / LoyaltyLion) + the 6-touch
              launch sequence template + the 5-band health check. The launch
              plan turns the playbook&apos;s &quot;Step-by-step&quot; into a
              calendar-paced 30-day program the operator pastes into Linear
              / Notion / Google Cal and ticks off.
            </p>
            <p>
              The 90-day repeat-rate lift (+5 to +9 pts over baseline) is
              only achievable if the operator wires the Klaviyo + Postscript
              + Triple Whale + Smile stack in the right order. The plan
              enforces that ordering so the +5 pts lift isn&apos;t
              accidentally misattributed to the welcome series.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Cross-page intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Reads:</strong>{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:playbooks:loyalty-roi:v1
              </code>{" "}
              (Loyalty calculator inputs) +{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:your-store:v1
              </code>{" "}
              (AOV / monthly orders / gross margin).
            </p>
            <p>
              <strong className="text-foreground">Writes:</strong> none — the
              plan is derived state. The markdown clipboard / .md file is
              the durable artifact.
            </p>
            <p>
              <strong className="text-foreground">CTA also on:</strong>{" "}
              <a
                href="/playbooks/07-loyalty-program-smile"
                className="underline hover:text-foreground"
              >
                /playbooks/07-loyalty-program-smile
              </a>{" "}
              — open the playbook and click &quot;📅 30-day launch
              plan&quot; next to the calculator.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
