import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResearchTable } from "@/components/research-table";
import { AttributionQualityAudit } from "@/components/attribution-quality-audit";
import { content, findDoc, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "Attribution Quality Audit — Ecommerce Ops",
};

export default function AttributionQualityPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  // Pull the Move #6 (attribution) substrate + Move #6.5 (audit playbook)
  // + Move #6.8 (cross-platform rollup) so the operator sees the
  // attribution stack framing before the interactive audit.
  const r06 = findDoc(research, /06-marketplace-expansion\.md$/);
  const p065 = playbooks.find((p) => p.file === "06.5-attribution-quality-audit.md");
  const p068 = playbooks.find((p) => p.file === "06.8-cross-platform-attribution-drift-unification.md");
  const p066 = playbooks.find((p) => p.file === "06.6-tiktok-attribution-quality-audit.md");
  const p067 = playbooks.find((p) => p.file === "06.7-snap-pinterest-attribution-quality-audit.md");

  // Canonical research tables — the 7-gate attribution substrate + the
  // drift monitoring substrate. Falls back to null when not present so
  // the page degrades gracefully on a fresh build.
  const gateTable = findTable(research, /7 verification gates|verification gate list/i);
  const driftTable = findTable(research, /drift.*threshold/i);

  const topSections = r06?.sections.filter((s) => s.level === 2) ?? [];
  const tldr = r06?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move #6.5 · Attribution quality audit
        </span>
        <h1 className="text-2xl font-bold leading-tight">Attribution Quality Audit</h1>
        <p className="text-sm text-muted-foreground max-w-4xl">
          The 6-gate measurement-quality audit for the Triple Whale / Polar Analytics attribution
          stack (Move #6.5 playbook). Enter the operator&apos;s last-7d diagnostic exports and the
          panel scores every gate against the canonical thresholds pinned by{" "}
          <code className="font-mono text-[11px]">scripts/attribution_quality_audit.py</code>.
          The same math runs in the browser (this page) and in the terminal
          (<code className="font-mono text-[11px]">python3 attribution_quality_audit.py --check &lt;gate&gt;</code>)
          — no drift between the two.
        </p>
      </header>

      {/* ===== Interactive Move #6.5 audit ===== */}
      <AttributionQualityAudit />

      {/* ===== Substrate context cards ===== */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Move #6.5 playbook</CardTitle>
            <CardDescription>
              The canonical 6-gate measurement-quality audit substrate. Pairs with{" "}
              <code className="font-mono text-[11px]">scripts/attribution_quality_audit.py</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {p065 ? (
              <>
                <p className="leading-relaxed">
                  Move #6.5 distinguishes <strong>installation</strong> (Move #6 substrate — keys are
                  set, integrations are wired) from <strong>measurement quality</strong> (this
                  page — the events are matching across platforms with the right dedup, coverage,
                  and quality tier). The single most important gate is Gate A (Meta CAPI match
                  rate ≥ 90%): Meta&apos;s own documentation says match rates below 80%
                  silently degrade campaign optimization; below 70% Meta throttles CAPI delivery
                  entirely. The other 5 gates are equally load-bearing but match-rate is the one
                  Triple Whale + Polar will not catch for you.
                </p>
                <p className="mt-2 font-mono text-[10px]">
                  playbook/06.5-attribution-quality-audit
                </p>
              </>
            ) : (
              <p>playbook/06.5 not found in content.json — regenerate.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-platform audits</CardTitle>
            <CardDescription>
              Move #6.6 (TikTok) + Move #6.7 (Snap + Pinterest) live alongside the cross-platform
              Move #6.5 audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p className="leading-relaxed">
              The per-platform audits score the same math shape but use platform-specific EAPI
              thresholds (TikTok EAPI ≥ 85%, Snap CAPI ≥ 85%, Pinterest CAPI ≥ 85%) and the
              per-platform Advanced Matching identifier. Mounted on{" "}
              <code className="font-mono text-[11px]">/tiktok</code> and{" "}
              <code className="font-mono text-[11px]">/channels</code>.
            </p>
            <ul className="mt-2 flex flex-col gap-0.5 font-mono text-[10px]">
              <li>playbook/06.6-tiktok-attribution-quality-audit</li>
              <li>playbook/06.7-snap-pinterest-attribution-quality-audit</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cross-platform rollup</CardTitle>
            <CardDescription>
              Move #6.8 unifies Gate G (drift) signals across the 3 per-platform audits + the
              cross-platform Move #6.5 audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {p068 ? (
              <>
                <p className="leading-relaxed">
                  Move #6.8 is the substrate that ingests Gate G drift outputs from every
                  per-platform audit and emits a single cross-platform drift alert. When
                  Meta CAPI match rate drops 8pp week-over-week AND Snap CAPI drops 12pp
                  AND TikTok EAPI drops 6pp, the rollup surfaces one prioritized incident
                  instead of three noisy Slack pings.
                </p>
                <p className="mt-2 font-mono text-[10px]">
                  playbook/06.8-cross-platform-attribution-drift-unification
                </p>
              </>
            ) : (
              <p>playbook/06.8 not found in content.json — regenerate.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== Canonical research table — 6 gates × canonical thresholds ===== */}
      {gateTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canonical 6-gate verification</CardTitle>
            <CardDescription>
              The Move #6.5 verification substrate — gate-by-gate thresholds pinned by the Python CLI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={gateTable} />
          </CardContent>
        </Card>
      )}

      {/* ===== Drift monitoring substrate ===== */}
      {driftTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drift monitoring</CardTitle>
            <CardDescription>
              Week-over-week drift thresholds and signal sources for the Move #6.5 Gate G.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResearchTable rows={driftTable} />
          </CardContent>
        </Card>
      )}

      {/* ===== Top H2 sections of research/06 ===== */}
      {topSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Move #6 substrate — top sections</CardTitle>
            <CardDescription>
              {tldr ? tldr.slice(0, 280) + (tldr.length > 280 ? "…" : "") : "research/06-marketplace-expansion.md"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topSections.slice(0, 6).map((s, i) => (
              <div key={i} className="border-b border-border/60 pb-2 last:border-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.heading}
                </span>
                <p className="text-xs leading-relaxed text-foreground/90 mt-0.5">
                  {s.body.slice(0, 320)}
                  {s.body.length > 320 ? "…" : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ===== Footer ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Future-tick companion (planned, not yet shipped)
          </CardTitle>
          <CardDescription>
            The next-priority bounded improvement that ships after this page. The natural
            follow-up is a per-platform-drift-rollup-scoring-bridge that ingests Gate G outputs
            from Move #6.5 (this audit) + Move #6.6 (TikTok) + Move #6.7 (Snap + Pinterest)
            and emits one consolidated cross-platform drift score + prioritized fix list. The
            scoring math ports from{" "}
            <code className="font-mono text-[11px]">scripts/attribution_cross_platform_rollup.py</code>{" "}
            and pairs with playbook{" "}
            <code className="font-mono text-[11px]">06.8-cross-platform-attribution-drift-unification.md</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Move #6.5</Badge>
          <Badge variant="outline">Triple Whale</Badge>
          <Badge variant="outline">Polar</Badge>
          <Badge variant="outline">Meta CAPI</Badge>
          <Badge variant="outline">Google Enhanced Conversions</Badge>
          <Badge variant="outline">GA4</Badge>
          <Badge variant="outline">Klaviyo cohort roundtrip</Badge>
          <Badge variant="outline">Drift monitoring</Badge>
        </CardContent>
      </Card>
    </div>
  );
}