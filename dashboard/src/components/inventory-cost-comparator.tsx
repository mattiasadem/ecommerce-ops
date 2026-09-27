"use client";

import { useEffect, useMemo, useState } from "react";
import {
  INVENTORY_DEFAULTS,
  INVENTORY_STORAGE_KEY,
  computeInventoryCost,
  inventoryVerdictTag,
  mergeFromYourStoreForInventory,
  renderInventoryCostMarkdown,
  validateInventoryInputs,
  type InventoryCostInputs,
} from "@/lib/inventory-cost-comparator";
import { CopyButton } from "@/components/copy-button";
import { loadYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * Interactive 3PL-vs-In-house Cost Comparator on `/inventory`.
 *
 * The /inventory page historically surfaced only static research tables
 * (3PL vs in-house, Major 3PLs pricing, forecasting basics, CCC). This
 * calculator closes the gap: the operator enters the actual monthly
 * in-house cost stack (FTE headcount + loaded $/hr + warehouse lease +
 * inbound freight + misc ops + returns processing time) AND the actual
 * quoted 3PL cost stack (pick-pack per order + storage per pallet/month +
 * receiving per hour) — and the panel responds with:
 *
 *   - Side-by-side monthly cost stack table
 *   - Annualized delta (positive = 3PL cheaper per year)
 *   - Break-even monthly order volume (above this, in-house wins; below, 3PL wins)
 *   - Ship-time savings (3PL typically shaves 0.5–3.0 days P50)
 *   - 5-bucket verdict tag (STRONG 3PL / LEAN 3PL / PARITY / LEAN IN-HOUSE / STRONG IN-HOUSE)
 *
 * Defaults match research/05 §3PL-vs-in-house (2,500 orders/mo @ $75 AOV,
 * 3 FTE at $28/hr loaded, $8,500/mo lease, 12 pallets, ShipBob Mid-Market
 * quoted at $5.10 pick+pack + $35/pallet storage + $40/hr receiving).
 *
 * Cross-page intelligence: on first mount the panel reads
 * `ecom-ops:your-store:v1` and pre-fills `monthlyOrders` + `aov` from
 * the operator's Your-store card on Overview. If the operator updates
 * those values on Overview while the panel is mounted, the panel re-hydrates
 * on focus via the `storage` event.
 *
 * State-persistence: writes the entire `InventoryCostInputs` to
 * `ecom-ops:inventory-cost-comparator:v1`. Bump the suffix on incompatible
 * schema changes — old keys naturally fall through to null and defaults
 * take over on next mount.
 */

const VALIDATION_NULL = null;

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}
function clampFloat(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function loadStored(): InventoryCostInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      monthlyOrders: clampInt(Number(parsed.monthlyOrders) || 0, 0, 1_000_000),
      aov: clampFloat(Number(parsed.aov) || 75, 0.01, 10_000),
      fteHeadcount: clampInt(Number(parsed.fteHeadcount) || 0, 0, 200),
      loadedHrlyRateUsd: clampFloat(
        Number(parsed.loadedHrlyRateUsd) || 28,
        0.01,
        200,
      ),
      warehouseLeaseUsdMo: clampFloat(
        Number(parsed.warehouseLeaseUsdMo) || 0,
        0,
        1_000_000,
      ),
      inboundPerOrderUsd: clampFloat(
        Number(parsed.inboundPerOrderUsd) || 0,
        0,
        100,
      ),
      miscOpsUsdMo: clampFloat(
        Number(parsed.miscOpsUsdMo) || 0,
        0,
        1_000_000,
      ),
      threeplPickPackUsd: clampFloat(
        Number(parsed.threeplPickPackUsd) || 5.1,
        0,
        50,
      ),
      threeplStorageUsdPallet: clampFloat(
        Number(parsed.threeplStorageUsdPallet) || 35,
        0,
        1_000,
      ),
      palletCount: clampInt(Number(parsed.palletCount) || 0, 0, 10_000),
      threeplReceivingUsdHr: clampFloat(
        Number(parsed.threeplReceivingUsdHr) || 40,
        0,
        1_000,
      ),
      threeplReturnsPct: clampFloat(
        Number(parsed.threeplReturnsPct) || 0,
        0,
        100,
      ),
      returnsHrPerOrder: clampFloat(
        Number(parsed.returnsHrPerOrder) || 0.05,
        0,
        1,
      ),
      currentShipTimeDays: clampFloat(
        Number(parsed.currentShipTimeDays) || 0,
        0,
        30,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: InventoryCostInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

const fmtUsdShort = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  if (n < 0) return `-$${Math.abs(n).toFixed(0)}`;
  return `$${n.toFixed(0)}`;
};

const fmtUsdFull = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  suffix,
}: NumberInputProps) {
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
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const v = Number(e.currentTarget.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {suffix ? (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

export function InventoryCostComparator() {
  // Inputs.
  const [inputs, setInputs] = useState<InventoryCostInputs>(
    () => INVENTORY_DEFAULTS,
  );
  const [hydrated, setHydrated] = useState(false);
  const [storeSource, setStoreSource] = useState<"your-store" | "defaults" | "stored">(
    "defaults",
  );

  // Re-hydrate on mount: prefer stored inputs, fall back to defaults overlaid
  // with Your-store inputs from Overview (cross-page intelligence).
  useEffect(() => {
    const stored = loadStored();
    const yourStore = loadYourStore();
    if (stored) {
      setInputs(stored);
      setStoreSource("stored");
    } else if (yourStore) {
      setInputs(mergeFromYourStoreForInventory(INVENTORY_DEFAULTS, yourStore));
      setStoreSource("your-store");
    }
    setHydrated(true);

    // storage event — refresh if Your-store is updated in another tab/window.
    function onStorage(e: StorageEvent) {
      if (e.key === "ecom-ops:your-store:v1") {
        const fresh = loadYourStore();
        if (fresh) {
          setInputs((prev) =>
            mergeFromYourStoreForInventory(prev, fresh),
          );
          setStoreSource((prev) => (prev === "stored" ? "stored" : "your-store"));
        }
      }
    }
    window.addEventListener("storage", onStorage);
    // Window-focus event — covers the same-tab refresh case (storage event
    // only fires across tabs).
    function onFocus() {
      const fresh = loadYourStore();
      if (fresh) {
        setInputs((prev) => mergeFromYourStoreForInventory(prev, fresh));
        setStoreSource((prev) => (prev === "stored" ? "stored" : "your-store"));
      }
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Persist on every input change.
  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const result = useMemo(() => computeInventoryCost(inputs), [inputs]);
  const reportMarkdown = useMemo(
    () => renderInventoryCostMarkdown(inputs, result),
    [inputs, result],
  );

  const validationError = validateInventoryInputs(inputs);

  function setField<K extends keyof InventoryCostInputs>(
    key: K,
    value: InventoryCostInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetToDefaults() {
    const yourStore = loadYourStore();
    setInputs(
      mergeFromYourStoreForInventory(INVENTORY_DEFAULTS, yourStore),
    );
    setStoreSource(yourStore ? "your-store" : "defaults");
  }

  function clearStored() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(INVENTORY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    resetToDefaults();
  }

  const verdictTag = inventoryVerdictTag(result.verdict);
  const perOrderDelta =
    inputs.monthlyOrders > 0
      ? (result.monthlyInhouseTotalUsd - result.monthlyThreeplTotalUsd) /
        inputs.monthlyOrders
      : 0;
  const breakEvenLabel =
    !Number.isFinite(result.breakEvenMonthlyOrders)
      ? "Never (one side wins at every volume)"
      : result.breakEvenMonthlyOrders === 0
        ? "0 orders/mo — 3PL always cheaper"
        : `${result.breakEvenMonthlyOrders.toLocaleString()} orders/mo`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">
            3PL vs In-house Cost Comparator
          </h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
              storeSource === "your-store"
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {storeSource === "your-store"
              ? "Live from Your-store"
              : storeSource === "stored"
                ? "Stored inputs"
                : "Industry-median default"}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              verdictTag.tone,
            )}
          >
            {verdictTag.label}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-2 hover:underline"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={clearStored}
            className="text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear stored
          </button>
        </div>
      </header>

      <p className="text-xs text-muted-foreground max-w-prose">
        Enter your in-house cost stack (FTE × loaded $/hr × lease) AND a
        3PL quote (pick-pack/order + storage/pallet + receiving/hr). The
        panel computes monthly cost for both, the annualized delta, the
        break-even monthly order volume, the ship-time savings, and
        assigns a verdict — STRONG 3PL / LEAN 3PL / PARITY / LEAN IN-HOUSE
        / STRONG IN-HOUSE — with an operator handoff. Defaults mirror
        research/05 §3PL vs in-house canonical bench.
      </p>

      {/* INPUT GRID — in-house + 3PL stacks side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* IN-HOUSE COST STACK */}
        <div className="rounded-lg border border-border p-3 flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            In-house cost stack (monthly)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Monthly orders"
              value={inputs.monthlyOrders}
              onChange={(v) => setField("monthlyOrders", v)}
              step={100}
              max={1_000_000}
            />
            <NumberInput
              label="Average order value"
              value={inputs.aov}
              onChange={(v) => setField("aov", v)}
              step={5}
              suffix="$"
            />
            <NumberInput
              label="FTE headcount"
              value={inputs.fteHeadcount}
              onChange={(v) => setField("fteHeadcount", v)}
              step={1}
              max={200}
            />
            <NumberInput
              label="Loaded $/hr per FTE"
              value={inputs.loadedHrlyRateUsd}
              onChange={(v) => setField("loadedHrlyRateUsd", v)}
              step={1}
              max={200}
              suffix="$/hr"
            />
            <NumberInput
              label="Warehouse lease"
              value={inputs.warehouseLeaseUsdMo}
              onChange={(v) => setField("warehouseLeaseUsdMo", v)}
              step={500}
              max={1_000_000}
              suffix="$/mo"
            />
            <NumberInput
              label="Inbound + freight per order"
              value={inputs.inboundPerOrderUsd}
              onChange={(v) => setField("inboundPerOrderUsd", v)}
              step={0.5}
              max={100}
              suffix="$/order"
            />
            <NumberInput
              label="Misc ops (shrink + supplies + software)"
              value={inputs.miscOpsUsdMo}
              onChange={(v) => setField("miscOpsUsdMo", v)}
              step={100}
              max={1_000_000}
              suffix="$/mo"
            />
            <NumberInput
              label="Return rate"
              value={inputs.threeplReturnsPct}
              onChange={(v) => setField("threeplReturnsPct", v)}
              step={1}
              max={100}
              suffix="%"
            />
            <NumberInput
              label="Returns processing time"
              value={inputs.returnsHrPerOrder}
              onChange={(v) => setField("returnsHrPerOrder", v)}
              step={0.01}
              max={1}
              suffix="hr/order"
            />
            <NumberInput
              label="Current ship time (P50)"
              value={inputs.currentShipTimeDays}
              onChange={(v) => setField("currentShipTimeDays", v)}
              step={0.5}
              max={30}
              suffix="days"
            />
          </div>
        </div>

        {/* 3PL COST STACK */}
        <div className="rounded-lg border border-border p-3 flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            3PL quote (monthly)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Pick + pack per order"
              value={inputs.threeplPickPackUsd}
              onChange={(v) => setField("threeplPickPackUsd", v)}
              step={0.5}
              max={50}
              suffix="$/order"
            />
            <NumberInput
              label="Storage per pallet"
              value={inputs.threeplStorageUsdPallet}
              onChange={(v) => setField("threeplStorageUsdPallet", v)}
              step={5}
              max={1_000}
              suffix="$/pallet/mo"
            />
            <NumberInput
              label="Pallet count"
              value={inputs.palletCount}
              onChange={(v) => setField("palletCount", v)}
              step={1}
              max={10_000}
            />
            <NumberInput
              label="Receiving labor"
              value={inputs.threeplReceivingUsdHr}
              onChange={(v) => setField("threeplReceivingUsdHr", v)}
              step={5}
              max={1_000}
              suffix="$/hr"
            />
          </div>
          <div className="text-[10px] text-muted-foreground italic">
            For 3PL, returns are handled at ~50% of in-house cost — the
            comparison auto-applies this ratio (research/05 §3PL
            returns-handling bench).
          </div>
        </div>
      </div>

      {validationError !== VALIDATION_NULL ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
          {validationError}
        </div>
      ) : null}

      {/* OUTPUT — side-by-side cost stack + delta */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            In-house monthly cost
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {fmtUsdFull(result.monthlyInhouseTotalUsd)}
          </div>
          <ul className="text-[11px] leading-relaxed text-muted-foreground divide-y divide-border">
            <li className="flex justify-between py-0.5">
              <span>Labor (FTE × 160 × 75% util × $/hr)</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyInhouseLaborUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Warehouse lease</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyInhouseLeaseUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Inbound + freight</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyInhouseInboundUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Misc ops</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyInhouseMiscUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Returns processing</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyInhouseReturnsUsd)}</span>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            3PL monthly cost
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {fmtUsdFull(result.monthlyThreeplTotalUsd)}
          </div>
          <ul className="text-[11px] leading-relaxed text-muted-foreground divide-y divide-border">
            <li className="flex justify-between py-0.5">
              <span>Pick + pack ({fmtUsdFull(inputs.threeplPickPackUsd)}/order)</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyThreeplPickPackUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Storage ({inputs.palletCount} pallets)</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyThreeplStorageUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Receiving (~24 min/pallet)</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyThreeplReceivingUsd)}</span>
            </li>
            <li className="flex justify-between py-0.5">
              <span>Returns (3PL handles ~50%)</span>
              <span className="font-mono tabular-nums">{fmtUsdFull(result.monthlyThreeplReturnsUsd)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* KEY METRICS BAR */}
      <div className="rounded-lg border border-border p-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Per-order delta
          </span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              perOrderDelta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-sky-600 dark:text-sky-400",
            )}
          >
            {perOrderDelta >= 0 ? "+" : ""}
            {fmtUsdShort(perOrderDelta)}/ord
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Monthly delta
          </span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              result.monthlyDeltaUsd >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-sky-600 dark:text-sky-400",
            )}
          >
            {result.monthlyDeltaUsd >= 0 ? "+" : ""}
            {fmtUsdFull(result.monthlyDeltaUsd)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Annual delta
          </span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              result.annualDeltaUsd >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-sky-600 dark:text-sky-400",
            )}
          >
            {result.annualDeltaUsd >= 0 ? "+" : ""}
            {fmtUsdFull(result.annualDeltaUsd)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Break-even
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {breakEvenLabel}
          </span>
        </div>
      </div>

      {/* Justification + ship-time + Year-1 ROI band */}
      <div className="rounded-lg border border-border p-3 flex flex-col gap-2 text-xs leading-relaxed">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ship-time savings (P50)
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {result.shipTimeSavingsLowDays}–{result.shipTimeSavingsHighDays} days
              <span className="text-[10px] text-muted-foreground ml-1">
                (midpoint {result.shipTimeSavingsDays.toFixed(1)})
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI band
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {result.year1RoiLow.toFixed(1)}:1 to {result.year1RoiHigh.toFixed(1)}:1
              <span className="text-[10px] text-muted-foreground ml-1">
                (annual delta ÷ migration cost ${(result.migrationCostLowUsd / 1000).toFixed(0)}k–${(result.migrationCostHighUsd / 1000).toFixed(0)}k)
              </span>
            </span>
          </div>
        </div>
        <p className="text-muted-foreground">{result.verdictJustification}</p>
      </div>

      {/* Copy report */}
      <div className="flex items-center justify-between gap-3">
        <CopyButton
          value={reportMarkdown}
          label="Copy report"
          className="text-[10px] uppercase tracking-wider"
        />
        <span className="text-[10px] text-muted-foreground">
          Source · {storeSource === "your-store" ? "your-store (Overview)" : "stored"} + research/05 §3PL vs in-house
        </span>
      </div>
    </div>
  );
}
