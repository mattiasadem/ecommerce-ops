import { CheckoutAuditLaunchPlanButton } from "@/components/checkout-audit-launch-plan-button";
import { CheckoutAuditWithExport } from "@/components/checkout-audit-with-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Checkout Audit 30-day launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Baymard Checkout Audit implementation plan from your saved 24-guideline audit inputs. Day-by-day checklist in 4 weeks, paste-ready markdown. Same math as scripts/checkout_audit_score.py.",
};

export default function CheckoutAuditLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #3 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout Audit 30-day launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after walking the Baymard 24-guideline audit below.
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — Severity L baseline + 5 highest-lift fixes (guest
          checkout, Shop Pay + Apple Pay + Google Pay, address autocomplete,
          single-page or accordion layout, sticky place-order, real shipping
          cost), Severity M fixes (BNPL, payment icons, trust badges, no
          redirect, touch-targets, inline validation, minimum fields), Severity
          S polish (no password meter, visible field labels, inline errors,
          secure-checkout lock, returns-policy link, 16px input fonts), and the
          E5 real-device verification gate + 30-day readout deck with the
          Move #4 mobile-PDP cross-link. Tweak the audit inputs (24 Baymard
          guidelines, pass / partial / fail / skip) and the snapshot block in
          the generated plan updates to match.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] border-accent/40 bg-accent/10 text-accent"
          >
            One-click action
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            State-aware (reads Baymard audit inputs from /cro)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/checkout_audit_score.py
          </Badge>
          <span className="ml-auto">
            <CheckoutAuditLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive audit · Move #3
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Walk the 24 Baymard guidelines below — mark each as pass / partial /
          fail / skip. The plan reads your saved state; if you reload this page
          on a different device (no localStorage), the plan still works — it
          just falls back to the canonical missing-audit baseline (0/100 score,
          80% CVR-lift ceiling). The audit&apos;s saved-state key is{" "}
          <code className="rounded bg-muted px-1">
            ecom-ops:cro:checkout-audit:v1
          </code>
          .
        </p>
        <CheckoutAuditWithExport />
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
              <strong className="text-foreground">W1</strong> — Severity L
              baseline + 5 highest-lift fixes: guest checkout, Shop Pay / Apple
              Pay / Google Pay, address autocomplete, single-page checkout,
              sticky place-order, real shipping cost upfront
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — Severity M
              fixes: minimum fields, inline validation, BNPL for AOV &gt; $150,
              payment icons, trust badges, no guest redirect, touch-targets ≥
              44×44, no zoom required (16px fonts)
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Severity S
              polish: no password-strength meter, visible field labels,
              inline errors, secure-checkout lock, returns-policy link,
              cross-browser / cross-device audit
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — E5 real-device
              test, score-after-W3 readout, +CVR-lift proxy computation,
              Move #4 (mobile-PDP) cross-link, 30-day readout deck
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              How the snapshot updates
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>
              The plan&apos;s snapshot block reads your live Baymard score
              (0–100) + health band (top-tier / great / good / fair / weak /
              missing) + expected cumulative CVR-lift band (capped at +80%).
            </p>
            <p>
              Mark Severity L items as pass and the score climbs; mark them
              as fail / missing and the lift band stays at the ceiling. The
              plan enforces W1 = Severity L only, so shipping the W1 plan
              alone is enough to move from weak / fair to good / great.
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
              This is the 10th launch-plan generator on the dashboard — same
              shape as PDP A/B (#9.5), Welcome Series (#3.4), Abandoned-Cart
              (#1), Loyalty (#8), Post-Purchase Upsell (#9.6), SMS-WC (#6),
              Attribution-Alert (#6.10), Subscription (#11), 3PL (#52).
            </p>
            <p>
              After the 30-day plan ships, the natural next tick is Move #4
              (mobile-PDP audit) — the audit-driven CVR-lift proxy is gated
              on the mobile-PDP, since 73% of traffic is mobile.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          How to use the generated plan
        </h2>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            Walk the 24 Baymard guidelines above; mark each as pass / partial /
            fail / skip. The audit auto-saves to localStorage.
          </li>
          <li>
            Click <strong className="text-foreground">
              Generate 30-day launch plan
            </strong>{" "}
            above to open the modal.
          </li>
          <li>
            Pick a plan start date (defaults to today). The 30-day checklist
            computes day-by-day calendar dates relative to the start.
          </li>
          <li>
            Review the snapshot block (current Baymard score, health band,
            cumulative CVR-lift band).
          </li>
          <li>
            Click <strong className="text-foreground">Copy markdown</strong>{" "}
            or <strong className="text-foreground">Download .md</strong>{" "}
            to save the plan.
          </li>
          <li>
            Paste the markdown into Linear / Notion / Google Cal / GitHub
            Issues — the{" "}
            <code className="rounded bg-muted px-1">- [ ]</code> checkboxes
            stay clickable in all of them.
          </li>
          <li>
            Ship W1 first (Severity L baseline + 5 highest-lift fixes). Re-run
            the audit to capture the W1 score lift. Then W2, W3, W4.
          </li>
        </ol>
      </section>
    </div>
  );
}