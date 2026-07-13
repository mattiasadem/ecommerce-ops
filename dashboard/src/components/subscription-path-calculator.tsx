"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  SUBSCRIPTION_DEFAULTS,
  SubscriptionCategory,
  SubscriptionInputs,
  SubscriptionPath,
  SubscriptionPlatform,
  clampSubscriptionNumber,
  fmtUsd,
  recommendSubscriptionPath,
  renderSubscriptionMarkdown,
  validateSubscriptionInputs,
} from "@/lib/subscription";
import { loadYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:subscription-path:v1";

const CATEGORIES: { value: SubscriptionCategory; label: string }[] = [
  { value: "consumables", label: "Consumables" },
  { value: "default", label: "General DTC" },
  { value: "luxury", label: "Luxury" },
  { value: "sustainable", label: "Sustainable" },
  { value: "gen_z", label: "Gen Z" },
  { value: "b2b", label: "B2B" },
  { value: "fragile", label: "Fragile goods" },
  { value: "apparel", label: "Apparel" },
];

const PLATFORMS: { value: SubscriptionPlatform; label: string }[] = [
  { value: "recharge", label: "Recharge" },
  { value: "skio", label: "Skio" },
  { value: "bold", label: "Bold" },
  { value: "stay_ai", label: "Stay AI" },
  { value: "appstle", label: "Appstle" },
  { value: "seal", label: "Seal" },
  { value: "loop", label: "Loop" },
];

function validCategory(value: unknown): value is SubscriptionCategory {
  return CATEGORIES.some((option) => option.value === value);
}

function validPlatform(value: unknown): value is SubscriptionPlatform {
  return PLATFORMS.some((option) => option.value === value);
}

function loadStored(): SubscriptionInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SubscriptionInputs>;
    return {
      usGmv: clampSubscriptionNumber(Number(value.usGmv), 0, 1_000_000_000),
      aov: clampSubscriptionNumber(Number(value.aov), 0.01, 10_000),
      monthlyOrders: Math.round(clampSubscriptionNumber(Number(value.monthlyOrders), 0, 100_000_000)),
      consumablesRevenueSharePct: clampSubscriptionNumber(Number(value.consumablesRevenueSharePct), 0, 100),
      hasReplenishmentCadence: value.hasReplenishmentCadence !== false,
      subscriberConversionBaselinePct: clampSubscriptionNumber(Number(value.subscriberConversionBaselinePct), 0, 100),
      monthlyChurnBaselinePct: clampSubscriptionNumber(Number(value.monthlyChurnBaselinePct), 0, 100),
      category: validCategory(value.category) ? value.category : SUBSCRIPTION_DEFAULTS.category,
      platformPreference: validPlatform(value.platformPreference)
        ? value.platformPreference
        : SUBSCRIPTION_DEFAULTS.platformPreference,
      hasSubscriberAttribution: value.hasSubscriberAttribution !== false,
      operatorCapacityHoursPerWeek: Math.round(
        clampSubscriptionNumber(Number(value.operatorCapacityHoursPerWeek), 0, 168),
      ),
    };
  } catch {
    return null;
  }
}

function saveStored(inputs: SubscriptionInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* Browser storage can be unavailable in private mode. */
  }
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {suffix && <span className="text-[10px] font-mono text-muted-foreground">{suffix}</span>}
      </span>
      {hint && <span className="text-[9px] leading-tight text-muted-foreground">{hint}</span>}
    </label>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cn(
        "flex min-h-16 flex-col items-start justify-center rounded-md border px-2 py-1.5 text-left transition-colors",
        value
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-amber-500/40 bg-amber-500/10",
      )}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold">{value ? "✓ Yes" : "✗ No"}</span>
      <span className="text-[9px] leading-tight text-muted-foreground">{hint}</span>
    </button>
  );
}

function pathClasses(path: SubscriptionPath) {
  if (path === "B") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (path === "C") return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{note}</div>
    </div>
  );
}

