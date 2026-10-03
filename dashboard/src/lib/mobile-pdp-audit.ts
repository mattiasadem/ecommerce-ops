/**
 * mobile-pdp-audit.ts — Pure scoring engine for the interactive Mobile-PDP
 * Quick-Win Audit calculator on `/playbooks/09-mobile-pdp-redesign`.
 *
 * Mirrors the canonical 7-step mobile-PDP redesign playbook
 * (`playbooks/09-mobile-pdp-redesign.md`) but runs entirely in the browser
 * so operators can self-assess their current mobile PDP without leaving the
 * dashboard. State persists to localStorage so the audit survives reloads.
 *
 * Severity weights (matches `checkout-audit.ts`):
 *   L = 5 points each (large lift — ship these first)
 *   M = 3 points each
 *   S = 1 point each
 *
 * Statuses (same as checkout-audit):
 *   pass    = 1.0 point
 *   partial = 0.5 point (counted as half-fix; half the expected lift)
 *   fail    = 0.0 point (full expected lift)
 *   skip    = excluded from scoring
 *   unset   = treated as fail (not yet audited; counts toward fix-list)
 *
 * Score formula:
 *   score = round(100 * sum(severity_weight * status_point) / sum(severity_weight))
 *   Range 0..100. 0 if no items audited.
 *
 * Projected mobile CVR lift:
 *   - Per-fix expected lift is anchored to the canonical playbook
 *     band (low / high) — Steps 2/3/4 (image, above-fold, sticky ATC)
 *     carry the biggest bands (0.3–0.7 pts absolute mobile CVR lift),
 *     the rest carry smaller bands (0.05–0.20 pts each).
 *   - Sum the per-fix lifts for non-pass items, capped at +1.5 pts absolute
 *     (per the playbook's honest-read: "well-executed redesign lifts mobile
 *     CVR 30–60% relative; beyond +1.5 pts is mobile-first checkout, not PDP").
 *   - Personalized against the operator's actual mobile-session volume +
 *     AOV + margin → emits monthly incremental $ + net annual ROI.
 *
 * Health bands (highest threshold first):
 *   >=80 ship_now   — Baymard-best-in-class; ship PDP A/B testing program next
 *   >=60 great      — Top 25% of mobile PDPs; one or two L fixes away from shipping
 *   >=45 good       — Median mobile PDP; ship M-severity fixes next
 *   >=30 fair       — Regressed but salvageable in 1-2 weeks
 *   >0   weak       — Most fixes still needed; start with Severity L items
 *   ==0  missing    — No audit data submitted
 */

export type Severity = "L" | "M" | "S";
export type AuditStatus = "pass" | "partial" | "fail" | "skip";

export interface MobilePdpGuideline {
  /** Stable id used for state persistence + fix-list keys. */
  id: string;
  /** Which of the 7 PDP-redesign steps this guideline belongs to. */
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Step label shown in the form. */
  stepLabel: string;
  /** Human-readable title shown in the form. */
  title: string;
  /** Operator-facing "what good looks like" prompt. */
  prompt: string;
  /** Severity weight. */
  severity: Severity;
  /** Expected ABSOLUTE mobile CVR lift in percentage points if the fix ships (low / high). */
  liftLowPct: number;
  liftHighPct: number;
}

export interface MobilePdpAuditInputs {
  /** Operator's current mobile CVR (0..1, e.g. 0.018 = 1.8%). */
  currentMobileCvr: number;
  /** Monthly mobile sessions on PDPs. */
  monthlyMobileSessions: number;
  /** Average order value in dollars. */
  aov: number;
  /** Gross margin (0..1, e.g. 0.70 = 70%). */
  grossMargin: number;
}

export interface MobilePdpFix {
  id: string;
  title: string;
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stepLabel: string;
  severity: Severity;
  /** What the operator marked: pass | partial | fail | missing */
  currentStatus: "pass" | "partial" | "fail" | "missing";
  liftLowPct: number;
  liftHighPct: number;
  notes?: string;
}

export interface MobilePdpAuditResult {
  score: number;
  healthBand: string;
  healthBandShort: "ship_now" | "great" | "good" | "fair" | "weak" | "missing";
  passCount: number;
  partialCount: number;
  failCount: number;
  skipCount: number;
  missingCount: number;
  weightedPoints: number;
  maxPossiblePoints: number;
  /** Low end of cumulative ABSOLUTE mobile CVR lift (in percentage points). */
  cvrLiftLowPct: number;
  /** High end of cumulative ABSOLUTE mobile CVR lift (in percentage points). */
  cvrLiftHighPct: number;
  /** Prioritized fix-list: severity L first, then M, S. */
  prioritizedFixes: MobilePdpFix[];
  /** Total guidelines submitted (pass+partial+fail+skip+missing). */
  totalGuidelines: number;
}

