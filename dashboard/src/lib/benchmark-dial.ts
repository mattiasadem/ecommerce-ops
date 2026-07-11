/**
 * `benchmark-dial` — score operator's numbers against the canonical
 * Unit Economics benchmark table from research/00-ecommerce-ops-landscape.md.
 *
 * The benchmark table ships as strings ("$60–$120", "3:1", "55–70%"),
 * so the first job of this module is to parse each cell into a numeric
 * range + direction. Then a second pass classifies the operator's
 * numeric input against the parsed range into a band:
 *
 *   red-flag  → operator is below/above the red-flag threshold
 *   below     → below healthy median
 *   median    → inside the healthy median band
 *   good      → inside the top-quartile band
 *   great     → beats the top-quartile ceiling
 *
 * The scoring lives here as pure functions so it can be unit-tested
 * without React. The client component (`benchmark-dial.tsx`) is a thin
 * shell that mounts the result onto the page.
 *
 * Persisted state lives at `ecom-ops:benchmark-dial:v1` — a tiny object
 * with the operator's chosen vertical (consumer / apparel / home) and
 * repeat-rate assumption. Schema is small on purpose; richer inputs
 * belong in their own tools.
 */

export type Band = "red-flag" | "below" | "median" | "good" | "great";

export type Direction = "higher-is-better" | "lower-is-better";

export interface ParsedRange {
  low: number;        // numeric low end (inclusive)
  high: number;       // numeric high end (inclusive)
  raw: string;        // the original cell, e.g. "$60–$120"
  parsedAt: number;   // for telemetry only
}

/**
 * Parse a benchmark cell like "$60–$120", "3:1", "55–70%", "<$30",
 * ">$150", "4:1–5:1+", "<4 months" into a { low, high } range.
 *
 * Returns `null` when the cell doesn't look like a number we can score
 * (free-text rules of thumb, qualitative cells, etc.) — the dial
 * silently skips those.
 */
export function parseBenchmarkCell(raw: string): ParsedRange | null {
  if (!raw || typeof raw !== "string") return null;

  // Pull every number we can find, in order.
  // "$60–$120"  → ["60", "120"]
  // "3:1"       → ["3"]
  // "55–70%"    → ["55", "70"]
  // "<$30"      → ["30"]
  // ">$150"     → ["150"]
  // "4:1–5:1+"  → ["4", "1", "5", "1"]  ← ratio; the ":1" suffix lets us collapse
  // "25–40%"    → ["25", "40"]
  const tokens = raw.match(/-?\$?\d+(\.\d+)?/g);
  if (!tokens || tokens.length === 0) return null;

  const numbers = tokens
    .map((t) => parseFloat(t.replace(/[^\d.\-]/g, "")))
    .filter((n) => Number.isFinite(n));

  if (numbers.length === 0) return null;

  // Handle ratio strings like "3:1", "4:1–5:1+", "<2:1".
  // Pattern: text contains ":1" → drop the trailing 1s and treat as a flat number.
  const isRatio = /:\s*1(\b|$)/.test(raw);
  if (isRatio) {
    const filtered = numbers.filter((n) => n !== 1);
    if (filtered.length === 0) return null;
    return {
      low: Math.min(...filtered),
      high: Math.max(...filtered),
      raw,
      parsedAt: Date.now(),
    };
  }

  return {
    low: Math.min(...numbers),
    high: Math.max(...numbers),
    raw,
    parsedAt: Date.now(),
  };
}

/**
 * Classify an operator value against a benchmark cell.
 * For "higher-is-better" metrics (LTV:CAC, repeat-rate, AOV, gross margin,
 * contribution margin, MER, ROAS) a high value is good.
 * For "lower-is-better" metrics (CAC, CAC payback, monthly churn,
 * red-flag thresholds) a low value is good.
 *
 * The "red-flag" cell is special: it's the threshold below/above which
 * we should scream. We treat the red-flag cell as a one-sided band:
 *   ">$150"  → red flag if value > low end
 *   "<$30"   → red flag if value < low end
 *   ">12 months" → red flag if value > low end
 *
 * When the red-flag cell is parseable as a one-sided threshold, we
 * short-circuit to "red-flag" before checking the healthy/good bands.
 */
export interface Classification {
  band: Band;
  message: string;
}

export function classify(
  value: number,
  healthy: string,
  good: string,
  redFlag: string,
  direction: Direction,
): Classification {
  if (!Number.isFinite(value)) {
    return { band: "below", message: "Enter a number to score" };
  }

  // 1. Red-flag short-circuit (one-sided threshold).
  const redParsed = parseBenchmarkCell(redFlag);
  if (redParsed) {
    // "<X" → red if value < low end
    // ">X" → red if value > low end
    const isLowerSide = /^<\s*\$?\d/.test(redFlag.trim());
    if (isLowerSide && value < redParsed.low) {
      return {
        band: "red-flag",
        message: `Below red-flag threshold (${redFlag})`,
      };
    }
    const isUpperSide = /^>\s*\$?\d/.test(redFlag.trim());
    if (isUpperSide && value > redParsed.low) {
      return {
        band: "red-flag",
        message: `Above red-flag threshold (${redFlag})`,
      };
    }
  }

  // 2. Score against healthy-median and top-quartile bands.
  const healthyParsed = parseBenchmarkCell(healthy);
  const goodParsed = parseBenchmarkCell(good);

  if (!healthyParsed) {
    return { band: "below", message: "No benchmark available" };
  }

  if (direction === "higher-is-better") {
    // great = above good.high
    if (goodParsed && value >= goodParsed.high) {
      return { band: "great", message: `Beats top-quartile (≥${goodParsed.high})` };
    }
    // good = inside good band (and good > healthy)
    if (goodParsed && value >= goodParsed.low) {
      return {
        band: "good",
        message: `Inside top-quartile (${goodParsed.low}–${goodParsed.high})`,
      };
    }
    // median = inside healthy band
    if (value >= healthyParsed.low && value <= healthyParsed.high) {
      return {
        band: "median",
        message: `Inside healthy median (${healthyParsed.low}–${healthyParsed.high})`,
      };
    }
    // below median
    return {
      band: "below",
      message: `Below healthy median (${healthyParsed.low}–${healthyParsed.high})`,
    };
  }

  // lower-is-better (e.g. CAC)
  // great = below good.low (top-quartile has the LOWEST CAC)
  if (goodParsed && value <= goodParsed.low) {
    return { band: "great", message: `Beats top-quartile (≤${goodParsed.low})` };
  }
  if (goodParsed && value <= goodParsed.high) {
    return {
      band: "good",
      message: `Inside top-quartile (${goodParsed.low}–${goodParsed.high})`,
    };
  }
  if (value >= healthyParsed.low && value <= healthyParsed.high) {
    return {
      band: "median",
      message: `Inside healthy median (${healthyParsed.low}–${healthyParsed.high})`,
    };
  }
  return {
    band: "below",
    message: `Above healthy median (${healthyParsed.low}–${healthyParsed.high})`,
  };
}

