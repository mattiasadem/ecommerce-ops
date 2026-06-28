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

export const metadata = { title: "3PL Migration — Ecommerce Ops" };

export default function ThreeplPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r07 = findDoc(research, /07-3pl-migration\.md$/);
  const p14 = playbooks.find((p) => p.file === "14-3pl-migration.md");
  const a15_3pl = assets.find((a) => a.file === "15-3pl-selection-card.md");

  // Pull canonical tables out of research/07
  const pillar1 = findTable(research, /Pillar 1.*3PL size \+ scope matching/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/07 (TL;DR, Who this is for, Prerequisites, ...)
  const topSections = r07?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r07?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          3PL-migration operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          3PL Migration
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for moving from in-house fulfillment to
          ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord +
          Flowspace + Extensiv multi-3PL orchestration. Three layers:{" "}
          <strong>research/07</strong> (5-pillar framework + 3 GMV-tier paths +
          4 phase-by-phase verification gates + 15 pitfalls + 6:1 to 12:1
          steady-state Year-2 ROI),{" "}
          <strong>playbook 14</strong> (4-phase RFQ + contract + WMS build +
          inventory pull + cutover + international 3PL-footprint operator
          build), and <strong>asset 15 (3PL-selection-card)</strong> (paste-ready
          7-3PL × 5-voice = 35 voice-driven override cells for the 6-dimension
          per-3PL cost-comparison matrix + 8-prereq RFQ brief template + 3-tier
          size-match decision matrix + 8 SLA-defense contract clauses). This
          page surfaces all three in one place so you can stop tab-switching
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
            <CardDescription>$3M US GMV, multi-warehouse Year-2+ steady-state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">12:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-2+ steady-state · 6:1 conservative / 12:1 median DEFAULT /
              10:1 enterprise Path C
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3PL break-even</CardTitle>
            <CardDescription>Per ShipBob State of DTC Shipping 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">500+</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders/mo · 2-5K orders/mo $3-5M GMV Path B default
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pillars</CardTitle>
            <CardDescription>research/07 framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              5
              <span className="text-base text-muted-foreground font-normal ml-1">
                pillars
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              3PL-size matching + Cost-stack + WMS-integration + Multi-warehouse
              + Migration-pitfalls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 15 voice-cells</CardTitle>
            <CardDescription>7 3PLs × 5 voices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              35
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All 5 voices ≥15 density threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/07) === */}
      {r07 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/07)</CardTitle>
            <CardDescription>
              The headline thesis — why 3PL migration is the
              operational-bottleneck unblocker for $500k+ US brands hitting the
              canonical 500+ orders/mo 3PL break-even
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
        <Card id="research-07">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-07
              </span>
              <CardTitle className="text-base">
                research/07-3pl-migration
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/07-3pl-migration.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 14 maps into a 4-phase RFQ +
              contract + WMS-build + inventory-pull + cutover + international
              3PL-footprint operator build, and asset 15 (3PL-selection-card)
              turns into 35 paste-ready per-3PL × 5-voice = 35 voice-driven
              override cells for the 6-dimension cost-comparison matrix. The
              five pillars below are the canonical operator decision frames —
              the full doc ships Pillar 1 (3PL size + scope matching across 3
              tiers), Pillar 2 (cost-stack math + ROI), Pillar 3 (WMS
              integration + migration recipe), Pillar 4 (multi-warehouse +
              international fulfillment), and Pillar 5 (migration pitfalls +
              8-metric operational KPI dashboard).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — 3PL size + scope matching (canonical 3-tier
                  decision matrix)
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($3M US GMV, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-14">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-14
              </span>
              <CardTitle className="text-base">
                playbook 14 — 3PL migration (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates · 8 SLA-defense clauses
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/14-3pl-migration.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p14 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/07 section into a 4-phase ShipBob +
                  ShipMonk + Red Stag + Shopify Fulfillment Network + Stord +
                  Flowspace + Extensiv multi-3PL orchestration recipe with
                  paste-ready RFQ + SLA-defense contract negotiation + WMS
                  integration build. The 4 phases mirror the canonical
                  3PL-migration ladder (Phase 1 RFQ + contract + WMS build
                  ~12hr Path A baseline Weeks 1-4 · Phase 2 inventory pull +
                  3PL inbound + cutover + Path B 2nd-warehouse ~8hr Weeks 5-10
                  · Phase 3 Path B steady-state + Path C international 3PL
                  footprint EU + UK + CA + AU + JP ~10hr Weeks 11-20 · Phase 4
                  Path C steady-state + dedicated supply-chain-manager ~10hr
                  Quarter 2+). Each phase boundary is gated by an explicit
                  verification gate (Gate A through Gate D), and the full build
                  surfaces 4 canonical verification gates A-D (10/10/10/9
                  prereqs respectively) + the canonical 8 SLA-defense contract
                  clauses [95%+ on-time-ship-rate + financial-penalty-for-misses
                  + 30-day-notice-no-penalty termination + 99.5%+
                  pick-pack-accuracy + real-time inventory-sync via API + $1M+
                  inventory-insurance coverage + multi-warehouse tier +
                  returns-tier] + the canonical 6-step Phase 1 build [RFQ to
                  5+ 3PLs → site visit to top 2 → 6×5 cost-comparison
                  spreadsheet → SLA-defense contract negotiation →
                  WMS-integration build → 10 test orders in 3PL sandbox] +
                  the canonical 5 cost-stack-merge stitches [3PL-negotiated
                  carrier-rates + Shippo multi-carrier rate API +
                  ship-cost-per-order monitoring + dimensional-weight
                  optimization + ship-time P50+P95 tracking] + 8-metric
                  operational KPI dashboard [pick-pack-accuracy +
                  on-time-ship-rate + ship-cost-per-order + ship-time P50+P95
                  + return-rate + NPS-by-fulfillment-channel +
                  cost-per-order-fulfilled + oversell rate].
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p14.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/14 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-15-3pl">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-15
              </span>
              <CardTitle className="text-base">
                asset 15 (3PL-selection-card) — paste-ready per-3PL
                vendor-comparison
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 35 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/15-3pl-selection-card.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a15_3pl ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-3PL vendor-comparison card an operator
                  ships when choosing between ShipBob + ShipMonk + Red Stag +
                  Shopify Fulfillment Network + Rakuten Super Logistics + Stord
                  + Flowspace for a given path tier. 7 canonical 3PLs (Tier 1
                  SMB ShipBob + Shopify Fulfillment Network + Rakuten Super
                  Logistics / Tier 2 mid-market ShipBob multi-warehouse +
                  ShipMonk + Red Stag / Tier 3 enterprise Stord + Flowspace) ×
                  5 voice profiles (Default / Luxury / Sustainable / Gen-Z /
                  B2B) = 35 voice-driven override cells across the 6-dimension
                  cost-comparison matrix (pick-pack-fee + storage-fee +
                  receiving-fee + kitting-fee + returns-fee + SLA-ship-time) +
                  the canonical 8-prereq RFQ brief template + the canonical
                  3-tier size-match decision matrix + the canonical 8
                  SLA-defense contract clauses + 12 pitfalls with corrective
                  Fix lines clustered into 4 failure modes [A 3PL-size-mismatch
                  / B cost-stack-mismatch / C WMS-integration-mismatch / D
                  SLA-mismatch] + 5 verification gates.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a15_3pl.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a15_3pl.voiceCounts).map(([voice, count]) => (
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
                asset/15-3pl-selection-card.md not found in content.json —
                regenerate.
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
            route — both pre-staged in research/07 §Next moves, playbook 14
            §Next moves, and asset 15 (3PL-selection-card) §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/3pl_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C scorer that takes current
              orders/mo + current AOV + current ship cost + current ship time
              + current warehouse footprint + current SKU count + current
              international volume → outputs Path A (SMB 3PL solo) / Path B
              (mid-market multi-warehouse) / Path C (enterprise orchestration)
              recommendation with cost-stack + expected Year-1 incremental
              ship-cost savings + ship-time improvement + multi-warehouse-enabled
              + 6-step build sequence. Pre-staged in research/07 §Next moves +
              playbook 14 §Next moves + asset 15 §Related. Gated on operator
              having current 3PL-or-in-house baseline data.
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/3pl-migration-health.html
              </code>{" "}
              — static HTML dashboard rendering the per-path 3PL-selection
              readiness + per-3PL cost-stack + 4-phase migration-gate status +
              ship-cost-savings overlay as a 1-click operator surface.
              Pre-staged in research/07 §Next moves + playbook 14 §Next moves.
              Mirrors the international-expansion-health static-dashboard
              pattern with 6 sections + 4 data structures + 8 helper functions
              + 17-category Node smoke suite.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
