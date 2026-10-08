// triple-whale-attribution.ts — TypeScript port of Move #6 attribution-tool
// Path A/B/C/D/E picker (Triple Whale Starter vs Polar Analytics vs Pro tier
// vs non-Shopify branch vs free path).
//
// Mirrors research/06 §Path-A/B/C/D/E decision matrix + playbook
// 06-install-attribution-triplewhale-or-polar §"Which attribution tool
// fits your store" + asset 06 §post-purchase-survey coverage math +
// scripts/triple_whale_attribution_check.py 7-gate contract.

export type Platform = "polar-starter" | "tw-starter" | "tw-pro" | "polar-pro" | "free";

export type PathName = "A" | "B" | "C" | "D" | "E";

export type CartPlatform = "shopify" | "woocommerce" | "bigcommerce" | "headless" | "other";

export type StoreSize = "prerev" | "small" | "mid" | "large" | "enterprise";

export interface TripleWhaleAttributionInputs {
  monthlyRevenue: number;          // US$/mo
  monthlyPaidSpend: number;        // US$/mo
  cartPlatform: CartPlatform;
  monthlyOrders: number;           // orders/mo (for post-purchase survey coverage math)
  hasKlaviyo: boolean;             // engagement layer wired
  hasGoogleAds: boolean;           // Google Ads admin access
  hasMetaAds: boolean;             // Meta Ads admin access
  operatorCapacityHoursPerWeek: number; // 0-40 hr/wk available
  needsMmm: boolean;               // needs MMM / incrementality testing (Moby Pro / Northbeam territory)
  needsPostPurchaseSurvey: boolean; // post-purchase survey is the highest-value signal — must be on
  needsMetaCapI: boolean;          // Conversions API dedup (true for $5k+/mo spend)
}

export interface PathRecommendation {
  path: PathName;
  platform: Platform;
  platformLabel: string;
  plan: string;
  costMonthly: number;             // US$/mo list price
  year1Cost: number;               // costMonthly * 12
  // 6 capabilities (each true/false per the canonical capability table)
  capabilities: {
    mer: boolean;
    cohortLtv: boolean;
    postPurchaseSurvey: boolean;
    klaviyoSync: boolean;
    metaGoogleTiktokSync: boolean;
    mmmIncrementality: boolean;
  };
  // Annualized ROI math
  // Surfaces 2 numbers: expected "blended-attribution-lift" in $/yr (recovered ad
  // spend + misjudged retention flow savings) and "year1 net" = attribution
  // lift - year1 cost.
  attributionLiftLow: number;      // US$/yr, conservative
  attributionLiftHigh: number;     // US$/yr, optimistic
  year1NetLow: number;             // US$/yr, low
  year1NetHigh: number;            // US$/yr, high
  breakevenMonthsLow: number;      // months until lift covers cost
  breakevenMonthsHigh: number;
  // Reason for the pick (operator-facing string, 1-2 lines)
  justification: string;
  // 5-step build sequence
  buildSequence: string[];
  // 7 verification gates the operator must run after install
  verificationGates: string[];
}

export const TRIPLE_WHALE_DEFAULTS: TripleWhaleAttributionInputs = {
  monthlyRevenue: 200_000,
  monthlyPaidSpend: 20_000,
  cartPlatform: "shopify",
  monthlyOrders: 1_500,
  hasKlaviyo: true,
  hasGoogleAds: true,
  hasMetaAds: true,
  operatorCapacityHoursPerWeek: 8,
  needsMmm: false,
  needsPostPurchaseSurvey: true,
  needsMetaCapI: true,
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  "polar-starter": "Polar Analytics Starter",
  "tw-starter": "Triple Whale Starter",
  "tw-pro": "Triple Whale Pro",
  "polar-pro": "Polar Analytics Pro",
  "free": "Shopify Analytics + GA4 (free)",
};

