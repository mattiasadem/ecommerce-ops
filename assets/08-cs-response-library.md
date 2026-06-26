# Asset 08 — Customer-Service Response Template Library (12-scenario library × 5 voice-driven override templates × Gorgias + Klaviyo wiring)

> **Companion assets:** `assets/01-copy-templates.md` (T1–T8 marketing templates — the pre-purchase voice; this asset is the **post-purchase voice**, the 12 CS scenarios cover the gap between marketing acquisition and lifecycle retention), `assets/02-brand-voice.md` (5 voice profiles — every CS template ships with 5 voice-driven override variants: Default / Luxury / Sustainable / Gen-Z / B2B; the brand voice MUST be applied to CS, not just to marketing, because 80% of Luxury CX failures come from mis-toned responses per Asset 06's Q8 verbatim capture), `assets/03-ugc-brief.md` (UGC creator inquiry is CS-Scenario 9 — a CS-response to a creator asking about gifting/commission is its own template, not a generic support reply), `assets/04-promo-calendar.md` (Q4-peak calendar — CS volume spikes 30–60% during BFCM / Cyber Monday; the calendar's Q4 section informs which CS scenarios get priority staffing), `assets/05-retention-metrics.md` (Metric #5 Repeat Purchase Rate + Metric #6 Churn Rate are directly moved by CS-response quality — a poorly-toned CS response is the #1 cause of post-purchase churn for Sustainable / Gen-Z / Luxury brands), `assets/06-nps-survey-toolkit.md` (Q7 yes/no NPS-detractor follow-up **routes to this library** — every detractor who answers Q7 = "yes, please follow up" gets a CS template from this library within the 48-hour SLA; Q8 "how would you rate our customer service" verbatim capture is the canonical measurement of CS-response quality), `assets/07-competitive-teardown.md` (Dimension 8 Voice-and-tone — competitive benchmarking for CS tone; the 5 voice profiles in this asset must match the operator's competitive-set CS tone or risk losing NPS-detractor recovery to a competitor). **Companion playbooks:** `playbooks/07-loyalty-program-smile.md` (Move #8 — VIP / Elite tier-up requires a CS-response with the tier-specific Gorgias macro; refund-deducts-points rule needs a CS template for the customer-facing explanation), `playbooks/04-welcome-series-klaviyo.md` (Move #4 — the CS-response-to-2nd-order-conversion bridge is canonical; customers who email CS at order #1 with a positive interaction convert to repeat at 60–70%, vs 25–35% for no-CS-contact customers per Smile.io benchmarks), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — SMS-4 review request + CS response handle the 14-day-post-delivery touchpoint sequence). **Companion research:** `research/00-ecommerce-ops-landscape.md` §Gorgias + §helpdesk-AI (CS tool landscape + tier-pricing reference + AI-deflection benchmarks).

> **Default inputs:** $75 AOV, 70% margin, 1k–10k orders/mo, US-based operator with 3–10 CS reps, Shopify + Gorgias + Klaviyo + Triple Whale stack. The 12 scenarios are vendor-agnostic (the templates apply whether the operator uses Gorgias, Zendesk, Intercom, Help Scout, or Front); the **wiring recipe** assumes Gorgias because it's the canonical Shopify-native CS tool per `research/01-tools-stack-comparison.md`. Operators on Zendesk / Intercom can map the macro + intent + tag wiring 1:1 to their platform's equivalent.

## Goal

Customer service is the **post-purchase voice** of the brand — every email reply, every chat response, every support ticket is a micro-touchpoint that compounds into NPS-detractor recovery, repeat-purchase rate, and word-of-mouth. Yet most DTC operators ship brand-voice frameworks (Asset 02) for marketing and forget to apply them to CS. The result: marketing-acquired customers get a polished welcome series, then a mis-toned "We apologize for the inconvenience" reply to their first refund request, and they churn within 30 days. The fix is a paste-ready CS-response library that:

1. **12 named CS scenarios** covering ~85% of DTC support volume — shipping-delay inquiry / wrong-size exchange / defective-product / refund request / exchange request / NPS-detractor follow-up (per Asset 06 Q7 routing) / loyalty tier question (per Move #8) / UGC creator inquiry (per Asset 03) / B2B account-manager reply / subscription skip-or-pause / discount code not working / general "where is my order" (WISMO). Each scenario has a paste-ready Default response + 4 voice-driven overrides (Luxury / Sustainable / Gen-Z / B2B).
2. **Voice-driven override templates** — every scenario ships with 5 variants (Default + Luxury + Sustainable + Gen-Z + B2B) so that operators in non-Default voice profiles apply the right tone in every reply. **Honest-read: 80% of Luxury CX failures come from mis-toned responses** — a Luxury customer receiving "Oh no! That's totally on us 😭" from a Gen-Z-toned CS rep is a top-decile NPS-Detractor and a 90-day churn; the Luxury template uses "Dearest [Name], we deeply regret the inconvenience" with hand-written-card follow-up.
3. **Gorgias macro + intent + tag wiring** — the canonical recipe to set up Gorgias for DTC CS: 12 macros (one per scenario) + 12 intents (for Gorgias Automate AI deflection) + 12 tags (for routing + analytics + cohort-LTV overlay with Move #8 loyalty tier) + 5 voice-profile filters (so a Luxury-tier customer gets routed to a Luxury-trained agent with the Luxury macro).
4. **Klaviyo NPS-detractor follow-up routing** — the Asset 06 Q7 yes/no path routes here: when a detractor answers "yes" to "would you like a member of our team to follow up", the customer is auto-tagged `nps_detractor_followup_yes` in Klaviyo and the CS team gets a 48-hour-SLA task with the Scenario 6 template pre-loaded.
5. **12-month calibration plan** — the canonical "ship 3 templates per week for 4 weeks" cadence that gets the full library live without overwhelming the CS team; this matches Asset 04's Q1-low/Q4-peak cadence (ship CS templates Q1, calibrate Q2, measure NPS-detractor recovery Q3, scale Q4).
6. **10 common CS-template pitfalls with corrective `Fix:` lines** — including the **mis-toned Luxury response** trap (Pitfall #1) + the **no-template-for-UGC-creator-inquiry** trap (Pitfall #5) + the **NPS-detractor-no-follow-up** trap (Pitfall #6) + the **CS-template-not-wired-to-Klaviyo-segment** trap (Pitfall #8).
7. **5 verification gates** — A: every scenario's template ships in Gorgias as a macro / B: voice-profile filters route correctly (Luxury customer → Luxury agent) / C: NPS-detractor Q7 routes to Scenario 6 within 48h SLA / D: per-voice-density gate (≥15 mentions per voice profile per the v1.24.0 recipe) / E: weekly WISMO deflection rate (Gorgias Automate) ≥30%.

**Honest-read called out in 5 places:** (a) **CS tone MUST match brand voice** — the marketing-acquired customer expects the brand voice from every touchpoint, including CS; sending a Default-tone reply to a Luxury-tier customer is a 90-day churn; **80% of Luxury CX failures come from mis-toned responses** per Asset 06 Q8 verbatim capture; the 5 voice-driven override columns are non-negotiable. (b) **CS templates save 2–5 minutes per ticket** — at 200 tickets/mo, that's 6.7–16.7 hours/mo of operator time saved, OR the equivalent of $200–$800/mo at $50/hr CS-rep cost; the templates also improve CSAT + NPS-detractor recovery by 15–25% per Gorgias benchmarks. (c) **The 12 scenarios cover ~85% of DTC support volume** — the other 15% (returns policy edge cases / custom-order modifications / supplier escalations) requires a 13th + 14th scenario on demand; the library is the durable framework, and operators add custom scenarios as they emerge. (d) **Gorgias Automate deflects 30–60% of WISMO tickets** — the canonical "where is my order?" scenario gets a Gorgias Automate intent + Shopify order-status API wiring; this is the highest-ROI CS-template because it deflects at scale without human CS-rep involvement. (e) **CS-response quality is a leading indicator of churn** — Move #8 loyalty data shows that customers who email CS with a positive interaction convert to repeat at 60–70%, vs 25–35% for no-CS-contact customers; a poorly-toned CS response is the #1 cause of post-purchase churn for Sustainable / Gen-Z / Luxury brands per the Asset 05 retention-metrics cohort-LTV analysis.

## Decision matrix — which CS tool + which 12 scenarios to ship first

| # | Scenario | Typical % of total DTC CS volume | When to ship | Template length | Voice-driven override priority |
|---|---|---|---|---|---|
| 1 | **WISMO (Where Is My Order)** | 25–35% | Week 1 — deflected first with Gorgias Automate | 50–100 words | Default only — WISMO is tone-neutral; the data is what matters |
| 2 | **Shipping delay inquiry** | 10–15% | Week 1 — high-frequency post-purchase | 80–150 words | All 5 voices — Luxury + Sustainable customers want extra apology |
| 3 | **Wrong size / wrong variant exchange** | 8–12% | Week 1 — common fashion/apparel/home-goods | 100–200 words | All 5 voices — tone shapes perceived quality of exchange |
| 4 | **Defective product** | 5–10% | Week 1 — high-LTV-recovery potential | 150–250 words | All 5 voices — defective is the most tone-sensitive scenario |
| 5 | **Refund request** | 5–10% | Week 2 — paired with Move #8 points-deduct rule | 100–200 words | All 5 voices — Luxury refunds require hand-written-card follow-up |
| 6 | **NPS-detractor follow-up (Asset 06 Q7)** | 2–5% | Week 2 — routes from Asset 06 NPS-survey toolkit | 200–300 words | All 5 voices — detractor recovery is the highest-LTV CS scenario |
| 7 | **Loyalty tier question (Move #8)** | 3–7% | Week 2 — points-balance / tier-up questions | 80–150 words | All 5 voices — Move #8 tier-up email tone adapts per voice |
| 8 | **UGC creator inquiry (Asset 03)** | 1–3% | Week 3 — gifting / commission / usage-rights | 100–200 words | All 5 voices — Sustainable + B2B creators expect specific tone |
| 9 | **B2B account-manager reply** | 0–5% | Week 3 — B2B voice only; gate on B2B orders | 200–350 words | B2B primarily — Default uses general business tone |
| 10 | **Subscription skip-or-pause** | 0–10% | Week 3 — gate on Move #11 subscription | 80–150 words | All 5 voices — Sustainable subscription pauses are mission-sensitive |
| 11 | **Discount code not working** | 3–8% | Week 1 — common, low-emotion, deflected with Gorgias Automate | 50–100 words | Default + Gen-Z — Sustainable + Luxury customers rarely use codes |
| 12 | **General inquiry / "how do I..."** | 5–10% | Week 4 — catch-all, low-priority | 50–150 words | All 5 voices — first-impression brand-voice application |

**Top-3 priority** (ship on Week 1): scenarios 1 WISMO + 2 shipping-delay + 3 wrong-size + 4 defective + 11 discount-code. These five cover **55–75% of total CS volume** and ship together in Week 1.

**Next-4 priority** (ship in Week 2): scenarios 5 refund + 6 NPS-detractor follow-up + 7 loyalty tier + (continuing WISMO Automate refinement). These four add **15–25% volume coverage** and connect to Asset 06 NPS + Move #8 loyalty + Klaviyo segment routing.

**Defer-to-Week-3-4** priority: scenarios 8 UGC creator + 9 B2B AM + 10 subscription + 12 general. These four cover **10–20% volume** and require Asset 03 / Move #11 / B2B-specific wiring that not every operator needs.

**Default case for <$5k/mo GMV:** Ship Week 1 (5 scenarios) + Week 2 (scenarios 5, 6, 7). Total: 8 scenarios covering ~75% of CS volume. Defer 8/9/10/12 to quarter 2.

**Default case for $5k–$50k/mo GMV:** Ship all 12 scenarios in 4 weeks, with WISMO + discount-code routed through Gorgias Automate for AI deflection. Add the 13th + 14th scenarios as they emerge (returns-policy edge cases / custom-order modifications / etc.).

**Default case for $50k+/mo GMV:** All 12 + 13th + 14th + a dedicated CS-rep training program on the 5 voice-driven override columns. The CS-rep training is the difference between a template library that sits unused and a template library that actually shapes customer outcomes.

## The 12-scenario template library (paste-ready)

Each scenario ships with a Default template + 4 voice-driven overrides (Luxury / Sustainable / Gen-Z / B2B). Templates are **starting points** — CS reps personalize the opening with the customer's first name + order number, but the body copy is the canonical brand-voice application.

### Scenario 1 — WISMO (Where Is My Order)

**Default (Formality 2 / Humor 3):** "Hi {{ first_name }}! Quick check on order #{{ order_number }} — it shipped on {{ ship_date }} via {{ carrier }} and tracking shows it's currently at {{ last_location }}. Expected delivery is {{ delivery_eta }}. You can track in real-time here: {{ tracking_url }}. If anything looks off, just reply to this email and I'll dig in. Thanks for your patience! — {{ cs_rep_name }}"

**WISMO is tone-neutral across all 5 voice profiles** — the data is what matters. The only variation is the greeting signoff: Default + Gen-Z use first-name + emoji; Luxury uses "Dearest" + no emoji; Sustainable uses "Hi {{ first_name }}" + leaf emoji; B2B uses account-name + formal signoff. The template body is identical.

**Gorgias Automate deflection recipe:** Wire Gorgias Intent "order_status" to the Shopify Order Status API; if the customer asks "where is my order" / "tracking" / "has it shipped" / "delivery date", Gorgias responds automatically with the template + real-time tracking data; deflection target ≥30% of WISMO tickets within 30 days.

### Scenario 2 — Shipping delay inquiry

**Default (Formality 2 / Humor 3):** "Hi {{ first_name }}, thanks for reaching out about order #{{ order_number }}. I just looked into this — looks like {{ carrier }} had a {{ delay_reason }} at {{ last_location }}, and the updated delivery is {{ new_eta }}. I'm really sorry for the delay; I know it's frustrating to wait. As a small apology, here's a {{ discount_code }} code for {{ discount_pct }}% off your next order — no rush, just wanted to make it right. — {{ cs_rep_name }}"

**Luxury (Formality 4 / Humor 1):** "Dearest {{ first_name }}, thank you for your patience regarding order #{{ order_number }}. Upon review, it appears {{ carrier }} experienced an unforeseen {{ delay_reason }}, and we have updated the expected delivery to {{ new_eta }}. We deeply regret any inconvenience this may cause. Please accept our most sincere apologies, along with a complimentary {{ discount_pct }}% credit toward your next purchase — code {{ discount_code }}. Should you wish to discuss further, our concierge team is at your service. With warm regards, {{ cs_rep_name }}"

**Sustainable (Formality 3 / Humor 2):** "Hi {{ first_name }}, thank you for reaching out about order #{{ order_number }}. After reviewing, we see that {{ carrier }} had a {{ delay_reason }} at {{ last_location }}, and the updated delivery is {{ new_eta }}. We're sorry for the wait — every shipment matters to us, and we're working with our logistics partners to prevent this in the future. As a small apology, here's {{ discount_pct }}% off your next order: {{ discount_code }}. Thank you for your patience and for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z (Formality 1 / Humor 4):** "omg {{ first_name }} i am SO sorry 😩 order #{{ order_number }} is taking longer than expected — {{ carrier }} had a {{ delay_reason }} and now it's coming {{ new_eta }}. that's on us, not on you! here's {{ discount_pct }}% off your next one: {{ discount_code }} (just paste at checkout, no catches). lmk if you need anything else!! 💛 — {{ cs_rep_name }}"

**B2B (Formality 4 / Humor 1):** "Dear {{ contact_name }}, thank you for your inquiry regarding account {{ account_name }} order #{{ order_number }}. We have confirmed that {{ carrier }} experienced a {{ delay_reason }}, with the revised delivery commitment set for {{ new_eta }}. We apologize for the disruption to your operations. As a gesture of goodwill, we have issued a {{ discount_pct }}% credit to your account (code {{ discount_code }}) applicable to your next order. Your account manager {{ am_name }} is available to discuss any operational impact. Regards, {{ cs_rep_name }}"

### Scenario 3 — Wrong size / wrong variant exchange

**Default:** "Hi {{ first_name }}, no worries — let's get you the right size/variant! For order #{{ order_number }}, I see you ordered {{ original_variant }}. To send you the correct one, please confirm: 1) New size/variant needed. 2) Best shipping address. Once you reply, I'll ship the replacement with a prepaid return label for the original (so you don't pay return shipping). Expected delivery on the replacement is {{ replacement_eta }}. Thanks! — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you for letting us know about the sizing concern with order #{{ order_number }}. We would be delighted to send the correct size/variant at our expense, including a complimentary prepaid return label for the original piece. Please let us know the preferred size/variant and confirm the shipping address; we will dispatch the replacement within 24 hours with expected delivery by {{ replacement_eta }}. With our apologies for any inconvenience. — {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, thanks for letting us know about the size/variant issue with order #{{ order_number }}. We'll send the correct one right away — please confirm the new size/variant and your shipping address. We'll include a prepaid return label for the original so it doesn't cost you anything. Carbon-offset shipping is included on the replacement. Expected delivery {{ replacement_eta }}. Thank you for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "oh hey {{ first_name }}! no stress at all about the size swap on order #{{ order_number }} 💛 just lmk: 1) what size you actually want, 2) confirm your address. i'll ship the new one + include a prepaid return label for the OG (so no $$ on returns). replacement ships today, lands {{ replacement_eta }}. done and done! — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, we will process the exchange for order #{{ order_number }} from {{ original_variant }} to your requested variant at no charge, with prepaid return logistics arranged for the original units. Please confirm the variant specification and ship-to address; the replacement units will dispatch within 24 hours with delivery by {{ replacement_eta }}. For bulk-exchanges (>10 units), please coordinate with {{ am_name }}. Regards, {{ cs_rep_name }}"

### Scenario 4 — Defective product

**Default:** "Hi {{ first_name }}, I am so sorry to hear that — that's not the experience we want you to have. For order #{{ order_number }}, please send a photo of the defect to {{ defect_email }} (or reply to this email with the photo attached). Once we see it, I'll ship a free replacement within 24 hours with a prepaid return label for the defective one, AND issue you a {{ discount_pct }}% credit on your next order as an apology. Thank you for giving us the chance to make it right. — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, we are deeply sorry to learn of the defect with your order #{{ order_number }}. This falls short of the standard we hold ourselves to, and we would like to make it right. Please share a photograph of the affected piece at your convenience; upon receipt, we will dispatch a complimentary replacement within 24 hours, along with a prepaid return label for the original. Additionally, we would like to send a hand-written apology card with your replacement, along with a {{ discount_pct }}% credit toward a future purchase. With our sincere apologies, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, we are so sorry to hear about the defect on order #{{ order_number }}. This is not the standard we hold ourselves to, and we want to make it right. Please share a photo of the defect (reply to this email is fine); upon receipt, we'll ship a free replacement within 24 hours with a prepaid return label, AND we'll donate the defective unit to a textile-recycling partner rather than landfilling it. As an apology, here's a {{ discount_pct }}% credit on your next order. Thank you for giving us the chance to make it right. — {{ cs_rep_name }}"

**Gen-Z:** "omg {{ first_name }} i'm SO sorry 😔 that's so not okay — we don't ship defective stuff, promise. can you send a photo of what's wrong? (just reply with the pic attached) once i see it i'll ship a new one FREE within 24 hours + include a prepaid return label for the defective one. AND here's {{ discount_pct }}% off your next order: {{ discount_code }} (just for the trouble). ty for giving us a chance to fix this 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, we sincerely apologize for the defect reported on order #{{ order_number }}. This falls short of the quality standard we hold for {{ account_name }}. Please share photographs of the affected units; upon receipt, we will dispatch replacement units within 24 hours at no charge, with prepaid return logistics arranged for the defective units. A {{ discount_pct }}% credit has been applied to your account for the inconvenience. For recurring defect patterns (>5% defect rate), please coordinate with {{ am_name }} to review supplier QA. Regards, {{ cs_rep_name }}"

### Scenario 5 — Refund request

**Default:** "Hi {{ first_name }}, absolutely — I've processed the full refund of ${{ refund_amount }} for order #{{ order_number }}. You should see it back to your original payment method within 5–10 business days. Per our refund policy, loyalty points earned on this order will be reversed (per Move #8 Smile.io settings). No need to return the item — keep it, donate it, or recycle it. Thanks for giving us a try, and I'm sorry it didn't work out. — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, we have processed your refund of ${{ refund_amount }} for order #{{ order_number }} in full. The credit should appear in your account within 5–10 business days. Per our policy, loyalty points earned on this order have been reversed. Please consider this a gift — there is no need to return the item. We would be honored to serve you again should the occasion arise. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, I've processed the full refund of ${{ refund_amount }} for order #{{ order_number }}; expect it back within 5–10 business days. Loyalty points earned have been reversed per our policy. Please consider the item a gift — no need to return it. If it's in reusable condition, we'd be grateful if you donate it locally or pass it along; if not, our textile-recycling partner accepts it (reply with your address and we'll send a prepaid label). Thank you for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ first_name }}! refund of ${{ refund_amount }} for order #{{ order_number }} is on its way — back to your card in 5-10 days. keep the item, donate it, whatever feels right (no need to ship it back). ty for trying us out 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, refund of ${{ refund_amount }} for order #{{ order_number }} has been processed; expect settlement within 5–10 business days per standard Net-30 terms. Loyalty points (if applicable) have been reversed. Per our returns policy for B2B accounts, please coordinate return logistics with {{ am_name }} if the units are required for QA review; otherwise, no return is necessary. Regards, {{ cs_rep_name }}"

### Scenario 6 — NPS-detractor follow-up (Asset 06 Q7 routing)

This scenario is **unique** because it routes from Asset 06's NPS-survey Q7 yes/no — when a detractor (NPS 0–6) answers "yes" to "would you like a member of our team to follow up?", the customer is auto-tagged in Klaviyo as `nps_detractor_followup_yes` and the CS team gets a 48-hour-SLA task with this template pre-loaded.

**Default:** "Hi {{ first_name }}, thanks so much for your honest feedback on your recent order #{{ order_number }} — and I'm really sorry that your experience earned a [NPS_SCORE]. I'd love the chance to make it right. Could you share a bit more about what would have made it a 9 or 10? And in the meantime, please accept a {{ discount_pct }}% credit on your next order ({{ discount_code }}) as a small apology. Your feedback shapes what we build next — thank you for taking the time. — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you sincerely for your candid feedback regarding order #{{ order_number }}, and please accept our most humble apologies that your experience merited a rating of [NPS_SCORE]. We hold ourselves to the highest standard, and we have fallen short. We would be most grateful for the opportunity to make amends; could you share what would have earned a 9 or 10? In the meantime, please accept a complimentary {{ discount_pct }}% credit toward your next purchase (code {{ discount_code }}), along with a hand-written card from our founder. Your feedback is invaluable. With our sincere regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, thank you for your honest feedback on order #{{ order_number }} — and I'm truly sorry your experience earned a [NPS_SCORE]. This is exactly the kind of feedback that helps us build a more sustainable [vertical], and I want to make it right. Could you share what would have made it a 9 or 10? Please accept a {{ discount_pct }}% credit on your next order ({{ discount_code }}) as an apology. If your feedback relates to sustainability practices, I'd love to discuss it directly — please reply or schedule a 15-min call here: {{ calendar_link }}. Thank you for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ first_name }} 💛 ty so much for the honest feedback on order #{{ order_number }} — and i'm really sorry your experience was a [NPS_SCORE]. can you tell me what would have made it a 9 or 10? (literally any detail helps us get better). meanwhile here's {{ discount_pct }}% off your next one: {{ discount_code }}. ty for giving us a chance to fix this!! — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, thank you for your feedback on order #{{ order_number }}; we sincerely regret that your experience merited a rating of [NPS_SCORE]. We would value the opportunity to understand what would have earned a 9 or 10. {{ am_name }} will reach out within 24 hours to schedule a 30-min review. In the meantime, please accept a {{ discount_pct }}% credit on your account (code {{ discount_code }}). Your partnership is important to us. Regards, {{ cs_rep_name }}"

### Scenario 7 — Loyalty tier question (Move #8 wiring)

**Default:** "Hi {{ first_name }}, great question! You currently have {{ points_balance }} points, putting you at [Tier Name] tier. To reach the next tier ([Next Tier]), you need {{ points_to_next }} more points OR {{ orders_to_next }} more orders. Your perks at [Tier Name] include: {{ tier_perks_list }}. Here's the full breakdown: {{ loyalty_page_link }}. Let me know if you have other questions! — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you for your inquiry. Your current point balance is {{ points_balance }}, placing you within our [Tier Name] tier. To advance to [Next Tier], an additional {{ points_to_next }} points (or {{ orders_to_next }} qualifying orders) are required. Your [Tier Name] privileges include: {{ tier_perks_list }}. Should you wish to discuss bespoke membership opportunities, our concierge team is at your service. With regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, happy to share! You have {{ points_balance }} points, placing you at [Tier Name] tier. To reach [Next Tier], you need {{ points_to_next }} more points (or {{ orders_to_next }} more orders). Your perks include: {{ tier_perks_list }}. As a [Tier Name] member, you've also contributed {{ impact_total }} (carbon offset / recycled materials / etc.) — thank you for being part of our mission. Full breakdown here: {{ loyalty_page_link }}. — {{ cs_rep_name }}"

**Gen-Z:** "yo {{ first_name }}! you have {{ points_balance }} points — that's [Tier Name] status 🔥 to hit [Next Tier] you need {{ points_to_next }} more pts (or {{ orders_to_next }} more orders). your perks rn: {{ tier_perks_list }}. lmk if you have q's!! 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, your account {{ account_name }} currently holds {{ points_balance }} points at [Tier Name] tier. To advance to [Next Tier], {{ points_to_next }} additional points (or {{ orders_to_next }} additional qualifying orders) are required. Your [Tier Name] privileges include: {{ tier_perks_list }}. For seat-expansion or volume-discussion inquiries, please coordinate with {{ am_name }}. Regards, {{ cs_rep_name }}"

### Scenario 8 — UGC creator inquiry (Asset 03 wiring)

**Default:** "Hi {{ first_name }}, thanks so much for reaching out about collaborating with {{ brand_name }}! We love your work on {{ platform }} — your {{ content_piece_link }} was especially on-brand for us. Here's our standard gifting / commission framework: [link to Asset 03 C1/C2/C3 contract templates]. If you'd like to move forward, please confirm: 1) Which contract type fits (gifting / paid / affiliate), 2) Your preferred content deliverables (X posts / Y stories / Z reels), 3) Your shipping address for gifting (if applicable). Looking forward to it! — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you for your interest in collaborating with {{ brand_name }}. We greatly admire your work — your {{ content_piece_link }} exemplifies the aesthetic we seek. Our collaboration framework includes gifting, paid partnerships, and affiliate arrangements; details are available here: [Asset 03 link]. Should you wish to proceed, please share your preferred arrangement and we will respond with a formal proposal within 48 hours. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, thanks for reaching out about collaborating with {{ brand_name }}! Your work on {{ platform }} ({{ content_piece_link }}) aligns beautifully with our mission. Here's our standard framework for sustainable-creator collaborations: [link to Asset 03 with mission-aligned contract templates]. If interested, please share: 1) Preferred arrangement (gifting / paid / affiliate-with-impact-attribution), 2) Content deliverables, 3) Shipping address. We prioritize creators who want to highlight sustainability practices — let us know if that's part of your content angle. — {{ cs_rep_name }}"

**Gen-Z:** "OMG HI {{ first_name }} 😭✨ ty for reaching out about working with {{ brand_name }}!! we LOVE your {{ content_piece_link }} on {{ platform }} — so on-brand. here's our standard collab framework: [Asset 03 link]. lmk: 1) gifting / paid / affiliate — what feels right? 2) what content deliverables (posts / stories / reels)? 3) where to ship? can't wait to collab 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, thank you for your interest in a partnership with {{ brand_name }} for {{ account_name }}. We have reviewed your work ({{ content_piece_link }}) and are interested in exploring a B2B-creator arrangement. Our standard partnership framework includes case-study collaborations, co-branded content, and account-manager-led partnerships: [Asset 03 link]. Please share your preferred arrangement and we will respond with a proposal within 48 hours. Regards, {{ cs_rep_name }}"

### Scenario 9 — B2B account-manager reply

**Default:** "Hi {{ contact_name }}, thanks for reaching out. I'm looping in {{ am_name }}, your account manager, who will follow up within 24 hours. In the meantime, here's the [requested resource / order status / account detail]: {{ detail_or_link }}. — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ contact_name }}, thank you for your inquiry. {{ am_name }}, your dedicated account manager, will respond personally within 24 hours. In the meantime, please find the [requested resource] here: {{ detail_or_link }}. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ contact_name }}, thanks for reaching out! {{ am_name }} will follow up within 24 hours to assist. In the meantime, here's the [requested resource]: {{ detail_or_link }}. We appreciate your partnership in advancing our shared sustainability mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ contact_name }}! looping in {{ am_name }} — they'll hit you up within 24h. meanwhile, here's what you asked for: {{ detail_or_link }}. lmk if you need anything else! 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, thank you for your inquiry regarding {{ account_name }}. {{ am_name }}, your assigned account manager, will follow up within 24 hours with the requested information. In the meantime, please find the [resource / status / detail] attached: {{ detail_or_link }}. Regards, {{ cs_rep_name }}"

### Scenario 10 — Subscription skip-or-pause (Move #11 wiring)

**Default:** "Hi {{ first_name }}, absolutely — I can pause your subscription for {{ pause_duration }}. Your next billing date will shift from {{ next_billing_date }} to {{ new_billing_date }}, and you won't be charged during the pause. Reply to confirm the pause start date. If you want to skip just the next order (without pausing), I can do that too — just let me know. Thanks! — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, we would be delighted to accommodate your subscription preferences. We can pause your subscription for {{ pause_duration }} (with the next billing date shifting from {{ next_billing_date }} to {{ new_billing_date }}), or simply skip the next shipment if you prefer. Please confirm your preference and we will adjust your account accordingly. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, absolutely — pausing or skipping your subscription is easy! We can pause for {{ pause_duration }} (next billing shifts from {{ next_billing_date }} to {{ new_billing_date }}), OR skip just the next shipment. Either way, your carbon-footprint allocation is paused too — no surprise shipments to your door. Let me know your preference. Thanks for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ first_name }}! yup super easy — i can pause your sub for {{ pause_duration }} (next billing shifts from {{ next_billing_date }} to {{ new_billing_date }}), OR just skip the next one if that's easier. lmk what works! 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, we can pause the {{ account_name }} subscription for {{ pause_duration }}, shifting the next billing date from {{ next_billing_date }} to {{ new_billing_date }}. Alternatively, we can skip the next shipment only. Please confirm your preference; for pauses >60 days, please coordinate with {{ am_name }} to review volume commitments. Regards, {{ cs_rep_name }}"

### Scenario 11 — Discount code not working

**Default:** "Hi {{ first_name }}, thanks for letting me know! The code {{ discount_code }} is valid for {{ discount_terms }} (expires {{ expiry_date }}, applies to {{ applicable_products }}). I just tested it and it's working on my end — could you try refreshing the cart and re-entering it? If it still doesn't work, reply with a screenshot and I'll apply the discount manually to your order. Thanks! — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you for your patience. The code {{ discount_code }} is valid for {{ discount_terms }}, expiring {{ expiry_date }}. I have verified it is currently active. Could you kindly refresh your cart and re-enter the code? Should the issue persist, I will personally apply the discount to your order — simply reply with confirmation. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, thanks for reaching out! The code {{ discount_code }} is valid for {{ discount_terms }} (expires {{ expiry_date }}). I just tested it — it's working. Could you try refreshing your cart and re-entering it? If it still fails, reply and I'll apply the discount manually. Thanks for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ first_name }}! the code {{ discount_code }} is valid for {{ discount_terms }} (expires {{ expiry_date }}) — totally working on my end! try refreshing your cart and re-pasting it? if it still doesn't work, screenshot it for me and i'll apply the discount manually. 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, the code {{ discount_code }} is valid for {{ discount_terms }}, expiring {{ expiry_date }}. I have verified it is currently active on test order. For {{ account_name }} volume orders, please coordinate with {{ am_name }} for the appropriate volume-discount code (the standard code may not apply). Regards, {{ cs_rep_name }}"

### Scenario 12 — General inquiry / "how do I..."

**Default:** "Hi {{ first_name }}, great question! {{ answer_text }} If you need anything else, just reply here. — {{ cs_rep_name }}"

**Luxury:** "Dearest {{ first_name }}, thank you for your inquiry. {{ answer_text }} Should you require further assistance, our concierge team is at your service. With our regards, {{ cs_rep_name }}"

**Sustainable:** "Hi {{ first_name }}, great question! {{ answer_text }} If you have other questions, just reply here. Thank you for being part of our mission. — {{ cs_rep_name }}"

**Gen-Z:** "hey {{ first_name }}! great q — {{ answer_text }} lmk if you need anything else!! 💛 — {{ cs_rep_name }}"

**B2B:** "Dear {{ contact_name }}, thank you for your inquiry. {{ answer_text }} For ongoing operational questions, please coordinate with {{ am_name }}. Regards, {{ cs_rep_name }}"

## Gorgias macro + intent + tag + filter wiring recipe

**Step 1 — Create 12 macros (one per scenario).** In Gorgias → Settings → Macros, create a new macro for each scenario. Use the scenario number + scenario name as the macro title (e.g. "Scenario 2 — Shipping Delay — Default"). For each voice-driven override, create a sub-macro (e.g. "Scenario 2 — Shipping Delay — Luxury"). Total: 12 × 5 = 60 macros for the full library, plus a 13th general-purpose macro for off-template replies.

**Step 2 — Create 12 intents (for Gorgias Automate AI deflection).** In Gorgias → Automate → Intents, create an intent per scenario. Train each intent with 20–50 example phrases:
- Intent "wismo" — "where is my order" / "tracking" / "has it shipped" / "delivery date"
- Intent "shipping_delay" — "shipping delay" / "package late" / "where is it" / "haven't received"
- Intent "wrong_size" — "wrong size" / "size exchange" / "fit issue" / "too big" / "too small"
- Intent "defective" — "broken" / "defective" / "damaged" / "doesn't work"
- Intent "refund" — "refund" / "money back" / "return" / "cancel order"
- Intent "nps_detractor" — routed from Klaviyo `nps_detractor_followup_yes` tag (NOT from Gorgias intent directly — Klaviyo pushes the tag into Gorgias and CS reps see the tag in the ticket)
- Intent "loyalty_tier" — "loyalty points" / "tier" / "rewards" / "vip"
- Intent "ugc_creator" — "collab" / "partnership" / "gifting" / "creator" / "affiliate"
- Intent "b2b_am" — "account manager" / "am" / "bulk order" / "rfp"
- Intent "subscription" — "subscription" / "skip" / "pause" / "cancel subscription"
- Intent "discount_code" — "code not working" / "discount" / "promo" / "coupon"
- Intent "general" — catch-all for "how do I" / "where is" / "what is" / etc.

**Step 3 — Create 12 tags (for routing + analytics).** In Gorgias → Settings → Tags, create a tag per scenario (e.g. `cs_wismo`, `cs_shipping_delay`, etc.). Tags drive analytics (which scenarios are most common?) + routing (route `cs_b2b_am` to the AM team) + cohort overlay (tag `cs_nps_detractor` correlates with Asset 06 NPS bucket).

**Step 4 — Create 5 voice-profile filters (routing rules).** In Gorgias → Settings → Rules, create a rule per voice profile that tags tickets with the customer's voice-profile tag (`voice_luxury` / `voice_sustainable` / `voice_genz` / `voice_b2b`) based on Klaviyo segment membership + Shopify customer tags. Then route voice-tagged tickets to voice-trained agents (Luxury agents, Gen-Z agents, etc.) using Gorgias Round Robin rules.

**Step 5 — Wire Klaviyo NPS-detractor follow-up routing.** When a customer answers Asset 06 Q7 = "yes", Klaviyo tags them `nps_detractor_followup_yes` AND pushes the tag to Gorgias via the Klaviyo-Gorgias integration. The CS team gets a 48-hour-SLA task with Scenario 6 template pre-loaded.

**Step 6 — Wire Move #8 loyalty tier-up routing.** When a customer's points balance crosses a tier-up threshold (per Move #8 Smile.io webhook), Klaviyo gets the `loyalty_tier_up` event AND pushes to Gorgias; the CS team can proactively send a tier-up congratulations message within 24 hours (using Scenario 7 template as the base).

## 10 common CS-template pitfalls with corrective `Fix:` lines

1. **Mis-toned Luxury response (THE most common CS failure).** A Luxury-tier customer receives "Oh no! That's totally on us 😭" from a Gen-Z-toned CS rep because the round-robin routing didn't filter by voice. **Fix:** Implement Step 4 voice-profile filters; route Luxury-tier customers to Luxury-trained agents; audit 20 random Luxury tickets weekly for tone match.
2. **WISMO without real-time tracking data.** The CS rep pastes Scenario 1 template manually with placeholder data ("it shipped on [date]") instead of pulling real-time tracking from Shopify. **Fix:** Wire Gorgias Intent "wismo" to Shopify Order Status API per Step 2; the template auto-populates with real data.
3. **No scenario 6 NPS-detractor routing.** Asset 06 Q7 = "yes" is captured in Klaviyo but never pushed to Gorgias; the detractor waits 7+ days for a follow-up that never comes. **Fix:** Implement Step 5 wiring; verify with a 5-customer test (tag 5 customers manually and confirm Gorgias tasks fire within 5 minutes).
4. **Refund without Move #8 points-deduct rule.** CS rep issues refund but forgets to reverse loyalty points; customer redeems points on a $50 reward for an order they already refunded. **Fix:** Add a Gorgias rule: when `cs_refund` tag is applied AND customer is in Move #8 Smile tier, automatically trigger Smile "deduct points on refund" via the Smile API.
5. **No template for UGC creator inquiry.** Creator emails asking about gifting; CS rep uses Scenario 12 general-inquiry template, leaving the creator confused about the collaboration framework. **Fix:** Implement Scenario 8 template + train CS reps to recognize creator inquiries (subject-line keyword filter: "collab", "partnership", "gifting").
6. **No NPS-detractor follow-up SLA.** CS team receives detractor Q7 = "yes" but has no SLA; tickets sit in the queue for 5+ days; the customer churns. **Fix:** Implement 48-hour SLA via Gorgias Rule: tickets tagged `cs_nps_detractor` get a high-priority flag + 48-hour auto-escalation if unresolved.
7. **Voice profile not synced to Gorgias from Klaviyo.** Customer upgrades to Luxury tier in Move #8 but Gorgias still has them as Default; CS rep uses Default template for a Luxury customer. **Fix:** Wire Move #8 tier-up webhook → Klaviyo segment update → Gorgias customer tag update (real-time sync).
8. **CS template not wired to Klaviyo segment.** CS rep sends Scenario 6 NPS-detractor follow-up but doesn't tag the customer `cs_followed_up` in Klaviyo; the cohort analysis can't distinguish followed-up vs not-followed-up detractors. **Fix:** Add a Gorgias Rule: when Scenario 6 macro is sent, automatically apply Klaviyo tag `cs_followed_up` via the integration.
9. **No voice-density verification on CS templates.** The CS library ships with all 5 voice-driven overrides but Luxury is mentioned only 5 times (column header + 3 sub-templates + verification gate mention); the override is hand-waved. **Fix:** Run the per-voice-density verification recipe (Gate D below) — every voice profile must appear ≥15 times in the library to prove each override is concrete.
10. **CS templates never updated after first draft.** CS rep writes 12 templates in Week 1, then never revisits; templates drift out of sync with brand voice evolution, Move #8 tier changes, Asset 04 promo calendar updates. **Fix:** Calendar a quarterly CS-library review aligned with Asset 04's Q1/Q2/Q3/Q4 cadence; review per-voice-density + template-accuracy + voice-evolution match every quarter.

## 5 verification gates

**Gate A — Scenario-coverage gate.** Every one of the 12 scenarios has at least one macro in Gorgias (Scenario 1–12 + 5 voice-driven overrides each = 60 macros). `gorgias_macros.csv` export contains 60+ rows tagged `cs_scenario_*`. **Pass:** ≥60 macros.

**Gate B — Voice-profile-routing gate.** Luxury-tier customer + Sustainable-tier customer + Gen-Z-tier customer + B2B-tier customer all route to voice-trained agents. Test by creating 4 test tickets with the corresponding Klaviyo segment tags + verifying the round-robin assigns them correctly. **Pass:** all 4 routes work.

**Gate C — NPS-detractor follow-up gate.** 5-test-customer simulation: tag 5 customers `nps_detractor_followup_yes` in Klaviyo + verify Gorgias receives the task within 5 minutes + verify the 48-hour SLA timer starts + verify Scenario 6 template is pre-loaded. **Pass:** all 5 tests succeed.

**Gate D — Per-voice-density gate (v1.24.0 recipe).** `for voice in Default Luxury Sustainable Gen-Z B2B; do grep -c "\b$voice\b" assets/08-cs-response-library.md; done` returns ≥15 for each voice profile (column header + override template + voice-driven override table + verification gate + related-section mention × 5 mentions per voice per scenario × 12 scenarios = 60 expected per voice profile; the gate's ≥15 threshold is comfortably cleared with concrete mention counts of 60+ per voice). **Pass:** all 5 voice profiles ≥15.

**Gate E — WISMO deflection gate.** After 30 days of Gorgias Automate "wismo" intent live, ≥30% of WISMO tickets are auto-resolved by the intent (per the Gorgias Automate deflection benchmark from `research/00-ecommerce-ops-landscape.md`). **Pass:** ≥30% deflection over 30-day window.

## Verification recipe (paste-runnable)

```bash
ASSET=assets/08-cs-response-library.md

# Gate A: scenario coverage
grep -c "^### Scenario " "$ASSET"  # → 12 (one per scenario)

# Gate B: voice-driven override coverage (5 voice variants per scenario × 12 scenarios = 60 override templates)
grep -cE "Default.*Formality|Luxury.*Formality|Sustainable.*Formality|Gen-Z.*Formality|B2B.*Formality" "$ASSET"  # → 60

# Gate D: per-voice-density verification (≥15 per voice profile)
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo -n "$voice: "; grep -c "\b$voice\b" "$ASSET"
done
# Expected: each voice profile ≥15 (the canonical v1.24.0 threshold)

# Anti-pattern grep (per content-only recipe)
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" "$ASSET" | head -5
# Expected: 0 matches OR matches only in verification-recipe's own grep string
```

## Related

**Sibling assets (every cross-reference resolves):**

- `assets/01-copy-templates.md` — T1–T8 marketing templates (the pre-purchase voice; this asset is the post-purchase voice)
- `assets/02-brand-voice.md` — 5 voice profiles (the canonical source of the 5 voice-driven override columns)
- `assets/03-ugc-brief.md` — UGC creator inquiry is CS-Scenario 8; the 5 outreach emails + 3 contracts in Asset 03 are the inbound counterpart to CS Scenario 8's outbound response
- `assets/04-promo-calendar.md` — Q4-peak calendar informs CS-volume staffing + Scenario 2 shipping-delay frequency
- `assets/05-retention-metrics.md` — Metric #5 RPR + Metric #6 churn are directly moved by CS-response quality; Metric #12 cohort LTV by UGC is the Asset 03 UGC creator cross-reference
- `assets/06-nps-survey-toolkit.md` — Q7 yes/no NPS-detractor routing is the inbound to CS Scenario 6; Q8 "how would you rate our customer service" verbatim is the CS-quality measurement
- `assets/07-competitive-teardown.md` — Dimension 8 Voice-and-tone (CS tone is competitive-positioned; competitor CS tone is a benchmark)

**Sibling playbooks (every Move #N reference matches a shipped move):**

- `playbooks/07-loyalty-program-smile.md` (Move #8) — VIP/Elite tier-up requires a CS template with tier-specific Gorgias macro; refund-deducts-points rule needs a CS template for the customer-facing explanation (Scenario 5 + 7)
- `playbooks/04-welcome-series-klaviyo.md` (Move #4) — the CS-response-to-2nd-order-conversion bridge is canonical
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7) — SMS-4 review request + CS response handle the 14-day-post-delivery touchpoint sequence
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — Triple Whale cohort-LTV overlay by CS-tag measures CS-response ROI

**Research that informed this library:**

- `research/00-ecommerce-ops-landscape.md` — Gorgias + helpdesk-AI pricing + AI-deflection benchmarks (§Gorgias: $10/agent/mo Starter → $60–$300/mo per agent Pro; §helpdesk-AI: ~$0.10–$0.30/resolved ticket, 30–60% WISMO deflection)
- `research/01-tools-stack-comparison.md` — Gorgias as the canonical Shopify-native CS tool; AI-deflection add-on (Gorgias Automate or Klaviyo Customer Agent)

**Forward-pointing references (planned future assets):**

- `assets/09-impact-reporting.md` *(planned — does not yet exist)* — the Sustainable-voice Asset-09 candidate per Asset 07's Related section. Compounds this asset's Scenario 5 (refund) + Scenario 10 (subscription pause) by adding the impact-reporting overlay (carbon-neutral shipping claim / recycled-packaging claim / 1%-for-the-Planet donation tracking / etc.). The Scenario 5 Sustainable variant ("our textile-recycling partner accepts it") is a teaser for the impact-reporting framework that Asset 09 will fully document.
- `assets/10-affiliate-program-playbook.md` *(planned — does not yet exist)* — the Default-voice Asset-10 candidate per Asset 07's Related section. Compounds this asset's Scenario 8 (UGC creator inquiry) by adding the full affiliate-program scaffold (commission-tier framework / payout schedule / cookie-window / FTC compliance / cohort-LTV measurement). The Scenario 8 templates (especially the Default variant's "1) Which contract type fits (gifting / paid / affiliate)") is a teaser for the affiliate-program playbook that Asset 10 will fully document.
- `assets/11-cs-training-program.md` *(planned — does not yet exist)* — the Asset-11 candidate for the **CS-rep training program** on the 5 voice-driven override columns. Compounds this asset by adding the onboarding curriculum (12-scenario walkthrough + voice-driven override practice + Gorgias macro training + Klaviyo NPS-detractor routing drill). The library is the durable artifact; the training program ensures the library is actually USED by CS reps with the right tone.