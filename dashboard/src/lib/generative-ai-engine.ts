/**
 * Browser-side port of `scripts/generative_ai_engine_unit_economics.py`.
 *
 * Mirrors the Python scoring rule:
 *   - us_dtc_gmv < $1M    -> Path A (GPT-4o-clone-voice-only + AI-orchestration-engine-baseline)
 *   - us_dtc_gmv $1M-$25M -> Path B DEFAULT
 *   - us_dtc_gmv $25M+    -> Path C (custom-trained-LLM-on-brand-voice-data)
 *
 * 5 deferral gates and 3 downgrade gates apply per
 * `research/16-generative-ai-engine.md` §Prerequisites +
 * `playbooks/23-generative-ai-engine-launch.md` §Phase 1.
 */

export type GenerativeAiPath = "A" | "B" | "C";
export type VoiceProfile =
  | "default"
  | "luxury"
  | "sustainable"
  | "gen_z"
  | "b2b";

export interface GenerativeAiInputs {
  usDtcGmv: number;                          // US DTC GMV ($)
  creativesPerWeek: number;                  // current creative throughput / week
  capacityHoursPerWeek: number;              // operator / AI-engine team hr/wk
  voiceProfile: VoiceProfile;
  hasMove10AiAdCreative6mo: boolean;          // Move #10 shipped 6+ months
  hasTripleWhaleAttribution: boolean;        // Move #6 attribution live 6+ months
  hasKlaviyoEmailSubstrate: boolean;          // Move #5 Klaviyo + 5+ flows live 6+ months
  hasPostscriptSmsSubstrate: boolean;         // Move #7 Postscript + 4+ SMS flows live 6+ months
  hasAiEngineCreativeBaseline: boolean;       // any prior AI-creative iteration running
  hasAiCustomerServiceBaseline: boolean;      // Gorgias-AI / Zendesk-AI / Intercom-Fin wired
  hasDedicatedAiEngineTeam: boolean;          // dedicated owner vs generalist operator
  hasOpenaiApi: boolean;                       // OpenAI GPT-4o API key on file
  hasAiOrchestrationEngine: boolean;           // Pencil / Moby / AdCreative.ai / Typeface wired
  hasJasperBrandVoiceLlm: boolean;             // Jasper brand-voice model trained
}

export interface GenerativeAiRecommendation {
  path: GenerativeAiPath;
  baseTier: GenerativeAiPath;
  isDeferred: boolean;
  deferralReasons: string[];
  downgradeReasons: string[];
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;

  oneTimeCost: [number, number];
  recurringMonthlyCost: [number, number];
  year1Cost: [number, number];

  incrementalRevenueSharePct: [number, number];
  year1IncrementalRevenue: [number, number];

  roasLiftPct: [number, number];
  emailCtrLiftPct: [number, number];
  organicDiscoveryLiftPct: [number, number];
  creativeIterationVelocityMultiplier: [number, number];
  creativeProductionCostSavingsPct: [number, number];

  buildCycleMonths: [number, number];
  year1Roi: [number, number];

  pillarMatrix: { pillar: string; description: string }[];
  buildSequence: string[];
}

export const GENERATIVE_AI_DEFAULTS: GenerativeAiInputs = {
  usDtcGmv: 3_000_000,
  creativesPerWeek: 60,
  capacityHoursPerWeek: 6,
  voiceProfile: "default",
  hasMove10AiAdCreative6mo: true,
  hasTripleWhaleAttribution: true,
  hasKlaviyoEmailSubstrate: true,
  hasPostscriptSmsSubstrate: true,
  hasAiEngineCreativeBaseline: true,
  hasAiCustomerServiceBaseline: false,
  hasDedicatedAiEngineTeam: false,
  hasOpenaiApi: true,
  hasAiOrchestrationEngine: false,
  hasJasperBrandVoiceLlm: false,
};

