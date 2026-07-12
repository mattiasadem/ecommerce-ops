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
import { InternationalPathCalculator } from "@/components/international-path-calculator";

export const dynamic = "force-static";

export const metadata = { title: "International — Ecommerce Ops" };

export default function InternationalPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r04 = findDoc(research, /04-international-expansion\.md$/);
  const p11 = playbooks.find((p) => p.file === "11-international-rollout.md");
  const a13 = assets.find((a) => a.file === "13-international-pricing-card.md");

  // Pull canonical tables out of research/04
  const pillar1 = findTable(research, /Pillar 1.*Market selection/i);
  const costRoi = findTable(research, /Cost & ROI estimate/i);
  const pillar4 = findTable(research, /Pillar 4.*Fulfillment/i);
  const pillar5 = findTable(research, /Pillar 5.*Localization/i);

  // Top H2 sections (TL;DR, Prerequisites, The 5-pillar framework, GMV-tier paths, ...)
  const topSections =
    r04?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the first body paragraph from TL;DR for the hero blurb
  const tldr =
    r04?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Cross-border DTC operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          International Expansion
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for taking a US-based DTC Shopify brand
          cross-border. Three layers: <strong>research/04</strong> (5-pillar
          framework), <strong>playbook 11</strong> (Phase 1+2+3+4 operator
          build), and <strong>asset 13</strong> (paste-ready 7-market × 5-voice
          pricing card). This page surfaces all three in one place so you can
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
            <CardDescription>$5M US GMV, 4-market Phase 1+2</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">25:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · Path B range 20:1 to 60:1
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phase 1+2 markets</CardTitle>
            <CardDescription>Lowest-friction default</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">4</div>
            <p className="mt-1 text-xs text-muted-foreground">
              CA + UK + EU + AU · ~80% of typical lift at ~30% of full cost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 13 voice-cells</CardTitle>
            <CardDescription>7 markets × 5 voices</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 11</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (CA+UK) → 2 (EU+AU) → 3 (JP+DACH+Nordics) → 4 (steady)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/04) === */}
      {r04 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/04)</CardTitle>
            <CardDescription>
              The headline thesis — why international expansion is the
              highest-leverage track for a $1M+ US brand
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

      {/* === INTERACTIVE CALCULATOR (port of scripts/international_market_fit.py) === */}
      <InternationalPathCalculator />

      {/* === LAYER CARDS === */}
      <div className="flex flex-col gap-3">
        <Card id="research-04">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-04
              </span>
              <CardTitle className="text-base">
                research/04-international-expansion
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/04-international-expansion.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 11 maps into operator-build
              steps and asset 13 turns into paste-ready per-market price-cards.
              The three pillars below are the highest-traffic surfaces — the
              full doc ships Pillar 1 (Market selection), Pillar 2 (Currency,
              pricing &amp; FX), Pillar 3 (Tax + duty compliance), Pillar 4
              (Fulfillment, shipping &amp; returns), and Pillar 5
              (Localization).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — Market selection &amp; prioritization
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
            {pillar4 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 4 — Fulfillment, shipping &amp; returns
                </div>
                <ResearchTable rows={pillar4} />
              </div>
            )}
            {pillar5 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 5 — Localization (language + cultural + payment)
                </div>
                <ResearchTable rows={pillar5} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-11">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-16
              </span>
              <CardTitle className="text-base">
                playbook 11 — International rollout (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 12 prereqs · 15 pitfalls · 4 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/11-international-rollout.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p11 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/04 section into a Phase 1+2+3+4
                  step-by-step operator build. The 4 phases mirror the
                  canonical 5-market expansion sequence (Phase 1: CA + UK ·
                  Phase 2: EU + AU · Phase 3: JP + DACH + Nordics · Phase 4:
                  steady-state ops). Each phase boundary is gated by an
                  explicit verification gate (Gate A through Gate D).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p11.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/11 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-13">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-13
              </span>
              <CardTitle className="text-base">
                asset 13 — International pricing card (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 35 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/13-international-pricing-card.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a13 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-market price-card an operator ships Week 1
                  of international expansion. 7 markets (CA / UK / EU-DE /
                  EU-FR / AU / JP / DACH-AT) × 5 voice profiles (Default /
                  Luxury / Sustainable / Gen-Z / B2B) = 35 voice-driven
                  override cells with the exact per-market per-voice
                  local-currency price, free-shipping threshold, DDP/IOSS/UK-VAT-MOSS/Zonos
                  wiring, FX-fee-band budget, and per-market contribution-margin
                  pre-compute (≥30% gate per playbook 11 Prerequisite #6).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a13.meta.slice(0, 8).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a13.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/13 not found in content.json — regenerate.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === FOOTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Companion artifacts shipped
          </CardTitle>
          <CardDescription>
            The full canonical layer-order-completion pattern for Move #11 international-expansion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/international_market_fit.py
              </code>{" "}
              — Archetype A/B/C/C+ scoring script (CLI). Companion to the
              interactive calculator above. Run{" "}
              <code className="rounded bg-muted px-1 font-mono">
                python3 scripts/international_market_fit.py --json
              </code>{" "}
              to get the same Path A/B/C/C+ recommendation from the terminal.
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/international-expansion-health.html
              </code>{" "}
              — static HTML dashboard showing per-market launch readiness
              (Gate A/B/C status per market) + per-market revenue lift vs
              projection + per-market CAC payback. Pre-staged in research/04
              line 301 + playbook 11 line 494 + asset 13 line 345.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