export interface MobilePdpRevenueForecast {
  /** Absolute mobile CVR lift in percentage points (low). */
  cvrLiftLowPct: number;
  /** Absolute mobile CVR lift in percentage points (high). */
  cvrLiftHighPct: number;
  /** New mobile CVR (low). */
  newMobileCvrLow: number;
  /** New mobile CVR (high). */
  newMobileCvrHigh: number;
  /** Relative mobile CVR lift (low). */
  relativeLiftLowPct: number;
  /** Relative mobile CVR lift (high). */
  relativeLiftHighPct: number;
  /** Incremental monthly revenue from the lift (low). */
  incrementalMonthlyRevenueLow: number;
  /** Incremental monthly revenue from the lift (high). */
  incrementalMonthlyRevenueHigh: number;
  /** Incremental monthly margin (low). */
  incrementalMonthlyMarginLow: number;
  /** Incremental monthly margin (high). */
  incrementalMonthlyMarginHigh: number;
  /** Annual incremental revenue (low). */
  annualRevenueLow: number;
  /** Annual incremental revenue (high). */
  annualRevenueHigh: number;
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  L: 5,
  M: 3,
  S: 1,
};

export const STATUS_POINT: Record<AuditStatus, number> = {
  pass: 1.0,
  partial: 0.5,
  fail: 0.0,
  skip: 0, // sentinel; skip is handled separately (excluded from scoring)
};

/**
 * Cap on absolute mobile CVR lift from this audit (in percentage points).
 * Beyond +1.5 pts absolute is mobile-first checkout work, not PDP work
 * (per playbook 09 "Honest read" footnote).
 */
export const MAX_ABSOLUTE_LIFT_PCT = 1.5;

export const HEALTH_BANDS: Array<{
  threshold: number;
  label: string;
  short: MobilePdpAuditResult["healthBandShort"];
  description: string;
}> = [
  { threshold: 80, label: "Ship now", short: "ship_now", description: "Best-in-class mobile PDP — move to Move #9.5 PDP A/B testing next" },
  { threshold: 60, label: "Great", short: "great", description: "Top 25% of mobile PDPs — one or two L fixes away from shipping" },
  { threshold: 45, label: "Good", short: "good", description: "Median mobile PDP — ship M-severity fixes next" },
  { threshold: 30, label: "Fair", short: "fair", description: "Regressed but salvageable in 1-2 weeks" },
  { threshold: 1, label: "Weak", short: "weak", description: "Most fixes still needed — start with Severity L items" },
  { threshold: 0, label: "Missing", short: "missing", description: "No audit data submitted" },
];

export const STEP_LABELS: Record<MobilePdpGuideline["step"], string> = {
  1: "Step 1 — Baseline + theme decision",
  2: "Step 2 — Image optimization pipeline",
  3: "Step 3 — Above-the-fold redesign",
  4: "Step 4 — Sticky ATC bar",
  5: "Step 5 — Below-the-fold redesign",
  6: "Step 6 — Speed optimization (CSS/JS/font)",
  7: "Step 7 — Measurement + verification",
};

/**
 * Canonical 18-guideline mobile-PDP audit. Anchored to the 7-step playbook:
 * each row carries the per-fix expected absolute mobile CVR lift band
 * (percentage points) — derived from the playbook's "Metrics to track"
 * section (mobile CVR +30–60% relative at $1M-$5M default, mobile ATC rate
 * +15-30% relative) and the typical A/B test results cited in Steps 2-6.
 */
