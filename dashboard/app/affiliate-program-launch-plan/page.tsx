import { AffiliateLaunchPlanButton } from "@/components/affiliate-launch-plan-button";
import { AffiliatePathCalculator } from "@/components/affiliate-path-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-static";

export const metadata = {
  title: "Affiliate Program launch plan — Ecommerce Ops",
  description:
    "Generate a 30-day always-on Affiliate / Creator / Influencer program launch plan from your saved path-calculator inputs + Your-store AOV/orders/margin. Day-by-day checklist in 4 weeks, paste-ready markdown.",
};

export default function AffiliateProgramLaunchPlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #16 · One-click action
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Affiliate Program launch plan
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Open this page after running the affiliate Path A / B / C
          calculator below. Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 30-day launch plan
          </strong>{" "}
          to emit a day-by-day, paste-ready markdown checklist grouped into 4
          weeks of work — platform pick (Refersion / Levanta / Impact /
          GoAffPro / PartnerStack / Aspire), commission tier + cookie
          attribution, affiliate contract + FTC-disclosure + payment rail,
          recruitment candidate list, application page, KPI dashboard wiring
          (Triple Whale cohort + Klaviyo flow + Smile tier), soft-launch to
          10% / 50% / 100%, Day-1 / 7 / 14 readouts (traffic, first-sale
          rate, EPC, AOV-uplift, FTC-compliance), Day-21 / 25 / 30 readouts
          (per-affiliate LTV, AOV-band breakdown, repeat-buyer cohort, ROI
          ratio, year-1 forecast), Tier-3 promotion of top 3 affiliates,
          bottom-10% cut, quarterly-compliance-audit, headline-tier
          iteration, and final 30-day program readout with Q1 backlog. Tweak
          the path-calculator inputs (US GMV / AOV / expected affiliates /
          commission tier / voice profile / has-Triple-Whale / has-Klaviyo /
          has-Smile / has-Levanta / has-Impact / IQ zone / operator hours)
          and the snapshot block in the generated plan updates to match. If
          you saved AOV / monthly orders / margin on Overview, the
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
            State-aware (reads Your-store + Path-calculator inputs)
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Same math as scripts/affiliate_unit_economics.py
          </Badge>
          <span className="ml-auto">
            <AffiliateLaunchPlanButton />
          </span>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Interactive path calculator · Move #16
        </h2>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Edit the inputs below to shape the launch plan&apos;s snapshot. The
          calculator&apos;s saved state is what the plan reads; if you reload
          this page on a different device (no localStorage), the plan still
          works — it just falls back to the canonical $2M US DTC Path B
          defaults ($2M GMV, $50 AOV, 25 expected affiliates, Sustainable
          voice, Triple Whale + Klaviyo + Smile all wired, no Levanta, no
          Impact, mid IQ zone, 6 hr/wk operator).
        </p>
        <AffiliatePathCalculator />
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
              <strong className="text-foreground">W1</strong> — Platform pick,
              trailing-30-day baseline, commission tier + cookie window,
              tiered-commission structure, cookie-attribution model, affiliate
              contract + FTC-disclosure, payment rail
            </p>
            <p>
              <strong className="text-foreground">W2</strong> — 50–200
              candidate list, application page, first 50 personalized DMs,
              Triple Whale cohort + Klaviyo flow + Smile tier, per-affiliate
              KPI dashboard, resource hub
            </p>
            <p>
              <strong className="text-foreground">W3</strong> — Soft-launch
              to 10%, Day-1 readout (traffic + first-sale + EPC), ramp to
              50%, Day-7 readout (per-affiliate + per-tier Pareto), Day-14
              readout (AOV-uplift + FTC-compliance), ramp to 100% + 100 DMs
            </p>
            <p>
              <strong className="text-foreground">W4</strong> — Day-21
              readout (per-affiliate LTV + repeat-buyer), Day-25 readout
              (AOV-band + voice-profile), Day-30 readout (ROI ratio +
              year-1 forecast), Tier-3 promotion of top 3, bottom-10% cut,
              quarterly-compliance-audit, headline-tier iteration, final
              30-day program readout, Q1 kickoff
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
                recommendPath()
              </code>{" "}
              — same function the calculator on{" "}
              <code>/affiliates</code> runs in your browser. Path A floor is
              $100K GMV, Path B floor is $500K, Path C floor is $5M. The
              year-1 attributed-revenue share is 5–10% (Path A), 3–6%
              (Path B), 1–3% (Path C); the LTV multiplier is 1.2–1.5× (A),
              1.5–2.0× (B), 2.0–3.0× (C); the cookie-deprecation recovery is
              20–40% (A), 50–70% (B), 70–90% (C); the
              sustainable-mission-alignment score is 0–40 (A), 50–80 (B),
              80–100 (C). All thresholds match{" "}
              <code>scripts/affiliate_unit_economics.py</code> and the
              Refersion + Levanta + Impact published case-study benchmarks.
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
