---
name: order-management-distributed-order-orchestration
title: Ecommerce order management + distributed order orchestration (Move #71, Shopify + Fluent Commerce + Manhattan Active OM + IBM Sterling OMS + Salesforce Order Management + fabric OMS + Kibo + payment holds + inventory reservations + ATP + routing + split shipments + cancellations + returns + event reliability)
category: order-management
tier: 1
priority: P0
default_move: 71
year_1_roi_band: "3:1–12:1"
sms_friendly: false
last_updated: 2026-07-15
sources: [shopify-admin-graphql-order 2026, shopify-fulfillment-order 2026, shopify-inventory-states 2026, shopify-order-editing 2026, shopify-webhook-topics 2026, stripe-authorize-capture 2026, stripe-idempotency 2026, stripe-webhooks 2026, aws-transactional-outbox 2026, aws-saga-orchestration 2026, aws-sqs-dead-letter-queues 2026, aws-powertools-idempotency 2026, google-sre-slo 2026, opentelemetry-traces 2026, pci-dss 2026, fluent-commerce-docs 2026, manhattan-active-order-management 2026, salesforce-order-management 2026, ibm-sterling-order-management 2026, fabric-oms 2026, kibo-order-management 2026]
---

# Ecommerce order management + distributed order orchestration (Move #71)

> Build one auditable order-control plane that accepts an order once, reserves inventory once, authorizes or captures payment once, routes each line to a viable node, survives duplicate and out-of-order events, and gives customers and operators one truthful state from checkout through cancellation, fulfillment, return, exchange, and refund.

## When to use this skill

Use this skill when the commerce platform, marketplaces, payment processor, warehouses, 3PLs, stores, and support desk disagree about an order. The canonical symptoms are oversells despite “available” inventory, orders stranded in `paid/unfulfilled`, inventory committed at two nodes, fraud holds invisible to fulfillment, split shipments created without a margin check, cancellations accepted after pick release, duplicate refunds after webhook retries, and support agents reading a different state from the warehouse.

This is the missing layer between checkout and physical execution:

| System | Owns | Must not own |
|---|---|---|
| Commerce platform | Customer intent, cart, checkout, order capture | Cross-channel routing truth after orchestration begins |
| OMS / orchestration layer | Canonical state machine, reservation, sourcing, routing, exceptions, order service | Bin-level pick paths and warehouse labor |
| WMS / 3PL | Receiving, bins, waves, picks, packs, manifests, shipment confirmation | Enterprise-wide available-to-promise or customer refund policy |
| Payment service provider | Authorization, capture, refund transaction result | Inventory availability or fulfillment release |
| Customer-service platform | Human decision and communication | Silent mutation of orders outside the state machine |
| Analytics warehouse | Immutable history and measurement | Operational write authority |

Start when **two or more fulfillment nodes or sales channels** exist, or earlier when any one of these conditions persists for four weeks:

- oversell cancellation rate exceeds 0.5% of accepted orders;
- more than 1% of orders need manual “where is this order?” investigation before carrier handoff;
- inventory, payment, fraud, or address holds are maintained in tags or spreadsheets;
- cancellation acceptance is not checked against pick/pack/ship state;
- marketplace, Shopify, and 3PL statuses require daily CSV reconciliation;
- split-shipment rate or fulfillment cost is unknown at order level;
- duplicate webhooks can create duplicate fulfillment, capture, or refund actions;
- support cannot explain, from one timeline, who changed an order and why.

Do **not** buy an enterprise OMS merely because the store has high GMV. A single Shopify store, one warehouse, low exception volume, and a reliable native fulfillment-order workflow can stay on Shopify plus explicit controls. Add Fluent Commerce, Manhattan Active OM, IBM Sterling, Salesforce Order Management, fabric OMS, Kibo, or a custom orchestrator only when routing complexity and exception cost justify a separate control plane.

### Entry evidence

| Required evidence | Minimum before design begins |
|---|---|
| Order sample | 30 days of orders with line, payment, channel, location, fulfillment, cancellation, return, and refund timestamps |
| Node truth | One owner for on-hand, committed, reserved, unavailable, and incoming quantities at every node |
| Payment truth | Authorization, capture, void, refund, dispute, and expiry events available from the PSP |
| Integration inventory | Every API, webhook, batch, app, 3PL, marketplace, and manual mutation path mapped |
| Failure baseline | Oversells, duplicate actions, stranded orders, late cancels, routing overrides, and reconciliation breaks counted |
| Decision owner | Operations owner with finance, CX, fraud, engineering, and warehouse escalation authority |

## What "best in class" looks like

Best in class is not a vendor dashboard. It is a small number of explicit contracts that remain true during retries, partial outages, edits, and human intervention.

| Control | Floor | Best in class | Proof |
|---|---|---|---|
| Canonical identity | Platform order ID | Immutable enterprise order ID plus channel ID, PSP ID, fulfillment-order IDs, return IDs, and correlation ID | One lookup returns the complete timeline |
| State model | `open/closed` | Versioned order, line, payment, reservation, fulfillment, return, and refund state machines | Transition table with forbidden transitions |
| Inventory promise | On-hand | ATP = eligible on-hand − committed − safety stock − quarantine, with reservation TTL and release rules | Per-node quantity ledger reconciles |
| Routing | Closest node | Feasibility first, then promised date, total landed fulfillment cost, split penalty, capacity, risk, and sustainability tie-breakers | Decision trace stored per line |
| Payments | Capture immediately | Policy-driven authorize/capture/void/refund aligned to fulfillment and authorization windows | PSP ledger equals order ledger |
| Reliability | Retry failed webhooks | Signed webhooks, durable inbox/outbox, idempotency keys, monotonic versions, replay, dead-letter queue, and reconciliation | Duplicate and out-of-order tests pass |
| Human work | Edit in each app | Role-based command surface with reason code, approval threshold, audit event, and compensating action | Every override has actor and evidence |
| Customer service | Ask the warehouse | One timeline, accurate promise, allowed next actions, and customer notification status | Agent can resolve without app-hopping |
| Observability | Error logs | Trace ID from order capture through PSP, OMS, WMS, carrier, notification, and refund | Distributed trace plus business event ledger |
| Recovery | Manual spreadsheet | Defined RTO/RPO, replay procedure, queue drain, degraded mode, and daily financial/inventory reconciliation | Quarterly game day |

### Non-negotiable contracts

1. **Every command is idempotent.** A repeated `reserve`, `release`, `capture`, `cancel`, `refund`, or `route` command with the same business key produces no second economic action.
2. **Events are facts, commands are requests.** `payment_authorized` is not the same as “please capture”; `shipment_confirmed` is not the same as “please send an email.”
3. **State changes are append-only in the audit ledger.** Current state may be materialized, but history is never overwritten.
4. **Inventory is a ledger, not a mutable number.** Available, committed, reserved, incoming, damaged, quarantine, and safety stock remain distinguishable.
5. **Routing decisions are explainable.** Store inputs, candidate nodes, rejected reasons, score components, chosen node, ruleset version, and override history.
6. **No distributed dual write without a recovery pattern.** Use a transactional outbox or equivalent; consumers remain idempotent because delivery can be at least once.
7. **Customer promises are conservative.** Show a date only if inventory eligibility, processing cutoff, node capacity, carrier calendar, and destination service support it.
8. **Compensation is explicit.** If a multi-service workflow fails, the saga specifies release, void, reroute, notify, or escalate actions; it never “hopes the retry works.”

## Order orchestration benchmarks (2026)

These are **operator control targets**, not universal vendor benchmarks or guaranteed commercial outcomes. Establish a 30-day baseline, then set thresholds by channel, node, product class, and service level. Vendor performance claims must be validated in a holdout or staged replay before they enter a business case.

| Metric | Green control target | Amber | Red / stop-the-line | Definition |
|---|---:|---:|---:|---|
| Accepted-order oversell cancellation | ≤0.20% | 0.21–0.50% | >0.50% | Oversell cancels / accepted orders |
| Duplicate economic action | 0 | 1 contained incident | >1 or customer impact | Duplicate capture/refund/reservation/fulfillment |
| Unrouted order age, P95 | ≤5 min | 5–15 min | >15 min | Accepted → node assignment |
| Order-to-release latency, P95 | ≤10 min | 10–30 min | >30 min | Accepted → releasable fulfillment work |
| Stranded order rate | ≤0.10% | 0.11–0.30% | >0.30% | No terminal/progress event beyond SLA |
| Inventory reconciliation variance | ≤0.25% units | 0.26–1.00% | >1.00% | Absolute ledger-to-node variance / units |
| Reservation leak rate | ≤0.05% | 0.06–0.20% | >0.20% | Expired/abandoned reservations not released |
| Split shipment rate | Baseline −20% where economical | Within ±20% baseline | Rising without service reason | Orders sourced from >1 node / orders |
| Promise-date miss | ≤2.0% | 2.1–5.0% | >5.0% | Delivered after customer promise / delivered |
| Cancellation decision latency, P95 | ≤2 min | 2–10 min | >10 min | Request → accepted/rejected decision |
| Late accepted cancellation | 0 | 1 contained incident | >1 | Cancellation accepted after irreversible handoff |
| Webhook/event processing, P99 | ≤60 sec | 61–300 sec | >300 sec | Receipt → durable business-state update |
| Dead-letter queue oldest age | 0 in steady state | <15 min | ≥15 min or growing | Oldest unresolved production message |
| Order-ledger to PSP reconciliation | 100% daily | ≥99.95% | <99.95% | Matched captures, voids, refunds, disputes |
| Order-ledger to WMS reconciliation | 100% daily | ≥99.9% | <99.9% | Matched released lines and shipment facts |
| Manual intervention rate | ≤2% after stabilization | 2.1–5% | >5% | Orders requiring human command / orders |
| Audit completeness | 100% | ≥99.9% | <99.9% | Mutations with actor, reason, before/after, trace |

### Business-case model

Use measured leaks, not an assumed “OMS conversion uplift.” For a 10,000-order/month operator:

| Benefit lane | Conservative formula |
|---|---|
| Oversell prevention | Avoided oversell cancels × contribution margin at risk + service/refund labor |
| Split reduction | Avoided extra shipments × incremental pick/pack/postage cost |
| Automation | Avoided manual interventions × fully loaded minutes × labor rate |
| Payment control | Avoided duplicate captures/refunds + authorization-expiry failures |
| Promise quality | Incremental contribution margin from measured checkout or retention experiment only |
| Inventory use | Contribution margin from orders fulfilled using previously stranded eligible inventory |

Default planning band: **3:1–12:1 Year-1 ROI**, where benefit is audited gross-margin protection plus avoided operating cost, and cost includes software, integration, migration, parallel run, training, incident coverage, and maintenance. Do not count gross revenue as benefit; use contribution margin, and do not count the same saved order in both oversell and inventory-use lanes.

## The build (45-day control-plane launch)

### Phase 0 — Baseline, boundary, and stop rules (Days 0–4)

1. Export 30 days of orders and calculate every benchmark above by channel and node.
2. Draw the system boundary: checkout, marketplace, PSP, fraud service, tax, OMS, ERP, WMS/3PL, carrier, returns, CX, notifications, and warehouse.
3. Name a single source of truth for each fact. “Both Shopify and ERP own status” is not an answer.
4. Define launch stop rules: any duplicate economic action, unexplained inventory delta above 1%, irreversible late cancel, missing audit actor, or customer promise regression above 3 percentage points pauses rollout.
5. Pick the smallest viable path:

| Path | Fit | Stack |
|---|---|---|
| A — Native | One storefront, one or two nodes, simple rules | Shopify Order + FulfillmentOrder + InventoryLevel, PSP, WMS/3PL adapters |
| B — Composable | Multiple channels/nodes, changing rules, engineering team | Fluent Commerce, fabric OMS, Kibo, or custom orchestration with durable event substrate |
| C — Suite | Complex retail, stores, BOPIS, large catalog, enterprise controls | Manhattan Active OM, IBM Sterling OMS, Salesforce Order Management |

**Exit gate:** baseline approved, system ownership matrix signed, path selected, rollback owner named.

### Phase 1 — Canonical model and state machines (Days 5–10)

Create immutable identifiers and versioned schemas for `order`, `order_line`, `payment`, `reservation`, `fulfillment_order`, `shipment`, `return`, `exchange`, `refund`, and `customer_promise`.

Define allowed transitions. A minimum line flow is:

`accepted → held | reserved → routed → released → picking → packed → shipped → delivered`

with explicit branches for `cancel_requested`, `cancelled`, `backordered`, `reroute_requested`, `return_requested`, `returned`, and `refunded`. Define who may issue every command, preconditions, side effects, customer notification, and compensation. Never infer a business transition from a free-form tag.

Shopify's current GraphQL model is a useful substrate: an `Order` exposes whether inventory has been reserved and whether authorized payment is capturable; a `FulfillmentOrder` groups work expected from a location and is created after order routing; `InventoryLevel` separates quantity states such as available, on-hand, incoming, and committed. Preserve those distinctions rather than flattening them into one `inventory` field.

**Exit gate:** 25 representative orders, including failure cases, can be replayed through the transition table without an undefined state.

### Phase 2 — ATP, reservation, and routing policy (Days 11–17)

1. Define eligibility: node active, SKU stocked, inventory not quarantined, market/service supported, hazmat/cold-chain/lot constraints satisfied, node before cutoff, and capacity available.
2. Calculate ATP by node: `eligible on-hand − committed − safety stock − quarantine − unprocessed higher-priority reservations`.
3. Reserve with a TTL and explicit extension/release rules. Checkout holds, fraud reviews, backorders, and payment retries need different TTLs.
4. Generate candidate plans, then score **total order cost**, not each line independently. Include pick/pack, postage, split penalty, transfer, duty, service risk, and promise date.
5. Persist the complete decision trace and ruleset version.
6. Add override commands, never direct database edits: reroute, hold, release, cancel, substitute, backorder, or escalate.

**Exit gate:** a frozen 10,000-order replay produces no oversells, every route has an explanation, and the finance owner approves the cost function.

### Phase 3 — Payment, fraud, edit, and cancellation choreography (Days 18–24)

1. Map each payment method's authorization/capture behavior and expiry window. Stripe documents separate authorization and capture as a hold that reserves funds for later capture; actual support and windows vary by network and method, so fetch current PSP facts at runtime or in the operating table.
2. Choose capture policy by risk and fulfillment model: immediate, on release, on shipment, or split capture. Never assume every method supports partial or delayed capture.
3. Make capture, void, and refund idempotent with a business key such as `order-version/action/amount/currency`.
4. Fraud hold blocks release; fraud release does not bypass ATP or address controls.
5. Order edits create a new version, recalculate tax/shipping/promotion/payment delta, adjust reservation, and produce an audit event. Shopify's order-edit workflow can add/remove quantities and requires explicit commit; mirror this staged-command pattern.
6. Cancellation is a handshake. Check current WMS state, attempt stop, wait for acknowledgement, then release inventory and void/refund. If pick/ship is irreversible, reject or switch to intercept/return policy.

**Exit gate:** payment and cancellation chaos tests prove no duplicate capture/refund and no accepted cancellation after irreversible handoff.

### Phase 4 — Event reliability, reconciliation, and observability (Days 25–32)

1. Verify webhook signatures and persist the raw envelope before business processing.
2. Use inbox deduplication on provider event ID plus business idempotency on commands.
3. Use a transactional outbox or equivalent so database state and emitted event cannot diverge. AWS explicitly warns that outbox delivery can duplicate messages and recommends idempotent consumers that track processed messages; preserve event order where it matters.
4. Use saga orchestration for multi-service workflows with named compensating actions.
5. Reject stale versions, buffer reorderable events, and escalate impossible transitions.
6. Put poison messages in a dead-letter queue with alert, owner, replay tool, and maximum age.
7. Propagate `order_id`, `correlation_id`, `causation_id`, `event_id`, `ruleset_version`, and `actor_id` into logs and OpenTelemetry traces.
8. Reconcile OMS↔PSP, OMS↔WMS, OMS↔commerce platform, and OMS↔marketplace daily. A green queue is not proof that ledgers agree.

**Exit gate:** replaying every event twice and randomly reordering safe events leaves the same final state and economic ledger.

### Phase 5 — Operator and customer service surfaces (Days 33–38)

Build one order timeline showing customer promise, holds, payment, reservations, routing candidates, selected plan, fulfillment progress, messages, returns, and refunds. Expose only valid next actions for the current state. High-risk commands require a second approver and reason code.

Create exception queues by action, not vague status: `payment_expiring`, `reservation_expiring`, `unroutable`, `WMS_rejected`, `cancel_waiting_ack`, `shipment_stalled`, `refund_mismatch`, `reconciliation_break`, and `DLQ_replay_required`. Every queue has an SLA and named fallback owner.

**Exit gate:** CX resolves ten staged scenarios without database access, warehouse chat, or app hopping.

### Phase 6 — Shadow, canary, and cutover (Days 39–45)

1. Run shadow routing for at least seven days; compare incumbent and new decisions without sending new commands.
2. Investigate every route disagreement above the cost or promise threshold.
3. Canary one low-risk channel and one node at 5%, then 25%, 50%, and 100% only after a full operating day per rung.
4. Keep the incumbent path available until reconciliation, cancellation, refund, and replay gates pass.
5. Run failure drills: PSP unavailable, WMS timeout, duplicate webhook, stale inventory, node closure, carrier cutoff, partial shipment, refund timeout, and DLQ growth.
6. Publish daily launch scorecard and freeze routing-rule changes during each canary rung.

**Exit gate:** seven consecutive days meet all red-line targets, daily ledgers reconcile, rollback is tested, and finance/operations/CX/engineering sign.

## Common pitfalls (18 from real builds)

1. **Treating the OMS as a second WMS.** Teams model bins, waves, and labor in the control plane while routing truth remains fragmented. **Fix:** keep OMS ownership at promise, reservation, routing, order service, and exceptions; let WMS own physical execution and exchange only explicit commands/facts.
2. **Using one `status` field for the whole order.** A partially shipped, partially cancelled order with an expiring authorization cannot be represented truthfully. **Fix:** use separate versioned state machines for line, payment, reservation, fulfillment, return, and refund, plus a derived presentation status.
3. **Flattening inventory states into “available.”** Incoming, committed, damaged, safety stock, and quarantine become sellable and create oversells. **Fix:** maintain a quantity ledger and calculate ATP only from eligible states with node- and SKU-level policies.
4. **Reserving inventory without a TTL.** Abandoned checkouts and failed payments strand stock indefinitely. **Fix:** assign reservation reason, created time, expiry, extension policy, release command, and leak monitor; reconcile expired reservations hourly.
5. **Routing each line to the cheapest node.** Local line optimization creates expensive splits and misses order-level promises. **Fix:** generate full-order candidate plans and score landed cost, split penalty, promise, capacity, constraints, and risk before selecting.
6. **Hiding routing logic in vendor configuration.** Operators cannot explain a decision or safely compare rulesets. **Fix:** version rules, store inputs/candidates/rejections/scores, and require a decision trace for every automated or overridden route.
7. **Capturing every payment at order creation.** Backorders, fraud holds, and long lead times increase refund work and authorization-policy risk. **Fix:** define payment-method-specific authorize/capture policy with current PSP windows; capture only at the approved business milestone.
8. **Retrying capture or refund without idempotency.** A timeout is mistaken for failure and the retry duplicates an economic action. **Fix:** persist the intended command, use stable idempotency keys, query provider state after ambiguous results, and reconcile daily.
9. **Accepting cancellation before WMS acknowledgement.** The customer receives a refund while the parcel still ships. **Fix:** cancellation is a saga: request stop, obtain node acknowledgement, then release/void/refund; otherwise reject or enter intercept/return flow.
10. **Letting support edit orders directly in multiple systems.** Tax, promotion, reservation, payment, and fulfillment drift silently. **Fix:** expose role-based OMS commands with preconditions, approval threshold, reason code, actor, before/after values, and compensation.
11. **Assuming webhooks are exactly once and ordered.** Duplicate or late shipment/refund events regress state or trigger a second action. **Fix:** durable inbox, signature verification, provider-event dedupe, business-command idempotency, version checks, sequence policy, and impossible-transition quarantine.
12. **Publishing an event separately from the database transaction.** A crash leaves state committed without an event, or an event published for rolled-back state. **Fix:** use a transactional outbox/CDC equivalent; make consumers idempotent and preserve order for state-sensitive topics.
13. **Using retries without a dead-letter operating model.** Poison events retry forever while the dashboard looks “busy.” **Fix:** cap retries, classify transient/permanent errors, route to DLQ, alert on age and growth, provide replay tooling, and require a resolution note.
14. **Monitoring API uptime but not business ledgers.** Every service is green while captures, reservations, and shipments disagree. **Fix:** run daily OMS↔PSP, OMS↔WMS, OMS↔platform, and marketplace reconciliation with zero-tolerance economic-action exceptions.
15. **Migrating live without shadow decisions.** A new rules engine quietly shifts volume, cost, and promise misses. **Fix:** replay historical orders, shadow live traffic for seven days, investigate disagreements, and canary one channel/node through 5/25/50/100% rungs.
16. **Promising dates from carrier transit alone.** Node cutoff, capacity, weekends, inventory eligibility, and handling time are ignored. **Fix:** promise from ATP + handling calendar + node capacity + cutoff + carrier service + destination calendar, and add conservative buffers validated by miss rate.
17. **Buying an enterprise OMS before proving the leak.** The implementation becomes a multi-year transformation with no measured business case. **Fix:** baseline oversells, manual intervention, splits, promise misses, payment failures, and stranded inventory; choose Native, Composable, or Suite based on complexity, not prestige.
18. **Counting revenue twice in the ROI case.** The same recovered order is credited to ATP, routing, promise, and support automation. **Fix:** create mutually exclusive benefit lanes, use contribution margin rather than gross revenue, subtract implementation/maintenance cost, and have finance approve the attribution ledger.

## Verification (this skill is "shipped" when...)

All gates must pass; a vendor contract or successful happy-path demo is not shipment.

1. **Gate A — Ownership:** every order, inventory, payment, routing, fulfillment, return, refund, and customer-promise fact has one write owner.
2. **Gate B — State machines:** allowed, forbidden, and compensating transitions are versioned and exercised by at least 25 representative scenarios.
3. **Gate C — Inventory:** ATP, reservation TTL, safety stock, quarantine, release, and hourly leak detection work per node and SKU.
4. **Gate D — Routing:** 10,000 historical orders replay with explainable candidates, scores, rejections, ruleset versions, and no oversells.
5. **Gate E — Payment:** authorization, capture, void, partial capture, refund, timeout, expiry, and duplicate-delivery tests produce one correct ledger action.
6. **Gate F — Cancellation/edit:** pre-pick, in-pick, packed, shipped, partial, and edited-order scenarios resolve with valid acknowledgement and compensation.
7. **Gate G — Reliability:** signature verification, durable inbox/outbox, idempotency, version control, saga compensation, DLQ, and replay all pass chaos tests.
8. **Gate H — Reconciliation:** OMS↔PSP, OMS↔WMS, OMS↔platform, and OMS↔marketplace ledgers reconcile daily with named exception owners.
9. **Gate I — Observability:** one correlation ID traces capture, reservation, route, release, shipment, notification, cancellation/return, and refund.
10. **Gate J — Operator surface:** CX and operations resolve ten staged exceptions through valid commands without database edits or app hopping.
11. **Gate K — Canary:** shadow plus 5/25/50/100% rollout completes with stop rules respected and rollback tested.
12. **Gate L — Steady state:** seven consecutive days meet red-line thresholds with zero duplicate economic actions and complete audit records.

## How to extend this skill

- Add **store fulfillment/BOPIS** with store capacity, pickup promise, substitution, no-show, and associate handoff states.
- Add **preorder/backorder allocation** with customer consent, allocation priority, authorization renewal, release waves, and partial-cancel policy.
- Add **regulated inventory** with lot/serial/expiry, quarantine, recall hold, dangerous-goods eligibility, and chain-of-custody constraints.
- Add **cross-border orchestration** with landed cost, DDP/DDU policy, restricted-party/product screening, customs documents, and local returns.
- Add **transfer-order optimization** only after customer-order routing is stable; never mask bad placement with constant emergency transfers.
- Add **machine-learning routing** in shadow mode, bounded by hard policy constraints and an explainable deterministic fallback.
- Add a **vendor selection scorecard** using transaction volume, channels, nodes, stores, order-service complexity, latency, extensibility, data residency, recovery, and total implementation cost.

## Cross-references

- `skills/13-triple-whale-attribution.md` — cohort and contribution-margin measurement without double counting.
- `skills/21-3pl-migration.md` — node and contract migration beneath the OMS.
- `skills/28-returns-portal-orchestration.md` — customer-facing return initiation and reverse logistics.
- `skills/29-inventory-forecasting-stockout-prevention.md` — demand and replenishment planning upstream of ATP.
- `skills/33-fraud-chargeback-management.md` — risk decisions and hold/release choreography.
- `skills/38-checkout-payments-bnpl-optimization.md` — payment-method and authorization policy.
- `skills/39-catalog-pim-dam-operations.md` — product, bundle, dimension, restriction, and channel master data.
- `skills/41-data-warehouse-cdp-operations.md` — analytical history; never the operational write path.
- `skills/45-warehouse-management-fulfillment-orchestration.md` — WMS, 3PL, carrier, and physical execution layer this OMS commands.
- `skills/52-subscription-billing-infrastructure.md` — recurring-order generation and payment recovery.
- `skills/59-shipping-carrier-mix-parcel-routing-engine.md` — parcel service selection after fulfillment routing.
- `skills/69-product-safety-compliance-recall-operations.md` — safety holds, lot traceability, stop-sale, and recall kill switch.

## Sources

Platform and architecture facts were checked on 2026-07-15. Vendor pages describe product capabilities, not independent performance guarantees; validate them in replay, shadow, and canary tests.

- [Shopify GraphQL Admin API — Order](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order) — order relationships, reserved-inventory confirmation, capturable authorization, returns/refunds, and fulfillment status.
- [Shopify GraphQL Admin API — FulfillmentOrder](https://shopify.dev/docs/api/admin-graphql/latest/objects/FulfillmentOrder) — location-scoped fulfillment work, routing-created fulfillment orders, holds, moves, splits, and lifecycle.
- [Shopify GraphQL Admin API — InventoryLevel](https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryLevel) — inventory item/location relationship and multiple quantity states.
- [Shopify — Manage inventory quantities and states](https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps/manage-quantities-states) — available, on-hand, committed, reserved, incoming, damaged, and safety-stock relationships.
- [Shopify — Edit existing orders](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/edit-orders) — staged order edits and explicit commit workflow.
- [Shopify GraphQL Admin API — WebhookSubscriptionTopic](https://shopify.dev/docs/api/admin-graphql/latest/enums/WebhookSubscriptionTopic) — current order, fulfillment, inventory, return, and refund topic surface.
- [Stripe — Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method) — separate authorization and capture; method/network windows vary.
- [Stripe API — Idempotent requests](https://docs.stripe.com/api/idempotent_requests) — stable request keys for safe retries.
- [Stripe — Receive events in a webhook endpoint](https://docs.stripe.com/webhooks) — signature verification, retries, event handling, and endpoint operations.
- [AWS Prescriptive Guidance — Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) — dual-write avoidance, duplicate-message caveat, idempotent consumers, and ordering.
- [AWS Prescriptive Guidance — Saga orchestration pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html) — multi-service workflow and compensating transactions.
- [Amazon SQS — Dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) — redrive policy, retention, and DLQ operations.
- [AWS Lambda Powertools — Idempotency](https://docs.aws.amazon.com/powertools/python/latest/utilities/idempotency/) — persistence-backed duplicate suppression and safe retries.
- [Google SRE Book — Service level objectives](https://sre.google/sre-book/service-level-objectives/) — user-relevant SLI/SLO design and error-budget discipline.
- [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/) — trace/span context across distributed work.
- [PCI Security Standards Council — PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/) — current payment-data security standard; scope with a qualified assessor.
- [Fluent Commerce Docs](https://docs.fluentcommerce.com/) — composable order-management product documentation.
- [Manhattan Associates — Order Management](https://www.manh.com/solutions/omnichannel-software-solutions/order-management-system) — enterprise order promising, fulfillment, and order service capabilities.
- [Salesforce — Order Management](https://www.salesforce.com/commerce/order-management/) — distributed inventory, fulfillment routing, order service, cancellation, and return capabilities.
- [IBM — Sterling Order Management](https://www.ibm.com/products/sterling-order-management) — vendor product entry point (currently redirects to IBM Products from this server); confirm the current Sterling module documentation, SKU, and capabilities during procurement.
- [fabric — Order Management System](https://fabric.inc/products/order-management-system) — composable OMS vendor entry point (this server received HTTP 403); validate the current API, availability, and claims directly during diligence.
- [Kibo — Order Management](https://kibocommerce.com/products/order-management/) — distributed-order-management vendor entry point (this server received HTTP 403); validate current deployment and integration claims in a proof of capability.
