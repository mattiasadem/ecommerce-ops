# Playbook 13 — Marketplace Launch (Amazon + Walmart + Target Plus + EU Marketplaces Operator Build)

> **Move #13 from `research/03-30-day-rollout-plan.md`.** Operator build for the marketplace-expansion framework scoped in `research/06-marketplace-expansion.md`. The 30-day rollout plan ships Move #1 cart-abandon + Move #4 welcome + Move #7 SMS in 30 days and assumes the channel-stack is "done"; it's only the Shopify-native retention half. This playbook ships the **paste-ready Amazon Seller Central + Walmart Marketplace + Target Plus Roundel + EU marketplaces (Amazon EU + bol + Zalando + Cdiscount + Amazon JP) operator build** across 4 phases with the canonical 5 brand-canary-defense levers (Brand Registry + Vine + Buy Box >90% + Amazon DSP + Transparency) + the 5 attribution-merge stitches (Amazon Attribution + Triple Whale Marketplace Sync + post-purchase email + Amazon Customer Engagement + Walmart Connect). Compounds 17 shipped playbooks + 14 shipped assets + 15 shipped scripts + 4 shipped dashboards + 7 shipped research docs by giving the operator the step-by-step marketplace-launch sequence that captures the **$3M-$25M Year-1 revenue gap** beyond the US-centric Shopify-DTC stack (Amazon 56% of US product-searches per Jungle Scout 2024 + Walmart + Target Plus + EU marketplaces). This is the canonical 2nd-layer follow-up to `research/06-marketplace-expansion.md` per the research → playbook → asset → operator-surface → scripts → static-dashboard layer order.
>
> **Source data:** `research/06-marketplace-expansion.md` (the canonical synthesis doc this playbook implements — 5 pillars + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 numbered pitfalls + 8:1 default Year-1 ROI Path B), `research/00-ecommerce-ops-landscape.md` §3 (channel-stack), `research/01-tools-stack-comparison.md` §1 (Amazon + Walmart + Target Plus + Helium 10 + Jungle Scout vendor matrix), `research/03-30-day-rollout-plan.md` line 178 (Move #13 named as the #5-priority follow-up after Move #11 subscriptions + Move #12 3PL + Move #14 lifecycle marketing), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6's attribution substrate — required for Phase 2 attribution-merge), `playbooks/11-international-rollout.md` (Move #11's cross-border operator build — Phase 3 EU marketplaces overlap), `assets/13-international-pricing-card.md` (paste-ready 7-market × 5-voice per-market pricing card — required for EU marketplace pricing in Phase 3).
>
> **Companion artifacts (planned per the canonical layer order):** `assets/15-marketplace-listing-card.md` *(planned — does not yet exist; canonical operator-copy layer for the marketplace-expansion track)*. `scripts/marketplace_unit_economics.py` *(planned — does not yet exist; Archetype A/B hybrid Path A/B/C scorer; the canonical 3rd layer)*. `dashboards/marketplace-expansion-health.html` *(planned — does not yet exist; static HTML operator surface)*. `dashboard/app/marketplace/page.tsx` *(planned — does not yet exist; Next.js operator-surface route)*.
>
> **Time to ship per phase:** Phase 1 (Amazon-only) ~25 hours operator time over Weeks 1–4. Phase 2 (Amazon + Walmart) ~45 hours cumulative over Weeks 5–12. Phase 3 (international marketplaces) ~120 hours cumulative + 25 hr/wk ongoing over Weeks 13–24. Phase 4 (Target Plus + steady-state) ~150 hours cumulative + dedicated marketplace manager recommended. **The full 4-phase ladder is a 6–12 month arc, NOT a Week-1 sprint** — Phase 1 alone delivers 80% of the leverage; Phases 2–4 are quarterly-and-beyond expansion gated on Phase 1 reaching steady-state.

---

## Goal

Launch the operator's brand on Amazon + Walmart + Target Plus + EU marketplaces (Amazon EU + bol + Zalando + Cdiscount + Amazon JP) across 4 phases, with each phase shipping:

- **Reuses** the existing Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #6 Triple Whale + Move #8 loyalty + Move #11 international-rollout foundations as the prerequisites (Phase 1+2 requires Move #1 + #4 + #6 + #8; Phase 3 additionally requires Move #11 Phases 1+2 reached steady-state; Phase 4 requires Target Plus vendor application)
- **Adds** a marketplace launch sequence: USPTO trademark registration → Amazon Brand Registry → Amazon Seller Central 1P-vs-3P decision → FBA-inbound or FBM self-fulfillment → listing creation + A+ content → Amazon Sponsored Products/Brands/DSP launch → Buy Box ownership rules → Vine review acquisition → Walmart Marketplace enrollment → WFS fulfillment → Target Plus Roundel vendor application → EU marketplaces onboarding (Amazon EU 5-marketplaces + bol + Zalando + Cdiscount + Amazon JP) → attribution-merge setup (Amazon Attribution + Triple Whale Marketplace Sync + post-purchase email + Amazon Customer Engagement + Walmart Connect)
- **Protects** the brand's Shopify DTC-traffic from Amazon Halo DTC-cannibalization via the canonical 5 brand-canary-defense levers (Brand Registry + Vine review acquisition + Buy Box >90% ownership + Amazon DSP branded-keyword defense + Amazon Transparency per-unit-serial codes)
- **Merges** Amazon + Walmart attribution back into the Triple Whale cohort-LTV view (the canonical hard problem per Triple Whale + Amazon Attribution 2024) so the operator can measure Amazon-gain minus DTC-loss rather than over-crediting Amazon-attribution 30-50%
- **Captures** the 8:1 default Year-1 ROI Path B ($2.25M Year-1 incremental net revenue / $270k cost stack at $5M US GMV base per the research doc's Cost & ROI estimate)
- **Compounds** Move #6 Triple Whale (cohort-LTV substrate) + Move #8 loyalty (brand-canary-defense via tier-up post-purchase emails) + Move #1 cart-abandon (post-purchase email attribution recipe) + Move #4 welcome (brand-canary-defense "first-purchase-from-our-store" anchor) + Asset 13 (per-market voice-variant pricing for Phase 3 EU marketplaces) + Move #11 Phases 1+2 (CA + UK + EU + AU marketplaces, the canonical cross-border DTC substrate for Phase 3 EU marketplaces expansion)
- **Ships** in 4 phases over 6–12 months (Phase 1 = 25 hr Weeks 1–4, Phase 2 = +20 hr Weeks 5–12, Phase 3 = +75 hr Weeks 13–24, Phase 4 = +30 hr Quarter 2+) with cumulative ~150–200 hr operator time + 5–25 hr/wk ongoing

---

## Which marketplace-priority fits your store

The 4-phase ladder is structured by GMV-tier and gating prerequisites. **Pick the path that matches your GMV tier + operator time budget + brand-trademark readiness**:

| Path | GMV tier | Markets shipped | Operator time | Year-1 lift | Gating prereqs |
|---|---|---|---|---|---|
| **Path A — Amazon-only (Phase 1 only)** | $500k–$5M | US Amazon 3P+FBA | ~25 hr (Weeks 1–4) | +20–45% = $250k–$2.25M | Move #1 + #4 + #6 + #8 live + USPTO trademark registered + brand-hero SKU in marketplace-fit category + 25-hour operator block |
| **Path B — Amazon + Walmart (Phases 1+2) DEFAULT** | $1M–$10M | US Amazon 3P+FBA + US Walmart 3P+WFS | ~45 hr (Weeks 1–12) | +30–70% = $1.5M–$7M | Path A + Move #8 loyalty tier-up + Amazon Brand Registry enrolled + Buy Box >90% + Amazon DSP branded-keyword defense wired |
| **Path C — All marketplaces including international (Phases 1+2+3)** | $5M–$50M | US Amazon + US Walmart + Amazon EU 5 marketplaces + bol + Zalando + Cdiscount + Amazon JP | ~120 hr (Weeks 1–24) + 25 hr/wk ongoing | +40–100% = $3M–$25M | Path B + Move #11 Phases 1+2 reached steady-state (CA + UK + EU + AU on Shopify Markets) + EU compliance stack (CE + VAT-MOSS + EPR + GPSR effective Dec 2024) + dedicated marketplace manager |
| **Path D — All marketplaces + Target Plus (Phases 1+2+3+4)** | $10M–$50M | Path C + Target Plus 1P-via-Roundel + Walmart International CA + MX | ~150 hr (Weeks 1–Quarter 2+) + dedicated marketplace manager | +50–120% = $5M–$30M | Path C + Target Plus vendor application approved + Walmart International enrollment + dedicated marketplace manager |

**Default = Path B** for $1M–$10M GMV brands — captures 70% of available lift at 30% of operator time vs Path C, leaving Phase 3 + Phase 4 as quarterly-and-beyond expansion once the operator has run Phase 1+2 for 90+ days and measured the Amazon-Halo DTC-cannibalization rate.

---

## Prerequisites

### Universal prereqs (all paths)

- [ ] **Move #1 + Move #4 + Move #7 + Move #6 + Move #8 already shipped** — the 5 foundational flows + Triple Whale + Smile.io loyalty must be live and producing revenue before Phase 1 Amazon launch. Verify via Klaviyo → Analytics → Flows → confirm "Cart Abandon" + "Welcome Series" + Postscript "SMS Welcome" + Triple Whale dashboard shows ≥100 orders attributed + Smile.io dashboard shows ≥100 loyalty members. **Why this matters:** Amazon-Halo DTC-cannibalization bites hardest when the brand's Shopify DTC-audience is already at peak conversion efficiency; launching Amazon before the Shopify retention stack is stable means the operator loses 15-25% of DTC-traffic with no Shopify-side retention offset.
- [ ] **USPTO trademark registered** for the brand name (USPTO TEAS Plus or TEAS Standard, $250–$350 filing fee + 8–12 month examination). Amazon Brand Registry requires a registered trademark (not just a pending application); operators without a registered trademark should defer Phase 1 by 8–12 months OR file an expedited trademark (additional $1,000–$5,000 for Section 8 declaration of incontestability or Madrid Protocol international filing). Verify via USPTO TSDR → confirm "LIVE" status. **Why this matters:** without Amazon Brand Registry, the operator loses access to A+ content, Vine review acquisition, Brand Store, Sponsored Brands, and Amazon DSP — the canonical 4 of 5 brand-canary-defense levers. Operators without Brand Registry typically bleed 20-30% of DTC-traffic to Amazon per Marketplace Pulse 2024.
- [ ] **Brand-hero SKU in marketplace-fit category** — a single SKU that's already a top-3 revenue driver in the Shopify store, in a category Amazon allows (high-fit: apparel + home + beauty + pet + jewelry + consumer-electronics / medium-fit: food + vitamins + supplements + personal-care with FDA-compliance + lot-tracking / low-fit: CBD + alcohol + firearms + medical-devices with Amazon-regulatory-friction / fail: live-plants + aerosols + lithium-batteries-bulk with Amazon-FBA-prohibition). Verify category-fit against the canonical 4-tier category-fit matrix in research/06 §Pillar 4. **Why this matters:** launching a non-hero SKU on Amazon means the operator can't generate the Buy Box velocity needed for organic rank; hero SKUs already have proven conversion + review-velocity on Shopify.
- [ ] **FBA-inbound-readiness OR FBM self-fulfillment** — for FBA: an Inventory Performance Index (IPI) >400 (healthy), a 3PL prep service or in-house labeling/boxing capability, and 8-12 weeks of expected demand inventory on hand. For FBM: the operator's own shipping API integration with Amazon Seller Central (or a multi-channel fulfillment partner like ShipBob or Deliverr). **Why this matters:** Amazon's FBA-fee math ($3.06-$7.35/unit pick-pack by size tier + Q4 storage 3-5× off-peak) makes FBA uneconomical for slow-movers; FBM is the fallback for low-velocity SKUs.
- [ ] **Operator capacity: 25-hour one-time block for Phase 1** + **5-25 hr/wk ongoing** (Path B default). Phase 1 alone requires a dedicated block for Seller Central setup + Brand Registry application + listing creation + Amazon-ads launch — not a side project.
- [ ] **Amazon Seller Central account** — Individual ($0/mo, +$0.99/sale) or Professional ($39.99/mo, no per-sale fee). Professional recommended for any brand doing >40 sales/mo on Amazon. **Budget:** $39.99/mo Pro + referral fee 6-15% (category-dependent) + FBA pick-pack $3.06-$7.35/unit + FBA storage $0.83-$2.40/cubic ft/mo + advertising 10-25% of revenue.
- [ ] **Amazon Brand Registry enrolled** — free, requires USPTO trademark. Apply via brandregistry.amazon.com after trademark registration is LIVE. Approval: 1-2 weeks if no office-action. **Why this matters:** Brand Registry unlocks A+ content + Brand Store + Sponsored Brands + Amazon DSP + Transparency + Vine — the canonical brand-canary-defense stack.

### Path B prerequisites (default)

- [ ] **Path A Phase 1 ships + reaches 30-day steady-state** — Buy Box >90% ownership + Amazon Sponsored Products ROAS >2.0× + 50+ organic reviews on hero SKU + A+ content published + Brand Store published. Verify via Amazon Seller Central → Brand Analytics → Search Query Performance → confirm hero SKU ranks in top 3 for 5+ target keywords.
- [ ] **Move #8 loyalty tier-up post-purchase emails live** (Smile.io webhook → Klaviyo segment "Loyalty Tier-Up") — required for Phase 2 Step 2.5 brand-canary-defense "first-purchase-from-our-store" anchor (post-purchase loyalty tier-up email links back to Shopify store + Triple Whale cohort-LTV tag).
- [ ] **Amazon DSP branded-keyword defense budget** ($500-$2,000/mo minimum) — bids on operator's own brand-name keywords to prevent competitor poaching. Without Amazon DSP, competitors bid on the operator's brand-name keywords within 30 days of Amazon launch (per Marketplace Pulse 2024 benchmark).
- [ ] **Walmart Marketplace account** — apply via seller.walmart.com (typically 2-4 week approval). Required for Phase 2 Walmart launch.

### Path C prerequisites

- [ ] **Path B Phase 2 ships + reaches 60-day steady-state** — Amazon + Walmart Buy Box >90% on both + 200+ combined reviews + Amazon DSP branded-keyword defense reducing brand-search-impression-share to ≥40% in Amazon Ads dashboard + Walmart Sponsored Products ROAS >2.5×.
- [ ] **Move #11 Phases 1+2 (CA + UK + EU + AU) reached steady-state** on Shopify Markets — see `playbooks/11-international-rollout.md`. Required for Phase 3 EU marketplaces because the operator needs the Shopify Markets pricing + DDP/IOSS/UK-VAT-MOSS wiring as the substrate for cross-listing automation.
- [ ] **EU compliance stack** — CE marking $2k-$15k + VAT-MOSS $500-$2k setup + EPR $1k-$5k per country + GPSR Responsible-Person $1k-$5k/yr effective Dec 2024 = $10k-$30k one-time + $2k-$10k/yr recurring. Without CE + VAT-MOSS + EPR + GPSR, EU marketplaces reject the listing (Amazon EU + bol + Zalando + Cdiscount all require this stack per their 2024 seller-agreement updates).
- [ ] **Dedicated marketplace manager** (full-time or fractional consultant) — 25 hr/wk ongoing across 7+ marketplaces (US Amazon + US Walmart + Amazon EU 5 + bol + Zalando + Cdiscount + Amazon JP = 11+ marketplace accounts). Operators at this scale should hire per Klaviyo + Amazon 2024 best-practices.

### Path D prerequisites

- [ ] **Target Plus vendor application approved** — 1P-via-Roundel (Target's vendor-onboarding program for DTC brands). Application via retailroundel.com. Approval: 6-12 months + Target category-buyer relationship. Without Target Plus vendor approval, the operator cannot launch on Target.com as a 1P vendor (Target Plus only allows 1P-via-Roundel, not 3P like Amazon/Walmart).
- [ ] **Walmart International enrollment** (CA + MX) — separate application via seller.walmart.ca + seller.walmart.com.mx. Adds 2 more marketplaces to Phase 4.
- [ ] **Dedicated marketplace manager** — full-time or fractional consultant at 30+ hr/wk ongoing across 14+ marketplaces.

---

## Step-by-step — Phase 1 (Weeks 1–4, ~25 hours)

Phase 1 ships the **Amazon-only (US 3P + FBA) launch** with the 5 brand-canary-defense levers and the 5 attribution-merge stitches. This is the canonical minimum-viable marketplace launch; operators without Phase 1 should not proceed to Phase 2.

### Step 1.1 — USPTO trademark registration (Week 1, ~5 hours)

In USPTO TSDR (tmsearch.uspto.gov):

1. **Verify the brand name is registrable** — search the TESS database (basic word mark search) for the brand name + the international class relevant to the brand's products (Class 3 cosmetics, Class 14 jewelry, Class 25 apparel, Class 21 home goods, Class 28 toys, Class 35 retail-services, etc.). If any live registration exists in the same class, the operator must pick a different brand name OR prove non-likelihood-of-confusion with a US trademark attorney ($500-$2,000).
2. **File TEAS Plus or TEAS Standard** — TEAS Plus is $250/word-mark with strict requirements (must specify goods/services exactly per the pre-approved ID Manual, no free-form descriptions); TEAS Standard is $350/word-mark with flexible descriptions. **Recommended: TEAS Plus** if the brand's products fit the pre-approved ID Manual entries.
3. **Submit specimen of use** — a screenshot of the brand's Shopify product page showing the brand name in use (for §1(a) use-in-commerce basis; the operator must already be selling under the brand name in US commerce, not just intent-to-use). If the operator hasn't sold under the brand name yet, file §1(b) intent-to-use + later submit specimen of use + additional $100 fee.
4. **Wait 8–12 months for examination** — USPTO examining attorney reviews the application; ~30% receive office actions requiring response within 3 months (legal argument + amended goods/services description). **This is the canonical Phase 1 timeline bottleneck** — operators should file 8-12 months BEFORE the planned Amazon launch. Operators filing now for a planned launch in 8 months should accept the deferred-launch.
5. **Verify "LIVE" status in TSDR** — after registration certificate issues (typically 8-12 months from filing), verify the registration is LIVE in TSDR before applying to Amazon Brand Registry.

**Why this step is first:** Amazon Brand Registry requires a LIVE USPTO registration (or a pending application via the Amazon IP Accelerator, $1,000-$5,000 for accelerated filing). Operators without a registered trademark should defer Phase 1 by 8-12 months OR use Amazon IP Accelerator + accept the $1,000-$5,000 cost.

### Step 1.2 — Amazon Brand Registry enrollment (Week 1, ~2 hours)

In brandregistry.amazon.com:

1. **Sign in with Amazon Seller Central credentials** — Brand Registry is gated on a Professional Seller account. If the operator only has Individual, upgrade to Professional ($39.99/mo) before enrolling.
2. **Enroll the brand** — enter the registered trademark number + the trademark's country of origin + the goods/services class. Upload a copy of the trademark registration certificate. Amazon's verification team reviews the application; approval typically 1-2 weeks if no office-action.
3. **Verify access** — once approved, the operator has access to A+ content + Brand Store + Sponsored Brands + Amazon DSP + Transparency + Vine + Amazon Posts + Amazon Live. Verify via Seller Central → Brands → Brand Registry dashboard.
4. **Set up brand representative permissions** — if the operator has an agency or freelancer managing the Amazon account, add them as a brand representative (Settings → User Permissions → Brand Representative). The agency/fr freelancer needs Brand Registry access to publish A+ content and Brand Stores on the operator's behalf.

**Why this step is second:** Brand Registry unlocks 5 of 6 brand-canary-defense levers (Brand Registry + Vine + Buy Box >90% + Amazon DSP + Transparency all require Brand Registry). Without Brand Registry, the operator launches on Amazon without brand-canary-protection and bleeds 15-25% of DTC-traffic per Marketplace Pulse 2024.

### Step 1.3 — Amazon Seller Central 1P-vs-3P decision (Week 1, ~1 hour)

In Amazon Seller Central (sellercentral.amazon.com):

1. **Evaluate 1P (Amazon as the reseller) vs 3P (operator sells directly to Amazon customers)** — 1P: Amazon buys wholesale from the operator at a discount (typically 25-40% off MSRP), Amazon controls pricing + inventory + customer service. 3P: operator controls pricing + inventory + customer service, Amazon takes a referral fee (6-15% category-dependent) + per-unit closing fee ($0.30-$1.50). **Default for $500k-$5M GMV: 3P** (operator retains margin + pricing control). 1P recommended for $10M+ GMV brands with high SKU count + Amazon Vendor Central relationships already established.
2. **Open a Professional Seller account** if not already (Individual → Professional upgrade is $39.99/mo, takes 24 hours to activate). Professional sellers get access to Sponsored Products + Brand Store + A+ content + Brand Analytics.
3. **Set up shipping settings** — default to "Fulfilled by Amazon (FBA)" for hero SKU + "Fulfilled by Merchant (FBM)" for slow-movers (≤10 units/mo). Configure shipping templates per SKU (Seller Central → Settings → Shipping Settings → shipping templates).
4. **Set up tax settings** — Amazon Tax Engine is the default (Amazon handles sales tax collection + remittance in 45 US states). For multi-state nexus operators, verify the operator's existing sales tax engine (TaxJar, Avalara) is integrated via Seller Central → Settings → Tax Settings.
5. **Set up return settings** — default to "Amazon Return Center" for FBA (returns go to Amazon's facility + Amazon inspects + restocks or disposes per the FBA-grade-and-resell program). For FBM, the operator configures their own return address + return-shipping label policy.

**Why this step is third:** the 1P-vs-3P decision affects every subsequent step (FBA vs FBM fulfillment + Amazon-ads budget split + Buy-Box ownership rules + customer-service workload).

### Step 1.4 — FBA inbound creation + SKU labeling (Week 2, ~4 hours)

In Seller Central → Inventory → Manage FBA Inventory:

1. **Create FBA inbound shipment** — Seller Central → Inventory → Manage FBA Inventory → "Send to Amazon" → "Create new shipment plan". Enter the hero SKU ASIN (or create a new ASIN if launching a new SKU) + the quantity (8-12 weeks of expected demand = ~50-200 units for a hero SKU at $500k-$5M GMV) + the prep category (case-packed, poly-bagged, bubble-wrapped, etc.).
2. **Print SKU labels** — Seller Central generates FNSKU labels for each unit. The operator prints the labels + applies them to each unit (typically via a 3PL prep service like Amazon Prep Center, ShipBob FBA Prep, or in-house labeling for <100 units).
3. **Print carton labels** — Seller Central generates carton labels per shipping box. For multi-SKU shipments, each carton needs a unique label.
4. **Ship to the designated Amazon FBA fulfillment center** — Amazon assigns the fulfillment center based on the operator's region + the SKU's category. Ship via UPS / FedEx / USPS or via the Amazon Partnered Carrier program (discounted rates). **Timeline:** 2-4 weeks for Amazon to receive + check-in + stow the inventory.
5. **Verify inventory is "active" in Seller Central** — once Amazon check-in completes, the inventory becomes "active" + the listing becomes buyable. Verify via Seller Central → Inventory → Manage FBA Inventory → confirm "Active" status with quantity >0.

**Why this step is fourth:** FBA inventory must be active before Amazon Sponsored Products campaigns can launch (Amazon requires inventory availability for ad-eligibility). Operators without FBA-active inventory lose 2-4 weeks of organic rank while waiting for check-in.

### Step 1.5 — Listing creation + A+ content + Brand Store (Week 2, ~4 hours)

In Seller Central → Inventory → Manage Inventory → Edit listing:

1. **Title (≤200 chars)** — format: `[Brand Name] [Hero Product Descriptor] [Key Variant/Size] [Primary Keyword]`. Example: `Acme Coffee Co Premium Single-Origin Coffee Beans, Whole Bean, 12oz Bag, Dark Roast, Fair Trade Certified`. **Keyword stuffing guardrail:** include the primary keyword once + 2-3 secondary keywords; avoid repeating the same keyword 3+ times (Amazon A9 algorithm penalizes keyword stuffing + customers skim past the keyword).
2. **Bullet points (≤5 bullets, ≤500 chars each)** — feature 1 = primary benefit, feature 2 = quality/sourcing, feature 3 = use-case, feature 4 = sustainability/impact (if applicable per Asset 09 impact-reporting framework), feature 5 = brand-story. Each bullet should be scannable + benefit-driven (NOT just specs).
3. **Description (≤2000 chars)** — long-form brand story + use-case narrative + sustainability/impact credentials + cross-sell to related SKUs. Optional but recommended for hero SKUs (description ranks in A9 search + influences conversion rate).
4. **A+ content** — Seller Central → Advertising → A+ Content → "Create new A+ content". Upload 5-7 modules (hero image + comparison chart + lifestyle imagery + brand story + cross-sell grid + sustainability section + FAQ). A+ content lifts conversion 5-15% per Amazon 2024 benchmark. **Operator-copy reference:** Asset 15 (planned) ships the paste-ready per-voice per-marketplace title-template + bullet-point-template + A+ content skeleton.
5. **Brand Store** — Seller Central → Stores → "Create Store". Build a 3-5 page Brand Store (Home + Shop All + Category pages + Brand Story + Sustainability/Impact). Brand Store drives branded-search conversion + Sponsored Brands ad destinations.
6. **Backend keywords (≤250 bytes)** — Seller Central → Inventory → Edit listing → Keywords → "Search terms" field. Include 5-10 secondary keywords NOT in the title (e.g. "single origin" + "fair trade" + "shade grown" for the coffee example). Backend keywords do NOT affect customer-facing copy but DO affect A9 search ranking.

**Why this step is fifth:** A+ content + Brand Store lift conversion 5-15% per Amazon 2024 benchmark, which directly increases organic rank via A9 conversion-rate signal. Operators launching without A+ content typically rank in positions 50-100 for target keywords; operators with A+ content rank in positions 10-30 within 30 days.

### Step 1.6 — Amazon Sponsored Products + Sponsored Brands launch (Week 3, ~3 hours)

In Seller Central → Advertising → Campaign Manager:

1. **Sponsored Products — manual exact-match campaign** — create a campaign with $50/day budget targeting 10-20 exact-match keywords (hero SKU's primary keywords). Bid $0.50-$2.00 per click depending on category competition. Set the campaign duration to "continuous" + start with auto-targeting to harvest keyword data for the first 7 days, then switch to manual exact-match.
2. **Sponsored Products — auto campaign** — separate campaign with $20/day budget targeting all-match (close-match + loose-match + substitutes + complements). Use auto-targeting to discover high-converting keywords, then graduate the top 10-20 keywords into the manual exact-match campaign. Pause the auto campaign after 14 days.
3. **Sponsored Brands — keyword-targeted campaign** — requires Brand Registry. Create a campaign with $30/day budget targeting 5-10 brand-defense keywords (the operator's own brand-name + common misspellings + product category keywords). Bid $1.00-$3.00 per click. Sponsored Brands ads appear at the top of search results with the Brand Store as the destination.
4. **Daily budget allocation** — Sponsored Products $50/day + Sponsored Brands $30/day = $80/day = $2,400/mo at launch. **Reduce to $1,200-$1,800/mo after 30 days** once organic rank improves and ACoS drops.
5. **Set up conversion tracking** — Seller Central → Advertising → Measurement → "Brand metrics" → enable conversion tracking for ACoS + ROAS + conversion-rate reporting. Verify via Brand Analytics → Advertising Reports → confirm ≥100 impressions + ≥5 clicks per campaign in the first 7 days.

**Why this step is sixth:** Amazon Sponsored Products + Sponsored Brands are the canonical 2 of 5 attribution-merge stitches (Amazon Ads attribution + branded-keyword defense). Without Sponsored Products + Sponsored Brands, the operator has no Amazon-ads attribution data to feed into Triple Whale Marketplace Sync (the canonical 3rd stitch).

### Step 1.7 — Vine review acquisition (Week 3, ~1 hour + 30 days wait)

In Seller Central → Advertising → Vine:

1. **Enroll hero SKU in Vine** — requires Brand Registry. Vine is Amazon's invitation-only reviewer program; Amazon sends free product to Vine reviewers in exchange for an honest review. **Cost:** $200/SKU enrollment fee + free product cost (typically $20-$50 retail value per unit × 30 units = $600-$1,500 total). Vine typically yields 10-20 verified reviews per SKU within 30 days.
2. **Submit 30 units of hero SKU** — Amazon sends the units to 30 Vine reviewers. Vine reviewers are vetted Amazon shoppers with high review-quality track records (typically 90%+ are 4-5 star reviews).
3. **Wait 30 days for Vine reviews** — Vine reviews typically arrive within 14-30 days. Amazon verifies each Vine review + applies a "Vine Voice" badge. The reviews count toward organic rank (A9 review-velocity signal).

**Why this step is seventh:** Vine is the canonical 2nd of 5 brand-canary-defense levers (Vine + Brand Registry + Buy Box + Amazon DSP + Transparency). Vine reviews are weighted higher than organic reviews by A9; operators without Vine typically need 90-180 days to accumulate 50 organic reviews vs 30 days with Vine.

### Step 1.8 — Buy Box ownership rules + Amazon DSP branded-keyword defense (Week 4, ~3 hours)

In Seller Central → Inventory → Manage Inventory + Advertising → DSP:

1. **Set up Buy Box ownership** — Amazon's Buy Box is the default "Add to Cart" button on the listing page. Only one seller wins the Buy Box at a time (typically the lowest-price + best-metrics seller). For FBA sellers, FBA inventory automatically qualifies for Buy Box; FBM sellers need to compete on price + shipping speed + account health. **Verify Buy Box >90% ownership** via Seller Central → Inventory → Manage Inventory → "Buy Box" column. If Buy Box ownership is <90%, check the Account Health dashboard for issues (late shipment rate >4% + order defect rate >1% + policy violations all reduce Buy Box eligibility).
2. **Set up Amazon DSP branded-keyword defense** — Amazon DSP (Demand-Side Platform) is the programmatic-display + video ad platform for retargeting Amazon shoppers. Requires Brand Registry + a managed-service DSP account (Amazon DSP has a $35,000/mo minimum for self-service, but operators can use Amazon's managed-service DSP via agencies like Tinuiti + Perpetual Traffic + CPC Strategy for $500-$2,000/mo minimum). **Target:** the operator's own brand-name keywords + product-category keywords, bid $1.00-$5.00 CPM (cost-per-thousand impressions). Branded-keyword defense prevents competitors from poaching the operator's branded Amazon-search traffic.

**Why this step is eighth:** Buy Box ownership >90% + Amazon DSP branded-keyword defense are the canonical 3rd + 4th of 5 brand-canary-defense levers. Without Buy Box ownership, the operator's listing shows "Other Sellers on Amazon" instead of "Add to Cart" — losing 30-60% of conversion. Without Amazon DSP, competitors bid on the operator's brand-name keywords within 30 days of Amazon launch (per Marketplace Pulse 2024).

### Step 1.9 — Attribution-merge setup: Triple Whale Marketplace Sync + Amazon Attribution + post-purchase email (Week 4, ~2 hours)

In Triple Whale + Amazon Seller Central + Klaviyo:

1. **Triple Whale Marketplace Sync** — Triple Whale → Integrations → "Marketplace Sync" → connect Amazon Seller Central + Walmart Marketplace (when Phase 2 ships). Cost: $200-$500/mo Triple Whale Pro add-on. The integration stitches Amazon orders into Triple Whale's cohort-LTV view so the operator can measure Amazon-gain minus DTC-loss rather than over-crediting Amazon-attribution 30-50% (the canonical recipe-bias-toward-"Amazon-is-great" trap).
2. **Amazon Attribution** — free, via Amazon Ads console (advertising.amazon.com) → "Measurement" → "Amazon Attribution". Tag Sponsored Products + Sponsored Brands + DSP campaigns with Amazon Attribution tags; Amazon Attribution reports on conversions that happened on the operator's Shopify store after an Amazon-ad click (the canonical cross-channel attribution gap).
3. **Post-purchase email attribution** — Klaviyo segment "Marketplace Purchaser (last 30 days)" with flow trigger "Placed order where source = Amazon". Send post-purchase email thanking the customer + linking back to the operator's Shopify store + offering a 10% off second-purchase-from-our-store coupon (the canonical brand-canary-defense "first-purchase-from-our-store" anchor).
4. **Amazon Customer Engagement** — Amazon's owned email channel for re-engaging Amazon shoppers. Available via Seller Central → Brands → Customer Engagement. Free; Amazon sends the email on the operator's behalf. Use for post-purchase brand-story + cross-sell to related SKUs + loyalty-program signup.
5. **Verify attribution-merge is firing** — Triple Whale → Cohorts → confirm Amazon orders show up with cohort LTV tags; Klaviyo → Analytics → confirm "Marketplace Purchaser (last 30 days)" segment has ≥10 subscribers.

**Why this step is ninth:** attribution-merge is the canonical hard problem (Triple Whale + Amazon Attribution 2024) — operators without the 3 attribution stitches **underestimate DTC-cannibalization by 30-50%** and **over-credit Amazon-attribution by 30-50%** (the structural recipe bias toward "Amazon is great"). Without attribution-merge, the operator cannot tell if Amazon-gain minus DTC-loss is positive.

---

## Step-by-step — Phase 2 (Weeks 5–12, ~20 hours cumulative)

Phase 2 adds **Walmart Marketplace** with the same 5 brand-canary-defense levers + Amazon DSP scaled to $2,000-$5,000/mo. Gated on Phase 1 reaching 30-day steady-state (Buy Box >90% + Amazon Sponsored Products ROAS >2.0× + 50+ organic reviews on hero SKU + A+ content published + Brand Store published).

### Step 2.1 — Walmart Marketplace enrollment (Week 5, ~3 hours)

In seller.walmart.com:

1. **Apply for Walmart Marketplace** — submit business information (US-based LLC or corporation, EIN, bank account, US shipping address, ≥90 days of e-commerce history OR $50k+ revenue) + product catalog (must be NEW SKU list, not Amazon SKUs — Walmart rejects listings that appear on Amazon to avoid duplicate-listing violations). **Approval:** 2-4 weeks; Walmart category-buyer reviews the catalog.
2. **Set up Walmart Seller Center** — onboarding wizard walks through: shipping templates (default 2-day shipping OR Walmart-fulfilled 2-day shipping) + return policy (default 30-day, free return shipping) + tax settings (Walmart handles sales tax in 45 states) + payment settings (deposit to US bank account bi-weekly).
3. **Create listings** — Walmart requires the operator to create NEW listings (not import from Amazon). Format: title (≤200 chars, similar to Amazon) + bullet points (≤5) + description (≤4,000 chars) + key features + image gallery (≥4 images per SKU).
4. **Walmart Restored program** — optional, enrolls the operator in Walmart's "Restored" refurbished-product category. Recommended for brands selling open-box + refurbished + clearance inventory.

**Why this step is first in Phase 2:** Walmart Marketplace enrollment is a 2-4 week approval timeline + Walmart requires NEW listings (not Amazon imports). Starting enrollment in Week 5 means Walmart launches by Week 9-12 in parallel with Amazon Phase 1 steady-state.

### Step 2.2 — WFS fulfillment setup (Week 6, ~3 hours)

In Seller Center → Shipping Settings:

1. **Apply for Walmart Fulfilled Services (WFS)** — separate from Walmart Marketplace enrollment; WFS is Walmart's fulfillment program (analogous to Amazon FBA). Apply via Seller Center → Shipping Settings → "Apply for WFS". Approval: 1-2 weeks. **Cost:** WFS fulfillment fee $3-$8/unit (category + size tier dependent) + storage fee $0.50-$1.50/cubic ft/mo.
2. **Create WFS inbound shipment** — print WFS shipping labels + carton labels + ship to the designated WFS fulfillment center. Timeline: 2-4 weeks for check-in.
3. **Set WFS shipping templates** — default to "2-day shipping" (WFS ships in 2 business days from the closest fulfillment center). 2-day shipping unlocks the "Walmart 2-day shipping" badge + the Buy Box (Walmart's Buy Box defaults to WFS sellers with 2-day shipping).

**Why this step is second:** WFS is required for Walmart Buy Box ownership + the "2-day shipping" badge. Walmart FBM sellers rarely win the Buy Box + lose 30-50% of conversion.

### Step 2.3 — Walmart Sponsored Products + Walmart Connect launch (Week 7, ~2 hours)

In Seller Center → Advertising:

1. **Walmart Sponsored Products — manual campaign** — $30/day budget targeting 10-20 exact-match keywords (hero SKU's primary keywords). Bid $0.30-$1.50 per click. Walmart Sponsored Products has lower CPC than Amazon (typically 50-70% lower CPC per CPC Strategy 2024 benchmark).
2. **Walmart Sponsored Products — auto campaign** — $15/day budget, all-match, harvest keyword data for 14 days, then graduate top keywords into the manual campaign.
3. **Walmart Connect** — Walmart's DSP + display + video ad platform (analogous to Amazon DSP). Requires a managed-service account via agencies like Walmart Connect (formerly Walmart Media Group) + Tinuiti + Perpetual Traffic. Budget: $500-$2,000/mo. Target: branded-keyword defense + product-category keywords.
4. **Verify conversion tracking** — Walmart Connect → Measurement → confirm conversion tracking is enabled + ACoS + ROAS reporting is firing. Verify via Seller Center → Analytics → confirm ≥100 impressions + ≥5 clicks per campaign in the first 7 days.

**Why this step is third:** Walmart Sponsored Products + Walmart Connect are the canonical 2 attribution-merge stitches for the Walmart side (Walmart Ads attribution + Walmart Connect retargeting). Operators without Walmart Sponsored Products have no Walmart-ads attribution data to feed into Triple Whale Marketplace Sync.

### Step 2.4 — Buy Box ownership + brand-canary-defense on Walmart (Week 8, ~2 hours)

In Seller Center → Account Health:

1. **Set up Buy Box ownership** — Walmart's Buy Box (analogous to Amazon's) is the default "Add to Cart" button. Only WFS sellers with 2-day shipping + Account Health >95% + competitive pricing win the Buy Box. Verify via Seller Center → Performance → Buy Box percentage.
2. **Set up Walmart brand registry** — Walmart has its own brand registry (separate from Amazon Brand Registry). Apply via brandcenter.walmart.com. Requires USPTO trademark + brand-website + Walmart Marketplace enrollment. Approval: 4-8 weeks.
3. **Set up Walmart brand-canary-defense** — once Walmart Brand Registry approved, access Walmart's Brand Store + Walmart Sponsored Brand placements. Branded-keyword defense follows the same pattern as Amazon DSP.

**Why this step is fourth:** Walmart Buy Box ownership + Brand Registry + branded-keyword defense are the Walmart-side analogs of the Amazon brand-canary-defense stack. Operators skipping Walmart brand-canary-defense typically bleed 10-20% of brand-search-traffic to Walmart competitors within 60 days.

### Step 2.5 — Attribution-merge Phase 2: Triple Whale Walmart sync + Walmart Connect attribution + post-purchase email (Week 8, ~2 hours)

In Triple Whale + Walmart Seller Center + Klaviyo:

1. **Triple Whale Walmart sync** — Triple Whale → Integrations → "Marketplace Sync" → add Walmart Marketplace. Same integration as Amazon; stitches Walmart orders into Triple Whale's cohort-LTV view.
2. **Walmart Connect attribution** — Walmart Connect → Measurement → enable conversion tracking for Sponsored Products + Walmart Connect campaigns. Reports on Walmart-ad-attributed conversions on Shopify store.
3. **Post-purchase email Phase 2** — extend the Klaviyo segment "Marketplace Purchaser (last 30 days)" with `OR source = Walmart`. Same brand-canary-defense "first-purchase-from-our-store" anchor.

**Why this step is fifth:** Phase 2 attribution-merge completes the 5-stitch attribution-merge pattern (Amazon Attribution + Triple Whale Marketplace Sync + post-purchase email + Amazon Customer Engagement + Walmart Connect). Operators without the 5 stitches **underestimate cross-marketplace DTC-cannibalization by 30-50%** and **over-credit Amazon+Walmart-attribution by 30-50%** combined.

### Step 2.6 — Phase 2 verification + steady-state monitoring (Weeks 9-12, ~8 hours)

In Seller Center + Triple Whale dashboard:

1. **Verify Phase 2 steady-state** — Amazon Buy Box >90% + Walmart Buy Box >85% (Walmart's Buy Box is more competitive than Amazon's, 85%+ is the canonical threshold) + Amazon Sponsored Products ROAS >2.0× + Walmart Sponsored Products ROAS >2.5× (Walmart CPC is lower, ROAS is typically higher) + 200+ combined Amazon+Walmart reviews on hero SKU + Amazon DSP branded-keyword defense reducing brand-search-impression-share to ≥40% in Amazon Ads dashboard + Triple Whale cohort-LTV shows Amazon+Walmart cohort as separate from Shopify-organic cohort with overlapping LTV signal.
2. **Set up weekly monitoring cadence** — Monday morning: review Amazon Brand Analytics + Walmart Seller Center analytics + Triple Whale cohort LTV + Klaviyo Marketplace Purchaser segment size. Time: ~1 hr/wk.

**Why this step is sixth:** Phase 2 reaches steady-state in 90 days; the operator should NOT proceed to Phase 3 until Amazon+Walmart combined Buy Box + ROAS + reviews + brand-canary-defense are all green. Operators rushing to Phase 3 typically compound marketplace-launch errors + cannot recover within the 6-12 month arc.

---

## Step-by-step — Phase 3 (Weeks 13–24, ~75 hours cumulative + 25 hr/wk ongoing)

Phase 3 adds **international marketplaces**: Amazon EU 5 marketplaces (DE + FR + IT + ES + NL) + bol (NL) + Zalando (EU) + Cdiscount (FR) + Amazon JP. Gated on Phase 2 reaching 60-day steady-state + Move #11 Phases 1+2 (CA + UK + EU + AU on Shopify Markets) reached steady-state + EU compliance stack (CE + VAT-MOSS + EPR + GPSR) + dedicated marketplace manager.

### Step 3.1 — Amazon EU 5-marketplaces enrollment (Weeks 13-16, ~15 hours)

In sellercentral.amazon.co.uk / .de / .fr / .it / .es / .nl:

1. **Apply for Amazon EU 5 marketplaces** — Amazon has separate Seller Central accounts for each EU country (UK + DE + FR + IT + ES + NL). Apply via sellercentral.amazon.co.uk → "Sell in [Country]" wizard. The operator's existing Amazon US Seller Central account serves as the substrate; EU enrollment adds EU marketplaces to the same operator account.
2. **EU compliance stack verification** — confirm CE marking + VAT-MOSS registration + EPR registration per country + GPSR Responsible-Person appointment. Amazon EU rejects listings without these per the 2024 seller-agreement update.
3. **Create EU listings** — translate title + bullet points + description + A+ content into the local language. Use a professional translator + local-market copywriter ($0.10-$0.20/word × ~500 words × 5 languages = $250-$1,000 per SKU). **Operator-copy reference:** Asset 15 (planned) ships the paste-ready per-voice per-marketplace title-template + bullet-point-template + A+ content skeleton for EU + JP marketplaces.
4. **Pan-European FBA** — enroll in Amazon's Pan-EU FBA program (Amazon distributes the operator's inventory across EU fulfillment centers automatically, charging per-storage + per-pick-pack fees). Pan-EU FBA unlocks Amazon Prime badge across EU marketplaces.

**Why this step is first in Phase 3:** Amazon EU 5 marketplaces are the largest EU-marketplace revenue channel (Amazon is the dominant marketplace in DE + FR + IT + ES + NL). Operators without Amazon EU 5 cannot capture the bulk of EU-marketplace demand.

### Step 3.2 — bol + Zalando + Cdiscount enrollment (Weeks 17-20, ~20 hours)

In partner.bol.com (bol NL) + partner.zalando.com (Zalando EU) + seller.cdiscount.com (Cdiscount FR):

1. **bol.com enrollment** — apply via partner.bol.com. Approval: 4-8 weeks. bol is the dominant NL marketplace. Cost: commission 5-15% category-dependent + shipping €3.95/unit + listing fee €0.05/SKU/month.
2. **Zalando Partner Program enrollment** — apply via partner.zalando.com. Zalando is fashion-focused (apparel + shoes + accessories); approval requires the operator to be in Zalando's approved-brand list (typically fashion brands with €1M+ annual revenue). Cost: commission 15-25% + fulfillment fees.
3. **Cdiscount Pro enrollment** — apply via seller.cdiscount.com. Cdiscount is FR's 2nd-largest marketplace (after Amazon FR). Cost: commission 5-15% + subscription €39.99/mo Pro seller.
4. **Cross-listing automation** — use a cross-listing tool (Sellbrite + Codisto + LitCommerce) to sync Amazon EU + bol + Zalando + Cdiscount listings from a single source-of-truth. Cost: $30-$100/mo. Saves 5-10 hrs/wk vs manual cross-listing.

**Why this step is second in Phase 3:** bol + Zalando + Cdiscount are the canonical "Amazon EU + the local marketplaces" combo. Operators launching only Amazon EU miss 20-30% of EU-marketplace demand that goes to local marketplaces.

### Step 3.3 — Amazon JP enrollment (Weeks 21-22, ~10 hours)

In sellercentral.amazon.co.jp:

1. **Apply for Amazon JP** — Japanese-language Seller Central. Apply via sellercentral.amazon.co.jp → "Sell on Amazon Japan" wizard. Approval: 2-4 weeks. Amazon JP is the dominant JP marketplace.
2. **JP listings** — translate title + bullet points + description + A+ content into Japanese (with cultural adaptation, not literal translation — JP shoppers expect keigo honorific language + emoji-friendly formatting + JIS-compliant character sets). Professional JP translator: $0.20-$0.30/word × ~500 words = $100-$150/SKU.
3. **JP FBA** — Amazon JP has separate FBA fulfillment centers in Japan. Pan-JP FBA distributes inventory across the operator's nearest JP fulfillment center.
4. **JP-specific compliance** — PSE mark for electrical products + Food Sanitation Act for food products + JP customs clearance for imported goods. Per-category compliance check via Amazon JP's "Restricted Products" list.

**Why this step is third in Phase 3:** Amazon JP is the canonical final Phase 3 marketplace. JP marketplace has different consumer behavior + cultural expectations + compliance requirements than EU marketplaces.

### Step 3.4 — EU compliance stack audit + GPSR renewal (Weeks 23-24, ~10 hours)

In-house + regulatory attorney:

1. **CE marking audit** — verify each hero SKU has a CE Declaration of Conformity + Technical Documentation + EU Authorised Representative appointment (for non-EU manufacturers). Cost: $500-$2,000/SKU one-time if not already CE-marked.
2. **VAT-MOSS registration** — verify VAT-MOSS registration in each EU country the operator sells in. Cost: $500-$2,000/yr per country.
3. **EPR registration** — verify Extended Producer Responsibility registration in each EU country + per-product-category. Cost: $1,000-$5,000/yr per country (FR + DE + ES + IT all require EPR per category).
4. **GPSR Responsible-Person** — appoint a GPSR Responsible-Person based in EU for each EU country. Cost: $1,000-$5,000/yr.

**Why this step is fourth in Phase 3:** EU compliance stack audit is the canonical "you can't ship without this" gate. Operators without CE + VAT-MOSS + EPR + GPSR face EU marketplace listing rejection + customs seizure + EU regulatory fines up to €4M per product per year.

---

## Step-by-step — Phase 4 (Quarter 2+, ~30 hours cumulative + dedicated marketplace manager)

Phase 4 adds **Target Plus 1P-via-Roundel** + **Walmart International CA + MX** + steady-state marketplace operations + cross-marketplace optimization. Gated on Phase 3 reaching 90-day steady-state + Target Plus vendor application approved (6-12 month approval timeline) + dedicated marketplace manager.

### Step 4.1 — Target Plus Roundel vendor application (Quarter 2, ~10 hours)

In retailroundel.com:

1. **Apply for Target Plus via Roundel** — Target Plus is Target's curated marketplace for DTC brands; 1P-via-Roundel means Target buys wholesale from the operator at a discount (40-55% off MSRP) and resells on Target.com. Application via retailroundel.com. Approval: 6-12 months + Target category-buyer relationship.
2. **Negotiate wholesale pricing + replenishment** — Target's wholesale pricing model requires 40-55% off MSRP + Target-managed inventory replenishment. Negotiate via Target's category buyer.
3. **Target-specific listings** — Target requires Target-formatted listings (different from Amazon + Walmart). Target's content team manages listing content; the operator provides product imagery + brand assets + sustainability credentials.
4. **Target 1P fulfillment** — Target manages fulfillment via Target's distribution centers; the operator ships bulk inventory to Target's designated DCs.

**Why this step is first in Phase 4:** Target Plus is the canonical "premium marketplace" addition. Target Plus generates 20-40% higher AOV than Amazon + Walmart but requires 40-55% wholesale discount + 6-12 month vendor-application approval. Not for every brand; recommended only for Path D ($10M+ GMV) brands.

### Step 4.2 — Walmart International CA + MX enrollment (Quarter 2+, ~10 hours)

In seller.walmart.ca + seller.walmart.com.mx:

1. **Apply for Walmart Canada** — apply via seller.walmart.ca. Approval: 2-4 weeks. Walmart Canada uses English + French bilingual listings.
2. **Apply for Walmart Mexico** — apply via seller.walmart.com.mx. Approval: 2-4 weeks. Walmart Mexico uses Spanish listings + requires RFC tax ID + Mexico-based fulfillment.
3. **Cross-border fulfillment** — Walmart CA typically ships from US fulfillment centers via UPS Standard; Walmart MX requires Mexico-based fulfillment (typically via a Mexican 3PL partner like Envíos Packful or Skydropx).

**Why this step is second in Phase 4:** Walmart International CA + MX are the canonical North-America expansion additions. Operators without NA-expansion typically capture only US-marketplace demand.

### Step 4.3 — Steady-state marketplace operations + cross-marketplace optimization (Quarter 2+ ongoing, ~10 hr/wk)

In-house + dedicated marketplace manager:

1. **Daily monitoring** — Amazon Brand Analytics + Walmart Seller Center + Triple Whale Marketplace Sync + Klaviyo Marketplace Purchaser segment size + Amazon DSP + Walmart Connect dashboards.
2. **Weekly review** — Phase 1+2+3+4 combined Buy Box ownership + ROAS + reviews + brand-canary-defense + Triple Whale cohort LTV.
3. **Monthly optimization** — Phase 1+2+3+4 listing optimization (title + bullet + A+ + Backend keywords + cross-listing); Amazon Sponsored Products + Walmart Sponsored Products budget reallocation; Amazon DSP + Walmart Connect retargeting list refresh; post-purchase email cohort LTV signal.
4. **Quarterly business review** — combined marketplace P&L (Amazon + Walmart + Amazon EU + bol + Zalando + Cdiscount + Amazon JP + Target Plus) vs DTC Shopify P&L; brand-canary-defense effectiveness; DTC-cannibalization-rate; ROI vs canonical Path B 8:1 default.

**Why this step is third in Phase 4:** Steady-state marketplace operations is the canonical "this is now a 14-marketplace operator business" requirement. Operators without dedicated marketplace management typically see Phase 1+2 performance decay within 90 days post-launch (per Marketplace Pulse 2024 + Perpetual Traffic 2024).

---

## Metrics to track

15 metrics across 4 categories (channel-economics + brand-canary-defense + operational-model + attribution-measurement):

| # | Metric | Target | Source | Cadence |
|---|---|---|---|---|
| 1 | Amazon Buy Box ownership % | ≥90% | Amazon Seller Central → Inventory | Daily |
| 2 | Walmart Buy Box ownership % | ≥85% | Walmart Seller Center → Performance | Daily |
| 3 | Amazon Sponsored Products ROAS | ≥2.0× at launch, ≥3.0× at steady-state | Amazon Ads → Campaign Manager | Daily |
| 4 | Walmart Sponsored Products ROAS | ≥2.5× at launch, ≥3.5× at steady-state | Walmart Connect → Campaign Manager | Daily |
| 5 | Amazon review velocity (reviews/month) | ≥30 reviews/month on hero SKU | Amazon Seller Central → Brand Analytics | Weekly |
| 6 | Walmart review velocity | ≥15 reviews/month on hero SKU | Walmart Seller Center → Reviews | Weekly |
| 7 | Amazon organic rank (top 5 keywords) | Top 10 within 60 days, Top 3 within 90 days | Amazon Brand Analytics → Search Query Performance | Weekly |
| 8 | Walmart organic rank (top 5 keywords) | Top 20 within 60 days, Top 10 within 90 days | Walmart Seller Center → Search Insights | Weekly |
| 9 | Brand-search-impression-share in Amazon DSP | ≥40% | Amazon Ads → Brand Metrics | Weekly |
| 10 | DTC-traffic-cannibalization-rate (Amazon-Halo effect) | ≤15% (acceptable) | Triple Whale → Cohort LTV → compare DTC-cohort vs Amazon-cohort | Monthly |
| 11 | Triple Whale cohort-LTV (Amazon cohort vs DTC cohort) | Amazon cohort LTV ≥50% of DTC cohort LTV | Triple Whale → Cohorts | Monthly |
| 12 | FBA aged-inventory-surcharge exposure | ≤5% of inventory >180 days | Amazon Seller Central → Inventory Age | Weekly |
| 13 | IPI score (Inventory Performance Index) | ≥400 (healthy) | Amazon Seller Central → Inventory Performance | Monthly |
| 14 | Path A/B/C year-1 incremental net revenue | Path B +30-70% at $5M GMV = $1.5M-$3.5M | Combined P&L (Amazon + Walmart + Shopify) | Monthly |
| 15 | EU compliance stack status | CE + VAT-MOSS + EPR + GPSR all LIVE | Internal compliance dashboard | Quarterly |

---

## Common pitfalls (15 entries with Fix lines clustered into 5 failure modes)

### Failure mode A — Channel-economics errors

1. **Launching Amazon without registered USPTO trademark** → Without a registered trademark, Amazon Brand Registry rejects the enrollment, the operator loses access to A+ content + Vine + Amazon DSP + Transparency + Brand Store + Sponsored Brands, and bleeds 15-25% of DTC-traffic per Marketplace Pulse 2024. **Fix:** file USPTO trademark 8-12 months before planned Amazon launch via TEAS Plus ($250) or TEAS Standard ($350). If the operator cannot wait 8-12 months, use Amazon IP Accelerator ($1,000-$5,000 for accelerated filing).
2. **Defaulting to Amazon 3P without evaluating 1P-vs-3P** → 3P works for most $500k-$5M GMV brands, but 1P is the canonical choice for $10M+ GMV brands with high SKU count + Amazon Vendor Central relationships. **Fix:** run the canonical 1P-vs-3P decision matrix (research/06 §Pillar 1). Default 3P for $500k-$5M GMV; consider 1P for $10M+ GMV with established Vendor Central relationships.
3. **Ignoring per-marketplace fee-stack math** → Amazon referral fee 6-15% + FBA pick-pack $3-$7/unit + FBA storage $0.83-$2.40/cubic ft/mo + advertising 10-25% + returns 5-15% = 50-65% total Amazon take-rate. **Fix:** pre-compute per-SKU Amazon contribution margin in research/06 §Pillar 1. If per-SKU Amazon contribution margin is <30%, defer Amazon launch OR raise price +5-10% to recover margin.

### Failure mode B — Brand-canary-protection errors

4. **Skipping Vine review acquisition** → Without Vine, operators need 90-180 days to accumulate 50 organic reviews vs 30 days with Vine. Slow review velocity = slow organic rank = slow revenue ramp. **Fix:** enroll hero SKU in Vine ($200/SKU + $600-$1,500 product cost) immediately after Brand Registry approval. Vine typically yields 10-20 verified reviews within 30 days.
5. **Losing Buy Box by switching from FBA to FBM** → FBM sellers rarely win Buy Box vs FBA sellers. Losing Buy Box = losing 30-60% of conversion. **Fix:** keep hero SKU on FBA + use FBM only for slow-movers (≤10 units/mo). If FBA is uneconomical for slow-movers, accept low velocity + focus advertising on hero SKU (FBA) instead.
6. **Skipping Amazon DSP branded-keyword defense** → Competitors bid on the operator's brand-name keywords within 30 days of Amazon launch (per Marketplace Pulse 2024). Without DSP, the operator loses 10-20% of branded-search-traffic to competitors. **Fix:** allocate $500-$2,000/mo Amazon DSP budget to branded-keyword defense. Use managed-service DSP via agencies like Tinuiti + Perpetual Traffic + CPC Strategy if the operator cannot meet Amazon's $35,000/mo self-service DSP minimum.
7. **Amazon-Halo effect not measured** → Operators without Triple Whale Marketplace Sync + Amazon Attribution + post-purchase email attribution **underestimate DTC-cannibalization by 30-50%** and **over-credit Amazon-attribution by 30-50%** (the canonical recipe bias toward "Amazon is great"). **Fix:** ship the 3 attribution stitches in Phase 1 Step 1.9 + measure DTC-cannibalization-rate monthly + adjust Amazon-PPC bid strategy if DTC-cannibalization-rate exceeds 15%.
8. **Skipping Amazon Posts** → Amazon Posts is a free social-feed-style ad unit for Brand-Registered sellers. Posts lift brand awareness + drive branded-search-traffic. **Fix:** publish 3-5 Posts/week (image + caption + product-tag). Posts require Brand Registry + Amazon Posts app install. Free; takes ~30 min/wk operator time.

### Failure mode C — Operational-model errors

9. **Sending slow-movers to FBA** → FBA aged-inventory-surcharge >180 days costs $0.50-$2.50/unit + storage $0.83-$2.40/cubic ft/mo. Slow-movers on FBA lose $5-$15/unit/month. **Fix:** send only hero SKU + top-20% velocity SKUs to FBA. Send bottom-80% slow-movers to FBM + auto-deletion after 90 days if no sale.
10. **FBA inbound mishaps (labeling errors + carton errors + hazmat errors)** → Amazon rejects mislabeled + mis-cartonized + undeclared-hazmat shipments at the fulfillment center. Rejected shipments incur return-shipping fees ($0.50-$5/unit) + 2-4 week delays. **Fix:** use a 3PL prep service (Amazon Prep Center + ShipBob FBA Prep + Deliverr FBA Prep) for the first 3 shipments; in-house labeling only after 3+ successful shipments. Cost: $1-$3/unit prep fee.
11. **No returns management** → FBA returns go to Amazon's facility + Amazon inspects + restocks or disposes. Operators without a returns-management SOP lose 10-30% of returned-unit value. **Fix:** enroll in FBA Grade-and-Resell (Amazon inspects + relists as "Used - Like New" at 80% of original price) for hero SKU + high-velocity SKUs. Avoid for slow-movers + hazmat + personal-care items.

### Failure mode D — Regulatory-friction errors

12. **Launching EU marketplaces without CE + VAT-MOSS + EPR + GPSR** → Amazon EU + bol + Zalando + Cdiscount all reject listings without the EU compliance stack per the 2024 seller-agreement update. Operators without CE + VAT-MOSS + EPR + GPSR face EU marketplace listing rejection + customs seizure + EU regulatory fines up to €4M per product per year. **Fix:** complete the EU compliance stack audit in Phase 3 Step 3.4 BEFORE launching EU marketplaces. Budget: $10k-$30k one-time + $2k-$10k/yr recurring.
13. **Launching gated-category products without FDA-compliance + lot-tracking** → CBD + alcohol + firearms + medical-devices + vitamins + supplements + personal-care all require FDA-compliance + lot-tracking + age-verification on Amazon + Walmart + Target. Operators without FDA-compliance face listing rejection + Amazon suspension. **Fix:** consult a regulatory attorney ($500-$2,000/hr) + FDA-compliance specialist ($2,000-$10,000/SKU) BEFORE launching gated-category products.
14. **No per-country returns infrastructure for international marketplaces** → EU + UK + AU + JP customers expect free returns + local-language return labels + local-country return addresses. Operators without per-country returns infrastructure lose 20-40% of conversion on international marketplaces. **Fix:** set up per-country return addresses via a global returns partner (ReturnGO + Returnly + Loop Returns) + local-language return labels + per-country return-shipping policy.

### Failure mode E — Attribution-measurement errors

15. **No Triple Whale Marketplace Sync + Amazon Attribution + post-purchase email attribution** → Operators without the 3 attribution stitches cannot measure Amazon-gain minus DTC-loss + over-credit Amazon-attribution 30-50%. **Fix:** ship the 3 attribution stitches in Phase 1 Step 1.9 + add Walmart-side stitches in Phase 2 Step 2.5 + add Amazon EU + bol + Zalando + Cdiscount + Amazon JP stitches in Phase 3. Triple Whale Marketplace Sync stitches all marketplace orders into the cohort-LTV view + Amazon Attribution + Walmart Connect report on marketplace-ad-attributed conversions on Shopify store + post-purchase email captures first-party attribution data from marketplace customers.

---

## Verification (4 phase-by-phase gates with 11/10/10/9 prereqs respectively)

### Gate A — Phase 1 (Amazon-only) ready to launch (11 prereqs)

- [ ] A1: USPTO trademark registered + LIVE in TSDR
- [ ] A2: Amazon Brand Registry enrolled + approved
- [ ] A3: Amazon Seller Central Professional account active
- [ ] A4: 1P-vs-3P decision documented (3P default for $500k-$5M GMV)
- [ ] A5: FBA inbound shipment created + inventory active (≥50 units hero SKU)
- [ ] A6: Hero SKU listing complete (title + 5 bullets + description + A+ content + Brand Store + backend keywords)
- [ ] A7: Amazon Sponsored Products + Sponsored Brands campaigns launched (≥$50/day + ≥$30/day)
- [ ] A8: Vine review acquisition enrolled + 10-20 verified reviews received within 30 days
- [ ] A9: Buy Box ownership >90% verified in Seller Central
- [ ] A10: Amazon DSP branded-keyword defense wired ($500-$2,000/mo budget)
- [ ] A11: Triple Whale Marketplace Sync + Amazon Attribution + post-purchase email attribution firing (≥10 Amazon-attributed orders in Triple Whale cohort-LTV view within 30 days)

### Gate B — Phase 2 (Amazon + Walmart) ready to launch (10 prereqs)

- [ ] B1: Phase 1 Gate A all 11 prereqs green + Phase 1 reached 30-day steady-state
- [ ] B2: Walmart Marketplace account approved + active
- [ ] B3: WFS fulfillment setup complete + WFS inventory active (≥50 units hero SKU)
- [ ] B4: Walmart Sponsored Products + Walmart Connect campaigns launched (≥$30/day + ≥$15/day)
- [ ] B5: Walmart Buy Box ownership >85% verified
- [ ] B6: Walmart Brand Registry enrolled + branded-keyword defense wired ($500-$2,000/mo budget)
- [ ] B7: Triple Whale Walmart sync + Walmart Connect attribution + post-purchase email Phase 2 firing
- [ ] B8: Combined Amazon + Walmart Buy Box + ROAS + reviews verified (Amazon ROAS ≥2.0×, Walmart ROAS ≥2.5×, 200+ combined reviews)
- [ ] B9: Amazon DSP branded-keyword defense reducing brand-search-impression-share to ≥40%
- [ ] B10: Weekly monitoring cadence established (Monday morning review of Amazon Brand Analytics + Walmart Seller Center + Triple Whale + Klaviyo)

### Gate C — Phase 3 (international marketplaces) ready to launch (10 prereqs)

- [ ] C1: Phase 2 Gate B all 10 prereqs green + Phase 2 reached 60-day steady-state
- [ ] C2: Move #11 Phases 1+2 (CA + UK + EU + AU on Shopify Markets) reached steady-state
- [ ] C3: EU compliance stack complete (CE + VAT-MOSS + EPR + GPSR) — $10k-$30k one-time + $2k-$10k/yr
- [ ] C4: Amazon EU 5-marketplaces enrolled + listings created (translated title + bullets + description + A+ content per language)
- [ ] C5: Pan-European FBA enrolled + inventory distributed across EU fulfillment centers
- [ ] C6: bol + Zalando + Cdiscount enrolled + listings created + cross-listing automation wired
- [ ] C7: Amazon JP enrolled + listings translated + JP FBA setup
- [ ] C8: Cross-listing automation tool (Sellbrite + Codisto + LitCommerce) wired across Amazon EU + bol + Zalando + Cdiscount + Amazon JP
- [ ] C9: EU + JP compliance verified per category (PSE mark for electrical products + Food Sanitation Act for food products + JP customs clearance)
- [ ] C10: Dedicated marketplace manager hired (full-time or fractional consultant) — 25 hr/wk ongoing

### Gate D — Phase 4 (Target Plus + steady-state) ready to launch (9 prereqs)

- [ ] D1: Phase 3 Gate C all 10 prereqs green + Phase 3 reached 90-day steady-state
- [ ] D2: Target Plus vendor application approved (6-12 month approval timeline)
- [ ] D3: Target wholesale pricing negotiated (40-55% off MSRP + Target-managed inventory replenishment)
- [ ] D4: Target-specific listings created (Target content team manages + operator provides imagery + brand assets)
- [ ] D5: Target 1P fulfillment setup complete (bulk inventory shipped to Target DCs)
- [ ] D6: Walmart International CA + MX enrolled + listings created
- [ ] D7: Cross-border fulfillment wired for Walmart CA (US-based) + Walmart MX (Mexican 3PL)
- [ ] D8: Combined 14-marketplace P&L dashboard built (Amazon US + Amazon EU 5 + Walmart US + Walmart CA + Walmart MX + bol + Zalando + Cdiscount + Amazon JP + Target Plus)
- [ ] D9: Quarterly business review cadence established (combined marketplace P&L vs DTC Shopify P&L + brand-canary-defense effectiveness + DTC-cannibalization-rate + ROI vs canonical Path B 8:1 default)

---

## Cost & ROI estimate (default $5M US GMV brand, Path B scope)

Year-1 cost stack for Path B (Amazon + Walmart) at $5M US DTC GMV base:

| Cost line | Annual cost |
|---|---|
| Amazon Pro seller | $480/yr ($39.99/mo) |
| FBA pick+pack | $42,000/yr |
| FBA storage | $15,000/yr |
| Amazon Sponsored Products | $60,000/yr |
| Amazon Sponsored Brands | $15,000/yr |
| Amazon DSP | $15,000/yr |
| Amazon Vine (one-time) | $1,000 (one-time, year 1) |
| Walmart Marketplace | $0 (commission-only) |
| WFS pick+pack | $24,000/yr |
| WFS storage | $7,200/yr |
| Walmart Sponsored Products | $24,000/yr |
| Walmart Connect | $15,000/yr |
| Triple Whale Marketplace Sync | $4,200/yr |
| EU compliance stack (Phase 3 deferred) | $0 (Path B scope excludes EU) |
| Operator time (one-time 25hr Phase 1 + 20hr Phase 2 + ongoing 5-25 hr/wk) | $52,000/yr |
| **Total Year-1 cost stack** | **~$270,568 median** |

Year-1 incremental net revenue for Path B (Amazon + Walmart) at $5M US DTC GMV base:

- **Conservative:** +30% incremental net = $1.5M
- **Median:** +45% incremental net = $2.25M
- **Aggressive:** +70% incremental net = $3.5M

**Path B default Year-1 ROI = 8.3:1 median ($2.25M Year-1 incremental net / $270k cost = 8.3:1)** per `research/06-marketplace-expansion.md` §Cost & ROI estimate.

ROI ranges for each path tier:

- **Path A (Amazon-only, $500k-$5M US DTC GMV):** +20-45% incremental net = $100k-$2.25M Year-1; cost stack ~$155k/yr; ROI = 0.6:1 to 14.5:1; **8:1 default**
- **Path B (Amazon + Walmart, $1M-$10M US DTC GMV) DEFAULT:** +30-70% incremental net = $1.5M-$7M Year-1; cost stack ~$270k/yr; ROI = 5.5:1 to 26:1; **8.3:1 default**
- **Path C (all marketplaces including international, $5M-$50M US DTC GMV):** +40-100% incremental net = $3M-$25M Year-1; cost stack ~$540k/yr (Phase 3 adds EU + JP); ROI = 5.5:1 to 46:1; **10:1 default**
- **Path D (all marketplaces + Target Plus, $10M-$50M US DTC GMV):** +50-120% incremental net = $5M-$30M Year-1; cost stack ~$720k/yr (Phase 4 adds Target Plus + Walmart International); ROI = 6.9:1 to 41.6:1; **12:1 default**

---

## Companion tools

- **`scripts/marketplace_unit_economics.py`** *(planned — does not yet exist)* — Archetype A/B hybrid Path A/B/C scorer that takes US GMV + category + AOV + contribution margin + Amazon-fulfillment-mode (FBM vs FBA) + brand-registry-status → outputs Path A (Amazon-only) / Path B (Amazon + Walmart) / Path C (all marketplaces) / Path D (all + Target Plus) recommendation with cost stack + expected Year-1 incremental revenue + DTC-cannibalization-adjusted net lift + 6-step build sequence.
- **`dashboards/marketplace-expansion-health.html`** *(planned — does not yet exist)* — static HTML dashboard rendering the per-marketplace launch readiness + per-marketplace revenue contribution + 4-phase gate status + DTC-cannibalization overlay as a 1-click operator surface.
- **`dashboard/app/marketplace/page.tsx`** *(planned — does not yet exist)* — Next.js operator-surface route surfacing the framework as a 1-click per-marketplace launch readiness heat-map.

---

## Next moves

1. **Asset 15 marketplace-listing-card `assets/15-marketplace-listing-card.md`** *(the canonical next-layer follow-up per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order)* — paste-ready per-marketplace per-category listing card with title-template + bullet-point-template + A+ content skeleton + per-voice per-marketplace description variant + keyword-stuffing guardrail; compounds research/06 Pillar 1+2 + this playbook by shipping the operator-copy layer; gated on this playbook shipping first per the canonical layer order.
2. **Script `scripts/marketplace_unit_economics.py`** — Archetype A/B hybrid Path A/B/C/D scorer that automates the per-brand path-selection decision the operator currently does manually against the 4-path GMV-tier decision matrix; gated on Asset 15 shipping first.
3. **Static dashboard `dashboards/marketplace-expansion-health.html`** — 1-click operator surface rendering per-marketplace launch readiness + per-marketplace revenue contribution + 4-phase gate status + DTC-cannibalization overlay; gated on Script shipping first per the canonical layer order.
4. **Next.js operator-surface route `dashboard/app/marketplace/page.tsx`** — Next.js route surfacing the framework as a 1-click per-marketplace launch readiness heat-map; the canonical 4th-layer follow-up.
5. **Defer Move #11 (subscriptions) + Move #12 (3PL migration) operator-build playbooks** — research/00 + research/03 each touch them tangentially; the missing layer is the operator-build playbook for each (planned playbook 14 + 15), which will ship in subsequent ticks per the canonical research → playbook → asset layer order.

**Recommended pick: (a) Asset 15 marketplace-listing-card next** — it's the canonical research → playbook → asset canonical layer order follow-up (per the v0.8.0 reference); research/06 + this playbook ship the WHAT + HOW; Asset 15 ships the COPY (per-marketplace title-template + bullet-point-template + A+ content skeleton + per-voice per-marketplace description variant + keyword-stuffing guardrail). Skipping Asset 15 and going straight to Script produces a unit-economics scorer without operator-ready listing copy, and the copy ships as orphan templates without the per-voice per-marketplace structure.

---

## Related

- `research/06-marketplace-expansion.md` — strategic framework + 5 pillars + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 8:1 default Year-1 ROI
- `research/03-30-day-rollout-plan.md` line 178 — Move #13 named as the #5-priority follow-up
- `research/00-ecommerce-ops-landscape.md` §3 — channel-stack
- `research/01-tools-stack-comparison.md` §1 — Amazon + Walmart + Target Plus + Helium 10 + Jungle Scout vendor matrix
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6's attribution substrate (required for Phase 2 attribution-merge)
- `playbooks/07-loyalty-program-smile.md` — Move #8's Smile.io loyalty (required for Phase 2 brand-canary-defense "first-purchase-from-our-store" anchor)
- `playbooks/11-international-rollout.md` — Move #11's cross-border operator build (Phase 1+2 substrate for Phase 3 EU marketplaces)
- `assets/13-international-pricing-card.md` — paste-ready 7-market × 5-voice per-market pricing card (required for Phase 3 EU marketplace pricing)
- `assets/15-marketplace-listing-card.md` *(planned — does not yet exist)* — canonical operator-copy layer (Asset N+1 follow-up)
- `scripts/marketplace_unit_economics.py` *(planned — does not yet exist)* — Path A/B/C/D scorer (Script N+1 follow-up)
- `dashboards/marketplace-expansion-health.html` *(planned — does not yet exist)* — static dashboard operator surface
- `dashboard/app/marketplace/page.tsx` *(planned — does not yet exist)* — Next.js operator-surface route

---

## Sources (15 benchmarks + vendor documentation)

**Amazon Marketplace (8 sources):**
- Amazon Seller Central — FBA fee schedule 2024 (referenced for $3.06-$7.35/unit pick-pack by size tier)
- Amazon Brand Registry documentation 2024 (referenced for A+ content + Vine + Sponsored Brands + Amazon DSP + Transparency)
- Amazon Vine program documentation 2024 ($200/SKU enrollment + free product)
- Amazon DSP minimum spend + managed-service agency list 2024 ($35,000/mo self-service minimum)
- Amazon Attribution documentation 2024 (free cross-channel attribution)
- Amazon Customer Engagement documentation 2024 (free Amazon-owned email channel)
- Amazon Halo effect — Marketplace Pulse 2024 benchmark (10-35% DTC-traffic-cannibalization rate)
- Amazon 56% of US product-searches — Jungle Scout 2024 State of the Amazon Seller report

**Walmart + Target Plus (3 sources):**
- Walmart Seller Center fee schedule 2024 (referenced for WFS pick-pack + storage + commission)
- Walmart Connect documentation 2024 (managed-service DSP + display + video)
- Target Plus via Roundel vendor application 2024 (6-12 month approval + 40-55% wholesale discount)

**EU marketplaces + regulatory (3 sources):**
- Amazon EU documentation 2024 (5-marketplace enrollment + Pan-EU FBA)
- bol + Zalando + Cdiscount seller-agreement 2024 (commission + listing fees + cross-listing tools)
- EU compliance stack 2024 (CE marking + VAT-MOSS + EPR + GPSR effective Dec 2024 — fines up to €4M per product per year)

**Attribution + measurement + brand-canary (4 sources):**
- Triple Whale Marketplace Sync documentation 2024 ($200-$500/mo Pro add-on)
- Amazon Attribution documentation 2024 (free cross-channel attribution)
- Post-purchase email attribution via Klaviyo segment "Marketplace Purchaser (last 30 days)" — research/06 Pillar 5
- CPC Strategy 2024 + Tinuiti 2024 + Pattern 2024 + Perpetual Traffic 2024 benchmarks (Amazon Halo effect + brand-canary-defense best-practices + attribution-measurement pitfalls)

**Move #11 + #12 + #14 deferred-move cross-references (2 sources):**
- Move #11 subscriptions — Recharge + Skio + Bold Subscriptions benchmarks (research/03 line 176)
- Move #12 3PL migration — ShipBob + ShipMonk + Red Stag pricing matrix (research/00 §304-362)
- Move #14 lifecycle marketing — research/05 + playbook 12 + asset 14 + script + dashboard (all shipped 2026-06-27 per the canonical layer-order track)
