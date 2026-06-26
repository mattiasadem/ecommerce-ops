# Asset 02 — Brand Voice Profiles & Adaptation Guide

> **Companion to Asset 01 (`assets/01-copy-templates.md`).** Asset 01's 8 templates assume a default "confident + plain + lightly irreverent" voice. This asset gives you 4 alternative voice profiles + the 5-dimension voice framework that lets you adapt every template to your brand's actual voice. Operator reads Asset 02 once, picks the profile that matches the brand, swaps the voice lines in 1-2 templates, ships.
>
> **Companion playbooks:** `playbooks/04-welcome-series-klaviyo.md` (the welcome flow that drives every downstream email + SMS sequence), `playbooks/01-abandoned-cart-flow-klaviyo.md` (the highest-ROI flow — adapt Template 2 + Template 3 here first), `playbooks/06-sms-welcome-and-cart-abandon.md` (SMS templates).
>
> **Companion asset:** `assets/01-copy-templates.md` — the 8 paste-ready templates that this asset teaches you to adapt. Every voice profile below contains a worked adapted variant of Asset 01's Template 1 (Email Welcome #1) so you can see the adaptation in one diff.

---

## Goal

Give a brand-new operator an immediately-usable voice framework that:

- **5 voice profiles** covering the most common brand types in DTC: Default (confident + plain + lightly irreverent) / Luxury (refined + quiet + maximalist grammar) / Sustainable / eco (warm + earnest + educational) / Gen-Z playful (high-energy + lowercase + meme-aware) / B2B / professional (precise + benefit-led + no jokes).
- **5-dimension voice framework** (formality / humor / brand-name usage / price disclosure / objection handling) — every profile is defined as a position on each dimension. Operators can interpolate between profiles (e.g. "luxury + slightly warmer" = refined + earnest) instead of picking from a fixed menu.
- **Worked adapted Template 1 for each profile** — operators see the diff between Default and their target voice in one side-by-side block. After reading, they can adapt any of Asset 01's other 7 templates in 5-15 minutes per template.
- **Decision matrix** at the bottom — operators answer 3-5 questions about their brand and the matrix recommends a profile (Default / Luxury / Sustainable / Gen-Z / B2B).
- **Common pitfalls** list (10 named, each with corrective Fix line) — the mistakes operators make when they skip voice work (using "Dear valued customer" / writing in third person / over-using emojis / undercutting premium pricing with discount-led copy).
- **Verification gates** (5 gates per template after adaptation) — the runnable check that the adapted voice passes a quick smoke test before activating the flow.
- **Sibling-consistency**: every voice profile maps to 1+ playbooks where the operator can read the deeper strategy behind the voice choice (Move #4 welcome series = where voice matters most; Move #7 SMS = where character counts compress voice to its essence).

---

## The 5-dimension voice framework

Before picking a profile, understand the dimensions. Every brand sits on each dimension somewhere on a 1-5 scale:

| Dimension | 1 (most casual) | 5 (most formal) |
|---|---|---|
| **Formality** | "Hey 👋" | "Dear Valued Customer," |
| **Humor** | Self-deprecating, meme-aware, jokes in every email | None — copy is serious and reverent |
| **Brand-name usage** | "we" / "us" / never the brand name | "[Brand Name]" used as proper noun, often capitalized |
| **Price disclosure** | "from $49" / lead with discount | "$49.00 MSRP" / discount framed as "complimentary" or "introductory pricing" |
| **Objection handling** | Joke through it ("yeah, we're addicted too") | Address head-on with proof point + credential |

Default Asset 01 voice = **Formality 2 / Humor 3 / Brand-name 2 / Price 2 / Objection 3**.

The 5 profiles below are canonical positions on these 5 dimensions. Operators whose brand sits between two profiles should interpolate (use one profile's Formality + another profile's Objection handling).

---

## Profile 1 — Default (confident + plain + lightly irreverent)

> **Position:** Formality 2 / Humor 3 / Brand-name 2 / Price 2 / Objection 3
> **When to use:** the canonical DTC default — direct-to-consumer brands selling $30-$200 products to 25-45-year-old shoppers. Works for skincare, supplements, home goods, accessories, apparel.
> **When NOT to use:** luxury (>$300 AOV with strong brand heritage), B2B / wholesale, sustainability-led brands where earnestness matters, Gen-Z-targeted brands where lowercase + meme fluency is expected.

**Voice rules:**

- "we" not "Brand Name Co." — write like a person, not a company
- Contractions everywhere (we're, you'll, it's)
- Light humor: 1 joke or self-aware aside per long-form email, never on transactional SMS
- Lead with the customer benefit, mention the brand 1-2 times max per email
- Prices as "$49" not "$49.00" — discount led with the percentage ("10% off") not the dollar amount
- Objections handled with a proof point + a one-line reassurance ("don't worry — full refund within 30 days, no questions")

**Worked Template 1 (Email Welcome #1) — Default variant:**

```
Subject: Welcome — here's your 10% off
Preview:  Your code is inside · expires in 7 days

Hi {{ first_name|default:"there" }} — thanks for joining us.

Here's what to expect: about 2 emails a week, easy unsubscribe
in one click, never spam. Today you've got a 10% discount
waiting for you inside.

[LEAD MAGNET BLOCK]
- Skincare routine PDF: [download link]
- Quiz results: [results link]

WHY OUR CUSTOMERS STAY
- "Best [product] I've tried, full stop." — Sarah M., verified buyer
- Free shipping on $50+ · 30-day no-questions returns

[CTA] Browse our bestsellers → {{ site.url }}/collections/best-sellers

YOUR CODE: WELCOME10 (single use, expires in 7 days)

— The team
```

This is essentially the Asset 01 Template 1 as-shipped — Default voice IS the Asset 01 default.

---

## Profile 2 — Luxury (refined + quiet + maximalist grammar)

> **Position:** Formality 4 / Humor 1 / Brand-name 4 / Price 4 / Objection 4
> **When to use:** premium / luxury brands with $300+ AOV, strong heritage or craftsmanship story, older or higher-income customer base (35-65), small-but-loyal list. Examples: high-end jewelry, designer apparel, premium fragrance, fine leather goods, vintage or curated home.
> **When NOT to use:** any brand running frequent discount promotions (luxury voice + "10% off" reads as inauthentic); brands targeting Gen-Z shoppers; brands where the founder/team personality is a core differentiator (luxury voice obscures founder voice).

**Voice rules:**

- Full sentences, no contractions ("we are" not "we're"; "you will" not "you'll"; "it is" not "it's")
- No humor — every line carries weight; reserve one quiet line of personality per email (the founder's note, a craft detail, a museum reference)
- Brand name used as a proper noun, often italicized or set in small caps; never "we" alone — "the Maison" / "the House" / "the Atelier"
- Prices as "$49.00" or "$49 USD" — discounts framed as "complimentary" / "introductory pricing" / "as a welcome gesture" — never "10% off" alone
- Objections handled with credentials + heritage ("each piece is hand-finished in our atelier in Florence; we have been making leather goods since 1962")

**Worked Template 1 (Email Welcome #1) — Luxury variant:**

```
Subject: Welcome to {{ company.name }}
Preview:  A complimentary 10% saving awaits · valid seven days

Dear {{ first_name|default:"Friend" }},

Thank you for joining the House of {{ company.name }}. We are
delighted to welcome you.

In the days ahead, you will hear from us no more than twice each
week. Each message is composed with care; you may unsubscribe at
any moment using the link at the foot of this letter.

As a welcome gesture, we are pleased to extend a complimentary
10% saving on your first commission, valid for seven days from
today.

[A QUIET BRAND STORY BLOCK]
Since [year], the House has [one-line craft/heritage statement].
Each piece is [one-line craft detail].

[CTA] Discover the Collection → {{ site.url }}/collections/featured

YOUR CODE: WELCOME10 (single use, valid seven days)

With warm regards,
The House of {{ company.name }}
```

**Adaptation diff (Luxury vs Default):**

- "Hi" → "Dear" + comma + capitalized name
- "thanks for joining us" → "Thank you for joining the House of {{ company.name }}"
- "we're" / "we will" / "it's" → "we are" / "you will" / "it is"
- "10% off" → "complimentary 10% saving"
- "The team" → "The House of {{ company.name }}"
- "Browse our bestsellers" → "Discover the Collection"
- Add a one-line heritage statement
- No humor, no contractions, no casual punctuation

---

## Profile 3 — Sustainable / eco (warm + earnest + educational)

> **Position:** Formality 3 / Humor 2 / Brand-name 3 / Price 2 / Objection 4
> **When to use:** sustainability-led brands where the materials / sourcing / carbon story is a primary purchase driver. Customer base skews 28-55, mission-driven, willing to pay premium for verified ethical claims. Examples: organic skincare, refillable home goods, recycled-material apparel, B-Corp certified brands.
> **When NOT to use:** greenwashing-claim brands (the earnest voice amplifies the trust deficit); fast-fashion or high-volume brands where the sustainability story is secondary; brands where humor is a core differentiator (earnest + humorous reads as conflicted).

**Voice rules:**

- "we" as a community of makers + customers; first-person plural is warm but not casual
- Earnestness: 1 educational moment per email (a sourcing detail, a material spec, a certification reference) — never condescending
- Brand name used 1-2 times per email; "we" / "our community" carries most of the warmth
- Prices honest, lead with the value ("made in [place], from [material], $49") rather than the discount — sustainable customers prefer transparency to coupon codes
- Objections handled with the certification / spec ("B-Corp certified since [year]" / "all packaging home-compostable per TÜV OK Compost HOME" / "1% of revenue donated to [partner]")

**Worked Template 1 (Email Welcome #1) — Sustainable variant:**

```
Subject: Welcome to {{ company.name }} — your first order, on us
Preview:  10% off + the story behind what we make

Hi {{ first_name|default:"friend" }},

Welcome to {{ company.name }}. We are so glad you are here.

A little about us: every product is made in [city/region] from
[material] sourced from [certified supplier]. We are B-Corp
certified, 1% of every order goes to [partner], and all of our
packaging is home-compostable.

We will email you about twice a month — new products, the story
behind what we make, and the occasional offer. Unsubscribe in
one click anytime; we would never want to be a bother.

As a thank you for joining, here is 10% off your first order,
valid for seven days:

YOUR CODE: WELCOME10

[CTA] Start with our bestsellers → {{ site.url }}/collections/best-sellers

With care,
The {{ company.name }} team
```

**Adaptation diff (Sustainable vs Default):**

- "Hi" → "Hi" (kept warm but more deliberate — not "Hey")
- Add a 3-4 line "about us" block (sourcing + certification + giving-back)
- "about 2 emails a week" → "about twice a month" (sustainable brands email less frequently)
- Add the B-Corp / 1%-for-the-planet / TÜV certification line
- "The team" → "The {{ company.name }} team" + "With care," sign-off
- 10% discount framed as "thank you for joining" not "here's your discount"
- No joke, but a small earnest line near the end ("we would never want to be a bother")

---

## Profile 4 — Gen-Z playful (high-energy + lowercase + meme-aware)

> **Position:** Formality 1 / Humor 4 / Brand-name 2 / Price 1 / Objection 2
> **When to use:** brands targeting 18-26-year-old shoppers, TikTok-native, social-first. Strong UGC + community-led brands. Examples: beauty brands for teens/early-20s, trendy apparel drops, novelty home goods, food + beverage brands with viral appeal.
> **When NOT to use:** brands where the customer base skews 30+ (the lowercase + meme voice reads as "trying too hard"); luxury / premium brands; B2B; brands with a heritage / craft story.

**Voice rules:**

- Lowercase the prose (capitalize only proper nouns + sentence starts if you must); sentence-case the subject lines (they sit in the inbox preview where readability matters more)
- 1-2 emojis per long-form email (transactional SMS = 0 emojis); use emojis as light punctuation, not decoration
- "we" / "us" / "the team"; never "Brand Name Co."; the brand is the people
- Prices as "$49" or "forty-nine bucks" depending on tone; discounts lead with the dollar amount or the percentage + a hype word ("$5 off" / "10% off, on the house")
- Objections handled with humor + a proof point ("yeah our stuff is kinda extra but like, in a good way — 4.8 stars across 12k reviews")
- 1 meme reference per long-form email if it's relevant + recent (don't force it; outdated memes are worse than no meme)

**Worked Template 1 (Email Welcome #1) — Gen-Z variant:**

```
Subject: welcome to the club 💌
Preview:  your 10% code + a heads up on what to expect

ok wait you're here?? hi 👋

thanks for joining {{ company.name }}. quick rundown of what's
about to happen:

- you'll get ~2 emails a week from us (no spam we promise)
- every email has an unsubscribe link at the bottom
- today you get 10% off literally anything on the site

that's it. that's the email.

[LEAD MAGNET BLOCK]
- free sticker pack: [download link]
- quiz: what's your [product] personality → [quiz link]

[CTA] shop the drop → {{ site.url }}/collections/best-sellers

your code: WELCOME10 (expires in 7 days, single use)

— the {{ company.name }} team
```

**Adaptation diff (Gen-Z vs Default):**

- Sentence-case the subject line ("Welcome to the club" → "welcome to the club 💌")
- Lowercase the prose body (sentence-start capital optional)
- "Hi {{ first_name }}" → "ok wait you're here?? hi 👋"
- "Here's what to expect: about 2 emails a week" → "quick rundown of what's about to happen: - you'll get ~2 emails..."
- Add 1-2 emojis to the body (not the transactional SMS — keep that clean)
- "Browse our bestsellers" → "shop the drop"
- "YOUR CODE" stays UPPERCASE because the Klaviyo variable tag is convention
- "— the team" → "— the {{ company.name }} team"
- One optional meme reference if relevant + recent; do not force

---

## Profile 5 — B2B / professional (precise + benefit-led + no jokes)

> **Position:** Formality 4 / Humor 1 / Brand-name 3 / Price 3 / Objection 5
> **When to use:** B2B or wholesale brands, professional services, brands selling to businesses (office supplies, hospitality, manufacturing), or DTC brands with a strong B2B channel (e.g. a skincare brand selling to spas).
> **When NOT to use:** any consumer brand targeting end-consumers (the formal voice reads as cold + corporate); luxury brands (formal + premium copy reads as legal-department-written); any brand where founder personality is a differentiator.

**Voice rules:**

- "we" / "our company"; brand name spelled out on first reference ("{{ company.name }}, Inc."), shortened after
- No humor — every line carries a benefit or proof point
- Lead each paragraph with the customer benefit, then the proof point, then the offer (the "B2B sandwich")
- Prices as "$49" or "$49.00" — discount framed as "introductory pricing for new accounts" / "volume-based pricing available"
- Objections handled with the strongest available proof point — ROI, certification, named customer reference, or quantified outcome ("used by [X] businesses since [year]" / "average [Y]% lift in [metric] across our customer base")

**Worked Template 1 (Email Welcome #1) — B2B variant:**

```
Subject: Welcome to {{ company.name }} — your account is active
Preview:  Your new-account 10% saving + onboarding resources

Dear {{ first_name|default:"there" }},

Welcome to {{ company.name }}. Your account is now active and
your new-account 10% saving has been applied to your account
profile.

What's next:

1. Browse our [category] catalog: {{ site.url }}/collections/catalog
2. Read our [industry] case studies: {{ site.url }}/case-studies
3. Contact our team for volume pricing: {{ company.name }}/contact

Your dedicated account representative is {{ account_rep_name }},
{{ account_rep_email }}. They will reach out within one business
day to schedule your onboarding call.

YOUR NEW-ACCOUNT CODE: WELCOME10 (single use, valid 30 days for
new accounts)

Common questions:

- Minimum order quantity: {{ moq }}
- Lead time: {{ lead_time }} business days
- Volume pricing: starts at {{ volume_threshold }} units
- Net terms: {{ net_terms }}

Best regards,
The {{ company.name }} Team
```

**Adaptation diff (B2B vs Default):**

- "Hi" → "Dear" + capitalized name (last name on file if available)
- Add a structured "What's next" numbered list
- Add a dedicated account-representative line (named person + email + business-day SLA)
- Add a "Common questions" block at the bottom (MOQ / lead time / volume pricing / net terms)
- "YOUR CODE: WELCOME10" → "YOUR NEW-ACCOUNT CODE: WELCOME10" + extended validity (30 days not 7)
- "— The team" → "Best regards, The {{ company.name }} Team"
- Add a case-studies link in the resources
- Discount framed as "new-account 10% saving" not "10% off your first order"

---

## Decision matrix — which profile fits your brand

Answer these 5 questions to find your profile. Pick the profile whose row matches the most answers:

| Question | Default | Luxury | Sustainable | Gen-Z | B2B |
|---|---|---|---|---|---|
| Average order value (AOV)? | $30-$200 | $300+ | $30-$150 | $20-$100 | $100+ |
| Primary customer age? | 25-45 | 35-65 | 28-55 | 18-26 | 28-55 |
| Primary purchase driver? | Product quality + brand vibe | Heritage + craftsmanship | Sustainability + ethics | Trendiness + community | Function + ROI |
| Brand personality? | Confident + plain | Refined + quiet | Warm + earnest | High-energy + playful | Precise + professional |
| Discount frequency? | Monthly | Never / seasonal | Rare / member-only | Daily drops / flash sales | Volume-based only |

**Scoring rule:** the profile whose row matches 4+ of your 5 answers is your voice. If you match 2 profiles equally, interpolate (use the Formality from one + the Objection handling from another).

**Hybrid examples:**

- **"Luxury + slightly warmer"** = Luxury Formality 4 + Sustainable Objection handling 4 + Luxury's Brand-name usage + Sustainable's lead-with-the-value pricing
- **"Default + Gen-Z edge"** = Default Formality 2 + Gen-Z Humor 4 + Default Brand-name + Gen-Z Price 1 + Default Objection 3
- **"Sustainable + B2B"** = Sustainable Formality 3 + B2B Objection handling 5 (a sustainability-focused brand selling to other businesses)

If you need a hybrid, pick the **closer profile** as your base and modify 1-2 dimensions per the interpolation rules in the "5-dimension voice framework" section above.

---

## Adapting the other 7 templates (Asset 01) to your profile

Once you've picked a profile, the other 7 templates adapt in 5-15 minutes per template. The mechanical recipe:

1. **Subject lines** — same adaptation rules per profile (Default = sentence-case + benefit-led; Luxury = full sentence + formal; Sustainable = warm + benefit-led; Gen-Z = lowercase + emoji optional; B2B = precise + no emoji)
2. **Body voice** — replace the voice lines per the worked Template 1 example above (greeting + sign-off + object-handling + price framing)
3. **Variable tags stay the same** — `{{ first_name }}`, `{{ coupon_code }}`, `{{ event.extra.line_items.0.title }}` are identical across profiles (Klaviyo + Postscript do not change)
4. **Compliance footer stays the same** — CAN-SPAM physical address + unsubscribe in every email, TCPA Reply STOP in every SMS (NEVER edit compliance out — see Pitfall #4 below)
5. **Discount framing changes per profile** — Default = "10% off"; Luxury = "complimentary 10% saving"; Sustainable = "thank you for joining — 10% off your first order"; Gen-Z = "10% off literally anything"; B2B = "new-account 10% saving, valid 30 days"
6. **When-to-use / when-NOT-to-use** — keep the original trigger filter and timing; only the voice around them changes

**Estimated time per template:** 5-15 minutes. Total time to adapt all 8 templates to a non-Default profile: ~1-2 hours.

---

## Common pitfalls (with Fix lines)

1. **Using "Dear valued customer"** — feels corporate, brand-agnostic, dismissive. **Fix:** use the customer's first name (`{{ first_name|default:"there" }}` or `{{ first_name|default:"friend" }}` for the Sustainable variant). Default + Luxury use formal variants; never the boilerplate "valued customer."
2. **Writing in third person ("Brand Name Co. is pleased to announce…")** — reads as legal-department-written. **Fix:** use first-person plural ("we are delighted to welcome you") for all 5 profiles except B2B (where first reference is spelled out, then "we").
3. **Over-using emojis (5+ per email)** — looks panicked, undermines authority. **Fix:** 1-2 emojis max per long-form email for Default + Sustainable; 2-3 for Gen-Z; 0 for Luxury + B2B; 0 for transactional SMS in every profile.
4. **Editing out the CAN-SPAM physical address or TCPA Reply STOP footer** — turns a voice adaptation into a compliance violation ($50k+ fine for CAN-SPAM, $500+/message for TCPA). **Fix:** adapt the voice in the body, NEVER in the footer. The footer is the same across all 5 profiles.
5. **Undercutting premium pricing with discount-led copy** — luxury brands that lead with "10% off" in the welcome email cannibalize full-price sales. **Fix:** luxury profile uses "complimentary 10% saving" / "as a welcome gesture" / "introductory pricing" — never bare "10% off" or "$X off."
6. **Forcing a meme in a Gen-Z email where no meme fits** — outdated memes are worse than no meme. **Fix:** reference a recent cultural moment only if you can do so within 24-48 hours of it landing; otherwise skip. The Gen-Z voice still works without memes.
7. **Luxury voice + emoji + exclamation marks** — every element reads as conflicting. **Fix:** luxury voice forbids exclamation marks (use periods only). If you need warmth, add an earnest clause instead ("with warm regards,").
8. **B2B voice with informal contractions** — "we're" + "you'll" reads as imprecise. **Fix:** B2B profile uses full forms ("we are" / "you will") OR uses contractions deliberately in a context where you have already established formality (the second paragraph of a long-form email). Default: no contractions in B2B.
9. **Sustainable brand voice + greenwashing claim** — earnest voice amplifies the trust deficit when the claim isn't backed. **Fix:** every "we are sustainable" line must be paired with a specific certification / partner / spec ("B-Corp certified since 2018" / "1% for the Planet member" / "all packaging TÜV OK Compost HOME certified"). Vague sustainability claims + earnest voice = greenwashing lawsuit risk.
10. **Skipping the A/B test** — operators think picking a profile is enough, but the profile must be tested against the Default with at least 500 sends per variant before declaring a winner. **Fix:** Klaviyo AI subject-line test on the first 500 sends per profile; promote the winning voice to 100% after the test resolves.

---

## Verification gates (after adapting the templates)

After adapting any Asset 01 template to your chosen profile, run these 5 gates per adapted template before activating the flow:

- [ ] **Gate A — Voice consistency:** read the adapted template aloud; it should sound like the brand's website homepage + product page + Instagram captions — no jarring voice shift between channels. (Read 1 prior customer-facing email from the brand; does the adapted template match its tone?)
- [ ] **Gate B — Profile rules followed:** confirm the adapted template obeys every rule in the chosen profile (e.g. Luxury profile = no contractions, no humor, full brand name; Gen-Z profile = lowercase prose, 1-2 emojis max; B2B profile = no contractions + dedicated account-rep line + numbered list)
- [ ] **Gate C — Variables resolve unchanged:** confirm `{{ first_name }}`, `{{ coupon_code }}`, `{{ event.extra.line_items.0.title }}` all populate correctly — the voice adaptation must NOT have broken any variable tag (e.g. replacing `{{ first_name|default:"there" }}` with `Dear Valued Customer` removes the personalization variable entirely)
- [ ] **Gate D — Compliance footer intact:** confirm CAN-SPAM physical address + unsubscribe link (email) / TCPA Reply STOP (SMS) are still present in the adapted template — the voice adaptation only changes the body, never the footer
- [ ] **Gate E — Brand-name usage correct:** confirm the brand name appears the right number of times per profile (Default + Gen-Z = 1-2 max; Luxury = 2-4 + "the House" / "the Atelier"; Sustainable = 1-2; B2B = spelled out once + shortened after)

**Pass criteria:** all 5 gates pass for every adapted template before activating. If any fails, fix the gap (often: variable tag accidentally removed during adaptation) and re-run gates A-E.

---

## Related

**Asset that this builds on:**

- `assets/01-copy-templates.md` — the 8 paste-ready templates this asset teaches you to adapt. Each profile's worked Template 1 example shows the diff directly.

**Playbooks where voice adaptation matters most (read these if voice is your bottleneck):**

- `playbooks/04-welcome-series-klaviyo.md` — the welcome flow is the most-shown email per subscriber (every signup sees Email 1); voice adaptation here has the highest cumulative visibility.
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — cart-abandon emails go to warm leads (already in checkout); voice mismatch here reads as "different brand than the one they were buying from" and tanks CVR.
- `playbooks/06-sms-welcome-and-cart-abandon.md` — SMS compresses voice to its essence (160 chars); voice adaptation is critical because every word carries more weight than in email.

**Playbooks that explicitly reference a voice profile:**

- `playbooks/04-welcome-series-klaviyo.md` Step 2 — Default voice referenced as the canonical baseline.
- `playbooks/06-sms-welcome-and-cart-abandon.md` Pitfall #8 — voice-mismatch warning (don't run Luxury voice in a Gen-Z SMS flow).

**Sibling assets (next ticks in the `assets/` track — not yet shipped, cross-references are placeholders for the next bounded improvements):**

- `assets/03-ugc-brief.md` *(planned — does not yet exist)* — paste-ready UGC commissioning template + usage rights doc + creator outreach emails; complements the SMS Review Request template (Asset 01 Template 7) by explaining where the review content comes from.
- `assets/04-promo-calendar.md` *(planned — does not yet exist)* — 12-month promotional calendar showing which voice + which discount intensity + which audience segment for each month; builds on the decision matrix above by mapping profile → calendar slot.

**Research that informed the 5 profiles:**

- `research/00-ecommerce-ops-landscape.md` — the DTC landscape segmentation that surfaced 5 distinct voice clusters in the operator-base survey.
- `research/01-tools-stack-comparison.md` — the vendor capabilities (Klaviyo's segment filters + Postscript's character limits) that determine which voice adaptations are technically possible.