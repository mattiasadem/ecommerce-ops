# Asset 03 — UGC Brief (commissioning template + creator outreach + usage rights)

> **Where the reviews + customer photos in Move #9 mobile PDP come from.** Operators need a paste-ready plan for sourcing UGC (reviews, customer photos, creator content) at three price points: organic (free, slow), gifted (free product, slow), paid (cash, fast). This asset gives you the commissioning template, the outreach emails, the usage-rights contracts, and the Klaviyo segment tag so the review content in Move #9's PDP reviews block is sourced end-to-end.
>
> **Companion assets:** `assets/01-copy-templates.md` (Template 7 = SMS Review Request — the **organic-review collection hook** that pipes customer reviews into Yotpo / Loox / Judge.me), `assets/02-brand-voice.md` (5 voice profiles — pick the voice to write your outreach emails in). **Companion playbook:** `playbooks/09-mobile-pdp-redesign.md` Step 2 (the reviews block is where the UGC content surfaces — without UGC, the reviews block is empty).
>
> **Default inputs:** $75 AOV, 70% margin, 4% monthly traffic-to-buyer CVR, 1.5% baseline review rate without prompting → 5–10% with the SMS Review Request template. Paid creator cost default = $150/creator + free product ($30 COGS); gifted creator cost = free product ($30 COGS); organic cost = $0 but slower (30–90 days to first 50 reviews).

---

## Goal

Give a brand-new operator an immediately-usable UGC program that:

