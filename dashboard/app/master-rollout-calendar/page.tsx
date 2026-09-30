import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { MasterRolloutCalendarButton } from "@/components/master-rollout-calendar-button";
import { content } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "Master Rollout Calendar — Ecommerce Ops",
  description:
    "Cross-page-intelligence 90-day rollout planner. Sequences all 9 per-move launch-plan generators (SMS-WC, Welcome, AC, Post-Purchase, PDP A/B, Checkout Audit, Loyalty, Subscription, Attribution-Alert, 3PL) in canonical foundation → revenue → CRO → retention build order. Detects Klaviyo / SMS / staff-constraint collisions, sums Year-1 ROI, exports .md + .ics for calendar import.",
};

/**
 * `/master-rollout-calendar` — One-click 90-day multi-move rollout
 * planner that reads the operator's saved calculator inputs across ALL
 * 9 per-move launch-plan generators (via `ecom-ops:playbooks:*:v1`
 * localStorage keys) and emits:
 *
 *   - 90-day gantt-style markdown checklist (paste into Linear / Notion /
 *     Slack)
 *   - RFC 5545 .ics (import into Google Calendar / Apple Calendar /
 *     Outlook — one all-day event per move, colored bands)
 *   - Collision detection (Klaviyo / Klaviyo-SMS / staff-constraint)
 *   - Combined Year-1 ROI rollup
 *
 * Companion to:
 *   - `/playbooks` (25 playbooks + per-move ROI calculators)
 *   - `/pdp-ab-launch-plan`, `/welcome-series-launch-plan`,
 *     `/abandoned-cart-launch-plan`, `/loyalty-launch-plan`,
 *     `/post-purchase-upsell-launch-plan`,
 *     `/sms-welcome-cart-launch-plan`,
 *     `/attribution-health-alert-launch-plan`,
 *     `/subscription-launch-plan`, `/3pl-launch-plan`,
 *     `/checkout-audit-launch-plan`
 *   - `/30-day-plan` (synthesis doc — all 16 moves in one plan)
 *
 * State-persistence: reads `ecom-ops:your-store:v1` (AOV / monthly
 * orders / margin) + `ecom-ops:playbooks:<move>:v1` for each move.
 * Cross-page-intelligence: same keys as the per-move calculators, so
 * editing a calculator on `/playbooks` immediately reflects on this
 * calendar (via `storage` event).
 */
export default function MasterRolloutCalendarPage() {
  const moveCount = content.counts?.playbooks ?? 25;
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Cross-page intelligence · {moveCount} playbooks
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Master Rollout Calendar
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Click{" "}
          <strong className="font-semibold text-foreground">
            Generate 90-day Master Rollout Calendar
          </strong>{" "}
          to sequence every saved per-move calculator into one
          foundation → revenue → CRO → retention build order. The
          calendar reads the operator's saved inputs across all 9
          launch-plan generators, sums Year-1 ROI, detects Klaviyo /
          SMS / staff-constraint collisions, and emits a paste-ready
          markdown checklist + RFC 5545 .ics for Google / Apple /
          Outlook calendar import.
        </p>
        <div className="mt-1">
          <MasterRolloutCalendarButton />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Build order
            </CardDescription>
            <CardTitle className="text-base">4 phases</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <ol className="ml-4 list-decimal space-y-1">
              <li>
                <strong className="text-foreground">Foundation</strong> —
                SMS-WC + Welcome Series
              </li>
              <li>
                <strong className="text-foreground">Revenue capture</strong> —
                Abandoned Cart + Post-Purchase Upsell
              </li>
              <li>
                <strong className="text-foreground">CRO</strong> — PDP A/B
                + Checkout Audit
              </li>
              <li>
                <strong className="text-foreground">
                  Retention + ops
                </strong>{" "}
                — Loyalty + Subscription + Attribution-Alert + 3PL
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Collision detection
            </CardDescription>
            <CardTitle className="text-base">3 rules</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong className="text-foreground">
                  Klaviyo-SMS collision
                </strong>{" "}
                — same week, ≥1 SMS build + ≥1 email build
              </li>
              <li>
                <strong className="text-foreground">
                  Klaviyo-email collision
                </strong>{" "}
                — same week, ≥2 email-flow builds
              </li>
              <li>
                <strong className="text-foreground">
                  Staff-constraint collision
                </strong>{" "}
                — same week, ≥3 builds (block severity)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Exports
            </CardDescription>
            <CardTitle className="text-base">2 formats</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Markdown</strong> —
                paste into Linear / Notion / Slack
              </li>
              <li>
                <strong className="text-foreground">
                  .ics (RFC 5545)
                </strong>{" "}
                — import into Google Calendar / Apple Calendar /
                Outlook (one all-day event per move)
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          How to use
        </h2>
        <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
          <li>
            Visit the per-move calculator on{" "}
            <Link href="/playbooks" className="text-foreground underline">
              /playbooks
            </Link>{" "}
            (Abandoned Cart, Welcome Series, Loyalty, PDP A/B, etc.) and
            click the <strong className="text-foreground">Save inputs</strong>{" "}
            button. The calculator persists its inputs to localStorage
            (<code className="rounded bg-muted px-1 py-0.5 text-xs">
              ecom-ops:playbooks:&lt;move&gt;:v1
            </code>
            ).
          </li>
          <li>
            Optionally set your AOV / monthly orders / gross margin on
            the{" "}
            <Link href="/" className="text-foreground underline">
              Overview
            </Link>{" "}
            page (<code className="rounded bg-muted px-1 py-0.5 text-xs">
              ecom-ops:your-store:v1
            </code>
            ).
          </li>
          <li>
            Re-open this page and click{" "}
            <strong className="text-foreground">
              Generate 90-day Master Rollout Calendar
            </strong>
            . The calendar reads every saved calculator, sums the
            combined Year-1 ROI, flags collisions, and emits a 90-day
            gantt-style markdown + .ics.
          </li>
          <li>
            Paste the markdown into{" "}
            <strong className="text-foreground">Linear / Notion / Slack</strong>{" "}
            or import the .ics into{" "}
            <strong className="text-foreground">
              Google Calendar / Apple Calendar / Outlook
            </strong>
            . One all-day event per move with the move's title as the
            event summary.
          </li>
        </ol>
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Why this matters
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          The dashboard ships <strong>{moveCount} playbooks</strong>{" "}
          and{" "}
          <strong>9 per-move launch-plan generators</strong> (one per
          move). Each generator takes the operator's per-move
          calculator inputs and emits a 30-day markdown checklist.
          That's the right granularity per-move but it leaves the
          operator with 60–120 days of un-sequenced work: what do they
          ship first? Which moves collide on Klaviyo? What's the
          combined Year-1 ROI?
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          This page is the cross-move view: it walks the catalog in
          canonical build order (foundation first, retention last),
          detects same-week build collisions on Klaviyo / Postscript /
          SMS / ops, sums the per-move Year-1 net margin + cost into a
          combined ROI, and emits a single calendar-ready file the
          operator imports into their work calendar. Move-level
          detail stays on each per-move launch-plan page; this is the
          operational sequencing layer.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline">Cross-page intelligence</Badge>
          <Badge variant="outline">State-persistence</Badge>
          <Badge variant="outline">One-click action</Badge>
          <Badge variant="outline">Calendar export (.ics)</Badge>
        </div>
      </section>
    </div>
  );
}