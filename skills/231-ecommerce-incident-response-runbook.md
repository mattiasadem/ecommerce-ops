---
name: ecommerce-incident-response-runbook
title: Ecommerce ops incident-response runbook (site outage + payment outage + ad-account-disabled + 3PL-loss + viral-tweet-bot-surge + inventory-stockout + chargeback-spike)
category: incident-response
tier: 1
priority: P0
default_move: 231
year_1_roi_band: "10:1–40:1"
sms_friendly: false
last_updated: 2026-09-20
sources: [shopify-status-2025, stripe-status-2025, ad-account-disable-meta-policy-2024, ad-account-disable-google-policy-2024, ad-account-disable-tiktok-policy-2024, bot-mitigation-cloudflare-2024, shopify-bot-protection-2024, klaviyo-incident-postmortem-2024, gorails-uptime-2024, betterstack-status-page-2024, incident.io-runbook-patterns-2024, pagerduty-ecommerce-incident-data-2024, f5-state-of-app-experience-2024, cloudflare-ddos-trends-2024, akamai-bot-traffic-2024, shopify-charged-back-2024, stripe-fraud-disputes-2024, microsoft-digital-defense-report-2024, verizon-dbir-2024, fs-isa-2024]
---

# Ecommerce ops incident-response runbook (Move #231)

