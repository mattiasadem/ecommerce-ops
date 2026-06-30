import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResearchTable } from "@/components/research-table";
import { content, findDoc, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Subscription Program — Ecommerce Ops" };

export default function SubscriptionsPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r08 = findDoc(research, /08-subscriptions\.md$/);
  const p15 = playbooks.find((p) => p.file === "15-subscription-program-launch.md");
  const a16 = assets.find((a) => a.file === "16-subscription-flow-templates.md");

  // Pull canonical tables out of research/08
  const pillar1 = findTable(research, /Pillar 1.*Platform selection/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/08 (TL;DR, Who this is for, Prerequisites, ...)
  const topSections = r08?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r08?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Subscription-program operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Subscription Program
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a recurring-revenue
          subscription / replenishment program on a US-based Shopify DTC brand
          selling consumables. Three layers:{" "}
          <strong>research/08</strong> (5-pillar framework),{" "}
          <strong>playbook 15</strong> (4-phase Recharge + Skio + Bold + Stay
          AI + Appstle + Seal + Loop multi-platform operator build), and{" "}
          <strong>asset 16</strong> (paste-ready 5-flow × 5-voice ×
          {`{email + SMS}`} = 50 voice-driven override cells for
          subscription-welcome +
          replenishment-reminder + pause-reactivation + cancellation-confirmation
          + winback). This page surfaces all three in one place so you can
          stop tab-switching between{" "}
          <code className="rounded bg-muted px-1">/research</code>,{" "}
          <code className="rounded bg-muted px-1">/playbooks</code>, and{" "}
          <code className="rounded bg-muted px-1">/assets</code>.
        </p>
      </header>

      {/* === HERO METRICS === */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Path B default ROI</CardTitle>
            <CardDescription>
              $500k–$10M GMV, Recharge Plus + consumables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">8.3:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 6:1 conservative / 25:1 aggressive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-1 incremental net</CardTitle>
            <CardDescription>Path B at $5M US GMV base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $270k
              <span className="text-base text-muted-foreground font-normal ml-1">
                net
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              8.3:1 gross · 3.2:1 Year-1 net ($84k cost) · Year-2+ 7.3:1 net
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 15 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (welcome) → 2 (portal + dunning) → 3 (replenishment) → 4
              (cohort LTV)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 16 voice-cells</CardTitle>
            <CardDescription>5 flows × 5 voices × {`{email + SMS}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              50
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              25 emails + 25 SMS · all 5 voices ≥15
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/08) === */}
      {r08 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/08)</CardTitle>
            <CardDescription>
              The headline thesis — why subscriptions are the
              canonical-recurring-revenue layer for a consumables-DTC brand
              with Move #1 + #4 + #7 + #8 loyalty steady-state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {tldr
                .replace(/\n+/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 1200)}
              {tldr.length > 1200 ? "…" : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topSections.slice(0, 11).map((s) => (
                <Badge key={s.heading} variant="outline">
                  {s.heading}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* === LAYER CARDS === */}
      <div className="flex flex-col gap-3">
        <Card id="research-08">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-08
              </span>
              <CardTitle className="text-base">
                research/08-subscriptions
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/08-subscriptions.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 15 maps into a 4-phase
              subscription launch ladder (Phase 1 PDP subscribe-and-save widget
              + welcome flow ~2hr Weeks 1-2 · Phase 2 billing + customer
              portal + dunning-flow ~50hr Weeks 3-6 · Phase 3 replenishment +
              smart cancellation with the canonical 4-alternative flow
              [pause + skip + change-frequency + 25%-discount] recovering
              20-35% of would-be cancellations ~40hr Weeks 7-10 · Phase 4
              subscriber-cohort analytics + Triple Whale attribution-merge
              ~20hr Weeks 11-12) and asset 16 turns into 50 paste-ready
              per-flow voice-variant email + SMS templates. The five pillars
              below are the highest-traffic surfaces — the full doc ships
              Pillar 1 (Platform selection & pricing across the canonical
              7-platform matrix: Recharge + Skio + Bold + Stay AI + Appstle +
              Seal + Loop with $25–$1,200/mo pricing tiers), Pillar 2
              (Subscriber economics & LTV math with the 5-corners
              subscriber-conversion-rate 15-30% + monthly-churn 5-8% +
              LTV-multiplier 2.0-3.5× + CAC-payback 40-60%-faster +
              gross-margin-impact 2-4% subscription-overhead), Pillar 3
              (Replenishment + smart-cancellation flow with the canonical
              4-alternative + dunning recovering 50-70% + winback returning
              10-20%), Pillar 4 (Subscriber-cohort analytics + Triple Whale
              attribution-merge), and Pillar 5 (Inventory + fulfillment with
              FIFO + lot/date tracking + subscription-specialty 3PL).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — canonical 7-platform subscription-platform
                  decision matrix (Recharge + Skio + Bold + Stay AI + Appstle +
                  Seal + Loop)
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($5M US GMV, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-15">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-15
              </span>
              <CardTitle className="text-base">
                playbook 15 — Subscription program launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/15-subscription-program-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p15 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/08 section into a 4-phase subscription
                  launch ladder with paste-ready Recharge (or Skio / Bold /
                  Stay AI / Appstle / Seal / Loop) multi-platform subscription
                  operator build. The 4 phases mirror the canonical
                  subscription-launch sequence (Phase 1: PDP subscribe-and-save
                  widget + welcome flow + first-shipment confirmation, ~14hr
                  Weeks 1-2 · Phase 2: subscription billing + customer portal
                  + dunning-flow + Recharge-2 migration, ~50hr Weeks 3-6 ·
                  Phase 3: replenishment-reminder flow + smart cancellation +
                  cancellation-confirmation flow + 4-alternative recovery
                  ladder, ~40hr Weeks 7-10 · Phase 4: subscriber-cohort
                  analytics + Triple Whale attribution-merge + winback-flow +
                  churn-alert-monitoring, ~20hr Weeks 11-12). Each phase
                  boundary is gated by an explicit verification gate (Gate A
                  through Gate D), and the full build surfaces 4 canonical
                  verification gates with 10/10/10/9 prereqs respectively
                  (consumables-category + 30%+ re-purchase-cadence SKUs +
                  Triple Whale attribution live + Klaviyo welcome-series +
                  Smile.io 2×-points-for-subscriptions + 3PL with FIFO +
                  lot/date tracking OR in-house warehouse).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p15.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/15 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-16">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-16
              </span>
              <CardTitle className="text-base">
                asset 16 — Subscription flow templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 50 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/16-subscription-flow-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a16 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-flow per-voice subscription email + SMS
                  copy an operator ships when launching a Recharge (or Skio /
                  Bold / Stay AI / Appstle / Seal / Loop) subscription program.
                  5 flows (Subscription-welcome + Replenishment-reminder +
                  Pause-reactivation + Cancellation-confirmation + Winback) ×
                  5 voice profiles (Default / Luxury / Sustainable / Gen-Z /
                  B2B) × {`{email + SMS}`} = 50 voice-driven override cells
                  wired to Recharge + Klaviyo + Postscript + Smile.io + Triple
                  Whale. The 5-discount-tier matrix [5% / 10% / 15% / 20% /
                  25% off for 30/45/60/90/120-day cadence per research/08
                  Pillar 1] gates the smart-cancellation 25%-discount
                  alternative + the 60-day winback-flow escalating-discount
                  ladder [15% → 20% → 25% → 30%]. Each voice-driven cell ships
                  Klaviyo conditional-content syntax + Triple Whale
                  <code className="rounded bg-muted px-1 mx-1">
                    ?tw_camp=sub_&lt;flow_id&gt;_v&lt;voice_profile&gt;
                  </code>
                  UTM on every CTA + subject-line ≤50 chars + SMS ≤160 chars
                  pre-validation + 5 suppression rules + 3 frequency caps +
                  12 numbered pitfalls with corrective Fix lines clustered
                  into 6 failure modes.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a16.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a16.voiceCounts).map(([voice, count]) => (
                    <span
                      key={voice}
                      className={
                        count >= 15
                          ? "rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400"
                          : "rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400"
                      }
                    >
                      {voice}: {count}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                asset/16 not found in content.json — regenerate.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === FOOTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Future-tick companions (planned, not yet shipped)
          </CardTitle>
          <CardDescription>
            The two next-priority bounded improvements that ship after this
            route — both pre-staged in research/08 §Next moves, playbook 15
            §Companion tool, and asset 16 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/subscription_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C subscription-program scorer
              that takes a brand's consumables-revenue-share +
              sku-purchase-cadence + LTV baseline + churn-baseline +
              subscriber-conversion-rate → outputs Path A (Recharge Starter
              &lt;$500k GMV) / Path B (Recharge Plus DEFAULT $500k-$10M GMV
              8.3:1 ROI) / Path C (Recharge Enterprise or Skio $10M+ GMV)
              recommendation with cost stack + expected Year-1 incremental
              subscription-revenue + 2.0-3.5× LTV-multiplier + 6-step build
              sequence. Pre-staged in research/08 §Next moves + playbook 15
              §Next moves + asset 16 §Related. Gated on the canonical 8
              prereqs (Move #1 + #4 + #6 + #8 shipped + consumables category
              + 30%+ re-purchase-cadence SKUs + Triple Whale attribution
              live + Klaviyo + Smile.io + 3PL with FIFO + lot/date tracking
              OR in-house warehouse).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/subscription-program-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the v0.11.0
              extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering subscription-launch readiness (Path A/B/C
              tier indicator + consumables-revenue-share band + subscriber
              count band) + per-platform readiness (7 canonical subscription
              platforms × {`{live/draft/staging/not-started}`} status: Recharge +
              Skio + Bold + Stay AI + Appstle + Seal + Loop) + per-path
              Year-1 incremental revenue bar chart (Path A vs B vs C) +
              4-phase gate status (Gate A PDP widget + Gate B billing/portal/
              dunning + Gate C replenishment/smart-cancellation + Gate D
              subscriber-cohort analytics per playbook 15 §Verification gates
              10/10/10/9 prereqs) + per-flow churn-by-tier overlay
              (Tier 1 / 2 / 3 / 4 cadence) + dunning-recovery-rate +
              replenishment-conversion-rate + subscriber-cohort LTV signal as
              a 1-click operator surface. Self-contained static HTML;
              mirrors the canonical 6-section + 4 canonical data structures +
              17-category Node smoke suite pattern from the marketplace /
              3PL / international-expansion / lifecycle-flow static
              dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}