"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar } from "@/components/bar";
import {
  BENCHMARK_DIAL_DEFAULTS,
  BenchmarkDialState,
  Vertical,
  classify,
  findRow,
  loadBenchmarkDial,
  projectFromYourStore,
  saveBenchmarkDial,
  selectAovRow,
} from "@/lib/benchmark-dial";
import { YOUR_STORE_DEFAULTS, YourStoreInputs, loadYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * `Where does my store sit?` — cross-page benchmark dial.
 *
 * Reads the operator's AOV / monthly orders / gross margin from
 * `ecom-ops:your-store:v1` (the same key the abandoned-cart / post-purchase /
 * welcome-series calculators read from) and projects each against the
 * canonical Unit Economics benchmark table from research/00.
 *
 * The dial renders 4 metrics side-by-side:
 *
 *   1. AOV            → scored against the chosen vertical's AOV row
 *   2. Gross margin   → scored against the apparel-or-consumables gross-margin row
 *   3. Break-even CAC → operator's first-order gross profit, scored against the
 *                       consumer CAC row
 *   4. LTV:CAC dial   → derived from gross margin × (1 + repeat-rate)
 *                       assumption, scored against the LTV:CAC row
 *
 * The operator can flip vertical (consumer / apparel / home) and tweak
 * the 12-month repeat-rate assumption. Both persist to
 * `ecom-ops:benchmark-dial:v1`.
 *
 * Each dial shows:
 *   - the operator's value (big number)
 *   - the band the value lands in (great / good / median / below / red-flag)
 *   - a horizontal bar that fills proportional to where the operator sits
 *     on the healthy → great spectrum
 *   - the human-readable benchmark cell ("Inside healthy median ($35–$75)")
 */

interface BenchmarkRow {
  Metric: string;
  "Healthy (median)": string;
  "Good (top-quartile)": string;
  "Red flag": string;
  Source?: string;
}

interface BenchmarkDialProps {
  rows: BenchmarkRow[];
}

interface DialRow {
  metric: string;       // canonical metric label shown above the dial
  helper: string;       // one-line helper under the metric label
  value: number;        // operator's number
  unit: string;         // "$", "%", ":1", " mo"
  band: "great" | "good" | "median" | "below" | "red-flag";
  message: string;      // the band message (e.g. "Inside top-quartile ($80–$120)")
  position: number;     // 0..100 — bar fill ratio
}

const VERTICAL_LABELS: Record<Vertical, string> = {
  consumer: "Consumables / beauty",
  apparel: "Apparel / accessories",
  home: "Home / furniture",
};

function intentClass(band: DialRow["band"]): string {
  switch (band) {
    case "great":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "good":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "median":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "below":
      return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "red-flag":
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
  }
}

function bandLabel(band: DialRow["band"]): string {
  switch (band) {
    case "great": return "Great";
    case "good": return "Good";
    case "median": return "Median";
    case "below": return "Below";
    case "red-flag": return "Red flag";
  }
}

function barIntent(band: DialRow["band"]): "accent" | "success" | "warning" | "danger" {
  switch (band) {
    case "great": return "success";
    case "good": return "accent";
    case "median": return "accent";
    case "below": return "warning";
    case "red-flag": return "danger";
  }
}

/**
 * Position a dial's fill 0..100 from the band.
 * Calibration is deliberately generous — "good" sits at 75% so the operator
 * sees room to grow into "great".
 */
function bandToFill(band: DialRow["band"]): number {
  switch (band) {
    case "great": return 100;
    case "good": return 78;
    case "median": return 55;
    case "below": return 30;
    case "red-flag": return 12;
  }
}

function fmt(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  if (unit === "$") return `$${Math.round(value).toLocaleString()}`;
  if (unit === "%") return `${(value * 100).toFixed(0)}%`;
  if (unit === ":1") return `${value.toFixed(1)}:1`;
  if (unit === " mo") return `${value.toFixed(1)} mo`;
  return value.toFixed(1);
}

export function BenchmarkDial({ rows }: BenchmarkDialProps) {
  const [store, setStore] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [dial, setDial] = useState<BenchmarkDialState>(BENCHMARK_DIAL_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate both sources on mount.
  useEffect(() => {
    const ys = loadYourStore();
    if (ys) setStore(ys);
    setDial(loadBenchmarkDial());
    setHydrated(true);
  }, []);

  // Cross-tab sync: react when Your-store changes in another tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1") {
        const ys = loadYourStore();
        if (ys) setStore(ys);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function updateDial(next: Partial<BenchmarkDialState>) {
    const merged = { ...dial, ...next };
    setDial(merged);
    saveBenchmarkDial(merged);
  }

  const dials = useMemo<DialRow[]>(() => {
    const aovSelection = selectAovRow(rows, dial.vertical);
    const aovRow = aovSelection ? findRow(rows, new RegExp(aovSelection.rowKey.replace(/[()]/g, "\\$&"))) : null;
    const gmRow =
      dial.vertical === "apparel"
        ? findRow(rows, /Gross margin \(DTC apparel\)/)
        : findRow(rows, /Gross margin \(DTC consumables\)/);
    const cacRow = findRow(rows, /Blended CAC \(consumer\)/);
    const ltvRow = findRow(rows, /LTV : CAC ratio/);
    const paybackRow = findRow(rows, /CAC payback period/);
    const projected = projectFromYourStore(store, dial.repeatRate);
    const impliedLtvCac = projected.ltvAt12mo / Math.max(1, projected.breakEvenCAC);

    const out: DialRow[] = [];

    if (aovRow) {
      const cls = classify(store.aov, aovRow["Healthy (median)"], aovRow["Good (top-quartile)"], aovRow["Red flag"], "higher-is-better");
      out.push({
        metric: "AOV",
        helper: aovSelection?.label ?? "",
        value: store.aov,
        unit: "$",
        band: cls.band,
        message: cls.message,
        position: bandToFill(cls.band),
      });
    }
    if (gmRow) {
      const cls = classify(
        store.grossMargin * 100,
        gmRow["Healthy (median)"],
        gmRow["Good (top-quartile)"],
        gmRow["Red flag"],
        "higher-is-better",
      );
      out.push({
        metric: "Gross margin",
        helper: "After COGS, before CAC + ship",
        value: store.grossMargin * 100,
        unit: "%",
        band: cls.band,
        message: cls.message,
        position: bandToFill(cls.band),
      });
    }
    if (cacRow) {
      // The operator's break-even CAC is their first-order gross profit.
      // Score it against the consumer CAC bands — lower is better.
      const cls = classify(
        projected.breakEvenCAC,
        cacRow["Healthy (median)"],
        cacRow["Good (top-quartile)"],
        cacRow["Red flag"],
        "lower-is-better",
      );
      out.push({
        metric: "Break-even CAC ceiling",
        helper: "AOV × gross margin — the most you can pay for a one-shot customer",
        value: projected.breakEvenCAC,
        unit: "$",
        band: cls.band,
        message: cls.message,
        position: bandToFill(cls.band),
      });
    }
    if (ltvRow) {
      const cls = classify(
        impliedLtvCac,
        ltvRow["Healthy (median)"],
        ltvRow["Good (top-quartile)"],
        ltvRow["Red flag"],
        "higher-is-better",
      );
      out.push({
        metric: "Implied LTV : CAC",
        helper: `First-order GP × (1 + ${(dial.repeatRate * 100).toFixed(0)}% repeat)`,
        value: impliedLtvCac,
        unit: ":1",
        band: cls.band,
        message: cls.message,
        position: bandToFill(cls.band),
      });
    }
    if (paybackRow) {
      const cls = classify(
        projected.impliedCacPaybackMonths,
        paybackRow["Healthy (median)"],
        paybackRow["Good (top-quartile)"],
        paybackRow["Red flag"],
        "lower-is-better",
      );
      out.push({
        metric: "CAC payback",
        helper: "Months to recover first-order CAC from monthly profit",
        value: projected.impliedCacPaybackMonths,
        unit: " mo",
        band: cls.band,
        message: cls.message,
        position: bandToFill(cls.band),
      });
    }
    return out;
  }, [rows, dial.vertical, dial.repeatRate, store]);

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Where does my store sit?</CardTitle>
            <CardDescription className="text-xs">
              Your numbers from{" "}
              <a className="underline hover:text-foreground" href="#your-store">
                Your store
              </a>{" "}
              scored against the canonical Unit Economics benchmark table
              (research/00 · Shopify + Klaviyo + Triple Whale + Smile.io).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              Vertical
            </Badge>
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {(["consumer", "apparel", "home"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateDial({ vertical: v })}
                  className={cn(
                    "px-2 py-1 text-[10px] uppercase tracking-wider",
                    dial.vertical === v
                      ? "bg-foreground text-background"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={dial.vertical === v}
                >
                  {VERTICAL_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            12-mo repeat-rate assumption
          </label>
          <input
            type="range"
            min={5}
            max={70}
            step={5}
            value={Math.round(dial.repeatRate * 100)}
            onChange={(e) => updateDial({ repeatRate: parseInt(e.target.value, 10) / 100 })}
            className="flex-1 max-w-[160px] accent-accent"
            aria-label="12-month repeat rate"
          />
          <span className="text-xs tabular-nums font-medium">
            {(dial.repeatRate * 100).toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!hydrated ? (
          <div className="text-xs text-muted-foreground py-6 text-center">
            Loading Your-store inputs…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dials.map((d) => (
              <div
                key={d.metric}
                className={cn(
                  "rounded-lg border p-3 flex flex-col gap-2",
                  intentClass(d.band),
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wider font-semibold">
                    {d.metric}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                    {bandLabel(d.band)}
                  </div>
                </div>
                <div className="text-2xl font-semibold tabular-nums">
                  {fmt(d.value, d.unit)}
                </div>
                <div className="text-[11px] leading-snug opacity-80">{d.helper}</div>
                <Bar value={d.position} intent={barIntent(d.band)} />
                <div className="text-[10px] opacity-70 leading-snug">{d.message}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-[10px] text-muted-foreground">
          Dialed from{" "}
          <span className="font-medium text-foreground">
            AOV ${store.aov.toLocaleString()} · {Math.round(store.monthlyOrders).toLocaleString()} orders/mo · {(store.grossMargin * 100).toFixed(0)}% margin
          </span>
          . Edit any of those on{" "}
          <a className="underline hover:text-foreground" href="#your-store">
            Your store
          </a>{" "}
          and the dials re-score on next visit.
        </div>
      </CardContent>
    </Card>
  );
}
