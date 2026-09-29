import { SmsWelcomeCartLaunchPlanButton } from "@/components/sms-welcome-cart-launch-plan-button";
import { SmsWelcomeCartROICalculator } from "@/components/sms-welcome-cart-roi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "SMS Welcome + Cart-Abandon launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on SMS Welcome + Cart-Abandon (Postscript) launch plan from your saved calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function SmsWelcomeCartLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #6 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          SMS Welcome + Cart-Abandon launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after tweaking the SMS Welcome + Cart-Abandon
          calculator below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — Postscript + 10DLC account stand-up, SMS-keyword +
          explicit-opt-in flow, 4-SMS build (Welcome + Cart-Soft +
          Cart-Escalation + Review), suppression + frequency-cap config,
          soft-launch to 10% then ramp to 50% then 100%, baseline readouts at
          D-7 / D-14 / D-21, and a final 30-day program readout with the
          iteration backlog. Tweak the calculator inputs (SMS opt-ins /
          cart-starts / orders / AOV / discount / SMS cost) and the snapshot
          block in the generated plan updates to match. If you saved AOV /
          monthly orders / margin on Overview, the Your-store row flows
          through automatically.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Your-store + SMS-WC inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as the SMS-WC calculator
          </Badge>
          <span className="ml-auto">
            <SmsWelcomeCartLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive calculator · Move #6
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical $1M-GMV DTC defaults
          (1,000 SMS opt-ins/mo, 2,500 carts/mo, $75 AOV, 70% gross margin,
          10% welcome+escalation discount, 5% + 3% cart recovery rates, 20%
          welcome-lift + 20% review CVR, $0.014/SMS).
        </p>
        <SmsWelcomeCartROICalculator />
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
              <strong className="text-foreground">W1</strong> — Opt-in
              sources audit, Postscript + 10DLC stand-up, SMS-keyword +
              explicit-opt-in flow, Klaviyo SMS-consent property
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — 4-SMS build
              (Welcome + Cart-Soft + Cart-Escalation + Review),
              double-conversion suppression, Triple Whale + Polar attribution
              wiring
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              SMS-1 to 10%, ramp to 50% then 100%, soft-launch SMS-2/SMS-3
              to 10%, D-7 + D-14 baseline readouts
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — D-21 / D-25
              / D-28 readouts (full SMS-attributed order + revenue, cart
              recovery %, unsubscribe + spam rates, discount-band decision),
              30-day program readout, 60-day iteration roadmap
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
                forecastSmsWelcomeCart()
              </code>{" "}
              — same function the calculator on{" "}
              <code>/playbooks/06-sms-welcome-and-cart-abandon</code> runs in
              your browser. Health-band thresholds (great ≥30:1 / good
              10-30:1 / marginal 3-10:1 / weak &lt;3:1 / negative) match the
              canonical benchmarks in playbook 06.
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