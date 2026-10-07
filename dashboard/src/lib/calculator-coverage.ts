/**
 * `calculator-coverage.ts` — Move #N.17 cross-page-intelligence library.
 *
 * Surfaces the canonical "is every playbook backed by a working calculator?"
 * rollup: joins the playbook catalog against the per-page `CALCULATORS` map, tags
 * each row by calculator-type (ROI projection / Path A/B/C · synthesis /
 * Audit scorer / Numerator-style / none), and renders headline + per-row
 * rollup + a type-mix strip.
 *
 * Closes the canonical Move #N.17 gap: the dashboard has 30 playbooks + 22
 * per-page calculators, but the operator has no bird's-eye view of which
 * playbooks ship their own ROI tool vs which fall through to the playbook
 * markdown + external script. The shipped tracker answers "what I shipped";
 * the freshness-drift card answers "what shipped-but-stale"; this card
 * answers "what is backed by a working in-browser tool" — the third leg
 * of the shipped × fresh × tooled triple.
 *
 * Pure-logic: no React, no DOM, no localStorage. Hydration-safe callers
 * can compute on the server and pass the result into a client component
 * for re-computation on changes to the underlying `ecom-ops:your-store:v1`
 * + `ecom-ops:playbooks:*:v1` keys.
 */

import type { Playbook } from "@/lib/content";

/**
 * Canonical calculator registry — mirrors the `CALCULATORS` map in
 * `dashboard/app/playbooks/[slug]/page.tsx` exactly. Bumped manually
 * when a new calculator is wired (next bump: when Move #N.18 ships the
 * missing-type ROI projection for one of the 8 un-covered playbooks).
 *
 * Each entry has:
 *   - slug          → playbook file basename without .md
 *   - calculatorKey → React component name from CALCULATORS
 *   - type          → one of the 5 canonical calculator types below
 */
export interface CalculatorTypeMeta {
  slug: string;
  calculatorKey: string;
  type: CalculatorType;
}

/**
 * Canonical calculator taxonomy.
 *  - roi-projection → forecasts $lift (recovered revenue / incremental margin / etc.)
 *  - path-abc       → Path A / B / C / C+ scorer (synthesizes inputs into a recommendation)
 *  - audit-scorer   → yields 0–100 score + prioritized fix list (Baymard / attribution quality / mobile PDP)
 *  - size-test      → power-calculator (sample size / runtime / minimum detectable effect)
 *  - savings        → cost-stack comparator (e.g. migration savings)
 */
export type CalculatorType =
  | "roi-projection"
  | "path-abc"
  | "audit-scorer"
  | "size-test"
  | "savings";

export const CALCULATOR_TYPE_LABEL: Record<CalculatorType, string> = {
  "roi-projection": "ROI projection",
  "path-abc": "Path A/B/C",
  "audit-scorer": "Audit scorer",
  "size-test": "Sample-size",
  "savings": "Savings",
};

export const CALCULATOR_TYPE_TONE: Record<CalculatorType, string> = {
  "roi-projection":
    "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5",
  "path-abc":
    "border-sky-500/30 text-sky-700 dark:text-sky-300 bg-sky-500/5",
  "audit-scorer":
    "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5",
  "size-test":
    "border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/5",
  "savings":
    "border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/5",
};

export const CALCULATOR_TYPE_GLYPH: Record<CalculatorType, string> = {
  "roi-projection": "$",
  "path-abc": "ABC",
  "audit-scorer": "✓",
  "size-test": "n",
  "savings": "Δ",
};

/**
 * Canonical 24-entry calculator registry.
 *
 * Source of truth for the per-page calculator map in
 * `dashboard/app/playbooks/[slug]/page.tsx`. Order is preserved by slug
 * (lexical sort) so the registry is deterministic across ticks.
 */
