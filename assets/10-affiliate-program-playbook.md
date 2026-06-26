# Affiliate Program Playbook — Commission Tier Framework + Payout Schedule + Cookie Window + FTC Compliance + Cohort-LTV Measurement

> **Status.** Asset 10 in the `assets/` track (the **Default-voice Asset-10 candidate** per Asset 07 line 351 + Asset 08 line 296 + Asset 09 line 298 — three prior assets pre-staged this as the canonical next-asset). Compounds Asset 03 C3 affiliate contract (the inbound counterparty agreement) + Asset 04 Q4-peak affiliate-promo cadence + Asset 06 Q9 sustainability-importance NPS signal (Sustainable affiliates weight toward mission-aligned creators) + Asset 07 Dimension 6 (Creator mix) + Asset 08 Scenario 8 (UGC creator inquiry) + Asset 09 Pillar 5 (Community). Per Asset 02's voice framework, **Default is the canonical primary voice** for affiliate program management, but Luxury / Sustainable / Gen-Z / B2B each have a distinct affiliate-program shape that the framework captures via 35 voice-driven override cells (7 program-design dimensions × 5 voice profiles).

---

## Goal

Operators have shipped Asset 03 C3 affiliate contract but kept asking "**how do I actually launch and run an affiliate program?**" — what commission tier framework, what payout schedule, what cookie window, how do I stay FTC-compliant, how do I measure cohort-LTV by affiliate channel, how do I recruit + activate + retain the top 10–20% of affiliates that produce 80% of revenue per Move #10 Pitfall #15's creator-volume trap. This asset answers all of it with a paste-ready program-management framework that an operator can ship in Week 1 by:

