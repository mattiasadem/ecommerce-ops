"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PATH_BADGE,
  PATH_LABEL,
  PATH_LONG,
  PLATFORM_COST,
  PLATFORM_LABEL,
  TRIPLE_WHALE_DEFAULTS,
  recommendPath,
  renderAttributionMarkdown,
  validateInputs,
  fmtUsdShort,
  fmtUsdFull,
  type CartPlatform,
  type TripleWhaleAttributionInputs,
} from "@/lib/triple-whale-attribution";
import { CopyButton } from "@/components/copy-button";
import { loadYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * Move #6 Attribution Tool Picker — Path A / B / C / D / E scorer.
 *
 * Direct browser port of the `06-install-attribution-triplewhale-or-polar`
 * playbook's decision tree (Path A = Polar Starter / B = TW Starter / C =
 * TW Pro / D = Polar Pro non-Shopify / E = free). The operator enters 11
 * inputs (monthly revenue, monthly paid spend, cart platform, monthly
 * orders, has-Klaviyo, has-Meta-Ads, has-Google-Ads, operator capacity
 * hr/wk, needs-MMM, needs-post-purchase-survey, needs-Meta-CAPI) and
 * the panel picks one of 5 canonical paths with the cost stack + 6-row
 * capability matrix + Year-1 attribution lift (conservative–optimistic) +
 * Year-1 net + breakeven months + 5-step build sequence + 7-gate
 * verification contract.
 *
 * Defaults match the playbook's $2M US DTC Shopify Path B default
 * ($200k/mo revenue, $20k/mo paid, Shopify, 1,500 orders/mo, Klaviyo
 * wired, Meta + Google ads admin, 8 hr/wk operator). State persists
 * to localStorage (`ecom-ops:triple-whale-attribution:v1`).
 *
 * Mounted on `/playbooks/06-install-attribution-triplewhale-or-polar`
 * above the playbook body via the CALCULATORS map in
 * `app/playbooks/[slug]/page.tsx`.
 */

const STORAGE_KEY = "ecom-ops:triple-whale-attribution:v1";

function clampInt(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function clampFloat(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): TripleWhaleAttributionInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      monthlyRevenue: clampFloat(Number(parsed.monthlyRevenue) || 0, 0, 100_000_000),
      monthlyPaidSpend: clampFloat(Number(parsed.monthlyPaidSpend) || 0, 0, 100_000_000),
      cartPlatform: (parsed.cartPlatform as CartPlatform) ?? TRIPLE_WHALE_DEFAULTS.cartPlatform,
      monthlyOrders: clampFloat(Number(parsed.monthlyOrders) || 0, 0, 1_000_000),
      hasKlaviyo: typeof parsed.hasKlaviyo === "boolean" ? parsed.hasKlaviyo : TRIPLE_WHALE_DEFAULTS.hasKlaviyo,
      hasGoogleAds: typeof parsed.hasGoogleAds === "boolean" ? parsed.hasGoogleAds : TRIPLE_WHALE_DEFAULTS.hasGoogleAds,
      hasMetaAds: typeof parsed.hasMetaAds === "boolean" ? parsed.hasMetaAds : TRIPLE_WHALE_DEFAULTS.hasMetaAds,
      operatorCapacityHoursPerWeek: clampInt(
        Number(parsed.operatorCapacityHoursPerWeek) || 0,
        0,
        40,
      ),
      needsMmm: typeof parsed.needsMmm === "boolean" ? parsed.needsMmm : TRIPLE_WHALE_DEFAULTS.needsMmm,
      needsPostPurchaseSurvey:
        typeof parsed.needsPostPurchaseSurvey === "boolean"
          ? parsed.needsPostPurchaseSurvey
          : TRIPLE_WHALE_DEFAULTS.needsPostPurchaseSurvey,
      needsMetaCapI:
        typeof parsed.needsMetaCapI === "boolean"
          ? parsed.needsMetaCapI
          : TRIPLE_WHALE_DEFAULTS.needsMetaCapI,
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: TripleWhaleAttributionInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  hint,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onChange(Number.isNaN(num) ? 0 : num);
          }}
          className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {suffix && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">
          {hint}
        </span>
      )}
    </label>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">
          {hint}
        </span>
      )}
    </label>
  );
}

function BooleanToggle({
  label,
  value,
  onChange,
  hint,
  variant = "neutral",
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
  variant?: "neutral" | "warn";
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors",
        value
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : variant === "warn"
            ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {value ? "✓" : "○"} {label}
      </span>
      {hint && (
        <span className="text-[9px] opacity-80 leading-tight">{hint}</span>
      )}
    </button>
  );
}