export const PLATFORM_PLAN: Record<Platform, string> = {
  "polar-starter": "Starter",
  "tw-starter": "Starter",
  "tw-pro": "Pro",
  "polar-pro": "Pro",
  "free": "Free",
};

export const PLATFORM_COST: Record<Platform, number> = {
  "polar-starter": 49,
  "tw-starter": 179,
  "tw-pro": 1290,
  "polar-pro": 299,
  "free": 0,
};

export const PATH_LABEL: Record<PathName, string> = {
  A: "Path A — Polar Starter",
  B: "Path B — Triple Whale Starter",
  C: "Path C — Triple Whale Pro",
  D: "Path D — Polar Pro (non-Shopify)",
  E: "Path E — Free (Shopify + GA4)",
};

export const PATH_BADGE: Record<PathName, string> = {
  A: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5",
  B: "border-sky-500/30 text-sky-700 dark:text-sky-300 bg-sky-500/5",
  C: "border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/5",
  D: "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5",
  E: "border-zinc-500/30 text-zinc-700 dark:text-zinc-300 bg-zinc-500/5",
};

export const PATH_LONG: Record<PathName, string> = {
  A: "Polar Analytics Starter · $49/mo · Shopify · <$500k GMV",
  B: "Triple Whale Starter · $179/mo · Shopify · $500k–$5M GMV",
  C: "Triple Whale Pro · $1,290/mo · Shopify · $5M+ GMV",
  D: "Polar Analytics Pro · $299/mo · non-Shopify (WooCommerce / BigCommerce / headless)",
  E: "Shopify Analytics + GA4 · Free · pre-revenue or <$10k/mo",
};

function pickStoreSize(monthlyRevenue: number): StoreSize {
  if (monthlyRevenue < 10_000) return "prerev";
  if (monthlyRevenue < 500_000 / 12) return "small";        // <$500k GMV/yr
  if (monthlyRevenue < 5_000_000 / 12) return "mid";         // $500k–$5M GMV/yr
  if (monthlyRevenue < 50_000_000 / 12) return "large";      // $5M–$50M GMV/yr
  return "enterprise";
}

/**
 * Canonical 5-path decision tree.
 *
 *  Path E (free)  → pre-revenue / <$10k/mo
 *  Path A (Polar Starter)  → Shopify + small (<$500k GMV) + <$5k/mo paid
 *  Path B (TW Starter)     → Shopify + mid ($500k–$5M)  — DEFAULT for $5k+ paid
 *  Path C (TW Pro)         → Shopify + large ($5M+) + needs MMM
 *  Path D (Polar Pro)      → NOT Shopify
 */
export function recommendPath(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  const size = pickStoreSize(inputs.monthlyRevenue);
  const isShopify = inputs.cartPlatform === "shopify";

  // Rule 1: free if pre-revenue
  if (size === "prerev" || inputs.monthlyRevenue < 10_000) {
    return buildE(inputs);
  }

  // Rule 2: non-Shopify → Polar Pro (TW is Shopify-only at the pixel layer)
  if (!isShopify) {
    return buildD(inputs);
  }

  // Rule 3: Shopify + large + needs MMM → TW Pro
  if (size === "large" && inputs.needsMmm) {
    return buildC(inputs);
  }

  // Rule 4: Shopify + small (<$500k GMV) + <$5k/mo paid → Polar Starter
  if (size === "small" && inputs.monthlyPaidSpend < 5_000) {
    return buildA(inputs);
  }

  // Rule 5: Shopify + mid ($500k–$5M) or small + ≥$5k paid → TW Starter (DEFAULT)
  if (size === "mid" || (size === "small" && inputs.monthlyPaidSpend >= 5_000)) {
    return buildB(inputs);
  }

  // Rule 6: Shopify + large but no MMM + <$50k paid → TW Starter
  // (MMM optional; Pro is 7× Starter's price and only earns it at $50k+ paid)
  if ((size === "large" || size === "enterprise") && inputs.monthlyPaidSpend < 50_000) {
    return buildB(inputs);
  }

  // Rule 7: Shopify + large + ≥$50k paid → TW Pro (regardless of MMM flag)
  if (size === "large" || size === "enterprise") {
    return buildC(inputs);
  }

  return buildB(inputs);  // safe default
}