export const CALCULATOR_REGISTRY: CalculatorTypeMeta[] = [
  { slug: "01-abandoned-cart-flow-klaviyo", calculatorKey: "AbandonedCartROICalculator", type: "roi-projection" },
  { slug: "02-post-purchase-upsell-reconvert", calculatorKey: "PostPurchaseUpsellROICalculator", type: "roi-projection" },
  { slug: "03-checkout-audit-baymard", calculatorKey: "CheckoutAudit", type: "audit-scorer" },
  { slug: "04-welcome-series-klaviyo", calculatorKey: "WelcomeSeriesROICalculator", type: "roi-projection" },
  { slug: "05-migrate-to-klaviyo-postscript", calculatorKey: "MigrationSavingsCalculator", type: "savings" },
  { slug: "06-sms-welcome-and-cart-abandon", calculatorKey: "SmsWelcomeCartROICalculator", type: "roi-projection" },
  { slug: "06.10-attribution-health-alert-webhook-launch", calculatorKey: "AttributionHealthAlertCalculator", type: "path-abc" },
  { slug: "06.5-attribution-quality-audit", calculatorKey: "AttributionQualityAudit", type: "audit-scorer" },
  { slug: "06.5-weekly-rollup-trend-launch", calculatorKey: "AttributionWeeklyTrend", type: "audit-scorer" },
  { slug: "06.6-tiktok-attribution-quality-audit", calculatorKey: "TiktokAttributionAudit", type: "audit-scorer" },
  { slug: "06.7-snap-pinterest-attribution-quality-audit", calculatorKey: "SnapPinterestAttributionAudit", type: "audit-scorer" },
  { slug: "06.8-cross-platform-attribution-drift-unification", calculatorKey: "AttributionDriftRollup", type: "audit-scorer" },
  { slug: "07-loyalty-program-smile", calculatorKey: "LoyaltyROICalculator", type: "roi-projection" },
  { slug: "09-mobile-pdp-redesign", calculatorKey: "MobilePdpAudit", type: "audit-scorer" },
  { slug: "09.5-pdp-ab-testing-program", calculatorKey: "PdpAbTestCalculator", type: "size-test" },
  { slug: "10-ai-ad-creative-iteration", calculatorKey: "AiAdCreativeROICalculator", type: "roi-projection" },
  { slug: "11-international-rollout", calculatorKey: "InternationalPathCalculator", type: "path-abc" },
  { slug: "12-lifecycle-flow-library", calculatorKey: "LifecycleFlowHealthAudit", type: "audit-scorer" },
  { slug: "13-marketplace-launch", calculatorKey: "MarketplacePathCalculator", type: "path-abc" },
  { slug: "14-3pl-migration", calculatorKey: "ThreeplPathCalculator", type: "path-abc" },
  { slug: "15-subscription-program-launch", calculatorKey: "SubscriptionPathCalculator", type: "path-abc" },
  { slug: "16-affiliate-program-launch", calculatorKey: "AffiliatePathCalculator", type: "path-abc" },
  { slug: "17-b2b-wholesale-launch", calculatorKey: "B2BWholesalePathCalculator", type: "path-abc" },
  { slug: "18-tiktok-shop-live-launch", calculatorKey: "TikTokShopPathCalculator", type: "path-abc" },
  { slug: "19-creator-economy-launch", calculatorKey: "CreatorEconomyPathCalculator", type: "path-abc" },
  { slug: "20-pinterest-seo-launch", calculatorKey: "PinterestSeoPathCalculator", type: "path-abc" },
  { slug: "21-amazon-dsp-amazon-attribution-audit-launch", calculatorKey: "AmazonDspPathCalculator", type: "path-abc" },
  { slug: "22-smsbump-postscript-channel-orchestration-launch", calculatorKey: "SmsbumpPostscriptChannelOrchestrationCalculator", type: "path-abc" },
  { slug: "23-generative-ai-engine-launch", calculatorKey: "GenerativeAiEngineCalculator", type: "path-abc" },
];

const CALCULATOR_BY_SLUG: Record<string, CalculatorTypeMeta> = Object.fromEntries(
  CALCULATOR_REGISTRY.map((entry) => [entry.slug, entry]),
);

/**
 * One row in the per-playbook calculator-coverage rollup.
 */
export interface CalculatorCoverageRow {
  /** Playbook file basename without `.md`. */
  slug: string;
  /** Playbook title from the parser. */
  title: string;
  /** Playbook lastTouched (ISO date) — drives the freshness-bucket color. */
  lastTouched?: string;
  /** Calculator kind present on the playbook detail page. `None` when missing. */
  calculator: CalculatorTypeMeta | null;
}

/**
 * The aggregate summary returned by `buildCalculatorCoverage`.
 */
export interface CalculatorCoverageSummary {
  rows: CalculatorCoverageRow[];
  /** Total playbook count from the parser. */
  total: number;
  /** Playbooks that have a calculator wired on their detail page. */
  withCalculator: number;
  /** Playbooks that do NOT have a calculator wired. */
  withoutCalculator: number;
  /** Coverage percentage 0..100 (rounded to 1 decimal). */
  coveragePct: number;
  /** Per-type rollup: `Record<CalculatorType | "none", number>`. */
  typeMix: Record<CalculatorType | "none", number>;
  /** Sorted slugs of playbooks without calculators (for the "open" list). */
  missingSlugs: string[];
}

