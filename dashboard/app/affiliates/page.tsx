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
import { AffiliatePathCalculator } from "@/components/affiliate-path-calculator";

export const dynamic = "force-static";

export const metadata = { title: "Affiliate Program — Ecommerce Ops" };

export default function AffiliatesPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r09 = findDoc(research, /09-affiliate-program\.md$/);
  const p16 = playbooks.find((p) => p.file === "16-affiliate-program-launch.md");
  const a17 = assets.find((a) => a.file === "17-affiliate-program-templates.md");

  // Pull canonical tables out of research/09
  const pillar2 = findTable(research, /Pillar 2.*Commission structure/i);
  const pillar3 = findTable(research, /Pillar 3.*Cookie attribution/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/09
  const topSections = r09?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r09?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Affiliate-program operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Affiliate Program
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching an affiliate / creator /
          influencer program on a US-based Shopify DTC brand with Move #6
          attribution live + Move #8 loyalty live. Three layers:{" "}
          <strong>research/09</strong> (5-pillar framework for the
          Refersion + Levanta + Impact + GoAffPro + PartnerStack + Aspire
          affiliate-program stack), <strong>playbook 16</strong> (4-phase
          Recruit → Onboard → Cookie-mitigate → Tier-promote operator build),
          and <strong>asset 17</strong> (paste-ready 5-flow × 5-voice ×
          {" "}
          {`{email + SMS}`} = 50 voice-driven override cells for
          application-welcome + first-content-prompt +
          first-payout-celebration + tier-promotion-educational +
          quarterly-compliance-audit flows). This page surfaces all three in
          one place so you can stop tab-switching between{" "}
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
              $500k–$5M GMV, Refersion + 20-30 affiliates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">6:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4.7:1 conservative / 12.5:1 aggressive (Path A)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-1 attributed revenue</CardTitle>
            <CardDescription>
              Path B at $2M US GMV base · 20-30 active affiliates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $720k
              <span className="text-base text-muted-foreground font-normal ml-1">
                attributed
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $720k attributed revenue / $152k cost = 4.7:1 conservative
              nominal · 6:1-8:1 aggressive with full Levanta server-side
              fingerprinting
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 16 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (platform + commission tiers) → 2 (recruitment +
              onboarding) → 3 (cookie-deprecation mitigation) → 4 (tier-promotion
              + sustainable-mission-verifier)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 17 voice-cells</CardTitle>
            <CardDescription>
              5 flows × 5 voices × {`{email + SMS}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              50
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              25 emails + 25 SMS · all 5 voices ≥15 (Default=37 /
              Luxury=32 / Sustainable=39 / Gen-Z=34 / B2B=34)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/09) === */}
      {r09 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/09)</CardTitle>
            <CardDescription>
              The headline thesis — why affiliate / creator / influencer programs
              are the canonical 10-30% incremental-revenue layer for $500k+ GMV
              brands with Move #6 attribution live + Move #8 loyalty live +
              Triple Whale cohort-LTV substrate
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
        <Card id="research-09">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-09
              </span>
              <CardTitle className="text-base">
                research/09-affiliate-program
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/09-affiliate-program.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 16 maps into a 4-phase
              affiliate-program launch ladder (Phase 1 platform + commission
              tiers + cookie windows + FTC-compliance SOP + 3-clause
              affiliate agreement + landing-page live ~6hr Path B baseline
              Weeks 1-2 · Phase 2 recruitment + onboarding + marketplace
              listing ~10hr Weeks 3-4 · Phase 3 cookie-deprecation mitigation
              with the canonical 6-step recipe (Shopify CAPI server-side + UTM
              fallback + post-purchase email match + Shopify Pixel + Levanta
              server-side fingerprinting for Path C + Triple Whale
              affiliate-cohort-overlay) recovering 25-35% of would-be-lost
              attribution per iOS 14.5+ deprecation ~12hr Weeks 5-8 · Phase 4
              tier-promotion + sustainable-mission-verifier + public listing
              + 4-trigger SOP [volume $5k+/90d + cohort-LTV $300+ +
              content-quality 10+ posts/90d + 70%+ FTC-compliance + tenure
              180d] ~10hr Weeks 9-12) and asset 17 turns into 50 paste-ready
              per-flow voice-variant email + SMS templates. The five pillars
              below are the highest-traffic surfaces — the full doc ships
              Pillar 1 (Program-design + platform-selection across the
              canonical 6-path tool decision matrix: GoAffPro free-$25/mo +
              Refersion Growth $239/mo Path B DEFAULT + Levanta Growth
              $499/mo Path B creator-led + Impact Enterprise $1k+/mo Path C +
              PartnerStack Path C B2B + Aspire $500+/mo Path C
              influencer-only), Pillar 2 (Commission-structure +
              payout-schedule with the 5-voice commission-tier matrix
              [Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30%
              / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%] + per-voice cookie
              windows [Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d /
              B2B 90d] + per-voice payout schedules [Default NET-30 / Luxury
              NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60]),
              Pillar 3 (Cookie-attribution + iOS 14.5+ deprecation mitigation
              with the 6-step recipe recovering 25-35%), Pillar 4
              (Cohort-LTV-measurement + attribution-merge with the 4-step
              cohort-LTV SQL + 10-metric per-affiliate KPI dashboard), and
              Pillar 5 (FTC-disclosure-compliance with 16 CFR Part 255 +
              per-voice FTC-disclosure-language templates + 3-clause
              affiliate agreement + quarterly compliance audit every 90 days).
            </p>
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — canonical 5-voice commission-tier matrix + per-voice
                  cookie windows + per-voice payout schedules
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar3 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 3 — 6-step cookie-deprecation mitigation recipe +
                  iOS 14.5+ attribution-recovery benchmark
                </div>
                <ResearchTable rows={pillar3} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($2M US GMV, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-16">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-16
              </span>
              <CardTitle className="text-base">
                playbook 16 — Affiliate program launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/16-affiliate-program-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p16 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/09 section into a 4-phase
                  affiliate-program launch ladder with paste-ready Refersion
                  (or Levanta / Impact / GoAffPro / PartnerStack / Aspire)
                  multi-platform affiliate operator build. The 4 phases mirror
                  the canonical affiliate-launch sequence (Phase 1: pick
                  platform + configure commission tiers + cookie windows +
                  FTC-compliance SOP + 3-clause affiliate agreement +
                  landing-page live, ~6hr Path B baseline Weeks 1-2 · Phase 2:
                  recruitment + onboarding + marketplace listing + 4-email
                  onboarding sequence [Day 0 welcome + Day 7
                  first-content-prompt + Day 30 first-payout-celebration + Day
                  60 tier-promotion-educational] + seed-first-100-affiliates
                  loop, ~10hr Weeks 3-4 · Phase 3: cookie-deprecation
                  mitigation 6-step recipe + Triple Whale cohort-LTV wiring +
                  Levanta server-side fingerprinting for Path C, ~12hr Weeks
                  5-8 · Phase 4: 4-trigger tier-promotion SOP +
                  Sustainable-mission-alignment-verifier from
                  assets/12-impact-data-pipeline.md + public listing on Awin +
                  Impact + Levanta + Refersion marketplaces, ~10hr Weeks
                  9-12 + 1-4 hr/wk ongoing). Each phase boundary is gated by
                  an explicit verification gate (Gate A through Gate D), and
                  the full build surfaces 4 canonical verification gates with
                  10/10/10/9 prereqs respectively = 39 prereqs total
                  (Move #1 + #4 + #6 + #8 + Triple Whale attribution live +
                  ≥1,000 customers/month + 1 share-worthy SKU + FTC-compliance
                  SOP + Klaviyo post-purchase webhook + Refersion/Levanta/
                  GoAffPro/Impact platform installed + PayPal Mass Pay or Wise
                  configured + Klaviyo segmented "Engaged customers with
                  social handles" for existing-customer-list scrape +
                  ascribe-per-affiliate FTC-disclosure templates).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p16.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/16 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-17">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-17
              </span>
              <CardTitle className="text-base">
                asset 17 — Affiliate program templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 50 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/17-affiliate-program-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a17 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-flow per-voice affiliate email + SMS copy
                  an operator ships when launching a Refersion (or Levanta /
                  Impact / GoAffPro / PartnerStack / Aspire) affiliate
                  program. 5 flows (Application-welcome + First-content-prompt
                  + First-payout-celebration + Tier-promotion-educational +
                  Quarterly-compliance-audit) × 5 voice profiles (Default /
                  Luxury / Sustainable / Gen-Z / B2B) × {`{email + SMS}`} =
                  50 voice-driven override cells wired to Klaviyo +
                  Refersion + Levanta + Impact + Aspire + Triple Whale. The
                  5-voice commission-tier matrix [Default 15/20/25% / Luxury
                  10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% /
                  B2B 8-12/12-15/15-20% per research/09 Pillar 2] gates the
                  tier-promotion SOP + the per-voice cookie windows [Default
                  30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d] +
                  per-voice payout schedules [Default NET-30 / Luxury NET-45
                  / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60]. Each
                  voice-driven cell ships Klaviyo conditional-content syntax
                  + Triple Whale
                  <code className="rounded bg-muted px-1 mx-1">
                    ?tw_camp=aff_&lt;flow_id&gt;_v&lt;voice_profile&gt;
                  </code>{" "}
                  UTM on every CTA + per-voice FTC-disclosure-language
                  templates [Default #ad-at-start + FTC-cheatsheet / Luxury
                  #sponsored-with-consideration / Sustainable #sponsored +
                  [impact-pillar] / Gen-Z #ad-at-start + 3-second-rule /
                  B2B #sponsored + quarterly-audit-cadence] + subject-line
                  ≤50 chars + SMS ≤160 chars pre-validation + 5 suppression
                  rules [terminated / opted-out / duplicate-application /
                  already-Tier-3 / quarterly-audit-window-overlap] + 3
                  frequency caps [1 email/day / 3 SMS/week / 24h
                  flow-to-flow gap] + 12 numbered pitfalls with corrective
                  Fix lines clustered into 5 failure modes [A
                  wrong-flow-trigger fires / B voice-profile-routing-breaks /
                  C FTC-disclosure-language-missing / D
                  tier-promotion-violates-4-trigger / E
                  quarterly-compliance-audit-skipped].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a17.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a17.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/17 not found in content.json — regenerate.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === INTERACTIVE CALCULATOR (Move #15 browser-side port) === */}
      <AffiliatePathCalculator />

      {/* === FOOTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Future-tick companion (planned, not yet shipped)
          </CardTitle>
          <CardDescription>
            The one next-priority bounded improvement that ships after this
            route — pre-staged in research/09 §Next moves + playbook 16
            §Companion tool + asset 17 §Related. The script companion
            (browser-side interactive <code className="rounded bg-muted px-1 font-mono">
              &lt;AffiliatePathCalculator /&gt;
            </code>) shipped 2026-07-10.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/affiliate-program-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the v0.11.0
              extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering affiliate-launch readiness (Path A/B/C
              tier indicator + monthly-GMV band + active-affiliates-count
              band) + per-platform readiness (6 canonical affiliate
              platforms × {`{live/draft/staging/not-started}`} status:
              GoAffPro + Refersion + Levanta + Impact + PartnerStack + Aspire)
              + per-path Year-1 attributed revenue bar chart (Path A vs B vs
              C) + 4-phase gate status (Gate A platform + commission tiers /
              Gate B recruitment + onboarding / Gate C cookie-deprecation
              mitigation / Gate D tier-promotion + sustainable-mission-verifier
              + public listing per playbook 16 §Verification gates
              10/10/10/9 prereqs) + per-flow commission-paid-by-tier overlay
              (Tier 1 / 2 / 3 / 4) + cookie-attribution-recovery-rate +
              voice-profile-distribution + FTC-compliance-audit-cadence as
              a 1-click operator surface. Self-contained static HTML; mirrors
              the canonical 6-section + 4 canonical data structures +
              17-category Node smoke suite pattern from the marketplace /
              3PL / international-expansion / lifecycle-flow / subscription-program
              static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}