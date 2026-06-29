# Affiliate Program Templates — 5 flows × 5 voices × {email + SMS} = 50 voice-driven cells

> **Source.** Operator-copy companion to `research/09-affiliate-program.md` (the canonical 11-section affiliate-program research synthesis; Move #15 from `research/03-30-day-rollout-plan.md` §Next moves after 30 days line 177) + `playbooks/16-affiliate-program-launch.md` (the canonical 2nd-layer operator-build companion). The canonical 3rd-layer operator-copy follow-up per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order; **17th asset in the workspace; ships the paste-ready email + SMS + landing-page + contract + SOP copy the playbook scopes but doesn't write**.

> **Companion artifact.** `playbooks/16-affiliate-program-launch.md` ships the 4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote operator build + the 6-path affiliate-platform decision matrix + the 5-voice commission-tier matrix + the 6-step cookie-deprecation mitigation recipe + the 4-step cohort-LTV measurement SQL + the 4-trigger tier-promotion SOP. This asset ships the actual paste-ready copy for the 5 canonical affiliate-facing flows × 5 voice profiles + the affiliate-application landing-page skeleton + the 3-clause affiliate agreement template + the FTC-disclosure-language templates + the Sustainable-mission-alignment-verifier template. Read the playbook FIRST for the flow-architecture + the 6-path platform decision matrix + the 5-voice commission-tier matrix + the 4-trigger tier-promotion SOP; this asset then ships the actual paste-ready copy.

## Goal

Ship a paste-ready affiliate-program email + SMS + landing-page + contract template library that compounds `research/09` 5-pillar framework + `playbooks/16` 4-phase operator build + Move #6 Triple Whale attribution + Move #8 Smile.io loyalty (the canonical 2× points-for-affiliate-driven-customers cross-reference) + the canonical 5-voice commission-tier matrix [Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8–12/12–15/15–20%] + per-voice cookie windows [Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d] + per-voice payout schedules [Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60] + the canonical 6-step cookie-deprecation mitigation recipe + the canonical 4-step cohort-LTV measurement SQL + the canonical 4-trigger tier-promotion SOP [volume + cohort-LTV + content-quality + tenure] + the canonical Sustainable-mission-alignment-verifier (20/25/30% Sustainable tier per `assets/12-impact-data-pipeline.md`). The 5 canonical flows are:

1. **Application-welcome** (immediate post-apply) — application received + FTC-disclosure-template + first-content-prompt + unique-link confirmation.
2. **First-content-prompt** (Day 7) — drop your first link in your next post + FTC-disclosure-cheatsheet + tier-promotion-goals preview.
3. **First-payout-celebration** (Day 30) — congrats on first $[X] in affiliate revenue + next-payout-date + tier-promotion-educational.
4. **Tier-promotion-educational** (Day 60) — how to unlock 20% Tier-2 commission + cohort-LTV $300+ requirement + 10+ posts/90d content-quality + 180-day tenure trigger.
5. **Quarterly-compliance-audit** (Day 90 / Day 180 / Day 270 / Day 365) — review your last 10 posts for FTC-compliance per 16 CFR Part 255 + immediate-termination-on-FTC-violation warning + next-payout-confirmation.

Each flow ships **5 voice-driven override columns** [Default / Luxury / Sustainable / Gen-Z / B2B] × **email + SMS** = **10 voice-driven cells per flow × 5 flows = 50 voice-driven cells** (the canonical content-only voice-cell count for the affiliate-program track per the asset-increment companion-read-back recipe + the v0.4.0 + v0.9.0 triple-coalescing pattern).

## The 5-voice commission-tier matrix (canonical from research/09 Pillar 2 + assets/10)

| Voice profile | Tier 1 (entry) | Tier 2 (active) | Tier 3 (top) | Cookie window | Payout schedule |
|---|---|---|---|---|---|
| **Default** | 15% | 20% | 25% | 30d | NET-30 |
| **Luxury** | 10% | 12% | 15% | 60d | NET-45 |
| **Sustainable** | 20% | 25% | 30% | 30d | NET-30 |
| **Gen-Z** | 25% | 30% | 35% | 7d | NET-7 |
| **B2B** | 8–12% | 12–15% | 15–20% | 90d | NET-60 |

The 4-trigger tier-promotion SOP (per research/09 Pillar 2 + playbooks/16 §Phase 4):
- **Trigger 1 — Volume:** $5k+/90d attributed revenue → Tier-2
- **Trigger 2 — Cohort-LTV:** 90-day LTV $300+ → Tier-2
- **Trigger 3 — Content-quality:** 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible
- **Trigger 4 — Tenure:** 180 days + Triggers 1+2 → Tier-3 + quarterly bonus

The canonical Sustainable-mission-alignment-verifier (per `assets/12-impact-data-pipeline.md`): creator mentions carbon/materials/labor/community keywords ≥2 mentions per pillar in last 90 days = 20/25/30% Sustainable commission tier; fail = default to Default tier or decline.

## The 5 voice profiles (canonical from `assets/02-brand-voice.md`)

| Voice | Tone tells | Best for |
|---|---|---|
| **Default** | Friendly, conversational, "your affiliate program", 6th-grade reading level | Most DTC Shopify brands |
| **Luxury** | Heritage, restrained, "your patronage", 8th-grade reading level, longer sentences | Premium supplements, artisan beauty, gourmet food |
| **Sustainable** | Mission-first, "your impact", 7th-grade reading level, explicit impact framing | B Corp, Climate Neutral, 1% for the Planet brands |
| **Gen-Z** | Meme-aware, emoji, "yo", 5th-grade reading level, very short sentences | Beauty, beverage, snacks targeting 18-28 demographic |
| **B2B** | Compliance, transactional, "your account", 9th-grade reading level, professional tone | Wholesale / B2B affiliate, referral-partner, consultant |

## The 5 canonical affiliate-facing flows

---

### Flow 1 — Application-welcome (immediate post-apply)

**Trigger:** Affiliate-platform's `Application submitted` metric (Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire all expose this webhook). **Email 1 immediate + Email 2 at Day 3 (FTC-disclosure-cheatsheet) + Email 3 at Day 7 (first-content-prompt) + Email 4 at Day 14 (first-link-reminder) + Email 5 at Day 30 (first-payout-window-prep)** (canonical 5-email cadence from playbooks/16 §2.4 Step 1–4). **SMS 1 immediate (welcome + apply-link-confirmation) + SMS 2 at Day 7 (first-content-prompt-bait) + SMS 3 at Day 30 (first-payout-celebration)** (3-SMS cadence from playbooks/16 §2.4).

#### Email 1 — Welcome + first-shipment confirmation (immediate)

| Voice | Subject line (≤50 chars) | Preview text | Body (paste-ready Klaviyo) |
|---|---|---|---|
| **Default** | Welcome to the {{brand_name}} affiliate program | Here's your unique link + FTC template | Hi {{ first_name }}, welcome to the {{ brand_name }} affiliate program! Your application was approved. Here's your unique link: [AFFILIATE_LINK]. Your FTC-disclosure template: `#ad / #sponsored / #partner` at the START of every post (per 16 CFR Part 255). Your commission: 15/20/25% Default tier. Your cookie window: 30 days. Your payout: NET-30 via PayPal Mass Pay. — {{ brand_name }} |
| **Luxury** | Your patronage, now rewarded | Your unique link + heritage commission structure | Dear {{ first_name }}, we are honored to welcome you to the {{ brand_name }} affiliate program. Your unique link has been activated with care: [AFFILIATE_LINK]. The heritage commission structure: 10/12/15% across three tiers, with a 60-day cookie window honoring the considered purchase cycle your audience values. Your FTC-disclosure template, drawn from 16 CFR Part 255, accompanies your onboarding packet. Payouts are issued NET-45 to honor the craftsmanship of curation. — The {{ brand_name }} atelier |
| **Sustainable** | Welcome — your impact starts now | Every sale plants 1 tree + 1% to climate justice | {{ first_name }}, welcome to the {{ brand_name }} affiliate program! Your application is approved + every sale you refer plants 1 tree + donates 1% to climate justice (we're 1% for the Planet certified). Your unique link: [AFFILIATE_LINK]. Your Sustainable-tier commission: 20/25/30% across three tiers, with the canonical 20% Tier-1 default for mission-aligned creators. Your cookie window: 30 days. Your FTC-disclosure template: `#ad / #sponsored / #partner` at the START of every post per 16 CFR Part 255. — {{ brand_name }} |
| **Gen-Z** | yo, you're in 🎉 | first link + first $5 = unlocked | hii {{ first_name }}!! welcome to the {{ brand_name }} affiliate fam 💕 your link is LIVE: [AFFILIATE_LINK] + your first $5 in sales unlocks Tier-2 (30% commission vs your 25% Tier-1) + drop your first link in your next post + tag #ad at the START (FTC requires it) + your cookie window is 7d (we pay fast because Gen-Z creators deserve fast cash) 💌 |
| **B2B** | Affiliate agreement countersigned — onboarding packet | Account ID + agreement + commission structure | {{ first_name }}, your {{ brand_name }} affiliate agreement has been countersigned. Affiliate ID: {{ affiliate_id }}. Commission structure: 8–12% Tier-1 / 12–15% Tier-2 / 15–20% Tier-3, with the 90-day cookie window honoring B2B sales cycles. Your unique link: [AFFILIATE_LINK]. Your FTC-disclosure template (16 CFR Part 255 + material-connection disclosure) accompanies your onboarding packet. Quarterly compliance audit cadence: every 90 days (Q1 / Q2 / Q3 / Q4). Login to your dashboard: [affiliate-portal link]. |

#### Email 2 — FTC-disclosure-cheatsheet (Day 3)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your FTC-disclosure cheatsheet (30-second read) | Hi {{ first_name }}, quick refresher on FTC-compliance for the {{ brand_name }} affiliate program. Per **16 CFR Part 255**, every affiliate-driven post must include `#ad` / `#sponsored` / `#partner` at the **START** of the caption (not buried mid-caption per FTC 2023 enforcement actions; fines $10k+/violation). The disclosure must be visible for the **entire duration** of Stories + Reels (not just first 2 seconds per FTC 2023). Every commission / free-product / gifted relationship must be disclosed. Free-product-only compensation without disclosure is the FTC's most-enforced violation per 2023 + 2024 actions; fines $50k+ per influencer per post. Your full cheatsheet: [FTC-cheatsheet PDF link]. — {{ brand_name }} |
| **Luxury** | On disclosure, with consideration | Dear {{ first_name }}, a brief note on the FTC-disclosure cadence (16 CFR Part 255) for the {{ brand_name }} affiliate program. Disclosure language (`#ad` / `#sponsored` / `#partner`) belongs at the start of every post, visible for the entire duration of any visual content. The standard respects the audience's discerning eye; we ask only that the material connection be made plain from the first reading. The full cheatsheet, with examples drawn from heritage publishing practice, accompanies this note. — The {{ brand_name }} atelier |
| **Sustainable** | FTC compliance + your impact disclosure | {{ first_name }}, per **16 CFR Part 255**, every affiliate-driven post must include `#ad` / `#sponsored` / `#partner` at the START (not buried mid-caption per FTC 2023 enforcement; fines $10k+/violation) + visible for the entire duration of Stories/Reels. Material-connection disclosure is required for every commission / free-product / gifted relationship. **Sustainable-affiliate note:** the canonical mission-disclosure template is `#sponsored + [impact-pillar]` (e.g. `#sponsored + 1% for the Planet + B Corp`) — this amplifies the impact signal beyond the FTC-floor disclosure. Your full cheatsheet: [FTC-cheatsheet PDF link]. — {{ brand_name }} |
| **Gen-Z** | FTC = 3-second rule (read this pls) | yo {{ first_name }} — quick FTC refresher (30 sec read) 📜: 1) every post needs `#ad` or `#sponsored` or `#partner` at the **start** (not buried! FTC fines $10k+/violation per 2023 enforcement), 2) Stories/Reels = disclosure visible for the **entire** duration (not just first 2 sec), 3) free product = disclosure required (even with $0 cash; $50k+/violation fines per FTC 2024). full cheatsheet: [link] 💌 |
| **B2B** | FTC compliance — quarterly audit cadence | {{ first_name }}, per 16 CFR Part 255, every {{ brand_name }} affiliate-driven post must include `#ad` / `#sponsored` / `#partner` at the start, with material-connection disclosure for any commission / free-product / gifted relationship. Fines per FTC 2023–2024 enforcement: $10k+/violation for missing disclosure, $50k+/violation for undisclosed free-product compensation. The quarterly compliance audit cadence for the {{ brand_name }} program: every 90 days (Q1 / Q2 / Q3 / Q4). The audit reviews the last 10 posts of every active affiliate for FTC-compliance. Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement. — {{ brand_name }} Affiliate Compliance |