/**
 * Build the canonical calculator-coverage summary for the operator's
 * current playbook catalog.
 *
 * Behaviour:
 *  - Joins the playbook catalog against the `CALCULATOR_REGISTRY`
 *    by file basename; playbooks missing from the registry get a row
 *    with `calculator = null`.
 *  - Sorts rows by `withCalculator DESC, title ASC` so the operator
 *    sees the tooled playbooks first, then the un-tooled ones.
 *  - `typeMix` is initialized with every canonical calculator type +
 *    `none`, so callers don't have to deal with undefined keys.
 *  - Skips a playbook if it has no `file` (defensive — should not
 *    happen because the parser always sets it).
 */
export function buildCalculatorCoverage(
  playbooks: Playbook[],
): CalculatorCoverageSummary {
  const rows: CalculatorCoverageRow[] = [];
  const typeMix: Record<CalculatorType | "none", number> = {
    "roi-projection": 0,
    "path-abc": 0,
    "audit-scorer": 0,
    "size-test": 0,
    "savings": 0,
    "none": 0,
  };
  let withCalculator = 0;
  const missingSlugs: string[] = [];

  for (const pb of playbooks) {
    if (!pb || !pb.file) continue;
    const slug = pb.file.replace(/\.md$/, "");
    const calc = CALCULATOR_BY_SLUG[slug] ?? null;
    if (calc) {
      typeMix[calc.type] += 1;
      withCalculator += 1;
    } else {
      typeMix.none += 1;
      missingSlugs.push(slug);
    }
    rows.push({
      slug,
      title: pb.title || slug,
      lastTouched: pb.lastTouched,
      calculator: calc,
    });
  }

  // Sort: with-calc first (stable), then alphabetical by title within each bucket.
  rows.sort((a, b) => {
    const aHas = a.calculator ? 0 : 1;
    const bHas = b.calculator ? 0 : 1;
    if (aHas !== bHas) return aHas - bHas;
    return a.title.localeCompare(b.title);
  });

  const total = rows.length;
  const withoutCalculator = total - withCalculator;
  const coveragePct = total === 0 ? 0 : Math.round((withCalculator / total) * 1000) / 10;

  return {
    rows,
    total,
    withCalculator,
    withoutCalculator,
    coveragePct,
    typeMix,
    missingSlugs: missingSlugs.slice().sort(),
  };
}

/**
 * Headline copy for the card title-bar. Mirrors the existing
 * `summaryHeadline` patterns used by `shipped-freshness-drift.ts` etc.
 */
export function coverageHeadline(summary: CalculatorCoverageSummary): string {
  if (summary.total === 0) return "No playbook in the catalog";
  if (summary.withCalculator === summary.total) {
    return `All ${summary.total} playbooks have an in-browser calculator`;
  }
  if (summary.withCalculator === 0) {
    return `${summary.total} playbooks — none have an in-browser calculator yet`;
  }
  return `${summary.total} playbooks · ${summary.withCalculator} have a calculator · ${summary.withoutCalculator} don't`;
}

/**
 * Tone class for the card border + body. Operators want a single
 * glanceable read: emerald when coverage is full or near-full, amber
 * when 50–90% covered, rose when <50%.
 */
export function coverageToneClass(summary: CalculatorCoverageSummary): string {
  if (summary.coveragePct >= 90) {
    return "border-emerald-500/40 bg-emerald-500/5";
  }
  if (summary.coveragePct >= 50) {
    return "border-amber-500/40 bg-amber-500/5";
  }
  return "border-rose-500/40 bg-rose-500/5";
}

/**
 * Stable registry-format sentinel — the canonical shape must remain
 * stable across ticks so the test suite (`calculator-coverage.test.ts`)
 * can assert on the exact count + type-mix numbers without manual
 * bookkeeping. When a new calculator ships, the test should be amended
 * AND this constant should be re-derived.
 */
export const CANONICAL_CALCULATOR_COVERAGE = {
  total: 30,
  withCalculator: CALCULATOR_REGISTRY.length,
  typeMix: {
    "roi-projection": 6,
    "path-abc": 13,
    "audit-scorer": 8,
    "size-test": 1,
    "savings": 1,
    "none": 1,
  },
} as const;