export function SubscriptionPathCalculator() {
  const [inputs, setInputs] = useState<SubscriptionInputs>(SUBSCRIPTION_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [yourStoreUsed, setYourStoreUsed] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    const yourStore = loadYourStore();
    if (stored) {
      setInputs(stored);
    } else if (yourStore) {
      setInputs({
        ...SUBSCRIPTION_DEFAULTS,
        aov: yourStore.aov,
        monthlyOrders: yourStore.monthlyOrders,
        usGmv: yourStore.aov * yourStore.monthlyOrders * 12,
      });
      setYourStoreUsed(true);
    }
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key !== "ecom-ops:your-store:v1") return;
      const fresh = loadYourStore();
      if (!fresh) return;
      setInputs((previous) => ({
        ...previous,
        aov: fresh.aov,
        monthlyOrders: fresh.monthlyOrders,
        usGmv: fresh.aov * fresh.monthlyOrders * 12,
      }));
      setYourStoreUsed(true);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (hydrated) saveStored(inputs);
  }, [inputs, hydrated]);

  const errors = useMemo(() => validateSubscriptionInputs(inputs), [inputs]);
  const recommendation = useMemo(
    () => recommendSubscriptionPath(errors.length ? SUBSCRIPTION_DEFAULTS : inputs),
    [inputs, errors.length],
  );
  const report = useMemo(
    () => renderSubscriptionMarkdown(inputs, recommendation),
    [inputs, recommendation],
  );

  function patch<K extends keyof SubscriptionInputs>(key: K, value: SubscriptionInputs[K]) {
    setInputs((previous) => ({ ...previous, [key]: value }));
  }

  function reset() {
    setInputs(SUBSCRIPTION_DEFAULTS);
    setYourStoreUsed(false);
  }

  function downloadJson() {
    const artifact = {
      generatedAt: new Date().toISOString(),
      inputs,
      recommendation,
    };
    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `subscription-path-${recommendation.path.toLowerCase()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const r = recommendation;

  return (
    <div id="subscription-path-calculator" className="space-y-5 rounded-xl border-2 border-accent/40 bg-card p-4 sm:p-6">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Subscription Path A / B / C scorer</h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #11
          </span>
        </div>
        <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">
          Browser port of <code className="rounded bg-muted px-1">scripts/subscription_unit_economics.py</code>.
          Enter your store economics and readiness gates to get the right platform path, Year-1 revenue band,
          subscriber target, recovery rates, discount ladder, and an executable six-step build sequence.
          Inputs auto-save in this browser.
        </p>
        {yourStoreUsed && (
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
            ✓ AOV, monthly orders, and annual GMV were filled from Your store on Overview.
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <NumberInput
          label="US DTC GMV"
          value={inputs.usGmv}
          onChange={(value) => patch("usGmv", clampSubscriptionNumber(value, 0, 1_000_000_000))}
          step={50_000}
          suffix="$"
          hint="$100k entry · $500k Path B · $10M Path C"
        />
        <NumberInput
          label="AOV"
          value={inputs.aov}
          onChange={(value) => patch("aov", clampSubscriptionNumber(value, 0.01, 10_000))}
          step={1}
          suffix="$"
          hint="Below $30 downgrades one path"
        />
        <NumberInput
          label="Monthly orders"
          value={inputs.monthlyOrders}
          onChange={(value) => patch("monthlyOrders", Math.round(clampSubscriptionNumber(value, 0, 100_000_000)))}
          step={100}
          hint="200/month launch floor"
        />
        <NumberInput
          label="Consumables revenue share"
          value={inputs.consumablesRevenueSharePct}
          onChange={(value) => patch("consumablesRevenueSharePct", clampSubscriptionNumber(value, 0, 100))}
          suffix="%"
          hint="30% minimum subscription fit"
        />
        <NumberInput
          label="Subscriber conversion"
          value={inputs.subscriberConversionBaselinePct}
          onChange={(value) => patch("subscriberConversionBaselinePct", clampSubscriptionNumber(value, 0, 100))}
          suffix="%"
          hint="Expected baseline · 5% floor"
        />
        <NumberInput
          label="Monthly churn"
          value={inputs.monthlyChurnBaselinePct}
          onChange={(value) => patch("monthlyChurnBaselinePct", clampSubscriptionNumber(value, 0, 100))}
          suffix="%"
          hint="Above 15% defers launch"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(value) => patch("operatorCapacityHoursPerWeek", Math.round(clampSubscriptionNumber(value, 0, 168)))}
          suffix="hr/wk"
          hint="2 hr/week minimum"
        />
        <SelectInput label="Category" value={inputs.category} options={CATEGORIES} onChange={(value) => patch("category", value)} />
        <SelectInput label="Platform preference" value={inputs.platformPreference} options={PLATFORMS} onChange={(value) => patch("platformPreference", value)} />
        <Toggle
          label="Natural replenishment cadence"
          value={inputs.hasReplenishmentCadence}
          onChange={(value) => patch("hasReplenishmentCadence", value)}
          hint="Hero SKU repeats every 30–120 days"
        />
        <Toggle
          label="Subscriber attribution wired"
          value={inputs.hasSubscriberAttribution}
          onChange={(value) => patch("hasSubscriberAttribution", value)}
          hint="Triple Whale subscriber-cohort LTV"
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
          {errors.join(" ")}
        </div>
      )}

      <section className="space-y-3 rounded-lg border border-border bg-background/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded border px-2 py-1 text-sm font-semibold", pathClasses(r.path))}>
            Path {r.path}
          </span>
          <span className={cn(
            "rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-wider",
            r.isDeferred
              ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          )}>
            {r.isDeferred ? "Audit now · launch deferred" : "Ready to build"}
          </span>
          <span className="text-xs text-muted-foreground">{r.defaultPlatformPick}</span>
        </div>

        {r.isDeferred && (
          <ul className="list-disc space-y-1 pl-5 text-xs text-amber-700 dark:text-amber-300">
            {r.deferralReasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Metric
            label="Year-1 subscription revenue"
            value={`${fmtUsd(r.year1SubscriptionRevenue[0])}–${fmtUsd(r.year1SubscriptionRevenue[1])}`}
            note={`${r.subscriptionRevenueSharePct[0]}–${r.subscriptionRevenueSharePct[1]}% of consumables revenue`}
          />
          <Metric
            label="Subscriber target"
            value={`${r.year1SubscriberCount[0].toLocaleString()}–${r.year1SubscriberCount[1].toLocaleString()}`}
            note={`${r.midpoint.subscriberCount.toLocaleString()} midpoint · ${fmtUsd(r.midpoint.mrr)} projected MRR`}
          />
          <Metric
            label="Year-1 cost"
            value={`${fmtUsd(r.year1Cost[0])}–${fmtUsd(r.year1Cost[1])}`}
            note={`${fmtUsd(r.recurringMonthlyCost[0])}–${fmtUsd(r.recurringMonthlyCost[1])}/month recurring`}
          />
          <Metric
            label="Canonical ROI band"
            value={`${r.canonicalRoi[0].toFixed(1)}:1–${r.canonicalRoi[1].toFixed(1)}:1`}
            note={`${r.midpoint.grossRevenuePerDollar.toFixed(1)}× gross revenue / modeled platform cost`}
          />
          <Metric
            label="Subscriber LTV"
            value={`${r.ltvMultiplier[0].toFixed(1)}×–${r.ltvMultiplier[1].toFixed(1)}×`}
            note="versus one-time-purchase LTV"
          />
          <Metric
            label="Smart-cancel recovery"
            value={`${r.smartCancellationRecoveryPct[0]}–${r.smartCancellationRecoveryPct[1]}%`}
            note="would-be cancellations retained"
          />
          <Metric
            label="Dunning recovery"
            value={`${r.dunningRecoveryPct[0]}–${r.dunningRecoveryPct[1]}%`}
            note="failed renewals recovered"
          />
          <Metric
            label="Winback recovery"
            value={`${r.winbackRecoveryPct[0]}–${r.winbackRecoveryPct[1]}%`}
            note="cancelled subscribers returned"
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{r.justification}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Cadence → discount ladder</h3>
          <div className="space-y-1">
            {Object.entries(r.discountTierMatrix).map(([cadence, description]) => (
              <div key={cadence} className="grid grid-cols-[4.5rem_1fr] gap-2 rounded border border-border px-2 py-1.5 text-xs">
                <span className="font-mono font-semibold">{cadence}</span>
                <span className="text-muted-foreground">{description}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Path {r.path} — six-step build sequence</h3>
          <ol className="space-y-1.5">
            {r.buildSequence.map((step, index) => (
              <li key={step} className="flex gap-2 rounded border border-border px-2 py-1.5 text-xs leading-relaxed">
                <span className="font-mono font-semibold text-accent">{index + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <CopyButton value={report} label="Copy recommendation" />
        <button
          type="button"
          onClick={downloadJson}
          className="inline-flex items-center rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ↓ Download JSON
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Reset defaults
        </button>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{STORAGE_KEY}</span>
      </div>
    </div>
  );
}