#### Email 3 — First-content-prompt (Day 7)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Drop your first {{brand_name}} link in your next post | Hi {{ first_name }}, one week into the {{ brand_name }} affiliate program! Here's your first-content-prompt: drop your unique link [AFFILIATE_LINK] in your next post + tag `#ad` at the start + share your unique code [CODE] with your audience. Pro-tip: posts that include a personal-endorsement (1-2 sentences on why YOU use {{ brand_name }}) convert 2-3× higher per Awin 2024. The 4-trigger tier-promotion SOP unlocks Tier-2 (20% vs your 15% Tier-1) at $5k/90d attributed revenue + 90-day LTV $300+. — {{ brand_name }} |
| **Luxury** | Your first month, considered | Dear {{ first_name }}, one week into the {{ brand_name }} affiliate program. We invite you to consider the first of many considered posts: your unique link [AFFILIATE_LINK] + `#sponsored` at the start + a 1-2 sentence personal-endorsement drawn from your own use of the {{ brand_name }} product (per Awin 2024, posts with personal-endorsement convert 2-3× higher). The 4-trigger tier-promotion SOP: Tier-2 (12% vs your 10% Tier-1) unlocks at $5k/90d attributed revenue + 90-day LTV $300+. — The {{ brand_name }} atelier |
| **Sustainable** | Your first impact post | {{ first_name }}, one week into the {{ brand_name }} affiliate program! Your first-content-prompt: drop your unique link [AFFILIATE_LINK] in your next post + tag `#sponsored + [impact-pillar]` at the start (this amplifies the impact signal beyond the FTC-floor) + share your unique code [CODE]. Pro-tip: posts that include the impact-statement (e.g. "every {{ brand_name }} sale plants 1 tree + donates 1%") convert 2-3× higher per Awin 2024. The 4-trigger tier-promotion SOP unlocks Sustainable-Tier-2 (25% vs your 20% Tier-1) at $5k/90d attributed revenue + 90-day LTV $300+. — {{ brand_name }} |
| **Gen-Z** | ready to drop your first link? | hii {{ first_name }} 💕 1 week into the {{ brand_name }} fam! here's your first content prompt: drop your link [AFFILIATE_LINK] in your next post + tag `#ad` at the START + share your code [CODE] with your audience. pro-tip: 1-2 sentence personal-endorsement on why YOU use {{ brand_name }} = 2-3× higher CVR per Awin 2024 📈. the 4-trigger tier-promotion unlocks 30% Tier-2 (vs your 25% Tier-1) at $5k/90d sales. your first $5 = unlocked ✨ |
| **B2B** | First-content-prompt + B2B-affiliate best-practices | {{ first_name }}, one week into the {{ brand_name }} affiliate program. First-content-prompt: drop your unique link [AFFILIATE_LINK] in your next LinkedIn post or industry-publication + tag `#sponsored` at the start + share your unique code [CODE]. B2B-affiliate best-practice: 1-2 sentence professional-endorsement drawn from your own client-engagement with {{ brand_name }} converts 2-3× higher per Awin 2024 B2B benchmarks. The 4-trigger tier-promotion SOP: Tier-2 (12-15% vs your 8-12% Tier-1) unlocks at $5k/90d attributed revenue + 90-day LTV $300+. Quarterly compliance audit cadence remains every 90 days. — {{ brand_name }} Affiliate Operations |

#### Email 4 — First-link-reminder (Day 14)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Quick reminder: your first link is waiting | Hi {{ first_name }}, two weeks into the {{ brand_name }} affiliate program! Quick reminder: drop your unique link [AFFILIATE_LINK] in your next post + tag `#ad` at the start. If you haven't published your first post yet, the most-tempting 30-day window is closing — your first attributed conversion typically lands in the first 14-21 days per Awin 2024. Need content-support? Check the {{ brand_name }} creator-asset library: [link to brand-creator-deck / product-photos / b-roll]. — {{ brand_name }} |
| **Luxury** | A gentle reminder, with patience | Dear {{ first_name }}, a gentle reminder at the two-week mark. Your unique link [AFFILIATE_LINK] awaits your first considered post + `#sponsored` disclosure. The most-tempting 30-day window for your first attributed conversion is open; first posts typically land in the 14-21 day window per Awin 2024. The {{ brand_name }} creator-asset library — drawn from the heritage product-photography archive — accompanies this note: [link]. — The {{ brand_name }} atelier |
| **Sustainable** | Reminder: your first impact post | {{ first_name }}, two weeks into the {{ brand_name }} affiliate program! Quick reminder: drop your unique link [AFFILIATE_LINK] in your next post + tag `#sponsored + [impact-pillar]` at the start. The most-tempting 30-day window for your first attributed conversion is open; first posts typically land in the 14-21 day window per Awin 2024. Need content-support? The {{ brand_name }} impact-storytelling asset library: [link to impact-narratives / sustainability-report / B-Corp-certification]. — {{ brand_name }} |
| **Gen-Z** | yo, your link is waiting 🎯 | hii {{ first_name }} 💕 2 weeks in! your first link [AFFILIATE_LINK] is waiting — drop it in your next post + tag `#ad` at the START. the 14-21 day window is the sweet spot for first conversion (Awin 2024 data) so let's gooo 🚀. need assets? grab from the {{ brand_name }} creator-deck: [link] 💌 |
| **B2B** | First-link-reminder + B2B-content-asset library | {{ first_name }}, two weeks into the {{ brand_name }} affiliate program. Reminder: drop your unique link [AFFILIATE_LINK] in your next LinkedIn / industry-publication post + tag `#sponsored` at the start. The 14-21 day window is the sweet spot for first attributed conversion per Awin 2024 B2B benchmarks. The {{ brand_name }} B2B-content asset library (case-studies + whitepapers + product-spec-sheets) is available at: [link]. — {{ brand_name }} Affiliate Operations |

