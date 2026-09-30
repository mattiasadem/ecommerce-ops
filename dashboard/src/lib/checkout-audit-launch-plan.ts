/**
 * `checkout-audit-launch-plan.ts` — Pure generator for the 30-day Baymard
 * Checkout Audit implementation plan.
 *
 * Companion to `/cro` (the interactive 24-guideline Baymard checkout
 * audit + CSV/JSON export). The audit tells the operator WHERE their
 * checkout leaks CVR; this plan tells them HOW to ship the fixes in a
 * 30-day calendar-paced cadence grouped into 4 weeks of work.
 *
 * Reads the operator's saved `CheckoutAuditInputs` from localStorage
 * (via the component layer) and produces a paste-ready markdown
 * checklist grouped into 4 weeks:
 *
 *   W1 (Days 1–7)   — Severity L baseline audit + 5 highest-lift
 *                       fixes: guest checkout, Shop Pay / Apple Pay /
 *   Google Pay, address autocomplete, single-page or accordion
 *   layout, sticky place-order button, real shipping cost upfront.
 *   W2 (Days 8–14)  — Severity M fixes: trust badges, BNPL for
 *                       AOV > $150, payment-method icons, inline
 *                       validation, minimum-fields / no-pre-purchase
 *                       marketing opt-in, touch-targets ≥44×44.
 *   W3 (Days 15–21) — Severity S polish: secure-checkout label,
 *                       returns-policy link, field labels visible,
 *                       inline error messages, no password meter.
 *   W4 (Days 22–30) — E5 real-device test, score readout, +CVR-lift
 *                       proxy readout, iteration backlog, Move #4
 *                       (mobile-PDP) cross-link, 30-day program
 *                       readout deck.
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (score + health band +
 * expected cumulative CVR lift % band) so when the plan is shared in a
 * standup, the team sees "what does this look like" without opening the
 * playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import {
  CHECKOUT_GUIDELINES,
  AuditResult,
  CheckoutGuideline,
  scoreAudit,
  healthBandTag,
} from "@/lib/checkout-audit";
import type { CheckoutAuditInputs } from "@/lib/checkout-audit-export";
import { loadYourStore } from "@/lib/your-store";

export interface CheckoutAuditLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface CheckoutAuditLaunchPlanPayload {
  generatedAt: string;
  startDate: string;
  audit: AuditResult;
  days: CheckoutAuditLaunchPlanDay[];
}

const PLAN_DAYS: Omit<CheckoutAuditLaunchPlanDay, "day">[] = [
  // --- Week 1 — Severity L baseline + 5 highest-lift fixes (Days 1–7) ---
  {
    week: 1,
    title: "Lock the baseline audit score + the 5 Severity L targets",
    action:
      "Confirm the Baymard score + Health band from the audit on /cro (defaults: 0/100 missing if not yet audited; the L-severity items below expect the audit to be RUN first). Severity L items are worth 5× the points of S items — if the score is below 40 (fair band), the W1 plan is mandatory; if the score is in the good band, only ship the missing L items. Save the current score + score-after-W1 + score-after-W2 in the audit's per-guideline notes so the iteration cadence has hard targets.",
    deliverable:
      "Baseline 0–100 score screenshot + Severity L fix-list signed off with the team",
  },
  {
    week: 1,
    title: "Ship A1 — Guest checkout (no forced account creation)",
    action:
      "Shopify → Settings → Checkout → Customer accounts → OPTIONAL or 'Accounts are disabled'. (Accounts disabled = highest CVR lift per Baymard; accounts optional = second-best.) If the store is on Shopify Plus, also enable 'Allow checkout without account' under Checkout → Checkout branding. Verify with a real test order: place an order with a brand-new email; the confirmation page should NOT redirect to /account/register. Document the change in the audit notes.",
    deliverable:
      "Guest-checkout verification screenshot + A1 marked Pass in /cro audit",
  },
  {
    week: 1,
    title: "Ship C1 — Shop Pay default for returning customers + C2 — Apple Pay + Google Pay",
    action:
      "Shopify → Settings → Payments → enable Shop Pay (free, instant), Apple Pay (free, instant via Shop Pay), Google Pay (free, instant via Shop Pay). All three are free for Shopify merchants and lift mobile CVR 10–25% per Baymard. Verify on iPhone Safari (Apple Pay button visible in express checkout) + Android Chrome (Google Pay button). For returning customers, Shop Pay should appear ABOVE the email field on mobile so the saved card + shipping flow is one tap.",
    deliverable:
      "Shop Pay + Apple Pay + Google Pay all enabled + visible on mobile checkout",
  },
  {
    week: 1,
    title: "Ship B3 — Address autocomplete on shipping form",
    action:
      "Shopify (Shopify Checkout Extensibility, Plus merchants) — install Shopify's Address Autocomplete app (free, official) OR use Shop Pay's built-in autocomplete. For non-Shopify-Plus, the address-autocomplete app is $0–$29/mo. Verify on a US ZIP + UK postcode + EU postcode that the suggestion dropdown fires within 200ms of input. Document the implementation in the audit notes.",
    deliverable:
      "Address autocomplete live on shipping form + B3 marked Pass in /cro audit",
  },
  {
    week: 1,
    title: "Ship B1 — Single-page or accordion checkout (no multi-step pagination)",
    action:
      "Shopify's default Shop Pay checkout is already single-page. For the legacy /checkout page, switch to one-page layout in the theme: Settings → Checkout → Checkout layout → 'One page' OR rebuild with Shopify's Checkout Extensibility custom checkout. If the store has a custom multi-step checkout, switch to accordion (Settings → Checkout → Form steps = 'OR' form). Verify on mobile that all sections (contact / shipping / payment) are visible without horizontal scroll. Baymard lift: 8–15%.",
    deliverable:
      "Single-page or accordion checkout live on desktop + mobile + B1 marked Pass",
  },
  {
    week: 1,
    title: "Ship E1 — Sticky Place Order button on mobile + E4 — Digital wallet ABOVE email",
    action:
      "Mobile sticky place-order button: Shopify's default theme already provides this. For custom themes, add `position: fixed; bottom: 0; left: 0; right: 0; z-index: 50` to the Place Order button + a safe-area-inset-bottom padding. On mobile, Shop Pay / Apple Pay / Google Pay MUST appear ABOVE the email field — Shopify's default does this when Shop Pay is enabled; custom themes need an explicit UI reorder. Verify on iPhone Safari + Android Chrome.",
    deliverable:
      "Sticky place-order + digital wallets above email field on mobile",
  },
  {
    week: 1,
    title: "Ship D4 — Real shipping cost shown on cart (not 'calculated at checkout')",
    action:
      "Shopify → Settings → Shipping and delivery → enable carrier-calculated rates (USPS / UPS / FedEx) so the cart page shows a real shipping estimate. The default 'calculated at checkout' is the #1 surprise-cost abandonment trigger per Baymard (+3–7% lift available). Verify with a US ZIP + an EU ZIP that the shipping line item shows on /cart, not just on /checkout. If the store uses ShipStation / EasyPost / Shippo, the rate-lookup API must return within 800ms.",
    deliverable:
      "Real shipping cost visible on cart page + D4 marked Pass in /cro audit",
  },

  // --- Week 2 — Severity M fixes (Days 8–14) ---
  {
    week: 2,
    title: "Ship A3 — Minimum fields + no pre-purchase marketing opt-in",
    action:
      "Audit the checkout form: required fields should be email + shipping address + payment method ONLY. Phone number should be optional (mark A2 Pass simultaneously). Marketing opt-in checkbox should default UNCHECKED + appear post-purchase (order confirmation page), not in the checkout form. If a 'Create an account to save your details' checkbox is visible, remove it (Shopify Plus / Checkout Extensibility).",
    deliverable:
      "Checkout form fields audit + A2 + A3 marked Pass in /cro audit",
  },
  {
    week: 2,
    title: "Ship A4 — Inline field validation (no popup / banner errors)",
    action:
      "Shopify's default checkout uses inline validation. For custom themes, set `input` validation rules to fire on blur (not on submit) and show the error message below the field, not in a top-of-page banner. Baymard lift: 1–3%. Document in audit notes.",
    deliverable:
      "Inline validation verified end-to-end on shipping + payment forms",
  },
  {
    week: 2,
    title: "Ship C3 — BNPL (Klarna / Affirm / Afterpay) for AOV > $150",
    action:
      "Shopify → Settings → Payments → enable Klarna (US/EU/UK) AND/OR Affirm (US/CA) AND/OR Afterpay (US/UK/AU). All three are free for Shopify merchants (Klarna/Affirm/Afterpay pay the merchant fee, not the customer). Verify the BNPL option appears in the payment-method selector for orders above the configured threshold (default $150, configurable in Settings). Verify on mobile. Baymard lift: 5–15% for AOV > $150 segments.",
    deliverable:
      "BNPL visible on payment selector + verified mobile + C3 marked Pass",
  },
  {
    week: 2,
    title: "Ship C4 — Payment-method icons visible on PDP + cart",
    action:
      "Shopify's default theme shows payment icons in the footer. Add an inline row of icons (Visa/MC/Amex/Shop Pay/PayPal/BNPL logos) on the product page near the Add to Cart button AND on the cart page near the Checkout button. Most themes Shopify 3.x+ have a block for it; for custom themes, add an image-row with the payment-method icons from the Shopify admin asset library.",
    deliverable:
      "Payment icons on PDP + cart + C4 marked Pass in /cro audit",
  },
  {
    week: 2,
    title: "Ship D1 — Trust badges near Place Order button",
    action:
      "Add SSL lock icon + 'Secure checkout' text + payment-method trust badges (Norton, McAfee, BBB) within 80px of the Place Order button. For Shopify, the default theme shows the SSL lock; custom themes need an explicit trust-badge block. Baymard lift: 1–3%. Use the official Shopify payment-method trust badges (Settings → Payments → Trust badges).",
    deliverable:
      "Trust badges visible near Place Order + D1 marked Pass",
  },
  {
    week: 2,
    title: "Ship C5 — Guest credit-card checkout does not redirect",
    action:
      "On Shopify, the default credit-card entry stays on-page. Verify that custom payment methods (PayPal, Klarna, Affirm, Afterpay) DON'T redirect to a third-party page — they should use the embedded iframe / modal pattern (Shopify's Shop Pay Installments is already inline; PayPal is the most common redirector — switch to the PayPal Express in-page variant). Baymard lift: 3–8%.",
    deliverable:
      "No credit-card guest redirect + C5 marked Pass in /cro audit",
  },
  {
    week: 2,
    title: "Ship E2 — Touch targets ≥44×44 px on all checkout elements",
    action:
      "Audit every clickable element in the checkout flow: shipping-method radio buttons, payment-method radio buttons, Place Order button, address-edit link, coupon-code input, login link. Each must be at least 44×44 px on mobile. Use Chrome DevTools mobile emulator + a real iPhone for verification. Baymard lift: 1–3%. Document the audit in the per-guideline notes.",
    deliverable:
      "Touch-target audit screenshot + E2 marked Pass + E3 (16px input fonts) checked",
  },

  // --- Week 3 — Severity S polish (Days 15–21) ---
  {
    week: 3,
    title: "Ship A5 — No password-strength meter on checkout",
    action:
      "Shopify's default doesn't show a password meter (since guest checkout is the default). For custom themes with account creation in the checkout, remove the password-strength meter from the checkout page — it belongs on /account/register, not at checkout. Baymard lift: 0.5–1%.",
    deliverable:
      "No password-strength meter on checkout + A5 marked Pass",
  },
  {
    week: 3,
    title: "Ship B4 — Visible field labels (not placeholder-only)",
    action:
      "Audit every input field in the shipping + payment form: each must have a visible label ABOVE or beside the input, not placeholder-only. Placeholder-only labels disappear on focus and break accessibility (WCAG 2.2 SC 2.4.6). For Shopify's default theme, the labels are already visible; for custom themes, add `<label>` tags with `for=` attributes. Baymard lift: 0.5–2%.",
    deliverable:
      "All field labels visible + B4 marked Pass in /cro audit",
  },
  {
    week: 3,
    title: "Ship B5 — Inline error messages (not banners)",
    action:
      "Validation errors must appear inline below the offending field, not in a top-of-page banner. Verify all 5 critical error paths: invalid email format, invalid ZIP, invalid card number, expired card, insufficient funds. Each error must be visible within 100ms of the input event. Baymard lift: 0.5–2%. Document the test cases in the audit notes.",
    deliverable:
      "All 5 error paths verified + B5 marked Pass in /cro audit",
  },
  {
    week: 3,
    title: "Ship D2 — Secure checkout / lock icon near Place Order",
    action:
      "Add a 'Secure checkout' label + lock icon within 80px of the Place Order button. Shopify's default theme shows the SSL lock in the footer; for visible placement near Place Order, add an inline lock icon + label. Baymard lift: 0.5–1%. Use the official Shopify SSL trust badge asset.",
    deliverable:
      "Secure-checkout lock visible near Place Order + D2 marked Pass",
  },
  {
    week: 3,
    title: "Ship D3 — Returns policy link visible on checkout",
    action:
      "Add a 'Returns policy' link in the checkout footer OR in the order-summary sidebar (not buried in the site-wide footer). The link should open the returns policy in a modal/inline accordion, not navigate away from checkout. Baymard lift: 0.5–1%. Document the link placement in the audit notes.",
    deliverable:
      "Returns policy link visible on checkout + D3 marked Pass in /cro audit",
  },
  {
    week: 3,
    title: "Ship E3 — No zoom required (16px+ input fonts on mobile)",
    action:
      "Audit all input fonts in the mobile checkout: each must be at least 16px so iOS Safari does not auto-zoom on focus (the zoom creates layout shift + drops the Place Order button below the fold). For custom themes, set `font-size: 16px` on every `input`, `select`, and `textarea`. Baymard lift: 1–3%. Verify on iPhone Safari + Android Chrome.",
    deliverable:
      "All input fonts ≥16px on mobile + E3 marked Pass in /cro audit",
  },
  {
    week: 3,
    title: "Run the in-store + remote-device cross-browser audit",
    action:
      "Place 3 real orders through the checkout on (1) Chrome desktop, (2) Safari desktop, (3) iPhone Safari, (4) Android Chrome. Use real card data (or test-mode cards if Shopify Payments test mode). Confirm: payment-method icons visible, Shop Pay button visible, address autofill, sticky place-order on mobile, real shipping cost shown. Document any visual regressions in the audit notes + create Linear tickets for the regression fixes.",
    deliverable:
      "4-device audit report + regression tickets filed + checklist signed off",
  },

  // --- Week 4 — Verification, readout, iteration backlog (Days 22–30) ---
  {
    week: 4,
    title: "Ship E5 — Test on real iPhone + Android device (verification gate)",
    action:
      "Place a real-money order on (1) iPhone Safari (newest iOS), (2) Android Chrome (newest Android). Use a real credit card (refund immediately if needed). Confirm every Severity L + payment UI element renders correctly, the Place Order button is sticky, the Shop Pay / Apple Pay / Google Pay buttons are ABOVE the email field on mobile. This is the verification gate for Move #3 (the playbook); document the test results in the audit notes.",
    deliverable:
      "Real-device test report + E5 marked Pass in /cro audit",
  },
  {
    week: 4,
    title: "Re-run the Baymard audit + capture the score-after-W3",
    action:
      "Walk back through all 24 guidelines on /cro and update each status from fail / partial / missing → pass. Capture the new 0–100 score in the audit notes. Expected: ≥75 (great band) if all Severity L items shipped, ≥90 (top-tier band) if all Severity L + M items shipped. Export the CSV + JSON bundle from the audit's Export button and attach to the 30-day readout deck.",
    deliverable:
      "Updated audit score (target: ≥75) + CSV + JSON export attached to readout",
  },
  {
    week: 4,
    title: "Compute the +CVR lift proxy (audit-driven CVR band)",
    action:
      "From the cumulative expected lift range (low..high) in the audit snapshot: if the original audit was 0/100 missing, the post-W3 audit's lift_low..lift_high is the realized CVR lift proxy. Multiply by baseline CVR (default 2.0%) to get the absolute CVR lift. Example: 0.35 CVR guard band × 2.0% baseline = 0.7% absolute CVR lift ≈ +35% relative CVR. Document the proxy math in the audit notes.",
    deliverable:
      "+CVR-lift proxy computed + documented in audit notes",
  },
  {
    week: 4,
    title: "Cross-link Move #4 (mobile-PDP) — the next-largest unrealized lever",
    action:
      "Move #3 (checkout) and Move #4 (mobile-PDP redesign) compound: the 35–80% CVR-lift proxy from this audit is gated on the mobile PDP, since 73% of traffic is mobile. Run /cro/playbooks/30-mobile-pdp-audit (or /playbooks/30-mobile-pdp-audit) for the 24-checkpoint mobile-PDP audit. Aim to ship both in the same quarter for a compounding +50–100% mobile CVR lift.",
    deliverable:
      "Move #4 mobile-PDP audit started + cross-link ticket filed",
  },
  {
    week: 4,
    title: "Capture the post-W3 audit into the team's 30-day readout deck",
    action:
      "Build a 1-page 30-day readout: original baseline audit score → W1+W2+W3 audit score → expected CVR-lift proxy → list of fixes shipped → list of regressions → next-quarter priorities. Share with the team in the next Monday standup. Save as docs/checkout-audit-30-day-readout-YYYY-MM-DD.pdf and link from /cro.",
    deliverable:
      "30-day readout deck shared + linked from /cro",
  },
  {
    week: 4,
    title: "Lock the iteration cadence + Q+1 priorities",
    action:
      "Decide the Q+1 cadence: re-run the Baymard audit monthly (or quarterly if the score is ≥85 stable). Lock the next 90-day priority: Move #4 mobile-PDP audit + the next-priority Severity S polish item. Schedule the next audit run + the next readout deck. Document in the team's quarterly planning doc.",
    deliverable:
      "Q+1 cadence + 90-day priorities signed off + audit cadence locked",
  },
  {
    week: 4,
    title: "Run the +CVR sanity check + regression audit",
    action:
      "Compare the W0 baseline CVR (e.g. 2.0% from /cro hero metric) to the W3 realized CVR (e.g. 2.7% if +35% relative). If the realized lift is below the low-end of the audit's lift band, re-audit the Severity L items for regressions. If the realized lift is above the high-end, the audit-driven CVR lift is a conservative estimate (good for the next pitch deck). Document the realized vs forecast in the audit notes + the 30-day readout.",
    deliverable:
      "+CVR sanity check + regression audit complete + iteration cycle closed",
  },
  {
    week: 4,
    title: "30-day checkout-audit program readout deck",
    action:
      "Final readout: original 0–100 audit score → W3 final score → cumulative CVR-lift proxy → realized CVR delta → fixes shipped (count by severity) → regressions filed → Move #4 cross-link started → Q+1 priorities. Share with the team + the broader ops org. Schedule the next 30-day audit cycle for the next quarter. Mark all 30 plan days complete in Linear / Notion / Google Cal.",
    deliverable:
      "30-day program readout deck shared + all 30 plan days marked complete",
  },
];

/**
 * Build a checkout-audit 30-day launch plan from the operator's saved
 * audit inputs. Falls back to a fresh / empty audit if no saved state.
 */
