import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResearchTable } from "@/components/research-table";
import { GenerativeAiEngineCalculator } from "@/components/generative-ai-engine-calculator";
import { content, findDoc, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "Generative AI Engine — Ecommerce Ops",
};

export default function GenerativeAiEnginePage() {
  const research = content.research;
  const playbooks = content.playbooks;
  const assets = content.assets;

  const r16 = findDoc(research, /16-generative-ai-engine\.md$/);

  const p23 = playbooks.find(
    (p) => p.file === "23-generative-ai-engine-launch.md",
  );
  const a26 = assets.find(
    (a) => a.file === "26-generative-ai-engine-templates.md",
  );

  // Pull the 5 canonical pillars + the cost-ROI table out of research/16
  const pillar1 = findTable(
    research,
    /Pillar 1.*GPT-4o-clone-voice-onboard/i,
  );
  const pillar2 = findTable(
    research,
    /Pillar 2.*AI-product-photography-iteration-cycle-launch/i,
  );
  const pillar3 = findTable(
    research,
    /Pillar 3.*AI-email-subject-line-iteration-cycle-launch/i,
  );
  const pillar4 = findTable(
    research,
    /Pillar 4.*AI-customer-service-response-baseline-launch/i,
  );
  const pillar5 = findTable(
    research,
    /Pillar 5.*Custom-trained-LLM-on-brand-voice-data-baseline/i,
  );
  const costRoi = findTable(research, /Cost & ROI estimate/i);

  // Top H2 sections of research/16 — for cross-pollination chips
  const r16Sections = r16?.sections.filter((s) => s.level === 2) ?? [];

  // Pull TL;DR body for hero blurb
  const tldr = r16?.sections.find((s) => s.heading === "TL;DR")?.body ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Generative AI Engine operator surface — Move #20
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Generative AI Engine
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The complete operator surface for launching a full-stack generative
          AI engine + AI-product-photography + AI-email-subject-line-iteration
          + AI-SMS-copy-iteration + AI-blog-post-generation +
          AI-product-description-iteration + AI-social-caption-iteration +
          AI-customer-service-response + AI-product-rec-feed-personalization
          + AI-search-relevance-tuning + AI-recommendation-engine +
          custom-trained-LLM-on-brand-voice-data +
          AI-orchestration-engine-quarterly-iteration layer on a US-based
          Shopify DTC brand at $1M-$50M GMV with mature Move #10
          AI-ad-creative-iteration live 6+ months + ≥50+ creatives/week
          creative-iteration-velocity + Triple-Whale-attribution live ≥6
          months + Klaviyo-email-substrate live ≥6 months +
          Postscript-SMS-substrate live ≥6 months + ≥$20k/yr ad-creative
          budget + 2-4 hr/wk creative-team + TCPA-compliance-baseline +
          Move #15.x TikTok-Shop live ≥3 months + Move #16
          creator-economy-expansion live ≥3 months. Three layers:{" "}
          <strong>research/16</strong> (the canonical 5-pillar framework for
          the GPT-4o-clone-voice-onboard +
          AI-orchestration-engine-baseline + Jasper + Copy.ai +
          Triple-Whale-AI-creative-cohort-overlay-Wire +
          AI-product-photography-iteration-cycle-launch +
          AI-blog-post-generation-baseline +
          AI-product-description-iteration-cycle-launch +
          AI-email-subject-line-iteration-cycle-launch +
          AI-SMS-copy-iteration-cycle-launch +
          AI-social-caption-iteration-cycle-launch +
          AI-customer-service-response-baseline-launch +
          AI-product-rec-feed-personalization-launch +
          AI-search-relevance-tuning-launch +
          AI-recommendation-engine-steady-state-launch +
          custom-trained-LLM-on-brand-voice-data-baseline +
          AI-orchestration-engine-quarterly-iteration +
          creative-cadence-automation-quarterly +
          creative-iteration-cycle-quarterly layer),{" "}
          <strong>playbook 23</strong> (the 4-phase GPT-4o-clone-voice-onboard
          + AI-orchestration-engine-baseline + Jasper-brand-voice-LLM +
          Copy.ai-ad-copy-iteration + Triple-Whale-AI-creative-cohort-overlay-Wire
          + AI-creative-iteration-cadence-baseline →
          AI-product-photography-iteration-cycle +
          AI-email-subject-line-iteration-cycle +
          AI-SMS-copy-iteration-cycle + AI-blog-post-generation-baseline +
          AI-product-description-iteration-cycle +
          AI-social-caption-iteration-cycle →
          AI-customer-service-response-baseline +
          AI-product-rec-feed-personalization +
          AI-search-relevance-tuning + AI-recommendation-engine-steady-state
          + custom-trained-LLM-on-brand-voice-data-baseline → Steady-state +
          custom-trained-LLM-quarterly-iteration +
          AI-orchestration-engine-quarterly-iteration +
          creative-cadence-automation-quarterly +
          creative-iteration-cycle-quarterly operator build), and{" "}
          <strong>asset 26</strong> (the paste-ready per-voice per-Pillar
          AI-orchestration-engine prompt-template library with 5 voices × 5
          Pillar deliverables = 25 voice-variant AI-engine prompts [Default /
          Luxury / Sustainable / Gen-Z / B2B] covering
          GPT-4o-clone-voice-onboard + Jasper + Copy.ai + Midjourney +
          ElevenLabs + Typeface + Gorgias + Nosto + Rebuy + Algolia +
          OpenAI-fine-tuning + Anthropic-Claude-fine-tuning + Cohere per
          AdCreative.ai 2024 + Moby 2024 + Pencil 2024 + Jasper 2024 +
          Typeface 2024 + Midjourney 2024 + Runway 2024 + Sora 2024 +
          ElevenLabs 2024 + Copy.ai 2024 + Smartwriter 2024 + OpenAI 2024 +
          Anthropic 2024 + Cohere 2024 + Gorgias 2024 + Nosto 2024 + Rebuy
          2024 + Algolia 2024 + Triple-Whale 2024 benchmarks). Future-tick
          companions per playbooks/23 §Future-tick: the canonical 5th-layer
          Archetype A/B hybrid Path A/B/C scoring script that takes
          operator-supplied us_dtc_gmv + creatives_per_week +
          has_move_10_shipped_6mo + has_triple_whale_attribution +
          has_klaviyo_email_substrate + has_postscript_sms_substrate +
          has_openai_api + has_ai_orchestration_engine +
          has_jasper_brand_voice_llm + has_copy_ai + has_midjourney +
          has_elevenlabs + has_typeface_brand_voice + voice_profile +
          capacity_hours_per_week + has_ai_engine_creative_baseline →
          outputs Path A/B/C recommendation with cost stack + Year-1
          incremental AI-revenue band + 5 deferral gates + 3 downgrade
          gates; and the canonical 6th-and-final static-dashboard layer.
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
              $1M-$25M DTC GMV, AI-orchestration-engine + Jasper + Copy.ai +
              Midjourney + ElevenLabs + Typeface + Triple-Whale-included
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">3:1</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-1 default · 4:1 conservative (Path A
              GPT-4o-clone-voice-only &lt;$1M US-GMV) / 2.5:1 muted (Path C
              custom-trained-LLM-on-brand-voice-data enterprise)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Year-1 incremental AI-revenue
            </CardTitle>
            <CardDescription>
              Path B at $5M US DTC base · 10-30% ROAS lift + 5-20% email-CTR
              lift + 10-30% organic-discovery-traffic lift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              $300k–$1.5M
              <span className="text-base text-muted-foreground font-normal ml-1">
                incremental AI-revenue
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              $300k-$1.5M Path B Year-1 incremental AI-revenue / $8k-$49k
              cost = 6:1 to 187:1 Year-1 ROI = &quot;great&quot; band ·
              Year-2+ ramp to 12-50:1 steady-state-compounding-AI-engine-curve
              · 2-4× creative-iteration-velocity + 50-70%
              creative-production-cost-savings + 30-50%
              customer-service-cost-savings + 5-15% AOV-lift
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
            <CardDescription>playbook 23 launch ladder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              4
              <span className="text-base text-muted-foreground font-normal ml-1">
                phases
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1 (GPT-4o-clone-voice-onboard +
              AI-orchestration-engine-baseline + Jasper + Copy.ai +
              Triple-Whale-AI-creative-cohort-overlay-Wire +
              AI-creative-iteration-cadence-baseline ~8hr Path B baseline
              Weeks 1-6) → 2 (AI-product-photography-iteration-cycle +
              AI-email-subject-line-iteration-cycle +
              AI-SMS-copy-iteration-cycle + AI-blog-post-generation-baseline
              + AI-product-description-iteration-cycle +
              AI-social-caption-iteration-cycle ~20hr Weeks 7-24) → 3
              (AI-customer-service-response-baseline +
              AI-product-rec-feed-personalization +
              AI-search-relevance-tuning +
              AI-recommendation-engine-steady-state +
              custom-trained-LLM-on-brand-voice-data-baseline ~10hr Weeks
              25-48) → 4 (Steady-state + custom-trained-LLM-quarterly +
              AI-orchestration-engine-quarterly +
              creative-cadence-automation-quarterly +
              creative-iteration-cycle-quarterly ~5hr Weeks 49-72 + 2-4
              hr/wk ongoing + dedicated-AI-engine-team in Year-2+)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset 26 voice-cells</CardTitle>
            <CardDescription>
              5 voices × 5 Pillar deliverables · AI-engine prompt-template
              library
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
              GPT-4o-clone-voice + AI-product-photography +
              AI-email-subject-line + AI-SMS-copy + AI-customer-service +
              AI-product-rec-feed + AI-search-relevance +
              AI-recommendation-engine + custom-trained-LLM-on-brand-voice-data
              · 25 voice-variant AI-engine prompts · all 5 voices ≥15
              (Default=33 / Luxury=33 / Sustainable=33 / Gen-Z=37 / B2B=44)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === GENERATIVE-AI-ENGINE PATH A/B/C SCORER (interactive, personalized) === */}
      <GenerativeAiEngineCalculator />

      {/* === TL;DR (from research/16) === */}
      {r16 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR (research/16)</CardTitle>
            <CardDescription>
              The headline thesis — why Generative AI Engine is the canonical
              10-30% Year-1 ROAS lift + 5-20% email-CTR lift + 10-30%
              organic-discovery-traffic lift + 2-4× creative-iteration-velocity
              + 50-70% creative-production-cost-savings + 30-50%
              customer-service-cost-savings layer for $1M+ DTC brands with
              Move #10 AI-ad-creative-iteration live 6+ months + 50+
              creatives/week + Triple-Whale + Klaviyo + Postscript + $20k+/yr
              ad-creative-budget
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
              {r16Sections.slice(0, 11).map((s) => (
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
        <Card id="research-16">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                RD-16
              </span>
              <CardTitle className="text-base">
                research/16-generative-ai-engine
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                synthesis · 5 pillars · 12 sections
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /research/16-generative-ai-engine.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The 5-pillar framework that playbook 23 maps into a 4-phase
              GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline +
              Jasper + Copy.ai + Triple-Whale-AI-creative-cohort-overlay-Wire +
              AI-creative-iteration-cadence-baseline →
              AI-product-photography-iteration-cycle +
              AI-email-subject-line-iteration-cycle +
              AI-SMS-copy-iteration-cycle + AI-blog-post-generation-baseline +
              AI-product-description-iteration-cycle +
              AI-social-caption-iteration-cycle →
              AI-customer-service-response-baseline +
              AI-product-rec-feed-personalization +
              AI-search-relevance-tuning +
              AI-recommendation-engine-steady-state +
              custom-trained-LLM-on-brand-voice-data-baseline → Steady-state
              + custom-trained-LLM-on-brand-voice-data-quarterly-iteration +
              AI-orchestration-engine-quarterly-iteration +
              creative-cadence-automation-quarterly +
              creative-iteration-cycle-quarterly launch ladder (Phase 1
              GPT-4o-clone-voice + AI-orchestration-engine + Jasper + Copy.ai
              + Triple-Whale-AI-creative-cohort-overlay-Wire +
              AI-creative-iteration-cadence-baseline ~8hr Path B baseline
              Weeks 1-6 · Phase 2 AI-product-photography-iteration-cycle +
              AI-email-subject-line-iteration-cycle +
              AI-SMS-copy-iteration-cycle + AI-blog-post-generation-baseline
              + AI-product-description-iteration-cycle +
              AI-social-caption-iteration-cycle ~20hr Weeks 7-24 · Phase 3
              AI-customer-service-response-baseline +
              AI-product-rec-feed-personalization +
              AI-search-relevance-tuning +
              AI-recommendation-engine-steady-state +
              custom-trained-LLM-on-brand-voice-data-baseline ~10hr Weeks
              25-48 · Phase 4 Steady-state +
              custom-trained-LLM-on-brand-voice-data-quarterly-iteration +
              AI-orchestration-engine-quarterly-iteration +
              creative-cadence-automation-quarterly +
              creative-iteration-cycle-quarterly ~5hr Weeks 49-72 + 2-4
              hr/wk ongoing + dedicated-AI-engine-team in Year-2+) and
              asset 26 turns into 25 paste-ready per-voice per-Pillar
              AI-orchestration-engine prompt-template library. The five
              pillars below are the highest-leverage surfaces — the full doc
              ships Pillar 1 (GPT-4o-clone-voice-onboard +
              AI-orchestration-engine-baseline + Jasper-brand-voice-LLM +
              Copy.ai-ad-copy-iteration +
              Triple-Whale-AI-creative-cohort-overlay-Wire with the canonical
              OpenAI-API-key-pair-Wired + Pencil Pro $1,500/mo OR Moby Pro
              $499/mo + Jasper-brand-voice-LLM $49-$125/mo +
              Copy.ai-ad-copy-iteration $49-$249/mo + Move-#10-AI-ad-creative-iteration-shipped-6+-months
              + 50+-creatives/week + Triple-Whale-AI-creative-cohort-overlay-Wired
              + Klaviyo-email-substrate-live + Postscript-SMS-substrate-live
              + ≥$20k/yr-ad-creative-budget + 2-4 hr/wk-creative-team +
              TCPA-compliance-baseline per AdCreative.ai 2024 + Moby 2024 +
              Pencil 2024 + Jasper 2024 + Copy.ai 2024 + Typeface 2024 +
              Triple-Whale 2024 benchmarks), Pillar 2
              (AI-product-photography-iteration-cycle-launch +
              AI-blog-post-generation-baseline +
              AI-product-description-iteration-cycle-launch with the
              canonical Midjourney-prompt-library + Stable-Diffusion-XL +
              Runway-product-video-preview + Sora-product-demo-iteration +
              Typeface-brand-visual-consistency-Wired +
              50-70%-creative-production-cost-savings +
              2-4×-creative-iteration-velocity-vs-photographer-baseline
              + Jasper-blog-post-iteration + Typeface-blog-post-brand-voice
              + Surfer-SEO-keyword-cluster + Clearscope-keyword-cluster +
              Jasper-product-description-iteration +
              Typeface-product-description-brand-voice +
              5-15%-product-page-CVR-lift-vs-AI-baseline per Midjourney 2024
              + Stable Diffusion 2024 + Runway 2024 + Sora 2024 + Typeface
              2024 + Jasper 2024 + Surfer-SEO 2024 + Clearscope 2024 +
              Shopify 2024 + Yotpo 2024 benchmarks), Pillar 3
              (AI-email-subject-line-iteration-cycle-launch +
              AI-SMS-copy-iteration-cycle-launch +
              AI-social-caption-iteration-cycle-launch with the canonical
              Jasper-subject-line-iteration + Copy.ai-subject-line-A/B-test
              + 50+-subject-line-variants-per-flow-per-week +
              5-20%-email-CTR-lift + Postscript-SMS-copy-iteration via
              Jasper + Copy.ai + 10-30%-SMS-CTR-lift +
              Jasper-social-caption-iteration + Copy.ai-social-caption +
              per-platform-format-Wired [Instagram + TikTok + Pinterest +
              LinkedIn] + 10-30%-social-engagement-rate-lift per Jasper 2024
              + Copy.ai 2024 + Typeface 2024 + Smartwriter 2024 + Postscript
              2024 + Later 2024 + Hootsuite 2024 benchmarks), Pillar 4
              (AI-customer-service-response-baseline-launch +
              AI-product-rec-feed-personalization-launch +
              AI-search-relevance-tuning-launch +
              AI-recommendation-engine-steady-state-launch with the
              canonical Gorgias-AI-Wired + Jasper-customer-service-response +
              brand-voice-Wired + 30-50%-customer-service-cost-savings +
              10-30%-customer-service-CSAT-lift + Nosto-AI-recommendation
              + Rebuy-AI-product-rec + 5-15%-AOV-lift + 10-30%-repeat-purchase-rate-lift
              + Algolia-AI-search-relevance + Searchspring-AI-search +
              5-15%-on-site-search-CVR-lift per Gorgias 2024 + Jasper 2024
              + Typeface 2024 + Zendesk-AI 2024 + Intercom-Fin-AI 2024 +
              Nosto 2024 + Rebuy 2024 + Algolia 2024 + Searchspring 2024 +
              Triple-Whale 2024 + Sailthru 2024 + Dynamic-Yield 2024
              benchmarks), and Pillar 5
              (Custom-trained-LLM-on-brand-voice-data-baseline +
              AI-orchestration-engine-quarterly-iteration +
              creative-cadence-automation-quarterly +
              creative-iteration-cycle-quarterly with the canonical
              OpenAI-fine-tuning-on-brand-voice-data +
              Anthropic-Claude-fine-tuning-on-brand-voice-data +
              brand-voice-fine-tune-cohort-of-50-100-prompts-and-responses
              + 10-30%-brand-voice-consistency-lift-vs-GPT-4o-only-baseline
              + AI-creative-velocity-tracking + 10-30%-creative-iteration-velocity-lift-per-quarter
              + AI-creative-iteration-cycle-quarterly-review +
              5-15%-creative-iteration-cycle-CVR-lift-per-quarter per
              OpenAI 2024 + Anthropic 2024 + Jasper 2024 + Typeface 2024 +
              Cohere 2024 + AdCreative.ai 2024 + Moby 2024 + Pencil 2024 +
              Triple-Whale 2024 + Sailthru 2024 benchmarks).
            </p>
            {pillar1 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 1 — GPT-4o-clone-voice-onboard +
                  AI-orchestration-engine-baseline + Jasper + Copy.ai +
                  Triple-Whale-AI-creative-cohort-overlay-Wire
                </div>
                <ResearchTable rows={pillar1} />
              </div>
            )}
            {pillar2 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 2 — AI-product-photography-iteration-cycle-launch +
                  AI-blog-post-generation-baseline +
                  AI-product-description-iteration-cycle-launch
                </div>
                <ResearchTable rows={pillar2} />
              </div>
            )}
            {pillar3 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 3 — AI-email-subject-line-iteration-cycle-launch +
                  AI-SMS-copy-iteration-cycle-launch +
                  AI-social-caption-iteration-cycle-launch
                </div>
                <ResearchTable rows={pillar3} />
              </div>
            )}
            {pillar4 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 4 — AI-customer-service-response-baseline-launch +
                  AI-product-rec-feed-personalization-launch +
                  AI-search-relevance-tuning-launch +
                  AI-recommendation-engine-steady-state-launch
                </div>
                <ResearchTable rows={pillar4} />
              </div>
            )}
            {pillar5 && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Pillar 5 — Custom-trained-LLM-on-brand-voice-data-baseline
                  + AI-orchestration-engine-quarterly-iteration +
                  creative-cadence-automation-quarterly +
                  creative-iteration-cycle-quarterly
                </div>
                <ResearchTable rows={pillar5} />
              </div>
            )}
            {costRoi && (
              <div>
                <div className="mb-1.5 text-xs font-medium">
                  Cost &amp; ROI estimate ($5M US DTC base, Path B scope)
                </div>
                <ResearchTable rows={costRoi} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="playbook-23">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                PB-23
              </span>
              <CardTitle className="text-base">
                playbook 23 — Generative AI Engine launch (operator build)
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                4 phases · 15 pitfalls · 4 gates · 39 prereqs
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /playbooks/23-generative-ai-engine-launch.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p23 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maps each research/16 section into a 4-phase
                  GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline
                  + Jasper-brand-voice-LLM + Copy.ai-ad-copy-iteration +
                  Triple-Whale-AI-creative-cohort-overlay-Wire +
                  AI-creative-iteration-cadence-baseline →
                  AI-product-photography-iteration-cycle +
                  AI-email-subject-line-iteration-cycle +
                  AI-SMS-copy-iteration-cycle +
                  AI-blog-post-generation-baseline +
                  AI-product-description-iteration-cycle +
                  AI-social-caption-iteration-cycle →
                  AI-customer-service-response-baseline +
                  AI-product-rec-feed-personalization +
                  AI-search-relevance-tuning +
                  AI-recommendation-engine-steady-state +
                  custom-trained-LLM-on-brand-voice-data-baseline →
                  Steady-state + custom-trained-LLM-quarterly-iteration +
                  AI-orchestration-engine-quarterly-iteration +
                  creative-cadence-automation-quarterly +
                  creative-iteration-cycle-quarterly launch ladder with
                  paste-ready OpenAI-API-key-pair-Wire +
                  Pencil-Pro-or-Moby-Pro-AI-orchestration-engine-onboarding
                  + Jasper-brand-voice-LLM-training +
                  Copy.ai-ad-copy-iteration-Wire +
                  Triple-Whale-AI-creative-cohort-overlay-Wire +
                  Midjourney-product-photography-prompt-library +
                  Stable-Diffusion-XL-product-photography +
                  Runway-product-video-preview +
                  Sora-product-demo-iteration +
                  Typeface-brand-visual-consistency-Wire +
                  Jasper-blog-post-iteration + Surfer-SEO-keyword-cluster +
                  Algolia-AI-search-relevance-Wire +
                  Nosto-AI-recommendation-engine-Wire +
                  Rebuy-AI-product-rec-Wire +
                  Gorgias-AI-customer-service-Wire +
                  OpenAI-fine-tuning-on-brand-voice-data + canonical 5-path
                  generative-AI-engine-launch-mode decision matrix [Path A
                  GPT-4o-clone-voice-only +
                  AI-orchestration-engine-baseline $0-$100 setup +
                  $20-$500/mo &lt;$1M US-GMV 4:1 conservative-nominal ROI /
                  Path B DEFAULT AI-orchestration-engine + Jasper + Copy.ai
                  + Midjourney + ElevenLabs $2k-$10k setup + $500-$2k/mo
                  $1M-$25M DTC GMV 3:1 default Year-1 ROI / Path C
                  custom-trained-LLM-on-brand-voice-data +
                  AI-orchestration-engine + Midjourney + Stable Diffusion +
                  Runway + Sora + ElevenLabs $10k-$50k setup + $2k-$10k/mo
                  $5M+ DTC+international GMV 2.5:1 ROI muted by 6-12-month
                  LLM-training-cycle + AI-attribution-cohort-overlay-maturity
                  + custom-trained-LLM-iteration-discipline / Path D
                  AI-ad-creative-iteration-light-GPT-4o-only-baseline
                  $0-$200 setup + $20-$200/mo / Path E
                  pre-launch-defer] + canonical 8-prereq
                  generative-AI-engine-onboarding-pack [Move #1 + #4 + #5 +
                  #6 + #7 + #8 + #10 + Move-#15.x-TikTok-Shop +
                  Move-#16-creator-economy + Playbook 19 + Asset 23 live /
                  Triple-Whale-attribution live ≥6 months /
                  Klaviyo-email-substrate live ≥6 months /
                  Postscript-SMS-substrate live ≥6 months / Move #10
                  AI-ad-creative-iteration shipped ≥6 months with ≥50+
                  creatives/week / $20k+/yr ad-creative-budget / 2-4 hr/wk
                  creative-team / TCPA-compliance-baseline / Move #15.x
                  TikTok-Shop live ≥3 months / Move #16
                  creator-economy-expansion live ≥3 months] + canonical
                  GPT-4o-clone-voice-onboarding-recipe covering
                  brand-voice-clone-Wire + 5-voice-profile-clones + per-voice
                  prompt-template-library + canonical
                  AI-orchestration-engine-platform-pick [AdCreative.ai vs Moby
                  vs Pencil vs Typeface] with per-platform cost-stack +
                  per-platform creative-iteration-velocity-baseline +
                  canonical AI-product-photography-prompt-library covering
                  5-voice-profile prompt-templates + brand-visual-consistency-Wired
                  via Typeface + canonical
                  AI-customer-service-response-prompt-library covering 5
                  canonical customer-service-scenarios [product-question +
                  shipping-question + return-question + refund-question +
                  subscription-question] + canonical
                  AI-product-rec-feed-personalization-recipe covering
                  5-voice-product-rec-feed-templates + canonical
                  AI-search-relevance-tuning-recipe covering
                  5-voice-search-query-templates + canonical
                  custom-trained-LLM-on-brand-voice-data-recipe covering
                  brand-content-corpus-of-50-100-samples + OpenAI-fine-tuning
                  + Anthropic-Claude-fine-tuning + quarterly-iteration-cycle
                  + 4 phase-by-phase verification gates A-D with 10/10/10/9
                  prereqs respectively = 39 prereqs + 15 numbered pitfalls
                  with corrective Fix lines clustered into 5 failure modes
                  [A GPT-4o-clone-voice-prereq / B
                  AI-orchestration-engine-prereq / C
                  AI-product-photography-prereq / D
                  AI-customer-service-prereq / E operational cross-cutting]
                  + 3:1 default Year-1 ROI Path B at $5M US DTC base
                  ($300k-$1.5M Path B incremental AI-revenue / $8k-$49k
                  cost = 6:1 to 187:1 Year-1 ROI = &quot;great&quot; band;
                  Year-2+ ramp to 12-50:1
                  steady-state-compounding-AI-engine-curve per AdCreative.ai
                  2024 + Moby 2024 + Pencil 2024 + Jasper 2024 + Typeface
                  2024 + Midjourney 2024 + Runway 2024 + Sora 2024 +
                  ElevenLabs 2024 + Copy.ai 2024 + Smartwriter 2024 +
                  OpenAI 2024 + Anthropic 2024 + Cohere 2024 + Gorgias 2024
                  + Nosto 2024 + Rebuy 2024 + Algolia 2024 + Triple-Whale
                  2024 + Sailthru 2024 benchmarks; 10-30% Year-1 ROAS lift +
                  5-20% email-CTR lift + 10-30% organic-discovery-traffic
                  lift + 2-4× creative-iteration-velocity + 50-70%
                  creative-production-cost-savings + 30-50%
                  customer-service-cost-savings + 5-15% AOV-lift
                  + 5-pillar-generative-AI-engine-framework +
                  4-phase-build + 5-path-decision-matrix +
                  13-metric-monitoring-dashboard +
                  4-gate-verification operator build).
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p23.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                playbook/23 not found in content.json — regenerate content.json
                via{" "}
                <code className="rounded bg-muted px-1">
                  cd dashboard &amp;&amp; node scripts/parse-content.mjs
                </code>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="asset-26">
          <CardHeader>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                AS-26
              </span>
              <CardTitle className="text-base">
                asset 26 — Generative AI Engine templates (paste-ready)
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
              >
                5-voice gated · 25 cells
              </Badge>
            </div>
            <CardDescription className="font-mono text-[11px]">
              /assets/26-generative-ai-engine-templates.md
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {a26 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The paste-ready per-voice per-Pillar AI-orchestration-engine
                  prompt-template library an operator ships when launching a
                  full-stack generative-AI-engine +
                  AI-product-photography-iteration-cycle +
                  AI-blog-post-generation-baseline +
                  AI-product-description-iteration-cycle +
                  AI-email-subject-line-iteration-cycle +
                  AI-SMS-copy-iteration-cycle +
                  AI-social-caption-iteration-cycle +
                  AI-customer-service-response-baseline +
                  AI-product-rec-feed-personalization +
                  AI-search-relevance-tuning +
                  AI-recommendation-engine-steady-state +
                  custom-trained-LLM-on-brand-voice-data +
                  AI-orchestration-engine-quarterly-iteration +
                  creative-cadence-automation-quarterly +
                  creative-iteration-cycle-quarterly on a $1M-$50M DTC brand
                  with mature Move #10 AI-ad-creative-iteration shipped 6+
                  months + ≥50+ creatives/week creative-iteration-velocity
                  + Triple-Whale-attribution live + Klaviyo-email live +
                  Postscript-SMS live + ≥$20k/yr ad-creative-budget + 2-4
                  hr/wk creative-team. 5 voice profiles (Default / Luxury /
                  Sustainable / Gen-Z / B2B from assets/02-brand-voice.md)
                  × 5 Pillar deliverables (Pillar 1
                  ai_creative_substrate_baseline GPT-4o-clone-voice + Jasper
                  + Copy.ai + Triple-Whale-AI-creative-cohort-overlay-Wire /
                  Pillar 2 ai_product_content_iteration Midjourney
                  product-photography + Jasper blog-post + Jasper
                  product-description / Pillar 3 ai_channel_copy_iteration
                  Jasper subject-line + Postscript SMS-copy + social-caption
                  / Pillar 4 ai_conversion_and_service_substrate Gorgias
                  CS-response + Nosto product-rec-feed + Algolia
                  search-relevance + Rebuy recommendation-engine / Pillar 5
                  custom_trained_llm_quarterly_iteration OpenAI fine-tuning
                  + Anthropic Claude + Cohere + quarterly-iteration-cycle)
                  = 25 voice-variant AI-engine prompt-template wired to
                  GPT-4o-clone-voice + Jasper-brand-voice-LLM +
                  Copy.ai-ad-copy-iteration + Midjourney-product-photography
                  + Stable-Diffusion-XL + Runway-product-video-preview +
                  Sora-product-demo-iteration + ElevenLabs-voice-clone +
                  Typeface-brand-voice + Gorgias-AI-customer-service +
                  Nosto-AI-recommendation + Rebuy-AI-product-rec +
                  Algolia-AI-search-relevance + OpenAI-fine-tuning +
                  Anthropic-Claude-fine-tuning + Cohere-fine-tuning with
                  canonical 10-field prompt-payload shape [prompt_id +
                  source + voice_profile + target_engine + deliverable_type +
                  system_prompt + user_prompt_template +
                  brand_voice_anchors + expected_output_shape +
                  success_criteria] pinned by future
                  _canonical_prompt_payload_shape_published() regression
                  gate + canonical 5-path generative-AI-engine-launch-mode
                  decision matrix [Path A GPT-4o-clone-voice-only /
                  Path B DEFAULT AI-orchestration-engine + Jasper + Copy.ai
                  + Midjourney + ElevenLabs / Path C
                  custom-trained-LLM-on-brand-voice-data / Path D
                  AI-ad-creative-iteration-light-GPT-4o-only-baseline /
                  Path E pre-launch defer] with per-tier-cost
                  [Pencil-Pro $1,500/mo OR Moby-Pro $499/mo for
                  AI-orchestration-engine / Jasper-Starter $49/mo OR
                  Jasper-Boss-Mode $125/mo for brand-voice-LLM /
                  Copy.ai-Pro $49-$249/mo for ad-copy-iteration /
                  Midjourney-Basic $10/mo OR Standard $30/mo OR Pro $60/mo
                  for product-photography / Stable-Diffusion-XL $0-$50/mo
                  for product-imagery / Runway-Standard $15/mo OR Pro $95/mo
                  for product-video-preview / Sora-Starter $20/mo OR Pro
                  $200/mo for product-demo-iteration /
                  ElevenLabs-Starter $5/mo OR Creator $22/mo OR Pro $330/mo
                  for voice-clone-SMS-narration / Typeface-Starter $30/mo
                  OR Pro $300/mo for brand-voice-LLM /
                  Triple-Whale-Starter $179/mo OR Pro $1,290/mo for
                  AI-creative-cohort-overlay]. The 5-pillar framework gates
                  the AI-orchestration-engine-creative-baseline = 5 voices
                  × 5 Pillar deliverables = 25 voice-variant AI-engine
                  prompts with per-voice-paste-ready-system-prompt +
                  per-voice-user-prompt-template + per-voice-brand-voice-anchors
                  + per-voice-expected-output-shape + per-voice-success-criteria
                  [Default ≥15 voice-density / Luxury ≥15 voice-density +
                  MAP-policy-guardrail / Sustainable ≥15 voice-density +
                  sustainability-mission-disclosure / Gen-Z ≥15
                  voice-density + Gen-Z-trend-meme-cadence / B2B ≥15
                  voice-density + B2B-keyword-cluster-trust-disclosure] +
                  canonical AI-product-photography-prompt-library covering
                  5 voice-profile product-photography prompt-templates +
                  brand-visual-consistency-Wired via Typeface + canonical
                  AI-customer-service-response-prompt-library covering 5
                  canonical customer-service-scenarios [product-question +
                  shipping-question + return-question + refund-question +
                  subscription-question] with per-voice
                  AI-customer-service-response-prompt + canonical
                  AI-product-rec-feed-personalization-recipe covering 5
                  voice-profile product-rec-feed-templates + canonical
                  AI-search-relevance-tuning-recipe covering 5 voice-profile
                  search-query-templates + canonical
                  custom-trained-LLM-on-brand-voice-data-recipe covering
                  brand-content-corpus-of-50-100-samples + OpenAI-fine-tuning
                  + Anthropic-Claude-fine-tuning +
                  quarterly-iteration-cycle + 12 numbered pitfalls with
                  corrective Fix lines clustered into 6 failure modes.
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a26.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a26.voiceCounts ?? {}).map(([voice, count]) => (
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
                asset/26 not found in content.json — regenerate.
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
            route — both pre-staged in research/16 §Next moves, playbook 23
            §Future-tick, and asset 26 §Related
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
            <li>
              <code className="rounded bg-muted px-1">
                scripts/generative_ai_engine_unit_economics.py
              </code>{" "}
              +{" "}
              <code className="rounded bg-muted px-1">
                scripts/tests/test_generative_ai_engine_unit_economics.py
              </code>{" "}
              — Archetype A/B hybrid Path A/B/C generative-AI-engine scorer
              that takes a brand&apos;s us_dtc_gmv + creatives_per_week +
              has_move_10_shipped_6mo + has_triple_whale_attribution +
              has_klaviyo_email_substrate + has_postscript_sms_substrate +
              has_openai_api + has_ai_orchestration_engine +
              has_jasper_brand_voice_llm + has_copy_ai + has_midjourney +
              has_elevenlabs + has_typeface_brand_voice + voice_profile +
              has_dedicated_ai_engine_team_capacity_hours_per_week +
              has_ai_engine_creative_baseline → outputs Path A
              (GPT-4o-clone-voice-only + AI-orchestration-engine-baseline
              $20-$500/mo &lt;$1M US-GMV 4:1 conservative nominal ROI) /
              Path B DEFAULT (AI-orchestration-engine + Jasper + Copy.ai +
              Midjourney + ElevenLabs + Typeface +
              Triple-Whale-AI-creative-cohort-overlay $500-$2k/mo
              $1M-$25M DTC GMV 3:1 default Year-1 ROI with $300k-$1.5M Path
              B incremental AI-revenue + 10-30% Year-1 ROAS lift + 5-20%
              email-CTR lift + 10-30% organic-discovery-traffic lift +
              2-4× creative-iteration-velocity + 50-70%
              creative-production-cost-savings + 30-50%
              customer-service-cost-savings + 5-15% AOV-lift at $5M US DTC
              base) / Path C (custom-trained-LLM-on-brand-voice-data +
              AI-orchestration-engine + Midjourney + Stable Diffusion +
              Runway + Sora + ElevenLabs $2k-$10k/mo $5M+ DTC+international
              GMV 2.5:1 ROI muted by 6-12-month LLM-training-cycle +
              AI-attribution-cohort-overlay-maturity +
              custom-trained-LLM-iteration-discipline) recommendation
              with cost stack + expected Year-1 incremental AI-revenue
              $300k-$1.5M Path B at $5M US DTC base + 10-30% Year-1 ROAS
              lift + 5-20% email-CTR lift + 10-30% organic-discovery-traffic
              lift + canonical 5-path
              generative-AI-engine-launch-mode decision matrix + 5 deferral
              gates [us_dtc_gmv &lt;$1M / creatives_per_week &lt;50 /
              has_move_10_shipped_6mo=False /
              has_triple_whale_attribution=False /
              has_klaviyo_email_substrate=False /
              has_postscript_sms_substrate=False / has_openai_api=False /
              has_ai_orchestration_engine=False /
              has_jasper_brand_voice_llm=False /
              has_voice_profile_webhook_mapping_wired=False / capacity &lt;4
              hr/wk / has_ai_engine_creative_baseline=False] + 3 downgrade
              gates [luxury-voice without AI-engine-creative-baseline →
              downgrade / B2B-voice without
              AI-customer-service-response-baseline → downgrade / Path-C
              without dedicated-AI-engine-team → downgrade to B]. Pre-staged
              in research/16 §Next moves + playbook 23 §Future-tick +
              asset 26 §Related. Gated on the canonical 8 prereqs (Move
              #1 + #4 + #5 + #6 + #7 + #8 + #10 + Move-#15.x-TikTok-Shop +
              Move-#16-creator-economy + Playbook 19 + Asset 23 live /
              Triple-Whale-attribution live ≥6 months /
              Klaviyo-email-substrate live ≥6 months /
              Postscript-SMS-substrate live ≥6 months / Move #10
              AI-ad-creative-iteration shipped ≥6 months with ≥50+
              creatives/week / $20k+/yr ad-creative-budget / 2-4 hr/wk
              creative-team / TCPA-compliance-baseline / Move #15.x
              TikTok-Shop live ≥3 months / Move #16
              creator-economy-expansion live ≥3 months).
            </li>
            <li>
              <code className="rounded bg-muted px-1">
                dashboards/generative-ai-engine-health.html
              </code>{" "}
              +{" "}
              <code className="rounded bg-muted px-1">
                dashboards/tests/test_generative_ai_engine_health.js
              </code>{" "}
              — canonical 6th-and-final static-dashboard layer per the
              v0.11.0 extended layer order research → playbook → asset →
              operator-surface-route → script → static-dashboard. Static
              HTML dashboard rendering generative-AI-engine readiness (Path
              A/B/C tier indicator + monthly-GMV band + AI-engine-team-capacity
              band) + per-platform readiness (5 canonical AI-engine-platforms
              × {`{live/draft/staging/not-started}`} status: GPT-4o-clone-voice
              + Jasper-brand-voice-LLM + Copy.ai-ad-copy-iteration +
              Midjourney-product-photography + ElevenLabs-voice-clone) +
              per-path Year-1 incremental AI-revenue bar chart (Path A vs B
              vs C) + 4-phase gate status (Gate A
              GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline +
              Jasper + Copy.ai + Triple-Whale-AI-creative-cohort-overlay-Wire
              + AI-creative-iteration-cadence-baseline / Gate B
              AI-product-photography-iteration-cycle +
              AI-email-subject-line-iteration-cycle +
              AI-SMS-copy-iteration-cycle + AI-blog-post-generation-baseline
              + AI-product-description-iteration-cycle +
              AI-social-caption-iteration-cycle / Gate C
              AI-customer-service-response-baseline +
              AI-product-rec-feed-personalization +
              AI-search-relevance-tuning +
              AI-recommendation-engine-steady-state +
              custom-trained-LLM-on-brand-voice-data-baseline / Gate D
              Steady-state + custom-trained-LLM-quarterly-iteration +
              AI-orchestration-engine-quarterly-iteration +
              creative-cadence-automation-quarterly +
              creative-iteration-cycle-quarterly per playbook 23
              §Verification gates 10/10/10/9 prereqs) +
              5-pillar-coverage-progress-bar +
              AI-engine-creative-baseline-iteration-cadence +
              AI-creative-cohort-LTV-vs-AI-only-cohort-LTV-vs-no-AI-cohort-LTV
              3-way-comparison-cycle +
              12-24-month-compounding-AI-engine-steady-state as a 1-click
              operator surface. Self-contained static HTML; mirrors the
              canonical 6-section + 4 canonical data structures +
              28-category Node smoke suite pattern from the marketplace /
              3PL / international-expansion / lifecycle-flow /
              subscription-program / affiliate-program / b2b-wholesale /
              tiktok-shop-live-commerce / creator-economy /
              pinterest-organic-discovery-seo-content-engine /
              amazon-dsp-amazon-attribution-audit /
              smsbump-postscript-channel-orchestration /
              attribution-weekly-rollup-trend /
              attribution-health-alert-archive static dashboards.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}