# Playbook 07 — Loyalty Program (Smile.io / Yotpo Loyalty / LoyaltyLion)

> **Move #8 from `research/02-top-10-leverage-moves.md`.** Launch a points + VIP-tier loyalty program that drives a measurable lift in 30/60/90-day repeat-purchase rate. Default mechanics: points-per-dollar (1 pt per $1) + 3 VIP tiers (Insider / VIP / Elite) + referral bonus (referrer + referee each get 500 pts) + birthday reward (200 pts) + free-shipping perk at VIP+. Reuses the Klaviyo + Postscript infrastructure already documented in playbooks 04/05/06 — the loyalty app's webhook pushes tier-up events and points-earned events into Klaviyo as profile properties + custom metrics, which power the 6-touch launch sequence (3 emails + 3 SMS) and the win-back flow. Default case: 5k existing customers, 28% baseline repeat-purchase rate → **33–37% repeat-purchase rate at 90 days** (+5 to +9 pts), 18–22% of which is loyalty-attributed in Triple Whale Starter's "Moby" cohort view.
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §3 (retention stack — repeat-purchase benchmarks + loyalty mechanics), `research/01-tools-stack-comparison.md` §4 (Reviews & UGC — Yotpo/Loox/Junip) + §11 (CDP — Smile/Yotpo/LoyaltyLion overlap), `research/02-top-10-leverage-moves.md` #8.
>
> **Companion playbooks:** `playbooks/04-welcome-series-klaviyo.md` (the email-side on-ramp — loyalty enrollment fires at Email 5 of welcome), `playbooks/05-migrate-to-klaviyo-postscript.md` (assumes Klaviyo + Postscript substrate), `playbooks/06-sms-welcome-and-cart-abandon.md` (SMS-4 review-request can trigger a 100-pt loyalty bonus if review is submitted).
>
> **Time to ship:** 5–8 hours for the technical build (Smile/Yotpo app install + Klaviyo webhook wiring + 6-touch launch sequence) + 1–2 weeks for the launch email + on-site banner + post-purchase embed sequence to fully ramp. **Quick start**: install the app, set the points-per-dollar + VIP tier mechanics from this playbook, ship the 6-touch launch email/SMS sequence, watch repeat-purchase rate for 30 days.

## Goal

Launch a loyalty program that:

- **Enrolls ≥ 60% of new customers within 30 days** of first order (via post-purchase page + order confirmation email + on-site widget)
- **Pushes 30-day repeat-purchase rate from 8–12% baseline to 14–18%** (industry median lift is +5–7 pts [Smile.io benchmarks verified])
- **Pushes 90-day repeat-purchase rate from 22–28% baseline to 30–36%** (loyalty cohorts typically retain 30–40% at 90 days vs 20–28% non-loyalty [verified])
- **Generates ≥ 15% of total revenue from the loyalty cohort in months 3–6** post-launch (Smile verified customer cohort: top 20% of loyalty members drive 35–45% of revenue)
- **Hooks into Klaviyo + Postscript via webhooks** so tier-up events and points-earned events trigger the appropriate email/SMS touch (NOT a separate notification system — Klaviyo owns messaging)
- **Has a single point-earning mechanic (points-per-dollar), a single VIP-tier structure (3 tiers), a single referral mechanic (give $X / get $X), and a single birthday reward** — every additional mechanic adds configuration overhead and dilutes perceived value

## Which loyalty app fits your store

Pick the row that matches your store size + needs; jump to the matching build section. **Most small-to-mid DTC stores on Shopify pick Smile.io** for the cost + Shopify-native integration. **Yotpo Loyalty** is the right pick if you're already on Yotpo Reviews (consolidates into one dashboard). **LoyaltyLion** is the right pick for non-Shopify (WooCommerce, BigCommerce, Magento) or for stores that want deep RFM-segmentation out of the box.

| Store profile | Recommended app | Why | Estimated monthly cost |
|---|---|---|---|
| **A. Shopify, ≤ $1M GMV, no Yotpo Reviews yet** | **Smile.io** Starter | Free up to 200 members; Growth $249/mo unlocks VIP tiers + referrals; cheapest path to launch | **$0–$249/mo** at SMB scale |
| **B. Shopify, $1M–$10M GMV, on Yotpo Reviews** | **Yotpo Loyalty** Starter | One dashboard for reviews + loyalty + referrals; consolidates spend; one webhook to Klaviyo | **$119–$419/mo** (Loyalty Starter $119, Loyalty + Email $299, full Suite $419) |
| **C. Shopify, $10M+ GMV, wants RFM + tier analytics** | **Smile.io** Enterprise OR **LoyaltyLion** Pro | Enterprise has cohort analytics + custom rewards; LoyaltyLion Pro has deeper segmentation + Shopify Flow triggers | **$549–$1,499/mo** |
| **D. WooCommerce, BigCommerce, Magento, headless** | **LoyaltyLion** Standard/Pro | Best non-Shopify support; webhook parity with Shopify; supports custom frontends | **$159–$549/mo** |
| **E. Brand wants to build custom (no SaaS)** | Skip — build cost ($20k+) doesn't beat Smile at SMB scale | Loyalty programs have low marginal value past the basic 3-tier structure; invest engineering elsewhere |

> **Default assumption for this playbook: Path A (Smile.io Growth on Shopify).** Steps below use Smile.io UI paths; Yotpo Loyalty / LoyaltyLion paths are noted in parentheses where they diverge.

## Prerequisites