export const MOBILE_PDP_GUIDELINES: MobilePdpGuideline[] = [
  // --- Step 1: Baseline + theme decision (2 questions) --------------------
  {
    id: "S1_theme_age",
    step: 1,
    stepLabel: STEP_LABELS[1],
    title: "Theme is ≤3 years old (or just switched to Dawn / Sense / Turbo)",
    prompt: "Is your theme less than 3 years old, or did you switch to a fast theme (Dawn / Sense / Turbo) in the last 90 days?",
    severity: "L",
    liftLowPct: 0.15,
    liftHighPct: 0.35,
  },
  {
    id: "S1_pagespeed_baseline",
    step: 1,
    stepLabel: STEP_LABELS[1],
    title: "PageSpeed mobile baseline recorded (last 14d)",
    prompt: "Have you recorded a PageSpeed Insights mobile score for your top 10 PDPs in the last 14 days?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.10,
  },

  // --- Step 2: Image optimization pipeline (2 questions) -----------------
  {
    id: "S2_image_pipeline",
    step: 2,
    stepLabel: STEP_LABELS[2],
    title: "Hero images ≤200 KB, AVIF/WebP, max 2000×2000px",
    prompt: "Are your top-10 PDP hero images all under 200 KB, served as AVIF or WebP, and ≤2000px on the long edge?",
    severity: "L",
    liftLowPct: 0.10,
    liftHighPct: 0.25,
  },
  {
    id: "S2_fetchpriority_high",
    step: 2,
    stepLabel: STEP_LABELS[2],
    title: "fetchpriority=\"high\" on the LCP hero image",
    prompt: "Does the first product image <img> tag have fetchpriority=\"high\" (or the equivalent preload hint)?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.12,
  },

  // --- Step 3: Above-the-fold redesign (4 questions) ---------------------
  {
    id: "S3_atc_visible_no_scroll",
    step: 3,
    stepLabel: STEP_LABELS[3],
    title: "ATC button visible above the fold on iPhone SE (375×667)",
    prompt: "On an iPhone SE viewport (smallest common phone), can you see the ATC button + price + variant selector WITHOUT scrolling?",
    severity: "L",
    liftLowPct: 0.15,
    liftHighPct: 0.35,
  },
  {
    id: "S3_gallery_one_image",
    step: 3,
    stepLabel: STEP_LABELS[3],
    title: "Gallery shows 1 image at a time (swipeable, not carousel)",
    prompt: "Does the gallery show ONE image at a time on mobile with swipe + dots, not a 3-thumbnail carousel?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.12,
  },
  {
    id: "S3_variant_pills",
    step: 3,
    stepLabel: STEP_LABELS[3],
    title: "Variant selector is pills (size) + swatches (color) — NOT dropdowns",
    prompt: "Are size and color variants selected via tap-once pill buttons and color swatches (not native dropdowns)?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.12,
  },
  {
    id: "S3_no_load_popup",
    step: 3,
    stepLabel: STEP_LABELS[3],
    title: "No popup modals on PDP load (no email-capture-at-load)",
    prompt: "Does the PDP NOT show any popup modal on load (email capture, exit-intent, age-gate, etc.)?",
    severity: "L",
    liftLowPct: 0.10,
    liftHighPct: 0.20,
  },

  // --- Step 4: Sticky ATC bar (2 questions) ------------------------------
  {
    id: "S4_sticky_atc_works",
    step: 4,
    stepLabel: STEP_LABELS[4],
    title: "Sticky ATC bar appears on scroll-past-original-ATC",
    prompt: "After scrolling past the original ATC button, does a sticky bottom bar with price + ATC slide up?",
    severity: "L",
    liftLowPct: 0.15,
    liftHighPct: 0.30,
  },
  {
    id: "S4_sticky_scroll_direction",
    step: 4,
    stepLabel: STEP_LABELS[4],
    title: "Sticky ATC hides on scroll-down, shows on scroll-up",
    prompt: "Does the sticky bar intelligently hide when the user scrolls down to read content, and re-appear when they scroll up?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.12,
  },

  // --- Step 5: Below-the-fold redesign (3 questions) ---------------------
  {
    id: "S5_accordion_description",
    step: 5,
    stepLabel: STEP_LABELS[5],
    title: "Description as accordion (default-closed, first paragraph inline)",
    prompt: "Is the product description rendered as collapsible accordions with the first paragraph always visible inline?",
    severity: "S",
    liftLowPct: 0.03,
    liftHighPct: 0.08,
  },
  {
    id: "S5_reviews_inline",
    step: 5,
    stepLabel: STEP_LABELS[5],
    title: "Reviews block inline (rating + first 2 reviews + 'See all' button)",
    prompt: "Is there an inline reviews block on the PDP showing the rating + first 2 reviews + 'See all' button (Yotpo/Loox/Junip)?",
    severity: "M",
    liftLowPct: 0.08,
    liftHighPct: 0.18,
  },
  {
    id: "S5_crosssell_present",
    step: 5,
    stepLabel: STEP_LABELS[5],
    title: "Cross-sell / 'Frequently bought together' block (ReBuy/AfterSell)",
    prompt: "Is there a 'Frequently bought together' or 'You might also like' block with 2-3 items + 1-click add?",
    severity: "S",
    liftLowPct: 0.03,
    liftHighPct: 0.08,
  },

  // --- Step 6: Speed optimization (3 questions) --------------------------
  {
    id: "S6_defer_third_party",
    step: 6,
    stepLabel: STEP_LABELS[6],
    title: "Third-party scripts deferred (Klaviyo / Yotpo / Gorgias / Pixel / GTM)",
    prompt: "Are all third-party scripts (Klaviyo onsite, Yotpo, Gorgias, Meta Pixel, GTM) loaded with `defer` or lazy-mounted via IntersectionObserver?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.15,
  },
  {
    id: "S6_font_display_swap",
    step: 6,
    stepLabel: STEP_LABELS[6],
    title: "font-display: swap on all @font-face (no FOIT)",
    prompt: "Do all your @font-face rules have font-display: swap (or optional for non-critical)?",
    severity: "S",
    liftLowPct: 0.02,
    liftHighPct: 0.06,
  },
  {
    id: "S6_pagespeed_mobile_70",
    step: 6,
    stepLabel: STEP_LABELS[6],
    title: "PageSpeed mobile score ≥70 on top-10 PDPs",
    prompt: "Do your top-10 PDPs all score ≥70 on PageSpeed Insights mobile (synthetic)?",
    severity: "L",
    liftLowPct: 0.10,
    liftHighPct: 0.20,
  },

  // --- Step 7: Measurement (2 questions) ---------------------------------
  {
    id: "S7_triple_whale_installed",
    step: 7,
    stepLabel: STEP_LABELS[7],
    title: "Triple Whale (or Polar) installed with device-level CVR split",
    prompt: "Do you have Triple Whale Starter or Polar Analytics installed and pulling mobile vs desktop CVR?",
    severity: "M",
    liftLowPct: 0.05,
    liftHighPct: 0.10,
  },
  {
    id: "S7_crux_field_data",
    step: 7,
    stepLabel: STEP_LABELS[7],
    title: "Search Console CrUX field data captured (28-day window)",
    prompt: "Have you captured Search Console CrUX field data (LCP / INP / CLS at 75th percentile) for your top PDPs in the last 28 days?",
    severity: "S",
    liftLowPct: 0.02,
    liftHighPct: 0.05,
  },
];

