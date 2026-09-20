"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHANNEL_SPECS,
  ChannelId,
  ChannelMixResult,
  PRESET_DEFAULT,
  PRESET_META_HEAVY,
  PRESET_EMAIL_HEAVY,
  channelMixHealthBand,
  emptyAllocation,
  renderChannelMixMarkdown,
  scoreChannelMix,
} from "@/lib/channel-mix";
import {
  YOUR_STORE_DEFAULTS,
  YOUR_STORE_STORAGE_KEY,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { formatUsd, formatInt, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `Channel Mix Budget Allocator` — interactive ROI calculator for the
 * `/channels` page.
 *
 * Direct browser port of the channel-ranking math from
 * `research/00-ecommerce-ops-landscape.md` § 2 (Acquisition Channels Ranked
 * by ROI). Operator enters a monthly marketing budget, splits it across the
 * 10 canonical channels via percentage sliders, and the panel projects:
 *   - Per-channel $ allocation (constrained to total budget, normalized
 *     so a sum ≠ 100 still produces a coherent allocation)
 *   - Per-channel estimated revenue (low / high band × $ allocation)
 *   - Blended ROAS (total revenue ÷ total budget)
 *   - Total net margin $ tied to Your-store's gross-margin %
 *
 * State persists to localStorage (`ecom-ops:channel-mix:v1`) so the
 * allocation survives reloads. Cross-tab / cross-card sync via the
 * `storage` event on YOUR_STORE_STORAGE_KEY so the operator's edits on
 * Overview propagate to the personalized $-projection in real time.
 *
 * Mounted on `dashboard/app/channels/page.tsx` between the channel-ranking
 * Card and the per-channel benchmark Cards.
 */

const STORAGE_KEY = "ecom-ops:channel-mix:v1";

type AllocationMap = Record<ChannelId, number>;

interface StoredState {
  monthlyBudget: number;
  allocation: AllocationMap;
}

function loadStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const budget = Number((parsed as StoredState).monthlyBudget);
    const alloc = (parsed as StoredState).allocation;
    if (!Number.isFinite(budget) || !alloc || typeof alloc !== "object") {
      return null;
    }
    return {
      monthlyBudget: Math.max(0, Math.min(1_000_000, budget)),
      allocation: { ...emptyAllocation(), ...alloc },
    };
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

// ---------- Visual tone ---------------------------------------------------

const RISK_TONE: Record<
  "great" | "good" | "fair" | "speculative" | "halo",
  string
> = {
  great: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  good: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  fair: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  speculative: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  halo: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const RISK_LABEL: Record<string, string> = {
  great: "highest ROI",
  good: "good",
  fair: "fair",
  speculative: "speculative",
  halo: "halo / unmeasurable",
};

const HEALTH_TONE: Record<string, string> = {
  healthy:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  good: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  fair: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  weak: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  none: "border-border bg-muted text-muted-foreground",
};

const HEALTH_LABEL: Record<string, string> = {
  healthy: "healthy (4×+)",
  good: "good (2.5–4×)",
  fair: "fair (2–2.5×)",
  weak: "weak (<2×)",
  none: "no budget",
};

// ---------- Component -----------------------------------------------------

export function ChannelMixAllocator() {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(5000);
  const [allocation, setAllocation] = useState<AllocationMap>(PRESET_DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [store, setStore] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [storeIsLive, setStoreIsLive] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setMonthlyBudget(stored.monthlyBudget);
      setAllocation(stored.allocation);
    }
    const loadedStore = loadYourStore();
    if (loadedStore) {
      setStore(loadedStore);
      setStoreIsLive(true);
    }
    setHydrated(true);
  }, []);

  // Cross-tab sync for Your-store.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === YOUR_STORE_STORAGE_KEY) {
        const refreshed = loadYourStore();
        if (refreshed) {
          setStore(refreshed);
          setStoreIsLive(true);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    storeInputs({ monthlyBudget, allocation });
  }, [monthlyBudget, allocation, hydrated]);

  const result: ChannelMixResult = useMemo(
    () => scoreChannelMix({ monthlyBudget, allocation }, store),
    [monthlyBudget, allocation, store],
  );

  function setAllocationPct(id: ChannelId, value: number) {
    setAllocation((prev) => ({ ...prev, [id]: Math.max(0, Math.min(100, value)) }));
  }

  function applyPreset(preset: AllocationMap) {
    setAllocation({ ...preset });
  }

  function resetToDefault() {
    setMonthlyBudget(5000);
    setAllocation({ ...PRESET_DEFAULT });
  }

  function zeroAll() {
    setAllocation(emptyAllocation());
  }

  async function copyReport() {
    const md = renderChannelMixMarkdown(result, monthlyBudget, store, storeIsLive);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 1500);
    } catch {
      setReportCopied(false);
    }
  }

  const health = channelMixHealthBand(result.blendedRoasLow);
  const hasSignal = result.blendedRoasLow > 0;
  const allocationSum = Object.values(allocation).reduce(
    (acc, n) => acc + Math.max(0, n),
    0,
  );
  const sumNormalized = Math.round(allocationSum * 100) / 100;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">
            Channel mix budget allocator · ranked by research/00 § 2
          </h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
              storeIsLive
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {storeIsLive ? "Live numbers" : "Industry-median default"}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Source · {storeIsLive ? "Your-store" : "YOUR_STORE_DEFAULTS"}
        </span>
      </header>

      {/* ===== INPUTS — budget + presets ===== */}
      <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-0.5 flex-1 min-w-[12rem]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Monthly budget (USD)
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={500}
              min={0}
              max={1_000_000}
              value={monthlyBudget}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setMonthlyBudget(Number.isNaN(n) ? 0 : Math.max(0, Math.min(1_000_000, n)));
              }}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
              data-testid="channel-mix-budget-input"
              aria-label="Monthly marketing budget in USD"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset(PRESET_DEFAULT)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="channel-mix-preset-default"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESET_META_HEAVY)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="channel-mix-preset-meta"
            >
              Meta-heavy
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESET_EMAIL_HEAVY)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="channel-mix-preset-email"
            >
              Email-heavy
            </button>
            <button
              type="button"
              onClick={zeroAll}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="channel-mix-zero-all"
            >
              Zero all
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="channel-mix-reset-default"
            >
              Reset all
            </button>
            <button
              type="button"
              onClick={copyReport}
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ml-auto",
                reportCopied
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-accent bg-accent text-accent-foreground hover:bg-accent/90",
              )}
              data-testid="channel-mix-copy-report"
            >
              {reportCopied ? "Copied report" : "Copy report"}
            </button>
          </div>
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>
            Allocation sum: {sumNormalized.toFixed(1)}%{" "}
            {Math.abs(allocationSum - 100) > 0.1
              ? "(normalized to 100% on scoring)"
              : ""}
          </span>
          <span>
            Auto-saved · {hydrated ? "synced" : "loading…"}
          </span>
        </div>
      </div>

      {/* ===== OUTPUTS — headline metrics ===== */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Total budget
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {formatUsd(result.totalBudget)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            / month across {result.rows.filter((r) => r.dollars > 0).length} channels
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Blended ROAS band
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {hasSignal
              ? `${result.blendedRoasLow.toFixed(1)}–${result.blendedRoasHigh.toFixed(1)}×`
              : "—"}
          </div>
          <div
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider mt-1",
              HEALTH_TONE[health],
            )}
          >
            {HEALTH_LABEL[health]}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Est. revenue / mo
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {hasSignal
              ? `${formatUsd(result.totalRevenueLow)}–${formatUsd(result.totalRevenueHigh)}`
              : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            ROAS bands per research/00 § 2
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Net margin / mo
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {hasSignal
              ? `${formatUsd(result.totalMarginLow)}–${formatUsd(result.totalMarginHigh)}`
              : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            at {formatPercent(store.grossMargin, 0)} gross margin ·{" "}
            {storeIsLive ? "Your-store" : "defaults"}
          </div>
        </div>
      </div>

      {/* ===== INPUTS — per-channel sliders ===== */}
      <div className="rounded-xl border border-border bg-card p-3">
        <header className="flex items-baseline justify-between mb-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider">
            Allocation sliders
          </h4>
          <span className="text-[10px] text-muted-foreground">
            sliders normalize to 100% on scoring
          </span>
        </header>
        <div className="flex flex-col gap-2">
          {CHANNEL_SPECS.map((c) => {
            const pct = allocation[c.id] ?? 0;
            const row = result.rows.find((r) => r.channel.id === c.id)!;
            return (
              <div
                key={c.id}
                className="rounded-md border border-border bg-background/40 px-2 py-1.5 flex flex-col gap-1"
                data-testid={`channel-mix-row-${c.id}`}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-5">
                      [{c.rank}]
                    </span>
                    <span className="text-xs font-medium">{c.title}</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                        RISK_TONE[c.risk],
                      )}
                    >
                      {RISK_LABEL[c.risk]}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      ROAS {c.roasLow.toFixed(1)}–{c.roasHigh.toFixed(1)}×
                    </span>
                  </div>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {pct > 0 ? `${pct.toFixed(1)}% · ` : ""}
                    {row.dollars > 0
                      ? `${formatUsd(row.dollars)} · est. ${formatUsd(row.revenueLow)}–${formatUsd(row.revenueHigh)}`
                      : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pct}
                  onChange={(e) =>
                    setAllocationPct(c.id, parseFloat(e.target.value))
                  }
                  className="w-full accent-accent"
                  aria-label={`Allocation for ${c.title}`}
                  data-testid={`channel-mix-slider-${c.id}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== OUTPUTS — personalized projection ===== */}
      <div
        className={cn(
          "rounded-xl border p-4 flex flex-col gap-2",
          hasSignal
            ? "border-accent/40 bg-accent/5"
            : "border-border bg-card",
        )}
        data-testid="channel-mix-personalized"
      >
        <header className="flex items-baseline justify-between gap-3 flex-wrap">
          <h4 className="text-sm font-semibold">
            Personalized projection · tied to Your-store
          </h4>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AOV {formatUsd(store.aov)} × {formatInt(store.monthlyOrders)} orders/mo ·{" "}
            {formatPercent(store.grossMargin, 0)} margin
          </span>
        </header>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hasSignal ? (
            <>
              Splitting {formatUsd(result.totalBudget)} across {result.rows.filter((r) => r.dollars > 0).length}{" "}
              channels at a {result.blendedRoasLow.toFixed(1)}–{result.blendedRoasHigh.toFixed(1)}×
              blended ROAS yields{" "}
              <span className="text-foreground font-semibold">
                {formatUsd(result.totalRevenueLow)}–{formatUsd(result.totalRevenueHigh)}
              </span>{" "}
              est. revenue / mo and{" "}
              <span className="text-foreground font-semibold">
                {formatUsd(result.totalMarginLow)}–{formatUsd(result.totalMarginHigh)}
              </span>{" "}
              net margin / mo at Your-store's {formatPercent(store.grossMargin, 0)} gross margin.
              Edit Your-store on Overview to see this number change in real time. Numbers project
              the channel's blended-ROAS band — Email+SMS dominates (36–40× per $1) but only
              works on already-acquired customers; Meta + Google + TikTok carry new-customer
              acquisition cost. PR / founder-led media is halo-only — not measurable in channel
              P&L.
            </>
          ) : (
            <>
              Set a monthly budget above to see the blended-ROAS projection. The 10 channel
              sliders default to the canonical research/00 § 2 ranking. Edit Your-store on
              Overview to use live AOV/orders/margin numbers (industry-median default is{" "}
              {formatUsd(YOUR_STORE_DEFAULTS.aov)} ×{" "}
              {formatInt(YOUR_STORE_DEFAULTS.monthlyOrders)} orders/mo ×{" "}
              {formatPercent(YOUR_STORE_DEFAULTS.grossMargin, 0)} margin).
            </>
          )}
        </p>
      </div>
    </div>
  );
}