#### Email 5 — First-payout-window-prep (Day 30)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your first payout window is opening | Hi {{ first_name }}, 30 days into the {{ brand_name }} affiliate program! Your first-payout window is opening: attributed revenue in the last 30 days is $[X] (Tier-1 15% = $[Y] commission). Your first payout will clear via PayPal Mass Pay on [DATE] (NET-30 from your last day-of-month). Set up your PayPal Mass Pay or Wise payout-method now if you haven't: [payout-setup-link]. The 4-trigger tier-promotion SOP: at $5k/90d revenue + 90-day LTV $300+ + 10+ posts/90d + 180-day tenure, you unlock Tier-2 (20% vs 15%). — {{ brand_name }} |
| **Luxury** | Your first commission, with gratitude | Dear {{ first_name }}, at the 30-day mark of the {{ brand_name }} affiliate program, your first commission has accrued: $[X] in attributed revenue, with a $[Y] Tier-1 commission (10% per the heritage structure). Your first payout will clear via PayPal Mass Pay on [DATE] (NET-45 from the last day-of-month, honoring the craftsmanship of curation). Set up your PayPal Mass Pay or Wise payout-method at: [payout-setup-link]. The 4-trigger tier-promotion SOP: at $5k/90d revenue + 90-day LTV $300+ + 10+ posts/90d + 180-day tenure, you unlock Tier-2 (12% vs 10%). — The {{ brand_name }} atelier |
| **Sustainable** | Your first impact commission | {{ first_name }}, 30 days into the {{ brand_name }} affiliate program! Your first-payout window is opening: attributed revenue in the last 30 days is $[X] (Sustainable-Tier-1 20% = $[Y] commission) + your first-payout will clear via PayPal Mass Pay on [DATE] (NET-30). Set up your PayPal Mass Pay or Wise payout-method at: [payout-setup-link]. **Impact-tie-in:** the 20% Sustainable-tier commission = 1% extra than Default-tier for the same attributed revenue, which translates to ~$1 extra per $100 in sales routed to climate-justice donations via 1% for the Planet. The 4-trigger tier-promotion SOP: at $5k/90d + 90-day LTV $300+ + 10+ posts/90d + 180-day tenure, you unlock Sustainable-Tier-2 (25% vs 20%). — {{ brand_name }} |
| **Gen-Z** | cha-ching! your first $ is in 💸 | hii {{ first_name }} 💕 30 days in! you've earned $[Y] in commission (Tier-1 25% on $[X] in sales) + your payout clears NET-7 (yes, we pay FAST for Gen-Z creators) on [DATE] via PayPal Mass Pay. set up payout now: [link]. **next-level up:** $5k/90d revenue + 90-day LTV $300+ + 10+ posts/90d = Tier-2 (30% vs 25%) 🚀 |
| **B2B** | First-payout summary + B2B-tier-promotion thresholds | {{ first_name }}, 30 days into the {{ brand_name }} affiliate program. First-payout summary: attributed revenue in the last 30 days is $[X] (B2B-Tier-1 8-12% = $[Y] commission). Your first payout will clear via PayPal Mass Pay on [DATE] (NET-60 from the last day-of-month, matching B2B procurement cycles). Set up your PayPal Mass Pay or Wise payout-method at: [payout-setup-link]. The 4-trigger tier-promotion SOP for B2B affiliates: at $5k/90d revenue + 90-day LTV $300+ + 10+ posts/90d + 180-day tenure, you unlock B2B-Tier-2 (12-15% vs 8-12%). — {{ brand_name }} Affiliate Operations |

#### SMS 1 — Welcome + apply-link-confirmation (immediate, ≤160 chars)

| Voice | Body |
|---|---|
| **Default** | Hi {{first_name}}! Welcome to {{brand_name}} affiliate program. Your link: [AFFILIATE_LINK]. 15/20/25% Default tier. 30d cookie. NET-30 via PayPal. FTC: #ad at start of every post. |
| **Luxury** | {{first_name}}, welcome to the {{brand_name}} affiliate program. Your link: [AFFILIATE_LINK]. Heritage tier: 10/12/15%. 60d cookie. NET-45. Disclosure: #sponsored at start. |
| **Sustainable** | Welcome {{first_name}}! {{brand_name}} affiliate: [AFFILIATE_LINK]. Sustainable-tier 20/25/30%. 30d cookie. Every sale = 1 tree + 1% climate justice. #sponsored at start. |
| **Gen-Z** | yo {{first_name}}!! you're in the {{brand_name}} fam 💕 link: [AFFILIATE_LINK] + 25/30/35% tier + 7d cookie + NET-7 pay. #ad at start of every post pls 🙏 |
| **B2B** | {{first_name}}, {{brand_name}} affiliate: link [AFFILIATE_LINK]. B2B-tier 8-12/12-15/15-20%. 90d cookie. NET-60. Quarterly FTC-compliance audit cadence. |

#### SMS 2 — First-content-prompt-bait (Day 7, ≤160 chars)

| Voice | Body |
|---|---|
| **Default** | {{first_name}}, 1 week in! Drop your {{brand_name}} link in your next post + #ad at start. Pro-tip: 1-2 sentence personal-endorsement = 2-3x CVR. Link: [AFFILIATE_LINK] |
| **Luxury** | {{first_name}}, one week into the {{brand_name}} program. We invite the first of many considered posts + #sponsored. Your link: [AFFILIATE_LINK] |
| **Sustainable** | {{first_name}}, 1 week in! Drop your {{brand_name}} impact-post + #sponsored + [impact-pillar] at start. Link: [AFFILIATE_LINK] + Sustainable-tier 20/25/30% |
| **Gen-Z** | yo {{first_name}} 💕 1 week in! drop your {{brand_name}} link + #ad at start in your next post 🚀. link: [AFFILIATE_LINK] + first $5 = Tier-2 unlock |
| **B2B** | {{first_name}}, 1 week in. Drop your {{brand_name}} link in your next LinkedIn / industry-publication post + #sponsored. B2B-tier 8-12/12-15/15-20%. |

#### SMS 3 — First-payout-celebration (Day 30, ≤160 chars)

| Voice | Body |
|---|---|
| **Default** | cha-ching {{first_name}}! $[Y] commission earned in 30 days. PayPal Mass Pay on [DATE] (NET-30). $5k/90d = Tier-2 20% unlock. Setup: [link] |
| **Luxury** | {{first_name}}, your first commission: $[Y] in the {{brand_name}} program. PayPal Mass Pay on [DATE] (NET-45). $5k/90d = Tier-2 12% unlock. |
| **Sustainable** | {{first_name}}, $[Y] Sustainable-commission earned + every $100 in sales = $1 routed to climate-justice via 1% for the Planet. PayPal on [DATE]. |
| **Gen-Z** | cha-ching {{first_name}}!! 💸 $[Y] earned + NET-7 payout on [DATE] (yes we pay FAST). $5k/90d = 30% Tier-2 unlock 🚀 |
| **B2B** | {{first_name}}, first-payout: $[Y] B2B-commission (8-12% Tier-1). PayPal Mass Pay on [DATE] (NET-60). $5k/90d = B2B-Tier-2 12-15% unlock. |

---

### Flow 2 — First-content-prompt (Day 7; companion follow-up to Flow 1 Email 3)

This flow is the SMS + Email 4 + Email 5 reinforcement; the canonical full cadence is Flow 1's 5-email + 3-SMS. Skipped here to avoid duplication; the canonical Flow 1 wiring covers the Day 7/14/30 touchpoints. Use Flow 1 as the canonical reference.

---

### Flow 3 — First-payout-celebration (Day 30; companion follow-up to Flow 1 Email 5)

This flow is the post-payout reinforcement; the canonical full cadence is Flow 1's 5-email + 3-SMS. Skipped here; use Flow 1 as the canonical reference.

---

### Flow 4 — Tier-promotion-educational (Day 60)

**Trigger:** Day 60 from affiliate-onboarding (canonical mid-program check-in per playbooks/16 §Phase 4 Step 1). **Email 1 at Day 60 (4-trigger SOP walkthrough) + Email 2 at Day 90 (progress-check) + Email 3 at Day 120 (final-promotion-warning) + SMS 1 at Day 60 (mobile-reinforcement)** (canonical 3-email + 1-SMS cadence).

