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

export const metadata = { title: "Pinterest SEO Discovery — Ecommerce Ops" };

export default function PinterestSeoPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r13 = findDoc(
    research,
    /13-pinterest-organic-discovery-seo-content-engine\.md$/,
  );
  const p20 = playbooks.find((p) => p.file === "20-pinterest-seo-launch.md");
  const a21 = assets.find(
    (a) => a.file === "21-pinterest-seo-templates.md",
  );

  // Pull canonical tables out of research/13
  const pillar2 = findTable(
    research,
    /Pillar 2.*SEO-content-cluster/i,
  );
  const pillar3 = findTable(
    research,
    /Pillar 3.*Pinterest-vertical/i,
  );
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/13
  const topSections = r13?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r13?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Pinterest-organic-discovery + SEO-content-engine operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Pinterest Organic Discovery + SEO Content Engine
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a Pinterest-organic +
          SEO-content-engine channel on a US-based Shopify DTC brand with
          photography-rich-product-set ≥5-photos-per-product + ≥15-SKUs +
          25%+ Pinterest-SEO-margin-headroom + 4-8 hr/wk
          content-operator-capacity + Move #1 + #4 + #6 + #8 + #11 + #15 +
          #15.x + #16 live. Three layers: <strong>research/13</strong> (the
          5-pillar framework for the
          Pinterest-Business-Account + Shopify-SEO + Surfer-SEO +
          Ahrefs-Content-Gap + Originality.ai + MarketMuse-topical-authority +
          Klaviyo-organic-source-segment + Triple-Whale-organic-source-LTV
          layer), <strong>playbook 20</strong> (the 4-phase
          Pinterest-Business-Account-onboarding →
          SEO-baseline + first-content-cluster + first-30-SEO-cluster-articles
          → Pinterest-organic + SEO-scale → Triple-Whale-organic-LTV-iteration
          + AI-content-detection-validation + Pinterest-Catalog-ads-paid-amplifier
          → steady-state + Topical-Authority-≥80 + 12-24-month
          compounding-traffic-curve operator build), and{" "}
          <strong>asset 21</strong> (the paste-ready 11 artifacts — 5 voices
          × 6 SKU archetypes = 30 voice-variant Pinterest-Idea-Pin templates +
          30 voice-variant SEO-content-article templates + Pinterest-vertical-board-organization-pattern
          + SEO-content-cluster-architecture-template +
          AI-content-detection-validation-SOP +
          helpful-content-update-compliance-checklist + SEO-rank-tracking-template
          + Pinterest-Catalog-ads-optimization-recipe + 4-trigger
          Pinterest-tier-promotion-SOP + 90-day SEO-refresh-cadence +
          monthly-cohort-LTV-iteration-template). This page surfaces all
          three in one place so you can stop tab-switching between{" "}
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
              $500k–$5M GMV, Pinterest + SEO-content-cluster +
              Triple-Whale-organic-LTV-iteration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">6:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 5:1 conservative (Path A) / 4:1 muted (Path C
              full-orchestration)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental Pinterest-SEO traffic
            </CardTitle>
            <CardDescription>
              Path B at $2M US DTC base · 4-8 hr/wk content-operator capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $200k–$1M
              <span className="text-base text-muted-foreground font-normal ml-1">
                incremental traffic contribution
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $200k-$1M Path B Year-1 incremental Pinterest-SEO-traffic /
              $3,600-$12,000 annual cost stack = 6:1 default · 0.6-0.85× CAC
              vs paid-social · Year-2+ ramp to 12-50:1 compounding-traffic-curve
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 20 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (Pinterest-Business-Account-onboarding + Shopify-SEO-baseline
              + first-SEO-content-cluster + first-20-Idea-Pins + first-30-SEO-cluster-articles)
              → 2 (SEO-5-cluster-topical-authority + Pinterest-vertical-pillar-set
              + Triple-Whale-organic-LTV-overlay) → 3 (Triple-Whale-organic-LTV-iteration
              + AI-content-detection-validation + Pinterest-Catalog-ads-paid-amplifier
              + helpful-content-update-compliance-audit) → 4 (steady-state +
              Topical-Authority-≥80 + Pinterest-Catalog-ads-paid-amplifier-steady-state
              + 12-24-month compounding-traffic-curve)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 21 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 6 SKU archetypes · Pinterest-Idea-Pin + SEO-content-article
              templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              60
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Beauty + Fashion-Accessories + Home + Food-and-Beverage + Pet
              + Health · 30 Pinterest-Idea-Pin + 30 SEO-content-article ·
              all 5 voices ≥15 (Default=32 / Luxury=31 / Sustainable=74 /
              Gen-Z=86 / B2B=74)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/13) === */}
      {r13 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/13)</CardTitle>
            <CardDescription>
              The headline thesis — why Pinterest-organic-discovery +
              SEO-content-engine is the canonical 5-15% Year-1 incremental
              traffic + 0.6-0.85× CAC vs paid-social layer for $500k+ GMV
              photography-rich brands with ≥15-SKUs + 4-8 hr/wk
              content-operator-capacity + Move #6 Triple-Whale attribution
              live
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
        <Card id="research-13">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-13
              </span>
              <CardTitle className="text-base">
                research/13-pinterest-organic-discovery-seo-content-engine
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/13-pinterest-organic-discovery-seo-content-engine.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 20 maps into a 4-phase
              Pinterest-SEO launch ladder (Phase 1
              Pinterest-Business-Account-onboarding + Shopify-SEO-baseline-audit +
              first-SEO-content-cluster + first-20-Idea-Pins + first-30-SEO-cluster-articles
              ~16hr Path B baseline Weeks 1-4 · Phase 2
              SEO-5-cluster-topical-authority + Pinterest-vertical-pillar-set +
              Triple-Whale-organic-LTV-overlay + Klaviyo-organic-source-segment
              ~24hr Weeks 5-16 · Phase 3 Triple-Whale-organic-LTV-iteration
              + AI-content-detection-validation +
              Pinterest-Catalog-ads-paid-amplifier-5%-of-budget +
              helpful-content-update-compliance-audit + SEO-link-building-machine
              ~32hr Weeks 17-36 · Phase 4 steady-state +
              Topical-Authority-≥80 + Pinterest-Catalog-ads-paid-amplifier-steady-state
              + Triple-Whale-organic-LTV-iteration-cycle-quarterly +
              12-24-month compounding-traffic-curve ~24hr Weeks 37-72 + 4-8
              hr/wk ongoing + dedicated-organic-content-team in Year-2+) and
              asset 21 turns into 60 paste-ready per-voice per-SKU-archetype
              Pinterest-Idea-Pin + SEO-content-article templates. The five
              pillars below are the highest-traffic surfaces — the full doc
              ships Pillar 1 (Pinterest-Business-Account + Catalogs-feed-upload
              + Idea-Pin-creation + Pinterest-Analytics with the canonical
              Pinterest-2024-Predict-the-Year vertical-keyword-spike
              benchmarks [Beauty + Wellness + Travel + Fashion + Home-Decor +
              Food + Parenting 30-50% YoY] + the canonical
              Shopify-product-feed-Catalogs-upload-recipe + Pinterest-tag-strategy
              per Pinterest-2024 + Pin-direction-per-month-per-vertical
              [Beauty 15-30 / Wellness 15-30 / Travel 30-60 / Fashion 15-30 /
              Home-Decor 15-30 / Food 15-30 / Parenting 15-30] + monthly-content-cadence),
              Pillar 2 (SEO-content-cluster-architecture + Surfer-SEO-content-optimization
              + Ahrefs-Content-Gap with the canonical 1-pillar-page +
              8-cluster-articles + 4-trigger-cross-link-architecture per
              MarketMuse-2024 + Backlinko-2024 + 5-cluster-topical-authority
              build [5 Pillar-pages + 40-cluster-articles per Pillar =
              200-articles across 5 topical-clusters covering the brand's
              full keyword-space] + Topical-Authority-score-target-≥80 +
              content-quality-score-target-≥70 + content-density-target-≥5-keywords-per-cluster
              + internal-link-density-target-3-internal-links-per-article per
              MarketMuse-2024 + Surfer-SEO-2024 + Ahrefs-2024 + Backlinko-2024
              benchmarks), Pillar 3 (Pinterest-vertical-pillar-set +
              Pinterest-Idea-Pin-cadence + Pinterest-Catalogs-feed-optimization
              with the canonical 10-vertical-pillars × 10-product-Idea-Pins-per-pillar
              × 5-content-Idea-Pins-per-pillar = 150-Idea-Pins total covering
              brand's vertical-keyword-space + 30-boards-organized-by-vertical-pillar
              + 3-5× Pinterest-click-rate vs single-board-dumping-strategy
              per Pinterest-2024 + SEMrush-2024 + Ahrefs-2024 benchmarks),
              Pillar 4 (Triple-Whale-organic-cohort-LTV-iteration +
              Originality.ai-AI-content-detection +
              helpful-content-update-compliance-audit with the canonical
              Pinterest-organic-driven-cohort-LTV + SEO-organic-driven-cohort-LTV
              vs paid-Meta-cohort-LTV vs paid-Google-cohort-LTV at
              30/60/90/180-day windows + 5-way-comparison-cycle +
              Originality.ai-AI-content-detection-30-day-validation-cycle
              with AI-content-score-target-&lt;50%-per-page per Originality.ai-2024
              + Google-March-2024-core-update + June-2024-spam-brain-update
              benchmarks + canonical helpful-content-update-compliance-checklist
              per Google-2024 + Search-Engine-Roundtable-2024 benchmarks),
              and Pillar 5 (Pinterest-Catalog-ads-paid-amplifier +
              link-building-machine + 12-24-month compounding-traffic-curve
              steady-state with the canonical 6 Pinterest-Catalog-ads-tips
              [keyword-density + vertical-pillar-set-fit + creative-asset-cadence
              + ROAS-bid-strategy + Catalog-ads-feed-optimization +
              Catalog-ads-organic-amplifier-30-50%-incremental-organic-conversion-rate]
              + canonical 4-trigger Pinterest-tier-promotion-SOP +
              12-24-month-compounding-traffic-curve steady-state per
              Pinterest-2024 + SEMrush-2024 + Ahrefs-2024 +
              Triple-Whale-2024 benchmarks).
            </p>
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — canonical SEO-content-cluster-architecture +
                  Surfer-SEO-content-optimization + Ahrefs-Content-Gap
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar3 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 3 — Pinterest-vertical-pillar-set +
                  Pinterest-Idea-Pin-cadence +
                  Pinterest-Catalogs-feed-optimization
                </div>
                <ResearchTable rows={pillar3} />
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

        <Card id="playbook-20">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-20
              </span>
              <CardTitle className="text-base">
                playbook 20 — Pinterest-SEO launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/20-pinterest-seo-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p20 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/13 section into a 4-phase Pinterest-SEO
                  launch ladder with paste-ready
                  Pinterest-Business-Account + Shopify-SEO +
                  Surfer-SEO-content-optimization + Ahrefs-Content-Gap +
                  Originality.ai-AI-content-detection +
                  MarketMuse-topical-authority +
                  Klaviyo-organic-source-segment +
                  Triple-Whale-organic-source-LTV-overlay +
                  Pinterest-Catalog-ads-paid-amplifier +
                  12-24-month-compounding-traffic-curve operator build. The
                  4 phases mirror the canonical Pinterest-SEO launch
                  sequence (Phase 1: Pinterest-Business-Account-onboarding
                  + Shopify-SEO-baseline-audit + first-SEO-content-cluster +
                  first-20-Idea-Pins + first-30-SEO-cluster-articles +
                  Surfer-SEO-Lite-onboarding + Originality.ai-Starter-onboarding
                  + Triple-Whale-organic-source-segment-Wire ~16hr Path B
                  baseline Weeks 1-4 · Phase 2:
                  SEO-5-cluster-topical-authority-build +
                  Pinterest-vertical-pillar-set +
                  Triple-Whale-organic-LTV-overlay +
                  Klaviyo-organic-source-segment-build + first-100-Idea-Pins
                  ~24hr Weeks 5-16 · Phase 3:
                  Triple-Whale-organic-LTV-iteration-cycle-weekly +
                  AI-content-detection-validation +
                  Pinterest-Catalog-ads-paid-amplifier-5%-of-budget +
                  helpful-content-update-compliance-audit +
                  SEO-link-building-machine + 5-way-comparison-cycle ~32hr
                  Weeks 17-36 · Phase 4: steady-state +
                  Topical-Authority-≥80-audit +
                  Pinterest-Catalog-ads-paid-amplifier-steady-state +
                  Triple-Whale-organic-LTV-iteration-cycle-quarterly +
                  12-24-month-compounding-traffic-curve-validation ~24hr
                  Weeks 37-72 + 4-8 hr/wk ongoing + dedicated-organic-content-team
                  in Year-2+). Each phase boundary is gated by an explicit
                  verification gate (Gate A through Gate D), and the full
                  build surfaces 4 canonical verification gates with
                  10/10/10/9 prereqs respectively = 39 prereqs total
                  (Pinterest-Business-Account + Shopify-SEO-app +
                  Surfer-SEO-Lite-Pro-Business-subscription + Ahrefs-Content-Gap-Starter-Pro-Advanced
                  + Originality.ai-Starter-Pro-Enterprise + MarketMuse-free-tier-Starter-Enterprise
                  + Klaviyo-Email-and-SMS-Standard + Triple-Whale-organic-LTV-overlay-wire
                  + photography-rich-product-set + ≥15-SKUs + 25%+
                  Pinterest-SEO-margin-headroom + 4-8 hr/wk
                  content-operator-capacity).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p20.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/20 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-21">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-21
              </span>
              <CardTitle className="text-base">
                asset 21 — Pinterest-SEO templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 60 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/21-pinterest-seo-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a21 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-SKU-archetype
                  Pinterest-Idea-Pin + SEO-content-article templates an
                  operator ships when launching a Pinterest-Business-Account
                  + Shopify-SEO + Surfer-SEO + Ahrefs-Content-Gap +
                  Originality.ai + MarketMuse-topical-authority +
                  Klaviyo-organic-source-segment +
                  Triple-Whale-organic-source-LTV-overlay
                  Pinterest-organic-discovery + SEO-content-engine channel.
                  5 voice profiles (Default / Luxury / Sustainable / Gen-Z /
                  B2B from assets/02-brand-voice.md) × 6 SKU archetypes
                  (Beauty / Fashion-Accessories / Home / Food-and-Beverage /
                  Pet / Health) = 30 voice-variant Pinterest-Idea-Pin
                  templates + 30 voice-variant SEO-content-article templates
                  wired to Pinterest-Business-Account + Catalogs-feed-upload
                  + Shopify-SEO + Surfer-SEO + Ahrefs-Content-Gap + the
                  canonical 5-path Pinterest-SEO-launch-mode decision
                  matrix. The 5-pillar-Pinterest-vertical-content-pillar-set
                  gates the Pinterest-vertical-board-organization-pattern =
                  30 boards (5 voices × 6 SKU archetypes) with board-name +
                  board-description + board-keywords + board-content-cadence
                  + the canonical SEO-content-cluster-architecture-template
                  = 1-pillar-page + 8-cluster-articles +
                  4-trigger-cross-link-architecture per MarketMuse-2024 +
                  Backlinko-2024 benchmarks. Each voice-driven cell ships
                  pin-title-slot + pin-description-slot + pin-board-slot +
                  pin-destination-link-slot + pin-image-prompt-slot +
                  pin-keyword-tags-slot + per-voice-override of
                  pin-tone-of-voice + pin-call-to-action + pin-keyword-tag-density
                  + article-title-slot + article-meta-description-slot +
                  article-h1-slot + article-introduction-slot +
                  article-h2-section-headers-x-5 + article-faq-section-x-3-questions
                  + article-conclusion-slot + article-internal-links-slot +
                  per-voice-override of article-tone-of-voice +
                  article-call-to-action + article-keyword-density + the
                  canonical AI-content-detection-validation-SOP +
                  helpful-content-update-compliance-checklist +
                  SEO-rank-tracking-template + Pinterest-Catalog-ads-optimization-recipe
                  + 4-trigger Pinterest-tier-promotion-SOP + 90-day
                  SEO-refresh-cadence + monthly-cohort-LTV-iteration-template
                  + 12 numbered pitfalls with corrective Fix lines clustered
                  into 6 failure modes [A platform-onboarding / B
                  content-architecture / C Pinterest-vertical-pillar / D
                  measurement-compliance-iteration / E
                  amplification-steady-state / F operational cross-cutting].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a21.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a21.voiceCounts).map(([voice, count]) => (
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
                asset/21 not found in content.json — regenerate.
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
            route — both pre-staged in research/13 §Next moves, playbook 20
            §Companion tool, and asset 21 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/pinterest_seo_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C Pinterest-SEO scorer that
              takes a brand&apos;s us_dtc_gmv + sku_count +
              sku_archetype_distribution + gross_margin_pct +
              has_pinterest_business_account + has_shopify_seo_app +
              has_surfer_seo_subscription + has_ahrefs_content_gap +
              has_originality_ai_subscription + has_marketmuse_topical_authority
              + voice_profile +
              has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week
              → outputs Path A (Pinterest-only + SEO-baseline-shopify-free
              $50/mo &lt;$500k GMV 5:1 ROI) / Path B (Pinterest +
              SEO-content-cluster + Triple-Whale-organic-LTV-iteration
              DEFAULT $200-$1k/mo $500k-$5M GMV 6:1 default Year-1 ROI with
              5-15% incremental traffic contribution + 0.6-0.85× CAC vs
              paid-social + 12-24-month compounding-traffic-curve at $2M US
              DTC base) / Path C (full-Pinterest-SEO-orchestration +
              AI-content-validated + backlinks +
              Pinterest-Catalog-ads-as-paid-amplifier $1k-$5k/mo $5M+ GMV
              4:1 ROI muted by 6-12-month SEO-compounding-curve +
              Triple-Whale-organic-LTV-build-cycle) recommendation with
              cost stack + expected Year-1 incremental Pinterest-SEO-traffic
              $200k-$1M Path B at $500k-$5M US DTC base + 0.6-0.85× CAC vs
              paid-social + 12-24-month compounding-traffic-curve
              steady-state + canonical 5-path Pinterest-SEO-launch-mode
              decision matrix + canonical
              5-pillar-Pinterest-vertical-content-pillar-set + 6 deferral
              gates [sku_count &lt;10 / gross_margin_pct &lt;25% /
              no-Pinterest-business-account / no-Shopify-SEO-app /
              no-content-operator-capacity / no-photography-rich-product-set]
              + 3 downgrade gates [luxury-voice-without-organic-disclosure-consistency
              / B2B-voice-without-B2B-keyword-cluster /
              Path-C-without-dedicated-organic-content-team]. Pre-staged in
              research/13 §Next moves + playbook 20 §Next moves + asset 21
              §Related. Gated on the canonical 8 prereqs (Pinterest-Business-Account
              + Shopify-SEO-app + Surfer-SEO-Pro-Business-subscription +
              Ahrefs-Content-Gap-Starter-Pro-Advanced + Originality.ai-Starter-Pro-Enterprise
              + MarketMuse-Starter-Enterprise + Klaviyo-Email-and-SMS-Standard
              + Triple-Whale-organic-LTV-overlay-wire + photography-rich-product-set
              + ≥15-SKUs + 25%+ Pinterest-SEO-margin-headroom + 4-8 hr/wk
              content-operator-capacity).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/pinterest-seo-discovery-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering Pinterest-SEO-launch readiness (Path
              A/B/C tier indicator + monthly-GMV band + content-operator-capacity
              band) + per-platform readiness (6 canonical
              Pinterest-SEO-platforms × {`{live/draft/staging/not-started}`}
              status: Pinterest-Business-Account + Shopify-SEO-app +
              Surfer-SEO + Ahrefs-Content-Gap + Originality.ai +
              Triple-Whale-organic-LTV-overlay) + per-path Year-1
              incremental Pinterest-SEO-traffic bar chart (Path A vs B vs
              C) + 4-phase gate status (Gate A
              Pinterest-Business-Account-onboarding + Gate B
              SEO-5-cluster-topical-authority + Gate C
              Triple-Whale-organic-LTV-iteration + Gate D steady-state +
              Topical-Authority-≥80 per playbook 20 §Verification gates
              10/10/10/9 prereqs) + 5-pillar-coverage-progress-bar +
              monthly-cohort-LTV-iteration-template + AI-content-detection-validation
              + 12-24-month-compounding-traffic-curve-validation as a 1-click
              operator surface. Self-contained static HTML; mirrors the
              canonical 6-section + 4 canonical data structures +
              17-category Node smoke suite pattern from the marketplace /
              3PL / international-expansion / lifecycle-flow /
              subscription-program / affiliate-program / b2b-wholesale /
              tiktok-shop-live-commerce / creator-economy static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}