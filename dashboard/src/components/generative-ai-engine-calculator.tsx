"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GenerativeAiInputs,
  GenerativeAiRecommendation,
  VoiceProfile,
  GENERATIVE_AI_DEFAULTS,
  pathBadgeClasses,
  pathLongLabel,
  recommendPath,
  renderGenerativeAiMarkdown,
  validateGenerativeAiInputs,
  fmtUsd,
} from "@/lib/generative-ai-engine";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Generative AI Engine Path A/B/C scorer.
 *
 * Direct browser port of `scripts/generative_ai_engine_unit_economics.py`.
 * The operator enters 14 readiness/economics inputs (GMV, creative throughput,
 * capacity, voice profile, 7 prerequisite toggles, 3 current-state toggles)
 * and the panel picks one of the 3 canonical paths (A / B / C) with the
 * cost stack + Year-1 incremental AI-engine revenue band + Year-1 ROI band +
 * ROAS lift band + email CTR lift band + organic discovery lift band +
 * creative iteration velocity multiplier + creative production cost savings
 * band + 5-pillar framework matrix + 6-step build sequence for the
 * recommended path.
 *
 * Defaults match the Python CLI's $3M US DTC Path B default.
 * State persists to localStorage (`ecom-ops:generative-ai-engine:v1`).
 * Copy-report emits a paste-ready markdown handoff matching
 * `python3 scripts/generative_ai_engine_unit_economics.py` byte-for-byte via
 * `renderGenerativeAiMarkdown`.
 *
 * Mounted on `/generative-ai-engine` between the asset-26 card and the
 * Pillar-table footer.
 */

const STORAGE_KEY = "ecom-ops:generative-ai-engine:v1";

const VOICE_OPTIONS: { value: VoiceProfile; label: string }[] = [
  { value: "default", label: "Default DTC" },
  { value: "luxury", label: "Luxury" },
  { value: "sustainable", label: "Sustainable" },
  { value: "gen_z", label: "Gen Z" },
  { value: "b2b", label: "B2B" },
];

function isVoiceProfile(value: unknown): value is VoiceProfile {
  return VOICE_OPTIONS.some((o) => o.value === value);
}

function loadStored(): GenerativeAiInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GenerativeAiInputs>;
    return validateGenerativeAiInputs(parsed);
  } catch {
    return null;
  }
}

function saveStored(inputs: GenerativeAiInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* ignore quota errors */
  }
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
      />
      <div className="flex-1 space-y-0.5">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}

