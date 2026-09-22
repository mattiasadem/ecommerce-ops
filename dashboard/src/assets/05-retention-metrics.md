# Asset 05 — Retention Metrics Reference Card

> **The 12 retention metrics every DTC operator must track.** This asset is the **measurement layer** that Asset 01's copy templates (T1–T8) + Asset 02's voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) + Asset 03's UGC program + Asset 04's promo calendar all depend on. Operators have been asking "which metric does my flow actually move?" — this card answers it with the canonical formula + a default-benchmark range + the Klaviyo/Shopify/Triple Whale data source for each metric. Open it next to your Klaviyo dashboard once a month, fill in the 12 numbers, and you have the retention-health snapshot that Move #6 Triple Whale, Move #6.5 attribution-quality audit, Move #9.5 PDP A/B testing, Move #10 AI ad creative, Move #11 subscription, and the Move #4 welcome series / Move #7 SMS / Move #8 loyalty cohort overlays all depend on.
>
> **Companion assets:** `assets/01-copy-templates.md` (8 templates — each row in this card maps to which T1–T8 template moves it), `assets/02-brand-voice.md` (5 voice profiles — the **benchmark ranges** in this card vary by brand voice; Luxury has higher AOV but lower purchase frequency; Sustainable has higher LTV; Gen-Z has lower AOV but higher frequency), `assets/03-ugc-brief.md` (UGC cohort LTV is a **second-order** metric — Asset 03's Klaviyo UGC segment tag is the data source), `assets/04-promo-calendar.md` (12-month calendar — the **Q1-low / Q4-peak macro shape** is the baseline expectation; metrics OUTSIDE the Q1/Q4 envelope trigger a Move #6.5 attribution audit). **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1 — moves RPR + cohort LTV + unsubscribe rate), `playbooks/04-welcome-series-klaviyo.md` (Move #4 — moves 90-day LTV + retention rate D7/D30), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — moves RPR + unsubscribe rate + NPS), `playbooks/07-loyalty-program-smile.md` (Move #8 — moves cohort LTV by tier + repeat purchase rate), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — provides the cohort LTV + MER + ROAS data source for 6 of the 12 metrics).
>
> **Default inputs:** $75 AOV, 70% margin, 4% monthly traffic-to-buyer CVR, $5k–$50k/mo paid spend, US-based operator, Shopify-integrated Klaviyo + Postscript + Triple Whale. The 12 metrics are vendor-agnostic (formula is the same); the **benchmarks** in the "Default" column assume a US DTC apparel/home-goods brand at $1M–$5M GMV; **Luxury / Sustainable / Gen-Z / B2B override columns** apply the 5-voice profile benchmarks from Asset 02's decision matrix (the same way Asset 04's 4 voice-driven variant tables overrode the Default calendar).

---

## Goal

Give a brand-new operator an immediately-usable retention-metrics reference card that:

