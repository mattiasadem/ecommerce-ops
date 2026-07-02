/**
 * checkout-audit.ts — Pure scoring engine for the interactive CRO checkout audit.
 *
 * Mirrors the canonical `scripts/checkout_audit_score.py` Python scoring rules
 * (Baymard 24-guideline severity-weighted scoring) but runs in the browser so
 * operators get instant feedback. State is persisted to localStorage so the
 * audit survives reloads.
 *
 * Severity weights:
 *   L = 5 points each (large lift; ship these first)
 *   M = 3 points each
 *   S = 1 point each
 *   E = 0 points (verification-only; scored but not weighted)
 *
 * Statuses:
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
 * Cumulative CVR lift:
 *   Sum of expected lift_low..lift_high for non-pass items, capped at 0.80
 *   (per the playbook — beyond +80% is cart/PDP work, not checkout work).
 *
 * Health bands (highest threshold first):
 *   >=90 top_tier  — Baymard "best in class"
 *   >=75 great     — top 35% of DTC stores per Baymard
 *   >=55 good      — median DTC store (ship M-severity fixes next)
 *   >=40 fair      — regressed but salvageable in 1–2 weeks
 *   >0   weak      — most fixes still needed; start with Severity L items
 *   ==0  missing   — no audit data submitted
 */

export type Severity = "L" | "M" | "S" | "E";
export type AuditStatus = "pass" | "partial" | "fail" | "skip";

export interface CheckoutGuideline {
  /** Stable id used for state persistence + fix-list keys. */
  id: string;
  /** Section letter (A-E). */
  section: "A" | "B" | "C" | "D" | "E";
  /** Human-readable title shown in the form. */
  title: string;
  /** Operator-facing "what good looks like" prompt. */
  prompt: string;
  /** Severity weight. */
  severity: Severity;
  /** Expected CVR lift if the fix ships (low / high). */
  liftLow: number;
  liftHigh: number;
}

export interface AuditResult {
  score: number;
  healthBand: string;
  passCount: number;
  partialCount: number;
  failCount: number;
  skipCount: number;
  missingCount: number;
  weightedPoints: number;
  maxPossiblePoints: number;
  /** Low end of cumulative expected CVR lift (capped at 0.80). */
  cvrLiftLow: number;
  /** High end of cumulative expected CVR lift (capped at 0.80). */
  cvrLiftHigh: number;
  /** Prioritized fix-list: severity L first, then M, S, E. */
  prioritizedFixes: CheckoutFix[];
  /** Total guidelines submitted (pass+partial+fail+skip+missing). */
  totalGuidelines: number;
}

export interface CheckoutFix {
  id: string;
  title: string;
  section: "A" | "B" | "C" | "D" | "E";
  severity: Severity;
  /** What the operator marked: pass | partial | fail | missing */
  currentStatus: "pass" | "partial" | "fail" | "missing";
  liftLow: number;
  liftHigh: number;
  notes?: string;
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  L: 5,
  M: 3,
  S: 1,
  E: 0,
};

export const STATUS_POINT: Record<AuditStatus, number> = {
  pass: 1.0,
  partial: 0.5,
  fail: 0.0,
  skip: 0, // sentinel; skip is handled separately (excluded from scoring)
};

export const MAX_CUMULATIVE_LIFT = 0.80;

export const HEALTH_BANDS: Array<{ threshold: number; label: string; tag: string; description: string }> = [
  { threshold: 90, label: "Top-tier", tag: "top_tier", description: "Baymard best-in-class" },
  { threshold: 75, label: "Great", tag: "great", description: "Top 35% of DTC stores per Baymard" },
  { threshold: 55, label: "Good", tag: "good", description: "Median DTC store — ship M-severity fixes next" },
  { threshold: 40, label: "Fair", tag: "fair", description: "Regressed but salvageable in 1–2 weeks" },
  { threshold: 1, label: "Weak", tag: "weak", description: "Most fixes still needed — start with Severity L items" },
  { threshold: 0, label: "Missing", tag: "missing", description: "No audit data submitted" },
];

export const SECTION_TITLES: Record<CheckoutGuideline["section"], string> = {
  A: "Account & friction",
  B: "Layout & form design",
  C: "Payment options",
  D: "Trust & confidence",
  E: "Mobile-specific",
};

/**
 * Baymard's top 24 checkout guidelines mapped to Shopify fixes + expected lift.
 * Source: scripts/checkout_audit_score.py GUIDELINES table (kept in sync).
 * Operators build an audit in the browser; results match the Python CLI 1:1.
 */
