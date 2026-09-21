# Playbook 02 — Post-Purchase One-Click Upsell (ReConvert / AfterSell / Bold)

> **Move #2 from `research/02-top-10-leverage-moves.md`.** Lowest-friction AOV lift in DTC. Adds a one-click upsell page between checkout completion and the thank-you page. **10–20% of customers accept** the offer (ReConvert/AfterSell public case studies), and incremental margin per upsell is **50–80%** because there's no acquisition cost. Expected outcome: **5–15% revenue lift at ~1 day of setup**.
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §2, item 33 (`Post-purchase one-click upsell`).
>
> **Time to ship:** 1–2 days for a small brand. This playbook is paste-ready — every step is a concrete action with a value, a command, or a decision point. No hand-waving.
>
> **Companion script:** `scripts/post_purchase_upsell_roi.py` (forecast your monthly lift before turning the page on; default inputs model a $1M-GMV brand at 35.7:1 net lift per $1 platform cost — run it with your real numbers first).

---

## Goal

Install a post-purchase one-click upsell page in Shopify that:

- Triggers **immediately after** the customer hits "Place Order" but **before** the thank-you page (the "zipper" page)
- Offers **one** complementary product at **30–60% of the original AOV** (price ladder: cheaper than the cart, not a duplicate of the cart)
- Charges the upsell **to the card on file** with a single click — **no re-entry of payment** (this is the entire point of the category)
- Converts at **10–20%** (ReConvert/AfterSell verified benchmark; lower for consumables, higher for apparel/accessories)
- Avoids **cannibalization** of the original order by excluding items already in the cart
- Has a **conditional fallback**: if the upsell is declined, show the customer's original thank-you page as normal (no broken state)
- Is **measurable**: a unique UTM + a dedicated "Upsell Revenue" line in your P&L

---

## Prerequisites

Before you start, confirm all of the following are true. If any are missing, the page will go live but won't perform.

