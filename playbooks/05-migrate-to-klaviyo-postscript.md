# Playbook 05 — Migrate to Klaviyo (Email) + Postscript (SMS)

> **Move #5 from `research/02-top-10-leverage-moves.md`.** Migrate from any other ESP/SMS stack to the Klaviyo + Postscript default. Consolidates spend, lifts deliverability, unlocks Shopify-native flows (4 of the 10 top moves — #1 abandoned cart, #4 welcome series, #7 SMS welcome, #10 AI ad creative — assume Klaviyo + Postscript as the substrate). Default: 25k contacts Mailchimp → Klaviyo+Postscript, **−35% ESP cost ($380 → $245/mo)** and **+15% email-attributed revenue** from segmentation + automation, breakeven in 4–6 weeks.
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §2 (channel benchmark), §3 (retention stack), `research/01-tools-stack-comparison.md` §2 (ESP pricing & honest-read), `research/02-top-10-leverage-moves.md` #5.
>
> **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md`, `playbooks/04-welcome-series-klaviyo.md` (the "destination state" — what your Klaviyo+Postscript stack should look like after migration).
>
> **Time to ship:** 1 week for a small brand (≤50k contacts), 2–3 weeks for ≥100k contacts. Cutover itself is a 48–72h window; the rest is warm-up + flow rebuild.

---

## Goal

Move your email + SMS stack from any other platform (Mailchimp, Klaviyo-only, Attentive-only, Sendlane, Brevo, HubSpot Marketing Hub, Iterable, Customer.io, ActiveCampaign) to **Klaviyo (email) + Postscript (SMS)** with:

- **Zero lost automation:** every active flow on the source ESP has an equivalent (or better) flow in Klaviyo, built and tested before cutover
- **Zero suppression gaps:** the welcome-series discount, abandoned-cart timer, and post-purchase upsell all fire on day 1 of cutover, not day 14
- **Inbox placement preserved or improved:** the deliverability warm-up plan keeps Gmail/Yahoo spam-folder rates ≤ historical baseline (typically <2% spam rate per Postmaster Tools)
- **Cost reduced 25–50%** at the same list size (or absorbed by the segmentation/automation lift — net positive ROI in 4–6 weeks)
- **One source of truth per channel:** Klaviyo for email, Postscript for SMS, no overlap with Mailchimp/Brevo/etc. running in parallel past the 30-day safety window

## Which migration path applies to you

Pick the row that matches your current stack; jump to the matching step-by-step below. **Most small-to-mid DTC stores are Path A or B.**

| Current stack | Migration path | Time | Expected savings | Risk |
|---|---|---|---|---|
| **A. Mailchimp (email) → Klaviyo + Postscript (add SMS)** | Full cutover + add new channel | 5–7 days | **−30 to −50% email cost** at ≥10k contacts + new SMS revenue stream | Low — Mailchimp API export is stable, Klaviyo has a one-click Mailchimp importer |
| **B. Klaviyo (email) + Attentive or another SMS → Klaviyo + Postscript (consolidate SMS)** | SMS-only cutover; keep Klaviyo as-is | 3–5 days | **−40 to −60% SMS cost** (Postscript per-message is typically 30–50% below Attentive at <$5k/mo SMS spend) | Medium — SMS subscribers + opt-in consent records + TCPA audit trail must transfer cleanly |
| **C. Sendlane, Brevo, HubSpot, ActiveCampaign, Customer.io → Klaviyo + Postscript** | Full cutover from a non-Mailchimp source | 7–10 days | Varies; typically **−20 to −40%** total ESP+SMS cost | Medium — custom field mapping is non-trivial; some source platforms don't have one-click importers |
| **D. Klaviyo-only → Klaviyo + Postscript (add SMS, keep Klaviyo for email)** | Add new SMS channel only | 2–3 days | No savings; **+$200–$800/mo new SMS cost offset by 5–15% revenue lift** | Very low — same ESP, just add a new platform |

> **If you are starting fresh** (no email/SMS stack yet): skip the migration and just sign up for Klaviyo free tier (≤250 contacts) + Postscript Starter ($0/mo + per-message). Apply Path A's flow build sequence below.

---

## Prerequisites

> **Pick the prerequisites for your path (A/B/C/D) before starting.** Most paths share the same 5 items; SMS-only Path B skips the Klaviyo-import items.

- [ ] **Klaviyo account on a paid plan** (free tier caps at 250 contacts and disables flows). Klaviyo's free tier is fine for the trial migration (1–2 weeks) but you'll need paid ($45+/mo) for production. **Budget: $45–$600/mo** at 1k–50k contacts ($1 active profile = 1 billed contact, billed monthly).
- [ ] **Postscript account** (Starter $0/mo + $49/mo minimum spend, OR Growth $100/mo + usage). **Budget: $100–$400/mo** at 1k–20k SMS subscribers. SMS is opt-in only — you cannot import a non-consented list.
- [ ] **Shopify store connected to Klaviyo** (Settings → Integrations → Shopify). Confirm the "Subscribed to Email Marketing", "Placed Order", "Ordered Product", and "Fulfilled Order" metrics all show ≥1 event in the last 7 days in Klaviyo → Analytics → Metrics. **This is the #1 silent failure** — if Shopify isn't connected, the abandoned-cart flow won't fire.
- [ ] **Shopify store connected to Postscript** (Postscript → Integrations → Shopify). Same metrics must show. Postscript needs Shopify customer + order data for sender-name + opt-out management.
- [ ] **Sender domain authenticated** (SPF + DKIM + DMARC). Klaviyo walks you through this in Settings → Domains. Postscript configures its own sender ID. Without auth, Gmail + Yahoo will route you to spam.
- [ ] **(Path A, B, D) SMS consent collection** — your signup form, popup, and checkout must have a TCPA-compliant SMS opt-in checkbox. Existing subscribers without SMS consent CANNOT be added to Postscript; they must re-opt-in. **This is the #1 compliance gotcha — TCPA fines start at $500 per unsolicited message.**
- [ ] **(Path A, C) Source ESP API access** — you need admin credentials to export your contact list, segments, automations, and historical campaign data. If you're on a free plan, upgrade for one month to get API access.
- [ ] **Backup of source ESP data** — full export (CSV) of all contacts, all segments, all automation history. Keep this for **at least 90 days post-cutover** in case you need to rollback.
- [ ] **Cutover blackout window chosen** — pick a 48–72h window with historically low traffic (mid-week, mid-month, mid-afternoon). Tuesday 10am–Thursday 10am is the safe default. Avoid Black Friday week, BFCM, product launches, or any active promo.
- [ ] **List size + SMS-consent split measured** — run `SELECT COUNT(*) FROM contacts;` and `SELECT COUNT(*) FROM contacts WHERE sms_consent = true;` on your source ESP. You need both numbers to forecast Postscript cost and to scope the SMS opt-in re-consent campaign.
- [ ] **Stakeholder sign-off** — if marketing, ops, or finance is a different team, get written sign-off on the cutover date, the cost delta, and the rollback plan.

---

## Step-by-step

> **The 5 phases below are sequential for full-cutover paths (A, C). SMS-only paths (B, D) skip Phases 1–3 (already on Klaviyo) and start at Phase 4.**

### Phase 1 — Audit & inventory (Day 1–2, before any migration work)

The biggest migration mistakes are surprises: a flow that worked on Mailchimp has no Klaviyo equivalent, a custom field doesn't import, a segment the marketing team relies on silently drops. Inventory first, migrate second.

1. **Export a full contact list** from your source ESP. Most ESPs offer CSV export at Account → Settings → Export. Include all custom fields, all consent timestamps, all engagement history (opens/clicks last 90 days).
2. **List every active automation/flow** on the source ESP. For each, record:
   - Name + trigger + action steps (screenshot)
   - Conversion rate last 90 days (from source analytics)
   - Whether it has a unique-code discount, a Shopify coupon, or a custom integration
3. **List every active segment**. For each, record:
   - Definition (rule list)
   - Size (count)
   - Use (which campaigns or flows reference it)
4. **List every custom field** on the contact profile. Klaviyo's importer maps the most common ones automatically (`FNAME`, `LNAME`, `PHONE`, `CITY`, `STATE`, `COUNTRY`, `ZIP`); anything else needs manual mapping in Klaviyo → Settings → Custom Properties.
5. **Export all campaign history** (last 12 months minimum). Even if you don't re-send, you want the engagement data for benchmarking.
6. **Measure source-ESP inbox placement** before cutover. Use **Google Postmaster Tools** + **Microsoft SNDS** + **Mail Tester** (free) to get a baseline open rate, spam rate, and reputation. After cutover, compare at week 4.
7. **Measure source-SMS delivery rate** (Path A, B, D). Postscript → Settings → Reports → Delivery shows delivery %, opt-out %, and click %. Record as baseline.

> **Decision gate before Phase 2:** if your source ESP has >10 active automations or >50 active segments, this migration needs ≥2 weeks not 1. Do not start a BFCM-window cutover.

### Phase 2 — Build the Klaviyo destination (Day 2–4, BEFORE importing contacts)

You build the destination FIRST, import SECOND. The trap: import contacts first, then realize your flow has a bug, and now you've been emailing 25k people with broken templates for 4 hours.

1. **Sign into Klaviyo** (use the free tier initially; upgrade to paid before go-live). Connect Shopify (Settings → Integrations → Shopify) — this is what brings in the "Placed Order" / "Ordered Product" / "Fulfilled Order" / "Subscribed to Email Marketing" / "Cart Started" / "Checkout Started" metrics that every flow depends on.
2. **Configure sender domain** (Settings → Domains → Add sending domain). Klaviyo walks you through SPF + DKIM. DMARC is configured at your DNS provider (Cloudflare / Route53 / Namecheap). Without all three, expect 30–60% of emails to land in spam on day 1.
3. **Map custom fields** (Settings → Custom Properties → Add). For every custom field from your source ESP, create the Klaviyo equivalent. Names should be UPPERCASE_SNAKE_CASE (`FIRST_PURCHASE_DATE`, `SKIN_TYPE`, `FAVORITE_CATEGORY`). Klaviyo reserves certain names (`email`, `first_name`, `last_name`, `phone_number`, `city`, `region`, `country`, `zip`) — these are auto-mapped.
4. **Build the 6 core flows**, in this priority order. Every flow should be REVIEWED and TESTED before cutover, not after.
   - **Flow 1: Welcome series (5 emails + 1 SMS)** — follow `playbooks/04-welcome-series-klaviyo.md` Step-by-step. Use the Welcome Series template as a starting point; replace copy with your brand voice. Suppress for existing customers (`Placed Order ≥ 1 times`).
   - **Flow 2: Abandoned cart (3 emails + 2 SMS)** — follow `playbooks/01-abandoned-cart-flow-klaviyo.md` Step-by-step. Trigger: `Checkout Started zero times` within the flow window (i.e. started checkout but didn't convert). Use unique 10% off code on Email 3, sent at 24h.
   - **Flow 3: Post-purchase upsell confirmation + cross-sell** — follow `playbooks/02-post-purchase-upsell-reconvert.md`. Trigger: `Placed Order`. Send 7 days after delivery. (Or build a 2-email confirmation + review-request flow in Klaviyo if you're not yet on ReConvert.)
   - **Flow 4: Browse abandonment (1 email)** — trigger: `Viewed Product ≥ 1 time AND zero Placed Order in last 24h`. Lower priority; ship 30 days after the first 3 flows are live.
   - **Flow 5: Customer win-back (90-day)** — trigger: `last purchase ≥ 90 days ago AND last email engagement ≥ 30 days ago`. 3 emails over 14 days, 15% off.
   - **Flow 6: Sunset (suppress non-engagers)** — trigger: `zero opens in last 180 days`. Move to a "low-engagement" segment; Klaviyo auto-suppresses for inbox providers if you enable the sunset flow. Critical for deliverability.
5. **Create the 5 core segments** before importing:
   - `All subscribers` (newsletter list)
   - `Customers` (placed ≥1 order)
   - `Active subscribers (last 90d)` (engagement-based; protects deliverability)
   - `VIP customers` (LTV ≥ top 20% — calculate from your store data)
   - `SMS-consented` (sms_consent = true) — separate segment for SMS campaigns
6. **Create signup forms** (Klaviyo → Signup Forms → Popups). Replace your Mailchimp/Brevo popups with the Klaviyo equivalents before cutover. Set the popup to fire on the right URL (homepage, product page, exit-intent). Use the same brand colors and copy. **Critical: include a separate SMS opt-in checkbox** in the Klaviyo form (Klaviyo's default has email only — you need to add an SMS field with TCPA-compliant consent language).
7. **Test every flow** with a personal email + a real Shopify test order. Klaviyo → Flows → [Flow Name] → "Preview & Test" sends a real email to your test address. For the abandoned-cart flow, place a test order, abandon it, confirm the first email fires at the right time.

> **Decision gate before Phase 3:** ship-test all 6 flows with yourself as the recipient. If you wouldn't open the email as a customer, don't ship to 25k people. Get at least one other teammate to do a 24h QA pass on the live preview links.

### Phase 3 — Import contacts + suppress the source ESP (Day 4–5)

1. **Import contacts** (Klaviyo → Lists & Segments → Import). Klaviyo has a one-click Mailchimp importer (Lists & Segments → Import → "Import from Mailchimp") — for other sources, upload a CSV. **Map every custom field** (the importer shows a mapping screen; don't click through with defaults).
2. **Set consent status correctly on import.** Every contact imported as "subscribed" is now legally subscribed under your Klaviyo sender domain. Klaviyo's importer sets a `consent_method` field if you provide it (`signup_form`, `imported_with_consent`, `customer_transactional`); if you don't, it defaults to "subscribed" which can hurt deliverability.
3. **Tag imported contacts** with `migration:mailchimp_2026_06_24` (or whatever date + source). Lets you measure post-cutover engagement segmented by migration cohort — critical for the 30/60/90-day ROI check.
4. **Verify import counts** match source. Klaviyo's importer shows "X contacts imported, Y skipped, Z errors" — investigate every error (most are malformed emails or missing consent timestamps).
5. **Wait 24h.** Let the import settle. Check Klaviyo → Analytics → Engagement for any obvious anomalies (e.g. 0% open rate means the emails are being spammed or the import set everyone to unsubscribed).
6. **Disable source-ESP automations** (do NOT delete yet). On Mailchimp: Customer Journeys → Pause all. On Klaviyo-only paths: skip this step. The point: prevent the source from sending the same automation twice. **Do NOT turn off source-ESP transactional emails** (order confirmations, shipping) until Klaviyo's transactional emails are confirmed live.
7. **(Path A, C only) Do NOT delete the source ESP account yet.** Keep it paused for 30 days. If you need to rollback, you can re-enable in <1 hour.

### Phase 4 — Stand up Postscript + add SMS flows (Day 5–6)

Path A, B, D need this. Path C (coming from a non-Klaviyo ESP) already has Klaviyo+Postscript — skip to Phase 5.

1. **Sign into Postscript** (Starter or Growth). Connect Shopify (Postscript → Integrations → Shopify). Confirm customer + order data is flowing (Postscript → Customers → search for your own test order, confirm it appears).
2. **Configure SMS sender** (Postscript → Settings → Sending). Register a toll-free or short code number (10DLC registration in the US is now required; Postscript handles the registration but takes 1–3 weeks — start NOW if you're going to use SMS at scale).
3. **Set up TCPA consent collection**. Your signup forms, popup, and checkout need an SMS opt-in checkbox with the language "By subscribing, you agree to receive marketing texts from [Brand] at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply HELP for help, STOP to cancel." Klaviyo's form editor supports this; the form must be wired to set `sms_consent = true` and `sms_consent_at = <timestamp>`.
4. **Build the 4 core SMS flows** (mirror the email flows, but SMS is high-friction — only use for high-intent moments):
   - **SMS-1: Welcome SMS** — sent 5 min after SMS opt-in. Single message, ≤160 chars. "Welcome to [Brand]! Here's 10% off your first order: [UNIQUE_CODE]. Reply STOP to opt out." 25–40% lift on opt-in→purchase CVR vs email-only welcome.
   - **SMS-2: Cart-abandon 1** — sent 1h after `Cart Started` if no `Placed Order`. ≤160 chars. "You left something in your cart: [PRODUCT]. 10% off expires in 24h: [UNIQUE_CODE]. Reply STOP to opt out."
   - **SMS-3: Cart-abandon 2** — sent 24h after cart-abandon 1 if still no order. Same message, different code, last-chance urgency.
   - **SMS-4: Shipping confirmation** — transactional, fires on `Fulfilled Order`. Includes tracking link. Highest engagement SMS you can send; expect 60–80% click rate.
5. **Enable double opt-in for SMS** (Postscript → Settings → Consent → Double Opt-In = ON). This protects you from TCPA liability and improves list quality. Subscriber gets a confirmation text; they reply "Y" to confirm. Expected opt-in rate drops 30–50% but engagement and LTV both rise.
6. **(Path A, C) Import existing SMS-consented contacts** from your source ESP to Postscript. Postscript → Audience → Import. You MUST have proof of consent for every imported number (timestamp, IP, signup source). Contacts without consent must re-opt-in. **Do NOT import a non-consented list under any circumstances — TCPA fines start at $500 per message.**
7. **Run an SMS opt-in re-consent campaign** (Path A, B, C) to capture subscribers who didn't have SMS consent on the source ESP. Email your full list, ask them to opt in to SMS with a one-click link. Typical opt-in rate: 10–25% of engaged email subscribers.

> **Decision gate before Phase 5:** Postscript's 10DLC registration must be APPROVED (not pending) before you can send at scale. If you're still pending, the cutover slips. Start registration in Phase 1, not Phase 5.

### Phase 5 — Cutover + monitor (Day 6–7, the 48–72h window)

1. **48h before cutover:** send a "we're moving" email to your full list (use the source ESP one last time). Subject: "Quick update from [Brand]". Body: "We're upgrading our email + SMS platform this week. You don't need to do anything — your subscription is preserved. If you notice any weird emails from us, please whitelist [@brand.com]." This is a goodwill move; also flushes out spam-folder issues before cutover.
2. **24h before cutover:** disable all source-ESP marketing automations (keep transactional on). Confirm Klaviyo flows are in DRAFT or LIVE state (not paused). Confirm Postscript SMS flows are LIVE.
3. **Cutover hour (T-0):** flip every Klaviyo flow from DRAFT to LIVE. Flip every Postscript SMS flow to LIVE. Send yourself a test email + SMS from each flow to confirm.
4. **T+1h:** check Klaviyo → Analytics → Real-Time for any immediate errors. Check Postscript → Reports → Delivery for any failed SMS sends.
5. **T+4h:** check the welcome flow has fired correctly for any new signups in the last 4h. Check the abandoned-cart flow has fired for any test cart abandons.
6. **T+24h:** full smoke test — sign up, place a test order, abandon a test cart, fulfill a test order. Every flow should fire. Check spam-folder placement for your own test email (send to a Gmail, Outlook, and Yahoo address; check all 3 spam folders).
7. **T+48h:** compare source-ESP last-30-day inbox placement baseline vs current Klaviyo. Mail Tester score should be ≥9/10. Google Postmaster Tools reputation should be "High" or "Medium". If "Low" or "Bad", pause the flow and check sender domain authentication.
8. **T+72h:** cutover window closes. If all 6 smoke tests pass + deliverability is OK + cost is as forecast, the migration is successful. Delete source-ESP campaigns and segments (but keep the source-ESP account paused for 30 more days for safety).
9. **T+30 days:** measure the ROI. Compare:
   - Total ESP+SMS cost (source vs new) — expect **−20 to −50%**
   - Email-attributed revenue (Klaviyo → Analytics → Revenue → Email)
   - SMS-attributed revenue (Postscript → Reports → Revenue)
   - Inbox placement (Google Postmaster Tools reputation score)
   - List engagement (% of contacts who opened an email in the last 30 days)
10. **T+90 days:** if ROI is positive, archive the source-ESP account (don't delete the data — keep the 90-day backup). If ROI is negative or flat, audit the flows; the most common cause of under-performance is suppressed segments (e.g. you forgot to migrate the "VIP customers" segment).

### Phase 6 — Sunset the source ESP (Day 30+, after successful cutover)

1. **Download the full source-ESP data export** (last 90 days of sends, engagement, revenue). Save to a permanent archive (Google Drive / S3 with versioning).
2. **Cancel the source-ESP paid subscription** (but keep the account active for 90 days for rollback).
3. **Migrate any remaining custom fields** you forgot in Phase 1.
4. **Delete the source-ESP marketing campaigns and automations** (keep account, keep the contact list as a backup for 90 days).
5. **Add the source-ESP domain to your DNS blacklist** (e.g. if you used Mailchimp's `mail250.us2.list-manage.com` sender, block it from your SPF record to prevent accidental sends).
6. **At T+90 days: delete the source-ESP account** if no rollback has been needed.

---

## Metrics to track

| Metric | Where | Target | Action if red |
|---|---|---|---|
| **Inbox placement rate** | Google Postmaster Tools + Mail Tester (free) | ≥90% inbox, <2% spam | Check SPF/DKIM/DMARC; pause non-essential flows; warm up over 4 weeks |
| **Open rate (welcome flow)** | Klaviyo → Analytics → Flows | ≥35% on Email 1; ≥20% on Email 2–5 | Check subject lines, preview text, send time |
| **Click rate (welcome flow)** | Klaviyo → Analytics → Flows | ≥3% on Email 1 CTA | Check CTA copy, button color, above-the-fold placement |
| **CVR (welcome flow → first order)** | Klaviyo → Analytics → Flows → Revenue | ≥2% of subscribers within 14 days | Industry baseline 2–5%; <1% means discount code isn't being used or AOV is too low |
| **CVR (abandoned cart flow → recovered order)** | Klaviyo → Analytics → Flows | ≥5% recovery rate | Industry 5–15%; <5% means email timing or copy is off |
| **Email-attributed revenue / month** | Klaviyo → Analytics → Revenue | ≥10% of total store revenue at steady state | Industry 20–30% for established DTC; <10% means flows need optimization |
| **SMS delivery rate** | Postscript → Reports → Delivery | ≥97% delivered | <95% means carrier issues or 10DLC registration problem |
| **SMS opt-in rate** | Postscript → Audience → Growth | 10–25% of email subscribers | <5% means consent checkbox isn't visible or copy isn't compelling |
| **SMS-attributed revenue / month** | Postscript → Reports → Revenue | ≥5% of total store revenue | <2% means flows are firing but copy/CTA is weak |
| **Unsubscribe rate (email)** | Klaviyo → Analytics → Engagement | <0.5% per send | >1% per send = list hygiene issue or content-fatigue; check sunset flow |
| **List size (active)** | Klaviyo → Lists & Segments | Growing ≥2% MoM | Negative growth = landing page signup form broken or sunset flow too aggressive |
| **Cost per email (all-in)** | Klaviyo billing + Postscript billing | ≤$0.001 per email sent + ≤$0.02 per SMS sent | Benchmark against source-ESP; if Klaviyo is 30% more expensive than source, check active-profile count (Klaviyo bills ALL active profiles, not just opted-in) |
| **Total ESP+SMS cost / month** | Combined invoiced amount | Source cost × 0.5–0.8 (i.e. 20–50% savings) | If no savings after 30 days, audit the plan tier — Klaviyo's pricing scales steeply at 50k+ contacts; consider consolidating or downgrading to email-only |

## Common pitfalls

- **Importing contacts without `consent_method` set** — defaults to "subscribed" which hurts deliverability and may violate GDPR/CAN-SPAM. **Fix:** add `consent_method: "signup_form"` or `"imported_with_consent"` to every contact at import time.
- **Importing SMS numbers without proof of consent** — TCPA violation, $500+ per message fine. **Fix:** only import numbers with documented consent (timestamp + IP + source); re-consent the rest via an email campaign.
- **Skipping Shopify integration verification** — if "Placed Order" or "Cart Started" metrics are missing, every flow silently fails. **Fix:** check Klaviyo → Analytics → Metrics → filter by "Placed Order" → confirm ≥1 event in the last 24h before cutover.
- **Firing the welcome flow's 10% discount to existing customers** — destroys margin. **Fix:** suppress for `Placed Order ≥ 1 times` in the welcome flow trigger filter.
- **Building flows AFTER importing contacts** — you've been emailing 25k people with broken templates for 4 hours. **Fix:** always build destination first, import second (Phase 2 before Phase 3).
- **Deleting the source-ESP account on cutover day** — you can't rollback if Klaviyo has a bug. **Fix:** keep the source paused for 30 days; delete at T+90.
- **No SPF/DKIM/DMARC on the Klaviyo sending domain** — 30–60% of emails land in spam on day 1. **Fix:** Klaviyo walks you through SPF + DKIM in Settings → Domains; DMARC is at your DNS provider; verify all three before the first send.
- **Postscript 10DLC registration still pending at cutover** — you can send, but at low throughput; carrier filtering is heavy. **Fix:** start 10DLC registration in Phase 1 (1–3 weeks lead time), not Phase 4.
- **Forgetting to migrate the "VIP customers" or "high-LTV" segment** — the marketing team quietly loses their most-targeted campaign. **Fix:** inventory every segment in Phase 1; map all of them in Klaviyo before cutover.
- **Cost surprise at month 1** — Klaviyo bills all active profiles (any contact who has received an email in the last 12 months), not just opted-in. **Fix:** before cutover, clean the source ESP list of bounced/inactive/unsubscribed contacts; expect 10–30% list shrinkage on import.
- **Running Mailchimp + Klaviyo in parallel past the 30-day safety window** — duplicate emails to the same subscribers, hurts deliverability on both platforms. **Fix:** pause source-ESP marketing at cutover; keep it paused.
- **Suppressing transactional emails too early** — order confirmations and shipping updates disappear. **Fix:** keep source-ESP transactional live until Klaviyo's transactional templates are verified sending (Klaviyo → Templates → confirm the transactional template shows ≥1 send in the last 7 days).
- **No rollback plan written down** — when something goes wrong at T+4h, nobody knows whose call it is to re-enable Mailchimp. **Fix:** write the rollback runbook in Phase 1, including the exact 5 steps to re-enable the source ESP, the 1 owner who has the credentials, and the SLA to execute (e.g. 1 hour).

## Verification

Run these 7 gates after the cutover (T+24h through T+30d). All must pass before the migration is considered successful.

- [ ] **Gate A — All 6 Klaviyo flows are firing.** Klaviyo → Analytics → Flows → confirm ≥1 send per flow in the last 24h. Any flow with 0 sends is broken.
- [ ] **Gate B — All 4 Postscript SMS flows are firing.** Postscript → Reports → Delivery → confirm ≥1 send per flow. Any flow with 0 sends is broken.
- [ ] **Gate C — Inbox placement is ≥90%.** Mail Tester score ≥9/10. Google Postmaster Tools reputation = "High" or "Medium". Check Gmail, Outlook, Yahoo spam folders with a test email.
- [ ] **Gate D — Revenue is being attributed.** Klaviyo → Analytics → Revenue → confirm Email + SMS revenue > $0 in the 7 days post-cutover. Postscript → Reports → Revenue → confirm SMS revenue > $0.
- [ ] **Gate E — Source-ESP automations are paused.** Log into Mailchimp/Brevo/etc. → confirm Customer Journeys/Automations = Paused. Active subscribers should not be receiving duplicate emails.
- [ ] **Gate F — Cost forecast matches actuals.** Klaviyo invoice (month 1) ≤ forecast. Postscript invoice (month 1) ≤ forecast. If Klaviyo is >20% over forecast, audit the active-profile count.
- [ ] **Gate G — Engagement is stable or improved.** Compare pre-cutover 30-day open rate (source ESP) vs post-cutover 30-day open rate (Klaviyo). Acceptable: ±10% of baseline. If open rate dropped >20%, list hygiene or deliverability issue — investigate before declaring victory.

## Cost & ROI estimate

> **Default case: 25k total contacts, 5k SMS-consented, $1M GMV/yr store, Mailchimp + (no SMS) → Klaviyo + Postscript.**

| Cost line | Source (Mailchimp) | Destination (Klaviyo + Postscript) | Delta |
|---|---|---|---|
| Email platform fee | $350/mo (Standard plan, 25k contacts) | $250/mo (Klaviyo Email, 25k active profiles) | **−$100/mo (−29%)** |
| SMS platform fee | $0 (no SMS) | $100/mo (Postscript Growth base) | **+$100/mo (new channel)** |
| Email sends (50k/mo) | included | $50/mo (overage above 25k free sends × 5x at $0.0005/extra — varies by plan; Klaviyo's free tier includes 25k sends/mo) | **−$0** |
| SMS sends (5k/mo @ 30% opt-in) | $0 (no SMS) | $50/mo (5k × $0.010/SMS) | **+$50/mo (new)** |
| **Total monthly** | **$350** | **$400** | **+$50 (+14%)** |
| **Revenue lift from better segmentation + SMS** | baseline | **+15% email-attributed** (Klaviyo segmentation is materially better) + **+5% from SMS welcome + cart flows** | **+$300–$500/mo incremental** |
| **Net ROI** | — | **+20% effective on email+SMS spend** | **breakeven month 1, +$5–10k incremental revenue year 1** |

> **Honest read:** Klaviyo's email cost is often **higher** than Mailchimp at small list sizes (≤10k contacts). The ROI is driven by the segmentation + automation lift, not the cost savings alone. At ≥25k contacts, Klaviyo's pricing is competitive with Mailchimp + Mailchimp Transactional combined. At 100k+ contacts, Klaviyo's per-contact pricing beats Mailchimp on most tiers. SMS revenue is net-new; the 5–15% lift is the dominant ROI line for most stores.

## Next moves after this migration is live

- **Move #7 — SMS welcome + cart-abandon flows** (already covered in Phase 4 above, but the next-tick companion playbook can deep-dive on Postscript-specific copy templates, A/B testing, and the 7-day-after-cart-abandon reminder).
- **Move #6 — Install Triple Whale or Polar for attribution** — without cross-channel attribution, you can't measure the true ROI of this migration. Triple Whale's starter tier (~$50/mo) auto-imports Klaviyo + Postscript revenue; install in week 2 post-cutover.
- **Move #8 — Loyalty program (Smile.io / Yotpo Loyalty)** — Klaviyo has a built-in Smile.io integration; loyalty data syncs to the Klaviyo profile, so your win-back + VIP flows can fire on loyalty tier changes.

## Related

- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Flow 2 of the Klaviyo destination stack; the canonical abandoned-cart flow you build in Phase 2.
- `playbooks/04-welcome-series-klaviyo.md` — Flow 1 of the Klaviyo destination stack; the canonical welcome series you build in Phase 2.
- `playbooks/02-post-purchase-upsell-reconvert.md` — Flow 3 of the Klaviyo destination stack (or alternative: build a 2-email confirmation + review-request flow in Klaviyo).
- `research/00-ecommerce-ops-landscape.md` §2 (channel benchmark), §3 (retention stack), §4 (deliverability).
- `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript pricing), §5 (Klaviyo tax + deliverability discipline).
- `research/02-top-10-leverage-moves.md` #5 — the parent move this playbook implements.
