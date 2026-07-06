"use client";

import { useEffect, useState } from "react";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  clearYourStore,
  loadYourStore,
  saveYourStore,
} from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * `Your store` card — the single source of truth for the operator's
 * AOV, monthly orders, and gross margin. Sits on the Overview page.
 *
 * Save → `localStorage["ecom-ops:your-store:v1"]`. The three ROI
 * calculators on `/playbooks` (abandoned-cart, post-purchase upsell,
 * welcome series) read this on mount when their own per-calculator
 * localStorage is empty, so editing here propagates everywhere.
 *
 * Reset → wipes `your-store` AND the three per-calculator keys, so the
 * operator can return to canonical defaults with one click.
 */

const PER_CALC_STORAGE_KEYS = [
  "ecom-ops:playbooks:ac-roi:v1",
  "ecom-ops:playbooks:ppu-roi:v1",
  "ecom-ops:playbooks:ws-roi:v1",
];

type FieldKey = keyof YourStoreInputs;

interface Field {
  key: FieldKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: Field[] = [
  { key: "aov",           label: "Average order value", unit: "$",    min: 1,   max: 10000, step: 1 },
  { key: "monthlyOrders", label: "Monthly orders",      unit: "",     min: 1,   max: 500000, step: 10 },
  { key: "grossMargin",   label: "Gross margin",        unit: "%",    min: 5,   max: 95,    step: 1 },
];

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function loadInitial(): YourStoreInputs {
  const stored = loadYourStore();
  return stored ?? YOUR_STORE_DEFAULTS;
}

export function YourStoreCard() {
  // Server-render the defaults so the first paint matches. Real values
  // hydrate on mount — this is the same pattern the calculators use.
  const [inputs, setInputs] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setInputs(loadInitial());
    setHydrated(true);
  }, []);

  const setField = (key: FieldKey, raw: string) => {
    const f = FIELDS.find((x) => x.key === key);
    if (!f) return;
    let num = parseFloat(raw);
    if (key === "grossMargin") {
      // UI shows 0..100; storage wants 0..1.
      num = num / 100;
    }
    setInputs((prev) => ({ ...prev, [key]: clamp(Number.isNaN(num) ? f.min : num, f.min, f.max) }));
  };

  const persist = () => {
    saveYourStore(inputs);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Clear your-store numbers AND the per-calculator saved values? All three ROI calculators will return to canonical defaults.",
      );
      if (!ok) return;
    }
    clearYourStore();
    if (typeof window !== "undefined") {
      for (const k of PER_CALC_STORAGE_KEYS) {
        try {
          window.localStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      }
    }
    setInputs(YOUR_STORE_DEFAULTS);
    setSavedAt(null);
  };

  // Derived preview: how the abandoned-cart, post-purchase upsell, and
  // welcome-series calculators would initialize given these inputs.
  // `upsellProbe` is an arbitrary $35 placeholder so the preview reads sensibly
  // without exposing the upsell-specific knob in this card.
  const upsellProbe = 35;
  const previewAcRevenue = inputs.monthlyOrders * 0.10 * inputs.aov;
  const previewPpuNet =
    inputs.monthlyOrders * 0.15 * upsellProbe * inputs.grossMargin -
    inputs.monthlyOrders * 0.10;
  const previewWsMargin = inputs.monthlyOrders * 0.03 * inputs.aov * inputs.grossMargin;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {FIELDS.map((f) => {
          const displayValue =
            f.key === "grossMargin"
              ? Math.round(inputs[f.key] * 100)
              : inputs[f.key];
          return (
            <label key={f.key} className="flex flex-col gap-1 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </span>
              <div className="flex items-stretch rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                {f.unit && (
                  <span className="flex items-center px-2 text-xs text-muted-foreground border-r border-input">
                    {f.unit}
                  </span>
                )}
                <input
                  type="number"
                  inputMode="decimal"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={displayValue}
                  onChange={(e) => setField(f.key, e.target.value)}
                  disabled={!hydrated}
                  className="w-full bg-transparent px-2 py-1.5 text-sm tabular-nums outline-none"
                  aria-label={f.label}
                />
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={persist}
          disabled={!hydrated}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          Apply to all ROI calculators
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!hydrated}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
        >
          Reset everything
        </button>
        {savedAt && (
          <span className={cn("text-[10px] text-muted-foreground tabular-nums")}>
            Saved {savedAt} — propagates to abandoned-cart, post-purchase upsell, and welcome-series calculators.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <PreviewTile
          label="Abandoned-cart preview"
          sub="10% recovery of checkout-starts"
          value={`$${Math.round(previewAcRevenue).toLocaleString()}/mo`}
        />
        <PreviewTile
          label="Post-purchase upsell preview"
          sub="15% take-rate × $35 upsell × margin"
          value={`${previewPpuNet >= 0 ? "+" : ""}$${Math.round(previewPpuNet).toLocaleString()}/mo`}
          accent={previewPpuNet < 0}
        />
        <PreviewTile
          label="Welcome-series preview"
          sub="3% first-purchase CVR × AOV × margin"
          value={`$${Math.round(previewWsMargin).toLocaleString()}/mo gross margin`}
        />
      </div>
    </div>
  );
}

function PreviewTile({
  label,
  sub,
  value,
  accent,
}: {
  label: string;
  sub: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          accent && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}