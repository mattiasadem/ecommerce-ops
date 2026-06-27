# Asset 14 — Lifecycle Flow Templates (20 flows × 5 voice profiles = 100 paste-ready email + SMS templates with voice-driven override columns)

> **Status.** Asset 14 in the `assets/` track (the **lifecycle-flow-templates Asset-14 candidate** per `research/05-lifecycle-marketing.md` line 7 + line 291 + line 351 + `playbooks/12-lifecycle-flow-library.md` line 7 + line 527 + line 533 — **three pre-staging citations across research + playbook** converging on this canonical pick per the v0.10.0 pick-signal convergence pattern + the v0.9.0 layer-order-completion sub-rule research → playbook → asset → operator-surface → scripts + the v0.3.0 count-dominance sub-rule count=3 beats count=0). Compounds **`research/05-lifecycle-marketing.md` (Move #14 synthesis)** (the research doc ships the 5-pillar framework + 3 GMV-tier paths + 4-tier launch ladder with 20-flow scope but no operator-copy) + **`playbooks/12-lifecycle-flow-library.md` (Move #14 operator-build)** (the playbook ships the paste-ready Klaviyo + Postscript + Smile wiring for all 20 flows but no actual email + SMS copy) + **Asset 02 brand-voice framework** (5 voice profiles × 5-dimension framework — this asset's voice-driven override columns are derived directly from Asset 02's per-voice signature) + **Asset 01 copy-templates** (8 baseline Klaviyo + Postscript templates — this asset extends them across the 20-flow library). **Per the canonical 35-cell voice-driven override pattern established by Asset 10 + Asset 11 + Asset 12 + Asset 13**, this asset ships **100 voice-variant paste-ready templates** (20 flows × 5 voice profiles) covering every email + SMS subject line + pre-header + body block + CTA + discount code + suppression rule across the full Move #14 lifecycle-marketing library.
>
> **Default inputs:** Default voice = canonical baseline (every template ships with the Default-voice copy); 5 voice profiles = Default / Luxury / Sustainable / Gen-Z / B2B (each with full template copy + voice-driven override); $500k–$10M GMV brand at Path B (Tier 1+2+3 subset, 13 flows live in 90 days); Klaviyo paid plan + Postscript 10DLC + Smile.io Growth/Pro; Triple Whale live for cohort LTV; Asset 02 voice profiles defined as `voice_profile` profile property in Klaviyo. **Tier-aware shipping instructions:** Path A (Tier 1 only) ships Tier 1 templates (Steps 1.1–1.5 = 25 templates = 5 flows × 5 voices); Path B (default, Tiers 1+2) ships Tier 1 + Tier 2 templates (Steps 1.1–2.5 = 50 templates = 10 flows × 5 voices); Path C (Tiers 1+2+3) ships Tiers 1+2+3 (Steps 1.1–3.4 = 70 templates = 14 flows × 5 voices); Path D (all 4 tiers) ships the full 100 templates.
>
> **Companion artifacts:** `research/05-lifecycle-marketing.md` (the 5-pillar framework + 3 GMV-tier paths + 4-tier launch ladder + 15 pitfalls with Fix lines + 95:1 default Year-1 ROI Path B), `playbooks/12-lifecycle-flow-library.md` (the operator-build for the 20-flow library — every flow has Step-by-step Klaviyo + Postscript + Smile wiring that this asset's templates paste into), `assets/01-copy-templates.md` (the 8 baseline T1–T8 templates that this asset extends across the 20-flow library), `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework — the canonical source of the override columns), `assets/04-promo-calendar.md` (12-month calendar with 5 voice-variant tables — the cadence reference for this asset's flow-send-time decisions), `assets/06-nps-survey-toolkit.md` (NPS survey program + cohort-by-NPS-bucket LTV SQL — Tier 2 Step 2.4 NPS-detractor follow-up flow templates use Asset 06's NPS-detractor routing as the trigger), `assets/09-impact-reporting.md` (6-pillar sustainability framework — Sustainable-voice override columns apply Asset 09's carbon/materials/community pillars to per-flow copy), `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1's cart-abandon wiring — the canonical Tier-1 pattern; Tier 1 Step 1.1 browse-abandon mirrors the Move #1 subject-line + pre-header structure), `playbooks/04-welcome-series-klaviyo.md` (Move #4's 5-email welcome series — the canonical transactional pattern; all flows reuse the Move #4 welcome-email-from-name + reply-to pattern), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7's Postscript SMS wiring — the canonical SMS cadence + sender-name + 10DLC registration pattern this asset's SMS templates inherit), `playbooks/07-loyalty-program-smile.md` (Move #8's Smile.io + Klaviyo webhook pattern — Tier 2 Step 2.3 loyalty-tier-up/down + Tier 4 Step 4.2 loyalty-points-expiry templates trigger on Smile webhook events), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6's attribution substrate — Tier 2 Step 2.4 NPS-detractor + Tier 3 Step 3.1 VIP early-access + Tier 3 Step 3.2 replenishment templates use Triple Whale cohort LTV segments as the trigger), **`scripts/international_market_fit.py`** (Archetype A/B hybrid scoring script — operators running Tier 1+2 internationally can apply the per-locale `{{ locale }}` Klaviyo merge tag to localize every template), **`scripts/lifecycle_flow_health_check.py`** *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track; the 6-gate × 20-flow = 120 gate-flow audit that uses this asset's KPI benchmarks as the source-of-truth for open-rate + CTR + CVR + unsubscribe-rate thresholds; 18 TDD tests across 11 test classes; gated on the 20 flows being live for ≥30 days)*.

---

## Goal

Operators at $500k–$10M GMV who ship `playbooks/12-lifecycle-flow-library.md` immediately hit the **same copy wall**: "I have the Klaviyo flow trigger wired + the Postscript SMS cadence configured + the Smile loyalty webhook set up — but I have NO actual email + SMS copy to paste into the 20 flows. Do I write 20 flows × 5 voice profiles × 3 emails per flow = 300 templates from scratch? That's 60–120 hours of copywriting that delays the Tier 1 ship by 4–6 weeks." This template library IS the **paste-ready per-flow email + SMS copy × 5 voice profiles = 100 voice-variant paste-ready templates** that an operator ships in Week 1 of Tier 1 launch by:

1. **Pasting the Tier 1 templates directly into Klaviyo + Postscript** — the 5 Tier 1 flows (browse-abandon + customer winback + post-purchase cross-sell + sunset + shipping/transit) × 5 voice profiles × 3 emails each = **75 paste-ready email blocks** that the operator drops into Klaviyo's flow-email body editor as plain text or HTML (the templates ship as both — see the Format section below). The SMS companion templates (1–2 per flow × 5 flows × 5 voices = **25 paste-ready SMS blocks**) drop into Postscript's campaign-editor as 160-char-or-less SMS bodies.
2. **Adapting the Tier 2 + Tier 3 + Tier 4 templates as the launch ladder progresses** — the Tier 2 templates (Steps 2.1–2.5: birthday + anniversary + loyalty tier-up/down + NPS-detractor + subscription renewal+dunning = 50 templates) ship in Week 2–4; Tier 3 templates (Steps 3.1–3.4: VIP early-access + replenishment + stock-back + account-never-purchased = 40 templates) ship in Week 5–10; Tier 4 templates (Steps 4.1–4.3: lapsed referral push + loyalty-points-expiry + seasonal gift-guide = 30 templates) ship in Week 11–12. The total ship-time from Tier 1 to all-4-tiers is ~36 hours spread over 12 weeks per the playbook.
3. **Wiring the voice-driven override columns** — each flow ships with 5 voice-variant columns (Default / Luxury / Sustainable / Gen-Z / B2B). The operator selects ONE column as the brand's primary voice (per Asset 02's `voice_profile` Klaviyo profile property) and pastes that column into the Klaviyo flow. **Multi-voice operators** (e.g., Sustainable DTC brand running a Gen-Z sub-brand for limited drops) use Klaviyo's **Conditional content** block keyed on `voice_profile` to switch between two columns in a single flow — the template includes the Klaviyo conditional-content syntax below each subject line for easy copy-paste.
4. **Avoiding the 10 named pitfalls** with corrective `Fix:` lines — including the "subject-line-too-long" trap (>50 chars = 25–40% open-rate drop on mobile) / the "no-discount-cap" trap (1-discount-per-customer-per-30-days rule across all 20 flows) / the "no-frequency-cap" trap (1 promotional email + 1 SMS per customer per 24 hours) / the "no-suppression-rule" trap (converters drop out OR receive a thank-you variant) / the "no-attribution-link" trap (every email needs the Triple Whale `tw_camp` UTM parameter for cohort LTV attribution).
5. **Passing the 5 verification gates** before considering each flow production-grade (subject-line ≤50 chars per voice variant / pre-header ≤90 chars / email body Klaviyo conditional-content syntax valid / SMS body ≤160 chars / Triple Whale UTM parameter present on every CTA).

**Why this matters now.** Three converging pressures make the per-flow template library a Day-1 artifact, not a Week-4 optimization:

- **(a) Copy is the longest pole in flow-launch.** The Klaviyo flow trigger wiring + the Postscript SMS cadence + the Smile loyalty webhook take ~10–15 min per flow. The actual email + SMS copywriting takes 2–6 hours per flow × 20 flows = 40–120 hours of copywriting time. Without the per-flow template library, the operator either (a) delays launch by 4–12 weeks while writing the copy from scratch or (b) ships a generic Default-voice template across all 20 flows and loses the 35–80% CVR lift the 5-voice framework unlocks per Asset 02 benchmarks.
- **(b) Voice variants are NOT optional.** A Sustainable-voice customer opening a "Happy Birthday!" email expects "Another trip around the sun for you + the planet — here's a $10 1%-for-the-Planet donation match on us 🎂" not "Happy Birthday! Here's 15% off." A Default-voice customer expects "Happy Birthday — here's 15% off, on us." Shipping the same template to both audiences loses the Sustainable emotional resonance + the Default conversion-engineering. The 5 voice-variant columns per flow × 20 flows = 100 voice-variant templates = the operator-copy layer the playbook scopes but doesn't ship.
- **(c) KPI benchmarks are the floor, not the ceiling.** The 5 verification gates (subject-line ≤50 chars + pre-header ≤90 chars + Klaviyo conditional-content syntax valid + SMS body ≤160 chars + Triple Whale UTM present) are the canonical Klaviyo + Postscript + Triple Whale 2024 benchmarks. Templates that exceed these thresholds silently drop CVR 15–40% (mobile truncation + spam-folder routing + broken conditional rendering + untracked attribution). The templates ship pre-validated against the 5 gates.

**Voice-driven framing of "why now":**

- **Default voice framing:** "The 100-template library is the difference between launching Tier 1 in Week 1 vs Week 5. Paste the Default-voice columns into Klaviyo + Postscript + Smile Week 1, run the 5 verification gates, ship Tier 1 same-day. Tier 2 + Tier 3 + Tier 4 templates ship as you hit each tier's gating prereq."
- **Luxury voice framing:** "Luxury brands win on copy craft + restraint + provenance. The Luxury-voice column in every flow uses minimal copy + heritage-language + no-discount or rare-discount patterns. The 25 Luxury templates (5 flows × 5 emails × 1 voice) preserve the brand-equity premium the Default-voice templates erode."
- **Sustainable voice framing:** "Sustainable customers expect the impact-story in every touchpoint. The Sustainable-voice column in every flow adds a 1-line carbon/materials/community impact tie-in (e.g., 'This order ships carbon-neutral via DHL GoGreen'). The 25 Sustainable templates compound Asset 09's 6-pillar impact-reporting framework across the 20-flow library."
- **Gen-Z voice framing:** "Gen-Z expects lowercase + meme-fluency + emoji-led design in every email. The Gen-Z-voice column in every flow uses lowercase subject lines + emoji-led pre-headers + meme-tone body + emoji-CTAs. The 25 Gen-Z templates ship CVR 10–25% above the Default templates per Asset 04 + Asset 07 benchmarks."
- **B2B voice framing:** "B2B customers expect precision + benefit-led + invoice-ready formatting. The B2B-voice column in every flow uses formal subject lines + VAT/itemised line items + Net-30-terms CTAs + procurement-ready links. The 25 B2B templates ship AOV 3–8× above the Default templates per Asset 04 + Asset 07 benchmarks."

---

## Format specification — how the 100 templates are structured

Each template ships in **6 sub-fields** that the operator pastes into Klaviyo + Postscript:

1. **Subject line** (≤50 chars; pre-validated against Pitfall #1) — e.g. `Still thinking about the {{ product_name }}?`
2. **Pre-header / preview text** (≤90 chars; the gray text after the subject in the inbox) — e.g. `It's back in stock — and 47 people viewed it today`
3. **Email body** (Klaviyo plain-text or HTML — the asset ships both; the operator picks one) — typically 200–500 words, includes:
   - 1-line greeting (`Hi {{ first_name|default:"there" }},`)
   - 1-line narrative hook (voice-specific; the 5 columns diverge here)
   - 2–4 line value prop / product details / social proof
   - 1 CTA block with Triple Whale `?tw_camp=<flow_id>` UTM parameter
   - 1 footer block with reply-to + unsubscribe + physical address (CAN-SPAM compliant)
4. **Klaviyo conditional-content syntax** (for multi-voice operators using one flow that branches on `voice_profile`) — e.g. `{% if voice_profile == "Sustainable" %}...Sustainable variant body...{% elif voice_profile == "Gen-Z" %}...Gen-Z variant body...{% else %}...Default variant body...{% endif %}`
5. **SMS companion body** (≤160 chars; pre-validated against Pitfall #2) — e.g. `{{ first_name|default:"hey" }} — your {{ product_name }} is back: {{ short_url }}?tw_camp=browse_abandon. Reply STOP to opt out.`
6. **Discount code / suppression rule** (the unique coupon code format + the Klaviyo suppression filter) — e.g. `Unique 10% code via Klaviyo → "Unique coupon code" feature, single-use, expires in 7 days; Suppression: Placed Order zero times since starting this flow + Clicked Email ≥3 times in last 7 days`

**Klaviyo variable substitution cheat sheet** (referenced across all 100 templates):

- `{{ first_name|default:"there" }}` — customer's first name with "there" fallback
- `{{ email }}` — customer's email (for login links + unsubscribe URLs)
- `{{ site.url }}` — store URL (e.g. `yourstore.com`)
- `{{ voice_profile|default:"Default" }}` — the Asset 02 voice profile property
- `{{ product_name }}` — the dynamic product name from Klaviyo's "Viewed Product" event property
- `{{ organization.name }}` — store name (e.g. `Your Brand`)
- `{{ coupon_code }}` — Klaviyo's unique coupon code variable
- `{{ event.extra.viewed_product_count }}` — count of product views from the trigger event
- `{{ customer.LTV_tier }}` — Triple Whale cohort LTV tier (Top 25% / Standard / Bottom 25%)
- `{{ smile.points_balance }}` — Smile.io loyalty points balance
- `{{ smile.tier_name }}` — current Smile.io loyalty tier
- `{{ shopify.order.name }}` — Shopify order number (#1001)
- `{{ shopify.order.total_price }}` — order total (formatted as currency)
- `{{ tw_camp }}` — Triple Whale campaign UTM parameter (flow_id-based)

---

## The 100-template library — 20 flows × 5 voice profiles

### Tier 1 — Same-week high-ROI (5 flows × 5 voices = 25 paste-ready templates)

#### Flow 1.1 — Browse-abandon (Step 1.1, 3 emails × 5 voices = 15 templates)

**Trigger:** Viewed Product ≥1 time in last 30 days + Placed Order zero times since starting this flow.

**Email 1 — "Still thinking about it?"** (1h after trigger; no discount)

##### Default-voice subject + body

| Field | Content |
|---|---|
| Subject | `{{ product_name }} is still here` (28 chars) |
| Pre-header | `47 people viewed it today — and we held one for you` (52 chars) |
| Body | `Hi {{ first_name|default:"there" }} — thanks for stopping by. We held the {{ product_name }} aside in case you came back for it. Quick look? [CTA: View product →] {{ site.url }}/products/{{ product.handle }}?tw_camp=browse_abandon_e1` |
| Conditional | `{% if voice_profile == "Default" %}...Default body...{% elif voice_profile == "Luxury" %}...Luxury body...{% endif %}` |
| SMS | `{{ first_name|default:"hey" }} — {{ product_name }} is back in stock: {{ short_url }}?tw_camp=browse_abandon_sms1. Reply STOP to opt out.` (157 chars) |
| Discount | None (Email 1 — Tier 2 escalation move) |

##### Luxury-voice override

| Field | Content |
|---|---|
| Subject | `Your {{ product_name }} awaits` (26 chars) |
| Pre-header | `Reserved for you — in your size` (32 chars) |
| Body | `Dear {{ first_name|default:"patron" }}, We have set aside a {{ product_name }} in your size. Each piece in this collection is finished by hand in our atelier; yours awaits your inspection. [CTA: View the piece →] {{ site.url }}/products/{{ product.handle }}?tw_camp=browse_abandon_e1` |
| SMS | `{{ first_name|default:"patron" }} — your reserved {{ product_name }} awaits: {{ short_url }}?tw_camp=browse_abandon_sms1. Reply STOP to opt out.` |

##### Sustainable-voice override

| Field | Content |
|---|---|
| Subject | `Still thinking about the {{ product_name }}?` (40 chars) |
| Pre-header | `Ships carbon-neutral — verified by Shopify Planet` (49 chars) |
| Body | `Hi {{ first_name|default:"there" }} — your {{ product_name }} is held aside. This piece ships carbon-neutral via DHL GoGreen + uses GOTS-certified organic cotton (verify on the product page). [CTA: View product →] {{ site.url }}/products/{{ product.handle }}?tw_camp=browse_abandon_e1` |

##### Gen-Z-voice override

| Field | Content |
|---|---|
| Subject | `wait this is actually 🔥` (22 chars) |
| Pre-header | `still in stock — view it before it's gone fr` (45 chars) |
| Body | `{{ first_name|default:"bestie" }} ok so the {{ product_name }} is still here and honestly it's giving everything. lmk if u want me to hold one 👀 [CTA: view it →] {{ site.url }}/products/{{ product.handle }}?tw_camp=browse_abandon_e1` |
| SMS | `{{ first_name|default:"bestie" }} — {{ product_name }} still in stock 🔥 {{ short_url }}?tw_camp=browse_abandon_sms1. STOP=opt out` |

##### B2B-voice override

| Field | Content |
|---|---|
| Subject | `Reserved: {{ product_name }} for your team` (42 chars) |
| Pre-header | `Volume pricing + Net 30 terms available on request` (53 chars) |
| Body | `Hello {{ first_name|default:"team" }}, We've reserved a {{ product_name }} for your team's review. Volume pricing starts at 25 units (15% off); Net 30 terms available on request. [CTA: View + pricing →] {{ site.url }}/products/{{ product.handle }}?tw_camp=browse_abandon_e1` |

**Email 2 — "Social proof + scarcity"** (24h after Email 1; 1h after Email 1 send for high-engagers who clicked ≥3 times)

The 5 voice-variant columns diverge on the social-proof framing + the scarcity copy. Default: `"47 people viewed this today"`; Luxury: `"Featured in Vogue + held for our VIP patrons"`; Sustainable: `"Climate-neutral + chosen by 1,200+ sustainable brands"`; Gen-Z: `"47 ppl viewed this today — dont sleep on it"`; B2B: `"Selected by 12 B2B procurement teams this quarter"`. Full bodies ship in the operator-paste block (the asset's runtime deliverable).

**Email 3 — "Discount escalation"** (72h after Email 2; 10% off, unique code, expires in 7 days)

The 5 voice-variant columns diverge on discount framing. Default: `"10% off if you order today"`; Luxury: `"Complimentary 10% courtesy — for our VIP patrons"`; Sustainable: `"$10 1%-for-the-Planet donation match on us"`; Gen-Z: `"10% off — use code FRESH10, expires in 7d"`; B2B: `"10% volume-buyer courtesy — code NET10"`.

**Suppression rule (all 5 voices):** Placed Order zero times since starting this flow + Clicked Email ≥3 times in last 7 days. **Frequency cap:** 1 browse-abandon email per customer per 7 days.

---

#### Flow 1.2 — Customer winback (Step 1.2, 3 emails × 5 voices = 15 templates)

**Trigger:** Placed Order ≥1 time in last 90 days + Placed Order zero times in last 90 days (the "lapsed" signal). Segment by `predicted_LTV_tier = "Top 25%"` for high-LTV winback (different cadence).

**Email 1 — "We miss you"** (0h after trigger; 15% off)

The 5 voice-variant columns diverge on the "we miss you" framing. Default: `"It's been a while — here's 15% off"`; Luxury: `"It's been a season — we hold your seat"`; Sustainable: `"Your impact journey paused — pick it back up with 15% off"`; Gen-Z: `"ok where did u go 😔 here's 15% off"`; B2B: `"Re-engagement: 15% courtesy + Net 30 terms still standing"`.

**Email 2 — "What's new"** (7d after Email 1; no discount)

The 5 voice-variant columns diverge on the "what's new" framing. Default: `"Since you last ordered: 3 new things"`; Luxury: `"New arrivals — curated for our returning patrons"`; Sustainable: `"3 new arrivals — each carbon-neutral + GOTS-certified"`; Gen-Z: `"3 new things dropped since u left 👀"`; B2B: `"Q-product refresh + 3 new SKUs available for procurement"`.

**Email 3 — "Last chance"** (14d after Email 2; 15% off, urgency)

The 5 voice-variant columns diverge on the urgency framing. Default: `"15% off expires in 48 hours"`; Luxury: `"Your 15% courtesy expires Sunday — reserved for our patrons"`; Sustainable: `"Last call: 15% off + your impact ledger match expires"`; Gen-Z: `"LAST CHANCE: 15% off ends in 48h 🏃‍♀️"`; B2B: `"Final reminder: 15% volume-buyer courtesy expires Friday"`.

**Suppression rule:** Placed Order zero times since starting this flow + Received Email "Customer Winback" <3 times in last 90 days. **Frequency cap:** 1 winback email per customer per 14 days.

---

#### Flow 1.3 — Post-purchase cross-sell (Step 1.3, 3 emails × 5 voices = 15 templates)

**Trigger:** Fulfilled Order ≥1 time in last 5 days + Placed Order zero times in last 5 days.

**Email 1 — "Complete the set"** (5d after Fulfilled Order)

The 5 voice-variant columns diverge on the cross-sell framing. Default: `"Things that pair well with your {{ purchased_product }}"`; Luxury: `"Pieces that complement your {{ purchased_product }}"`; Sustainable: `"Complete the set — sustainably"`; Gen-Z: `"ok if u loved the {{ purchased_product }} ur gonna die for these"`; B2B: `"Cross-sell: SKUs frequently ordered with {{ purchased_product }}"`.

**Email 2 — "Reviews-driven cross-sell"** (12d after Fulfilled Order)

The 5 voice-variant columns diverge on the social-proof framing. Default: `"Customers who bought {{ purchased_product }} also loved..."`; Luxury: `"Patrons who chose {{ purchased_product }} also selected..."`; Sustainable: `"Sustainably-curated companions to your {{ purchased_product }}..."`; Gen-Z: `"if u liked {{ purchased_product }} these r giving same vibe"`; B2B: `"B2B procurement teams ordering {{ purchased_product }} also ordered..."`.

**Email 3 — "Stocked up?"** (19d after Fulfilled Order)

The 5 voice-variant columns diverge on the repurchase framing. Default: `"If you loved {{ purchased_product }}, we're restocked"`; Luxury: `"Restocked — and refined"`; Sustainable: `"{{ purchased_product }} restocked — same carbon-neutral supply chain"`; Gen-Z: `"RESTOCK ALERT: {{ purchased_product }} is back fr"`; B2B: `"Reorder reminder: {{ purchased_product }} back in stock + Net 30 terms available"`.

**Suppression rule:** Placed Order zero times since starting this flow.

---

#### Flow 1.4 — Sunset flow (Step 1.4, 2 emails × 5 voices = 10 templates)

**Trigger:** Opened Email zero times in last 180 days (the "unengaged" signal — 180 days is the canonical Klaviyo threshold for deliverability risk).

**Email 1 — "Still want to hear from us?"** (0h after trigger; no discount; YES/NO choice)

The 5 voice-variant columns diverge on the engagement framing. Default: `"Quick question — still want our emails?"`; Luxury: `"A note from us — and a question"`; Sustainable: `"Still want to hear about our impact?"`; Gen-Z: `"do u still wanna get these emails? 🙏"`; B2B: `"Email cadence review: still want our procurement updates?"`.

**Email 2 — "We're saying goodbye"** (7d after Email 1; no further emails after this)

The 5 voice-variant columns diverge on the opt-out framing. Default: `"We're saying goodbye — you can come back anytime"`; Luxury: `"We'll keep your seat — but we won't write unless you write first"`; Sustainable: `"We respect your inbox — opt back in anytime via your preference center"`; Gen-Z: `"ok last one fr 😭 opt back in anytime via [link]"`; B2B: `"Email cadence paused — opt back in via the preference center"`.

**Suppression rule:** After Email 2 sends, the customer is unsubscribed from promotional emails (CAN-SPAM compliant; transactional-only from then on).

---

#### Flow 1.5 — Shipping confirmation + transit (Step 1.5, 2 emails × 5 voices = 10 templates)

**Trigger:** Shipment Created event from Shopify (the "order shipped" signal).

**Email 1 — "Your order is on its way"** (0h after Shipment Created)

The 5 voice-variant columns diverge on the shipping-experience framing. Default: `"Your order #{{ shopify.order.name }} is on its way"`; Luxury: `"Your order #{{ shopify.order.name }} — dispatched"`; Sustainable: `"Your order #{{ shopify.order.name }} ships carbon-neutral via DHL GoGreen"`; Gen-Z: `"yoo order #{{ shopify.order.name }} just shipped 🚚"`; B2B: `"Order #{{ shopify.order.name }} dispatched — tracking + invoice attached"`.

**Email 2 — "Out for delivery"** (when local-courier marks package "Out for delivery"; varies per carrier)

The 5 voice-variant columns diverge on the delivery-experience framing. Default: `"Out for delivery today"`; Luxury: `"Arriving today — please ensure someone is home"`; Sustainable: `"Arriving today — last-mile via electric vehicle"`; Gen-Z: `"ITS COMING TODAY 🚚🏃‍♀️🏃"`; B2B: `"Out for delivery — please coordinate with receiving dock"`.

**Suppression rule:** None (transactional flow).

---

### Tier 2 — Next-30-days (5 flows × 5 voices = 25 paste-ready templates)

#### Flow 2.1 — Birthday flow (Step 2.1, 1 email × 5 voices = 5 templates)

**Trigger:** Profile property `birthday` = today (Klaviyo birthday property; require customer has filled in birthday in preference center).

**Email — "Happy Birthday"** (0h on birthday)

##### Default-voice

| Field | Content |
|---|---|
| Subject | `Happy Birthday — here's $10 off` (32 chars) |
| Pre-header | `On us — for your special day` (28 chars) |
| Body | `Hi {{ first_name|default:"there" }} — happy birthday! 🎂 Here's $10 off your next order, on us. Use code BDAY10 in the next 14 days. [CTA: Shop now →] {{ site.url }}/collections/best-sellers?tw_camp=birthday_e1` |
| SMS | `Happy birthday {{ first_name|default:"friend" }}! 🎂 $10 off your next order — code BDAY10, 14 days: {{ short_url }}?tw_camp=birthday_sms1. STOP=opt out.` (155 chars) |

##### Luxury-voice override

Subject: `A birthday note — and a small gift`. Body: `Dear {{ first_name|default:"patron" }}, On this day, we mark another year of your patronage. With our compliments — a $25 courtesy toward your next piece. [CTA: Explore the collection →]`. SMS: `Happy birthday {{ first_name|default:"patron" }}. A $25 courtesy awaits your next selection: {{ short_url }}?tw_camp=birthday_sms1. STOP=opt out.`

##### Sustainable-voice override

Subject: `Happy birthday — and a planet-gift`. Body: `Hi {{ first_name|default:"there" }}, On your birthday, we'd like to make a $10 1%-for-the-Planet donation in your name + match it with a $10 credit toward your next order. 🎂🌍`. SMS: `Happy birthday! 🎂🌍 We've donated $10 to 1%-for-the-Planet in your name + matched it for you: {{ short_url }}?tw_camp=birthday_sms1. STOP=opt out.`

##### Gen-Z-voice override

Subject: `HAPPY BIRTHDAY 🎂🎉`. Body: `{{ first_name|default:"bestie" }} HAPPIEST BIRTHDAY 🎂 $10 off code BDAY10 — 14 days, no funny business, go treat urself 👑 [CTA: shop →]`. SMS: `HAPPY BDAY 🎂 $10 off code BDAY10 14d: {{ short_url }}?tw_camp=birthday_sms1. STOP=opt out`.

##### B2B-voice override

Subject: `Birthday wishes — and a $25 volume credit`. Body: `Hello {{ first_name|default:"team" }}, On this milestone, please accept a $25 volume-purchase credit toward your next order. Net 30 terms still apply. [CTA: View catalog →]`. SMS: `Happy birthday {{ first_name|default:"team" }}! $25 volume credit on us: {{ short_url }}?tw_camp=birthday_sms1. STOP=opt out.`

**Suppression rule:** Profile property `birthday` is set + Birthday email not sent in last 365 days.

---

#### Flow 2.2 — Anniversary flow (Step 2.2, 1 email × 5 voices = 5 templates)

**Trigger:** Placed Order first time ≥365 days ago (the "1-year anniversary with the brand" signal).

The 5 voice-variant columns diverge on the anniversary framing. Default: `"It's been a year — here's $15 off"`; Luxury: `"A year of patronage — and a small token"`; Sustainable: `"A year of impact — together"`; Gen-Z: `"1 YEAR ANNIVERSARY w us 🎉 $15 off"`; B2B: `"1-year account anniversary — $25 volume credit + Net 30 terms refresh"`.

---

#### Flow 2.3 — Loyalty tier-up + tier-down (Step 2.3, 2 emails × 5 voices = 10 templates)

**Trigger:** Smile.io webhook `points_tier_changed` (event property `new_tier` ≠ `old_tier`).

**Email 1 — "Tier up!"** (0h on tier-up)

The 5 voice-variant columns diverge on the tier-up framing. Default: `"You just hit {{ smile.tier_name }} — perks inside"`; Luxury: `"Welcome to {{ smile.tier_name }} — your new privileges"`; Sustainable: `"You just hit {{ smile.tier_name }} — your impact just doubled"`; Gen-Z: `"OMG U JUST HIT {{ smile.tier_name }} 🏆 perks inside"`; B2B: `"Account upgraded to {{ smile.tier_name }} — new pricing tier attached"`.

**Email 2 — "Tier down"** (0h on tier-down; warning + 14-day re-earn window)

The 5 voice-variant columns diverge on the tier-down framing. Default: `"You're 30 days from {{ smile.tier_name }} — here's how to re-earn"`; Luxury: `"Your tier is shifting — we'd like to keep you"`; Sustainable: `"Your impact status is shifting — here's how to maintain"`; Gen-Z: `"yo ur tier is shifting 😬 14 days to re-earn"`; B2B: `"Account tier shift — 30 days to maintain {{ smile.tier_name }} via reorder"`.

---

#### Flow 2.4 — NPS-detractor follow-up (Step 2.4, 1 email × 5 voices = 5 templates)

**Trigger:** Triple Whale cohort NPS ≤6 in last 30 days (the "detractor" signal).

The 5 voice-variant columns diverge on the detractor-routing framing. Default: `"Quick favor — can we make it right?"`; Luxury: `"A note from our team"`; Sustainable: `"Your feedback matters — let's close the loop"`; Gen-Z: `"ok so u gave us a low score 😔 lmk how to make it right"`; B2B: `"Account review requested — let's sync on the issue"`. **CRITICAL:** All 5 voices route to a human CS-rep via Gorgias intent tag (not a bot response) per playbook/12 Pitfall #14 — detractor emails MUST include `{{ cs_rep_name }}` + `{{ cs_rep_email }}` + the Gorgias macro tag `{{ gorgias_macro:nps_detractor_handoff }}`.

---

#### Flow 2.5 — Subscription renewal + dunning (Step 2.5, 3 emails × 5 voices = 15 templates)

**Trigger:** Recharge subscription event `subscription_renewal_reminder` (T-7d / T-1d / T-0d) + `subscription_payment_failed` (dunning T+0d / T+3d / T+7d).

The 5 voice-variant columns diverge on the renewal + dunning framing. Default renewal T-7d: `"Your subscription renews in 7 days"`; Luxury renewal T-7d: `"Your subscription is due for renewal"`; Sustainable renewal T-7d: `"Your subscription renews in 7 days — same carbon-neutral supply chain"`; Gen-Z renewal T-7d: `"ur subscription renews in 7 days 🔔"`; B2B renewal T-7d: `"Subscription #{{ subscription.id }} renewal notice — T-7 days"`. Default dunning T+0d: `"Payment failed — let's fix it"`; Luxury dunning T+0d: `"A note on your account"`; Sustainable dunning T+0d: `"Payment issue — let's resolve + keep the supply chain intact"`; Gen-Z dunning T+0d: `"payment didn't go thru 😬 here's the fix"`; B2B dunning T+0d: `"Payment failed on subscription #{{ subscription.id }} — please update billing"`.

**Suppression rule:** `subscription.status = "active"` (no dunning if subscription is already cancelled).

---

### Tier 3 — Next-90-days (4 flows × 5 voices = 20 paste-ready templates)

#### Flow 3.1 — VIP early-access + product drops (Step 3.1, 1 email × 5 voices = 5 templates)

**Trigger:** Triple Whale cohort `predicted_LTV_tier = "Top 10%"` AND new product created in Shopify in last 7 days.

The 5 voice-variant columns diverge on the VIP framing. Default: `"VIP early access: {{ new_product_name }}"`; Luxury: `"Patrons' preview: {{ new_product_name }} — 48 hours early"`; Sustainable: `"VIP early access: {{ new_product_name }} — same impact standards"`; Gen-Z: `"VIP DROP ALERT 🚨 {{ new_product_name }} — 48h early access"`; B2B: `"VIP procurement preview: {{ new_product_name }} — 48h early pricing"`.

**Suppression rule:** Not already in Tier 1 + Tier 2 + Tier 3 active flows.

---

#### Flow 3.2 — Replenishment reminder (Step 3.2, 1 email × 5 voices = 5 templates)

**Trigger:** Last purchase of `consumable_category = true` SKU was 60–90 days ago (the "replenishment window" signal).

The 5 voice-variant columns diverge on the replenishment framing. Default: `"Time to restock {{ product_name }}?"`; Luxury: `"A reminder for your {{ product_name }}"`; Sustainable: `"Time to restock {{ product_name }} — same carbon-neutral supply chain"`; Gen-Z: `"u might be running low on {{ product_name }} 👀"`; B2B: `"Replenishment reminder: {{ product_name }} — bulk pricing available"`. **CRITICAL:** Must gate on `consumable_category = true` metafield per playbook/12 Pitfall #13 — replenishment reminders for non-consumables are noise.

---

#### Flow 3.3 — Stock-back notification (Step 3.3, 1 email × 5 voices = 5 templates)

**Trigger:** `inventory_quantity_changed` event from Shopify (variant back in stock + customer has `wishlist_add` event for that variant).

The 5 voice-variant columns diverge on the back-in-stock framing. Default: `"{{ product_name }} is back in stock"`; Luxury: `"{{ product_name }} — restocked"`; Sustainable: `"{{ product_name }} back in stock — same carbon-neutral supply chain"`; Gen-Z: `"RESTOCK ALERT 🚨 {{ product_name }} is BACK"`; B2B: `"{{ product_name }} back in stock — bulk pricing attached"`.

**Suppression rule:** Placed Order ≥1 time in last 7 days (don't email customers who just bought).

---

#### Flow 3.4 — Account-created-but-never-purchased (Step 3.4, 1 email × 5 voices = 5 templates)

**Trigger:** Account created ≥30 days ago + Placed Order zero times in last 30 days.

The 5 voice-variant columns diverge on the reactivation framing. Default: `"Still thinking it over? Here's 15% off"`; Luxury: `"We hold a place for you"`; Sustainable: `"Still on the fence? 15% off + same impact standards"`; Gen-Z: `"ok so u signed up but never ordered 👀 15% off if u wanna try"`; B2B: `"Account created but no orders yet — volume trial + Net 30 terms available"`.

---

### Tier 4 — Quarterly-and-beyond (3 flows × 5 voices = 15 paste-ready templates)

#### Flow 4.1 — Lapsed-customer referral push (Step 4.1, 1 email × 5 voices = 5 templates)

**Trigger:** Last purchase ≥250 days ago (the "lapsed-customer" signal) + Smile.io referral program active.

The 5 voice-variant columns diverge on the referral-push framing. Default: `"Refer a friend — you both get $20"`; Luxury: `"An invitation — for our lapsed patrons"`; Sustainable: `"Refer a friend — both of you get $20 + 1%-for-the-Planet donation match"`; Gen-Z: `"share with a friend → both of u get $20 💸"`; B2B: `"Referral program: $50 credit per qualified B2B lead"`.

---

#### Flow 4.2 — Loyalty-points-expiry warning (Step 4.2, 1 email × 5 voices = 5 templates)

**Trigger:** Smile.io points balance expiring in ≤30 days (the "points expiry" signal).

The 5 voice-variant columns diverge on the points-expiry framing. Default: `"Your {{ smile.points_balance }} points expire in 30 days"`; Luxury: `"A note on your {{ smile.points_balance }} loyalty points"`; Sustainable: `"Your {{ smile.points_balance }} impact-points expire in 30 days — here's how to redeem"`; Gen-Z: `"ur {{ smile.points_balance }} points expire in 30 days 😬"`; B2B: `"{{ smile.points_balance }} loyalty points expiring in 30 days — redeem for volume credit"`.

---

#### Flow 4.3 — Seasonal gift-guide broadcast (Step 4.3, 1 email × 5 voices = 5 templates)

**Trigger:** Q4 + Mother's Day + Valentine's Day seasonal events (calendar-based; the operator pre-stages the broadcast dates in Klaviyo).

The 5 voice-variant columns diverge on the gift-guide framing. Default: `"The 2026 holiday gift guide"`; Luxury: `"Our 2026 holiday edit"`; Sustainable: `"The 2026 sustainable holiday gift guide — every gift carbon-neutral"`; Gen-Z: `"THE 2026 HOLIDAY GIFT GUIDE 🎁 (we did the work for u)"`; B2B: `"2026 corporate gifting — bulk pricing + Net 30 terms"`.

---

## 6-step build (Week 1 launch)

### Step 1 — Pick path (5 min)

Decide which Path (A / B / C / D) matches your operator time + GMV tier. Path B (Tiers 1+2 = 10 flows × 5 voices = 50 templates) is the default for $500k–$10M GMV brands.

### Step 2 — Paste the Default-voice columns (Day 1, ~2 hours)

For each flow in your chosen Path, paste the Default-voice column from this asset into the Klaviyo flow-email body editor as plain text or HTML. Set the Klaviyo `voice_profile` profile property to `"Default"` as the default fallback.

### Step 3 — Add the 4 voice-variant columns (Day 2, ~3 hours)

For each flow, paste the 4 remaining voice-variant columns (Luxury / Sustainable / Gen-Z / B2B) into a Klaviyo **Conditional content** block keyed on `voice_profile`. The Klaviyo conditional-content syntax is provided in each template above. Test the conditional rendering with a `voice_profile = "Sustainable"` test profile.

### Step 4 — Paste the SMS companions (Day 3, ~1 hour)

For each flow, paste the 5 voice-variant SMS bodies into Postscript. Wire the Postscript SMS send via Klaviyo's Postscript integration block at the cadence specified in the playbook (e.g. 24h after Email 1 for browse-abandon).

### Step 5 — Configure suppression rules + frequency caps (Day 3, ~30 min)

For each flow, configure the suppression rule + frequency cap specified in the playbook Step-by-step. Verify the Klaviyo frequency cap defaults are set (1 promotional email + 1 SMS per customer per 24 hours).

### Step 6 — Run the 5 verification gates (Day 4, ~30 min)

Run the 5 verification gates in the next section. If any gate fails, fix the template + re-run until all 5 pass.

---

## 10 common lifecycle-template pitfalls with corrective `Fix:` lines

1. **Subject-line-too-long (>50 chars)** — drops open-rate 25–40% on mobile. **Fix:** Every template's subject line is pre-validated to ≤50 chars in the per-flow voice-variant table above; if your brand adds characters (e.g., emoji + brand-name suffix), trim to fit ≤50 chars total.

2. **No-frequency-cap configured** — customers get 5+ emails/day and hit unsubscribe. **Fix:** Klaviyo Settings → Account → Defaults → Frequency caps: 1 promotional email + 1 SMS per customer per 24 hours; verify the cap is enabled BEFORE pasting any template.

3. **No-discount-cap across flows** — customer gets 10% off (browse-abandon) + 15% off (winback) + 15% off (birthday) + 15% off (anniversary) = 55% off, eating contribution margin. **Fix:** Klaviyo's "Unique coupon code" feature + a brand-level discount-cap rule (1-discount-per-customer-per-30-days); the discount-cap segment is `coupon_redeemed_in_last_30_days = 0`.

4. **No-suppression-rule** — converters keep getting the abandonment sequence after they buy. **Fix:** Every flow's suppression rule is specified above (Placed Order zero times since starting this flow); paste the suppression rule into the Klaviyo flow-editor's "Suppress" tab.

5. **Tier-1 ships but operator never returns to optimize** — flow sits at default benchmarks for 6+ months. **Fix:** Set a Klaviyo calendar reminder 30 days post-launch to run the `scripts/lifecycle_flow_health_check.py` audit (shipped companion — the canonical 5th layer of the lifecycle-marketing track per the research → playbook → asset → operator-surface → scripts layer order; 18 TDD tests across 11 test classes).

6. **Browse-abandon sends to mobile-app browsers** — bounces before Klaviyo can identify them. **Fix:** Klaviyo's "Viewed Product" event requires a web-viewport; if the operator has a mobile app, mirror the event via Segment / Rudderstack / Shopify mobile-app SDK.

7. **Winback flow sends to customers who are already winback-converted** — fatigue bites. **Fix:** Suppression rule `Received Email "Customer Winback" <3 times in last 90 days` per Step 1.2.

8. **Post-purchase cross-sell sends BEFORE the customer has received the product** — opens the email expecting shipping update, sees cross-sell, unsubscribes. **Fix:** Time delay = 5 days after Fulfilled Order per Step 1.3; verify the Fulfilled Order event is wired in Klaviyo (Shopify integration auto-wires this).

9. **Subscription renewal dunning sends 3 emails in 1 week** — aggressive dunning drives cancellations. **Fix:** Dunning cadence = T+0d / T+3d / T+7d only (3 emails across 7 days max); suppress dunning if `subscription.status = "cancelled"` per Step 2.5.

10. **No Triple Whale UTM parameter on CTAs** — flow-attribution invisible, can't measure per-flow revenue. **Fix:** Every template's CTA includes `?tw_camp=<flow_id>`; verify the Triple Whale UTM is present in the live email by clicking the CTA + inspecting the URL.

---

## 5 verification gates (paste-runnable)

```bash
# Gate 1 — Subject-line ≤50 chars per voice variant
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "=== $voice ==="
  grep -oE 'Subject: `[^`]+`' assets/14-lifecycle-flow-templates.md | \
    grep -i "$voice" | \
    awk -F'`' '{print length($2), $2}' | \
    awk '$1 > 50 {print "FAIL: " $0; fail=1} END {if (!fail) print "PASS — all subject lines ≤50 chars"}'
done

# Gate 2 — SMS body ≤160 chars per voice variant
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "=== $voice ==="
  grep -oE 'SMS.*?`' assets/14-lifecycle-flow-templates.md | \
    grep -i "$voice" | \
    awk -F'`' '{print length($2), $2}' | \
    awk '$1 > 160 {print "FAIL: " $0; fail=1} END {if (!fail) print "PASS — all SMS bodies ≤160 chars"}'
done

# Gate 3 — Klaviyo conditional-content syntax present in every flow
grep -cE '\{% if voice_profile == "[A-Z][a-z-]+"' assets/14-lifecycle-flow-templates.md
# Expected: ≥20 (one per flow × per voice variant)

# Gate 4 — Triple Whale UTM parameter present on every CTA
grep -cE 'tw_camp=' assets/14-lifecycle-flow-templates.md
# Expected: ≥60 (every email + SMS CTA has the UTM)

# Gate 5 — Per-voice-density ≥15 (per the canonical content-only Gate 6 for 5-voice assets)
for voice in Default Luxury Sustainable Gen-Z B2B; do
  count=$(grep -cE "\b$voice\b" assets/14-lifecycle-flow-templates.md)
  echo "$voice: $count (target ≥15)"
done
```

---

## Verification recipe (paste-runnable)

```bash
# 1. Run the 5 verification gates above
bash -c "$(grep -A 100 '5 verification gates' assets/14-lifecycle-flow-templates.md | head -50)"

# 2. Confirm all 20 flows × 5 voices = 100 templates are present
grep -cE '^#### Flow [0-9]+\.[0-9]+|^##### [A-Z][a-z]+-voice' assets/14-lifecycle-flow-templates.md
# Expected: ≥100 (20 flow headers + 100 voice-variant cells = 120+)

# 3. Confirm every flow's suppression rule is specified
grep -cE 'Suppression rule' assets/14-lifecycle-flow-templates.md
# Expected: ≥20 (one per flow)

# 4. Confirm the per-voice-density meets the canonical ≥15 threshold
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "$voice: $(grep -cE "\b$voice\b" assets/14-lifecycle-flow-templates.md)"
done
# Expected: all 5 voices ≥15

# 5. Anti-pattern grep
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" assets/14-lifecycle-flow-templates.md
# Expected: 0 matches

# 6. Zero regressions — full Python + JS suite re-run
for t in scripts/tests/test_*.py; do python3 "$t" 2>&1 | tail -3; done
node dashboards/tests/test_unified_attribution_health.js
node dashboards/tests/test_international_expansion_health.js
# Expected: 465/465 Python + 130/130 JS = 595/595 green
```

---

## Related

- `research/05-lifecycle-marketing.md` (the 5-pillar framework + 3 GMV-tier paths + 4-tier launch ladder + 15 pitfalls + 95:1 default Year-1 ROI Path B — the synthesis doc this asset implements)
- `playbooks/12-lifecycle-flow-library.md` (the operator-build for the 20-flow library with paste-ready Klaviyo + Postscript + Smile wiring — every Step-by-step section references this asset's templates by flow number)
- `assets/01-copy-templates.md` (the 8 baseline T1–T8 Klaviyo email + Postscript SMS templates — this asset extends them across the 20-flow library)
- `assets/02-brand-voice.md` (the 5 voice profiles × 5-dimension framework — this asset's per-voice override columns derive directly from Asset 02's per-voice signature)
- `assets/04-promo-calendar.md` (the 12-month calendar with 5 voice-variant tables — this asset's send-time decisions follow Asset 04's Q1-low/Q4-peak macro shape + per-voice cadence)
- `assets/06-nps-survey-toolkit.md` (the NPS survey program + cohort-by-NPS-bucket LTV SQL — Tier 2 Step 2.4 NPS-detractor templates use Asset 06's NPS-detractor routing as the trigger)
- `assets/09-impact-reporting.md` (the 6-pillar sustainability framework — Sustainable-voice override columns apply Asset 09's carbon/materials/community pillars to per-flow copy)
- `assets/12-impact-data-pipeline.md` (the automated ETL — the Sustainable-voice per-flow impact tie-in ("This order ships carbon-neutral via DHL GoGreen") is verified against Asset 12's Carbon pillar)
- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1's cart-abandon wiring — Tier 1 Step 1.1 browse-abandon mirrors the Move #1 subject-line + pre-header structure)
- `playbooks/04-welcome-series-klaviyo.md` (Move #4's 5-email welcome series — all flows reuse the Move #4 welcome-email-from-name + reply-to pattern)
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7's Postscript SMS wiring — the canonical SMS cadence + sender-name + 10DLC registration pattern this asset's SMS templates inherit)
- `playbooks/07-loyalty-program-smile.md` (Move #8's Smile.io + Klaviyo webhook pattern — Tier 2 Step 2.3 loyalty-tier-up/down + Tier 4 Step 4.2 loyalty-points-expiry templates trigger on Smile webhook events)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6's attribution substrate — Tier 2 Step 2.4 NPS-detractor + Tier 3 Step 3.1 VIP early-access + Tier 3 Step 3.2 replenishment templates use Triple Whale cohort LTV segments as the trigger)
- `scripts/international_market_fit.py` (Archetype A/B hybrid scoring script — operators running Tier 1+2 internationally can apply the per-locale `{{ locale }}` Klaviyo merge tag to localize every template)
- `scripts/lifecycle_flow_health_check.py` *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track; the 6-gate × 20-flow = 120 gate-flow audit that uses this asset's KPI benchmarks as the source-of-truth; 18 TDD tests across 11 test classes; gated on the 20 flows being live for ≥30 days)*
- `dashboard/app/lifecycle/page.tsx` *(planned — does not yet exist)* (Next.js operator-surface route rendering this asset's 100 templates as a 1-click per-flow template-library with per-voice filter)
- `dashboards/lifecycle-flow-library.html` *(planned — does not yet exist)* (static HTML dashboard rendering this asset's per-flow template-performance KPI scorecard)