/**
 * Map a vertical tag to the AOV row in the benchmark table.
 * The benchmark table has separate rows for "consumables", "apparel/accessories",
 * "home/furniture". The operator picks one in the dial.
 */
export type Vertical = "consumer" | "apparel" | "home";

export interface AovRowSelection {
  rowKey: string;          // matches a Metric row, e.g. "AOV (apparel/accessories)"
  vertical: Vertical;
  label: string;
}

/**
 * Resolve the right AOV row for the operator's chosen vertical.
 */
export function selectAovRow(
  rows: { Metric: string; "Healthy (median)": string; "Good (top-quartile)": string; "Red flag": string }[],
  vertical: Vertical,
): AovRowSelection | null {
  const pattern =
    vertical === "apparel"
      ? /AOV \(apparel\/accessories\)/
      : vertical === "home"
        ? /AOV \(home\/furniture\)/
        : /AOV \(consumables\)/; // default for "consumer"
  const row = rows.find((r) => pattern.test(r.Metric));
  if (!row) return null;
  return {
    rowKey: row.Metric,
    vertical,
    label: row.Metric.replace(/^AOV /, ""),
  };
}

/**
 * Pull a metric row by its Metric label.
 */
export function findRow(
  rows: { Metric: string; "Healthy (median)": string; "Good (top-quartile)": string; "Red flag": string }[],
  metricMatch: RegExp,
) {
  return rows.find((r) => metricMatch.test(r.Metric));
}

// ─────────────────────────────────────────────────────────────────────────
//  Persistent dial state
// ─────────────────────────────────────────────────────────────────────────

export const BENCHMARK_DIAL_STORAGE_KEY = "ecom-ops:benchmark-dial:v1";

export interface BenchmarkDialState {
  vertical: Vertical;
  /** Operator's repeat-rate assumption for the LTV:dial projection (0..1). */
  repeatRate: number;
}

export const BENCHMARK_DIAL_DEFAULTS: BenchmarkDialState = {
  vertical: "consumer",
  repeatRate: 0.30,
};

export function loadBenchmarkDial(): BenchmarkDialState {
  if (typeof window === "undefined") return BENCHMARK_DIAL_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(BENCHMARK_DIAL_STORAGE_KEY);
    if (!raw) return BENCHMARK_DIAL_DEFAULTS;
    const parsed = JSON.parse(raw);
    const vertical: Vertical =
      parsed.vertical === "apparel" || parsed.vertical === "home"
        ? parsed.vertical
        : "consumer";
    const repeatRate = Number(parsed.repeatRate);
    return {
      vertical,
      repeatRate: Number.isFinite(repeatRate)
        ? Math.max(0.05, Math.min(0.80, repeatRate))
        : BENCHMARK_DIAL_DEFAULTS.repeatRate,
    };
  } catch {
    return BENCHMARK_DIAL_DEFAULTS;
  }
}

export function saveBenchmarkDial(state: BenchmarkDialState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BENCHMARK_DIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private-mode */
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Convenience: derive the operator's projected metrics from Your-store
// ─────────────────────────────────────────────────────────────────────────

import type { YourStoreInputs } from "./your-store";

export interface ProjectedMetrics {
  breakEvenCAC: number;     // = AOV × gross margin (first-order GP)
  ltvAt12mo: number;        // = breakEvenCAC × (1 + repeatRate)  [single-tail approx]
  impliedCacPaybackMonths: number; // = aov × grossMargin / monthlyProfitPerCustomer ... ≈ payback from AOV alone
}

export function projectFromYourStore(
  store: YourStoreInputs,
  repeatRate: number,
): ProjectedMetrics {
  const breakEvenCAC = store.aov * store.grossMargin;
  const ltvAt12mo = breakEvenCAC * (1 + repeatRate);
  // Payback months ≈ CAC / monthly profit per customer.
  // Monthly profit per customer ≈ (AOV × grossMargin) / 12  (spread over 12 months).
  const monthlyProfitPerCustomer = breakEvenCAC / 12;
  const impliedCacPaybackMonths =
    monthlyProfitPerCustomer > 0
      ? store.aov * store.grossMargin / monthlyProfitPerCustomer
      : 0;
  return { breakEvenCAC, ltvAt12mo, impliedCacPaybackMonths };
}
