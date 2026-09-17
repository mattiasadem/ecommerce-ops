/**
 * Live trend strip rendered inside `<IkasLiveCard />`.
 *
 * Captures a rolling window of the last 12 fetches (≈6 minutes at the
 * canonical 30s auto-refresh cadence) and renders:
 *   - A compact SVG sparkline of revenue-30d over the window
 *   - A Δ vs the first sample so the operator sees if revenue is
 *     climbing, flat, or dipping during their cockpit session
 *   - A "current / N samples" caption with the relative age of the
 *     oldest sample so they know how stable the trend is
 *
 * Storage key: `ecom-ops:ikas-trend:v1` — persists across navigations
 * so closing `/today` and re-opening 10 minutes later resumes the
 * trend strip without a cold-start spike.
 *
 * Cross-tab sync via the standard `storage` event so a `/` + `/today`
 * dual-open cockpit stays in sync.
 */

"use client";

import { useEffect, useMemo, useState } from "react";

const HISTORY_KEY = "ecom-ops:ikas-trend:v1";
const HISTORY_VERSION = 1;
const HISTORY_MAX = 12;

export interface IkasTrendSample {
  /** ISO timestamp of the fetch. */
  fetchedAt: string;
  /** Revenue-30d in the same major currency the rest of the card renders. */
  revenue30dUsd: number;
  /** Order count for the 30d window. */
  orderCount30d: number;
  /** Optional currency code (for the sparkline axis label). */
  currency: string | null;
}

interface IkasTrendStorage {
  schema: "ecommerce-ops-ikas-trend";
  version: number;
  samples: IkasTrendSample[];
}

function isValidShape(value: unknown): value is IkasTrendStorage {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<IkasTrendStorage>;
  return (
    v.schema === "ecommerce-ops-ikas-trend" &&
    v.version === HISTORY_VERSION &&
    Array.isArray(v.samples)
  );
}

function loadHistory(): IkasTrendSample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!isValidShape(parsed)) return [];
    return parsed.samples.slice(-HISTORY_MAX);
  } catch {
    return [];
  }
}

function saveHistory(samples: IkasTrendSample[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: IkasTrendStorage = {
      schema: "ecommerce-ops-ikas-trend",
      version: HISTORY_VERSION,
      samples: samples.slice(-HISTORY_MAX),
    };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
    // Same-tab broadcast so other mounted <IkasTrendStrip />s in this tab
    // pick up the new sample without waiting for the storage event.
    window.dispatchEvent(
      new CustomEvent("ecom-ops:ikas-trend:update", { detail: payload }),
    );
  } catch {
    /* quota / private-mode — silently ignore, history is non-critical */
  }
}

export function appendIkasTrendSample(sample: IkasTrendSample): void {
  const history = loadHistory();
  history.push(sample);
  saveHistory(history);
}

export function clearIkasTrendHistory(): void {
  saveHistory([]);
}

/**
 * Compute the y-axis range for the sparkline. Pads the bounds so a
 * perfectly-flat series doesn't render as a degenerate line at the
 * bottom of the chart.
 */
function sparkBounds(samples: IkasTrendSample[]): { min: number; max: number } {
  if (samples.length === 0) return { min: 0, max: 1 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const s of samples) {
    if (s.revenue30dUsd < min) min = s.revenue30dUsd;
    if (s.revenue30dUsd > max) max = s.revenue30dUsd;
  }
  if (min === max) {
    // Degenerate range — pad by 5% of the value (or $1 if zero) so the
    // line floats inside the chart instead of collapsing to the axis.
    const pad = max > 0 ? max * 0.05 : 1;
    return { min: Math.max(0, min - pad), max: max + pad };
  }
  const pad = (max - min) * 0.1;
  return { min: Math.max(0, min - pad), max: max + pad };
}

