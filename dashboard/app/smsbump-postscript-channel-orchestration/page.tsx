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

export const metadata = {
  title: "SMSBump + Postscript Channel Orchestration — Ecommerce Ops",
};

export default function SmsbumpPostscriptChannelOrchestrationPage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r15 = findDoc(
    research,
    /15-smsbump-postscript-channel-orchestration\.md$/,
  );
  const p22 = playbooks.find(
    (p) => p.file === "22-smsbump-postscript-channel-orchestration-launch.md",
  );
  const a23 = assets.find(
    (a) => a.file === "23-smsbump-postscript-channel-orchestration-templates.md",
  );

  // Pull canonical tables out of research/15
  const pillar1 = findTable(
    research,
    /Pillar 1.*Postscript-primary-onboard/i,
  );
  const pillar2 = findTable(
    research,
    /Pillar 2.*SMSBump-international-SMS-onboard/i,
  );
  const pillar3 = findTable(
    research,
    /Pillar 3.*MMS-luxury-voice-SKU-SMS-launch/i,
  );
  const pillar4 = findTable(
    research,
    /Pillar 4.*Two-way-conversations-creator-cohort-launch/i,
  );
  const pillar5 = findTable(
    research,
    /Pillar 5.*SMS-cohort-LTV-attrition-1%-rule-iteration-cycle/i,
  );
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/15
  const topSections = r15?.sections.filter((s) => s.level === 2) ?? [];

  // Pull the TL;DR body for the hero blurb
  const tldr = r15?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          SMSBump + Postscript channel orchestration operator surface
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          SMSBump + Postscript Channel Orchestration
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a
          multi-channel-SMS-orchestration + international-SMS-via-SMSBump +
          DLR-deliverability-monitoring + MMS-for-luxury-voice +
          two-way-conversations-for-creator-cohort +
          RCS-Business-Messaging-for-Gen-Z-voice + SMS-attribution-via-Triple-Whale-SMS-merge
          + SMS-cohort-LTV-attrition-1%-rule-iteration layer on a US-based
          Shopify DTC brand at $1M-$50M GMV with 50k+ opted-in US SMS
          subscribers + Postscript-Move-#7-4-flow-shipped-6+-months-post-launch
          + Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-shipped +
          Triple-Whale-SMS-source-merge-cohort-overlay-instrumented +
          SMSBump-international-Shopify-Markets-integration-active OR
          Shopify-Markets-Basic-or-Pro-tier-shipped + Attentive-or-Postscript-Scale-tier-MMS-and-Inbox-conversational-engagement-Wired
          + DLR-monitoring-Suite-Wired-≥90-day-baseline +
          TCPA-compliance-disclosure-language-SOP-signed-by-legal-counsel +
          Move #1 + #4 + #5 + #6 + #6.5/6.6/6.7/6.8 + #7 + #8 + #11 + #13 +
          #14 + #15 + #15.x + #16 + #17 + #18 live. Three layers:{" "}
          <strong>research/15</strong> (the 5-pillar framework for the
          Postscript-primary-onboard + DLR-monitoring-Wire +
          Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay
          + SMSBump-international-SMS-onboard +
          international-multi-locale-SMSBump-orchestration +
          SMSBump-post-purchase-flow-launch + MMS-luxury-voice-SKU-SMS-launch
          + rich-media-attachments + video-previews +
          branded-unboxing-experience + two-way-conversations-creator-cohort-launch
          + RCS-business-messaging-Gen-Z-voice-Flash-Sale-launch +
          voice-profile-routing-inbox +
          SMS-cohort-LTV-attrition-1%-rule-iteration-cycle +
          SMS-deliverability-reach-cohort-overlay +
          5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
          layer), <strong>playbook 22</strong> (the 4-phase
          Postscript-primary-onboard + DLR-monitoring-Wire +
          Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay
          + SMS-cohort-LTV-iteration-cycle-baseline →
          MMS-luxury-voice-SKU-SMS-launch +
          two-way-conversation-creator-cohort-launch +
          RCS-Gen-Z-voice-Flash-Sale-launch +
          international-multi-locale-SMSBump-orchestration-launch +
          SMSBump-post-purchase-flow-launch →
          international-multi-locale-SMS-cohort-LTV-iteration +
          SMS-deliverability-reach-cohort-overlay-instrumentation +
          SMS-cohort-attrition-1%-rule-iteration-cycle +
          5-way-comparison-cycle + locale-by-locale-DLR-monitoring-Wired →
          Steady-state +
          SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle
          + SMS-deliverability-reach-cohort-overlay +
          5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
          + 12-24-month-compounding-SMS-orchestration-steady-state operator
          build), and <strong>asset 23</strong> (the paste-ready 12 artifacts
          — 25 voice-variant SMS-orchestration-templates [5 voices × 5
          SMS-orchestration-formats &#123;cart-abandon + browse-abandon + winback +
          replenishment + post-purchase&#125;] + 5-path SMS-orchestration-tools
          decision matrix [Path A Postscript-primary-only + DLR-monitoring-baseline
          / Path B DEFAULT SMSBump + Postscript + DLR + MMS +
          Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay
          / Path C full-SMS-orchestration-Postscript + SMSBump + Attentive +
          RCS-business-messaging + MMS + two-way-conversations +
          AI-orchestration-engine / Path D DLR-only-lightweight-orchestration
          / Path E pre-revenue / pre-launch / defer] +
          SMSBump-international-multi-locale-SMS-keyword-library covering
          7-canonical-locales [US-EN / UK-EN / CA-EN+FR / EU-DE+FR+IT+ES /
          AU-EN / JP-JA / BR-PT + MX-ES] with per-locale-TCPA-compliance-baseline
          + DLR-monitoring-segment-flagged-bounce-rate-recovery-templates
          covering 5-canonical-segments [post-purchase + international-SMS +
          high-frequency-bounce + seasonal + re-engagement] +
          MMS-luxury-voice-SKU-creative-baseline [5 specs × 5 voices = 25
          voice-variant MMS-templates] +
          two-way-conversation-creator-cohort-templates [5 voices] +
          RCS-Gen-Z-voice-Flash-Sale-templates [6 RCS-spec-card-types] +
          SMSBump-post-purchase-flow-templates [5 flows × 5 voices = 25
          voice-driven cells] +
          SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-template
          + SMS-deliverability-reach-cohort-overlay-instrumentation-template
          + 5-way-comparison-cycle-template). This page surfaces all three in
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
              $1M-$25M DTC+international GMV, SMSBump + Postscript + DLR +
              MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">3.5:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4:1 conservative (Path A
              Postscript-primary-only-baseline) / 2.5:1 muted (Path C
              full-SMS-orchestration-Enterprise)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental SMS-orchestration revenue
            </CardTitle>
            <CardDescription>
              Path B at $5M US DTC + $1M international base · 3-15%
              incremental revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $200k–$1.5M
              <span className="text-base text-muted-foreground font-normal ml-1">
                incremental SMS-orchestration-revenue
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $200k-$1.5M Path B Year-1 incremental
              SMS-orchestration-revenue / $14k-$85k total Year-1 cost = 2.4:1
              to 107:1 Year-1 ROI = &quot;great&quot; band · Year-2+ ramp to
              12-50:1 steady-state-compounding-SMS-orchestration-curve ·
              +20-40% SMS-list-growth-rate-vs-Postscript-only · +5-15%
              SMS-deliverability-vs-Postscript-only-baseline · +20-40%
              SMS-cohort-LTV-multiplier-vs-Postscript-only
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 22 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (Postscript-primary-onboard + DLR-monitoring-Wire +
              Klaviyo-SMS-segment-overlay +
              Triple-Whale-SMS-merge-cohort-overlay +
              SMS-cohort-LTV-iteration-cycle-baseline ~12hr Path B baseline
              Weeks 1-6) → 2 (MMS-luxury-voice-SKU-SMS-launch +
              two-way-conversation-creator-cohort-launch +
              RCS-Gen-Z-voice-Flash-Sale-launch +
              international-multi-locale-SMSBump-orchestration-launch +
              SMSBump-post-purchase-flow-launch ~24hr Weeks 7-24) → 3
              (international-multi-locale-SMS-cohort-LTV-iteration +
              SMS-deliverability-reach-cohort-overlay-instrumentation +
              SMS-cohort-attrition-1%-rule-iteration-cycle +
              5-way-comparison-cycle + locale-by-locale-DLR-monitoring-Wired
              ~16hr Weeks 25-48) → 4 (Steady-state +
              SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration +
              SMS-deliverability-reach-cohort-overlay +
              5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
              + 12-24-month-compounding-SMS-orchestration-steady-state ~12hr
              Weeks 49-72 + 4-8 hr/wk ongoing +
              dedicated-SMS-orchestration-team in Year-2+)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 23 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 5 SMS-orchestration-formats ·
              SMS-orchestration-templates
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
              Cart-abandon + browse-abandon + winback + replenishment +
              post-purchase · 25 SMS-orchestration-templates · all 5 voices
              ≥15 (Default=27 / Luxury=27 / Sustainable=26 / Gen-Z=76 / B2B=56)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === TL;DR (from research/15) === */}
      {r15 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/15)</CardTitle>
            <CardDescription>
              The headline thesis — why SMSBump + Postscript Channel
              Orchestration is the canonical 3-15% Year-1 incremental revenue
              + +20-40% SMS-list-growth-rate-vs-Postscript-only + +5-15%
              SMS-deliverability-vs-Postscript-only-baseline + +20-40%
              SMS-cohort-LTV-multiplier-vs-Postscript-only layer for $1M+ DTC
              + international brands with Postscript Move #7 live 6+ months +
              50k+ opted-in US SMS subscribers + Klaviyo-email-substrate +
              Triple-Whale-attribution
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
        <Card id="research-15">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-15
              </span>
              <CardTitle className="text-base">
                research/15-smsbump-postscript-channel-orchestration
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 11 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/15-smsbump-postscript-channel-orchestration.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 22 maps into a 4-phase
              SMSBump + Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay
              + Triple-Whale-SMS-merge launch ladder (Phase 1
              Postscript-primary-onboard + DLR-monitoring-Wire +
              Klaviyo-SMS-segment-overlay +
              Triple-Whale-SMS-merge-cohort-overlay +
              SMS-cohort-LTV-iteration-cycle-baseline ~12hr Path B baseline
              Weeks 1-6 · Phase 2 MMS-luxury-voice-SKU-SMS-launch +
              two-way-conversation-creator-cohort-launch +
              RCS-Gen-Z-voice-Flash-Sale-launch +
              international-multi-locale-SMSBump-orchestration-launch +
              SMSBump-post-purchase-flow-launch ~24hr Weeks 7-24 · Phase 3
              international-multi-locale-SMS-cohort-LTV-iteration +
              SMS-deliverability-reach-cohort-overlay-instrumentation +
              SMS-cohort-attrition-1%-rule-iteration-cycle +
              5-way-comparison-cycle + locale-by-locale-DLR-monitoring-Wired
              ~16hr Weeks 25-48 · Phase 4 Steady-state +
              SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle
              + SMS-deliverability-reach-cohort-overlay +
              5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
              + 12-24-month-compounding-SMS-orchestration-steady-state ~12hr
              Weeks 49-72 + 4-8 hr/wk ongoing +
              dedicated-SMS-orchestration-team in Year-2+) and asset 23 turns
              into 25 paste-ready per-voice per-SMS-orchestration-format
              SMS-orchestration-templates. The five pillars below are the
              highest-leverage surfaces — the full doc ships Pillar 1
              (Postscript-primary-onboard + DLR-monitoring-Wire +
              Klaviyo-SMS-segment-overlay-onboard +
              Triple-Whale-SMS-merge-cohort-overlay-Wire with the canonical
              Postscript-Starter-or-Growth-or-Scale-tier-active +
              Move-#7-4-flow-shipped-6+-months-post-launch-verified +
              50k+-opted-in-US-SMS-subscribers + 5-deliverability-cohort-queries
              [SMS-bounce-rate-cohort + SMS-opt-out-rate-cohort +
              SMS-spam-complaint-rate-cohort + SMS-deliverability-rate-cohort
              + SMS-cohort-LTV-vs-baseline-cohort] +
              voice-profile-webhook-mapping-Wired + Klaviyo-RFM-cohort-SMS-trigger-Wired
              per Postscript 2024 + Attentive 2024 + Klaviyo 2024 +
              Triple-Whale 2024 + Sailthru 2024 benchmarks), Pillar 2
              (SMSBump-international-SMS-onboard +
              international-multi-locale-SMSBump-orchestration-launch +
              SMSBump-post-purchase-flow-launch with the canonical 7-canonical-locales
              [US-EN / UK-EN / CA-EN+FR / EU-DE+FR+IT+ES / AU-EN / JP-JA /
              BR-PT + MX-ES] with per-locale-SMS-keyword-cluster +
              per-locale-TCPA-compliance-baseline [TCPA-2024 + ICO-GDPR-PECR-2024
              + CASL-2024 + Loi-canneaux-PECR-2024 + GDPR-2024 + LSSI-2024 +
              Spam-Act-2003 + 特定商取引法-2024 + LGPD-2024 + LFPDPPP-2024] +
              SMSBump-international-cost-stack $100-$400/mo-for-Shopify-Markets-Basic
              + $500-$2k/mo-for-Shopify-Markets-Pro per SMSBump 2024 +
              SMSBump-international-Shopify-Markets-integration + locale-specific-SMS-routing
              + 30-180s-time-to-conversion-baseline benchmarks), Pillar 3
              (MMS-luxury-voice-SKU-SMS-launch + rich-media-attachments +
              video-previews + branded-unboxing-experience with the canonical
              5-specs [5-second-static-image-MMS + 5-second-video-MMS +
              rich-media-attachment-MMS + branded-unboxing-experience-MMS +
              video-preview-MMS] × 5 voices = 25 voice-variant MMS-templates
              + MMS-deliverability-monitoring-Wire per Postscript-MMS-launch-or-Attentive-MMS-launch-or-Klaviyo-MMS-channel-add-on
              + luxury-voice-content-2-3×-CTR-vs-text-SMS-baseline + 30-50%
              higher-conversion-vs-SMS-text-baseline benchmarks per MMS 2024
              + Postscript 2024 + Attentive 2024 + Klaviyo 2024 + SMSBump
              2024 benchmarks), Pillar 4 (Two-way-conversations-creator-cohort-launch
              + RCS-business-messaging-Gen-Z-voice-Flash-Sale-launch +
              voice-profile-routing-inbox with the canonical Inbox-by-Postscript-or-Attentive-Concierge
              + creator-response-routing + GSMA-RCS-2024-2-4×-SMS-engagement-rate-vs-SMS-text-baseline
              + 6-RCS-spec-card-types [Hero-card-template +
              Rich-media-card-template + Carousel-card-template +
              Read-receipt-card-template + Suggested-reply-card-template +
              Suggested-action-card-template] + 30-50% higher-conversion-vs-SMS-text-baseline
              benchmarks per GSMA-RCS 2024 + RCS-business-messaging 2024 +
              Inbox-by-Postscript 2024 + Attentive-Concierge 2024 +
              Move-#16-creator-economy-expansion-cohort-overlay benchmarks),
              and Pillar 5 (SMS-cohort-LTV-attrition-1%-rule-iteration-cycle +
              SMS-deliverability-reach-cohort-overlay-instrumentation +
              5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
              with the canonical Triple-Whale-2024-1%-rule-SMS-attrition-cohort-baseline
              + Sailthru-2024-canonical-1%-rule + 5-canonical-deliverability-cohort-queries
              + 5-way-comparison-cycle [SMS-orchestration-cohort-LTV vs
              SMS-Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs
              Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV at
              30/60/90/180-day-windows] + 4-tier SMS-cost-stack-decision-recipe
              [Tier 1 Postscript-primary + SMSBump-international-secondary
              $0-$2k/mo for $1M-$5M DTC+international brands / Tier 2
              Postscript-primary + SMSBump-international +
              Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge $1k-$5k/mo
              for $5M-$25M DTC+international brands / Tier 3
              Attentive-enterprise-primary + SMSBump-international +
              Postscript-secondary $5k-$25k/mo for $25M+ DTC+international
              brands / Tier 4 RCS-business-messaging-orchestration $5k-$50k/mo
              for $25M+ brands with mature-SMS-orchestration +
              global-RCS-rollout] per Triple-Whale 2024 + Sailthru 2024 +
              Postscript 2024 + Attentive 2024 + SMSBump 2024 + Klaviyo 2024 +
              GSMA-RCS 2024 + Two-way-conversations 2024 + RCS-business-messaging
              2024 + MMS 2024 benchmarks).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — Postscript-primary-onboard + DLR-monitoring-Wire +
                  Klaviyo-SMS-segment-overlay-onboard +
                  Triple-Whale-SMS-merge-cohort-overlay-Wire
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — SMSBump-international-SMS-onboard +
                  international-multi-locale-SMSBump-orchestration-launch +
                  SMSBump-post-purchase-flow-launch
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar3 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 3 — MMS-luxury-voice-SKU-SMS-launch +
                  rich-media-attachments + video-previews +
                  branded-unboxing-experience
                </div>
                <ResearchTable rows={pillar3} />
              </div>
            )}
            {pillar4 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 4 — Two-way-conversations-creator-cohort-launch +
                  RCS-business-messaging-Gen-Z-voice-Flash-Sale-launch +
                  voice-profile-routing-inbox
                </div>
                <ResearchTable rows={pillar4} />
              </div>
            )}
            {pillar5 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 5 — SMS-cohort-LTV-attrition-1%-rule-iteration-cycle +
                  SMS-deliverability-reach-cohort-overlay-instrumentation +
                  5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
                </div>
                <ResearchTable rows={pillar5} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($5M US DTC + $1M international
                  base, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-22">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-22
              </span>
              <CardTitle className="text-base">
                playbook 22 — SMSBump + Postscript channel orchestration
                launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 12 pitfalls · 4 gates · 8 prereqs
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/22-smsbump-postscript-channel-orchestration-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p22 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/15 section into a 4-phase SMSBump +
                  Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay +
                  Triple-Whale-SMS-merge launch ladder with paste-ready
                  Postscript-flow-builder OR Klaviyo-flow-SMS-builder OR
                  Attentive-flow-builder OR SMSBump-flow-builder OR
                  Twilio-direct-SMS-template + canonical 5-path
                  SMS-orchestration-launch-mode decision matrix [Path A
                  Postscript-primary-only + DLR-monitoring-baseline $0-$200
                  setup + $200-$500/mo &lt;$500k US-GMV 4:1 conservative-nominal
                  ROI / Path B DEFAULT SMSBump + Postscript + DLR + MMS +
                  Klaviyo-SMS-segment-overlay +
                  Triple-Whale-SMS-merge-cohort-overlay $2k-$25k setup +
                  $1k-$5k/mo $1M-$25M DTC+international GMV 3.5:1 default
                  Year-1 ROI / Path C full-SMS-orchestration-Postscript +
                  SMSBump + Attentive + RCS-business-messaging + MMS +
                  two-way-conversations + AI-orchestration-engine $25k-$100k
                  setup + $5k-$25k/mo $5M+ DTC+international GMV 2.5:1 ROI
                  muted by 6-12-month SMS-orchestration-build-cycle +
                  SMS-channel-attrition-management-maturity +
                  dedicated-team-cost / Path D DLR-only-lightweight-orchestration
                  $0-$200 setup + $0-$200/mo / Path E pre-revenue /
                  pre-launch / defer] + canonical 5-path tools decision
                  matrix [Path A Postscript-primary + SMSBump-international-secondary
                  / Path B DEFAULT Postscript-primary + SMSBump + Klaviyo-SMS-segment-overlay
                  + Triple-Whale-SMS-merge / Path C Attentive-enterprise-primary
                  + SMSBump-international + Postscript-secondary / Path D
                  DLR-only-lightweight-orchestration / Path E
                  pre-revenue-pre-launch-defer] + canonical 8-prereq SMSBump
                  + Postscript-channel-orchestration-onboarding-pack [Move
                  #1 + #4 + #5 + #6 + #6.5/6.6/6.7/6.8 + #7 + #8 + #11 +
                  #13 + #14 + #15 + #15.x + #16 + #17 + #18 live for ≥6
                  months / Postscript-Move-#7-4-flow-shipped-6+
                  months-post-launch + ≥50k opted-in US SMS subscribers /
                  Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-shipped
                  / Triple-Whale-SMS-source-merge-cohort-overlay-instrumented
                  / SMSBump-international-Shopify-Markets-integration-active
                  OR Shopify-Markets-Basic-or-Pro-tier-shipped /
                  Attentive-or-Postscript-Scale-tier-MMS-and-Inbox-conversational-engagement-Wired
                  / DLR-monitoring-Suite-Wired ≥90-day-baseline-engaged-daily-deliverability-rate
                  / TCPA-compliance-disclosure-language-SOP-signed-by-legal-counsel]
                  + canonical SMSBump-international-multi-locale-SMS-keyword-library
                  covering 7-canonical-locales [US-EN / UK-EN / CA-EN+FR /
                  EU-DE+FR+IT+ES / AU-EN / JP-JA / BR-PT + MX-ES] with
                  per-locale-SMS-keyword-cluster + per-locale-TCPA-compliance-baseline
                  + per-locale-SMS-segment-dayparting-baseline +
                  per-locale-SMS-deliverability-baseline-target ≥94%-97%
                  DLR-rate + canonical 5-segment DLR-monitoring-segment-flagged-bounce-rate-recovery-templates
                  [post-purchase + international-SMS + high-frequency-bounce +
                  seasonal + re-engagement] + canonical
                  SMS-deliverability-reach-cohort-overlay-instrumentation-template
                  [5 canonical deliverability-cohort-queries] + canonical
                  5-way-comparison-cycle-template [5 SMS-orchestration-cohorts
                  at 30/60/90/180-day-windows] + canonical
                  4-tier-SMS-cost-stack-decision-recipe [Tier 1
                  Postscript-primary + SMSBump-international-secondary
                  $0-$2k/mo / Tier 2 Postscript-primary + SMSBump-international
                  + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge
                  $1k-$5k/mo / Tier 3 Attentive-enterprise-primary +
                  SMSBump-international + Postscript-secondary $5k-$25k/mo /
                  Tier 4 RCS-business-messaging-orchestration $5k-$50k/mo] +
                  4 phase-by-phase verification gates A-D with 8 prereqs
                  each + 12 numbered pitfalls with corrective Fix lines
                  clustered into 6 failure modes [A
                  SMSBump-international-orchestration-prereq / B
                  DLR-monitoring-Wire-prereq / C MMS-luxury-voice-prereq /
                  D RCS-business-messaging-Gen-Z-voice-prereq / E
                  two-way-conversations-creator-cohort-prereq / F
                  operational cross-cutting] + 3.5:1 default Year-1 ROI Path
                  B at $5M US DTC + $1M international base ($200k-$1.5M Path
                  B incremental SMS-orchestration-revenue / $14k-$85k cost =
                  2.4:1 to 107:1 Year-1 ROI = &quot;great&quot; band;
                  Year-2+ ramp to 12-50:1
                  steady-state-compounding-SMS-orchestration-curve per
                  Postscript 2024 + SMSBump 2024 + Klaviyo 2024 + Attentive
                  2024 + GSMA-RCS 2024 + Triple-Whale 2024 +
                  Two-way-conversations 2024 + RCS-business-messaging 2024 +
                  MMS 2024 + Sailthru 2024 benchmarks; +20-40%
                  SMS-list-growth-rate-vs-Postscript-only + +5-15%
                  SMS-deliverability-vs-Postscript-only-baseline + +20-40%
                  SMS-cohort-LTV-multiplier-vs-Postscript-only
                  + 5-pillar-SMS-orchestration-framework + 7-locale-SMS-keyword-library).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p22.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/22 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-23">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-23
              </span>
              <CardTitle className="text-base">
                asset 23 — SMSBump + Postscript channel orchestration
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
              /assets/23-smsbump-postscript-channel-orchestration-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a23 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-SMS-orchestration-format
                  SMS-orchestration-templates an operator ships when launching
                  a multi-channel-SMS-orchestration + international-SMS-via-SMSBump
                  + DLR + MMS + Klaviyo-SMS-segment-overlay +
                  Triple-Whale-SMS-merge + Attentive-enterprise-secondary +
                  RCS-Business-Messaging + two-way-conversations +
                  SMS-cohort-LTV-channel on a $1M-$50M DTC+international
                  brand with 50k+ opted-in US SMS subscribers + mature-SMS-substrate
                  + Klaviyo-email-substrate-live +
                  Triple-Whale-attribution-substrate-live. 5 voice profiles
                  (Default / Luxury / Sustainable / Gen-Z / B2B from
                  assets/02-brand-voice.md) × 5 SMS-orchestration-formats
                  (cart-abandon + browse-abandon + winback + replenishment +
                  post-purchase) = 25 voice-variant SMS-orchestration-templates
                  wired to Postscript-flow-builder OR Klaviyo-flow-SMS-builder
                  OR Attentive-flow-builder OR SMSBump-flow-builder OR
                  Twilio-direct-SMS-template + canonical 5-path
                  SMS-orchestration-tools decision matrix [Path A
                  Postscript-primary-only + DLR-monitoring-baseline / Path B
                  DEFAULT SMSBump + Postscript + DLR + MMS +
                  Klaviyo-SMS-segment-overlay +
                  Triple-Whale-SMS-merge-cohort-overlay / Path C
                  full-SMS-orchestration-Postscript + SMSBump + Attentive +
                  RCS-business-messaging + MMS + two-way-conversations +
                  AI-orchestration-engine / Path D DLR-only-lightweight-orchestration
                  / Path E pre-revenue / pre-launch / defer] with
                  per-tier-cost [Postscript-Starter $0-$200/mo / Growth
                  $200-$800/mo / Scale $1k-$2k/mo for US-SMS-primary-substrate
                  + DLR-monitoring-Suite + Inbox-by-Postscript-conversational-engagement
                  + MMS-luxury-voice-SKU-launch +
                  SMS-deliverability-reach-cohort-overlay-instrumentation /
                  SMSBump-Basic $100-$400/mo + Pro $500-$2k/mo for
                  Shopify-Markets-international-SMS-orchestration +
                  multi-locale-SMS-routing + 5+
                  locale-specific-SMS-keyword-libraries +
                  locale-specific-TCPA-compliance-baseline +
                  locale-specific-DLR-monitoring +
                  locale-specific-SMS-cohort-LTV-iteration /
                  Klaviyo-Email-and-SMS $45/mo + Klaviyo-SMS-channel-add-on
                  $0-$100/mo for Klaviyo-SMS-segment-overlay +
                  voice-profile-webhook-mapping + Klaviyo-segment-SMS-source-attribution
                  + Attentive-enterprise-secondary $500-$2k/mo +
                  Sailthru-enterprise-SMS-at-scale with
                  deliverability-reach-cohort-overlay]. The 5-pillar
                  SMS-orchestration framework gates the
                  SMS-orchestration-creative-baseline = 5 voices × 5
                  SMS-orchestration-formats = 25 voice-variant
                  SMS-orchestration-templates with per-voice-paste-ready-SMS-template
                  + per-voice-SMS-keyword-density + per-voice-TCPA-compliance-disclosure-language-baseline
                  + per-voice-success-metrics [Default ≥2.5% CTR + ≥3% CVR /
                  Luxury ≥2.0% CTR + ≥2.5% CVR + MAP-policy-guardrail /
                  Sustainable ≥2.5% CTR + ≥3.5% CVR +
                  sustainability-mission-disclosure / Gen-Z ≥3.0% CTR + ≥3%
                  CVR + Gen-Z-trend-meme-cadence / B2B ≥1.5% CTR + ≥2% CVR +
                  B2B-keyword-cluster-trust-disclosure] + canonical
                  SMSBump-international-multi-locale-SMS-keyword-library
                  covering 7-canonical-locales [US-EN / UK-EN / CA-EN+FR /
                  EU-DE+FR+IT+ES / AU-EN / JP-JA / BR-PT + MX-ES] with
                  per-locale-SMS-keyword-cluster + per-locale-TCPA-compliance-baseline
                  + per-locale-SMS-segment-dayparting-baseline +
                  per-locale-SMS-deliverability-baseline-target ≥94%-97%
                  DLR-rate + canonical 5-segment
                  DLR-monitoring-segment-flagged-bounce-rate-recovery-templates
                  [post-purchase-bounce-segment-flagged +
                  international-SMS-bounce-segment-flagged +
                  high-frequency-bounce-segment-flagged +
                  seasonal-bounce-segment-flagged +
                  re-engagement-bounce-segment-flagged] with
                  per-segment-DLR-monitoring-Suite-Wire-spec +
                  per-segment-bounce-rate-baseline-target [≤3%-15%] +
                  per-segment-deliverability-recovery-template +
                  per-segment-success-metrics + canonical
                  MMS-luxury-voice-SKU-creative-baseline [5 specs × 5 voices
                  = 25 voice-variant MMS-templates] with per-voice-MMS-creative-pattern-categories
                  [lifestyle-rich-media-MMS + luxury-SKU-close-up-MMS +
                  branded-unboxing-MMS + luxury-testimonial-MMS] +
                  per-pattern-MMS-creative-brief-template +
                  per-pattern-success-metrics [CTR ≥0.7% / CVR ≥2.5% /
                  SMS-list-growth-rate ≥20% / DLR-rate ≥95% per MMS-2024 +
                  Postscript-2024-MMS-launch-2024 + Attentive-2024-MMS-launch
                  benchmarks] + canonical
                  two-way-conversation-creator-cohort-templates [5 voices]
                  with per-voice-inbox-routing-rule +
                  per-voice-creator-engagement-routing-template +
                  per-voice-creator-response-template +
                  per-voice-creator-engagement-LTV-iteration-template +
                  canonical RCS-Gen-Z-voice-Flash-Sale-templates [6
                  RCS-spec-card-types] with per-voice-RCS-Flash-Sale-template
                  + per-voice-GSMA-RCS-availability-verification-baseline +
                  canonical SMSBump-post-purchase-flow-templates [5 flows × 5
                  voices = 25 voice-driven cells] with per-flow-Triple-Whale-utm-tracking
                  + per-flow-Klaviyo-segment-trigger-recipe +
                  per-flow-30-180s-time-to-conversion-baseline + canonical
                  SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-template
                  [5-step recipe] + canonical
                  SMS-deliverability-reach-cohort-overlay-instrumentation-template
                  [5 canonical deliverability-cohort-queries] + canonical
                  5-way-comparison-cycle-template [5
                  SMS-orchestration-cohorts at 30/60/90/180-day-windows] + 12
                  numbered pitfalls with corrective Fix lines clustered into
                  6 failure modes.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a23.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a23.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/23 not found in content.json — regenerate.
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
            route — both pre-staged in research/15 §Next moves, playbook 22
            §Companion tool, and asset 23 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/smsbump_postscript_channel_orchestration_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C SMSBump + Postscript
              scorer that takes a brand&apos;s us_dtc_gmv +
              international_gmv_pct + sms_subscriber_count + voice_profile +
              has_postscript_move_7_6_months_post_launch +
              has_klaviyo_email_and_sms_or_klaviyo_sms_channel_addon +
              has_triple_whale_sms_source_merge_cohort_overlay +
              has_smsbump_international_shopify_markets_integration +
              has_attentive_or_postscript_scale_tier_mms_and_inbox +
              has_dlr_monitoring_suite_wired + has_tcpa_compliance_disclosure_sop
              + has_dedicated_sms_orchestration_team_capacity_hours_per_week
              + has_5_locale_specific_sms_keyword_libraries →
              outputs Path A (Postscript-primary-only +
              DLR-monitoring-baseline $0-$200 setup + $200-$500/mo
              &lt;$500k US-GMV 4:1 conservative nominal ROI) / Path B
              (SMSBump + Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay
              + Triple-Whale-SMS-merge-cohort-overlay DEFAULT $1M-$25M
              DTC+international GMV 3.5:1 default Year-1 ROI with
              $200k-$1.5M Path B incremental SMS-orchestration-revenue +
              3-15% Year-1 incremental revenue + +20-40%
              SMS-list-growth-rate-vs-Postscript-only + +5-15%
              SMS-deliverability-vs-Postscript-only-baseline + +20-40%
              SMS-cohort-LTV-multiplier-vs-Postscript-only at $5M US DTC +
              $1M international base) / Path C (full-SMS-orchestration-Postscript
              + SMSBump + Attentive + RCS-business-messaging + MMS +
              two-way-conversations + AI-orchestration-engine $5k-$25k/mo
              $5M+ DTC+international GMV 2.5:1 ROI muted by 6-12-month
              SMS-orchestration-build-cycle + SMS-channel-attrition-management-maturity
              + dedicated-team-cost) recommendation with cost stack + expected
              Year-1 incremental SMS-orchestration-revenue $200k-$1.5M Path
              B at $1M-$25M DTC+international base + +20-40%
              SMS-list-growth-rate-vs-Postscript-only + +5-15%
              SMS-deliverability-vs-Postscript-only-baseline + +20-40%
              SMS-cohort-LTV-multiplier-vs-Postscript-only + canonical
              5-path SMS-orchestration-launch-mode decision matrix +
              canonical 5-path-tools-decision-matrix [Path A Postscript-primary-only
              / Path B DEFAULT Postscript-primary + SMSBump + Klaviyo-SMS-segment-overlay
              + Triple-Whale-SMS-merge / Path C Attentive-enterprise-primary
              + SMSBump-international + Postscript-secondary / Path D
              DLR-only-lightweight-orchestration / Path E pre-revenue-pre-launch-defer]
              + 6 deferral gates [us_dtc_gmv &lt;$1M /
              sms_subscriber_count &lt;50k /
              international_gmv_pct &lt;5% / no-Move-#7-shipped /
              no-Klaviyo-email-substrate /
              no-Triple-Whale-attribution-substrate] + 3 downgrade gates
              [luxury-voice-without-MAP-policy-guardrails /
              sustainable-voice-without-sustainability-mission-disclosure /
              Gen-Z-voice-without-RCS-availability]. Pre-staged in research/15
              §Next moves + playbook 22 §Next moves + asset 23 §Related.
              Gated on the canonical 8 prereqs (Move #1 + #4 + #5 + #6 +
              #6.5/6.6/6.7/6.8 + #7 + #8 + #11 + #13 + #14 + #15 + #15.x
              + #16 + #17 + #18 live for ≥6 months /
              Postscript-Move-#7-4-flow-shipped-6+ months-post-launch +
              ≥50k opted-in US SMS subscribers /
              Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-shipped /
              Triple-Whale-SMS-source-merge-cohort-overlay-instrumented /
              SMSBump-international-Shopify-Markets-integration-active OR
              Shopify-Markets-Basic-or-Pro-tier-shipped /
              Attentive-or-Postscript-Scale-tier-MMS-and-Inbox-conversational-engagement-Wired
              / DLR-monitoring-Suite-Wired ≥90-day-baseline +
              TCPA-compliance-disclosure-language-SOP-signed-by-legal-counsel).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/smsbump-postscript-channel-orchestration-health.html
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering SMS-orchestration readiness (Path A/B/C
              tier indicator + monthly-GMV band +
              SMS-orchestration-team-capacity band) + per-platform readiness
              (5 canonical
              SMS-orchestration-platforms × {`{live/draft/staging/not-started}`}
              status: Postscript + SMSBump + Klaviyo-SMS-segment-overlay +
              Attentive + Sailthru) + per-path Year-1 incremental
              SMS-orchestration-revenue bar chart (Path A vs B vs C) +
              4-phase gate status (Gate A Postscript-primary-onboard +
              DLR-monitoring-Wire + Klaviyo-SMS-segment-overlay +
              Triple-Whale-SMS-merge-cohort-overlay +
              SMS-cohort-LTV-iteration-cycle-baseline / Gate B
              MMS-luxury-voice-SKU-SMS-launch +
              two-way-conversation-creator-cohort-launch +
              RCS-Gen-Z-voice-Flash-Sale-launch +
              international-multi-locale-SMSBump-orchestration-launch +
              SMSBump-post-purchase-flow-launch / Gate C
              international-multi-locale-SMS-cohort-LTV-iteration +
              SMS-deliverability-reach-cohort-overlay-instrumentation +
              SMS-cohort-attrition-1%-rule-iteration-cycle +
              5-way-comparison-cycle + locale-by-locale-DLR-monitoring-Wired
              / Gate D Steady-state +
              SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration +
              SMS-deliverability-reach-cohort-overlay +
              5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe
              + 12-24-month-compounding-SMS-orchestration-steady-state per
              playbook 22 §Verification gates 8 prereqs) +
              5-pillar-coverage-progress-bar +
              SMS-orchestration-creative-baseline-iteration-cadence +
              SMS-cohort-LTV-attrition-1%-rule-iteration-cycle +
              12-24-month-compounding-SMS-orchestration-steady-state as a
              1-click operator surface. Self-contained static HTML; mirrors
              the canonical 6-section + 4 canonical data structures +
              26-category Node smoke suite pattern from the marketplace /
              3PL / international-expansion / lifecycle-flow /
              subscription-program / affiliate-program / b2b-wholesale /
              tiktok-shop-live-commerce / creator-economy /
              pinterest-organic-discovery-seo-content-engine /
              amazon-dsp-amazon-attribution-audit static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
