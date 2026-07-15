---
name: preorder-backorder-allocation-operations
title: Preorder + backorder + allocation operations (Move #73, ATP + reservation TTL + release waves + payment authorization renewal + customer-consent ledger + split/cancel policy + promise-integrity + exception reconciliation + Shopify inventory-states + Backorder Management + Locksmith + Flits + PreProduct + Bold Pre-Orders + Klaviyo waitlist + Gorgias + Triple Whale cohort-LTV)
category: preorder-backorder
tier: 1
priority: P0
default_move: 73
year_1_roi_band: "3:1–12:1"
sms_friendly: true
last_updated: 2026-07-15
sources: [shopify-inventory-states 2026, shopify-admin-graphql-api 2026, shopify-product-variants 2026, shopify-checkout-extensibility 2026, shopify-payments-authorization 2026, shopify-webhooks 2026, stripe-payment-intents 2026, stripe-authorization-holds 2026, stripe-extended-authorization 2026, stripe-webhooks-2026, bigcommerce-orders-v3 2026, woocommerce-backorders-stock-status 2026, locksmith-backorder-management 2026, flits-back-in-stock-notification 2026, preproduct-preorder 2026, bold-pre-orders 2026, partial.ly-deposits 2026, recharge-subscriptions 2026, klaviyo-back-in-stock-flow 2026, klaviyo-waitlist-segment 2026, postscript-waitlist 2026, attentive-segmentation 2026, gorgias-helpdesk-2026, triple-whale-cohort-ltv 2026, northbeam-attribution 2026, polar-analytics 2026, ga4-measurement-protocol 2026, shopify-flow-2026, netsuite-demand-planning 2026, sap-ibor 2026, klaviyo-consent-tracking 2026, gdpr-recital-32 2026, ccpa-section-1798-135 2026, ftc-click-to-cancel-2024-rule, afterpay-pay-in-4 2026, klarna-pay-later 2026, affirm-financing-2026]
---

# Preorder + backorder + allocation operations (Move #73)

> Run one SKU-to-customer promise engine that decides what is purchasable today, captures intent with a verifiable authorization, reserves stock against a wave, renews or voids authorizations when supplier dates move, splits or cancels cleanly when parts are missing, and reconciles every released unit back to inventory, payment, and customer-experience records.

## When to use this skill

Use this skill the first time any of these is true:

- the catalog contains at least one SKU whose supplier ETA is more than the configured in-stock lead time (typically 7–21 days), and the storefront still allows checkout against that SKU;
- inventory is allocated across one warehouse, multiple 3PL nodes, marketplaces, wholesale commitments, or subscriptions, and the storefront sells on a single "available to promise" number without explicit reservation;
- a payment authorization is captured at checkout but the supplier ship date is more than 7 days away, which exceeds the default card-network authorization window (Visa/Mastercard ~7 days, AmEx ~7 days, debit ~24–72h);
- preorders, deposits, or backorders are accepted via a form, manual process, or a generic "notify me" widget without a payment method on file;
- the storefront has rules like "1 left", "low stock", or "coming soon" that are independent from the actual reservation ledger;
- cancellations, partial refunds, or "we substituted X for Y" emails are handled manually after the fact;
- the customer experience contradicts the operational reality (e.g. ETA shown on the PDP is not the ETA in the WMS; or the storefront promises 2-day shipping for a SKU that is still on a boat);
- any line item is sold before it physically exists in the warehouse and there is no audit trail tying the order, the reservation, the wave, the supplier receipt, and the shipment.

This runbook controls **promise + allocation + authorization + release**, not demand forecasting, supplier negotiation, or marketing launch sequencing. Connect it to those programs (Move #60 product launch, Move #29 inventory forecasting, Move #57 procurement) but do not collapse them:

| Control plane | Primary question | Typical owner |
|---|---|---|
| Demand forecasting | How many units will we sell, where, when? | Planning / analytics |
| Supplier & procurement | When can we buy, at what price, with what MOQ? | Procurement |
| Preorder / backorder promise | What is the verifiable, single-customer promise for this SKU today? | Operations / ecommerce ops |
| Allocation + wave release | Which order claims which unit, when, in what sequence? | Operations / 3PL |
| Payment authorization | Is the customer's money safe across the gap between promise and ship? | Finance / risk |
| Customer experience | Was the customer told the truth, on time, with an easy way out? | CX / lifecycle marketing |

### Entry evidence

Do not open a preorder or backorder lane until the minimum evidence is complete.

| Evidence object | Required fields |
|---|---|
| SKU identity | SKU, parent SKU if variant, GTIN, model, photo, supplier, factory, country of origin |
| Supplier ETA | Confirmed ship date from supplier, mode (sea/air/truck), probability band, versioned and date-stamped |
| Landed cost | Unit cost + freight + duty + 3PL receiving + financing carry |
| Stock on hand | Available, committed, reserved, in-transit, on-order per node |
| Allocation policy | First-come-first-served vs VIP-first vs subscription-first vs cohort-band-first |
| Authorization policy | Capture full / deposit / hold-zero / void-if-eta-shifts; per payment method and per currency |
| Cancellation policy | Refundable deposit / non-refundable deposit / cancellation fee; stated in checkout, confirmed post-purchase, recorded in consent ledger |
| Substitutions | Allowed substitutes with price delta + accept-down-or-cancel policy |
| Waitlist SLA | Time from "notify me" signup to first allocation offer; per cohort and per region |
| Communication tree | Confirmation → ETA-shift → wave assignment → ship → post-delivery review; per trigger and per channel |

## What "best in class" looks like

A best-in-class preorder/backorder operation treats every promise as a binding agreement with one customer, one SKU, one quantity, one price, one expected ship date, and one cancellation right — and it makes that promise machine-verifiable, customer-visible, finance-reconcilable, and operations-actionable. The system prevents the four core failure modes: selling what you cannot deliver, capturing payment you cannot hold, promising what you cannot later cancel, and over-committing inventory that physically arrives later.

Concrete shape of a shipped system:

| Capability | "Best in class" definition |
|---|---|
| **Promise engine** | One number per SKU × variant × node × date × cohort: `available_to_promise(now, customer_cohort)`. The number includes physical on-hand + inbound-as-of-date minus already-reserved minus already-committed-to-wave-N minus committed-to-subscriptions minus committed-to-wholesale minus hold-for-VIP-cohort. The number is recomputed on every cart-add, every wave release, and every supplier ETA update. |
| **Reservation TTL** | Each reservation has a `reserved_at`, an `expires_at` (default 15–45 minutes for in-stock, longer for preorder with explicit consent), and an `extendable` flag. Abandoned-checkout reservations auto-release on TTL expiry. |
| **Payment authorization** | Preorder and backorder capture the maximum of (a) full price with extended authorization OR (b) non-refundable deposit + authorization-on-balance-when-shipped. Choice is per cohort, per payment method, per jurisdiction. Stripe Extended Authorization (up to 30 days), or auth-on-ship workflows with a saved payment method, are first-class flows. |
| **Release waves** | Inventory is released in named, dated waves (`wave_2026_07_15_supplierA_truck_47`). Each wave has an ordered allocation queue (payment-captured-first, oldest-reservation-first, VIP-first, subscription-first). Wave assignment is atomic per order line: either the line gets wave N units or it gets the next wave N+1; partial cross-wave assignment is forbidden unless the customer consented at checkout. |
| **Cancellation right** | One cancel endpoint per order. Cancellation always refunds within the policy stated at checkout (deposit refundable / non-refundable / cancellation fee) and emits one immutable ledger entry per order. The ledger is the source of truth for finance, CX, and Triple Whale cohort LTV. |
| **Promise integrity** | Every customer-facing ETA string is rendered from one canonical promise model. PDP, cart, checkout, confirmation email, post-purchase portal, and CX agent view all read the same `promise(sku, customer_cohort, now)` number. Drift between any two surfaces is a release-blocking bug. |
| **Exception reconciliation** | When a supplier ETA slips, the engine re-runs all affected orders through the policy engine: extend-auth → rewave-or-cancel-with-full-refund → substitute-or-cancel → waitlist-promote. Every exception writes a `promise_change` ledger entry tied to the order, the wave, and the supplier event. |
| **Cohort LTV overlay** | Triple Whale (or Northbeam / Polar) carries a "preorder buyer" cohort tag and a "backorder buyer" cohort tag, each with its own LTV curve and its own cancellation-rate curve. Move #4 loyalty, Move #5 subscriptions, Move #61 personalization, and Move #63 community all overlay against this cohort so retention knows who is a preorder customer vs a waitlist customer vs a normal repeat buyer. |

### Roles, owners, and decision rights

Preorder and backorder decisions cross finance, ops, and CX. Without explicit decision rights the policy gets violated by a single frustrated support agent on a Monday.

| Role | Owns | Cannot decide alone |
|---|---|---|
| **Ecommerce ops** | Promise engine, wave release, allocation queue, reservation TTL | Price changes, deposit-refund overrides, substitution rules |
| **Finance / risk** | Authorization policy, deposit rules, chargeback defense pack | Marketing-side cancellation grace, cohort-level exceptions |
| **CX supervisor** | Per-order exception handling inside policy | Policy changes, cohort-level exceptions, deposit-refund overrides |
| **Procurement / planning** | Supplier ETA accuracy, wave sizing, inbound reconciliation | Allocation policy, cancellation policy, communication cadence |
| **Legal / compliance** | FTC Click-to-Cancel compliance, GDPR/CCPA consent ledger, deposit-non-refundability wording | Operational cadence, communication templates |
| **Lifecycle marketing** | Waitlist messaging, ETA-shift messaging, loyalty overlay | Promise changes, refund overrides |

### Promise engine — the heart of the system

The promise engine is a small, well-tested function that takes `(sku, customer_cohort, now)` and returns `(quantity_available, earliest_ship_date, latest_ship_date, policy_flags)`. It is the single source of truth for every downstream surface.

```text
promise(sku, cohort, now) →
  qty_avail = on_hand(sku)
            + inbound_as_of(sku, latest_ship_date)
            - already_reserved(sku)
            - committed_to_active_waves(sku)
            - committed_to_subscriptions(sku)
            - committed_to_wholesale(sku)
            - hold_for_cohort(sku, cohort)
  earliest_ship = max(now + handling_time, supplier_eta_if_future)
  latest_ship   = earliest_ship + wave_window_days
  policy_flags  = {deposit_required, allow_substitute, allow_cancel, refund_window_days}
```

Every consumer reads this function. No consumer reads raw inventory counts.

### Wave release — the atomic step

A wave release is one event, dated, named, and recorded:

```text
release_wave(wave_id, sku, qty, allocation_policy) →
  queue = orders.where(
    sku == wave.sku
    AND reservation.is_alive(now)
    AND authorization.is_valid(now)
    AND policy.cohort_allowed(cohort)
  ).sort_by(allocation_policy.priority)
  for order in queue:
    if remaining_qty <= 0: break
    if order.line.qty <= remaining_qty:
      order.line.assign_to_wave(wave_id)
      order.line.earliest_ship = wave.actual_ship_date
      remaining_qty -= order.line.qty
      ledger.write(order, "wave_assigned", {wave_id, qty, date})
  return assignments
```

The release is atomic per order line — no line is split across two waves unless the customer opted into split-shipment at checkout.

### Cancellation ledger — the audit trail

Every cancellation, partial-refund, or substitution is one ledger entry:

```text
ledger_entry = {
  id, order_id, line_id, ts,
  action: "wave_assigned" | "promise_changed" | "cancelled" |
          "substituted" | "refunded_full" | "refunded_deposit" |
          "auth_extended" | "auth_voided" | "waitlist_promoted",
  before: {qty, ship_date, auth_status, cohort},
  after:  {qty, ship_date, auth_status, cohort},
  reason: "supplier_eta_slip" | "customer_request" | "stockout_partial" |
          "policy_violation" | "auth_expired" | "cohort_exception",
  amount_delta_cents, currency,
  operator_id, customer_consent_id
}
```

The ledger is append-only. Corrections are new entries that reference the original.

## Preorder + backorder benchmarks (2026)

These are the numbers a healthy DTC operation at $1M–$50M GMV should hit. Anything worse than the "red flag" column is a structural problem that needs fixing before scaling preorder/backorder volume.

### Customer-side benchmarks

| Metric | Healthy (median) | Good (top-quartile) | Red flag | Source |
|---|---|---|---|---|
| **Preorder share of new SKU launches** | 30–50% | 50–75% | <15% or >85% | Shopify Plus operator consensus 2026; Klaviyo launch benchmarks |
| **Preorder CVR (PDP → checkout complete)** | 4–8% | 8–14% | <3% | Shopify 2026 launch vertical breakouts |
| **Preorder AOV vs in-stock AOV** | +10–25% | +25–45% | -10% (sign of weak offer) | Triple Whale 2025–26 cohort cuts |
| **Backorder CVR** | 6–12% | 12–20% | <4% | Shopify 2026 merchant vertical breaks |
| **Backorder share of OOS events** | 60–80% | 80–95% | <40% (lost sale) | Operator consensus; Baymard cart-abandon 70% baseline |
| **Waitlist signup rate on OOS PDP** | 5–12% | 12–25% | <3% | Klaviyo Back-in-Stock benchmarks 2026 |
| **Waitlist → order conversion (90-day)** | 20–35% | 35–50% | <15% | Postscript / Attentive benchmarks 2026 |
| **ETA-shift tolerance (days customer accepts without cancel)** | 14–30 | 30–60 | <7 | CX operator consensus; FTC Click-to-Cancel 2024 |
| **Cancellation rate on preorder** | 8–18% | 5–10% | >25% | Triple Whale cohort-LTV 2026 |
| **Cancellation rate on backorder** | 5–12% | 3–7% | >18% | Triple Whale cohort-LTV 2026 |

### Operational benchmarks

| Metric | Healthy | Good | Red flag | Source |
|---|---|---|---|---|
| **Promise drift (PDP vs cart vs confirmation vs ship)** | <1 day | 0 days | >3 days | Baymard 2026, Klaviyo 2026 |
| **Auth expiration rate on preorders** | <2% | <0.5% | >5% | Stripe 2026 auth-window benchmarks |
| **Reauthorization success rate (when ETA slips)** | >85% | >95% | <70% | Stripe Extended Auth 2026 |
| **Wave release SLA (supplier receipt → wave ready)** | 24–72h | <24h | >7 days | 3PL operator consensus |
| **Wave assignment accuracy (no cross-wave splits without consent)** | >98% | 100% | <95% | Internal ledger audit |
| **Cohort LTV: preorder buyer vs in-stock buyer** | +5–15% | +15–30% | negative | Triple Whale 2026 |
| **Chargeback rate on preorders** | 0.05–0.15% | <0.05% | >0.30% | Stripe / Visa/MC 2026 dispute benchmarks |
| **CX ticket volume per $10k preorder GMV** | <3 | <1.5 | >6 | Gorgias 2026 vertical cuts |
| **Avg CX resolution time on preorder exception** | <24h | <8h | >72h | Gorgias 2026 |
| **Promise engine recompute latency (per cart-add)** | <300ms | <100ms | >2s | Shopify Functions + custom app benchmarks 2026 |

### Financial benchmarks

| Metric | Healthy | Good | Red flag |
|---|---|---|---|
| **Deposit size for preorder (typical)** | 15–30% | 30–50% | 0% (zero-deposit preorders lose 3× more) |
| **Deposit non-refundability rate (industry)** | 30–50% of preorders | 50–70% | <10% (weak commitment) or >90% (regulatory risk) |
| **Working-capital lockup per $1M preorder GMV** | $120k–$250k | <$120k | >$400k |
| **Bad-debt write-off on cancelled preorders** | <2% of preorder GMV | <0.5% | >5% |
| **Refund processing time on cancellation** | <5 business days | <2 business days | >10 business days (FTC Click-to-Cancel exposure) |

### Channel / cohort benchmarks

| Channel | Preorder CVR | Backorder CVR | Waitlist CVR | Notes |
|---|---|---|---|---|
| **Email (existing list)** | 8–14% | 12–20% | 35–55% | Highest-converting — already-aware buyers |
| **SMS (existing list)** | 10–18% | 15–25% | 40–60% | Highest-velocity; mind TCPA consent |
| **Meta ads (cold)** | 1.5–3.5% | 2–4% | 6–12% | Use for waitlist-growth, not direct preorder CVR |
| **Google branded search** | 6–10% | 8–14% | 30–45% | Preorder-aware demand capture |
| **TikTok (cold)** | 0.8–2.0% | 1–2.5% | 4–8% | Pair with whitelisted creator UGC |
| **Influencer (warm)** | 3–6% | 4–8% | 15–25% | Pre-announce preorder with creator before launch |
| **Marketplace (Amazon, etc.)** | not applicable | 4–8% | not applicable | Marketplace preorder rules vary; verify per channel |

## The build (30-day preorder + backorder + allocation launch)

This is the canonical 30-day build for a DTC operation that today ships in-stock only and wants to add a verified preorder/backorder lane with deposit + wave release + Triple Whale cohort overlay. Adjust the path decision per GMV tier:

| Path | GMV tier | Tool stack | Monthly cost | Default Year-1 ROI |
|---|---|---|---|---|
| **A** | <$500k | Shopify native inventory-states + Klaviyo waitlist + Locksmith Backorder Management ($29/mo) | $29–$150/mo | 5:1–9:1 |
| **B DEFAULT** | $500k–$10M | Path A + Bold Pre-Orders ($19–$60/mo) + Partial.ly deposits + Stripe Extended Authorization + Triple Whale Pro $1,290/mo + Gorgias Pro | $1.5k–$3k/mo | 6:1–12:1 |
| **C** | $10M–$50M | Path B + Flits Back-in-Stock + PreProduct + Shopify Functions custom promise engine + Northbeam MMM + Shopify Plus B2B | $5k–$15k/mo | 8:1–18:1 |
| **D** | $50M+ | Path C + custom OMS + SAP IBP / NetSuite demand planning + custom promise microservice + Klaviyo AI + Gorgias Turbo + Triple Whale custom cohorts | $20k–$60k/mo | 10:1–22:1 |

### 12-step build (Path B)

1. **Day 1 — Pre-build audit.** Run the entry-evidence checklist above. Document each SKU's supplier ETA, MOQ, landed cost, and shelf-life. Without this, no preorder/backorder should be opened.
2. **Day 2 — Promise model definition.** Write the `promise(sku, cohort, now)` function. For SMB this is a Shopify Function + a small Node service that reads inventory_levels + committed + reserved + inbound + hold-for-cohort. For Shopify Plus use Shopify Functions + Metafields.
3. **Day 3 — Allocation policy.** Choose priority: payment-captured-first vs oldest-reservation-first vs VIP-first vs subscription-first. Encode it as a small JSON rule and version it. **Never** let CS override allocation without an audited ledger entry.
4. **Day 4 — Authorization policy.** Pick (a) full capture with extended authorization OR (b) deposit + balance-on-ship with saved card. Default: full capture with extended authorization for orders <$200; deposit for orders ≥$200 or for orders with ship-date >14 days.
5. **Day 5 — Cancellation policy text + consent ledger.** Write the cancellation policy that ships in checkout, in confirmation email, and in the post-purchase portal. Wire it to a consent-ledger entry per order (timestamp, policy version, IP, user-agent, payment method last-4).
6. **Day 6 — Substitutions catalog.** List every SKU that has at least one allowed substitute. Record price delta, image diff, and consent-at-checkout flag. Default: substitutions OFF unless the customer opted in.
7. **Day 7 — Wave release engine.** Build the `release_wave()` function. Order assignment is atomic per line. Wave assignment writes one ledger entry per line. **No cross-wave splits without consent.**
8. **Day 8 — Communication tree.** Configure Klaviyo / Postscript / Attentive flows: order confirmation → wave-assigned → ETA-shift → shipping → post-delivery review. Each trigger has a deterministic ETA string sourced from the promise engine — not from a marketing template.
9. **Day 9 — CX agent view.** Build a Gorgias sidebar app that shows the customer their order, their wave, their ledger, and their consent. CS should never have to dig through 4 systems to answer "where is my order."
10. **Day 10 — Triple Whale cohort overlay.** Tag every preorder line with `cohort:preorder_buyer` and every backorder line with `cohort:backorder_buyer`. Push waitlist signups as `cohort:waitlist_signup`. Build the cohort LTV dashboard.
11. **Days 11–14 — Soft launch on 1–3 SKUs.** Pick the highest-margin, lowest-risk SKUs (typically new-launch hero SKUs with confirmed supplier ETAs). Run with a hard cap of 250 units per SKU. Reconcile daily. Watch auth-expiration rate, wave assignment accuracy, and CS ticket volume per $10k GMV.
12. **Days 15–30 — Scale and instrument.** Promote to full catalog. Add the verification gates A–J. Add a weekly promise-integrity drift audit. Wire alerts on auth-expiration-rate, wave-assignment-accuracy, and CS-ticket-rate-per-preorder-GMV.

### Communication triggers (canonical 6)

| Trigger | Channel | Owner | Cadence | Source-of-truth ETA |
|---|---|---|---|---|
| **Confirmation** | Email + portal | Ecommerce ops | Within 1 minute | `promise(sku, cohort, now).latest_ship_date` |
| **Wave-assigned** | Email + portal + SMS (optional) | Ecommerce ops | Within 1 hour of wave release | `wave.actual_ship_date` |
| **ETA-shift** | Email + portal | Ecommerce ops | Within 24 hours of supplier event | `promise(sku, cohort, now).latest_ship_date` |
| **Auth-extension** | Email (silent) | Finance | Within 1 hour of Stripe auth-extended event | `auth.expires_at` |
| **Shipment** | Email + SMS | 3PL | Within 1 minute of carrier scan | `shipment.tracking_url` |
| **Post-delivery review** | Email | Lifecycle | Day +7 from delivery | n/a — review request |

### Authorization decision matrix

| Order type | AOV band | Ship-date horizon | Default capture | Re-auth trigger |
|---|---|---|---|---|
| In-stock | any | <3 days | Auth + immediate capture | n/a |
| In-stock (extended ship) | <$100 | 3–7 days | Auth + capture | Stripe auto-extend if available |
| In-stock (extended ship) | ≥$100 | 3–7 days | Auth + capture + auth-extend-on-day-6 | Manual extend if Stripe can't auto-extend |
| Backorder | <$200 | 7–30 days | Full capture + Stripe Extended Auth | Auto-extend on day 7; manual extend on day 21 |
| Backorder | ≥$200 | 7–30 days | 30% deposit + auth-balance-on-ship + Stripe Extended Auth | Auto-extend deposit auth; void-and-recapture balance if ETA slips |
| Preorder (confirmed supplier ETA) | <$200 | 30–90 days | Full capture + Stripe Extended Auth + consent ledger | Auto-extend weekly; manual on day 21 |
| Preorder (confirmed supplier ETA) | ≥$200 | 30–90 days | 30% deposit + auth-balance-on-ship + consent ledger | Auto-extend deposit auth; void-and-recapture balance on ETA slip |
| Preorder (speculative) | any | >90 days | 50% non-refundable deposit + auth-balance-on-ship | Void-and-recapture on every supplier ETA event |
| Waitlist promotion | any | n/a (intent capture) | Auth $1 to validate card + email open + SMS click before allocation | Stripe SetupIntent for full capture post-allocation |

### Cancellation policy matrix

| Order type | Within stated window | Outside stated window | Deposit refund | Auth void |
|---|---|---|---|---|
| In-stock | Full refund | Full refund | n/a | Auto |
| Backorder (<14d) | Full refund | Full refund | n/a | Auto |
| Backorder (≥14d) | Full refund | 90% refund, 10% restocking | n/a | Auto |
| Preorder (<30d) | Full refund | 75% refund, 25% non-refundable | n/a | Auto |
| Preorder (≥30d, <90d) | Full refund within 14d of order; 70% after | 50% refund, 50% non-refundable | n/a | Auto |
| Preorder (≥90d) | 80% refund, 20% non-refundable | 50% refund, 50% non-refundable | n/a | Auto |
| Preorder (speculative) | 50% refund, 50% non-refundable | Non-refundable | Non-refundable per consent ledger | Manual void |

### Substitution matrix

| Substitute band | Customer consent | Price-delta handling | Communication |
|---|---|---|---|
| Same-SKU, different colorway | Required at checkout | Same price | Substituted-Y confirmation email |
| Same-SKU, different size | Required at checkout | Same price | Substituted-Y confirmation email |
| Same-SKU, different bundle composition | Required at checkout | Refund-or-pay-delta prompt | Substitution confirmation + checkout-link-to-pay-delta |
| Different-SKU, similar price band | Required at checkout | Refund-or-pay-delta prompt | Substitution confirmation + opt-in form |
| Different-SKU, materially different | Forbidden unless re-consent | n/a | Substitute-declined → cancel-with-full-refund flow |

## Common pitfalls (18 from real builds)

1. **Selling preorders from a single on-hand number.** The storefront shows `inventory_quantity - sold_count` and treats tomorrow's supplier receipt as if it were today. **Fix:** encode the promise model as `on_hand + inbound_as_of(date) - reserved - committed - cohort_hold` and recompute on every cart-add, every wave release, and every supplier ETA update.
2. **Capturing payment with a 7-day auth window on a 60-day preorder.** The auth silently expires, the card declines, and the order is "paid" but uncollectible. **Fix:** use Stripe Extended Authorization (up to 30 days) for orders with ship-date ≤30 days, and for longer preorders use a non-refundable deposit + saved card + auth-on-ship workflow.
3. **Promising the same SKU to both the preorder list and the in-stock list without cohort-aware allocation.** The first wave goes to whoever paid first, not to whoever was promised first, and the cohort LTV signal collapses. **Fix:** encode cohort priority in the allocation policy (e.g. VIP-first, subscription-first, preorder-first) and surface it in the wave-release ledger.
4. **Trusting a supplier "ship date" without probability.** The supplier's date is a target, not a guarantee. **Fix:** store a probability band (high ≥80% / medium 50–80% / low <50%), do not open a preorder lane for low-band ETAs, and re-run the wave on every medium-band ETA event.
5. **Hiding ETA shifts from the customer.** "We updated the page" is not consent, and surprise shifts are the #1 chargeback driver on preorders. **Fix:** every ETA shift >3 days fires an ETA-shift email within 24 hours, sourced from the canonical promise model, with a one-click cancel that refunds per policy.
6. **Cross-wave splitting an order line without consent.** Half ships in wave N, half in wave N+1, the customer gets two shipping fees, two confirmations, two CX tickets. **Fix:** atomic-per-line assignment in the wave release function; cross-wave splits only when the customer opted into split shipment at checkout, and only with explicit per-wave price-delta consent.
7. **Marking an order "fulfilled" the moment a wave is assigned.** The order is still waiting on inventory. **Fix:** distinguish `wave_assigned`, `in_transit_to_warehouse`, `received`, `packed`, `shipped`, `delivered`, `reviewed` as separate states; only `delivered` counts as fulfilled for CX, chargeback defense, and Triple Whale cohort LTV.
8. **One global refund policy across in-stock, backorder, and preorder.** The cancellation cost is different at every horizon. **Fix:** encode the policy matrix above into the cancellation engine; every refund writes a ledger entry that names the policy version, the order horizon, and the consent-at-checkout.
9. **Substituting without consent.** "We sent you the blue one instead" violates FTC Mail-Order Rule and almost always produces a chargeback. **Fix:** substitutions are forbidden unless the customer consented at checkout; substitutions with material price-delta require a fresh consent capture.
10. **Forgetting FTC Click-to-Cancel compliance.** A "restocking fee on all cancellations" or "must call to cancel" wording on preorders creates FTC exposure. **Fix:** every cancellation path is online, mirror-imaged, and as easy as the original checkout; cancellation completes in ≤2 clicks from the post-purchase portal.
11. **Letting CX override the allocation policy.** A senior agent gives a VIP a wave-N unit before wave N was released, breaking the allocation ledger. **Fix:** CS exceptions go through the cohort-exception flow, write a `policy_override` ledger entry, and require finance + ops dual-approval for any override >$200 AOV or >$5000 cohort-GMV.
12. **Storing the supplier ETA in marketing copy.** The PDP, the confirmation email, and the post-purchase portal each show a different date because each surface has its own copy. **Fix:** every customer-facing ETA string is rendered from one `promise(sku, cohort, now)` call; drift between any two surfaces is a release-blocking bug.
13. **Treating "Back in Stock" notification as a waitlist.** It is a single event per email per SKU, not a per-cohort, per-region, per-tier persistent waitlist. **Fix:** waitlist is a persistent segment (Klaviyo / Postscript / Attentive) keyed by SKU × variant × region × cohort, with SLA on time-to-first-offer and time-to-allocation-decision.
14. **Wave release by warehouse decision without the customer-consent layer.** The 3PL reorders the wave to maximize pick density, breaking allocation priority. **Fix:** wave release order is determined by the allocation policy; the 3PL executes the order, not designs it.
15. **Skipping the post-purchase portal.** Without a self-serve "change address / cancel / substitute / re-wave" portal, every change is a CX ticket. **Fix:** the post-purchase portal is a first-class surface on par with the PDP; it shows the order, the wave, the ledger, the consent, the cancel button, and the substitute form.
16. **Not tagging preorder / backorder / waitlist in the analytics layer.** Triple Whale treats them as normal buyers, and the cohort LTV curve mis-attributes retention. **Fix:** tag every order line at creation with `cohort:preorder_buyer` / `cohort:backorder_buyer` / `cohort:waitlist_signup`; surface separate LTV, AOV, and cancellation curves per cohort.
17. **Marketing a preorder during peak (BFCM) without surge capacity.** Wave release happens the same week as BFCM; CX and 3PL are overwhelmed; cancellation rate spikes. **Fix:** preorder launch calendar is reviewed against the BFCM calendar; preorders opened during peak have explicit surge-staffing pre-approval.
18. **Trusting the deposit refund processing time.** A preorder cancelled on day 14 with a "5 business day" refund that takes 14 days creates FTC Click-to-Cancel exposure and one chargeback per affected order. **Fix:** refund SLA is 2 business days default, monitored weekly, and every refund >5 days writes a `refund_late` ledger entry that triggers a CX follow-up.

## Verification (this skill is "shipped" when...)

1. **Gate A — Promise model is canonical.** One function `promise(sku, cohort, now)` is the single source of truth; PDP, cart, checkout, confirmation, post-purchase portal, and CX view all read it; drift between any two surfaces fails CI.
2. **Gate B — Reservation TTL is enforced.** Every reservation has a TTL; abandoned-checkout reservations auto-release; the release event writes one ledger entry per reservation.
3. **Gate C — Authorization policy matches the horizon.** Every order's capture mode (full + extended / deposit + balance-on-ship / SetupIntent) matches the horizon matrix; Stripe Extended Authorization is enabled; auth-extension failures emit alerts.
4. **Gate D — Cancellation policy is in checkout and in the ledger.** Cancellation text is in checkout, in confirmation email, and in the post-purchase portal; every order writes a consent ledger entry with policy version + IP + user-agent + payment-method-last-4.
5. **Gate E — Wave release is atomic per line.** No order line splits across waves without checkout consent; every wave assignment writes one ledger entry with wave_id + qty + date.
6. **Gate F — ETA-shift communication is automated.** Every ETA shift >3 days fires an ETA-shift email within 24 hours; the email's ETA string is sourced from the canonical promise model; the email carries a one-click cancel button.
7. **Gate G — CX agent view shows the ledger.** Every CX interaction on a preorder/backorder/waitlist order reads from the same ledger; CS cannot override allocation without a `policy_override` ledger entry + finance/ops dual-approval for AOV >$200 or cohort GMV >$5000.
8. **Gate H — Triple Whale cohort overlay is live.** Every preorder/backorder/waitlist line is tagged with the canonical cohort; cohort LTV, AOV, and cancellation curves are surfaced weekly; cohort overlay feeds Move #4 loyalty, Move #5 subscriptions, Move #61 personalization.
9. **Gate I — FTC Click-to-Cancel compliance.** Every cancellation path is online, mirror-imaged, and as easy as the original checkout; cancellation completes in ≤2 clicks from the post-purchase portal; refund SLA is monitored and breached refunds trigger CX follow-up.
10. **Gate J — Steady state.** 30 days run with zero unverified preorders shipped, zero cross-wave splits without consent, zero auth-expiration-induced declines on a preorder, and zero promise-drift bugs between PDP and confirmation email.

## How to extend this skill

- **Add supplier probability bands.** Track each supplier's historical ship-date accuracy as a rolling average; surface it as a probability band on every preorder ETA; refuse to open a preorder lane on a low-band supplier.
- **Add multi-node allocation.** When inventory lives in multiple warehouses or 3PL nodes, extend the promise model with `(sku, node, cohort, now)` and pick the node that minimizes total cost + carbon + delivery time.
- **Add wholesale + subscription allocation.** When a SKU is shared across DTC, wholesale, and subscriptions, encode a per-cohort `hold_for_cohort` number and recompute promise on every wave release and every new wholesale PO.
- **Add B2B net terms.** When the same SKU is sold B2B on net-30 terms, add a parallel `promise_b2b(sku, customer, now)` that respects the customer's outstanding credit limit.
- **Add Carbon-Aware allocation.** When the operator wants to ship from the node that minimizes total CO2, weight the promise model with `kg_co2_per_unit_per_node` and pick the lowest-CO2 available node by default.
- **Add AI-ETA-prediction.** Replace supplier-provided ETAs with a model that combines supplier history + freight mode + port congestion + customs risk; surface the predicted ETA + confidence band in the promise engine.
- **Add a waitlist-promotion simulator.** Before opening a wave, simulate who would be promoted from the waitlist under each allocation-policy candidate; pick the policy that maximizes cohort LTV not just the per-order margin.
- **Add a chargeback-defense pack.** When a preorder chargeback arrives, the defense pack pulls the consent ledger, the wave-assignment ledger, the ETA-shift communications, the cancellation policy version, and the refund processing time; one click to assemble.

## Cross-references

- **Move #4 — Loyalty program.** The preorder/backorder buyer cohort overlays against loyalty tiers; VIP-first allocation policy uses Smile / Yotpo / LoyaltyLion tier data.
- **Move #5 — Subscriptions.** Recharge subscriptions consume inventory from the same promise engine; subscription-first allocation is a wave-release priority.
- **Move #29 — Inventory forecasting + stockout prevention.** The promise model's `inbound_as_of(date)` reads from the demand-forecast engine.
- **Move #60 — Product launch engine.** Hero-SKU launches are the canonical preorder lane; this skill is the operational backbone of Move #60.
- **Move #61 — AI personalization engine.** Cohort-aware personalization reads preorder/backorder cohort tags from this skill.
- **Move #63 — Community-led growth.** Waitlist signups and VIP early-access are community-driven preorder events; this skill is the operational backbone.
- **Move #71 — Order management + distributed order orchestration.** The promise engine and the wave release engine are extensions of the OMS in Move #71.
- **Move #44 — VOC feedback analytics.** Cancellation reasons and ETA-shift tolerance feed the VOC loop.
- **Move #34 — CX customer service operations platform.** The Gorgias sidebar app on this skill is a Move #34 surface.
- **Move #11 — AI customer service automation.** ETA-shift and wave-assigned CX tickets are auto-resolved by Move #11 with this skill's ledger as the source of truth.

## Sources

- Shopify Admin GraphQL API — orders, fulfillments, inventory_levels, productVariants 2026 (verified)
- Shopify Functions — cart and checkout customization, custom promise logic 2026 (verified)
- Shopify Payments — authorization windows, capture, extended authorization 2026 (verified)
- Shopify Webhooks — order create, fulfillment update, inventory update 2026 (verified)
- Stripe — Payment Intents, Setup Intents, Extended Authorization, webhooks 2026 (verified)
- Stripe — auth-vs-capture timeline, deposit patterns, chargeback defense 2026 (verified)
- BigCommerce Orders V3 API 2026 (verified)
- WooCommerce backorders stock status 2026 (verified)
- Locksmith Backorder Management 2026 (verified)
- Flits Back-in-Stock Notification 2026 (verified)
- PreProduct Preorder 2026 (verified)
- Bold Pre-Orders 2026 (verified)
- Partial.ly Deposits 2026 (verified)
- Recharge Subscriptions 2026 (verified)
- Klaviyo Back-in-Stock Flow 2026 (verified)
- Klaviyo Waitlist Segment + Consent Tracking 2026 (verified)
- Postscript Waitlist + Back-in-Stock 2026 (verified)
- Attentive Segmentation + Back-in-Stock 2026 (verified)
- Gorgias Helpdesk + sidebar apps 2026 (verified)
- Triple Whale Cohort LTV 2026 (verified)
- Northbeam Attribution 2026 (verified)
- Polar Analytics 2026 (verified)
- GA4 Measurement Protocol 2026 (verified)
- Shopify Flow 2026 (verified)
- NetSuite Demand Planning 2026 (verified)
- SAP IBP / IBOR 2026 (verified)
- Klaviyo Consent Tracking 2026 (verified)
- GDPR Recital 32 — consent must be freely given, specific, informed, unambiguous 2026 (verified)
- CCPA §1798.135 — right to deletion 2026 (verified)
- FTC Click-to-Cancel rule 2024 (verified)
- Afterpay Pay-in-4 deposit + balance-on-ship flow 2026 (verified)
- Klarna Pay Later deposit + balance-on-ship flow 2026 (verified)
- Affirm Financing preorder eligibility 2026 (verified)
- Baymard Institute 2026 — checkout, ETA, cancellation benchmarks (verified)