- [ ] **Shopify store** on the Basic plan or higher (the Basic plan's 2% transaction fee applies to upsells too — factor that in).
- [ ] **Shopify Payments** active (ReConvert and AfterSell require Shopify Payments or Stripe for the post-purchase charge).
- [ ] **Customer accounts optional but encouraged** — guest checkout works for the upsell, but having a Shopify customer ID lets you track repeat upsell acceptance.
- [ ] **At least 3 SKUs** in your catalog that are **complementary** to your best-seller (not substitutes). If you sell a $120 blender, the upsell is a $40 recipe book or $30 extra blade — not another blender.
- [ ] **Gross margin on the upsell product** ≥ 50%. The math breaks below that (15% acceptance × $35 × 50% margin = $2.625 margin/order vs $0.10 platform cost = 26:1 ROI — workable; below 50% margin, ROI is marginal).
- [ ] **Brand-voice doc** in `/assets/brand-voice.md` (or your equivalent) — upsell copy must match the existing voice or it reads as a bait-and-switch.
- [ ] **Refund policy** for upsell products — same as your main catalog. The post-purchase charge is non-refundable **only** if your policy says so; otherwise, treat it as a normal line item.

---

## Step-by-step

### Step 1 — Pick the app and plan tier

Two viable options. Pick the one whose pricing model matches your volume.

| App | Pricing | Best for | Notes |
|---|---|---|---|
| **ReConvert** | $24–$99/mo + 0.25% of upsell revenue | $50k+/mo upsell revenue | Cheapest at low volume; 0.25% rev-share kicks in at the $99 tier. |
| **AfterSell** | $29–$99/mo flat | Brands that want predictable cost | Flat pricing regardless of volume. Newer, more polished UI. |
| **Bold Upsell** | $19.99–$49.99/mo flat | Brands already on Bold's bundle/quantity apps | Cross-sells the same audience the same way you already upsell at ATC. |

**Decision rule:**

- **< 500 orders/mo** → **AfterSell $29/mo** (flat, lowest TCO at low volume).
- **500–5,000 orders/mo** → **ReConvert $49/mo** (0.25% rev-share is below the flat alternative until you cross ~$15k upsell/mo).
- **> 5,000 orders/mo** → **ReConvert $99/mo** (predictable cost, no surprise rev-share on a high-revenue month).
- **Already use Bold** for product bundles → **Bold Upsell** (the bundle/upsell UX stays consistent and your team only learns one vendor).

### Step 2 — Install and connect

For ReConvert (the most-installed option; substitute the UI equivalent for AfterSell/Bold):

1. **Shopify App Store → ReConvert → Add app**. Approve the requested permissions (read products, write orders, read customer payment methods). ReConvert can **NOT** create a charge without Shopify's "Post-purchase" extension API — confirm the install banner says "Post-purchase extension enabled" before continuing.
2. **Open ReConvert → Settings → Payment** → confirm "Use Shopify's payment method" is selected (this is the default; it lets ReConvert charge the same card without re-collection).
3. **Open ReConvert → Settings → Branding** → upload your logo, set primary color to your brand hex, set font to your brand font. **Do not** leave the ReConvert purple default — it visually disconnects from your store and depresses conversion.
4. **Settings → Excluded products** → add any SKUs that are already loss-leaders, on closeout, or have shipping restrictions. The upsell engine WILL offer excluded products unless you tell it not to.

### Step 3 — Build the offer (NOT the funnel — the OFFER)

The single biggest predictor of upsell conversion is offer quality. A bad offer with a perfect funnel still converts at 2-3%; a great offer with a janky funnel still converts at 15%.

**The offer rules:**

1. **One offer per page.** Multi-offer pages cut conversion 40-60% (ReConvert verified). Show the customer one product, one price, one button.
2. **Price the upsell at 30–60% of the cart AOV.** A $100 cart gets a $30-60 upsell. Below 30% feels low-stakes (customer skips because "it's only $20"); above 60% feels expensive (customer declines because they just spent $100).
3. **Price ends in .99 or .00** (no $37.50 — it's harder to authorize and reads as "estimate").
4. **The upsell is COMPLEMENTARY, not substitutive.** A $120 blender gets a $40 recipe book, not a $110 cheaper blender.
5. **The product is in stock at the warehouse that ships the original order.** If the upsell ships from a different warehouse, the customer gets TWO packages and the "where's my stuff" WISMO tickets spike.
6. **Use a discount sparingly — 0-10% only.** Discount on the upsell depresses both margin and perceived value. The "you just spent $100, here's a $40 add-on for $35" feels generous WITHOUT a percentage off.
7. **Show a single high-quality product image, not a carousel.** Carousels cut conversion ~25%.

### Step 4 — Build the page

In ReConvert:

1. **Funnels → Create funnel → "Post-purchase upsell"** (NOT "pre-purchase" — pre-purchase upsells on the cart page are confusing; the entire category wins on the post-purchase trigger).
2. **Trigger**: `Order created`. Leave the default `Run for: All customers` (you can segment by tier or country later).
3. **Conditions**:
   - `Order total` between $X and $Y (where X = 2× your upsell price, Y = your highest plausible AOV). This prevents the upsell from showing on $20 carts that can't afford a $35 add-on.
   - `Customer has not purchased` this product before (avoid showing the upsell to repeat buyers who already own it).
   - `Shipping country` = your shippable list (no international if you don't ship internationally).
4. **Page editor** (drag-and-drop):
   - **Headline**: "Add [Product] to your order for just $[Price]?" (under 50 chars)
   - **Subhead**: One sentence on the BENEFIT, not the features. ("Keep your blender running for another year" beats "Compatible blade accessory.")
   - **Image**: Product on white background, square crop, ≥ 600×600px.
   - **CTA**: Green button, "Yes, add it to my order". White button below, "No thanks, take me to my order".
   - **Below the CTA**: a single 12-pt line of trust copy — "✓ One-click, charged to your card on file  ✓ Free returns within 30 days  ✓ Ships with your original order".

### Step 5 — Wire the discount code (optional)

If you want to offer a 0–10% discount on the upsell (only recommended for high-AOV carts > $200):

1. **Shopify → Discounts → Create discount → Fixed amount** (NOT percentage — fixed-amount discounts read as "money off", percentage discounts read as "cheap product").
2. **Discount code**: use a ReConvert-generated unique code (ReConvert has a built-in "Generate discount" toggle in the funnel editor; turn it ON). Single use, expires in 24h.
3. **Apply to**: the upsell product only (NOT the entire cart). ReConvert's UI has a "Apply to specific products" toggle.

### Step 6 — Test the funnel end-to-end BEFORE turning on real traffic

1. **Shopify → Sales channels → Online Store → Themes → [your theme] → Preview** (open in a private window).
2. **Add 2 different products to cart, complete checkout with a real card** (use Shopify's "Bogus Gateway" in dev mode if your plan allows it; otherwise use a $1 test product).
3. **On the post-purchase page**: confirm the upsell shows with the right image, headline, price, CTA color, and discount code (if any).
4. **Click "Yes, add it to my order"** → confirm Shopify charges the upsell amount and the order confirmation includes the upsell as a line item.
5. **Open a SECOND test order**, click "No thanks" → confirm the original thank-you page renders normally and the customer is NOT charged the upsell.
6. **Check the upsell-app dashboard** → confirm both test orders show as "Offer shown" and the upsell order shows as "Offer accepted".

### Step 7 — Enable for 10% of traffic (the rollout)

Do NOT enable for 100% of traffic on day one. Use a ramp:

1. **ReConvert → Funnels → [your funnel] → Trigger → "Show to 10% of customers"**. This is a built-in A/B feature — the other 90% see your normal thank-you page with NO upsell.
2. **Run for 7 days**. Track in ReConvert's dashboard:
   - **Impressions** (orders that saw the upsell)
   - **Acceptance rate** (target: ≥ 10%)
   - **Average upsell value** (target: $25–$50)
   - **Net new revenue** (acceptance × upsell value × 7 days)
3. **Roll forward to 50%** if acceptance ≥ 10% and the page has zero rendering bugs reported by customer support. Hold at 50% for another 7 days.
4. **Roll forward to 100%** if acceptance is still ≥ 10% and refund rate on upsell SKUs is < 5%.
5. **Below 10% acceptance?** Do NOT increase traffic. Pause the funnel and A/B test the offer (different product, different price, different headline). Acceptance below 5% usually means the offer is wrong, not the funnel.

---

## Metrics to track

Every day, in this order:

1. **Upsell acceptance rate** (target ≥ 10%). Below 10%, the offer is wrong — A/B test the product/price/headline.
2. **Incremental revenue** (acceptance × upsell value). This is what goes in the P&L.
3. **Incremental margin** (incremental revenue × upsell gross margin). Below 50% margin, the math gets marginal.
4. **Refund rate on upsell SKUs** (target < 5%). Above 5%, the product is misrepresented or the shipping window is wrong.
5. **WISMO ("where's my order") tickets as % of upsell orders** (target < 8%). Above 8%, the upsell is shipping from a separate warehouse — fix Step 3 rule 5.

Weekly, in your dashboard:

6. **Net new AOV** = (original AOV + incremental revenue per order). This is the headline metric — 5-15% lift is normal; >20% is "great".
7. **ROAS on upsell platform cost** = incremental margin / (monthly app fee + 0.25% rev-share if applicable). The script `post_purchase_upsell_roi.py` forecasts this for you.
8. **Cannibalization check**: are the upsell SKUs ALSO showing up as direct purchases less often? If yes, customers are deferring the original-product purchase in favor of waiting for the upsell — that means your pricing is off, not the funnel.

---

## Common pitfalls

1. **Pricing the upsell too high.** >60% of cart AOV kills conversion. Customer psychology says "I just spent $100, $50 add-on feels safe; $80 add-on feels like I'm being hustled."
2. **Showing a substitute instead of a complement.** A $40 blender as upsell to a $120 blender → 3-5% acceptance. A $40 recipe book as upsell to a $120 blender → 18-22% acceptance.
3. **No image, or a tiny product image.** Upsell pages render on mobile in 1-2 seconds; a missing image is a deal-breaker.
4. **Multi-offer page.** Two products = choice paralysis = conversion halves. ONE offer per page.
5. **Discount higher than 10%.** Discounts above 10% on the upsell depress perceived value AND margin. The "you just spent $100, here's a $40 add-on for $35" without a percentage off converts higher AND protects margin.
6. **Forgetting the "No thanks" path.** If the customer declines and the page loops, errors, or hangs, you get a chargeback and a 1-star review. Test the "No thanks" path as carefully as the "Yes" path.
7. **Shipping from a separate warehouse.** Two packages, two tracking numbers, two WISMO tickets. Tie the upsell SKU to the same warehouse as the original product.
8. **ReConvert purple default branding.** It visually disconnects from your store. Spend 5 minutes in the Branding tab.
9. **100% rollout on day one.** Use the 10% → 50% → 100% ramp. A bug at 100% is a brand-trust hit; a bug at 10% is a private learning.
10. **Not checking the discount code stack.** If you ALSO have a 10% first-order discount running, the upsell discount may stack and you're giving away 19% on a $35 upsell — margin turns negative. Test discount stacking on test orders.
11. **Tracking upsell revenue in your main P&L** without separating it. Ops will attribute the lift to the original product and double-spend on acquisition. Tag every upsell order with a UTM and a custom line item, then segment in your dashboard.
12. **Stopping the experiment at "10% acceptance".** 10% is the floor, not the ceiling. A/B-test the headline, the image, the price — most brands land at 15-20% with two rounds of iteration.

---

## Verification

Run this 7-step gate after Step 7 above to confirm the rollout is healthy:

```bash
# 1. Confirm the script forecasts a "great" health band for your inputs:
python3 scripts/post_purchase_upsell_roi.py --orders 1000 --aov 80 --acceptance 0.15 --upsell-aov 35 --margin 0.70 --cost 0.10
#   Expect: ROI ratio ~35:1, Health band: great

# 2. JSON roundtrip:
python3 scripts/post_purchase_upsell_roi.py --json | python3 -c "import json,sys; json.load(sys.stdin); print('JSON OK')"
#   Expect: "JSON OK"

# 3. Confirm the script rejects negative AOV (validation works):
python3 scripts/post_purchase_upsell_roi.py --aov -50
#   Expect: exit code != 0, stderr mentions "aov must be > 0"

# 4. Confirm both test suites are green:
python3 scripts/tests/test_post_purchase_upsell_roi.py
python3 scripts/tests/test_abandoned_cart_roi.py
#   Expect: 26 passed, 15 passed
```

Operational checks (ReConvert dashboard):

5. **Acceptance rate ≥ 10%** in the funnel dashboard (7-day rolling).
6. **Zero "page error" events** in the funnel's analytics tab (broken "No thanks" path is the most common silent failure).
7. **Refund rate on upsell SKUs < 5%** in the last 30 days (compared to your non-upsell refund rate as the baseline).

If any check fails, pause the funnel at 10% traffic and debug before increasing. The script `post_purchase_upsell_roi.py` will tell you the FORECAST ROI; only the dashboard tells you the REAL one.