// ----- Path costs & projections (mirrors the Python) -----
const PATH_COSTS: Record<GenerativeAiPath, [number, number, number, number]> = {
  A: [500.0, 2_000.0, 20.0, 500.0],
  B: [2_000.0, 50_000.0, 500.0, 2_565.0],
  C: [50_000.0, 250_000.0, 3_656.0, 6_044.0],
};
const PATH_REVENUE_SHARE_PCT: Record<GenerativeAiPath, [number, number]> = {
  A: [2.0, 5.0],
  B: [3.0, 15.0],
  C: [5.0, 25.0],
};
const PATH_ROAS_LIFT_PCT: Record<GenerativeAiPath, [number, number]> = {
  A: [5.0, 15.0],
  B: [10.0, 30.0],
  C: [15.0, 40.0],
};
const PATH_EMAIL_CTR_LIFT_PCT: Record<GenerativeAiPath, [number, number]> = {
  A: [2.0, 8.0],
  B: [5.0, 20.0],
  C: [10.0, 30.0],
};
const PATH_ORGANIC_LIFT_PCT: Record<GenerativeAiPath, [number, number]> = {
  A: [3.0, 10.0],
  B: [10.0, 30.0],
  C: [15.0, 40.0],
};
const PATH_VELOCITY_MULT: Record<GenerativeAiPath, [number, number]> = {
  A: [1.5, 2.0],
  B: [2.0, 4.0],
  C: [3.0, 6.0],
};
const PATH_COST_SAVINGS_PCT: Record<GenerativeAiPath, [number, number]> = {
  A: [30.0, 50.0],
  B: [50.0, 70.0],
  C: [60.0, 80.0],
};
const PATH_BUILD_MONTHS: Record<GenerativeAiPath, [number, number]> = {
  A: [1, 3],
  B: [6, 18],
  C: [12, 24],
};
const PATH_ROI: Record<GenerativeAiPath, [number, number]> = {
  A: [4.0, 250.0],
  B: [6.0, 187.0],
  C: [2.0, 6.0],
};
const PATH_RANK: Record<GenerativeAiPath, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, GenerativeAiPath> = { 0: "A", 1: "B", 2: "C" };

const PATH_PLATFORMS: Record<GenerativeAiPath, string[]> = {
  A: [
    "OpenAI GPT-4o-clone-voice API ($20-$200/mo)",
    "AI-orchestration-engine-baseline via AdCreative.ai Standard $249/mo OR Moby Starter $149/mo (Move #10 entry-tier)",
  ],
  B: [
    "AI-orchestration-engine via Pencil Pro $1,500/mo OR Moby Pro $499/mo (Path B DEFAULT)",
    "Jasper-brand-voice-LLM ($49-$125/mo)",
    "Copy.ai-ad-copy-iteration ($49-$249/mo)",
    "Midjourney-product-photography ($10-$60/mo)",
    "ElevenLabs-voice-clone-SMS-narration ($5-$22/mo)",
    "Typeface-brand-voice-LLM ($30-$300/mo)",
    "Triple-Whale-Starter-or-Pro-with-AI-creative-cohort-overlay ($179-$1,290/mo)",
  ],
  C: [
    "OpenAI-fine-tuning-on-brand-voice-data ($200-$2,000/mo)",
    "Anthropic-Claude-fine-tuning-on-brand-voice-data",
    "AI-orchestration-engine via Pencil Pro $1,500/mo + Moby Pro $499/mo",
    "Midjourney-product-photography ($10-$120/mo) + Stable-Diffusion-XL-product-photography",
    "Runway-product-video-preview ($15-$95/mo) + Sora-product-demo-iteration ($20-$200/mo)",
    "ElevenLabs-voice-clone-SMS-narration ($22-$330/mo)",
    "Typeface-brand-voice-LLM ($300-$1,000/mo)",
    "Triple-Whale-Pro-with-AI-creative-cohort-overlay ($1,290/mo)",
  ],
};