function capOn(platform: Platform): PathRecommendation["capabilities"] {
  switch (platform) {
    case "polar-starter":
      return {
        mer: true,
        cohortLtv: true,
        postPurchaseSurvey: true,
        klaviyoSync: true,
        metaGoogleTiktokSync: true,
        mmmIncrementality: false,
      };
    case "tw-starter":
      return {
        mer: true,
        cohortLtv: true,
        postPurchaseSurvey: true,
        klaviyoSync: true,
        metaGoogleTiktokSync: true,
        mmmIncrementality: false,
      };
    case "tw-pro":
      return {
        mer: true,
        cohortLtv: true,
        postPurchaseSurvey: true,
        klaviyoSync: true,
        metaGoogleTiktokSync: true,
        mmmIncrementality: true,
      };
    case "polar-pro":
      return {
        mer: true,
        cohortLtv: true,
        postPurchaseSurvey: true,
        klaviyoSync: true,
        metaGoogleTiktokSync: true,
        mmmIncrementality: false,
      };
    case "free":
      return {
        mer: false,
        cohortLtv: false,
        postPurchaseSurvey: false,
        klaviyoSync: false,
        metaGoogleTiktokSync: false,
        mmmIncrementality: false,
      };
  }
}

function liftMultiplier(platform: Platform): number {
  // Attribution lift is a function of (a) post-iOS14.5 GA4 undercount (~30-40% of paid)
  // and (b) operator's ability to act on cohort-LTV signal. Numbers are conservative.
  switch (platform) {
    case "polar-starter": return 0.10;
    case "tw-starter":    return 0.15;
    case "tw-pro":        return 0.20;
    case "polar-pro":     return 0.12;
    case "free":          return 0;
  }
}

function buildRecommendation(
  path: PathName,
  platform: Platform,
  inputs: TripleWhaleAttributionInputs,
  justification: string,
  buildSequence: string[],
): PathRecommendation {
  const costMonthly = PLATFORM_COST[platform];
  const year1Cost = costMonthly * 12;
  const liftPct = liftMultiplier(platform);

  // Attribution lift = (paid spend recovered from undercount) + (cohort-LTV
  // signal savings on retention flows). For a free path, lift is 0 (no
  // instrumented attribution → no recovered spend + no cohort LTV signal).
  const paidSpendRecoveredLow = inputs.monthlyPaidSpend * 12 * (liftPct * 0.5);
  const paidSpendRecoveredHigh = inputs.monthlyPaidSpend * 12 * liftPct;
  const retentionFlowSavedLow = platform === "free"
    ? 0
    : inputs.monthlyRevenue * 12 * 0.005;  // 0.5% of GMV from cohort-LTV
  const retentionFlowSavedHigh = platform === "free"
    ? 0
    : inputs.monthlyRevenue * 12 * 0.02;  // 2% of GMV from cohort-LTV

  const attributionLiftLow = Math.round(paidSpendRecoveredLow + retentionFlowSavedLow);
  const attributionLiftHigh = Math.round(paidSpendRecoveredHigh + retentionFlowSavedHigh);

  const year1NetLow = attributionLiftLow - year1Cost;
  const year1NetHigh = attributionLiftHigh - year1Cost;

  const breakevenMonthsLow = year1Cost > 0
    ? Math.max(1, Math.round((year1Cost / Math.max(1, attributionLiftHigh / 12)) * 10) / 10)
    : 0;
  const breakevenMonthsHigh = year1Cost > 0
    ? Math.max(1, Math.round((year1Cost / Math.max(1, attributionLiftLow / 12)) * 10) / 10)
    : 0;

  return {
    path,
    platform,
    platformLabel: PLATFORM_LABEL[platform],
    plan: PLATFORM_PLAN[platform],
    costMonthly,
    year1Cost,
    capabilities: capOn(platform),
    attributionLiftLow,
    attributionLiftHigh,
    year1NetLow,
    year1NetHigh,
    breakevenMonthsLow,
    breakevenMonthsHigh,
    justification,
    buildSequence,
    verificationGates: [
      "Gate A — pixel + CAPI both green (pixel_id length ≥8, capi_token length ≥16)",
      "Gate B — post-purchase survey live with ≥4 answer options, skip_order_value ≤$50",
      "Gate C — Klaviyo cohort sync: at minimum abandoned_cart + welcome_series flows",
      "Gate D — Meta CAPI test events match (use test_event_code from Events Manager)",
      "Gate E — Google Enhanced Conversions sending hashed email",
      "Gate F — flow event names in attribution events (abandoned_cart, welcome_series, post_purchase_upsell, sms_welcome)",
      "Gate G — cohort LTV comparison: welcome_series_on vs off shows ≥10% 30-day LTV lift",
    ],
  };
}