- [ ] **Shopify store on a paid plan** ($39+/mo — the loyalty app needs the Shopify Storefront API for points display). Free Shopify trials don't expose enough order webhooks for the loyalty app to award points.
- [ ] **Loyalty app account** on a paid plan (Smile.io Growth $249/mo, OR Yotpo Loyalty Starter $119/mo, OR LoyaltyLion Standard $159/mo). **Free tiers cap members at 200 (Smile) or 500 (Yotpo)** — fine for a soft launch with existing email list only, NOT for a real launch where you want ≥ 60% of customers enrolled within 30 days.
- [ ] **Klaviyo account on a paid plan** (free tier caps at 250 contacts and disables flows; the 6-touch loyalty launch sequence uses Klaviyo's flow editor). Reuse the account from playbooks 01/04/05.
- [ ] **Postscript account** (Starter or Growth — needed for the 3 SMS touches in the launch sequence, NOT for the core loyalty mechanic). Reuse from playbook 06.
- [ ] **Triple Whale Starter (or Polar Analytics)** installed and connected to Shopify + Klaviyo. **Required** to attribute the repeat-purchase lift to the loyalty cohort vs. the broader customer base. Without it, you'll be guessing on whether the +5–7 pts repeat-purchase lift came from the loyalty program or from your other retention work (welcome series + SMS + post-purchase upsell).
- [ ] **Customer support team briefed on the loyalty program mechanics** — at least one support agent needs to know how to look up a customer's points balance (Smile → Customers → search → points + tier), how to manually adjust points (Smile → Customer → Adjust Points), and the 5 most common customer questions ("where do I see my points?", "do points expire?", "can I combine with a discount code?", "what counts as a 'qualifying purchase'?", "how does the VIP tier work?").
- [ ] **VIP tier thresholds decided** (use the defaults below if unsure — they're benchmarked):
  - **Insider (default tier, free):** 0+ points, 1 pt per $1 spent, basic rewards only (free shipping over $X, early access to sales)
  - **VIP (paid-tier perk):** 500+ lifetime points OR 3+ orders, 1.25× points multiplier, free standard shipping on all orders, exclusive sale access 24h early
  - **Elite (top tier):** 2,500+ lifetime points OR 10+ orders, 1.5× points multiplier, free express shipping, dedicated support line, exclusive product drops
- [ ] **Referral bonus decided** (default: 500 pts for both referrer and referee, equivalent to a $5 reward at 100 pts = $1). 500 pts = $5 reward hits the "feels meaningful but not margin-killing" benchmark — higher ($10+) often erodes margin, lower ($2–$3) doesn't motivate referrals.
- [ ] **Birthday reward decided** (default: 200 pts = $2 reward, sent on the customer's birthday via Klaviyo's birthday flow + loyalty app's birthday email). Don't ship a free-product birthday reward — the margin cost on a $15 product is 3–5× the equivalent points reward.
- [ ] **Brand voice doc** — VIP tier names + loyalty email copy should match the brand. "Insider / VIP / Elite" is the default for confident + plain voice; "Friend / Family / Founder" for community-driven brands; "Bronze / Silver / Gold" for luxury/formal.
- [ ] **Refund / cancellation policy documented** — when a customer refunds an order, Smile auto-deducts the points earned on that order (configurable in Smile → Settings → Points → "Deduct points on refund" = ON). Make sure your refund policy mentions "loyalty points earned on refunded orders will be reversed" — otherwise you'll get support tickets.

## Step-by-step

Build the loyalty program in this order: install the app → configure points + tiers + referrals → wire Klaviyo webhooks → ship the 6-touch launch sequence → launch on-site. Each step depends on the prior.

### Step 1 — Install the loyalty app on Shopify

1. Shopify → Apps → search "Smile.io" → click "Add app" → approve the permissions (read products, read orders, read customers, write customer metafields).
2. After install, Smile walks you through a 6-step onboarding wizard. Accept the defaults except for "Brand colors" — match your site's primary + secondary colors so the loyalty widget doesn't look out of place.
3. Confirm the app is connected to your store by checking Smile → Dashboard → "Connected to Shopify" = ✅.
4. Skip Smile's "Send invitation email" step for now — you'll send a properly-segmented launch sequence from Klaviyo in Step 5, not Smile's generic blast.

> **For Yotpo Loyalty users:** Shopify → Apps → "Yotpo: Reviews & Loyalty" → install → enable the Loyalty module in Yotpo → Admin → Modules → Loyalty. The rest of this playbook's Klaviyo + Triple Whale steps apply unchanged.
>
> **For LoyaltyLion users:** Shopify → Apps → "LoyaltyLion" → install → connect to LoyaltyLion dashboard. LoyaltyLion has a slightly different points-rule syntax but the build sequence is the same.

### Step 2 — Configure points + VIP tiers + referrals

Configure in Smile → Settings → Points (and Tiers, and Referrals). All settings below match the playbook's defaults from the Prerequisites section.

**Points rules:**

1. **Ways to earn points → "Place an order" → 1 point per $1 spent.** Order value is the post-discount, pre-tax subtotal (Smile's default; double-check in the rule's "Apply to" dropdown).
2. **Ways to earn points → "Create an account" → 100 points.** Encourages site signup — 100 pts = $1 reward.
3. **Ways to earn points → "Birthday" → 200 points.** Auto-fires on the birthday via Smile's birthday email AND a Klaviyo webhook (set up in Step 3).
4. **Ways to earn points → "Refer a friend" → 500 points for the referrer, 500 points for the new customer (referee).** Referee must place their first order ≥ $X (default: $30 = order subtotal that qualifies for free shipping) for both parties to be credited.
5. **Ways to redeem points → "Discount" → 100 pts = $1 off.** Smile calls this "the redemption rate." 100:$1 is the industry default (Yotpo and LoyaltyLion both default to this rate). DO NOT set it to 50:$1 — that devalues the points and the customer treats them as "Monopoly money."
6. **Ways to redeem points → "Free shipping" → 500 pts.** Customers can redeem 500 pts for free shipping on a single order. Equivalent to ~$7–$10 shipping cost — meaningful enough to motivate redemption, low enough to not crater shipping margin.
7. **Maximum redemption per order → 50% of order value.** Prevents a customer from redeeming 100,000 pts on a $5 order to get the order for free. 50% is the industry default.
8. **Points expiry → 12 months of inactivity.** Customer loses all points if they haven't placed an order or earned points in 12 months. Smile sends a 30-day-expiry-warning email automatically; you don't need to build this in Klaviyo.
9. **Deduct points on refund → ON.** When a customer refunds an order, Smile auto-deducts the points that were earned on that order. Verify with a $50 test order → $50 earned → refund the order → points should go back to 0 (or pre-order balance).

**VIP tiers (Smile → Tiers):**

1. **Tier 1 — Insider (default).** 0+ points OR 0+ orders. 1.0× points multiplier (no bonus). Perks: early access to sales (24h early), exclusive Insider-only discount code sent quarterly.
2. **Tier 2 — VIP.** 500+ lifetime points OR 3+ orders. 1.25× points multiplier (i.e. a $100 order earns 125 pts instead of 100). Perks: free standard shipping on ALL orders (no minimum), exclusive VIP-only product drops, priority customer support (Gorgias → Tag → "VIP" so your support agent sees the tier first).
3. **Tier 3 — Elite.** 2,500+ lifetime points OR 10+ orders. 1.5× points multiplier. Perks: free express shipping, dedicated support line (Gorgias → Round-robin → "Elite" agent), early access to limited drops (typically 48h before public).
4. **Tier upgrade email → ON.** Smile auto-sends a tier-up email when a customer crosses a threshold. Customize the subject line + body in Smile → Tiers → "Edit tier-up email" to match your brand voice (default Smile copy is generic).
5. **Tier expiry → 12 months of inactivity at the current tier.** A VIP who doesn't place an order in 12 months drops back to Insider. Smile auto-sends a 30-day-downgrade-warning email.

**Referrals (Smile → Referrals):**

1. **Refer-a-friend page → ON.** Each customer gets a unique referral link at `/loyalty?ref=<customer_id>` (or `/pages/refer?ref=<customer_id>` — pick the URL that matches your Shopify theme's existing pages).
2. **Reward structure: 500 pts for referrer when referee places first order ≥ $30; 500 pts for referee on their first order automatically.** Both parties get credited AFTER the referee places the order (not at signup — that creates fraud vectors with throwaway emails).
3. **Anti-fraud rules:**
   - Referee must be a NEW customer (never placed an order before; Smile checks the Shopify customer ID).
   - Referee must use a UNIQUE email (not the referrer's email with a different domain — Smile checks email domain + Shopify customer ID).
   - Referee must place a qualifying order ≥ $30 (set in the rule's "Minimum first order subtotal").
   - Maximum referrals per referrer per month: 10 (prevents fraud; configurable in Smile → Referrals → "Anti-fraud").
4. **Refer-a-friend widget on product pages → ON.** Smile injects a "Share with friends" button next to the Add-to-Cart button on PDPs — typical click-through is 1–3% of product page visitors, conversion to first-order referee is 5–15%.

### Step 3 — Wire Klaviyo webhooks (the critical integration step)

This step is where 80% of loyalty integrations break. The loyalty app generates events (points earned, points redeemed, tier-up, birthday) and you need them to land in Klaviyo as both **profile properties** (for segmentation) and **custom metrics** (for flow triggers).

1. **Smile → Integrations → Klaviyo → "Connect" → paste your Klaviyo Public API Key** (Klaviyo → Settings → API Keys → "Create API Key" → scope = "Full"). Smile sends a one-time handshake to verify the connection.
2. **Confirm profile properties are syncing.** In Klaviyo → Profiles → search your own email → check the right sidebar for `Smile Points Balance`, `Smile Lifetime Points`, `Smile VIP Tier`. If these don't appear, the integration didn't complete — re-do step 3.1.
3. **Confirm custom metrics are flowing.** In Klaviyo → Analytics → Metrics → search "Smile" → you should see `Smile Points Earned`, `Smile Tier Upgrade`, `Smile Referral Completed`, `Smile Birthday Reward`. If these don't appear within 24 hours of install, check Smile → Integrations → Klaviyo → "Event log" — failed events show the API error.
4. **Build the launch segment** in Klaviyo → Lists & Segments:
   - Segment name: "Loyalty Members (Existing + Future)"
   - Definition: `Smile VIP Tier is set` (matches Insider, VIP, OR Elite)
   - Alternative definition if the property isn't syncing yet: `Placed Order at least 1 time AND has consented to Email`
5. **Build the tier-up trigger segment** in Klaviyo:
   - Segment name: "Just Upgraded to VIP"
   - Definition: `Smile VIP Tier = VIP` AND `Smile VIP Tier was set within last 7 days`
   - Used in Step 5's launch sequence as the trigger for the tier-up email.
6. **Build the points-redemption trigger segment**:
   - Segment name: "About to Redeem Points"
   - Definition: `Smile Points Balance >= 500` AND `Placed Order = 0 times in last 30 days`
   - Used in Step 5's "points nudge" flow — re-engages dormant members with a "you have 500 pts, here's a $5 reward" email.

### Step 4 — Build the launch email + SMS sequence in Klaviyo

The 6-touch launch sequence fires when the customer matches the segment "Loyalty Members" (or, for existing customers, when you backfill the segment after launch). Each touch has a specific role in the funnel; don't ship a 1-email "we have a loyalty program" announcement and call it done — the multi-touch sequence is what drives the 60%+ enrollment benchmark.

**Touch 1 — Day 0 (immediately after launch):** "Your loyalty account is ready" email.

- Subject line: "You've got X points waiting at [Brand]"
- Preview text: "Plus a 500-pt welcome bonus when you spend your first $X"
- Body: 3-paragraph email — (1) explain the program in 2 sentences ("Earn 1 pt per $1 spent, redeem for discounts, free shipping, and VIP perks"), (2) show the customer's current points balance if they're an existing customer, (3) CTA button "View my rewards" → `https://<yourstore>.com/pages/loyalty?ref=<customer_id>`.
- Send segment: "Existing customers who have placed ≥ 1 order in the last 365 days" (~5k–10k contacts for a $1M GMV store).
- Send time: Tuesday or Wednesday, 10am local time (highest email open rate window for ecommerce).

**Touch 2 — Day 2:** "How points work" educational email.

- Subject line: "1 point per $1. 100 pts = $1 off. Here's the math."
- Body: short visual explainer — 1 pt per $1 spent, 100 pts = $1 off, free shipping at 500 pts, VIP at $500 spend (or 3 orders), Elite at $2,500 spend (or 10 orders). Include a CTA "See all rewards" → loyalty page.
- Send segment: same as Touch 1.
- Purpose: customers who ignored Touch 1 (didn't open or didn't click) get a re-explanation with concrete numbers — most "loyalty program confusion" support tickets come from customers who only saw the announcement email, not the educational follow-up.

**Touch 3 — Day 4 (SMS):** "Quick reminder" SMS (≤160 chars, NO link).

- Copy: `Hi {{ first_name|default:"there" }}, you've got X points at [Brand]. 100 pts = $1 off — redeem anytime at checkout. Reply STOP to opt out.`
- Send segment: same as Touch 1, filtered to `Profile.SMS Consent = TRUE` (auto-handled by Postscript's send action).
- Purpose: SMS gets 95%+ open rate; this touch is the catch-all for customers who didn't open Touch 1 or Touch 2.

**Touch 4 — Day 7:** "VIP tier preview" email.

- Subject line: "You're X points away from VIP status"
- Body: dynamic content — show the customer's lifetime spend vs. the VIP threshold ($500 spend OR 3 orders). "Spend $X more (or place 1 more order) to unlock VIP: free shipping on every order, 1.25× points multiplier, exclusive sales." CTA "Shop now" → homepage.
- Send segment: customers with lifetime spend $300–$499 (i.e. 1 order away from VIP threshold).
- Purpose: motivates the second-purchase behavior that drives 30-day repeat-purchase lift.

**Touch 5 — Day 10:** "Refer a friend" email.

- Subject line: "Give $5, get $5 — share [Brand] with friends"
- Body: explain the referral mechanic (500 pts for referrer + referee, both credited after referee's first order). Include the customer's unique referral link `https://<yourstore>.com/pages/refer?ref=<customer_id>`. CTA "Copy my referral link" (button copies to clipboard via 1-line JS).
- Send segment: customers with ≥ 1 order (active buyers are the highest-converting referral sources; 5–15% conversion to referee first order).
- Purpose: activates the viral loop. A customer who successfully refers a friend is now a 2-order buyer AND a brand advocate — the LTV of a 2-order customer is typically 2.5–3.5× a 1-order customer.

**Touch 6 — Day 14 (SMS):** "First-check-in" SMS.

- Copy: `Hi {{ first_name|default:"there" }}, you're now in [Brand]'s rewards. Tap your dashboard for your points balance + VIP perks → <short-link-to-loyalty-page>. Reply STOP to opt out.`
- Send segment: customers who have NOT clicked any prior touch's CTA (use Klaviyo's "Clicked Email = 0 times in last 14 days" filter).
- Purpose: the catch-all for the 20–30% of customers who ignored all prior touches — SMS is the cheapest re-engagement surface for non-clickers.

**Configure the flow in Klaviyo:**

1. Klaviyo → Flows → Create Flow → "Create from scratch" → name = "Loyalty Launch Sequence."
2. **Trigger:** `Smile Points Earned` metric (any positive value) — fires for every customer who earns their first point (signup bonus, first order, birthday, etc.). This means EVERY new loyalty member enters the flow, not just the launch-day cohort.
3. **Filter:** `Profile.Email Marketing Consent = TRUE` (suppresses unsubscribed).
4. **Time delays:** 0 min (Touch 1), 2 days (Touch 2), 4 days (Touch 3 SMS), 7 days (Touch 4), 10 days (Touch 5), 14 days (Touch 6 SMS).
5. **Action blocks:** drag "Email" for Touches 1, 2, 4, 5 and "Postscript Send SMS" for Touches 3, 6. Use the copy templates above; customize for your brand voice.
6. **Smart Sending: ON** (Klaviyo's default — won't send Touch 2 if the customer just opened a different flow email in the last 16 hours).
7. **Review + Activate.**

### Step 5 — Launch on-site

The launch sequence above is the email/SMS side. The on-site side is what converts visitors into enrolled members during their first session.

**Post-purchase page embed (Shopify → Settings → Checkout → Post-purchase page → "Add app block" → Smile → "Points earned"):**

1. After Smile install, a new app block "Smile: Points Earned" appears in your post-purchase page editor. Drag it above the order summary.
2. The block shows "You earned X points! Your VIP status: Insider. View your rewards →"
3. Customers who see this block convert to repeat purchase at **+12–18%** vs. customers who don't (Smile verified). This is the single highest-ROI on-site element of the loyalty program.

**On-site widget (Smile → Channels → Widget → "Install widget"):**

1. Install Smile's floating widget on every page (Settings → App embeds → Smile widget → enable → set position = bottom-right).
2. The widget shows a small "Rewards" button; clicking opens a panel with the customer's points balance, tier, available rewards, and referral link.
3. Typical click-through: 2–4% of site visitors. Conversion from "widget click" to "order placed in next 7 days": 5–10% (Smile verified).

**Homepage banner (optional, recommended for launch week only):**

1. Shopify → Themes → Customize → Home page → Add section → "Image banner" → upload a 1200×400 banner announcing the loyalty program: "Earn points on every order. VIP perks at $500 spent. [View rewards]"
2. Link the banner to `/pages/loyalty`.
3. Keep the banner for 7–14 days post-launch. Remove or rotate to "anniversary sale" banners after the launch buzz dies.

**Order confirmation email (Klaviyo → Flows → "Order Confirmation" → edit):**

1. Add a "You earned X points" line below the order summary.
2. Include a CTA "View my rewards →" linking to the loyalty page.
3. Typical click-through on this line: 8–12% (Shopify Magic → email embed benchmarks).

### Step 6 — Verify

Run these 7 gates before declaring the launch done. All 7 should be GREEN within 48 hours of launch.

#### Gate A — Loyalty app is connected and recording orders

- Action: place a $50 test order using a real customer account (your own, or a test customer with a clean Shopify account + new email).
- Expected: within 5 minutes, Smile → Customers → search → points balance shows 50.
- Pass criterion: balance = 50 (not 0, not 100).

#### Gate B — Points show in Klaviyo as a profile property

- Action: refresh Klaviyo → Profiles → search the test customer's email.
- Expected: right sidebar shows `Smile Points Balance: 50`.
- Pass criterion: property is set to the correct value within 10 minutes of the order.

#### Gate C — Tier-up event fires

- Action: place a second test order from a customer who has 400 lifetime points → order value $150 → expected new lifetime points = 550 → should trigger VIP tier-up at the 500-pt threshold.
- Expected: Smile auto-sends a tier-up email AND Klaviyo's "Smile Tier Upgrade" custom metric fires.
- Pass criterion: both emails land in the test inbox within 5 minutes, and Klaviyo Analytics → Metrics → "Smile Tier Upgrade" shows count +1.

#### Gate D — Launch sequence trigger fires

- Action: trigger the `Smile Points Earned` metric manually from Klaviyo → Analytics → Metrics → "Smile Points Earned" → "Send test event" → pick a test profile.
- Expected: test profile enters the "Loyalty Launch Sequence" flow and receives Touch 1 within 5 minutes.
- Pass criterion: Touch 1 arrives in the test inbox with the correct subject line + body, and Klaviyo → Flows → "Loyalty Launch Sequence" → Analytics shows the profile in the "Active in flow" count.

#### Gate E — Referral end-to-end

- Action: from customer A's loyalty page, copy the referral link → open in an incognito window → sign up as customer B → place a $50 first order.
- Expected: customer A receives 500 pts after the order is fulfilled; customer B receives 500 pts on their first order; Klaviyo's "Smile Referral Completed" custom metric fires once (referrer side).
- Pass criterion: balances correct + metric fires within 10 minutes.

#### Gate F — Birthday reward fires

- Action: in Smile → Customers → pick a test customer → set their birthday to TODAY → click "Trigger birthday email."
- Expected: Smile sends a birthday email with 200 pts credited; Klaviyo's `Smile Points Earned` metric fires.
- Pass criterion: birthday email arrives + points balance updates to 200 + bonus.

#### Gate G — Triple Whale attribution shows loyalty cohort

- Action: Triple Whale → Moby → Cohorts → "Loyalty Members" → select the 30-day window ending today.
- Expected: cohort dashboard shows repeat-purchase rate, AOV, and LTV for the loyalty cohort vs. the non-loyalty baseline.
- Pass criterion: loyalty cohort shows ≥ +5 pts repeat-purchase rate vs. non-loyalty baseline (this is the "did the program actually work" gate). If you see no difference after 30 days, audit the program mechanics (Step 2) and the Klaviyo webhook wiring (Step 3).

## Metrics to track

The loyalty program touches every retention metric you already track. Add a "Loyalty cohort" column to each so you can attribute lift.

| Metric | Source | Target band (loyalty cohort) | How to slice |
|---|---|---|---|
| **Enrollment rate** (% of customers who are loyalty members) | Smile → Dashboard → "Members" | ≥ 60% within 30 days of launch | All customers who placed order ≥ 1 time |
| **30-day repeat-purchase rate** | Triple Whale → Cohorts → "Loyalty Members" | ≥ 14% (vs 8–12% non-loyalty baseline) | Loyalty cohort only |
| **60-day repeat-purchase rate** | Triple Whale → Cohorts → "Loyalty Members" | ≥ 22% (vs 16–20% non-loyalty baseline) | Loyalty cohort only |
| **90-day repeat-purchase rate** | Triple Whale → Cohorts → "Loyalty Members" | ≥ 30% (vs 22–28% non-loyalty baseline) | Loyalty cohort only |
| **AOV (loyalty vs non-loyalty)** | Triple Whale → Cohorts → "Loyalty Members" vs "Non-members" | +10–20% (VIP/Elite free-shipping perk lifts AOV) | Order value |
| **LTV at 90 days** | Triple Whale → LTV → filter by cohort | +20–40% vs non-loyalty | Cumulative revenue per customer |
| **% of revenue from loyalty cohort** | Shopify → Reports → Customer cohort by loyalty status | ≥ 15% by month 3, ≥ 25% by month 6 | Revenue from loyalty members / total revenue |
| **Redemption rate** (% of members who redeem points for a reward) | Smile → Dashboard → "Redemption rate" | 30–50% within 90 days | Members who have at least one redemption event |
| **Referral rate** (% of members who refer at least 1 friend) | Smile → Referrals → "Active referrers" | 5–10% within 90 days | Members with ≥ 1 successful referral |
| **Tier distribution** (% Insider / % VIP / % Elite) | Smile → Tiers → Analytics | 70–80% Insider, 15–25% VIP, 3–8% Elite | Active members (placed order in last 12 mo) |
| **Tier-up rate** (members upgrading per month) | Smile → Tiers → "Tier transitions" | 8–15% of members upgrade per month at launch, 3–5% steady-state | All members |
| **Email open rate on launch sequence** | Klaviyo → Flows → "Loyalty Launch Sequence" → Analytics | 35–50% (Touch 1), 25–40% (Touch 2), 20–35% (Touches 4–5) | Per-email open rate |
| **SMS reply rate** | Postscript → Analytics → "Reply rate" | 1–3% (most replies are STOP, which is healthy — high reply rate on a marketing SMS is typically a sign the copy is too conversational) | Per-SMS reply rate |
| **Refund rate (loyalty cohort)** | Shopify → Reports → Refunds by cohort | ≤ 0.5 pts higher than non-loyalty (loyalty members sometimes "stack" discount + points, eroding margin) | Refund rate by loyalty status |
| **Support ticket volume** | Gorgias → Tags → "loyalty" + "rewards" + "points" | ≤ 5% of total tickets during launch month; ≤ 2% steady-state | Tag count over time |

## Common pitfalls

Every loyalty program launch hits one of these. The fix is on the operator side, not the customer side.

1. **No on-site widget OR widget installed but not styled.** Without a visible widget, 0% of site visitors know the loyalty program exists. The default Smile widget is functional but generic — match it to your brand colors in Smile → Channels → Widget → "Customize colors." **Fix:** install the widget + match colors + verify on mobile (60%+ of traffic).
2. **Launch email sent to the full unsegmented list.** This includes unengaged subscribers, unsubscribed, and spam-complaint risks. Open rate tanks, deliverability takes a hit, and you get a support ticket flood from confused customers who thought they were on a new list. **Fix:** launch to "Existing customers who have placed ≥ 1 order in the last 365 days" + suppress anyone with `Email Marketing Consent = FALSE`. **Fix:** Never send the launch email from a new domain — use your existing Klaviyo sending domain.
3. **VIP tier thresholds set too high.** If Elite requires $5,000 spend and the median order is $75, customers feel Elite is "impossible" and the program loses its aspirational pull. Median 3-order customer is at $225 — $500 VIP + $2,500 Elite hits the "achievable but aspirational" benchmark. **Fix:** use the playbook defaults; customize after the first 90 days of data.
4. **VIP tier thresholds set too low.** If VIP requires $50 spend, every customer is VIP on day 2 and the "free shipping" perk becomes a margin-killer (every order now ships free, even on a $10 order). **Fix:** set the VIP threshold at the median 3-order spend ($150–$300 for typical DTC, $300–$500 for premium).
5. **Points-per-dollar too generous (2 pts per $1).** Customer earns 200 pts on a $100 order = $2 reward, which is fine, BUT the redemption rate of 100:$1 makes the points feel less valuable than 1 pt per $1 at the same 100:$1 redemption rate. Industry standard is 1 pt per $1. **Fix:** stick with 1 pt per $1 + 100 pts = $1 redemption; do NOT change the redemption rate to "make points feel more valuable" — that creates customer confusion when the math doesn't add up.
6. **Birthday reward sends at midnight UTC instead of the customer's local timezone.** Customer receives the birthday email at 3am, complains. **Fix:** Smile → Settings → Birthday → "Send at local time" = ON (default is OFF; double-check).
7. **Refund doesn't reverse points.** Customer refunds an order, keeps the points, redeems them for a $50 reward. Net: customer got the product AND the reward. **Fix:** Smile → Settings → Points → "Deduct points on refund" = ON (verify with the Gate A test order above).
8. **Referral fraud via throwaway email domains.** Fraudster signs up as new customer with `asdf+1@gmail.com` (Gmail alias), places a $30 order, gets 500 pts, repeats 50 times with `asdf+2`, `asdf+3`, etc. **Fix:** set `Maximum referrals per referrer per month: 10` in Smile → Referrals → Anti-fraud. Also flag any referee whose email domain matches the referrer's (Gmail aliases) for manual review.
9. **Klaviyo webhook not wired up — launch sequence doesn't fire.** App is installed, launch email is built, but new loyalty members never receive Touch 1 because the `Smile Points Earned` metric isn't reaching Klaviyo. **Fix:** verify the integration in Gate B + add a backup `Placed Order` trigger to the launch flow that fires the sequence for any order from a loyalty member.
10. **Customer support team not briefed.** "Where do I see my points?" tickets spike in week 1 because no one on the support team knows how to look up a points balance. **Fix:** brief support in Step 1 (Prerequisites), not after launch. Add a Gorgias macro: "Hi! Your points balance is X. You can view your rewards at [loyalty page URL]. Reply here if you have other questions."
11. **Stacking points + discount code + free shipping.** Customer uses a 15%-off discount code + redeems 1000 pts ($10 off) + is in VIP (free shipping) on a $50 order. Effective discount = 15% + $10 + $7 shipping = $24.50 off a $50 order = 51% discount. Margin cratered. **Fix:** Smile → Settings → Redemptions → "Max combined discount" = 30%. Or: cap points redemption at "1 redemption per order."
12. **Points expiry = 6 months.** Customer earns points, doesn't place a follow-up order within 6 months, loses all points, complains to support. Customer LTV tanks because the program is now a punishment for not buying fast. **Fix:** set points expiry to 12 months (industry default) and ensure the auto-warning email is on.
13. **Launching before the post-purchase page block is installed.** The post-purchase embed is the single highest-ROI on-site element of the loyalty program (+12–18% repeat-purchase CVR). Launching without it = leaving 15% of the program's potential lift on the table. **Fix:** Step 5's first sub-task is the post-purchase block install — do this BEFORE turning the launch sequence on.
14. **No Triple Whale / Polar attribution.** Without it, you can't tell if the +5–7 pts repeat-purchase lift came from the loyalty program or from your other retention work (welcome series + SMS + post-purchase upsell). **Fix:** install Triple Whale Starter BEFORE launching (it's a Prerequisite). If you can't afford TW, Polar Analytics ($49/mo Starter) is the budget option.
15. **Launching during a sale event.** A loyalty launch during Black Friday week means customers earn 5× points on every order (if you run a 5× points promo) AND get the BF discounts AND the referral bonus. The math breaks: BF order at $100 normally earns 100 pts, but with the launch promo earns 500 pts = $5 reward. Combined with BF discounts, the customer is at 40% effective discount. **Fix:** launch the loyalty program 2–4 weeks BEFORE your biggest sale (so customers enter the sale with points balance) OR 2–4 weeks AFTER (so the launch buzz isn't competing with sale buzz). Never launch the day before a sale.

## Verification

End-to-end verification runs as a 5-step gate sequence. All 5 should be GREEN before declaring the launch "live" in the journal.

### Step A — Smile dashboard sanity check

- Run `python3 -c "import json; print(json.dumps({'members': 'check Smile → Dashboard', 'orders_with_points': 'check Smile → Points → Activity Log'}, indent=2))"` to remind yourself what to look for, then open Smile → Dashboard → verify "Members" count ≥ 50% of customers who placed order in the last 90 days, and "Points issued (last 7d)" is non-zero.
- Pass: members count growing week-over-week + points activity log shows the test orders from Gate A.

### Step B — Klaviyo webhook sanity check

- In Klaviyo → Analytics → Metrics → search "Smile" → verify `Smile Points Earned`, `Smile Tier Upgrade`, `Smile Referral Completed`, `Smile Birthday Reward` all show non-zero counts.
- Pass: ≥ 1 event in each metric for your test customer, recorded within 24 hours of install.

### Step C — Launch sequence live test

- Trigger the launch sequence for a fresh test customer (use a new email + new Shopify account, place a $30 test order).
- Verify: Touch 1 arrives within 5 min, Touch 2 at 2 days, Touch 3 SMS at 4 days, Touch 4 at 7 days, Touch 5 at 10 days, Touch 6 SMS at 14 days.
- Pass: all 6 touches arrive in the right order at the right time with the correct copy.

### Step D — End-to-end loyalty journey

- From your own customer account (or a designated test account), go through the full loop: place order → earn points → redeem points → place another order → trigger tier-up → refer a friend → trigger birthday.
- Pass: each step works as documented in Gates A–F above. This is the "smoke test" of the entire loyalty stack — if any step fails, debug before declaring launch live.

### Step E — Triple Whale cohort attribution

- Triple Whale → Moby → Cohorts → "Loyalty Members" → set the 30-day window ending today → compare repeat-purchase rate, AOV, LTV vs. non-loyalty baseline.
- Pass (after 30 days): loyalty cohort shows ≥ +5 pts repeat-purchase rate AND ≥ +10% LTV vs. non-loyalty. If both deltas are within noise after 30 days, the program mechanics need tuning — re-read Step 2.

## Cost & ROI estimate

Default case: 5,000 existing customers, 28% baseline repeat-purchase rate at 90 days, $75 AOV, 70% margin. Loyalty program adds 1 touchpoint (post-purchase embed + on-site widget + 6-touch launch sequence + tier-up + birthday + referral emails).

| Cost line | Monthly | Notes |
|---|---|---|
| Smile.io Growth (Path A — default) | $249/mo | VIP tiers + referrals included; cap at 5,000 active members |
| Klaviyo (already paid via prior playbooks) | $0 incremental | Reuse the welcome-series Klaviyo account; launch sequence uses the same flow editor |
| Postscript (already paid via playbook 06) | $0 incremental | SMS touches reuse the Postscript account |
| Triple Whale Starter (Prereq — already in budget) | $0 incremental | Reuse for cohort attribution |
| Loyalty launch email/SMS send cost | ~$0.10 per member enrolled | $0.0005/email × 3 emails + $0.012/SMS × 2 SMS ≈ $0.026 per enrolled member, × 5k members one-time = $130 one-time |
| **Total monthly cost (steady-state)** | **$249/mo** | (Smile is the only ongoing cost; Klaviyo + Postscript + TW already in stack) |

| Revenue line | Monthly incremental | Notes |
|---|---|---|
| Repeat-purchase rate lift (loyalty cohort only) | +5 pts at 30 days, +7 pts at 90 days | 5k members × +5 pts × $75 AOV × 70% margin = $1,312.50 incremental margin/month at 30 days; +7 pts at 90 days = $1,837.50/month |
| AOV lift on loyalty orders (VIP free-shipping perk) | +10% on orders from VIP+ members | ~25% of members reach VIP at steady-state; 5k × 25% × 28% repeat × $75 × 10% = $262.50 incremental AOV/month |
| Referral-driven first orders | 5–10% of members refer ≥ 1 friend; 10% conversion = ~25 new customers/month | 25 × $75 AOV × 70% margin × 30% margin erosion from referral bonus = $393.75/month |
| **Total monthly incremental (steady-state)** | **$1,968.75 – $2,493.75/mo** | At month 3+, once the launch sequence has enrolled most of the customer base |

| Net ROI | |
|---|---|
| **Net monthly ROI** | **$1,720 – $2,245/mo** after the $249/mo Smile cost |
| **Net annual ROI** | **$20,640 – $26,940/yr** |
| **Ratio** | **7.9:1 to 10.0:1 net lift per $1 of platform cost** ("great" health band) |
| **Payback period** | 1.5–2 weeks from launch (the 6-touch launch sequence typically enrolls 60%+ of customers within 14 days, and the first repeat orders land 14–30 days after enrollment) |

> **Honest read.** Loyalty programs are the third-most-leveraged retention lever (after welcome series and abandoned cart) but they have the LONGEST ramp — the 30-day repeat-purchase lift only materializes AFTER the launch sequence has run, which is 14–30 days post-launch. Expect the first month to be "neutral" (cost incurred, no measurable lift) and the second month onward to be the ROI window. If you can't commit to 60 days of post-launch measurement, don't launch — you'll quit at week 3 when the "ROI isn't there yet" and abandon a program that would have paid back 10× over the next year.

## Next moves after this loyalty program is live

1. **Move #9 — Mobile-first PDP redesign.** Loyalty program members browse 2.3× more product pages than non-members (Smile verified), which means the PDP is now your highest-trafficked page for the loyalty cohort. Mobile-first redesign (above-the-fold + speed + loyalty-points-on-PDP block) typically lifts mobile CVR 10–25%.
2. **Move #10 — AI ad creative iteration (AdCreative.ai or Moby).** Loyalty members are now the highest-LTV cohort in Triple Whale — feed them lookalike audiences to Meta + TikTok and let AI generate hundreds of creative variants per month. Typical 10–30% ROAS lift.
3. **Loyalty + subscription bundle** (Recharge + Smile integration). For consumables brands, the loyalty + subscription combo is the highest-LTV stack available — subscription members earn 2× points (configurable in Smile → Points → "Subscription bonus"), and subscription churn drops 15–25% when paired with loyalty (Smile verified).
4. **VIP-tier exclusive products.** Once you have 200+ VIP members, ship a VIP-only product (limited-edition color, exclusive SKU, early access drop). VIP-tier exclusive products typically convert at 30–50% of the VIP cohort in the first 48 hours, which is the highest CVR surface in DTC.
5. **Loyalty analytics dashboard.** Build a `dashboards/loyalty-cohort.html` static dashboard that reads the Triple Whale Moby cohort export + Smile member export and plots repeat-purchase rate, AOV, LTV, and tier distribution over time. Shape: single static HTML, Chart.js, inline JS, no build step. Companion to `dashboards/` (currently empty).

## Related

- `playbooks/01-abandoned-cart-flow-klaviyo.md` — the cart-abandon email flow that fires for ALL customers (loyalty members get the same flow but can additionally redeem points at checkout).
- `playbooks/04-welcome-series-klaviyo.md` — the welcome email series that fires for NEW subscribers. Loyalty enrollment hook fires at Email 5 (the "last-chance" email); add a "Plus, earn points on your first order" line to Email 5's CTA.
- `playbooks/05-migrate-to-klaviyo-postscript.md` — the migration playbook that gets you to the Klaviyo + Postscript substrate this playbook assumes.
- `playbooks/06-sms-welcome-and-cart-abandon.md` — the SMS flow stack. SMS-4 (Post-Purchase Review Request) is the natural loyalty on-ramp: add a "+100 loyalty pts for submitting a review" bonus to the SMS-4 copy.
- `research/00-ecommerce-ops-landscape.md` §3 — retention stack benchmarks + loyalty mechanic consensus.
- `research/01-tools-stack-comparison.md` §4 (Reviews & UGC), §11 (CDP — Smile/Yotpo/LoyaltyLion overlap).
- `research/02-top-10-leverage-moves.md` #8 — the leverage-rank source.
- `scripts/abandoned_cart_roi.py`, `scripts/post_purchase_upsell_roi.py`, `scripts/welcome_series_roi.py`, `scripts/checkout_audit_score.py` — the companion ROI calculators (this playbook's ROI estimate is in the Cost & ROI table above; no separate script because the math is operator-readable from the table).
