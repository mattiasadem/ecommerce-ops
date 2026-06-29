# Subscription Flow Templates — 5 flows × 5 voices × {email + SMS}

> **Source.** Operator-copy companion to `research/08-subscriptions.md` (the canonical 11-section subscription-program research synthesis; Move #11 from `research/03-30-day-rollout-plan.md` §Next moves after 30 days line 176) + `playbooks/15-subscription-program-launch.md` (the canonical 2nd-layer operator-build companion). The canonical 3rd-layer operator-copy follow-up per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order; **17th asset in the workspace; ships the paste-ready email + SMS copy the playbook scopes but doesn't write**.
>
> **Companion artifact.** `playbooks/15-subscription-program-launch.md` ships the 4-phase operator build; this asset ships the 5 canonical subscriber-facing flows that the playbook builds into Klaviyo + Postscript. Read the playbook FIRST for the flow-architecture + the 4-alternative smart-cancellation flow + the 3-attempt dunning flow + the 60-day winback flow + the 5-discount-tier matrix; this asset then ships the actual paste-ready copy for each flow × 5 voice profiles.

## Goal

Ship a paste-ready subscription-flow email + SMS template library that compounds `research/08` 5-pillar framework + `playbooks/15` 4-phase operator build + Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty (Smile.io 2× points for subscription-orders) + the canonical 5-discount-tier matrix [5% / 10% / 15% / 20% / 25% off for 30-day / 45-day / 60-day / 90-day / 120-day cadence]. The 5 canonical flows are:

1. **Subscription-welcome** (immediate post-subscribe) — first-shipment confirmation + manage-subscription CTA + cross-sell-bait.
2. **Replenishment-reminder** (7-day-pre-shipment + 1-day-pre-shipment) — skip / pause / change-cadence buttons + cross-sell banner.
3. **Pause-reactivation** (Day 30 / Day 60 / Day 90 of pause) — "your subscription is paused" + reactivate-with-incentive CTA.
4. **Cancellation-confirmation** (immediate post-cancel) — confirm cancellation + 60-day winback-flow entry + offer-to-restart-with-discount.
5. **Winback** (60-day post-cancel drip 4 emails + 2 SMS) — return-to-subscription with escalating 15% / 20% / 25% discount ladder.

Each flow ships **5 voice-driven override columns** [Default / Luxury / Sustainable / Gen-Z / B2B] × **email + SMS** = **10 voice-driven cells per flow × 5 flows = 50 voice-driven cells** (the canonical content-only voice-cell count for the subscription-program track per the asset-increment companion-read-back recipe).

## The 5-discount-tier matrix (canonical from research/08 + playbook/15)

| Cadence | Discount | Use case | Recommended voice profile |
|---|---|---|---|
| **30-day** | **5% off** | Entry-level; high-conversion; low cannibalization | Default / Gen-Z (price-conscious) |
| **45-day** | **10% off** | Standard consumables cadence | Default / Sustainable |
| **60-day** | **15% off** | Most common DTC consumables cadence | Default / Sustainable |
| **90-day** | **20% off** | Quarterly bulk; supplements / pet food | Luxury / B2B |
| **120-day** | **25% off** | Bi-annual bulk; specialty / luxury | Luxury / B2B |

The canonical smart-cancellation flow uses **25% discount for the next 3 shipments** (playbook/15 §1.3 Step 4) — the highest discount tier, applied as a retention lever.

The canonical winback-flow escalation uses **15% → 20% → 25% off restart-with-discount** ladder across Email 1 / 2 / 3 (playbook/15 §2 Step 6).

## The 5 voice profiles (canonical from `assets/02-brand-voice.md`)

| Voice | Tone tells | Best for |
|---|---|---|
| **Default** | Friendly, conversational, "your subscription is set", 6th-grade reading level | Most DTC consumables brands |
| **Luxury** | Heritage, restrained, "your replenishment", 8th-grade reading level, longer sentences | Premium supplements, artisan beauty, gourmet food |
| **Sustainable** | Mission-first, "your impact", 7th-grade reading level, explicit impact framing | B Corp, Climate Neutral, 1% for the Planet brands |
| **Gen-Z** | Meme-aware, emoji, "yo", 5th-grade reading level, very short sentences | Beauty, beverage, snacks targeting 18-28 demographic |
| **B2B** | Compliance, transactional, "your account", 9th-grade reading level, professional tone | Wholesale / B2B subscription, professional supplies |

## The 5 canonical subscription flows

---

### Flow 1 — Subscription-welcome (immediate post-subscribe)

**Trigger:** Recharge's `Subscribe (Recharge)` metric. **Email 1 immediate + Email 2 at Day 3 + Email 3 at Day 7 + Email 4 at Day 14 + Email 5 at Day 30** (canonical 5-email cadence from playbook/15 §1.3 Step 1). **SMS 1 immediate + SMS 2 at Day 7 + SMS 3 at Day 30** (3-SMS cadence from playbook/15 §1.3 Step 2).

#### Email 1 — Welcome + first-shipment confirmation (immediate)

| Voice | Subject line (≤50 chars) | Preview text | Body (paste-ready Klaviyo) |
|---|---|---|---|
| **Default** | Welcome to your subscription | Your first shipment is on its way | Hi {{ first_name }}, welcome to the {{ brand_name }} subscription! Your first shipment of {{ subscription_product }} is on its way — you'll get a tracking email within 24 hours. Manage your subscription anytime: [manage subscription link]. Questions? Just reply to this email. — {{ brand_name }} |
| **Luxury** | Your subscription is set | The first of many replenishments | Dear {{ first_name }}, your subscription to {{ subscription_product }} has been activated with care. Your first replenishment is being prepared and will arrive within 5-7 business days, packaged with the attention your patronage deserves. Access your account at your convenience: [account link]. — The {{ brand_name }} atelier |
| **Sustainable** | Welcome — your impact starts now | Every shipment = 1% donated + carbon-neutral | {{ first_name }}, welcome to the {{ brand_name }} subscription! Your first {{ subscription_product }} shipment is on its way — and every shipment plants 1 tree + donates 1% to climate justice (we're 1% for the Planet certified). Manage your subscription: [link]. Track your impact: [impact dashboard link]. — {{ brand_name }} |
| **Gen-Z** | yo, you're subscribed 🎉 | first shipment incoming | hii {{ first_name }}!! welcome to the {{ brand_name }} fam 💕 your first {{ subscription_product }} ships today!! track it + manage your sub here: [link] — reply anytime 💌 |
| **B2B** | Subscription activated — confirmation | Account ID + first-shipment ETA | {{ first_name }}, your {{ brand_name }} subscription has been activated. Subscription ID: {{ subscription_id }}. First shipment ETA: {{ first_ship_date }}. Login to manage subscription, view invoices, or update payment method: [account portal link]. Support: [support email] / [support phone]. |

#### Email 2 — How your subscription works (Day 3)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | How your subscription works | Hi {{ first_name }}, here's the 30-second tour of how your {{ brand_name }} subscription works. You can pause anytime (up to 3 months), skip a shipment, change the cadence (30/45/60/90/120 days), or cancel anytime — no fees, no questions. Manage here: [link]. — {{ brand_name }} |
| **Luxury** | A brief note on flexibility | {{ first_name }}, a reminder that your subscription is yours to shape. Pause, adjust cadence, or modify quantity at your discretion — your account portal offers complete control: [link]. For personal assistance, reply to this message. — {{ brand_name }} |
| **Sustainable** | How to flex with your subscription | {{ first_name }}, here's how to adjust your {{ brand_name }} subscription to fit your life — pause for travel, skip if you have enough, change cadence for the season. Zero waste, zero friction: [link]. — {{ brand_name }} |
| **Gen-Z** | how to flex your sub ✨ | {{ first_name }}! your sub is 100% flexible 💫 pause / skip / change anytime — no fees, no guilt trips, no questions. manage here: [link] — lmk if you need anything 💌 |
| **B2B** | Subscription management — quick reference | {{ first_name }}, your {{ brand_name }} subscription can be modified at any time via the account portal: pause (up to 90 days), skip-a-shipment, change cadence (30/45/60/90/120 days), or cancel. For bulk-order changes (10+ units), contact your account manager: [am email]. Portal: [link]. |

#### Email 3 — Smile.io loyalty-points-2× trigger (Day 7)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | You're earning 2× loyalty points | Hi {{ first_name }}, subscribers earn 2× the standard loyalty points on every shipment — plus a 100-point bonus on your subscription anniversary. Check your points balance: [loyalty link]. — {{ brand_name }} |
| **Luxury** | The subscriber's advantage | {{ first_name }}, as a subscriber you accrue double loyalty points with each delivery, redeemable for complimentary products, exclusive experiences, or charitable contributions of equivalent value. View your balance: [link]. — {{ brand_name }} |
| **Sustainable** | Subscribers = 2× impact | {{ first_name }}, subscribers earn 2× loyalty points — and every 500 points = 1 additional tree planted through our partnership with [nonprofit]. Your subscriber status amplifies your impact: [loyalty link]. — {{ brand_name }} |
| **Gen-Z** | 2x points just for subscribing 🎁 | OK {{ first_name }} this is a HUGE perk — subscribers earn 2x loyalty points on EVERY shipment 💸 that's like... free stuff, eventually. check your points: [link] |
| **B2B** | Subscriber benefits — tier summary | {{ first_name }}, your {{ brand_name }} subscription qualifies for tier-2 loyalty benefits including 2× points accrual and quarterly account-review meetings. View benefits: [link]. Contact your AM: [am email]. |

#### Email 4 — How your first subscription month is going (Day 14)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | 2 weeks in — how's it going? | Hi {{ first_name }}, you're 2 weeks into your subscription — how's it going? If anything's not right (cadence, product, anything), just reply to this email and we'll fix it. Otherwise, your next shipment ships on {{ next_ship_date }}. — {{ brand_name }} |
| **Luxury** | A check-in at the fortnight | {{ first_name }}, two weeks into your subscription — a courtesy check-in. Should the cadence, quantity, or selection require adjustment, we are at your service. Reply to this message or access your account: [link]. — {{ brand_name }} |
| **Sustainable** | 2 weeks in — feedback? | {{ first_name }}, 2 weeks into your subscription! If the cadence / quantity / product selection isn't perfect, just reply and we'll adjust — your zero-waste subscription should fit YOUR life. Next shipment: {{ next_ship_date }}. — {{ brand_name }} |
| **Gen-Z** | 2 weeks in — thoughts? 💭 | hii {{ first_name }}! you're 2 weeks into your sub — everything vibe? 💫 if anything's off (cadence, product, anything), just reply and we'll fix it. next ship: {{ next_ship_date }} |
| **B2B** | Subscription check-in — Day 14 | {{ first_name }}, two weeks into your subscription. Please confirm the cadence, quantity, and product mix align with your operational needs. Adjustments via the portal: [link] or contact your AM: [am email]. Next shipment: {{ next_ship_date }}. |

#### Email 5 — First-replenishment shipped (Day 30)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your first replenishment shipped | Hi {{ first_name }}, your next shipment of {{ subscription_product }} ships today — tracking: [tracking link]. Need to skip / pause / change? [manage subscription link]. — {{ brand_name }} |
| **Luxury** | Your replenishment is en route | {{ first_name }}, your replenishment has been dispatched. Track its journey: [tracking link]. For modifications to subsequent deliveries, your account portal remains at your disposal: [link]. — {{ brand_name }} |
| **Sustainable** | Your first replenishment + impact | {{ first_name }}, your 2nd {{ subscription_product }} shipment ships today! Tracking: [link]. This shipment = 1 tree planted + carbon-neutral delivery. Adjust: [subscription link]. — {{ brand_name }} |
| **Gen-Z** | replenishment incoming 🚚 | {{ first_name }} your 2nd shipment is OUT 🚚 track here: [link] + manage your sub: [link] ty for being a subscriber 💕 |
| **B2B** | Replenishment dispatched — Shipment 2 | {{ first_name }}, your 2nd subscription shipment has dispatched. Tracking: [tracking link]. Invoice: [invoice link]. Bulk-order adjustments (10+ units) require 14-day advance notice; contact your AM: [am email]. — {{ brand_name }} |

#### SMS — 3-message sequence (immediate / Day 7 / Day 30)

| Voice | SMS 1 (immediate, ≤160 chars) | SMS 2 (Day 7, ≤160 chars) | SMS 3 (Day 30, ≤160 chars) |
|---|---|---|---|
| **Default** | Hi {{ first_name }}! Your 1st {{ subscription_product }} sub just shipped. Track: {{ tracking_url }} Manage: {{ portal_url }} | Your sub is flexible — pause/skip/change anytime, no fees. {{ portal_url }} | 2nd shipment incoming! {{ tracking_url }} — reply HELP for help, STOP to unsub. |
| **Luxury** | {{ first_name }}, your inaugural {{ brand_name }} replenishment is en route. {{ tracking_url }} | For adjustments to your subscription, your account awaits: {{ portal_url }} | Your next replenishment has been dispatched. {{ tracking_url }} |
| **Sustainable** | {{ first_name }}! Your 1st sub is on its way — and it's carbon-neutral 🌱 {{ tracking_url }} | Flex your sub to fit your life — pause/skip/change with zero waste: {{ portal_url }} | Replenishment incoming! Tracking: {{ tracking_url }} — 1 tree planted per shipment 🌳 |
| **Gen-Z** | yooo {{ first_name }} 🎉 1st sub INCOMING! {{ tracking_url }} manage: {{ portal_url }} | your sub is super flexible 💫 pause/skip anytime — {{ portal_url }} | 2nd sub shipped! 🚚 {{ tracking_url }} 💕 |
| **B2B** | {{ brand_name }} sub activated. Shipment 1 dispatched. Tracking: {{ tracking_url }} Acct portal: {{ portal_url }} | For sub adjustments, login: {{ portal_url }} Bulk changes (10+ units): {{ am_email }} | Shipment 2 dispatched. Tracking: {{ tracking_url }} Invoice: {{ invoice_url }} |

---

### Flow 2 — Replenishment-reminder (7-day-pre-shipment + 1-day-pre-shipment)

**Trigger:** Recharge's `Pre-shipment Reminder` metric (configurable). **Email at Day -7 + Email at Day -1 + SMS at Day -1** (canonical cadence from playbook/15 §3.1 Step 1).

#### Email — Replenishment reminder (Day -7)

| Voice | Subject line (≤50 chars) | Body |
|---|---|---|
| **Default** | Your subscription ships in 7 days | Hi {{ first_name }}, your {{ subscription_product }} shipment is scheduled for {{ ship_date }} — track it: [tracking link]. Need to skip / pause / change? [manage link]. — {{ brand_name }} |
| **Luxury** | Your replenishment approaches | {{ first_name }}, a courtesy reminder — your {{ subscription_product }} replenishment is scheduled for {{ ship_date }}. Adjustments may be made via your account: [link]. — {{ brand_name }} |
| **Sustainable** | Heads-up: replenishment in 7 days | {{ first_name }}, your {{ subscription_product }} refill ships {{ ship_date }}! Need to skip / pause / change? [link] — zero-waste means we ship ONLY when you need it. — {{ brand_name }} |
| **Gen-Z** | replenishment in 7 days ✨ | hii {{ first_name }}! your {{ subscription_product }} sub ships {{ ship_date }} — track: [link] + manage: [link] 💫 |
| **B2B** | Subscription shipment — Day -7 reminder | {{ first_name }}, {{ brand_name }} subscription shipment scheduled {{ ship_date }}. Confirm quantity / address / cadence via portal: [link]. Bulk-order changes (10+ units) require 5-day advance notice. — {{ brand_name }} |

#### Email — Replenishment reminder (Day -1)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your subscription ships tomorrow | Hi {{ first_name }}, your {{ subscription_product }} ships tomorrow! Need to skip / pause? [manage link]. Cross-sell: add {{ cross_sell_product }} to this shipment: [add-on link]. — {{ brand_name }} |
| **Luxury** | Tomorrow's replenishment | {{ first_name }}, your {{ subscription_product }} replenishment is dispatched tomorrow. To make a final modification: [link]. For a curated add-on, consider: {{ cross_sell_link }}. — {{ brand_name }} |
| **Sustainable** | Tomorrow's shipment — plus an add-on idea | {{ first_name }}, your {{ subscription_product }} sub ships tomorrow 🌱 add a refill of {{ cross_sell_product }} to this shipment (also carbon-neutral): [add-on link]. Manage sub: [link]. — {{ brand_name }} |
| **Gen-Z** | ships tomorrow!! 🚚 | {{ first_name }} your sub ships TOMORROW 🎉 add {{ cross_sell_product }} to the box: [link] — manage: [link] 💕 |
| **B2B** | Replenishment — Day -1 final notice | {{ first_name }}, subscription shipment dispatched tomorrow. Final modification window: 24 hours via portal: [link]. Bulk-order additions (10+ units): contact AM by EOD today: [am email]. — {{ brand_name }} |

#### SMS — Replenishment reminder (Day -1, ≤160 chars)

| Voice | SMS |
|---|---|
| **Default** | {{ first_name }}, your {{ subscription_product }} sub ships tomorrow 🚚 track: {{ tracking_url }} manage: {{ portal_url }} |
| **Luxury** | {{ first_name }}, your replenishment is dispatched tomorrow. Adjustments: {{ portal_url }} |
| **Sustainable** | {{ first_name }}, your refill ships tomorrow 🌱 track + manage: {{ portal_url }} add {{ cross_sell_product }} to this box: {{ cross_sell_url }} |
| **Gen-Z** | ships tmrw 🎉 {{ tracking_url }} manage: {{ portal_url }} 💕 |
| **B2B** | Subscription ships tmrw. Final changes: {{ portal_url }} Bulk changes (10+ units): {{ am_email }} |

---

### Flow 3 — Pause-reactivation (Day 30 / Day 60 / Day 90 of pause)

**Trigger:** Klaviyo segment `is_subscriber = false AND pause_start_date >= 30 days ago` (canonical segment from playbook/15 §1.3 Step 3). **Email at Day 30 + Email at Day 60 + Email at Day 90 + SMS at Day 90** (canonical cadence from playbook/15 §1.3 + canonical 3-attempt cadence).

#### Email — Day 30 of pause

| Voice | Subject line (≤50 chars) | Body |
|---|---|---|
| **Default** | Your subscription is paused | Hi {{ first_name }}, your subscription is paused until {{ resume_date }}. Want to reactivate early? [reactivate link]. Or extend the pause: [pause link]. — {{ brand_name }} |
| **Luxury** | A pause acknowledgment | {{ first_name }}, your subscription remains paused until {{ resume_date }} as requested. To resume your deliveries early: [link]. To extend the pause: [link]. — {{ brand_name }} |
| **Sustainable** | Your sub is on pause — until when? | {{ first_name }}, your sub is paused until {{ resume_date }}. Reactivate early (and we'll plant 2 trees instead of 1): [link]. Extend pause: [link]. — {{ brand_name }} |
| **Gen-Z** | sub on pause 💤 | {{ first_name }} your sub is paused until {{ resume_date }} — reactivate early: [link] extend: [link] 💕 |
| **B2B** | Subscription pause — Day 30 reminder | {{ first_name }}, your {{ brand_name }} subscription remains paused until {{ resume_date }}. To resume or extend: portal: [link]. Bulk adjustments (10+ units): contact AM: [am email]. |

#### Email — Day 60 of pause (incentive: 10% off resume)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Ready to resume? Here's 10% off | Hi {{ first_name }}, your pause has been going for 60 days — want to come back? Reactivate today and get 10% off your next 3 shipments: [reactivate-with-discount link]. — {{ brand_name }} |
| **Luxury** | An invitation to resume — with grace | {{ first_name }}, your subscription has been paused for two months. Should you wish to resume, we offer 10% off your next three replenishments as a courtesy: [link]. — {{ brand_name }} |
| **Sustainable** | 60 days paused — ready to come back? | {{ first_name }}, your sub has been paused for 60 days. Resume with 10% off your next 3 shipments (we'll plant an extra tree for every shipment during your pause-window): [link]. — {{ brand_name }} |
| **Gen-Z** | miss us? 🥺 10% off to come back! | hiii {{ first_name }} your sub's been paused 60 days 🥺 come back for 10% off next 3 ships: [link] 💕 |
| **B2B** | Subscription reactivation offer — 10% off | {{ first_name }}, your paused subscription qualifies for a 10% reactivation discount on the next 3 shipments. To resume with discount: portal: [link]. Bulk-order reactivation: contact AM: [am email]. |

#### Email — Day 90 of pause (final pause-expiry notice)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | Your pause is ending | Hi {{ first_name }}, your pause ends on {{ resume_date }} — your next shipment will go out then. To cancel before resuming: [cancel link]. To reactivate now with 15% off: [reactivate-with-discount link]. — {{ brand_name }} |
| **Luxury** | Your pause concludes | {{ first_name }}, your pause concludes on {{ resume_date }}. To modify this arrangement — cancel, extend, or resume with 15% courtesy discount: [link]. — {{ brand_name }} |
| **Sustainable** | Pause ending — decide before {{ resume_date }} | {{ first_name }}, your sub pause ends {{ resume_date }}. Cancel before resuming: [link]. Reactivate with 15% off + double-tree-planting: [link]. — {{ brand_name }} |
| **Gen-Z** | pause over {{ resume_date }} — what now? | {{ first_name }} your pause ends {{ resume_date }} — cancel: [link] / reactivate 15% off: [link] / lmk if you need anything 💕 |
| **B2B** | Subscription pause ending — action required | {{ first_name }}, your pause concludes {{ resume_date }}. Action required by {{ resume_date }}: cancel [link] / resume [link] / extend [link]. Bulk-order adjustments: contact AM by {{ resume_date }}: [am email]. |

#### SMS — Day 90 pause-expiry (≤160 chars)

| Voice | SMS |
|---|---|
| **Default** | {{ first_name }}, your pause ends {{ resume_date }}. Reactivate w/ 15% off: {{ reactivate_url }} Or cancel: {{ cancel_url }} |
| **Luxury** | {{ first_name }}, your pause concludes {{ resume_date }}. Modifications: {{ portal_url }} |
| **Sustainable** | {{ first_name }}, your pause ends {{ resume_date }}. Reactivate w/ 15% off + 2x tree-plant: {{ reactivate_url }} |
| **Gen-Z** | pause over {{ resume_date }} 💤 reactivate w/ 15% off: {{ reactivate_url }} 💕 |
| **B2B** | Sub pause ends {{ resume_date }}. Action required: {{ portal_url }} Bulk: {{ am_email }} |

---

### Flow 4 — Cancellation-confirmation (immediate post-cancel)

**Trigger:** Recharge's `Subscription Cancelled` metric. **Email at immediate + SMS at immediate** (canonical from playbook/15 §2 Step 6).

> **CRITICAL:** The canonical 4-alternative smart-cancellation flow [pause / skip / change-frequency / 25%-discount] per playbook/15 §2 Step 4 should fire BEFORE this email. This email only sends if the subscriber accepted cancellation OR declined all 4 alternatives. If the 4-alternative flow recovered the cancellation, the cancellation-confirmation email does NOT send.

#### Email — Cancellation confirmed + offer to restart (immediate)

| Voice | Subject line (≤50 chars) | Body |
|---|---|---|
| **Default** | Your subscription is cancelled | Hi {{ first_name }}, your {{ subscription_product }} subscription has been cancelled as requested. We're sorry to see you go! If you change your mind, restart anytime with 15% off your first 3 shipments: [restart-with-discount link]. — {{ brand_name }} |
| **Luxury** | Your subscription has concluded | {{ first_name }}, your {{ brand_name }} subscription has been cancelled per your request. Should you wish to resume, we offer 15% off your next three replenishments as a parting courtesy: [link]. — {{ brand_name }} |
| **Sustainable** | Subscription cancelled — reactivation is one click | {{ first_name }}, your {{ subscription_product }} sub is cancelled. If you change your mind, reactivate with 15% off — and we'll plant 2 trees instead of 1 for the next 3 shipments (a "pause-for-the-planet" bonus): [restart link]. — {{ brand_name }} |
| **Gen-Z** | sub cancelled 💔 come back anytime! | hiii {{ first_name }} your sub is cancelled 💔 but if you ever want to come back, here's 15% off your next 3 ships: [restart link] — no judgment, no guilt 💕 |
| **B2B** | Subscription cancelled — reactivation terms | {{ first_name }}, your {{ brand_name }} subscription has been cancelled. Reactivation terms available for 60 days: 15% off next 3 shipments. To reactivate: portal: [link]. For account changes: contact AM: [am email]. |

#### SMS — Cancellation confirmed (immediate, ≤160 chars)

| Voice | SMS |
|---|---|
| **Default** | {{ first_name }}, your {{ subscription_product }} sub is cancelled. Restart w/ 15% off: {{ restart_url }} — sorry to see you go 💔 |
| **Luxury** | {{ first_name }}, your subscription has concluded. Reactivation w/ courtesy discount: {{ portal_url }} |
| **Sustainable** | {{ first_name }}, sub cancelled. Restart w/ 15% off + 2x tree-plant: {{ restart_url }} 🌱 |
| **Gen-Z** | sub cancelled 💔 restart w/ 15% off: {{ restart_url }} no judgment 💕 |
| **B2B** | Sub cancelled. Reactivation available 60 days: {{ portal_url }} Bulk: {{ am_email }} |

---

### Flow 5 — Winback (60-day post-cancel drip)

**Trigger:** Klaviyo segment `subscription_status = cancelled AND cancel_date >= 1 day ago` (canonical segment from playbook/15 §2 Step 6). **Email 1 immediate + Email 2 at Day 7 + Email 3 at Day 30 + Email 4 at Day 60 + SMS 1 at Day 30 + SMS 2 at Day 60** (canonical cadence from playbook/15 §2 Step 6 + canonical 15% → 20% → 25% escalating-discount ladder).

#### Email 1 — Immediate post-cancel (15% off)

| Voice | Subject line (≤50 chars) | Body |
|---|---|---|
| **Default** | Come back — 15% off your first 3 shipments | Hi {{ first_name }}, we miss you! Restart your {{ subscription_product }} subscription today and get 15% off your first 3 shipments: [restart-with-discount link]. No questions asked. — {{ brand_name }} |
| **Luxury** | A modest invitation to return | {{ first_name }}, should you wish to resume your {{ subscription_product }} subscription, we offer 15% off your next three replenishments as a courtesy: [link]. — {{ brand_name }} |
| **Sustainable** | We miss you — restart with impact | {{ first_name }}, we miss you! Restart your {{ subscription_product }} sub with 15% off your next 3 shipments — and we'll plant an extra tree for each one (a "welcome-back-to-the-planet" bonus): [restart link]. — {{ brand_name }} |
| **Gen-Z** | come back?? 🥺 15% off ur next 3 ships | hiii {{ first_name }} 🥺 we miss you — restart your sub for 15% off ur next 3 ships: [link] 💕 no pressure |
| **B2B** | Subscription reactivation — 15% courtesy | {{ first_name }}, your {{ brand_name }} subscription remains available for reactivation. 15% off your next 3 shipments valid for 30 days. Portal: [link]. Bulk reactivation: contact AM: [am email]. |

#### Email 2 — Day 7 (20% off)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | 20% off if you come back | Hi {{ first_name }}, we upped the offer — restart your {{ subscription_product }} sub today and get 20% off your first 3 shipments: [restart-with-discount link]. — {{ brand_name }} |
| **Luxury** | A more generous invitation | {{ first_name }}, an enhanced courtesy — 20% off your next three replenishments should you resume your subscription: [link]. — {{ brand_name }} |
| **Sustainable** | 20% off + double-tree impact | {{ first_name }}, restart your sub for 20% off your next 3 shipments — plus, we'll plant 2 trees per shipment (we missed you while you were gone, and the planet did too): [restart link]. — {{ brand_name }} |
| **Gen-Z** | 20% off now 🎉 come back? | hiii {{ first_name }} ok we made the offer BETTER 💸 restart for 20% off ur next 3 ships: [link] 🎉 |
| **B2B** | Reactivation offer — 20% courtesy | {{ first_name }}, your subscription reactivation offer has been enhanced to 20% off your next 3 shipments, valid for 23 days. Portal: [link]. Bulk reactivation: contact AM: [am email]. |

#### Email 3 — Day 30 (25% off + product-launches-since-cancel)

| Voice | Subject line | Body |
|---|---|---|
| **Default** | 25% off + new launches since you left | Hi {{ first_name }}, your final offer — restart your sub for 25% off your first 3 shipments. Plus, here are the {{ count_new_products }} new products we launched since you cancelled: {{ new_product_link }}. [restart-with-discount link]. — {{ brand_name }} |
| **Luxury** | Our final invitation — 25% courtesy + new arrivals | {{ first_name }}, a final offer — 25% off your next three replenishments, plus an introduction to the {{ count_new_products }} new products that have arrived since your departure: {{ new_product_link }}. [link]. — {{ brand_name }} |
| **Sustainable** | 25% off + new sustainable launches | {{ first_name }}, 25% off your next 3 shipments + meet the {{ count_new_products }} new climate-positive products we launched since you left (carbon-neutral, fair-trade, plastic-free): [restart-with-discount link]. [new-product link]. — {{ brand_name }} |
| **Gen-Z** | ok LAST offer 🎁 25% off + new drops | {{ first_name }} last call!! 25% off ur next 3 ships + check out our new drops since u left: [link] [new-product link] 🎁 |
| **B2B** | Reactivation — 25% off + new product catalog | {{ first_name }}, final reactivation offer: 25% off your next 3 shipments + access to the {{ count_new_products }} new products launched since your cancellation (Q3 catalog attached: [catalog link]). Portal: [link]. Bulk reactivation: contact AM: [am email]. |

#### Email 4 — Day 60 (final winback, 30% off "we'd love to have you back")

| Voice | Subject line | Body |
|---|---|---|
| **Default** | We'd love to have you back — 30% off | Hi {{ first_name }}, this is our last reactivation offer — 30% off your first 3 shipments if you restart today. After this, we'll move you to our standard newsletter (no more reactivation emails): [restart-with-discount link]. — {{ brand_name }} |
| **Luxury** | A final parting courtesy — 30% | {{ first_name }}, a final courtesy — 30% off your next three replenishments should you resume. Following this, our correspondence will return to standard newsletter cadence: [link]. — {{ brand_name }} |
| **Sustainable** | Last chance — 30% off + lifetime tree-planting | {{ first_name }}, our final offer — 30% off your next 3 shipments + for every shipment we ship you, we'll plant 3 trees (a "lifetime-impact" thank-you): [restart-with-discount link]. — {{ brand_name }} |
| **Gen-Z** | last chance!! 🥺 30% off | {{ first_name }} ok last chance EVER 🥺 30% off ur next 3 ships + we'll stop bothering u after this we promise 💌 [restart link] |
| **B2B** | Final reactivation — 30% courtesy | {{ first_name }}, final reactivation offer: 30% off your next 3 shipments, valid for 7 days. Portal: [link]. Following this, your account returns to standard outreach cadence. Bulk reactivation: contact AM: [am email]. |

#### SMS — Winback escalation (Day 30 + Day 60, ≤160 chars)

| Voice | SMS 1 (Day 30) | SMS 2 (Day 60) |
|---|---|---|
| **Default** | {{ first_name }}, 25% off ur next 3 sub ships + new launches since u left: {{ restart_url }} | {{ first_name }}, final offer — 30% off ur next 3 ships: {{ restart_url }} 💌 |
| **Luxury** | {{ first_name }}, 25% off + new arrivals since your departure: {{ portal_url }} | {{ first_name }}, a final courtesy — 30% off: {{ portal_url }} |
| **Sustainable** | {{ first_name }}, 25% off + meet our new climate-positive launches: {{ restart_url }} 🌱 | {{ first_name }}, final offer — 30% off + lifetime 3x tree-planting: {{ restart_url }} 🌳 |
| **Gen-Z** | 25% off + new drops 🎉 restart: {{ restart_url }} 💕 | last offer!! 30% off ur next 3 ships: {{ restart_url }} 🥺💕 |
| **B2B** | Sub reactivation: 25% off next 3 + Q3 catalog: {{ portal_url }} Bulk: {{ am_email }} | Final offer: 30% off next 3 sub ships, valid 7 days: {{ portal_url }} Bulk: {{ am_email }} |

---

## Klaviyo conditional-content syntax (multi-voice operators)

For multi-voice operators (operators running both Default and Luxury brands from a single Klaviyo account), use Klaviyo's `{% if voice_profile == "luxury" %}` conditional-content blocks:

```liquid
{% if voice_profile == "default" %}
Hi {{ first_name }}, welcome to your {{ brand_name }} subscription!
{% elif voice_profile == "luxury" %}
Dear {{ first_name }}, your subscription has been activated with care.
{% elif voice_profile == "sustainable" %}
{{ first_name }}, welcome — and every shipment plants 1 tree!
{% elif voice_profile == "genz" %}
yooo {{ first_name }} 🎉 you're IN!
{% elif voice_profile == "b2b" %}
{{ first_name }}, subscription activated. Acct ID: {{ subscription_id }}.
{% endif %}
```

Set `voice_profile` as a Klaviyo custom property from Recharge's customer-meta field via Klaviyo's data-sync.

## Triple Whale UTM on every CTA (canonical from `assets/14-lifecycle-flow-templates.md`)

Every CTA in every email + SMS carries the canonical Triple Whale UTM:

```
?utm_source=klaviyo&utm_medium=email&utm_campaign=sub_{{ flow_id }}_v{{ voice_profile }}&tw_camp={{ flow_id }}_{{ voice_profile }}
```

Replace `{{ flow_id }}` with one of: `sub_welcome` / `sub_replenishment` / `sub_pause_reactivate` / `sub_cancel_confirm` / `sub_winback`. Replace `{{ voice_profile }}` with: `default` / `luxury` / `sustainable` / `genz` / `b2b`.

## Suppression rules (canonical 5 from playbook/15 + research/08)

1. **Suppression A — already-cancelled-flag** — `subscription_status = cancelled` does NOT receive replenishment-reminder or pause-reactivation (only winback-flow). Prevents the embarrassing "your subscription ships tomorrow" email to a cancelled subscriber.
2. **Suppression B — first-shipment-not-shipped** — `subscription_status = active AND first_ship_date > today` does NOT receive replenishment-reminder. Prevents the "your subscription ships in 7 days" email before the first shipment.
3. **Suppression C — 90-day-after-final-pause** — subscribers who paused for 90+ days and did NOT reactivate get the Day-90 pause-expiry email + SMS, then move to standard newsletter (no more pause-reactivation). Prevents infinite pause-loop.
4. **Suppression D — already-3-attempt-dunning** — `payment_failed_count >= 3` does NOT receive additional dunning emails; the operator gets a CS-touch alert. Prevents "your subscription will be cancelled" 4+ times.
5. **Suppression E — winback-after-restart** — `subscription_status = active AND restart_date >= 60 days ago` does NOT receive winback-flow. Prevents the "come back" email to a restarted subscriber.

## Frequency caps (canonical 3)

1. **Cap 1 — pause-reactivation cap** — 1 pause-reactivation email per 30-day window (the Day 30 / Day 60 / Day 90 sequence runs ONCE per pause; if the subscriber pauses again later, the sequence runs again).
2. **Cap 2 — winback cap** — 4 emails + 2 SMS over 60 days MAX. After Email 4 (Day 60), subscriber moves to standard newsletter. Prevents winback-fatigue per playbook/15 §3.1 Step 2.
3. **Cap 3 — replenishment-reminder cap** — 2 emails + 1 SMS per shipment (Day -7 + Day -1 + Day -1 SMS). Prevents over-communication before a single shipment.

## 12 common subscription-flow pitfalls (with corrective Fix lines)

### A — Wrong-flow-trigger fires

1. **Cancellation-confirmation email fires before smart-cancellation flow runs.** Symptom: subscriber receives "your subscription is cancelled" within 60 seconds of clicking cancel, before the 4-alternative smart-cancellation flow can present pause / skip / change-frequency / 25%-discount. **Fix:** Configure Recharge's `Pre-cancellation Survey` to fire the 4-alternative flow FIRST, then send the cancellation-confirmation email ONLY if all 4 alternatives are declined. Use Recharge Plus's `Cancellation Flow Builder` with `delay cancellation email: true` and `delay duration: 5 minutes`.

2. **Replenishment-reminder fires after the subscriber already paused via the customer portal.** Symptom: paused subscriber receives "your subscription ships tomorrow" email. **Fix:** Add Klaviyo conditional `{% if subscription_status == 'paused' %}{% cancel %}{% endif %}` at the top of every replenishment-reminder email template, OR configure Recharge's `Pre-shipment Email` to skip paused subscriptions.

3. **Winback-flow fires for a subscriber who just upgraded to a higher-tier subscription.** Symptom: upgraded subscriber receives "come back — 15% off" winback email because the OLD subscription is marked cancelled but the NEW subscription is active. **Fix:** Add Klaviyo conditional `{% if not subscription_upgraded %}{% endif %}` to the winback-flow trigger, OR set the winback-flow trigger on `subscription_status == 'cancelled' AND subscription_upgraded == false`.

### B — Discount-stacking-violation

4. **Subscriber restarts via winback-flow with 30% off, then smart-cancellation offers 25% discount on top.** Symptom: subscriber restarts at 30% off, then cancels again, sees the 25%-discount alternative, restarts at 30%+25% stacked. **Fix:** Configure Recharge's smart-cancellation alternative 4 (25% discount) to NOT stack with active winback-discounts. Use Recharge Plus's `Discount Stacking Rule` with `max_discount_pct: 30`.

5. **Pause-reactivation Day-90 email offers 15% off, but a separate "we-miss-you" newsletter email offers 20% off on the same day.** Symptom: subscriber receives 2 emails in the same day with conflicting offers. **Fix:** Suppression-rule the Day-90 pause-reactivation email if a "we-miss-you" newsletter email has sent in the last 7 days; use Klaviyo's `email interaction` filter to suppress.

### C — Voice-profile-routing-breaks

6. **Multi-voice operators' Klaviyo conditional-content blocks fall through to "Default" for 100% of subscribers because `voice_profile` is not set as a custom property.** Symptom: every email renders as Default-voice, even for Luxury-brand subscribers. **Fix:** Sync `voice_profile` from Shopify customer-tags (`tag:subscribe-luxury` → `voice_profile = "luxury"`) into Klaviyo via the Klaviyo-Shopify integration's `Custom Properties` mapping; verify with `Klaviyo → Customer → Properties → voice_profile == "luxury"`.

7. **Gen-Z-voice template uses an emoji that doesn't render in the operator's email client.** Symptom: subscribers see `??` or blank squares instead of 🎉 / 💕 / 🌱. **Fix:** Use only emojis in the Unicode 6.0 baseline (the 700 most-popular emojis) which all modern email clients support; AVOID Unicode 13+ emojis (the newest gradient emojis); test every email in Litmus / Email on Acid for emoji-rendering before sending.

### D — SMS-character-cap-exceeded

8. **B2B-voice SMS exceeds 160 characters because the compliance footer adds 30 characters.** Symptom: B2B SMS truncates the link or the call-to-action. **Fix:** Reserve the LAST 50 characters of every SMS for the canonical compliance footer (`Reply STOP to unsub. Msg rates may apply.`); build the body in 110 characters + the 50-char footer = 160 total. Use Klaviyo SMS's `preview_footer` field to verify pre-send.

9. **Gen-Z-voice SMS counts 168 characters because of 4 emojis + a long URL.** Symptom: Gen-Z SMS splits into 2 messages (carrier charges the subscriber for 2). **Fix:** Use Klaviyo's `short_url` to auto-shorten URLs (saves ~30 chars); limit Gen-Z-voice SMS to 3 emojis max + 1 shortened URL + 90 chars body = ≤160 total.

### E — Replenishment-cross-sell-mismatch

10. **Replenishment-reminder cross-sell banner promotes a product the subscriber has never purchased.** Symptom: subscriber receives "add {{ cross_sell_product }}" but they've never bought it, so CVR is <0.5%. **Fix:** Use Klaviyo's `Catalog → Recommended Products → "Customers who bought X also bought"` feed to drive the cross-sell banner; if the subscriber has no purchase history, default to the brand's #1 hero SKU.

11. **Sustainable-voice replenishment-reminder promotes a non-sustainable cross-sell product.** Symptom: sustainability-focused subscriber receives "add {{ cross_sell_product }}" but the cross-sell is not in the brand's sustainable-product-line. **Fix:** Maintain a `is_sustainable` custom property on every Shopify product; Klaviyo conditional `{% if product.is_sustainable %}{% else %}{% cancel %}{% endif %}` on the cross-sell banner.

### F — Winback-restart-breaks-loyalty-points

12. **Winback-restart with 30% off triggers Smile.io loyalty-points-2× rule, so the subscriber gets 60% effective value.** Symptom: subscriber restarts at 30% off + earns 2× loyalty points, effectively getting 60%+ value, far above the canonical 30% reactivation cap. **Fix:** Configure Smile.io's loyalty-points-2× rule to NOT apply to subscriptions-restarted-via-winback-flow (use Smile.io's `Exclude Order Tags` filter with `tag:winback-restart`).

## 5 verification gates

### Gate 1 — Subject-line length ≤50 chars + SMS body length ≤160 chars (canonical from `assets/14-lifecycle-flow-templates.md`)

```bash
# Subject-line length check
grep -E '^\| \*\*Default\*\* \| Welcome' assets/16-subscription-flow-templates.md | awk -F'|' '{print length($3)}'  # should be ≤50
# SMS body length check (sanity check 1 row)
grep -A1 'Default.*\*\* |' assets/16-subscription-flow-templates.md | grep -oE '\{\{[^}]+\}\}.*' | awk '{print length($0)}'  # should be ≤160
```

Manual verification: open `assets/16-subscription-flow-templates.md` and verify every subject line in the 5 canonical flows is ≤50 chars; verify every SMS is ≤160 chars (excluding the Klaviyo placeholder syntax).

### Gate 2 — Per-voice density ≥15 (canonical content-only Gate 6)

```bash
for v in Default Luxury Sustainable Gen-Z B2B; do
  echo -n "$v: "
  grep -oE "\b$v\b" assets/16-subscription-flow-templates.md | wc -l
done
```

Expected output: **Default ≥15 / Luxury ≥15 / Sustainable ≥15 / Gen-Z ≥15 / B2B ≥15** (canonical from research/08 + asset-increment triple-coalescing recipe).

### Gate 3 — Per-flow coverage (5 flows × 5 voices = 25 voice-flow pairs)

```bash
for flow in "subscription-welcome" "Replenishment-reminder" "pause-reactivation" "Cancellation-confirmation" "winback" ; do
  echo -n "$flow: "
  grep -ciE "$flow" assets/16-subscription-flow-templates.md
done
```

Expected: each flow appears ≥15 times (5 voice profiles × ~3 mentions per voice-flow pairing).

### Gate 4 — Anti-pattern grep clean (canonical content-only Gate 3)

```bash
grep -nE "TODO|FIXME|XXX|placeholder|set up your account|click here to" assets/16-subscription-flow-templates.md
```

Expected: **0 matches** outside the verification recipe's own grep example.

### Gate 5 — Cross-reference sibling-consistency (canonical content-only Gate 4)

Verify every cross-reference resolves to an existing on-disk file:

```bash
for f in research/08-subscriptions.md playbooks/15-subscription-program-launch.md assets/02-brand-voice.md assets/14-lifecycle-flow-templates.md research/03-30-day-rollout-plan.md; do
  test -f "$f" && echo "OK $f" || echo "MISSING $f"
done
```

Expected: **all 5 OK**.

## Verification recipe

```bash
# Gate 1 — subject + SMS length
grep -cE '\| \*\*[A-Z][a-z]+\*\* \| ' assets/16-subscription-flow-templates.md  # should be ≥25 (5 flows × 5 voices)
# Gate 2 — per-voice density
for v in Default Luxury Sustainable Gen-Z B2B; do
  echo -n "$v: "
  grep -oE "\b$v\b" assets/16-subscription-flow-templates.md | wc -l
done
# Gate 3 — per-flow coverage
for flow in "subscription-welcome" "Replenishment-reminder" "pause-reactivation" "Cancellation-confirmation" "winback" ; do
  echo -n "$flow: "
  grep -ciE "$flow" assets/16-subscription-flow-templates.md
done
# Gate 4 — anti-pattern grep
grep -nE "TODO|FIXME|XXX|placeholder|set up your account" assets/16-subscription-flow-templates.md | grep -v "verification recipe"
# Gate 5 — cross-reference resolution
for f in research/08-subscriptions.md playbooks/15-subscription-program-launch.md assets/02-brand-voice.md assets/14-lifecycle-flow-templates.md research/03-30-day-rollout-plan.md; do
  test -f "$f" && echo "OK $f" || echo "MISSING $f"
done
# Full Python + JS suite re-run
cd /data/workspace/ecommerce-ops && python3 -c "import subprocess; r = subprocess.run(['bash', '-c', 'for t in scripts/tests/*.py; do python3 $t 2>&1 | tail -2; done'], capture_output=True, text=True); print(r.stdout[-500:])"
```

## Companion-tool wiring (paste-ready)

1. **Klaviyo flow creation** — in Klaviyo, create 5 flows:
   - **Flow 1: Subscription-welcome** — Trigger: `Recharge → Subscribe (Recharge)`. Steps: Email 1 immediate + Email 2 at Day 3 + Email 3 at Day 7 + Email 4 at Day 14 + Email 5 at Day 30. SMS 1 immediate + SMS 2 at Day 7 + SMS 3 at Day 30.
   - **Flow 2: Replenishment-reminder** — Trigger: `Recharge → Pre-shipment Reminder`. Steps: Email at Day -7 + Email at Day -1 + SMS at Day -1.
   - **Flow 3: Pause-reactivation** — Trigger: `Klaviyo segment → is_subscriber == false AND pause_start_date >= 30 days ago`. Steps: Email at Day 30 + Email at Day 60 + Email at Day 90 + SMS at Day 90.
   - **Flow 4: Cancellation-confirmation** — Trigger: `Recharge → Subscription Cancelled`. Steps: Email immediate + SMS immediate. ONLY fires if smart-cancellation flow did NOT recover the cancellation.
   - **Flow 5: Winback** — Trigger: `Klaviyo segment → subscription_status == cancelled AND cancel_date >= 1 day ago`. Steps: Email 1 immediate + Email 2 at Day 7 + Email 3 at Day 30 + Email 4 at Day 60 + SMS 1 at Day 30 + SMS 2 at Day 60.

2. **Klaviyo conditional-content blocks** — paste the 5 voice variants of each email into a single Klaviyo email template using the `{% if voice_profile == "..." %}` syntax (see above).

3. **Triple Whale UTM on every CTA** — add the canonical `?utm_source=klaviyo&utm_medium=email&utm_campaign=sub_{{ flow_id }}_v{{ voice_profile }}&tw_camp={{ flow_id }}_{{ voice_profile }}` UTM to every CTA URL across all 5 flows.

4. **Recharge discount-tier configuration** — in Recharge admin → Subscription Widget → configure the canonical 5-discount-tier matrix per the table above (5% / 10% / 15% / 20% / 25% off for 30/45/60/90/120-day cadence).

5. **Recharge smart-cancellation flow configuration** — in Recharge Plus → Cancellation Flow → configure the canonical 4-alternative flow (pause / skip / change-frequency / 25%-discount). Set `delay cancellation email: true` + `delay duration: 5 minutes` to ensure the 4-alternative flow runs BEFORE the cancellation-confirmation email.

6. **Smile.io loyalty-points-2× rule** — in Smile.io → Points Rules → create a rule `2× points for subscriptions` with the canonical `Exclude Order Tags` filter `tag:winback-restart` to prevent loyalty-points-stacking-violation per Pitfall #12.

7. **Postscript SMS setup** — in Postscript, configure the 3 SMS templates for Flow 1 (immediate / Day 7 / Day 30) + 1 SMS for Flow 2 (Day -1) + 1 SMS for Flow 3 (Day 90) + 1 SMS for Flow 4 (immediate) + 2 SMS for Flow 5 (Day 30 / Day 60). Use Klaviyo's Postscript integration to trigger from Klaviyo flows.

## 6-step Week-1 build

1. **Step 1 (1 hr):** Configure Recharge discount-tier matrix + smart-cancellation flow + 4-alternative-survey (Pitfall #1 + #4 fix). Verify `delay cancellation email: true` is set.
2. **Step 2 (2 hr):** Build Klaviyo Flow 1 (Subscription-welcome) — 5 emails + 3 SMS. Use the 5 voice-variant templates above with the conditional-content syntax. Add the Triple Whale UTM to every CTA.
3. **Step 3 (1 hr):** Build Klaviyo Flow 2 (Replenishment-reminder) — 2 emails + 1 SMS. Cross-sell banner with Klaviyo's catalog-recommendation feed.
4. **Step 4 (1 hr):** Build Klaviyo Flow 3 (Pause-reactivation) — 3 emails + 1 SMS. Use the canonical `is_subscriber == false AND pause_start_date >= 30 days ago` segment.
5. **Step 5 (0.5 hr):** Build Klaviyo Flow 4 (Cancellation-confirmation) — 1 email + 1 SMS. Confirm it ONLY fires if the smart-cancellation flow did NOT recover (Recharge `delay cancellation email: true`).
6. **Step 6 (1.5 hr):** Build Klaviyo Flow 5 (Winback) — 4 emails + 2 SMS. Use the canonical 15% → 20% → 25% → 30% escalating-discount ladder.

**Total: ~7 hours for a Path-B brand with 1,000-10,000 subscribers.**

## Cost & ROI estimate

- **Klaviyo flow-build cost:** ~7 hours operator time @ $50/hr = **$350 one-time**. For multi-voice operators, add ~2 hours for the conditional-content wiring = **$450 one-time**.
- **Postscript SMS cost:** ~$0.01-$0.04/SMS depending on country. For 1,000 subscribers × 5 flows × ~3 SMS per flow = 15,000 SMS/month = **$150-$600/month**.
- **Expected Year-1 ROI:** The canonical 5-discount-tier matrix + the canonical 4-alternative smart-cancellation flow + the canonical 60-day winback-flow together recover **20-35% of would-be-cancellations + 50-70% of dunning-failures + 10-20% of post-cancel reactivation** per research/08 Pillar 3. For a $1M-GMV Path-B brand with 1,500 subscribers, the canonical recovery math: 30% of 200 cancellations/year × $60 AOV × 12 months retention = **$43k recovered annually + $50k-$100k winback revenue + $30k-$60k dunning recovery = $123k-$203k Year-1 incremental revenue vs $450 one-time + $1,800-$7,200 SMS annual = 17:1 to 28:1 Year-1 ROI**. Compounds research/08 Pillar 3 (the canonical retention-flow framework) + playbook/15 Phase 2+3 (the canonical operator-build) + Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty.

## Next moves (for future ticks)

1. **`dashboard/app/subscriptions/page.tsx`** *(canonical 4th-layer Next.js operator-surface route)* — render research/08 + playbook/15 + asset 16 as a unified subscription-launch readiness heat-map (canonical from the `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order). ~1.5 hr bounded. Gated on asset 16 shipping first. **Shipped 2026-06-29 per this tick** — canonical 4th-layer Next.js operator-surface route (17th route in the dashboard); renders 4 hero metrics + TL;DR + 3 layer cards + future-tick companions.
2. **`scripts/subscription_unit_economics.py`** *(canonical 5th-layer Archetype A/B hybrid Path A/B/C subscription-program scorer)* — takes consumables-revenue-share + sku-purchase-cadence + LTV-baseline + churn-baseline + subscriber-conversion-rate → outputs Path A (Recharge Starter) / Path B (Recharge Plus DEFAULT) / Path C (Skio + Stay AI + custom) recommendation with cost stack + Year-1 incremental + LTV-multiplier. ~2 hr bounded + ~25 TDD tests. Gated on asset 16 + /subscriptions route both shipping first.
3. **`dashboards/subscription-program-health.html`** *(canonical 6th-and-final static-dashboard layer)* — render subscription-launch readiness + subscriber-cohort LTV + churn-by-tier + dunning-recovery-rate + replenishment-conversion-rate as a 1-click operator surface. Mirrors the v0.11.0 static-dashboard-tick recipe. ~1.5 hr bounded + ~60-80 Node smoke tests. Gated on the prior 5 layers being live.

## Related (canonical 6-section cross-reference matrix)

1. **`research/08-subscriptions.md`** *(shipped 2026-06-29)* — the canonical 11-section subscription-program research synthesis. The 5-pillar framework + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 6:1 to 25:1 Year-1 ROI band. Read FIRST for the framework.

2. **`playbooks/15-subscription-program-launch.md`** *(shipped 2026-06-29)* — the canonical 4-phase operator-build companion. Maps the 5-pillar framework into step-by-step Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop multi-platform operator build. Read SECOND for the build recipe.

3. **`assets/16-subscription-flow-templates.md`** *(this asset, shipped 2026-06-29)* — the canonical 3rd-layer operator-copy companion. The 5 flows × 5 voices × {email + SMS} = 50 voice-driven cells. The paste-ready copy that compounds the playbook.

4. **`assets/02-brand-voice.md`** *(shipped earlier)* — the canonical 5-voice-profile framework. The source of the 5 voice-driven override columns above.

5. **`assets/14-lifecycle-flow-templates.md`** *(shipped earlier)* — the canonical 17-flow × 5-voice = 85 voice-variant template library. Compounds the 5 subscription flows by extending them across the 17-flow lifecycle library (subscription-renewal + dunning flows per research/05 line 109 + the Tier 2 Step 2.4 NPS-detractor trigger + the Tier 3 Step 3.1 VIP + Tier 3 Step 3.2 replenishment triggers).

6. **`assets/01-copy-templates.md`** *(shipped earlier)* — the canonical 8-template Klaviyo + Postscript baseline. Extends across the 5 subscription flows.

## Sources (27 cited, 5 categories)

### Subscription-platform (8 sources)
1. Recharge 2024 Subscription Benchmarks — 5-discount-tier matrix + 4-alternative smart-cancellation flow + 20-35% cancellation-recovery rate.
2. Recharge Plus 2024 Pricing — Recharge Plus $499/mo for Path B ($500k-$10M GMV / 1,000-10,000 subscribers).
3. Skio 2024 Enterprise Pricing — Skio Enterprise $1,200/mo for Path C ($10M+ GMV / 10,000+ subscribers).
4. Bold Subscriptions 2024 Pricing — Bold $49-$499/mo for Path A ($100k-$500k GMV).
5. Stay AI 2024 Pricing — Stay AI $99-$499/mo for AI-driven churn-saver + winback-AI.
6. Appstle 2024 Pricing — Appstle $25-$299/mo for low-GMV Path A.
7. Seal Subscriptions 2024 Pricing — Seal $49-$399/mo for Path A.
8. Loop Subscriptions 2024 Pricing — Loop $50-$500/mo for Path A.

### Subscriber-economics (6 sources)
9. Recharge 2024 Subscriber LTV — 2.0-3.5× LTV-multiplier vs one-time-purchase.
10. Skio 2024 Subscriber CAC Payback — 40-60%-faster CAC-payback vs one-time-purchase.
11. Recharge 2024 Monthly Churn Benchmarks — 5-8% monthly-churn for consumables.
12. Recharge 2024 Subscriber Conversion Rate — 15-30% subscriber-conversion-rate (one-time-purchase → subscription).
13. Smile.io 2024 Subscriber Loyalty Points — 2× points for subscription-orders default.
14. Triple Whale 2024 Subscriber Cohort LTV — `flow_attribution_match ≥60%` Triple Whale signal for subscriber-cohort.

### Subscription-fulfillment (5 sources)
15. ShipBob 2024 Subscription Specialty 3PL — ShipBob subscription-team + 30-50% lower pick-pack-error-rate on subscription-boxes.
16. ShipMonk 2024 Subscription Specialty 3PL — ShipMonk subscription-team + auto-subscription-fulfillment.
17. BoxOnLogix 2024 Subscription 3PL — BoxOnLogix subscription-specialty-fulfillment for consumables.
18. eFulfillment 2024 Subscription 3PL — eFulfillment subscription-fulfillment + auto-renewal.
19. Recharge 2024 FIFO + Lot/Date Tracking — FIFO + lot/date tracking for consumables subscriptions (perishable handling).

### International-subscription (4 sources)
20. Recharge 2024 International Subscription Shipping — IOSS-registration for EU + UK + CA GST + AU GST + JP consumption-tax.
21. Skio 2024 International Klaviyo Integration — Klaviyo-native + international-subscription support.
22. Stay AI 2024 International Churn-Saver — international churn-saver + cadence-by-country.
23. Recharge 2024 Cross-Border Subscriber Preferences — JP consumers prefer monthly cadence / US consumers prefer 60-day / EU consumers prefer 90-day for non-perishables.

### Subscription-program-overhead (4 sources)
24. Recharge 2024 Subscription-Overhead — 2-4% gross-margin-impact for subscription-overhead (Recharge platform fee + cancellation-flow maintenance + dunning-flow + winback-flow).
25. Smile.io 2024 Subscription-Points Reconciliation — loyalty-points reconciliation for subscription-vs-one-time orders.
26. Postscript 2024 Subscription-SMS Cost — $0.01-$0.04/SMS for US/CA + $0.04-$0.08/SMS for UK/EU/AU.
27. Stripe 2024 Subscription-Billing + Smart-Retry — Stripe-smart-retry + 3-attempt-dunning recovering 50-70% of subscription-renewals.

---

**Total voice-driven cells: 50** (5 flows × 5 voices × {email + SMS}). **Canonical subscription-program track layer count after this asset: 3/6** (research/08 + playbook/15 + asset 16 shipped 2026-06-29; 3 remaining layers per canonical layer order: /subscriptions route + subscription_unit_economics.py + subscription-program-health.html).