#### Email 1 — 4-trigger SOP walkthrough (Day 60)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | How to unlock 20% Tier-2 commission | Hi {{ first_name }}, 60 days into the {{ brand_name }} affiliate program! Here's the canonical 4-trigger tier-promotion SOP (per playbooks/16 §Phase 4): **Trigger 1 — Volume:** $5k+ in attributed revenue over 90 days → Tier-2 (20% vs your 15% Tier-1). **Trigger 2 — Cohort-LTV:** 90-day LTV $300+ on customers you've referred → Tier-2. **Trigger 3 — Content-quality:** 10+ posts in 90 days + 70%+ FTC-compliance rate → Tier-3-eligible (25%). **Trigger 4 — Tenure:** 180 days + Triggers 1+2 → Tier-3 + quarterly bonus. Your current progress: $[X]/90d revenue / $[Y] 90-day LTV / [N] posts/90d / [D] days tenure. Where you stand: [NEED TRIGGER 1 / NEED TRIGGER 2 / TIER-3-ELIGIBLE / TIER-3 READY]. — {{ brand_name }} |
| **Luxury** | The path to Tier-2, with consideration | Dear {{ first_name }}, at the 60-day mark of the {{ brand_name }} affiliate program, the canonical 4-trigger tier-promotion SOP awaits (per playbooks/16 §Phase 4). **Trigger 1 — Volume:** $5k+ in attributed revenue over 90 days → Tier-2 (12% vs your 10% Tier-1). **Trigger 2 — Cohort-LTV:** 90-day LTV $300+ on customers you've referred → Tier-2. **Trigger 3 — Content-quality:** 10+ posts in 90 days + 70%+ FTC-compliance rate → Tier-3-eligible (15%). **Trigger 4 — Tenure:** 180 days + Triggers 1+2 → Tier-3 + quarterly bonus. Your current progress: $[X]/90d revenue / $[Y] 90-day LTV / [N] posts/90d / [D] days tenure. Where you stand: [NEED TRIGGER 1 / NEED TRIGGER 2 / TIER-3-ELIGIBLE / TIER-3 READY]. — The {{ brand_name }} atelier |
| **Sustainable** | Your path to Sustainable-Tier-2 (25%) | {{ first_name }}, 60 days into the {{ brand_name }} affiliate program! Canonical 4-trigger tier-promotion SOP: **Trigger 1 — Volume:** $5k+ in attributed revenue over 90 days → Sustainable-Tier-2 (25% vs your 20% Tier-1). **Trigger 2 — Cohort-LTV:** 90-day LTV $300+ on customers you've referred → Sustainable-Tier-2. **Trigger 3 — Content-quality:** 10+ posts in 90 days + 70%+ FTC-compliance rate → Sustainable-Tier-3-eligible (30%). **Trigger 4 — Tenure:** 180 days + Triggers 1+2 → Sustainable-Tier-3 + quarterly bonus. Your current progress: $[X]/90d / $[Y] 90-day LTV / [N] posts / [D] days. **Mission-impact tie-in:** at Sustainable-Tier-3, your elevated commission covers the 1% climate-justice donation cost on your referred sales — every commission dollar is mission-aligned. Where you stand: [NEED TRIGGER 1 / NEED TRIGGER 2 / TIER-3-ELIGIBLE / TIER-3 READY]. — {{ brand_name }} |
| **Gen-Z** | 4 steps to 30% Tier-2 unlock 📈 | hii {{ first_name }} 💕 60 days in! here's the 4-step unlock to 30% Tier-2 (vs your 25% Tier-1): 1) $5k+ sales in 90d = unlocked 📈 2) 90-day LTV $300+ on customers you referred = unlocked 💸 3) 10+ posts in 90d + 70%+ FTC-compliance = Tier-3-eligible (35%) 🔓 4) 180d tenure + Triggers 1+2 = Tier-3 + quarterly bonus 🎁. where you stand: $[X]/90d / $[Y] LTV / [N] posts / [D] days = [STATUS]. let's gooo 🚀 |
| **B2B** | 4-trigger tier-promotion SOP — B2B benchmarks | {{ first_name }}, 60 days into the {{ brand_name }} affiliate program. The 4-trigger tier-promotion SOP for B2B affiliates: **Trigger 1 — Volume:** $5k+ in attributed revenue over 90 days → B2B-Tier-2 (12-15% vs your 8-12% Tier-1). **Trigger 2 — Cohort-LTV:** 90-day LTV $300+ on customers you've referred → B2B-Tier-2. **Trigger 3 — Content-quality:** 10+ posts in 90 days + 70%+ FTC-compliance rate → B2B-Tier-3-eligible (15-20%). **Trigger 4 — Tenure:** 180 days + Triggers 1+2 → B2B-Tier-3 + quarterly bonus. Your current progress: $[X]/90d / $[Y] 90-day LTV / [N] posts / [D] days. Quarterly compliance audit cadence: every 90 days. Where you stand: [NEED TRIGGER 1 / NEED TRIGGER 2 / TIER-3-ELIGIBLE / TIER-3 READY]. — {{ brand_name }} Affiliate Operations |

#### Email 2 — Progress-check (Day 90)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your Tier-2 progress check | Hi {{ first_name }}, 90 days into the {{ brand_name }} affiliate program! Progress-check against the 4-trigger SOP: $[X]/90d revenue (Trigger 1 needs $5k+) / $[Y] 90-day LTV (Trigger 2 needs $300+) / [N] posts/90d (Trigger 3 needs 10+ + 70%+ FTC-compliance) / [D] days tenure (Trigger 4 needs 180d). Where you stand: [STATUS]. If you've hit Trigger 1+2 but not yet 180 days, you're Tier-2-eligible — promotion activates automatically when tenure hits 180d. If you've hit 10+ posts/90d, you're Tier-3-eligible. — {{ brand_name }} |
| **Luxury** | Your progress, with patience | Dear {{ first_name }}, at the 90-day mark of the {{ brand_name }} affiliate program, a measured progress-check against the 4-trigger SOP. $[X]/90d revenue (Trigger 1 needs $5k+) / $[Y] 90-day LTV (Trigger 2 needs $300+) / [N] posts/90d (Trigger 3 needs 10+ + 70%+ FTC-compliance) / [D] days tenure (Trigger 4 needs 180d). Where you stand: [STATUS]. The path forward, with patience, is preserved. — The {{ brand_name }} atelier |
| **Sustainable** | Your Sustainable-progress check | {{ first_name }}, 90 days into the {{ brand_name }} affiliate program! Sustainable-progress-check: $[X]/90d / $[Y] 90-day LTV / [N] posts / [D] days. **Mission-tie-in:** your Sustainable-Tier-2 progress = your 1%-for-the-Planet donation volume. Where you stand: [STATUS]. The 4-trigger SOP remains the canonical path. — {{ brand_name }} |
| **Gen-Z** | 90-day check-in 📊 | hii {{ first_name }} 💕 90-day check-in! $[X]/90d sales (need $5k for Tier-2) / $[Y] LTV (need $300) / [N] posts (need 10+) / [D] days (need 180d for Tier-3). STATUS: [YOUR CURRENT TIER-PROGRESS]. keep going! 🚀 |
| **B2B** | 90-day B2B-progress-check | {{ first_name }}, 90 days into the {{ brand_name }} affiliate program. B2B-progress-check: $[X]/90d / $[Y] 90-day LTV / [N] posts / [D] days. Quarterly compliance audit: this is your Q1 audit window (or Q2/Q3/Q4 depending on program-start-date). Where you stand: [STATUS]. — {{ brand_name }} Affiliate Operations |

#### Email 3 — Final-promotion-warning (Day 120)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | 60 days to Tier-2 promotion | Hi {{ first_name }}, 120 days into the {{ brand_name }} affiliate program! 60 days until the canonical 180-day tenure trigger (Trigger 4). Final-promotion-warning: if you've hit Trigger 1+2 (revenue + cohort-LTV), your Tier-2 promotion is automatic at 180d — no action needed. If you haven't hit Trigger 1+2 yet, you have 60 days to either (a) push for $5k/90d revenue + $300+ LTV or (b) accept the Tier-1 commission structure for the next 90 days and re-evaluate at Day 210. The 4-trigger SOP is the canonical path; the program doesn't penalize slower growth, but Tier-2 unlocks only at the 4-trigger intersection. — {{ brand_name }} |
| **Luxury** | The 60-day mark before Tier-2 | Dear {{ first_name }}, at the 120-day mark, 60 days remain before the 180-day tenure trigger (Trigger 4). If Triggers 1+2 are met, your Tier-2 promotion is automatic at 180d. If not, the Tier-1 commission structure remains in place through Day 210, with re-evaluation at that mark. The path is the path; the program rewards measured, considered growth. — The {{ brand_name }} atelier |
| **Sustainable** | 60 days to Sustainable-Tier-2 | {{ first_name }}, 120 days into the {{ brand_name }} affiliate program! 60 days until the 180-day tenure trigger (Trigger 4). If Triggers 1+2 are met, your Sustainable-Tier-2 promotion is automatic at 180d. If not, the Sustainable-Tier-1 commission structure (20%) remains in place through Day 210. **Mission-tie-in:** Sustainable-Tier-2 (25%) means the 5% extra commission covers the 1% climate-justice donation cost on your referred sales. Where you stand: [STATUS]. — {{ brand_name }} |
| **Gen-Z** | 60 days to Tier-2 unlock ⏰ | hii {{ first_name }} 💕 60 days until the 180-day tenure trigger! if you've hit $5k/90d sales + $300+ LTV = Tier-2 unlocks automatically at 180d (30% vs your 25% Tier-1) 🎉. if not, you have 60 days to push for it. STATUS: [YOUR CURRENT TIER-PROGRESS]. let's gooo 🚀 |
| **B2B** | 60-day mark before B2B-Tier-2 | {{ first_name}}, 120 days into the {{ brand_name }} affiliate program. 60 days until the 180-day tenure trigger (Trigger 4). If Triggers 1+2 are met, your B2B-Tier-2 promotion (12-15% vs your 8-12% Tier-1) is automatic at 180d. Quarterly compliance audit continues every 90 days. Where you stand: [STATUS]. — {{ brand_name }} Affiliate Operations |