export const MOBILE_PDP_DEFAULTS: MobilePdpAuditInputs = {
  currentMobileCvr: 0.018, // 1.8% (canonical playbook default)
  monthlyMobileSessions: 10000,
  aov: 75,
  grossMargin: 0.7,
};

/** Stored status per guideline. Defaults to "fail" (not yet audited). */
export type MobilePdpStatusMap = Record<string, AuditStatus>;

export const MOBILE_PDP_STORAGE_KEY = "ecom-ops:playbooks:mobile-pdp-audit:v1";
export const MOBILE_PDP_INPUTS_STORAGE_KEY = "ecom-ops:playbooks:mobile-pdp-audit-inputs:v1";

/**
 * Compute the audit score from the operator's status map. Mirrors
 * `score()` in `scripts/checkout_audit_score.py` but adapted for the
 * 18 mobile-PDP guidelines.
 */
export function scoreMobilePdpAudit(status: MobilePdpStatusMap): MobilePdpAuditResult {
  let passCount = 0;
  let partialCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let missingCount = 0;
  let weightedPoints = 0;
  let maxPossiblePoints = 0;
  let liftLow = 0;
  let liftHigh = 0;
  const fixList: MobilePdpFix[] = [];

  const severityRank: Record<Severity, number> = { L: 0, M: 1, S: 2 };

  for (const g of MOBILE_PDP_GUIDELINES) {
    const weight = SEVERITY_WEIGHT[g.severity];
    const raw = status[g.id];
    const entryStatus: AuditStatus = raw ?? "fail"; // unset = fail per playbook rule

    if (entryStatus === "skip") {
      skipCount++;
      continue;
    }

    maxPossiblePoints += weight;
    const point = STATUS_POINT[entryStatus];
    weightedPoints += weight * point;

    if (entryStatus === "pass") {
      passCount++;
    } else if (entryStatus === "partial") {
      partialCount++;
      liftLow += g.liftLowPct * 0.5;
      liftHigh += g.liftHighPct * 0.5;
      fixList.push({
        id: g.id,
        title: g.title,
        step: g.step,
        stepLabel: g.stepLabel,
        severity: g.severity,
        currentStatus: "partial",
        liftLowPct: g.liftLowPct,
        liftHighPct: g.liftHighPct,
      });
    } else if (entryStatus === "fail") {
      failCount++;
      // If the operator explicitly marked fail vs leaving it unset, the lift is the same.
      // We can't tell "explicit fail" from "unset" without a separate flag, so treat both
      // as the full expected lift.
      liftLow += g.liftLowPct;
      liftHigh += g.liftHighPct;
      fixList.push({
        id: g.id,
        title: g.title,
        step: g.step,
        stepLabel: g.stepLabel,
        severity: g.severity,
        currentStatus: "fail",
        liftLowPct: g.liftLowPct,
        liftHighPct: g.liftHighPct,
      });
    }

    // Treat an unset status (raw === undefined) as missing in the missingCount tally
    if (raw === undefined) {
      missingCount++;
      // We already added to fixList above when entryStatus === "fail"; no double-add needed.
    }
  }

  const scoreVal = maxPossiblePoints <= 0 ? 0 : Math.round((100 * weightedPoints) / maxPossiblePoints);

  let band: MobilePdpAuditResult["healthBandShort"] = "missing";
  let bandLabel = "Missing (no audit data submitted)";
  for (const b of HEALTH_BANDS) {
    if (scoreVal >= b.threshold) {
      band = b.short;
      bandLabel = `${b.label} — ${b.description}`;
      break;
    }
  }

  // Cap absolute mobile CVR lift at MAX_ABSOLUTE_LIFT_PCT percentage points
  const cappedLow = Math.min(liftLow, MAX_ABSOLUTE_LIFT_PCT);
  const cappedHigh = Math.min(liftHigh, MAX_ABSOLUTE_LIFT_PCT);

  fixList.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.id.localeCompare(b.id));

  return {
    score: scoreVal,
    healthBand: bandLabel,
    healthBandShort: band,
    passCount,
    partialCount,
    failCount,
    skipCount,
    missingCount,
    weightedPoints,
    maxPossiblePoints,
    cvrLiftLowPct: round4(cappedLow),
    cvrLiftHighPct: round4(cappedHigh),
    prioritizedFixes: fixList,
    totalGuidelines: MOBILE_PDP_GUIDELINES.length,
  };
}

