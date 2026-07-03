import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content, findDoc, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "Attribution Health Alert Archive — Ecommerce Ops",
};

export default function AttributionHealthAlertArchivePage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  // The Move #6.10 substrate is a deferred hardening follow-up — there is NO
  // canonical research/<N>-attribution-health-alert-webhook.md doc. The three
  // layer-cards (PB-06.10 + AS-24 + SC-attribution_health_alert_webhook)
  // compound Move #6 (attribution stack) + Move #6.5/6.6/6.7 (per-platform
  // audits) + Move #6.8 (cross-platform rollup orchestrator) — but Move #6.10
  // itself is the canonical "wire alert payloads to a Slack-compatible webhook"
  // follow-up that 9 prior journal entries referenced before scripts/
  // attribution_health_alert_webhook.py shipped 2026-07-03.
  //
  // We pull every useful table from research/06 (the attribution substrate)
  // + research/06.x siblings + research/14 (Amazon-DSP echo), and use the
  // playbook + asset + script as the canonical 3 layer-cards.
  const r06 = findDoc(research, /06-marketplace-expansion\.md$/);
  const r14 = findDoc(research, /14-amazon-dsp-amazon-attribution-audit\.md$/);

  const p0610 = playbooks.find(
    (p) => p.file === "06.10-attribution-health-alert-webhook-launch.md",
  );
  const a24 = assets.find(
    (a) => a.file === "24-attribution-health-alert-payload-template.md",
  );

  // Top H2 sections of the two substrate research docs — for cross-pollination chips
  const r06Sections = r06?.sections.filter((s) => s.level === 2) ?? [];
  const r14Sections = r14?.sections.filter((s) => s.level === 2) ?? [];

  // Pull TL;DR bodies for hero blurb
  const tldr06 = r06?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";
  const tldr14 = r14?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  // Hunt for any table tagged "5-rule decision engine" or "alert-payload" — the
  // Move #6.10 substrate is a SCRIPT (not a research doc), so there is no
  // canonical research table; the layer-cards below surface the canonical
  // 13-field payload shape + 5-rule engine inline rather than via ResearchTable.
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Attribution health alert archive — Move #6.10 deferred hardening
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Attribution Health Alert Archive
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for the Move #6.10
          attribution-health-alert-webhook layer — the Track 9-12 hardening
          follow-up to Moves #6.5 / #6.6 / #6.7 / #6.8 / #6.9 that turns a
          per-cycle raw rollup JSON into one Slack-compatible alert per cycle
          (instead of 3-7 separate per-platform audits). Three layers:{" "}
          <strong>script</strong> (the 5-decision-rule engine + 13-field
          canonical alert-payload + 5 canonical webhook thresholds + stdlib
          urllib Slack-compatible POST in 24th script in the workspace,
          shipped 2026-07-03 per the hardening tick),{" "}
          <strong>playbook 06.10</strong> (the 13-section operator-build
          runbook with 7 H3 step subsections + 15 pitfalls + 10-gate
          verification A-J + 60:1 to 150:1 net annual ROI Path B at
          $1M-$5M Shopify-brand GMV, shipped 2026-07-09 per the
          operator-build tick), and{" "}
          <strong>asset 24</strong> (the 25 voice-variant Slack-compatible
          alert-payload templates [5 voices × 5 hypotheses] + 5-hypothesis
          triage decision-tree + 5-path alert-cadence decision matrix +
          Slack Block-Kit library + Linear-ticket-body-generator + 5-tier
          escalation-routing-policy + 12-section on-call-rotation-SOP +
          7-slide incident-postmortem + 4-amulet regression-detection
          cookbook, shipped 2026-07-10 per the operator-copy tick).
          Future-tick companions per playbooks/06.10 §Next moves: the
          canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring
          script that takes operator-supplied webhook-URL-config +
          alert-archive-storage-cost + cooldown-seconds-tuning +
          Slack-channel-on-call-rotation-coverage as inputs → outputs
          Path A hermetic-local-archive-only / Path B DEFAULT
          Slack-webhook + Linear-fallback / Path C multi-channel-PagerDuty
          + Opsgenie + Slack + Linear recommendation + the canonical
          6th-and-final static-dashboard layer
          `dashboards/attribution-health-alert-archive.html` (severity-timeline
          + per-platform-failure-heatmap + root-cause-hypothesis-frequency-table
          read off the `.alerts/` archive directory). This page surfaces all
          three layers in one place so you can stop tab-switching between{" "}
          <code className="rounded bg-muted px-1">/playbooks</code>,{" "}
          <code className="rounded bg-muted px-1">/assets</code>, and{" "}
          <code className="rounded bg-muted px-1">/scripts</code>.
        </p>
      </header>

      {/* === HERO METRICS === */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Path B default ROI</CardTitle>
            <CardDescription>
              $1M-$5M Shopify-brand GMV attribution-health-alert-webhook
              Path B DEFAULT Slack-webhook + Linear-fallback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              60:1 to 150:1
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Net annual ROI Path B $8/mo · Year-1 incremental revenue
              recovery $5k-$15k from 1 avoided attribution-regression incident
              + 30-50% faster triage vs per-platform-alerts baseline (60:1
              conservative net / 150:1 expected $1M GMV brand with 1
              attribution-regression incident/yr)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decision engine</CardTitle>
            <CardDescription>
              5-rule webhook dispatch engine + 13-field canonical payload +
              5 canonical webhook thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              5
              <span className="text-base text-muted-foreground font-normal ml-1">
                rules
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Rule 1 ANY per-platform fail · Rule 2 cross-platform drift ·
              Rule 3 match-rate drift &gt; 3.0pp · Rule 4 coverage drift
              &gt; 2.0pp · Rule 5 3600s cooldown · 13-field canonical
              payload [alert_id + timestamp + source + severity + title +
              summary + per_platform_breakdown + drift_summary +
              root_cause_hypothesis + remediation + overall_passed +
              thresholds_used + raw_rollup_path] · 5 canonical thresholds
              pinned by _canonical_thresholds_published() regression gate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice profiles</CardTitle>
            <CardDescription>
              5 voices × 5 hypotheses = 25 voice-variant alert templates
              gated on per-voice density ≥15
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              25
              <span className="text-base text-muted-foreground font-normal ml-1">
                cells
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Default=17 / Luxury=19 / Sustainable=18 / Gen-Z=15 / B2B=18
              each ≥15 PASS · 5 cross-platform attribution root-cause
              hypotheses [theme_liquid_update + capi_token_rotation +
              ios_consent_banner + app_uninstall + advanced_matching_toggle]
              from scripts/attribution_cross_platform_rollup.py lines 61-89
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert cadence</CardTitle>
            <CardDescription>
              5-path alert-cadence decision matrix + 5-tier escalation-routing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              5
              <span className="text-base text-muted-foreground font-normal ml-1">
                paths
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Path A $0-$500k GMV weekly archive-only / Path B DEFAULT
              $500k-$5M daily Slack-webhook + Linear-fallback $8/mo / Path C
              $5M-$25M every-4-hours Slack + Linear + PagerDuty-low-urgency
              $35/mo / Path D $25M+ enterprise hourly PagerDuty + Opsgenie
              $333/mo / Path E pre-revenue-pre-launch-defer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (cross-pollinated from research/06 + research/14) === */}
      {(tldr06 || tldr14) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              TL;DR (Move #6 + Move #6.8 + Move #6.10 substrate)
            </CardTitle>
            <CardDescription>
              The headline thesis — why one consolidated Slack-compatible
              alert per cycle (instead of 3-7 per-platform alerts) is the
              canonical 30-50% triage-time-reduction + 60:1 to 150:1 net
              annual ROI Path B DEFAULT layer for $500k+ Shopify-DTC brands
              with Move #6 Triple-Whale-attribution + #6.5/6.6/6.7
              per-platform audits + #6.8 cross-platform rollup orchestrator
              live
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tldr06 && (
              <p className="text-sm leading-relaxed text-foreground">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                  research/06 →
                </span>
                {tldr06
                  .replace(/\n+/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 600)}
                {tldr06.length > 600 ? "…" : ""}
              </p>
            )}
            {tldr14 && (
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                  research/14 →
                </span>
                {tldr14
                  .replace(/\n+/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 600)}
                {tldr14.length > 600 ? "…" : ""}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r06Sections.slice(0, 6).map((s) => (
                <Badge key={`r06-${s.heading}`} variant="outline">
                  research/06 · {s.heading}
                </Badge>
              ))}
              {r14Sections.slice(0, 6).map((s) => (
                <Badge key={`r14-${s.heading}`} variant="outline">
                  research/14 · {s.heading}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* === LAYER CARDS === */}
      <div className="flex flex-col gap-3">
        {/* 1st layer card — SCRIPT (Move #6.10 hardening substrate) */}
        <Card id="script-attribution-health-alert-webhook">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                SC-06.10
              </span>
              <CardTitle className="text-base">
                scripts/attribution_health_alert_webhook.py — Move #6.10
                attribution-health alert webhook (deferred-hardening script)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                5-rule engine · 13 fields · 5 thresholds · 38 tests
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /scripts/attribution_health_alert_webhook.py
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The canonical Track 9-12 hardening script (shipped 2026-07-03
              per commit <code>bad8c84</code>) — an Archetype C/D-light hybrid
              that consumes the Move #6.8 cross-platform attribution rollup
              JSON output (and optionally the Move #6.5/6.6/6.7 per-platform
              audit JSON outputs) → runs the canonical 5-decision-rule
              engine [Rule 1 ANY per-platform fail / Rule 2 cross-platform
              drift detected / Rule 3 match-rate drift &gt; 3.0pp / Rule 4
              coverage drift &gt; 2.0pp / Rule 5 3600s cooldown] →
              dispatches ONE consolidated Slack-compatible alert per cycle
              via stdlib urllib to a webhook URL (Slack-Incoming-Webhook
              fallback) OR writes to a local <code>.alerts/</code> archive
              directory. 13-field canonical alert-payload shape pinned by
              <code>_canonical_alert_shape_published()</code> regression
              gate + 5 canonical webhook thresholds pinned by{" "}
              <code>_canonical_thresholds_published()</code> regression
              gate. 3 exit codes [0=no-alert / 1=alert-fired / 2=webhook-POST-failed]
              + 3-mode CLI [default + <code>--bootstrap</code> +{" "}
              <code>--validate-thresholds</code>] + 6 mode-overrides [
              <code>--webhook-url</code> + <code>--cooldown-seconds</code> +{" "}
              <code>--skip-webhook</code> + <code>--skip-cooldown</code> +{" "}
              <code>--json</code> + <code>--alert-archive</code>] + 38 TDD
              tests across 20 test classes including 2 canonical regression
              gates (thresholds-pinned + alert-shape-pinned) + 5-rule
              decision engine tests + URL filter tests + rollup-load fallback
              tests + cooldown logic tests + archive-file-written tests + CLI
              smoke + bootstrap + validate-thresholds + subprocess roundtrip
              test class. Hermetic by default — when{" "}
              <code>--webhook-url</code> is omitted the script prints the
              alert payload to stdout and writes it to{" "}
              <code>--alert-archive</code>, so operators can dry-run the
              whole pipeline locally before wiring production.
            </p>
            <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
              <li>
                <strong>5-rule decision engine</strong> — Rule 1 fires on
                ANY per-platform <code>overall_passed=False</code>; Rule 2
                on cross-platform drift detected; Rule 3 on match-rate drift
                &gt; 3.0pp; Rule 4 on coverage drift &gt; 2.0pp; Rule 5
                enforces a 3600s cooldown so the same alert doesn&apos;t fire
                twice in the same cycle.
              </li>
              <li>
                <strong>13-field canonical payload</strong> pinned by{" "}
                <code>test_canonical_alert_shape_published</code> [
                <code>alert_id</code> + <code>timestamp</code> +{" "}
                <code>source</code> + <code>severity</code> +{" "}
                <code>title</code> + <code>summary</code> +{" "}
                <code>per_platform_breakdown</code> +{" "}
                <code>drift_summary</code> +{" "}
                <code>root_cause_hypothesis</code> +{" "}
                <code>remediation</code> + <code>overall_passed</code> +{" "}
                <code>thresholds_used</code> + <code>raw_rollup_path</code> ]
                — future contributors can&apos;t silently change which
                fields downstream consumers parse on without bumping the
                regression gate.
              </li>
              <li>
                <strong>5 canonical webhook thresholds</strong> pinned by{" "}
                <code>test_canonical_thresholds_published</code> [
                <code>fire_on_any_per_platform_fail: True</code> +{" "}
                <code>fire_on_cross_platform_drift: True</code> +{" "}
                <code>fire_on_match_rate_drift_pp: 3.0</code> +{" "}
                <code>fire_on_coverage_drift_pp: 2.0</code> +{" "}
                <code>cooldown_seconds: 3600</code> ].
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 2nd layer card — PLAYBOOK 06.10 (operator-build runbook) */}
        <Card id="playbook-06.10">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-06.10
              </span>
              <CardTitle className="text-base">
                playbook 06.10 — Move #6.10 attribution-health alert webhook
                launch (operator-build runbook)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                13 sections · 7 H3 steps · 15 pitfalls · 10 gates
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/06.10-attribution-health-alert-webhook-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p0610 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps the canonical Track 9-12 hardening script into a
                  13-section operator-build runbook with 7 H3 step
                  subsections [Step 1 install + Step 2 bootstrap + Step 3
                  validate-thresholds + Step 4 cron-wire + Step 5
                  Slack-format + Step 6 investigate-failures + Step 7
                  on-call-rotation] + canonical 15 numbered pitfalls each
                  with corrective Fix-line clustered into 5 failure modes
                  [A webhook-payload-shape-drift / B
                  alert-channel-routing-misconfiguration / C
                  hypothesis-matcher-evidence-too-thin / D
                  escalation-routing-policy-too-aggressive / E
                  on-call-rotation-coverage-too-thin] + canonical 10-gate
                  verification A-J [Gate A Install-Substrate / Gate B
                  Bootstrap / Gate C Validate-Thresholds / Gate D
                  Cron-Wire / Gate E Slack-Format / Gate F Dry-Run-Archive /
                  Gate G End-to-End-Firing / Gate H First-Real-Alert /
                  Gate I First-Week-Stable / Gate J Cost-ROI-Actual] +
                  canonical 5-path alert-cadence decision matrix [Path A
                  $0-$500k GMV weekly archive-only / Path B DEFAULT
                  $500k-$5M daily Slack-webhook + Linear-fallback $8/mo /
                  Path C $5M-$25M every-4-hours Slack + Linear +
                  PagerDuty-low-urgency $35/mo / Path D $25M+ enterprise
                  hourly PagerDuty + Opsgenie $333/mo / Path E
                  pre-revenue-pre-launch-defer] + canonical 60:1 to 150:1
                  net annual ROI Path B at $1M-$5M Shopify-brand GMV with 1
                  attribution-regression incident/yr (Path B $8/mo Slack +
                  Linear-fallback cost · $5k-$15k Year-1 incremental
                  revenue recovery from 1 avoided attribution-regression
                  incident + 30-50% faster triage vs per-platform-alerts
                  baseline = 60:1 conservative net / 150:1 expected $1M GMV
                  brand with 1 attribution-regression incident/yr per
                  Triple-Whale 2024 + Slack-Incoming-Webhooks 2024 +
                  Linear 2024 + PagerDuty-Events-API-v2 2024 +
                  Opsgenie 2024 + Klaviyo-Email-and-SMS 2024 + Postscript
                  2024 + Attentive 2024 benchmarks).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p0610.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/06.10 not found in content.json — regenerate
                content.json via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3rd layer card — ASSET 24 (operator-copy templates) */}
        <Card id="asset-24">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-24
              </span>
              <CardTitle className="text-base">
                asset 24 — Move #6.10 attribution-health alert payload
                templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 25 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/24-attribution-health-alert-payload-template.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a24 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-hypothesis Slack-compatible
                  alert-payload templates that an operator ships when
                  wiring the Move #6.10 webhook to a production Slack
                  channel. 5 voice profiles (Default / Luxury / Sustainable
                  / Gen-Z / B2B from assets/02-brand-voice.md) × 5
                  cross-platform attribution root-cause hypotheses
                  [theme_liquid_update + capi_token_rotation +
                  ios_consent_banner + app_uninstall +
                  advanced_matching_toggle] = 25 voice-variant
                  Slack-compatible alert-payload templates that pair each{" "}
                  <code>root_cause_hypothesis.id</code> to the corrective
                  action the operator should take in the first 15 minutes
                  of triage. Each variant lands the canonical 13-field
                  alert-payload shape [alert_id + timestamp + source +
                  severity + title + summary + per_platform_breakdown +
                  drift_summary + root_cause_hypothesis + remediation +
                  overall_passed + thresholds_used + raw_rollup_path] +
                  the hypothesis-specific remediation surfaced inline +
                  the 5-rule-decision-engine-result summarised + the
                  canonical 5 webhook thresholds echoed + the raw-rollup-path
                  for traceability. Also includes: the 5-hypothesis triage
                  decision-tree with 6 decision-tree-nodes each shipping
                  3 first-diagnostic-step variants matched to the
                  operator&apos;s stack + the canonical 10-block
                  Slack-Block-Kit library + the Linear-ticket-body-generator
                  template + the 5-tier escalation-routing-policy matrix +
                  the 12-section on-call-rotation-SOP template + the
                  7-slide incident-postmortem template + the 4-amulet
                  cross-platform attribution-regression detection cookbook.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a24.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                asset/24 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === FUTURE-TICK COMPANIONS FOOTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Future-tick companions (per playbooks/06.10 §Next moves)
          </CardTitle>
          <CardDescription>
            2 remaining Move #6.10 layers per canonical layer order:
            scoring-script + static-dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <strong>
                <code>
                  scripts/attribution_health_alert_unit_economics.py
                </code>{" "}
                (canonical 5th-layer Archetype A/B hybrid Path A/B/C
                scoring script)
              </strong>{" "}
              — takes operator-supplied webhook-URL-config +
              alert-archive-storage-cost + cooldown-seconds-tuning +
              Slack-channel-on-call-rotation-coverage as inputs →
              outputs Path A hermetic-local-archive-only / Path B
              DEFAULT Slack-webhook + Linear-fallback / Path C
              multi-channel-PagerDuty + Opsgenie + Slack + Linear
              recommendation + the canonical 60:1 to 150:1 Path B
              net annual ROI at $1M-$5M Shopify-brand GMV. Gated on the
              1st-layer hardening script + 2nd-layer operator-build
              playbook + 3rd-layer operator-copy asset all live (all 3
              shipped 2026-07-03 / 2026-07-09 / 2026-07-10).
            </li>
            <li>
              <strong>
                <code>dashboards/attribution-health-alert-archive.html</code>{" "}
                (canonical 6th-and-final static-dashboard layer)
              </strong>{" "}
              — a self-contained single-file static HTML dashboard with
              inline JS + Chart.js + raw SVG that reads the Move #6.10{" "}
              <code>.alerts/</code> archive directory and renders the
              alert-history as a 1-click operator surface
              (severity-timeline + per-platform-failure-heatmap +
              root-cause-hypothesis-frequency-table + raw-rollup-path-list
              + archive-browse). Compounds the Move #6.10 archive
              directory as a queryable substrate rather than a flat file
              store. Gated on the 1st-layer hardening script being live.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