export const CHECKOUT_GUIDELINES: CheckoutGuideline[] = [
  // Section A — Account & friction
  { id: "A1_guest_checkout",         section: "A", title: "Guest checkout (no forced account)",         prompt: "Customers can complete checkout without creating an account.",                                          severity: "L", liftLow: 0.05, liftHigh: 0.10 },
  { id: "A2_no_required_phone",      section: "A", title: "Phone number not required",                    prompt: "Phone number is optional (not required to place an order).",                                             severity: "L", liftLow: 0.02, liftHigh: 0.04 },
  { id: "A3_minimum_fields",         section: "A", title: "Minimum fields, no marketing opt-in pre-purchase", prompt: "Only essential fields visible; marketing opt-in is post-purchase or unchecked default-off.",      severity: "M", liftLow: 0.01, liftHigh: 0.03 },
  { id: "A4_inline_validation",      section: "A", title: "Inline field validation (no popup)",            prompt: "Form errors appear inline below the offending field, not in a modal/banner.",                          severity: "M", liftLow: 0.01, liftHigh: 0.03 },
  { id: "A5_no_password_strength",   section: "A", title: "No password-strength meter on checkout",         prompt: "Account-creation path (if any) has no password-strength meter that blocks the order.",                   severity: "S", liftLow: 0.005, liftHigh: 0.01 },

  // Section B — Layout & form design
  { id: "B1_single_page_or_accordion", section: "B", title: "Single-page or accordion checkout",          prompt: "Checkout is single-page OR an accordion where all sections are visible without navigation clicks.",     severity: "L", liftLow: 0.08, liftHigh: 0.15 },
  { id: "B2_persistent_order_summary",  section: "B", title: "Persistent order summary",                  prompt: "Order summary (subtotal, shipping, taxes, total) is visible throughout the checkout flow.",            severity: "M", liftLow: 0.02, liftHigh: 0.05 },
  { id: "B3_address_autocomplete",      section: "B", title: "Address autocomplete",                      prompt: "Shipping address has Google / Shop Pay / Loqate autocomplete on at least the country+ZIP+city fields.", severity: "L", liftLow: 0.03, liftHigh: 0.07 },
  { id: "B4_clear_field_labels",        section: "B", title: "Visible field labels",                      prompt: "Field labels are visible above/beside inputs (not placeholder-only).",                                 severity: "S", liftLow: 0.005, liftHigh: 0.02 },
  { id: "B5_error_messages_inline",     section: "B", title: "Inline error messages",                     prompt: "Validation errors appear inline under the offending field, not in a banner at the top.",               severity: "S", liftLow: 0.005, liftHigh: 0.02 },

  // Section C — Payment options
  { id: "C1_shop_pay_default",          section: "C", title: "Shop Pay default for returning customers", prompt: "Returning Shop Pay customers see Shop Pay as the default express option.",                              severity: "L", liftLow: 0.10, liftHigh: 0.20 },
  { id: "C2_apple_pay_google_pay",      section: "C", title: "Apple Pay + Google Pay enabled",           prompt: "Both Apple Pay and Google Pay are enabled and visible on checkout.",                                     severity: "L", liftLow: 0.10, liftHigh: 0.25 },
  { id: "C3_bnpl_for_high_aov",         section: "C", title: "BNPL for AOV > $150",                      prompt: "BNPL (Klarna / Affirm / Afterpay) is offered when AOV is above $150.",                                  severity: "M", liftLow: 0.05, liftHigh: 0.15 },
  { id: "C4_payment_icons_visible",     section: "C", title: "Payment-method icons on PDP + cart",       prompt: "Accepted payment-method icons (Visa / MC / Amex / Shop Pay / PayPal) are visible on PDP and cart pages.", severity: "M", liftLow: 0.02, liftHigh: 0.05 },
  { id: "C5_no_redirect_for_guest_card", section: "C", title: "Guest credit-card checkout does not redirect", prompt: "Guest credit-card entry stays on-page; no redirect to a third-party processor page.",                severity: "L", liftLow: 0.03, liftHigh: 0.08 },

  // Section D — Trust & confidence
  { id: "D1_trust_badges_checkout",   section: "D", title: "Trust badges near Place Order",             prompt: "Trust badges (SSL, payment, money-back) appear near the Place Order button.",                            severity: "M", liftLow: 0.01, liftHigh: 0.03 },
  { id: "D2_secure_checkout_label",   section: "D", title: "Secure checkout / lock icon",              prompt: "A 'Secure checkout' label or padlock icon is visible near the Place Order button.",                       severity: "S", liftLow: 0.005, liftHigh: 0.01 },
  { id: "D3_returns_policy_link",     section: "D", title: "Returns policy link on checkout",          prompt: "Returns policy is linked from checkout (not buried in footer only).",                                    severity: "S", liftLow: 0.005, liftHigh: 0.01 },
  { id: "D4_real_shipping_costs_upfront", section: "D", title: "Real shipping cost shown on cart",     prompt: "Real shipping cost is shown on the cart page (not 'calculated at checkout' or surprise at payment).",     severity: "L", liftLow: 0.03, liftHigh: 0.07 },

  // Section E — Mobile-specific
  { id: "E1_sticky_place_order",        section: "E", title: "Sticky Place Order button on mobile",   prompt: "Place Order button is sticky/fixed at the bottom of the mobile checkout viewport.",                     severity: "L", liftLow: 0.05, liftHigh: 0.10 },
  { id: "E2_touch_targets_44px",        section: "E", title: "Touch targets ≥ 44×44 px",              prompt: "All clickable checkout elements have ≥44×44 px tap targets.",                                            severity: "M", liftLow: 0.01, liftHigh: 0.03 },
  { id: "E3_no_zoom_required",          section: "E", title: "No zoom required (16px+ input fonts)", prompt: "Mobile form inputs use 16px+ font so iOS does not auto-zoom on focus.",                                  severity: "M", liftLow: 0.01, liftHigh: 0.03 },
  { id: "E4_digital_wallet_above_form", section: "E", title: "Digital wallet buttons above email field on mobile", prompt: "On mobile, Shop Pay / Apple Pay / Google Pay appear ABOVE the email field.",                          severity: "L", liftLow: 0.05, liftHigh: 0.15 },
  { id: "E5_mobile_test_real_device",   section: "E", title: "Test on real iPhone + Android device", prompt: "Verification gate: actually checkout on a real iPhone and a real Android phone before declaring done.",  severity: "E", liftLow: 0.0,  liftHigh: 0.0 },
];