export function TripleWhaleAttributionCalculator() {
  const [inputs, setInputs] = useState<TripleWhaleAttributionInputs>(TRIPLE_WHALE_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [yourStoreApplied, setYourStoreApplied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setYourStoreApplied(false);
    } else {
      // Seed from your-store on first visit
      const ys = loadYourStore();
      if (ys) {
        setInputs((prev) => ({
          ...prev,
          monthlyRevenue: Math.round(ys.aov * ys.monthlyOrders),
          monthlyOrders: ys.monthlyOrders,
          hasKlaviyo: true,
        }));
        setYourStoreApplied(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationErrors = useMemo(() => validateInputs(inputs), [inputs]);
  const hasValidationError = validationErrors.length > 0;

  const rec = useMemo(() => {
    if (hasValidationError) return recommendPath(TRIPLE_WHALE_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, hasValidationError]);

  function patch<K extends keyof TripleWhaleAttributionInputs>(
    key: K,
    value: TripleWhaleAttributionInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(TRIPLE_WHALE_DEFAULTS);
  }

  const report = useMemo(() => {
    if (hasValidationError) {
      return `# Validation error\n\n${validationErrors
        .map((e) => `- ${e}`)
        .join("\n")}`;
    }
    return renderAttributionMarkdown(inputs, rec);
  }, [inputs, rec, hasValidationError, validationErrors]);

  return (
    <div
      id="triple-whale-attribution-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Attribution-tool Path A / B / C / D / E picker
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #6
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              PATH_BADGE[rec.path],
            )}
            data-testid="rec-path-badge"
          >
            {PATH_LABEL[rec.path]}
          </span>
          {yourStoreApplied ? (
            <span
              data-testid="your-store-applied-badge"
              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
              title="Monthly revenue + orders auto-filled from your Your-store inputs on Overview. Edit Your-store there to propagate."
            >
              Your-store applied
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of the{" "}
          <code className="rounded bg-muted px-1">
            06-install-attribution-triplewhale-or-polar
          </code>{" "}
          playbook&rsquo;s decision tree. Enter 11 store-profile inputs → see
          the canonical Path recommendation with cost stack, 6-row capability
          matrix, Year-1 attribution lift, Year-1 net, breakeven months, the
          5-step build sequence, and the 7-gate verification contract. State
          persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="Monthly revenue"
          value={inputs.monthlyRevenue}
          onChange={(v) => patch("monthlyRevenue", clampFloat(v, 0, 100_000_000))}
          step={10_000}
          suffix="$"
          hint="<$10k/mo → Path E"
        />
        <NumberInput
          label="Monthly paid spend"
          value={inputs.monthlyPaidSpend}
          onChange={(v) => patch("monthlyPaidSpend", clampFloat(v, 0, 100_000_000))}
          step={1_000}
          suffix="$"
          hint="≥$5k/mo → Path B"
        />
        <SelectInput
          label="Cart platform"
          value={inputs.cartPlatform}
          options={[
            { value: "shopify", label: "Shopify" },
            { value: "woocommerce", label: "WooCommerce" },
            { value: "bigcommerce", label: "BigCommerce" },
            { value: "headless", label: "Headless / custom" },
            { value: "other", label: "Other" },
          ]}
          onChange={(v) => patch("cartPlatform", v)}
          hint="non-Shopify → Path D"
        />
        <NumberInput
          label="Monthly orders"
          value={inputs.monthlyOrders}
          onChange={(v) => patch("monthlyOrders", clampFloat(v, 0, 1_000_000))}
          step={100}
          hint="<100/mo → defer"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(v) =>
            patch("operatorCapacityHoursPerWeek", clampInt(v, 0, 40))
          }
          step={1}
          max={40}
          suffix="hr/wk"
          hint="0–40 hr/wk"
        />
        <BooleanToggle
          label="Klaviyo wired"
          value={inputs.hasKlaviyo}
          onChange={(v) => patch("hasKlaviyo", v)}
          hint="engagement layer"
        />
        <BooleanToggle
          label="Meta Ads admin"
          value={inputs.hasMetaAds}
          onChange={(v) => patch("hasMetaAds", v)}
          hint="Conversions API"
        />
        <BooleanToggle
          label="Google Ads admin"
          value={inputs.hasGoogleAds}
          onChange={(v) => patch("hasGoogleAds", v)}
          hint="Enhanced Conv."
        />
        <BooleanToggle
          label="Needs MMM"
          value={inputs.needsMmm}
          onChange={(v) => patch("needsMmm", v)}
          hint="$50k+ paid → Path C"
          variant="warn"
        />
        <BooleanToggle
          label="Needs post-purchase survey"
          value={inputs.needsPostPurchaseSurvey}
          onChange={(v) => patch("needsPostPurchaseSurvey", v)}
          hint="highest-value signal"
        />
        <BooleanToggle
          label="Needs Meta CAPI"
          value={inputs.needsMetaCapI}
          onChange={(v) => patch("needsMetaCapI", v)}
          hint="iOS14.5 recovery"
        />
      </div>

      {/* ===== RECOMMENDATION CARD ===== */}
      <div
        className={cn(
          "rounded-md border p-3 space-y-2",
          PATH_BADGE[rec.path],
        )}
        data-testid="rec-card"
      >
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              {rec.platformLabel} · {rec.plan}
            </h3>
            <p className="text-[11px] opacity-80 font-mono">
              {PATH_LONG[rec.path]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums font-mono">
              {fmtUsdShort(rec.costMonthly)}/mo
            </p>
            <p className="text-[10px] opacity-80 font-mono">
              {fmtUsdFull(rec.year1Cost)}/yr
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed">{rec.justification}</p>
      </div>

      {/* ===== CAPABILITY MATRIX ===== */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Capability matrix
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[11px]">
          {[
            { k: "mer", label: "MER" },
            { k: "cohortLtv", label: "Cohort LTV" },
            { k: "postPurchaseSurvey", label: "Post-purchase survey" },
            { k: "klaviyoSync", label: "Klaviyo sync" },
            { k: "metaGoogleTiktokSync", label: "Meta + Google + TikTok sync" },
            { k: "mmmIncrementality", label: "MMM + incrementality" },
          ].map(({ k, label }) => {
            const available = rec.capabilities[k as keyof typeof rec.capabilities];
            return (
              <div
                key={k}
                className={cn(
                  "rounded border px-2 py-1 font-mono",
                  available
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-zinc-500/30 bg-zinc-500/5 text-zinc-500 line-through",
                )}
              >
                {available ? "✓" : "—"} {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ROI NUMBERS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded border border-border bg-muted/30 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Attribution lift
          </p>
          <p
            className="text-sm font-semibold tabular-nums font-mono"
            data-testid="lift"
          >
            {fmtUsdShort(rec.attributionLiftLow)} – {fmtUsdShort(rec.attributionLiftHigh)}
          </p>
        </div>
        <div className="rounded border border-border bg-muted/30 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Year-1 net
          </p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums font-mono",
              rec.year1NetHigh > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
            )}
            data-testid="year1-net"
          >
            {fmtUsdShort(rec.year1NetLow)} – {fmtUsdShort(rec.year1NetHigh)}
          </p>
        </div>
        <div className="rounded border border-border bg-muted/30 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Breakeven
          </p>
          <p
            className="text-sm font-semibold tabular-nums font-mono"
            data-testid="breakeven"
          >
            {rec.breakevenMonthsLow === 0
              ? "—"
              : `${rec.breakevenMonthsLow}–${rec.breakevenMonthsHigh} mo`}
          </p>
        </div>
        <div className="rounded border border-border bg-muted/30 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Year-1 cost
          </p>
          <p className="text-sm font-semibold tabular-nums font-mono">
            {fmtUsdFull(rec.year1Cost)}
          </p>
        </div>
      </div>

      {/* ===== BUILD SEQUENCE ===== */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Build sequence (5 steps)
        </h4>
        <ol className="space-y-1 text-xs">
          {rec.buildSequence.map((step, idx) => (
            <li
              key={idx}
              className="rounded border border-border bg-muted/20 px-2 py-1 leading-relaxed"
            >
              <span className="font-mono text-muted-foreground mr-1">
                {idx + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* ===== VERIFICATION GATES ===== */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Verification gates (7 post-install)
        </h4>
        <ul className="space-y-1 text-[11px]">
          {rec.verificationGates.map((gate, idx) => (
            <li
              key={idx}
              className="rounded border border-border bg-muted/20 px-2 py-1 leading-relaxed font-mono"
            >
              {gate}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground italic leading-tight pt-1">
          Run{" "}
          <code className="rounded bg-muted px-1">
            python3 scripts/triple_whale_attribution_check.py --bootstrap ./tw_fixtures/
          </code>{" "}
          to scaffold the fixture directory, then{" "}
          <code className="rounded bg-muted px-1">
            python3 scripts/triple_whale_attribution_check.py --json
          </code>{" "}
          to verify all 7 gates pass before relying on the attribution signal.
        </p>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        <CopyButton
          value={report}
          label="Copy report"
          className="rounded border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-accent hover:bg-accent/20"
        />
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded border border-border bg-muted/30 px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-muted/50"
        >
          Reset to defaults
        </button>
        {hasValidationError ? (
          <span className="text-[10px] text-rose-700 dark:text-rose-300">
            ⚠ {validationErrors.length} validation{" "}
            {validationErrors.length === 1 ? "issue" : "issues"}
          </span>
        ) : null}
        <span className="text-[10px] text-muted-foreground ml-auto">
          {PLATFORM_LABEL[rec.platform]} · {PLATFORM_COST[rec.platform]}/mo list
        </span>
      </div>
    </div>
  );
}
