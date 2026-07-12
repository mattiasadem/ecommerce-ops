"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandInternationalInputs,
  Category,
  INTERNATIONAL_DEFAULTS,
  PathRecommendation,
  SupplyChainComplexity,
  classifyCategory,
  clampFloat,
  clampInt,
  recommendPath,
  renderInternationalMarkdown,
} from "@/lib/international";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";

/**
 * Interactive International-expansion Path A / B / C / C+ scorer.
 *
 * Direct browser port of `scripts/international_market_fit.py`. The
 * operator enters 6 inputs (US GMV, category, US AOV, US contribution
 * margin %, supply-chain complexity, operator capacity hr/wk) and the
 * panel picks one of the 4 canonical paths (A / B / C / C+) with the
 * cost stack + Year-1 incremental international revenue + per-market
 * revenue breakdown + Year-1 ROI band + the 6-step build sequence.
 *
 * Defaults match the Python CLI's $5M US apparel brand baseline (Path B,
 * 30:1–80:1 midpoint Year-1 lift band). State persists to localStorage
 * (`ecom-ops:international-path:v1`). Copy-report emits a paste-ready
 * markdown handoff (matches `python3 scripts/international_market_fit.py`
 * byte-for-byte via `renderInternationalMarkdown`).
 *
 * Mounted on `/international` between the asset-13 card and the
 * "Future-tick companions" footer.
 *
 * Cross-page intelligence: on first mount, the panel reads
 * `ecom-ops:your-store:v1` and pre-fills US AOV + US contribution
 * margin % from the operator's Your-store card on Overview. If the
 * operator later edits those values on Overview, the panel re-hydrates
 * on focus via the `storage` event.
 */

const STORAGE_KEY = "ecom-ops:international-path:v1";

