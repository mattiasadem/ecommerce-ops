---
name: native-language-voice-profiles
title: Native-language voice profiles (Move #22.2, UK English + DE/FR/JP native copy QA + Klaviyo/Gorgias locale packs, 9:1 default Year-1 ROI)
category: localization
tier: 2
priority: P1
default_move: 22.2
year_1_roi_band: "4:1–18:1"
sms_friendly: true
last_updated: 2026-07-11
sources: [weglot 2024, lokalise 2024, phrase 2024, deepl 2024, smartling 2024, transifex 2024, shopify-markets 2024, klaviyo-per-locale-flows 2024, gorgias-multilingual 2024, postscript-per-country-pricing 2024, baymard-international-checkout-usability 2024, eu-green-claims-directive-2026, gdpr 2024, uk-gdpr-ico 2024, jp-appi 2024, klarna 2024, ideal-nl 2024, bancontact-be 2024]
---

# Native-language voice profiles (Move #22.2)

> Move #22.2 is the post-international-expansion localization layer that turns a US brand's 5 canonical voice profiles into **native-ready UK English, German, French, and Japanese operator packs** across PDP, checkout microcopy, Klaviyo, Postscript/WhatsApp, and Gorgias — protecting the 20–40% conversion lift that Shopify Markets and local payments create from being lost to literal translation, regulatory claim drift, or off-brand AI copy.

## When to use this skill

Use this skill after **Move #22 international expansion** has selected markets and before Phase 2 traffic is scaled. It is the right move when the operator already has `assets/02-brand-voice.md`, `assets/13-international-pricing-card.md`, and `playbooks/11-international-rollout.md`, but does **not** yet have native-language voice profiles that a translator, agency, or AI localization workflow can execute without guessing.

You have:

- Shopify Markets or equivalent multi-market storefront turned on for at least **UK + one EU market**, with currency and duties configured.
- A voice framework with at least **Default / Luxury / Sustainable / Gen-Z / B2B** profiles from Asset 02.
- At least 20 pages or templates that will be localized: homepage hero, PDP title block, PDP benefit bullets, size/fit block, shipping/returns, checkout trust microcopy, welcome flow, cart-abandon flow, post-purchase flow, Gorgias macros, and FAQ.
- A target market where literal US copy has already shown friction: lower non-US CVR, higher checkout support tickets, payment-method confusion, or sustainability-claim review risk.
- Budget for either **human native review** ($0.10–$0.30/word or $500–$3k per market starter pack) or a hybrid AI + reviewer workflow through Weglot, Lokalise, Phrase, Smartling, Transifex, or DeepL.

Do **not** use this skill when:

- The brand has not shipped Move #22 or has no international traffic signal yet. Localizing five languages before market selection creates a translation graveyard.
- The current US voice profile is not documented. You cannot localize a voice that does not exist.
- The category is highly regulated and claims cannot be translated without counsel: supplements, CBD, alcohol, medical devices, quasi-drug cosmetics in Japan.
- The operator only needs machine-translated checkout strings. This skill is for **brand voice + compliance + conversion**, not UI-string translation alone.

## What "best in class" looks like

Best-in-class localization is a **voice operating system**, not a translation export. The operator owns one canonical source-of-truth profile per market and every vendor works from it.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Market scope | UK + DE + FR + JP profiles scoped from Move #22 path | UK English only | Add NL/ES/IT plus DACH/AU nuance |
| Voice source | 5 US voice profiles mapped to local tone rules | One generic brand voice | Per-market voice density scores with examples |
| Native review | Native marketer reviews every high-intent surface | Machine translation only | Native copywriter + legal/compliance review |
| Translation memory | Lokalise/Phrase glossary with locked terms | Spreadsheet glossary | Termbase with forbidden terms and claim rules |
| PDP localization | Hero, benefits, proof, size, shipping, returns localized | Product description only | Market-specific proof order and imagery notes |
| Klaviyo/Postscript | Per-locale welcome + cart + post-purchase flows | US flows translated 1:1 | Local send-time, opt-in law, and payment-method variants |
| Gorgias macros | Shipping, returns, duties, warranty, payment macros localized | English-only support | Locale routing + SLA and escalation rules |
| Sustainability claims | EU Green Claims safe wording with proof links | Direct translation of US claims | Claim register with evidence ID per claim |
| QA process | Back-translation + native read + live checkout smoke | Translator says "done" | Monthly sample audit of 20 live strings |

The reference brands to study are the ones that keep tone native without losing identity: Allbirds EU, Glossier UK, Gymshark DACH, Patagonia EU, Uniqlo JP, Muji global, and On Running DACH. The pattern: local phrasing changes; the brand promise does not.

## Native-language voice-profile benchmarks (2024–25)

The ROI comes from protecting international conversion and lowering support friction, not from translation as a standalone cost center.

| Path | Brand profile | Markets | Cost stack | Expected Year-1 lift protected | Year-1 ROI |
|---|---|---|---|---|---|
| **A — UK English cleanup** | $500k–$2M US GMV; UK is first non-US market | UK + CA/AU English variants | $500–$2k one-time + $0–$200/mo tooling | 5–12% UK CVR protection + fewer returns questions | **4:1–9:1** |
| **B — DEFAULT native EU starter** | $1M–$10M GMV; Move #22 Path B | UK + DE + FR + AU | $2k–$8k one-time + $200–$800/mo tooling | 10–25% EU/UK CVR protection + 10–20% support-ticket reduction | **7:1–14:1 default 9:1** |
| **C — full international voice ops** | $10M–$50M GMV; Move #22 Path C | UK + DE + FR + JP + DACH/Nordics | $8k–$30k one-time + $800–$3k/mo tooling/review | 15–35% CVR protection + 20–40% support-ticket reduction | **10:1–18:1** |

**Benchmarks to use in the model:** Shopify Markets and Baymard repeatedly show local currency, localized payment methods, and clear duties/returns messaging can protect **20–40% of checkout completion** in cross-border flows. Weglot/Lokalise/Phrase/Smartling benchmarks cluster around **30–70% workflow-time reduction** from translation memory once the glossary is built. Gorgias multilingual macros reduce avoidable WISMO/duties tickets by **10–25%** when shipping expectations and return policy are native-language and market-specific. Klaviyo per-locale flows typically lift email CTR **5–15%** versus translated-US flows when subject lines and send times are localized.

**Default math for a $5M US GMV Path B brand:** Move #22 expects $1.5M–$4M Year-1 international revenue potential. If poor localization leaks even 10% of that opportunity, the brand loses $150k–$400k. A $10k native voice-profile build that protects $90k of Year-1 revenue is a 9:1 ROI and also lowers support cost.

## The build (2 weeks for Path B)

1. **Choose the markets from Move #22.** Run the existing scorer first:
   `python3 scripts/international_market_fit.py --us-gmv 5000000 --category apparel --us-aov 75 --us-contribution-margin-pct 55 --supply-chain-complexity 1 --operator-capacity-hours-per-week 8 --json`. Path A ships UK/CA English only. Path B ships UK + DE + FR + AU. Path C adds JP + DACH/Nordics.
2. **Export the US voice source.** Pull `assets/02-brand-voice.md`, the top 20 US Klaviyo emails, top 10 PDPs by revenue, top 20 Gorgias macros, and the pricing card in `assets/13-international-pricing-card.md`. Create a one-page source brief with: brand promise, forbidden phrases, proof claims, discount posture, and example lines for each of the 5 voices.
3. **Build the market glossary.** In Lokalise/Phrase/Smartling/Weglot, create locked terms: brand name, product names, ingredients/materials, warranty terms, shipping terms, return terms, loyalty-tier names, sustainability claims, and payment methods (Klarna, iDEAL, Bancontact, Konbini). Mark terms as `translate`, `do_not_translate`, or `requires_native_phrase`.
4. **Write the 4 market profile cards.** For each market, document: tone rules, spelling, legal sensitivity, payment/shipping microcopy, discount posture, and example rewrites. Minimum cards: UK English, German, French, Japanese. Example: UK Default can keep light humor but swaps "pants" → "trousers" and "free shipping" → "free delivery"; German Sustainable must avoid vague "eco-friendly" unless a proof link exists; Japanese Gen-Z can be playful but still needs formal checkout and support copy.
5. **Localize the high-intent surfaces first.** Sequence: PDP above-the-fold → checkout trust/duties copy → shipping/returns FAQ → welcome flow → cart-abandon flow → Gorgias WISMO/duties/returns macros → paid landing pages. Do not start with blog posts. High-intent copy moves revenue fastest.
6. **Run 3-pass QA.** Pass 1 = machine consistency (all glossary terms present). Pass 2 = native read (sounds like a local brand, not a translation). Pass 3 = commerce smoke (live checkout, duties, payment method, opt-in law, and return policy all make sense). Record pass/fail by URL/template.
7. **Wire analytics.** Add locale tags to Klaviyo flows (`locale=de-DE`, `locale=fr-FR`, `locale=en-GB`, `locale=ja-JP`), Gorgias tags (`market:de`, `market:uk`), and Triple Whale/GA4 country cohorts. Monitor CVR, AOV, CTR, unsubscribe, support tickets per 1k orders, and return-policy confusion.
8. **Set the monthly voice drift review.** Every month sample 5 PDP snippets, 5 emails/SMS, 5 support macros, and 5 checkout/FAQ strings per active market. Update glossary and forbidden phrases before the next translation batch.

## Common pitfalls (15 from real builds)

1. **Starting with every page instead of high-intent surfaces** — blog/category archives consume budget before revenue surfaces move. **Fix:** ship PDP, checkout, flows, and support macros first.
2. **Using DeepL output as final copy** — literal copy sounds correct but misses tone, humor, proof order, and legal nuance. **Fix:** machine translation is Pass 0; native marketing review is Pass 2.
3. **No locked glossary** — product names, materials, and loyalty terms drift across pages. **Fix:** create `do_not_translate` and `requires_native_phrase` termbase before translating.
4. **US claims translated into EU regulated claims** — "eco-friendly" or "carbon-neutral" becomes a legal risk under EU Green Claims. **Fix:** maintain a claim register with evidence links; rewrite claims, do not translate them literally.
5. **UK English treated as US English with pounds** — pants/fanny/returns/shipping phrasing creates trust friction. **Fix:** run a UK English pass on every high-intent template and use "delivery", "returns", "trousers" where appropriate.
6. **German copy too playful in checkout** — casual humor near payment/duties lowers trust. **Fix:** keep PDP tone on-brand but make checkout and support German precise, explicit, and proof-led.
7. **French copy over-discounts the brand** — direct coupon framing can cheapen premium positioning. **Fix:** use benefit-led, elegant discount language; keep Luxury discounts framed as service or gesture.
8. **Japanese localization ignores payment and formality** — JP shoppers need Konbini/payment clarity and more formal support copy. **Fix:** separate JP PDP tone from checkout/support tone; review by a JP native commerce writer.
9. **Klaviyo flows translated but send time stays US timezone** — emails arrive overnight and CTR drops. **Fix:** clone flows per locale and set local send windows.
10. **SMS consent copied from US TCPA into EU/UK** — opt-in law and wording differ. **Fix:** local legal review for SMS/WhatsApp consent and use country-specific Postscript or WhatsApp rules.
11. **Gorgias macros remain English** — the first post-purchase support touch breaks trust. **Fix:** localize WISMO, duties, returns, exchange, warranty, and payment-failure macros before launch traffic scales.
12. **No back-translation for critical claims** — operators cannot see that a translated claim changed meaning. **Fix:** back-translate PDP proof claims, sustainability claims, and warranty/returns terms.
13. **Translator lacks ecommerce context** — the copy is grammatically correct but not conversion-oriented. **Fix:** choose native reviewers who have written PDP/email/checkout copy, not only document translation.
14. **No owner for voice drift** — every agency batch changes tone. **Fix:** assign one voice steward, run monthly samples, and update the glossary after each campaign.
15. **No market-level analytics tags** — the team cannot tell if localization helped. **Fix:** tag by locale in Klaviyo, Gorgias, GA4, and Triple Whale before launch; compare per-market CVR and support rate weekly.

## Verification (this skill is "shipped" when...)

- [ ] `scripts/international_market_fit.py` has been run and the chosen market path is documented in the localization brief.
- [ ] A market glossary exists with at least 50 locked terms and each term labeled `translate`, `do_not_translate`, or `requires_native_phrase`.
- [ ] UK English, German, French, and Japanese cards exist with tone rules, forbidden phrases, legal sensitivity, payment/shipping microcopy, and 5 example rewrites each.
- [ ] At least 20 high-intent surfaces are localized and reviewed: 5 PDP blocks, 4 checkout/FAQ blocks, 3 Klaviyo/Postscript flows, 5 Gorgias macros, and 3 paid landing/ad blocks.
- [ ] Native QA signed off on every live market, not just the translation agency.
- [ ] Back-translation passes for all proof claims, sustainability claims, warranty, returns, and duties copy.
- [ ] Klaviyo, Gorgias, GA4, and Triple Whale have locale/country tags wired before traffic scales.
- [ ] 30-day post-launch review compares market CVR, AOV, support tickets per 1k orders, return-policy tickets, CTR, unsubscribe, and refund rate against US baseline.

## How to extend this skill

- **Move #22.3 in-region support macros:** extend the Gorgias layer into native-language agents, SLA routing, and country-specific return/exchange rules.
- **Move #22.4 local creator/UGC localization:** build native creator briefs for DE/FR/JP so paid social and PDP proof match the market voice.
- **Move #22.5 market-specific SEO clusters:** pair the voice profiles with Surfer/Ahrefs clusters per market; never translate US keywords 1:1.
- **Move #22.6 legal-claims registry:** turn the claim register into a versioned artifact with evidence IDs for EU Green Claims, UK CAP Code, JP APPI, and category-specific rules.
- **AI localization QA:** add a script that checks glossary coverage, forbidden terms, locale tags, and claim IDs across exported Shopify/Klaviyo/Gorgias strings.

## Cross-references

- `skills/25-international-expansion.md` — parent Move #22 cross-border rollout.
- `assets/02-brand-voice.md` — canonical 5 voice profiles and voice-density rules.
- `assets/13-international-pricing-card.md` — 7-market × 5-voice pricing and copy framing matrix.
- `playbooks/11-international-rollout.md` — Phase 1+2+3 operator build for Shopify Markets, duties, shipping, and payments.
- `research/04-international-expansion.md` — 5-pillar cross-border strategy and market sequencing.
- `scripts/international_market_fit.py` — path scorer that chooses CA-only vs CA+UK+EU+AU vs full 7-market scope.
- `skills/24-klaviyo-postscript-migration.md` and `skills/10-lifecycle-flow-library.md` — lifecycle substrate that gets cloned per locale.
- `skills/13-triple-whale-attribution.md` — market-level measurement substrate.

## Sources

- Weglot 2024 — ecommerce localization workflow and translation memory benchmarks.
- Lokalise 2024 — glossary, termbase, and reviewer workflow benchmarks.
- Phrase 2024 — translation management and locale QA workflow benchmarks.
- DeepL 2024 — machine translation quality and human post-edit workflow.
- Smartling 2024 — ecommerce translation operations and review routing.
- Transifex 2024 — localization string governance and release workflow.
- Shopify Markets 2024 — multi-currency, market domains, duties, and local payment configuration.
- Klaviyo per-locale flows 2024 — flow cloning, local send windows, and locale tags.
- Gorgias multilingual 2024 — macros, help-center localization, and ticket routing.
- Postscript per-country pricing 2024 — SMS cost, consent, and market limitations.
- Baymard international checkout usability 2024 — duties, currency, delivery promise, and checkout trust patterns.
- EU Green Claims Directive 2026 — sustainability-claim proof requirements.
- GDPR 2024 and UK GDPR ICO 2024 — consent, privacy notice, and data-processing requirements.
- Japan APPI 2024 — Japanese privacy and customer-data handling requirements.
- Klarna 2024, iDEAL NL 2024, Bancontact BE 2024 — local payment-method trust benchmarks that copy must explain.