function NumberField({
  label,
  description,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (next: number) => void;
  suffix?: string;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {suffix && (
          <span className="text-xs text-muted-foreground w-12">{suffix}</span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
    </div>
  );
}

export function GenerativeAiEngineCalculator() {
  const [inputs, setInputs] = useState<GenerativeAiInputs>(GENERATIVE_AI_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStored(inputs);
  }, [inputs, hydrated]);

  const rec: GenerativeAiRecommendation = useMemo(
    () => recommendPath(inputs),
    [inputs],
  );

  const markdown = useMemo(
    () => renderGenerativeAiMarkdown(inputs, rec),
    [inputs, rec],
  );

  function reset() {
    setInputs(GENERATIVE_AI_DEFAULTS);
  }

  function patch<K extends keyof GenerativeAiInputs>(
    key: K,
    value: GenerativeAiInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card id="generative-ai-engine-calculator">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Generative AI Engine — Path A / B / C scorer
            </CardTitle>
            <CardDescription className="text-xs">
              Plug in your US DTC GMV + readiness state to see which canonical
              AI-engine path (GPT-4o + AdCreative baseline → Pencil Pro +
              Jasper stack → custom-trained-LLM enterprise) fits your shop
              today. Defaults to $3M / Path B.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(pathBadgeClasses(rec.path))}>
              {pathLongLabel(rec.path)}
            </Badge>
            <CopyButton
              value={markdown}
              label="Copy report"
              className="h-7 text-[10px] px-2"
            />
            <button
              onClick={reset}
              className="h-7 px-2 text-[10px] rounded-md border border-border bg-background hover:bg-muted"
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Inputs grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <NumberField
            label="US DTC GMV"
            description="Total US DTC gross merchandise value (annualized)."
            value={inputs.usDtcGmv}
            onChange={(v) => patch("usDtcGmv", v)}
            suffix="USD"
            min={0}
            max={1_000_000_000}
            step={50_000}
          />
          <NumberField
            label="Creatives / week"
            description="Current ad creative throughput. <50 = defer Move #20."
            value={inputs.creativesPerWeek}
            onChange={(v) => patch("creativesPerWeek", Math.round(v))}
            suffix="per wk"
            min={0}
            max={10_000}
            step={5}
          />
          <NumberField
            label="Capacity"
            description="Operator or AI-engine team hours per week for Move #20."
            value={inputs.capacityHoursPerWeek}
            onChange={(v) => patch("capacityHoursPerWeek", v)}
            suffix="hr/wk"
            min={0}
            max={168}
            step={1}
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">
              Voice profile
            </label>
            <select
              value={inputs.voiceProfile}
              onChange={(e) => {
                const v = e.target.value;
                if (isVoiceProfile(v)) patch("voiceProfile", v);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {VOICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Brand voice tier. Luxury/B2B without baselines trigger
              one-Path downgrade.
            </p>
          </div>
        </div>

        <Separator />

        {/* Readiness toggles */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deferral-gate prerequisites
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <ToggleRow
              label="Move #10 AI-ad-creative shipped 6+ months"
              description="Weekly iteration cadence of 50+ creatives/week."
              checked={inputs.hasMove10AiAdCreative6mo}
              onChange={(v) => patch("hasMove10AiAdCreative6mo", v)}
            />
            <ToggleRow
              label="Triple Whale attribution live 6+ months"
              description="Move #6 cohort-LTV overlays working."
              checked={inputs.hasTripleWhaleAttribution}
              onChange={(v) => patch("hasTripleWhaleAttribution", v)}
            />
            <ToggleRow
              label="Klaviyo email substrate live 6+ months"
              description="Move #5 + 5+ active flows (cart-abandon, welcome, etc)."
              checked={inputs.hasKlaviyoEmailSubstrate}
              onChange={(v) => patch("hasKlaviyoEmailSubstrate", v)}
            />
            <ToggleRow
              label="Postscript SMS substrate live 6+ months"
              description="Move #7 + 4+ active SMS flows (welcome, cart-abandon 1+2, review)."
              checked={inputs.hasPostscriptSmsSubstrate}
              onChange={(v) => patch("hasPostscriptSmsSubstrate", v)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Downgrade-gate & current-state toggles
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <ToggleRow
              label="Has AI-engine creative baseline"
              description="Any prior AI-iteration running (Moby baseline etc). Luxury needs this."
              checked={inputs.hasAiEngineCreativeBaseline}
              onChange={(v) => patch("hasAiEngineCreativeBaseline", v)}
            />
            <ToggleRow
              label="Has AI customer-service baseline"
              description="Gorgias-AI / Zendesk-AI / Intercom-Fin wired. B2B needs this."
              checked={inputs.hasAiCustomerServiceBaseline}
              onChange={(v) => patch("hasAiCustomerServiceBaseline", v)}
            />
            <ToggleRow
              label="Has dedicated AI-engine team"
              description="3-5 FTE. Required for Path C; otherwise Path C→B downgrade."
              checked={inputs.hasDedicatedAiEngineTeam}
              onChange={(v) => patch("hasDedicatedAiEngineTeam", v)}
            />
            <ToggleRow
              label="Has OpenAI API key"
              description="OpenAI GPT-4o-clone-voice API key on file."
              checked={inputs.hasOpenaiApi}
              onChange={(v) => patch("hasOpenaiApi", v)}
            />
            <ToggleRow
              label="Has AI-orchestration engine"
              description="Pencil / Moby / AdCreative.ai / Typeface already wired."
              checked={inputs.hasAiOrchestrationEngine}
              onChange={(v) => patch("hasAiOrchestrationEngine", v)}
            />
            <ToggleRow
              label="Has Jasper brand-voice LLM"
              description="Jasper brand-voice model trained on 50-100 brand samples."
              checked={inputs.hasJasperBrandVoiceLlm}
              onChange={(v) => patch("hasJasperBrandVoiceLlm", v)}
            />
          </div>
        </div>

        <Separator />

        {/* Recommendation summary */}
        <div
          className={cn(
            "rounded-lg border p-4 space-y-3",
            rec.isDeferred
              ? "border-rose-500/30 bg-rose-500/5"
              : rec.path === "A"
                ? "border-sky-500/30 bg-sky-500/5"
                : rec.path === "B"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5",
          )}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendation
            </span>
            <Badge variant="outline" className={cn(pathBadgeClasses(rec.path))}>
              Path {rec.path}
              {rec.isDeferred ? " · DEFERRED" : ""}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Base tier for ${inputs.usDtcGmv.toLocaleString()}: Path {rec.baseTier}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {rec.justification}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Default platform pick:</span>{" "}
            {rec.defaultPlatformPick}
          </p>
        </div>

        {/* Cost & projection grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            label="Year-1 cost"
            value={`${fmtUsd(rec.year1Cost[0])} – ${fmtUsd(rec.year1Cost[1])}`}
            sub={`one-time ${fmtUsd(rec.oneTimeCost[0])}-${fmtUsd(rec.oneTimeCost[1])} + ${fmtUsd(rec.recurringMonthlyCost[0])}-${fmtUsd(rec.recurringMonthlyCost[1])}/mo`}
          />
          <StatTile
            label="Year-1 incremental revenue"
            value={`${fmtUsd(rec.year1IncrementalRevenue[0])} – ${fmtUsd(rec.year1IncrementalRevenue[1])}`}
            sub={`${rec.incrementalRevenueSharePct[0]}-${rec.incrementalRevenueSharePct[1]}% of base GMV`}
          />
          <StatTile
            label="Year-1 ROI"
            value={`${rec.year1Roi[0]}-${rec.year1Roi[1]}x`}
            sub={`build cycle ${rec.buildCycleMonths[0]}-${rec.buildCycleMonths[1]} months`}
            tone="accent"
          />
          <StatTile
            label="Creative velocity"
            value={`${rec.creativeIterationVelocityMultiplier[0]}-${rec.creativeIterationVelocityMultiplier[1]}x`}
            sub={`${rec.creativeProductionCostSavingsPct[0]}-${rec.creativeProductionCostSavingsPct[1]}% cost savings`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            label="ROAS lift"
            value={`+${rec.roasLiftPct[0]}-${rec.roasLiftPct[1]} pp`}
            sub="vs Move #10 baseline"
          />
          <StatTile
            label="Email CTR lift"
            value={`+${rec.emailCtrLiftPct[0]}-${rec.emailCtrLiftPct[1]} pp`}
            sub="AI subject-line iteration"
          />
          <StatTile
            label="Organic discovery lift"
            value={`+${rec.organicDiscoveryLiftPct[0]}-${rec.organicDiscoveryLiftPct[1]} pp`}
            sub="vs Move #17 baseline"
          />
          <StatTile
            label="Build cycle"
            value={`${rec.buildCycleMonths[0]}-${rec.buildCycleMonths[1]} mo`}
            sub="Time-to-launch"
          />
        </div>

        {/* Platform stack */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Platform stack ({rec.platforms.length})
          </div>
          <ul className="space-y-1">
            {rec.platforms.map((p, i) => (
              <li key={i} className="text-xs text-foreground flex gap-2">
                <span className="text-muted-foreground tabular-nums w-4 shrink-0">
                  {i + 1}.
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pillar matrix */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            5-Pillar Generative-AI-Engine framework
          </div>
          <div className="grid grid-cols-1 gap-2">
            {rec.pillarMatrix.map((p, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-muted/30 p-3 space-y-1"
              >
                <div className="text-xs font-semibold text-foreground">
                  {i + 1}. {p.pillar}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Build sequence */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            6-step build sequence
          </div>
          <ol className="space-y-1 list-decimal list-inside">
            {rec.buildSequence.map((step, i) => (
              <li key={i} className="text-xs text-foreground leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Gates */}
        {rec.deferralReasons.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
              Deferral gates firing ({rec.deferralReasons.length})
            </div>
            <ul className="space-y-1">
              {rec.deferralReasons.map((r, i) => (
                <li
                  key={i}
                  className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed"
                >
                  <span className="font-mono mr-1">[{i + 1}]</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {rec.downgradeReasons.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Downgrade gates firing ({rec.downgradeReasons.length})
            </div>
            <ul className="space-y-1">
              {rec.downgradeReasons.map((r, i) => (
                <li
                  key={i}
                  className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed"
                >
                  <span className="font-mono mr-1">[{i + 1}]</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-1",
        tone === "accent"
          ? "border-foreground/20 bg-foreground/5"
          : "border-border bg-muted/30",
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}