import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResearchTable } from "@/components/research-table";
import { MarketplacePathCalculator } from "@/components/marketplace-path-calculator";
import { content, findDoc, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Marketplace Expansion — Ecommerce Ops" };

export default function MarketplacePage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r06 = findDoc(research, /06-marketplace-expansion\.md$/);
  const p13 = playbooks.find((p) => p.file === "13-marketplace-launch.md");
  const a15 = assets.find((a) => a.file === "15-marketplace-listing-card.md");

  // Pull canonical tables out of research/06
  const pillar1 = findTable(research, /Pillar 1.*Marketplace-channel economics/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/06 (TL;DR, Who this is for, Prerequisites, ...)
  const topSections = r06?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r06?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Marketplace-expansion operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Marketplace Expansion
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for taking a US-based DTC Shopify brand
          onto Amazon + Walmart + Target Plus + EU marketplaces. Three layers:{" "}
          <strong>research/06</strong> (5-pillar framework),{" "}
          <strong>playbook 13</strong> (4-phase marketplace-launch operator
          build), and <strong>asset 15</strong> (paste-ready 5-marketplace ×
          5-voice = 25 voice-variant per-marketplace listing titles + 25
          voice-variant 5-bullet-point sets + 20 voice-variant A+ content
          skeletons). This page surfaces all three in one place so you can stop
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
              $5M US GMV, Amazon + Walmart scope
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">8.3:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 5.5:1 conservative / 26:1 aggressive
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
              $2.25M
              <span className="text-base text-muted-foreground font-normal ml-1">
                net
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              45% incremental net after DTC-cannibalization adjustment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 13 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (Amazon) → 2 (Amazon+Walmart) → 3 (EU marketplaces) → 4
              (Target Plus + steady)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 15 voice-cells</CardTitle>
            <CardDescription>5 marketplaces × 5 voices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              85
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              25 titles + 25 bullet sets + 20 A+ skeletons · all 5 voices ≥15
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/06) === */}
      {r06 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/06)</CardTitle>
            <CardDescription>
              The headline thesis — why marketplace expansion is the
              largest-absolute-revenue track for a $5M+ US brand with the
              Shopify-native stack steady-state
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
        <Card id="research-06">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-06
              </span>
              <CardTitle className="text-base">
                research/06-marketplace-expansion
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/06-marketplace-expansion.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 13 maps into a 4-phase
              launch ladder (Phase 1 Amazon-only ~25hr Weeks 1-4 · Phase 2
              Amazon+Walmart ~20hr Weeks 5-12 · Phase 3 international
              marketplaces ~75hr Weeks 13-24 · Phase 4 Target Plus + steady-state
              ~30hr Quarter 2+) and asset 15 turns into 85 paste-ready per-
              marketplace voice-variant listing copy. The five pillars below are
              the highest-traffic surfaces — the full doc ships Pillar 1
              (Marketplace-channel economics), Pillar 2 (Brand-canary
              protection), Pillar 3 (Operational model FBA vs FBM vs SFP vs WFS
              vs Target Plus), Pillar 4 (Category fit + regulatory friction),
              and Pillar 5 (Attribution merge + DTC-cannibalization
              measurement).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — per-marketplace fee-stack decision matrix
                  (Amazon + Walmart + Target Plus + EU + JP)
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

        <Card id="playbook-13">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-13
              </span>
              <CardTitle className="text-base">
                playbook 13 — Marketplace launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/13-marketplace-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p13 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/06 section into a 4-phase marketplace
                  launch ladder with paste-ready Amazon Seller Central + Walmart
                  Marketplace + Target Plus + EU marketplaces (Amazon EU 5 +
                  bol + Zalando + Cdiscount + Amazon JP) operator build. The
                  4 phases mirror the canonical 6-month marketplace-expansion
                  sequence (Phase 1: Amazon-only with USPTO trademark + Brand
                  Registry + FBA + Sponsored Products, 25hr one-time · Phase 2:
                  Amazon optimization + Walmart launch, 20hr cumulative · Phase
                  3: international marketplaces with EU compliance stack
                  CE+VAT-MOSS+EPR+GPSR, 75hr + 25 hr/wk · Phase 4: Target Plus
                  application + dedicated marketplace manager, 30hr Quarter
                  2+). Each phase boundary is gated by an explicit
                  verification gate (Gate A through Gate D), and the full build
                  surfaces 4 canonical verification gates with 11/10/10/9
                  prereqs respectively (Amazon Brand Registry enrollment +
                  USPTO trademark filed + FBA-inbound-readiness OR FBM
                  self-fulfillment + Triple Whale Marketplace Sync wired).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p13.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/13 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-15">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-15
              </span>
              <CardTitle className="text-base">
                asset 15 — Marketplace listing card (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 85 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/15-marketplace-listing-card.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a15 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-marketplace per-voice listing copy an
                  operator ships when launching on Amazon + Walmart + Target
                  Plus + EU marketplaces. 5 marketplaces (Amazon US + Walmart +
                  Target Plus + Amazon EU + bol NL) × 5 voice profiles
                  (Default / Luxury / Sustainable / Gen-Z / B2B) = 25
                  voice-variant per-marketplace listing titles (Amazon US/EU
                  ≤200 chars / Walmart ≤75 chars / Target Plus ≤100 chars / bol
                  ≤150 chars NL-only Dutch) + 25 voice-variant 5-bullet-point
                  sets (Amazon ≤500/bullet / Walmart 5-10 bullets ≤500 each /
                  Target Plus 3-5 bullets ≤1000 total / bol 5-10 bullets ≤1000
                  total) + 20 voice-variant A+ content skeletons (Amazon US +
                  EU only; Brand-Registry-required; 5 modules per Amazon's
                  2024 A+ content guide) + the per-marketplace keyword-stuffing
                  guardrail (Amazon US/EU ≤2.5% keyword density per Amazon
                  Brand Registry 2024 / Walmart ≤75-char title / Target Plus
                  ≤100-char title / bol NL-only Dutch-language-localization).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a15.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a15.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/15 not found in content.json — regenerate.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === INTERACTIVE PATH A/B/C CALCULATOR (browser port of marketplace_unit_economics.py) === */}
      <MarketplacePathCalculator />

      {/* === FOOTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Future-tick companion (planned, not yet shipped)
          </CardTitle>
          <CardDescription>
            The next-priority bounded improvement after this route —
            pre-staged in research/06 §Next moves, playbook 13 §Companion
            tool, and asset 15 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/marketplace_unit_economics.py
              </code>{" "}
              — <strong>shipped as the browser-side interactive{" "}
              <code className="rounded bg-muted px-1">
                &lt;MarketplacePathCalculator /&gt;
              </code>{" "}
              card above this footer (2026-07-09 UTC)</strong>. The Python
              CLI's Archetype A/B/C scoring rule is now mirrored in
              TypeScript; the operator enters 8 inputs (US DTC GMV / AOV /
              contribution margin / category / Amazon fulfillment mode /
              Brand Registry status / USPTO trademark flag / operator
              capacity hr/wk) and the panel picks one of the 3 canonical
              paths (Path A Amazon-only / Path B Amazon + Walmart / Path C
              all 8 marketplaces) with the cost stack + Year-1 incremental
              revenue + DTC-cannibalization-adjusted net revenue + Year-1
              ROI + per-marketplace revenue breakdown + the 6-step build
              sequence for the recommended path. State persists to
              localStorage <code className="rounded bg-muted px-1">ecom-ops:marketplace-path:v1</code>.
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/marketplace-expansion-health.html
              </code>{" "}
              — <strong>shipped 2026-06-28</strong> per the dashboard-tick
              follow-up to research/06 + playbook 13 + asset 15 + the script +
              this route. Static HTML dashboard rendering the 4-phase launch
              ladder as a per-marketplace launch-readiness heat-map + per-marketplace
              Year-1 revenue contribution + 4-phase gate status (Gate A/B/C/D
              per playbook 13 §Verification gates 11/10/10/9 prereqs) +
              DTC-cannibalization overlay as a 1-click operator surface.
              Self-contained static HTML ~39KB; 6 sections + 83 Node smoke
              tests across 17 categories. Compounds the 5 prior marketplace
              artifacts by visualizing them as a 1-click per-marketplace
              launch readiness heat-map with per-marketplace revenue shares.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}