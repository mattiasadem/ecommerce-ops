import { SubscriptionLaunchPlanButton } from "@/components/subscription-launch-plan-button";
import { SubscriptionPathCalculator } from "@/components/subscription-path-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Subscription Program launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Move #11 Subscription Program launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function SubscriptionLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #11 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Subscription Program launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the Subscription-path calculator below.
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — Path A/B/C picker + Recharge/Skio/Bold/Stay AI/
          Appstle/Seal/Loop install + Subscribe-and-Save widget + Triple Whale
          subscriber-cohort LTV wiring + Klaviyo welcome/SMS + dunning +
          customer-portal + smart-cancellation + 3PL subscription-team + soft-launch
          to 10% then 50% then 100% ramp + per-platform subscriber-conversion
          readouts + D-7/D-14/D-21 subscriber-LTV-multiplier readout +
          replenishment-cadence audit + winback + 30-day program readout deck.
          Tweak the calculator inputs (US GMV + AOV + monthly orders +
          consumables revenue share + subscriber conversion baseline +
          monthly churn + category + platform preference + operator capacity)
          and the snapshot block in the generated plan updates to match. If
          you saved AOV / monthly orders / margin on Overview, the Your-store
          row flows through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + Subscription inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as the Subscription-path calculator
          </Badge>
          <span className="ml-auto">
            <SubscriptionLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #11
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical Path B defaults
          ($3M US GMV, $45 AOV, 6,667 orders/mo, 70% consumables, 20%
          subscriber conversion, 6% monthly churn, Recharge Plus, 8 hr/wk
          operator capacity).
        </p>
        <SubscriptionPathCalculator />
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
              <strong className="text-foreground">W1</strong> — Path picker
              audit + Recharge/Skio/Bold/Stay AI/Appstle/Seal/Loop install +
              Subscribe-and-Save widget on PDP/cart/collection +
              Triple Whale subscriber-cohort-LTV wiring + Smile.io
              2x-points-on-subscription-orders
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — Discount-tier
              matrix [5%/10%/15%/20%/25% off for 30/45/60/90/120-day cadence] +
              Klaviyo subscription-welcome flow + 3-attempt dunning +
              customer-portal cancel-anytime + skip + change-frequency +
              smart-cancellation 4-alternative + replenishment-reminder flow +
              winback flow + 3PL subscription-team FIFO + lot/date tracking
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10% → 50% → 100% ramp + per-platform subscriber-conversion
              readouts + smart-cancellation recovery-rate audit + dunning
              recovery-rate audit + Smile.io 2x-points incentive
            </p>
            <p>
              <strong className="text-foreground">W4</strong> —
              Subscriber-cohort-LTV-multiplier readout (canonical 2.0-3.5x
              target) + replenishment-cadence audit + winback recovery-rate
              + Path B→C decision + quarterly-review cadence + 30-day
              program readout deck + Move #11 roadmap update
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
                recommendSubscriptionPath()
              </code>{" "}
              — same function the calculator on{" "}
              <code>/subscriptions</code> runs in your browser. Path verdict
              (A / B / C), canonical Year-1 ROI band, Year-1 cost stack,
              Year-1 incremental subscription revenue, Year-1 subscriber
              count, LTV multiplier, smart-cancellation recovery, dunning
              recovery, winback recovery, and subscription-share of US GMV
              are byte-identical to the canonical Move #11 Path A/B/C
              scoring engine.
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