> The single biggest operational risk for any $1M+ GMV DTC brand is **the incident the operator has no runbook for**: Shopify goes down, Stripe declines 40% of orders, Meta disables the ad account overnight, a viral tweet drives 200,000 bots to the PDP, a 3PL loses a pallet, a chargeback rate spikes above 1%, or the warehouse misses a BFCM cutoff. **The cost of being unprepared is $5k–$500k per incident** (the median ecommerce incident loses $8k–$80k of revenue in the first 4 hours and 30–80% of the affected day's orders are unrecoverable). This skill ships the canonical 8-incident playbook the operator builds ONCE and rehearses quarterly so the MTTR (mean time to respond) drops from 4–24 hours to 15–45 minutes, the MTTR-loss drops by 60–90%, and the post-incident customer-recovery rate jumps from <5% to 25–50%. Distinct from `cybersecurity` (Move #91 — account-takeover / DDoS / bot-mitigation as a 365-day prevention layer) which assumes a working incident response plan; Move #231 IS the plan that Move #91's prevention layer feeds into. Distinct from `risk` (Move #33 — fraud + chargeback-MANAGEMENT as a prevention + per-case layer) which assumes a working incident response plan for chargeback SPIKES; Move #231 IS the spike-response runbook that Move #33's day-to-day prevention feeds into. Distinct from `contact-center` (Move #76 — customer-service daily ops) which assumes inbound tickets at baseline volume; Move #231 IS the 5–20× ticket-volume-spike runbook that Move #76's staffing model assumes exists. Year-1 ROI band **10:1–40:1** with a default **22:1** at $3M GMV (the median cost of being unprepared on 2 incidents/year ≈ $40k–$80k; the cost of this playbook ≈ $2k–$4k). Ship IMMEDIATELY — the next incident isn't a question of "if" but "when".

## When to use this skill

Use this skill when the operator is doing **≥500 orders/month** AND the operational risk curve has started to compound: the operator has **no status page** (Shopify Status + Stripe Status + 3PL Status are not bookmarked in the team Slack; the operator finds out about an outage from a customer tweet), the operator has **no ad-account-backup** (Meta + Google + TikTok ad-account-recovery-form is not on file; the primary login is on the founder's personal email and phone with no 2FA backup), the operator has **no payment-fallback** (the checkout is Stripe-only; if Stripe has a regional incident the checkout goes to 0% conversion), the operator has **no on-call rotation** (after-hours incidents are caught by a Pushover ping to the founder's personal phone at 3am), the operator has **no chargeback-spike-alert** (chargeback-rate climbs to 1.5% before anyone notices — by then Stripe has already frozen the account), the operator has **no inventory-stockout-page** (best-selling SKU hits zero stock and the PDP still shows "Add to cart" with a checkout error), or the operator has **no status-page-comms-template** (the operator must draft a customer-comms-email + Slack message + status-page update from scratch during the incident itself, costing 30–90 minutes of decision time). Move #231 is the **canonical first ops skill** an operator builds after Move #1 (cart-recovery) + Move #6 (attribution) + Move #12 (fulfillment) — these 3 ship revenue; Move #231 ships the runbook that protects that revenue from the 6–10 incidents that will hit every $1M+ GMV brand per year.

Distinct from Move #91 (cybersecurity / bot-mitigation / account-takeover defense) which is the 365-day PREVENTION layer; Move #231 is the 0–48 hour RESPONSE layer that Move #91's prevention feeds into. Distinct from Move #33 (fraud + chargeback-management) which is the per-case PREVENTION + day-to-day HANDLING layer; Move #231 is the SPIKE-response runbook for the 1-in-50-chargebacks → 1-in-500-chargebacks threshold breach that Move #33's per-case handling can't keep up with. Distinct from Move #76 (contact-center) which is the daily-staffing + ticket-routing layer; Move #231 is the 5–20× ticket-volume-spike runbook that Move #76's staffing model assumes exists.

## What "best in class" looks like

Reference: Allbirds (status-page + on-call), Glossier (cross-team Slack war-room pattern), Rothy's (chargeback-spike 1.5% → 0.4% recovery playbook), Athletic Greens (Meta ad-account-recovery form pre-filed), Bombas (3PL-loss quarterly tabletop exercise), Cuts Clothing (viral-tweet bot-mitigation in <30 min), Loom (status-page-comm pre-drafted for 12 incidents), Tuana (operator-built dashboard `Move #231-a` with the 8-incident checklist live).

| Incident type | Detection → Response time | MTTR (mean time to resolve) | Revenue loss floor | Best-in-class floor |
|---|---|---|---|---|
| **Site outage** (Shopify / Cloudflare / DNS) | 0–2 min (UptimeRobot) → 5 min (war-room Slack ping) | 15–45 min | $1k–$10k / hr | ≤45 min, ≤$5k |
| **Payment outage** (Stripe regional / Shop Pay / Apple Pay) | 0–5 min (Stripe Status + checkout-error-rate spike) | 15–60 min | $2k–$20k / hr | ≤60 min, ≤$8k |
| **Ad-account disabled** (Meta / Google / TikTok) | 0–30 min (spend=0 Slack alert) → 24–72 hr (re-appeal) | 24–96 hr | $5k–$100k / day | ≤48 hr, ≤$10k |
| **Viral tweet / bot-surge** | 0–5 min (traffic-spike alert) → 5–10 min (Cloudflare rule on) | 10–30 min | $500–$5k infra overage | ≤30 min, ≤$1k |
| **3PL-loss** (lost pallet / wrong warehouse / delivery exception) | 1–24 hr (customer CS ticket) → 4–12 hr (3PL claim) | 4–24 hr | $2k–$50k / pallet | ≤12 hr, ≤$10k |
| **Inventory stockout** (best-seller hits zero) | 0–30 min (Shopify inventory webhook) → 30 min (back-in-stock page live) | 30 min–4 hr | $500–$5k / day | ≤2 hr, ≤$1k |
| **Chargeback spike** (rate 0.3% → 1.5%+) | 1–7 days (chargeback alert) → 24 hr (Stripe Radar rule) | 3–14 days | $5k–$50k in disputes + account-freeze | ≤7 days, ≤$10k |
| **Email/SMS deliverability collapse** (open-rate 30% → 5%) | 1–3 days (Klaviyo deliverability dashboard) → 24 hr (warm-IP swap) | 3–14 days | $5k–$30k / mo in lost flow revenue | ≤7 days, ≤$15k |

### The 8-incident war-room pattern (Allbirds, Glossier, Rothy's)

Every incident runs through the SAME 8-step pattern, regardless of which of the 8 incidents fired:

1. **0–2 min — Declare.** Anyone on the team who sees the signal types `/incident <type> <severity>` in #war-room Slack. The bot auto-creates a war-room channel, pins the runbook link, and pages the on-call.
2. **2–5 min — Triage.** On-call opens the runbook, runs the 3–5 detection-diagnostic steps (status page + dashboard check + error-rate grep), declares severity (P0 = site down / payments down / ad-account-off, P1 = degraded / partial / spike, P2 = single-SKU stockout / single-customer issue).
3. **5–10 min — Comms 1.** On-call posts the pre-drafted customer-comms-email + status-page-update from the runbook template library. **No drafting from scratch during an incident.**
4. **10–30 min — Mitigate.** On-call executes the 3–5 mitigation steps from the runbook (disable checkout / route to backup-processor / enable Cloudflare rule / pause ad-spend). Goal: stop the bleeding.
5. **30 min–4 hr — Resolve.** On-call works the root-cause fix (re-enable service / re-appeal ad-account / restore inventory / file 3PL claim). Goal: restore baseline.
6. **4–24 hr — Recover.** Customer-comms follow-up (refunds, replacements, winback email), vendor claim filed, chargeback disputes filed, ad-account re-appeal submitted.
7. **24–48 hr — Post-mortem.** Run a blameless post-mortem (template in the runbook), document the timeline, identify the 1–3 contributing factors, write the 3–5 corrective actions, assign owners + due dates.
8. **48 hr–14 days — Verify.** Each corrective action has a verification gate (e.g. "chargeback alert now fires at 0.5% within 30 min of threshold breach"). Operator re-runs the runbook in a tabletop exercise every 90 days.

**Best-in-class MTTR = 15–45 min for site/payment incidents; 24–96 hr for ad-account; 4–24 hr for 3PL-loss; 3–14 days for chargeback spike.** Anything slower = the runbook is incomplete.

## The build (~6 hours for a competent operator, $200–$2,000/yr recurring)

### Step 1 — Book the 8 status pages + set uptime monitoring (45 min)

| Vendor | Status URL | Internal Slack channel | UptimeRobot monitor |
|---|---|---|---|
| Shopify | https://www.shopifystatus.com | #shopify-status | https://www.shopify.com (every 60s) |
| Stripe | https://status.stripe.com | #stripe-status | https://checkout.example.com (every 60s) |
| Cloudflare | https://www.cloudflarestatus.com | #cloudflare-status | https://example.com (every 60s) |
| Klaviyo | https://status.klaviyo.com | #klaviyo-status | flow-send webhook (every 5 min) |
| Postscript | https://status.postscript.io | #postscript-status | flow-send webhook (every 5 min) |
| Triple Whale | https://status.triplewhale.com | #triple-whale-status | dashboard-load heartbeat (every 5 min) |
| Primary 3PL | (get from 3PL — ShipBob / ShipMonk / Stord all have one) | #3pl-status | carrier-tracking webhook (every 5 min) |
| DNS (Cloudflare / Route53) | (your provider's status page) | #dns-status | DNS-check every 60s |

Set up **UptimeRobot ($7/mo free tier → $49/mo Pro tier)** with HTTP-200 checks every 60s on the storefront, the checkout, the post-purchase page, the Klaviyo flow-send webhook, and the 3PL carrier-tracking webhook. Each check pages the on-call via Pushover ($5 one-time per device) on 2 consecutive misses.

### Step 2 — Build the 8-incident runbook in Notion / GitHub / Google Doc (90 min)

The runbook is a single source of truth that the on-call opens at minute 2 of every incident. Structure:

```
docs/incident-runbook/
├── README.md                        # Index + severity matrix + on-call rotation
├── 01-site-outage.md                # Shopify down, Cloudflare down, DNS down
├── 02-payment-outage.md             # Stripe regional, Shop Pay down, Apple Pay down
├── 03-ad-account-disabled.md        # Meta / Google / TikTok account disabled
├── 04-viral-tweet-bot-surge.md      # 10× traffic, 80%+ bots, infra overage
├── 05-3pl-loss.md                   # Lost pallet, wrong warehouse, delivery exception
├── 06-inventory-stockout.md         # Best-seller hits zero, PDP shows out-of-stock
├── 07-chargeback-spike.md           # Rate climbs 0.3% → 1.5%+ in 7 days
├── 08-email-sms-deliverability.md   # Open-rate collapses 30% → 5%, spam complaints
└── templates/
    ├── customer-comms-email.md      # 12 pre-drafted templates (1 per incident)
    ├── status-page-update.md        # 12 pre-drafted status updates
    ├── war-room-slack-message.md    # 12 pre-drafted Slack war-room pings
    └── post-mortem-template.md      # Blameless post-mortem (timeline + actions)
```

Each incident file has the SAME 8-section structure (per the 8-step war-room pattern above): detection, triage, comms template, mitigation, resolution, recovery, post-mortem, verification. **Every section has copy-paste commands — no "decide what to do" hand-waving.**

### Step 3 — Pre-draft the 12 customer-comms templates (60 min)

The 12 templates (one per incident per email-channel: customer-comms-email + status-page-update + Slack war-room ping = 3 per incident × 8 incidents = 24 if you split by channel; 12 if you co-locate per-incident). Each template has 3 variants: **transparent + apologetic** (site down, payment declined), **proactive + solution-oriented** (ad-account disabled, 3PL-loss), **educational + reassuring** (viral-bot-surge, chargeback spike). Example for the site-outage template:

```
Subject: We hit a snag — your order is safe

Hi {{first_name}},

If you tried to check out between 2:14pm and 2:47pm ET today, you may
have seen an error message. The good news: no orders were lost and
no payment was double-charged.

Here's what happened: [1-sentence plain-English explanation].

Here's what we're doing: [1-sentence mitigation].

If your order didn't go through, [recover CTA link]. Reply to this
email if you need help.

Sorry for the bump — we're on it.

— The {{brand}} team
```

### Step 4 — Wire the 8 alert thresholds (45 min)

| Alert | Threshold | Tool | On-call page |
|---|---|---|---|
| **Site-down** | UptimeRobot 2 consecutive 60s misses | UptimeRobot Pro | Pushover |
| **Payment-decline-spike** | Stripe checkout.error_rate > 5% for 5 min | Stripe Radar webhook | Slack #war-room |
| **Ad-spend-zero** | Meta spend (last 1 hr) = $0 | Triple Whale Slack alert | Slack #war-room |
| **Bot-traffic-spike** | Cloudflare bot-score > 80 on > 50% of traffic | Cloudflare Workers | Slack #war-room |
| **3PL-carrier-exception** | Carrier-tracking exception event > 10 in 1 hr | 3PL webhook | Slack #war-room |
| **Inventory-zero-SKU** | Shopify inventory webhook `quantity = 0` on best-seller | Shopify webhook | Slack #war-room |
| **Chargeback-rate-spike** | Stripe disputes.rate > 0.5% rolling 7d | Stripe Radar webhook | Slack #war-room + email |
| **Email-open-rate-collapse** | Klaviyo flow open-rate < 10% rolling 7d | Klaviyo webhook | Slack #war-room |

### Step 5 — Pre-file the ad-account-recovery forms (30 min)

For each ad platform (Meta + Google + TikTok), pre-fill the account-recovery form with: business name, EIN, tax-ID, business address, business phone, business email, business website, primary ad-account ID, primary BM ID, payment-method-on-file, 2 known-good ad-creatives, 3-month spend-history, and a 200-word "what we sell + why our ads comply" statement. Save each as a PDF in `docs/incident-runbook/recovery-forms/`. **When Meta disables your account at 3am Saturday, you don't have time to find your EIN.** The recovery form is on file and gets submitted in 15 min, not 4 hr.

### Step 6 — On-call rotation + quarterly tabletop (30 min)

Set up a PagerDuty-light alternative (PagerDuty free for 5 users, or a simple spreadsheet + Slack ping): 1 primary on-call, 1 secondary on-call, 7-day rotation, $50/mo stipend per on-call for the 24/7 phone-ping. **Rehearse quarterly** — pick 1 of the 8 incidents, declare it in #war-room, run the runbook, time the MTTR, document what was missing. Rothy's runs 2 tabletop per quarter; Athletic Greens runs 1 per quarter; Bombas runs monthly.

### Step 7 — Wire the customer-recovery sequence (45 min)

For each incident type, a pre-drafted 3-touch customer-recovery sequence in Klaviyo (or Postscript for SMS): **(a) Incident-comms-email** at minute 10, **(b) Status-update-email** at hour 4, **(c) Winback-email with discount** at day 3 (subject: "We owe you one — 20% off your next order"). The winback email recovers 15–30% of affected customers per Klaviyo benchmarks.

## Common pitfalls (15 from real builds)

1. **No status page bookmarks** — the operator finds out about an outage from a customer tweet; cost: $5k–$50k in lost revenue because the response started 2–6 hours late. **Fix:** bookmark all 8 status pages in a pinned Slack message + the runbook README; the on-call opens the bookmarked tab at minute 2.
2. **Ad-account-recovery-form not pre-filed** — Meta disables the account at 3am Saturday and the operator spends 4 hours looking for the EIN; the appeal doesn't get filed until Monday, losing $5k–$50k in weekend ad spend. **Fix:** pre-file all 3 platforms' recovery forms (Step 5); the appeal is on file and gets submitted in 15 min.
3. **No payment-fallback-processor** — the checkout is Stripe-only; if Stripe has a regional incident the checkout goes to 0% conversion for 1–6 hours. **Fix:** wire **Shop Pay** (Shopify-native) + **PayPal** (Shopify-native) + **Apple Pay / Google Pay** as backup-processors; if Stripe declines, the customer can pay via Shop Pay or PayPal. Activation: 30 min in Shopify Settings → Payments.
4. **No on-call-rotation** — after-hours incidents are caught by a Pushover ping to the founder's personal phone at 3am; founder burnout + slow response. **Fix:** PagerDuty-free-tier (5 users) + 7-day rotation + $50/mo stipend; founder no longer on the primary rotation after the first 90 days.
5. **No bot-mitigation-tier** — a viral tweet drives 200,000 bots to the PDP; Cloudflare bill goes from $200/mo to $8,000/mo in 6 hours and the site slows to a crawl. **Fix:** enable **Cloudflare Bot Fight Mode** (free tier) + **Cloudflare Super Bot Fight Mode** ($10/mo) + a **rate-limit rule** on `/products/*` and `/cart/*` of 60 requests/minute per IP. Activation: 15 min in Cloudflare.
6. **No chargeback-spike-alert** — chargeback-rate climbs to 1.5% before anyone notices; by then Stripe has already frozen the account and the operator has $30k in held funds. **Fix:** wire Stripe Radar webhook → Slack alert at 0.5% rolling 7d rate (well before Stripe's 1% freeze threshold). The alert fires 3–7 days before Stripe acts.
7. **Inventory-zero-SKU-pdp-still-live** — best-selling SKU hits zero stock and the PDP still shows "Add to cart" with a checkout error; customer adds to cart, can't check out, leaves a 1-star review. **Fix:** Shopify inventory webhook → auto-hide the ATC button + show "Email me when back" form on the PDP (Klaviyo back-in-stock flow, see Move #10 Pillar 1 Flow 2).
8. **Customer-comms drafted-during-incident** — the operator spends 30–90 minutes drafting the apology email during the incident itself; that's 30–90 minutes of un-mitigated revenue loss. **Fix:** pre-draft all 12 templates (Step 3) — the on-call copy-pastes at minute 10 and moves to mitigation.
9. **Post-mortem-skipped-because-everyone-is-busy** — the team is exhausted after the incident; nobody writes the post-mortem; the same incident happens again 6 months later. **Fix:** post-mortem is a hard requirement in the runbook; 30-min time-boxed template; the corrective-action list has named owners + due dates.
10. **Tabletop-exercise-never-run** — the runbook exists but the team has never rehearsed it; the first real incident reveals that 3 of the 8 sections are incomplete. **Fix:** quarterly tabletop (Step 6) — pick 1 of the 8 incidents, declare it in #war-room, run the runbook, time the MTTR.
11. **3PL-claim-filed-too-late** — a pallet is lost; the operator finds out from a customer CS ticket 9 days after the ship date; the 3PL's claim-window is 7 days; the claim is denied. **Fix:** 3PL webhook → Slack alert at first exception; on-call files the claim within 24 hr (well within the 7-day window).
12. **Email-warmup-skipped-after-IP-blacklist** — Klaviyo's sending IP gets blacklisted; open-rate collapses from 30% to 5%; the operator re-enables the same IP and gets re-blacklisted within 24 hours. **Fix:** warm-IP swap via **Postmark** or **SendGrid** as a secondary sender; activate the warm-IP within 1 hour of the alert; re-warm over 7 days.
13. **Status-page-update-never-posted** — the operator fixes the incident but doesn't post a status-page update; affected customers email support asking "what happened?". **Fix:** status-page-update is a hard step in the runbook; **Statuspage** ($79/mo, by Atlassian) or **Better Stack** ($25/mo) for the public page; auto-sync from the runbook via Slack webhook.
14. **War-room-channel-never-declared** — the team chats in #general about the incident for 30 minutes before someone declares a war-room channel; signal drowns in the noise. **Fix:** the `/incident` Slack slash-command auto-creates a war-room channel and pins the runbook (custom Slack workflow, 30 min to set up).
15. **Rehearsal-burnout** — the operator rehearses the runbook once, gets tired of the ceremony, and stops. **Fix:** tie the rehearsal to a real cadence: 1 tabletop per quarter, rotating incidents, $50 stipend per on-call, post-tabletop retro on what's missing. Rothy's runs 2 per quarter; Athletic Greens runs 1 per quarter; Bombas runs monthly. Pick what you can sustain.

## Verification (this skill is "shipped" when...)

- [ ] All 8 status pages bookmarked in pinned Slack message + runbook README
- [ ] UptimeRobot monitoring 5 critical endpoints with Pushover page-on-2-misses
- [ ] Runbook committed to `docs/incident-runbook/` with 8 incident files + 4 template files (24 templates total)
- [ ] All 12 customer-comms templates pre-drafted and reviewed by the founder
- [ ] All 8 alert thresholds wired (UptimeRobot + Stripe + Meta + Cloudflare + 3PL + Shopify + Stripe Radar + Klaviyo)
- [ ] Ad-account-recovery forms pre-filed for Meta + Google + TikTok in `docs/incident-runbook/recovery-forms/`
- [ ] On-call rotation set up (PagerDuty free tier or equivalent) with 1 primary + 1 secondary + $50/mo stipend
- [ ] First tabletop exercise completed within 14 days of runbook commit; MTTR measured; corrective actions logged
- [ ] Customer-recovery 3-touch sequence built in Klaviyo for each of the 8 incidents
- [ ] **No real incident has caught the team without a runbook for at least 90 days post-shipping** (the canonical "this skill is shipped" gate)

## How to extend this skill

Once the core 8-incident runbook is live:
- Add **Move #231-a — Operator incident-response dashboard** (live 8-incident checklist widget on the operator dashboard, color-coded by incident type, with the 8 status-page iframes embedded for one-glance health check)
- Add **Move #231-b — 3PL-loss insurance** (carrier insurance + parcel insurance add-on that pays out on lost shipments; $0.05–$0.30 per shipment; covers 80–95% of the loss; activation: 1 hour)
- Add **Move #231-c — Ad-account backup-account strategy** (a parallel ad-account on each platform with $1/day "warm" spend so when the primary gets disabled, the backup is already warmed and can scale to full spend in 24 hr; activation: 1 hour per platform)
- Add **Move #231-d — Status-page public-comms** (Statuspage or Better Stack public status page linked from the footer; customers check the status page before emailing support; cuts "is the site down?" tickets by 30–50%)
- Add **Move #231-e — Tabletop-exercise-onboarding-doc** (1-page PDF that new hires read on day 1; covers the 8 incidents in 5-minute-scan format with the war-room pattern + on-call rotation + alert thresholds; activation: 30 min)

## Cross-references

- Companion skill: `cybersecurity` (Move #91 — bot-mitigation + DDoS protection + account-takeover defense — the 365-day prevention layer Move #231's response layer feeds into)
- Companion skill: `fraud-chargeback-management` (Move #33 — per-case fraud + chargeback handling; Move #231 is the SPIKE-response runbook that Move #33's per-case handling can't keep up with)
- Companion skill: `contact-center-operations` (Move #76 — daily-staffing + ticket-routing; Move #231 is the 5–20× ticket-volume-spike runbook that Move #76's staffing model assumes exists)
- Companion skill: `site-speed-core-web-vitals` (Move #35 — the 365-day performance baseline that Move #231's bot-surge incident assumes is being monitored)
- Companion skill: `inventory-forecasting-stockout-prevention` (Move #29 — the 365-day stockout-prevention baseline that Move #231's inventory-stockout incident assumes is being monitored)
- Research doc: `/research/00-ecommerce-ops-landscape.md` §5 (Inventory & Operations)

## Sources

- Shopify, "Shopify Status" 2024–2025 — https://www.shopifystatus.com
- Stripe, "Stripe Status" 2024–2025 — https://status.stripe.com
- Cloudflare, "Cloudflare Status" 2024–2025 — https://www.cloudflarestatus.com
- Meta, "Ad Account Disabled — Policy Enforcement" 2024 — https://www.facebook.com/business/help/430291176997542
- Google Ads, "Account Suspension Policy" 2024 — https://support.google.com/google-ads/answer/2375413
- TikTok, "Ad Account Review & Appeals" 2024 — https://ads.tiktok.com/help/article/appeals
- Cloudflare, "DDoS Threat Report 2024" — https://radar.cloudflare.com
- Cloudflare, "Bot Management" 2024 — https://www.cloudflare.com/products/bot-management/
- Akamai, "State of the Internet — Bot Traffic" 2024 — https://www.akamai.com/security-research/the-state-of-the-internet
- UptimeRobot, "Uptime Monitoring" 2024 — https://uptimerobot.com
- Better Stack, "Status Page" 2024 — https://betterstack.com/status
- Atlassian, "Statuspage" 2024 — https://www.atlassian.com/software/statuspage
- PagerDuty, "Incident Response" 2024 — https://www.pagerduty.com
- Incident.io, "Incident Management" 2024 — https://incident.io
- Stripe, "Fraud + Disputes Best Practices" 2024 — https://stripe.com/docs/disputes
- Stripe Radar, "Machine Learning Fraud Detection" 2024 — https://stripe.com/radar
- Microsoft, "Digital Defense Report" 2024 — https://www.microsoft.com/security/business/microsoft-digital-defense-report
- Verizon, "Data Breach Investigations Report (DBIR)" 2024 — https://www.verizon.com/business/resources/reports/dbir
- Klaviyo, "Deliverability Best Practices" 2024 — https://help.klaviyo.com/hc/en-us/articles/115005076787
- Postmark, "Email Deliverability" 2024 — https://postmarkapp.com/guides/deliverability
- F5, "State of Application Experience" 2024 — https://www.f5.com/state-of-application-strategy-report
- FS-ISA, "Financial Services Information Sharing and Analysis Center" 2024 — https://www.fsisac.com