/**
 * Score a checkout audit. Inputs is a map of guideline_id → status (AuditStatus)
 * + optional notes. Items not in the map are treated as `unset` (counted as
 * missing and contribute to the fix-list as Severity > E items).
 */
export function scoreAudit(
  inputs: Record<string, { status: AuditStatus; notes?: string }>
): AuditResult {
  const severityRank: Record<Severity, number> = { L: 0, M: 1, S: 2, E: 3 };

  let passCount = 0;
  let partialCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let missingCount = 0;
  let weightedPoints = 0;
  let maxPossiblePoints = 0;
  let liftLow = 0;
  let liftHigh = 0;
  const fixList: CheckoutFix[] = [];

  for (const g of CHECKOUT_GUIDELINES) {
    const weight = SEVERITY_WEIGHT[g.severity];
    const entry = inputs[g.id];

    if (!entry || entry.status === undefined) {
      // Missing = not yet audited = treat as fail for fix-list purposes.
      missingCount += 1;
      if (g.severity !== "E") {
        fixList.push({
          id: g.id,
          title: g.title,
          section: g.section,
          severity: g.severity,
          currentStatus: "missing",
          liftLow: g.liftLow,
          liftHigh: g.liftHigh,
        });
      }
      continue;
    }

    const status = entry.status;

    if (status === "skip") {
      skipCount += 1;
      continue;
    }

    // Scored item: contributes to max_possible_points (only for L/M/S, not E).
    if (g.severity !== "E") {
      maxPossiblePoints += weight;
    }

    const point = STATUS_POINT[status];
    weightedPoints += weight * point;

    if (status === "pass") {
      passCount += 1;
    } else if (status === "partial") {
      partialCount += 1;
      if (g.severity !== "E") {
        // Half the lift — partial fix.
        liftLow += g.liftLow * 0.5;
        liftHigh += g.liftHigh * 0.5;
        fixList.push({
          id: g.id,
          title: g.title,
          section: g.section,
          severity: g.severity,
          currentStatus: "partial",
          liftLow: g.liftLow,
          liftHigh: g.liftHigh,
          notes: entry.notes,
        });
      }
    } else if (status === "fail") {
      failCount += 1;
      if (g.severity !== "E") {
        liftLow += g.liftLow;
        liftHigh += g.liftHigh;
        fixList.push({
          id: g.id,
          title: g.title,
          section: g.section,
          severity: g.severity,
          currentStatus: "fail",
          liftLow: g.liftLow,
          liftHigh: g.liftHigh,
          notes: entry.notes,
        });
      }
    }
  }

  const scoreVal = maxPossiblePoints <= 0 ? 0 : Math.round((100 * weightedPoints) / maxPossiblePoints);

  let band = HEALTH_BANDS[HEALTH_BANDS.length - 1];
  for (const b of HEALTH_BANDS) {
    if (scoreVal >= b.threshold) {
      band = b;
      break;
    }
  }

  // Cap cumulative lift at 0.80.
  const cappedLow = Math.min(liftLow, MAX_CUMULATIVE_LIFT);
  const cappedHigh = Math.min(liftHigh, MAX_CUMULATIVE_LIFT);

  // Sort fix-list: severity L first, then M, S, E; within severity by id (stable).
  fixList.sort((a, b) => {
    const r = severityRank[a.severity] - severityRank[b.severity];
    return r !== 0 ? r : a.id.localeCompare(b.id);
  });

  return {
    score: scoreVal,
    healthBand: band.label,
    passCount,
    partialCount,
    failCount,
    skipCount,
    missingCount,
    weightedPoints,
    maxPossiblePoints,
    cvrLiftLow: round4(cappedLow),
    cvrLiftHigh: round4(cappedHigh),
    prioritizedFixes: fixList,
    totalGuidelines: CHECKOUT_GUIDELINES.length,
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function healthBandTag(label: string): string {
  const found = HEALTH_BANDS.find((b) => b.label === label);
  return found ? found.tag : "missing";
}

export function healthBandDescription(label: string): string {
  const found = HEALTH_BANDS.find((b) => b.label === label);
  return found ? found.description : "No audit data submitted";
}