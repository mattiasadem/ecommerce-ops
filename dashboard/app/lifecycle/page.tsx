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

export const metadata = { title: "Lifecycle Marketing — Ecommerce Ops" };

export default function LifecyclePage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r05 = findDoc(research, /05-lifecycle-marketing\.md$/);
  const p12 = playbooks.find((p) => p.file === "12-lifecycle-flow-library.md");
  const a14 = assets.find((a) => a.file === "14-lifecycle-flow-templates.md");

  // Pull canonical tables out of research/05
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/05 (TL;DR, Who this is for, Prerequisites, ...)
  const topSections = r05?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r05?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lifecycle-marketing operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Lifecycle Marketing
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for the 80% of lifecycle-marketing
          revenue lift that lives beyond the Move #1 cart-abandon + Move #4
          welcome + Move #7 SMS trio. Three layers:{" "}
          <strong>research/05</strong> (20-flow library across 5 pillars),{" "}
          <strong>playbook 12</strong> (4-tier launch ladder with Klaviyo +
          Postscript + Smile wiring), and <strong>asset 14</strong> (paste-ready
          17-flow × 5-voice = 85 voice-variant email + SMS templates). This
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
            <CardDescription>$5M US GMV, Tiers 1+2+3 subset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">95:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 54:1 conservative / 153:1 aggressive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deferred flows</CardTitle>
            <CardDescription>Beyond the 3 MVP flows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">17</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Plus 3 shipped MVP (Move #1 + #4 + #7) = 20-flow library
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pillars</CardTitle>
            <CardDescription>research/05 framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              5
              <span className="text-base text-muted-foreground font-normal ml-1">
                pillars
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse-abandon + Winback + Post-purchase + Replenishment +
              Celebratory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 14 voice-cells</CardTitle>
            <CardDescription>17 flows × 5 voices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              85
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

      {/* === TL;DR (from research/05) === */}
      {r05 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/05)</CardTitle>
            <CardDescription>
              The headline thesis — why the 20-flow library is the
              highest-leverage Track for a $500k+ US brand that has shipped the
              30-day MVP
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
        <Card id="research-05">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-05
              </span>
              <CardTitle className="text-base">
                research/05-lifecycle-marketing
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/05-lifecycle-marketing.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 12 maps into a 4-tier launch
              ladder (Tier 1 same-week 5 flows / Tier 2 next-30-days 5 flows /
              Tier 3 next-90-days 4 flows / Tier 4 quarterly 3 flows) and asset
              14 turns into 85 paste-ready email + SMS templates. The four
              pillars below are the highest-traffic surfaces — the full doc
              ships Pillar 1 (Browse-abandon + consideration), Pillar 2 (Winback
              + sunset), Pillar 3 (Post-purchase + loyalty), Pillar 4
              (Replenishment), and Pillar 5 (Lifecycle celebratory).
            </p>
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

        <Card id="playbook-12">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-17
              </span>
              <CardTitle className="text-base">
                playbook 12 — Lifecycle flow library (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 tiers · 20 flows · 15 pitfalls · 9 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/12-lifecycle-flow-library.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p12 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/05 section into a 4-tier launch ladder
                  with paste-ready Klaviyo + Postscript + Smile wiring. The 4
                  tiers mirror the canonical 90-day lifecycle-build sequence
                  (Tier 1: 5 high-ROI flows ship Week 1 · Tier 2: 5 flows ship
                  Days 8–30 · Tier 3: 4 flows ship Days 31–90 · Tier 4: 3 flows
                  ship Quarter 2+). Each tier boundary is gated by an explicit
                  verification gate (Gate A through Gate D), and the full build
                  surfaces 9 canonical verification gates A–I (Klaviyo flow
                  sanity / Postscript SMS sanity / Smile webhook sanity /
                  Triple Whale cohort sanity / end-to-end flow test /
                  discount-cap / frequency-cap / voice-coverage / cohort LTV).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p12.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/12 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-14">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-14
              </span>
              <CardTitle className="text-base">
                asset 14 — Lifecycle flow templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 85 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/14-lifecycle-flow-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a14 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready email + SMS templates an operator ships when
                  building each of the 17 deferred flows. 17 flows (5 Tier 1 +
                  5 Tier 2 + 4 Tier 3 + 3 Tier 4) × 5 voice profiles (Default
                  / Luxury / Sustainable / Gen-Z / B2B) = 85 voice-variant
                  paste-ready templates with Klaviyo{" "}
                  <code className="rounded bg-muted px-1 text-[10px]">
                    {`{% if voice_profile == "..." %}`}
                  </code>{" "}
                  conditional-content syntax, Triple Whale{" "}
                  <code className="rounded bg-muted px-1 text-[10px]">
                    ?tw_camp=&lt;flow_id&gt;
                  </code>{" "}
                  UTM on every CTA, subject-line ≤50 chars pre-validated, SMS
                  body ≤160 chars pre-validated, 11 suppression rules, 3
                  frequency caps, 10 pitfalls with corrective Fix lines, and 5
                  verification gates.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a14.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a14.voiceCounts).map(([voice, count]) => (
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
                asset/14 not found in content.json — regenerate.
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
            route — both pre-staged in research/05 §Next moves, playbook 12
            §Companion tool, and asset 14 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/lifecycle_flow_health_check.py
              </code>{" "}
              — Archetype C/D-light hybrid check that audits each of the 13
              Path B live flows against canonical KPI benchmarks (per-flow
              revenue per 1k events + open-rate + CTR + unsubscribe-rate +
              flow-attribution match rate); flags any flow outside ±20% of
              benchmark. Pre-staged in research/05 §Next moves #3 + playbook 12
              §Next moves + asset 14 §Related. Gated on the 13 Path B flows
              being LIVE for ≥30 days.
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/lifecycle-flow-library.html
              </code>{" "}
              — static HTML dashboard rendering the 20-flow library as a
              per-flow KPI scorecard + per-tier revenue contribution + 4-tier
              launch-ladder progress tracker. Pre-staged in research/05 §Next
              moves #4 + playbook 12 §Next moves. Mirrors the Move #6.9 +
              international-expansion-health static-dashboard pattern with 5
              sections + 4 data structures + 8 helper functions.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
