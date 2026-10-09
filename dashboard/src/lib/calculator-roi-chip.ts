/**
 * `calculator-roi-chip.ts` — Move #N.25 calculator ROI chip (per-playbook).
 *
 * Closes the canonical "calculator ROI rank lives on /" gap at the
 * individual `/playbooks/[slug]` page level. The operator opens a
 * playbook detail page (say `01-abandoned-cart-flow-klaviyo`); before
 * they reach the embedded calculator, a compact chip surfaces:
 *
 *   - `+$XXX/yr` projected annual lift (high band) on their numbers
 *   - `low $XXk/yr` (defensive low band)
 *   - `⏱ Xmo` payback-period chip (Move #N.23.4 enrichment)
 *   - cohort marker: "On the table" (emerald) / "Shipped" (sky) /
 *     "Not a move" (muted)
 *   - rank-within-calculator-backed-Top-10 (e.g. "#3 of 7")
 *   - days-to-ship badge
 *
 * Hydration-safe: SSR uses `YourStoreInputs | null` → renders a stub
 * or a defaults-on-amber variant. Once mounted, the client reads
 * `ecom-ops:your-store:v1` + `ecom-ops:shipped-playbooks:v1` and
 * re-computes live. Cross-tab `storage` event keeps two open tabs in
 * sync. The component layer in `calculator-roi-chip.tsx` is responsible
 * for storage listeners and the hydration-safe stub.
 *
 * Pure-logic. No DOM, no localStorage side effects.
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import type { CalculatorRoiRankRow } from "./calculator-roi-rank";
import { buildCalculatorRoiRank } from "./calculator-roi-rank";
import type { CalculatorRoiPayback } from "./calculator-roi-payback";
import { buildPaybackEnrichment } from "./calculator-roi-payback";

/**
 * One row summary for a single playbook: the `CalculatorRoiRankRow`
 * for the slug (or null when the slug is not in the calculator-backed
 * rank) + the payback enrichment + the shipped marker.
 */
export interface CalculatorRoiChipRow {
  /** The calculator-backed rank row for the slug, or null if this slug is not in the Top-10. */
  row: CalculatorRoiRankRow | null;
  /** Payback enrichment (months until projected lift covers costHigh). */
  payback: CalculatorRoiPayback | null;
  /** Whether the operator has shipped this playbook (`ecom-ops:shipped-playbooks:v1`). */
  shipped: boolean;
  /** Whether the operator's `YourStoreInputs` are on defaults (amber tone) vs on numbers (emerald). */
  usingDefaults: boolean;
  /** Whether this slug appears in `MOVE_RECOMMENDATIONS` AND `CALCULATOR_REGISTRY` (i.e. shows in the rank). */
  inTop10WithCalculator: boolean;
}

/**
 * Build the per-playbook chip summary.
 *
 * @param slug     The playbook slug from the URL (e.g. `"01-abandoned-cart-flow-klaviyo"`).
 * @param store    The operator's `YourStoreInputs` (or null → defaults).
 * @param shipped  The operator's `ShippedMap` (or empty → no shipped yet).
 */
export function buildCalculatorRoiChip(
  slug: string,
  store: YourStoreInputs | null,
  shipped: Record<string, boolean> | null,
): CalculatorRoiChipRow {
  const usingDefaults = store === null;
  const summary = buildCalculatorRoiRank(store ?? YOUR_STORE_DEFAULTS);
  const row = summary.rows.find((r) => r.slug === slug) ?? null;
  const inTop10WithCalculator = row !== null;

  return {
    row,
    payback: row ? buildPaybackEnrichment(row) : null,
    shipped: !!(shipped ?? {})[slug],
    usingDefaults,
    inTop10WithCalculator,
  };
}

/**
 * One-line headline for the chip. Three branches:
 *
 *   - slug not in calculator-backed Top-10 → null (component renders null)
 *   - on numbers, shipped → "Shipped — captured $X/yr"
 *   - on numbers, unshipped → "Projects $X/yr on your numbers"
 *   - on defaults → "Projects $X/yr at default $X revenue"
 *   - 0 lift (defensive) → "Set your AOV / orders on / to project"
 */