const PATH_DEFAULT_PLATFORM_PICK: Record<GenerativeAiPath, string> = {
  A: "OpenAI GPT-4o-clone-voice API + AdCreative.ai Standard or Moby Starter (Move #10 entry-tier)",
  B: "AI-orchestration-engine via Pencil Pro or Moby Pro + Jasper-brand-voice-LLM + Copy.ai + Midjourney + ElevenLabs + Typeface + Triple-Whale-Starter-or-Pro",
  C: "OpenAI-fine-tuning + Anthropic-Claude-fine-tuning + AI-orchestration-engine + Midjourney + Stable Diffusion + Runway + Sora + ElevenLabs + Typeface + Triple-Whale-Pro",
};

const PILLAR_MATRIX: { pillar: string; description: string }[] = [
  {
    pillar: "Pillar 1 — Voice clone + orchestration + Jasper + Copy.ai + Triple-Whale cohort overlay",
    description:
      "OpenAI GPT-4o-clone-voice onboarded with brand-voice API keys + AI-orchestration-engine (Pencil Pro $1,500/mo or Moby Pro $499/mo) + Jasper brand-voice LLM trained on 50-100 brand-content samples + Copy.ai ad-copy iteration (50+ variants/week baseline) + Triple-Whale AI-creative-cohort overlay at 30/60/90/180-day LTV windows.",
  },
  {
    pillar: "Pillar 2 — AI product photography + blog + product description iteration",
    description:
      "Midjourney prompt library + Stable Diffusion XL + Runway + Sora + Typeface brand-visual consistency → 50-70% creative-production-cost savings + 2-4x creative-iteration velocity vs photographer baseline. Jasper + Typeface blog iteration drives 10-30% organic-discovery-traffic lift. Jasper + Typeface product description iteration drives 5-15% product-page CVR lift.",
  },
  {
    pillar: "Pillar 3 — AI email subject line + SMS copy + social caption iteration",
    description:
      "Jasper + Copy.ai subject-line iteration with 50+ variants per flow per week → 5-20% email-CTR lift. Postscript SMS copy iteration → 10-30% SMS-CTR lift. Per-platform social caption iteration (IG vs TikTok vs Pinterest vs LinkedIn) → 10-30% social-engagement-rate lift.",
  },
  {
    pillar: "Pillar 4 — AI customer service + product-rec feed + search relevance + recommendation engine",
    description:
      "Gorgias-AI + Jasper customer-service response with brand-voice → 30-50% CS-cost savings + 10-30% CSAT lift. Nosto + Rebuy + Triple-Whale AI-product-rec overlay → 5-15% AOV lift + 10-30% repeat-purchase-rate lift. Algolia + Searchspring AI-search-relevance → 5-15% on-site-search CVR lift.",
  },
  {
    pillar: "Pillar 5 — Custom-trained LLM on brand-voice data + quarterly iteration cadence",
    description:
      "OpenAI fine-tuning + Anthropic-Claude fine-tuning on 50-100 brand prompts + responses → 10-30% brand-voice-consistency lift vs GPT-4o-only baseline. Quarterly creative-iteration cadence with AI-orchestration-engine quarterly review → 10-30% creative-iteration-velocity lift per quarter. 12-24-month compounding steady-state typically achieves 2-4x LTV multiplier Year-2+ vs AI-only baseline.",
  },
];

