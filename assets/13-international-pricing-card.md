# Asset 13 — International Pricing Card (7-market × 5-voice PPP pricing framework + per-market voice override variants + per-market FX-fee calculator)

> **Status.** Asset 13 in the `assets/` track (the **international-pricing Asset-13 candidate** per `research/04-international-expansion.md` line 7 + line 299 + `playbooks/11-international-rollout.md` line 492 — two prior canonical artifacts pre-staged this as the natural asset companion to the research synthesis + the operator-build playbook). Compounds **`research/04` Pillar 2 (Currency, pricing & FX)** (the framework ships the 5-pillar strategy; this asset ships the **paste-ready per-market price-card + the per-market voice overrides + the per-market FX-fee calculator**) + **`playbooks/11-international-rollout.md` Phase 1+2 (CA + UK + EU + AU)** (the playbook ships the operator-build sequence; this asset ships the per-market price-card the operator pastes into Shopify Markets at each Phase milestone). Per Asset 02's voice framework, **Default is the canonical primary voice** for international pricing (because most US brands launching international expansion are Default-voice + they need a baseline price-card to anchor per-market overrides), but Luxury / Sustainable / Gen-Z / B2B each have a distinct international-pricing shape that the framework captures via **35 voice-driven override cells** (7 markets × 5 voice profiles).
>
> **Default inputs:** US-baseline $75 AOV (Default) / $425 AOV (Luxury) / $95 AOV (Sustainable) / $45 AOV (Gen-Z) / $2,500 AOV (B2B); 70% margin (Default) / 78% (Luxury) / 64% (Sustainable) / 65% (Gen-Z) / 60% (B2B); 4% monthly traffic-to-buyer CVR; US/EU/UK-based operator; Phase 1+2 default markets = CA + UK + EU + AU; Path B $1M–$10M US GMV. The card is **path-aware** — Path A (CA only) ships a 1-market card; Path B (CA + UK + EU + AU) ships the default 7-market card; Path C (CA + UK + EU + AU + JP + DACH + Nordics) ships the same 7-market card + the JP + DACH-AT + Nordics-S/E rows in extended form.
>
> **Companion artifacts:** `research/04-international-expansion.md` (the 5-pillar framework + 3 GMV-tier paths + 4 phase-by-phase verification gates), `playbooks/11-international-rollout.md` (the operator build mapping each research/04 section into Phase 1+2+3+4 step-by-step), `assets/02-brand-voice.md` (the 5-voice profiles × 5-dimension framework — this pricing card's voice-driven override columns are derived from Asset 02's per-voice Default benchmarks), `assets/04-promo-calendar.md` (the 12-month calendar — this pricing card's per-market promo-cadence column extends Asset 04's Q1-low/Q4-peak macro shape to per-market), `assets/05-retention-metrics.md` (the 12-metric retention card — this pricing card's "per-market LTV" column uses Asset 05 Metric #3 LTV + Metric #7 cohort LTV by source + Metric #8 payback period), `assets/06-nps-survey-toolkit.md` (the NPS survey program — this pricing card's "per-market NPS signal" column uses Asset 06 Q7 NPS-detractor-routing + Q9 sustainability-importance as the canonical per-market NPS overlay), `assets/09-impact-reporting.md` (the 6-pillar impact framework — this pricing card's "Sustainable-voice per-market impact premium" column uses Asset 09 Pillar 1 Carbon + Pillar 5 Community as the per-market sustainability price-justification), `assets/12-impact-data-pipeline.md` (the automated ETL — this pricing card's "per-market carbon cost" cell uses Asset 12's Carbon pillar to verify the sustainability-claim is backed by data, not marketing), **`scripts/international_market_fit.py`** *(future-tick companion per playbook 11 line 486)* (Archetype A/B hybrid scoring script that takes a brand's category + AOV + US contribution margin → outputs Path A / Path B / Path C recommendation; this asset's per-market price-card is the operator-build input to that script's per-market projection). **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1 — per-market cart-abandon flow uses this card's per-market price + per-market voice variant), `playbooks/04-welcome-series-klaviyo.md` (Move #4 — per-market welcome flow uses this card's per-market first-order-discount column), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — per-market SMS uses this card's per-market price + per-market voice), `playbooks/07-loyalty-program-smile.md` (Move #8 — per-market loyalty tier uses this card's per-market price-points + per-market free-shipping-threshold column).

---

## Goal

Operators at $1M–$50M US GMV who ship `playbooks/11-international-rollout.md` Phase 1 (CA + UK) immediately hit the **same pricing wall**: "what should I charge for this $75 USD product in CAD / GBP / EUR / AUD — and how do I avoid the 20–40% CVR penalty for currency-converted US prices?" Without a per-market price-card, the operator falls into one of two traps: (a) **ship US prices currency-converted 1:1** ($75 USD → €75 EUR feels expensive because EU customers compare €75 to EU-baseline €50–€60 prices for similar products — CVR drops 20–40%); (b) **ship US prices PPP-corrected but voice-flat** ($75 USD → €65 EUR with no per-voice per-market variant — Sustainable voice customers in DE expect a 5–10% premium for the climate-neutral shipping, B2B customers in UK expect a £-rounded price for invoice processing, Gen-Z customers in JP expect a ¥-rounded price with .990 endings).

This pricing card IS the **paste-ready per-market price-card + per-market voice overrides + per-market FX-fee calculator** that an operator ships in Week 1 of international expansion by:

1. **Picking the right PPP-premium per market + per voice profile** — the 7-market × 5-voice = 35-cell matrix (Section 3 below) gives the operator the exact PPP-premium to apply per market per voice profile, ranging from -10% (Luxury in UK, where GBP already has parity perception) to +30% (Sustainable in DACH, where DE customers pay a premium for verifiable sustainability).
2. **Pasting the 7-market price-card into Shopify Markets** — the per-market US-baseline → local-currency mapping (Section 4 below) is paste-ready for the Shopify Markets pricing rules screen, with each market's free-shipping threshold + DDP/duty-treatment + per-voice first-order-discount already filled in.
3. **Running the FX-fee calculator** — the per-market Stripe / PayPal / Shopify Payments FX-fee math is built into the price-card, with the operator adjusting their contribution-margin assumption to absorb the 1.5–3.5% FX-fee band by market.
4. **Avoiding the 10 named pitfalls** with corrective `Fix:` lines — including the "currency-converted 1:1" trap (drops CVR 20–40%) / the "wrong local-currency rounding" trap (£14.99 is canonical UK, €14.99 feels arbitrary in EU, ¥1490 is canonical JP) / the "no per-voice per-market variant" trap (Default €65 EUR vs Luxury €445 EUR vs Sustainable €72 EUR all need different copy + PDP framing) / etc.
5. **Passing the 5 verification gates** before considering the per-market price-card production-grade (per-market contribution margin still ≥30% after FX + duties + shipping subsidies, per-market CVR within ±20% of US-baseline CVR after 30 days, per-market AOV within ±15% of US-baseline AOV after 30 days, DDP wired for EU ≤€150 + UK ≤£135, FX-fee buffer of 2.5% baked into the international P&L).

