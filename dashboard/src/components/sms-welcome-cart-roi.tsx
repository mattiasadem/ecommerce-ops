"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SMS_WELCOME_CART_DEFAULTS,
  SmsWelcomeCartInputs,
  forecastSmsWelcomeCart,
  healthBandShort,
} from "@/lib/sms-welcome-cart-roi";
import { formatInt, formatPercent, formatRatio, formatUsd } from "@/lib/format";
import { loadYourStore, mergeFromYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

/**
 * Interactive SMS Welcome + Cart-Abandon 4-Flow ROI Calculator.
 *
 * Direct port of the canonical benchmarks in
 * `/src/playbooks/06-sms-welcome-and-cart-abandon.md` (no equivalent Python
 * CLI today; math is modeled on `scripts/welcome_series_roi.py`'s
 * per-flow discipline). Operator enters:
 *
 *   - Volume: SMS opt-ins / mo, baseline email-only CVR, cart starts / mo,
 *     orders / mo.
 *   - Per-flow assumptions: AOV, gross margin, discount %, SMS-2 recovery
 *     rate, SMS-3 escalation rate, welcome CVR lift, SMS-4 review CVR,
 *     $/review submitted, $/SMS sent.
 *
 * The panel computes and displays per-flow orders + gross revenue + send
 * cost + net, totals (orders, gross, discount, net margin, send cost, net
 * revenue), the headline ROI ratio (net margin / total send cost), $/SMS,
 * cart-recovery %, reviews/mo, and a 6-tier health band (great ≥30:1 /
 * good 10-30:1 / marginal 3-10:1 / weak <3:1 / negative / zero-cost).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:sms-wc-roi:v1`) so the
 * operator's real numbers survive reloads. Copy-report emits a paste-ready
 * markdown handoff (per-flow rows + totals + verdict).
 *
 * Mounted on `/playbooks/06-sms-welcome-and-cart-abandon` so operators get
 * an interactive forecast on the playbook they are about to ship — same
 * pattern as the abandoned-cart + welcome-series + loyalty calculators on
 * the other playbook pages.
 */

const STORAGE_KEY = "ecom-ops:playbooks:sms-wc-roi:v1";

type InputField = keyof SmsWelcomeCartInputs;

const NUMBER_FIELDS: Array<{
  field: InputField;
  label: string;
  step: number;
  min: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}> = [
  { field: "smsOptinsPerMonth", label: "SMS opt-ins / month", step: 50, min: 0, suffix: "Postscript + Klaviyo TCPA-compliant" },
  { field: "baselineFirstPurchaseCvr", label: "Baseline opt-in CVR (email-only)", step: 0.005, min: 0, max: 1, suffix: "e.g. 0.03 = 3%" },
  { field: "cartStartsPerMonth", label: "Cart-starts / month", step: 100, min: 0, suffix: "Shopify Analytics" },
  { field: "ordersPerMonth", label: "Orders / month", step: 50, min: 0, suffix: "fulfillment denominator" },
  { field: "aov", label: "Average order value (AOV)", step: 5, min: 1, prefix: "$", suffix: "USD" },
  { field: "grossMargin", label: "Gross margin", step: 0.05, min: 0.05, max: 0.95, suffix: "fraction (0.70 = 70%)" },
  { field: "discountFraction", label: "Discount on SMS-1 + SMS-3", step: 0.025, min: 0, max: 0.5, suffix: "first-order %" },
  { field: "cartRecoveryRate1", label: "SMS-2 cart recovery rate", step: 0.005, min: 0, max: 0.5, suffix: "0.05 = 5% recover" },
  { field: "cartRecoveryRate2", label: "SMS-3 escalation recovery", step: 0.005, min: 0, max: 0.5, suffix: "0.03 = 3% recover" },
  { field: "welcomeLiftPct", label: "SMS-1 CVR lift vs baseline", step: 0.05, min: 0, max: 1, suffix: "0.20 = +20% lift" },
  { field: "reviewCvr", label: "SMS-4 review-submission CVR", step: 0.025, min: 0, max: 1, suffix: "0.20 = 20% submit" },
  { field: "reviewValuePerSubmission", label: "Value per review ($)", step: 1, min: 0, prefix: "$", suffix: "UGC + ranking + SEO" },
  { field: "smsCostPerMessage", label: "Cost / SMS sent", step: 0.001, min: 0, prefix: "$", suffix: "Postscript + carrier + 10DLC" },
];

function loadStored(): SmsWelcomeCartInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as SmsWelcomeCartInputs;
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: SmsWelcomeCartInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function clamp(value: number, min: number, max?: number): number {
  if (Number.isNaN(value)) return min;
  let v = value;
  if (v < min) v = min;
  if (typeof max === "number" && v > max) v = max;
  return v;
}

// Map Your-store → calculator defaults via the canonical field map.
function yourStoreProjection(ys: { aov: number; monthlyOrders: number; grossMargin: number }): Partial<SmsWelcomeCartInputs> {
  return {
    aov: ys.aov,
    grossMargin: ys.grossMargin,
    ordersPerMonth: Math.max(1, Math.round(ys.monthlyOrders)),
    // SMS opt-ins ≈ 25% of email-newsletter opt-ins; cart-starts ≈ 3× orders for mid DTC.
    smsOptinsPerMonth: Math.max(1, Math.round(ys.monthlyOrders * 0.25)),
    cartStartsPerMonth: Math.max(1, Math.round(ys.monthlyOrders * 3)),
  };
}

export function SmsWelcomeCartROICalculator() {
  const [inputs, setInputs] = useState<SmsWelcomeCartInputs>(SMS_WELCOME_CART_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setFromYourStore(false);
    } else {
      const yourStore = loadYourStore();
      if (yourStore) {
        // Merge the canonical projection over the defaults (preserves all
        // benchmark assumptions like the welcomeLiftPct + cart recovery
        // rates; only re-anchors the volume + AOV + margin onto the
        // operator's saved numbers).
        const projection = yourStoreProjection(yourStore);
        setInputs((prev) => ({ ...prev, ...projection }));
        setFromYourStore(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const fc = useMemo(() => forecastSmsWelcomeCart(inputs), [inputs]);
  const band = fc.healthBandShort;

  const setField = (field: InputField, raw: string) => {
    const cfg = NUMBER_FIELDS.find((f) => f.field === field);
    if (!cfg) return;
    const num = parseFloat(raw);
    setInputs((prev) => ({
      ...prev,
      [field]: clamp(Number.isNaN(num) ? cfg.min : num, cfg.min, cfg.max),
    }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset to canonical SMS Welcome + Cart-Abandon defaults?");
      if (!ok) return;
    }
    setInputs(SMS_WELCOME_CART_DEFAULTS);
    setFromYourStore(false);
  };

  const copyReport = async () => {
    const md = [
      `# SMS Welcome + Cart-Abandon — ROI Forecast`,
      ``,
      `Inputs:`,
      `  SMS opt-ins / month           : ${formatInt(inputs.smsOptinsPerMonth)}`,
      `  Baseline CVR (email-only)     : ${formatPercent(inputs.baselineFirstPurchaseCvr, 2)}`,
      `  Cart-starts / month           : ${formatInt(inputs.cartStartsPerMonth)}`,
      `  Orders / month                : ${formatInt(inputs.ordersPerMonth)}`,
      `  AOV                           : ${formatUsd(inputs.aov)}`,
      `  Gross margin                  : ${formatPercent(inputs.grossMargin, 1)}`,
      `  Discount (SMS-1 + SMS-3)      : ${formatPercent(inputs.discountFraction, 1)}`,
      `  SMS-2 cart recovery           : ${formatPercent(inputs.cartRecoveryRate1, 2)}`,
      `  SMS-3 escalation recovery     : ${formatPercent(inputs.cartRecoveryRate2, 2)}`,
      `  SMS-1 CVR lift                : ${formatPercent(inputs.welcomeLiftPct, 1)}`,
      `  SMS-4 review CVR              : ${formatPercent(inputs.reviewCvr, 1)}`,
      `  Value per review              : ${formatUsd(inputs.reviewValuePerSubmission)}`,
      `  Cost / SMS sent               : ${formatUsd(inputs.smsCostPerMessage)}`,
      ``,
      `Per-flow forecast (monthly):`,
      `  SMS-1 Welcome            : +${fc.sms1.orders.toFixed(1)} orders / ${formatUsd(fc.sms1.grossRevenue)} gross / ${formatUsd(fc.sms1.sendCost)} SMS / ${formatUsd(fc.sms1.netRevenue)} net`,
      `  SMS-2 Cart-Soft          : +${fc.sms2.orders.toFixed(1)} orders / ${formatUsd(fc.sms2.grossRevenue)} gross / ${formatUsd(fc.sms2.sendCost)} SMS / ${formatUsd(fc.sms2.netRevenue)} net`,
      `  SMS-3 Cart-Escalation    : +${fc.sms3.orders.toFixed(1)} orders / ${formatUsd(fc.sms3.grossRevenue)} gross / ${formatUsd(fc.sms3.sendCost)} SMS / ${formatUsd(fc.sms3.netRevenue)} net`,
      `  SMS-4 Review Request     : ${fc.sms4.orders.toFixed(1)} reviews / ${formatUsd(fc.sms4.netRevenue)} net (review value only)`,
      ``,
      `Totals:`,
      `  Total orders / month          : ${fc.totalOrders.toFixed(1)}`,
      `  Total gross revenue           : ${formatUsd(fc.totalGrossRevenue)}`,
      `  Total discount cost           : ${formatUsd(fc.totalDiscountCost)}`,
      `  Total net margin              : ${formatUsd(fc.totalNetMargin)}`,
      `  Total SMS send cost           : ${formatUsd(fc.totalSendCost)}`,
      `  Total net revenue (margin-cost): ${formatUsd(fc.totalNetRevenue)}`,
      `  Net margin / $1 SMS sent      : ${formatRatio(fc.roiRatio)}`,
      `  Net revenue / SMS sent        : ${formatUsd(fc.netPerSms)}`,
      `  Cart recovery combined        : ${formatPercent(fc.cartRecoveryCombinedPct, 2)}`,
      `  Reviews submitted / month     : ${formatInt(fc.reviewsSubmitted)}`,
      ``,
      `Health band: ${fc.healthBand}`,
    ].join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const INTENT_RING: Record<string, string> = {
    great: "border-emerald-500/40 bg-emerald-500/5",
    good: "border-sky-500/40 bg-sky-500/5",
    marginal: "border-amber-500/40 bg-amber-500/5",
    weak: "border-rose-500/40 bg-rose-500/5",
    negative: "border-rose-500/40 bg-rose-500/5",
    "zero-cost": "border-border bg-muted/40",
  };
  const INTENT_TEXT: Record<string, string> = {
    great: "text-success",
    good: "text-accent",
    marginal: "text-warning",
    weak: "text-danger",
    negative: "text-danger",
    "zero-cost": "text-muted-foreground",
  };

  return (
    <div
      id="sms-wc-roi"
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4",
        INTENT_RING[band],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #7
          </span>
          <h3 className="text-base font-semibold leading-tight">
            SMS Welcome + Cart-Abandon: forecast your 4-flow Postscript stack
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Defaults match the canonical $1M-GMV DTC playbook assumptions (1k SMS
            opt-ins/mo, 2.5k carts/mo, 800 orders/mo, $75 AOV, 70% margin, +20%
            welcome CVR lift, 5%+3% cart recovery, 20% review CVR). Inputs persist
            to your browser.
          </p>
          {fromYourStore && hydrated && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Prefilled from Your store on Overview
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={copyReport}
            className={cn(
              "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {copied ? "Copied ✓" : "Copy report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
        {NUMBER_FIELDS.map((cfg) => (
          <label key={cfg.field} className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {cfg.label}
            </span>
            <div className="flex items-center gap-1">
              {cfg.prefix && (
                <span className="text-xs text-muted-foreground font-mono">{cfg.prefix}</span>
              )}
              <input
                type="number"
                inputMode="decimal"
                step={cfg.step}
                min={cfg.min}
                max={cfg.max}
                value={inputs[cfg.field]}
                onChange={(e) => setField(cfg.field, e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {cfg.suffix && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {cfg.suffix}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Per-flow breakdown */}
      <div className="border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
          Per-flow forecast
        </span>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {([
            ["SMS-1 Welcome", fc.sms1, "+orders" ],
            ["SMS-2 Cart-Soft", fc.sms2, "+orders" ],
            ["SMS-3 Cart-Escalation", fc.sms3, "+orders" ],
            ["SMS-4 Review", fc.sms4, "reviews" ],
          ] as const).map(([label, flow, suffix]) => (
            <div
              key={label}
              className="rounded-md border border-border/60 bg-background/50 p-3 flex flex-col gap-1.5"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="text-base font-semibold tabular-nums">
                {flow.orders.toFixed(1)} <span className="text-[11px] text-muted-foreground">{suffix}</span>
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                Gross {formatUsd(flow.grossRevenue)} · SMS {formatUsd(flow.sendCost)}
              </span>
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  flow.netRevenue > 0 ? "text-success" : "text-danger",
                )}
              >
                Net {formatUsd(flow.netRevenue)}/mo
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total net margin
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalNetMargin)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            across all 4 flows
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total SMS send cost
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalSendCost)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Postscript + carrier + 10DLC
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total net revenue
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.totalNetRevenue > 0 ? "text-success" : "text-danger",
            )}
          >
            {formatUsd(fc.totalNetRevenue)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            margin − SMS send cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net margin / $1 SMS
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              INTENT_TEXT[band],
            )}
          >
            {formatRatio(fc.roiRatio)}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {fc.healthBand}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-[11px] md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cart recovery combined
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {formatPercent(fc.cartRecoveryCombinedPct, 2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            SMS-2 + SMS-3 / carts
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Reviews submitted / mo
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {formatInt(fc.reviewsSubmitted)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            SMS-4 funnel
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net revenue / SMS sent
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {formatUsd(fc.netPerSms)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            per-message payback
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total discount cost / mo
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {formatUsd(fc.totalDiscountCost)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            SMS-1 + SMS-3 unique codes
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Pair with{" "}
          <code className="font-mono text-[11px]">/smsbump-postscript-channel-orchestration</code>{" "}
          for the higher-lever $200–$15k/mo multi-channel Path A/B/C scorer. Open
          playbook{" "}
          <code className="font-mono text-[11px]">06-sms-welcome-and-cart-abandon</code>
          {" "}below for the paste-ready 4-flow build sequence.
        </span>
        <CopyButton value="06-sms-welcome-and-cart-abandon" label="Copy playbook ID" />
      </div>
    </div>
  );
}