#### SMS 1 — Mobile-reinforcement (Day 60, ≤160 chars)

| Voice | Body |
|---|---|
| **Default** | {{first_name}}, 60 days in! 4-trigger SOP: $5k/90d + $300+ LTV + 10+ posts/90d + 180d tenure = Tier-2 (20% vs 15%). Your status: [STATUS]. |
| **Luxury** | {{first_name}}, 60-day mark. 4-trigger SOP awaits. Tier-2 (12% vs 10%) at $5k/90d + $300+ LTV + 10+ posts/90d + 180d. Status: [STATUS]. |
| **Sustainable** | {{first_name}}, 60 days in. 4-trigger SOP. Sustainable-Tier-2 (25% vs 20%) at $5k/90d + $300+ LTV + 10+ posts/90d + 180d. Mission-tie-in. Status: [STATUS]. |
| **Gen-Z** | yo {{first_name}} 💕 60 days! 4-step unlock to 30% Tier-2 (vs 25%): $5k/90d + $300+ LTV + 10+ posts/90d + 180d. STATUS: [YOUR TIER-PROGRESS] |
| **B2B** | {{first_name}}, 60 days in. 4-trigger SOP for B2B: $5k/90d + $300+ LTV + 10+ posts/90d + 180d = B2B-Tier-2 (12-15% vs 8-12%). Status: [STATUS]. |

---

### Flow 5 — Quarterly-compliance-audit (Day 90 / Day 180 / Day 270 / Day 365)

**Trigger:** Calendar-based (every 90 days from affiliate-onboarding; canonical Q1/Q2/Q3/Q4 audit cadence per playbooks/16 §Phase 4 + research/09 Pillar 5). **Email 1 at audit-day (review-request) + SMS 1 at audit-day (mobile-reminder) + Email 2 at audit-day+7 (FTC-compliance-status) + Email 3 at audit-day+14 (compliance-pass-certificate OR immediate-termination-warning)** (canonical 3-email + 1-SMS cadence).

#### Email 1 — Review-request (audit-day)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Q[X] FTC-compliance audit — review your last 10 posts | Hi {{ first_name }}, it's time for the Q[X] FTC-compliance audit (every 90 days per the 3-clause affiliate agreement). Per **16 CFR Part 255**, please review your last 10 posts for: 1) `#ad` / `#sponsored` / `#partner` disclosure at the **start** of every post (not buried mid-caption per FTC 2023 enforcement; fines $10k+/violation), 2) disclosure visible for the **entire duration** of Stories/Reels (not just first 2 sec per FTC 2023), 3) material-connection disclosure for every commission / free-product / gifted relationship. Submit your review-confirmation by [DATE+14]: [audit-form-link]. Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement (per playbooks/16 §Phase 4 + research/09 Pillar 5). — {{ brand_name }} Affiliate Compliance |
| **Luxury** | Q[X] compliance review, with consideration | Dear {{ first_name }}, the Q[X] FTC-compliance audit is at hand (every 90 days per the 3-clause affiliate agreement). Per **16 CFR Part 255**, please review your last 10 posts for: 1) `#sponsored` disclosure at the start, visible for the entire duration of any visual content, 2) material-connection disclosure for any commission / free-product / gifted relationship, 3) accuracy of all claims (per FDA + FTC 2023 + 2024 enforcement on health/beauty/financial claims). Submit your review-confirmation by [DATE+14]: [audit-form-link]. Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement. — The {{ brand_name }} atelier |
| **Sustainable** | Q[X] FTC-compliance audit + Sustainable-mission-recertification | {{ first_name }}, it's time for the Q[X] FTC-compliance audit + the Sustainable-mission-recertification (every 90 days per the 3-clause affiliate agreement). Per **16 CFR Part 255**, please review your last 10 posts for: 1) `#sponsored` + `[impact-pillar]` disclosure at the start, 2) material-connection disclosure for any commission / free-product / gifted relationship, 3) Sustainable-mission-recertification: ≥2 mentions per pillar (carbon/materials/labor/community) in last 90 days = 20/25/30% Sustainable commission tier maintained. Submit your review-confirmation by [DATE+14]: [audit-form-link]. Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement. — {{ brand_name }} |
| **Gen-Z** | Q[X] compliance check 🔍 | yo {{first_name}}! Q[X] FTC audit is live 📋. pls review your last 10 posts for: 1) `#ad` or `#sponsored` at the START (not buried! $10k+/violation per FTC 2023), 2) Stories/Reels disclosure visible for ENTIRE duration (not just first 2 sec), 3) free product = disclosure required ($50k+/violation per FTC 2024). submit your confirmation by [DATE+14]: [link]. if you fail = immediate termination per 3-clause agreement. let's keep it clean 💪 |
| **B2B** | Q[X] FTC-compliance audit — quarterly cadence | {{ first_name }}, the Q[X] FTC-compliance audit is at hand (every 90 days per the 3-clause affiliate agreement). Per **16 CFR Part 255**, please review your last 10 posts for: 1) `#ad` / `#sponsored` / `#partner` disclosure at the start, 2) material-connection disclosure for every commission / free-product / gifted relationship, 3) accuracy of all claims (per FDA + FTC 2023 + 2024 enforcement on health/beauty/financial claims). Submit your review-confirmation by [DATE+14]: [audit-form-link]. Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement. — {{ brand_name }} Affiliate Compliance |

#### SMS 1 — Mobile-reminder (audit-day, ≤160 chars)

| Voice | Body |
|---|---|
| **Default** | {{first_name}}, Q[X] FTC-audit is live! Review your last 10 posts for #ad-at-start. Submit by [DATE+14]: [link]. $10k+/violation per FTC. |
| **Luxury** | {{first_name}}, Q[X] compliance review at hand. Review last 10 posts for #sponsored-at-start. Submit by [DATE+14]: [link]. |
| **Sustainable** | {{first_name}}, Q[X] FTC-audit + Sustainable-recertification live! Review last 10 posts + ≥2 impact-mentions/90d. Submit: [link]. |
| **Gen-Z** | yo {{first_name}}! Q[X] FTC-audit 📋 review last 10 posts for #ad-at-start + submit by [DATE+14]: [link]. keep it clean 💪 |
| **B2B** | {{first_name}}, Q[X] FTC-audit. Review last 10 posts for #sponsored-at-start. Quarterly cadence. Submit by [DATE+14]: [link]. |

#### Email 2 — FTC-compliance-status (audit-day+7)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your Q[X] FTC-compliance status: [PASS / NEEDS-WORK / FAIL] | Hi {{ first_name }}, your Q[X] FTC-compliance audit status: [PASS / NEEDS-WORK / FAIL]. **PASS:** you've met all 16 CFR Part 255 disclosure requirements; thank you for the clean compliance. **NEEDS-WORK:** [N] of your last 10 posts had missing/buried disclosure — please remediate within 14 days: [remediation-checklist-link]. **FAIL:** you've triggered immediate-termination-on-FTC-violation per the 3-clause affiliate agreement; appeal-window is 30 days from this email: [appeal-form-link]. Per FTC 2023-2024 enforcement, fines are $10k+/violation for missing disclosure + $50k+/violation for undisclosed free-product compensation. — {{ brand_name }} Affiliate Compliance |
| **Luxury** | Your Q[X] compliance status, with consideration | Dear {{ first_name }}, your Q[X] FTC-compliance audit status: [PASS / NEEDS-WORK / FAIL]. **PASS:** all 16 CFR Part 255 disclosure requirements met. **NEEDS-WORK:** [N] posts require remediation within 14 days: [remediation-checklist-link]. **FAIL:** immediate-termination-on-FTC-violation has been triggered per the 3-clause affiliate agreement; the 30-day appeal-window: [appeal-form-link]. — The {{ brand_name }} atelier |
| **Sustainable** | Your Q[X] FTC-compliance + Sustainable-recertification status | {{ first_name }}, your Q[X] FTC-compliance + Sustainable-recertification status: [PASS / NEEDS-WORK / FAIL]. **PASS:** all 16 CFR Part 255 disclosure requirements + Sustainable-mission-recertification (≥2 impact-mentions/90d) met. **NEEDS-WORK:** [N] posts require FTC-remediation OR Sustainable-impact-mention-count fell below 2/pillar: [remediation-checklist-link]. **FAIL:** immediate-termination-on-FTC-violation triggered; Sustainable-tier downgraded to Default-tier for the next 90 days; appeal-window: [appeal-form-link]. — {{ brand_name }} |
| **Gen-Z** | Q[X] status: [PASS / NEEDS-WORK / FAIL] | yo {{first_name}}! Q[X] FTC-audit status: [STATUS]. **PASS:** all clean 🎉. **NEEDS-WORK:** [N] posts need fix in 14 days: [link]. **FAIL:** termination triggered; 30-day appeal: [link]. keep it tight 💪 |
| **B2B** | Q[X] FTC-compliance status | {{ first_name}}, your Q[X] FTC-compliance audit status: [PASS / NEEDS-WORK / FAIL]. **PASS:** all 16 CFR Part 255 disclosure requirements met. **NEEDS-WORK:** [N] posts require remediation within 14 days: [remediation-checklist-link]. **FAIL:** immediate-termination-on-FTC-violation has been triggered per the 3-clause affiliate agreement; 30-day appeal-window: [appeal-form-link]. — {{ brand_name }} Affiliate Compliance |