/**
 * Project the personalized revenue lift against the operator's
 * mobile-session volume + AOV + margin.
 *
 * Inputs that are zero/NaN fall back to safe defaults rather than throwing.
 */
export function forecastMobilePdpRevenue(
  inputs: MobilePdpAuditInputs,
  audit: MobilePdpAuditResult,
): MobilePdpRevenueForecast {
  const safeCvr = Number.isFinite(inputs.currentMobileCvr) ? inputs.currentMobileCvr : MOBILE_PDP_DEFAULTS.currentMobileCvr;
  const safeSessions = Number.isFinite(inputs.monthlyMobileSessions) ? inputs.monthlyMobileSessions : MOBILE_PDP_DEFAULTS.monthlyMobileSessions;
  const safeAov = Number.isFinite(inputs.aov) ? inputs.aov : MOBILE_PDP_DEFAULTS.aov;
  const safeMargin = Number.isFinite(inputs.grossMargin) ? inputs.grossMargin : MOBILE_PDP_DEFAULTS.grossMargin;

  // lift is in percentage points (e.g. 0.7 = +0.7 pts absolute)
  const liftLow = audit.cvrLiftLowPct / 100;
  const liftHigh = audit.cvrLiftHighPct / 100;

  const newMobileCvrLow = safeCvr + liftLow;
  const newMobileCvrHigh = safeCvr + liftHigh;
  const relativeLow = safeCvr > 0 ? liftLow / safeCvr : 0;
  const relativeHigh = safeCvr > 0 ? liftHigh / safeCvr : 0;

  const incrementalMonthlyRevenueLow = liftLow * safeSessions * safeAov;
  const incrementalMonthlyRevenueHigh = liftHigh * safeSessions * safeAov;
  const incrementalMonthlyMarginLow = incrementalMonthlyRevenueLow * safeMargin;
  const incrementalMonthlyMarginHigh = incrementalMonthlyRevenueHigh * safeMargin;
  const annualRevenueLow = incrementalMonthlyRevenueLow * 12;
  const annualRevenueHigh = incrementalMonthlyRevenueHigh * 12;

  return {
    cvrLiftLowPct: audit.cvrLiftLowPct,
    cvrLiftHighPct: audit.cvrLiftHighPct,
    newMobileCvrLow,
    newMobileCvrHigh,
    relativeLiftLowPct: relativeLow,
    relativeLiftHighPct: relativeHigh,
    incrementalMonthlyRevenueLow,
    incrementalMonthlyRevenueHigh,
    incrementalMonthlyMarginLow,
    incrementalMonthlyMarginHigh,
    annualRevenueLow,
    annualRevenueHigh,
  };
}

