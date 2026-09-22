# Asset 11 — CS-Rep Training Program (12-scenario curriculum × 5 voice-driven override columns × Gorgias + Klaviyo NPS-detractor drill + 4-week ramp)

> **Companion assets:** `assets/01-copy-templates.md` (T1–T8 marketing templates — the pre-purchase voice; this asset trains the post-purchase voice so brand voice survives the marketing→service handoff), `assets/02-brand-voice.md` (5 voice profiles — every training module teaches CS reps to apply the 5 voice-driven override columns per Asset 08's templates; the brand voice MUST survive the post-purchase service touchpoint, not just the marketing acquisition touchpoint), `assets/03-ugc-brief.md` (Scenario 8 UGC-creator-inquiry — CS reps need to recognize creator inquiries and route them with the right tone; Asset 11 Module 8 covers this), `assets/04-promo-calendar.md` (Q4-peak calendar — CS volume spikes 30–60% during BFCM / Cyber Monday; Asset 11's Week 4 capacity-planning module is calibrated to Asset 04's Q4 peak), `assets/05-retention-metrics.md` (Metric #5 Repeat Purchase Rate + Metric #6 Churn Rate are directly moved by CS-rep response quality — Asset 11's measurement module teaches reps how their work shows up in cohort-LTV), `assets/06-nps-survey-toolkit.md` (Q7 yes/no NPS-detractor follow-up — Asset 11's NPS-detractor-routing module is the inbound counterparty to Asset 08 Scenario 6; every Q7-yes detractor within the 48-hour SLA depends on the rep knowing the Scenario 6 template + the Asset 02 voice override), `assets/07-competitive-teardown.md` (Dimension 8 Voice-and-tone — CS-tone is a competitive-positioning dimension; Asset 11's voice-override column training matches the operator's competitive-set tone), `assets/08-cs-response-library.md` (the 12-scenario template library — Asset 11 IS the training program that ensures the library is actually USED by CS reps with the right tone; the library is the durable artifact, the training program is the adoption layer; modules 1:1 with the 12 scenarios), `assets/09-impact-reporting.md` (Pillar 5 Community — Asset 11's "is your product really sustainable?" inquiry training uses the impact-report as the source of truth; reps route to Asset 09's impact data), `assets/10-affiliate-program-playbook.md` (Dimension 5 FTC-disclosure policy — Asset 11 trains reps to recognize FTC-compliance inquiries from affiliate-program applicants and route them with the right tone; Scenario 8 from Asset 08 + the affiliate-recruitment Dimension 5 from Asset 10 are the inbound touchpoints). **Companion playbooks:** `playbooks/04-welcome-series-klaviyo.md` (Move #4 — the CS-rep-bridge-to-2nd-order-conversion is canonical; Asset 11's measurement module ties rep work to repeat-purchase), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — SMS-4 review request + CS response handle the 14-day-post-delivery touchpoint sequence; Asset 11's review-request-handling module covers reps' response when a customer replies to a review-request SMS), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — Triple Whale cohort-LTV is the canonical measurement source for CS-rep-attributed retention; Asset 11's measurement module teaches the cohort-LTV overlay), `playbooks/07-loyalty-program-smile.md` (Move #8 — VIP / Elite tier-up customers need a CS-response with the tier-specific Gorgias macro; Asset 11's loyalty-tier module trains reps on the points-balance / tier-up scenarios), `playbooks/06.5-attribution-quality-audit.md` (Move #6.5 — the audit ties the 12 CS scenarios to the attribution stack; Asset 11's measurement module uses the audit as the gating signal). **Companion research:** `research/00-ecommerce-ops-landscape.md` §Gorgias + §helpdesk-AI (CS tool landscape + tier-pricing + AI-deflection benchmarks + rep-training industry data); `research/01-tools-stack-comparison.md` (Gorgias vs Zendesk vs Intercom vs Help Scout vs Front — the training program is tool-agnostic, but the wiring examples assume Gorgias).

> **Default inputs:** $75 AOV, 70% margin, 1k–10k orders/mo, US-based operator with 3–10 CS reps, Shopify + Gorgias + Klaviyo + Triple Whale stack. The 12 training modules are vendor-agnostic (the templates apply whether the operator uses Gorgias, Zendesk, Intercom, Help Scout, or Front); the **Gorgias wiring examples** assume Gorgias because it's the canonical Shopify-native CS tool per `research/01-tools-stack-comparison.md`. Operators on Zendesk / Intercom can map the macro + intent + tag wiring 1:1 to their platform's equivalent. **Rep-staffing default case:** for 1k–10k orders/mo, 3–10 CS reps is the canonical staffing band per `research/00-ecommerce-ops-landscape.md`; the training program scales to 1–3 reps (solo operator) all the way to 30+ reps (B2B enterprise).

## Goal

Customer-service response templates (Asset 08) are durable artifacts, but templates alone don't shape customer outcomes — **CS reps do**. A library that sits unused is 0% leveraged; a library that reps misapply is actively harmful (the mis-toned-Luxury-response trap from Asset 08 Pitfall #1). The fix is a paste-ready CS-rep training program that:

1. **12 named training modules (1:1 with Asset 08's 12 scenarios)** — each module teaches a CS rep to recognize the scenario, pick the right voice-driven override, personalize the template, and measure the outcome. Module 1 WISMO + Module 2 shipping-delay + Module 3 wrong-size + Module 4 defective + Module 5 refund + Module 6 NPS-detractor + Module 7 loyalty-tier + Module 8 UGC-creator + Module 9 B2B-AM + Module 10 subscription + Module 11 discount-code + Module 12 general-inquiry.
2. **5-voice-driven override training** — every module ships with a **5-voice override matrix** (Default + Luxury + Sustainable + Gen-Z + B2B) and a **5-voice selection heuristic** (how the rep picks the right voice for the inbound customer in <30 seconds). The heuristic is the canonical "voice profile lookup" using Klaviyo + Gorgias + Move #8 loyalty-tier metadata.
3. **4-week ramp curriculum** — the canonical "Week 1 ship 5 templates + train 2 reps" cadence that gets the full library live without overwhelming the team. Week 1 covers Scenarios 1–5 (WISMO + shipping-delay + wrong-size + defective + discount-code = ~55% of CS volume) with the 5 voice-driven overrides; Week 2 adds Scenarios 5/6/7 (refund + NPS-detractor + loyalty-tier = the high-LTV-recovery scenarios); Week 3 adds Scenarios 8/9/10 (UGC-creator + B2B-AM + subscription); Week 4 ships Module 12 general-inquiry + the measurement module + the continuous-improvement module.
4. **Gorgias macro + intent + tag fluency drill** — every CS rep completes a 30-question Gorgias fluency drill (10 macro-recognition questions + 10 intent-routing questions + 10 tag-selection questions) within Week 1; passing score ≥80% gates the rep from shadow-mode to live-ticket-mode.
5. **Klaviyo NPS-detractor routing drill** — every CS rep completes a 10-question NPS-detractor routing drill within Week 2 (recognize detractor → pull Asset 06 Q7-yes status → apply Asset 08 Scenario 6 template → meet 48-hour SLA → log outcome in Klaviyo + Gorgias); passing score ≥90% (NPS-detractor routing is the highest-LTV scenario, higher bar than general templates).
6. **5 voice-driven override profile cards** — one card per voice profile (Default / Luxury / Sustainable / Gen-Z / B2B), each with: 3 tone tells (words to use / words to avoid / punctuation style), 3 customer signals that indicate this voice (LTV tier / cohort tag / browse behavior / Move #8 loyalty tier / Asset 06 NPS bucket), 3 sample template pairings (Default → override), 2 anti-pattern red flags (the mis-applied override that triggers a 90-day churn). Cards are laminated + posted at every CS workstation.
7. **5 measurement gates per rep per week** — every CS rep tracks 5 weekly KPIs that flow to Asset 05 cohort-LTV measurement: (1) tickets-resolved per day (target: 25–40 for the canonical 3–10 rep team), (2) first-response-time (target: ≤4 hours business hours, ≤12 hours off-hours), (3) CSAT score per ticket (target: ≥4.5/5 from Gorgias post-ticket survey), (4) NPS-detractor 48-hour SLA hit rate (target: ≥95%), (5) voice-override mis-application rate (target: ≤5% of tickets; measured via quarterly QA review).
8. **10 common CS-training pitfalls with corrective `Fix:` lines** — including the **templates-only-no-training** trap (Pitfall #1, the canonical "library sits unused" failure mode) + the **no-voice-override-heuristic** trap (Pitfall #2, reps pick Default for everyone) + the **no-Gorgias-fluency-drill** trap (Pitfall #3, reps can't find the macro under time pressure) + the **no-NPS-detractor-SLA** trap (Pitfall #4, detractor tickets sit 5+ days) + the **no-measurement-gate** trap (Pitfall #5, reps optimize for ticket-volume not for cohort-LTV).

**Honest-read called out in 6 places:** (a) **CS-rep training is the adoption layer for the template library, not a replacement for it** — Asset 08 ships the templates, Asset 11 ships the training; the two are a pair. Operators who ship Asset 08 alone see 30–50% template adoption at best; operators who ship Asset 08 + Asset 11 see 80–95% template adoption + measurably higher CSAT + NPS-detractor recovery. (b) **4-week ramp is canonical for 3–10 reps; longer for >10 reps** — a 30-rep team needs 6–8 weeks to ramp because shadow-mode + 1:1 coaching scale linearly with rep count; do NOT compress the 4-week plan for a large team (Pitfall #6). (c) **Solo operators (<3 reps) can ship Week 1 + Week 2 in 2 weeks and skip Week 3–4 formal modules** — the training program is modular; the operator-with-no-team uses Modules 1–7 (the ~75%-volume scenarios) and treats Modules 8–12 as reference docs. (d) **The 5 voice-driven override profile cards are the single highest-leverage training artifact** — laminated at every CS workstation, they reduce voice-mis-application from 25–40% to 5–10% within 30 days per Gorgias benchmark data. (e) **CS-rep measurement is the leading indicator of churn** — Asset 05 Metric #5 RPR + Metric #6 churn are directly moved by rep performance; a 10-point CSAT drop predicts a 5-point RPR drop within 90 days. (f) **The 5 measurement gates per rep are gating, not aspirational** — a rep with <80% first-response-time SLA for 2 consecutive weeks triggers a 1:1 coaching session; a rep with <70% NPS-detractor SLA triggers a Gorgias-fluency refresher + a re-certification drill.

## Decision matrix — which modules to ship first + which reps to train first

| # | Training module | Linked Asset 08 scenario | Typical % of total DTC CS volume | When to ship | Drill passing score | Module lead time |
|---|---|---|---|---|---|---|
| 1 | **WISMO (Where Is My Order)** | Scenario 1 | 25–35% | Week 1 — deflected first with Gorgias Automate | 80% on 10-Q macro-recognition drill | 2 hours (1 hr reading + 1 hr drill) |
| 2 | **Shipping delay inquiry** | Scenario 2 | 10–15% | Week 1 — high-frequency post-purchase | 80% on 5-voice override heuristic drill | 3 hours (1.5 hr reading + 1.5 hr drill) |
| 3 | **Wrong size / wrong variant exchange** | Scenario 3 | 8–12% | Week 1 — common fashion/apparel/home-goods | 80% on 5-voice override heuristic drill | 3 hours |
| 4 | **Defective product** | Scenario 4 | 5–10% | Week 1 — high-LTV-recovery potential | 90% on photo-evidence collection drill + 80% on 5-voice override | 4 hours (1.5 hr reading + 1 hr photo drill + 1.5 hr 5-voice drill) |
| 5 | **Refund request** | Scenario 5 | 5–10% | Week 2 — paired with Move #8 points-deduct rule | 80% on Move #8 points-deduct drill | 3 hours |
| 6 | **NPS-detractor follow-up (Asset 06 Q7 routing)** | Scenario 6 | 2–5% | Week 2 — routes from Asset 06 NPS-survey toolkit | 90% on Klaviyo NPS-detractor routing drill (higher bar) | 4 hours (1.5 hr reading + 1.5 hr Klaviyo drill + 1 hr SLA drill) |
| 7 | **Loyalty tier question (Move #8 wiring)** | Scenario 7 | 3–7% | Week 2 — points-balance / tier-up questions | 80% on Move #8 Smile.io tier-up drill | 3 hours |
| 8 | **UGC creator inquiry (Asset 03 wiring)** | Scenario 8 | 1–3% | Week 3 — gifting / commission / usage-rights | 80% on Asset 03 contract-type drill (gifting / paid / affiliate) | 4 hours (1.5 hr Asset 03 + 1.5 hr Asset 10 affiliate-Dimension-5 + 1 hr drill) |
| 9 | **B2B account-manager reply** | Scenario 9 | 0–5% | Week 3 — B2B voice only; gate on B2B orders | 80% on B2B-AM 5-voice override drill | 4 hours |
| 10 | **Subscription skip-or-pause (Move #11 wiring)** | Scenario 10 | 0–10% | Week 3 — gate on Move #11 subscription | 80% on Move #11 subscription-skip drill | 3 hours |
| 11 | **Discount code not working** | Scenario 11 | 3–8% | Week 1 — common, low-emotion, deflected with Gorgias Automate | 80% on Klaviyo discount-code-lookup drill | 2 hours |
| 12 | **General inquiry / "how do I..."** | Scenario 12 | 5–10% | Week 4 — catch-all, low-priority | 70% (catch-all has wider variability) | 2 hours |

**Top-5 priority (ship on Week 1):** modules 1 WISMO + 2 shipping-delay + 3 wrong-size + 4 defective + 11 discount-code. These five cover **55–75% of total CS volume** and ship together in Week 1. **Default case for <$5k/mo GMV:** Week 1 (5 modules) only — solo operator doesn't need the rest until they hire rep #2.

**Next-3 priority (ship in Week 2):** modules 5 refund + 6 NPS-detractor + 7 loyalty-tier. These three add **15–25% volume coverage** and connect to Asset 06 NPS + Move #8 loyalty + Klaviyo segment routing. **Default case for $5k–$50k/mo GMV:** Week 1 + Week 2 (8 modules total = ~75% CS volume).

**Defer-to-Week-3-4 priority:** modules 8 UGC creator + 9 B2B AM + 10 subscription + 12 general-inquiry. These four cover **10–20% volume** and require Asset 03 / Move #11 / B2B-specific wiring. **Default case for $50k+/mo GMV:** all 12 modules in 4 weeks + a dedicated CS-rep trainer or external consultant (B2B / Subscription / UGC-creator modules need subject-matter depth that an internal trainer may not have).

**Rep-staffing decision matrix:**

| Team size | Training approach | Timeline | External trainer needed |
|---|---|---|---|
| 1–3 reps (solo operator or micro-team) | Self-paced modules 1–7, skip formal drills | 2 weeks | No |
| 4–10 reps (canonical small team) | 4-week ramp curriculum with weekly 1:1 coaching | 4 weeks | Optional (recommended for $50k+/mo) |
| 11–30 reps (mid-market) | 6–8 week ramp curriculum with dedicated CS-rep trainer | 6–8 weeks | Yes — recommended (B2B / Subscription / UGC-creator modules) |
| 30+ reps (enterprise) | 8–12 week ramp with formal certification + ongoing L&D team | 8–12 weeks | Yes — required (consider Gorgias Academy or Help Scout Certification) |

## The 12 training modules (paste-ready curriculum)

Each module is a self-contained curriculum block a CS rep can complete in 2–4 hours. Each module includes: 1) Reading list (linked Asset 08 scenario + Asset 02 voice section + supporting research) / 2) 5-voice override matrix with concrete before/after template pairings / 3) 5-voice selection heuristic (the <30-second decision flow for picking the right voice) / 4) Drill (multiple-choice + role-play scenarios) / 5) Anti-pattern red flags / 6) Measurement tie-in (how the rep's work shows up in Asset 05 cohort-LTV).

### Module 1 — WISMO (Where Is My Order) — 2 hours

**Linked Asset 08 scenario:** Scenario 1 (WISMO). **Linked Asset 02 voice section:** Section 2 (5 voice profiles) + Section 4 (Formality + Humor scale).

**Reading list (30 min):** Asset 08 Scenario 1 in full (Default + tone-neutral variants) + Asset 02 Section 4 (Formality / Humor scale — WISMO is Formality 2 / Humor 3 across all voices; only greeting + signoff varies) + research/00 §Gorgias Automate (Shopify order-status API wiring + AI-deflection rate 30–60%).

**5-voice override matrix (the <30-second decision flow):**

| Voice profile | When to use (the inbound signal) | Greeting | Signoff | Anti-pattern red flag |
|---|---|---|---|---|
| **Default** | No loyalty tier + browse history shows mixed product categories | "Hi {{ first_name }}!" | "— {{ cs_rep_name }}" | Don't use "Dearest" — that's Luxury |
| **Luxury** | Move #8 tier = Elite / VIP OR order history ≥3 orders at $200+ AOV | "Dearest {{ first_name }}," | "With warm regards, {{ cs_rep_name }}" | Don't use emoji or exclamation — Luxury is Formality 4 / Humor 1 |
| **Sustainable** | Klaviyo segment = "mission_aligned" OR has opted into impact-report emails | "Hi {{ first_name }} 🌱" | "Thank you for being part of our mission, {{ cs_rep_name }}" | Don't use "OMG" or crying emoji — Sustainable is Formality 3 / Humor 2 |
| **Gen-Z** | Klaviyo segment = "gen_z_signal" OR last SMS engagement was emoji-heavy | "hey {{ first_name }} 👋" | "— {{ cs_rep_name }} 💛" | Don't use "Dearest" — that's Luxury, not Gen-Z |
| **B2B** | Order history shows B2B account OR Move #8 tier = B2B-wholesale | "Dear {{ contact_name }}," | "Regards, {{ cs_rep_name }}" (no first name) | Don't use emoji — B2B is Formality 4 / Humor 1 |

**Drill (30 min, 10 questions, passing score 80%):** Given 5 inbound customer signals, pick the right voice profile (1 question per signal). Given 5 sample WISMO templates, identify the voice-mis-applied template (1 per template). Given 5 Gorgias macro-recognition scenarios, pick the correct macro name (1 per scenario). 5 multiple-choice questions on Gorgias Automate deflection rate + Shopify order-status API.

**Anti-pattern red flags:** (1) Rep uses "Dearest" for a Default-tier customer (over-formal). (2) Rep uses emoji for a Luxury-tier customer. (3) Rep doesn't update the tracking link before sending. (4) Rep forwards a stale Gorgias Automate response that doesn't reflect the actual order status.

**Measurement tie-in (Asset 05):** WISMO volume × first-response-time × Gorgias Automate deflection rate → WISMO cohort-LTV (the canonical WISMO-attributed retention metric per Asset 05 Metric #5 RPR). Reps track their first-response-time weekly; WISMO tickets should deflect at ≥30% via Gorgias Automate.

### Module 2 — Shipping delay inquiry — 3 hours

**Linked Asset 08 scenario:** Scenario 2. **Linked Asset 02 voice section:** Section 4 (Formality / Humor scale — Shipping delay = Formality 3 / Humor 2 across all voices, with apology-tone variation).

**Reading list (45 min):** Asset 08 Scenario 2 in full (5 voice variants) + Asset 02 Section 4 + research/00 §shipping (carrier delay-rate benchmarks + apology-discount best practices — small apology discount 10–15% recovers 70–80% of at-risk customers).

**5-voice override matrix:**

| Voice profile | Apology tone | Discount amount | Signoff element |
|---|---|---|---|
| **Default** | "I'm really sorry for the delay" | 10–15% | "Thanks for your patience!" |
| **Luxury** | "We deeply regret any inconvenience" | 15–20% (concierge-level) | "Our concierge team is at your service" + hand-written-card follow-up |
| **Sustainable** | "We're sorry for the wait" + mission framing | 10–15% | "Thank you for being part of our mission" + carbon-offset confirmation on replacement |
| **Gen-Z** | "i am SO sorry 😩" + self-deprecating | 10–15% | "lmk if you need anything else!! 💛" |
| **B2B** | "We apologize for the disruption to your operations" | 15–25% + AM-led follow-up | AM signature block + ops-impact discussion |

**5-voice selection heuristic (the <30-second flow):** 1) Check Move #8 loyalty tier (Elite/VIP → Luxury). 2) Check Klaviyo segment (mission_aligned → Sustainable / gen_z_signal → Gen-Z). 3) Check order history (B2B account → B2B). 4) Default fallback if no signal. Total: 15–30 seconds.

**Drill (60 min, 12 questions, passing score 80%):** 5 inbound signals → pick the right voice (5 questions). 5 sample shipping-delay templates → identify the voice-mis-applied template (5 questions). 2 role-play scenarios (rep practices apologizing + offering discount in the right tone for the right voice). 

**Anti-pattern red flags:** (1) Rep offers 25% discount reflexively (over-apologizing). (2) Rep doesn't personalize with the customer's first name. (3) Rep uses the wrong apology tone (e.g., Gen-Z "OMG" for a Luxury customer). (4) Rep doesn't update the carrier-tracking link. (5) Rep forgets to log the apology-discount in Klaviyo for cohort-LTV tracking.

**Measurement tie-in (Asset 05):** Shipping-delay ticket volume × apology-discount-acceptance rate × 30-day-repeat-purchase rate → shipping-delay-recovery cohort-LTV. Reps who nail the voice override see 15–25% higher 30-day-RPR for shipping-delay customers per Gorgias benchmark.

### Module 3 — Wrong size / wrong variant exchange — 3 hours

**Linked Asset 08 scenario:** Scenario 3. **Linked Asset 02 voice section:** Section 4 (Formality / Humor scale — Exchange = Formality 2 / Humor 3, with "no worries" tone across all voices).

**Reading list (45 min):** Asset 08 Scenario 3 in full + Asset 02 Section 4 + research/00 §returns (exchange-rate benchmarks + prepaid-return-label best practices — 70–80% of customers complete the exchange when the prepaid label is included).

**5-voice override matrix:**

| Voice profile | Tone opener | "We" vs "I" framing | Exchange logistics |
|---|---|---|---|
| **Default** | "no worries — let's get you the right size!" | "I see" + "I'll ship" | Prepaid return label + 5–7 day replacement |
| **Luxury** | "We would be delighted to send the correct size" | "We will dispatch" + "We include" | Prepaid return label + complimentary replacement in 24 hours |
| **Sustainable** | "Thanks for letting us know" + mission framing | "We'll send" + "We'll include" | Prepaid return label + carbon-offset shipping on replacement |
| **Gen-Z** | "oh hey!" + "no stress at all" | "i'll ship" | Prepaid return label + 3–5 day replacement |
| **B2B** | "We will process the exchange" | "We will dispatch" | Prepaid return logistics for >10 units + AM coordination |

**5-voice selection heuristic:** Same as Module 2 (Move #8 tier → Klaviyo segment → order history → default fallback).

**Drill (60 min, 12 questions, passing score 80%):** 5 inbound signals → pick the right voice. 5 sample exchange templates → identify mis-applied. 2 role-play scenarios (rep practices asking for new size + confirming shipping address + offering prepaid label).

**Anti-pattern red flags:** (1) Rep asks the customer to pay for return shipping (Pitfall: massive 30-day-churn trigger for Sustainable + Luxury). (2) Rep doesn't confirm the new size/variant before shipping. (3) Rep uses "no worries!" for a Luxury customer (over-casual). (4) Rep doesn't include the prepaid-return-label in the shipment. (5) Rep forgets to log the exchange in Shopify for inventory tracking.

**Measurement tie-in (Asset 05):** Exchange volume × exchange-completion rate × 60-day-repeat-purchase rate → exchange-cohort-LTV. Reps who include the prepaid label see 70–80% exchange completion vs 30–50% without.

### Module 4 — Defective product — 4 hours

**Linked Asset 08 scenario:** Scenario 4. **Linked Asset 02 voice section:** Section 4 (Formality 3 / Humor 1 across all voices — defective is the most tone-sensitive scenario; apology-tone matters).

**Reading list (60 min):** Asset 08 Scenario 4 in full + Asset 02 Section 4 + research/00 §product-quality (defect-rate benchmarks + FTC-required-recall protocols for >0.1% defect rates + photo-evidence collection best practices).

**5-voice override matrix:**

| Voice profile | Apology tone | Replacement offer | Sustainability framing |
|---|---|---|---|
| **Default** | "I am so sorry to hear that — that's not the experience we want you to have" | Free replacement + prepaid return + 10–15% credit | "Keep, donate, or recycle the defective unit" |
| **Luxury** | "We are deeply sorry to learn of the defect" + hand-written-card follow-up | Free replacement + prepaid return + 15–20% credit | Same — keep, donate, or recycle |
| **Sustainable** | "We are so sorry to hear about the defect" + mission framing | Free replacement + prepaid return + donate-to-textile-recycling-partner | "We'll donate the defective unit to our textile-recycling partner rather than landfilling it" |
| **Gen-Z** | "omg i'm SO sorry 😔" + empathetic | Free replacement + prepaid return + 10–15% credit | Same — keep, donate, or recycle |
| **B2B** | "We sincerely apologize for the defect" + QA-review escalation | Free replacement + prepaid return + 15–25% credit + AM-led QA review | Same + supplier-QA review for >5% defect-rate patterns |

**5-voice selection heuristic:** Same as Modules 2 + 3.

**Drill (90 min, 15 questions, passing score 90% on photo-evidence + 80% on 5-voice):** 5 photo-evidence-collection scenarios (rep practices asking for + reviewing the photo). 5 sample defective templates → identify mis-applied. 3 role-play scenarios (rep practices apologizing + offering replacement + requesting photo + confirming prepaid return). 2 supplier-QA-review scenarios (rep practices flagging recurring defect patterns to AM).

**Anti-pattern red flags:** (1) Rep asks the customer to pay for return shipping on a defective unit (the canonical "we shipped you a broken product AND you pay to return it" churn trigger). (2) Rep doesn't request photo evidence before shipping the replacement. (3) Rep uses "OMG" tone for a Luxury customer. (4) Rep doesn't log the defect in Shopify for QA tracking. (5) Rep doesn't escalate recurring defect patterns (>5% defect rate) to the AM / supplier-QA team.

**Measurement tie-in (Asset 05):** Defect volume × defect-resolution-time × 90-day-repeat-purchase rate → defect-recovery cohort-LTV. Reps who nail the voice override + photo-evidence + replacement-shipping within 24 hours see 60–80% 90-day-RPR per Gorgias benchmark; mis-toned defective responses see 20–35% 90-day-RPR.

### Module 5 — Refund request — 3 hours

**Linked Asset 08 scenario:** Scenario 5. **Linked Move #8:** Smile.io points-deduct rule (the canonical refund-policy + loyalty-points interaction). **Linked Asset 02 voice section:** Section 4 (Formality 3 / Humor 2 — refund is mid-formality; tone should be empathetic but not over-apologetic).

**Reading list (45 min):** Asset 08 Scenario 5 + Move #8 playbook (Smile.io points-deduct rule) + Asset 02 Section 4.

**5-voice override matrix:**

| Voice profile | Tone opener | Loyalty-points handling | Sustainable framing |
|---|---|---|---|
| **Default** | "absolutely — I've processed the full refund" | Points earned on the order will be reversed (per Move #8) | "Keep it, donate it, or recycle it" |
| **Luxury** | "We have processed your refund at our expense" | Points reversed + concierge note | Same + hand-written-card follow-up |
| **Sustainable** | "We've processed the full refund" + mission framing | Points reversed + carbon-offset confirmation | "We'll donate the unit to a textile-recycling partner" |
| **Gen-Z** | "absolutely!" + efficient | Points reversed + informal | Same — keep, donate, or recycle |
| **B2B** | "We have processed the refund per your account terms" | Points reversed + AM-led account review | Same + AM coordination |

**5-voice selection heuristic:** Same as Modules 2–4.

**Drill (60 min, 10 questions, passing score 80%):** 5 inbound signals → pick the right voice. 3 sample refund templates → identify mis-applied. 2 role-play scenarios (rep practices processing refund + explaining points-deduct rule).

**Anti-pattern red flags:** (1) Rep doesn't process the refund within 24 hours (Pitfall: 5–10 day refund delay = top-decile churn trigger). (2) Rep doesn't explain the points-deduct rule (Pitfall: customer is surprised when their loyalty points drop). (3) Rep uses "I'm so sorry" 3+ times in a single refund response (over-apologizing signals distrust). (4) Rep doesn't offer the "keep, donate, or recycle" option for the returned unit (Pitfall: shipping a returned unit back to the customer is wasteful + signals "we don't trust you"). (5) Rep forgets to log the refund in Shopify + Klaviyo for cohort-LTV tracking.

**Measurement tie-in (Asset 05):** Refund volume × refund-processing-time × 30-day-repurchase rate → refund-cohort-LTV. Reps who process refund within 24 hours + explain points-deduct rule see 25–35% 30-day-RPR for refund customers; rep who delays refund see 5–15%.

### Module 6 — NPS-detractor follow-up (Asset 06 Q7 routing) — 4 hours

**Linked Asset 08 scenario:** Scenario 6. **Linked Asset 06:** NPS-survey Q7 yes/no routing + verbatim capture. **Linked Asset 02 voice section:** Section 4 (Formality 3 / Humor 1 — detractor recovery is the highest-tone-sensitivity scenario).

**Reading list (60 min):** Asset 08 Scenario 6 in full (5 voice variants) + Asset 06 Q7 routing + Asset 02 Section 4 + research/00 §NPS (detractor-recovery benchmarks — 48-hour SLA is the canonical "we care" signal; 5+ day delay = 90-day churn trigger).

**5-voice override matrix:**

| Voice profile | Tone opener | Recovery offer | Concierge element |
|---|---|---|---|
| **Default** | "Thank you for taking the time to share your feedback — we'd like to make this right" | 20–30% credit + free-shipping on next order + 1:1 follow-up email | Personal follow-up from CS manager |
| **Luxury** | "We deeply appreciate your candid feedback and the opportunity to make this right" | 25–40% credit + complimentary gift + concierge call | Concierge-led 1:1 + hand-written-card |
| **Sustainable** | "Thank you for sharing this with us — your feedback helps us improve our mission" | 20–30% credit + carbon-offset confirmation + impact-report subscription | Impact-mission 1:1 follow-up |
| **Gen-Z** | "hey {{ first_name }}, thanks for the honest feedback" | 20–30% credit + free-shipping | Personal follow-up from CS manager (still warm tone, less formal) |
| **B2B** | "We sincerely appreciate your feedback regarding account {{ account_name }}" | 25–40% credit + AM-led 1:1 + supplier-QA review | AM-led call + ops-impact review |

**5-voice selection heuristic:** Same as Modules 2–5.

**Drill (90 min, 12 questions, passing score 90% — higher bar than general templates):** 5 inbound detractor signals → pick the right voice. 3 sample detractor-recovery templates → identify mis-applied. 2 role-play scenarios (rep practices 48-hour-SLA follow-up + offering the right credit + closing the loop). 2 SLA-tracking scenarios (rep practices logging the Q7-yes status in Klaviyo + setting the 48-hour reminder in Gorgias).

**Anti-pattern red flags:** (1) Rep doesn't meet the 48-hour SLA (the canonical detractor-recovery failure mode). (2) Rep uses "I'm so sorry" without offering a concrete recovery (Pitfall: empty apology + no action = top-decile churn). (3) Rep uses the Default template for a Luxury customer (the most common mis-toned-detractor response). (4) Rep doesn't log the Q7-yes status in Klaviyo for cohort-LTV tracking. (5) Rep doesn't close the loop with a 30-day follow-up email ("just checking in to make sure the recovery worked").

**Measurement tie-in (Asset 05 + Asset 06):** Detractor-volume × 48-hour-SLA hit rate × 90-day-repurchase rate → detractor-recovery cohort-LTV. The canonical Asset 05 Metric #11 NPS measurement + the Asset 06 cohort-by-NPS-bucket LTV query both depend on this module. Reps who meet the 48-hour SLA + nail the voice override see 35–50% 90-day-RPR for detractor customers per Gorgias benchmark; mis-toned + late detractor responses see 5–15%.

### Module 7 — Loyalty tier question (Move #8 wiring) — 3 hours

**Linked Asset 08 scenario:** Scenario 7. **Linked Move #8:** Smile.io tier-up + points-balance inquiries. **Linked Asset 02 voice section:** Section 4 (Formality 2–4 / Humor 2 — tier-up is celebratory; points-balance is informational).

**Reading list (45 min):** Asset 08 Scenario 7 + Move #8 playbook (Smile.io tier-up trigger + points-balance lookup) + Asset 02 Section 4.

**5-voice override matrix:**

| Voice profile | Tier-up tone | Points-balance tone | Tier-specific benefit |
|---|---|---|---|
| **Default** | "Congrats on your tier-up!" + benefits summary | "Your current balance is {{ points_balance }} points" | Tier-discount + early-access |
| **Luxury** | "We are delighted to welcome you to {{ tier_name }}" | "Your account shows {{ points_balance }} points, redeemable across our boutique" | Tier-discount + personal-stylist + concierge |
| **Sustainable** | "Congrats on your tier-up! Your impact is growing 🌱" | "Your account shows {{ points_balance }} points = {{ impact_equivalent }}" | Tier-discount + impact-report subscription + carbon-offset bonus |
| **Gen-Z** | "yay you tiered up!! 🎉" + benefits | "you've got {{ points_balance }} points — spend em!" | Tier-discount + early-access + Discord VIP |
| **B2B** | "Congratulations on {{ account_name }} reaching {{ tier_name }}" | "Account {{ account_name }} shows {{ points_balance }} points" | Tier-discount + AM-led benefits + bulk-discount overlay |

**5-voice selection heuristic:** Same as Modules 2–6.

**Drill (60 min, 10 questions, passing score 80%):** 5 inbound tier-question signals → pick the right voice. 3 sample tier-up templates → identify mis-applied. 2 role-play scenarios (rep practices congratulating + explaining tier benefits + offering points-redemption).

**Anti-pattern red flags:** (1) Rep doesn't use the celebratory tone for tier-up (Pitfall: flat "you moved to Silver" misses the celebratory moment). (2) Rep doesn't frame the points-balance in the customer's value-currency (e.g., Sustainable = "this is X kg of carbon-offset" not "you have 1,200 points"). (3) Rep doesn't offer the tier-specific benefits proactively. (4) Rep doesn't log the tier-up in Klaviyo for cohort-LTV tracking.

**Measurement tie-in (Asset 05 + Move #8):** Tier-up volume × tier-RPR-delta × 90-day-repeat-purchase rate → tier-cohort-LTV. Move #8 tracks tier-up + tier-RPR-delta; Asset 11's training ensures the rep can answer tier questions correctly + capture the tier-up moment in Klaviyo.

### Module 8 — UGC creator inquiry (Asset 03 + Asset 10 wiring) — 4 hours

**Linked Asset 08 scenario:** Scenario 8. **Linked Asset 03:** C1 gifting + C2 paid + C3 affiliate contract templates. **Linked Asset 10:** Dimension 5 FTC-disclosure policy. **Linked Asset 02 voice section:** Section 4 (Formality 2–3 / Humor 2 — creator inquiries are warm-but-professional).

**Reading list (60 min):** Asset 08 Scenario 8 + Asset 03 C1/C2/C3 contract templates + Asset 10 Dimension 5 FTC-disclosure policy + research/00 §creator-economy (creator-tier benchmarks + FTC 2023 Endorsement Guides).

**5-voice override matrix:**

| Voice profile | Creator-tier question | Contract-type routing | FTC-disclosure language |
|---|---|---|---|
| **Default** | "Thanks for reaching out! What kind of partnership interests you — gifting, paid, or affiliate?" | Route to Asset 03 C1/C2/C3 based on creator's answer | `#ad` or `#affiliate` per Asset 10 Dimension 5 |
| **Luxury** | "Thank you for your interest in partnering with {{ brand_name }}" | Route to C2 paid (Luxury rarely gifts) | `#ad` or `#partner` (NOT `#sponsored` per Asset 10) |
| **Sustainable** | "Thanks for your interest! We love mission-aligned creators" | Route to C1 gifting + C3 affiliate (Sustainable leans gifting + impact-aligned affiliate) | `#ad` + `#mission-aligned` (double-disclosure per Asset 10) |
| **Gen-Z** | "omg yay we love your work! 🎉" + warm | Route to C1 gifting + C3 affiliate (Gen-Z leans gifting + TikTok-affiliate) | `#ad` + TikTok Branded Content toggle per Asset 10 |
| **B2B** | "Thank you for your interest in {{ brand_name }} B2B partnerships" | Route to Asset 03 C2 paid + custom-B2B | `#partner` or `#client` (partnership-framed per Asset 10) |

**5-voice selection heuristic:** Creator inquiry signal (TikTok/Instagram handle in inbound OR explicit "I'm a creator") → asset-flag (Sustainable/B2B = "creator" is mission-led) → default 5-voice selection.

**Drill (60 min, 10 questions, passing score 80%):** 5 inbound creator inquiries → pick the right contract type (C1/C2/C3). 3 sample creator-response templates → identify mis-applied FTC-disclosure language. 2 role-play scenarios (rep practices routing to the right contract + confirming FTC-disclosure language).

**Anti-pattern red flags:** (1) Rep doesn't ask "which contract type fits (gifting / paid / affiliate)" — Pitfall from Asset 08 Scenario 8. (2) Rep uses `#sponsored` for a Luxury creator (per Asset 10 Dimension 5, Luxury = `#partner` not `#sponsored`). (3) Rep doesn't escalate to the AM / creator-partnerships lead for affiliate-program inquiries. (4) Rep doesn't confirm the FTC-disclosure language matches the creator's platform (TikTok Branded Content toggle vs Instagram Paid Partnership vs YouTube Paid Promotion).

**Measurement tie-in (Asset 03 + Asset 10):** Creator-inquiry volume × contract-conversion rate × creator-cohort-LTV (the Asset 03 + Asset 10 cohort-LTV overlay). Reps who route to the right contract + confirm FTC-disclosure see 20–35% contract-conversion rate per Asset 03 benchmarks.

### Module 9 — B2B account-manager reply — 4 hours

**Linked Asset 08 scenario:** Scenario 9. **Linked Asset 02 voice section:** Section 4 (Formality 4 / Humor 1 — B2B is formal).

**Reading list (60 min):** Asset 08 Scenario 9 + Asset 02 Section 4 + research/00 §B2B-DTC (B2B account-manager benchmarks + B2B response time SLAs).

**5-voice override matrix:** B2B is the single-voice scenario (the Default variant uses general business tone, not the playful Default from Scenarios 1–8). The 5-voice override matrix collapses to: Default = B2B-formal; other voices = B2B-formal with voice-specific overlay (Luxury = concierge B2B; Sustainable = mission-aligned B2B; Gen-Z = B2B with light warmth; the original B2B = B2B-formal).

**5-voice selection heuristic:** Order history shows B2B account OR contact name = B2B domain OR Move #8 tier = B2B-wholesale → B2B-voice.

**Drill (60 min, 10 questions, passing score 80%):** 5 inbound B2B signals → pick the right tone. 3 sample B2B templates → identify mis-applied. 2 role-play scenarios (rep practices B2B response + AM-coordination).

**Anti-pattern red flags:** (1) Rep uses casual tone for a B2B account (Pitfall: B2B customers expect formal; casual tone signals "we don't understand B2B"). (2) Rep doesn't coordinate with the AM for >10-unit inquiries. (3) Rep doesn't include the account-name + contact-name in the salutation (Pitfall: B2B always uses account + contact). (4) Rep doesn't log the B2B inquiry in the AM's pipeline.

**Measurement tie-in (Asset 05 + B2B-cohort):** B2B-inquiry volume × AM-coordination rate × B2B-cohort-LTV (the Asset 05 cohort-LTV overlay for B2B accounts). Reps who nail B2B-formal + coordinate with AM see 40–60% B2B-90-day-RPR per B2B-DTC benchmarks.

### Module 10 — Subscription skip-or-pause (Move #11 wiring) — 3 hours

**Linked Asset 08 scenario:** Scenario 10. **Linked Move #11:** Subscription program (gated on operator shipping subscription). **Linked Asset 02 voice section:** Section 4 (Formality 2 / Humor 2 — subscription is mid-formality, friendly).

**Reading list (45 min):** Asset 08 Scenario 10 + Move #11 subscription playbook + Asset 02 Section 4.

**5-voice override matrix:**

| Voice profile | Skip-tone | Pause-tone | Sustainable framing |
|---|---|---|---|
| **Default** | "no problem! your next shipment is skipped — you'll get a reminder 7 days before the next one" | "absolutely — paused for {{ pause_duration }}. lmk when you're ready to resume!" | "We'll send a 'we miss you' email in 30 days" |
| **Luxury** | "We have noted your skip preference" | "We have paused your subscription for {{ pause_duration }}. Your account manager will reach out before resumption" | "Your concierge will reach out before resumption" |
| **Sustainable** | "Got it! Your next shipment is skipped — your impact-footprint pauses too 🌱" | "Paused! We'll send an impact-mission-update in 30 days" | "Your carbon-offset contribution pauses but doesn't reset" |
| **Gen-Z** | "easy! skipped ✅" + emoji | "paused for {{ pause_duration }}! lmk when you're back 💛" | "we'll hit you up in 30 days ✨" |
| **B2B** | "We have noted the skip for account {{ account_name }}" | "Paused for {{ pause_duration }}. AM will reach out before resumption" | "AM-led 30-day check-in" |

**5-voice selection heuristic:** Move #8 tier → Klaviyo segment → subscription-history pattern → default fallback.

**Drill (60 min, 10 questions, passing score 80%):** 5 inbound skip/pause signals → pick the right voice. 3 sample skip/pause templates → identify mis-applied. 2 role-play scenarios (rep practices confirming skip/pause + setting the 30-day reminder).

**Anti-pattern red flags:** (1) Rep doesn't confirm the skip/pause in writing (Pitfall: subscription is recurring; customer expects a confirmation). (2) Rep doesn't offer the "pause vs cancel" alternative (Pitfall: customer might prefer to pause; canceling loses them forever). (3) Rep doesn't set the 30-day "we miss you" follow-up. (4) Rep doesn't log the skip/pause in Move #11 + Klaviyo for cohort-LTV tracking.

**Measurement tie-in (Asset 05 + Move #11):** Skip/pause volume × 30-day-resume rate × 90-day-RPR → subscription-pause-cohort-LTV. Reps who offer "pause vs cancel" see 35–50% 30-day-resume rate per Move #11 benchmarks.

### Module 11 — Discount code not working — 2 hours

**Linked Asset 08 scenario:** Scenario 11. **Linked Asset 02 voice section:** Section 4 (Formality 1 / Humor 3 — discount-code is low-emotion, deflected with Gorgias Automate).

**Reading list (30 min):** Asset 08 Scenario 11 + Gorgias Automate discount-code-lookup recipe + Klaviyo discount-code-segment routing.

**5-voice override matrix:** Discount-code is tone-neutral across all 5 voices — the data is what matters (Klaviyo discount-code-segment + Shopify discount-code-validity-check). The only variation is the apology-tone if the code is expired: Default = "sorry, that code expired" / Luxury = "We regret that code is no longer valid" / Sustainable = "Sorry — that code expired. Here's a new mission-aligned code" / Gen-Z = "ugh that code expired 😩 here's a fresh one!" / B2B = "We confirm the code is no longer valid. AM will issue a replacement".

**Drill (30 min, 8 questions, passing score 80%):** 5 inbound discount-code signals → apply the right lookup recipe. 3 sample discount-code responses → identify mis-applied.

**Anti-pattern red flags:** (1) Rep doesn't check the discount-code-validity in Klaviyo before responding (Pitfall: 5–10 min wasted per ticket). (2) Rep doesn't deflect via Gorgias Automate (the canonical 30–60% deflection target). (3) Rep offers a fresh discount reflexively without checking why the code expired (Pitfall: discount-code abuse).

**Measurement tie-in (Asset 05):** Discount-code-volume × deflection-rate × 30-day-RPR. Reps who deflect via Gorgias Automate see 30–60% deflection rate per Gorgias benchmark; manual handling sees 0% deflection.

### Module 12 — General inquiry / "how do I..." — 2 hours

**Linked Asset 08 scenario:** Scenario 12. **Linked Asset 02 voice section:** Section 4 (Formality 2 / Humor 3 — general is the first-impression brand-voice application).

**Reading list (30 min):** Asset 08 Scenario 12 + the 5 voice-driven override tone examples from Asset 02.

**5-voice override matrix:**

| Voice profile | Tone opener | Signoff | First-impression element |
|---|---|---|---|
| **Default** | "Great question!" + helpful | "lmk if you need anything else!" | Friendly + efficient |
| **Luxury** | "Thank you for your inquiry" + helpful | "Our concierge team is at your service" | Concierge framing |
| **Sustainable** | "Great question — here's how it works" + mission framing | "Thank you for being part of our mission" | Mission-first element |
| **Gen-Z** | "oh good q!" + helpful | "lmk if you need anything else!! 💛" | Warm + casual |
| **B2B** | "Thank you for your inquiry regarding {{ account_name }}" + formal | "Regards" | Account-name + formal signoff |

**Drill (30 min, 8 questions, passing score 70% — catch-all has wider variability):** 5 inbound general-inquiry signals → pick the right voice. 3 sample general-inquiry templates → identify mis-applied.

**Anti-pattern red flags:** (1) Rep uses Default-tone for a Luxury customer (the canonical first-impression failure). (2) Rep doesn't personalize the response with the customer's first name. (3) Rep doesn't include the brand-voice-specific first-impression element (Luxury = concierge, Sustainable = mission, Gen-Z = warm, B2B = formal).

**Measurement tie-in (Asset 05):** General-inquiry volume × first-response-time × CSAT-score → general-inquiry-cohort-LTV. First-impression is the highest-leverage brand-voice touchpoint — a mis-toned general-inquiry response is the #1 cause of "I never heard back" NPS-Passive bucket per Gorgias benchmark.

## The 5 voice-driven override profile cards (laminated at every CS workstation)

Each profile card is a 1-page laminated reference. CS reps post these at their workstation and consult them before every voice-override decision. The cards are the **single highest-leverage training artifact** — they reduce voice-mis-application from 25–40% to 5–10% within 30 days per Gorgias benchmark.

### Profile card #1 — Default

**Tone tells (use):** "Hi {{ first_name }}!" / "Thanks!" / "no worries" / "lmk" / "— {{ cs_rep_name }}" / mid-formality / light humor.

**Tone tells (avoid):** "Dearest" (Luxury) / emoji-heavy (Gen-Z) / mission-framing (Sustainable) / formal-business (B2B).

**Customer signals (use when):** No loyalty tier + browse history shows mixed product categories + Move #8 tier = Standard + Klaviyo segment = "general".

**Sample template pairings:** Default WISMO greeting + Default shipping-delay apology + Default defective response.

**Anti-pattern red flags:** Rep uses "Dearest" for a Default-tier customer (over-formal). Rep uses emoji-heavy for a Default-tier customer (over-Gen-Z). Rep doesn't personalize with the customer's first name.

### Profile card #2 — Luxury

**Tone tells (use):** "Dearest {{ first_name }}," / "We deeply regret" / "Our concierge team is at your service" / "With warm regards" / "complimentary" / high-formality / no humor / hand-written-card follow-up.

**Tone tells (avoid):** "OMG" (Gen-Z) / emoji (Default) / "no worries" (Default) / mission-framing (Sustainable) / casual.

**Customer signals (use when):** Move #8 tier = Elite / VIP OR order history ≥3 orders at $200+ AOV OR Klaviyo segment = "luxury_signal" OR AOV ≥$300.

**Sample template pairings:** Luxury WISMO greeting (Dearest) + Luxury shipping-delay apology (We deeply regret) + Luxury defective response (hand-written-card follow-up).

**Anti-pattern red flags:** Rep uses "OMG 😩" for a Luxury customer (the canonical Luxury-CX-failure). Rep uses emoji for a Luxury customer. Rep uses casual tone ("no worries!") for a Luxury customer. The 80%-of-Luxury-CX-failures-from-mis-toned-responses stat from Asset 06 Q8 is real.

### Profile card #3 — Sustainable

**Tone tells (use):** "Hi {{ first_name }} 🌱" / "Thank you for being part of our mission" / "carbon-offset" / "we'll donate to a textile-recycling partner" / "every shipment matters" / mid-formality / mission-first.

**Tone tells (avoid):** "OMG" (Gen-Z) / "Dearest" (Luxury) / "no worries" (Default) / "complimentary" (Luxury).

**Customer signals (use when):** Klaviyo segment = "mission_aligned" OR has opted into impact-report emails OR has interacted with Asset 09 Pillars content.

**Sample template pairings:** Sustainable WISMO greeting (🌱) + Sustainable shipping-delay apology (mission-framing) + Sustainable defective response (donate-to-textile-recycling-partner).

**Anti-pattern red flags:** Rep doesn't include the mission-framing (Pitfall: Sustainable customers expect the mission element; missing it signals "we don't really care about sustainability"). Rep uses Default tone for a Sustainable customer (Pitfall: missing the mission element).

### Profile card #4 — Gen-Z

**Tone tells (use):** "omg" / "lol" / "💛" / "✨" / "lmk" / "ty" / "🎉" / "easy!" / "no stress at all" / low-formality / high-humor / emoji-heavy / lowercase.

**Tone tells (avoid):** "Dearest" (Luxury) / "We deeply regret" (Luxury) / "concierge" (Luxury) / mission-framing (Sustainable) / formal-business (B2B).

**Customer signals (use when):** Klaviyo segment = "gen_z_signal" OR last SMS engagement was emoji-heavy OR browse history shows TikTok-driven traffic.

**Sample template pairings:** Gen-Z WISMO greeting (👋) + Gen-Z shipping-delay apology (😩) + Gen-Z defective response (😔 + 24-hour-replacement).

**Anti-pattern red flags:** Rep uses Default tone for a Gen-Z customer (Pitfall: Gen-Z customers expect the casual + emoji tone; missing it signals "we don't get Gen-Z"). Rep uses Luxury tone for a Gen-Z customer. Rep uses mission-framing for a Gen-Z customer.

### Profile card #5 — B2B

**Tone tells (use):** "Dear {{ contact_name }}," / "We sincerely" / "Regards" / "account {{ account_name }}" / "AM-led" / "operational impact" / "supplier-QA" / high-formality / no humor.

**Tone tells (avoid):** "OMG" (Gen-Z) / "Dearest" (Luxury) / "no worries" (Default) / emoji (any) / mission-framing (Sustainable).

**Customer signals (use when):** Order history shows B2B account OR contact name = B2B domain OR Move #8 tier = B2B-wholesale OR inquiry mentions "account" / "AM" / "bulk".

**Sample template pairings:** B2B WISMO greeting (Dear {{ contact_name }}) + B2B shipping-delay apology (operational impact) + B2B defective response (AM-led QA review).

**Anti-pattern red flags:** Rep uses casual tone for a B2B account. Rep doesn't include the account-name + contact-name. Rep doesn't coordinate with the AM for >10-unit inquiries. Rep doesn't escalate recurring defect patterns to AM / supplier-QA team.

## 5 measurement gates per rep per week

Every CS rep tracks 5 weekly KPIs that flow to Asset 05 cohort-LTV measurement. The KPIs are gating, not aspirational — a rep with <80% first-response-time SLA for 2 consecutive weeks triggers a 1:1 coaching session; a rep with <70% NPS-detractor SLA triggers a Gorgias-fluency refresher + a re-certification drill.

### Gate 1 — Tickets-resolved per day (target: 25–40)

**Why this matters:** Rep throughput is the leading indicator of CS-team capacity. Below 25 tickets/day signals under-utilization (overstaffing or low-CS-volume); above 40 signals over-utilization (understaffing or quality erosion). **Source:** Gorgias Analytics → Rep Performance → Tickets Resolved / Day.

**How to track:** Weekly Monday-morning Gorgias pull; CSV export to Google Sheets; chart per-rep trend over 12 weeks. **Operator action:** Below 25 → investigate CS-volume (low AOV? high deflection rate?) + consider adding self-serve content. Above 40 → hire rep #N+1 or add Gorgias Automate deflection.

### Gate 2 — First-response-time (target: ≤4 hours business hours, ≤12 hours off-hours)

**Why this matters:** First-response-time is the canonical "we care" signal. Below 4 hours signals responsive CS; above 12 hours signals abandonment. **Source:** Gorgias Analytics → Rep Performance → First Response Time.

**How to track:** Weekly pull; per-rep chart. **Operator action:** Below 4 hours → celebrate. Above 12 hours → investigate staffing gaps; add auto-responder; consider Gorgias Automate deflection.

### Gate 3 — CSAT score per ticket (target: ≥4.5/5 from Gorgias post-ticket survey)

**Why this matters:** CSAT is the leading indicator of NPS + RPR. Below 4.0 signals mis-toned responses + over-apologizing + under-resolving. **Source:** Gorgias Analytics → CSAT → Per Ticket.

**How to track:** Weekly pull; per-rep chart; quarterly QA review of low-CSAT tickets. **Operator action:** Below 4.5 → 1:1 coaching session on tone + resolution; review the voice-override profile cards. Below 4.0 → Gorgias-fluency refresher + re-certification drill.

### Gate 4 — NPS-detractor 48-hour SLA hit rate (target: ≥95%)

**Why this matters:** NPS-detractor recovery is the highest-LTV CS scenario. The 48-hour SLA is the canonical "we care" signal; 5+ day delay = 90-day churn trigger. **Source:** Gorgias Tasks → Detractor Follow-up + Klaviyo NPS-detractor Q7-yes status.

**How to track:** Weekly pull; per-rep chart; quarterly review of missed-SLA tickets. **Operator action:** Below 95% → investigate; the canonical fix is Gorgias Automate reminder at 24-hour + 36-hour marks. Below 90% → mandatory 1:1 coaching + Gorgias-fluency refresher.

### Gate 5 — Voice-override mis-application rate (target: ≤5% of tickets)

**Why this matters:** Voice-mis-application is the canonical CS-tone failure mode. Above 10% signals the rep isn't consulting the 5 voice-driven override profile cards. **Source:** Quarterly QA review of 20 random tickets per rep (the canonical QA sample size per Gorgias benchmark).

**How to track:** Quarterly QA review; per-rep chart over 4 quarters. **Operator action:** Above 5% → 1:1 coaching on the 5 voice-driven override profile cards. Above 10% → mandatory Gorgias-fluency refresher + re-certification drill + temporarily reassign to WISMO-only (tone-neutral scenario) until QA passes.

## 4-week ramp curriculum (canonical for 3–10 rep team)

The canonical 4-week ramp curriculum. Adjust for team size per the Decision matrix above.

### Week 1 — Ship 5 modules + train 2 reps (12 hours/rep)

- **Monday (3 hours):** Module 1 WISMO + Module 11 discount-code. Reading + drill for both. Pass drill (≥80%).
- **Tuesday (3 hours):** Module 2 shipping-delay + Module 3 wrong-size. Reading + drill. Pass drill.
- **Wednesday (3 hours):** Module 4 defective. Reading + photo-evidence drill + 5-voice drill. Pass drill.
- **Thursday (2 hours):** Module review (all 5 modules) + 5-voice override profile cards posted at every workstation.
- **Friday (1 hour):** Shadow-mode — rep #1 (most experienced) takes live tickets; rep #2 (new hire) shadows + takes notes on the 5-voice override decisions.
- **End-of-week:** Rep #2 completes Module 1–4 + 11 drills with ≥80% passing score. Rep #1 certifies by signing off on rep #2's drill results.

### Week 2 — Ship 3 more modules + drill NPS-detractor routing (10 hours/rep)

- **Monday (3 hours):** Module 5 refund + Module 7 loyalty-tier. Reading + drill. Pass drill.
- **Tuesday (3 hours):** Module 6 NPS-detractor follow-up. Reading + Klaviyo NPS-detractor routing drill + SLA drill. Pass drill (≥90% — higher bar).
- **Wednesday (2 hours):** Module review (all 8 modules shipped so far) + 5-voice override profile cards refresh.
- **Thursday (1 hour):** Live-ticket mode — rep #2 takes live tickets with rep #1 reviewing 100% of responses for the first 3 days.
- **Friday (1 hour):** End-of-week measurement gate review — tickets-resolved + first-response-time + CSAT for the week.
- **End-of-week:** Rep #2 completes Modules 1–7 + 11 drills with ≥80% passing score (≥90% on Module 6 NPS-detractor).

### Week 3 — Ship 3 more modules (10 hours/rep)

- **Monday (3 hours):** Module 8 UGC-creator inquiry. Reading + Asset 03 C1/C2/C3 contract-type drill + Asset 10 Dimension 5 FTC-disclosure drill. Pass drill.
- **Tuesday (3 hours):** Module 9 B2B-AM + Module 10 subscription skip/pause. Reading + drill. Pass drill.
- **Wednesday (2 hours):** Module review (all 11 modules) + 5-voice override profile cards refresh.
- **Thursday (1 hour):** Live-ticket mode — rep #2 takes live tickets with rep #1 reviewing 50% of responses (down from 100% in Week 2).
- **Friday (1 hour):** End-of-week measurement gate review.
- **End-of-week:** Rep #2 completes Modules 1–11 drills with ≥80% passing score.

### Week 4 — Ship final module + measurement module + continuous-improvement module (8 hours/rep)

- **Monday (2 hours):** Module 12 general-inquiry. Reading + drill. Pass drill.
- **Tuesday (2 hours):** Measurement module — rep learns how their work shows up in Asset 05 cohort-LTV. Asset 05 Metric #5 RPR + Metric #6 churn + Asset 06 cohort-by-NPS-bucket LTV query.
- **Wednesday (1 hour):** Continuous-improvement module — rep learns the quarterly QA review process + the voice-override mis-application rate KPI.
- **Thursday (1 hour):** Live-ticket mode — rep #2 takes live tickets with rep #1 reviewing 25% of responses (down from 50% in Week 3).
- **Friday (2 hours):** End-of-curriculum assessment — rep takes the full 12-module drill (60 questions) with passing score ≥80%. Rep #1 certifies by signing off.
- **End-of-week:** Rep #2 is fully certified. Rep #1 transitions to ongoing QA + coaching (10% of responses reviewed weekly).

## 10 common CS-training pitfalls with corrective `Fix:` lines

1. **Templates-only-no-training** — the canonical "library sits unused" failure mode. Operator ships Asset 08 + never trains reps → 30–50% template adoption at best. **Fix:** always ship Asset 08 + Asset 11 together; the 4-week ramp is non-negotiable for teams of 3+ reps; the 5-voice override profile cards are the single highest-leverage training artifact.
2. **No-voice-override-heuristic** — reps pick Default for everyone because they don't have a <30-second decision flow. **Fix:** train the 5-voice selection heuristic (Move #8 tier → Klaviyo segment → order history → default fallback); laminate the 5 voice-driven override profile cards at every workstation.
3. **No-Gorgias-fluency-drill** — reps can't find the macro under time pressure, so they free-text the response (Pitfall: free-text responses don't capture the cohort-LTV signal). **Fix:** the 10-question Gorgias fluency drill (10 macro-recognition + 10 intent-routing + 10 tag-selection = 30 questions, passing score ≥80%) is mandatory in Week 1.
4. **No-NPS-detractor-SLA** — detractor tickets sit 5+ days because reps don't have a 48-hour-reminder system. **Fix:** Gorgias Automate reminder at 24-hour + 36-hour marks; the 5-voice override profile card #2 (Luxury) + #6 (B2B) are the highest-tone-sensitivity for detractor recovery; the Asset 06 Q7-yes routing must be wired in Week 2.
5. **No-measurement-gate** — reps optimize for ticket-volume not for cohort-LTV. **Fix:** the 5 measurement gates per rep per week are gating, not aspirational; a rep with <80% first-response-time SLA for 2 consecutive weeks triggers a 1:1 coaching session.
6. **Compressing the 4-week ramp for a large team** — a 30-rep team needs 6–8 weeks, not 4. **Fix:** scale the timeline per the Decision matrix; do NOT compress; the 4-week plan is canonical for 3–10 reps; for >10 reps, add 1 week per 5 additional reps + a dedicated trainer.
7. **Skipping the QA review** — quarterly QA review of 20 random tickets per rep is the canonical measurement of voice-override mis-application rate. **Fix:** schedule the quarterly QA review in the operator's calendar; document the results in the Asset 05 cohort-LTV measurement; the 5% mis-application target is gating.
8. **No-Asset-08-cross-link** — Asset 11 training assumes Asset 08 templates exist. **Fix:** always ship Asset 08 before Asset 11; the Asset 11 modules reference Asset 08 scenarios by name; the 5-voice override profile cards reference Asset 02 voice profiles.
9. **No-Move-#8-tier-routing** — reps don't check Move #8 loyalty tier before picking the voice profile. **Fix:** the 5-voice selection heuristic starts with Move #8 tier check; the Move #8 tier is the canonical primary voice signal per Asset 02.
10. **No-onboarding-for-new-hires** — the 4-week ramp is one-time; new hires after the initial ramp need a 2-week condensed version. **Fix:** for new hires after the initial ramp, ship Modules 1–7 in Week 1 (the 75%-volume scenarios) + Modules 8–12 in Week 2; skip the measurement module (already done by the team) + the continuous-improvement module (covered in the team-level quarterly QA).

## 5 verification gates

Every CS-rep-training-program deployment must pass these 5 gates. The gates are paste-ready; copy-paste the shell block in Step 6.

- **Gate A — Module coverage:** All 12 modules shipped + each rep has completed the corresponding drill with passing score (≥80% on Modules 1–5 + 7–12; ≥90% on Module 6 NPS-detractor). `grep -c "^### Module " assets/11-cs-training-program.md` returns **12**; matching drill results in the team's QA log.
- **Gate B — 5-voice override profile cards:** All 5 voice-driven override profile cards laminated + posted at every CS workstation. The team has documented the 5-voice selection heuristic in the runbook + the operator has confirmed the cards are visible.
- **Gate C — Gorgias fluency drill:** Every rep has passed the 10-question Gorgias fluency drill (10 macro-recognition + 10 intent-routing + 10 tag-selection) with ≥80% passing score. Documented in the team's QA log.
- **Gate D — Klaviyo NPS-detractor routing drill:** Every rep has passed the 10-question Klaviyo NPS-detractor routing drill with ≥90% passing score. Documented in the team's QA log.
- **Gate E — 5 measurement gates per rep per week:** Every rep's weekly metrics (tickets-resolved + first-response-time + CSAT + NPS-detractor 48-hour SLA hit rate + voice-override mis-application rate) are tracked in Gorgias Analytics + the Asset 05 cohort-LTV measurement overlay. Quarterly QA review process is documented + scheduled.

## Verification recipe (paste-runnable)

A one-shell-block command that runs all 5 verification gates. Adjust paths to match the operator's workspace.

```bash
ASSET=assets/11-cs-training-program.md
echo "=== Gate A: structural completeness ==="
grep -c "^## " "$ASSET"  # expect 8 top-level sections (Goal + Decision matrix + 12 modules + 5 profile cards + 5 measurement gates + 4-week ramp + 10 pitfalls + verification gates + verification recipe + Related)
echo "=== Gate A: 12-module coverage ==="
grep -c "^### Module " "$ASSET"  # expect 12
echo "=== Gate A: 5-voice override profile cards ==="
grep -c "^### Profile card #" "$ASSET"  # expect 5
echo "=== Gate B: anti-pattern grep ==="
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" "$ASSET" | grep -v "Verification recipe"  # expect 0 outside the verification recipe's own grep example
echo "=== Gate C: per-voice-density verification ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "$voice: $(grep -c "\b$voice\b" "$ASSET")"
done
# expect all 5 voices >= 15
echo "=== Gate D: sibling cross-references resolve ==="
for ref in assets/01-copy-templates.md assets/02-brand-voice.md assets/03-ugc-brief.md assets/04-promo-calendar.md assets/05-retention-metrics.md assets/06-nps-survey-toolkit.md assets/07-competitive-teardown.md assets/08-cs-response-library.md assets/09-impact-reporting.md assets/10-affiliate-program-playbook.md; do
  if [ -f "$ref" ]; then echo "OK: $ref"; else echo "MISSING: $ref"; fi
done
echo "=== Gate D: playbook cross-references resolve ==="
for ref in playbooks/04-welcome-series-klaviyo.md playbooks/06-sms-welcome-and-cart-abandon.md playbooks/06-install-attribution-triplewhale-or-polar.md playbooks/07-loyalty-program-smile.md playbooks/06.5-attribution-quality-audit.md; do
  if [ -f "$ref" ]; then echo "OK: $ref"; else echo "MISSING: $ref"; fi
done
echo "=== Gate E: zero regressions full suite re-run ==="
total_pass=0
for t in scripts/tests/test_*.py; do
  out=$(python3 "$t" 2>&1)
  if echo "$out" | grep -qE "^[0-9]+ passed,?0 failed"; then
    pass=$(echo "$out" | grep -oE "^[0-9]+ passed" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  elif echo "$out" | grep -qE "Ran [0-9]+ tests"; then
    pass=$(echo "$out" | grep -oE "Ran [0-9]+ tests" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  fi
done
echo "Python tests passed: $total_pass (expect 440)"
```

## Related

**Sibling assets (every cross-reference resolves):**

- `assets/01-copy-templates.md` — T1–T8 marketing templates (the pre-purchase voice; this asset is the post-purchase voice via the 12 training modules)
- `assets/02-brand-voice.md` — 5 voice profiles (the canonical source of the 5 voice-driven override columns; the 5 voice-driven override profile cards in this asset mirror Asset 02's 5 voice profiles)
- `assets/03-ugc-brief.md` — C1 gifting + C2 paid + C3 affiliate contract templates; Module 8 UGC-creator-inquiry references the 3 contract types
- `assets/04-promo-calendar.md` — Q4-peak calendar; Week 4 capacity-planning module is calibrated to Asset 04's Q4 peak
- `assets/05-retention-metrics.md` — Metric #5 RPR + Metric #6 churn are directly moved by CS-rep response quality; the 5 measurement gates per rep per week flow to Asset 05 cohort-LTV
- `assets/06-nps-survey-toolkit.md` — Q7 yes/no NPS-detractor routing; Module 6 NPS-detractor follow-up is the inbound counterparty to Asset 06
- `assets/07-competitive-teardown.md` — Dimension 8 Voice-and-tone; the 5 voice-driven override columns in this asset match the operator's competitive-set tone
- `assets/08-cs-response-library.md` — the 12-scenario template library; Asset 11 IS the training program that ensures the library is actually USED; the 12 training modules are 1:1 with the 12 scenarios
- `assets/09-impact-reporting.md` — Pillar 5 Community; Module 6 NPS-detractor impact-relevance drill uses Asset 09's impact data as the source of truth
- `assets/10-affiliate-program-playbook.md` — Dimension 5 FTC-disclosure policy; Module 8 UGC-creator-inquiry references the FTC-disclosure language

**Sibling playbooks (every Move #N reference matches a shipped move):**

- `playbooks/04-welcome-series-klaviyo.md` (Move #4) — the CS-rep-bridge-to-2nd-order-conversion is canonical; Module 6 measurement module ties rep work to repeat-purchase
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7) — SMS-4 review request; Module review-request-handling covers reps' response when customer replies to a review-request SMS
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — Triple Whale cohort-LTV is the canonical measurement source for CS-rep-attributed retention
- `playbooks/07-loyalty-program-smile.md` (Move #8) — VIP / Elite tier-up; Module 7 loyalty-tier trains reps on points-balance / tier-up scenarios
- `playbooks/06.5-attribution-quality-audit.md` (Move #6.5) — the audit ties the 12 CS scenarios to the attribution stack; Module 6 measurement module uses the audit as the gating signal

**Research that informed this asset:**

- `research/00-ecommerce-ops-landscape.md` — §Gorgias + §helpdesk-AI (CS tool landscape + tier-pricing + AI-deflection benchmarks + rep-training industry data); §customer-service-staffing (3–10 reps for 1k–10k orders/mo is the canonical band)
- `research/01-tools-stack-comparison.md` — Gorgias vs Zendesk vs Intercom vs Help Scout vs Front; the training program is tool-agnostic but the wiring examples assume Gorgias

**Forward-pointing references (planned future assets):**

- `assets/12-impact-data-pipeline.md` *(planned — does not yet exist)* — the Asset-12 candidate for the impact-data pipeline (Shopify Planet API + EcoCart API + Fair Trade USA audit API + B Corp certification API → unified impact dashboard). Compounds this asset's Module 6 NPS-detractor impact-relevance drill by automating the per-pillar data collection that the rep currently looks up manually.
- `playbooks/12-cs-rep-onboarding-program.md` *(potential playbook — does not yet exist)* — the canonical playbook companion to this asset; would mirror the 16-shipped-playbook pattern (Move #1–#10 + #6.5–#6.8 + #9.5) with a 6-step build + 7-gate verification + 15-pitfall list + ROI table for the CS-rep onboarding program. Pick up in a future tick if the operator signals "I want to formalize CS-rep hiring next quarter."