const BUILD_SEQUENCES: Record<GenerativeAiPath, string[]> = {
  A: [
    "Pick Path A — GPT-4o-clone-voice API + AdCreative.ai Standard or Moby Starter baseline. Confirm $20-$500/mo budget + 4-8 hr/wk operator capacity.",
    "Spin up OpenAI GPT-4o account → feed 30-50 brand-voice samples (website copy + emails + ad copy) → write voice-profile prompt library.",
    "Wire AI-orchestration-engine baseline (AdCreative.ai Standard or Moby Starter) → generate 50+ ad-copy variants per week → A/B test against current control.",
    "Connect Triple-Whale AI-creative-cohort overlay → read 30-day LTV per cohort → iterate the prompt library against the highest-LTV cohort weekly.",
    "After 30 days at 4-8 hr/wk, review Path-A 2-5% Year-1 incremental AI-engine revenue band — if GMV growth justifies, upgrade to Path B.",
    "Path A → Path B upgrade gate: GMV crosses $1M + Move #10 has 6+ months of weekly creative iteration + Triple Whale has 6+ months of cohort overlays.",
  ],
  B: [
    "Pick Path B DEFAULT — Pencil Pro or Moby Pro + Jasper + Copy.ai + Midjourney + ElevenLabs + Typeface + Triple-Whale. Confirm $500-$2,565/mo recurring + 6-12 hr/wk AI-engine team capacity.",
    "Phase 1 (Weeks 1-6): Onboard GPT-4o-clone-voice + Jasper-brand-voice-LLM + Copy.ai + AI-orchestration-engine + Triple-Whale cohort overlay. 50+ ad-copy variants/week cadence live.",
    "Phase 2 (Weeks 7-24): Layer on Midjourney product-photography + Jasper blog iteration + Jasper product-description iteration + AI email/SMS/social caption iteration. Triple-Whale cohort overlay tracking lifts by Move.",
    "Phase 3 (Weeks 25-48): Layer on Gorgias-AI customer-service response + Nosto/Rebuy product-rec feed + Algolia/Searchspring AI-search-relevance. Move #14 lifecycle-flow library fully AI-iterated.",
    "Phase 4 (Weeks 49-72): Steady-state + quarterly cadence. Review 3-15% Year-1 incremental AI-engine revenue band vs $5M base. Plan custom-trained-LLM upgrade (Path C) if GMV crosses $25M.",
    "Path B → Path C upgrade gate: GMV crosses $25M + dedicated AI-engine team of 3+ FTE + Move #14 lifecycle library at 12+ AI-iterated flows + Triple-Whale Pro live.",
  ],
  C: [
    "Pick Path C — OpenAI fine-tuning + Anthropic-Claude fine-tuning + Pencil Pro + Moby Pro + Midjourney + Stable Diffusion + Runway + Sora + ElevenLabs + Typeface + Triple-Whale Pro. Confirm $3,656-$6,044/mo recurring + dedicated AI-engine team of 3-5 FTE.",
    "Phase 1 (Months 1-6): OpenAI fine-tuning on 1,000+ brand-voice samples + Anthropic-Claude fine-tuning + AI-orchestration-engine Pro stack + Triple-Whale Pro cohort overlay.",
    "Phase 2 (Months 7-12): Midjourney + Stable Diffusion + Runway + Sora creative-studio build + ElevenLabs voice-clone-narration + Typeface brand-voice-LLM at production scale.",
    "Phase 3 (Months 13-18): 4-week creative-iteration cadence baseline + per-voice density profile (Default / Luxury / Sustainable / Gen-Z / B2B) + Triple-Whale Pro LTV-by-cohort overlay weekly review.",
    "Phase 4 (Months 19-24): Steady-state + quarterly iteration + 5-25% Year-1 incremental AI-engine revenue band realized at $25M+ GMV base.",
    "Steady-state operation: 12-24-month compounding AI-engine typically achieves 2-4x LTV multiplier Year-2+ vs AI-only baseline per Triple-Whale 2024 3-way comparison.",
  ],
};

const MIN_CREATIVES_PER_WEEK = 50;
const CAPACITY_GATE_HR_WK = 4;

// ----- Scoring --------------------------------------------------------------