function fmtShortCurrency(amount: number, currency: string | null): string {
  const c = currency ? `${currency} ` : "";
  if (Math.abs(amount) >= 1_000_000) return `${c}${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `${c}${(amount / 1_000).toFixed(1)}k`;
  return `${c}${Math.round(amount).toLocaleString()}`;
}

function fmtSigned(amount: number): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "" : "±";
  return `${sign}${fmtShortCurrency(amount, null)}`;
}

export interface IkasTrendStripProps {
  /** Latest fetchedAt to render — used to mark the freshest sample. */
  latestFetchedAt: string | null;
  /** Latest revenue-30d number — used to decide if the strip should
   * show a "first fetch — not yet contributing" placeholder. */
  latestRevenue: number | null;
  /** Latest currency for the delta caption. */
  latestCurrency: string | null;
}

export function IkasTrendStrip(props: IkasTrendStripProps) {
  const { latestFetchedAt, latestRevenue, latestCurrency } = props;
  const [hydrated, setHydrated] = useState(false);
  const [samples, setSamples] = useState<IkasTrendSample[]>([]);

  useEffect(() => {
    setSamples(loadHistory());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === HISTORY_KEY || e.key === null) setSamples(loadHistory());
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<IkasTrendStorage>).detail;
      if (detail && isValidShape(detail)) setSamples(detail.samples);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:ikas-trend:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:ikas-trend:update", onCustom);
    };
  }, []);

  const delta = useMemo(() => {
    if (samples.length < 2) return null;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const revenueDelta = last.revenue30dUsd - first.revenue30dUsd;
    const orderDelta = last.orderCount30d - first.orderCount30d;
    return { revenueDelta, orderDelta };
  }, [samples]);

  const oldestAgeMin = useMemo(() => {
    if (samples.length === 0) return null;
    const oldest = new Date(samples[0].fetchedAt).getTime();
    if (!Number.isFinite(oldest)) return null;
    return Math.max(0, Math.round((Date.now() - oldest) / 60_000));
  }, [samples]);

  if (!hydrated) {
    // Skeleton placeholder so the layout doesn't pop in late.
    return (
      <div
        data-testid="ikas-trend-strip-placeholder"
        className="rounded border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground"
      >
        Loading live trend…
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div
        data-testid="ikas-trend-strip-empty"
        className="rounded border border-dashed border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground"
      >
        Live trend — first sample will land in the next auto-refresh (~30s).
      </div>
    );
  }

  const bounds = sparkBounds(samples);
  const W = 220;
  const H = 36;
  const PAD_X = 2;
  const PAD_Y = 4;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const denom = Math.max(1, samples.length - 1);
  const points = samples.map((s, i) => {
    const x = PAD_X + (i / denom) * innerW;
    const range = bounds.max - bounds.min || 1;
    const y = PAD_Y + innerH - ((s.revenue30dUsd - bounds.min) / range) * innerH;
    return { x, y, sample: s, i };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  // Trend direction icon — up / flat / down.
  const direction =
    delta === null
      ? "·"
      : delta.revenueDelta > 0
        ? "↑"
        : delta.revenueDelta < 0
          ? "↓"
          : "→";

  return (
    <div
      data-testid="ikas-trend-strip"
      className="rounded border border-border/60 bg-background/60 px-3 py-2"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wide">Live trend</span>
          {delta ? (
            <span
              className={
                delta.revenueDelta > 0
                  ? "font-medium text-emerald-600 dark:text-emerald-400 tabular-nums"
                  : delta.revenueDelta < 0
                    ? "font-medium text-rose-600 dark:text-rose-400 tabular-nums"
                    : "font-medium text-muted-foreground tabular-nums"
              }
            >
              {direction} {fmtSigned(delta.revenueDelta)} rev
              {delta.orderDelta !== 0 ? (
                <span className="ml-1 text-muted-foreground">
                  · {delta.orderDelta > 0 ? "+" : ""}
                  {delta.orderDelta} orders
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums">
          {samples.length}/{HISTORY_MAX} samples
          {oldestAgeMin !== null ? ` · oldest ${oldestAgeMin}m ago` : ""}
          {latestFetchedAt ? ` · now ${new Date(latestFetchedAt).toLocaleTimeString()}` : ""}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`Live revenue trend · ${samples.length} samples · current ${fmtShortCurrency(
          latestRevenue ?? samples[samples.length - 1].revenue30dUsd,
          latestCurrency,
        )}`}
        className="mt-1 block"
      >
        <defs>
          <linearGradient id="ikas-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Filled area under the line */}
        <path
          d={`${pathD} L${(W - PAD_X).toFixed(1)},${(H - PAD_Y).toFixed(1)} L${PAD_X.toFixed(1)},${(H - PAD_Y).toFixed(1)} Z`}
          fill="url(#ikas-trend-fill)"
          className="text-emerald-500 dark:text-emerald-400"
        />
        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-600 dark:text-emerald-400"
        />
        {/* Latest point marker */}
        {points.length > 0 ? (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2"
            fill="currentColor"
            className="text-emerald-600 dark:text-emerald-400"
          />
        ) : null}
      </svg>
    </div>
  );
}