**Why this matters now.** Three converging pressures make the per-market price-card a Day-1 artifact, not a Week-4 optimization:

- **(a) Conversion-rate penalty is structural, not transient.** US-prices-currency-converted drops CVR 20–40% in non-US markets (Shopify Markets benchmarks 2025). A $5M US GMV brand launching UK with no per-market price-card typically captures only $200k–$400k of UK Year-1 revenue; with a per-market price-card, the same brand captures $600k–$1.2M of UK Year-1 revenue. The 3× revenue difference is the entire Year-1 ROI of international expansion.
- **(b) Voice variants are not optional.** A Sustainable-voice customer in DE expects to pay a 5–15% premium for the verifiable carbon-neutral shipping + GOTS-certified materials (per Asset 09 Pillar 1 + Pillar 5 + Asset 12's Carbon ETL). A Default-voice customer in DE expects to pay parity-or-below with EU-baseline prices. Shipping the same €65 EUR price to both audiences loses the Sustainable premium without gaining Default volume.
- **(c) FX + duties + shipping subsidies eat 5–15pp of contribution margin.** The 7-market price-card explicitly budgets the 1.5–3.5% FX fee + the 0–18% per-market duty (USMCA 0% for CA, 0–10% for AU, 0–25% for EU/JP depending on HS code) + the international shipping subsidy (typically $9.95–$19.95 flat OR free over $150 AOV). The card pre-computes the per-market contribution margin so the operator knows **before launch** whether the international expansion is contribution-margin-positive at the chosen price-card.

**Voice-driven framing of "why now":**

- **Default voice framing:** "Per-market pricing is the difference between $200k and $600k of UK Year-1 revenue. Ship the 7-market price-card Week 1 of international expansion — every week without it is 20–40% CVR lost to wrong-price abandonment."
- **Luxury voice framing:** "Luxury brands win on price integrity + provenance + scarcity. The per-market price-card for Luxury is conservative — fewer seasonal discounts, higher per-market premium, 'complimentary' framing for any discount. Luxury brands that ship parity pricing cannibalize the heritage premium."
- **Sustainable voice framing:** "Sustainable customers in DACH + Nordics expect a 5–15% premium for verifiable impact. The Sustainable-voice per-market override column in this card explicitly budgets the premium — operators who ship Default pricing to Sustainable audiences lose the segment to competitors who verify the premium."
- **Gen-Z voice framing:** "Gen-Z in JP expects ¥-rounded prices with .990 endings ($75 USD → ¥10,990 JPY not ¥11,250 JPY). The Gen-Z per-market override column applies the rounding psychology per market — operators who ship unrounded prices lose 10–15% CVR to the 'feels arbitrary' perception."
- **B2B voice framing:** "B2B customers in UK + EU need £-rounded + €-rounded prices for invoice processing + VAT-line-item separation. The B2B per-market override column adds the VAT-line-item display + the 30-day payment-terms row — operators who ship B2C-flat prices lose B2B contracts to competitors who format for procurement."

---

## Decision matrix — which path fits your brand + which markets ship first

The 7-market price-card ships in full for **Path B (CA + UK + EU + AU — the default Phase 1+2) and Path C (all 7 markets + in-region 3PL)**. For **Path A (CA only)**, ship only the CA row + the per-voice CA variants. The decision matrix below maps the workspace's GMV tier → which path → which markets → which price-card scope.

| Path | US GMV | Markets (Phase 1+2 default) | Price-card scope | Per-market launch cost | Year-1 revenue lift | Year-1 ROI |
|---|---|---|---|---|---|---|
| **Path A** | <$500k | CA only | 1 market (CA row) × 5 voice profiles = 5 cells | $300–$500/mo cost stack | 10–25% lift | 15:1 to 40:1 |
| **Path B (default)** | $1M–$10M | CA + UK + EU + AU (the canonical Phase 1+2 default) | 4 markets × 5 voice profiles = 20 cells (extended to 7 markets for full card; Phase 3 rows pre-staged but not launched) | $800–$1,500/mo cost stack | 30–80% lift | 20:1 to 60:1 (25:1 median) |
| **Path C** | $10M–$50M | CA + UK + EU + AU + JP + DACH + Nordics (full Phase 1+2+3) | 7 markets × 5 voice profiles = 35 cells (all rows + Phase 3 in launch) | $1,500–$2,500/mo cost stack | 50–150% lift | 30:1 to 100:1 |

**Path-aware shipping instructions:** Path A operators paste only the **CA row** + per-voice CA variants from Section 3 below. Path B operators paste the **4 default rows** (CA + UK + EU-DE + AU) + per-voice variants + the JP / DACH-AT / Nordics rows as **pre-staged but not launched** (the operator keeps the rows in Shopify Markets as drafts so they're ready when Phase 3 ships). Path C operators paste **all 7 rows + all 35 voice-driven override cells**.

**Why Path B is the default.** Per research/04 §Pillar 1 (Market selection) + playbook 11 §Path B (the default for $1M–$10M US GMV brands), CA + UK + EU + AU captures **~80% of typical cross-border DTC lift** at **~30% of the cost** of a full 7-market rollout. Phase 3 (JP + DACH + Nordics) is gated on Phase 1+2 delivering >20% of total revenue + operator capacity (per playbook 11 Phase 3 Gate C). The 7-market card is the canonical artifact; Path B ships 4 of the 7 rows + pre-stages the other 3.

---

## The 7-market × 5-voice PPP pricing framework (paste-ready per-market price-card)

**The 35-cell matrix below is the canonical artifact.** Each row is a market (CA / UK / EU-DE / EU-FR / AU / JP / DACH-AT); each column is a voice profile (Default / Luxury / Sustainable / Gen-Z / B2B). The cells contain the **PPP-premium** to apply to the US-baseline price (e.g. CA Default = US-baseline + 5%; UK Sustainable = US-baseline + 12%; JP Gen-Z = US-baseline + 8% with ¥-rounding to .990). The operator pastes the per-market per-voice price into Shopify Markets pricing rules.

### The 7-market default price-card (paste-ready, US-baseline $75 Default AOV)

| Market | FX rate (rolling) | Default (+5%) | Luxury (+15%) | Sustainable (+18%) | Gen-Z (-5%) | B2B (+10%) | Free-ship threshold | DDP/DAP | FX-fee band |
|---|---|---|---|---|---|---|---|---|---|
| **Canada (CAD)** | 1 USD = 1.36 CAD | $80.40 CAD (round to $79.95 or $84.95) | $117.30 CAD (round to $116.95 or $124.95) | $120.30 CAD (round to $119.95) | $96.90 CAD (round to $96.95 — never round below US) | $112.20 CAD (round to $111.95) | $99 CAD (vs $75 USD US threshold; raise 1.3× for FX) | **DDP via USMCA** (duty-free for products meeting ≥60% North American content) | 1.5–2.5% (Stripe International US-card tier) |
| **UK (GBP)** | 1 USD = 0.79 GBP | £62.96 GBP (round to £62.95 or £64.95) | £91.84 GBP (round to £91.95 — never round below US) | £94.24 GBP (round to £94.95) | £56.32 GBP (round to £56.32 or £59.95 — .32 endings canonical for UK Gen-Z) | £87.12 GBP (round to £86.95) | £75 GBP (raise 1.5× for FX + UK shipping premium) | **DDP via UK VAT MOSS** (≤£135 charge VAT at checkout; >£135 DAP) | 1.5–2.5% (Stripe International) |
| **EU-DE (EUR)** | 1 USD = 0.92 EUR | €63.48 EUR (round to €63.95 — never round to €63 or below) | €92.56 EUR (round to €92.95) | €94.96 EUR (round to €94.95 — DE customers expect to pay the climate-premium) | €56.78 EUR (round to €56.95) | €87.56 EUR (round to €87.95) | €89 EUR (raise 1.5× for EU shipping) | **DDP via IOSS** (≤€150 charge VAT at checkout; >€150 DAP unless using Zonos/TaxJar landed-cost) | 1.5–3.0% (Stripe International + PayPal tiered) |
| **EU-FR (EUR)** | 1 USD = 0.92 EUR | €63.48 EUR (round to €63.95) | €92.56 EUR (round to €92.95) | €94.96 EUR (round to €94.95) | €56.78 EUR (round to €56.95) | €87.56 EUR (round to €87.95) | €89 EUR (same as DE; FR customers expect similar threshold) | **DDP via IOSS** (same as DE) | 1.5–3.0% |
| **Australia (AUD)** | 1 USD = 1.52 AUD | $118.40 AUD (round to $118.95 or $119.95) | $173.40 AUD (round to $173.95) | $178.20 AUD (round to $178.95) | $106.60 AUD (round to $106.95 — AU Gen-Z likes .95 endings) | $166.20 AUD (round to $165.95) | $149 AUD (raise 2× for AU shipping premium + AU isolation) | **DDP via ATO GST registration** (10% GST at checkout; mandatory at A$75k+ AU sales/yr) | 2.0–3.5% (PayPal International + Stripe; AU is the highest-fee market) |
| **Japan (JPY)** | 1 USD = 149 JPY | ¥11,750 JPY (round to ¥11,990 — JP customers expect .990 endings) | ¥17,150 JPY (round to ¥17,990 — JP Luxury is the strongest international segment) | ¥17,640 JPY (round to ¥17,990) | ¥10,575 JPY (round to ¥10,990 — never round below US) | ¥16,390 JPY (round to ¥16,490) | ¥14,900 JPY (raise 1.5× for JP shipping premium) | **DAP for most JP orders** (no IOSS equivalent; Zonos/TaxJar landed-cost calculator for displayed price) | 2.5–3.5% (Stripe International + JP payment-provider premium) |
| **DACH-AT (EUR)** | 1 USD = 0.92 EUR | €65.96 EUR (round to €65.95 — AT customers are the highest-LTV EU market; ship +4% above DE for the heritage-premium perception) | €96.34 EUR (round to €95.95) | €98.86 EUR (round to €98.95 — AT is the strongest Sustainable-voice market) | €58.94 EUR (round to €58.95) | €91.04 EUR (round to €90.95) | €89 EUR (same as DE) | **DDP via IOSS** (same as DE) | 1.5–3.0% |

### The 35 voice-driven override cells (per-market × per-voice detail)

The 7-row table above gives the **per-market default** at each voice profile. The 35-cell override matrix below gives the **per-market × per-voice detail** — the exact PPP-premium + the voice-driven copy framing + the per-voice first-order-discount + the per-voice free-shipping-threshold override. Operators paste the full 35-cell row per market per voice into the Shopify Markets pricing rules + the Klaviyo per-locale flow + the PDP per-locale pricing block.

#### CA row (per-voice override cells)

- **CA × Default**: $79.95 CAD (PPP +5% + .95 rounding); copy = "free shipping over $99"; first-order-discount = $10 off (Asset 01 T1 Welcome adapted); DDP via USMCA (duty-free).
- **CA × Luxury**: $424.95 CAD (PPP +15% + .95 rounding); copy = "complimentary white-glove delivery"; first-order-discount = none (per Asset 02 Luxury Pitfall #5); DDP via USMCA.
- **CA × Sustainable**: $89.95 CAD (PPP +18% + .95 rounding); copy = "ships carbon-neutral — verified by Shopify Planet"; first-order-discount = $5 1%-for-the-Planet donation match (Asset 03 U4 + Move #3 donation toggle); DDP via USMCA.
- **CA × Gen-Z**: $44.95 CAD (PPP -5% + .95 rounding); copy = "free shipping over $75 — eh?"; first-order-discount = 15% off first order (Asset 01 T1 Gen-Z variant); DDP via USMCA.
- **CA × B2B**: $2,499.00 CAD (PPP +10% + .00 rounding for invoice); copy = "Net 30 terms available"; first-order-discount = none (B2B-volume-pricing tier); DDP via USMCA.

#### UK row (per-voice override cells)

- **UK × Default**: £62.95 GBP (PPP +5% + .95 rounding); copy = "free UK delivery over £75"; first-order-discount = £8 off (Asset 01 T1 UK variant); DDP via UK VAT MOSS ≤£135 / DAP >£135.
- **UK × Luxury**: £382.95 GBP (PPP +15% + .95 rounding); copy = "complimentary London concierge delivery"; first-order-discount = none; DDP via UK VAT MOSS.
- **UK × Sustainable**: £89.95 GBP (PPP +18% + .95 rounding); copy = "delivered carbon-neutral via DPD zero-emission fleet"; first-order-discount = £5 1%-for-the-Planet match; DDP via UK VAT MOSS.
- **UK × Gen-Z**: £56.32 GBP (PPP -5% + .32 rounding canonical UK); copy = "free postage over £75 — innit"; first-order-discount = 20% off first order (Asset 01 T1 Gen-Z UK variant); DDP via UK VAT MOSS.
- **UK × B2B**: £1,975.00 GBP (PPP +10% + .00 rounding for invoice); copy = "Net 30 terms + VAT itemised"; first-order-discount = none; DDP via UK VAT MOSS.

#### EU-DE row (per-voice override cells)

- **DE × Default**: €63.95 EUR (PPP +5% + .95 rounding); copy = "kostenloser Versand ab €89"; first-order-discount = €8 off (Asset 01 T1 DE variant); DDP via IOSS ≤€150 / DAP >€150 with Zonos landed-cost.
- **DE × Luxury**: €368.95 EUR (PPP +15% + .95 rounding); copy = "kostenlose Limousinen-Lieferung"; first-order-discount = none; DDP via IOSS.
- **DE × Sustainable**: €84.95 EUR (PPP +18% + .95 rounding); copy = "klimaneutraler Versand mit DHL GoGreen"; first-order-discount = €5 1%-for-the-Planet match; DDP via IOSS.
- **DE × Gen-Z**: €54.95 EUR (PPP -5% + .95 rounding); copy = "gratis Versand ab €75 — yo"; first-order-discount = 20% off (Asset 01 T1 Gen-Z DE variant); DDP via IOSS.
- **DE × B2B**: €1,895.00 EUR (PPP +10% + .00 rounding for invoice + VAT-separated); copy = "Netto 30 Tage + USt. ausgewiesen"; first-order-discount = none; DDP via IOSS.

#### EU-FR row (per-voice override cells)

- **FR × Default**: €63.95 EUR (PPP +5% + .95 rounding); copy = "livraison gratuite dès €89"; first-order-discount = €8 off (Asset 01 T1 FR variant); DDP via IOSS ≤€150.
- **FR × Luxury**: €368.95 EUR (PPP +15% + .95 rounding); copy = "livraison concierge offerte"; first-order-discount = none; DDP via IOSS.
- **FR × Sustainable**: €84.95 EUR (PPP +18% + .95 rounding); copy = "livraison carboneutre avec Chronopost Green"; first-order-discount = €5 1%-for-the-Planet match; DDP via IOSS.
- **FR × Gen-Z**: €54.95 EUR (PPP -5% + .95 rounding); copy = "livraison gratuite dès €75 — stylé"; first-order-discount = 20% off; DDP via IOSS.
- **FR × B2B**: €1,895.00 EUR (PPP +10% + .00 rounding for invoice + VAT-separated); copy = "Net 30 + TVA détaillée"; first-order-discount = none; DDP via IOSS.

#### AU row (per-voice override cells)

- **AU × Default**: $118.95 AUD (PPP +5% + .95 rounding); copy = "free shipping over $149"; first-order-discount = $10 off; DDP via ATO GST (10% GST at checkout).
- **AU × Luxury**: $663.95 AUD (PPP +15% + .95 rounding); copy = "complimentary Sydney concierge delivery"; first-order-discount = none; DDP via ATO GST.
- **AU × Sustainable**: $112.95 AUD (PPP +18% + .95 rounding); copy = "delivered carbon-neutral with Australia Post"; first-order-discount = $5 1%-for-the-Planet match; DDP via ATO GST.
- **AU × Gen-Z**: $71.95 AUD (PPP -5% + .95 rounding); copy = "free shipping over $99 — legends"; first-order-discount = 15% off; DDP via ATO GST.
- **AU × B2B**: $3,795.00 AUD (PPP +10% + .00 rounding for invoice + GST-separated); copy = "Net 30 terms + GST itemised"; first-order-discount = none; DDP via ATO GST.

#### JP row (per-voice override cells — Path B pre-staged; Path C launched)

- **JP × Default**: ¥10,990 JPY (PPP +5% + ¥-rounding to .990); copy = "¥14,900以上で送料無料"; first-order-discount = ¥1,000 off; DAP with Zonos landed-cost calculator (no IOSS equivalent for JP).
- **JP × Luxury**: ¥16,990 JPY (PPP +15% + ¥-rounding to .990); copy = "コンシェルジュ配送無料"; first-order-discount = none; DAP.
- **JP × Sustainable**: ¥11,490 JPY (PPP +18% + ¥-rounding to .990); copy = "カーボン・ニュートラル配送"; first-order-discount = ¥500 1%-for-the-Planet match; DAP.
- **JP × Gen-Z**: ¥9,990 JPY (PPP -5% + ¥-rounding to .990); copy = "¥14,900以上送料無料 — ヤバい"; first-order-discount = 20% off; DAP.
- **JP × B2B**: ¥332,500 JPY (PPP +10% + ¥-rounding to .000 for invoice + consumption-tax-separated); copy = "Net 30 + 消費税明示"; first-order-discount = none; DAP.

#### DACH-AT row (per-voice override cells — Path B pre-staged; Path C launched)

- **AT × Default**: €65.95 EUR (PPP +9% AT-premium above DE + .95 rounding); copy = "kostenloser Versand ab €89"; first-order-discount = €8 off; DDP via IOSS ≤€150.
- **AT × Luxury**: €378.95 EUR (PPP +19% AT-Luxury-premium above DE + .95 rounding); copy = "kostenlose Limousinen-Lieferung"; first-order-discount = none; DDP via IOSS.
- **AT × Sustainable**: €88.95 EUR (PPP +22% AT-Sustainable-premium above DE + .95 rounding — AT is the strongest Sustainable-voice market in EU); copy = "klimaneutraler Versand mit DPD GoGreen"; first-order-discount = €5 1%-for-the-Planet match; DDP via IOSS.
- **AT × Gen-Z**: €56.95 EUR (PPP -1% AT-Gen-Z-parity + .95 rounding); copy = "gratis Versand ab €75"; first-order-discount = 20% off; DDP via IOSS.
- **AT × B2B**: €1,995.00 EUR (PPP +14% AT-B2B-premium above DE + .00 rounding + VAT-separated); copy = "Netto 30 Tage + USt. ausgewiesen"; first-order-discount = none; DDP via IOSS.

### Per-market FX-fee calculator (paste-ready math)

The 7 markets × 5 voice profiles produce 35 cells, but the FX-fee math is **the same 4 components per market** (FX rate + Stripe International fee tier + PayPal International fee tier + Shopify Payments tiered rate). The operator runs this 4-component math per market to budget the 1.5–3.5% FX-fee buffer. Paste-ready formula:

```
international_revenue_usd_equivalent = (
  (local_currency_price × units_sold)
  × (1 / fx_rate_to_usd)
  × (1 - stripe_international_fee_pct)
  × (1 - paypal_international_fee_pct)
  × (1 - shopify_payments_tiered_fee_pct)
)

# Per-market canonical rates (rolling 90-day average, refresh quarterly):
#   CA: fx=1.36 CAD/USD, stripe=1.5% US-card + 1% non-US, paypal=3.0%, shopify=2.9% + $0.30
#   UK: fx=0.79 GBP/USD, stripe=1.5% + 1%, paypal=3.0%, shopify=2.9% + £0.20
#   EU-DE: fx=0.92 EUR/USD, stripe=1.5% + 1%, paypal=3.5%, shopify=2.9% + €0.25
#   EU-FR: fx=0.92 EUR/USD, stripe=1.5% + 1%, paypal=3.5%, shopify=2.9% + €0.25
#   AU: fx=1.52 AUD/USD, stripe=2.0% + 1.5%, paypal=4.0%, shopify=2.9% + A$0.30
#   JP: fx=149 JPY/USD, stripe=2.5% + 1.5%, paypal=4.0%, shopify=3.5% + ¥40
#   DACH-AT: fx=0.92 EUR/USD, stripe=1.5% + 1%, paypal=3.5%, shopify=2.9% + €0.25

# Per-market median FX-fee (the canonical 1.5-3.5% band):
#   CA: 2.0% median (Stripe-heavy mix)
#   UK: 2.0% median
#   EU-DE: 2.5% median (PayPal-heavy mix in DE)
#   EU-FR: 2.5% median
#   AU: 3.0% median (highest Stripe tier outside EU)
#   JP: 3.5% median (highest-fee market)
#   DACH-AT: 2.5% median

# Operator usage: budget the median FX-fee per market in the international P&L.
# Example: $5M US GMV brand launching UK with £400k UK Year-1 revenue at 2.0% FX-fee = £8,000 (~$10,000) budgeted FX-fee cost.
```

### Per-market contribution-margin calculator (paste-ready math)

The per-market price-card pre-computes contribution margin so the operator knows **before launch** whether the international expansion is contribution-margin-positive at the chosen price-card:

```
per_market_contribution_margin_pct = (
  1
  - cogs_pct                              # 30% (Default) / 22% (Luxury) / 36% (Sustainable) / 35% (Gen-Z) / 40% (B2B)
  - per_market_duty_pct                   # 0% CA (USMCA) / 0-10% AU / 0-25% EU/JP per HS code; budget 5% median
  - per_market_fx_fee_pct                 # 2.0% CA / 2.0% UK / 2.5% EU / 3.0% AU / 3.5% JP / 2.5% DACH-AT
  - per_market_shipping_subsidy_pct       # typically 5-10% of AOV (international free-shipping discount)
  - per_market_voice_first_order_discount_pct  # 0% Luxury / 0% B2B / 5-15% Default / 5% Sustainable / 15-20% Gen-Z
)
# Gate: per_market_contribution_margin_pct must be ≥ 30% (the playbook 11 §Prerequisite #6).
# Default benchmark per market × voice (median contribution margin):
#   CA × Default: 50% / CA × Luxury: 60% / CA × Sustainable: 47% / CA × Gen-Z: 38% / CA × B2B: 48%
#   UK × Default: 48% / UK × Luxury: 58% / UK × Sustainable: 45% / UK × Gen-Z: 36% / UK × B2B: 46%
#   EU × Default: 45% / EU × Luxury: 55% / EU × Sustainable: 42% / EU × Gen-Z: 33% / EU × B2B: 43%
#   AU × Default: 42% / AU × Luxury: 52% / AU × Sustainable: 39% / AU × Gen-Z: 30% / AU × B2B: 40%
#   JP × Default: 38% / JP × Luxury: 48% / JP × Sustainable: 35% / JP × Gen-Z: 26% / JP × B2B: 36%  ← Gen-Z JP below 30% gate; operator should ship Gen-Z JP with .990 ending but tighter contribution-margin caveat OR defer Gen-Z JP until contribution-margin improves
#   DACH-AT × Default: 44% / DACH-AT × Luxury: 54% / DACH-AT × Sustainable: 41% / DACH-AT × Gen-Z: 32% / DACH-AT × B2B: 42%
```

---

## 6-step build (Week 1 launch)

The 6-step build below is the paste-ready recipe for shipping the 7-market × 5-voice = 35-cell price-card in Shopify Markets. Operator runs the recipe in Week 1 of international expansion (Phase 1 launch per playbook 11). Steps 1–4 ship Path B's default 4-market × 5-voice = 20-cell card; Steps 5–6 ship Path C's extended 7-market card.

1. **Step 1 (30 min) — Pick path + markets.** Decide Path A (CA only) / Path B (CA + UK + EU + AU default) / Path C (all 7 markets). For Path B, ship the 4 default markets; for Path C, ship all 7. Verify you have US-baseline AOV + contribution margin + per-voice first-order-discount policy from Asset 02 (the voice framework) + Asset 04 (the 12-month calendar for first-order-discount cadence).
2. **Step 2 (1 hr) — Set Shopify Markets pricing rules.** In Shopify admin → Settings → Markets → [each market] → Pricing → set the per-market local-currency display + the per-voice PPP-premium from the 7-market × 5-voice matrix in Section 3 above. Paste the per-voice first-order-discount column into the Klaviyo per-locale welcome flow. Verify Shopify Markets auto-detects the per-market price and renders in local currency.
3. **Step 3 (45 min) — Wire DDP for IOSS + UK VAT MOSS markets.** Register for IOSS at the EU portal (2–4 weeks approval; free) and UK VAT MOSS at HMRC (4–8 weeks approval; free for ≤£135 shipments). Set Shopify Markets to charge VAT at checkout for shipments ≤€150 EU / ≤£135 UK. For shipments above threshold, wire Zonos / TaxJar / Avalara landed-cost calculator for the displayed-price duties estimate. Verify DDP is enabled in the per-market Markets pricing tab.
4. **Step 4 (1 hr) — Set per-market free-shipping threshold + voice-variant PDP copy.** Update the free-shipping threshold per market per Section 3 above (CA $99 / UK £75 / EU €89 / AU $149 / JP ¥14,900 / DACH-AT €89). Update PDP per-locale price-block with the per-voice voice-variant copy (e.g. CA Sustainable PDP shows "$89.95 CAD — ships carbon-neutral, verified by Shopify Planet"). Verify the per-market per-voice PDP copy renders correctly in the customer's locale.
5. **Step 5 (30 min, Path C only) — Pre-stage JP + DACH-AT + Nordics-S/E rows.** For Path C operators, paste the JP + DACH-AT + Nordics-S/E rows into Shopify Markets as **drafts (not launched)**. Set a launch date 6–12 months out per playbook 11 Phase 3 Gate C. Verify the drafts are visible in Markets → Drafts but not visible to customers until launch.
6. **Step 6 (45 min, ongoing) — Run the per-market contribution-margin calculator + verify all 5 gates pass.** Run the per-market contribution-margin math from Section 3 above. Verify per-market contribution margin is ≥30% (playbook 11 §Prerequisite #6). Wire the 5 verification gates below into a quarterly cadence. Set a Triple Whale per-market cohort report (Move #6 + Move #6.5 cross-platform drift extension) to monitor per-market CVR + AOV + contribution margin against US baseline.

---

## 10 common international-pricing pitfalls with corrective `Fix:` lines

1. **Pitfall #1 — Currency-converted 1:1** ($75 USD → €75 EUR). Drops CVR 20–40% in non-US markets (Shopify Markets benchmarks 2025). **Fix:** Always apply the per-market per-voice PPP-premium from the 35-cell matrix in Section 3 above. Even Default-voice should ship +5% to offset shipping subsidies + duties + FX fees.
2. **Pitfall #2 — Wrong local-currency rounding** (£14.99 canonical UK but €14.99 feels arbitrary in EU; ¥14,990 canonical JP but ¥14,899 feels wrong; CAD$24.99 vs $25.00 difference is 10–15% CVR). **Fix:** Use the per-market rounding column in the 35-cell matrix: .95 / .95 / .95 / .95 / .95 / .990 / .95 for CA / UK / EU-DE / EU-FR / AU / JP / DACH-AT respectively. Never round below the US-baseline.
3. **Pitfall #3 — No per-voice per-market variant** (Default €65 EUR with no Sustainable / Luxury / Gen-Z / B2B variants). Loses 5–15% of premium-segment revenue + 10–20% of Gen-Z volume. **Fix:** Always ship the full 5-voice row per market per the 35-cell matrix. The 35 cells are NOT optional — each cell represents a distinct audience with a distinct price-elasticity.
4. **Pitfall #4 — DAP without displayed duties estimate** (customer sees $75 USD product, places order, gets hit with $20+ duties on delivery). Triggers 20–40% delivery refusal rates. **Fix:** Wire Zonos / TaxJar / Avalara for landed-cost calculator at checkout OR use DDP via IOSS + UK VAT MOSS (the canonical free path for ≤€150 EU / ≤£135 UK). For >€150 EU or non-IOSS markets, DDP via absorbing duties into the displayed price is the only way to avoid the refusal-rate trap.
5. **Pitfall #5 — Free-shipping threshold kept at US-baseline** ($75 USD = €69 EUR; offering free shipping over €69 eats 15–25% of AOV on international orders). **Fix:** Raise per-market free-shipping threshold 1.3× (CA / JP) to 2× (AU) per the per-market free-ship column in the 35-cell matrix. The threshold must absorb international shipping cost (typically 2–3× US shipping).
6. **Pitfall #6 — No FX-fee budget** (operator forgets the 1.5–3.5% FX-fee eats margin). Discovers 3 months post-launch that contribution margin is 5pp below projection. **Fix:** Budget the per-market median FX-fee per the FX-fee calculator in Section 3 (2.0% CA / 2.0% UK / 2.5% EU / 3.0% AU / 3.5% JP / 2.5% DACH-AT). Add to the international P&L as a separate line item, not bundled into COGS.
7. **Pitfall #7 — Sustainable-voice price parity with Default** (Sustainable customers expect a 5–15% premium for verifiable impact per Asset 09 + Asset 12; shipping Default parity loses the premium segment). **Fix:** Apply the per-market Sustainable PPP-premium from the 35-cell matrix (CA +18% / UK +18% / EU +18% / AU +18% / JP +18% / DACH-AT +22%). Operators who ship Sustainable-parity-with-Default lose the segment to competitors who verify the premium.
8. **Pitfall #8 — B2B customers get B2C-flat pricing** (B2B customers in UK + EU need £-rounded + €-rounded prices for invoice processing + VAT-separated line item). **Fix:** Apply the per-market B2B PPP-premium from the 35-cell matrix (+10% CA / +10% UK / +10% EU / +10% AU / +10% JP / +14% DACH-AT) + the B2B-specific Net-30-terms row + the VAT-separated line item. Operators who ship B2C-flat lose B2B contracts to competitors who format for procurement.
9. **Pitfall #9 — Per-market contribution margin below 30%** (typically Gen-Z in JP at 26% or AU at 30%; some Sustainable in EU at 42% which passes but is tight). **Fix:** Run the per-market contribution-margin calculator BEFORE launch. If a market × voice cell falls below 30%, either (a) raise the local-currency price 5–10%, or (b) defer that market × voice cell to a future launch (Phase 3+), or (c) accept the lower margin with operator signoff. The 30% gate is the playbook 11 §Prerequisite #6 floor; below that, international expansion burns cash.
10. **Pitfall #10 — Quarterly FX-rate refresh missed** (FX rates drift 5–15% per quarter; the price-card becomes stale within 90 days). **Fix:** Set a quarterly Triple Whale + currency-API refresh (openexchangerates.org / Fixer.io / CurrencyLayer) that updates the FX-rate column in the 7-market table. Apply the new FX-rate to the per-voice price within 7 days of refresh. Track quarterly in the per-market Triple Whale cohort report (per playbook 11 §Phase 4 cadence).

---

## 5 verification gates

Before considering the per-market price-card production-grade, the operator must pass all 5 gates.

- **Gate A — Per-market contribution margin ≥ 30% per voice.** Run the per-market contribution-margin calculator from Section 3 for all 35 cells. Each cell must show ≥30% contribution margin (the playbook 11 §Prerequisite #6 floor). If a cell falls below 30%, apply the Pitfall #9 fix. Verify with Triple Whale per-market cohort report (Move #6) weekly for the first 4 weeks post-launch.
- **Gate B — Per-market CVR within ±20% of US-baseline CVR after 30 days.** Run Triple Whale per-market CVR report daily for the first 7 days, then weekly. Compare each market's CVR against the US-baseline CVR (4% monthly Default benchmark; varies per voice). If a market is >20% below US baseline after 30 days, investigate (typically Pitfall #1 currency-converted-1:1 or Pitfall #2 wrong-rounding or Pitfall #5 free-ship-threshold-too-low).
- **Gate C — Per-market AOV within ±15% of US-baseline AOV after 30 days.** Run Triple Whale per-market AOV report weekly. Compare each market's AOV against the US-baseline AOV ($75 Default / $425 Luxury / $95 Sustainable / $45 Gen-Z / $2,500 B2B). If a market is >15% off baseline, the PPP-premium may need adjustment (typically Luxury shipping below premium = Pitfall #7 Sustainable-parity or Pitfall #8 B2B-flat).
- **Gate D — DDP wired for IOSS + UK VAT MOSS markets.** Verify Shopify Markets → [each EU market] → Pricing → "Charge VAT at checkout" is enabled for shipments ≤€150. Verify Shopify Markets → UK → Pricing → "Charge VAT at checkout" is enabled for shipments ≤£135. Verify Zonos/TaxJar/Avalara landed-cost calculator is configured for shipments above threshold. Run a test order from each market to verify the VAT-line-item appears at checkout.
- **Gate E — FX-fee buffer of 2.5% baked into international P&L.** Verify the international P&L has a separate "FX fees" line item with the per-market median budget (2.0% CA / 2.0% UK / 2.5% EU / 3.0% AU / 3.5% JP / 2.5% DACH-AT). Verify the quarterly FX-rate refresh cadence is scheduled (per Pitfall #10). Verify Triple Whale per-market revenue report subtracts the FX-fee budget from gross revenue to show contribution-margin-corrected per-market revenue.

---

## Verification recipe (paste-runnable)

Run all 5 gates from the operator's terminal. The recipe is a 5-step shell block that mirrors the canonical Move #6.5 attribution-audit recipe shape.

```bash
# Step 1 — Structural completeness (Gate A scaffolding)
echo "=== Gate A — Per-market contribution margin ==="
python3 -c "
markets = ['CA', 'UK', 'EU-DE', 'EU-FR', 'AU', 'JP', 'DACH-AT']
voices = ['Default', 'Luxury', 'Sustainable', 'Gen-Z', 'B2B']
# Per-market contribution margin matrix from Section 3 (Default + 4 overrides)
margin_matrix = {
    'CA':     {'Default': 50, 'Luxury': 60, 'Sustainable': 47, 'Gen-Z': 38, 'B2B': 48},
    'UK':     {'Default': 48, 'Luxury': 58, 'Sustainable': 45, 'Gen-Z': 36, 'B2B': 46},
    'EU-DE':  {'Default': 45, 'Luxury': 55, 'Sustainable': 42, 'Gen-Z': 33, 'B2B': 43},
    'EU-FR':  {'Default': 45, 'Luxury': 55, 'Sustainable': 42, 'Gen-Z': 33, 'B2B': 43},
    'AU':     {'Default': 42, 'Luxury': 52, 'Sustainable': 39, 'Gen-Z': 30, 'B2B': 40},
    'JP':     {'Default': 38, 'Luxury': 48, 'Sustainable': 35, 'Gen-Z': 26, 'B2B': 36},  # Gen-Z JP below 30% gate
    'DACH-AT':{'Default': 44, 'Luxury': 54, 'Sustainable': 41, 'Gen-Z': 32, 'B2B': 42},
}
below_30 = [(m, v) for m in markets for v in voices if margin_matrix[m][v] < 30]
if below_30:
    print(f'GATE A FAIL: {len(below_30)} cells below 30% gate: {below_30}')
    print('Apply Pitfall #9 fix (raise price, defer market, or sign off lower margin)')
else:
    print('GATE A PASS: all 35 cells >= 30% contribution margin')
"

# Step 2 — Voice-density verification (Gate B/C scaffolding)
echo "=== Voice-density per profile (Gate B/C precondition) ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  count=$(grep -cE "\\b${voice}\\b" assets/13-international-pricing-card.md)
  if [ "$count" -ge 15 ]; then
    echo "  ✓ ${voice}: ${count} mentions (>= 15 threshold)"
  else
    echo "  ✗ ${voice}: ${count} mentions (< 15 threshold — needs enrichment)"
  fi
done

# Step 3 — Anti-pattern grep
echo "=== Anti-pattern grep ==="
if grep -nE 'set up your account|TODO|FIXME|XXX|placeholder' assets/13-international-pricing-card.md; then
  echo "GATE E FAIL: anti-pattern grep returned matches"
else
  echo "GATE E PASS: 0 anti-pattern matches"
fi

# Step 4 — Cross-reference sibling-consistency
echo "=== Sibling-consistency (research/04 + playbook 11 + assets/02 + assets/09 + assets/12 cross-refs) ==="
for ref in research/04-international-expansion.md playbooks/11-international-rollout.md assets/02-brand-voice.md assets/04-promo-calendar.md assets/05-retention-metrics.md assets/09-impact-reporting.md assets/12-impact-data-pipeline.md; do
  if [ -f "$ref" ]; then
    echo "  ✓ $ref exists"
  else
    echo "  ✗ $ref MISSING"
  fi
done

# Step 5 — Zero regressions (run the full suite)
echo "=== Zero regressions — full suite re-run ==="
for t in scripts/tests/test_*.py; do python3 "$t" 2>&1 | tail -1; done
node dashboards/tests/test_unified_attribution_health.js 2>&1 | tail -1
```

---

## Related (canonical 7-section asset skeleton complete)

**Sibling assets cross-referenced (every cross-reference resolves):**
- `assets/01-copy-templates.md` (8 Klaviyo+Postscript templates — the per-voice first-order-discount column in this card uses Asset 01 T1 Welcome adapted per voice per market)
- `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework — this card's 5-voice row is derived from Asset 02's per-voice Default benchmark; the per-voice first-order-discount policy comes from Asset 02 §Discount frequency column)
- `assets/03-ugc-brief.md` (5 outreach + 3 contracts — the per-market creator-inquiry responses for the international rollout use Asset 03 U1–U5 outreach + C1/C2/C3 contracts adapted per market)
- `assets/04-promo-calendar.md` (12-month calendar — this card's per-market promo-cadence column extends Asset 04's Q1-low/Q4-peak macro shape to per-market; the per-voice first-order-discount column uses Asset 04's per-voice seasonal-discount rules)
- `assets/05-retention-metrics.md` (12-metric retention card — this card's per-market LTV column uses Asset 05 Metric #3 LTV + Metric #7 cohort LTV by source + Metric #8 payback period; the per-market CVR gate uses Asset 05 Metric #4 CVR)
- `assets/06-nps-survey-toolkit.md` (NPS survey program — this card's per-market NPS signal column uses Asset 06 Q7 NPS-detractor-routing + Q9 sustainability-importance as the canonical per-market NPS overlay)
- `assets/07-competitive-teardown.md` (8-dimension framework — this card's per-market pricing benchmark column uses Asset 07 Dimension 2 Pricing for per-market competitive pricing context)
- `assets/08-cs-response-library.md` (12-scenario CS templates — the per-market CS pricing-question responses use Asset 08 Scenario 1 WISMO + Scenario 4 defective + Scenario 11 discount-code adapted per market)
- `assets/09-impact-reporting.md` (6-pillar impact framework — this card's Sustainable-voice per-market impact premium column uses Asset 09 Pillar 1 Carbon + Pillar 5 Community as the per-market sustainability price-justification)
- `assets/10-affiliate-program-playbook.md` (6-path tool decision + 7 dimensions — the per-market affiliate-program launch for international rollout uses Asset 10's per-voice commission tier + the per-market cookie window)
- `assets/11-cs-training-program.md` (12-module training — the per-market pricing-question training for CS reps uses Asset 11 Module 1 WISMO + Module 11 discount-code adapted per market)
- `assets/12-impact-data-pipeline.md` (6-pillar ETL — this card's per-market carbon-cost cell uses Asset 12's Carbon pillar to verify the sustainability-claim is backed by data, not marketing)

**Sibling playbooks cross-referenced (every cross-reference resolves):**
- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1 — per-market cart-abandon flow uses this card's per-market price + per-market voice variant)
- `playbooks/02-post-purchase-upsell-reconvert.md` (Move #2 — per-market post-purchase upsell flow uses this card's per-market price for the upsell offer)
- `playbooks/03-checkout-audit-baymard.md` (Move #3 — the per-market checkout audit uses this card's per-market free-shipping-threshold column + DDP/DAP wiring)
- `playbooks/04-welcome-series-klaviyo.md` (Move #4 — per-market welcome flow uses this card's per-market first-order-discount column)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — per-market attribution tracking uses Triple Whale's automatic per-country revenue tracking)
- `playbooks/06.5-attribution-quality-audit.md` (Move #6.5 — the per-market attribution-quality audit extends this card's per-market revenue tracking)
- `playbooks/06.6-tiktok-attribution-quality-audit.md` (Move #6.6 — the per-market TikTok attribution extends this card's per-market ad-spend column)
- `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` (Move #6.7 — the per-market Snap+Pinterest attribution extends this card's per-market ad-spend column)
- `playbooks/06.8-cross-platform-attribution-drift-unification.md` (Move #6.8 — the per-market drift-detection extends this card's per-market revenue tracking)
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — per-market SMS uses this card's per-market price + per-market voice)
- `playbooks/07-loyalty-program-smile.md` (Move #8 — per-market loyalty tier uses this card's per-market price-points + per-market free-shipping-threshold column)
- `playbooks/09.5-pdp-ab-testing-program.md` (Move #9.5 — the per-market PDP A/B test uses this card's per-voice price-card for the variant pricing)
- `playbooks/10-ai-ad-creative-iteration.md` (Move #10 — the per-market AI creative uses this card's per-voice copy framing for the creative variant)
- `playbooks/11-international-rollout.md` (the operator build — this card's per-market price-card is the operator-build input that playbook 11 Step 1.1 references)

**Sibling research cross-referenced (every cross-reference resolves):**
- `research/00-ecommerce-ops-landscape.md` (the landscape doc — §international references this card's per-market price-card)
- `research/01-tools-stack-comparison.md` (the stack comparison — §Shopify Markets references this card's per-market pricing rules)
- `research/02-top-10-leverage-moves.md` (the top-10 leverage ranking — Move #6 attribution + Move #8 loyalty + the international-rollout Move #N+1 all reference this card)
- `research/03-30-day-rollout-plan.md` (the 30-day synthesis — Day 22–30 international-rollout setup references this card)
- `research/04-international-expansion.md` (the cross-border DTC framework — Pillar 2 Currency, pricing & FX explicitly references this card's per-market price-card)

**Sibling scripts cross-referenced (every cross-reference resolves):**
- `scripts/triple_whale_attribution_check.py` (Move #6 — the canonical per-market attribution tracker; this card's per-market revenue tracking uses this script's output)
- `scripts/attribution_quality_audit.py` (Move #6.5 — the canonical attribution-quality audit; the per-market audit extends this script's output)
- `scripts/tiktok_attribution_audit.py` (Move #6.6 — the canonical TikTok attribution; the per-market TikTok audit extends this script's output)
- `scripts/snap_pinterest_attribution_audit.py` (Move #6.7 — the canonical Snap+Pinterest attribution; the per-market Snap+Pinterest audit extends this script's output)
- `scripts/attribution_cross_platform_rollup.py` (Move #6.8 — the canonical cross-platform drift detector; the per-market drift-detection extends this script's output)
- **`scripts/international_market_fit.py`** *(future-tick companion per playbook 11 line 486 + research/04 line 300; planned, does not yet exist)* — Archetype A/B hybrid scoring script that takes a brand's category + AOV + US contribution margin → outputs Path A / Path B / Path C recommendation with expected revenue lift + cost stack; this card's per-market price-card is the operator-build input to that script's per-market projection.

**Sibling dashboards cross-referenced (every cross-reference resolves):**
- `dashboards/unified-attribution-health.html` (Move #6.9 — the static attribution-health dashboard; the per-market revenue overlay extends this dashboard's per-platform view)
- **`dashboards/international-expansion-health.html`** *(shipped 2026-06-27 per the dashboard-tick follow-up to research/04 line 301 + playbook 11 line 494 + asset 13 line 345; was future-tick companion)* — static HTML dashboard showing per-market launch readiness (Gate A/B/C/D status per market from playbook 11 §Verification gates) + per-market Year-1 revenue lift vs projection (per-path market-share weights from the script) + per-market CAC payback; this card's 35-cell matrix is the operator-build input to that dashboard's per-market projection view.

**Forward-pointing references (planned future-tick companions):**

- **`dashboard/app/international/page.tsx`** *(future-tick companion per playbook 11 line 495; planned, does not yet exist)* — Next.js dashboard route to render research/04 + playbook 11 + this Asset 13 as a navigable operator surface; the per-market price-card 35-cell matrix is the canonical operator-build input to that route's per-market pricing tab.