export function recommendPath(
  inputs: GenerativeAiInputs,
): GenerativeAiRecommendation {
  const baseTier = _tierForGmv(inputs.usDtcGmv);

  // Deferral gates.
  const deferralReasons: string[] = [];
  if (inputs.creativesPerWeek < MIN_CREATIVES_PER_WEEK) {
    deferralReasons.push(
      `creatives_per_week=${inputs.creativesPerWeek} < canonical ${MIN_CREATIVES_PER_WEEK} (research/16 §Prereq: canonical 50+ creatives/week seed-AI-iteration-velocity; defer Move #20 until AI-iteration-velocity-reaches-${MIN_CREATIVES_PER_WEEK}+-per-week OR launch-Move-#10-AI-ad-creative-iteration-first).`,
    );
  }
  if (!inputs.hasMove10AiAdCreative6mo) {
    deferralReasons.push(
      "has_move_10_ai_ad_creative_6mo=False (research/16 §Prereq: Move #10 AI-ad-creative-iteration shipped 6+ months with weekly-creative-iteration cadence of 50+ creatives/week; defer Move #20 until Move #10 verifies 6+ months post-launch).",
    );
  }
  if (!inputs.hasTripleWhaleAttribution) {
    deferralReasons.push(
      "has_triple_whale_attribution=False (research/16 §Prereq: Triple-Whale attribution live 6+ months with cohort-LTV overlays working; defer Move #20 until Move #6 Triple-Whale attribution verifies 6+ months live).",
    );
  }
  if (!inputs.hasKlaviyoEmailSubstrate) {
    deferralReasons.push(
      "has_klaviyo_email_substrate=False (research/16 §Prereq: Klaviyo email substrate live 6+ months with 5+ active flows — Move #1 cart-abandon + Move #4 welcome + Move #5 Klaviyo-migration + Move #8 loyalty + Move #14 lifecycle-flow-library; defer Move #20 until Move #5 verifies 6+ months live).",
    );
  }
  if (!inputs.hasPostscriptSmsSubstrate) {
    deferralReasons.push(
      "has_postscript_sms_substrate=False (research/16 §Prereq: Postscript SMS substrate live 6+ months with 4+ active SMS flows — Move #7 SMS-welcome + cart-abandon 1 + cart-abandon 2 + review-request; defer Move #20 until Move #7 verifies 6+ months live).",
    );
  }
  if (inputs.capacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    deferralReasons.push(
      `capacity_hours_per_week=${inputs.capacityHoursPerWeek} < canonical ${CAPACITY_GATE_HR_WK} (research/16 §Prereq: canonical 4-8 hr/wk Path B minimum; defer Move #20 until creative-team-capacity is available).`,
    );
  }

  // Downgrade gates.
  const downgradeReasons: string[] = [];
  let effectiveTierRank = PATH_RANK[baseTier];
  if (
    inputs.voiceProfile === "luxury" &&
    !inputs.hasAiEngineCreativeBaseline &&
    effectiveTierRank > PATH_RANK.A
  ) {
    effectiveTierRank -= 1;
    downgradeReasons.push(
      "voice_profile=luxury without has_ai_engine_creative_baseline (research/16 §Prereq: Luxury-voice brands need AI-engine-creative-baseline for branded-unboxing-experience + MAP-policy-guardrail per Faire-2024 + Ankorstore-2024; downgrade one Path tier).",
    );
  }
  if (
    inputs.voiceProfile === "b2b" &&
    !inputs.hasAiCustomerServiceBaseline &&
    effectiveTierRank > PATH_RANK.A
  ) {
    effectiveTierRank -= 1;
    downgradeReasons.push(
      "voice_profile=b2b without has_ai_customer_service_response_baseline (research/16 §Prereq: B2B-voice brands need AI-customer-service-response-baseline for B2B-keyword-cluster-trust-disclosure per Gorgias-2024-B2B-CS-segmentation; downgrade one Path tier).",
    );
  }
  if (
    baseTier === "C" &&
    !inputs.hasDedicatedAiEngineTeam &&
    effectiveTierRank > PATH_RANK.B
  ) {
    effectiveTierRank = PATH_RANK.B;
    downgradeReasons.push(
      "path=C without has_dedicated_ai_engine_team (research/16 Pillar 5: Path C requires dedicated-AI-engine-team for LLM-training-cycle + AI-orchestration-engine-quarterly-iteration + custom-trained-LLM-on-brand-voice-data-baseline; downgrade Path C to Path B).",
    );
  }

  const effectiveTier = RANK_PATH[effectiveTierRank];

  const [oneTimeLow, oneTimeHigh, recLow, recHigh] = PATH_COSTS[effectiveTier];
  const [incShareLow, incShareHigh] = PATH_REVENUE_SHARE_PCT[effectiveTier];
  const [roasLow, roasHigh] = PATH_ROAS_LIFT_PCT[effectiveTier];
  const [emailLow, emailHigh] = PATH_EMAIL_CTR_LIFT_PCT[effectiveTier];
  const [orgLow, orgHigh] = PATH_ORGANIC_LIFT_PCT[effectiveTier];
  const [velLow, velHigh] = PATH_VELOCITY_MULT[effectiveTier];
  const [saveLow, saveHigh] = PATH_COST_SAVINGS_PCT[effectiveTier];
  const [buildLow, buildHigh] = PATH_BUILD_MONTHS[effectiveTier];
  const [roiLow, roiHigh] = PATH_ROI[effectiveTier];

  const year1CostLow = oneTimeLow + recLow * 12;
  const year1CostHigh = oneTimeHigh + recHigh * 12;

  const incRevLow = inputs.usDtcGmv * (incShareLow / 100);
  const incRevHigh = inputs.usDtcGmv * (incShareHigh / 100);

  let justification: string;
  if (deferralReasons.length > 0) {
    justification =
      `DEFER (Path ${baseTier} surfaced as audit only — ${deferralReasons.length} deferral gate(s) must be lifted before launching Path ${effectiveTier}, ${incShareLow}-${incShareHigh}% Year-1 incremental AI-engine revenue share, ${roiLow}-${roiHigh}x Year-1 ROI at $${inputs.usDtcGmv.toLocaleString()} base). Gating: ` +
      deferralReasons.join(" ") +
      (downgradeReasons.length > 0 ? ` Downgrade: ${downgradeReasons.join(" ")}` : "");
  } else if (downgradeReasons.length > 0) {
    justification =
      `Path ${effectiveTier} (downgraded from Path ${baseTier} by ${downgradeReasons.length} downgrade gate(s); ${incShareLow}-${incShareHigh}% Year-1 incremental AI-engine revenue share, ${roiLow}-${roiHigh}x Year-1 ROI). Downgrade: ` +
      downgradeReasons.join(" ");
  } else {
    justification = `Path ${effectiveTier} (canonical tier for $${inputs.usDtcGmv.toLocaleString()} US DTC GMV; ${incShareLow}-${incShareHigh}% Year-1 incremental AI-engine revenue share, ${roiLow}-${roiHigh}x Year-1 ROI).`;
  }

  return {
    path: effectiveTier,
    baseTier,
    isDeferred: deferralReasons.length > 0,
    deferralReasons,
    downgradeReasons,
    platforms: PATH_PLATFORMS[effectiveTier],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[effectiveTier],
    justification,
    oneTimeCost: [oneTimeLow, oneTimeHigh],
    recurringMonthlyCost: [recLow, recHigh],
    year1Cost: [year1CostLow, year1CostHigh],
    incrementalRevenueSharePct: [incShareLow, incShareHigh],
    year1IncrementalRevenue: [incRevLow, incRevHigh],
    roasLiftPct: [roasLow, roasHigh],
    emailCtrLiftPct: [emailLow, emailHigh],
    organicDiscoveryLiftPct: [orgLow, orgHigh],
    creativeIterationVelocityMultiplier: [velLow, velHigh],
    creativeProductionCostSavingsPct: [saveLow, saveHigh],
    buildCycleMonths: [buildLow, buildHigh],
    year1Roi: [roiLow, roiHigh],
    pillarMatrix: PILLAR_MATRIX,
    buildSequence: BUILD_SEQUENCES[effectiveTier],
  };
}