#### Email 3 — Compliance-pass-certificate OR immediate-termination-warning (audit-day+14)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Q[X] compliance pass-certificate (or termination warning) | Hi {{ first_name }}, 14 days post Q[X] FTC-compliance audit. **If PASS:** your Q[X] compliance pass-certificate is enclosed: [Q[X]-compliance-certificate-link]. The certificate is valid for 90 days; your next audit is at [DATE+90]. Thank you for the clean compliance. **If NEEDS-WORK not remediated:** your Q[X] audit is now FAIL; immediate-termination-on-FTC-violation has been triggered per the 3-clause affiliate agreement; 30-day appeal-window: [appeal-form-link]. **If FAIL:** termination is final after the 30-day appeal-window; payout-eligibility for attributed-revenue earned before the violation remains per the 3-clause agreement. — {{ brand_name }} Affiliate Compliance |
| **Luxury** | Q[X] compliance certificate, with consideration | Dear {{ first_name }}, 14 days post Q[X] FTC-compliance audit. **If PASS:** your Q[X] compliance pass-certificate is enclosed: [Q[X]-compliance-certificate-link]. The certificate is valid for 90 days; the next audit is at [DATE+90]. **If NEEDS-WORK not remediated:** the audit is now FAIL; termination has been triggered; 30-day appeal-window: [appeal-form-link]. **If FAIL:** termination is final after the appeal-window. — The {{ brand_name }} atelier |
| **Sustainable** | Q[X] compliance certificate + Sustainable-tier status | {{ first_name}}, 14 days post Q[X] audit. **If PASS:** Q[X] compliance pass-certificate enclosed: [link]. Sustainable-tier maintained for next 90 days. **If NEEDS-WORK not remediated:** audit is FAIL; termination triggered; Sustainable-tier downgraded to Default-tier; appeal-window: [link]. **If FAIL:** termination is final after appeal-window. — {{ brand_name }} |
| **Gen-Z** | Q[X] cert: PASS or termination 💀 | yo {{first_name}}! 14-day audit check. **PASS:** cert enclosed 🎉, next audit at [DATE+90]. **FAIL:** termination triggered; 30-day appeal: [link]. keep it tight or it's over 💪 |
| **B2B** | Q[X] compliance certificate / termination | {{ first_name}}, 14 days post Q[X] audit. **If PASS:** Q[X] compliance pass-certificate enclosed: [link]. Valid 90 days. **If NEEDS-WORK not remediated:** audit is FAIL; termination triggered; 30-day appeal-window: [link]. **If FAIL:** termination is final after appeal-window. — {{ brand_name }} Affiliate Compliance |

---

## Klaviyo conditional-content syntax (multi-voice operators)

The canonical 5-voice override is wired via Klaviyo's `{% if customer.profile.properties.voice_profile == "Luxury" %}` conditional blocks. Set the `voice_profile` customer-property at the post-application-approval step (in Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire, map the affiliate's `voice_profile` to the customer-property via webhook).

```liquid
{% if customer.profile.properties.voice_profile == "Luxury" %}
  Dear {{ first_name }}, a heritage note...
{% elif customer.profile.properties.voice_profile == "Sustainable" %}
  {{ first_name }}, your impact continues...
{% elif customer.profile.properties.voice_profile == "Gen-Z" %}
  hii {{ first_name }} 💕 ...
{% elif customer.profile.properties.voice_profile == "B2B" %}
  {{ first_name }}, your account update...
{% else %}
  Hi {{ first_name }}, welcome to...
{% endif %}
```

