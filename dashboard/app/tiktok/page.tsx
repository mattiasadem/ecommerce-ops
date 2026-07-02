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

export const metadata = { title: "TikTok Shop / Live-Commerce — Ecommerce Ops" };

export default function TikTokPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r11 = findDoc(research, /11-tiktok-shop-live-commerce\.md$/);
  const p18 = playbooks.find((p) => p.file === "18-tiktok-shop-live-launch.md");
  const a19 = assets.find((a) => a.file === "19-tiktok-shop-creator-briefs.md");

  // Pull canonical tables out of research/11
  const pillar2 = findTable(research, /Pillar 2.*Creator-affiliate/i);
  const pillar4 = findTable(research, /Pillar 4.*LIVE-shopping/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/11
  const topSections = r11?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r11?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          TikTok-Shop / live-commerce operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          TikTok Shop / Live-Commerce
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a TikTok Shop /
          live-commerce channel on a US-based Shopify DTC brand with at least
          10 SKUs + 25%+ TikTok-Shop-margin-headroom + 4-8 hr/wk operator
          capacity + Gen-Z / Millennial audience-skew. Three layers:{" "}
          <strong>research/11</strong> (5-pillar framework for the
          TikTok-Shop-Seller-Center + Shopify-TikTok-Channel +
          Klaviyo-TikTok-channel + Triple-Whale-TikTok-attribution +
          5-payout creator-affiliate-structures stack),{" "}
          <strong>playbook 18</strong> (4-phase Creator-affiliate-onboard →
          Shoppable-video-ads → LIVE-shopping-launch → Steady-state operator
          build), and <strong>asset 19</strong> (paste-ready 5-voice ×
          6-SKU-archetype = 30 voice-variant creator-briefs +
          5-segment LIVE-show-runner-script + 5-payout creator-contract +
          Shop-Score-4.8+-audit + 4 FTC-compliance-disclosure templates).
          This page surfaces all three in one place so you can stop
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
              $500k–$5M GMV, creator-affiliate + shoppable-video-ads +
              LIVE-shopping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">8.5:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4.5:1 conservative (Path A) / 6:1 muted (Path
              C)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental TikTok-Shop GMV
            </CardTitle>
            <CardDescription>
              Path B at $2M US DTC base · 20-50 active creator-affiliates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $500k–$1M
              <span className="text-base text-muted-foreground font-normal ml-1">
                TikTok-Shop GMV
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $500k-$1M Path B incremental TikTok-Shop-GMV / $24k-$58k
              annual cost stack = 8.5:1 default · Year-2+ ramp to 12-14:1
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 18 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (TikTok-Shop-Seller-Center + category-approval +
              first-50 creator-affiliates) → 2 (shoppable-video-ads +
              cohort-LTV-measurement) → 3 (LIVE-shopping-launch + 4-hour-week
              cadence + TikTok-Shop-affiliate-program) → 4 (steady-state +
              Shop-Score-4.8+ + LIVE-cadence-optimization)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 19 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 6 SKU archetypes · LIVE-show-runner-script +
              Shop-Score-audit + FTC-compliance
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
              Beauty + Fashion-Accessories + Home + Food-and-Beverage + Pet
              + Health · all 5 voices ≥15 (Default=31 / Luxury=32 /
              Sustainable=31 / Gen-Z=31 / B2B=28)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/11) === */}
      {r11 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/11)</CardTitle>
            <CardDescription>
              The headline thesis — why TikTok Shop / live-commerce is the
              canonical 5-20% incremental-GMV layer for $500k-$5M GMV brands
              with Gen-Z / Millennial audience-skew + Move #6 attribution
              live + Move #11 subscription cross-pollination
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
        <Card id="research-11">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-11
              </span>
              <CardTitle className="text-base">
                research/11-tiktok-shop-live-commerce
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/11-tiktok-shop-live-commerce.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 18 maps into a 4-phase
              TikTok-Shop launch ladder (Phase 1 TikTok-Shop-Seller-Center +
              category-approval + first-50 creator-affiliates ~12hr Path B
              baseline Weeks 1-2 · Phase 2 shoppable-video-ads-launch +
              Spark-Ads-boost 50-70%-of-budget + In-Feed-Ads-with-Product-Module
              + Triple-Whale-cohort-LTV-overlay ~16hr Weeks 3-6 · Phase 3
              LIVE-shopping-studio-build $500-$2k + 4-hour-week-LIVE-cadence +
              5-segment-LIVE-show-runner-script + TikTok-Shop-affiliate-program-launch
              ~24hr Weeks 7-12 · Phase 4 steady-state + Shop-Score-4.8+-audit +
              LIVE-cadence-optimization + Triple-Whale-cohort-LTV-iteration ~16hr
              Weeks 13-16 + 4-8 hr/wk ongoing) and asset 19 turns into 30
              paste-ready per-voice per-SKU-archetype creator-briefs. The
              five pillars below are the highest-traffic surfaces — the full
              doc ships Pillar 1 (TikTok-Shop-Seller-Center +
              category-approval-application with the canonical 10 permitted
              categories [Beauty / Fashion-Accessories / Home / Electronics /
              Food-and-Beverage / Pet / Baby / Health / Outdoor /
              Toys-and-Collectibles] + product-feed-optimization with the
              canonical TikTok-Shop-product-listing-optimization-checklist
              [100-char-title + 5-bullet-200-char-each + 9-image-grid +
              1-min-video + A+-content-equivalent]), Pillar 2
              (Creator-affiliate-onboarding via the canonical 4-channel pool
              [TikTok-Shop-Creator-Marketplace + Aspire + Collabstr +
              Instagram-hashtag-scrape] + the 5-payout creator-affiliate-structures
              [CPM $10-$30/1000-views / CPS 10-25%-of-GMV / flat-fee
              $200-$2k/creator/post / hybrid 5%-of-GMV + $200-base-fee /
              product-seeding-only $0 + free-product]), Pillar 3
              (Shoppable-video-ads with Spark-Ads-boost 50-70%-of-budget +
              In-Feed-Ads-with-Product-Module CVR 2-4× vs ads-without-Product-Module
              + Top-View-Ads), Pillar 4 (LIVE-shopping-launch with
              4-hour-week-cadence [1 LIVE-session-per-week
              60-90-minutes-per-session] + 5-segment-LIVE-show-runner-script-template
              [Segment 1 product-intro + Segment 2 demo + Segment 3 Q&A +
              Segment 4 creator-guest-takeover + Segment 5
              closing-limited-time-offer] + LIVE-shopping 5-15%
              conversion-rate vs 1-3% for in-feed shoppable-video-ads 3-5×
              higher CVR per NRF-2024 + Modern-Retail-2024 + Insider-Intelligence-2024
              benchmarks), and Pillar 5 (Triple-Whale-TikTok-attribution +
              cohort-LTV-iteration + Shop-Score-4.8+-audit-template
              [positive-review-rate ≥95% + ship-on-time-rate ≥95% +
              return-rate ≤5% + chat-response-rate ≥90% + chat-response-time
              ≤5-min; algorithmic-distribution-bonus for Shop-Score 4.8+
              brands = 30-50% higher organic-TikTok-Shop-distribution vs
              Shop-Score {`<4.5`}]).
            </p>
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — canonical 5-payout creator-affiliate-structures
                  + per-voice creator-brief templates
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar4 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 4 — 4-hour-week-LIVE-cadence + 5-segment-LIVE-show-runner-script
                  + LIVE-shopping-CVR benchmark
                </div>
                <ResearchTable rows={pillar4} />
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

        <Card id="playbook-18">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-18
              </span>
              <CardTitle className="text-base">
                playbook 18 — TikTok Shop / live-commerce launch (operator
                build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/18-tiktok-shop-live-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p18 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/11 section into a 4-phase TikTok-Shop
                  launch ladder with paste-ready TikTok-Shop-Seller-Center +
                  Shopify-TikTok-Channel + Klaviyo-TikTok-channel +
                  Triple-Whale-TikTok-cohort-overlay + LIVE-shopping-studio
                  multi-platform operator build. The 4 phases mirror the
                  canonical TikTok-Shop launch sequence (Phase 1:
                  TikTok-Shop-Seller-Center-onboarding +
                  category-approval-application +
                  Shop-Score-baseline-audit ≥4.0 + first-50
                  creator-affiliate-onboarding via the 4-channel pool +
                  TikTok-Shop-product-feed-optimization +
                  Klaviyo-TikTok-channel-integration +
                  Triple-Whale-TikTok-attribution-setup ~12hr Path B
                  baseline Weeks 1-2 · Phase 2: shoppable-video-ads-launch +
                  Spark-Ads-boost 50-70%-of-budget +
                  In-Feed-Ads-with-Product-Module + Top-View-Ads +
                  creator-affiliate-cohort-LTV-measurement with
                  Triple-Whale-TikTok-attribution-overlay ~16hr Weeks 3-6 ·
                  Phase 3: LIVE-shopping-studio-build $500-$2k +
                  4-hour-week-LIVE-cadence [1 LIVE-session-per-week
                  60-90-minutes-per-session] +
                  5-segment-LIVE-show-runner-script-template +
                  TikTok-Shop-affiliate-program-launch [20-30%-of-GMV
                  commission + 30-day-cookie-window per Move-#15-affiliate-program-Playbook-16
                  benchmarks] ~24hr Weeks 7-12 · Phase 4: steady-state +
                  Shop-Score-4.8+-audit-process + LIVE-cadence-optimization
                  + Triple-Whale-cohort-LTV-iteration-cycle-weekly +
                  4-trigger tier-promotion-SOP + FTC-disclosure-language-compliance-audit
                  per 16 CFR Part 255 ~16hr Weeks 13-16 + 4-8 hr/wk ongoing).
                  Each phase boundary is gated by an explicit verification
                  gate (Gate A through Gate D), and the full build surfaces
                  4 canonical verification gates with 10/10/10/9 prereqs
                  respectively = 39 prereqs total (Move #1 + #4 + #6 + #8 +
                  #11 shipped + TikTok-Business-Account +
                  category-approval-application + Shop-Score-baseline-audit
                  ≥4.0 + creator-affiliate-pool-baseline ≥20 +
                  LIVE-shopping-studio-build $500-$2k +
                  TikTok-Shop-product-feed-optimization +
                  Klaviyo-TikTok-channel-integration +
                  Triple-Whale-TikTok-attribution-setup).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p18.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/18 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-19">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-19
              </span>
              <CardTitle className="text-base">
                asset 19 — TikTok Shop creator briefs (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 30 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/19-tiktok-shop-creator-briefs.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a19 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-SKU-archetype creator-brief an
                  operator ships when launching a TikTok-Shop-Seller-Center +
                  Shopify-TikTok-Channel + Klaviyo-TikTok-channel +
                  Triple-Whale-TikTok-attribution creator-affiliate program.
                  5 voice profiles (Default / Luxury / Sustainable / Gen-Z /
                  B2B from assets/02-brand-voice.md) × 6 SKU archetypes
                  (Beauty / Fashion-Accessories / Home / Food-and-Beverage /
                  Pet / Health) = 30 voice-variant creator-briefs wired to
                  TikTok-Shop-Creator-Marketplace + Aspire + Collabstr +
                  Instagram-hashtag-scrape + the canonical 4-channel
                  creator-affiliate-pool-build. The 5-payout
                  creator-affiliate-structures [CPM $10-$30/1000-views / CPS
                  10-25%-of-GMV / flat-fee $200-$2k/creator/post / hybrid
                  5%-of-GMV + $200-base-fee / product-seeding-only $0 +
                  free-product per research/11 Pillar 2] gates the
                  creator-payout-contract + LIVE-shopping-show-runner-script
                  [Segment 1 product-intro + Segment 2 demo + Segment 3 Q&A +
                  Segment 4 creator-guest-takeover + Segment 5
                  closing-limited-time-offer]. Each voice-driven cell ships
                  creator-handle-criteria + creator-brief-tone +
                  creator-FTC-disclosure-language + Triple Whale
                  <code className="rounded bg-muted px-1 mx-1">
                    ?tw_camp=tt_&lt;sku_archetype&gt;_v&lt;voice_profile&gt;
                  </code>{" "}
                  UTM on every CTA + the canonical 4
                  FTC-compliance-disclosure-language templates
                  [paid-partnership + gifted-product + affiliate-link +
                  TikTok-Shop-affiliate-creator per 16 CFR Part 255 +
                  FTC-Endorsement-Guides 2024 + FDA-required-Health/Pet/Food
                  archetypes] + the canonical 5-segment
                  LIVE-show-runner-script-template + the canonical
                  TikTok-Shop-product-listing-optimization-checklist +
                  the canonical Shop-Score-4.8+-audit-template +
                  12 numbered pitfalls with corrective Fix lines clustered
                  into 6 failure modes [A creator-brief-quality + B
                  creator-voice-match + C creator-FTC-disclosure + D
                  LIVE-show-runner-script-cadence + E
                  creator-payout-contract-quality + F
                  FDA-required-Health/Pet/Food archetype disclosure].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a19.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a19.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/19 not found in content.json — regenerate.
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
            route — both pre-staged in research/11 §Next moves, playbook 18
            §Companion tool, and asset 19 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/tiktok_shop_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C TikTok-Shop scorer that
              takes a brand's us_dtc_gmv + sku_count +
              sku_archetype_distribution + gross_margin_pct +
              has_tiktok_business_account + has_tiktok_shop_seller_center +
              has_shopify_tiktok_channel + has_klaviyo_tiktok_channel +
              has_triple_whale_tiktok_attribution +
              creator_affiliate_pool_size + voice_profile +
              has_live_shopping_studio_capacity_hours_per_week → outputs
              Path A (creator-affiliate-only + shoppable-video-ads only
              $0/mo &lt;$500k GMV 4.5:1 ROI) / Path B (creator-affiliate +
              shoppable-video-ads + LIVE-shopping 4-hour-week $0-$2k/mo
              $500k-$5M GMV 8.5:1 ROI) / Path C (full TikTok-Shop-orchestration
              including creator-affiliate-program + shoppable-video-ads +
              LIVE-shopping-daily-cadence + TikTok-Shop-affiliate-program +
              Klaviyo-TikTok-channel-integration +
              Triple-Whale-TikTok-cohort-overlay $2k-$10k/mo $5M+ GMV 6:1
              ROI) recommendation with cost stack + expected Year-1
              incremental TikTok-Shop GMV $500k-$1M Path B at $2M US DTC
              base + 6-step build sequence. Pre-staged in research/11 §Next
              moves + playbook 18 §Next moves + asset 19 §Related. Gated
              on the canonical 8 prereqs (Move #1 + #4 + #6 + #8 + #11
              shipped + TikTok-Business-Account +
              category-approval-application + Shop-Score-baseline-audit
              ≥4.0 + creator-affiliate-pool-baseline ≥20 +
              LIVE-shopping-studio-build $500-$2k +
              TikTok-Shop-product-feed-optimization +
              Klaviyo-TikTok-channel-integration +
              Triple-Whale-TikTok-attribution-setup).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/tiktok-shop-live-commerce-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering TikTok-Shop-launch readiness (Path A/B/C
              tier indicator + monthly-GMV band + creator-affiliate-pool-size
              band) + per-platform readiness (5 canonical
              TikTok-Shop-platforms × {`{live/draft/staging/not-started}`}
              status: TikTok-Shop-Seller-Center + Shopify-TikTok-Channel +
              Klaviyo-TikTok-channel + Triple-Whale-TikTok-attribution +
              LIVE-shopping-studio) + per-path Year-1 incremental
              TikTok-Shop-GMV bar chart (Path A vs B vs C) + 4-phase gate
              status (Gate A TikTok-Shop-Seller-Center-onboarding + Gate B
              shoppable-video-ads + Gate C LIVE-shopping-launch + Gate D
              steady-state + Shop-Score-4.8+ per playbook 18 §Verification
              gates 10/10/10/9 prereqs) + per-creator-affiliate-tier overlay
              (CPM / CPS / flat-fee / hybrid / product-seeding-only) +
              LIVE-cadence-GMV-per-hour-LIVE + Shop-Score-baseline +
              FTC-compliance-audit-cadence as a 1-click operator surface.
              Self-contained static HTML; mirrors the canonical 6-section + 4
              canonical data structures + 17-category Node smoke suite pattern
              from the marketplace / 3PL / international-expansion /
              lifecycle-flow / subscription-program / affiliate-program /
              b2b-wholesale static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}