function _tierForGmv(usGmv: number): GenerativeAiPath {
  if (usGmv >= 25_000_000) return "C";
  if (usGmv >= 1_000_000) return "B";
  return "A";
}

// ----- Helpers --------------------------------------------------------------

export function validateGenerativeAiInputs(input: unknown): GenerativeAiInputs {
  const obj = (input ?? {}) as Partial<GenerativeAiInputs>;
  const voiceOptions: VoiceProfile[] = [
    "default",
    "luxury",
    "sustainable",
    "gen_z",
    "b2b",
  ];
  const voice = voiceOptions.includes(obj.voiceProfile as VoiceProfile)
    ? (obj.voiceProfile as VoiceProfile)
    : GENERATIVE_AI_DEFAULTS.voiceProfile;

  return {
    usDtcGmv: clampNumber(Number(obj.usDtcGmv), 0, 1_000_000_000, GENERATIVE_AI_DEFAULTS.usDtcGmv),
    creativesPerWeek: clampNumber(Number(obj.creativesPerWeek), 0, 10_000, GENERATIVE_AI_DEFAULTS.creativesPerWeek),
    capacityHoursPerWeek: clampNumber(Number(obj.capacityHoursPerWeek), 0, 168, GENERATIVE_AI_DEFAULTS.capacityHoursPerWeek),
    voiceProfile: voice,
    hasMove10AiAdCreative6mo: typeof obj.hasMove10AiAdCreative6mo === "boolean" ? obj.hasMove10AiAdCreative6mo : GENERATIVE_AI_DEFAULTS.hasMove10AiAdCreative6mo,
    hasTripleWhaleAttribution: typeof obj.hasTripleWhaleAttribution === "boolean" ? obj.hasTripleWhaleAttribution : GENERATIVE_AI_DEFAULTS.hasTripleWhaleAttribution,
    hasKlaviyoEmailSubstrate: typeof obj.hasKlaviyoEmailSubstrate === "boolean" ? obj.hasKlaviyoEmailSubstrate : GENERATIVE_AI_DEFAULTS.hasKlaviyoEmailSubstrate,
    hasPostscriptSmsSubstrate: typeof obj.hasPostscriptSmsSubstrate === "boolean" ? obj.hasPostscriptSmsSubstrate : GENERATIVE_AI_DEFAULTS.hasPostscriptSmsSubstrate,
    hasAiEngineCreativeBaseline: typeof obj.hasAiEngineCreativeBaseline === "boolean" ? obj.hasAiEngineCreativeBaseline : GENERATIVE_AI_DEFAULTS.hasAiEngineCreativeBaseline,
    hasAiCustomerServiceBaseline: typeof obj.hasAiCustomerServiceBaseline === "boolean" ? obj.hasAiCustomerServiceBaseline : GENERATIVE_AI_DEFAULTS.hasAiCustomerServiceBaseline,
    hasDedicatedAiEngineTeam: typeof obj.hasDedicatedAiEngineTeam === "boolean" ? obj.hasDedicatedAiEngineTeam : GENERATIVE_AI_DEFAULTS.hasDedicatedAiEngineTeam,
    hasOpenaiApi: typeof obj.hasOpenaiApi === "boolean" ? obj.hasOpenaiApi : GENERATIVE_AI_DEFAULTS.hasOpenaiApi,
    hasAiOrchestrationEngine: typeof obj.hasAiOrchestrationEngine === "boolean" ? obj.hasAiOrchestrationEngine : GENERATIVE_AI_DEFAULTS.hasAiOrchestrationEngine,
    hasJasperBrandVoiceLlm: typeof obj.hasJasperBrandVoiceLlm === "boolean" ? obj.hasJasperBrandVoiceLlm : GENERATIVE_AI_DEFAULTS.hasJasperBrandVoiceLlm,
  };
}

