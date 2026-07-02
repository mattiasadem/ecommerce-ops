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

export const metadata = { title: "Creator Economy — Ecommerce Ops" };

export default function CreatorsPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r12 = findDoc(research, /12-creator-economy-expansion\.md$/);
  const p19 = playbooks.find((p) => p.file === "19-creator-economy-launch.md");
  const a20 = assets.find(
    (a) => a.file === "20-creator-discovery-templates.md",
  );

  // Pull canonical tables out of research/12
  const pillar2 = findTable(
    research,
    /Pillar 2.*Creator-outreach.*5-payout/i,
  );
  const pillar5 = findTable(
    research,
    /Pillar 5.*Triple-Whale.*cohort-LTV/i,
  );
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/12
  const topSections = r12?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r12?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Creator-economy-expansion operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Creator Economy Expansion
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a cross-platform
          creator-economy program on a US-based Shopify DTC brand with at
          least 10 SKUs + 25%+ creator-economy-margin-headroom + 4-8 hr/wk
          operator capacity + Gen-Z / Millennial audience-skew ≥40% +
          creator-pool-baseline ≥30 micro-creators. Three layers:{" "}
          <strong>research/12</strong> (5-pillar framework for the
          cross-platform creator-discovery + creator-payout-orchestration +
          creator-content-licensing + Triple-Whale creator-cohort-LTV layer
          via Aspire + Collabstr + GRIN + CreatorIQ + Tagger),{" "}
          <strong>playbook 19</strong> (4-phase Creator-discovery-platform-onboard
          → Mid-tier-creator-onboarding + content-licensing-launch →
          Macro-creator-flagship-campaign + creator-affiliate-program-bridge
          → Steady-state + creator-tier-promotion-SOP operator build), and{" "}
          <strong>asset 20</strong> (paste-ready 11 artifacts — 5 voices ×
          6 SKU archetypes = 30 voice-variant creator-discovery outreach
          templates + 5-payout creator-economy-structures contract-template +
          3-clause content-licensing-template + 4-channel
          whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec
          + Klaviyo-creator-content-flow-templates + creator-discovery-platform-onboarding-templates
          [Aspire + Collabstr + GRIN + CreatorIQ + Tagger] + creator-tier-mix-baseline
          + FTC-compliance-disclosure-language templates + 4-trigger
          tier-promotion-SOP + 90-day-content-licensing-renewal-cadence). This
          page surfaces all three in one place so you can stop
          tab-switching between{" "}
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
              $500k–$5M GMV, creator-mix micro+mid+macro 5-payout-structures
              + content-licensing + whitelisting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">8:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 16.7:1 gross · 6:1 conservative (Path A) / 6:1
              muted (Path C)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental creator-economy revenue
            </CardTitle>
            <CardDescription>
              Path B at $2M US DTC base · 50-100 active creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $200k–$1M
              <span className="text-base text-muted-foreground font-normal ml-1">
                creator-driven revenue
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $500k Path B median incremental creator-economy-revenue / $30k
              median annual cost = 8:1 conservative · 2-4× LTV-multiplier vs
              no-creator-economy-program
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 19 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (creator-discovery-platform-onboarding + first-50
              micro-creator UGC outreach + Triple-Whale creator-cohort-LTV
              Wire) → 2 (mid-tier-creator-onboarding + content-licensing-launch
              + creator-content-brief-templates) → 3 (macro-creator-flagship-campaign
              + creator-affiliate-program-bridge + GRIN-or-CreatorIQ-enterprise-CRM)
              → 4 (steady-state + creator-tier-promotion-SOP + content-licensing-renewal-cadence
              + Triple-Whale creator-economy-cohort-LTV iteration)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 20 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 6 SKU archetypes · 11 paste-ready artifacts
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
              Beauty + Fashion + Home + Food-and-Beverage + Pet + Health · all
              5 voices ≥15 (Default=62 / Luxury=63 / Sustainable=64 /
              Gen-Z=71 / B2B=89)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/12) === */}
      {r12 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/12)</CardTitle>
            <CardDescription>
              The headline thesis — why cross-platform creator-economy is the
              canonical 10-30% incremental-revenue + 2-4× LTV-multiplier
              layer for $500k-$5M GMV brands with Gen-Z / Millennial
              audience-skew + Move #6 attribution live + Move #15
              affiliate-program + Move #15.x TikTok-Shop-creator-affiliate-pool
              cross-pollination
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
        <Card id="research-12">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-12
              </span>
              <CardTitle className="text-base">
                research/12-creator-economy-expansion
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/12-creator-economy-expansion.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 19 maps into a 4-phase
              creator-economy launch ladder (Phase 1 creator-discovery-platform-onboarding
              + first-50 micro-creator UGC outreach + Triple-Whale
              creator-cohort-LTV Wire ~12hr Path B baseline Weeks 1-4 · Phase
              2 mid-tier-creator-onboarding + content-licensing-launch +
              whitelisting-ads-template-execution + Triple-Whale
              creator-content-cohort-LTV-measurement ~16hr Weeks 5-10 · Phase
              3 macro-creator-flagship-campaign + creator-affiliate-program-bridge
              + GRIN-or-CreatorIQ-enterprise-CRM + 4-trigger tier-promotion-SOP
              ~24hr Weeks 11-18 · Phase 4 steady-state + creator-tier-promotion-SOP
              + content-licensing-renewal-cadence + Triple-Whale
              creator-economy-cohort-LTV-iteration + FTC-compliance-disclosure-language-audit
              ~16hr Weeks 19-24 + 4-8 hr/wk ongoing + dedicated 0.25-0.5
              FTE creator-economy-manager in Year-2+) and asset 20 turns into
              11 paste-ready artifacts (30 voice-variant creator-discovery
              outreach templates + 5-payout creator-economy-structures
              contract-template + content-licensing-template +
              whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec
              + Klaviyo-creator-content-flow-templates + creator-discovery-platform-onboarding-templates
              + creator-tier-mix-baseline + FTC-compliance-disclosure-language
              templates + 4-trigger tier-promotion-SOP +
              90-day-content-licensing-renewal-cadence). The five pillars
              below are the highest-traffic surfaces — the full doc ships
              Pillar 1 (creator-discovery-platform-selection with the
              canonical 5-platform decision matrix [Aspire $0-$2k/mo SaaS /
              Collabstr 10%-of-creator-payment / GRIN $2.5k+/mo /
              CreatorIQ $2.5k+/mo / Tagger $1k+/mo social-listening] +
              creator-tier-mix-baseline [60% micro + 30% mid-tier + 10%
              macro per Move-#15-affiliate-program-benchmarks]), Pillar 2
              (creator-outreach + onboarding + canonical 5-payout-creator-economy-structures
              [product-seeding-only $0 + free-product / micro-CPS
              15-30%-of-GMV / mid-tier-CPS 20-30%-of-GMV + $100-base-fee +
              content-licensing-rights / macro-flat-fee $500-$5k/creator/campaign
              + content-licensing + whitelisting-rights / enterprise-hybrid
              5%-of-GMV + $1k-base-fee + content-licensing +
              whitelisting-rights]), Pillar 3 (creator-content-licensing
              template [3-clause: perpetual-organic-usage +
              90-day-paid-amplification + creator-attribution-required per
              Awin 2024 + Impact 2024 benchmarks] + whitelisting-ads-template
              [creator-grants-brand-permission-to-run-creator-content-as-brand-paid-ads
              per Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024
              + YouTube-Shorts-Paid-Discovery-2024 + Pinterest-Creator-Reveal-2024
              with per-voice budget-allocation] + canonical
              2-4× creator-content-ROI uplift vs no-licensing-no-whitelisting
              per Awin 2024 + Impact 2024 benchmarks), Pillar 4
              (creator-tier-promotion + 4-trigger-SOP [volume +
              cohort-LTV + content-quality + tenure per Move-#15-affiliate-program-tier-promotion-pattern]
              + content-licensing-renewal-cadence [90-day per-piece renewal
              decision per content-piece-level-ROI-data from
              Triple-Whale-creator-cohort-overlay; sunset
              creator-content-licensing with {`<0.5×`} average-creator-content-ROI;
              renew creator-content-licensing with ≥2× per Tubular Labs 2024
              + Aspire 2024 benchmarks] + creator-churn-rate-baseline
              [micro 30-50%-annual / mid-tier 15-25%-annual / macro
              5-10%-annual per Awin 2024 + Impact 2024 + Aspire 2024
              benchmarks]), and Pillar 5 (Triple-Whale-creator-cohort-LTV-overlay
              + 5-way-comparison-cycle [creator-economy-driven-cohort-LTV vs
              organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV vs
              affiliate-program-driven-cohort-LTV [Move #15] vs
              TikTok-Shop-driven-cohort-LTV [Move #15.x] at 30/60/90-day
              windows; iterate creator-discovery-platform + creator-tier-mix
              + 5-payout-creator-economy-structures + content-licensing-terms
              + whitelisting-ads-budget-allocation based on the canonical
              5-way-comparison-cycle-data] + creator-economy-program-ROI
              [total-creator-driven-revenue / total-creator-economy-cost-stack
              at 30/60/90-day windows; ≥5:1 in the canonical great band per
              Tubular Labs 2024 + Aspire 2024 benchmarks] +
              FTC-compliance-disclosure-language-SOP per 16-CFR-Part-255
              [#ad + #sponsored + #partner + #gifted disclosure templates;
              $10k+/violation fine per FTC-2023-2024-enforcement]).
            </p>
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — canonical 5-payout-creator-economy-structures +
                  per-voice creator-outreach templates
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar5 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 5 — Triple-Whale creator-cohort-LTV-overlay +
                  5-way-comparison-cycle + creator-economy-program-ROI
                </div>
                <ResearchTable rows={pillar5} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($2M US DTC, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-19">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-19
              </span>
              <CardTitle className="text-base">
                playbook 19 — Creator Economy Expansion launch (operator
                build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/19-creator-economy-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p19 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/12 section into a 4-phase
                  creator-economy launch ladder with paste-ready Aspire +
                  Collabstr + GRIN + CreatorIQ + Tagger + Triple-Whale
                  creator-cohort-LTV-overlay + Klaviyo-creator-content-flows
                  multi-platform operator build. The 4 phases mirror the
                  canonical creator-economy launch sequence (Phase 1:
                  creator-discovery-platform-onboarding + first-50
                  micro-creator UGC outreach + Triple-Whale
                  creator-cohort-LTV Wire ~12hr Path B baseline Weeks 1-4 ·
                  Phase 2: mid-tier-creator-onboarding +
                  content-licensing-launch + whitelisting-ads-template-execution
                  + Triple-Whale creator-content-cohort-LTV-measurement +
                  creator-content-brief-templates ~16hr Weeks 5-10 · Phase
                  3: macro-creator-flagship-campaign +
                  creator-affiliate-program-bridge +
                  GRIN-or-CreatorIQ-enterprise-CRM +
                  4-trigger-tier-promotion-SOP ~24hr Weeks 11-18 · Phase
                  4: steady-state + creator-tier-promotion-SOP +
                  content-licensing-renewal-cadence + Triple-Whale
                  creator-economy-cohort-LTV-iteration-cycle +
                  FTC-compliance-disclosure-language-audit per 16 CFR Part
                  255 ~16hr Weeks 19-24 + 4-8 hr/wk ongoing). Each phase
                  boundary is gated by an explicit verification gate (Gate A
                  through Gate D), and the full build surfaces 4 canonical
                  verification gates with 10/10/10/9 prereqs respectively =
                  39 prereqs total (Move #1 + #4 + #6 + #8 + #11 + #15 +
                  #15.x shipped + creator-discovery-platform-account +
                  creator-tier-mix-baseline-audit + creator-content-budget-baseline
                  ≥$500/mo + content-licensing-template-drafted-with-legal-counsel
                  + whitelisting-ads-template-drafted-with-legal-counsel +
                  FTC-compliance-disclosure-language-SOP per 16 CFR Part 255
                  + Triple-Whale-creator-cohort-overlay-Wire +
                  creator-economy-attribution-platform-setup).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p19.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/19 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-20">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-20
              </span>
              <CardTitle className="text-base">
                asset 20 — Creator Economy discovery templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 30 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/20-creator-discovery-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a20 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-SKU-archetype creator-discovery
                  templates an operator ships when launching an Aspire +
                  Collabstr + GRIN + CreatorIQ + Tagger + Triple-Whale
                  creator-cohort-LTV-overlay cross-platform creator-economy
                  program. 5 voice profiles (Default / Luxury / Sustainable /
                  Gen-Z / B2B from assets/02-brand-voice.md) × 6 SKU
                  archetypes (Beauty / Fashion / Home / Food-and-Beverage /
                  Pet / Health) = 30 voice-variant creator-discovery
                  outreach templates wired to the canonical 5-payout
                  creator-economy-structures + content-licensing-template +
                  whitelisting-ads-template + Triple-Whale creator-cohort-overlay
                  Wire-spec + Klaviyo-creator-content-flow-templates
                  [creator-content-welcome + creator-driven-cart-abandon +
                  creator-driven-post-purchase + creator-tier-promotion-educational
                  + 90-day-content-licensing-renewal-or-sunset-decision].
                  The 5-payout-creator-economy-structures gates the
                  creator-payout-contract [product-seeding-only $0 +
                  free-product / micro-CPS 15-30%-of-GMV / mid-tier-CPS
                  20-30%-of-GMV + $100-base-fee + content-licensing-rights /
                  macro-flat-fee $500-$5k/creator/campaign + content-licensing
                  + whitelisting-rights / enterprise-hybrid 5%-of-GMV +
                  $1k-base-fee + content-licensing + whitelisting-rights per
                  research/12 Pillar 2]. Each voice-driven cell ships
                  creator-handle-criteria + creator-brief-tone +
                  creator-FTC-disclosure-language + Triple Whale{" "}
                  <code className="rounded bg-muted px-1 mx-1">
                    ?tw_camp=creator_&lt;sku_archetype&gt;_v&lt;voice_profile&gt;
                  </code>{" "}
                  UTM on every CTA + the canonical 4-channel
                  whitelisting-ads-template [Meta-Brand-Collabs-Manager +
                  TikTok-Creator-Marketplace + YouTube-Shorts-Paid-Discovery
                  + Pinterest-Creator-Reveal] with per-voice budget-allocation
                  [Default 50%-Meta / Luxury 60%-Meta / Sustainable 40%-Meta /
                  Gen-Z 50%-TikTok / B2B 50%-LinkedIn] + the canonical
                  creator-discovery-platform-onboarding-templates [Aspire +
                  Collabstr + GRIN + CreatorIQ + Tagger] + the canonical
                  creator-tier-mix-baseline [60%-micro + 30%-mid-tier +
                  10%-macro] + the canonical 4 FTC-compliance-disclosure-language
                  templates [#ad + #sponsored + #partner + #gifted per 16 CFR
                  Part 255 + FTC-Endorsement-Guides 2024] + the canonical
                  4-trigger tier-promotion-SOP [volume + cohort-LTV +
                  content-quality + tenure] + the canonical
                  90-day-content-licensing-renewal-cadence [sunset with
                  {`<0.5×`} ROI / renew with ≥2× ROI per content-piece-level-data]
                  + 12 numbered pitfalls with corrective Fix lines clustered
                  into 6 failure modes [A creator-discovery-platform-selection
                  + B creator-payout-structure + C content-licensing +
                  whitelisting + D creator-tier-promotion + content-licensing-renewal
                  + E attribution + measurement + F operational
                  cross-cutting].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a20.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a20.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/20 not found in content.json — regenerate.
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
            route — both pre-staged in research/12 §Next moves, playbook 19
            §Companion tool, and asset 20 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/creator_economy_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C creator-economy scorer that
              takes a brand's us_dtc_gmv + sku_count +
              sku_archetype_distribution + gross_margin_pct +
              has_aspire_or_collabstr_account + has_grin_or_creatoriq_account
              + has_creator_tier_mix_baseline + has_content_licensing_template
              + has_whitelisting_ads_template +
              has_triple_whale_creator_cohort_overlay + voice_profile +
              has_dedicated_creator_economy_manager_capacity_hours_per_week →
              outputs Path A (micro-creator-UGC-product-seeding-only $0/mo
              &lt;$500k GMV 6:1 ROI) / Path B (creator-mix-micro+mid+macro
              5-payout-structures + content-licensing + whitelisting DEFAULT
              $500-$3k/mo $500k-$5M GMV 8:1 default Year-1 ROI with $200k-$1M
              Path B incremental creator-economy-revenue at $2M US DTC base
              + 2-4× LTV-multiplier) / Path C (enterprise-creator-relationship-management
              $3k-$15k/mo $5M+ GMV 6:1 ROI muted by 6-12-month
              creator-economy-build-cycle + creator-churn-rate) recommendation
              with cost stack + expected Year-1 incremental
              creator-economy-revenue $200k-$1M Path B at $2M US DTC base +
              2-4× LTV-multiplier Path B + canonical 5-payout-creator-economy-structures
              matrix [Default 15/20/25% / Luxury 10/12/15% / Sustainable
              20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%] + 6
              deferral gates [sku_count {`<10`} / gross_margin_pct {`<25%`} /
              no-creator-discovery-platform-account /
              no-creator-tier-mix-baseline / no-content-licensing-template /
              no-whitelisting-ads-template] + 3 downgrade gates
              [luxury-voice-without-MAP-policy-guardrails /
              sustainable-voice-without-Smile-loyalty /
              Path-C-without-dedicated-creator-economy-manager] + 6-step
              build sequence. Pre-staged in research/12 §Next moves +
              playbook 19 §Companion tool + asset 20 §Related. Gated on
              the canonical 8 prereqs (Move #1 + #4 + #6 + #8 + #11 + #15
              + #15.x shipped + creator-discovery-platform-account +
              creator-tier-mix-baseline-audit + creator-content-budget-baseline
              ≥$500/mo + content-licensing-template-drafted-with-legal-counsel
              + whitelisting-ads-template-drafted-with-legal-counsel +
              FTC-compliance-disclosure-language-SOP per 16 CFR Part 255 +
              Triple-Whale-creator-cohort-overlay-Wire +
              creator-economy-attribution-platform-setup).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/creator-economy-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering creator-economy launch readiness (Path
              A/B/C tier indicator + creator-pool-baseline band +
              creator-economy-margin-headroom band) + per-platform
              readiness (5 canonical creator-discovery-platforms ×
              {`{live/draft/staging/not-started}`} status: Aspire +
              Collabstr + GRIN + CreatorIQ + Tagger) + per-path Year-1
              incremental creator-economy-revenue bar chart (Path A vs B vs
              C) + 4-phase gate status (Gate A
              creator-discovery-platform-onboarding + Gate B
              mid-tier-creator-onboarding + Gate C macro-creator-flagship-campaign
              + Gate D steady-state + creator-tier-promotion-SOP per playbook
              19 §Verification gates 10/10/10/9 prereqs) + per-creator-tier-mix
              overlay (60%-micro + 30%-mid-tier + 10%-macro per
              creator-tier-mix-baseline) + 5-payout-creator-economy-structures
              matrix [product-seeding-only + micro-CPS + mid-tier-CPS +
              macro-flat-fee + enterprise-hybrid] + creator-tier-promotion-SOP
              status [volume + cohort-LTV + content-quality + tenure] +
              content-licensing-renewal-cadence status +
              Triple-Whale-creator-cohort-LTV-overlay-sync + FTC-compliance-audit-cadence
              + creator-churn-rate-by-tier as a 1-click operator surface.
              Self-contained static HTML; mirrors the canonical 6-section + 4
              canonical data structures + 17-category Node smoke suite
              pattern from the marketplace / 3PL /
              international-expansion / lifecycle-flow /
              subscription-program / affiliate-program / b2b-wholesale /
              tiktok-shop-live-commerce static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}