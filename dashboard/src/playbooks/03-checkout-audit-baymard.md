# Move #3 — Checkout Audit + Baymard Fix-list

> **Why this ranks #3.** Per `research/02-top-10-leverage-moves.md` and `research/00-ecommerce-ops-landscape.md` (finding #26): 65% of DTC checkouts are "mediocre or worse," Baymard's 35 guidelines document +20–40% conversion lift available, and 73% of traffic is mobile but converts at 1.8% vs 3.9% desktop (Triple Whale 2025). The single biggest available lever for most stores.
>
> **This playbook does NOT redesign your theme.** It is a paste-ready audit checklist that maps each Baymard top finding to a concrete Shopify-theme fix, plus a 0–100 scoring rubric. Operator runs the audit, ships the fixes one at a time, re-scores, and ships the next. Expected site-wide lift: 6–12% from the checkout-alone changes (not counting compounding fixes elsewhere).
>
> **Companion tool:** `scripts/checkout_audit_score.py` takes a self-audit input file (one line per guideline with `pass|partial|fail`) and emits a 0–100 score + the prioritized fix-list. See the `## Verification` section.

---

## Goal

Score your Shopify checkout 0–100 against Baymard's top 24 guidelines and ship the high-priority fixes in 1–2 weeks. Target: score ≥ 75 (top 35% of stores per Baymard) within 30 days.

## Prerequisites

Before you start, you need:

