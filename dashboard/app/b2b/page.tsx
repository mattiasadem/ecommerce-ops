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

export const metadata = { title: "B2B / Wholesale Channel — Ecommerce Ops" };

export default function B2BPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r10 = findDoc(research, /10-b2b-wholesale\.md$/);
  const p17 = playbooks.find((p) => p.file === "17-b2b-wholesale-launch.md");
  const a18 = assets.find((a) => a.file === "18-b2b-wholesale-kits.md");

  // Pull canonical tables out of research/10
  const pillar1 = findTable(research, /Pillar 1.*B2B-channel selection/i);
  const pillar2 = findTable(research, /Pillar 2.*Wholesale economics/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/10
  const topSections = r10?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r10?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          B2B / wholesale-channel operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          B2B / Wholesale Channel
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a B2B / wholesale
          channel on a US-based Shopify DTC brand with Move #1 + #4 + #6 + #8
          live + 10+ SKUs + 25%+ wholesale-discount margin headroom. Three
          layers:{" "}
          <strong>research/10</strong> (5-pillar framework for the Faire +
          Tundra + Ankorstore + Handshake + Shopify B2B + Amazon Business +
          RSP/KeHE/UNFI B2B-orchestration stack), <strong>playbook 17</strong>{" "}
          (4-phase Marketplace-onboard → Direct-buyer-pipeline →
          Distributor-pitch → Steady-state operator build), and{" "}
          <strong>asset 18</strong> (paste-ready 4-marketplaces × 5-voices ×
          6-SKU-archetypes = 120 voice-variant wholesale listings + RFQ brief
          template + NET-30 terms-card + MAP-policy page + 5-clause wholesale
          distribution agreement + corporate-gifting catalog). This page
          surfaces all three in one place so you can stop tab-switching
          between{" "}
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
              $500k–$5M GMV, Faire + Tundra + Ankorstore + Handshake + Shopify B2B
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">8.5:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4.5:1 conservative (Path A) / 6:1 muted (Path C)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-1 incremental revenue</CardTitle>
            <CardDescription>
              Path B at $2M US DTC base · 25-100 retailer accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $1M–$5M
              <span className="text-base text-muted-foreground font-normal ml-1">
                B2B revenue
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $1M-$5M Path B incremental B2B revenue / $24,588 annual cost =
              8.5:1 default · 12-14:1 Year-2+ steady-state
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 17 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (wholesale-pricing + marketplace-storefront) → 2
              (direct-buyer-pipeline + corporate-gifting) → 3 (distributor-pitch
              + Amazon Business + MAP-policy) → 4 (steady-state +
              reorder-automation + trade-shows)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 18 voice-listings</CardTitle>
            <CardDescription>
              4 marketplaces × 5 voices × 6 SKU archetypes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              120
              <span className="text-base text-muted-foreground font-normal ml-1">
                listings
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              120 voice-variant wholesale listings · all 5 voices ≥15
              (Default=41 / Luxury=35 / Sustainable=34 / Gen-Z=34 / B2B=96)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/10) === */}
      {r10 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/10)</CardTitle>
            <CardDescription>
              The headline thesis — why B2B / wholesale is the canonical
              second-largest revenue source for the median DTC brand over $2M
              GMV, per Faire 2024 + Ankorstore 2024 + Shopify B2B 2024 + RSP
              2024 + KeHE 2024 + UNFI 2024 benchmarks
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
        <Card id="research-10">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-10
              </span>
              <CardTitle className="text-base">
                research/10-b2b-wholesale
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/10-b2b-wholesale.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 17 maps into a 4-phase
              B2B / wholesale launch ladder (Phase 1 wholesale-pricing +
              marketplace-storefront + 8-prereq distributor-onboarding-pack +
              sample-pack-fulfillment ~8hr Path B baseline Weeks 1-3 · Phase
              2 direct-buyer-pipeline + corporate-gifting +
              5-clause-distribution-agreement + Handshake-auto-sync +
              Klaviyo-B2B-tier-reorder-cadence ~12hr Weeks 4-8 · Phase 3
              distributor-pitch + Amazon Business + MAP-policy +
              geographic-exclusivity + ARPU-cannibalization-monitoring
              ~16hr Weeks 9-16 · Phase 4 steady-state + reorder-automation +
              TradeGala + 1-2 in-person-trade-shows + 60-80%
              reorder-rate-validated ~10hr Weeks 17-24 + 4-8 hr/wk ongoing)
              and asset 18 turns into 120 paste-ready per-marketplace per-voice
              per-SKU wholesale listings. The five pillars below are the
              highest-traffic surfaces — the full doc ships Pillar 1
              (B2B-channel-selection & platform-mix with canonical 7-platform
              B2B-tool-decision-matrix [Faire 25%/15% commission + Tundra 0%
              commission + Ankorstore 8-15% commission + Handshake 0%
              commission + Shopify B2B $149-$349/mo + Amazon Business
              $39.99/mo + RSP/KeHE/UNFI direct-distributor 5-15%
              retail-broker-fees]), Pillar 2 (Wholesale-economics &
              channel-economics-math with canonical 5-corners framework
              [wholesale-attach-rate 55-75% Year-1 / wholesale-ARPU 0.65-0.80×
              DTC-ARPU median / wholesale-channel-cannibalization 10-25%
              MAP-protected vs 35-50% unprotected / wholesale-payment-terms
              4-7% NET-30 vs 0% pre-pay-with-5%-discount] + 6-tier
              wholesale-discount matrix [35% off MSRP luxury / 40% off
              sustainable / 45% off standard premium / 50% off canonical /
              55% off high-volume / 60% off distributor-tier]), Pillar 3
              (B2B-portal-automation + reorder-cycle with Handshake-auto-sync
              + 4-cadence-Klaviyo-B2B-tier-flow + TradeGala-virtual-trade-show
              + 1 in-person-trade-show per Year-1), Pillar 4 (MAP-policy +
              DTC-cannibalization-defense with canonical 5 levers
              [MAP-policy-page with 3-strike-enforcement per
              Sherman-Antitrust-Act-RPM-policy-per-se-exemption /
              geographic-exclusivity state-level top-20 + city-level top-5 /
              channel-exclusivity-tier / Shopify-B2B-Handshake
              geographic-exclusion / MAP-policy-enforcement-tooling]), and
              Pillar 5 (Wholesale-fulfillment + 3PL/distributor handoff with
              canonical 8-prereq distributor-onboarding-pack [registration-cert
              + EIN-letter + resale-certificate + product-insurance $1M GL +
              $1M product-liability + warehouse-safety-cert +
              UPC-barcode-GS1 + casepack-spec + HazMat-cert] + ShipBob B2B +
              ShipMonk B2B + Extensiv B2B 3PL-fulfillment + RSP/KeHE/UNFI
              direct-distributor).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — canonical 7-platform B2B-tool decision matrix
                  (Faire + Tundra + Ankorstore + Handshake + Shopify B2B +
                  Amazon Business + RSP/KeHE/UNFI)
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — 6-tier wholesale-discount matrix +
                  wholesale-attach-rate + wholesale-ARPU-vs-DTC-ARPU
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($2M US DTC GMV, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-17">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-17
              </span>
              <CardTitle className="text-base">
                playbook 17 — B2B / wholesale launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/17-b2b-wholesale-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p17 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/10 section into a 4-phase B2B / wholesale
                  launch ladder with paste-ready Faire + Tundra + Ankorstore +
                  Handshake + Shopify B2B + Amazon Business + RSP/KeHE/UNFI
                  + TradeGala + NetSuite Wholesale + EDI-832/850 wiring.
                  The 4 phases mirror the canonical B2B / wholesale-launch
                  sequence (Phase 1: wholesale-pricing + marketplace-storefront
                  + 8-prereq distributor-onboarding-pack + sample-pack
                  fulfillment, ~8hr Path B baseline Weeks 1-3 · Phase 2:
                  direct-buyer-pipeline + corporate-gifting catalog +
                  5-clause wholesale distribution agreement +
                  Handshake-auto-sync + Klaviyo-B2B-tier
                  reorder-cadence, ~12hr Weeks 4-8 · Phase 3: distributor-pitch
                  + Amazon Business + MAP-policy-page + geographic-exclusivity
                  + ARPU-cannibalization-monitoring, ~16hr Weeks 9-16 ·
                  Phase 4: steady-state + reorder-automation + TradeGala +
                  1-2 in-person-trade-shows + 60-80% reorder-rate-validated,
                  ~10hr Weeks 17-24 + 4-8 hr/wk ongoing). Each phase
                  boundary is gated by an explicit verification gate (Gate A
                  through Gate D), and the full build surfaces 4 canonical
                  verification gates with 10/10/10/9 prereqs respectively = 39
                  prereqs total (Move #1 + #4 + #6 + #8 + 10+ SKUs + 25%+
                  wholesale-discount margin headroom + 4-10 hr/wk operator
                  time + 8-prereq distributor-onboarding-pack +
                  corporate-gifting-catalog-ready + Faire/Tundra marketplace
                  accounts + Shopify B2B tier).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p17.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/17 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-18">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-18
              </span>
              <CardTitle className="text-base">
                asset 18 — B2B / wholesale kits (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 120 listings
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/18-b2b-wholesale-kits.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a18 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-marketplace per-voice per-SKU B2B /
                  wholesale copy an operator ships when launching a Faire (or
                  Tundra / Ankorstore / Handshake / Shopify B2B) B2B /
                  wholesale program. 4 marketplaces (Faire + Tundra +
                  Ankorstore + Handshake) × 5 voice profiles (Default /
                  Luxury / Sustainable / Gen-Z / B2B) × 6 SKU archetypes
                  (Consumables + Apparel + Home + Beauty + Specialty-food +
                  Pet-supplies) = 120 voice-variant wholesale listings wired
                  to Klaviyo + Triple Whale + Faire + Tundra + Ankorstore +
                  Handshake. The 5-voice commission-tier matrix (Default /
                  Luxury / Sustainable / Gen-Z / B2B per research/10 Pillar 2)
                  gates the per-voice MAP-policy + geographic-exclusivity
                  overrides + per-voice wholesale-discount tier
                  recommendations. Each voice-driven listing ships Klaviyo
                  conditional-content syntax + Triple Whale{" "}
                  <code className="rounded bg-muted px-1 mx-1">
                    ?tw_camp=b2b_wholesale_&lt;flow_id&gt;_v&lt;voice_profile&gt;
                  </code>{" "}
                  UTM on every CTA + paste-ready canonical 5 templates [8-prereq
                  RFQ brief + NET-30 terms-card + MAP-policy-page + 5-clause
                  wholesale-distribution-agreement + corporate-gifting
                  catalog] + per-channel MOQ + casepack matrix + 12 numbered
                  pitfalls with corrective Fix lines clustered into 5 failure
                  modes [A platform-selection / B pricing-payment-terms / C
                  cannibalization-defense / D reorder-automation / E
                  distributor-pitch].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a18.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a18.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/18 not found in content.json — regenerate.
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
            route — both pre-staged in research/10 §Next moves, playbook 17
            §Companion tool, and asset 18 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/b2b_wholesale_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C B2B / wholesale scorer that
              takes a brand's us_dtc_gmv + sku_count + wholesale_margin_headroom
              + has_uspto_trademark + has_handshake +
              has_amazon_business_cert + distributor_capacity_hours_per_week +
              voice_profile_split + reorder_cadence → outputs Path A (&lt;$500k
              GMV Faire+Tundra marketplace-only 4.5:1 ROI) / Path B ($500k-$5M
              GMV Faire+Tundra+Ankorstore+Handshake+Shopify B2B DEFAULT 8.5:1
              ROI) / Path C ($5M+ GMV full B2B-orchestration including
              RSP/KeHE/UNFI + Amazon Business + EDI-832/850 6:1 muted)
              recommendation with cost stack + expected Year-1 incremental
              B2B revenue $1M-$5M Path B + wholesale-channel-cannibalization
              rate + 6-step build sequence. Pre-staged in research/10
              §Next moves + playbook 17 §Companion tool + asset 18
              §Related. Gated on the canonical 8 prereqs (Move #1 + #4 + #6
              + #8 shipped + 10+ SKUs + 25%+ wholesale-discount margin
              headroom + 8-prereq distributor-onboarding-pack +
              corporate-gifting-catalog-ready).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/b2b-wholesale-channel-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the v0.11.0
              extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. **Shipped
              2026-07-01 per the static-dashboard-tick follow-up to
              research/10 + playbook 17 + asset 18 + dashboard/app/b2b/page.tsx
              + scripts/b2b_wholesale_unit_economics.py.** Static HTML
              dashboard rendering B2B / wholesale launch readiness (Path A/B/C
              tier indicator + us_dtc_gmv band + sku_count band) +
              per-marketplace readiness (4 canonical B2B marketplaces ×
              {`{live/draft/staging/not-started}`} status: Faire + Tundra +
              Ankorstore + Handshake) + per-path Year-1 incremental B2B
              revenue bar chart (Path A vs B vs C) + 4-phase gate status
              (Gate A wholesale-pricing + marketplace-storefront / Gate B
              direct-buyer-pipeline + corporate-gifting + 5-clause-agreement /
              Gate C distributor-pitch + Amazon Business + MAP-policy / Gate
              D steady-state + reorder-automation + trade-shows per playbook
              17 §Verification gates 10/10/10/9 prereqs) +
              wholesale-channel-cannibalization-rate overlay + 6-tier
              wholesale-discount-matrix visualization + voice-profile-distribution
              + reorder-rate-validation as a 1-click operator surface.
              Self-contained static HTML ~43KB / 6 sections + 4 canonical data
              structures [FLOWS + PATH_TABLE + PHASE_GATES +
              WHOLESALE_DISCOUNT_MATRIX] + 8 helper functions + 6 render
              functions + URL param parsing + 115 Node smoke tests across 26
              categories. **The B2B-wholesale track is now 6/6 layers fully
              closed per the v0.11.0 track-fully-closed pivot pattern.**
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}