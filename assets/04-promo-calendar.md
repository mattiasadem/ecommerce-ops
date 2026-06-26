# Asset 04 — 12-Month Promotional Calendar

> **What every month of the year looks like for a DTC brand.** This asset maps each month of the year to the right combination of **brand voice profile** (from Asset 02), **discount intensity** (the column Asset 02's decision matrix calls "Discount frequency"), **Klaviyo + Postscript templates** (from Asset 01), **UGC campaign cadence** (from Asset 03), and **audience segment** (per Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty). Operator reads this once, copies the relevant month block into their planner, and ships the calendar in ~1 hour.
>
> **Companion assets:** `assets/01-copy-templates.md` (8 paste-ready Klaviyo + Postscript templates — each month picks which template fires), `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework — this calendar maps profile → month), `assets/03-ugc-brief.md` (5 outreach emails + 3 contracts — Q2 + Q4 are creator-driven campaign months; the commissioning template + outreach emails fire then). **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (cart-abandon is the highest-leverage flow — fires every month but messaging varies by promo theme), `playbooks/04-welcome-series-klaviyo.md` (welcome series always-on but the welcome discount amount varies by promo calendar month), `playbooks/06-sms-welcome-and-cart-abandon.md` (SMS flash-sale + win-back windows are calendar-driven), `playbooks/07-loyalty-program-smile.md` (loyalty member-only flash sales slot into the calendar's "member-only" months).
>
> **Default inputs:** $75 AOV, 70% margin, 4% monthly traffic-to-buyer CVR, $500–$50k/mo paid spend, US/EU/UK-based operator, BFCM-week intent. The calendar is US-anchored (Thanksgiving / Black Friday / Cyber Monday / Memorial Day / July 4th / Labor Day) — operators in EU/UK/AU shift the holiday rows by 1–4 weeks but keep the Q1-low / Q2-creator / Q3-mid / Q4-peak macro shape.

---

## Goal

Give a brand-new operator a paste-ready 12-month promotional calendar that:

- **12 monthly slots** — one per month — with the **voice profile**, **discount intensity**, **audience segment**, **template stack** (which Asset 01 templates fire that month), **UGC campaign status** (creator-driven months get Asset 03 outreach emails), and **loyalty program state** (member-only slots vs always-on).
- **Q1-low / Q2-creator / Q3-mid / Q4-peak macro shape** — the calendar is anchored on real retail seasonality (Q1 = post-holiday recovery, Q4 = BFCM + holiday peak), not on "ship a promo every month for the sake of shipping a promo" (the discount-fatigue trap from Pitfall #1 below).
- **Voice profile explicitly chosen per month** — Default brands run Default every month (Discount frequency = Monthly per Asset 02's matrix); Luxury brands run Luxury every month (Discount frequency = Never/seasonal — only the 4 seasonal peak slots get a discount, the other 8 months are full-price); Sustainable brands run Sustainable every month with member-only slot gates; Gen-Z brands run Daily/flash sales aligned with launch drops; B2B brands ignore consumer seasonality and run a quarterly-volume cadence (last table in this asset).
- **Discount intensity calibrated to voice** — the same 20%-off holiday slot reads differently in Default vs Luxury vs Sustainable voice (Asset 02 Pitfall #5 + #7 cover the "Luxury voice + '10% off'" trap and the "Sustainable voice + discount-led" trap).
- **Klaviyo + Postscript template stack** — for each month, a named list of which Asset 01 templates fire (e.g. "January fires T1 Welcome + T2 Cart-Abandon Soft + T8 Win-Back; suppress T4-T7 SMS until February").
- **UGC campaign cadence** — Q2 (April–June) + Q4 (October–December) are creator-driven campaign months per Asset 03's recommended cadence; the 5 outreach emails in Asset 03 fire in those months.
- **Common pitfalls with corrective `Fix:` lines** — 10 named pitfalls (discount fatigue / wrong voice for the month / overlapping promos / missing the welcome-discount cap / loyalty-member-only gate skip / Q4-creator-campaign overlap / BFCM-week infrastructure / no promo in Q1 / no post-BFCM recovery / international holiday drift) — each with a corrective `Fix:` line that an operator can act on in <15 minutes.
- **Verification gates** — 5 end-to-end checks that an operator runs on the calendar before launching it (calendar coverage / voice alignment / template wiring / UGC month alignment / loyalty gate).
- **Sibling-consistency**: every Asset 01 template reference resolves to a real template (T1–T8), every Asset 02 profile reference resolves to a real profile (Default / Luxury / Sustainable / Gen-Z / B2B), every Asset 03 outreach reference resolves to a real email (U1–U5), and every Move / playbook reference resolves to a real file.

---

## The 12-month calendar (Default voice brand at default inputs)

> **Read this table once, then jump to the per-month playbook below it.** Each row maps month → voice profile → discount intensity → audience segment → Asset 01 templates that fire → UGC campaign status → loyalty gate. The macro shape is Q1-low (recovery) → Q2-creator (campaign + content) → Q3-mid (steady-state) → Q4-peak (BFCM + holiday). A Default brand runs Default voice every month; the discount intensity varies by quarter. The first table shows the default brand — the **voice-profile variant tables** below it show how Luxury / Sustainable / Gen-Z / B2B shift the same 12 months.

| Month | Theme | Voice profile | Discount intensity | Audience segment | Asset 01 templates that fire | UGC campaign | Loyalty gate |
|---|---|---|---|---|---|---|---|
| **January** | New Year, New Routine (post-holiday recovery) | Default | 15% sitewide (limited to Jan 7–14, 7-day window) | Active subscribers + cart-abandoners from Q4 + new visitors | T1 Welcome (with 10% code) + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + T8 Win-Back (15% code, 60+ days inactive) | Pause (Q4 just shipped creator content; review Q4 cohort LTV before commissioning new round) | Member-only flash sale Jan 21–22 (48h, 20% extra for loyalty members on top of any discount) |
| **February** | Valentine's Day (gifting) | Default | Bundle pricing (BOGO 50% on bundles, no sitewide discount) | Gift-givers (filtered by `last_purchase_category != gift` to find non-gift buyers) + couples (filtered by `address.contains("&")` or shipping 2 of same SKU) | T1 Welcome + T2 Cart-Abandon Soft (no discount — Valentine's converts on intent) + T4 SMS Welcome + T5 SMS Cart-Abandon #1 (no discount) + T6 SMS Cart-Abandon #2 (10% code, expires Feb 14) | Light (1 gifted creator outreach email U2 to Valentine-themed creators only; 4–6 weeks lead time) | Member early access to Valentine's bundle (Feb 10–13, 24h before public launch) |
| **March** | Spring refresh (no holiday) | Default | None (no discount — Spring traffic is intent-driven) | Active subscribers + browse-abandoners (filtered by `viewed_product in last 14d AND not purchased`) | T1 Welcome + T2 Cart-Abandon Soft (no discount) + T7 SMS Review Request (warmer weather = more unboxing content) | Pause (Q2 prep; commission Q2 creators end of March for April launch) | None (no March-only perk; standard always-on loyalty program runs) |
| **April** | Q2 creator campaign kickoff + Earth Day (Sustainable brands) | Default (Sustainable brands: Sustainable voice in Earth Day week only) | None sitewide; Sustainable brands do 10% Earth-Day-only donation match (no customer discount — Sustainable brands don't lead with discount per Asset 02 Pitfall #7) | Active subscribers + Q4-cohort repeat buyers (60-day repurchase window) | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Earth-Day-only Klaviyo flow for Sustainable brands | **Active** — kick off Q2 creator campaign: send 4–6 Asset 03 U2 Gifted outreach emails (1 per week) targeting Instagram/TikTok creators in your category; goal = 3 accepted partnerships by end of April | Member-only Earth Day bundle preview (April 20–22, before public launch April 23) |
| **May** | Mother's Day + spring gifting | Default | Bundle pricing (curated Mother's Day gift sets, BOGO 25% on bundles) | Gift-givers (filtered as in Feb) + moms-with-kids (lookalike on purchasers who bought kids' category) | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code, expires May 14) + T6 SMS Cart-Abandon #2 (10% code) | **Active** — Q2 creator campaign continues: send 2–3 Asset 03 U1 Paid outreach emails to higher-tier creators (>$10k followers); goal = 1–2 paid partnerships live by end of May | Member early access to Mother's Day bundle (May 5–8, 48h before public) |
| **June** | Mid-year creator content + Father's Day | Default | Bundle pricing (Father's Day bundles, BOGO 25% on bundles) | Dads (filtered by purchasers with male-coded names OR shipping to male recipient names) + gift-givers | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Father's Day-only Klaviyo flow | **Active** — last month of Q2 creator campaign: send Asset 03 U5 Declining politely to creators who didn't fit; measure Q2 cohort LTV via Move #9.5 + Move #10's cohort overlay | Member-only Father's Day bundle preview (June 12–15) |
| **July** | Mid-year sitewide (low-competition traffic window) | Default | 15% sitewide (3-day window, July 4–7) | Active subscribers + lookalike on Q2-purchasers | T1 Welcome (with 10% code) + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + T8 Win-Back (15% code) | Pause (Q2 wrap-up; review Q2 cohort LTV; commission Q4 creators end of July for October launch) | Member-only 4-day flash sale (July 8–11, 20% extra after July sitewide ends) |
| **August** | Back-to-school (B2B + kid-category brands only) | Default (B2B brands: B2B voice in August only) | Bundle pricing (back-to-school bundles, B2B brands do volume discounts) | Parents + B2B buyers (filtered by `purchase_frequency > 3 OR address.is_business == true`) | T1 Welcome + T2 Cart-Abandon Soft + B2B-only quarterly-volume Klaviyo flow | Pause (Q3 mid-year prep; review Q2 creator content performance) | Member early access to BTS bundle (Aug 20–25) |
| **September** | Fall refresh (no holiday) | Default | None (intent-driven; September is highest-converting month for many DTC categories per the Asset 02 research) | Active subscribers + browse-abandoners + Q3-cart-abandoners | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request (fall unboxing content) | Light (kick off Q4 creator campaign pre-BFCM: send 4–6 Asset 03 U1 Paid outreach emails in late September) | None (always-on loyalty program only) |
| **October** | Q4 creator campaign kickoff + pre-BFCM warmup | Default | Early-bird 10% (loyalty members only, Oct 1–7) | Active subscribers + loyalty members + Q3-cohort repeat buyers | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation + loyalty-member-early-access flow | **Active** — Q4 creator campaign: send 4–6 Asset 03 U1 Paid + U4 Re-engagement (creators who worked Q2) outreach emails; goal = 3–5 paid partnerships live by end of October | Member early access to Q4 launches (Oct 1–7, before public) |
| **November** | BFCM (Black Friday + Cyber Monday) + Thanksgiving + Singles' Day (international) | Default | 25% sitewide (BFCM weekend only, Nov 24–28, 5-day window) + 15% rest of November | All visitors (gating off for BFCM weekend) | T1 Welcome (with 10% code) + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + T4 SMS Welcome + T5 SMS Cart-Abandon #1 + T6 SMS Cart-Abandon #2 (10% code, BFCM-excluded) + T7 SMS Review Request paused + T8 Win-Back paused | **Active** — Q4 creator campaign peak: creators promote BFCM in their own channels via their affiliate links (Asset 03 C3 Affiliate contract + monthly payouts) | Loyalty members get 30% (5% extra on top of sitewide) during BFCM weekend |
| **December** | Holiday gifting + post-BFCM recovery | Default | Bundle pricing (curated gift sets, BOGO 30% on bundles) + 15% sitewide last-minute Dec 20–24 | Gift-givers (filtered as in Feb/May) + last-minute shoppers + Q4-cohort repeat buyers | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code, expires Dec 24) + T4 SMS Welcome + T5-T6 SMS Cart-Abandon pair + T7 SMS Review Request paused + T8 Win-Back paused | Wrap-up — send Asset 03 U4 Re-engagement to Q4 creators for Q1 follow-up; measure Q4 cohort LTV vs paid-social cohort (per Move #9.5 + Move #10) | Member-only Dec 26–31 post-holiday flash sale (40% extra for loyalty members, "thank you for the year" campaign) |

**Quick rules from the Default calendar** (used by the variant tables below):

1. **Q1 (Jan–Mar) = recovery + win-back.** The post-holiday traffic drop is real; the discount intensity is calibrated to recover Q4 cart-abandoners, not to acquire new customers.
2. **Q2 (Apr–Jun) = creator content + gifting.** The creator campaign runs the full quarter; April is kickoff, May–June is gifting (Mother's Day + Father's Day). Discount intensity is bundle-led (not sitewide).
3. **Q3 (Jul–Sep) = mid-year refresh.** July is the mid-year sitewide slot (counter-positioning against Q4 noise). August is back-to-school for relevant categories. September is intent-driven (no discount needed — September traffic converts on intent).
4. **Q4 (Oct–Dec) = peak.** October is the Q4 creator campaign kickoff. November is BFCM (the single biggest revenue slot). December is holiday gifting + post-BFCM recovery.
5. **Discount intensity is anchored to the Asset 02 "Discount frequency" column** (Default=Monthly / Luxury=Never or seasonal / Sustainable=Rare or member-only / Gen-Z=Daily or flash / B2B=Volume-based only). A brand with a different "Discount frequency" override slots into the variant tables below.

---

## Variant table A — Luxury voice brand (Discount frequency = Never / seasonal)

> **Apply this table when your brand matches 4+ of Luxury's 5 dimensions (AOV $300+, age 35–65, purchase driver = heritage/craftsmanship, brand personality = refined/quiet, discount frequency = never or seasonal).** The Luxury profile's defining constraint is Asset 02 Pitfall #5 (no bare "10% off" copy — use "complimentary 10% saving" / "introductory pricing"). Only the 4 seasonal-peak slots get a discount; the other 8 months are full-price (the brand's reputation depends on price integrity). For the 4 seasonal-peak slots, the discount framing in email + SMS body uses the Asset 02 Luxury voice rules ("complimentary 10% saving" not "10% off"); the *technical* Klaviyo code is the same `{{ coupon_code }}` variable.

| Month | Discount intensity (Luxury override) | Audience segment (Luxury override) | Asset 01 templates (Luxury override) | Voice note |
|---|---|---|---|---|
| January | None (full price; Luxury brand doesn't discount in recovery — recovery is the wrong time to break price integrity) | Active subscribers + loyalty VIP tier (filtered by `loyalty.tier == "vip" OR lifetime_orders >= 5`) | T1 Welcome (no discount code — "complimentary welcome gift with first order" framing) + T2 Cart-Abandon Soft (no discount) + T8 Win-Back (15% "introductory pricing" framing, loyalty-tier only) | Voice = Luxury (Formality 4, Humor 1, periods not exclamation marks); Asset 02 Pitfall #7 |
| February | Bundle pricing only (curated Valentine's gift sets, BOGO 25% on bundles — never sitewide) | Same as Default Feb + high-AOV buyers (filtered by `last_order_aov > 200`) | T1 Welcome + T2 Cart-Abandon Soft + T6 SMS Cart-Abandon #2 (10% code, "complimentary saving" voice framing) | Same as Default Feb |
| March | None | Same as Default Mar | T1 Welcome + T2 Cart-Abandon Soft (no discount) + T7 SMS Review Request | Voice = Luxury |
| April | None (Luxury brands don't run Earth Day promotions — sustainability is built into the brand, not a campaign) | Active subscribers + VIPs | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Q2 creator campaign Asset 03 U2 Gifted outreach (Luxury brands commission only gifted or paid partnerships with strict usage-rights scope per Asset 03 C1) | Voice = Luxury (in April Earth Day week, **do not** activate Sustainable voice — Luxury brands' sustainability is brand-inherent, not campaign-led) |
| May | Bundle pricing (curated Mother's Day gift sets — same as Default May but with "complimentary" framing) | Same as Default May + high-AOV buyers | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation ("complimentary 10% saving" voice) | Same as Default May |
| June | Bundle pricing (Father's Day) | Same as Default June + high-AOV buyers | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Luxury |
| July | None (Luxury brands don't run mid-year sitewide — would cannibalize full-price summer traffic) | Active subscribers + VIPs + browse-abandoners | T1 Welcome + T2 Cart-Abandon Soft (no discount) + T8 Win-Back (loyalty-tier only) | Voice = Luxury |
| August | None | Same as Default Aug | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Luxury |
| September | None (September is highest-converting month for Luxury — full-price converts on intent) | Same as Default Sep + high-AOV buyers | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Luxury |
| October | None (Luxury brands don't run early-bird; instead, VIP previews for loyalty members only, no discount) | Loyalty VIPs only (filtered by `loyalty.tier == "vip"`) | T1 Welcome + T2 Cart-Abandon Soft + VIP-only preview Klaviyo flow (no discount; "be the first to discover" framing) | Voice = Luxury; Q4 creator campaign runs per Asset 03 U2 Gifted (Luxury brands don't run Paid at scale per Asset 03 C1's stricter usage-rights scope) |
| November | **One seasonal slot only — 15% sitewide on BFCM weekend (Nov 24–28, 5-day window)** + "complimentary 15% saving" voice framing in body | All visitors (gating off for BFCM weekend); loyalty VIPs get 20% | T1 Welcome (with 10% "complimentary saving" code) + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation ("complimentary 10% saving") + T4-T6 SMS pair (BFCM-week "complimentary" framing) + T7-T8 paused | Voice = Luxury (this is the ONE seasonal sitewide slot; Asset 02 Pitfall #5 applies — never bare "15% off") |
| December | Bundle pricing (curated gift sets, BOGO 30% on bundles) + 10% "complimentary saving" last-minute Dec 20–24 | Same as Default Dec + gift-givers + high-AOV | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation ("complimentary 10% saving") + T4-T6 SMS pair | Voice = Luxury |

**Luxury calendar quick rules:**

- **Only 4 months have a discount** (Feb / May / Jun / Nov / Dec = bundle pricing in 4 months + 1 seasonal sitewide in November). The other 8 months are full-price.
- **Discount framing is "complimentary X% saving" / "introductory pricing" / "thank you gift" — never bare "X% off."**
- **Q4 creator campaign runs but Asset 03 C1 Paid contracts have a stricter usage-rights scope** (no whitelisting, no Spark Ads without per-creator negotiation, default = organic-only usage rights per Asset 03 C1's stricter-than-Default contract template).
- **BFCM weekend is the single biggest revenue slot** — but the *framing* in email + SMS body uses "complimentary" voice, not "off." A customer reading a Luxury-brand BFCM email should not see the word "off."

---

## Variant table B — Sustainable / eco voice brand (Discount frequency = Rare or member-only)

> **Apply this table when your brand matches 4+ of Sustainable's 5 dimensions (AOV $30–$150, age 28–55, purchase driver = sustainability + ethics, brand personality = warm + earnest, discount frequency = rare or member-only).** Sustainable brands' defining constraint is Asset 02 Pitfall #7 (sustainability is brand-inherent, not campaign-led — Earth Day promotions are donation-match framing, NOT customer discounts). Member-only slots are the standard (loyalty members get perks the general public doesn't), so the calendar's loyalty-gate column matters more than the discount-intensity column.

| Month | Discount intensity (Sustainable override) | Audience segment (Sustainable override) | Asset 01 templates (Sustainable override) | Voice note |
|---|---|---|---|---|
| January | None sitewide; loyalty-member flash sale Jan 21–22 (20% extra for members only) | Loyalty members + sustainability-aligned lookalikes (filtered by `viewed_sustainability_page == true`) | T1 Welcome (with 10% code, "thank you for joining" voice framing) + T2 Cart-Abandon Soft + T8 Win-Back (15% code, loyalty-tier only) | Voice = Sustainable (Formality 3, warm + earnest) |
| February | Bundle pricing only (curated sustainable gift sets, BOGO 25% on bundles) | Same as Default Feb + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T6 SMS Cart-Abandon #2 (10% code, "thank you" framing) | Voice = Sustainable |
| March | None | Same as Default Mar + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Sustainable |
| April | **Earth Day donation match only — NOT a customer discount** (Sustainable brands donate $X to environmental nonprofit for every order April 20–26, no customer-facing discount; this is the Asset 02 Pitfall #7 anti-pattern trap if you make it a 10% off sale) | Active subscribers + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Earth Day donation-match Klaviyo flow (no discount, "every order plants a tree" framing) | Voice = Sustainable in Earth Day week (the only month Sustainable voice is explicitly amplified, vs. blended in other months) |
| May | Bundle pricing (Mother's Day gift sets) | Same as Default May | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) | Voice = Sustainable |
| June | Bundle pricing (Father's Day) | Same as Default June | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Sustainable |
| July | None sitewide; loyalty-member 4-day flash sale July 8–11 | Loyalty members + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T8 Win-Back (loyalty-tier only) | Voice = Sustainable |
| August | None | Same as Default Aug | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Sustainable |
| September | None | Same as Default Sep + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request | Voice = Sustainable |
| October | Loyalty-member early access only (Oct 1–7, no discount; "be the first to discover" framing) | Loyalty VIPs only | T1 Welcome + T2 Cart-Abandon Soft + loyalty-VIP-only Klaviyo preview flow | Voice = Sustainable; Q4 creator campaign runs per Asset 03 (Sustainable brands commission only creators with verified sustainability credentials per Asset 03 Pitfall #10's HypeAuditor/Modash check) |
| November | **BFCM: 15% sitewide on BFCM weekend + donation match** (Sustainable brands layer donation match on top of sitewide during BFCM — this is the one time both happen, and Asset 02's "rare or member-only" constraint allows it because BFCM is structurally once-a-year) | All visitors (gating off for BFCM weekend) | T1 Welcome (with 10% code, "thank you" voice) + T2-T3 Cart-Abandon pair + T4-T6 SMS pair (BFCM-week voice) + T7-T8 paused | Voice = Sustainable |
| December | Bundle pricing (gift sets) + loyalty-member post-holiday flash sale Dec 26–31 | Same as Default Dec + loyalty VIPs + sustainability-aligned lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + T4-T6 SMS pair + loyalty-member flash sale flow | Voice = Sustainable |

**Sustainable calendar quick rules:**

- **Earth Day is a donation match, not a customer discount.** This is the Asset 02 Pitfall #7 anti-pattern trap.
- **Member-only flash sales are the standard discount slot** (Jan / Jul / Dec) — public sitewide discounts happen only on BFCM weekend.
- **BFCM is the only sitewide slot for the year**, and it layers donation match on top of the sitewide (which is the only Asset 02 exception to "rare or member-only" — BFCM is structurally once-a-year).
- **Q4 creator campaign runs but Asset 03 Pitfall #10's audience-fit check is mandatory** — Sustainable brands commission only creators with verified sustainability credentials (use HypeAuditor / Modash $99/mo per Asset 03).

---

## Variant table C — Gen-Z playful voice brand (Discount frequency = Daily drops / flash sales)

> **Apply this table when your brand matches 4+ of Gen-Z's 5 dimensions (AOV $20–$100, age 18–26, purchase driver = trendiness + community, brand personality = high-energy + playful, discount frequency = daily drops / flash sales).** Gen-Z brands' defining constraint is Asset 02 Pitfall #6 (don't force a meme in an email where no meme fits; reference a recent cultural moment only if you can do so within 24–48 hours of it landing; otherwise skip — the Gen-Z voice still works without memes). Gen-Z brands run more frequent promotions than any other profile (the calendar becomes a drops calendar, not a holiday calendar), but each individual promo is smaller (a 24-hour flash sale, not a 5-day BFCM sitewide).

| Month | Discount intensity (Gen-Z override) | Audience segment (Gen-Z override) | Asset 01 templates (Gen-Z override) | Voice note |
|---|---|---|---|---|
| January | 4 flash sales (every Wednesday, 24h, 15% off) | Active subscribers + Gen-Z lookalikes (filtered by `age < 27 OR viewed_genz_content == true`) + Discord/Telegram community members | T1 Welcome (with 10% "literally anything" code per Asset 02) + T2 Cart-Abandon Soft + T8 Win-Back (15% code) + flash-sale-only SMS flow | Voice = Gen-Z (lowercase, emoji optional, Asset 02 Pitfall #6 — no outdated memes) |
| February | 4 flash sales + Valentine's Day bundle drop | Same as Jan + gift-givers (Gen-Z edition: besties, not just romantic partners — bundle = "treat your bestie") | T1 Welcome + T2 Cart-Abandon Soft + T6 SMS Cart-Abandon #2 (10% code) + Valentine's Day drop flow | Voice = Gen-Z |
| March | 4 flash sales (steady cadence; March is launch-month for spring drops) | Same as Jan | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request (TikTok unboxing content) | Voice = Gen-Z |
| April | 4 flash sales + Earth Day drop (Sustainable-but-Gen-Z voice — "earth day but make it cute" framing) | Same as Jan + sustainability-aligned lookalikes (Gen-Z cares about sustainability but with a different voice — playful + earnest, not earnest-only) | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Earth Day drop flow | Voice = Gen-Z (Sustainable voice ONLY if brand profile is hybrid; default = Gen-Z throughout) |
| May | 4 flash sales + Mother's Day drop (Gen-Z brands' Mother's Day drop is often a "treat your mom" gift set with playful voice, not traditional Mother's Day marketing) | Same as Jan + gift-givers | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + Mother's Day drop flow | Voice = Gen-Z |
| June | 4 flash sales + Father's Day drop + end-of-Q2 creator content | Same as Jan | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + Father's Day drop flow | Voice = Gen-Z |
| July | 4 flash sales + 4-day Independence Day flash (July 4–7, 20% off — bigger than the weekly 15% because Gen-Z loves a holiday-coded drop) | Same as Jan | T1 Welcome + T2 Cart-Abandon Soft + T8 Win-Back (15% code) + July 4th flash flow | Voice = Gen-Z |
| August | 4 flash sales + back-to-school drop | Same as Jan + parents (filtered by purchasers with kid-coded product views) | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + BTS drop flow | Voice = Gen-Z |
| September | 4 flash sales (September is the Gen-Z fashion-week drop window — coordinate with NYFW/global fashion week calendar) | Same as Jan + fashion-week lookalikes | T1 Welcome + T2 Cart-Abandon Soft + T7 SMS Review Request + fashion-week drop flow | Voice = Gen-Z |
| October | 4 flash sales + pre-BFCM warmup drops | Same as Jan | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation + loyalty-member-early-access flow | Voice = Gen-Z; Q4 creator campaign runs per Asset 03 (Gen-Z brands commission TikTok-first creators at higher rates — Asset 03 C1 Paid contracts with stricter TikTok-usage-rights scope) |
| November | **BFCM-week = 7 daily flash sales (Nov 24–30, one per day, rotating SKUs at 20–30% off)** — Gen-Z brands don't run a 5-day sitewide; they run 7 daily drops | All visitors (gating off for BFCM week) | T1 Welcome (with 10% "literally anything" code) + T2-T3 Cart-Abandon pair + T4-T6 SMS pair (BFCM-week "drop" voice, NOT "sitewide sale" voice) + T7-T8 paused | Voice = Gen-Z (the BFCM framing should be "7 days of drops" not "Black Friday sitewide sale" — Gen-Z customers prefer the drops framing) |
| December | 4 flash sales + holiday gift drops + post-BFCM recovery drop | Same as Jan + gift-givers | T1 Welcome + T2 Cart-Abandon Soft + T3 Cart-Abandon Escalation (10% code) + holiday drop flows | Voice = Gen-Z |

**Gen-Z calendar quick rules:**

- **The calendar is a drops calendar, not a holiday calendar.** 4 weekly flash sales every month + 1 monthly themed drop (Mother's Day / Father's Day / BTS / etc.) + the BFCM week = 7 daily drops.
- **Discount framing is "drop" / "literally anything" — never "sitewide sale" or "X% off everything."**
- **Q4 creator campaign runs but Asset 03's TikTok-first filter applies** — Gen-Z brands commission TikTok creators at higher rates ($200–$500/creator per Asset 03's pricing) with stricter TikTok-usage-rights scope in the Asset 03 C1 contract.
- **BFCM is 7 daily drops, not a 5-day sitewide.** The framing difference matters — Gen-Z customers expect the drop cadence.
- **Meme references are 24–48 hour windows only** (Asset 02 Pitfall #6); outdated memes are worse than no meme.

---

## Variant table D — B2B / professional voice brand (Discount frequency = Volume-based only)

> **Apply this table when your brand matches 4+ of B2B's 5 dimensions (AOV $100+, age 28–55, purchase driver = function + ROI, brand personality = precise + professional, discount frequency = volume-based only).** B2B brands' defining constraint is Asset 02 Pitfall #3 (no emoji in transactional SMS + limited emoji in long-form email; B2B voice forbids the playful touch). B2B brands ignore consumer seasonality almost entirely — the calendar is a quarterly-volume-cadence calendar, not a 12-month promotional calendar.

| Quarter | Discount intensity (B2B override) | Audience segment (B2B override) | Asset 01 templates (B2B override) | Voice note |
|---|---|---|---|---|
| **Q1 (Jan–Mar)** | Volume discount only (10% off orders $500+, 15% off orders $2k+, 20% off orders $5k+) | Business buyers (filtered by `address.is_business == true OR purchase_frequency >= 3 OR has_tax_id == true`) | T1 Welcome (with volume-pricing framing) + T2 Cart-Abandon Soft (no discount — B2B carts are quote-based, not abandoned) + B2B-quarterly-review Klaviyo flow | Voice = B2B (Formality 5, Humor 1, no emoji) |
| **Q2 (Apr–Jun)** | Volume discount (same Q1 tiers) + Q2-end renewal discount (5% off contract renewals June 15–30) | Same as Q1 + Q1-renewal-window buyers | T1 Welcome + T2 Cart-Abandon Soft + B2B-Q2-renewal Klaviyo flow | Voice = B2B |
| **Q3 (Jul–Sep)** | Volume discount (same Q1 tiers) + back-to-school / back-to-office bulk discount August 1–31 (extra 5% on bulk orders) | Same as Q1 + back-to-office buyers | T1 Welcome + T2 Cart-Abandon Soft + B2B-Q3-bulk Klaviyo flow | Voice = B2B |
| **Q4 (Oct–Dec)** | Volume discount (same Q1 tiers) + budget-cycle discount December 1–15 (5% off orders placed before budget-year-end) | Same as Q1 + budget-cycle buyers | T1 Welcome + T2 Cart-Abandon Soft + B2B-Q4-budget-cycle Klaviyo flow | Voice = B2B |

**B2B calendar quick rules:**

- **The calendar is a quarterly-cadence calendar, not a 12-month promotional calendar.** Discount tiers are volume-based, not seasonal.
- **T8 Win-Back doesn't apply** — B2B customers don't "go inactive" the way DTC customers do; they churn on contract renewal, not on email-engagement.
- **T3 Cart-Abandon Escalation doesn't apply** — B2B carts are quote-based, often with sales-rep follow-up, not email-cart-abandon.
- **The Asset 01 templates fire but the body voice is B2B** (no emoji in transactional SMS, no exclamation marks in long-form email, "we" but spelled-out "we" on first reference per Asset 02 Profile 5).
- **UGC campaign is rare** — B2B brands commission case-study creators (industry analysts, not lifestyle creators); Asset 03's U2/U1 outreach is irrelevant, but Asset 03's C2 Gifted contract template can be repurposed for case-study commissions.

---

## Common pitfalls (with Fix lines)

1. **Running a discount every month** — burns margin + trains customers to wait for the next sale instead of buying at full price. **Fix:** match the discount intensity to your Asset 02 voice profile (Default=Monthly / Luxury=Never or seasonal / Sustainable=Rare or member-only / Gen-Z=Daily / B2B=Volume-based only). A Default brand at 15% sitewide every month trains customers to wait for the 15%; a Default brand at 15% in only 3 months (Jan, Jul, Nov) keeps the other 9 months at full price.
2. **Wrong voice for the month** — Luxury brand running Default voice in November BFCM ("10% off!" with exclamation marks) cannibalizes the brand's price integrity. **Fix:** the Variant table A's November row explicitly says "complimentary 15% saving" — follow the Asset 02 voice profile's discount framing rules verbatim.
3. **Overlapping promos** — running a 15% sitewide in July + a member-only flash sale July 8–11 + a Father's Day bundle July 14 + a back-to-school promo July 21 = promo-fatigue, customers stop paying attention. **Fix:** the calendar has ONE discount slot per month for Default brands (sitewide OR bundle OR flash, not multiple). The exception is BFCM (Nov) and Q4 peak (Oct + Nov + Dec = 3 months of layered activity).
4. **Missing the welcome-discount cap** — T1 Welcome fires a 10% code on every signup, but the calendar has months where the welcome discount competes with the seasonal discount (Jan 15% sitewide + 10% welcome code = customer picks the bigger one, but your discount-system logic picks the wrong one). **Fix:** the welcome discount is always the SMALLER of the two (10% if seasonal is 15%+); set the Klaviyo flow's `discount_priority` to `seasonal > welcome`.
5. **Loyalty-member-only gate skip** — Sustainable brand's member-only flash sales (Jan / Jul / Dec) accidentally include non-members because the Klaviyo segment filter is wrong. **Fix:** the segment filter is `loyalty.tier IN ("member", "vip") AND loyalty.join_date <= 30_days_ago` — exclude new signups who joined to chase the flash sale.
6. **Q4 creator campaign overlap with BFCM** — sending Asset 03 U1 Paid outreach in October for November BFCM content + running November's sitewide at the same time = creator content goes live during BFCM and gets overshadowed by the sitewide. **Fix:** the Q4 creator campaign kickoff is in **September** (sending outreach) for **late-October** content launch (before BFCM, not during). Asset 03's October month is the campaign peak, not the campaign kickoff.
7. **BFCM-week infrastructure** — the calendar's Nov 24–28 sitewide slot requires site-speed + cart-capacity + Klaviyo-flow-capacity that the calendar's other 11 months don't. **Fix:** run a BFCM-week infrastructure test on Nov 17 (1 week before): load-test the site, verify Klaviyo flow handles 5x the normal send volume, verify Triple Whale (Move #6) is capturing every conversion event (the Move #6.5 attribution-quality audit gates pass).
8. **No promo in Q1** — some brands over-correct on the Asset 02 voice profile's "Discount frequency = Never or seasonal" rule (Luxury) or "Rare or member-only" rule (Sustainable) and skip Q1 entirely. **Fix:** Q1 has 1 promo slot (January) for **every** voice profile — even Luxury and Sustainable brands run a January slot, just at lower intensity (Luxury = bundle only, Sustainable = member-only). Skipping Q1 entirely trains customers to disengage in January, which compounds into lower February traffic.
9. **No post-BFCM recovery** — the calendar's December is "gift sets + last-minute Dec 20–24 + loyalty-member Dec 26–31" but a brand that runs BFCM without a December recovery slot ends Q4 with cart-abandoners who didn't convert during the sitewide. **Fix:** Dec 26–31 loyalty-member flash sale captures the Q4-cohort repeat buyers (the 30–60 day repurchase window opens in late December for BFCM buyers); without this slot, the BFCM cohort's repurchase rate is 30–40% lower at 60d.
10. **International holiday drift** — the calendar's US-anchored rows (BFCM / Memorial Day / July 4th / Labor Day / Thanksgiving) don't apply to EU/UK/AU operators. **Fix:** EU/UK operators shift the calendar's November BFCM slot to a "Singles' Day + Black Week" Nov 11–28 window (Singles' Day is huge in EU, especially DE/NL/UK); AU operators shift the December slot to a "Boxing Day Dec 26" slot (Australia's biggest sale day). The Q1 / Q2 / Q3 / Q4 macro shape stays the same; only the named holiday rows shift by 1–4 weeks.

---

## Verification gates (after adapting the calendar)

- **Gate A: Calendar coverage.** All 12 months have a defined voice profile, discount intensity, audience segment, Asset 01 template stack, UGC campaign status, and loyalty gate. No month is blank. **Pass:** `grep -c "^| \*\*\(January\|February\|...\|December\)\*\*" assets/04-promo-calendar.md` returns ≥12 matches.
- **Gate B: Voice alignment.** The calendar's voice profile for each month matches the Asset 02 decision matrix's "Discount frequency" column for the brand's profile (Default=Monthly / Luxury=Never or seasonal / Sustainable=Rare or member-only / Gen-Z=Daily / B2B=Volume-based only). **Pass:** for each row, the discount intensity in the calendar matches the Asset 02 row's column value.
- **Gate C: Template wiring.** Every Asset 01 template (T1–T8) is referenced in at least 1 month. **Pass:** `grep -oE "T[1-8]" assets/04-promo-calendar.md | sort -u` returns all 8 templates.
- **Gate D: UGC month alignment.** The Q2 (Apr–Jun) + Q4 (Oct–Dec) creator-campaign months align with Asset 03's recommended cadence. **Pass:** the Asset 03 outreach emails (U1–U5) are referenced in at least 1 of Q2 + at least 1 of Q4 months.
- **Gate E: Loyalty gate.** Every variant table (Default / Luxury / Sustainable / Gen-Z / B2B) has at least 1 loyalty-member-only slot per quarter. **Pass:** for each variant table, the "Loyalty gate" column has ≥1 non-empty entry per quarter.

---

## Verification recipe (one command to run all 5 gates)

```bash
# Gate A: 12-month coverage
grep -cE "^\| \*\*\b(January|February|March|April|May|June|July|August|September|October|November|December)\b\*\*" assets/04-promo-calendar.md
# Expect: ≥12 (one row per month in the Default table)

# Gate B: Voice alignment — verify Discount frequency column matches Asset 02
grep -E "Discount frequency\?" assets/02-brand-voice.md
# Expect: a single table row with Default=Monthly, Luxury=Never/seasonal, Sustainable=Rare/member-only, Gen-Z=Daily/flash, B2B=Volume-based only

# Gate C: All 8 Asset 01 templates referenced
grep -oE "T[1-8]" assets/04-promo-calendar.md | sort -u
# Expect: T1 T2 T3 T4 T5 T6 T7 T8 (all 8)

# Gate D: UGC months align with Asset 03 (Q2 + Q4)
grep -oE "U[1-5]" assets/04-promo-calendar.md | sort -u
# Expect: U1 U2 U4 U5 (Asset 03's 5 outreach emails, of which U1/U2/U4 fire in calendar months; U3 affiliate + U5 declining politely are also referenced but less frequently)

# Gate E: Variant table coverage
grep -cE "^\| \*\*(January|...|December)\*\*.*\|.*\|.*\|.*\|.*Voice note" assets/04-promo-calendar.md
# Expect: ≥24 (Default 12 + Luxury 12, the two most-referenced variant tables)
```

---

## Related

**Sibling assets that this builds on (compounds the value of all 3 prior assets):**

- `assets/01-copy-templates.md` — the 8 paste-ready Klaviyo + Postscript templates that this calendar maps to each month. Every month's "Asset 01 templates that fire" column references real T1–T8 templates (Gate C verifies all 8 fire across the year).
- `assets/02-brand-voice.md` — the 5 voice profiles that this calendar maps to each month per the Asset 02 "Discount frequency" column. The 4 variant tables (Luxury / Sustainable / Gen-Z / B2B) use Asset 02's Pitfall #5, #6, #7 voice rules for discount framing.
- `assets/03-ugc-brief.md` — the 5 outreach emails + 3 contracts that fire in Q2 + Q4 creator-campaign months. The October column explicitly sends 4–6 Asset 03 U1 Paid + U4 Re-engagement emails; the April column sends 4–6 Asset 03 U2 Gifted emails; the June column sends Asset 03 U5 Declining politely to non-fit creators.

**Playbooks that this calendar maps to (per-month playbook references):**

- `playbooks/01-abandoned-cart-flow-klaviyo.md` — the cart-abandon flow (Templates 2 + 3) is the most-firing Klaviyo flow across the 12 months; the calendar's T2/T3 column rows reference this playbook for the voice + timing of each month's cart-abandon.
- `playbooks/04-welcome-series-klaviyo.md` — the welcome series (Template 1) fires every signup; the calendar's T1 column rows reference this playbook for the welcome-discount amount (the "missing the welcome-discount cap" Pitfall #4 maps to Playbook #4's discount-priority logic).
- `playbooks/06-sms-welcome-and-cart-abandon.md` — the SMS templates (T4–T7) fire on the calendar's flash-sale + BFCM + holiday-gifting months (Jan / Feb / May / Jun / Jul / Nov / Dec).
- `playbooks/07-loyalty-program-smile.md` — the loyalty program's member-only slots (Jan / Jul / Dec for Default + Sustainable; Oct for Luxury + B2B) reference this playbook for the Smile.io tier-gate logic.

**Research that informed this calendar:**

- `research/00-ecommerce-ops-landscape.md` — the DTC seasonality data that anchored the Q1-low / Q2-creator / Q3-mid / Q4-peak macro shape (the "September is highest-converting for many DTC categories" claim comes from this doc).
- `research/02-top-10-leverage-moves.md` — Move #1 (cart-abandon) + Move #4 (welcome) + Move #7 (SMS) + Move #8 (loyalty) all reference this calendar as their per-month playbook.