function buildA(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  return buildRecommendation(
    "A",
    "polar-starter",
    inputs,
    "Path A — Polar Analytics Starter for Shopify stores under $500k GMV with less than $5k/mo paid spend. Cheapest entry; $49 vs $179 is meaningful at this scale; no-code setup in 30 minutes; covers 90% of what Triple Whale Starter does for the use cases that matter here (MER, cohort LTV, post-purchase survey, Klaviyo sync). Default for this profile.",
    [
      "Step 1 — Install Polar Analytics from Shopify App Store ($49/mo, 14-day free trial)",
      "Step 2 — Run the post-purchase-survey setup wizard, set min_order_value = $20 to keep response rate ≥20%",
      "Step 3 — Connect Klaviyo via API key, enable cohort LTV sync (abandoned_cart + welcome_series at minimum)",
      "Step 4 — Verify Meta CAPI + Google Enhanced Conversions are receiving attribution events",
      "Step 5 — Run the 7-gate verification contract via `python3 scripts/triple_whale_attribution_check.py`",
    ],
  );
}

function buildB(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  return buildRecommendation(
    "B",
    "tw-starter",
    inputs,
    "Path B — Triple Whale Starter for Shopify stores $500k–$5M GMV (or any Shopify store with $5k+/mo paid spend). Default DTC analytics. Pixel + post-purchase survey + email-match attribution, Moby AI co-pilot, Meta + Google + TikTok sync, Klaviyo + Postscript native integration. $179/mo is recovered the day you kill one underperforming ad set burning $50/day.",
    [
      "Step 1 — Sign up for Triple Whale Starter ($179/mo), connect Shopify via the official app",
      "Step 2 — Install pixel via theme.liquid OR Shopify pixel channel; add Conversions API token (Gate A)",
      "Step 3 — Turn on post-purchase survey (\"How did you hear about us?\") with ≥4 options (Gate B)",
      "Step 4 — Connect Klaviyo + Postscript + Meta + Google + TikTok — verify cohort sync in TW dashboard (Gates C/D/E/F)",
      "Step 5 — Run Moby AI co-pilot on first 30 days of data; compare cohort LTV welcome-on vs off (Gate G)",
    ],
  );
}