export function buildCheckoutAuditLaunchPlan(opts?: {
  inputs?: CheckoutAuditInputs;
  startDate?: string;
}): CheckoutAuditLaunchPlanPayload {
  const audit = scoreAudit(opts?.inputs ?? {});
  const yourStore = loadYourStore();
  void yourStore; // Reserved for the cross-page future-tick extension
  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  const days: CheckoutAuditLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    audit,
    days,
  };
}

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function checkoutAuditPlanDayDate(
  startIso: string,
  day: number
): string {
  return isoDateAt(new Date(startIso + "T00:00:00Z"), day - 1);
}

/**
 * Render the plan as a paste-ready markdown checklist. Each day has a
 * `- [ ] ` checkbox so when the operator pastes into Linear / Notion /
 * GitHub Issues / Google Tasks, ticks remain functional.
 */
export function checkoutAuditPlanToMarkdown(
  plan: CheckoutAuditLaunchPlanPayload
): string {
  const score = plan.audit.score;
  const band = plan.audit.healthBand;
  const tag = healthBandTag(band);
  const liftLowPct = (plan.audit.cvrLiftLow * 100).toFixed(1);
  const liftHighPct = (plan.audit.cvrLiftHigh * 100).toFixed(1);

  const lines: string[] = [
    `# Checkout Audit 30-day Launch Plan — ${plan.startDate}`,
    "",
    "> Move #3 — Baymard 24-guideline Checkout Audit implementation. 30-day calendar-paced rollout grouped into 4 weeks: Severity L baseline + 5 highest-lift fixes (W1), Severity M fixes (W2), Severity S polish (W3), E5 real-device test + 30-day readout deck (W4). Same scoring math as `scripts/checkout_audit_score.py` + `dashboard/src/lib/checkout-audit.ts`.",
    "",
    `## Snapshot`,
    "",
    `- **Current Baymard score:** ${score}/100 (${band} · \`${tag}\`)`,
    `- **Expected cumulative CVR lift band:** ${liftLowPct}% – ${liftHighPct}%`,
    `- **Pass / Partial / Fail / Skip / Missing:** ${plan.audit.passCount} / ${plan.audit.partialCount} / ${plan.audit.failCount} / ${plan.audit.skipCount} / ${plan.audit.missingCount}`,
    `- **Prioritized fix-list size:** ${plan.audit.prioritizedFixes.length} items`,
    `- **Plan scope:** 30 days · 4 weeks · ${PLAN_DAYS.length} checkbox-able actions`,
    "",
    `## 30-day checklist`,
    "",
  ];

  for (const d of plan.days) {
    const dayDate = checkoutAuditPlanDayDate(plan.startDate, d.day);
    lines.push(
      `### Day ${d.day} — ${dayDate} — ${d.title}`,
      "",
      `- [ ] **Action:** ${d.action}`,
      "",
      `- [ ] **Deliverable:** ${d.deliverable}`,
      ""
    );
  }

  lines.push(
    "_Generated by Ecommerce Ops dashboard · /checkout-audit-launch-plan · Move #3 Baymard Checkout Audit 30-day always-on implementation._"
  );

  return lines.join("\n");
}

// Re-export the AuditResult / CheckoutGuideline types so downstream
// consumers can import them from this module if needed.
export type { AuditResult, CheckoutGuideline };