1. **Admin access to a development / staging theme** (DO NOT audit on live — you'll break checkout). Duplicate the live theme, rename it `checkout-audit-staging`, work there.
2. **Shopify admin → Settings → Payments** — write down which payment gateways are enabled (Shop Pay, Apple Pay, Google Pay, PayPal, Klarna/Affirm, Shop Pay Installments). You'll audit each.
3. **Shopify admin → Settings → Checkout** — capture the current account requirement (`required` / `optional` / `disabled`), customer contact method, shipping address requirement, and terms-of-service checkbox state.
4. **Mobile + desktop browsers** (Chrome, Safari) for the live tests in Steps 2 and 6. Use real devices if possible — mobile emulators understate touch-target friction.
5. **Google Analytics 4 (or Shopify Analytics) with Enhanced Ecommerce** — to read checkout-step funnel BEFORE the audit. You need this to measure lift. (See Step 7.)
6. **An "audit input file"** — a plain text file with one line per guideline (24 lines) in the format `id|status|notes`. See `scripts/checkout_audit_score.py --help` for the schema.
7. **(Optional) Baymard's free UX-Ray scanner** at https://baymard.com/preview — gives you a baseline heuristic scan to compare against your manual audit. ($0–$99/mo for the full report.)

## The 24-item audit checklist

Each item has: **ID** (used in the input file) → **Baymard finding** → **Shopify fix** → **Severity (S/M/L)** → **Expected CVR lift**.

### Section A — Account & friction (5 items)

| ID | Finding | Shopify fix | Sev | Lift |
|---|---|---|---|---|
| `A1_guest_checkout` | Always offer guest checkout — no forced account creation | Settings → Checkout → Customer accounts → **Accounts are optional** (or "Accounts are disabled" if you don't need them) | L | +5–10% CVR |
| `A2_no_required_phone` | Phone number should NOT be required; ask for it optionally in shipping step | Theme → `checkout.liquid` / checkout extensibility → remove `required` from `tel` input; if 3PL needs it for delivery, add it as optional | L | +2–4% CVR |
| `A3_minimum_fields` | Show the minimum fields required to complete checkout (no marketing-opt-in toggles pre-purchase) | Settings → Checkout → uncheck "Show marketing opt-in checkbox" or move it below the place-order button | M | +1–3% CVR |
| `A4_inline_validation` | Inline field validation (no popup on submit) | Theme settings → enable "Show inline errors" (Shopify default in 2025+); if not, custom JS in `checkout.liquid` | M | +1–3% CVR |
| `A5_no_password_strength` | Do not require a password-strength meter on checkout | N/A (Shopify accounts are passwordless via email link in 2025+) — verify the "Set up password" page is never shown during checkout | S | +0.5–1% CVR |

### Section B — Layout & form design (5 items)

| ID | Finding | Shopify fix | Sev | Lift |
|---|---|---|---|---|
| `B1_single_page_or_accordion` | One-page checkout > multi-step. If multi-step, show progress + collapsible accordion | Use Shopify's one-page checkout (`/checkouts/<id>`); if theme forces multi-step, switch to the Checkout Extensibility API | L | +8–15% CVR |
| `B2_persistent_order_summary` | Order summary visible at all times (sticky on mobile, sidebar on desktop) | Theme → checkout → enable **"Show order summary as sidebar"** (desktop) and **"Show cart line items at top"** (mobile) | M | +2–5% CVR |
| `B3_address_autocomplete` | Address autocomplete (Google Places API or Shopify-built-in) | Enable Shopify's built-in address autocomplete (Settings → Checkout → "Use address autocomplete"); if unavailable, install a free Shopify app like "Address Validator" | L | +3–7% CVR |
| `B4_clear_field_labels` | Visible field labels (not just placeholders); click-to-focus label | Theme settings → ensure `label` element renders above the input (default Shopify); custom themes with floating-label UIs should be reverted | S | +0.5–2% CVR |
| `B5_error_messages_inline` | Error messages appear inline, next to the field, not as a banner | Default Shopify behavior (2025+); if a custom app injects banner errors, move them inline | S | +0.5–2% CVR |

### Section C — Payment options (5 items)

| ID | Finding | Shopify fix | Sev | Lift |
|---|---|---|---|---|
| `C1_shop_pay_default` | Shop Pay is default payment for returning customers | Settings → Payments → **Shop Pay enabled** + accelerate the checkout (default in 2025+ if the customer's email matches a Shop account) | L | +10–20% mobile CVR |
| `C2_apple_pay_google_pay` | Apple Pay (Safari/iOS) and Google Pay (Chrome/Android) buttons above credit card form | Settings → Payments → enable **Apple Pay** + **Google Pay** + **Shop Pay**. All three are part of Shop Pay accelerated checkout, single toggle | L | +10–25% mobile CVR |
| `C3_bnpl_for_high_aov` | BNPL (Klarna, Affirm, Afterpay) for AOV > $150 | Settings → Payments → install Klarna or Affirm if AOV > $150; skip if AOV < $80 | M | +5–15% CVR (AOV-gated) |
| `C4_payment_icons_visible` | Payment-method icons visible on product page + cart (not just checkout) | Theme → product template + cart template → add payment-icons.liquid snippet; many free themes have this disabled by default | M | +2–5% CVR |
| `C5_no_redirect_for_guest_card` | Guest credit-card payment does NOT redirect away from checkout to a 3rd-party gateway | Use Shopify-native checkout (Shopify Payments) — never redirect to PayPal Standard, Stripe Checkout, or any hosted page | L | +3–8% CVR |

### Section D — Trust & confidence (4 items)

| ID | Finding | Shopify fix | Sev | Lift |
|---|---|---|---|---|
| `D1_trust_badges_checkout` | Trust badges near "Place order" button (SSL, payment-provider, money-back) | Theme → checkout → add trust-badge.liquid snippet (Norton, McAfee, BBB, money-back); free assets at https://www.trustwave.com/ or use simple text + shield icon | M | +1–3% CVR |
| `D2_secure_checkout_label` | "Secure checkout" / lock icon next to payment fields | Default in Shopify 2025+; verify it's not removed by a custom theme override | S | +0.5–1% CVR |
| `D3_returns_policy_link` | Link to returns/refunds policy visible on checkout (footer or near order summary) | Settings → Legal → Returns policy URL → add link to checkout footer via theme settings | S | +0.5–1% CVR |
| `D4_real_shipping_costs_upfront` | Shipping cost shown BEFORE user reaches shipping step (on cart page) | Theme → cart template → add `shipping-rates.liquid` snippet with calculated rates; NEVER show "calculated at checkout" | L | +3–7% CVR |

### Section E — Mobile-specific (5 items)

| ID | Finding | Shopify fix | Sev | Lift |
|---|---|---|---|---|
| `E1_sticky_place_order` | "Place order" button always visible on mobile (sticky bottom or above fold) | Use Checkout Extensibility customizer → make the primary CTA sticky; or use a one-page checkout so the button is reachable without scrolling | L | +5–10% mobile CVR |
| `E2_touch_targets_44px` | All interactive elements ≥ 44×44 px (Apple HIG, WCAG 2.5.5) | Theme → checkout CSS → audit `input`, `button`, `a` selectors → set `min-height: 44px; min-width: 44px;` | M | +1–3% mobile CVR |
| `E3_no_zoom_required` | No zoom required for any field on mobile (16px+ font on inputs to prevent iOS zoom) | Theme CSS → `input { font-size: 16px; }` (the standard 16px iOS-trigger threshold) | M | +1–3% mobile CVR |
| `E4_digital_wallet_above_form` | Apple Pay / Google Pay / Shop Pay buttons render ABOVE the email field on mobile | Settings → Payments → "Accelerated checkout buttons" → "Position: top of checkout" (default 2025+; verify) | L | +5–15% mobile CVR |
| `E5_mobile_test_real_device` | Test on real iPhone + Android device, not just emulators | (operational gate — not a code fix; verify in Step 6) | — | (verification) |

**Total potential CVR lift if all 24 fixed:** +35–80% checkout-completion uplift → +10–25% site-wide revenue (varies by traffic and vertical).

## Step-by-step (audit + fix loop)

### 1. Build your audit input file

Create `/tmp/checkout-audit-<store>.txt` with one line per guideline:

```
A1_guest_checkout|fail|Account setting forced required
A2_no_required_phone|partial|Telephone marked optional but visibly red
...
```

Run the companion script to score it:

```bash
python3 scripts/checkout_audit_score.py --input /tmp/checkout-audit-<store>.txt
```

It will print:
- A 0–100 score
- A pass / partial / fail breakdown
- A prioritized fix-list (Severity L first, then M, then S)
- Estimated CVR lift if all listed fixes shipped

Save the input file alongside the next audit run so you can diff.

### 2. Live-store walkthrough (mobile-first)

Use your own store. Open the staging theme URL on a real iPhone and Android device. Walk through:

1. Add a product to cart → cart page → checkout.
2. Note each guideline you observe: pass / partial / fail.
3. For each fail, capture a screenshot.
4. Open Chrome DevTools → Network → Throttling → "Slow 3G" → reload checkout. Confirm it loads in < 5 seconds.

Time-box this to 30 minutes. Do not fix anything yet.

### 3. Score + prioritize

Run the script. Read the prioritized fix-list. Pick the **top 3 Severity L** fixes — those are the highest CVR lift per hour of work. Do NOT start with S-severity items.

### 4. Fix one L-severity item per day

For each pick:

1. Read the **Shopify fix** column in the audit table.
2. Ship the fix to the staging theme.
3. Re-test (real device + Chrome DevTools).
4. Move the staging theme to live (Schedule the publish for 02:00–06:00 in the lowest-traffic window).
5. Re-run the audit script → log the new score.
6. Move to the next Severity L fix.

Expected daily cycle: 2–4 hours of operator time per fix.

### 5. Measure

After 7, 14, and 30 days, pull the checkout-step funnel from GA4 / Shopify Analytics:

- Reached cart → checkout step 1 (email/contact)
- Reached step 2 (shipping)
- Reached step 3 (payment)
- Reached step 4 (place order)
- Completed order

If your checkout completion rate (orders ÷ reached checkout) went up ≥ 10% over 30 days, the audit worked. If not, re-read the audit — you probably shipped cosmetic fixes without the Severity L items.

### 6. Mobile-device regression test (do this weekly)

Open the live checkout on a real iPhone + Android device. Verify:

- E1 sticky "Place order" button works (visible without scroll)
- E2 touch targets are comfortable to tap (not crowded)
- E3 no zoom needed when tapping email field
- E4 digital-wallet buttons appear above email field

If any fail, file a Severity L bug immediately and fix before the next tick.

### 7. Document + iterate

Once the score is ≥ 75 and CVR lift is ≥ 10%, switch to monthly re-audits. New checkout patterns (Shopify adds 2–3 features per quarter) regress your score. The companion script's input file makes re-auditing a 15-minute job.

## Metrics to track

| Metric | Where to find it | Target |
|---|---|---|
| **Checkout completion rate** | GA4 / Shopify Analytics → checkout funnel | ≥ 50% (Baymard median is 35%) |
| **Mobile CVR** | GA4 device segment | ≥ 60% of desktop CVR (currently 46%) |
| **Checkout abandonment at step 1** (contact) | GA4 funnel | ≤ 25% |
| **Checkout abandonment at step 3** (payment) | GA4 funnel | ≤ 35% |
| **Baymard audit score** | `scripts/checkout_audit_score.py` | ≥ 75 |
| **Time-to-publish for L-severity fixes** | Git / ClickUp history | ≤ 1 day per fix |

## Common pitfalls

1. **"We'll add a trust badge later"** — Trust badges are Severity M, NOT L. Start with guest checkout, address autocomplete, and Shop Pay. Trust badges are polish, not lift.
2. **"Mobile redesign takes 6 weeks"** — Mobile checkout redesign can be done in 1–2 days if you use Shopify's checkout-extensibility API, not by rebuilding the theme from scratch.
3. **Shipping cost reveals too late** — Baymard's #1 single fix. If users see "Shipping: calculated at next step" and the next step is $9.95 shipping, they bounce. Show real shipping costs on the cart page, always.
4. **Forcing account creation "to grow the list"** — Email capture on the post-purchase or shipping-step works better than blocking checkout. Forced accounts lose 5–10% of buyers, and you lose those emails anyway.
5. **"Shop Pay is enough"** — Shop Pay is one of three digital-wallet options. Apple Pay and Google Pay together cover ~40% of mobile traffic that Shop Pay does not (different ecosystems). Enable all three.
6. **Testing only on desktop** — Mobile is 73% of traffic. Test on a real iPhone and Android. Chrome DevTools' mobile emulator understates touch-target friction and ignores iOS zoom behavior on small inputs.
7. **Shipping the audit, not the fixes** — A 100% audit pass with no shipping-fix is a wasted audit. The point is the fix loop.
8. **Over-A/B-testing micro-changes** — A/B testing the color of the "Place order" button is noise. Ship Severity L items with confidence; only A/B test Severity M and S items where the lift is uncertain.
9. **Ignoring the cart page** — Cart is the most-skipped audit surface. Baymard's cart-usability guidelines (separate from checkout) are the next-15% lift after checkout. Add a follow-up audit if cart is your bottleneck.
10. **Reverting a working checkout** — Every theme update is a chance for someone to revert your fixes. Add a CI check (Lighthouse or a custom `curl | grep` smoke test) that asserts Shop Pay + guest checkout + address autocomplete are still present after every theme deploy.
11. **"Let me try the free Baymard UX-Ray scanner first"** — The UX-Ray scanner is heuristic. It catches ~40% of what a manual audit catches. Use it as a baseline, not as a substitute.
12. **BNPL everywhere** — Klarna/Affirm charge 2–6% per transaction. Only enable BNPL if AOV > $150 OR you have margin to absorb it. For sub-$80 AOV consumables, BNPL adds friction without lift.

## Verification

After writing the audit, verify it with the companion script.

### A. Confirm the script accepts your audit input

```bash
echo "A1_guest_checkout|fail|forced required" > /tmp/test-audit.txt
echo "A2_no_required_phone|pass|" >> /tmp/test-audit.txt
echo "B1_single_page_or_accordion|partial|multi-step" >> /tmp/test-audit.txt
echo "C1_shop_pay_default|pass|" >> /tmp/test-audit.txt
python3 scripts/checkout_audit_score.py --input /tmp/test-audit.txt --json
```

Expected: score around 25–40 (a few items at pass/partial out of 24), `health_band` should be `weak` or `fair`. JSON output roundtrips through `json.loads`.

### B. Confirm the score for a "perfect" audit

```bash
python3 scripts/checkout_audit_score.py --all-pass --json | python3 -m json.tool
```

Expected: `score = 100`, `health_band = "top_tier"`, `pass_count = 24`.

### C. Confirm the test suite

```bash
cd /data/workspace/ecommerce-ops
python3 -m unittest scripts.tests.test_checkout_audit_score -v
```

Expected: ≥ 18 tests, all green. Cover:
- Score math (weighted by severity L/M/S = 5/3/1)
- Pass / partial / fail point values (1.0 / 0.5 / 0.0)
- Missing-guideline behavior (graceful skip, not crash)
- JSON output schema stability
- Health-band thresholds (weak < 40, fair 40–55, good 55–75, great 75–90, top_tier ≥ 90)
- Estimated CVR lift (cumulative, capped at 0.80)
- Prioritized fix-list ordering (Severity L first, then alphabetical)

### D. Confirm all 4 cross-suite tests still pass (no regressions)

```bash
cd /data/workspace/ecommerce-ops
for t in scripts/tests/test_*.py; do python3 -m unittest "$t" 2>&1 | tail -1; done
```

Expected: `Ran N tests ... OK` for each suite, no FAIL lines.

## What this playbook does NOT cover

- **Cart-page UX** (separate Baymard guidelines; Add-to-Cart drawer design; cart-page vs cart-drawer)
- **One-click upsells** (covered in `02-post-purchase-upsell-reconvert.md`)
- **Landing-page CVR** (separate audit, not a checkout concern)
- **Email-flow checkout abandonment recovery** (covered in `01-abandoned-cart-flow-klaviyo.md`)
- **Subscriptions / Recharge checkout** (variant with extra confirm step)
- **Internationalization** (multi-currency, multi-language checkout)
- **A/B testing methodology** (assumes you have GA4 or Shopify Analytics; no stats-engine needed)

For those, queue a follow-up playbook each (4–6 days of work each).

---

**Status tracker:** Add to `research/02-top-10-leverage-moves.md` after first ship → status: shipped (playbook + scoring script + tests, YYYY-MM-DD).