function buildC(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  return buildRecommendation(
    "C",
    "tw-pro",
    inputs,
    "Path C — Triple Whale Pro for Shopify stores $5M–$50M GMV (or any Shopify store with $50k+/mo paid spend) that need MMM (media mix modeling) + incrementality testing. Adds custom attribution windows + MMM that Starter doesn't have. Only worth it above $50k/mo paid spend because Pro is 7× Starter's price; below that, Starter covers 90% of decisions.",
    [
      "Step 1 — Upgrade Triple Whale account to Pro ($1,290/mo); existing Starter pixel + integrations carry over",
      "Step 2 — Enable MMM module; backfill with 6 months of historical Meta + Google + TikTok spend",
      "Step 3 — Configure incrementality test framework (geo-holdouts for Meta, ghost-bidding for Google)",
      "Step 4 — Wire Klaviyo + Postscript + Smilee Loyalty + Northbeam cross-checks for MMM calibration",
      "Step 5 — Run the 7-gate verification contract + a fresh 4-week incrementality test before reading MMM outputs",
    ],
  );
}

function buildD(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  return buildRecommendation(
    "D",
    "polar-pro",
    inputs,
    "Path D — Polar Analytics Pro for non-Shopify stores (WooCommerce, BigCommerce, headless, custom carts). Triple Whale is Shopify-only at the pixel layer; Polar supports WooCommerce + BigCommerce + custom carts via server-side pixel + GA4 import. $299/mo is the only option for non-Shopify at this scale; Northbeam is 5× more expensive without proportional lift for stores under $10M GMV.",
    [
      "Step 1 — Sign up for Polar Pro ($299/mo); install via server-side pixel (NOT the Shopify app store route)",
      "Step 2 — Import historical orders from WooCommerce / BigCommerce / custom cart via CSV + GA4 import",
      "Step 3 — Configure post-purchase survey on the order-status page; use webhook-driven injection if no native support",
      "Step 4 — Connect Klaviyo + Meta + Google + TikTok; verify cohort sync via Polar's event stream inspector",
      "Step 5 — Run the 7-gate verification contract; re-run weekly to catch drift in WooCommerce / BigCommerce",
    ],
  );
}

function buildE(inputs: TripleWhaleAttributionInputs): PathRecommendation {
  return buildRecommendation(
    "E",
    "free",
    inputs,
    "Path E — Free (Shopify Analytics + GA4) for pre-revenue stores and stores under $10k/mo revenue. Skip paid attribution until you have an answerable attribution question. Free tools give you 70% of what you need; the remaining 30% isn't worth $49/mo until you've shipped the revenue levers in Moves #1–#5. Revisit Path A / B when monthly revenue crosses $10k/mo or paid spend crosses $1k/mo.",
    [
      "Step 1 — Install GA4 via Shopify Google channel OR theme.liquid; enable Enhanced Ecommerce",
      "Step 2 — Set up the 4 Klaviyo revenue flows (welcome, abandoned cart, post-purchase, sunset) — these are 90% of your attribution needs",
      "Step 3 — Configure Meta Pixel via Shopify Facebook channel + Conversions API (free, not the same as Triple Whale's CAPI)",
      "Step 4 — Read cohort LTV from Klaviyo's analytics → cohort report, segment by source (welcome-on vs off)",
      "Step 5 — Revisit Path A / B when monthly revenue crosses $10k/mo OR paid spend crosses $1k/mo (whichever first)",
    ],
  );
}

export function validateInputs(inputs: TripleWhaleAttributionInputs): string[] {
  const errors: string[] = [];
  if (inputs.monthlyRevenue < 0) errors.push("Monthly revenue must be ≥ 0");
  if (inputs.monthlyPaidSpend < 0) errors.push("Monthly paid spend must be ≥ 0");
  if (inputs.monthlyPaidSpend > inputs.monthlyRevenue * 2 && inputs.monthlyRevenue > 0) {
    errors.push("Paid spend is more than 2× monthly revenue — check the numbers");
  }
  if (inputs.monthlyOrders < 0) errors.push("Monthly orders must be ≥ 0");
  if (inputs.operatorCapacityHoursPerWeek < 0 || inputs.operatorCapacityHoursPerWeek > 40) {
    errors.push("Operator capacity must be 0–40 hr/wk");
  }
  return errors;
}

/**
 * Render a paste-ready markdown handoff byte-identical to the
 * `scripts/triple_whale_attribution_check.py` style.
 */