function clampNumber(value: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(lo, Math.min(hi, value));
}

export function pathBadgeClasses(path: GenerativeAiPath): string {
  if (path === "A") return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30";
  if (path === "B") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
}

export function pathLongLabel(path: GenerativeAiPath): string {
  if (path === "A") return "Path A — GPT-4o + entry-tier orchestration ($20-$500/mo)";
  if (path === "B") return "Path B DEFAULT — Pencil Pro / Moby Pro + Jasper + Midjourney + ElevenLabs + Typeface ($500-$2,565/mo)";
  return "Path C — Custom-trained LLM + Pencil Pro + Runway + Sora + Triple-Whale Pro ($3,656-$6,044/mo)";
}

export function renderGenerativeAiMarkdown(
  inputs: GenerativeAiInputs,
  rec: GenerativeAiRecommendation,
): string {
  const lines: string[] = [];
  lines.push(`# Generative AI Engine Path Recommendation`);
  lines.push("");
  lines.push(`**Recommended Path:** ${rec.path}${rec.isDeferred ? " (DEFERRED)" : ""}`);
  lines.push(`**Base Tier (for $${inputs.usDtcGmv.toLocaleString()} GMV):** ${rec.baseTier}`);
  lines.push(`**Voice Profile:** ${inputs.voiceProfile}`);
  lines.push(`**Default platform pick:** ${rec.defaultPlatformPick}`);
  lines.push("");
  lines.push(`## Justification`);
  lines.push(rec.justification);
  lines.push("");
  lines.push(`## Cost Stack (Year-1)`);
  lines.push(`- One-time: $${fmtUsd(rec.oneTimeCost[0])} – $${fmtUsd(rec.oneTimeCost[1])}`);
  lines.push(`- Recurring monthly: $${fmtUsd(rec.recurringMonthlyCost[0])} – $${fmtUsd(rec.recurringMonthlyCost[1])}`);
  lines.push(`- Year-1 total: $${fmtUsd(rec.year1Cost[0])} – $${fmtUsd(rec.year1Cost[1])}`);
  lines.push("");
  lines.push(`## Year-1 Projection Bands`);
  lines.push(`- Incremental AI-engine revenue share: ${rec.incrementalRevenueSharePct[0]}-${rec.incrementalRevenueSharePct[1]}% of base GMV`);
  lines.push(`- Incremental AI-engine revenue: $${fmtUsd(rec.year1IncrementalRevenue[0])} – $${fmtUsd(rec.year1IncrementalRevenue[1])}`);
  lines.push(`- ROAS lift: +${rec.roasLiftPct[0]}-${rec.roasLiftPct[1]} pp vs Move #10 baseline`);
  lines.push(`- Email CTR lift: +${rec.emailCtrLiftPct[0]}-${rec.emailCtrLiftPct[1]} pp`);
  lines.push(`- Organic discovery lift: +${rec.organicDiscoveryLiftPct[0]}-${rec.organicDiscoveryLiftPct[1]} pp`);
  lines.push(`- Creative iteration velocity multiplier: ${rec.creativeIterationVelocityMultiplier[0]}-${rec.creativeIterationVelocityMultiplier[1]}x`);
  lines.push(`- Creative production cost savings: ${rec.creativeProductionCostSavingsPct[0]}-${rec.creativeProductionCostSavingsPct[1]}%`);
  lines.push(`- Build cycle: ${rec.buildCycleMonths[0]}-${rec.buildCycleMonths[1]} months`);
  lines.push(`- Year-1 ROI: ${rec.year1Roi[0]}-${rec.year1Roi[1]}x`);
  lines.push("");
  lines.push(`## Platform Stack`);
  for (const p of rec.platforms) lines.push(`- ${p}`);
  lines.push("");
  if (rec.deferralReasons.length > 0) {
    lines.push(`## Deferral Gates (${rec.deferralReasons.length})`);
    rec.deferralReasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push("");
  }
  if (rec.downgradeReasons.length > 0) {
    lines.push(`## Downgrade Gates (${rec.downgradeReasons.length})`);
    rec.downgradeReasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push("");
  }
  lines.push(`## 5-Pillar Generative-AI-Engine Framework`);
  rec.pillarMatrix.forEach((p, i) => {
    lines.push(`**${i + 1}. ${p.pillar}**`);
    lines.push(p.description);
    lines.push("");
  });
  lines.push(`## Build Sequence`);
  rec.buildSequence.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  return lines.join("\n");
}

export function fmtUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function fmtRange(low: number, high: number, suffix: string = ""): string {
  return `${low}${suffix} – ${high}${suffix}`;
}