/**
 * Pure markdown renderer for a paste-ready audit report. Same shape as
 * `renderCheckoutAuditMarkdown` for consistency.
 */
export function renderMobilePdpAuditMarkdown(
  audit: MobilePdpAuditResult,
  inputs: MobilePdpAuditInputs,
  forecast: MobilePdpRevenueForecast,
): string {
  const lines: string[] = [];
  lines.push("# Mobile-PDP Quick-Win Audit");
  lines.push("");
  lines.push(`**Score:** ${audit.score} / 100 (${audit.healthBand})`);
  lines.push(`**Total guidelines:** ${audit.totalGuidelines} (${audit.passCount} pass, ${audit.partialCount} partial, ${audit.failCount} fail, ${audit.skipCount} skip, ${audit.missingCount} missing)`);
  lines.push(`**Weighted points:** ${audit.weightedPoints.toFixed(1)} / ${audit.maxPossiblePoints.toFixed(1)}`);
  lines.push("");
  lines.push("## Projected mobile CVR lift");
  lines.push(`- **Absolute:** +${audit.cvrLiftLowPct.toFixed(2)} to +${audit.cvrLiftHighPct.toFixed(2)} pts (capped at +${MAX_ABSOLUTE_LIFT_PCT.toFixed(1)} pts — beyond that is mobile-first checkout work)`);
  lines.push(`- **Relative:** +${(forecast.relativeLiftLowPct * 100).toFixed(1)}% to +${(forecast.relativeLiftHighPct * 100).toFixed(1)}% on the ${(inputs.currentMobileCvr * 100).toFixed(2)}% baseline`);
  lines.push(`- **New mobile CVR:** ${(forecast.newMobileCvrLow * 100).toFixed(2)}% to ${(forecast.newMobileCvrHigh * 100).toFixed(2)}%`);
  lines.push("");
  lines.push("## Operator inputs");
  lines.push(`- Current mobile CVR: ${(inputs.currentMobileCvr * 100).toFixed(2)}%`);
  lines.push(`- Monthly mobile sessions: ${Math.round(inputs.monthlyMobileSessions).toLocaleString()}`);
  lines.push(`- AOV: $${inputs.aov.toFixed(2)}`);
  lines.push(`- Gross margin: ${(inputs.grossMargin * 100).toFixed(0)}%`);
  lines.push("");
  lines.push("## Personalized $ impact");
  lines.push(`- **Incremental monthly revenue:** $${Math.round(forecast.incrementalMonthlyRevenueLow).toLocaleString()} to $${Math.round(forecast.incrementalMonthlyRevenueHigh).toLocaleString()}`);
  lines.push(`- **Incremental monthly margin:** $${Math.round(forecast.incrementalMonthlyMarginLow).toLocaleString()} to $${Math.round(forecast.incrementalMonthlyMarginHigh).toLocaleString()}`);
  lines.push(`- **Annual incremental revenue:** $${Math.round(forecast.annualRevenueLow).toLocaleString()} to $${Math.round(forecast.annualRevenueHigh).toLocaleString()}`);
  lines.push("");
  if (audit.prioritizedFixes.length === 0) {
    lines.push("## Prioritized fix-list");
    lines.push("_(none — all audited items are pass, or all skipped)_");
  } else {
    lines.push(`## Prioritized fix-list (${audit.prioritizedFixes.length} items, Severity L first)`);
    for (const fix of audit.prioritizedFixes) {
      lines.push(
        `- [${fix.severity}] ${fix.id} (${fix.currentStatus}) — ${fix.stepLabel}: ${fix.title} — lift +${fix.liftLowPct.toFixed(2)} to +${fix.liftHighPct.toFixed(2)} pts`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

/** Group fixes by step for the per-step accordion rendering in the UI. */
export function groupFixesByStep(fixes: MobilePdpFix[]): Record<number, MobilePdpFix[]> {
  const out: Record<number, MobilePdpFix[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  for (const f of fixes) {
    out[f.step]?.push(f);
  }
  return out;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
