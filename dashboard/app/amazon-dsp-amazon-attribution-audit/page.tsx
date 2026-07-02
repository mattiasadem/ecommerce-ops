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

export const metadata = { title: "Amazon DSP + Amazon Attribution — Ecommerce Ops" };

export default function AmazonDspAmazonAttributionAuditPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r14 = findDoc(
    research,
    /14-amazon-dsp-amazon-attribution-audit\.md$/,
  );
  const p21 = playbooks.find(
    (p) => p.file === "21-amazon-dsp-amazon-attribution-audit-launch.md",
  );
  const a22 = assets.find(
    (a) => a.file === "22-amazon-dsp-amazon-attribution-audit-templates.md",
  );

  // Pull canonical tables out of research/14
  const pillar1 = findTable(
    research,
    /Pillar 1.*Amazon-Ads-Console-onboard/i,
  );
  const pillar2 = findTable(
    research,
    /Pillar 2.*Amazon-DSP-in-market-shoppers/i,
  );
  const pillar3 = findTable(
    research,
    /Pillar 3.*Amazon-Marketing-Cloud-cohort-overlay/i,
  );
  const pillar4 = findTable(
    research,
    /Pillar 4.*Amazon-Attribution-post-purchase-email-merge/i,
  );
  const pillar5 = findTable(
    research,
    /Pillar 5.*Halo-defense-creative-asset-iteration/i,
  );
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/14
  const topSections = r14?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r14?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Amazon-DSP + Amazon-Attribution operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Amazon DSP + Amazon Attribution Audit
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching an Amazon-DSP-programmatic-display +
          Halo-defense + Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-post-purchase-email-merge
          channel on a US-based Shopify DTC brand at $5M-$25M DTC+Amazon GMV with at
          least $5M+ Amazon Marketplace presence + at least 5+ Amazon-listed hero SKUs
          + lifestyle-contextual-fit-product-set + 5-10× brand-search-volume-lift
          potential + 20%+ Amazon-DSP-margin-headroom + 4-8 hr/wk DSP-marketing-team
          capacity (OR $2k-$10k/mo managed-service-with-Tinuiti-or-Pacvue-or-Helium-10)
          + Move #1 + #4 + #6 + #8 + #11 + #13 + #14.5 + #15 + #15.x + #16 + #17 live.
          Three layers: <strong>research/14</strong> (the 5-pillar framework for the
          Amazon-Ads-Console-onboard + Brand-Registry-trademark-defensive-levers +
          Amazon-DSP-in-market-shoppers + Amazon-Audiences-Insights-engaged-shoppers +
          Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-post-purchase-email-merge-recipe +
          Halo-defense-creative-asset-iteration-cycle + Brand-search-volume-lift-attribution layer),
          <strong> playbook 21</strong> (the 4-phase
          Amazon-DSP-account-onboard + Halo-defense-creative-assets-onboard + first-Amazon-DSP-in-market-shoppers-launch
          → Amazon-DSP-omnichannel-campaigns-launch + Amazon-Audiences-Insights-engaged-shoppers-expand
          + Amazon-Marketing-Cloud-cohort-overlay-launch →
          Amazon-Attribution-post-purchase-email-merge-recipe-launch +
          Halo-vs-direct-incremental-ACoS-measurement-launch + Halo-defense-creative-iteration-cycle
          → Steady-state + Brand-search-volume-lift-attribution + Halo-defense-steady-state
          + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe operator build),
          and <strong>asset 22</strong> (the paste-ready 13 artifacts — 30 voice-variant
          Halo-defense-creative-asset brief templates [5 voices × 6 SKU archetypes] +
          5-path tools decision matrix [Amazon-Ads-Console / Pacvue / Tinuiti / Helium 10 / Perpetua] +
          Amazon-DSP-bid-strategy cookbook + Halo-defense-creative-assets-baseline [5 specs × 3 pattern categories] +
          Amazon-Audiences-Insights-engaged-shoppers-segment-build recipes +
          Amazon-Attribution-post-purchase-email-merge-recipe + AMC-cohort-overlay-Wire-spec +
          Triple-Whale-Amazon-cohort-overlay-Wire-spec + Klaviyo-Amazon-source-segment-integration templates +
          Brand-search-volume-lift-attribution-flow +
          3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe +
          4-trigger-Halo-defense-tier-promotion-SOP + 90-day-Halo-defense-creative-asset-iteration-cadence).
          This page surfaces all three in one place so you can stop tab-switching between{" "}
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
              $5M-$25M DTC+Amazon GMV, Amazon-DSP + Halo-defense + AMC-cohort-overlay
              + Amazon-Attribution-post-purchase-email-merge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">3:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4:1 conservative (Path A Sponsored-Products-only) / 2.5:1
              muted (Path C full-Amazon-DSP-omnichannel-programmatic-display)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental Halo-defense revenue
            </CardTitle>
            <CardDescription>
              Path B at $5M US DTC + $10M Amazon base · 5-30% incremental revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $300k–$3M
              <span className="text-base text-muted-foreground font-normal ml-1">
                incremental Halo-defense-revenue
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $300k-$3M Path B Year-1 incremental Halo-defense-revenue /
              $14k-$85k total Year-1 cost = 3.5:1 to 35:1 Year-1 ROI = "great" band ·
              0.5-0.7× CAC vs paid-social · 5-10× brand-search-volume-lift · Year-2+ ramp
              to 12-50:1 steady-state compounding-traffic-curve
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 21 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (Amazon-DSP-account-onboard + Halo-defense-creative-assets-onboard
              + first-Amazon-DSP-in-market-shoppers-launch) → 2 (Amazon-DSP-omnichannel-campaigns-launch
              + Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-Marketing-Cloud-cohort-overlay-launch)
              → 3 (Amazon-Attribution-post-purchase-email-merge-recipe-launch +
              Halo-vs-direct-incremental-ACoS-measurement-launch + Halo-defense-creative-iteration-cycle)
              → 4 (steady-state + Brand-search-volume-lift-attribution + Halo-defense-steady-state
              + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 22 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 6 SKU archetypes · Halo-defense-creative-asset brief templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              30
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Beauty + Apparel + Home essentials + Food and beverage + Wellness +
              Pet supplies · 30 Halo-defense-creative-asset brief templates · all 5
              voices ≥15 (Default=43 / Luxury=43 / Sustainable=42 / Gen-Z=55 / B2B=53)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/14) === */}
      {r14 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/14)</CardTitle>
            <CardDescription>
              The headline thesis — why Amazon-DSP + Amazon-Attribution is the canonical
              5-30% Year-1 incremental revenue + 0.5-0.7× CAC vs paid-social +
              5-10× brand-search-volume-lift layer for $5M-$25M DTC+Amazon brands
              with $5M+ Amazon Marketplace presence + Move #6 Triple-Whale attribution
              + Move #13 marketplace-expansion live
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
        <Card id="research-14">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-14
              </span>
              <CardTitle className="text-base">
                research/14-amazon-dsp-amazon-attribution-audit
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/14-amazon-dsp-amazon-attribution-audit.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 21 maps into a 4-phase Amazon-DSP
              launch ladder (Phase 1 Amazon-DSP-account-onboard + Halo-defense-creative-assets-onboard
              + first-Amazon-DSP-in-market-shoppers-launch ~16hr Path B baseline Weeks 1-6
              · Phase 2 Amazon-DSP-omnichannel-campaigns-launch + Amazon-Audiences-Insights-engaged-shoppers-expand
              + Amazon-Marketing-Cloud-cohort-overlay-launch ~24hr Weeks 7-24 · Phase 3
              Amazon-Attribution-post-purchase-email-merge-recipe-launch + Halo-vs-direct-incremental-ACoS-measurement-launch
              + Halo-defense-creative-iteration-cycle ~32hr Weeks 25-48 · Phase 4 steady-state
              + Brand-search-volume-lift-attribution + Halo-defense-steady-state +
              3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe
              ~24hr Weeks 49-72 + 4-8 hr/wk ongoing + dedicated-DSP-marketing-team in
              Year-2+) and asset 22 turns into 30 paste-ready per-voice per-SKU-archetype
              Halo-defense-creative-asset brief templates. The five pillars below are
              the highest-leverage surfaces — the full doc ships Pillar 1
              (Amazon-Ads-Console-onboard + Amazon-Brand-Registry-trademark-defensive-levers
              + Amazon-DSP-account-onboard with the canonical $35k+ minimum-spend self-serve
              OR $2k-$10k/mo managed-service-with-Tinuiti-or-Pacvue-or-Helium-10-or-Perpetua
              + Amazon-Brand-Analytics-engaged-daily-visitors-lift-baseline + Amazon-Creative-Assets-baseline
              [5-second-static-banner + 5-second-video-9:16-1:1-16:9 + 3-pattern-categories
              &#123;lifestyle-contextual + competitor-product-targeting + brand-defense&#125;] per
              Amazon Ad Business 2024 + Amazon-Brand-Registry 2024 benchmarks), Pillar 2
              (Amazon-DSP-in-market-shoppers-audience-segment-launch + Amazon-Audiences-Insights-engaged-shoppers-expand
              + Amazon-DSP-bid-strategy with the canonical 5-audience-segment-build
              recipes [in-market-shoppers + lifestyle-contextual + competitor-product-targeting
              + brand-defense + lookalike-audience] + bid-strategy cookbook
              [fixed-CPM-with-$0.50-$5.00-CPM-band / dynamic-CPM-with-50th-percentile-bid
              / goal-based-bid / PMP-deal-based-bid / vCPM] per Amazon-Ads-Console-2024
              + Pacvue-2024 + Helium-10-2024 + Tinuiti-2024 benchmarks), Pillar 3
              (Amazon-Marketing-Cloud-cohort-overlay-launch + AMC-API-connection-or-Amazon-Attribution-Pro-or-advanced-tools-Postscript-merge
              with the canonical 5-canonical-cohort-queries [Amazon-DSP-impression-cohort
              + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort +
              Halo-defense-impression-cohort + Halo-defense-click-cohort] + AMC-cohort-overlay-iteration-cycle-monthly-or-quarterly
              per Amazon-Marketing-Cloud-2024 + Seller-Snap-2024 benchmarks), Pillar 4
              (Amazon-Attribution-post-purchase-email-merge-recipe-launch + Halo-vs-direct-incremental-ACoS-measurement-launch
              with the canonical 5-step recipe [Step 1 Amazon-Attribution-Pro-or-advanced-tools-onboarding
              / Step 2 post-purchase-survey-instrumentation-wire / Step 3 Triple-Whale-Amazon-cohort-LTV-overlay
              / Step 4 Klaviyo-Amazon-source-segment-integration / Step 5 AMC-cohort-overlay-instrumentation]
              + Beta-deprecation-August-2025-migration per Amazon-Attribution-2024-Beta-to-GA-migration-guide
              + Halo-vs-direct-incremental-ACoS-measurement-flow per Tinuiti-2024-Halo-effect-cohort-study
              benchmarks), and Pillar 5 (Halo-defense-creative-asset-iteration-cycle +
              Brand-search-volume-lift-attribution-launch + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe
              with the canonical quarterly-refresh-cadence [refresh-top-5-Halo-defense-creative-assets-every-90-days
              + iterate-prompt-set-from-Halo-defense-creative-pattern-categories] +
              50+-Halo-defense-creative-assets-steady-state-library + 3-tier
              3rd-party-Amazon-DSP-manager-decision-recipe [Tier 1 managed-service-Tinuiti-or-Pacvue-or-Helium-10
              $2k-$10k/mo / Tier 2 in-house-team $10k-$25k/mo / Tier 3 fully-managed-service-Pacvue-or-Helium-10-Enterprise
              $5k-$25k/mo] per Amazon-Creative-Assets-2024-canonical-quarterly-refresh-cadence
              + Pacvue-2024 + Helium-10-2024 + Tinuiti-2024 benchmarks).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — Amazon-Ads-Console-onboard + Amazon-Brand-Registry-trademark-defensive-levers
                  + Amazon-DSP-account-onboard
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — Amazon-DSP-in-market-shoppers-audience-segment-launch +
                  Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar3 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 3 — Amazon-Marketing-Cloud-cohort-overlay-launch +
                  AMC-API-connection-or-Amazon-Attribution-Pro-or-advanced-tools-Postscript-merge
                </div>
                <ResearchTable rows={pillar3} />
              </div>
            )}
            {pillar4 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 4 — Amazon-Attribution-post-purchase-email-merge-recipe-launch +
                  Halo-vs-direct-incremental-ACoS-measurement-launch
                </div>
                <ResearchTable rows={pillar4} />
              </div>
            )}
            {pillar5 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 5 — Halo-defense-creative-asset-iteration-cycle +
                  Brand-search-volume-lift-attribution-launch +
                  3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe
                </div>
                <ResearchTable rows={pillar5} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($5M US DTC + $10M Amazon base, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-21">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-21
              </span>
              <CardTitle className="text-base">
                playbook 21 — Amazon-DSP + Amazon-Attribution launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates · 39 prereqs
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/21-amazon-dsp-amazon-attribution-audit-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p21 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/14 section into a 4-phase Amazon-DSP + Halo-defense +
                  AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge
                  launch ladder with paste-ready Amazon-Ads-Console-or-Pacvue-or-Tinuiti-or-Helium-10-or-Perpetua
                  + canonical 5-path Amazon-DSP-launch-mode decision matrix [Path A Sponsored-Products-only
                  + Halo-defense-via-Brand-Registry-only $500-$1k/mo &lt;$5M DTC+Amazon GMV
                  4:1 ROI / Path B DEFAULT Amazon-DSP + Halo-defense-programmatic-display
                  + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge
                  $1k-$5k/mo $5M-$25M DTC+Amazon GMV 3:1 default Year-1 ROI / Path C
                  full-Amazon-DSP-omnichannel-programmatic-display + Halo-defense +
                  AMC-cohort-iteration + Amazon-Attribution-post-purchase-email-merge
                  $5k-$25k/mo $25M+ DTC+Amazon GMV 2.5:1 ROI muted by 6-12-month DSP-build-out-cycle
                  + Halo-attribution-modeling-maturity / Path D Halo-defense-via-Brand-Registry-only
                  $500-$1k/mo / Path E pre-revenue / pre-launch / defer] + canonical
                  5-path tools decision matrix + canonical 8-prereq Amazon-DSP-onboarding-pack
                  [Amazon-Seller-Central-account-active + Amazon-Brand-Registry-trademark-registered
                  + Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider
                  + DSP-managed-service-or-self-serve-account-or-Amazon-Ads-Console-minimum-spend
                  + Halo-defense-creative-assets-baseline + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit
                  + AMC-cohort-overlay-instrumentation + Triple-Whale-Amazon-cohort-overlay-setup]
                  + canonical Halo-defense-creative-assets-baseline [5 specs × 3 pattern categories
                  per Amazon-Creative-Assets-2024-canonical-5-specs] + canonical
                  Halo-vs-direct-incremental-ACoS-measurement-recipe + canonical
                  Amazon-Attribution-post-purchase-email-merge-recipe + canonical
                  3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe
                  + 39 prereqs across 4 phase-by-phase gates A-D with 10/10/10/9 prereqs
                  respectively + 15 numbered pitfalls with corrective Fix lines clustered
                  into 6 failure modes [A DSP-onboarding / B Amazon-Audiences-Insights-engaged-shoppers
                  / C AMC-cohort-overlay / D Amazon-Attribution-post-purchase-email-merge
                  / E Halo-defense-creative / F operational cross-cutting] + 3:1 default
                  Year-1 ROI Path B at $5M US DTC + $10M Amazon base ($300k-$3M Path B
                  incremental Halo-defense-revenue / $14k-$85k cost = 3.5:1 to 35:1
                  Year-1 ROI = "great" band; Year-2+ ramp to 12-50:1 steady-state
                  compounding-traffic-curve per Amazon Ad Business 2024 + Tinuiti 2024 +
                  Pacvue 2024 + Amazon-Marketing-Cloud 2024 + Amazon-Brand-Registry 2024
                  + Amazon-Attribution 2024 benchmarks; 0.5-0.7× CAC vs paid-social +
                  5-10× brand-search-volume-lift premium + 5-pillar-Halo-defense-creative-pattern-set).
                  Each phase boundary is gated by an explicit verification gate (Gate A
                  through Gate D), and the full build surfaces 4 canonical verification
                  gates with 10/10/10/9 prereqs respectively = 39 prereqs total
                  (Amazon-Seller-Central-account-active + Amazon-Brand-Registry-trademark-registered
                  + Amazon-Ads-Console-or-managed-service + Amazon-Attribution-Pro-or-advanced-tools-or-AMC
                  + Amazon-Creative-Assets-baseline-built + Halo-defense-creative-assets-baseline
                  + Triple-Whale-Amazon-cohort-overlay-wire + Klaviyo-Amazon-source-segment-integration
                  + DSP-marketing-team-capacity-or-managed-service + Brand-Analytics-engaged-daily-visitors-baseline).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p21.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/21 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-22">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-22
              </span>
              <CardTitle className="text-base">
                asset 22 — Amazon-DSP + Amazon-Attribution templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 30 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/22-amazon-dsp-amazon-attribution-audit-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a22 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-SKU-archetype Halo-defense-creative-asset
                  brief templates an operator ships when launching an Amazon-DSP +
                  Halo-defense + Amazon-Marketing-Cloud-cohort-overlay +
                  Amazon-Attribution-post-purchase-email-merge channel on a $5M-$25M
                  DTC+Amazon brand with mature Amazon-presence. 5 voice profiles (Default
                  / Luxury / Sustainable / Gen-Z / B2B from assets/02-brand-voice.md) × 6
                  SKU archetypes (Beauty / Apparel / Home essentials / Food and beverage /
                  Wellness / Pet supplies) = 30 voice-variant Halo-defense-creative-asset
                  brief templates wired to Amazon-Ads-Console-or-Pacvue-or-Tinuiti-or-Helium-10-or-Perpetua
                  + Amazon-Creative-Assets-baseline + Amazon-Audiences-Insights-engaged-shoppers
                  + the canonical 5-path tools decision matrix. The 5-pillar-Halo-defense-creative-pattern-set
                  gates the Halo-defense-creative-assets-baseline = 5 specs × 3 pattern
                  categories [lifestyle-contextual + competitor-product-targeting +
                  brand-defense] with creative-brief-template + per-pattern-success-metrics
                  [CTR ≥0.5% / CVR ≥2% / Halo-defense-rate ≥25% / brand-search-volume-lift
                  ≥2× per Amazon-Brand-Registry-2024 + Pacvue-2024 benchmarks] + the
                  canonical Amazon-DSP-bid-strategy cookbook [fixed-CPM / dynamic-CPM /
                  goal-based-bid / PMP-deal-based-bid / vCPM] with per-audience-segment-bid-strategy
                  + per-vertical-bid-strategy + per-Halo-defense-pattern-bid-strategy +
                  the canonical 5-audience-segment-build recipes [in-market-shoppers +
                  lifestyle-contextual + competitor-product-targeting + brand-defense +
                  lookalike-audience] with per-segment-Audiences-Insights-segment-build-recipe
                  + per-segment-keyword-set-baseline + per-segment-bid-strategy +
                  per-segment-creative-asset-mapping + per-segment-success-metrics +
                  the canonical 5-step Amazon-Attribution-post-purchase-email-merge-recipe
                  + AMC-cohort-overlay-Wire-spec [5-canonical-cohort-queries] +
                  Triple-Whale-Amazon-cohort-overlay-Wire-spec [5-step wire spec] +
                  Klaviyo-Amazon-source-segment-integration templates [5-flow × 5-voice
                  × &#123;email + SMS&#125; = 50 voice-driven cells] + Brand-search-volume-lift-attribution-flow
                  [5-step recipe] + 3-tier 3rd-party-Amazon-DSP-manager-decision-recipe
                  [Tier 1 managed-service-Tinuiti-or-Pacvue-or-Helium-10 $2k-$10k/mo /
                  Tier 2 in-house-team $10k-$25k/mo / Tier 3 fully-managed-service-Pacvue-or-Helium-10-Enterprise
                  $5k-$25k/mo] + 4-trigger-Halo-defense-tier-promotion-SOP per
                  Move-#15-affiliate-program-tier-promotion-pattern [volume $50k+/90d /
                  cohort-LTV $300+ / creative-quality 10+/90d + 70%+ / tenure 180d +
                  Triggers 1+2] + 90-day-Halo-defense-creative-asset-iteration-cadence
                  + 12 numbered pitfalls with corrective Fix lines clustered into 6
                  failure modes [A platform-onboarding / B content-architecture / C
                  Pinterest-vertical-pillar / D measurement-compliance-iteration / E
                  amplification-steady-state / F operational cross-cutting].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a22.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a22.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/22 not found in content.json — regenerate.
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
            route — both pre-staged in research/14 §Next moves, playbook 21
            §Companion tool, and asset 22 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C Amazon-DSP + Halo-defense scorer
              that takes a brand&apos;s us_dtc_gmv + marketplace_gmv_pct + sku_count +
              hero_sku_count + gross_margin_pct + has_amazon_seller_central_account +
              has_brand_registry_trademark + has_amazon_attribution_pro_or_advanced_tools
              + has_dsp_managed_service_or_self_serve_account + voice_profile +
              has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week +
              has_halo_defense_creative_assets → outputs Path A (Sponsored-Products-only
              + Halo-defense-via-Brand-Registry-only $500-$1k/mo &lt;$5M DTC+Amazon
              GMV 4:1 conservative nominal ROI) / Path B (Amazon-DSP +
              Halo-defense-programmatic-display + AMC-cohort-overlay +
              Amazon-Attribution-post-purchase-email-merge DEFAULT $1k-$5k/mo
              $5M-$25M DTC+Amazon GMV 3:1 default Year-1 ROI with $300k-$3M Path B
              incremental Halo-defense-revenue + 5-30% Year-1 incremental revenue +
              0.5-0.7× CAC vs paid-social + 5-10× brand-search-volume-lift at $5M US
              DTC + $10M Amazon base) / Path C (full-Amazon-DSP-omnichannel-programmatic-display
              + Halo-defense + AMC-cohort-iteration + Amazon-Attribution-post-purchase-email-merge
              $5k-$25k/mo $25M+ DTC+Amazon GMV 2.5:1 ROI muted by 6-12-month
              DSP-build-out-cycle + Halo-attribution-modeling-maturity) recommendation
              with cost stack + expected Year-1 incremental Halo-defense-revenue
              $300k-$3M Path B at $5M-$25M US DTC+Amazon base + 0.5-0.7× CAC vs
              paid-social + 5-10× brand-search-volume-lift steady-state + canonical
              5-path Amazon-DSP-launch-mode decision matrix + canonical
              5-path-tools-decision-matrix [Amazon-Ads-Console / Pacvue / Tinuiti /
              Helium 10 / Perpetua] + 6 deferral gates [us_dtc_gmv &lt;$500k /
              marketplace_gmv_pct &lt;30% / sku_count &lt;5 / hero_sku_count &lt;5 /
              gross_margin_pct &lt;20% / no-Amazon-Seller-Central-account] + 3
              downgrade gates [luxury-voice-without-MAP-policy-guardrails /
              sustainable-voice-without-Brand-Registry / Path-C-without-dedicated-DSP-marketing-team].
              Pre-staged in research/14 §Next moves + playbook 21 §Next moves + asset 22
              §Related. Gated on the canonical 8 prereqs (Amazon-Seller-Central-account-active
              + Amazon-Brand-Registry-trademark-registered + Amazon-Ads-Console-or-managed-service-onboard
              + Amazon-Attribution-Pro-or-advanced-tools-or-AMC + Halo-defense-creative-assets-baseline
              + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit +
              AMC-cohort-overlay-instrumentation + Triple-Whale-Amazon-cohort-overlay-setup
              + lifestyle-contextual-fit-product-set + 5+ Amazon-listed hero SKUs +
              20%+ Amazon-DSP-margin-headroom + 4-8 hr/wk DSP-marketing-team-capacity).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/amazon-dsp-amazon-attribution-audit-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering Amazon-DSP-launch readiness (Path A/B/C
              tier indicator + monthly-GMV band + DSP-marketing-team-capacity band)
              + per-platform readiness (5 canonical
              Amazon-DSP-platforms × {`{live/draft/staging/not-started}`} status:
              Amazon-Ads-Console-or-Pacvue-or-Tinuiti-or-Helium-10-or-Perpetua) +
              per-path Year-1 incremental Halo-defense-revenue bar chart (Path A
              vs B vs C) + 4-phase gate status (Gate A Amazon-DSP-account-onboard +
              Halo-defense-creative-assets-onboard + first-Amazon-DSP-in-market-shoppers-launch
              / Gate B Amazon-DSP-omnichannel-campaigns + Amazon-Audiences-Insights-engaged-shoppers-expand
              + AMC-cohort-overlay-launch / Gate C Amazon-Attribution-post-purchase-email-merge-recipe
              + Halo-vs-direct-incremental-ACoS-measurement + Halo-defense-creative-iteration-cycle
              / Gate D steady-state + Brand-search-volume-lift-attribution + Halo-defense-steady-state
              + 3rd-party-Amazon-DSP-manager-decision-recipe per playbook 21 §Verification
              gates 10/10/10/9 prereqs) + 5-pillar-coverage-progress-bar +
              Halo-defense-creative-asset-iteration-cadence + AMC-cohort-overlay-iteration-cycle
              + 12-24-month-compounding-Halo-defense-effective-rate-steady-state as a
              1-click operator surface. Self-contained static HTML; mirrors the
              canonical 6-section + 4 canonical data structures + 26-category Node
              smoke suite pattern from the marketplace / 3PL /
              international-expansion / lifecycle-flow / subscription-program /
              affiliate-program / b2b-wholesale / tiktok-shop-live-commerce /
              creator-economy / pinterest-organic-discovery-seo-content-engine
              static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}