# 3PL Migration — Operator Build (Phase-by-Phase ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace + Extensiv multi-3PL orchestration)

> **Source.** Operator-build companion to `research/07-3pl-migration.md` (the canonical 11-section 3PL-migration research synthesis; the synthesis layer for the 3PL-migration track; Move #12 from `research/03-30-day-rollout-plan.md` §Next moves after 30 days line 177). Read `research/07-3pl-migration.md` FIRST for the 5-pillar framework + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 8-metric operational KPI dashboard + cost-stack math. This playbook maps each pillar into step-by-step 3PL selection + RFQ collection + vendor comparison + contract negotiation + WMS integration + inventory migration + receiving + pick-pack launch + returns launch + multi-warehouse rollout + international 3PL footprint recipe across 3 paths (Path A SMB 500-2k orders/mo ShipBob 3PL solo + Path B mid-market 2k-10k orders/mo ShipBob multi-warehouse + Shopify Fulfillment Network dual-3PL + Path C enterprise 10k+ orders/mo multi-3PL orchestration with Stord + Flowspace + per-market 3PL for international). Pairs with `research/04-international-expansion.md` + `playbooks/11-international-rollout.md` + `research/06-marketplace-expansion.md` + `playbooks/13-marketplace-launch.md` via Path C international 3PL footpring (EU + UK + CA + AU + JP 2-3 day ship time vs 5-10 day direct-from-US shipping = $500k-$5M Year-1 incremental cross-border revenue).

## Goal

By the end of this playbook (Weeks 1–10 for Path A / Weeks 1–20 for Path B / Weeks 1–40 for Path C), the operator has:

1. **3PL contract signed** — ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network OR Stord + Flowspace + Extensiv orchestrator + international 3PL footpring (DHL eCommerce EU + Parcel2Go UK + Canada Post + Australia Post + Sagawa JP) based on the canonical size-match recipe from research/07 Pillar 1 + cost-stack math from Pillar 2 + WMS-integration capability per Pillar 3.
2. **WMS integration live** — Shopify-3PL SKU-mapping + shipping-rate-card override + return-portal + customer-notification webhook + branded-packing-slip + EDI-856 ASN setup per research/07 Pillar 3 (the canonical 4-week pre-migration recipe).
3. **Inventory migrated without losing 1-3% of SKUs** — parallel-ship week or inventory-down-to-zero strategy per research/07 Pillar 3 + the canonical SKU-level cycle-count + barcoded-receiving + week-1 reconciliation.
4. **Cutover to 100% 3PL** — full-pick-pack-launch at 99.5%+ pick-pack-accuracy + 95%+ on-time-ship-rate + ship-cost-per-order within ±10% of quoted + NPS-by-fulfillment-channel monitoring live.
5. **Multi-warehouse 2-day ship coverage on 80%+ US ZIPs** (Path B + C) — East + West + Central warehouses with cross-warehouse-balance-monitoring + per-order routing to lowest-cost warehouse meeting SLA.
6. **International 3PL footpring for 2-3 day ship time** (Path C) — EU + UK + CA + AU + JP 3PL contracts signed + per-market landed-cost-routing algorithm live + customs + duties + returns infrastructure wired.

**Operator time commitment:** Path A ~10 hours one-time + 1 hr/wk ongoing = **~60 hr Year-1**. Path B ~25 hours one-time + 3 hr/wk ongoing = **~180 hr Year-1**. Path C ~80 hours one-time + 15 hr/wk ongoing + dedicated supply-chain-manager hire = **~860 hr Year-1 + $70k-$100k FTE**.

**Default path: Path B mid-market multi-warehouse 2-10k orders/mo / $3M-$10M GMV** — the canonical 12:1 steady-state Year-2 ROI per research/07 §GMV-tier paths Path B cost stack $30k/yr vs Path B Year-1 incremental net $66k-$420k. Path A is the lean starter (no setup complexity; just ShipBob solo); Path C is the enterprise scale (multi-3PL + international; only worth it at $10M+ GMV with 25%+ international volume).

---

## Which 3PL-path fits your order volume

The canonical 3PL break-even per ShipBob State of DTC Shipping 2024 + ShipMonk 2024 + ShipHero 2024 + Multichannel Merchant 2024 3PL-selection-guide:

- **<500 orders/mo / <$500k GMV:** Skip 3PL migration. The per-order pick-pack-fee + storage-fee exceeds the savings from carrier-rate negotiation at this scale. The canonical exception: if the founder is the only fulfillment person AND wants to focus on marketing, **Path A ShipBob Starter** at 200+ orders/mo is defensible (ShipBob Starter has no minimum; the variable cost structure still beats founder-time at this scale).
- **500–2,000 orders/mo / $500k–$3M GMV:** **Path A SMB 3PL solo** — ShipBob Starter OR Shopify Fulfillment Network OR Rakuten Super Logistics. Single warehouse (US-Central: TX, KY, or PA for balanced-coast-to-coast). 3-7 day ship time. 6:1 Year-1 ROI. Operator time: ~10 hr one-time + 1 hr/wk ongoing.
- **2,000–10,000 orders/mo / $3M–$10M GMV:** **Path B mid-market multi-warehouse DEFAULT** — Path A + ShipBob Mid-Market OR ShipMonk OR Red Stag multi-warehouse 2-4 sites. 1-3 day ship time. 80-95% 2-day-ship coverage on US ZIPs. 12:1 steady-state Year-2 ROI. Operator time: ~25 hr one-time + 3 hr/wk ongoing.
- **10,000+ orders/mo / $10M–$50M GMV:** **Path C enterprise multi-3PL orchestration** — Path B + Stord OR Flowspace OR Extensiv orchestrator + international 3PL footpring (EU + UK + CA + AU + JP) + B2B-fulfillment. 10:1 ROI (lower per-dollar but absolute revenue largest). Operator time: ~80 hr one-time + 15 hr/wk + dedicated supply-chain-manager.
- **$50M+ GMV:** Bespoke supply-chain optimization (Stord + Flowspace + custom warehouse automation + dedicated WMS-team + per-region 3PL orchestration engine). This playbook is the floor, not the ceiling, at this scale.

**3PL size-match anti-pattern:** Don't sign with an over-sized 3PL (you'll pay $5k+/mo for unused capacity) OR an under-sized 3PL (they'll miss SLA during Q4 peak). The canonical size-match recipe is to **match 3PL tier to 2× current peak volume, not current average** — a 1,000 orders/mo brand should sign with a 3PL whose minimum tier accommodates 2,000 orders/mo for Q4 elasticity.

**3PL size-match by category:**
- **easy** — apparel + accessories + home goods + pet supplies (non-regulated, ambient storage). Any 3PL works. Default to ShipBob (broadest US footprint + Shopify-native).
- **medium** — supplements + vitamins + food + beverages + cosmetics (FDA-regulated with lot-tracking + expiry-tracking + FDA-registered warehouse). Default to ShipMonk OR Red Stag (both have FDA-registered warehouses).
- **hard** — electronics + batteries + hazmat + lithium-ion + fragrance + aerosols. Requires a hazmat-certified 3PL. Default to ShipBob (their West Coast + East Coast hazmat-certified warehouses) OR FBA as a fallback.
- **fail** — perishables + live plants + perishable-food + pharmaceutical + medical-devices. 3PL migration not recommended; operate in-house with FDA / USDA / DEA-registered warehouse OR contract with a category-specialist 3PL (not addressed in this playbook).

---

## Prerequisites

The 12-prereq gate for 3PL-migration (mirrors research/07 §Prerequisites + research/07 Pillar 3 WMS-integration gate):

1. **Move #1 + Move #4 + Move #6 + Move #8 shipped** — Move #1 abandoned cart flow in Klaviyo + Move #4 welcome series in Klaviyo + Move #6 Triple Whale attribution + Move #8 loyalty program Smile.io. Without these, the operator cannot measure the NPS lift + ship-cost savings + ship-time improvement from 3PL migration. Without Smile.io loyalty, the operator cannot use 3PL-pick-pack-ticket to flag VIP-tier-3+ orders for upgrade.
2. **3 months of clean accounting + SKU-velocity data** — 3PLs require sales-velocity data per SKU for demand-planning + safety-stock calculation. Operators without 3 months of data should defer 3PL migration by 1 quarter.
3. **Shopify (or equivalent ecommerce platform) + registered business entity + warehouse liability insurance ($1M+ inventory-coverage recommended)** — required by all 3PLs.
4. **≥1 SKU with consistent demand** — 3PLs can't optimize pick-pack for hand-made / per-order-manufactured inventory. Operators with per-order-manufactured SKUs should defer 3PL migration.
5. **WMS-real-time-sync API integration capability** — verify the 3PL's WMS exposes real-time inventory + shipment + return + adjustment events via REST API + webhooks. Required to prevent Shopify oversells.
6. **Multi-warehouse inventory-routing algorithm** (Path B + C) — the algorithm routes each order to the lowest-cost warehouse that meets ship-time SLA (e.g. CA order routes to Canada Post if available; else to US-West with 2-day; never to US-East with 5-day). Shopify Inventory Planner OR Extensiv OR custom-built.
7. **Return-portal subscription** (Loop Returns OR Returnly OR 3PL-bundled) — required before launch. Default to 3PL-bundled returns-portal for first 90 days; switch to Loop OR Returnly at scale.
8. **Branded-packing-slip + insert PDF design** — operator-supplied; 3PL prints at fulfillment. Use Canva OR Adobe InDesign. Include thank-you card + referral CTA + Smile.io loyalty CTA + cross-sell product card.
9. **Customer-notification template re-write in Klaviyo** — order-confirmed + order-shipped + out-for-delivery + delivered events wired to 3PL's webhooks (most 3PLs publish shipment-events via webhook to Shopify → Klaviyo transactional-events).
10. **Internal warehouse wind-down plan** — lease-termination-notice + labor-severance OR lease-sublease + WMS-license-cancellation. The canonical trap is paying for both warehouses during the 2-week ramp per Multichannel Merchant 2024.
11. **SLA-defense contract clauses** — 95%+ on-time-ship-rate + financial-penalty-for-misses + weekly SLA report + 99.5%+ pick-pack-accuracy + 5+ year WMS track-record. See Phase 1 Step 1.4 contract negotiation below.
12. **Cost-stack-merge scaffolding** — 3PL negotiated carrier-rates + Shippo multi-carrier rate API + ship-cost-per-order monitoring + dimensional-weight optimization + ship-time P50+P95 tracking. See Phase 1 Step 1.7 below.

**Operator capacity:** minimum 1 hr/wk for the migration itself (Weeks 1–10) + 1 hr/wk ongoing for 3PL-QBR + 1 hr/wk for ship-cost-monitoring + 1 hr/wk for NPS-by-fulfillment-channel monitoring = **~4 hr/wk total during steady-state**.

---

## Step-by-step — Phase 1 (Weeks 1–4, ~12 hours, Path A baseline)

Path A is the canonical starter; Path B + C add 2nd-warehouse + international footpring in Phases 2 + 3.

### 1.1 RFQ to 5+ 3PLs

1. **Build the RFQ brief** — current orders/mo (average + peak Q4) + current AOV + current SKU count + current ship-weight distribution (P50 + P95) + current international volume (% of orders) + current ship-time P50 + P95 + current ship cost per order + current warehouse footprint + dimensional-weight profile + hazmat-flag per SKU + lot-tracking required (Y/N) + FDA-registered warehouse required (Y/N) + current return-rate + current on-time-ship-rate + current pick-pack-accuracy. 1 page; PDF.
2. **Send to 5+ 3PLs** — ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Rakuten Super Logistics (for Path A baseline). For Path B + C, also include Stord + Flowspace + Extensiv (multi-warehouse orchestrator). Send via each 3PL's "Get a quote" form (typically 1-page web form + brief upload).
3. **Timeline:** 1–2 weeks for quotes to arrive. Most 3PLs respond within 5 business days.
4. **Compare quotes** on 6 dimensions (research/07 Pillar 2):
   - **Pick-pack fee** ($/order) — typically $2.50–$6 base + $0.15–$0.50/unit for multi-unit orders.
   - **Storage fee** ($/cubic ft/mo) — typically $0.30–$1.50/cubic ft/mo.
   - **Receiving fee** ($/pallet) — typically $25–$75/pallet + $0.50–$2/unit for piece-level receiving.
   - **Kitting fee** ($/unit) — typically $0.50–$2/unit for subscription boxes + bundles.
   - **Returns fee** ($/return) — typically $2–$5/return + grade-and-resell or return-to-vendor.
   - **SLA ship-time** (P50 + P95 days from order to ship) — most 3PLs guarantee 1–3 business days.
5. **Build a 6×5 cost-comparison spreadsheet** with Path A baseline $11k/yr vs Path B $30k/yr vs Path C $300k-$500k/yr. Use Google Sheets with conditional formatting (green for best, red for worst) on each dimension.
6. **Narrow to top 2 candidates** based on the cost-comparison + WMS-integration capability + SLA + reference-customer checks.

### 1.2 Site visit to top 2 3PL candidates

The site visit is the canonical due-diligence step that catches 80% of the soft failures (worker training, WMS screen usability, pick-pack accuracy on real SKUs) that wouldn't surface from the quote alone.

1. **Schedule visits** — most 3PLs offer a 2-4 hour site tour with their account manager. Bring 5 of your real SKUs (different sizes + weights + fragility profiles).
2. **Verify warehouse cleanliness** — look for: (a) floor cleanliness (no debris + clutter), (b) shelf organization (FIFO enforced), (c) pick-path efficiency (aisles clear + well-marked), (d) climate control (especially for food + supplements + cosmetics), (e) security (cameras + locked cages for high-value SKUs).
3. **Verify worker training** — observe 3-5 pick-pack operations. Look for: (a) workers reading pick-tickets carefully, (b) double-checking SKU + lot + qty, (c) using barcode scanners (not memory), (d) packing-station cleanliness + branded-packing-slip workflow.
4. **Verify WMS-screen realism** — sit with 2-3 pickers and have them walk through their pick-ticket workflow on real screens. Look for: (a) clear SKU display, (b) barcode-scanner integration, (c) lot/date tracking visible, (d) returns workflow visible, (e) real-time inventory updates visible.
5. **Run a pick-pack-accuracy test on-site** — bring 5 of your real SKUs and have the 3PL pick + pack + ship them. Verify the picks match your SKUs + the packing is undamaged + the ship label is correct. The canonical test is "5 picks in 5 minutes with 100% accuracy"; anything less is a red flag.
6. **Ask for 3 reference customers** — call each. Ask about: (a) SLA performance in Q4 peak, (b) pick-pack-accuracy in the first 90 days, (c) WMS-integration stability (any API version mismatches?), (d) returns-handling quality, (e) NPS-by-fulfillment-channel after 6 months, (f) would they sign again?

### 1.3 Compare quotes + select

1. **Build the decision matrix** — 6 cost dimensions + 4 SLA dimensions + 3 WMS-integration dimensions + 3 reference-quality dimensions + 3 size-match dimensions = **19 dimensions × 5 3PLs = 95 cells**. Weight dimensions by importance: cost 30% + SLA 30% + WMS-integration 25% + reference quality 10% + size-match 5%.
2. **Apply the size-match rule** — verify the 3PL can accommodate 2× current peak volume per research/07 §GMV-tier paths.
3. **Default tiebreaker** — for $500k–$3M GMV brands: ShipBob (best Shopify-native integration). For $3M–$10M GMV brands with FDA-regulated SKUs: ShipMonk (best FDA + lot-tracking). For $10M+ GMV brands with international: Stord or Flowspace (best multi-warehouse + international orchestration).
4. **Sign the contract** — see Step 1.4 below for the canonical SLA-defense clauses.

### 1.4 Contract negotiation — SLA-defense clauses

The canonical 3PL contract must include these 8 SLA-defense clauses per research/07 Pillar 5 Pitfall #6 (wrong SLA bites) + Multichannel Merchant 2024 3PL-selection-guide:

1. **95%+ on-time-ship-rate** — measured weekly. SLA miss = financial penalty (typically $0.50–$2/order missed) + cure period (30 days to fix) + termination right (operator can terminate without penalty after 2 consecutive months of <90% SLA).
2. **99.5%+ pick-pack-accuracy** — measured weekly via 3PL's internal audit + your monthly SKU-level cycle-count. SLA miss = $1-$5/unit credit + cure period.
3. **Real-time inventory-sync** — 3PL's WMS pushes inventory to Shopify via API every 5-15 minutes (not daily batch). SLA miss = oversells + customer complaints; penalty $100-$500/day.
4. **$1M+ inventory insurance coverage** — 3PL carries insurance that covers operator's inventory at the 3PL's warehouse for fire + theft + natural disaster. Verify the policy + the named-insured.
5. **Financial-penalty-for-misses** — embedded in #1 + #2 above. The penalty must be large enough to deter misses (typically $0.50–$2/order for SLA + $1–$5/unit for accuracy).
6. **30-day-notice-no-penalty termination clause** — for material SLA misses (2+ consecutive months of <90% SLA + accuracy <98%). Without this clause, switching 3PLs costs $10k-$50k in setup fees.
7. **Multi-warehouse tier** — volume discount at 5,000+ orders/mo (drops pick-pack $0.20–$0.50/order). Negotiate this BEFORE signing even if you're at 1,000 orders/mo today.
8. **Returns-tier** — drop-ship-returns vs return-to-stock vs return-to-vendor. Default to "return-to-stock" for non-defective returns (cheapest + re-sellable) + "return-to-vendor" for defective returns (operator files vendor claim). 3PL handles grade-and-resell via FBA-Grade-and-Resell-style program.

Additional clauses to consider: (a) **setup fee** ($500–$5,000 one-time; negotiate down; some 3PLs waive for 12-month commits), (b) **annual RFQ-re-bid** clause (the canonical 3PL-cost-reduction pattern is to re-bid annually; most 3PLs drop pick-pack-fee by $0.10–$0.30/unit at annual renewal), (c) **data-ownership clause** (all inventory + shipment + return data is operator's property; 3PL can't share with competitors), (d) **insurance-coverage certificate** (3PL provides updated certificate annually).

### 1.5 Sign contract + pay setup fee

1. **Legal review** — have an operations attorney (not a corporate attorney) review the contract. Budget $500–$2,000 for legal review. The canonical trap is signing without legal review and discovering the insurance-coverage clause excludes "acts of God" or the termination clause requires 90-day-notice.
2. **Setup fee** — pay $500–$5,000 setup fee (one-time; some 3PLs waive for 12-month commits). Verify the setup fee includes WMS-integration + SKU-mapping + branded-packing-slip setup + return-portal setup + customer-notification webhook setup.
3. **Kick-off call** — schedule a 60-min kick-off call with the 3PL account manager to align on: (a) launch date (target: 4 weeks from kick-off), (b) first inbound pallet date, (c) first-test-order date (10 test orders in 3PL sandbox), (d) cutover date (100% 3PL).

### 1.6 Build WMS integration

WMS integration is the most common source of 3PL-migration failures per research/07 Pitfall #3 (not verifying WMS integration capability upfront). The canonical decision tree:

- **ShipBob direct Shopify-app:** No integration needed. Install the ShipBob Shopify app (one-click) and Shopify automatically syncs orders → ShipBob + inventory ← ShipBob. Best for small-to-mid Shopify-DTC brands.
- **Shopify Fulfillment Network:** No integration needed. Shopify routes orders directly to SFN. Best for Shopify-DTC brands prioritizing 2-day shipping.
- **Rakuten Super Logistics:** Requires Shippo as the carrier-rate integrator. Install Shippo Shopify-app (one-click) and configure Shippo to use Rakuten's negotiated rates.
- **ShipMonk:** Requires ShipHero OR Ordoro OR Extensiv as the WMS-integrator. These middlewares add $500–$2k/mo but provide the canonical 3PL-agnostic API layer (so you can switch 3PLs without re-integrating).
- **Red Stag:** Requires custom-API integration (Red Stag's WMS is partially proprietary). Budget $5k–$15k for the custom integration.
- **Stord + Flowspace + Extensiv:** Native Shopify + Amazon + Walmart connectors. Best for multi-channel operators.

1. **Decide integrator** — for Shopify-only: ShipBob direct app (free) or SFN (free). For multi-3PL-agnostic future: ShipHero or Ordoro or Extensiv ($500–$2k/mo). For ShipMonk: ShipHero is canonical.
2. **Install + configure** — Shopify admin → Apps → Install integrator app. Configure: (a) SKU-mapping (every Shopify SKU → 3PL's SKU with barcoded labels + lot-tracking + dimensional-weight + hazmat-flag), (b) shipping-rate-card override (route Shopify Shipping rates through 3PL's negotiated carrier-rates; this is the 5-15% ship-cost savings), (c) return-portal setup (Loop Returns OR Returnly OR 3PL-bundled), (d) customer-notification webhook (3PL publishes shipment-events via webhook to Shopify → Klaviyo transactional-events).
3. **Verify in sandbox** — place 10 test orders in the integrator's sandbox environment. Verify: (a) orders sync to 3PL, (b) 3PL picks + packs correctly, (c) shipping rate matches quote, (d) branded-packing-slip renders correctly, (e) customer-notification fires correctly.

### 1.7 Build cost-stack-merge scaffolding

The cost-stack-merge scaffolding is the canonical 3PL cost-saving recipe per research/07 Pillar 2:

1. **3PL-negotiated carrier-rates** — most 3PLs have pre-negotiated UPS + USPS + FedEx rates 5–15% below retail. Verify these rates are enabled in Shopify Shipping (Shopify admin → Settings → Shipping and delivery → 3PL rates).
2. **Shippo multi-carrier rate API** — Shippo aggregates UPS + USPS + FedEx + DHL + regional carriers in one API. Install Shippo Shopify-app (one-click) and configure Shippo to fall back to Shippo rates when 3PL rates are unavailable (international shipments, oversized packages).
3. **Ship-cost-per-order monitoring** — build a daily KPI dashboard: ship cost per order (3PL invoice) vs ship cost per order (Shopify shipping revenue). If 3PL cost > Shopify revenue, raise free-shipping threshold or add handling fee. Triple Whale → Cohorts → "Ship-Cost-Paid" cohort is the canonical tracking.
4. **Dimensional-weight optimization** — 3PLs charge by dimensional-weight (DIM weight = L × W × H / 139 for UPS Ground). For SKUs in the 1–5 lb range with bulky packaging, the DIM weight often exceeds the actual weight. The fix: optimize packaging dimensions (use the smallest box that fits each SKU; consider poly-bag + label for soft goods). Most 3PLs will dim-optimize for you as part of the setup; ask.
5. **Ship-time P50 + P95 tracking** — Triple Whale → Cohorts → "Ship-Time-Bucket" cohort. P50 = 50% of orders ship within this many days. P95 = 95% of orders ship within this many days. Track weekly. SLA target: P50 ≤2 business days + P95 ≤4 business days.

### 1.8 SKU-mapping + branded-packing-slip + customer-notification

1. **SKU-mapping** — map every Shopify SKU to 3PL's SKU. For each SKU: (a) print a barcoded label (Code 128 or QR code; verify the 3PL can scan the format), (b) document lot-tracking requirement (Y/N), (c) document dimensional-weight (L × W × H in inches + weight in lbs), (d) document hazmat-flag (Y/N; UN-certified packaging required if Y), (e) document storage requirements (ambient vs refrigerated vs frozen). Provide as a CSV to the 3PL.
2. **Branded-packing-slip design** — use Canva or Adobe InDesign. Include: (a) brand logo + tagline, (b) order number + customer name, (c) line-items with thumbnail images, (d) thank-you card with referral CTA ("Share your referral link for $10 off your next order"), (e) Smile.io loyalty CTA ("Earn points on every purchase"), (f) cross-sell product card (1-3 related products from Shopify). Provide as a PDF to the 3PL; the 3PL prints at fulfillment.
3. **Customer-notification template re-write in Klaviyo** — Klaviyo → Templates → Create "Order Confirmed" + "Order Shipped" + "Out for Delivery" + "Delivered" transactional templates. Wire to 3PL's webhooks: 3PL publishes shipment-events via webhook → Shopify → Klaviyo transactional-event. Verify the templates render correctly with the customer's name + order details + tracking-link.

### 1.9 Place 10 test orders in 3PL sandbox

1. **Sandbox test orders** — place 10 test orders via Shopify admin test mode or via the 3PL's sandbox dashboard. Include: (a) 3 single-SKU orders, (b) 2 multi-SKU orders, (c) 1 subscription-box order, (d) 1 bundle order, (e) 1 oversized order, (f) 1 international order, (g) 1 order with a return expected.
2. **Verify each test order** — check: (a) order syncs to 3PL, (b) 3PL picks correct SKU + qty, (c) packing matches the packing-slip, (d) branded insert is included, (e) ship cost matches quoted, (f) tracking-number is delivered to customer via Klaviyo, (g) shipping time is within SLA.
3. **Fix issues before cutover** — if any test fails, work with the 3PL account manager to fix BEFORE the cutover. Don't ship to real customers until 10/10 tests pass.

---

## Step-by-step — Phase 2 (Weeks 5–10, ~8 hours, Path A migration + Path B 2nd warehouse)

### 2.1 Inventory pull strategy decision

Two canonical strategies per research/07 Pillar 3 §Migration:

1. **Inventory-down-to-zero** — pause in-house shipping for 1 week; ship all in-house inventory to 3PL; wait for 3PL to receive + count + reconcile; cutover to 100% 3PL. **Best for:** $500k–$1M GMV brands with low-SKU-count (≤50 SKUs) + the operator can pause shipping for 1 week without significant revenue impact.
2. **Parallel-ship week** — in-house warehouse + 3PL ship 50/50 for 1 week. In-house warehouse winds down over the next 2 weeks. **Best for:** $1M+ GMV brands with high-SKU-count (>50 SKUs) + the operator cannot pause shipping for 1 week.

Decision rule: **default to parallel-ship week for any $1M+ GMV brand**; the risk of losing a week of revenue exceeds the operational complexity.

### 2.2 Ship first inbound pallet to 3PL

1. **Build the inbound shipment** — pick + pack + label every unit with the 3PL's SKU label (Code 128 barcode). Include dimensional-weight + lot-tracking + hazmat-flag documentation.
2. **Choose carrier** — UPS Ground OR FedEx Ground OR LTL freight for pallets >150 lbs. The 3PL typically has a partnered-carrier program with discounted rates.
3. **Ship to 3PL** — provide the 3PL's receiving address + the SKU manifest (CSV) + the expected arrival date. Most 3PLs require 48-hour advance notice for inbound shipments.
4. **Timeline:** 2-5 days for the 3PL to receive + check-in + stow the inventory (depending on carrier + receiving backlog).

### 2.3 Receive + count + reconcile at 3PL

1. **3PL receiving report** — the 3PL generates a receiving report within 24 hours of receipt: every SKU + qty + condition (intact / damaged / missing). The 3PL's WMS pushes inventory-sync back to Shopify via API.
2. **Reconcile against your manifest** — compare the receiving report against your shipped manifest. Investigate any discrepancies (typically 1-3% of units are short or damaged per Multichannel Merchant 2024).
3. **Cycle-count** — for any discrepancies >1%, run a manual cycle-count (operator physically counts the affected SKUs at the 3PL; the 3PL's WMS should match).
4. **Shopify inventory update** — once reconciled, Shopify inventory now lives at the 3PL's location (Shopify admin → Products → SKU → Inventory → Location = 3PL warehouse). The 3PL's WMS continues to push inventory-sync via API in real-time.

### 2.4 First 100 picks (manual QA check)

1. **First 100 picks** — for the first 100 orders after cutover, the operator manually reviews every pick: verifies SKU + lot + qty + condition. This is the canonical "week 1" QA gate.
2. **Pick-pack-accuracy target:** ≥99.5%. If accuracy is <99%, investigate every miss with the 3PL account manager; consider pausing cutover until accuracy is fixed.
3. **Document issues** — keep a pick-pack-issue log: every wrong-pick + every short-pick + every damaged-pick. Share weekly with the 3PL.

### 2.5 First 100 picks+pack+ship (verify ship-cost + ship-time + branded-packing-slip)

1. **Ship-cost verification** — for the first 100 shipped orders, verify the 3PL's invoice matches the quoted rate within ±10%. If 3PL cost exceeds quote by >10%, escalate to the 3PL account manager.
2. **Ship-time verification** — verify ship-time P50 + P95 are within SLA. SLA target: P50 ≤2 business days + P95 ≤4 business days.
3. **Branded-packing-slip verification** — verify the branded-packing-slip + branded insert render correctly (logo + tagline + thank-you card + referral CTA + loyalty CTA + cross-sell product card). Take a photo of every 10th packing-slip for the operator's records.

### 2.6 Cutover to 100% 3PL

1. **Pause in-house fulfillment** — once the first 100 picks+pack+ship are passing QA, pause in-house fulfillment. All new orders route to 3PL.
2. **Wind down in-house warehouse** — return remaining inventory to 3PL OR sell off via clearance. Cancel the in-house warehouse lease + WMS license + labor.
3. **Verify cutover** — verify all new orders are flowing to 3PL (no orders accidentally going to in-house). Monitor for 7 days post-cutover.

### 2.7 Path B — Onboard 2nd warehouse

For Path B mid-market multi-warehouse, add a 2nd warehouse in Phase 2:

1. **Pick the 2nd warehouse location** — analyze your order-by-state data (Shopify admin → Analytics → Orders by state). Pick the 2nd warehouse on the opposite coast from your 1st warehouse. Default: 1st warehouse = US-Central (TX/KY/PA), 2nd warehouse = US-West (CA) + US-East (PA/GA) for full-coast-to-coast 2-day-ship coverage.
2. **Negotiate multi-warehouse tier** — most 3PLs offer a 5-15% pick-pack-fee discount at multi-warehouse. Negotiate before adding the 2nd warehouse.
3. **Split inventory across warehouses** — default 50/50 split; tune every 2 weeks based on sales-velocity per region (more inventory in the warehouse serving the higher-velocity region). Cross-warehouse-balance-monitoring tool: Shopify Inventory Planner OR Extensiv OR custom-built dashboard.
4. **Per-order routing algorithm** — the algorithm routes each order to the lowest-cost warehouse that meets ship-time SLA. Default rule: CA + WA + OR + NV orders → US-West warehouse; NY + NJ + PA + FL + GA → US-East warehouse; everything else → US-Central warehouse. Cross-warehouse-balance-monitoring ensures neither warehouse gets too far ahead/behind in inventory.
5. **Verify 2-day-ship coverage** — Shopify admin → Settings → Shipping and delivery → Shipping zones → verify 80%+ of US ZIPs are now showing 2-day-ship options at checkout. Conversion lift expected: +3–8% on orders shipped from closer warehouse.

### 2.8 Verify cutover + monitor weekly KPIs

1. **Monitor weekly KPIs** for the first 12 weeks post-cutover:
   - **Pick-pack-accuracy** (target: ≥99.5%)
   - **On-time-ship-rate** (target: ≥95%)
   - **Ship-cost-per-order** (target: within ±10% of quoted)
   - **Ship-time P50 + P95** (target: P50 ≤2 business days + P95 ≤4 business days)
   - **Return-rate** (target: stable vs pre-3PL baseline)
   - **NPS-by-fulfillment-channel** (target: 5-10 point lift vs pre-3PL)
   - **Cost-per-order-fulfilled** (target: ≤$3 for Path A; ≤$5 for Path B)
   - **Oversell rate** (target: <0.1% of orders; indicator of WMS-sync failures)
2. **Weekly 3PL-QBR cadence** — 30-min weekly call with 3PL-account-manager to review the 8 metrics above + Q4-readiness + returns-handling + inventory-levels + any open issues.
3. **Document + iterate** — keep a migration-journal documenting every issue + resolution. After 12 weeks, the migration is steady-state; move to quarterly QBR cadence.

---

## Step-by-step — Phase 3 (Weeks 11–20, ~10 hours, Path B steady-state + Path C international 3PL footpring)

### 3.1 Path B steady-state operations

1. **Cross-warehouse-balance-tuning** — rebalance inventory every 2 weeks based on sales-velocity per region. Use Shopify Inventory Planner OR Extensiv OR custom-built dashboard.
2. **Branded-packing-slip + insert rollout** — if not done in Phase 1, deploy the branded-packing-slip + branded insert. NPS lift: 5-10 points per Multichannel Merchant 2024.
3. **Multi-warehouse-enabled conversion lift** — measure the +3–8% conversion lift on orders shipped from closer warehouse. Triple Whale → Cohorts → "Ship-From-Region" cohort tracks the lift.
4. **Annual RFQ-re-bid** — at the 12-month mark, re-bid the 3PL contract. The canonical 3PL-cost-reduction pattern is to re-bid annually; most 3PLs drop pick-pack-fee by $0.10–$0.30/unit at annual renewal. Use the re-bid as leverage to negotiate down.
5. **Evaluate Path C upgrade** — if GMV has crossed $10M and international volume is 25%+, start evaluating Path C multi-3PL orchestration.

### 3.2 Path C — International 3PL evaluation

For Path C enterprise multi-3PL orchestration, add international 3PL footpring:

1. **Evaluate international 3PLs per market**:
   - **EU** (DE + FR + IT + ES + NL): DHL eCommerce EU OR Amazon Logistics EU. DHL eCommerce EU has 27-country coverage from a single contract.
   - **UK**: DHL eCommerce UK OR Parcel2Go OR Royal Mail 3PL. DHL eCommerce UK has best customs + duties infrastructure.
   - **CA**: Canada Post OR Chit Chats OR Amazon Logistics CA. Chit Chats is the budget option (cross-border from US warehouse with Canadian return address).
   - **AU**: Australia Post OR eParcel. Australia Post has the broadest AU coverage.
   - **JP**: Sagawa OR Yamato OR Amazon Logistics JP. Sagawa + Yamato are the canonical JP domestic 3PLs.
2. **Negotiate per-market contracts** — each market has its own contract + SLA + insurance + integration. Budget 4-6 weeks per market for evaluation + negotiation + setup.
3. **Per-market landed-cost-routing algorithm** — the algorithm calculates per-order: (a) ship from US warehouse (5-10 day ship time, $25-$60 cross-border landed-cost), OR (b) ship from in-region 3PL (2-3 day ship time, $10-$25 landed-cost). For high-AOV orders ($100+), the in-region 3PL wins on conversion. For low-AOV orders, the US warehouse wins on cost.
4. **Customs + duties + returns-infrastructure** — for each market, set up: (a) customs clearance (most in-region 3PLs handle), (b) duties calculation (DDU vs DDP; DDP recommended for +5-15% CVR), (c) per-country return address (use Loop Returns OR Returnly for global returns infrastructure).
5. **Cross-warehouse-orchestration-engine tuning** — for orders that can be fulfilled from multiple warehouses, the engine routes to the lowest-cost warehouse meeting SLA. Stord OR Flowspace OR Extensiv provides the canonical orchestration engine.

### 3.3 Path C — B2B-fulfillment add-on

For Path C with B2B wholesale customers, add B2B-fulfillment:

1. **EDI-856 ASN setup** — Advance Ship Notice for B2B customers (wholesale + retail). Most B2B customers require EDI-856 + EDI-940 (warehouse shipping order) + EDI-945 (warehouse shipping advice).
2. **EDI integration platform** — use a managed-EDI provider (SPS Commerce OR TrueCommerce OR DiCentral). Budget $500–$2k/mo per B2B customer.
3. **Bulk-pick-pack workflow** — for B2B orders (typically case-packs of 12-144 units), the 3PL picks in bulk + palletizes + ships via LTL freight. Different SLA than DTC (typically 5-10 business days for B2B vs 1-3 days for DTC).
4. **B2B-specific return handling** — B2B returns typically involve damaged-in-transit claims + vendor RMAs. The 3PL handles grade-and-resell or return-to-vendor per the contract.

### 3.4 Quarterly 3PL-QBR + annual RFQ-re-bid cadence

For Path B + C steady-state:

1. **Quarterly 3PL-QBR** — 60-min quarterly call with 3PL-account-manager + senior leadership. Review: (a) the 8 KPIs from Phase 2 Step 2.8, (b) Q4-readiness planning, (c) new SKU launches + WMS-integration updates, (d) cost-stack math + RFQ-re-bid preparation.
2. **Annual RFQ-re-bid** — at the 12-month mark, re-bid the contract. Get quotes from 3+ competing 3PLs. Use the re-bid as leverage to negotiate down 5-15% on pick-pack-fee.
3. **Annual insurance-coverage certificate** — verify the 3PL's insurance policy is still in force + the named-insured + the coverage amount ($1M+ recommended).
4. **Annual WMS-integration audit** — verify the integrator (ShipBob direct app / ShipHero / Ordoro / Extensiv) is on the latest API version. Most integrations break every 6-12 months due to API version mismatches; budget 1-2 days/year for integration maintenance.

---

## Step-by-step — Phase 4 (Quarter 2+, ~10 hr cumulative, dedicated supply-chain-manager for Path C)

For Path C enterprise operations at $10M+ GMV with 25%+ international volume:

1. **Hire a dedicated supply-chain-manager** — full-time or fractional consultant ($70k–$100k FTE / $200–$400/hr fractional). The supply-chain-manager owns: (a) 3PL-QBR cadence, (b) ship-cost-monitoring, (c) NPS-by-fulfillment-channel monitoring, (d) cross-warehouse-balance-tuning, (e) annual RFQ-re-bid, (f) international expansion to additional markets (MX + BR + IN + KR), (g) B2B-fulfillment operations.
2. **Wire B2B-fulfillment operations** — for any wholesale + retail customers, wire EDI-856 + EDI-940 + EDI-945 setup with managed-EDI provider. Budget 60-90 days for the first B2B customer's EDI integration.
3. **Cross-warehouse-orchestration-engine tuning** — for Path C, the orchestration engine is the canonical operationally-complex piece. The engine routes each order to the lowest-cost warehouse meeting SLA across US + international 3PLs. Stord + Flowspace + Extensiv are the canonical orchestration providers.
4. **International expansion to additional markets** — MX + BR + IN + KR + JP + ME expansion. Each market requires its own 3PL contract + customs + duties + returns infrastructure. Budget 4-6 weeks per market.
5. **Quarterly business review** — combined 3PL P&L vs DTC Shopify P&L + brand-canary-defense effectiveness + 3PL-cost-per-order-fulfilled + ROI vs canonical Path C 10:1 default.

---

## Metrics to track

The canonical 8-metric 3PL-migration KPI dashboard per research/07 Pillar 5:

| Metric | Target | Measurement cadence | Source |
|---|---|---|---|
| **Pick-pack-accuracy** | ≥99.5% | Weekly | 3PL receiving report + monthly SKU-level cycle-count |
| **On-time-ship-rate** | ≥95% | Weekly | 3PL weekly SLA report |
| **Ship-cost-per-order** | Within ±10% of quoted | Weekly | 3PL invoice vs Shopify shipping revenue |
| **Ship-time P50** | ≤2 business days | Weekly | Shopify order-timestamp vs 3PL ship-timestamp |
| **Ship-time P95** | ≤4 business days | Weekly | Shopify order-timestamp vs 3PL ship-timestamp |
| **Return-rate** | Stable vs pre-3PL baseline | Monthly | Shopify returns dashboard |
| **NPS-by-fulfillment-channel** | +5-10 point lift vs pre-3PL | Monthly | Klaviyo post-purchase-survey NPS segmented by 3PL-fulfilled vs not |
| **Cost-per-order-fulfilled** | ≤$3 for Path A; ≤$5 for Path B; ≤$8 for Path C | Monthly | 3PL invoice / total orders |
| **Oversell rate** | <0.1% of orders | Weekly | Shopify inventory-mismatch log |
| **2-day-ship coverage** | ≥80% of US ZIPs | Quarterly | Shopify shipping zones audit |

**Triple Whale integration:** create 5 lifecycle-cohorts to track 3PL migration impact — "Pre-3PL Customers" + "Post-3PL Customers" + "Ship-From-Region-East" + "Ship-From-Region-West" + "Multi-Warehouse-Enabled". Compare 90-day LTV across cohorts to measure the migration's impact on customer retention + repeat purchase rate + AOV.

---

## Common pitfalls (15 entries with Fix lines clustered into 5 failure modes)

### Failure mode A — 3PL-size-mismatch errors

1. **Signing with an under-sized 3PL** → 3PL misses SLA during Q4 peak (October-December) per Multichannel Merchant 2024. Under-sized 3PLs add 3-7 days to ship time + miss pick-pack-accuracy + cause customer-service complaints. **Fix:** match 3PL tier to 2× current peak volume, not current average. A 1,000 orders/mo brand signing with a 3PL whose minimum tier accommodates 2,000 orders/mo. Verify the 3PL's Q4 elasticity in the contract negotiation (Phase 1 Step 1.4).
2. **Signing with an over-sized 3PL** → 3PL charges $5k+/mo for unused capacity. Over-sized 3PLs treat your brand as low-priority (you fill the gaps between their anchor customers). **Fix:** right-size the 3PL to your current + 12-month-projected volume. Most 3PLs offer quarterly tier adjustments; ask for the flexibility.
3. **Not RFQ-ing to 5+ 3PLs** → Operator signs with the first 3PL they contact (typically ShipBob because it's the most marketed). Misses the 5-15% cost-savings from competitive bidding. **Fix:** RFQ to 5+ 3PLs in Phase 1 Step 1.1. The cost-comparison spreadsheet is the canonical recipe for finding the right-size + right-cost 3PL.

### Failure mode B — Cost-stack-mismatch errors

4. **Not pre-computing per-SKU pick-pack + storage cost** → 3PL's quote looks competitive at the aggregate level but specific SKUs (oversized + heavy + fragile) cost 2-3× the average. **Fix:** in the RFQ brief (Phase 1 Step 1.1), provide the SKU-level breakdown (every SKU + dimensional-weight + lot-tracking + hazmat-flag). The 3PL's quote should include per-SKU costs for the top 20% velocity SKUs.
5. **Ignoring dimensional-weight optimization** → 3PLs charge by dimensional-weight (DIM weight = L × W × H / 139 for UPS Ground). For SKUs in the 1–5 lb range with bulky packaging, the DIM weight often exceeds the actual weight; the operator pays 20-50% more than expected per shipment. **Fix:** optimize packaging dimensions (smallest box that fits each SKU; consider poly-bag + label for soft goods). Most 3PLs will dim-optimize for you as part of setup; ask.
6. **Not negotiating multi-warehouse tier or annual volume tier** → Without volume-tier negotiation, the operator pays full retail pick-pack-fee even at 5,000+ orders/mo. The canonical discount is 5-15% off pick-pack-fee. **Fix:** in the contract negotiation (Phase 1 Step 1.4), negotiate multi-warehouse tier + volume tier + returns-tier BEFORE signing. Even if you're at 1,000 orders/mo today, lock in the 5,000+ tier discount for Q4 elasticity.

### Failure mode C — WMS-integration-mismatch errors

7. **Signing with a 3PL whose WMS doesn't integrate with Shopify natively** → Requires a 3rd-party-integrator (ShipHero OR Ordoro OR Extensiv) that adds $500–$2k/mo and breaks every 6 months during API-version-mismatches. **Fix:** in the RFQ brief (Phase 1 Step 1.1), explicitly ask for native Shopify integration OR for a 3rd-party-integrator the 3PL recommends + the integrator's monthly cost + the integrator's API-version-update cadence.
8. **Not testing WMS integration in sandbox with 10 real orders before cutover** → WMS integration issues surface only with real orders (specific SKU + lot + qty + dimensional-weight combinations). Sandbox testing catches 80% of integration issues before they hit real customers. **Fix:** Phase 1 Step 1.9 — place 10 test orders in 3PL sandbox covering single-SKU + multi-SKU + subscription-box + bundle + oversized + international + return-expected scenarios. Verify all 10 pass before cutover.
9. **No real-time inventory-sync between 3PL WMS and Shopify** → 3PL's WMS pushes inventory to Shopify daily instead of every 5-15 minutes. Operator oversells during peak demand (Black Friday). **Fix:** in the contract (Phase 1 Step 1.4), require real-time inventory-sync via API + webhooks. SLA miss penalty $100-$500/day.

### Failure mode D — SLA-mismatch errors

10. **No financial-penalty-for-misses clause in contract** → 3PL misses SLA in Q4 peak; operator has no recourse. **Fix:** Phase 1 Step 1.4 contract negotiation — embed 95%+ on-time-ship-rate + 99.5%+ pick-pack-accuracy + financial-penalty-for-misses (typically $0.50–$2/order missed + $1–$5/unit accuracy miss) + 30-day-notice-no-penalty termination clause after 2 consecutive months of <90% SLA.
11. **Not running weekly 3PL-QBR cadence** → 3PL issues compound week-over-week; operator discovers them only when NPS drops. **Fix:** Phase 2 Step 2.8 — 30-min weekly call with 3PL-account-manager to review the 8 KPIs + Q4-readiness + returns-handling + inventory-levels + any open issues. Move to quarterly cadence after 12 weeks of steady-state.
12. **No weekly SLA report from 3PL** → 3PL misses SLA but doesn't surface the misses; operator finds out from customer complaints. **Fix:** in the contract (Phase 1 Step 1.4), require weekly SLA report (pick-pack-accuracy + on-time-ship-rate + ship-cost + return-rate + inventory-levels) delivered every Monday morning.

### Failure mode E — Migration-operational errors

13. **Lost inventory during migration** → 1-3% of SKUs go missing during 3PL migration per Multichannel Merchant 2024. Operator discovers the loss 30+ days later when a customer orders a SKU that's not actually at the 3PL. **Fix:** Phase 2 Step 2.3 — full SKU-level cycle-count at receiving + barcoded-receiving (every unit has a barcode the 3PL scans) + week-1 reconciliation against your shipped manifest. For high-value SKUs (>$100/unit), do a manual cycle-count at the 3PL during week 1.
14. **FIFO failures in the first 90 days** → Rotating-stock SKUs (supplements + vitamins + food + cosmetics) lose 5-15% of value to expiry in the first 90 days because the 3PL's WMS isn't enforcing first-expiry-first-out. **Fix:** in the contract (Phase 1 Step 1.4), enforce lot/date tracking from day one + first-expiry-first-out (FEFO) + serialized SKU tracking. Require the 3PL's WMS to expose lot/date fields to Shopify + Klaviyo. For supplements + vitamins + food: monthly cycle-count with lot-expiry-alert at 90 + 60 + 30 days.
15. **Paying for both warehouses during the 2-week ramp** → In-house warehouse + 3PL ship 50/50 during parallel-ship week; operator pays both warehouses' full month. The canonical trap per Multichannel Merchant 2024. **Fix:** Phase 1 Step 1.4 — build the warehouse-wind-down plan BEFORE the migration (lease-termination-notice + labor-severance OR lease-sublease + WMS-license-cancellation). The wind-down plan should be timed to complete within 2 weeks of cutover; the in-house warehouse should not extend beyond the 2-week ramp.

---

## Verification (4 phase-by-phase gates with 10/10/10/9 prereqs respectively)

### Gate A — Phase 1 (Path A pre-migration) ready to launch (10 prereqs)

- [ ] A1: RFQ sent to 5+ 3PLs (ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Rakuten Super Logistics)
- [ ] A2: Top 2 3PL candidates selected based on 19-dimension decision matrix (6 cost + 4 SLA + 3 WMS + 3 reference + 3 size-match)
- [ ] A3: Site visits completed at top 2 3PLs (warehouse cleanliness + worker training + WMS-screen realism + pick-pack-accuracy test + 3 reference customers called)
- [ ] A4: 3PL contract signed with 8 SLA-defense clauses (95%+ on-time-ship + 99.5%+ accuracy + real-time inventory-sync + $1M+ insurance + financial-penalty + 30-day termination + multi-warehouse tier + returns-tier)
- [ ] A5: Setup fee paid ($500-$5,000)
- [ ] A6: WMS integration built (ShipBob direct Shopify-app OR ShipHero OR Ordoro OR Extensiv based on 3PL choice)
- [ ] A7: Cost-stack-merge scaffolding live (3PL-negotiated carrier-rates + Shippo multi-carrier rate API + ship-cost-per-order monitoring + dimensional-weight optimization + ship-time P50+P95 tracking)
- [ ] A8: SKU-mapping complete (every Shopify SKU → 3PL's SKU with barcoded label + lot-tracking + dimensional-weight + hazmat-flag)
- [ ] A9: Branded-packing-slip + insert PDF designed and uploaded to 3PL
- [ ] A10: 10 test orders in 3PL sandbox all passed (single-SKU + multi-SKU + subscription-box + bundle + oversized + international + return-expected)

### Gate B — Phase 2 (Path A migration + Path B 2nd warehouse) ready to launch (10 prereqs)

- [ ] B1: Phase 1 Gate A all 10 prereqs green
- [ ] B2: Inventory pull strategy decision made (inventory-down-to-zero for $500k-$1M brands; parallel-ship week for $1M+ brands)
- [ ] B3: First inbound pallet shipped to 3PL (barcoded + lot-tracked + dimensional-weight-measured + hazmat-flagged)
- [ ] B4: 3PL receiving report reconciled against shipped manifest (cycle-count for any discrepancies >1%)
- [ ] B5: Shopify inventory update pointing at 3PL location
- [ ] B6: First 100 picks verified at ≥99.5% accuracy (operator manually reviews every pick)
- [ ] B7: First 100 picks+pack+ship verified (ship-cost within ±10% of quoted + ship-time within SLA + branded-packing-slip renders correctly)
- [ ] B8: Cutover to 100% 3PL complete (in-house fulfillment paused; warehouse wind-down plan executed)
- [ ] B9: Path B 2nd warehouse onboarded (US-East OR US-West; cross-warehouse-balance-monitoring live; per-order routing algorithm live; 80%+ US ZIPs at 2-day-ship coverage)
- [ ] B10: Weekly 3PL-QBR cadence established (30-min weekly call with 3PL-account-manager; 8-KPI dashboard reviewed)

### Gate C — Phase 3 (Path B steady-state + Path C international 3PL) ready to launch (10 prereqs)

- [ ] C1: Phase 2 Gate B all 10 prereqs green
- [ ] C2: Cross-warehouse-balance-tuning live (rebalance every 2 weeks based on sales-velocity per region)
- [ ] C3: Multi-warehouse-enabled conversion lift measured (+3-8% on orders shipped from closer warehouse per Shopify analytics)
- [ ] C4: Annual RFQ-re-bid executed (5-15% pick-pack-fee discount negotiated)
- [ ] C5: Path C international 3PL contracts signed (EU + UK + CA + AU + JP per market)
- [ ] C6: Per-market landed-cost-routing algorithm live (US vs in-region 3PL decision per order)
- [ ] C7: Customs + duties + returns-infrastructure wired per market (DDU vs DDP; per-country return address via Loop Returns or Returnly)
- [ ] C8: Cross-warehouse-orchestration-engine tuned (per-order routing to lowest-cost warehouse meeting SLA across US + international 3PLs via Stord or Flowspace or Extensiv)
- [ ] C9: B2B-fulfillment wired (EDI-856 + EDI-940 + EDI-945 with managed-EDI provider SPS Commerce OR TrueCommerce OR DiCentral)
- [ ] C10: Quarterly 3PL-QBR cadence established (60-min quarterly call with 3PL-account-manager + senior leadership; 8-KPI dashboard reviewed; Q4-readiness planning)

### Gate D — Phase 4 (Path C steady-state + dedicated supply-chain-manager) ready to launch (9 prereqs)

- [ ] D1: Phase 3 Gate C all 10 prereqs green
- [ ] D2: Dedicated supply-chain-manager hired (full-time at $70k-$100k FTE OR fractional consultant at $200-$400/hr)
- [ ] D3: Supply-chain-manager owns 3PL-QBR cadence + ship-cost-monitoring + NPS-by-fulfillment-channel monitoring + cross-warehouse-balance-tuning + annual RFQ-re-bid + international expansion
- [ ] D4: International expansion to additional markets (MX + BR + IN + KR + ME; each market requires its own 3PL contract + customs + duties + returns infrastructure)
- [ ] D5: Cross-warehouse-orchestration-engine fully tuned (per-order routing to lowest-cost warehouse meeting SLA across US + 5+ international 3PLs)
- [ ] D6: Combined 3PL P&L dashboard built (US + international 3PL costs vs DTC Shopify revenue + ROI vs canonical Path C 10:1 default)
- [ ] D7: Annual insurance-coverage certificate verified (3PL's insurance policy in force + named-insured + coverage amount $1M+)
- [ ] D8: Annual WMS-integration audit completed (integrator on latest API version; no version mismatches in last 12 months)
- [ ] D9: Quarterly business review cadence established (combined 3PL P&L vs DTC Shopify P&L + brand-canary-defense effectiveness + 3PL-cost-per-order-fulfilled + ROI vs canonical Path C 10:1 default)

---

## Cost & ROI estimate (default $3M US GMV brand, Path B scope)

Year-1 cost stack for Path B (mid-market multi-warehouse) at $3M US DTC GMV base:

| Cost line | Annual cost |
|---|---|
| 3PL setup fee (one-time, year 1) | $2,000 (one-time) |
| Pick-pack fee ($3.50/order × 6,000 orders/yr average × 1.5 Q4 peak factor = ~9,000 orders) | $31,500/yr |
| Storage fee (1,000 cubic ft avg × $1.00/cubic ft/mo) | $12,000/yr |
| Receiving fee (4 pallets/mo × $50/pallet) | $2,400/yr |
| Kitting fee (200 kits/mo × $1.00/kit) | $2,400/yr |
| Returns fee (300 returns/yr × $3.50/return) | $1,050/yr |
| Shipping overhead (3PL negotiated carrier rates vs retail UPS Ground) | $18,000/yr |
| Multi-warehouse overhead (Path B 2nd-warehouse coordination) | $10,000/yr |
| Branded-packing-slip + insert (printing + design) | $4,000/yr |
| Cross-warehouse-balance-monitoring (Shopify Inventory Planner OR Extensiv) | $5,000/yr |
| Shippo multi-carrier rate API subscription | $300/yr |
| Loop Returns OR Returnly subscription | $2,400/yr |
| Operator time (one-time 25hr Phase 1 + 8hr Phase 2 + ongoing 3 hr/wk) | $7,800/yr |
| **Total Year-1 cost stack** | **~$98,850 median** |

Year-1 incremental net revenue for Path B at $3M US DTC GMV base:

- **Conservative:** Ship-cost savings $11k (5-15% × $120k baseline ship-cost) + warehouse-cost reduction $36k (eliminating 1,000 sq ft @ $3/sq ft/mo + labor + WMS-license) + multi-warehouse-enabled conversion lift $90k (+3% conversion × $3M GMV baseline) + multi-warehouse NPS lift $5k + inventory-carry-cost reduction $8k (FIFO + WMS-driven demand-planning) = **$150k gross − $99k 3PL cost = $51k Year-1 net**.
- **Median:** $20k ship-cost savings + $48k warehouse-cost reduction + $150k conversion lift + $10k NPS lift + $12k inventory-carry-cost reduction = **$240k gross − $99k 3PL cost = $141k Year-1 net**.
- **Aggressive:** $30k ship-cost savings + $60k warehouse-cost reduction + $240k conversion lift + $15k NPS lift + $20k inventory-carry-cost reduction = **$365k gross − $99k 3PL cost = $266k Year-1 net**.

**Path B default Year-1 ROI = 1.4:1 median ($141k Year-1 net / $99k cost = 1.4:1); Path B steady-state Year-2+ ROI = 12:1 ($329k gross incremental vs $30k 3PL cost = 11:1; $365k gross vs $30k cost = 12:1)** per `research/07-3pl-migration.md` §Cost & ROI estimate. The Year-1 ROI is muted by setup + wind-down costs; Year-2+ steady-state is where the 12:1 ROI kicks in.

ROI ranges for each path tier:

- **Path A (SMB 3PL solo, $500k-$3M US DTC GMV):** $9k-$75k Year-1 incremental net; cost stack ~$11k/yr; ROI = 0.8:1 to 6.8:1; **6:1 default**
- **Path B (mid-market multi-warehouse, $3M-$10M US DTC GMV) DEFAULT:** $51k-$266k Year-1 net; cost stack ~$99k/yr Year-1 + $30k/yr steady-state Year-2+; ROI Year-1 = 0.5:1 to 2.7:1; ROI Year-2+ steady-state = 6:1 to 12:1; **12:1 default steady-state Year-2+**
- **Path C (enterprise multi-3PL orchestration, $10M-$50M US DTC GMV):** $620k-$5.6M Year-1 incremental net; cost stack $300k-$500k/yr; ROI = 1.2:1 to 11:1; **10:1 default** (lower per-dollar ROI than Path B because international-fulfillment has higher setup + per-unit costs, but absolute revenue is the largest of the 3 paths)

---

## Companion tools

- **`scripts/3pl_unit_economics.py`** *(planned — does not yet exist)* — Archetype A/B hybrid Path A/B/C scorer that takes current orders/mo + current AOV + current ship cost + current ship time + current warehouse footprint + current SKU count + current international volume → outputs Path A (SMB 3PL solo) / Path B (mid-market multi-warehouse) / Path C (enterprise orchestration) recommendation with cost-stack + expected Year-1 incremental ship-cost savings + ship-time improvement + multi-warehouse-enabled + 6-step build sequence. Compounds research/07 §GMV-tier paths + this playbook by automating the per-brand path-selection decision the operator currently does manually.
- **`dashboards/3pl-migration-health.html`** *(planned — does not yet exist)* — static HTML dashboard rendering the per-path 3PL-selection readiness + per-3PL cost-stack + 4-phase migration-gate status + ship-cost-savings overlay as a 1-click operator surface.
- **`dashboard/app/3pl/page.tsx`** *(planned — does not yet exist)* — Next.js operator-surface route surfacing the framework as a 1-click 3PL-selection decision-tool + per-path migration-progress heat-map.

---

## Next moves

1. **Asset 15 3PL-selection-card `assets/15-3pl-selection-card.md`** *(shipped 2026-06-27 per the asset-tick follow-up to research/07 + this playbook — the canonical 3rd-layer operator-copy companion per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order)* — paste-ready per-3PL vendor-comparison card with 6 dimensions (pick-pack-fee + storage-fee + receiving-fee + kitting-fee + returns-fee + SLA-ship-time) × 7 canonical 3PLs (ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Rakuten Super Logistics + Stord + Flowspace) = 35 voice-driven override cells + 8-prereq RFQ template + 3-tier size-match decision matrix + 12 pitfalls with corrective Fix lines + 5 verification gates. Compounds research/07 §GMV-tier paths + this playbook by shipping the operator-copy layer. Gated on this playbook shipping first per the canonical layer order; now available for $500k+ GMV brands hitting the canonical 500+ orders/mo 3PL break-even threshold per ShipBob 2024 with Move #1 + #4 + #6 + #8 live.
2. **Script `scripts/3pl_unit_economics.py`** — Archetype A/B hybrid Path A/B/C scorer that automates the per-brand path-selection decision the operator currently does manually against the 3-path GMV-tier decision matrix. Gated on Asset 15 shipping first.
3. **Static dashboard `dashboards/3pl-migration-health.html`** — 1-click operator surface rendering per-path 3PL-selection readiness + per-3PL cost-stack + 4-phase migration-gate status + ship-cost-savings overlay. Gated on Script shipping first per the canonical layer order.
4. **Next.js operator-surface route `dashboard/app/3pl/page.tsx`** — Next.js route surfacing the framework as a 1-click per-3PL-selection decision tool + per-path migration-progress heat-map; the canonical 4th-layer follow-up.

**Recommended pick: (a) Asset 15 3PL-selection-card next** — it's the canonical research → playbook → asset canonical layer order follow-up (per the v0.8.0 reference); research/07 + this playbook ship the WHAT + HOW; Asset 15 ships the COPY (per-3PL 6-dimension × 7-vendor comparison card with 42 voice-driven override cells + 8-prereq RFQ template + 3-tier size-match decision matrix + 12 pitfalls with Fix lines + 5 verification gates). Skipping Asset 15 and going straight to Script produces a unit-economics scorer without operator-ready vendor-comparison copy, and the copy ships as orphan templates without the per-3PL per-dimension structure.

---

## Related

**Workspace research (read this playbook + these together for the full 3PL-migration picture):**
- `research/07-3pl-migration.md` — Move #12 (the canonical 11-section 3PL-migration synthesis: 5-pillar framework [Pillar 1 3PL size + scope matching / Pillar 2 cost-stack math + ROI / Pillar 3 WMS integration + migration recipe / Pillar 4 multi-warehouse + international fulfillment / Pillar 5 migration pitfalls + operational KPIs] + 3 GMV-tier paths [Path A SMB 500-2000 orders/mo ShipBob 3PL solo 6:1 ROI / Path B mid-market 2000-10000 orders/mo multi-warehouse 12:1 ROI DEFAULT / Path C enterprise 10000+ orders/mo multi-3PL orchestration 10:1 ROI] + 4 phase-by-phase verification gates [Gate A pre-migration 10 prereqs / Gate B migration+ramp 10 prereqs / Gate C steady-state 10 prereqs / Gate D multi-warehouse+international 9 prereqs] + 15 numbered pitfalls with Fix lines clustered into 5 failure modes [A 3PL-size-mismatch / B cost-stack-mismatch / C WMS-integration-mismatch / D SLA-mismatch / E migration-operational] + 8-metric operational KPI dashboard + $3M GMV Path B Year-1 cost stack $99k/yr vs $141k Year-1 incremental net median = 1.4:1 ROI; compounds 18 playbooks + 14 assets + 15 scripts + 4 dashboards + 7 prior research docs by documenting the 3PL-migration layer the US-centric Shopify-DTC stack implicitly assumes doesn't exist)
- `research/04-international-expansion.md` — Move #11 (cross-border DTC framework; pairs with Path C international 3PL footpring in research/07 Pillar 4 for 2-3 day ship time to EU + UK + CA + AU + JP vs 5-10 day direct-from-US shipping = $500k-$5M Year-1 incremental cross-border revenue)
- `research/06-marketplace-expansion.md` — Move #13 (marketplace expansion; pairs with Path A + B + C via FBA + WFS + per-market 3PL for international; Amazon 56% of US product-searches per Jungle Scout 2024)
- `research/00-ecommerce-ops-landscape.md` — strategic landscape (lines 304-376 cover the 3PL decision matrix + pricing + multi-warehouse + FIFO best practices + lines 320-330: Major 3PLs and rough pricing)
- `research/01-tools-stack-comparison.md` — vendor matrix (lines 93-100 cover 3PL tool comparison: ShipBob + ShipMonk + Red Stag + Rakuten Super Logistics + Stord + Flowspace)

**Workspace playbooks (compounds with this 3PL-migration operator build):**
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6 (Triple Whale attribution; required to measure the NPS lift + ship-cost savings + ship-time improvement from 3PL migration; without it, the 3PL cost-savings are invisible)
- `playbooks/11-international-rollout.md` — Move #11 (cross-border DTC operator build; compounds Path C international 3PL footpring with per-market pricing + customs + duties + returns infrastructure)
- `playbooks/13-marketplace-launch.md` — Move #13 (marketplace expansion operator build; compounds Path A + B + C via FBA + WFS for marketplace fulfillment + per-market 3PL for international)
- `playbooks/05-migrate-to-klaviyo-postscript.md` — Move #5 (Klaviyo customer-notification webhook; required for 3PL shipment-event → Klaviyo transactional-event wiring per Phase 1 Step 1.8)

**Workspace scripts (compounds with the 3PL-migration operator build):**
- `scripts/international_market_fit.py` — Move #11 script (Archetype A/B hybrid Path A/B/C scorer; compounds with Path C international 3PL by automating the cross-border DTC path-selection decision)
- `scripts/lifecycle_flow_health_check.py` — Move #14 script (Archetype C/D-light hybrid 78 gate-flow audit; compounds with Path B + C by automating NPS-by-fulfillment-channel measurement)
- `scripts/attribution_cross_platform_rollup.py` — Move #6.8 script (cross-platform attribution drift unification; required to measure 3PL migration's impact on attribution signal)

---

## Sources (28 benchmarks + vendor documentation)

**ShipBob + ShipMonk + Red Stag 3PL benchmarks (8 sources):**
- [ShipBob: 3PL Pricing Guide 2024](https://www.shipbob.com/blog/3pl-pricing/) — canonical SMB 3PL pick-pack + storage + receiving pricing
- [ShipBob: Multi-Warehouse Guide 2024](https://www.shipbob.com/blog/multi-warehouse-fulfillment/) — canonical multi-warehouse 2-day-ship coverage
- [ShipBob: State of DTC Shipping 2024](https://www.shipbob.com/state-of-dtc-shipping/) — canonical 3PL break-even ($3-5M GMV / 2,000-5,000 orders/mo)
- [ShipMonk: DTC Fulfillment Benchmarks 2024](https://www.shipmonk.com/blog/dtc-fulfillment-benchmarks/) — canonical mid-market 3PL pick-pack + FDA-warehouse
- [ShipMonk: 3PL Pricing Guide 2024](https://www.shipmonk.com/3pl-pricing/) — canonical SMB + mid-market 3PL pricing
- [Red Stag Fulfillment: Large-Parcel Benchmarks 2024](https://www.redstagfulfillment.com/blog/large-parcel-fulfillment/) — canonical oversized + heavy 3PL benchmarks
- [Red Stag Fulfillment: 3PL Selection Guide 2024](https://www.redstagfulfillment.com/3pl-selection-guide/) — canonical 3PL-selection criteria
- [Shopify Fulfillment Network: 2-Day-Shipping Guide 2024](https://www.shopify.com/fulfillment-network) — canonical SFN 2-day-shipping SLA

**Stord + Flowspace + Extensiv multi-3PL orchestration (3 sources):**
- [Stord: Mid-Market Supply Chain 2024](https://www.stord.com/) — canonical enterprise 3PL orchestration
- [Flowspace: State of Fulfillment 2024](https://www.flowspace.com/state-of-fulfillment) — canonical omnichannel-fulfillment benchmarks
- [Extensiv: 3PL Orchestration Guide 2024](https://www.extensiv.com/) — canonical multi-3PL orchestrator

**WMS + multi-carrier + returns infrastructure (6 sources):**
- [ShipHero: 3PL Buyer Guide 2024](https://www.shiphero.com/) — canonical WMS comparison + Shopify-integrator
- [Ordoro: WMS Comparison 2024](https://www.ordoro.com/) — canonical multi-3PL WMS-integrator
- [Shippo: Multi-Carrier Rate API 2024](https://goshippo.com/) — canonical multi-carrier rate aggregator
- [EasyPost: Multi-Carrier Rate Benchmarks 2024](https://www.easypost.com/) — canonical multi-carrier rate API
- [Loop Returns: Global Returns Infrastructure 2024](https://www.loopreturns.com/) — canonical global returns infrastructure
- [Returnly: Returns Management 2024](https://www.returnly.com/) — canonical returns-management platform

**Rakuten Super Logistics + Multichannel Merchant + ShipBob SMB (3 sources):**
- [Rakuten Super Logistics: SMB 3PL Benchmarks 2024](https://www.rakutensl.com/) — canonical SMB 3PL benchmarks
- [Multichannel Merchant: 3PL Pitfalls 2024](https://multichannelmerchant.com/operations/3pl-pitfalls/) — canonical 3PL-migration-pitfall list
- [Multichannel Merchant: 3PL Selection Guide 2024](https://multichannelmerchant.com/operations/3pl-selection-guide/) — canonical 3PL-selection criteria + RFQ-template

**International 3PLs (5 sources):**
- [DHL eCommerce: EU + UK 3PL 2024](https://www.dhl.com/global-en/home/our-divisions/ecommerce.html) — canonical EU + UK 3PL
- [Canada Post: 3PL Fulfillment 2024](https://www.canadapost.ca/) — canonical CA 3PL
- [Australia Post: 3PL Fulfillment 2024](https://auspost.com.au/) — canonical AU 3PL
- [Sagawa: JP 3PL Fulfillment 2024](https://www.sagawa-exp.co.jp/english/) — canonical JP 3PL
- [Fulfilmentcrowd: EU 3PL Fulfillment 2024](https://www.fulfilmentcrowd.com/) — canonical EU 3PL alternative

**Operator consensus + industry roundups (3 sources):**
- [r/ecommerce: 3PL Migration Case Studies 2024](https://www.reddit.com/r/ecommerce/) — operator consensus on 3PL migration
- [r/FulfillmentByAmazon: 3PL Selection 2024](https://www.reddit.com/r/FulfillmentByAmazon/) — operator consensus on FBA vs 3PL
- [DTC Newsletter: 3PL Migration 2024](https://dtcnewsletter.com/) — operator-3PL-migration case studies
