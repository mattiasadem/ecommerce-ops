# Asset 07 — Competitive Teardown Template (8-dimension benchmarking framework × 5 voice-driven override tables)

> **Companion assets:** `assets/01-copy-templates.md` (T1-T8 templates — the competitive teardown's "voice-and-tone" column maps Asset 02's voice framework into the teardown's tone benchmark; competitive copy riffs from the same templates), `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework — every dimension in this teardown's 8-dimension framework ships with 5 voice-driven override columns: Default / Luxury / Sustainable / Gen-Z / B2B; the teardown's "voice-and-tone" row is the canonical cross-reference), `assets/03-ugc-brief.md` (5 outreach emails + 3 contracts + Klaviyo UGC segment — the teardown's "creator-mix" dimension compounds Asset 03 by adding competitive-creator benchmarking), `assets/04-promo-calendar.md` (12-month calendar — the teardown's "calendar-and-promo" dimension compares competitors' promo cadence to Asset 04's Q1-low / Q4-peak macro shape), `assets/05-retention-metrics.md` (12-metric retention card — the teardown's "retention-and-loyalty" dimension uses the 12 metrics as the comparison baseline; competitors with higher RPR / LTV:CAC than the operator's brand are the targets), `assets/06-nps-survey-toolkit.md` (NPS-survey program — the teardown's "retention-and-loyalty" dimension uses cohort-by-NPS-bucket LTV as the competitive-NPS benchmark). **Companion playbooks:** `playbooks/02-post-purchase-upsell-klaviyo.md` (Move #2 — the teardown's "retention-and-loyalty" dimension benchmarks competitors' post-purchase flow against Move #2's 3-step upsell), `playbooks/03-checkout-audit.md` (Move #3 — the teardown's "checkout" dimension uses the 18-point Move #3 audit as the scoring rubric), `playbooks/04-welcome-series-klaviyo.md` (Move #4 — the teardown's "lifecycle" dimension benchmarks competitors' welcome series against Move #4's 5-email flow), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — the teardown's CAC / LTV / payback columns are sourced from Triple Whale's competitive-benchmark report).

## Goal

Every DTC operator needs to know **where their brand sits relative to 3–5 named competitors** across the 8 dimensions that drive customer choice (positioning / pricing / retention / loyalty / content / shipping / creator mix / paid mix). Without this teardown, the operator makes positioning, pricing, and lifecycle decisions in a vacuum — and ends up either racing-to-the-bottom on price (because they don't know competitors' AOVs) or missing the creator-mix gap (because they didn't benchmark which creators competitors use).

This teardown ships a paste-ready framework that the operator can apply on day 1, even **before they pick competitors** — the 8-dimension framework itself is the durable artifact, and the operator fills in competitor names + scoring later:

1. **An 8-dimension scoring framework** — positioning / pricing / retention / loyalty / content / shipping / creator mix / paid mix. Each dimension has 5 voice-driven override columns (Default / Luxury / Sustainable / Gen-Z / B2B) + a 1–5 scoring scale + 3–5 concrete sub-questions + a "What moves this dimension" attribution block.
2. **A 3×5 scoring matrix template** — 8 dimension rows × 3–5 competitor columns × 1–5 scoring cells, paste-ready into Google Sheets / Notion / Airtable.
3. **A competitor-sourcing decision matrix** — 4 sourcing models for finding competitors (Google search + marketplace browsing / Meta Ad Library + TikTok Creative Center / Similarweb + Semrush / Shopify store-listing directories) with cost / time-to-data / data-depth columns.
4. **A voice-driven override matrix** — 5 voice profiles × 8 dimensions = 40 cells of "what the operator's voice changes about how to score this dimension." Luxury brands score shipping "free 2-day + white-glove" as 5; Gen-Z brands score shipping "free 5–7 day + surprise-and-delight unboxing" as 5; both are valid but they're NOT the same score.
5. **8 verification gates** — one per dimension, each with a paste-runnable recipe to confirm the operator's teardown data is real (not vibes-based).

**Honest-read called out in 5 places:** (a) **the framework ships before competitors are named** — operators should apply the 8-dimension framework to their OWN brand first (a self-teardown is the canonical day-1 use case), then expand to 3–5 named competitors once they've shipped the framework; this avoids the "I don't have competitors picked so I'll defer" trap. (b) **competitive data ages in 30–90 days** — pricing, creator mix, and paid mix shift fast; the teardown must be re-run quarterly (per Asset 04's Q1/Q2/Q3/Q4 cadence), NOT annually. (c) **voice-driven override columns matter MORE than the headline score** — a Luxury brand scoring 4 on shipping + a Gen-Z brand scoring 4 on shipping are NOT the same; the override column captures the voice-specific nuance that the headline number loses. (d) **the teardown is a strategy tool, not a vanity metric** — picking a competitor with 10× your revenue will skew the analysis toward "their way is the right way"; pick competitors within 0.5×–3× your revenue for the most actionable comparison. (e) **Meta Ad Library + TikTok Creative Center are the canonical free competitive-intel sources** — Similarweb / Semrush are paid ($200+/mo) and unnecessary for DTC operators below $5M GMV.

## The 8-dimension scoring framework

The canonical teardown framework scores any DTC brand across 8 dimensions on a 1–5 scale. Each dimension has 5 voice-driven override columns (Default / Luxury / Sustainable / Gen-Z / B2B) so that operators using Asset 02's voice framework apply the dimension differently.

**Scoring scale (universal across all 8 dimensions):**

- **1 = Bottom-quartile** — operator is significantly worse than competitors; this dimension is a competitive vulnerability.
- **2 = Below-average** — operator is materially behind; needs urgent investment.
- **3 = Parity** — operator is roughly equal to competitors; not a differentiator but not a liability either.
- **4 = Above-average** — operator is materially better; this dimension is a competitive moat.
- **5 = Top-quartile** — operator is best-in-class; this dimension is a defensible advantage for 6–18 months.

**Default case for $0–$50k/mo GMV:** Self-teardown only (score your own brand on all 8 dimensions). The framework is the durable artifact; competitor data can be added later when GMV justifies the time investment.

**Default case for $50k–$500k/mo GMV:** Self-teardown + 3 named competitors (the canonical DTC competitive set is 3 direct + 2 adjacent brands). Use Meta Ad Library + TikTok Creative Center + Google search to source competitors.

**Default case for $500k+/mo GMV:** Self-teardown + 3–5 named competitors + paid competitive-intel tool (Similarweb / Semrush / Ahrefs at $200+/mo each). The paid tools add ad-spend estimates + keyword-rank tracking + backlink profiles that are non-actionable below $500k/mo GMV.

### Dimension 1 — Positioning

**What this dimension measures:** How clearly the brand communicates WHO it's for, WHAT it does, and WHY it's different from competitors. The strongest positioning answers all three in one sentence; the weakest positioning requires a "what is this brand?" Google search to understand.

**Sub-questions (paste-ready scoring rubric):**
1. Can a new visitor answer "what is this brand?" within 5 seconds of landing on the homepage?
2. Does the brand's tagline (or hero copy) name a specific audience + a specific outcome + a specific differentiator?
3. Is the brand's positioning consistent across homepage / PDP / email / paid-social / creator content?
4. Does the brand avoid the "we're for everyone" trap (which signals no clear positioning)?
5. Does the brand name 1–3 specific competitors as the "we're not X" counter-positioning (or implicitly position against them)?

**What moves this dimension:** Clear ICP definition (Move #6 Triple Whale cohort-LTV report identifies the highest-LTV cohort → ICP) + brand-voice framework (Asset 02's 5 voice profiles → tagline-and-hero adaptation) + Klaviyo segment naming (Asset 06's NPS segment tags → ICP-from-cohort-LTV signal).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | Tagline names audience + outcome + differentiator in 1 sentence ("Skincare for sensitive skin, formulated by dermatologists, shipped in 30 days") | Tagline is vague ("natural beauty for all") or aspirational without specificity ("elevate your routine") |
| **Luxury** | Tagline uses heritage-language + scarcity + outcome ("Hand-stitched in Florence since 1948; only 200 pieces per year") | Tagline uses mass-market language ("luxury for everyone") or volume-promises ("unlimited selection") |
| **Sustainable** | Tagline names the mission + measurable outcome ("Carbon-neutral shipping, 100% recycled materials, B-Corp certified") | Tagline uses greenwashing language ("eco-friendly") without measurable outcome |
| **Gen-Z** | Tagline is irreverent + meme-aware + audience-named ("Skincare that doesn't gatekeep. Built for broke college students.") | Tagline uses corporate-speak ("innovative solutions for modern wellness") |
| **B2B** | Tagline names buyer-role + use-case + ROI ("Procurement software that cuts vendor onboarding from 6 weeks to 2 days") | Tagline uses feature-list language ("comprehensive procurement platform") without role-or-ROI anchor |

### Dimension 2 — Pricing

**What this dimension measures:** How the brand's price compares to competitors' on a like-for-like basis (same category, same AOV tier, same quality tier) AND how the brand communicates price (anchor pricing, value framing, scarcity, etc.).

**Sub-questions (paste-ready scoring rubric):**
1. Is the brand's AOV within ±25% of the named competitors' AOV (within the same quality tier)?
2. Does the brand use anchor pricing (was $X, now $Y) or psychological pricing ($29.99 vs $30) — and is the pattern consistent across the catalog?
3. Does the brand's pricing page (if it exists for B2B) or pricing-anchor copy (if it's DTC) communicate VALUE (quality / heritage / outcome) alongside PRICE?
4. Are competitor prices verifiable on the brand's own site (price-matching, comparison tables) — or do they require a 3rd-party comparison?
5. Does the brand avoid the "too cheap for the category" trap (which signals low quality) AND the "too expensive without justification" trap (which signals arrogance)?

**What moves this dimension:** Pricing-page copy (Asset 01's T1-T8 templates adapt to pricing-anchor email + PDP pricing block) + value-framing (Asset 02's voice framework's "Brand-name usage" dimension — Luxury brands name the brand prominently + Sustainable brands lead with mission) + Klaviyo price-drop flow (Move #1 abandoned-cart pricing-anchor email).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | AOV within ±15% of category average; anchor pricing consistent; value framing on every PDP | AOV is 30%+ below (signals low quality) or 30%+ above (signals mis-positioning); no anchor pricing |
| **Luxury** | AOV is 2–5× category average; NEVER discounts (per Asset 02); pricing anchors on heritage + scarcity; no price displayed on PDP until add-to-cart | Discounts aggressively (signals mass-market positioning); shows "starting at" with the lowest variant on the homepage |
| **Sustainable** | AOV is 1.2–1.8× category average; price includes impact-cost line item ("$5 of this purchase funds carbon-offset shipping"); member-pricing available | Discounts as primary acquisition lever (Sustainable brands lose credibility when they race-to-the-bottom); no value-framing |
| **Gen-Z** | AOV is 0.7–1.0× category average; flash-sale cadence is part of the brand identity (per Asset 04 Gen-Z variant); pricing is playful ("$20, or $18 if you sign up for our spam — kidding, kinda") | Premium pricing without Gen-Z audience-fit; "starting at" with hidden fees revealed at checkout |
| **B2B** | Pricing is volume-tiered with explicit discounts (per Asset 04 B2B variant); quote-based for >$5k ACV; pricing-page is comprehensive (no "contact us" black-box) | Single-tier pricing without volume-discounts; "contact us" pricing for any size deal; per-seat pricing without volume breaks |

### Dimension 3 — Retention and loyalty

**What this dimension measures:** How well the brand retains customers post-purchase (the 12 metrics from Asset 05) AND how the loyalty program (Move #8 / Smile.io / LoyaltyLion / Yotpo Loyalty) compares to competitors' programs.

**Sub-questions (paste-ready scoring rubric):**
1. What is the brand's D30 retention rate (Asset 05 Metric #4) vs the category baseline (typically 20–30% for DTC, 35–50% for subscription)?
2. What is the brand's repeat-purchase rate (Asset 05 Metric #5) — is it 20%+ (Default / Sustainable / B2B), 30%+ (Luxury), or 15%+ (Gen-Z with high churn)?
3. What is the brand's LTV:CAC (Asset 05 Metric #3) — is it ≥3× (Default / B2B / Luxury), ≥2× (Sustainable), or ≥1.5× (Gen-Z with flash-sale churn)?
4. Does the brand have a loyalty program (Move #8 Smile.io / LoyaltyLion / Yotpo Loyalty)? If yes, what % of customers are enrolled (industry baseline 25–40% for mature programs)?
5. What is the brand's NPS (Asset 05 Metric #11 / Asset 06 cohort-by-NPS-bucket LTV) — is it within the voice-driven healthy range (Default 30–50 / Luxury 40–60 / Sustainable 40–55 / Gen-Z 25–45 / B2B 30–50)?

**What moves this dimension:** Move #8 loyalty program (Smile.io tier 1/2/3 with point-accrual + tier-upgrade triggers) + Move #4 welcome series (5-email flow with 30d cohort-LTV lift) + Move #1 abandoned cart (3-email flow) + Move #7 SMS (post-purchase NPS via Asset 01 T7) + Asset 06 NPS survey (cohort-by-NPS-bucket LTV multiplier 3–6×).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | LTV:CAC ≥3×; RPR ≥20%; loyalty program with 25%+ enrollment; NPS 30–50 | LTV:CAC <2×; RPR <15%; no loyalty program; NPS <25 |
| **Luxury** | LTV:CAC ≥4× (Luxury customers have higher LTV); RPR ≥30%; VIP-tier-only loyalty (NOT mass-enrollment); NPS 40–60 | Mass-enrollment loyalty (Luxury customers don't want a "Bronze/Silver/Gold" tier); NPS <35 |
| **Sustainable** | LTV:CAC ≥2.5×; RPR ≥25% (mission-driven loyalty is strong); loyalty program tied to impact (e.g. "1% of every purchase funds X"); NPS 40–55 | Discount-led loyalty (Sustainable customers want mission-tied rewards, not just points); NPS <40 |
| **Gen-Z** | LTV:CAC ≥1.5× (Gen-Z churn is structural — the bar is lower); RPR ≥15%; Discord/community-tied loyalty (NOT traditional points); NPS 25–45 | Traditional points-based loyalty (Gen-Z doesn't engage with points); NPS <20 |
| **B2B** | LTV:CAC ≥3× (B2B LTV is per-account, not per-customer); RPR ≥40% (B2B repurchase is annual+); account-manager-tied loyalty (NOT mass-enrollment); NPS 30–50 | Mass-enrollment loyalty (B2B customers don't want consumer-style rewards); NPS <25 |

### Dimension 4 — Content (organic + paid + email/SMS)

**What this dimension measures:** The brand's content engine — blog / SEO / organic social / paid social / email / SMS — and how it compounds vs competitors' content engines.

**Sub-questions (paste-ready scoring rubric):**
1. Does the brand publish organic content (blog / YouTube / podcast / TikTok) at a consistent cadence (Default: weekly; Luxury: monthly with high production value; Sustainable: monthly + mission-tied; Gen-Z: 3–5×/week on TikTok; B2B: 2–4×/month on LinkedIn)?
2. Does the brand have an SEO strategy (programmatic landing pages, comparison pages, "best X for Y" pages) that ranks for category-defining keywords?
3. Does the brand have an email/SMS lifecycle program (Asset 01's T1-T8 templates + Move #1 + #4 + #7 + #8)?
4. Does the brand have a content-to-commerce loop (e.g. blog post → email capture → welcome series → first purchase → post-purchase upsell)?
5. Does the brand avoid the "content for content's sake" trap (lots of content but no commercial outcome)?

**What moves this dimension:** Asset 01's T1-T8 templates (8 paste-ready Klaviyo + Postscript templates) + Move #4 welcome series (5-email flow) + Move #7 SMS (welcome + abandoned cart + review request) + SEO program (programmatic landing pages via Triple Whale audience insights) + content-to-commerce loop (Asset 02 voice framework + Asset 01 templates + Asset 03 UGC).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | Weekly blog + daily organic social + email/SMS lifecycle with ≥5 automated flows + SEO landing pages | Monthly blog + sporadic social + email-only (no SMS) + no SEO |
| **Luxury** | Monthly long-form editorial (magazine-quality) + quarterly print catalog + curated email (NOT mass-blast) + 1:1 SMS for VIP only | Daily social + mass-blast email (Luxury customers don't want to be "in the list"); no long-form |
| **Sustainable** | Monthly impact report + educational content (carbon math, materials science) + mission-tied social + email with impact-updates | Discount-led email (Sustainable credibility suffers); no educational content |
| **Gen-Z** | 3–5×/week TikTok + Discord community + meme-aware email + SMS-only lifecycle | Long-form blog (Gen-Z doesn't read); corporate-tone social; email-only without SMS |
| **B2B** | 2–4×/month LinkedIn + quarterly whitepaper + webinar series + account-manager email cadence | TikTok/Instagram-led (B2B buyers aren't on TikTok); mass-blast email |

### Dimension 5 — Shipping and fulfillment

**What this dimension measures:** Shipping speed, shipping cost, packaging quality, returns experience — the post-purchase operational layer that compounds retention (Dimension 3) AND drives acquisition (free shipping is a top-3 conversion lever for DTC).

**Sub-questions (paste-ready scoring rubric):**
1. What is the brand's standard shipping speed (free 5–7 day, free 2-day, expedited paid) — and how does it compare to competitors?
2. Does the brand offer free shipping above a threshold (industry baseline $50–$75 for Default, $100+ for Luxury, $40–$60 for Gen-Z), and is the threshold prominently displayed?
3. Does the brand's packaging signal the voice (Default: clean minimal; Luxury: white-glove unboxing; Sustainable: recycled + compostable; Gen-Z: surprise-and-delight stickers + extras; B2B: branded bulk-shipper)?
4. What is the brand's return rate (industry baseline 15–25% for apparel, 5–10% for non-apparel) — and is it within the healthy range for the category?
5. Does the brand have a returns portal (ReturnsGo / Loop / Returnly) — and is the experience 1-click vs 5-step?

**What moves this dimension:** Free-shipping threshold (set above AOV to drive AOV-lift) + packaging redesign (per voice profile) + returns portal (ReturnsGo $0–$249/mo) + carrier negotiation (UPS/FedEx rate shopping via Shippo/EasyPost).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | Free 5–7 day OR $5 flat; free above $50; clean minimal packaging; 30-day returns | $9.99+ shipping; no free-shipping threshold; cheap poly-mailer; no returns portal |
| **Luxury** | Free 2-day + white-glove available; free above $100; ribbon-tied boxes + handwritten thank-you; 60-day returns + free return shipping | Free 5–7 day (Luxury customers expect 2-day); poly-mailer (signals mass-market); 14-day returns (signals low confidence) |
| **Sustainable** | Free 5–7 day via carbon-neutral carrier; recycled + compostable packaging; circular returns (repair / donate / recycle); 60-day returns | Standard non-carbon-neutral shipping; plastic bubble-wrap; landfill returns |
| **Gen-Z** | Free 5–7 day + surprise-and-delight unboxing (stickers / samples / memes); free above $40; 30-day returns; TikTok-friendly packaging (instagrammable) | White-glove packaging (Gen-Z doesn't care about white-glove); boring brown box; 14-day returns with restocking fee |
| **B2B** | Free 2-day for orders >$500; bulk-shipper packaging; 60-day net-30 returns; account-manager-coordinated returns for $1k+ orders | Consumer-style packaging; no account-manager coordination; 30-day returns with restocking fee |

### Dimension 6 — Creator mix

**What this dimension measures:** The brand's UGC + paid-creator + affiliate program (per Asset 03) and how it compares to competitors' creator programs.

**Sub-questions (paste-ready scoring rubric):**
1. Does the brand have a UGC program (Asset 03) — and how many UGC pieces are on the PDP reviews block (per Move #9 PDP reviews block)?
2. Does the brand have a paid-creator program (Asset 03's 5 outreach emails + 3 contracts) — and how many active paid creators per month?
3. Does the brand have an affiliate program (Asset 03's C3 affiliate contract + 10–25% rev share) — and how many active affiliates per month?
4. What is the brand's UGC cohort LTV vs paid-social cohort LTV (Asset 05 Metric #12) — is UGC ≥1.2× paid-social?
5. Does the brand avoid the "creator-volume trap" (50+ creators with low quality) — and does it invest in 5–10 high-quality creator relationships instead?

**What moves this dimension:** Asset 03 UGC brief (5 outreach + 3 contracts + Klaviyo UGC segment) + Move #9 PDP reviews block (UGC surfaces on PDP) + Asset 06 NPS-survey (UGC-acquired customers typically have higher NPS, verified via cohort-by-NPS-bucket LTV) + Move #9.5 PDP A/B testing (UGC-vs-creator variant).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | 20+ UGC pieces on PDP + 5–10 active paid creators + 30+ active affiliates + UGC-cohort LTV ≥1.5× paid-social | <5 UGC pieces + no paid creators + no affiliates; UGC-cohort LTV not measured |
| **Luxury** | 10+ curated UGC pieces (NOT 50+ — Luxury is curated) + 3–5 high-tier paid creators (Macro-tier only, NOT Micro) + no mass-affiliate (Luxury doesn't do 25% rev-share); UGC-cohort LTV ≥2× paid-social | Mass-affiliate (Luxury credibility suffers); Micro-tier creators; 50+ UGC pieces with low quality |
| **Sustainable** | 15+ mission-tied UGC pieces + 5–10 mission-aligned paid creators + impact-tied affiliate (e.g. "10% of every sale funds X"); UGC-cohort LTV ≥1.5× paid-social | Creator-volume trap (50+ creators); no mission-tied affiliate; no UGC impact-tie |
| **Gen-Z** | 50+ UGC pieces (Gen-Z has higher UGC velocity) + 10–20 active TikTok creators + Discord-tied affiliate (10% rev share + Discord role); UGC-cohort LTV ≥1.5× paid-social | Low UGC volume (<10); no TikTok creators; traditional affiliate (no Discord-tie) |
| **B2B** | 5–10 industry-expert UGC pieces (case studies / whitepapers) + 3–5 LinkedIn thought-leader paid creators + partner-affiliate (reseller / consultant); UGC-cohort LTV ≥1.2× paid-social | Mass-affiliate (B2B doesn't have mass-affiliate); TikTok creators; no LinkedIn thought-leader investment |

### Dimension 7 — Paid mix

**What this dimension measures:** The brand's paid-acquisition engine — Meta / Google / TikTok / Snap / Pinterest / programmatic — and how it compares to competitors' paid-acquisition efficiency (CAC, ROAS, payback period).

**Sub-questions (paste-ready scoring rubric):**
1. What is the brand's blended CAC (Asset 05 Metric #1) vs the category baseline (typically $30–$60 for Default DTC, $80–$150 for Luxury, $20–$40 for Gen-Z)?
2. What is the brand's blended ROAS (industry baseline ≥2× for Default, ≥3× for Luxury, ≥1.5× for Gen-Z)?
3. What is the brand's payback period (Asset 05 Metric #8) — is it <6 months (Default / B2B), <12 months (Luxury), or <3 months (Gen-Z with flash-sale)?
4. Does the brand have a Meta + TikTok + Google diversification (per Move #6.6 TikTok audit + Move #6.7 Snap+Pinterest audit + Move #6.8 cross-platform drift rollup)?
5. Does the brand avoid the "single-platform dependency" trap (>70% of paid spend on one platform)?

**What moves this dimension:** Move #6 Triple Whale (CAC / ROAS / payback reporting) + Move #6.5 attribution-quality audit (prevents silent attribution-degradation) + Move #6.6 TikTok audit + Move #6.7 Snap+Pinterest audit + Move #6.8 cross-platform drift rollup + Move #11 AI ad creative iteration (≥10 creatives per ad set per week).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | Blended CAC $30–$60; ROAS ≥2×; payback <6 months; diversified Meta + TikTok + Google (no single platform >60%) | Blended CAC >$80; ROAS <1.5×; payback >12 months; >70% on one platform |
| **Luxury** | Blended CAC $80–$150; ROAS ≥3×; payback <12 months; Meta + Google + Pinterest (no TikTok — Luxury customers aren't on TikTok) | TikTok-led (Luxury audience-fit is poor); ROAS <2×; payback >18 months |
| **Sustainable** | Blended CAC $30–$60; ROAS ≥2×; payback <9 months; Meta + Google + Pinterest (sustainable-audience-fit) | TikTok-led (Sustainable credibility suffers on TikTok fashion/beauty); ROAS <1.5× |
| **Gen-Z** | Blended CAC $20–$40; ROAS ≥1.5×; payback <3 months; TikTok-led (60%+) + Meta + Snap; high creative-iteration cadence (per Move #11 AI ad creative) | Meta-led (Gen-Z audience-fit is poor); low creative-iteration (<5/week); payback >6 months |
| **B2B** | Blended CAC $200–$500 (B2B ACV justifies); ROAS ≥3×; payback <12 months; Google + LinkedIn + industry publications | Meta-led (B2B audience-fit is poor); TikTok-led; ROAS <2×; payback >18 months |

### Dimension 8 — Voice-and-tone

**What this dimension measures:** How consistently the brand's voice (per Asset 02's 5 voice profiles × 5-dimension framework) is applied across all surfaces — homepage / PDP / email / SMS / paid-social / creator content / CS responses / returns portal.

**Sub-questions (paste-ready scoring rubric):**
1. Can a visitor identify the brand's voice within 30 seconds of landing on the homepage (vs a competitor's homepage)?
2. Is the brand's voice CONSISTENT across all surfaces — or does the email voice differ from the homepage voice which differs from the CS-response voice?
3. Does the brand's voice signal a specific audience (per Asset 02's ICP dimension) — or is it generic ("we're for everyone")?
4. Does the brand avoid the "voice-drift" trap (voice changes over time as new hires or agencies take over — the canonical decay mode for funded DTC brands)?
5. Does the brand's voice include the 5-dimension profile applied (Formality / Humor / Directness / Brand-name usage / Objection handling) — or is the voice undefined?

**What moves this dimension:** Asset 02 brand-voice framework (5 voice profiles × 5-dimension framework with adaptation recipe) + Asset 01 templates (T1-T8 templates apply voice mechanically to each email/SMS) + Move #8 loyalty program (Smile.io tier-upgrade messaging applies voice) + Asset 03 UGC outreach (U1-U5 outreach emails apply voice).

**Default vs override scoring (1–5 per voice profile):**

| Voice profile | Score 5 = Top-quartile signature | Score 1 = Bottom-quartile signature |
|---|---|---|
| **Default** | Formality 2/5 + Humor 3/5 + Directness 4/5 + Brand-name usage "occasional" + Objection handling "FAQ block"; consistent across all surfaces | Voice drifts between surfaces (email-formal + social-casual + CS-robotic); no defined profile |
| **Luxury** | Formality 4/5 + Humor 1/5 + Directness 2/5 + Brand-name usage "prominent" + Objection handling "1:1 concierge"; heritage-language consistent | Casual / playful tone (signals mass-market); discount-led copy (signals discounting); FAQ-block objection handling (signals mass-market) |
| **Sustainable** | Formality 3/5 + Humor 2/5 + Directness 3/5 + Brand-name usage "mission-led" + Objection handling "impact-stories"; mission-led consistent | Discount-led (signals credibility gap); greenwashing language ("eco-friendly" without specifics); no impact-story objection handling |
| **Gen-Z** | Formality 1/5 + Humor 4/5 + Directness 5/5 + Brand-name usage "ironic / self-deprecating" + Objection handling "meme-aware"; TikTok-native consistent | Corporate-tone (signals out-of-touch); formal FAQ (signals Gen-Z disconnect); no meme-awareness |
| **B2B** | Formality 4/5 + Humor 1/5 + Directness 4/5 + Brand-name usage "ROI-anchored" + Objection handling "case-study + ROI-calculator"; ROI-anchored consistent | Casual / meme-tone (signals not-B2B); no ROI-calculator objection handling; lifestyle imagery (signals not-B2B) |

## The 3×5 scoring matrix template (paste-ready)

Copy this into Google Sheets / Notion / Airtable and fill in your brand + 3–5 named competitors. Each row is a dimension, each column is a brand, each cell is a 1–5 score.

```
| Dimension          | Your brand | Competitor 1 | Competitor 2 | Competitor 3 | Competitor 4 | Competitor 5 |
|--------------------|------------|--------------|--------------|--------------|--------------|--------------|
| 1. Positioning     |            |              |              |              |              |              |
| 2. Pricing         |            |              |              |              |              |              |
| 3. Retention/loyalty|           |              |              |              |              |              |
| 4. Content         |            |              |              |              |              |              |
| 5. Shipping        |            |              |              |              |              |              |
| 6. Creator mix     |            |              |              |              |              |              |
| 7. Paid mix        |            |              |              |              |              |              |
| 8. Voice-and-tone  |            |              |              |              |              |              |
| **TOTAL (out of 40)** |         |              |              |              |              |              |
| **AVERAGE (out of 5)**  |         |              |              |              |              |              |
```

**Interpretation rubric:** Total score /40 = headline competitive-positioning score. AVERAGE /5 = per-dimension average. The **weakest 2 dimensions** (lowest scores) are the operator's competitive vulnerabilities → invest first. The **strongest 2 dimensions** (highest scores) are the operator's competitive moats → invest in defending.

**Per-voice-profile interpretation rule:** operators MUST apply the voice-driven override columns from each dimension's table above. A Luxury brand scoring 5 on shipping + a Gen-Z brand scoring 5 on shipping are not the same — the Luxury 5 means "white-glove unboxing" while the Gen-Z 5 means "instagrammable surprise-and-delight." Comparing absolute scores across voice profiles is the canonical teardown misuse trap.

## Competitor-sourcing decision matrix — where to find 3–5 named competitors

| Sourcing model | Cost | Time-to-data | Data depth | When to use |
|---|---|---|---|---|
| **Google search + marketplace browsing** | $0 | 2–4 hr | Surface-level (homepage / pricing / category browsing) | Day-1 self-teardown; finding 3 direct competitors |
| **Meta Ad Library + TikTok Creative Center** | $0 | 1–2 hr per platform | Mid-depth (active ad copy, creative, audience signals from comment tone) | Day-7 teardown; finding 3–5 active-advertising competitors + their messaging |
| **Similarweb + Semrush** | $200–$500/mo each | 30 min per site | Deep (traffic estimates, keyword-rank, backlink profile, paid-spend estimates) | $500k+/mo GMV; ongoing competitive monitoring |
| **Shopify store-listing directories** (Shopify Exchange, Myip.ms, Store Leads) | $0–$99/mo | 1 hr | Mid-depth (tech-stack detection, app install list, theme detection) | Day-1 teardown for Shopify-native DTC |
| **Glimpse / Postscript / Triple Whale competitive reports** | $0–$250/mo | 1 hr | Deep (cohort-LTV benchmarks, NPS benchmarks, channel-mix benchmarks) | $50k+/mo GMV; benchmarking against cohort-aggregated data |

**Default case for $0–$50k/mo GMV:** Google search + marketplace browsing + Meta Ad Library + Shopify store-listing. Cost: $0. Time: 4–6 hr total. Enough to identify 3 direct competitors + score them on the 8 dimensions.

**Default case for $50k–$500k/mo GMV:** Above + TikTok Creative Center + Glimpse. Cost: $0–$99/mo. Time: 6–10 hr. Enough to identify 3–5 competitors + run the teardown quarterly.

**Default case for $500k+/mo GMV:** Above + Similarweb OR Semrush. Cost: $200–$500/mo. Time: ongoing monitoring. Enough for the "always-on" competitive-intel pipeline.

## 8 verification gates — confirming your teardown data is real

Each gate is a paste-runnable recipe to confirm the operator's teardown scoring is grounded in real data, not vibes.

**Gate A — Positioning-verification gate:** For each scored brand, run `curl -sS <brand-homepage> | grep -ciE "hero|tagline|<h1>"` to confirm the brand's tagline is verifiable on the homepage. Expected: ≥1 hit per brand.

**Gate B — Pricing-verification gate:** For each scored brand, document the AOV from a sample of 5 PDPs (`curl -sS <brand-pdp-1> | grep -oE '\$[0-9]+\.[0-9]{2}'` averaged across 5 PDPs). Expected: AOV variance within ±25% of competitor average (within the same quality tier).

**Gate C — Retention-verification gate:** For each scored brand, find at least 1 public source (Similarweb monthly-visits + review-volume on Trustpilot / Yotpo / Reviews.io / Google Reviews) that confirms the brand's retention signals. Expected: ≥1 public signal per brand.

**Gate D — Content-verification gate:** For each scored brand, run `curl -sS <brand-blog-feed> | grep -c "<entry>"` OR check Instagram follower count + posting cadence. Expected: posting cadence within the voice-profile baseline (Default weekly+; Luxury monthly+; Sustainable monthly+; Gen-Z 3–5×/week; B2B 2–4×/month).

**Gate E — Shipping-verification gate:** For each scored brand, document the free-shipping threshold from the brand's shipping policy page + 1 PDP cart-add simulation. Expected: threshold documented + verified.

**Gate F — Creator-verification gate:** For each scored brand, run Meta Ad Library + TikTok Creative Center searches for the brand name + check for branded hashtag volume on Instagram / TikTok. Expected: ≥1 active paid-creator signal OR branded-hashtag volume >100.

**Gate G — Paid-verification gate:** For each scored brand, Meta Ad Library + TikTok Creative Center + Google Ads Transparency show active paid spend. Expected: ≥2 platforms with active spend within the last 30 days.

**Gate H — Voice-verification gate:** For each scored brand, document 1 quote from the homepage + 1 quote from an email signup + 1 quote from a CS response. Expected: voice consistency verifiable across ≥2 surfaces.

## Verification recipe (paste-runnable shell block)

```bash
ARTIFACT="assets/07-competitive-teardown.md"

# Gate A — Structural completeness (≥10 sections)
echo "=== Gate A: Structural completeness ==="
grep -c "^## " "$ARTIFACT"
# Expect: >= 10 (Goal + 8 dimensions + Scoring matrix + Sourcing matrix + Verification gates + Verification recipe + Related)

# Gate B — Concrete-content-density (8 dimensions all named)
echo "=== Gate B: 8 dimensions named ==="
for dim in "Positioning" "Pricing" "Retention" "Content" "Shipping" "Creator" "Paid" "Voice"; do
  echo -n "$dim: "
  grep -c "$dim" "$ARTIFACT"
done
# Expect: each dimension >= 10 mentions

# Gate C — Voice-density gate (5 voice profiles, >= 15 mentions each per v1.24.0)
echo "=== Gate C: Voice-density per profile ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo -n "$voice: "
  grep -c "\\b$voice\\b" "$ARTIFACT"
done
# Expect: each voice profile >= 15 mentions

# Gate D — Anti-pattern grep
echo "=== Gate D: Anti-pattern grep ==="
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" "$ARTIFACT"
# Expect: 0 matches

# Gate E — Sibling-consistency (cross-references resolve)
echo "=== Gate E: Cross-reference resolution ==="
for ref in "assets/01-copy-templates.md" "assets/02-brand-voice.md" "assets/03-ugc-brief.md" "assets/04-promo-calendar.md" "assets/05-retention-metrics.md" "assets/06-nps-survey-toolkit.md" "playbooks/01-abandoned-cart-flow-klaviyo.md" "playbooks/06-install-attribution-triplewhale-or-polar.md"; do
  test -f "$ref" && echo "OK: $ref" || echo "MISSING: $ref"
done
# Expect: all OK
```

**Expected output:** Gate A returns ≥10 sections; Gate B returns each dimension ≥10 mentions; Gate C returns each voice profile ≥15 mentions; Gate D returns 0 matches; Gate E returns all OK.

## Related

**Sibling assets that this builds on (compounds the value of all 6 prior assets):**

- `assets/01-copy-templates.md` — the 8 paste-ready Klaviyo + Postscript templates. The "voice-and-tone" dimension (Dimension 8) + the "content" dimension (Dimension 4) both benchmark competitors' templates vs the operator's. The 5 outreach emails (U1-U5) are NOT directly benchmarked in this teardown, but the "creator mix" dimension (Dimension 6) compounds Asset 03's outreach-program quality.
- `assets/02-brand-voice.md` — the 5 voice profiles. **Every dimension in this teardown ships with 5 voice-driven override columns** (Default / Luxury / Sustainable / Gen-Z / B2B). Operators without an Asset 02 profile pick the Default column and lose the 40 override cells (5 voice profiles × 8 dimensions) that make the teardown actionable.
- `assets/03-ugc-brief.md` — the UGC program with 5 outreach emails + 3 contracts + Klaviyo UGC segment tag. Dimension 6 (Creator mix) is **only comparable** when both operator + competitor have a UGC program; operators without Asset 03 cannot answer sub-question 1 (UGC pieces on PDP) + sub-question 4 (UGC cohort LTV vs paid-social).
- `assets/04-promo-calendar.md` — the 12-month promotional calendar. Dimension 2 (Pricing) compares competitors' promo cadence to Asset 04's Q1-low / Q4-peak macro shape; a competitor running 6 sitewide sales per year is structurally out of cadence with Asset 04's macro shape.
- `assets/05-retention-metrics.md` — the 12-metric retention reference card. Dimension 3 (Retention and loyalty) uses the 12 metrics as the comparison baseline; the 4 voice-driven override columns on Metric #11 (NPS) + Metric #3 (LTV:CAC) + Metric #5 (RPR) directly map to Dimension 3's per-voice override scoring.
- `assets/06-nps-survey-toolkit.md` — the NPS-survey program. Dimension 3's NPS sub-question uses cohort-by-NPS-bucket LTV (per Asset 06's Step 6) as the competitive-NPS benchmark; operators without Asset 06's NPS-survey pipeline cannot compute the NPS-cohort-LTV signal.

**Playbooks that this teardown maps to:**

- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1) — Dimension 2 (Pricing) + Dimension 3 (Retention) benchmark competitors' abandoned-cart flows; a competitor with a 3-email flow + SMS is best-in-class (score 5); an operator without Move #1 is bottom-quartile (score 1–2).
- `playbooks/02-post-purchase-upsell-klaviyo.md` (Move #2) — Dimension 3 (Retention) benchmarks competitors' post-purchase flow; a competitor with a 3-step upsell (Move #2 spec) is best-in-class.
- `playbooks/03-checkout-audit.md` (Move #3) — Dimension 5 (Shipping and fulfillment) + the broader "post-purchase operational layer" use Move #3's 18-point audit as the scoring rubric.
- `playbooks/04-welcome-series-klaviyo.md` (Move #4) — Dimension 4 (Content) benchmarks competitors' welcome series; a competitor with the 5-email Move #4 flow + SMS is best-in-class.
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — Dimension 7 (Paid mix) sources CAC / ROAS / payback from Triple Whale's competitive-benchmark report; operators without Move #6 cannot score Dimension 7.
- `playbooks/06.5-attribution-quality-audit.md` (Move #6.5) — ensures the Triple Whale data pipeline (Dimension 7's data source) is trustworthy; Move #6.5 Gate E (week-over-week drift ≤ 5pp) catches CAC + LTV drift before it cascades into Dimension 7 mis-scoring.
- `playbooks/07-loyalty-program-smile.md` (Move #8) — Dimension 3 (Retention and loyalty) benchmarks competitors' loyalty programs; a competitor with the 3-tier Smile.io / LoyaltyLion / Yotpo Loyalty Move #8 spec is best-in-class.

**Research that informed this teardown:**

- `research/00-ecommerce-ops-landscape.md` — the DTC retention benchmark + competitive-positioning patterns (the "Email/SMS > paid social at the margin" + "Mobile conversion is the largest unrealized lever" principles inform Dimensions 4 + 7).
- `research/01-tools-stack-comparison.md` — the vendor matrix informs the "competitor-sourcing decision matrix" (which competitive-intel tools to use at which GMV tier) + Dimension 5's shipping / returns vendor options.

**Forward-pointing references (planned future assets):**

- `assets/08-cs-response-library.md` *(planned — does not yet exist)* — the next-asset candidate for a future tick. Per Asset 06's Related section, the B2B + Luxury voice profiles have CS-template-library as the highest-priority Asset-08 candidate (Luxury CS tone is highly specific + 80% of Luxury CX failures come from mis-toned responses; B2B account-manager CS templates scale sales velocity). Compounds Asset 07 Dimension 8 (Voice-and-tone) by adding the CS-response-voice framework.
- `assets/09-impact-reporting.md` *(planned — does not yet exist)* — the Sustainable-voice Asset-09 candidate. Compounds Asset 05 Metric #12 (cohort LTV by UGC vs paid-social vs organic) by adding the impact-reporting overlay (carbon footprint per shipment / recycled materials % / B-Corp certification / 1% for the Planet donation tracking / etc.).
- `assets/10-affiliate-program-playbook.md` *(planned — does not yet exist)* — the Default-voice Asset-10 candidate. Compounds Asset 03 C3 affiliate contract by adding the full affiliate-program playbook (commission-tier framework / payout schedule / cookie-window / FTC compliance / cohort-LTV measurement).