export function renderAttributionMarkdown(
  inputs: TripleWhaleAttributionInputs,
  rec: PathRecommendation,
): string {
  const lines: string[] = [];
  lines.push(`# Move #6 Attribution Tool Picker — ${PATH_LABEL[rec.path]}`);
  lines.push("");
  lines.push(`**Platform:** ${rec.platformLabel} (${rec.plan}) · **Cost:** $${rec.costMonthly}/mo · $${rec.year1Cost.toLocaleString()}/yr`);
  lines.push("");
  lines.push("## Operator inputs");
  lines.push("");
  lines.push(`- Monthly revenue: $${inputs.monthlyRevenue.toLocaleString()}`);
  lines.push(`- Monthly paid spend: $${inputs.monthlyPaidSpend.toLocaleString()}`);
  lines.push(`- Cart platform: ${inputs.cartPlatform}`);
  lines.push(`- Monthly orders: ${inputs.monthlyOrders.toLocaleString()}`);
  lines.push(`- Klaviyo wired: ${inputs.hasKlaviyo ? "yes" : "no"}`);
  lines.push(`- Meta + Google ads admin: ${inputs.hasMetaAds ? "yes" : "no"} / ${inputs.hasGoogleAds ? "yes" : "no"}`);
  lines.push(`- Operator capacity: ${inputs.operatorCapacityHoursPerWeek} hr/wk`);
  lines.push(`- Needs MMM: ${inputs.needsMmm ? "yes" : "no"}`);
  lines.push("");
  lines.push("## Recommendation");
  lines.push("");
  lines.push(rec.justification);
  lines.push("");
  lines.push("## Capability matrix");
  lines.push("");
  lines.push("| Capability | Available |");
  lines.push("|---|---|");
  lines.push(`| MER (Marketing Efficiency Ratio) | ${rec.capabilities.mer ? "✓" : "—"} |`);
  lines.push(`| Cohort LTV | ${rec.capabilities.cohortLtv ? "✓" : "—"} |`);
  lines.push(`| Post-purchase survey | ${rec.capabilities.postPurchaseSurvey ? "✓" : "—"} |`);
  lines.push(`| Klaviyo sync | ${rec.capabilities.klaviyoSync ? "✓" : "—"} |`);
  lines.push(`| Meta + Google + TikTok sync | ${rec.capabilities.metaGoogleTiktokSync ? "✓" : "—"} |`);
  lines.push(`| MMM + incrementality | ${rec.capabilities.mmmIncrementality ? "✓" : "—"} |`);
  lines.push("");
  lines.push("## Year-1 ROI");
  lines.push("");
  lines.push(`- Attribution lift: $${rec.attributionLiftLow.toLocaleString()} – $${rec.attributionLiftHigh.toLocaleString()}`);
  lines.push(`- Year-1 cost: $${rec.year1Cost.toLocaleString()}`);
  lines.push(`- Year-1 net: $${rec.year1NetLow.toLocaleString()} – $${rec.year1NetHigh.toLocaleString()}`);
  lines.push(`- Breakeven: ${rec.breakevenMonthsLow} – ${rec.breakevenMonthsHigh} months`);
  lines.push("");
  lines.push("## Build sequence");
  lines.push("");
  for (const step of rec.buildSequence) {
    lines.push(`- ${step}`);
  }
  lines.push("");
  lines.push("## Verification gates (post-install)");
  lines.push("");
  for (const gate of rec.verificationGates) {
    lines.push(`- ${gate}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated by Move #6 Attribution Tool Picker · ${new Date().toISOString().slice(0, 10)}*`);
  return lines.join("\n");
}

/** Display helpers for the React component. */
export function fmtUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  if (n <= -1_000_000) return `-$${(Math.abs(n) / 1_000_000).toFixed(2)}M`;
  if (n <= -1_000) return `-$${(Math.abs(n) / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

export function fmtUsdFull(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