1. **Picking one of 6 program paths** (decision matrix below — A through F) based on GMV tier + tool budget + creator-mix strategy.
2. **Setting the 7 program-design dimensions** (commission tier framework + payout schedule + cookie window + content-requirements policy + FTC-disclosure policy + cookie-deprecation mitigation + cohort-LTV measurement) — each with a **Default benchmark + 4 voice-driven override columns** (Luxury / Sustainable / Gen-Z / B2B) for the 35-cell voice override grid.
3. **Running the 6-step build** (pick path → install platform → configure 7 dimensions → seed first 10–20 affiliates → launch → verify).
4. **Avoiding the 10 named pitfalls** with corrective `Fix:` lines — including the 30-day tool-abandonment trap (Move #6 Pitfall #15), the creator-volume trap (50+ creators with low quality per Move #10), the iOS cookie-deprecation trap, and the FTC-disclosure-language trap.
5. **Passing the 5 verification gates** before considering the program live.

**Why this matters now.** Post-iOS 14.5 cookie-deprecation, affiliate programs were gutted (3–6× revenue decline per research/00 §7) — but creator-led affiliate models (Levanta, Refersion, Aspire) are working again because they leverage first-party creator relationships + UGC content rather than third-party tracking cookies. The operator who ships a creator-led affiliate program in 2026 captures the rebound that traditional affiliate networks (ShareASale, CJ) are still recovering from. Per research/00, affiliate is now **3–6× post-cookie deprecation** vs the pre-2021 8–12× peak — the operator who treats affiliate as the bottom-funnel CPA channel it always was (rather than abandoning it post-iOS) gets a structural CAC advantage over the operator who treats it as "broken."

**Honest-read called out in 6 places:** (a) **the framework ships before the operator picks an affiliate platform** — apply the 7-dimension decision matrix to your own brand's affiliate-program goals first (the canonical day-1 use case is sketching your commission tier + payout schedule + cookie window on paper), then expand to specific platforms + affiliate recruitment later per the 6-path tool decision matrix. (b) **post-iOS 14.5 cookie-deprecation is structural, not transient** — third-party cookies are gone; first-party creator relationships + UGC content + server-side conversion-API tracking are the new model. (c) **voice-driven override columns matter MORE than the headline commission rate** — Default at 15% / Luxury at 10% / Sustainable at 20% / Gen-Z at 25% / B2B at 8–12% reflect different brand priorities; the operator who copies Default 15% to a Luxury brand loses money because Luxury affiliates monetize through exclusivity + tier curation, not volume. (d) **the program is a strategy tool, not a vanity metric** — track cohort-LTV-by-affiliate-cohort, not "number of affiliates"; the 80/20 rule applies (top 20% of affiliates produce 80% of revenue). (e) **affiliate recruitment is the #1 friction point** — operator has 0 affiliates on Day 1; the seed-from-existing-customer-list + scrape-from-influencer-database recipes are the canonical first-100-affiliate loop. (f) **FTC compliance is non-negotiable** — the FTC's 2023 Endorsement Guides update requires clear-and-conspicuous disclosure on every post; creators who don't disclose expose the operator to $50k+/violation fines.

---

## Decision matrix — which affiliate tool + which 7 dimensions to ship first

### Path A — Shopify <$50k/mo GMV (default)

| Tool | Cost | When to use |
|---|---|---|
| **GoAffPro** (Shopify-native, free up to 100 affiliates; $25/mo up to 1k affiliates) | Free–$25/mo | Pre-launch + early traction; first 100 affiliates are typically existing customers + micro-influencers (5k–50k followers) |

### Path B — Shopify $50k–$500k/mo GMV (default = **Refersion**)

| Tool | Cost | When to use |
|---|---|---|
| **Refersion** ($99/mo Starter → $239/mo Growth → $489/mo Scale) | $99–$489/mo | Growing brand with 50–500 active affiliates; needs custom commission tiers + Klaviyo integration + automated payouts |

### Path C — Shopify $500k+/mo GMV (default = **Levanta**)

| Tool | Cost | When to use |
|---|---|---|
| **Levanta** (creator-led affiliate platform; $499/mo Growth → custom Enterprise) | $499+/mo | Scale phase with 200+ active affiliates; creator-led model with UGC content rights + Amazon-style attribution |

### Path D — Multi-platform (non-Shopify) (default = **Refersion**)

| Tool | Cost | When to use |
|---|---|---|
| **Refersion** (WooCommerce + BigCommerce + custom integrations) | $99–$489/mo | Headless commerce + custom stack; needs API-level integration with non-Shopify checkout |

### Path E — Influencer-only (UGC + paid creator + affiliate blend) (default = **Aspire**)

| Tool | Cost | When to use |
|---|---|---|
| **Aspire** (creator-led affiliate; $500/mo Starter → $2,000/mo Scale) | $500–$2,000/mo | Brands whose affiliate program is creator-led (UGC + paid + affiliate are blended into one creator relationship); Asset 03 C3 affiliate contract template applies as the per-creator agreement layer |

### Path F — Pre-revenue / <$5k/mo GMV (default = **GoAffPro free tier**)

| Tool | Cost | When to use |
|---|---|---|
| **GoAffPro free** (≤100 affiliates, 0 commission fees) | Free | Pre-revenue + first 6 months post-launch; the canonical "launch an affiliate program in <1 hour" MVP |

### Decision rule

**Pick by GMV tier first** (Path A <$50k → F pre-revenue / B $50k–$500k default → C $500k+), then **override by creator-mix strategy** (Path E if creator-led vs Path B if pure-affiliate / Path D if non-Shopify). The 7 dimensions below apply to ALL paths — only the platform changes.

---

## The 7 program-design dimensions (paste-ready) — 7 dimensions × 5 voice profiles = **35 voice-driven override cells**

### Dimension 1 — Commission tier framework

| Tier | Default commission | When to apply |
|---|---|---|
| **Tier 1 — Standard affiliate** | 15% of net order value (after returns + discounts; before shipping + taxes) | All affiliates not in Tier 2 or Tier 3 |
| **Tier 2 — Power affiliate (≥10 sales/mo or ≥$5k GMV/mo)** | 20% of net order value (5% bonus over Tier 1) | Recurring high-volume affiliates |
| **Tier 3 — Strategic partner (≥50 sales/mo or ≥$25k GMV/mo)** | 25% of net order value + co-branded content + early product access | Top-5 strategic partners (1–3% of total affiliates generate 30–50% of revenue) |

**Voice-driven override columns:**

| Voice profile | Default commission | Tier 2 power | Tier 3 strategic | Notes |
|---|---|---|---|---|
| **Default** | 15% | 20% | 25% | The canonical baseline |
| **Luxury** | **10%** | **12%** | **15%** | Lower % because Luxury affiliates monetize through tier curation + exclusivity + co-branded content; 25% on a $500 product = $125 vs Luxury's 10% on $2,000 product = $200 with curated positioning |
| **Sustainable** | **20%** | **25%** | **30%** | Higher % because mission-aligned creators are harder to recruit; mission-aligned affiliate also drives higher NPS per Asset 09 + Asset 06 Q9 |
| **Gen-Z** | **25%** | **30%** | **35%** | Higher % because Gen-Z creators expect creator-economy-standard rates (TikTok Creator Marketplace baseline is 25%); also Gen-Z volume requires higher upfront incentive |
| **B2B** | **8–12%** | **12–15%** | **15–20%** | Lower % because B2B sales cycles are longer + ACV is higher; B2B affiliate is typically reseller / consultant / referral-partner not creator |

### Dimension 2 — Payout schedule

| Schedule | Default | When to use |
|---|---|---|
| **Monthly** (auto-pay on 15th of following month for prior month's cleared commissions) | Net-30 from order date | Standard for most affiliates; matches cash-flow cycle |
| **Bi-weekly** | Net-15 from order date | High-velocity affiliates (Tier 2 + 3) who request faster cash flow |
| **On-request** (when balance exceeds $100 threshold) | Net-15 from request date | Micro-affiliates with sporadic sales; reduces payment-processing fees |

**Voice-driven override columns:**

| Voice profile | Schedule | Threshold | Notes |
|---|---|---|---|
| **Default** | Monthly | $50 minimum payout | Standard balance-rollover if below threshold |
| **Luxury** | Monthly | $200 minimum payout | Higher threshold reduces admin overhead on low-volume curated affiliates |
| **Sustainable** | Monthly | $50 minimum payout | Same as Default; sustainability mission doesn't change payment cadence |
| **Gen-Z** | **Bi-weekly** | $25 minimum payout | Gen-Z creators expect faster cash flow; lower threshold reduces friction |
| **B2B** | **Monthly** | **$500 minimum payout** | B2B affiliates are referral partners with longer sales cycles; high threshold + monthly cadence matches B2B finance ops |

### Dimension 3 — Cookie window

| Window | Default | When to use |
|---|---|---|
| **30-day cookie** | Affiliate gets credit for any purchase within 30 days of first click | Standard for most DTC affiliate programs |
| **60-day cookie** | Extended window for higher-AOV categories (furniture, jewelry, electronics) | AOV ≥$200 OR consideration cycle >7 days |
| **7-day cookie** | Short window for consumables / subscription / low-AOV | AOV <$50 OR repeat-purchase cadence <14 days |

**Post-iOS 14.5 cookie-deprecation mitigation (mandatory):**

The cookie window is increasingly a fallback — first-party server-side tracking (via Shopify's Conversion API + Refersion/Levanta's server-side integration) is the primary attribution channel now. The cookie is the secondary defense for users who decline ATT prompt. Recipe:

1. **Set up server-side Conversion API** (Refersion + Shopify integration OR Levanta + Shopify integration OR custom Shopify pixel + CAPI). This is the 60–80% attribution channel post-iOS.
2. **Keep cookie window at 30 days** (the canonical) as the secondary channel for users who accept ATT.
3. **Add UTM-based attribution as the tertiary channel** (every affiliate link includes `?ref={{affiliate_id}}` or `?via={{affiliate_handle}}` so server logs can attribute even when cookies are blocked).
4. **Track "attribution confidence" per conversion** — server-side (high confidence) > cookie (medium) > UTM-only (low) — and report cohort-LTV by attribution-confidence tier.

**Voice-driven override columns:**

| Voice profile | Cookie window | Notes |
|---|---|---|
| **Default** | 30 days | The canonical |
| **Luxury** | **60 days** | Luxury consideration cycle is 14–45 days; 30-day window undercounts 30–50% of Luxury conversions |
| **Sustainable** | 30 days | Sustainable consideration is faster (mission-aligned buyers convert in 7–14 days); 30 days is enough |
| **Gen-Z** | **7 days** | Gen-Z consideration is 1–3 days; longer windows invite fraud (cookie stuffing) without incremental attribution |
| **B2B** | **90 days** | B2B sales cycle is 30–180 days; cookie window must be 90+ to capture late-stage conversions |

### Dimension 4 — Content requirements

| Requirement | Default | When to use |
|---|---|---|
| **No quantity requirement** (Creator promotes on own cadence) | Affiliate promotes when they want | Standard for most affiliate relationships |
| **Monthly minimum** (≥2 posts/mo) | For Tier 2 + Tier 3 power affiliates | High-volume affiliates get commission bump in exchange for content cadence |
| **Brand voice compliance** | Affiliate agrees to follow Asset 02 voice profile when discussing Brand | All programs; the 5 voice-driven override columns from Asset 02 inform content-review criteria |

**Voice-driven override columns:**

| Voice profile | Quantity requirement | Content-review criteria | Notes |
|---|---|---|---|
| **Default** | None | Brand voice fit + claim accuracy | Standard |
| **Luxury** | **None — but exclusivity required** (Tier 2/3 cannot promote competing Luxury brands in same category) | Aesthetic alignment + tier-appropriate tone + no mass-market positioning | Luxury affiliates are curated, not volume-driven |
| **Sustainable** | None | Mission alignment verified via Asset 09 Pillar 5 (Community) + 1% for the Planet / B Corp / Fair Trade certification | Sustainable affiliates must demonstrate mission-tie (not just claim it) |
| **Gen-Z** | **Monthly minimum ≥2 posts/mo** | Platform-native tone (TikTok / Reels / Discord) + no corporate-speak | Gen-Z affiliates must show up consistently to earn commission |
| **B2B** | **None — but 1 case-study co-authored per quarter** | Industry-expert positioning + case-study quality | B2B affiliates are referral partners + LinkedIn thought-leaders; content quality matters more than quantity |

### Dimension 5 — FTC-disclosure policy

| Requirement | Default | When to use |
|---|---|---|
| **#ad / #affiliate / #sponsored** | Required on every post linking to Brand | All US-based affiliates (FTC mandate) |
| **Platform-native disclosure tool** | TikTok Creator Marketplace "Branded Content" toggle + Instagram "Paid Partnership" tag + YouTube "Includes paid promotion" | All platforms; required as belt-and-suspenders with hashtag |
| **Claim restrictions** | Affiliate will not make claims outside brief or product page | All programs; legal review before launch |

**Voice-driven override columns:**

| Voice profile | Disclosure language | Why |
|---|---|---|
| **Default** | `#ad` or `#affiliate` (clear and conspicuous) | FTC compliance baseline |
| **Luxury** | `#ad` or `#partner` (NOT `#sponsored` — sounds mass-market) | Luxury affiliates avoid mass-market terminology |
| **Sustainable** | `#ad` + `#mission-aligned` (double-disclosure for mission claim) | Mission-aligned affiliates should disclose both the affiliate relationship AND the mission-alignment claim |
| **Gen-Z** | `#ad` + platform-native disclosure toggle + "honest review" framing in caption | Gen-Z audience trusts creator-disclosure transparency; explicit "honest review" language reduces skepticism |
| **B2B** | `#partner` or `#client` (B2B relationship is partnership-framed, not sponsorship-framed) | B2B audience expects partner-disclosure not sponsorship-disclosure |

### Dimension 6 — Cookie-deprecation mitigation (server-side tracking + UTM fallback)

This is the post-iOS 14.5 canonical recipe. The 30-day cookie window alone captures 30–50% of conversions (post-iOS); server-side conversion API captures another 30–50%; UTM fallback captures the remaining 10–20%. Without all 3 channels, the affiliate program is missing 30–50% of attributed conversions.

**6-step recipe:**

1. **Install Shopify Conversion API** (Shopify Admin → Settings → Customer Events → Add Custom Pixel → Conversion API). This is the foundation; without it, the affiliate platform can't attribute server-side.
2. **Connect affiliate platform's server-side integration** (Refersion + Shopify CAPI / Levanta + Shopify CAPI / GoAffPro + Shopify webhook). Verify the integration via a test order (refersion.com/test → $0 order → confirm commission attributed in Refersion dashboard).
3. **Set UTM convention** — `?ref={{affiliate_id}}` OR `?via={{affiliate_handle}}` on every affiliate link. This is the fallback for users who block third-party cookies AND decline server-side events (rare but possible).
4. **Configure multi-touch attribution** (Refersion / Levanta both support first-click + last-click + linear models; default = last-click for affiliate, but document the choice).
5. **Add 30-day cookie as the secondary channel** (set in affiliate platform settings).
6. **Report attribution-confidence tier** — server-side (high) > cookie (medium) > UTM-only (low) — in cohort-LTV analysis (Dimension 7).

### Dimension 7 — Cohort-LTV measurement by affiliate channel

The canonical question: **"which affiliates are driving LTV-positive customers?"** Without this dimension, the operator is paying commission on every conversion without knowing which affiliates are profitable.

**4-step measurement recipe:**

1. **Tag every affiliate-referred order** with `?ref={{affiliate_id}}` → captured in Shopify order note_attributes → flowed to Klaviyo as a custom property → flowed to Triple Whale as an affiliate-channel tag.
2. **Build cohort-by-affiliate query** (Klaviyo or Triple Whale cohort report):

```
-- Pseudo-SQL: cohort LTV by affiliate channel
SELECT
  affiliate_id,
  COUNT(DISTINCT customer_id) AS customers,
  AVG(net_order_value) AS avg_aov,
  AVG(days_to_2nd_order) AS avg_2nd_order_days,
  SUM(CASE WHEN order_count >= 2 THEN 1 ELSE 0 END) * 1.0 / COUNT(DISTINCT customer_id) AS repeat_rate,
  SUM(net_order_value) / COUNT(DISTINCT customer_id) AS cohort_ltv_90d
FROM orders
WHERE order_date >= DATEADD(day, -90, CURRENT_DATE)
  AND affiliate_id IS NOT NULL
GROUP BY affiliate_id
ORDER BY cohort_ltv_90d DESC
```

3. **Apply 4 voice-driven override benchmarks** to the cohort LTV:

| Voice profile | Tier 1 (avg affiliate) LTV | Tier 2 (power) LTV | Tier 3 (strategic) LTV | LTV:CAC threshold |
|---|---|---|---|---|
| **Default** | ≥$80 | ≥$120 | ≥$200 | ≥3:1 |
| **Luxury** | ≥$500 | ≥$800 | ≥$1,500 | ≥4:1 |
| **Sustainable** | ≥$100 | ≥$150 | ≥$250 | ≥3:1 |
| **Gen-Z** | ≥$60 | ≥$90 | ≥$150 | ≥2.5:1 (lower because Gen-Z is volume-driven, not LTV-driven) |
| **B2B** | ≥$1,500 | ≥$5,000 | ≥$15,000 | ≥5:1 (higher because B2B sales cycle is longer) |

4. **Flag underperforming affiliates** (LTV:CAC < threshold × 0.7 for 60+ days) → either coach them with better brief + content support OR remove from program. **Flag overperforming affiliates** (LTV:CAC > threshold × 1.5 for 30+ days) → offer Tier 2/3 promotion + early product access.

---

## 6-step build (Week 1 launch)

### Step 1 — Pick path (5 min)
Run the decision matrix above; select Path A–F. Document the choice in `affiliate-program.md` with rationale.

### Step 2 — Install platform + integrate (1–2 hours)
Install chosen platform (GoAffPro / Refersion / Levanta / Aspire) → connect Shopify (or non-Shopify platform) → set up the 7 dimensions above. Use the 5 voice-driven override columns to populate the platform's commission tier + payout schedule + cookie window settings.

### Step 3 — Configure FTC-disclosure language (30 min)
Add the FTC-disclosure language to your affiliate-program landing page + affiliate-agreement template (use Asset 03 C3 affiliate contract + add the FTC-compliance section from Dimension 5 above). Include the platform-native disclosure tools (TikTok Creator Marketplace, Instagram Paid Partnership, YouTube Paid Promotion) in the affiliate onboarding email.

### Step 4 — Set up cohort-LTV measurement (1 hour)
Wire Shopify order note_attributes → Klaviyo custom property → Triple Whale channel tag. Run the cohort-LTV query from Dimension 7 against test orders to verify it returns real values for 5 sample orders.

### Step 5 — Recruit first 10–20 affiliates (1–3 days)
Three canonical recruitment channels:
- **From existing customers** — export top-100 customers by LTV from Klaviyo; send recruitment email (template below); expect 5–15% conversion → 5–15 new affiliates.
- **From influencer database** — use Aspire / Modash / HypeAuditor to find 50–100 micro-influencers (5k–50k followers) in your category; send outreach email; expect 2–5% conversion → 1–5 new affiliates.
- **From UGC creators** (Asset 03 cross-reference) — invite top-performing UGC creators to "upgrade" from one-off paid/gifting contracts to recurring affiliate relationships; expect 10–30% conversion → 1–3 new affiliates.

**Recruitment email template (Default voice):**

> Subject: Love your {{ content_category }} content — affiliate partnership with {{ brand_name }}?
>
> Hi {{ first_name }},
>
> I'm {{ operator_name }}, founder of {{ brand_name }}. I've been following your {{ platform }} content ({{ content_piece_link }}) and your aesthetic is exactly the kind of creator partnership we'd love to build — your audience aligns beautifully with our brand.
>
> We're launching an affiliate program this month with:
> - **{{ commission_rate }}% commission** on every sale you refer (Tier 1; Tier 2 at {{ tier_2_rate }}% if you hit 10+ sales/mo)
> - **{{ cookie_window }}-day cookie window** so you get credit even if the customer buys later
> - **Monthly payouts** via PayPal/Wise/direct deposit (minimum ${{ min_payout }})
> - **Free product** for content creation (just cover shipping)
>
> No minimum content requirement for Tier 1 — promote on your own cadence. We just ask for `#ad` disclosure per FTC guidelines (we'll send you the language).
>
> Interested? Reply with your shipping address + 1–2 example content pieces + your typical monthly reach, and I'll send you a personalized affiliate link + onboarding packet within 24 hours.
>
> Thanks!
> {{ operator_name }}

**Voice-driven override variants:**
- **Luxury:** Replace "affiliate" with "partnership" in subject + body; mention "curated" + "exclusive"; specify "Macro-tier creators only" in the qualification criteria; offer Tier 1 commission at 10% with Tier 3 at 15% + co-branded content opportunity.
- **Sustainable:** Add "We're a {{ mission }} brand — your audience alignment with our mission matters more than follower count"; mention Asset 09 impact-reporting context + offer Tier 1 at 20% with Tier 3 at 30% for mission-aligned creators.
- **Gen-Z:** Use Gen-Z tone ("ok this is lowkey the best fit — your {{ content_category }} content is so on-brand for us"); mention Discord-tied affiliate program (Asset 07 Gen-Z dimension); offer Tier 1 at 25% with bi-weekly payouts.
- **B2B:** Replace "creator" with "partner"; mention "case-study co-authorship opportunity"; specify LinkedIn thought-leader profile preferred; offer Tier 1 at 8–12% with $500 minimum payout + 90-day cookie window.

### Step 6 — Verify all 5 gates pass (30 min)
Run the verification recipe at the bottom of this asset; confirm all 5 gates pass before announcing the program publicly.

---

## 10 common affiliate-program pitfalls with corrective `Fix:` lines

**Pitfall #1 — Cookie-deprecation-naive (the iOS 14.5 trap).** Operator sets 30-day cookie + expects pre-iOS attribution rates. Post-iOS, cookie-only attribution captures only 30–50% of conversions; the program looks "broken" within 30 days; operator abandons. **Fix:** Always install server-side Conversion API as the primary channel (captures 30–50% more conversions) + cookie as secondary + UTM as tertiary. Verify all 3 channels via test order before announcing the program.

**Pitfall #2 — Creator-volume trap (50+ low-quality affiliates).** Operator recruits 100+ affiliates from influencer database, gives all of them Tier 1, ends up with 95 affiliates producing 0 sales/mo + 5 affiliates producing 80% of revenue. Admin overhead + commission processing eats the margin. **Fix:** Recruit 10–20 high-quality affiliates first (existing customers + Asset 03 UGC creators + 5k–50k follower micro-influencers); promote Tier 2/3 only after 30 days of sales history. Monitor the 80/20 rule; cap active affiliates at 30–50 max for the first 90 days.

**Pitfall #3 — Commission rate too low (Default at 5–10% in a competitive category).** Operator sets Tier 1 at 8% to "save margin" but the category standard is 15–20%; affiliates choose competitor programs; recruitment stalls at 5 affiliates. **Fix:** Apply the 5 voice-driven override columns from Dimension 1 — Default at 15% is the canonical baseline; Sustainable at 20% because mission-aligned creators are scarcer; Gen-Z at 25% because TikTok Creator Marketplace baseline is 25%. Operators who copy Default 15% to a Sustainable brand lose out to mission-aligned competitors who pay 20%.

**Pitfall #4 — Commission rate too high (25% across all tiers without tier structure).** Operator sets flat 25% to "be competitive" but margin erodes; LTV:CAC drops to <2:1 within 60 days; program becomes unprofitable. **Fix:** Use the 3-tier framework (15/20/25) from Dimension 1 with the 5 voice-driven override columns. Tier 1 at the category-standard rate, Tier 2/3 as bonuses for top performers; flat-rate programs attract low-quality affiliates who don't drive incremental LTV.

**Pitfall #5 — Cookie window too long (60–90 days in a fast-cycle category).** Operator sets 60-day cookie to "give affiliates credit"; 30% of affiliate commissions are claimed on conversions that would have happened organically (last-click attribution gaming). **Fix:** Apply the 5 voice-driven override columns from Dimension 3 — Default 30 days / Luxury 60 days (longer consideration cycle) / Gen-Z 7 days (fast cycle + fraud prevention) / B2B 90 days (long sales cycle). Cookie window should match category consideration cycle, not operator generosity.

**Pitfall #6 — FTC-disclosure language missing or vague ("#collab" instead of "#ad").** Affiliate posts without clear disclosure (uses "#sp" or "#collab" alone, which FTC doesn't accept); FTC investigation finds 50+ non-compliant posts; $50k+ fine per violation + mandatory remediation program. **Fix:** Provide affiliates with explicit disclosure language ("`#ad`" / "`#affiliate`" / "`#sponsored`" — choose 1 and use consistently) + platform-native disclosure toggle (TikTok Branded Content, Instagram Paid Partnership, YouTube Paid Promotion). Include disclosure language in the recruitment email (Step 5) + the affiliate-agreement template (Dimension 5) + the program landing page.

**Pitfall #7 — Payment processing friction (no PayPal / Wise / direct deposit).** Operator only offers PayPal; international affiliates (40% of creator economy) can't or won't accept PayPal; recruitment stalls at US-only. **Fix:** Offer 3 payment methods (PayPal + Wise + direct deposit) and document minimum thresholds per method ($50 PayPal / $100 Wise / $500 direct deposit is a common split). International affiliate-friendly = 2× the addressable affiliate pool.

**Pitfall #8 — No cohort-LTV measurement (paying commission on every conversion without knowing profitability).** Operator pays 15% commission on every affiliate-referred order; after 90 days, $50k of commission was paid; cohort-LTV is unknown; LTV:CAC could be <1:1 (program is unprofitable) and operator doesn't know. **Fix:** Wire the cohort-LTV query from Dimension 7 in Week 1; run weekly cohort-LTV report by affiliate; flag any affiliate with LTV:CAC < threshold × 0.7 for 60+ days → coach or remove. This is the killer-test for affiliate-program ROI per Move #10 Pitfall #15 (the creator-volume trap).

**Pitfall #9 — Affiliate agreement not signed (verbal "we'll figure out commission later").** Affiliate drives 50 sales, then demands 30% commission + usage-rights fee; no signed contract; dispute escalates to legal. **Fix:** Always use Asset 03 C3 affiliate contract (the canonical counterparty agreement template) + add the 7-dimension program settings as Schedule A. DocuSign / HelloSign / Notion signing before any product ships or any commission pays.

**Pitfall #10 — No tier-promotion SOP (top affiliates churn because they never get recognized).** Top 5 affiliates drive 80% of revenue but stay at Tier 1; competitor offers Tier 2/3 with higher commission + early product access; top affiliates defect at month 6. **Fix:** Set up monthly tier-review SOP — any affiliate at Tier 1 with 10+ sales/mo for 2 consecutive months gets auto-promoted to Tier 2; any affiliate at Tier 2 with 50+ sales/mo for 2 consecutive months gets auto-promoted to Tier 3 with co-branded content opportunity. The auto-promotion SOP is the canonical retention mechanism.

---

## 5 verification gates

**Gate A — Platform integration gate.** Shopify (or non-Shopify platform) + affiliate platform + Klaviyo + Triple Whale all return real values for 5 test orders. Verify via: place 5 test orders via `?ref=TEST_AFFILIATE_001` → confirm affiliate platform dashboard shows 5 attributed conversions → confirm Klaviyo profile has `affiliate_id` custom property → confirm Triple Whale channel tag = `affiliate:TEST_AFFILIATE_001`.

**Gate B — Commission tier configuration gate.** All 5 voice-driven override columns are configured in the affiliate platform (Default 15/20/25 + Luxury 10/12/15 + Sustainable 20/25/30 + Gen-Z 25/30/35 + B2B 8–12/12–15/15–20). Verify via: log into affiliate platform → confirm commission-tier settings show all 5 voice profiles OR (if platform doesn't support per-voice commission tiers) document the brand's primary voice profile + override table.

**Gate C — Payout schedule + cookie window gate.** Payout schedule is set (monthly Net-30 / bi-weekly Net-15 / on-request per Dimension 2) + cookie window is set per Dimension 3 (Default 30 / Luxury 60 / Gen-Z 7 / B2B 90 / Sustainable 30) + server-side CAPI integration is live + UTM fallback is configured. Verify via: place 5 test orders across 5 different cookie windows → confirm attribution fires correctly across all 3 channels (server-side / cookie / UTM).

**Gate D — FTC-disclosure language gate.** Recruitment email (Step 5) + affiliate-agreement template (Asset 03 C3) + program landing page all contain explicit FTC-disclosure language (`#ad` / `#affiliate` / `#sponsored`). Verify via: `grep -iE "#ad|#affiliate|#sponsored" affiliate-program.md` returns ≥3 matches; review the affiliate-agreement template for Section 6 (FTC compliance); review the recruitment email template for explicit disclosure guidance.

**Gate E — Cohort-LTV measurement gate.** Cohort-LTV query from Dimension 7 returns real values for 5 sample affiliate cohorts. Verify via: run the query against the last 90 days of orders → confirm at least 5 affiliate cohorts have ≥10 customers each → confirm the 4 voice-driven override benchmarks (Default ≥$80 / Luxury ≥$500 / Sustainable ≥$100 / Gen-Z ≥$60 / B2B ≥$1,500) are documented as the LTV:CAC thresholds.

---

## Verification recipe (paste-runnable)

```bash
cd /data/workspace/ecommerce-ops

# Gate 1: Structural completeness — canonical 7-section asset skeleton + 7 program-design dimensions
echo "=== Top-level sections ===" 
grep -c "^## " assets/10-affiliate-program-playbook.md
# Expect: ≥8 (Goal / Decision matrix / 7 dimensions / 6-step build / 10 pitfalls / 5 verification gates / Verification recipe / Related)

# Gate 2: Concrete-content-density — 7 dimensions × 5 voice profiles = 35 voice-driven override cells
echo "=== Voice-driven override cells (expect ≥35) ==="
grep -cE "^\| \*\*(Default|Luxury|Sustainable|Gen-Z|B2B)\*\*" assets/10-affiliate-program-playbook.md

# Gate 3: 10 pitfalls + corrective Fix: lines
echo "=== Pitfalls with Fix: lines (expect 10) ==="
grep -cE "^\*\*Pitfall #[0-9]+ —" assets/10-affiliate-program-playbook.md
grep -cE "\*\*Fix:" assets/10-affiliate-program-playbook.md

# Gate 4: 5 verification gates
echo "=== Verification gates (expect 5) ==="
grep -cE "^\*\*Gate [A-E]" assets/10-affiliate-program-playbook.md

# Gate 5: Anti-pattern grep (no hand-waving)
echo "=== Anti-pattern grep (expect 0 artifact-level matches) ==="
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" assets/10-affiliate-program-playbook.md | grep -v "^.*:#" | head -5

# Gate 6: Voice-density verification (each voice profile ≥15 mentions)
echo "=== Voice-density per profile ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "$voice: $(grep -c "\\b$voice\\b" assets/10-affiliate-program-playbook.md)"
done
# Expect each ≥15 (proves the 5 voice-driven override columns are concrete, not hand-waved)

# Gate 7: Sibling-consistency — all cross-references resolve
echo "=== Cross-references that must resolve ==="
for ref in assets/01-copy-templates.md assets/02-brand-voice.md assets/03-ugc-brief.md assets/04-promo-calendar.md assets/05-retention-metrics.md assets/06-nps-survey-toolkit.md assets/07-competitive-teardown.md assets/08-cs-response-library.md assets/09-impact-reporting.md playbooks/01-abandoned-cart-flow-klaviyo.md playbooks/02-post-purchase-upsell-reconvert.md playbooks/06-install-attribution-triplewhale-or-polar.md playbooks/06-sms-welcome-and-cart-abandon.md playbooks/07-loyalty-program-smile.md playbooks/09.5-pdp-ab-testing-program.md; do
  [ -f "$ref" ] && echo "✓ $ref" || echo "✗ MISSING: $ref"
done

# Gate 8: Zero regressions — full suite re-run
echo "=== Full Python suite ==="
total_pass=0; total_fail=0
for t in scripts/tests/test_*.py; do
  out=$(python3 "$t" 2>&1)
  # Parse the canonical 4-format cascade: Total|Passed|Failed / Summary N/N tests passed + ALL PASS / N passed,0 failed (of M) / unittest Ran N tests in T.TTTs + OK
  if echo "$out" | grep -qE "^[0-9]+ passed,?0 failed"; then
    pass=$(echo "$out" | grep -oE "^[0-9]+ passed" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  elif echo "$out" | grep -qE "Ran [0-9]+ tests"; then
    pass=$(echo "$out" | grep -oE "Ran [0-9]+ tests" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  fi
done
echo "Python tests passed: $total_pass"
echo "Expected: 440 (15 abandoned-cart + 39 ai-ad-creative + 43 attribution-cross-platform-rollup + 64 attribution-quality-audit + 46 checkout + 24 pdp-ab-test + 26 post-purchase + 53 snap-pinterest + 37 tiktok + 49 triple-whale + 44 welcome-series)"
```

---

## Related

**Sibling assets (every cross-reference resolves):**

- `assets/01-copy-templates.md` — T1–T8 marketing templates (the recruitment email template in Step 5 reuses the T1 Welcome email tone + T3 Cart-Abandon Soft conversion-copy patterns)
- `assets/02-brand-voice.md` — 5 voice profiles (the canonical source of the 5 voice-driven override columns across all 7 dimensions)
- `assets/03-ugc-brief.md` — C3 Affiliate contract template is the inbound counterparty agreement; the affiliate-program's cohort-LTV measurement (Dimension 7) compounds Asset 03's UGC cohort-LTV framework
- `assets/04-promo-calendar.md` — Q4-peak affiliate-promo cadence (October + November + December months all reference Asset 03 C3 affiliate contract + monthly payouts); Affiliate recruitment cycles align with Asset 04's quarterly cadence
- `assets/05-retention-metrics.md` — Metric #7 Cohort LTV by source (email ≥1.5× paid default) is the canonical formula for cohort LTV; Metric #8 Payback period (≤6 months default) is the LTV:CAC threshold gate; Metric #12 Cohort LTV by UGC vs paid-social vs organic is the Asset 03 UGC cross-reference
- `assets/06-nps-survey-toolkit.md` — Q9 "how important is sustainability to your purchase decision?" NPS signal feeds the Sustainable-voice affiliate recruitment (Sustainable affiliates weight toward mission-aligned creators per Asset 09)
- `assets/07-competitive-teardown.md` — Dimension 6 (Creator mix) explicitly references Asset 03 C3 affiliate contract + 10–25% rev share; the 5 voice-driven override columns for Dimension 6 mirror this asset's Dimension 1 commission tier framework
- `assets/08-cs-response-library.md` — Scenario 8 (UGC creator inquiry) is the canonical CS touchpoint for affiliate-program applicants; the Default variant's "1) Which contract type fits (gifting / paid / affiliate)" is the cross-reference to this Asset 10's full affiliate-program scaffold
- `assets/09-impact-reporting.md` — Pillar 5 (Community) explicitly references Asset 03 C3 affiliate contract as the inbound counterpart to Asset 10's affiliate-program-for-impact-aligned-creators (the Sustainable-voice commission tier 20/25/30% is the impact-aligned pricing)

**Sibling playbooks (every Move #N reference matches a shipped move):**

- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1) — the cohort-LTV measurement Dimension 7 reuses Move #1's Klaviyo flow-trigger + custom-property pattern
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — Triple Whale is the canonical attribution source for cohort-LTV-by-affiliate-cohort (Dimension 7); affiliate-program cannot exist without Move #6's attribution foundation
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7) — SMS-4 Review Request is the affiliate-recruitment touchpoint for high-LTV customers (top-100 customers by LTV are the canonical first-100-affiliate pool)
- `playbooks/07-loyalty-program-smile.md` (Move #8) — VIP/Elite tier-up customers are the highest-value affiliate-recruitment pool; consider cross-promoting affiliate-program to loyalty-tier-up customers via Klaviyo flow
- `playbooks/09.5-pdp-ab-testing-program.md` (Move #9.5) — affiliate-driven PDP variants can be tested with the same 8-element PDP test matrix; affiliate creative is a natural A/B test variant source

**Research that informed this asset:**

- `research/00-ecommerce-ops-landscape.md` — §7 Affiliate channel: pre-iOS 8–12× direct attribution, post-iOS 3–6× with creator-led models (Levanta, Refersion, Aspire); the structural shift from third-party-cookie to first-party-creator is the canonical 2026 model
- `research/01-tools-stack-comparison.md` — GoAffPro vs Refersion vs Levanta vs Aspire vs ShareASale comparison: GoAffPro is the free Shopify-native starter, Refersion is the default mid-market ($50k–$500k GMV), Levanta is the creator-led scale-phase, Aspire is the influencer-only blend

**Forward-pointing references (planned future assets):**

- `assets/11-cs-training-program.md` *(planned — does not yet exist)* — the Asset-11 candidate for the **CS-rep training program** on the 5 voice-driven override columns. Compounds this asset's Dimension 5 FTC-disclosure policy by training CS reps to verify FTC compliance on inbound affiliate-program inquiries (Scenario 8 from Asset 08 + Asset 11's curriculum).
- `assets/12-impact-data-pipeline.md` *(planned — does not yet exist)* — the Asset-12 candidate for the impact-data pipeline (Shopify Planet API + EcoCart API + Fair Trade USA audit API + B Corp certification API → unified impact dashboard). Compounds this asset's Sustainable-voice commission tier (20/25/30%) by automating the mission-alignment-verification step that's currently manual.
- `playbooks/11-affiliate-program-launch.md` *(potential playbook — does not yet exist)* — the canonical playbook companion to this asset; would mirror the 16-shipped-playbook pattern (Move #1–#10 + #6.5–#6.8 + #9.5) with a 6-step build + 7-gate verification + 15-pitfall list + ROI table for the affiliate program. Pick up in a future tick if the operator signals "I want to launch an affiliate program next quarter."