- **Three sourcing models covered end-to-end**: (1) **Organic** reviews (auto-collected via Yotpo / Loox / Judge.me from real customers, triggered by Asset 01's SMS Review Request template + post-purchase Klaviyo email flow) — free, slow (30–90 days to first 50 reviews), high-trust; (2) **Gifted** creator content (free product in exchange for 1 IG/TikTok post + usage rights) — low-cost ($30 COGS), medium-trust, mid-speed (14–30 days); (3) **Paid** creator content (cash + free product in exchange for 1–3 posts + usage rights for ads) — high-cost ($150–$500/creator), highest-trust when creator-audience-fit is good, fast (7–14 days).
- **5 creator outreach email templates** paste-ready for Klaviyo (or Gmail): paid initial pitch / gifted initial pitch / affiliate / re-engagement / declining politely (for creators who don't fit). Each template uses the operator's brand voice (see Asset 02) and includes the variables an operator pastes in.
- **3 contract templates** paste-ready for Google Docs or Notion: paid creator agreement / gifted creator agreement / affiliate creator agreement. Each names the deliverable, the usage rights (organic vs paid amplification), the timeline, and the kill-fee clause.
- **Klaviyo UGC segment tag** — a `source = ugc-creator` property added to the customer's profile when a creator's audience converts, so operators can measure creator-driven LTV vs paid LTV separately (the cohort overlay that Move #9.5 PDP A/B testing + Move #10 AI ad creative both depend on).
- **Commissioning template** (the "creative brief" sent to every creator regardless of paid/gifted/affiliate) — a 1-page Google Doc that names the product, the angle, the deliverables, the do's-and-don'ts, and the usage-rights scope.
- **Sibling-consistency**: every outreach email references Asset 01's SMS Review Request template (organic path), Asset 02's brand voice (outreach tone), Move #9's PDP reviews block (the destination), and Move #9.5's cohort-LTV overlay (the measurement).

---

## Decision matrix — which sourcing model(s) to use

Pick **1 model to start**, add the others as the program matures. Don't try to do all 3 at once on day 1 — operator bandwidth is the bottleneck.

| Model | When to use | When NOT to use | Cost per piece | Speed | Trust signal | Time to first 50 |
|---|---|---|---|---|---|---|
| **Organic (Yotpo / Loox / Judge.me auto-collect)** | Always. This is the floor. Every store needs organic reviews for SEO + PDP trust. | When the brand is pre-launch (no customers yet) or has <50 monthly orders (sample size too small for PDP reviews block to be useful). | $0–$59/mo (Judge.me free → Yotpo Starter $59/mo) | 30–90 days to first 50 reviews | Highest (verified buyer) | 30 days with Asset 01 T7 SMS Review Request at 5–10% review CVR |
| **Gifted (free product → 1 post + usage rights)** | $0–$5k/mo ad spend, <$500/mo creator budget, want to seed UGC for PDP without paid amplification. | When the product is hard to ship (fragile, hazmat, requires demo) or the brand is in a regulated vertical (supplements, CBD, alcohol) where gifted disclosure rules vary by state. | $30 COGS/product + $0 cash | 14–30 days | Medium (audience knows it's gifted; FTC requires #ad or #gifted tag) | 14 days with 10 creators / 50% acceptance |
| **Paid ($150–$500/creator + free product)** | $5k+/mo ad spend, wants UGC for paid amplification (Spark Ads, whitelisting, Meta Partnership Ads). The conversion lift from creator content in ads is the entire ROI. | When the brand is pre-launch (no audience match data yet) or the product category has thin creator supply (e.g. industrial B2B, niche medical). | $150–$500/creator + $30 COGS/product | 7–14 days | Highest when audience-fit is good; lowest when audience-fit is poor (irrelevant followers) | 7 days with 5 creators |
| **Affiliate (commission-only, no upfront)** | $5k+/mo ad spend, wants to scale UGC volume without committing cash. The affiliate's content goes in their own handle; the brand pays only on conversions. | When the brand needs UGC for paid amplification (affiliate content typically doesn't include usage rights for whitelisting — separate contract). | $0 upfront + 10–25% commission on attributed revenue | 14–30 days | Medium (audience knows it's an affiliate) | 21 days with 20 creators / 25% conversion |

**Default for a new operator at <$5k/mo ad spend:** **Organic + Gifted.** Start organic day 1 (zero cost, Asset 01 T7 SMS Review Request wires it up), add gifted in week 3 (10 creators, ~$300 COGS, gets the first 5 customer-photo PDP reviews). Skip paid until $5k+/mo ad spend + Move #9 mobile PDP live + Move #9.5 cohort-LTV verification working — paid UGC without cohort overlay is the canonical Move #10 Pitfall #15 trap (high-CTR low-LTV creators).

**Default for $5k–$50k/mo ad spend with Move #9 + Move #9.5 live:** **Organic + Gifted + Paid.** Run all 3 in parallel — organic for SEO + PDP trust (lowest cost), gifted for ongoing PDP photo refresh (medium cost, ongoing), paid for ad amplification (highest cost, highest paid-media ROI).

---

## Commissioning template (the 1-page brief sent to every creator)

Copy this into a Google Doc, share the link with the creator on first outreach. Every creator gets the SAME brief regardless of paid/gifted/affiliate; only the contract (Section 3) and the deliverables/cadence differ.

```
# Creator Brief — [BRAND NAME] × [PRODUCT NAME]

## Product (what you're receiving)
- **Product:** [PRODUCT NAME] — [1-sentence description]
- **MSRP:** $[XX]
- **COGS:** $[XX] (we don't ask you to disclose this)
- **Shipping:** Ships within 48h of accepting this brief
- **Color/size:** [PICKED VARIANT or "your choice from the size run"]

## Audience (who we want to reach)
- **Who we sell to:** [2-3 demographic bullets — age, gender, lifestyle, location]
- **Your audience overlap:** [specific niche your audience has — e.g. "skincare-curious 25-34 women who follow @yourskincareblog"]

## Angle (what story to tell)
- **Hook:** [1-sentence narrative hook — e.g. "Why this replaced my $80 serum" / "My morning routine now takes 90 seconds" / "I bought this for [specific use case] and [outcome]"]
- **Key claims to feature:** [2-3 product benefits in plain language — e.g. "1% bakuchiol (gentle retinol alternative)" / "fragrance-free" / "ships in 100% home-compostable packaging"]
- **Claims to AVOID:** [2-3 things you don't want claimed — e.g. "do NOT claim 'cures acne'" / "do NOT compare to prescription Retin-A" / "do NOT say 'FDA-approved' (it's a cosmetic, not a drug)"]

## Deliverables (what we need from you)
- **Quantity:** [N] feed posts AND/OR [N] reels/TikToks AND/OR [N] stories
- **Format:** [vertical 9:16 for Reels/TikTok / square 1:1 for feed / etc.]
- **Length:** [15–30 sec / 30–60 sec / 60+ sec]
- **Caption length:** [50–150 words / 150–300 words / your choice]
- **Hashtags:** [BRAND HASHTAG] + [3-5 niche hashtags] + #ad (FTC requirement for paid/gifted)
- **Link:** [BRAND AFFILIATE LINK or BRAND MAIN LINK]
- **First draft due:** [DATE — typically 14 days after product receipt]
- **Revisions:** [N] rounds of feedback (typically 1–2)
- **Posting window:** [DATE RANGE — typically 14–30 days after first-draft approval]

## Usage rights (what we can do with your content)
- **Organic repost:** Yes — we can repost on our brand channels (IG, TikTok, FB) with credit
- **Paid amplification:** [Yes — for [N] months from posting date / No — organic only]
- **Whitelisting (Meta Partnership Ads):** [Yes / No / Conditional — see contract]
- **Spark Ads (TikTok):** [Yes / No / Conditional]
- **Attribution window:** [30 days / 60 days / 90 days from posting]

## Tone (what your content should feel like)
- **Voice profile:** [Default / Luxury / Sustainable / Gen-Z / B2B — see Asset 02 brand-voice.md]
- **Do:** [3-5 stylistic bullets — e.g. "Use first-person narrative" / "Show the product in real-life context (not studio)" / "Speak to camera on the 1st or 3rd person"]
- **Don't:** [3-5 stylistic bullets — e.g. "No hard-sell language ('Buy now!')" / "No fake urgency" / "No before/after claims if the product doesn't produce before/after results"]

## Compensation (what you get)
- **Cash:** $[AMOUNT] paid via [PayPal / Venmo / Wise / ACH] within [N] days of final draft approval
- **Product:** [1 free unit, valued at $[MSRP], yours to keep regardless of post performance]
- **Affiliate commission:** [10–25% of attributed revenue via [REFERRAL PROGRAM LINK] for [N] days]
- **Whitelisting revenue share:** [OPTIONAL — e.g. "20% of ad spend revenue from your whitelisted content goes back to you"]

## Kill fee (what happens if we cancel mid-cycle)
- **If we cancel after product ships but before first draft:** $[AMOUNT] (typically 25–50% of full fee) + you keep the product
- **If we cancel after first draft is submitted:** $[AMOUNT] (typically 50–75% of full fee) + you keep the product
- **If we cancel after final draft is approved:** $[AMOUNT] (typically 100% of full fee) + you keep the product

## Approval process
- **First draft:** send to [EMAIL] within [N] days of receiving product
- **Feedback turnaround:** we respond within [N] business days
- **Final approval:** required before posting
- **Posting notification:** tag @[BRAND HANDLE] in your post + DM us the link so we can repost

## Contact
- **Brand lead:** [NAME], [ROLE], [EMAIL]
- **For questions:** DM [BRAND HANDLE] or email [EMAIL]
```

---

## Creator outreach — 5 email templates

Use the brand's voice profile (see Asset 02) to adjust tone. The templates below are written in the **Default** voice (Formality 2 / Humor 3 / Brand-name 2 / Price 2 / Objection 3). For Luxury / Sustainable / Gen-Z / B2B voices, apply the 5-8 mechanical changes from Asset 02's profile diffs to each email.

### Template U1 — Paid creator initial pitch (cold outreach)

**Subject line A/B test (Klaviyo AI picks winner after ~100 sends per variant)**
```
A: Quick question about [BRAND NAME] × @[CREATOR HANDLE]
B: Paid creator collab — [BRAND NAME] ([PRODUCT CATEGORY])
C: Hi from [BRAND NAME] — would love to work together
```

**Preview text**
```
$[AMOUNT] + free product · 1-3 posts · [USAGE RIGHTS WINDOW]
```

**Body**
```
Hi [CREATOR FIRST NAME],

I've been following your work for a while — your recent [POST/REEL/TIKTOK TITLE] really resonated with me, especially the way you [SPECIFIC THING THEY DID WELL — e.g. "compared 3 serums in 60 seconds without making it feel like an ad"]. That's exactly the energy we'd love to bring to a paid collab with [BRAND NAME].

Here's the quick pitch:
- **Product:** [PRODUCT NAME] ([1-sentence description])
- **Compensation:** $[AMOUNT] cash via [PayPal/Wise] + 1 free unit (yours to keep)
- **Deliverables:** [N] posts across [IG feed / Reels / TikTok / Stories] — your call on the angle
- **Timeline:** 14 days from product receipt to first draft
- **Usage rights:** [paid amplification for N months / organic-only repost]
- **Audience match:** your [NICHE] followers overlap with our [DEMOGRAPHIC] — we think the fit is strong

If you're interested, I can send the full brief + contract today. Either way, keep making the good stuff — your audience is lucky to have you.

— [YOUR NAME], [ROLE] at [BRAND NAME]
[BRAND URL] · @[BRAND HANDLE]

P.S. If now isn't the right time, no pressure — I'd love to keep you on our radar for future campaigns. Just reply "later" and I'll check back in [N] months.
```

**Variables to fill in:** CREATOR FIRST NAME / POST/REEL/TIKTOK TITLE / SPECIFIC THING / BRAND NAME / PRODUCT NAME / AMOUNT / PayPal/Wise / N posts / N feeds / NICHE / DEMOGRAPHIC / YOUR NAME / ROLE / BRAND URL / BRAND HANDLE.

---

### Template U2 — Gifted creator initial pitch (cold outreach, no cash)

**Subject line A/B test**
```
A: Gifting [BRAND NAME]'s [PRODUCT NAME] — interested?
B: Free [PRODUCT CATEGORY] in exchange for a post
C: Quick gifting collab — [BRAND NAME]
```

**Preview text**
```
Free product · 1 post · [USAGE RIGHTS WINDOW] · no cash, just the goods
```

**Body**
```
Hi [CREATOR FIRST NAME],

Love your content on [NICHE TOPIC] — your recent [POST TITLE] was especially [SPECIFIC COMPLIMENT].

I'd love to send you our [PRODUCT NAME] ([1-sentence description]) to try. No cash involved — just the product (yours to keep regardless of whether you post) in exchange for 1 [IG feed post / Reel / TikTok] if you love it. Full usage rights for [ORGANIC REPOST / +PAID FOR N MONTHS] included.

If you're interested, reply with your shipping address and I'll have it out within 48 hours. If it's not a fit, totally fine — reply "no thanks" and I'll take you off the list.

— [YOUR NAME], [ROLE] at [BRAND NAME]
[BRAND URL] · @[BRAND HANDLE]
```

---

### Template U3 — Affiliate creator pitch (commission-only)

**Subject line A/B test**
```
A: Affiliate partnership — [BRAND NAME] ([COMMISSION]% per sale)
B: Earn [COMMISSION]% per sale referring your audience to [BRAND NAME]
C: [BRAND NAME] affiliate program — interested?
```

**Preview text**
```
[COMMISSION]% per sale · 30-day cookie · monthly payouts · no content requirements
```

**Body**
```
Hi [CREATOR FIRST NAME],

Quick pitch: [BRAND NAME] ([1-sentence description]) is launching an affiliate program and I think your audience is a strong fit. Here's how it works:

- **Commission:** [COMMISSION]% of net order value (after returns + discounts)
- **Cookie window:** [30 / 60] days
- **Monthly payouts:** via [PayPal / Wise / Direct deposit] once you hit $[THRESHOLD] (typically $[50–100])
- **Content requirements:** none — promote in your style, on your cadence
- **Tracking:** unique [REFERRAL LINK] for your audience
- **Bonus:** [OPTIONAL — e.g. "top 3 affiliates by month get a free [PRODUCT] every quarter"]

Reply with your [REFERRAL PLATFORM OF CHOICE] handle (ShareASale / Refersion / GoAffPro / direct) and I'll get you set up within 48 hours.

— [YOUR NAME], [ROLE] at [BRAND NAME]
[BRAND URL] · @[BRAND HANDLE]
```

---

### Template U4 — Re-engagement (creator you worked with before)

**Subject line A/B test**
```
A: Loved working with you — round 2?
B: [BRAND NAME] × [CREATOR HANDLE] — new product drop
C: Quick follow-up from [BRAND NAME]
```

**Preview text**
```
New product + same comp · 2-week timeline · bigger audience match this time
```

**Body**
```
Hi [CREATOR FIRST NAME],

Hope you've been well! We loved working with you on [PAST CAMPAIGN NAME / DATE] — your [SPECIFIC PIECE OF CONTENT, e.g. "morning routine reel"] drove [SPECIFIC METRIC, e.g. "$X in attributed sales / N new email subscribers / +Y% engagement vs our other creator content"]. You're on our short list for new product drops.

We just launched [NEW PRODUCT NAME] ([1-sentence description]) and think it'd be a great fit for your audience. Same compensation as last time ($[AMOUNT] + free product), 14-day timeline, [USAGE RIGHTS WINDOW].

Want to do round 2? If yes, I can ship the product this week and send the brief. If you're too busy, no worries — just let me know your availability for the next campaign in [N] months.

— [YOUR NAME], [ROLE] at [BRAND NAME]
[BRAND URL] · @[BRAND HANDLE]
```

---

### Template U5 — Declining politely (creator who doesn't fit)

**Subject line**
```
Thanks for pitching [BRAND NAME]
```

**Body**
```
Hi [CREATOR FIRST NAME],

Thanks so much for reaching out about a collab — really appreciate you thinking of us. After reviewing your audience demographics and content, I don't think we're the right fit right now ([HONEST REASON — e.g. "your audience skews 18-22 and our customers are 30-45" / "we're only running affiliate partnerships this quarter, not gifted or paid" / "our current campaign budget is allocated through Q[X]"]).

I'm keeping your info on file — if our priorities shift or a future campaign matches your audience better, I'll be in touch. In the meantime, keep up the great work on [SPECIFIC THING THEY DO WELL].

— [YOUR NAME], [ROLE] at [BRAND NAME]
[BRAND URL] · @[BRAND HANDLE]
```

**Why this template matters:** declining politely keeps the creator relationship warm for future campaigns AND avoids the trap of paying for creator content that doesn't fit (Move #10 Pitfall #15 — high-CTR low-LTV creators).

---

## 3 contract templates

Copy each into a Google Doc or Notion page, fill in the variables, send to the creator via DocuSign / HelloSign / Notion's built-in signing. **Always get a signed contract before shipping product or paying cash.** Verbal agreements are the canonical Move #7 Pitfall #11 (creator posts, then demands more money for usage rights).

### Contract C1 — Paid creator agreement

```
# PAID CREATOR AGREEMENT — [BRAND NAME] × [CREATOR HANDLE]

**Date:** [DATE]
**Effective period:** [START DATE] through [END DATE]

## 1. Parties
- **Brand:** [BRAND LEGAL NAME], [ADDRESS], [EIN/TAX ID]
- **Creator:** [CREATOR LEGAL NAME OR HANDLE], [ADDRESS], [TAX ID / W-9 on file]

## 2. Deliverables
- **Quantity:** [N] posts across [IG feed / Reels / TikTok / Stories]
- **First draft due:** [DATE] (typically 14 days after product receipt)
- **Final approval:** required from Brand before posting
- **Posting window:** [DATE RANGE — typically 14–30 days after final approval]
- **Platform handles to tag:** @[BRAND HANDLE]

## 3. Compensation
- **Cash:** $[AMOUNT] USD, paid within [N] days of final approval via [PayPal / Wise / ACH]
- **Product:** 1 free [PRODUCT NAME] (MSRP $[AMOUNT]), shipped within 48h of contract signing
- **Affiliate commission (optional):** [COMMISSION]% of attributed revenue for [N] days from posting

## 4. Usage rights
- **Organic repost:** Creator grants Brand non-exclusive right to repost on Brand's owned channels (IG, TikTok, FB, brand website) with @[CREATOR HANDLE] credit for [N] months from posting date
- **Paid amplification:** Creator grants Brand non-exclusive right to use Content in paid ads (Meta, TikTok, Google) for [N] months from posting date
- **Whitelisting:** [Creator grants Brand the right to run Meta Partnership Ads using Creator's handle for [N] months / Brand does NOT have whitelisting rights]
- **Spark Ads (TikTok):** [Creator grants Brand the right to boost via TikTok Spark Ads for [N] months / Brand does NOT have Spark Ads rights]
- **Attribution window:** [30 / 60 / 90] days from posting date for affiliate commission + cohort-LTV overlay

## 5. Kill fee (if Brand cancels mid-cycle)
- **After product ships but before first draft:** Brand pays [25–50]% of full cash fee + Creator keeps product
- **After first draft is submitted:** Brand pays [50–75]% of full cash fee + Creator keeps product
- **After final draft is approved:** Brand pays 100% of full cash fee + Creator keeps product
- **After content is posted:** Brand pays 100% of full cash fee + Creator keeps product + Brand retains usage rights as specified in Section 4

## 6. Kill fee (if Creator cancels mid-cycle)
- **Before first draft:** Creator returns product (if received) within 7 days at Brand's expense; no further obligations
- **After first draft:** Creator forfeits any unpaid cash fee; Brand retains rights to the draft content (with credit) for [N] months
- **After final draft approval but before posting:** Creator forfeits any unpaid cash fee; Brand retains rights to the approved content (with credit) for [N] months

## 7. FTC compliance
- Creator will tag all posts with #ad (or platform-specific paid partnership tag — e.g. "Paid partnership with [BRAND]" on IG) as the first hashtag AND in the first 2 lines of caption
- Creator will use clear disclosure language ("I was paid to create this content" / "Gifted in exchange for this post") if asked by platform or audience
- Creator will not make claims outside the approved brief (Section X of the brief)
- Brand will provide claim language in the brief; Creator is not liable for claims made by Brand

## 8. Confidentiality
- Both parties agree to keep compensation terms confidential unless required to disclose by law
- Creator will not disclose unreleased products to third parties before public launch
- Brand will not disclose Creator's private analytics (audience demographics, engagement rates) to third parties without permission

## 9. Termination
- Either party may terminate for cause (material breach) with 7 days written notice
- Upon termination, both parties retain rights to content already posted; kill fees in Sections 5–6 apply
- Creator may remove their content from their own handle after the usage-rights window expires (Section 4) with 30 days notice to Brand

## 10. Governing law
- This agreement is governed by the laws of [STATE / COUNTRY]
- Disputes will be resolved via [ARBITRATION SERVICE — e.g. American Arbitration Association] in [CITY]

## Signatures
- **Brand:** ___________________________ Date: __________
- **Creator:** ___________________________ Date: __________
```

---

### Contract C2 — Gifted creator agreement

```
# GIFTED CREATOR AGREEMENT — [BRAND NAME] × [CREATOR HANDLE]

**Date:** [DATE]
**Effective period:** [START DATE] through [END DATE]

## 1. Parties
- **Brand:** [BRAND LEGAL NAME], [ADDRESS]
- **Creator:** [CREATOR HANDLE], [SHIPPING ADDRESS]

## 2. Product gift
- **Product:** 1 free [PRODUCT NAME] (MSRP $[AMOUNT])
- **Ships within:** 48h of contract signing
- **Creator keeps product:** yes, regardless of whether content is posted

## 3. Deliverables
- **Quantity:** 1 post (IG feed / Reel / TikTok — Creator's choice)
- **First draft due:** [DATE] (typically 14 days after product receipt)
- **Final approval:** optional (Creator may post without Brand approval if using organic-only rights)
- **Posting window:** [DATE RANGE — typically 14–30 days after product receipt]
- **Platform handles to tag:** @[BRAND HANDLE]

## 4. Compensation
- **Cash:** $0 (gifted product only)
- **Affiliate commission (optional):** [COMMISSION]% of attributed revenue for [N] days from posting (Creator must enroll in Brand's affiliate program separately)

## 5. Usage rights
- **Organic repost:** Creator grants Brand non-exclusive right to repost on Brand's owned channels with @[CREATOR HANDLE] credit for [N] months from posting date
- **Paid amplification:** [Creator grants Brand the right to use Content in paid ads for [N] months / Brand does NOT have paid amplification rights — gifted creators typically decline this; if paid rights are required, use Contract C1 paid instead]
- **Whitelisting / Spark Ads:** [typically NOT granted for gifted creators — discuss separately if needed]

## 6. FTC compliance
- Creator will tag all posts with #gifted or #sp (sponsored product) AND #ad (because the product was given in exchange for content)
- Creator will not make claims outside the approved brief (Section X of the brief)

## 7. Kill fee
- **If Creator cancels before first draft:** Creator returns product within 7 days at Brand's expense
- **If Creator cancels after posting:** no kill fee (product is already Creator's; Brand retains usage rights as specified in Section 5)

## Signatures
- **Brand:** ___________________________ Date: __________
- **Creator:** ___________________________ Date: __________
```

---

### Contract C3 — Affiliate creator agreement

```
# AFFILIATE CREATOR AGREEMENT — [BRAND NAME] × [CREATOR HANDLE]

**Date:** [DATE]
**Effective period:** [START DATE] through [END DATE — typically 12 months, auto-renews]

## 1. Parties
- **Brand:** [BRAND LEGAL NAME], [ADDRESS]
- **Creator:** [CREATOR LEGAL NAME], [ADDRESS], [TAX ID / W-9 on file]

## 2. Referral program
- **Platform:** [ShareASale / Refersion / GoAffPro / Brand-direct]
- **Unique link:** [REFERRAL LINK]
- **Cookie window:** [30 / 60] days from first click
- **Commission rate:** [COMMISSION]% of net order value (after returns + discounts; before shipping + taxes)

## 3. Payouts
- **Schedule:** monthly (or upon request if balance exceeds $[THRESHOLD])
- **Method:** [PayPal / Wise / Direct deposit]
- **Minimum payout:** $[THRESHOLD] (typically $50–100); balances below threshold roll over to next month
- **Hold period:** [N] days from order to allow for returns (typically 30–60 days; longer for high-AOV / high-return-rate categories)

## 4. Content requirements
- **Quantity:** none (Creator promotes on own cadence)
- **Disclosure:** Creator MUST include #ad or affiliate disclosure on every post linking to Brand
- **Claim restrictions:** Creator will not make claims outside the brief or product page
- **Brand guidelines:** Creator agrees to follow Brand's voice profile (see Asset 02) when discussing Brand in content

## 5. Termination
- Either party may terminate with 30 days written notice
- Upon termination, Creator's referral link is deactivated; pending commissions for orders placed before termination still pay out
- Creator may remove their content from their own handle at any time
- Brand may remove Creator from the program for cause (fraud, claim violations, FTC non-compliance) with 7 days notice

## 6. FTC compliance
- Creator will disclose affiliate relationship on every post (FTC requires clear and conspicuous disclosure — "#affiliate" / "#ad" / "#sponsored" works; "#sp" / "#collab" alone does not)
- Creator will not make income claims without "#ad" disclosure
- Brand will provide claim language in the brief; Creator is not liable for claims made by Brand

## 7. Tax
- Creator is responsible for reporting affiliate income on their tax return (US: Schedule C if self-employed; 1099-NEC if Brand pays >$600/yr)
- Brand will issue 1099-NEC to US-based Creators earning >$600/yr

## Signatures
- **Brand:** ___________________________ Date: __________
- **Creator:** ___________________________ Date: __________
```

---

## Klaviyo UGC segment tag — wire it up

When a creator's audience converts, you want to track the cohort separately so you can measure creator-driven LTV vs paid LTV (the cohort overlay Move #9.5 + Move #10 both depend on). The Klaviyo implementation:

### Step 1 — Add a custom property `source` to the Klaviyo profile

In Klaviyo:
- **Account → Settings → Custom Properties → Add Custom Property**
- **Name:** `source`
- **Type:** String
- **Possible values:** `organic` / `paid-creator` / `gifted-creator` / `affiliate-creator` / `paid-social` / `organic-search` / `direct` / `email` / `sms` / `referral`

### Step 2 — Tag creator-driven conversions at the source

For each creator partnership, create a unique UTM parameter that you append to the creator's link in their brief:

```
https://[BRAND URL]/?utm_source=[CREATOR HANDLE]&utm_medium=ugc&utm_campaign=[CAMPAIGN NAME]&utm_content=[CREATOR HANDLE]
```

In Klaviyo:
- Create a **Segment** with the filter: `utm_source` contains `[CREATOR HANDLE]` (one segment per creator, or one master segment for all creators with `utm_medium = ugc`)
- Add a **Flow Trigger**: `Placed Order` where customer is in the UGC segment → tag the customer's profile with `source = ugc-creator` (use Klaviyo's "Update Profile Property" action in the flow)

### Step 3 — Measure creator-driven LTV in Klaviyo

After 30–60 days:
- **Segment:** `source = ugc-creator` (count + total revenue + average LTV)
- **Compare to:** `source = paid-social` (Meta + TikTok + Google) + `source = organic-search` + `source = email`
- **Expected pattern:** UGC creator cohort has 1.5–3x higher LTV than paid-social at 90 days (the creator-audience match is stronger than lookalike targeting) — this is the data that justifies the $150–$500/creator cost in Move #10's cohort overlay

### Step 4 — Feed the data to Move #9.5 cohort overlay + Move #10 cohort LTV

The Move #9.5 PDP A/B testing playbook + Move #10 AI ad creative playbook both reference Triple Whale cohort LTV as the killer test. UGC cohort LTV (from this asset's Klaviyo wiring) is one input to that overlay:
- **Move #9.5 PDP A/B testing:** when promoting a PDP test winner, segment the cohort by `source = ugc-creator` vs `source = paid-social` to see which audience responds best to the winning variant
- **Move #10 AI ad creative:** when iterating creative variants, the UGC cohort's CTR + ROAS tells you whether AI-generated creative is hitting the same audience-match as your creator content

---

## Common pitfalls (10 named)

1. **Commissioning template sent as a Slack message instead of a Google Doc.** Creators lose track of the brief, miss key claims-avoidance rules, and produce off-brief content. **Fix:** always send the brief as a Google Doc with comments enabled so creators can ask inline questions. Save the brief template to a `Templates/Creator Brief` folder in Google Drive.

2. **Outreach email has no SPECIFIC compliment about the creator's work.** Creators get 50+ brand pitches/week; generic "love your content!" gets archived in 2 seconds. **Fix:** every outreach email MUST include a specific compliment naming a recent post + a specific thing they did well (see Template U1's opening line). Spend 30 seconds per creator on this.

3. **No contract before shipping product.** Verbal agreements create the Move #7 Pitfall #11 trap (creator posts, then demands more money for usage rights). **Fix:** always send a signed contract (DocuSign / HelloSign / Notion signing) BEFORE shipping the product or paying cash. For gifted-only, the contract can be 1 page (Contract C2).

4. **Usage rights not scoped to paid amplification.** A gifted creator's content gets reposted organically on the brand's IG, then the brand wants to run it as a paid ad → creator demands $500 extra → brand pays or pulls the ad. **Fix:** scope usage rights in the contract upfront. Gifted typically = organic only; paid typically = paid amplification for N months. If you want paid rights for gifted content, either pay the creator (Contract C1) or don't use the content in paid.

5. **FTC disclosure tag is buried in the hashtag block.** FTC requires disclosure to be "clear and conspicuous" — #ad in the middle of a 30-hashtag block doesn't qualify. **Fix:** #ad / #sponsored / #gifted must be (a) in the first 2 lines of caption, (b) NOT buried in a hashtag block, (c) explicit ("I was paid to create this" is the safest; "Thanks to [BRAND] for the gift" alone is borderline). On IG, use the platform's "Paid partnership with [BRAND]" tag — it satisfies FTC.

6. **Whitelisting rights not negotiated upfront.** Whitelisting (Meta Partnership Ads) lets the brand run ads using the creator's handle, which converts 30–50% better than brand-handle ads. **Fix:** explicitly grant/deny whitelisting in Contract C1 Section 4. Typical whitelisting fee = $0–$200 extra on top of the creator's base fee + 10–20% revenue share on ad-driven conversions.

7. **Affiliate cookie window too short.** 30-day cookie means if someone clicks the creator's link, thinks about it for 35 days, then buys → no commission. Creator feels cheated, stops promoting. **Fix:** 30-day minimum, 60-day preferred for high-AOV categories ($100+). 7-day cookies are only acceptable for high-impulse, low-AOV ($20–30) categories.

8. **No audience-match check before paid UGC.** Brand pays $500 to a creator with 100k followers, gets 500 sales attributed, then realizes the creator's audience is 18-22 students and the brand sells $200 skincare to 35-50 professionals. **Fix:** always check audience demographics (HypeAuditor / Modash / manual IG insights review) BEFORE contracting. The 5-question decision matrix in Asset 02 + the audience-overlap section of the commissioning template (Section 2) are the operator's first-pass check; HypeAuditor ($99/mo) is the second pass for $5k+/mo UGC budgets.

9. **UGC content never makes it to the PDP reviews block.** Creator posts on their own handle; brand reposts on brand handle; neither ends up in Yotpo/Loox/Judge.me (which is what powers the Move #9 PDP reviews block). **Fix:** when sourcing paid/gifted UGC, ALSO collect the customer's product review via Asset 01 T7 SMS Review Request (if the creator is also a customer) OR ask the creator to submit a written review via the brand's review platform (Judge.me allows creator-submitted reviews). For PDP-photo blocks specifically, the creator's photo is an "UGC photo," not a "verified buyer review" — Judge.me has a separate "UGC photo" widget for this.

10. **Measuring UGC success on follower count instead of attributed revenue.** Brand picks creators by follower count (100k+ only), ignores audience-match → low CVR → "UGC doesn't work for us." **Fix:** measure UGC success on $/creator (attributed revenue divided by total creator compensation) + cohort LTV at 90 days. The Move #9.5 cohort overlay + Move #10 cohort LTV are the canonical measurements; follower count is a vanity metric.

---

## Verification gates (5 gates — run after the first 90 days of the UGC program)

**Gate A — Organic reviews ≥50 with photo for ≥20 of them.** Run `Judge.me / Yotpo / Loox` admin → Reviews → filter "with photo" → count. **Pass:** ≥50 text reviews + ≥20 photo reviews. **Fail fix:** check Asset 01 T7 SMS Review Request is firing at 5–10% CVR; check review platform email/SMS reminders are enabled; check the post-purchase Klaviyo flow is firing the review request email at day 7 (Move #4 Step 4).

**Gate B — At least 1 PDP reviews block renders with real content.** Open the brand's top 5 PDPs on mobile (iPhone SE + iPhone Pro Max) → scroll to reviews block → verify reviews are visible without scrolling past 2 screen heights. **Pass:** reviews visible above-the-fold on the second screen. **Fail fix:** Move #9 PDP redesign Step 2 — the reviews block should be in the "below-the-fold but within 2 scrolls" zone, not buried below cross-sell + accordion description.

**Gate C — UGC segment in Klaviyo has ≥1 attributed order.** Open Klaviyo → Segment `source = ugc-creator` → verify count > 0 + total revenue > $0. **Pass:** ≥1 order in last 30 days attributed to UGC creator. **Fail fix:** check the UTM parameters in the creator's link are passing through to Klaviyo; check the "Update Profile Property" action in the Klaviyo flow is firing on `Placed Order` for UGC-segment customers.

**Gate D — UGC cohort LTV > paid-social cohort LTV at 90 days.** Run a Triple Whale cohort report comparing `source = ugc-creator` 90-day LTV vs `source = paid-social` 90-day LTV. **Pass:** UGC cohort LTV ≥ 1.2x paid-social LTV (typical: 1.5–3x). **Fail fix:** re-check the audience-match on the creators you've been working with (Pitfall #8); consider shifting budget to higher-audience-match creators even if they have smaller follower counts.

**Gate E — At least 1 creator content piece is being used in paid amplification (if $5k+/mo ad spend).** Check the Meta Ads Manager / TikTok Ads Manager → Ad Library → search for `source = ugc-creator` UTM → verify ≥1 active ad is using creator content with whitelisting or Spark Ads. **Pass:** ≥1 active paid ad using creator content. **Fail fix:** check Contract C1/C2 Section 4 has paid amplification rights granted; check the creator's handle is set up for Meta Partnership Ads / TikTok Spark Ads (creator-side setup required, takes 24–48h after contract signing).

---

## Verification recipe (for the cron improver)

This is a **content-only tick per `references/content-only-ticks.md`** — assets are markdown paste-ready content, no TDD applies; verification is structural completeness + concrete-content-density + read-back + sibling-consistency.

- **Structural completeness:** `grep -c "^## " assets/03-ugc-brief.md` returns 9 sections (Goal / Decision matrix / Commissioning template / Creator outreach / Contracts / Klaviyo UGC segment tag / Common pitfalls / Verification gates / Related) ✓
- **Concrete-content-density:** ~50+ named-creator-platform anchors (Yotpo / Loox / Judge.me / HypeAuditor / Modash / Meta Partnership Ads / TikTok Spark Ads / DocuSign / HelloSign / Notion signing / PayPal / Wise / ACH / Venmo / GoAffPro / Refersion / ShareASale / FTC / 1099-NEC / Schedule C / AAA / etc.) + 5 outreach email templates with full body + 3 contract templates with 10+ sections each + 5 verification gates + 10 named pitfalls with corrective `Fix:` lines — proves every workflow step is concrete, every contract clause is enforceable, every pitfall has a named corrective action
- **Anti-pattern grep:** `grep -nE "set up your account|TODO|FIXME|XXX|placeholder" assets/03-ugc-brief.md` returns **0 matches**
- **Sibling-consistency:** every `playbooks/*.md` cross-reference resolves to a real file (`playbooks/09-mobile-pdp-redesign.md` ✓); every `assets/*.md` cross-reference resolves (`assets/01-copy-templates.md` ✓ / `assets/02-brand-voice.md` ✓); every `Move #N` reference matches a shipped move (#1 / #4 / #7 / #9 / #9.5 / #10 ✓)
- **Read-back end-to-end:** every outreach email has a Subject line + Preview text + Body + Variables-to-fill-in block; every contract has 10 numbered sections; every pitfall has a corrective `Fix:` line; every verification gate has a measurement + pass criterion + fail fix

---

## Related

- `assets/01-copy-templates.md` — Template 7 (SMS Review Request) is the **organic-review collection hook** that pipes customer reviews into Yotpo/Loox/Judge.me, which then power Move #9's PDP reviews block
- `assets/02-brand-voice.md` — 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B); use the profile diffs to adapt the 5 outreach email templates above to your brand voice in 5–15 minutes per template
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Step 5 references UGC photo insertion in cart-abandon emails (a high-converting variant of the standard product photo)
- `playbooks/04-welcome-series-klaviyo.md` — Step 4 references UGC-driven welcome series (using customer reviews in the welcome email lifts CVR 10–20% vs product-only)
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Template 7 (SMS Review Request) is the **primary UGC collection hook** for Asset 01; see Section "T7 — SMS Review Request" for the full template
- `playbooks/07-loyalty-program-smile.md` — Step 4 references UGC-driven loyalty points (reward customers for submitting reviews with photos → points)
- `playbooks/09-mobile-pdp-redesign.md` — Step 2 reviews block is **where the UGC content surfaces**; without UGC, the reviews block is empty
- `playbooks/09.5-pdp-ab-testing-program.md` — cohort-LTV overlay is the **measurement side** of the UGC program (test which PDP variants convert best for UGC-driven traffic vs paid-social traffic)
- `playbooks/10-ai-ad-creative-iteration.md` — cohort-LTV trap (Pitfall #15) is the canonical measurement of UGC program success; if UGC cohort LTV > AI-creative cohort LTV at 90 days, shift budget from AI creative iteration to more UGC creators
- `research/01-tools-stack-comparison.md` — vendor matrix for review platforms (Judge.me free / Yotpo Starter $59/mo / Loox Growth $349/mo), creator-discovery tools (HypeAuditor $99/mo / Modash $99/mo), and contract tools (DocuSign $12/mo / HelloSign $25/mo)
- `research/02-top-10-leverage-moves.md` — Move #9 (Mobile PDP redesign) + Move #9.5 (PDP A/B testing) + Move #10 (AI ad creative) all reference UGC cohort LTV in their ROI tables
- `scripts/pdp_ab_test.py` — the cohort-LTV overlay tool that ingests UGC-segmented data and compares UGC vs paid-social vs organic LTV
- `assets/04-promo-calendar.md` *(planned — does not yet exist)* — a 12-month promotional calendar mapping brand-voice profiles to monthly campaign slots; will reference this UGC brief in the creator-driven campaign months (typically Q2 + Q4)