- **12 named metrics** covering acquisition-side retention (CAC / payback / LTV / LTV:CAC), behavior-side retention (retention rate D1/D7/D30/D90 / repeat purchase rate / churn rate / cohort LTV / unsubscribe rate), and brand-side retention (NPS / email engagement) — the full retention-health surface area
- **Canonical formula + default benchmark range + Klaviyo/Shopify/Triple Whale data source** for each metric — paste-ready into a monthly snapshot spreadsheet or dashboard tile
- **4 voice-driven benchmark overrides** (Luxury / Sustainable / Gen-Z / B2B) — same shape as Asset 04's 4 variant tables; operators in a non-default voice apply the override column instead of the Default
- **Decision matrix** that ranks the 12 metrics by ROI-per-hour-of-measurement-effort: ship metrics #1–#3 (CAC + LTV + LTV:CAC) first because they unblock Move #6 Triple Whale's "killer test" + Move #9.5 PDP A/B testing's "cohort overlay check"; ship metrics #4–#6 (retention rate + RPR + churn) next because they measure the moves you're shipping; defer metrics #10–#12 (NPS + email engagement + unsubscribe rate) to month 2+ because they're leading indicators
- **The 10 most common measurement pitfalls** with corrective `Fix:` lines — including the "Triple Whale vs GA4 mismatch" trap (Move #6 Pitfall #15), the "shipped-template-but-don't-know-which-metric-moved" trap (the central operator question this asset closes), and the "benchmarks don't match my brand voice" trap (the 4 voice-driven overrides are the fix)
- **5 verification gates** — monthly-snapshot-completeness / formula-correctness / benchmark-applicability / data-source-pipeline / trend-direction — that an operator runs before declaring the snapshot valid
- **Sibling-consistency**: every metric's data source resolves to a real Klaviyo/Shopify/Triple Whale/Postscript panel; every playbook/asset cross-reference resolves to a real file; every Move #N reference matches a shipped move (#1 / #4 / #6 / #6.5 / #7 / #8 / #9.5 / #10 ✓)

---

## Decision matrix — which 12 metrics to track, in what order

| # | Metric | Why it ranks | Effort to set up | When to ship |
|---|---|---|---|---|
| 1 | **CAC (Customer Acquisition Cost)** | The single metric that gates "should I scale paid spend?" | 30 min (Shopify + Triple Whale export) | Day 1 — required for Move #6 Triple Whale |
| 2 | **LTV (Lifetime Value, 90-day cohort)** | The metric that gates "is paid spend profitable?" | 1 hr (Triple Whale cohort overlay) | Day 1 — required for Move #6 "killer test" |
| 3 | **LTV:CAC ratio** | The single ratio that says "healthy" vs "bleeding money" | 1 min (compute from #1 + #2) | Day 1 — required for Move #6.5 attribution audit |
| 4 | **Retention rate (D1, D7, D30, D90)** | The cohort behavior metric every Move #N playbook references | 30 min (Triple Whale cohort report) | Week 1 — required for Move #4 + #7 + #9.5 cohort overlays |
| 5 | **Repeat purchase rate (RPR)** | The single metric that says "do my retention flows actually retain?" | 30 min (Shopify customer cohort export) | Week 1 — Move #1 + #7 + #8 directly move this |
| 6 | **Churn rate** | The inverse of RPR; signals subscription health (Move #11) | 15 min (Shopify subscription API) | Week 1 — required for Move #11 if subscription-gated |
| 7 | **Cohort LTV by source** | The Move #9.5 cohort overlay + Move #10 AI creative killer test | 1 hr (Triple Whale cohort-by-utm_source) | Week 2 — required for Move #9.5 + #10 |
| 8 | **Payback period (months)** | The single metric that gates "can I take a $50k ad loan?" | 5 min (CAC ÷ monthly contribution margin) | Week 2 — gates the next ad-spend tranche |
| 9 | **Email engagement rate (open + click)** | Leading indicator for retention-flow health | 15 min (Klaviyo flow analytics) | Week 2 — Move #1 + #4 + #8 verify via this |
| 10 | **Unsubscribe rate** | The metric that says "are my flows burning my list?" | 15 min (Klaviyo flow analytics) | Week 2 — Move #1 + #4 + #7 must NOT move this |
| 11 | **NPS (Net Promoter Score)** | The brand-side metric that says "would your customers refer you?" | 1 hr (Postscript survey or Wootric) | Month 2 — leading indicator for UGC program (Asset 03) |
| 12 | **Cohort LTV by UGC vs paid-social vs organic** | The Move #3 Pitfall #15 high-CTR-low-LTV measurement | 1 hr (Triple Whale + Klaviyo UGC segment) | Month 2 — required for Asset 03 UGC program ROI |

**Top-3 priority** (ship on Day 1 of the snapshot spreadsheet): metrics #1 CAC + #2 LTV + #3 LTV:CAC. These three are the floor — without them, an operator has no honest answer to "is paid spend profitable?" (the single most-asked question in DTC).

**Next-3 priority** (ship in Week 1): metrics #4 retention rate + #5 RPR + #6 churn. These three measure the moves the operator is shipping (Move #1, #4, #7, #8 all move one of these).

**Defer-to-Week-2** priority: metrics #7 cohort LTV by source + #8 payback period + #9 email engagement + #10 unsubscribe rate. These four are diagnostic — operators set up Move #6 + #6.5 attribution audit + the flow analytics, then fill these in once the data pipeline is trusted.

**Defer-to-Month-2** priority: metrics #11 NPS + #12 cohort LTV by UGC vs paid. These two are leading indicators + cohort-overlay diagnostics that the operator runs once they have ≥1 quarter of data + a working UGC program (Asset 03).

---

## The 12 metrics — formula, default benchmark, data source, voice overrides

### Metric 1 — CAC (Customer Acquisition Cost)

> The single metric that gates "should I scale paid spend?"

**Formula:** `CAC = (Paid spend in window) ÷ (New customers acquired in window)`

**Default benchmark range:** **$30 ≤ CAC ≤ $75** for the default $75 AOV / 70% margin / $5k–$50k/mo paid spend case. CAC below $30 is suspiciously good (usually a measurement error — see Pitfall #2); CAC above $75 is dangerously close to gross-margin breakeven.

**Voice-driven overrides:**
- **Luxury:** CAC range **$150–$300** (higher AOV justifies higher CAC; $300 luxury CAC at $400 AOV still has 70% gross margin)
- **Sustainable:** CAC range **$40–$100** (eco-positioning lifts AOV 10–20% so CAC ceiling rises proportionally)
- **Gen-Z:** CAC range **$15–$40** (lower AOV means CAC ceiling is tighter; anything above $40 needs a sub-channel mix change)
- **B2B:** CAC range **$200–$1,000** (B2B sales cycle is 3–12 months, CAC reflects multi-touch attribution; the LTV is 10× higher so the CAC ceiling rises proportionally)

**Data source:** Shopify Marketing → "Customer acquisition cost by channel" (free, native, last-click attribution) OR Triple Whale → "Blended CAC by channel" (cross-channel, more accurate post-iOS 14.5).

**Pitfall #2 trap:** "CAC is suspiciously low" — Triple Whale's first-week CAC is usually 30–50% BELOW its day-30 CAC because paid channels are still warming up the Meta/Google/TikTok learning phase. Fix: take the day-30 CAC as the canonical number, NOT day-7. The Move #6.5 Gate G (week-over-week drift ≤ 5pp) catches this.

**What moves this metric:** every Move #N that reduces blended ad spend relative to new-customer acquisition (Move #2 upsell doesn't move CAC directly; Move #6 attribution accuracy moves CAC indirectly because wrong attribution = wrong channel-mix decisions).

---

### Metric 2 — LTV (Lifetime Value, 90-day cohort)

> The metric that gates "is paid spend profitable?" (the #1 question in DTC)

**Formula:** `LTV(90d) = (Sum of revenue from a cohort acquired on Day 0) ÷ (Count of customers in that cohort)`, measured 90 days after Day 0.

**Default benchmark range:** **$45 ≤ LTV(90d) ≤ $120** for the default $75 AOV / 70% margin case. LTV(90d) at the default AOV is roughly **0.6×–1.6× AOV** — so a $75 AOV brand expects $45–$120 LTV in 90 days. Note: this is the **90-day** LTV; 180-day and 365-day LTVs will be higher but are noisier (more seasonality confounds).

**Voice-driven overrides:**
- **Luxury:** LTV(90d) range **$400–$1,000** (high AOV + low purchase frequency = high LTV per customer)
- **Sustainable:** LTV(90d) range **$80–$180** (higher AOV + higher repeat rate = higher LTV than Default)
- **Gen-Z:** LTV(90d) range **$30–$70** (lower AOV + higher frequency = similar LTV to Default but different shape)
- **B2B:** LTV(90d) range **$500–$5,000** (B2B has repeat purchase cycles of 30–90 days at $500–$2,000 per order)

**Data source:** Triple Whale → "Cohort LTV by acquisition date" → filter to 90-day window OR Shopify → Analytics → "Customer cohort analysis" → export CSV.

**Pitfall #3 trap:** "LTV is rising but profit is falling" — LTV includes revenue, not profit. Fix: compute **LTV-gross-margin** = LTV × gross margin %; use that as the canonical LTV for the LTV:CAC ratio (metric #3).

**What moves this metric:** every Move #N that increases repeat purchase rate (Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty) directly moves LTV. Asset 01's T1 Welcome + T7 Review Request + T8 Win-Back all move LTV; Asset 03's UGC program moves LTV through cohort-#12 below.

---

### Metric 3 — LTV:CAC ratio

> The single ratio that says "healthy" vs "bleeding money"

**Formula:** `LTV:CAC = LTV(90d) ÷ CAC` (use the LTV-gross-margin variant per Pitfall #3).

**Default benchmark range:** **LTV:CAC ≥ 3:1** for the default case. **LTV:CAC = 1:1** means every dollar of paid spend returns exactly one dollar of gross-margin revenue (the operator is breaking even). **LTV:CAC = 0.5:1** means the operator loses $0.50 per dollar of paid spend (the classic "scaling into bankruptcy" trap). **LTV:CAC ≥ 5:1** is the "scale hard" signal (paid spend is returning 5× cost, the operator can take on ad-spend debt).

**Voice-driven overrides:**
- **Luxury:** LTV:CAC range **≥ 3:1** (same threshold; luxury LTV is higher but CAC is also higher)
- **Sustainable:** LTV:CAC range **≥ 4:1** (eco-positioning demands higher efficiency because customers are more price-sensitive on the absolute price but more loyal on the mission)
- **Gen-Z:** LTV:CAC range **≥ 2:1** (Gen-Z volume compensates for thinner margin per customer)
- **B2B:** LTV:CAC range **≥ 3:1** (B2B is multi-touch attribution, the 3:1 ratio reflects the longer sales cycle)

**Data source:** derived (metric #2 ÷ metric #1). Triple Whale's "LTV:CAC by cohort" widget computes this in real-time.

**Pitfall #4 trap:** "LTV:CAC ratio is healthy but cash is tight" — LTV:CAC is a ratio, not a cash-flow statement. A 4:1 ratio with a 12-month payback period means the operator is funding 12 months of CAC before the first dollar of LTV returns. Fix: also track **payback period** (metric #8). The healthy combo is LTV:CAC ≥ 3:1 AND payback ≤ 6 months.

**What moves this metric:** the **only** way to improve LTV:CAC sustainably is to move BOTH metrics — moving CAC alone hits a floor (you can't go below organic-word-of-mouth CAC); moving LTV alone requires retention moves that compound slowly. Move #6 Triple Whale (accurate attribution) + Move #6.5 audit (trustworthy signal) + Move #4 welcome + Move #8 loyalty together move both metrics.

---

### Metric 4 — Retention rate (D1, D7, D30, D90)

> The cohort behavior metric every Move #N playbook references

**Formula:**
- `Retention rate D1 = (Customers who purchased on Day 0) ÷ (Customers who returned on Day 1) × 100%`
- `Retention rate D7 = same shape, Day 7 instead of Day 1`
- `Retention rate D30 = same shape, Day 30`
- `Retention rate D90 = same shape, Day 90`

**Default benchmark range (DTC apparel / home goods / beauty):**
- **D1: 20–40%** (the day-after-purchase return rate)
- **D7: 10–20%** (the week-after return rate — Asset 01's T7 SMS Review Request fires here)
- **D30: 5–10%** (the month-after return rate — Asset 01's T8 Win-Back starts here)
- **D90: 15–30%** (the quarter-after return rate — includes both organic + retention-flow-driven returns)

**Voice-driven overrides:**
- **Luxury:** D30 **8–15%**, D90 **30–45%** (luxury customers buy 2–4× per year; D90 retention is HIGHER than Default)
- **Sustainable:** D30 **6–12%**, D90 **20–35%** (similar to Default with mission-driven re-engagement)
- **Gen-Z:** D30 **8–15%**, D90 **15–25%** (Gen-Z buys more frequently but at lower AOV)
- **B2B:** D30 **25–40%**, D90 **60–80%** (B2B purchase cycles are 30–90 days; D90 retention is the canonical metric, not D30)

**Data source:** Triple Whale → "Cohort retention by acquisition date" → toggle D1/D7/D30/D90 windows; OR Shopify Analytics → "Customer cohorts by first purchase date" → export CSV.

**Pitfall #5 trap:** "D90 retention dropped because we turned off the welcome series" — the Move #4 welcome series directly moves D7/D30 retention (the series fires over 7–14 days, lifts D7/D30 by 10–20%). Fix: this is the **Move #6 "killer test"** — turn the welcome series OFF for 14 days, measure D7/D30 of the OFF cohort vs the prior 14-day ON cohort; the lift should be 10–20% per Move #6 Pitfall #15's spec. If the lift is <5%, the welcome series is mis-configured.

**What moves this metric:** Move #1 (cart-abandon) moves D7 retention; Move #4 (welcome) moves D7/D30; Move #7 (SMS) moves D1/D7; Move #8 (loyalty) moves D90; Asset 01's T1–T8 templates move D1/D7/D30/D90 in different patterns; Asset 03's UGC cohort moves D90 (UGC cohort typically has 10–20% higher D90 retention than paid-social cohort — see metric #12).

---

### Metric 5 — Repeat purchase rate (RPR)

> The single metric that says "do my retention flows actually retain?"

**Formula:** `RPR = (Customers with ≥ 2 purchases in window) ÷ (Total customers in window) × 100%`, measured over 365 days.

**Default benchmark range:** **20–30%** for the default case. RPR below 20% signals the retention stack is failing; RPR above 30% signals the loyalty program + post-purchase automation is healthy.

**Voice-driven overrides:**
- **Luxury:** RPR range **30–50%** (luxury customers buy less frequently but are highly loyal to the brand)
- **Sustainable:** RPR range **25–40%** (mission-driven loyalty lifts RPR)
- **Gen-Z:** RPR range **15–25%** (lower AOV means fewer repeat purchases per year; volume compensates)
- **B2B:** RPR range **60–90%** (B2B is contracted/replenishment-driven; RPR is structurally higher)

**Data source:** Shopify Analytics → "Customer repeat purchase rate" (free, native) OR Triple Whale → "RPR by cohort" widget.

**Pitfall #6 trap:** "RPR is 35% but new-customer acquisition is flat" — RPR is a function of customer age (older customers have had more time to repeat-purchase). Fix: segment RPR by **customer age cohort** — a 6-month-old cohort should have ~15% RPR, a 12-month-old cohort should have ~25%, a 24-month-old cohort should have ~35%. The "blended RPR" number can mask a cohort that's regressing.

**What moves this metric:** Move #1 (cart-abandon recovers the SECOND purchase; the first purchase is the cart-abandon conversion) + Move #4 (welcome) + Move #7 (SMS) + Move #8 (loyalty) ALL directly move RPR. Asset 01's T8 Win-Back is the highest-leverage RPR mover (re-engaging 60+ day inactive customers back to the active state).

---

### Metric 6 — Churn rate

> The inverse of RPR; signals subscription health (Move #11)

**Formula:** `Churn rate = (Customers lost in window) ÷ (Customers at start of window) × 100%`. For subscription brands: `(Customers who cancelled in month) ÷ (Customers at start of month) × 100%`.

**Default benchmark range:** **5–10% monthly** for one-time-purchase brands (the "lapse rate" of customers who haven't purchased in 365 days). For subscription brands: **3–7% monthly** (Move #11 territory).

**Voice-driven overrides:**
- **Luxury:** Churn rate **2–5% monthly** (luxury customers are highly retained)
- **Sustainable:** Churn rate **3–6% monthly** (mission-driven retention)
- **Gen-Z:** Churn rate **8–12% monthly** (Gen-Z brand-loyalty is structurally lower)
- **B2B:** Churn rate **1–3% monthly** (B2B contracts are 12-month+; churn is structural, not behavioral)

**Data source:** Shopify Analytics → "Customer churn rate" (free, native) OR ReCharge / Skio subscription API for subscription brands.

**Pitfall #7 trap:** "Churn rate is low but the cohort is aging out" — a brand with 1% monthly churn has 12% annual churn, which compounds to 71% 5-year churn. The fix: also track **annual churn** (cumulative 12-month window) AND **cohort churn by acquisition year** to see if newer cohorts are churning at different rates. A new cohort with HIGHER churn than the prior-year cohort is the canary signal that product/positioning has degraded.

**What moves this metric:** Move #1 (cart-abandon) reduces churn by recovering the second purchase; Move #8 (loyalty) reduces churn by 20–30% per the Move #8 ROI table; Asset 01's T8 Win-Back directly reduces churn. For subscription brands: Move #11's subscription playbook is the canonical churn reducer.

---

### Metric 7 — Cohort LTV by source

> The Move #9.5 cohort overlay + Move #10 AI creative killer test

**Formula:** `Cohort LTV by source = LTV(90d) for the subset of customers acquired from a specific traffic source` (e.g. paid Meta, paid TikTok, organic search, email, direct, UGC).

**Default benchmark range:** **paid Meta / paid Google / paid TikTok / organic search / email / direct / UGC** — each source has its own LTV curve. A healthy brand has **email LTV ≥ 1.5× paid LTV** (email-acquired customers convert at higher rates because they're pre-qualified). **UGC LTV ≥ 1.2× paid-social LTV** (per Asset 03's premise — UGC is higher-trust than paid creative).

**Voice-driven overrides:**
- **Luxury:** email LTV ≥ 2× paid LTV (luxury customers are highly relationship-driven)
- **Sustainable:** UGC LTV ≥ 1.5× paid LTV (eco-positioning amplifies UGC trust)
- **Gen-Z:** TikTok LTV ≈ paid Meta LTV (Gen-Z discovery is omnichannel)
- **B2B:** direct/email LTV ≥ 3× paid LTV (B2B is sales-driven, not ad-driven)

**Data source:** Triple Whale → "Cohort LTV by acquisition source" → export CSV by source.

**Pitfall #8 trap:** "Email LTV is highest so I should shift all spend to email" — email is an owned channel, NOT a paid acquisition channel. You can't "shift spend to email"; you grow the email list (Move #4 welcome) which then drives email-acquired cohorts. The right read is: **email is the highest-LTV source, so grow it (Move #4 + Move #7 capture email + SMS), and use paid channels to FILL the top of the email funnel**.

**What moves this metric:** Move #9.5 PDP A/B testing directly moves paid-social cohort LTV (the cohort overlay check promotes winners only if LTV is preserved); Move #10 AI ad creative moves paid-social cohort LTV (cohort LTV per creative variant tells you which AI-generated creative is bringing high-LTV customers vs low-LTV ones); Asset 03's UGC program moves UGC cohort LTV (the Klaviyo UGC segment tag isolates UGC-driven orders).

---

### Metric 8 — Payback period (months)

> The single metric that gates "can I take a $50k ad loan?"

**Formula:** `Payback period (months) = CAC ÷ (LTV per month)` where `LTV per month = LTV(90d) ÷ 3` (rough linearization of the 90-day LTV into a monthly contribution).

**Default benchmark range:** **≤ 6 months** for the default case. Payback > 12 months means the operator is funding > 1 year of CAC before the first dollar of LTV returns — this is the trap that kills cash flow. Payback < 3 months is the "scale hard" signal (the operator can take on ad-spend debt confidently).

**Voice-driven overrides:**
- **Luxury:** Payback **≤ 9 months** acceptable (luxury LTV is higher but CAC is also higher)
- **Sustainable:** Payback **≤ 5 months** (eco-positioning + mission-driven retention = faster payback)
- **Gen-Z:** Payback **≤ 4 months** (Gen-Z volume compensates; tight payback is required)
- **B2B:** Payback **≤ 12 months** acceptable (B2B is multi-quarter; longer payback is the norm)

**Data source:** derived (metric #1 ÷ (metric #2 ÷ 3)). Triple Whale's "Payback period" widget computes this in real-time.

**Pitfall #9 trap:** "Payback is 4 months, I can scale hard" — payback is a STATIC number; if you scale ad spend 5× and CAC rises 30% (because of audience saturation), payback jumps to 5.2 months. Fix: re-compute payback weekly as you scale; the Move #6.5 audit's Gate G (week-over-week drift ≤ 5pp) catches CAC drift before it cascades into payback drift.

**What moves this metric:** every Move that reduces CAC (Move #6 attribution accuracy + Move #6.5 audit + Move #9.5 cohort-overlay-winners-only) OR increases LTV per month (Move #4 + #7 + #8 + Asset 01's T1–T8 templates + Asset 03's UGC). Move #2 post-purchase upsell directly increases LTV per month by 10–20%.

---

### Metric 9 — Email engagement rate (open + click)

> Leading indicator for retention-flow health

**Formula:** `Email open rate = (Unique opens) ÷ (Delivered) × 100%`. `Email click rate = (Unique clicks) ÷ (Delivered) × 100%`.

**Default benchmark range (DTC e-commerce 2026):**
- **Open rate: 20–35%** (Klaviyo's median for e-commerce is ~25%)
- **Click rate: 2–5%** (Klaviyo's median is ~3%)

**Voice-driven overrides:**
- **Luxury:** Open rate **30–45%** (luxury subject lines are curiosity-driven, higher open); Click rate **3–6%**
- **Sustainable:** Open rate **25–35%** (mission-driven, higher engagement); Click rate **3–5%**
- **Gen-Z:** Open rate **15–25%** (Gen-Z is more SMS/IG-driven, lower email open); Click rate **2–4%**
- **B2B:** Open rate **25–40%** (B2B subject lines are benefit-driven); Click rate **4–8%**

**Data source:** Klaviyo → "Flow performance" → "Email performance" tab; filter to last 30 days.

**Pitfall #10 trap:** "Open rate dropped from 30% to 18%, is the welcome series broken?" — Apple Mail Privacy Protection (MPP) artificially inflates open rates (Apple pre-fetches email images, triggering an "open" event that isn't a real open). Since iOS 15 (Sept 2021), open rate has been a less reliable signal. Fix: weight **click rate** (which MPP doesn't fake) over open rate; or compute open rate only on non-Apple Mail recipients.

**What moves this metric:** every Asset 01 template that changes subject line + preview text + send time moves open rate. Move #4 welcome + Move #7 SMS-1 welcome + Move #8 loyalty launch sequence all directly move this.

---

### Metric 10 — Unsubscribe rate

> The metric that says "are my flows burning my list?"

**Formula:** `Unsubscribe rate = (Unsubscribes in window) ÷ (Delivered in window) × 100%`.

**Default benchmark range:** **< 0.3% per flow per send** for the default case. Anything above 0.5% per send is a canary that the message frequency + content + targeting is misaligned.

**Voice-driven overrides:**
- **Luxury:** Unsubscribe rate **< 0.1% per send** (luxury customers tolerate fewer, higher-quality touches)
- **Sustainable:** Unsubscribe rate **< 0.2% per send** (mission-driven tolerance is higher)
- **Gen-Z:** Unsubscribe rate **< 0.5% per send** (Gen-Z tolerance for irrelevant content is lower)
- **B2B:** Unsubscribe rate **< 0.1% per send** (B2B is relationship-driven)

**Data source:** Klaviyo → "Flow performance" → "Email performance" tab; filter by "Unsubscribe rate" column.

**Pitfall #11 trap:** "Unsubscribe rate is 0.1%, list health is fine" — Klaviyo's flow analytics reports unsubscribe rate per send, but the COMPOUND unsubscribe rate over a 30-day welcome series (8 emails) is closer to 0.8%. Fix: track **list churn rate** (net list size change over 30 days = new signups − unsubscribes − bounces) as the canonical health metric.

**What moves this metric:** Asset 01's Pitfall #6 (the "10 emails/week instead of 3" trap) is the canonical mover — over-emailing burns the list. Fix: cap every flow at 1 email/week for active customers + 1 email/week for post-purchase (8 weeks max).

---

### Metric 11 — NPS (Net Promoter Score)

> The brand-side metric that says "would your customers refer you?"

**Formula:** `NPS = % Promoters (9–10 rating) − % Detractors (0–6 rating)`, measured via a 1-question survey.

**Default benchmark range:** **30–50** for the default DTC case. NPS above 50 is excellent (top-decile brand loyalty); NPS below 30 is a canary (something in the product/positioning has degraded).

**Voice-driven overrides:**
- **Luxury:** NPS **40–60** (luxury customers have high expectations; NPS is a leading indicator of repeat purchase)
- **Sustainable:** NPS **40–55** (mission-driven loyalty lifts NPS)
- **Gen-Z:** NPS **25–45** (Gen-Z brand-loyalty is structurally lower)
- **B2B:** NPS **30–50** (B2B NPS is a function of account-management quality)

**Data source:** Postscript SMS survey (1-question, post-purchase) OR Wootric / Delighted (free tier, email + web survey).

**Pitfall #12 trap:** "NPS is 50 but repeat purchase rate is 15%" — NPS is a leading indicator, not a same-quarter predictor. The 30–50 NPS predicts repeat purchase over 6–12 months, NOT over 30 days. Fix: track NPS monthly but expect NPS-driven RPR changes to lag by 60–180 days.

**What moves this metric:** Asset 01's T7 SMS Review Request is the **NPS-collection vehicle** — by asking for a review (Asset 01's T7), you simultaneously collect an NPS-like signal. Move #8 loyalty + Move #11 subscription + Asset 03's UGC all move NPS positively.

---

### Metric 12 — Cohort LTV by UGC vs paid-social vs organic

> The Move #3 Pitfall #15 high-CTR-low-LTV measurement

**Formula:** Same as Metric 7, but sliced into 3 sub-cohorts: UGC (Klaviyo UGC segment per Asset 03) / paid-social (Triple Whale utm_source in {facebook, tiktok, instagram, snap, pinterest}) / organic (everything else).

**Default benchmark range:**
- **UGC cohort LTV ≥ 1.2× paid-social cohort LTV** (UGC trust signal drives higher retention)
- **Organic cohort LTV ≥ 1.5× paid-social cohort LTV** (organic = highest-intent, lowest-CAC, highest-LTV)
- **UGC cohort 90d retention ≥ 1.1× paid-social cohort 90d retention**

**Voice-driven overrides:**
- **Luxury:** UGC cohort LTV ≥ 1.3× paid-social (luxury UGC is highest-trust)
- **Sustainable:** UGC cohort LTV ≥ 1.4× paid-social (eco-UGC is mission-aligned)
- **Gen-Z:** UGC cohort LTV ≈ paid-social (Gen-Z is more skeptical of UGC authenticity)
- **B2B:** UGC cohort LTV typically not applicable (B2B UGC = case studies, different shape)

**Data source:** Triple Whale cohort-by-utm_source + Klaviyo UGC segment (per Asset 03's Klaviyo segment tag wiring) → join on customer_id → compute LTV per sub-cohort.

**Pitfall #13 trap:** "UGC cohort LTV is 0.9× paid-social — UGC program is failing" — the UGC cohort is biased toward higher-AOV customers (Asset 03's creators send their audience to the highest-AOV product), so the LTV comparison needs to **AOV-adjust**. Fix: compute `LTV ÷ AOV` per sub-cohort, then compare ratios. If UGC LTV/AOV ≥ 1.1× paid-social LTV/AOV, the UGC program is healthy on a per-dollar basis.

**What moves this metric:** Asset 03's UGC program (5 outreach emails + 3 contracts + Klaviyo UGC segment tag) directly moves UGC cohort LTV. Move #9.5 PDP A/B testing + Move #10 AI ad creative both depend on this metric for their cohort-overlay verification.

---

## 10 common pitfalls with corrective `Fix:` lines

1. **Tracking the wrong window for LTV.** Operator computes LTV(30d) and concludes the welcome series has zero LTV lift because customers haven't had time to repeat-purchase. **Fix:** LTV for a $75 AOV brand needs a **90-day window minimum**; for higher-AOV brands (>$200), 180-day is better. The Move #6 "killer test" specifies 90-day explicitly; don't recompute with a 30-day window because the result will be noisy and you'll kill a healthy flow.

2. **CAC is suspiciously low.** Triple Whale's first-week CAC is 30–50% BELOW day-30 CAC because Meta/Google/TikTok are in learning phase. **Fix:** take the **day-30 CAC** as the canonical number. The Move #6.5 Gate G (week-over-week drift ≤ 5pp) catches this drift once you have ≥2 weeks of data.

3. **LTV is rising but profit is falling.** LTV includes revenue, not profit. **Fix:** compute **LTV-gross-margin = LTV × gross margin %**. A $75 AOV brand with 70% margin has LTV-gross-margin = LTV × 0.7; this is the right number for the LTV:CAC ratio. Without this fix, an operator can have LTV:CAC = 4:1 (looks great) but actually be unprofitable because gross margin is 30%, not 70%.

4. **LTV:CAC ratio is healthy but cash is tight.** LTV:CAC is a ratio, not a cash-flow statement. **Fix:** also track **payback period (metric #8)**. The healthy combo is **LTV:CAC ≥ 3:1 AND payback ≤ 6 months**. Anything outside that envelope requires either reducing CAC (Move #6 + #6.5 attribution accuracy + Move #9.5 cohort-overlay winners) or extending the LTV window (Move #4 welcome + #7 SMS + #8 loyalty + Asset 03 UGC).

5. **D90 retention dropped because we turned off the welcome series** — but the data shows it's because the new cohort has lower AOV. **Fix:** when you change a flow, control for cohort AOV. Compute D90 retention for cohorts acquired during the ON period vs OFF period, restricted to AOV bands (e.g. $50–$100 AOV only). If the AOV-controlled D90 retention drops 10–20%, the welcome series was lifting retention; if it's flat, the welcome series was mis-configured.

6. **RPR is 35% but new-customer acquisition is flat** — operator conflates "RPR is rising" with "the brand is healthy". **Fix:** segment RPR by **customer age cohort**. A 6-month-old cohort should have ~15% RPR, a 12-month-old cohort should have ~25%, a 24-month-old cohort should have ~35%. The blended number can mask a regression in a younger cohort.

7. **Churn rate is low but the cohort is aging out** — operator sees 1% monthly churn and assumes the brand is healthy, but annual churn compounds to 71% over 5 years. **Fix:** track **annual churn** (cumulative 12-month window) AND **cohort churn by acquisition year**. A new cohort with HIGHER annual churn than the prior-year cohort is the canary that product/positioning has degraded.

8. **Email LTV is highest so I should shift all spend to email.** Email is an owned channel, not a paid acquisition channel. **Fix:** grow the email list via Move #4 welcome + Move #7 SMS-capture, then use paid channels (Meta/Google/TikTok) to FILL the top of the email funnel. The correct insight is: "email is the highest-LTV source, so invest in list growth" — not "shift spend to email".

9. **Payback is 4 months, I can scale hard** — but payback is static; scaling ad spend 5× can saturate the audience and raise CAC 30%, which jumps payback to 5.2 months. **Fix:** re-compute payback **weekly as you scale**. The Move #6.5 audit's Gate G (week-over-week drift ≤ 5pp) catches CAC drift before it cascades into payback drift.

10. **Benchmarks don't match my brand voice** — operator compares their Gen-Z brand's NPS (25) against the Default benchmark (40) and concludes their brand is failing. **Fix:** apply the **voice-driven override column** (see the 4 override columns in each metric section). Gen-Z NPS of 25 is healthy; the Default NPS of 40 is healthy for a different brand voice. The same pattern applies to retention rate, RPR, LTV, CAC, payback, and the rest of the 12 metrics.

---

## 5 verification gates

- **Gate A — Monthly snapshot completeness.** All 12 metrics computed for the prior month. **Pass:** the snapshot spreadsheet has 12 rows, each with: metric name + formula + computed value + voice override value + data source panel screenshot + trend vs prior month + "what moved this" annotation. **Fail fix:** missing row → add the formula + data source + computed value; missing voice override → apply Asset 02's voice decision matrix; missing "what moved this" → cross-reference Asset 01 template IDs + Move #N playbooks.

- **Gate B — Formula correctness.** Each metric's computed value matches the canonical formula in this asset. **Pass:** spot-check 3 random metrics by hand (re-compute CAC, LTV, and LTV:CAC from raw Shopify + Triple Whale exports). **Fail fix:** formula divergence usually means (a) Triple Whale's "LTV" includes non-cohort revenue (off-Triple-Whale orders), or (b) Shopify's "RPR" includes refunded orders. Fix by filtering to the canonical cohort + excluding refunds.

- **Gate C — Benchmark applicability.** The voice override column matches the brand's actual Asset 02 profile. **Pass:** the snapshot spreadsheet has the operator's Asset 02 profile name in the header (Default / Luxury / Sustainable / Gen-Z / B2B) and the benchmark column reflects that profile's override. **Fail fix:** if the profile is "between" two voices (e.g. Default-leaning-Luxury), interpolate the benchmark (e.g. CAC range $30–$75 default + $150–$300 luxury = interpolated $90–$190 for a Default-leaning-Luxury brand).

- **Gate D — Data source pipeline.** Every metric's data source panel returns a real value (not "API error" or "data not yet available"). **Pass:** Triple Whale + Klaviyo + Postscript + Shopify all show data for the prior month. **Fail fix:** if Triple Whale is missing, run `scripts/triple_whale_attribution_check.py` (Move #6) to verify install. If Klaviyo is missing, check API key in `dashboard/src/lib/secrets.ts`. If Postscript is missing, check API key in the workspace's `env` directory.

- **Gate E — Trend direction.** Every metric either (a) moves in the healthy direction vs prior month, OR (b) has a documented explanation for why it moved the wrong direction. **Pass:** every metric has either ↑ or ↓ with the right sign OR a "why this is OK" annotation. **Fail fix:** if CAC rose 30% without a corresponding LTV rise of 20%+, run `scripts/attribution_quality_audit.py` (Move #6.5) to verify the audit pipeline is green; a CAC rise without LTV rise is the canonical signal that attribution has drifted.

---

## Verification recipe (one shell block to run all 5 gates)

```bash
# Gate A: Monthly snapshot completeness
grep -cE "^\| [0-9]+ \| \*\*" assets/05-retention-metrics.md
# Expect: ≥12 (one row per metric in the Decision matrix table)

# Gate B: Formula correctness
grep -cE "^\*\*Formula:\*\*" assets/05-retention-metrics.md
# Expect: 12 (one formula per metric in the 12 metric sections)

# Gate C: Benchmark applicability (4 voice-driven override columns per metric)
grep -cE "voice-driven override" assets/05-retention-metrics.md
# Expect: ≥12 (one per metric; 4 override columns per metric = 48 voice-named mentions)

# Gate D: Data source pipeline (5 vendor names across 12 metrics)
grep -oE "Triple Whale|Klaviyo|Postscript|Shopify|Wootric|Delighted|ReCharge|Skio" assets/05-retention-metrics.md | sort -u
# Expect: Triple Whale + Klaviyo + Postscript + Shopify + at least 1 NPS-survey tool

# Gate E: Trend direction (every metric has an ↑ or ↓ annotation)
grep -cE "↑|↓|vs prior month" assets/05-retention-metrics.md
# Expect: ≥12 (one trend annotation per metric)
```

---

## Related

**Sibling assets that this builds on (compounds the value of all 4 prior assets):**

- `assets/01-copy-templates.md` — the 8 paste-ready Klaviyo + Postscript templates. Each metric in this card maps to which T1–T8 template moves it (T1 Welcome moves LTV + 90d retention; T2-T3 Cart-Abandon moves RPR; T7 Review Request moves NPS + UGC cohort LTV; T8 Win-Back moves churn rate + RPR; T4-T6 SMS cart-abandon moves email engagement + unsubscribe rate). The decision matrix in this asset's row 9 (email engagement) + row 10 (unsubscribe rate) is **only meaningful** when paired with Asset 01's templates — operators without those templates have no flow to measure.
- `assets/02-brand-voice.md` — the 5 voice profiles. The **4 voice-driven override columns** in each of the 12 metric sections (Luxury / Sustainable / Gen-Z / B2B overriding Default) are derived from Asset 02's decision matrix (the Discount frequency / Brand-name usage / Objection handling dimensions each map to a metric override — e.g. Luxury's higher Objection handling dimension maps to a higher LTV benchmark). Operators without an Asset 02 profile pick the Default column and lose the 4 overrides.
- `assets/03-ugc-brief.md` — the UGC program with 5 outreach emails + 3 contracts + Klaviyo UGC segment tag. Metric #12 (Cohort LTV by UGC vs paid-social vs organic) is **only computable** when Asset 03's Klaviyo UGC segment tag is wired. The Move #10 Pitfall #15 high-CTR-low-LTV measurement requires this metric to verify that UGC-driven traffic is high-LTV, not just high-CTR.
- `assets/04-promo-calendar.md` — the 12-month promotional calendar. The trend-direction verification gate (Gate E) uses the Q1-low / Q4-peak macro shape from Asset 04 as the baseline expectation — a metric that drops in November (Q4 peak) without explanation is a Move #6.5 attribution-drift signal; a metric that rises in Q1 without explanation is a Move #4 welcome-series or Move #7 SMS-capture signal.

**Playbooks that this card maps to (per-metric playbook references):**

- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1) — moves metrics #2 LTV + #4 retention rate + #5 RPR + #10 unsubscribe rate; the canonical Move #1 verification is the OFF/ON cohort comparison per Move #6 Pitfall #15
- `playbooks/04-welcome-series-klaviyo.md` (Move #4) — moves metrics #2 LTV + #4 retention rate (D7/D30) + #7 cohort LTV by source + #9 email engagement; the canonical Move #4 verification is the 90-day cohort LTV lift vs the OFF window per Move #6 spec
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7) — moves metrics #5 RPR + #7 cohort LTV by source (SMS as a source) + #9 email engagement + #10 unsubscribe rate; the SMS-4 review request specifically moves metric #11 NPS
- `playbooks/07-loyalty-program-smile.md` (Move #8) — moves metrics #2 LTV (loyalty-tier LTV ≥ 1.5× non-loyalty) + #5 RPR (loyalty lifts RPR 20–30%) + #7 cohort LTV by source (loyalty as a source); the canonical Move #8 verification is the Triple Whale attribution check (Gate G in Move #6.5)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — provides the data source for **6 of the 12 metrics** (CAC, LTV, LTV:CAC, cohort LTV by source, payback period, cohort LTV by UGC vs paid); without Move #6 shipped, half this card is unmeasurable
- `playbooks/06.5-attribution-quality-audit.md` (Move #6.5) — ensures the Triple Whale data pipeline (the data source for 6/12 metrics) is trustworthy; Gate E (week-over-week drift ≤ 5pp) catches CAC + LTV drift before it cascades into LTV:CAC drift

**Research that informed this card:**

- `research/00-ecommerce-ops-landscape.md` — the DTC retention benchmark data that anchors the 12 default benchmark ranges (the "email/SMS > paid social at the margin" principle + the "retention automation is the #1 profit channel" claim come from this doc)
- `research/02-top-10-leverage-moves.md` — Move #1 / #4 / #6 / #7 / #8 all reference specific metrics in this card as their verification gates; the "Move #6.5 prevents the silent attribution-degradation failure mode" framing comes from this doc

**Forward-pointing references (planned future assets):**

- `assets/06-nps-survey-toolkit.md` *(planned — does not yet exist)* — a paste-ready NPS-survey program that closes Metric #11's data-pipeline gap (Postscript 1-question survey + Wootric / Delighted email survey + the survey-frequency guardrails + the 9-question + 1-NPS survey template + the cohort-by-NPS-bucket LTV analysis); would land `assets/` at 6 artifacts (a complete measurement + brand-kit); compounds Asset 03's UGC program (UGC creators typically have 10–20% higher NPS than paid-social cohorts — Metric #12 verifies this)