export function calculatorRoiChipHeadline(
  row: CalculatorRoiChipRow,
): string | null {
  if (!row.inTop10WithCalculator || !row.row) return null;
  const annualLiftHigh = row.row.annualLiftHigh;
  if (!Number.isFinite(annualLiftHigh) || annualLiftHigh <= 0) {
    return `Set your AOV / orders on / to project`;
  }
  const fmt = formatChipUsd(annualLiftHigh);
  if (row.shipped) {
    return `Shipped — captured $${fmt}/yr`;
  }
  if (row.usingDefaults) {
    const mo = row.row.monthlyLiftHigh;
    return `Projects $${fmt}/yr at default ${formatChipUsd(mo * 12)}/yr — set Your-store to personalize`;
  }
  return `Projects $${fmt}/yr on your numbers`;
}

/**
 * Tone class for the chip border (mirrors the canonical rank card).
 *
 *   - not in Top-10 → muted (no-op, component renders null)
 *   - on numbers, shipped → sky
 *   - on numbers, unshipped → emerald
 *   - on defaults → amber
 *   - 0 lift → muted
 */
export function calculatorRoiChipToneClass(
  row: CalculatorRoiChipRow,
): string {
  if (!row.inTop10WithCalculator || !row.row) {
    return "border-border bg-muted text-muted-foreground";
  }
  if (!Number.isFinite(row.row.annualLiftHigh) || row.row.annualLiftHigh <= 0) {
    return "border-border bg-muted text-muted-foreground";
  }
  if (row.shipped) {
    return "border-sky-500/40 bg-sky-500/5";
  }
  if (row.usingDefaults) {
    return "border-amber-500/40 bg-amber-500/5";
  }
  return "border-emerald-500/40 bg-emerald-500/5";
}

/**
 * Rank-within-calculator-backed-Top-10 label, e.g. "#3 of 7". Returns
 * null when the slug is not in the rank.
 */
export function calculatorRoiChipRankLabel(
  row: CalculatorRoiChipRow,
  totalMatching: number,
): string | null {
  if (!row.inTop10WithCalculator || !row.row) return null;
  return `#${row.row.rank} of ${totalMatching}`;
}

/**
 * USD formatter for the chip. Mirrors `formatRoiRankUsd` but tuned for
 * the smaller chip format (1-decimal k when < 10k, integer k when
 * >= 10k, integer M when >= 1M). Defensive: NaN / negative / non-finite
 * → "—" so the chip stays valid even when the operator clears inputs.
 */
export function formatChipUsd(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n === 0) return "$0";
  if (n < 1_000) return `$${Math.round(n)}`;
  if (n < 10_000) {
    const k = n / 1_000;
    return `$${k.toFixed(1)}k`;
  }
  if (n < 1_000_000) {
    const k = n / 1_000;
    return `$${Math.round(k)}k`;
  }
  const m = n / 1_000_000;
  return `$${m.toFixed(1)}M`;
}

/**
 * Canonical pin: the chip MUST always render (or return null cleanly)
 * for every canonical calculator-backed slug. Future ticks that shrink
 * the calculator join below `minMatches` must update this pin AND the
 * matching test.
 */
export const CANONICAL_CALCULATOR_ROI_CHIP = {
  expectedSlugs: [
    "01-abandoned-cart-flow-klaviyo",
    "02-post-purchase-upsell-reconvert",
    "03-checkout-audit-baymard",
    "04-welcome-series-klaviyo",
    "06-sms-welcome-and-cart-abandon",
    "07-loyalty-program-smile",
    "10-ai-ad-creative-iteration",
  ] as const,
  /** Future ticks can't quietly drop the join below this. */
  minMatches: 7,
  /** Hydration stub label — when `hydrated=false`. */
  stubLabel: "Loading your numbers…",
  /** 0-lift defensive label. */
  zeroLiftLabel: "Set your AOV / orders on / to project",
} as const;