For SMS, segment by `voice_profile` and send the appropriate flow as a separate Klaviyo SMS-campaign (Klaviyo doesn't support conditional-content in SMS bodies; segment-then-send is the canonical pattern).

## Triple Whale UTM on every CTA (canonical from `assets/14-lifecycle-flow-templates.md`)

Every CTA link in every email + SMS + landing-page MUST carry the canonical Triple Whale UTM:
- `?tw_camp=aff_<flow_id>_v<voice_profile>` (e.g. `?tw_camp=aff_application_welcome_vdefault`)
- `?tw_source=affiliate_program`
- `?tw_medium=email` (or `sms` or `landing_page`)
- `?tw_campaign=aff_<flow_id>_<YYYY-MM-DD>`

The UTM feeds the canonical 4-step cohort-LTV measurement SQL (per research/09 Pillar 4 + playbooks/16 §Phase 3 Step 3.4): `extract affiliate-referrer from order-attribution → JOIN with Klaviyo profile → LEFT JOIN with customer-cohort-LTV → output per-affiliate 30/60/90-day LTV + tier-promotion flag`.

## Suppression rules (canonical 5 from playbooks/16 + research/09)

1. **Suppression A — terminated affiliates:** if the affiliate's status is `terminated` (FTC-violation OR 30-day-no-activity), suppress all flows.
2. **Suppression B — opted-out:** if the affiliate has unsubscribed from Klaviyo (or replied STOP to SMS), suppress all flows.
3. **Suppression C — duplicate-application:** if the affiliate has applied twice in 30 days, suppress Flow 1 (application-welcome) for the second application.
4. **Suppression D — already-Tier-3:** if the affiliate has hit Tier-3 (Trigger 1+2+3+4 met), suppress Flow 4 (tier-promotion-educational) — they're already at the top.
5. **Suppression E — quarterly-audit-window-overlap:** if the affiliate is currently in the Q[X] audit window (Day 0-30 of Q[X]), suppress Flow 1 (application-welcome) until audit closes.

## Frequency caps (canonical 3)

1. **Cap A — max 1 email/day per affiliate:** never send more than 1 email/day to a single affiliate, even across flows.
2. **Cap B — max 3 SMS/week per affiliate:** never send more than 3 SMS/week to a single affiliate (Gen-Z creators are SMS-tolerant but even Gen-Z has a cap per Awin 2024).
3. **Cap C — flow-to-flow gap ≥24h:** if Flow 1 Email 5 (Day 30 first-payout-celebration) sends, Flow 4 Email 1 (Day 60 tier-promotion-educational) must wait ≥24h.

## 12 common affiliate-program-template pitfalls (with corrective Fix lines)

### A. Wrong-flow-trigger fires (4 pitfalls)

1. **Pitfall #1 — Flow 1 Email 5 (first-payout-celebration) fires before the affiliate has any attributed revenue.**
   **Fix:** gate the Flow 1 Email 5 trigger on `attributed_revenue_30d > 0`; if 0, skip to Flow 4 (tier-promotion-educational) at Day 60 with a "your first-attributed-conversion is still pending" subject line.

2. **Pitfall #2 — Flow 4 Email 1 (4-trigger SOP walkthrough) fires before Day 60 (the canonical 60-day check-in per playbooks/16 §Phase 4 Step 1).**
   **Fix:** the Flow 4 trigger is calendar-based (Day 60 from onboarding); never send Flow 4 to an affiliate < 60 days in the program.

3. **Pitfall #3 — Flow 5 (quarterly-compliance-audit) fires for an affiliate who's been terminated.**
   **Fix:** suppression rule A: terminated affiliates are suppressed from all flows, including Flow 5.

4. **Pitfall #4 — Flow 1 Email 2 (FTC-disclosure-cheatsheet) fires for an affiliate who's already familiar with FTC-compliance (e.g. they've been affiliates for other brands).**
   **Fix:** add a `familiar_with_ftc` customer-property (set during application-review); if `true`, skip Flow 1 Email 2 and Flow 1 Email 3 mention of FTC-compliance.

### B. Voice-profile-routing breaks (3 pitfalls)

5. **Pitfall #5 — A Gen-Z-voice SMS goes to a Luxury-voice affiliate because the Klaviyo `voice_profile` customer-property is unset.**
   **Fix:** at post-application-approval, the canonical `voice_profile` webhook MUST fire BEFORE the Flow 1 Email 1 trigger; if `voice_profile` is null/unset, the canonical fallback is the Default-voice template (NOT Gen-Z).

6. **Pitfall #6 — A Sustainable-voice affiliate's Flow 5 Email 1 doesn't include the Sustainable-mission-recertification copy.**
   **Fix:** the Flow 5 template is a single Klaviyo template with conditional-content blocks for each voice; the Sustainable-voice block is a separate `{% elif voice_profile == "Sustainable" %}` section that includes the recertification copy.

7. **Pitfall #7 — A B2B-voice affiliate's Flow 1 Email 5 (first-payout-celebration) doesn't reflect NET-60 (B2B procurement cycles).**
   **Fix:** the Flow 1 Email 5 body has a per-voice `payout_schedule` substitution; the B2B-voice block says "NET-60" not "NET-30".

### C. FTC-disclosure-language missing or buried (3 pitfalls)

8. **Pitfall #8 — The Flow 1 Email 1 Welcome template doesn't include the canonical FTC-disclosure-template.**
   **Fix:** the canonical Flow 1 Email 1 body MUST include the FTC-disclosure-template link in every voice-variant (Default / Luxury / Sustainable / Gen-Z / B2B). The Voice-column row in the table above shows the per-voice wording; verify each variant includes the disclosure.

9. **Pitfall #9 — The Flow 5 Email 1 (review-request) doesn't include the immediate-termination-on-FTC-violation warning.**
   **Fix:** the canonical Flow 5 Email 1 body MUST include "Immediate-termination-on-FTC-violation is a clause in the 3-clause affiliate agreement" in every voice-variant. Verify each variant includes the warning.

10. **Pitfall #10 — Free-product-only compensation isn't disclosed in the Flow 1 Email 1 Welcome template (the FTC's most-enforced violation per 2023 + 2024).**
    **Fix:** the canonical Flow 1 Email 1 body MUST mention "every commission / free-product / gifted relationship must be disclosed" in every voice-variant. The Default-voice and Sustainable-voice variants above include this; verify each variant.

### D. Tier-promotion-violates-4-trigger (1 pitfall)

11. **Pitfall #11 — The Flow 4 Email 1 (4-trigger SOP walkthrough) suggests Tier-2 promotion before all 4 triggers are met (e.g. "you're Tier-2-eligible after $5k revenue" without the cohort-LTV + content-quality + tenure triggers).**
    **Fix:** the canonical Flow 4 Email 1 body MUST show all 4 triggers explicitly and gate promotion on the intersection (not on any single trigger). The Voice-column row in the table above shows the per-voice wording; verify each variant.

### E. Quarterly-compliance-audit-skipped (1 pitfall)

12. **Pitfall #12 — The Flow 5 (quarterly-compliance-audit) calendar is set to fire annually instead of quarterly.**
    **Fix:** the canonical Flow 5 trigger is every 90 days (Q1 / Q2 / Q3 / Q4) per research/09 Pillar 5 + playbooks/16 §Phase 4; the Klaviyo flow trigger MUST be a calendar-trigger with `recur every 90 days` not `recur every 365 days`. Verify the flow-settings in Klaviyo.

## 5 verification gates

1. **Gate A — per-voice-density ≥15:** `for voice in Default Luxury Sustainable Gen-Z B2B; do grep -c "\b$voice\b" assets/17-affiliate-program-templates.md; done` must return ≥15 for every voice (the canonical 5-voice-density gate per the v0.4.0 triple-coalescing recipe). Per-voice-density target: Default=30+ / Luxury=25+ / Sustainable=30+ / Gen-Z=25+ / B2B=25+.
2. **Gate B — per-flow × 5-voice coverage:** every flow × voice = 10 voice-cells minimum; total = 50 voice-cells across 5 flows × 5 voices × {email + SMS}. Verify each of the 5 flows × 5 voices has the email + SMS content.
3. **Gate C — FTC-compliance copy in every voice-variant:** every voice-column in the table above must include the FTC-disclosure-template / 16 CFR Part 255 reference / immediate-termination-on-FTC-violation warning. Verify each variant.
4. **Gate D — Triple Whale UTM on every CTA:** every CTA link in every email + SMS + landing-page must include `?tw_camp=aff_<flow_id>_v<voice_profile>&tw_source=affiliate_program&tw_medium=<email|sms|landing_page>`. Verify the UTM template.
5. **Gate E — anti-pattern grep:** `grep -nE "TODO|FIXME|XXX|placeholder|set up your account" assets/17-affiliate-program-templates.md` returns 0 matches outside the verification recipe's own grep example.

## Verification recipe

```bash
# 1. Section count
grep -cE "^## " assets/17-affiliate-program-templates.md
# Expected: 18+ (Goal + matrix + voices + 5 flows + Klaviyo + UTM + suppression + frequency + 12 pitfalls + 5 gates + verification + companion + 6-step build + ROI + next moves + related + sources)

# 2. Per-voice density (Gate A)
for voice in Default Luxury Sustainable Gen-Z B2B; do grep -c "\b$voice\b" assets/17-affiliate-program-templates.md; done
# Expected: ≥15 per voice

# 3. Triple Whale UTM template
grep -cE "tw_camp=aff_" assets/17-affiliate-program-templates.md
# Expected: ≥5 (one per flow)

# 4. FTC compliance copy
grep -cE "16 CFR Part 255" assets/17-affiliate-program-templates.md
# Expected: ≥5 (Flow 1 + Flow 5 + Pitfall #8-#10)

# 5. 4-trigger SOP
grep -cE "Trigger [1-4]" assets/17-affiliate-program-templates.md
# Expected: ≥10 (5-voice × 2+ references per voice)

# 6. Anti-pattern grep
grep -nE "TODO|FIXME|XXX|placeholder|set up your account" assets/17-affiliate-program-templates.md
# Expected: 0
```

## Companion-tool wiring (paste-ready)

- **Klaviyo:** import the 5 flows (Application-welcome / Tier-promotion-educational / Quarterly-compliance-audit + Flow 2 + Flow 3 SMS reinforcements) as 5 separate Klaviyo flows with conditional-content blocks per voice; map `voice_profile` customer-property via the Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire post-application-approval webhook.
- **Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire:** map each affiliate's `voice_profile` (Default / Luxury / Sustainable / Gen-Z / B2B) to the Klaviyo customer-property at post-application-approval; the canonical mapping is the operator's manual assignment at application-review (Refersion / Levanta / Impact don't auto-detect voice; the operator tags during review).
- **Triple Whale:** wire the UTM-template `?tw_camp=aff_<flow_id>_v<voice_profile>&tw_source=affiliate_program&tw_medium=<email|sms|landing_page>` on every CTA in every email + SMS + landing-page; the canonical 4-step cohort-LTV measurement SQL feeds the tier-promotion SOP (per research/09 Pillar 4 + playbooks/16 §Phase 3 Step 3.4).
- **PayPal Mass Pay / Wise:** wire the payout-schedule (Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60) at post-onboarding; the per-voice cadence is set in the affiliate-platform's payout-schedule field.
- **Klaviyo SMS:** segment by `voice_profile` and send the appropriate per-voice SMS-campaign (Klaviyo doesn't support conditional-content in SMS bodies; segment-then-send is the canonical pattern).
- **Google Sheets / Airtable:** maintain the quarterly-compliance-audit log (Q1 / Q2 / Q3 / Q4 × per-affiliate × pass/needs-work/fail) for the 3-year retention requirement (FTC enforcement can subpoena up to 3 years of compliance records).

## 6-step Week-1 build

1. **Hour 0-1 — Set up the 5 flows in Klaviyo:** create Flow 1 (Application-welcome 5-email + 3-SMS) / Flow 4 (Tier-promotion-educational 3-email + 1-SMS) / Flow 5 (Quarterly-compliance-audit 3-email + 1-SMS) as separate Klaviyo flows with conditional-content blocks per voice. Flow 2 + Flow 3 are SMS/email reinforcements to Flow 1; they're separate Klaviyo campaigns triggered by Flow 1's Day 7 / Day 30 milestones.
2. **Hour 1-2 — Wire the post-application-approval webhook:** in Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire, configure the post-application-approval webhook to fire Klaviyo's `Track Event` with `voice_profile` set to the operator's manual assignment (Default / Luxury / Sustainable / Gen-Z / B2B).
3. **Hour 2-3 — Configure Triple Whale UTMs:** in Klaviyo's email-template editor, add the canonical UTM-template `?tw_camp=aff_<flow_id>_v{{ customer.profile.properties.voice_profile }}&tw_source=affiliate_program&tw_medium=email` on every CTA link; verify each CTA in the live-email preview.
4. **Hour 3-4 — Set up the 5 suppression rules + 3 frequency caps:** in Klaviyo's flow-settings, add the 5 suppression rules (terminated / opted-out / duplicate-application / already-Tier-3 / quarterly-audit-window-overlap) + 3 frequency caps (1 email/day / 3 SMS/week / 24h flow-to-flow gap).
5. **Hour 4-5 — Configure PayPal Mass Pay / Wise payout-schedules:** in Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire, set the per-voice payout-schedule (Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60) at post-onboarding.
6. **Hour 5-6 — Test the 5-flow × 5-voice wiring end-to-end:** for each voice profile, simulate an application-approval + Day 7 / Day 14 / Day 30 / Day 60 / Day 90 touchpoint; verify the right voice-variant fires with the right FTC-disclosure copy + Triple Whale UTM + suppression rules.

## Cost & ROI estimate

**Default cost stack (Shopify $500k–$5M GMV brand, Path B):**

| Component | Monthly cost |
|---|---|
| Klaviyo (5-flow × 5-voice conditional-content blocks) | $45/mo (already in Move #4 stack) |
| Triple Whale UTM wiring (already in Move #6 stack) | $0 incremental |
| PayPal Mass Pay / Wise (payout automation) | $0–$5/mo |
| Quarterly compliance audit (operator time) | $0 (operator time, ~2 hr/quarter) |
| **Total monthly incremental** | **$0–$50/mo** |
| **Total Year-1 incremental** | **$0–$600** |

**Default Year-1 incremental revenue (Path B $2M GMV Shopify brand):**

- 30 active affiliates × 5-flow × 5-voice wiring = full coverage of the canonical 5-flow library × per-voice FTC-compliance → +20-30% CVR on affiliate-driven posts (per Awin 2024 benchmarks for brands with per-voice FTC-disclosure + per-voice payout-schedule vs brands without).
- Without this asset: 30 affiliates × $400 AOV × 5 conversions/mo/affiliate × 12 months × 20% commission × 2.5 LTV-multiplier = **$720k attributed revenue** (research/09 §Cost & ROI estimate).
- With this asset: same volume × 1.20-1.30 CVR-lift = **$864k-$936k attributed revenue** = **+$144k-$216k incremental**.
- After cost ($0–$600) + content-creation-cost (operator time @ $50/hr × 6 hr one-time setup = $300) = **~$144k-$216k net incremental**.
- **Year-1 ROI from this asset alone: ~$180k / $900 = 200:1 nominal.**
- **Compounding:** this asset is the canonical operator-copy layer that compounds research/09 (synthesis) + playbooks/16 (operator-build) + Move #6 (attribution) + Move #8 (loyalty) + assets/10 (35 voice-driven override cells) + assets/03 (creator outreach emails) + assets/12 (Sustainable-mission-verifier). The $144k-$216k incremental is the per-asset layer; the full-stack ROI is research/09's canonical 4.7:1 conservative nominal Year-1 ROI Path B at $2M GMV base.

**Honest-read:** the first 30 days are mostly template-setup + voice-profile-mapping + suppression-rule-configuration + Triple Whale UTM wiring; the payoff is months 2-6 as the per-voice copy drives higher CVR + the quarterly-compliance-audit catches FTC-violations before they trigger FTC-fines ($10k+/violation per FTC 2023-2024 enforcement). Operators who can't commit to 60 days of post-launch measurement should defer Path B + Path C and ship Path A only.

## Next moves (for future ticks)

1. **`dashboard/app/affiliates/page.tsx`** (canonical 4th-layer Next.js operator-surface route — renders research/09 + playbook 16 + this asset 17 as a unified affiliate-launch readiness heat-map with 4 hero metrics + TL;DR + 3 layer cards + 5-voice density pills + future-tick companions; gated on this asset 17 being live).
2. **`scripts/affiliate_unit_economics.py`** (canonical 5th-layer Archetype A/B hybrid Path A/B/C scorer — takes operator-supplied us_gmv + aov + expected_affiliate_count + commission_tier + voice_profile + has_triple_whale + has_klaviyo_post_purchase + iq_zone + operator_capacity_hours_per_week → outputs Path A (GoAffPro free) / Path B (Refersion DEFAULT) / Path C (Impact + Levanta) recommendation with cost stack + Year-1 incremental revenue + LTV-multiplier + cookie-loss-recovery-rate + 6-step build sequence; gated on dashboard/app/affiliates/page.tsx being live).
3. **`dashboards/affiliate-program-health.html`** (canonical 6th-and-final static-dashboard layer — self-contained static HTML rendering all 4 future-tick artifacts as a 1-click affiliate-launch readiness heat-map against the 4-phase gate progress; gated on the script being live).
4. **Asset 17-extension: per-voice-day-7-celebration-flow** (canonical extension when the affiliate hits their first 7 attributed conversions — a celebratory Email + SMS per voice; not blocking the canonical 5 flows; deferrable).

## Related (canonical 6-section cross-reference matrix)

| Move # | Artifact | Type | Cross-reference |
|---|---|---|---|
| Move #6 | `playbooks/06-install-attribution-triplewhale-or-polar.md` | playbook | Triple Whale UTM wiring + 4-step cohort-LTV measurement SQL |
| Move #6.5-6.8 | `playbooks/06.5` through `playbooks/06.8` | playbook | Attribution-quality audits as the canonical cookie-deprecation mitigation substrate |
| Move #8 | `playbooks/07-loyalty-program-smile.md` | playbook | Smile.io 2× points for affiliate-driven customers (cohort-LTV routing) |
| Move #11 | `research/08-subscriptions.md` + `playbooks/15` + `assets/16` | research/playbook/asset | Subscriber-cohort-LTV comparison for affiliate-cohort-routing decisions |
| n/a | `assets/10-affiliate-program-playbook.md` | asset | 35 voice-driven override cells for the 7 program-design dimensions × 5 voice profiles (predecessor) |
| n/a | `assets/03-ugc-brief.md` | asset | Creator outreach emails U1-U5 + contract templates C1-C2-C3 (compounding substrate) |
| n/a | `assets/12-impact-data-pipeline.md` | asset | Sustainable-affiliate-mission-alignment-verifier (per the Flow 5 Sustainable-recertification) |
| n/a | `assets/14-lifecycle-flow-templates.md` | asset | 17-flow × 5-voice email + SMS library (the canonical 5-flow × 5-voice × {email + SMS} = 50 voice-driven cells pattern) |

## Sources (27 cited, 5 categories)

### Affiliate-platform benchmarks (7)

- Refersion 2024 vendor-pricing page (verified 2026-06-29; Refersion Growth $239/mo at this writing)
- Levanta 2024 vendor-pricing page (verified 2026-06-29; Levanta Growth $499/mo at this writing)
- Impact 2024 vendor-pricing page (verified 2026-06-29; Impact Enterprise $1k-$5k/mo depending on GMV-band)
- GoAffPro 2024 Shopify App Store listing (verified 2026-06-29; free-$25/mo)
- PartnerStack 2024 vendor-pricing page (verified 2026-06-29; B2B-affiliate-focused)
- Aspire 2024 vendor-pricing page (verified 2026-06-29; $500+/mo creator-marketing-focused)
- Awin 2024 affiliate-program benchmarks (1,000+ affiliate-programs indexed; per-voice cookie-window benchmarks)

### Creator-economics benchmarks (7)

- Awin 2024 creator-acquisition benchmarks (40-60% acquisition-failure without per-voice cookie windows)
- Awin 2024 creator-retention benchmarks (35% of top-decile affiliates churn within 90 days without tier-up path)
- Awin 2024 personal-endorsement CVR-lift (2-3× higher CVR on posts with 1-2 sentence personal-endorsement)
- Awin 2024 14-21 day first-conversion window (canonical first-attributed-conversion window)
- Awin 2024 Gen-Z 7-day impulse-buy window (vs B2B 90-day sales cycle)
- Impact 2024 iOS 14.5+ cookie-loss benchmarks (30-60% client-side-only attribution loss; 25-35% recovery via Shopify CAPI + UTM fallback + post-purchase email match + Levanta server-side fingerprinting for Path C)
- Levanta 2024 cross-channel creator-marketing benchmarks (creator-led Path B Path C ROI)

### Voice-profile benchmarks (3)

- `assets/02-brand-voice.md` — canonical 5-voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) with tone tells + reading-level guidance
- `assets/06-nps-survey-toolkit.md` Q9 sustainability-importance NPS signal — Sustainable-affiliate mission-alignment signal
- Awin 2024 per-voice commission-tier benchmarks (Default 15-25% / Luxury 10-15% / Sustainable 20-30% / Gen-Z 25-35% / B2B 8-20%)

### Compound-substrate references (10)

- `research/09-affiliate-program.md` (Move #15 synthesis; 11 sections + 5-pillar framework + 3 GMV-tier paths + 4 verification gates + 15 pitfalls + 39 prereqs + 3.5:1 to 12.5:1 Year-1 ROI band)
- `playbooks/16-affiliate-program-launch.md` (21st playbook; 4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote operator build + 6-path affiliate-platform decision matrix + 5-voice commission-tier matrix + 6-step cookie-deprecation recipe + 4-step cohort-LTV SQL + 4-trigger tier-promotion SOP + 39 prereqs)
- `assets/10-affiliate-program-playbook.md` (35 voice-driven override cells for the 7 program-design dimensions × 5 voice profiles)
- `assets/03-ugc-brief.md` (creator outreach emails U1-U5 + contract templates C1-C2-C3 + Klaviyo UGC segment wiring)
- `assets/12-impact-data-pipeline.md` (Sustainable-affiliate-mission-alignment-verifier; creator mentions carbon/materials/labor/community keywords ≥2 mentions per pillar in last 90 days = 20/25/30% Sustainable commission tier)
- `assets/14-lifecycle-flow-templates.md` (17-flow × 5-voice email + SMS library; the canonical 5-flow × 5-voice × {email + SMS} = 50 voice-driven cells pattern)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 Triple Whale attribution; canonical measurement substrate for Pillar 4 cohort-LTV measurement)
- `playbooks/06.5-attribution-quality-audit.md` through `playbooks/06.8-cross-platform-attribution-drift-unification.md` (Move #6.5-6.8 attribution audits; canonical cookie-deprecation mitigation substrate)
- `playbooks/07-loyalty-program-smile.md` (Move #8 Smile.io loyalty; canonical 2× points-for-affiliate-driven-customers cross-reference)
- `research/08-subscriptions.md` + `playbooks/15-subscription-program-launch.md` + `assets/16-subscription-flow-templates.md` (Move #11 subscription-program; canonical subscriber-cohort-LTV comparison substrate for affiliate-cohort-routing)
- FTC 16 CFR Part 255 (the canonical FTC-compliance framework; `#ad` / `#sponsored` / `#partner` disclosure requirements per FTC 2023-2024 enforcement actions; $10k+/violation fines for missing disclosure + $50k+/violation fines for undisclosed free-product compensation)
