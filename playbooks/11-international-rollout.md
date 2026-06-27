# Playbook 11 — International Rollout (Cross-Border DTC, 3-Phase Operator Build)

> **Why this move is the next-on-deck for every US-based DTC brand that just shipped Moves #1–#10.** Cross-border expansion is the **single highest-leverage growth lever** the workspace's US-centric stack implicitly defers. research/00 says a US DTC brand at $1M+ GMV can capture **30–150% Year-1 revenue lift** by adding CA + UK + EU + AU + JP markets; research/02's top-10 list is US-only and the "what this list is NOT" section explicitly calls out international expansion as a deferred move; research/03's 30-day plan stops at Move #10 (AI ad creative iteration). **This playbook is the paste-ready operator build** that maps the 5-pillar framework in `research/04-international-expansion.md` into a **3-phase, 6-phase-build rollout** over **6–12 months** with a **cost stack of $300–$2,500/mo + $5k–$25k one-time setup** and **Year-1 ROI of 8:1 to 62:1** depending on the brand's GMV tier (Path A micro / Path B small-mid / Path C mid-large).
>
> **Honest read.** International expansion is **not** for every brand. Pre-revenue brands (defer until $1M+ US GMV — international ops overhead is not amortized below this); single-product brands with US-only supply chains (e.g. US-only ingredients, US-only certifications); brands in regulated categories where market-by-market approval is required (CBD, supplements, alcohol, firearms, medical devices — these need category-specific regulatory expertise beyond this playbook's scope). For the rest, this playbook ships the operator build that **compounds the 16 US playbooks + 12 assets + 11 scripts by adding the international layer** that the US-centric stack implicitly assumes doesn't exist.
>
> **Companion artifacts.** `research/04-international-expansion.md` is the strategic framework (read this FIRST for context). The **3-phase rhythm** is: **Phase 1 (Months 1–2): Canada + UK** — lowest-friction English-language markets; Shopify Markets handles currency + duties; expected **15–40% revenue lift**. **Phase 2 (Months 3–5): EU + Australia** — EU requires IOSS + VAT MOSS + DE/FR/ES localization; AU is English-language low-friction; expected **30–80% revenue lift**. **Phase 3 (Months 6–12): Japan + Nordics + DACH** — highest-friction markets with strong local-competitor density + payment-method preferences (Konbini in JP, Klarna/AfterPay in DACH/Nordics); expected **50–150% revenue lift** at **2–4× the per-market ops cost** of Phase 1+2. **Default for this playbook: Path B (Shopify $1M–$10M GMV → Phase 1 + Phase 2 = 30–80% revenue lift on $5M US base)** — the canonical small-to-mid-DTC operator profile the workspace targets.

---

## Goal

In **6–12 months**, ship a working cross-border DTC rollout that gives the operator:

1. **Live cross-border storefront** — Shopify Markets activated with multi-currency display + per-market pricing + DDP (Delivered Duty Paid) duties + translated locale variants for **Phase 1 (CA + UK)** in **Month 1–2**, **Phase 2 (EU + AU)** in **Month 3–5**, and optionally **Phase 3 (JP + DACH + Nordics)** in **Month 6–12**.
2. **Tax + duty compliance** — IOSS registration for EU (≤€150 orders), UK VAT MOSS registration (≤£135 orders), AU GST registration (threshold A$75k), CA USMCA duty-free certification, and EU GDPR-compliant email capture with double opt-in.
3. **3PL cross-border fulfillment** — DDP (Delivered Duty Paid) shipping with all duties prepaid (the **25–40% CVR lift** vs DAP), free-shipping threshold strategy for international (typically $75–$125 vs US $50), 30-day return window with returnless-refund policy for sub-$30 orders.
4. **Localized payment methods** — Klarna + AfterPay in DACH/Nordics, iDEAL in NL, Bancontact in BE, Konbini in JP, Alipay in CN-expat, plus the existing Shopify Payments / Stripe / PayPal in all markets.
5. **Voice framework localization** — UK-English variant of the Default voice profile (currency, spelling, sizing, return-policy tone) + EU-localized Sustainable voice profile per the **EU Green Claims Directive 2026** (no "eco-friendly" / "carbon-neutral" without verifiable Scope 1+2+3 data) + per-market regulatory phrasing for cosmetics/food/supplements.
6. **Per-market ad campaigns** — Meta + Google + TikTok international audience targeting with per-market creative variants, Klaviyo per-locale flows with market-specific send-time optimization, Triple Whale per-market cohort-LTV measurement via research/04 Pillar 5.

**Out of scope:** Non-Shopify platforms (the playbook's path forks call out WooCommerce + BigCommerce + Magento at each phase, but the paste-ready steps assume Shopify); category-specific regulatory deep-dives (CBD, supplements, alcohol, firearms — defer to category-specific legal counsel); custom in-house localization engineering (defer until $10M+ GMV).

---

## Which path fits your brand

Pick one of three GMV-tier paths. The decision is driven by **current US GMV + category fit + supply-chain complexity**, not by ambition.

| Path | Brand profile | Recommended scope | Total cost stack | Expected Year-1 lift | Why this one |
|---|---|---|---|---|---|
| **A** | Shopify brand, <$500k US GMV | **CA only** (lowest-friction English-language market) | $300–$500/mo + $2k–$5k one-time | 10–25% lift on $500k US base | Phase 1 only — CA + Shopify Markets + Shopify Payments CA + CA-USMCA duty-free. Defer EU + AU until $1M+ GMV. |
| **B** | Shopify brand, $1M–$10M US GMV (default) | **Phase 1 (CA + UK) + Phase 2 (EU + AU)** = 4 markets over 5 months | $800–$1,500/mo + $8k–$15k one-time | **30–80% lift on $5M US base** | Default cross-border scope. CA + UK are English-language low-friction; EU + AU add IOSS/VAT/GST compliance + DE/FR/ES localization. Year-1 ROI 15:1 to 35:1. |
| **C** | Shopify brand, $10M–$50M US GMV | **All 7 markets (Phase 1 + Phase 2 + Phase 3)** = CA + UK + EU + AU + JP + DACH + Nordics over 12 months | $1,500–$2,500/mo + $15k–$25k one-time | 50–150% lift on $10M+ US base | Full cross-border build. Adds in-region 3PL (EU warehouse + JP warehouse), Klarna/AfterPay/Konbini payment methods, native-language voice profiles. Year-1 ROI 20:1 to 60:1. |

**Default for this playbook: Path B (Phase 1 + Phase 2 = CA + UK + EU + AU).** Switch to Path A if <$500k GMV (defer EU + AU), switch to Path C if >$10M GMV (add Phase 3).

**Decision rule of thumb:** if your monthly US paid-media spend is ≥$5k and you're on Shopify, the question is never "should I expand internationally?" — it's "which markets first?". If your US paid spend is <$5k/mo, ship US-only until $1M+ GMV; international ops overhead is not amortized below this.

---

## Prerequisites

All 12 must be true before starting Phase 1 / Step 1. Each row has the verification command or check.

| # | Prerequisite | Why it matters | Verification |
|---|---|---|---|
| 1 | You have a **live Shopify (or compatible) store** with at least 12 months of US order history + baseline unit economics (CAC, LTV, AOV, contribution margin) | International expansion needs a stable US baseline to measure lift against | Shopify → Analytics → Orders last 365d ≥ 365 (≥1/day baseline) |
| 2 | You have **admin access** to Shopify admin (Settings → Markets) + Meta Ads Manager + Google Ads + Klaviyo + your 3PL | Markets activation, currency config, and per-market ad campaigns need admin on all 6 platforms | Shopify → Settings → Users and permissions → role = "Owner"; Meta → Ad account access → role = "Admin"; Google → Tools → Access and security → "Admin"; Klaviyo → Account → Billing → plan ≥ Email; 3PL → portal access |
| 3 | Your **US contribution margin is ≥ 30%** | International expansion eats 5–15pp of contribution margin via duties + shipping subsidies + FX fees; a brand with <30% US contribution margin should defer until unit economics improve | Shopify → Analytics → Gross margin last 90d ≥ 30% |
| 4 | You have a **documented voice framework** (Asset 02 brand-voice) with at least Default + Luxury + Sustainable + Gen-Z + B2B voice profiles | International expansion needs UK-English + EU-localized variants of each voice profile; without a US baseline voice framework, you have nothing to localize | `assets/02-brand-voice.md` exists with ≥5 voice profiles |
| 5 | You have an **established retention stack** (Move #1 cart abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty) | These four flows are the international growth engine; a brand without them gets <30% of the international LTV upside. Each flow needs per-market localization | Klaviyo → Flows → ≥4 active flows (Cart Abandon + Welcome + Post-Purchase + Sunset); Postscript → Keywords → ≥3 active; Smile → Program → Live |
| 6 | You have **Triple Whale** (Move #6) shipped with Klaviyo + Meta + Google integrations + post-purchase survey firing | Triple Whale is the per-market attribution foundation; without it you can't measure international lift vs US baseline | `python3 scripts/triple_whale_attribution_check.py` → overall_passed: true; Triple Whale → Settings → Integrations → ≥3 platforms connected; survey response rate ≥15% |
| 7 | You have **≥4–8 hr/wk of operator time** during Phase 1 (lower after launch) + **$5k–$25k one-time setup budget** approved | Phase 1 is the highest-touch phase; ongoing ops is 2–4 hr/wk for monitoring | Confirmed in writing (Slack thread, Notion doc, or Loom from founder) |
| 8 | Your **product is cross-border-friendly** (not too heavy >2kg, not too fragile, not too regulated, AOV ≥$40 to absorb duties) | Heavy/fragile/regulated/AOV-too-low SKUs need category-specific fork; the canonical playbook assumes the default cross-border-friendly profile | SKU audit: ≥80% of revenue from SKUs ≤2kg + AOV ≥$40 + not on the regulated-category list (CBD, supplements, alcohol, firearms, medical devices) |
| 9 | You have **3PL cross-border rate quotes** from ≥2 providers (ShipBob, ShipMonk, DHL eCommerce, FedEx Cross-Border, or your existing US 3PL with cross-border capability) | Phase 1 needs the 3PL side ready before launch; rates determine free-shipping threshold + DDP vs DAP decision | Email confirmation from ≥2 3PLs with per-kg rates for CA + UK destinations |
| 10 | You have **EU IOSS registration** (or have applied for one) — required for EU orders ≤€150 | EU VAT compliance is non-negotiable; without IOSS, EU orders ≤€150 are stuck in customs or refused by customers | EU VAT Information Exchange System (VIES) → IOSS registration confirmed; or applied-for status with expected issue date |
| 11 | You have **UK VAT MOSS registration** (or have applied) — required for UK orders ≤£135 | UK is no longer in EU customs union post-Brexit; UK has its own VAT MOSS regime | UK HMRC → VAT MOSS registration confirmed; or applied-for status |
| 12 | You have **GDPR-compliant email capture** with double opt-in (Klaviyo EU-compliant template or equivalent) — required for EU email marketing | GDPR fines are up to €20M or 4% of global revenue; non-EU-compliant email capture is the single biggest legal exposure of cross-border DTC | Klaviyo → Account → Settings → Consent → Double Opt-In = enabled; EU GDPR-compliant signup form template deployed |

**Default for this playbook: Path B (Phase 1 + Phase 2).** All 12 prerequisites are met. Move to Phase 1 / Step 1.

---

## Phase 1 — Canada + UK (Months 1–2)

### Step 1.1 — Activate Shopify Markets (Day 1, ~2 hours)

**What this step does:** Activates Shopify Markets in your Shopify admin, configures the 2 markets (CA + UK), and turns on multi-currency display. This is the foundation; everything else builds on it.

**Sub-steps:**

1. **Shopify admin → Settings → Markets → Add market** → Add "Canada" and "United Kingdom".
2. **For each market, configure:**
   - **Currency**: CAD for CA, GBP for UK (Shopify Markets auto-handles the conversion if your base currency is USD).
   - **Country/region pricing**: Default to auto-converted from USD with a 5–15% premium to absorb duties + FX fees (research/04 Pillar 2: PPP pricing per market + round-number rule + 1.5–3.5% FX fee budget).
   - **Taxes**: Enable "Include duties and taxes in product price" (= DDP, the 25–40% CVR lift lever from research/04 Pillar 3).
   - **Shipping**: Set CA + UK free-shipping threshold at $75 (vs US $50) to absorb the cross-border shipping cost differential.
3. **Add Markets PRO** ($2,400/yr, required for DDP duties automation): Shopify admin → Settings → Markets → Markets Pro → Enable. This is the $2,400/yr line item that automates IOSS + UK VAT MOSS + duties calculation. Without it you must manually calculate duties per order.
4. **Test order:** Place a test order from a CA address (use a friend in CA, or a Shopify test-order tool) and verify: (a) prices display in CAD, (b) duties are included in the displayed price (= DDP), (c) shipping cost is calculated correctly, (d) the order confirmation email is in English (CA English by default).

**Decision points:**
- **CAD/GBP pricing premium:** Start at +5% and A/B test +10% and +15% over Phase 1's first 60 days. research/04 says 30–40% CVR penalty for "US prices currency-converted" — the premium is the inverse lever. Track CVR + AOV by market in Triple Whale → Cohorts → by Country.
- **DDP vs DAP:** DDP wins by 25–40% CVR lift (research/04 Pillar 3). The downside is that you absorb the duties cost; the upside is the customer doesn't get a "pay $X to release your package" surprise that 25–40% of customers refuse (per research/04 Pillar 3 footnote).

### Step 1.2 — Configure 3PL cross-border rates (Day 2–3, ~4 hours)

**What this step does:** Wires your 3PL's cross-border rate quotes into Shopify Shipping so the displayed shipping cost matches the actual cost the 3PL charges.

**Sub-steps:**

1. **Get rate quotes** from your 3PL for: (a) CA shipments from your US warehouse, (b) UK shipments from your US warehouse. Ask for both economy (7–14 day) and expedited (3–5 day) tiers.
2. **Shopify admin → Settings → Shipping and delivery → Add shipping zone** → Create "Canada" zone with the 3PL rates; create "United Kingdom" zone with the 3PL rates.
3. **Free-shipping threshold:** Set CA + UK free-shipping at $75 (vs US $50). This is the research/04 Pillar 4 lever — international customers expect free shipping above a threshold, but the threshold must be higher than US because cross-border shipping is more expensive.
4. **Test:** Place a test CA order with $50 cart → shipping is ~$15; place a test CA order with $100 cart → shipping is $0; verify the math is correct.

**Decision points:**
- **3PL choice:** If your US 3PL (ShipBob, ShipMonk) has cross-border capability, use them (simpler). If not, DHL eCommerce + FedEx Cross-Border are the canonical alternatives. Get ≥2 quotes.
- **Shipping speed:** Default to 7–14 day economy (matches US-to-CA cross-border expectations; Amazon Prime has trained customers to expect free 2-day, but that's a Phase 3+ optimization).

### Step 1.3 — IOSS + UK VAT MOSS registration (Day 3–7, mostly waiting)

**What this step does:** Registers your business with EU's IOSS (Import One-Stop Shop) for EU orders ≤€150 and UK's VAT MOSS for UK orders ≤£135. Without these, EU/UK orders ≤€150/≤£135 are stuck in customs or refused.

**Sub-steps:**

1. **IOSS registration:** Apply via the EU VAT Information Exchange System (VIES) portal at https://ec.europa.eu/taxation_customs/vies/. Required: VAT ID from your home country + EU-based intermediary (most IOSS agents charge €200–€500/yr for the intermediary role). **Timeline: 1–4 weeks for approval.**
2. **UK VAT MOSS registration:** Apply via UK HMRC at https://www.gov.uk/guidance/register-and-use-vat-moss. Required: UK VAT registration + UK-established business OR use a UK-based VAT MOSS agent. **Timeline: 1–4 weeks for approval.**
3. **Wire IOSS + VAT MOSS IDs into Shopify Markets PRO:** Shopify admin → Settings → Markets → Taxes → Add IOSS number + Add UK VAT MOSS number. Markets PRO uses these to auto-collect VAT at checkout for EU/UK orders.
4. **Test order:** Place a test EU order (use a friend's address in DE/FR) and verify: (a) VAT is included in the displayed price, (b) the IOSS number is on the customs declaration.

**Decision points:**
- **Use an IOSS intermediary or DIY?** Intermediary = €200–€500/yr but no EU-established business required. DIY = free but requires EU-established business (a subsidiary or a warehouse). For Path B ($1M–$10M GMV), the intermediary is the canonical choice.
- **Phase 1 doesn't actually need IOSS for CA + UK** — IOSS is for EU (Phase 2). But if you want to launch EU in Phase 2 without a gap, register IOSS in parallel during Phase 1's Day 3–7.

### Step 1.4 — Localize the Default voice profile to UK-English (Day 7–10, ~6 hours)

**What this step does:** Adapts the Asset 02 Default voice profile to UK-English for the UK market. This is research/04 Pillar 5 localization at the brand-voice level.

**Sub-steps:**

1. **Read Asset 02 (`assets/02-brand-voice.md`)** → extract the Default voice profile's tone + vocabulary + anti-patterns.
2. **Create `assets/02b-brand-voice-uk.md`** (the UK-English variant) with the following changes:
   - **Spelling:** color → colour, favorite → favourite, organization → organisation, etc. (research/04 Pillar 5 explicit UK-English adaptation).
   - **Currency references:** "$" → "£", USD prices → GBP prices.
   - **Sizing:** US sizes → UK sizes (if apparel; shoes are US→UK conversion e.g. US 9 → UK 8).
   - **Date format:** MM/DD/YYYY → DD/MM/YYYY.
   - **Tone:** US Default voice is "confident + plain + lightly irreverent"; UK Default voice is "confident + plain + lightly dry" (per research/04 Pillar 5: "Don't use American slang or humor that doesn't translate").
   - **Anti-patterns to remove:** "Fall" → "Autumn", "sneakers" → "trainers", "sweater" → "jumper", "shopping cart" → "basket".
3. **Wire into Klaviyo:** Klaviyo → Account → Settings → Locales → Add "English (United Kingdom)" → Map to your existing flows (cart abandon + welcome + post-purchase). Each flow now has 2 variants (US Default + UK Default).
4. **Wire into Shopify theme:** Shopify admin → Online Store → Themes → Customize → Languages → Add "English (United Kingdom)" → Translate theme strings (Shopify Translate & Adapt app handles ~80% of these automatically; manual review for the remaining 20%).

**Decision points:**
- **How much UK-English adaptation is enough?** research/04 says "Don't use American slang or humor that doesn't translate" — the adaptation is at the voice + spelling level, not a full rewrite. A UK customer reading your UK-English variant should not feel patronized.
- **CA English:** Canadian English is mostly the same as US English; no separate variant needed for CA. The only CA-specific changes are CAD pricing + French (QC) optional.

### Step 1.5 — Launch Phase 1 + monitor for 30 days (Day 10 → Day 40)

**What this step does:** Goes live with CA + UK markets and monitors the 7 verification gates (Phase 1 Gate A below) for 30 days.

**Sub-steps:**

1. **Launch:** Shopify Markets → CA + UK = Live. Publish a "Now shipping to Canada + UK" announcement on the home page + an email to your US list (Klaviyo segment "US customers" → exclude → remaining is non-US, send "we ship to your country now").
2. **Monitor for 30 days:** Triple Whale → Cohorts → by Country → verify CA + UK cohorts are appearing. Klaviyo → Flows → verify CA + UK variants are firing correctly. Shopify → Analytics → verify orders are coming from CA + UK.
3. **Run Phase 1 Gate A verification** (see "Verification gates" section below) at Day 30.
4. **Iterate:** If CVR in CA <US CVR by >30%, raise the CAD pricing premium from +5% to +10%. If UK CVR is <US CVR by >30%, re-review the UK-English voice localization. If DDP duties are eating >8% of AOV, renegotiate 3PL rates.

---

## Phase 2 — EU + Australia (Months 3–5)

### Step 2.1 — Activate EU + AU markets in Shopify Markets (Month 3, Day 1–3)

**Sub-steps:**

1. **Shopify admin → Settings → Markets → Add market** → Add "European Union" (single market covering all 27 EU countries) + "Australia".
2. **EU market configuration:**
   - **Currency:** EUR for EU. Use country-specific currency display (DE → EUR, FR → EUR, etc.) but single EU market.
   - **Country pricing:** EUR pricing = USD price × 1.1 (10% premium for FX + duties).
   - **Languages:** DE (German) + FR (French) + ES (Spanish) + IT (Italian) + NL (Dutch) as a starting set (research/04 Pillar 5: "DE/FR/ES minimum"; add IT + NL if GMV supports it).
3. **AU market configuration:**
   - **Currency:** AUD. AUD pricing = USD × 1.1 + 10% GST markup.
   - **Languages:** English (Australia).
   - **GST registration:** If AU revenue exceeds A$75k/yr, register for AU GST (https://www.ato.gov.au/). The Markets PRO plan includes AU GST automation.
4. **Free-shipping threshold:** Set EU at €75 (~$80) and AU at A$100 (~$67).
5. **Test orders:** Place test orders from DE + FR + AU addresses; verify prices display in correct currency, language is correct, duties are included (DDP).

### Step 2.2 — Wire translation + voice localization for EU (Month 3, Day 3–14)

**Sub-steps:**

1. **Install Shopify Translate & Adapt app** (free with Shopify Markets) → Auto-translates theme strings, product descriptions, and email templates into DE/FR/ES/IT/NL using machine translation (DeepL API).
2. **Manual review pass:** Native-speaker review for the top 20 products + all email templates + the checkout flow. Budget: $500–$2,000 per language for human translation review (use a service like Gengo, Translated.net, or a freelancer on Upwork).
3. **Create `assets/02c-brand-voice-eu-sustainable.md`** — the EU-localized Sustainable voice profile per **EU Green Claims Directive 2026** (effective March 2026). Key changes vs US Sustainable voice:
   - Remove "eco-friendly" / "carbon-neutral" / "sustainable" claims unless backed by verifiable Scope 1+2+3 data + third-party certification (B Corp, Climate Neutral, Fair Trade USA, GOTS).
   - Replace "we plant a tree for every order" with "we partner with [verifiable reforestation org] to fund [verifiable metric] per order".
   - Remove "non-toxic" / "chemical-free" claims (EU bans these unless backed by specific certification).
   - Add EU-specific regulatory phrasing (e.g. "REACH-compliant" for cosmetics, "OEKO-TEX Standard 100" for textiles, "EU Organic" for food).
4. **Klaviyo:** Add DE/FR/ES/IT/NL locale variants to all 4 active flows (cart abandon + welcome + post-purchase + sunset). Use per-market send-time optimization (DE = 10am CET, FR = 2pm CET, ES = 11am CET, etc.).

### Step 2.3 — Add Klarna + AfterPay payment methods (Month 3, Day 14–21)

**Sub-steps:**

1. **Shopify admin → Settings → Payments → Add payment method** → Activate Klarna (DE/NL/AT/SE/DK/FI/NO/GB) + AfterPay/Clearpay (DE/NL/AT/SE/DK/FI/NO/GB/AU/US).
2. **Configure:**
   - **Klarna:** Pay-in-3 (default for orders <€200), Pay-in-4 (US), Pay-later (DE/NL — invoice within 14 days). Klarna fee: 1.5–3.95% + €0.30 per transaction.
   - **AfterPay:** Pay-in-4 (default for orders <€200). AfterPay fee: 2.5–6% + €0.30 per transaction.
   - **Display:** Show "Buy now, pay later with Klarna" / "Buy now, pay later with AfterPay" on PDP + cart + checkout. Klarna's BNPL lift in DACH is 20–40% CVR; AfterPay's BNPL lift in AU is 30–50% CVR.
3. **Test:** Place a test DE order using Klarna Pay-in-3 → verify the BNPL widget shows on PDP + the order confirms via Klarna's API.

### Step 2.4 — Launch Phase 2 + monitor for 60 days (Month 3, Day 21 → Month 5, Day 21)

**Sub-steps:**

1. **Launch:** EU + AU markets = Live.
2. **Monitor for 60 days:** Triple Whale → Cohorts → by Country → verify EU + AU cohorts. Klaviyo → Flows → verify DE/FR/ES/IT/NL + AU-EN locale variants are firing. Klarna + AfterPay → merchant portal → verify transactions are processing.
3. **Run Phase 2 Gate B verification** at Day 60.
4. **Iterate:** If a specific EU country (e.g. DE) is over- or under-performing, adjust the per-country pricing premium. If a language variant has high unsubscribe rate, re-review the human translation.

---

## Phase 3 — Japan + DACH + Nordics (Months 6–12, optional for Path B; required for Path C)

### Step 3.1 — Activate JP + DACH + Nordics markets in Shopify Markets (Month 6, Day 1–3)

**Sub-steps:**

1. **Shopify admin → Settings → Markets → Add market** → Add "Japan" + "Germany/Austria/Switzerland" (DACH, deep within EU market) + "Nordics" (SE/DK/FI/NO/IS, also deep within EU market).
2. **JP market configuration:**
   - **Currency:** JPY. JPY pricing = USD × 150 (live FX) + 10% premium for FX + duties.
   - **Language:** Japanese (use Shopify Translate & Adapt + native-speaker review for top 20 products + checkout flow).
   - **Konbini payment:** Add Konbini (Japanese convenience-store payment) via Shopify Payments or a JP-specific payment processor (e.g. GMO Payment Gateway, SBPS). Konbini is the canonical JP payment method for cross-border DTC.
3. **DACH + Nordics configuration:**
   - DACH is already covered by the EU market + Klarna/AfterPay. The only Phase 3-specific addition is the localized voice profile for DE/AT/CH (formal German + EU Green Claims Directive compliance).
   - Nordics is covered by EU + Klarna. The Phase 3 addition is the localized voice for SV/DA/FI/NO (English-fluent Nordics, formal but warm tone).
4. **In-region 3PL:** For Path C, contract an EU warehouse (e.g. DHL eCommerce EU fulfillment in Leipzig + Rotterdam) + a JP warehouse (e.g. ShipBob Japan or a local 3PL like Sagawa). This is the $5k–$15k Path-C-only line item that makes Phase 3 viable (shipping from US to JP is 14–21 days; from JP warehouse to JP customer is 1–3 days).
5. **Free-shipping threshold:** Set JP at ¥5,000 (~$33), DACH at €75, Nordics at €75.

### Step 3.2 — Launch Phase 3 + monitor for 90 days (Month 6, Day 3 → Month 9, Day 3)

**Sub-steps:**

1. **Launch:** JP + DACH + Nordics markets = Live.
2. **Monitor for 90 days:** Triple Whale → Cohorts → by Country → verify JP + DACH + Nordics cohorts. Konbini payment processing. EU warehouse fulfillment SLA (1–3 day to EU customers).
3. **Run Phase 3 Gate C verification** at Day 90.

---

## Phase 4 — Steady-state international ops (Month 12+, ongoing)

Once all 7 markets (CA + UK + EU + AU + JP + DACH + Nordics) are live, the operator enters **steady-state international ops**. The 4 ongoing ops cadences:

1. **Weekly:** Triple Whale → Cohorts → by Country → review per-market CAC payback + LTV:CAC ratio. Alert thresholds: per-market CAC payback >US + 50% = investigate.
2. **Monthly:** Klaviyo → Flows → review per-locale flow performance. Alert: any locale with unsubscribe rate >2× US = re-review translation.
3. **Quarterly:** Re-baseline per-market pricing premium (CAD/USD + GBP/USD + EUR/USD + AUD/USD + JPY/USD). FX rates move 5–15% per quarter; stale pricing erodes margin.
4. **Annually:** Re-evaluate market expansion (BR + MX + IN + KR + SG are the canonical "next 5 markets" after the initial 7). Re-baseline the Phase 3 verification gates (per-market revenue >$50k/yr or exit).

---

## Metrics to track

Per-market dashboard (in Triple Whale → Cohorts → by Country, filtered by international markets only):

| Metric | Target (Phase 1 month 2) | Target (Phase 2 month 5) | Target (Phase 3 month 12) | Source |
|---|---|---|---|---|
| Per-market revenue (USD-equivalent) | CA + UK ≥5% of total | + EU + AU ≥15% of total | + JP + DACH + Nordics ≥25% of total | Triple Whale → Revenue → by Country |
| Per-market CVR vs US baseline | ≥70% of US CVR | ≥75% of US CVR | ≥80% of US CVR | Triple Whale → CVR → by Country |
| Per-market AOV vs US baseline | 90–110% of US AOV (FX-adjusted) | 90–110% | 90–110% | Triple Whale → AOV → by Country |
| Per-market CAC payback | ≤US CAC payback × 1.5 | ≤US × 1.3 | ≤US × 1.2 | Triple Whale → CAC Payback → by Country |
| Per-market LTV:CAC | ≥2.5:1 | ≥3:1 | ≥3.5:1 | Triple Whale → LTV:CAC → by Country |
| Per-locale email flow CVR | ≥US flow CVR × 0.7 | × 0.8 | × 0.9 | Klaviyo → Flows → per-locale |
| Per-locale email unsubscribe rate | ≤2× US rate | ≤1.5× | ≤1.2× | Klaviyo → Flows → per-locale |
| Per-market FX fee as % of revenue | ≤3.5% | ≤3.0% | ≤2.5% | Shopify Markets → FX fees |
| Per-market DDP duty cost as % of revenue | ≤8% | ≤7% | ≤6% | 3PL invoice → duties line |
| Klarna/AfterPay BNPL share of EU/AU orders | n/a (Phase 1) | ≥20% of EU/AU orders | ≥30% | Klarna/AfterPay merchant portal |
| Konbini share of JP orders | n/a | n/a | ≥15% of JP orders | GMO Payment Gateway / SBPS portal |
| GDPR-compliant email capture rate (EU) | n/a | ≥90% double opt-in | ≥92% | Klaviyo → Consent → EU |

**Target steady-state (Month 12+, Path B):** total international revenue = 20–30% of total brand revenue; per-market CAC payback ≤US + 30%; LTV:CAC ≥3:1.

---

## Common pitfalls

15 numbered pitfalls with corrective `Fix:` lines. Each maps to a specific failure mode from research/04 Pillar 1–5.

1. **Launching EU without IOSS.** Fix: Apply for IOSS in Phase 1 (Day 3–7) in parallel with CA + UK launch; don't wait until Phase 2.
2. **Using US prices currency-converted.** Fix: Apply the per-market pricing premium (CAD +5–15%, GBP +5–15%, EUR +10%, AUD +10%, JPY +10%) and A/B test in Phase 1's first 60 days.
3. **Not localizing voice for UK English.** Fix: Create `assets/02b-brand-voice-uk.md` per Step 1.4 in Phase 1.
4. **Forgetting UK is no longer in EU.** Fix: UK has its own VAT MOSS registration + customs regime; treat UK as a separate market, not an EU subset.
5. **Shipping from US with 14-day delivery to customers expecting Amazon Prime.** Fix: Set shipping expectations explicitly in PDP + checkout ("7–14 day delivery to CA/UK"); don't promise 2-day.
6. **Not setting up Klarna/AfterPay in DACH.** Fix: Wire Klarna + AfterPay in Step 2.3; DACH BNPL lift is 20–40% CVR.
7. **Charging duties on delivery (DAP) without warning.** Fix: Use DDP (duties included in displayed price); research/04 Pillar 3 says 25–40% CVR lift from DDP over DAP.
8. **Not budgeting for FX fees in the P&L.** Fix: Budget 1.5–3.5% of international revenue for FX fees; track per-market FX fee % monthly.
9. **Returning US-sized packaging internationally.** Fix: Audit packaging size for each market; use the smallest box that fits the product + minimize dimensional weight charges.
10. **Using US-only returns policy.** Fix: Localize returns policy per market (UK = 30-day return per Consumer Contracts Regulations; EU = 14-day right of withdrawal per Consumer Rights Directive; AU = 30-day per Australian Consumer Law; CA = 30-day per provincial regulations).
11. **Translating with Google Translate only.** Fix: Use DeepL API + native-speaker human review for top 20 products + all email templates + checkout flow; budget $500–$2,000 per language for human review.
12. **Not adapting Klaviyo flows to local time zones.** Fix: Per-locale send-time optimization (DE = 10am CET, FR = 2pm CET, ES = 11am CET, JP = 8pm JST, AU = 7pm AEST, etc.).
13. **Launching JP without Konbini payment.** Fix: Wire Konbini in Step 3.1; Konbini is the canonical JP payment method for cross-border DTC.
14. **Forgetting GDPR for EU email capture.** Fix: Enable Klaviyo double opt-in + GDPR-compliant signup form template; this is Prerequisite #12, non-negotiable.
15. **Scaling international before unit economics work in US.** Fix: US contribution margin ≥30% (Prerequisite #3); if <30%, defer international expansion until US unit economics improve.

---

## Verification gates

### Phase 1 Gate A (Day 30 after CA + UK launch)

| Gate | Criterion | Verification command |
|---|---|---|
| A1 | Markets activated | Shopify admin → Settings → Markets → CA + UK = Live |
| A2 | Multi-currency display working | Place test CA order → prices in CAD; test UK order → prices in GBP |
| A3 | DDP duties included | Test CA order → duties line on customs declaration = paid by Shopify; test UK order → same |
| A4 | 3PL cross-border rates configured | Place test orders at $50 + $100 → shipping cost matches 3PL invoice |
| A5 | UK VAT MOSS registered | UK HMRC → confirmation email + VAT MOSS number in Shopify Markets settings |
| A6 | UK-English voice variant live | Klaviyo → Locales → English (United Kingdom) = active; flows show UK + US variants |
| A7 | Per-market revenue tracking | Triple Whale → Cohorts → by Country → CA + UK cohorts appearing |
| A8 | CVR in CA + UK ≥70% of US CVR | Triple Whale → CVR → by Country (Day 1–30 cohort) |
| A9 | FX fee as % of revenue ≤3.5% | Shopify Markets → FX fees report |
| A10 | No major regressions on US flows | Klaviyo → US flows CVR NOT changed >±10% |

### Phase 2 Gate B (Day 60 after EU + AU launch)

| Gate | Criterion | Verification command |
|---|---|---|
| B1 | EU + AU markets activated | Shopify admin → Settings → Markets → EU + AU = Live |
| B2 | IOSS registered + auto-collecting EU VAT | EU VIES → IOSS number active; test EU order → VAT line on customs declaration |
| B3 | AU GST registered | ATO → GST registration active; test AU order → GST line on invoice |
| B4 | DE/FR/ES localization live | Klaviyo → Locales → German + French + Spanish = active |
| B5 | EU-localized Sustainable voice profile live | `assets/02c-brand-voice-eu-sustainable.md` exists + EU Green Claims Directive compliance verified |
| B6 | Klarna + AfterPay live | Place test DE order with Klarna Pay-in-3 → BNPL widget shows; order confirms |
| B7 | Per-market CVR EU ≥75% of US CVR | Triple Whale → CVR → by Country (Phase 2 Day 1–60 cohort) |
| B8 | GDPR-compliant email capture rate ≥90% | Klaviyo → Consent → EU double opt-in rate |
| B9 | No major regressions on Phase 1 markets | CA + UK CVR NOT regressed >±10% since Phase 2 launch |
| B10 | Per-market revenue EU + AU ≥10% of total | Triple Whale → Revenue → by Country |
| B11 | DDP duty cost ≤7% of EU + AU revenue | 3PL invoice → duties line |

### Phase 3 Gate C (Day 90 after JP + DACH + Nordics launch)

| Gate | Criterion | Verification command |
|---|---|---|
| C1 | JP + DACH + Nordics markets activated | Shopify admin → Settings → Markets → all 7 markets = Live |
| C2 | In-region 3PL live (Path C only) | Test JP order from JP warehouse → 1–3 day delivery confirmed |
| C3 | Konbini payment live | Place test JP order with Konbini → payment confirms at 7-Eleven |
| C4 | Japanese localization live | Klaviyo → Locales → Japanese = active |
| C5 | DACH + Nordics localized voice profiles live | `assets/02d-brand-voice-dach.md` + `assets/02e-brand-voice-nordics.md` exist |
| C6 | Per-market revenue international ≥20% of total | Triple Whale → Revenue → by Country |
| C7 | Per-market CAC payback ≤US + 50% | Triple Whale → CAC Payback → by Country |
| C8 | Per-market LTV:CAC ≥2.5:1 (Phase 3) | Triple Whale → LTV:CAC → by Country |
| C9 | Klarna/AfterPay BNPL share ≥20% of EU orders | Klarna/AfterPay merchant portal |
| C10 | Konbini share ≥10% of JP orders | GMO Payment Gateway / SBPS portal |

### Steady-state Gate D (Month 6+ ongoing)

| Gate | Criterion | Cadence |
|---|---|---|
| D1 | Per-market revenue international ≥25% of total | Monthly |
| D2 | Per-market CAC payback ≤US + 30% | Monthly |
| D3 | Per-market LTV:CAC ≥3:1 | Monthly |
| D4 | Per-locale email flow CVR ≥US × 0.9 | Monthly |
| D5 | Per-market FX fee ≤2.5% of revenue | Monthly |
| D6 | Per-market DDP duty cost ≤6% of revenue | Monthly |
| D7 | Klarna/AfterPay BNPL share ≥30% of EU/AU orders | Monthly |
| D8 | Konbini share ≥15% of JP orders | Monthly |
| D9 | No major regressions in any per-market metric | Monthly |

---

## Cost & ROI estimate

### Path B (default — Phase 1 + Phase 2 = 4 markets over 5 months)

| Cost line | One-time | Recurring | Notes |
|---|---|---|---|
| Shopify Markets PRO annual fee | $0 (included with Advanced plan) | $2,400/yr ($200/mo) | Required for DDP duties automation |
| Shopify Translate & Adapt app | $0 | $0 | Free with Markets |
| IOSS registration (via intermediary) | $0–$500 | $200–$500/yr | One-time setup + annual intermediary fee |
| UK VAT MOSS registration | $0 | $0 | UK gov.uk is free; agent fees vary |
| AU GST registration | $0 | $0 | ATO is free if registered directly |
| 3PL cross-border rate negotiation | $0–$500 | $200–$500/mo incremental | Vs US-only 3PL |
| Klarna + AfterPay transaction fees | $0 | 1.5–6% of EU/AU orders | Per-transaction fee |
| Human translation review (DE/FR/ES) | $1,500–$6,000 | $0 (one-time) | $500–$2,000 per language |
| UK-English voice adaptation | $500 (internal operator time) | $0 (one-time) | Per Step 1.4 |
| EU-Sustainable voice adaptation | $500 | $0 | Per Step 2.2 |
| Total one-time | **$2,500–$7,500** | | |
| Total recurring (monthly) | | **$600–$1,200/mo** | Plus per-transaction fees |

**Expected Year-1 revenue lift:** $5M US base × 30–80% lift = **$1.5M–$4M incremental Year-1 international revenue** (Phase 1 contributes 15–40%, Phase 2 contributes 30–80%, conservatively assume 50% of full lift in Year 1).

**Year-1 ROI:** ($1.5M–$4M incremental revenue × 30% contribution margin = $450k–$1.2M incremental gross profit) ÷ ($2,500–$7,500 one-time + $600–$1,200/mo × 12 = $9,700–$22,000 total) = **20:1 to 60:1 conservative default ratio, 25:1 median** for Path B.

### Path A (Phase 1 only — CA only)

| Cost line | One-time | Recurring |
|---|---|---|
| Shopify Markets PRO | $0 | $200/mo |
| CA-USMCA certification | $0 | $0 |
| 3PL cross-border rate | $0 | $100–$200/mo incremental |
| Total one-time | **$500–$2,000** | |
| Total recurring | | **$300–$500/mo** |

**Expected Year-1 lift:** $500k US base × 10–25% lift = $50k–$125k incremental. **Year-1 ROI:** 15:1 to 40:1.

### Path C (all 7 markets over 12 months)

| Cost line | One-time | Recurring |
|---|---|---|
| All Path B costs | $2,500–$7,500 | $600–$1,200/mo |
| In-region 3PL EU warehouse | $5,000–$10,000 | $500–$1,000/mo |
| In-region 3PL JP warehouse | $5,000–$10,000 | $500–$1,000/mo |
| Konbini payment processor setup | $500 | 2–4% of JP orders |
| Japanese voice adaptation | $1,000 | $0 |
| DACH + Nordics voice adaptation | $1,000 | $0 |
| Native-language customer service (Phase 3+) | $0 | $500–$2,000/mo |
| Total one-time | **$15,000–$30,000** | |
| Total recurring | | **$1,500–$2,500/mo** |

**Expected Year-1 lift:** $10M+ US base × 50–150% lift = $5M–$15M incremental. **Year-1 ROI:** 30:1 to 100:1 conservative default.

**ROI table summary:**

| Path | One-time cost | Recurring | Year-1 lift (conservative) | Year-1 ROI |
|---|---|---|---|---|
| A (CA only) | $500–$2,000 | $300–$500/mo | 10–25% lift on $500k = $50k–$125k | 15:1 to 40:1 |
| **B (Phase 1+2, default)** | **$2,500–$7,500** | **$600–$1,200/mo** | **30–80% lift on $5M = $1.5M–$4M** | **20:1 to 60:1 (25:1 median)** |
| C (all 7 markets) | $15,000–$30,000 | $1,500–$2,500/mo | 50–150% lift on $10M = $5M–$15M | 30:1 to 100:1 |

---

## Companion tool: `triple_whale_attribution_check.py`

The Triple Whale attribution check (Move #6's companion script) is **the prerequisite for measuring per-market lift**. Without it, you can't distinguish "Phase 1 added 20% incremental revenue" from "Phase 1 cannibalized US revenue and net-zero'd." The script validates:

- Triple Whale pixel + post-purchase survey firing on every order (CA + UK + EU + AU markets)
- Klaviyo + Meta + Google receiving per-market attribution events
- Per-market cohort LTV is correctly computed (Triple Whale tracks per-country revenue automatically)

**Run weekly during Phase 1+2 to catch attribution drift before it costs you a quarter of bad per-market decisions:**

```bash
cd /data/workspace/ecommerce-ops
python3 scripts/triple_whale_attribution_check.py
# Expect: overall_passed: true + per-platform green
```

**Future-tick enhancement:** A per-market version of the attribution check (`scripts/international_attribution_check.py`) is a planned companion that splits the audit into CA / UK / EU / AU / JP / DACH / Nordics sub-reports. The current `triple_whale_attribution_check.py` is US-only but Triple Whale tracks per-country revenue automatically.

---

## Next moves after international Phase 2 (or Phase 3) is live

After Phase 1 + Phase 2 are live (Path B), the operator has 6 high-value follow-up moves:

1. **Path C upgrade (Phase 3) — Japan + DACH + Nordics.** Path C adds JP + DACH + Nordics markets in Months 6–12, requires in-region 3PL ($10k–$20k incremental), expected 50–150% lift on $10M+ base. The canonical follow-up if Path B succeeds and US GMV crosses $10M.
2. **In-region 3PL (EU warehouse + JP warehouse).** For Phase 3, EU warehouse in Leipzig + JP warehouse in Tokyo cut shipping time from 7–14 days to 1–3 days. This is the Phase 3 enabler.
3. **Native-language voice profiles.** DE/FR/ES/JP native-speaker voice profiles (vs the current translated-from-English machine-translation variants). Budget $5k–$15k per language.
4. **International Klaviyo segments.** Per-country segments with local-currency pricing + local-language copy + local-time send-time optimization. The current per-locale flows are good; per-country segments enable the next-tier personalization (e.g. local holidays like Singles' Day in CN, Black Friday in UK/EU vs US).
5. **Per-market affiliate programs.** Affiliate programs in EU + AU + JP need per-market commission rates + per-market cookie windows + per-market payment methods. The current Asset 10 framework is US-default; a per-market internationalization pass is the natural Phase 4 asset.
6. **Marketplace expansion (Amazon EU + Amazon AU + Rakuten JP).** Marketplace expansion is the natural Phase 5 after direct cross-border DTC is mature. research/02 §"what this list is NOT" mentions marketplace expansion as a deferred move; this playbook is the bridge.

---

## Related

**Workspace research:**
- `research/04-international-expansion.md` — the strategic framework (read this FIRST for context). 5 pillars + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 30-source bibliography + 25:1 Year-1 median ROI.
- `research/02-top-10-leverage-moves.md` — the prioritized US-only list (this playbook is the international extension).
- `research/03-30-day-rollout-plan.md` — the US-centric 30-day plan (this playbook compounds by adding Phase 4 at Month 6+ in the next revision of the rollout plan).
- `research/00-ecommerce-ops-landscape.md` — the strategic landscape (US-only; this playbook is the international extension).
- `research/01-tools-stack-comparison.md` — the vendor matrix (this playbook adds Shopify Markets + Zonos + TaxJar + Avalara + Klarna + AfterPay + Weglot + IOSS-registration references).

**Workspace playbooks (need per-market localization before international application):**
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1 (per-market send-time + per-locale flow variants).
- `playbooks/02-post-purchase-upsell-reconvert.md` — Move #2 (per-market pricing + per-market upsell catalog).
- `playbooks/03-checkout-audit-baymard.md` — Move #3 (per-market payment-method addition + per-market checkout flow audit).
- `playbooks/04-welcome-series-klaviyo.md` — Move #4 (per-market send-time + GDPR double opt-in + per-locale welcome series).
- `playbooks/05-migrate-to-klaviyo-postscript.md` — Move #5 (Klaviyo per-locale flows; Postscript per-country pricing).
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6 (per-market attribution quality via Triple Whale's per-country tracking).
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #7 (Postscript per-country SMS; UK/EU/AU require separate sender-ID registration).
- `playbooks/07-loyalty-program-smile.md` — Move #8 (Smile.io multi-currency; per-market points-earning rates).
- `playbooks/09-mobile-pdp-redesign.md` — Move #9 (mobile is 65–75% of international traffic vs 70% US; same redesign applies).
- `playbooks/09.5-pdp-ab-testing-program.md` — Move #9.5 (per-market test backlogs; UK/EU often diverge from US on PDP tests).
- `playbooks/10-ai-ad-creative-iteration.md` — Move #10 (per-market creative iteration; UK + EU often have distinct winning creative vs US).
- `playbooks/06.5-attribution-quality-audit.md` — Move #6.5 (per-market attribution quality; EU has stricter consent signals so match rates differ).
- `playbooks/06.6-tiktok-attribution-quality-audit.md` — Move #6.6 (TikTok has weaker EU presence; expand to per-market TikTok ads cautiously).
- `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` — Move #6.7 (Snap is US/UK heavy; Pinterest has stronger EU presence).
- `playbooks/06.8-cross-platform-attribution-drift-unification.md` — Move #6.8 (the drift rollup needs per-market thresholds; this is a future-tick enhancement).

**Workspace assets:**
- `assets/01-copy-templates.md` — Move #1's 8 Klaviyo+Postscript templates need per-locale variants.
- `assets/02-brand-voice.md` — Move #2's 5 voice profiles need UK-English + EU-localized variants (`assets/02b-brand-voice-uk.md` + `assets/02c-brand-voice-eu-sustainable.md` are the planned companions).
- `assets/04-promo-calendar.md` — Move #4's 12-month calendar needs per-market holiday adjustments (Black Friday UK vs US, Singles' Day CN, Boxing Day AU).
- `assets/05-retention-metrics.md` — Move #5's 12 retention metrics need per-market benchmarks (CA retention rates differ from US; UK/EU differ from CA).
- `assets/06-nps-survey-toolkit.md` — Move #6's NPS survey needs per-market template (UK English + EU-localized + JP-localized).
- `assets/07-competitive-teardown.md` — Move #7's 8-dimension competitive-benchmarking framework needs per-market competitor sourcing (CA competitors differ from US; UK/EU competitors are largely distinct).
- `assets/08-cs-response-library.md` — Move #8's 12 CS scenarios need per-market template variants (UK English + EU-localized + JP-localized).
- `assets/10-affiliate-program-playbook.md` — Move #10's affiliate framework needs per-market commission tiers + cookie windows + payment methods.

**Workspace scripts:**
- `scripts/triple_whale_attribution_check.py` — Move #6's companion (the prerequisite for per-market attribution quality).
- `scripts/attribution_quality_audit.py` — Move #6.5's companion (per-market version is a future-tick enhancement).
- `scripts/tiktok_attribution_audit.py` — Move #6.6's companion (per-market version is a future-tick enhancement).
- `scripts/snap_pinterest_attribution_audit.py` — Move #6.7's companion (per-market version is a future-tick enhancement).
- `scripts/attribution_cross_platform_rollup.py` — Move #6.8's companion (per-market drift thresholds are a future-tick enhancement).
- `scripts/international_market_fit.py` — **future-tick companion**: Archetype A/B hybrid scoring script that takes a brand's category + AOV + US contribution margin + supply-chain complexity → outputs Path A / Path B / Path C recommendation with expected revenue lift + cost stack.

**Dashboards:**
- `dashboards/unified-attribution-health.html` — Move #6.9 dashboard (needs a future-tick per-market tab).

**Future-tick companions (planned per research/04 §Related):**
- `assets/13-international-pricing-card.md` — per-market price-test templates + per-market voice override variants + per-market FX-fee calculator.
- `scripts/international_market_fit.py` + `scripts/tests/test_international_market_fit.py` — Archetype A/B hybrid scoring script (Path A / B / C recommender).
- `dashboards/international-expansion-health.html` — static HTML dashboard showing per-market launch readiness (Gate A/B/C status per market) + per-market revenue lift vs projection + per-market CAC payback.
- `dashboard/app/international/page.tsx` — Next.js route to render research/04 + this playbook as a navigable operator surface.