import { LaunchPlanProgressTracker } from "@/components/launch-plan-progress-tracker";
import { ShipNotesSearch } from "@/components/ship-notes-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Launch-plan progress — Ecommerce Ops",
  description:
    "Cross-page-intelligence rollup of every per-move launch-plan generator. Track days shipped across all 10 plans (PDP A/B, Welcome Series, Abandoned Cart, Loyalty, Post-Purchase Upsell, SMS-WC, Attribution-Alert, Subscription, 3PL, Checkout Audit). One-click copy-to-standup markdown export.",
};

/**
 * `/launch-plan-progress` — Operator-facing progress rollup for the
 * 10 launch-plan generators.
 *
 * Closes the post-generation visibility gap: operators generate a
 * 30-day markdown checklist, paste it into Linear / Notion / Slack,
 * and then lose visibility into how many days they've actually
 * shipped. This page reads the same `ecom-ops:launch-plan-progress:v1`
 * localStorage key the tracker writes, surfaces a per-plan progress
 * bar with W1/W2/W3/W4 breakdown, an aggregate rollup (total days
 * shipped, % complete, realised Year-1 net margin, band counts), and
 * emits a paste-ready markdown standup block.
 *
 * Companion to:
 *   - `/master-rollout-calendar` (synthesis — build order + collisions)
 *   - `/pdp-ab-launch-plan`, `/welcome-series-launch-plan`,
 *     `/abandoned-cart-launch-plan`, `/loyalty-launch-plan`,
 *     `/post-purchase-upsell-launch-plan`,
 *     `/sms-welcome-cart-launch-plan`,
 *     `/attribution-health-alert-launch-plan`,
 *     `/subscription-launch-plan`, `/3pl-launch-plan`,
 *     `/checkout-audit-launch-plan`
 *
 * State-persistence: `ecom-ops:launch-plan-progress:v1` (per-browser).
 * Cross-page-intelligence: same key the launcher pages would write if
 * they had built-in checkboxes (they currently don't — this is the
 * central place to tick).
 */
export default function LaunchPlanProgressPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Cross-page intelligence · 10 launch-plan generators
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Launch-plan progress
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Tick the day cells below as you ship each action. The rollup
          reads all 10 launch-plan generators (PDP A/B, Welcome Series,
          Abandoned Cart, Loyalty, Post-Purchase Upsell, SMS-WC,
          Attribution-Alert, Subscription, 3PL, Baymard Checkout
          Audit), persists the state per-browser, and emits a paste-
          ready markdown standup block. Use the per-plan card&apos;s{" "}
          <strong className="text-foreground">title link</strong> to
          jump back to the launcher page and re-generate the full 30-day
          markdown checklist.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">State-persistence</Badge>
          <Badge variant="outline">Cross-page intelligence</Badge>
          <Badge variant="outline">Interactive tracker</Badge>
          <Badge variant="outline">Markdown export</Badge>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Tracker
        </h2>
        <LaunchPlanProgressTracker />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Search ship notes
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Free-text search across every note attached to a ticked day on
          all 10 launch-plan pages. Use this to find every{" "}
          <code className="rounded bg-muted px-1 text-foreground">
            blocked
          </code>{" "}
          mention, every <code>Klaviyo</code> reference, every note where
          a specific teammate is <code>@-mentioned</code>. Multi-term
          queries are AND-joined; quoted phrases match literally. Reads
          the same two localStorage keys as the tracker above.
        </p>
        <ShipNotesSearch />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground max-w-3xl">
          <li>
            Open any of the 10 launcher pages (e.g.{" "}
            <Link href="/abandoned-cart-launch-plan" className="text-foreground underline">
              /abandoned-cart-launch-plan
            </Link>
            ) and click{" "}
            <strong className="text-foreground">
              Generate 30-day launch plan
            </strong>
            . The plan reads your saved calculator inputs and emits a
            paste-ready markdown checklist.
          </li>
          <li>
            Come back to this page and click each day cell as you ship
            it. The state persists in localStorage (key{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              ecom-ops:launch-plan-progress:v1
            </code>
            ).
          </li>
          <li>
            Use{" "}
            <strong className="text-foreground">Copy markdown rollup</strong>{" "}
            to paste a standup-ready summary into Slack / Linear /
            Notion, or{" "}
            <strong className="text-foreground">Download .md</strong>{" "}
            to attach to your project tracker.
          </li>
          <li>
            The rollup counts shipped days against the per-move
            Year-1 net margin benchmark so the standup shows both
            progress % and realised $ — same scale your CFO tracks.
          </li>
        </ol>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bands</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Complete</strong> —
                all 30 days shipped
              </li>
              <li>
                <strong className="text-foreground">On track</strong> —
                ≥ 60 % shipped
              </li>
              <li>
                <strong className="text-foreground">Started</strong> —
                1 – 59 % shipped
              </li>
              <li>
                <strong className="text-foreground">Untouched</strong> —
                0 days shipped
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cross-page</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              Same plan IDs as{" "}
              <Link href="/master-rollout-calendar" className="text-foreground underline">
                Master Rollout Calendar
              </Link>
              . If you also use that page for build-order sequencing, the
              progress you tick here will eventually surface there too.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reset</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              Each plan card has a{" "}
              <strong className="text-foreground">Reset</strong> button
              that wipes just that plan&apos;s ticked days. To reset
              everything, clear the localStorage key in DevTools.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