function loadStored(): BrandInternationalInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usGmv: clampFloat(Number(parsed.usGmv) || 0, 0, 1_000_000_000),
      category: (parsed.category as Category) ?? INTERNATIONAL_DEFAULTS.category,
      usAov: clampFloat(Number(parsed.usAov) || 0, 0.01, 10_000),
      usContributionMarginPct: clampFloat(
        Number(parsed.usContributionMarginPct) || 0,
        0,
        100,
      ),
      supplyChainComplexity: (parsed.supplyChainComplexity as SupplyChainComplexity) ??
        INTERNATIONAL_DEFAULTS.supplyChainComplexity,
      operatorCapacityHoursPerWeek: clampInt(
        Number(parsed.operatorCapacityHoursPerWeek) || 0,
        0,
        168,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandInternationalInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function mergeFromYourStore(
  base: BrandInternationalInputs,
  yourStore: YourStoreInputs | null,
): BrandInternationalInputs {
  if (!yourStore) return base;
  return {
    ...base,
    usAov: yourStore.aov,
    usContributionMarginPct: Math.round(yourStore.grossMargin * 100),
  };
}

function fmtUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtUsdFull(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
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

function pathBadgeClasses(path: PathRecommendation["path"]): string {
  switch (path) {
    case "A":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "B":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "C":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "C+":
      return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }
}

function pathLongLabel(path: PathRecommendation["path"]): string {
  switch (path) {
    case "A":
      return "CA only — defer until US GMV ≥ $1M";
    case "B":
      return "CA + UK + EU + AU — DEFAULT for $1M–$10M US DTC brands";
    case "C":
      return "All 7 markets — gated on $10M+ US DTC base";
    case "C+":
      return "All 7 markets + in-region 3PL — for $50M+ US DTC brands";
  }
}

function categoryFitClasses(fit: ReturnType<typeof classifyCategory>): string {
  switch (fit) {
    case "high":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "medium":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "low":
      return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }
}

function complexityClasses(c: SupplyChainComplexity): string {
  if (c === 1) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (c === 2) return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
}

export function InternationalPathCalculator() {
  const [inputs, setInputs] = useState<BrandInternationalInputs>(INTERNATIONAL_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [yourStoreUsed, setYourStoreUsed] = useState(false);

  useEffect(() => {
    // Load stored calculator inputs (if any).
    const stored = loadStored();
    // Cross-page-intelligence: pre-fill AOV + margin from Your-store on Overview.
    const yourStore = loadYourStore();
    const baseline = stored ?? INTERNATIONAL_DEFAULTS;
    const merged = mergeFromYourStore(baseline, yourStore);
    setInputs(merged);
    setYourStoreUsed(yourStore !== null);
    setHydrated(true);

    // Listen for cross-tab Your-store edits.
    function onStorage(e: StorageEvent) {
      if (e.key === "ecom-ops:your-store:v1") {
        const fresh = loadYourStore();
        if (fresh) {
          setInputs((prev) => mergeFromYourStore(prev, fresh));
          setYourStoreUsed(true);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const rec: PathRecommendation = useMemo(() => recommendPath(inputs), [inputs]);

  function patch<K extends keyof BrandInternationalInputs>(
    key: K,
    value: BrandInternationalInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(INTERNATIONAL_DEFAULTS);
  }

  const categoryFit = classifyCategory(inputs.category);
  const report = useMemo(() => renderInternationalMarkdown(inputs, rec), [inputs, rec]);

  return (
    <div
      id="international-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            International-expansion Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #11
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/international_market_fit.py
          </code>
          . Enter your brand&rsquo;s US-baseline inputs &rarr; see the canonical Path A / B / C
          / C+ recommendation with cost stack, Year-1 incremental international revenue,
          per-market revenue breakdown, Year-1 ROI band, and the 6-step build sequence
          for the recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
        {yourStoreUsed && (
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-tight">
            ✓ AOV + contribution margin auto-filled from Your-store on Overview
            (${inputs.usAov.toFixed(0)} / {inputs.usContributionMarginPct}%). Edit Your-store to
            propagate changes here.
          </p>
        )}
      </header>

      {/* ===== INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US GMV ($)"
          value={inputs.usGmv}
          onChange={(v) => patch("usGmv", clampFloat(v, 0, 1_000_000_000))}
          step={50_000}
          suffix="$"
          hint="<$1M → defer (Path A)"
        />
        <NumberInput
          label="US AOV ($)"
          value={inputs.usAov}
          onChange={(v) => patch("usAov", clampFloat(v, 0.01, 10_000))}
          step={1}
          suffix="$"
          hint="Average order value"
        />
        <NumberInput
          label="US contribution margin %"
          value={inputs.usContributionMarginPct}
          onChange={(v) => patch("usContributionMarginPct", clampFloat(v, 0, 100))}
          step={1}
          suffix="%"
          hint="<30% → downgrade"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(v) => patch("operatorCapacityHoursPerWeek", clampInt(v, 0, 168))}
          step={1}
          suffix="hr/wk"
          hint="<4 hr/wk → downgrade"
        />
        <SelectInput
          label="Category"
          value={inputs.category}
          onChange={(v) => patch("category", v)}
          options={[
            { value: "apparel", label: "Apparel (high fit)" },
            { value: "beauty", label: "Beauty (high fit)" },
            { value: "home_goods", label: "Home goods (high fit)" },
            { value: "electronics", label: "Electronics (medium)" },
            { value: "jewelry", label: "Jewelry (medium)" },
            { value: "pet", label: "Pet (medium)" },
            { value: "food", label: "Food (low fit)" },
            { value: "supplements", label: "Supplements (low)" },
            { value: "other", label: "Other (medium)" },
          ]}
        />
        <SelectInput
          label="Supply-chain complexity"
          value={String(inputs.supplyChainComplexity)}
          onChange={(v) => patch("supplyChainComplexity", Number(v) as SupplyChainComplexity)}
          options={[
            { value: "1", label: "1 — lightweight cross-border-ready" },
            { value: "2", label: "2 — medium complexity" },
            { value: "3", label: "3 — heavy/bulky (downgrade)" },
          ]}
        />
      </div>

      {/* ===== OUTPUTS ===== */}
      <div className="space-y-3">
        {/* Path recommendation strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recommendation
            </span>
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                pathBadgeClasses(rec.path),
              )}
            >
              Path {rec.path}
            </span>
            <span className="text-xs font-medium">{pathLongLabel(rec.path)}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.justification}
          </p>
          <div className="flex flex-wrap gap-1">
            {rec.markets.map((m) => (
              <span
                key={m}
                className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Input summary chips */}
        <div className="flex flex-wrap gap-1">
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono",
              categoryFitClasses(categoryFit),
            )}
          >
            {inputs.category} ({categoryFit} fit)
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono",
              complexityClasses(inputs.supplyChainComplexity),
            )}
          >
            supply-chain {inputs.supplyChainComplexity}
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            US GMV {fmtUsdShort(inputs.usGmv)}
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            AOV ${inputs.usAov.toFixed(0)}
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            margin {inputs.usContributionMarginPct}%
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            capacity {inputs.operatorCapacityHoursPerWeek} hr/wk
          </span>
        </div>

        {/* 4-tile output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 incremental revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalRevenueLow)}&ndash;
              {fmtUsdShort(rec.year1IncrementalRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.expectedLiftLowPct.toFixed(0)}&ndash;
              {rec.expectedLiftHighPct.toFixed(0)}% of US base GMV
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 total cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1CostLow)}&ndash;
              {fmtUsdShort(rec.year1CostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              one-time + recurring
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI band
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1RoiLow.toFixed(0)}:1 &ndash; {rec.year1RoiHigh.toFixed(0)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              revenue / cost
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Markets
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.markets.length}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums truncate">
              {rec.markets.join(", ")}
            </div>
          </div>
        </div>

        {/* Per-market revenue breakdown */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Per-market Year-1 revenue projection (midpoint lift applied to US base)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {rec.markets.map((m) => (
              <div
                key={m}
                className="rounded border border-border bg-background/30 p-1.5 text-center"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {m}
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {fmtUsdShort(rec.perMarketRevenue[m] ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-step build sequence */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            6-step build sequence for Path {rec.path}
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-xs leading-relaxed text-foreground/90">
            {rec.buildSequence.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {/* Copy report + reset */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CopyButton value={report} label="Copy markdown report" />
            <button
              type="button"
              onClick={resetDefaults}
              className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-muted/40"
            >
              Reset to defaults
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            Source: <code className="font-mono">scripts/international_market_fit.py</code>{" "}
            + <code className="font-mono">research/04</code> +{" "}
            <code className="font-mono">playbooks/11</code> +{" "}
            <code className="font-mono">assets/13</code>
          </div>
        </div>

        {/* Hidden report for accessibility */}
        <details className="text-[10px]">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            View markdown report
          </summary>
          <pre className="mt-2 rounded-md border border-border bg-muted/20 p-2 text-[10px] leading-snug whitespace-pre-wrap font-mono">
            {report}
          </pre>
        </details>
      </div>
    </div>
  );
}