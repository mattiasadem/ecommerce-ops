import { AbandonedCartLaunchPlanButton } from "@/components/abandoned-cart-launch-plan-button";
import { AbandonedCartROICalculator } from "@/components/abandoned-cart-roi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Abandoned-Cart launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Abandoned-Cart (Klaviyo + Postscript) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function AbandonedCartLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #1 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Abandoned-Cart launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the abandoned-cart calculator below.
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — trigger wiring, Klaviyo + Postscript scaffolds,
          suppression config, 3-email + 2-SMS build, soft-launch to 10% then
          ramp to 100%, baseline readouts at D-1 / D-7 / D-14 / D-21, and a
          final 30-day program readout with the iteration backlog. Tweak the
          calculator inputs (checkouts / AOV / recovery / email + SMS
          unit-cost) and the snapshot block in the generated plan updates
          to match. If you saved AOV / monthly orders / margin on Overview,
          the Your-store row flows through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + Abandoned-Cart inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/abandoned_cart_roi.py
          </Badge>
          <span className="ml-auto">
            <AbandonedCartLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #1
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical 1,200 checkouts/mo /
          $75 AOV / 10% recovery / 3-email + 2-SMS defaults.
        </p>
        <AbandonedCartROICalculator />
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
              <strong className="text-foreground">W1</strong> — Trigger
              wiring, audience import, Klaviyo + Postscript flow scaffolds
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — 3-email +
              2-SMS build, suppression lists, Triple Whale + Segment
              attribution wiring
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10%, ramp to 50% then 100%, D-1 / D-7 / D-14 baseline
              readouts
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — D-21 + D-25
              readouts, iteration backlog (cadence + subject-line + weakest
              step), final 30-day program readout
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
                forecastAbandonedCart()
              </code>{" "}
              — same function the calculator on <code>/playbooks</code> runs
              in your browser. Health-band thresholds (great / good /
              marginal / weak) match <code>scripts/abandoned_cart_roi.py</code>{" "}
              and the Omnisend top-of-class benchmark (30:1).
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
