/**
 * Shared number formatters used by the interactive ROI calculators on the
 * dashboard. Extracted from `abandoned-cart-roi.ts` so multiple ROI modules
 * (`welcome-series-roi.ts` et al.) can reuse them without forming a circular
 * import bridge between sibling forecast modules.
 */

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}×`;
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  })}%`;
}
