# Ecommerce Ops Workspace

> **Mission.** Operate a profitable, AI-augmented direct-to-consumer ecommerce business. This folder is the single source of truth for research, playbooks, dashboards, scripts, and live operation notes.

## Folder map

```
ecommerce-ops/
├── README.md                              ← you are here
├── research/                              ← market intel + synthesis
│   ├── 00-ecommerce-ops-landscape.md      (unit econ, channels, retention, AI)
│   ├── 01-tools-stack-comparison.md       (vendor matrix, pricing, recommended stacks)
│   ├── 02-top-10-leverage-moves.md        (ranked playbook backlog with status tracker)
│   └── 03-30-day-rollout-plan.md          (synthesis: 4-week plan sequencing 16 shipped moves)
├── playbooks/                             ← step-by-step runbooks ("how do we actually do X")
│                                          (15 shipped: abandoned-cart / upsell / checkout /
│                                          welcome / Klaviyo+Postscript migration / Triple Whale /
│                                          SMS / loyalty / mobile PDP / PDP A/B / AI ad creative /
│                                          attribution-quality + TikTok + Snap+Pinterest +
│                                          cross-platform drift + unification)
├── scripts/                               ← executable code (cron + operator use)
│                                          (11 ROI/audit scripts + 11 matching test files,
│                                          440 TDD tests across 11 test classes)
├── dashboards/
│   └── unified-attribution-health.html    ← self-contained static dashboard (0 build step,
│                                          59 tests, loads 4 attribution-audit JSONs)
├── dashboard/                             ← Next.js 15 dashboard (operator-facing SPA)
│   ├── app/                               ← 11 routes: /, /top-10, /playbooks, /journal,
│   │                                       /30-day-plan, /ai, /channels, /cro, /inventory,
│   │                                       /retention, /unit-economics
│   └── src/lib/content.json               ← auto-generated index of research/ + playbooks/
├── assets/                                ← 11 shipped: copy templates (8 Klaviyo+Postscript
│                                          templates) + brand voice (5 profiles × 5 dimensions)
│                                          + UGC brief (5 outreach + 3 contracts + Klaviyo
│                                          segment) + promo calendar (12 months × 5 voice
│                                          variants × 8 templates × 5 outreach emails)
│                                          + retention metrics (12 metrics × 5 voice profiles
│                                          × 10 pitfalls × 5 verification gates)
│                                          + NPS survey toolkit (Postscript + Wootric +
│                                          Delighted + 4-channel decision matrix + 1+9-
│                                          question template + 5 guardrails + Klaviyo 4-step
│                                          wiring + cohort-by-NPS-bucket LTV SQL + 10
│                                          pitfalls + 5 verification gates)
│                                          + competitive teardown (8-dimension × 5-voice
│                                          scoring framework: Positioning / Pricing /
│                                          Retention / Content / Shipping / Creator /
│                                          Paid / Voice-and-tone — with 40 voice-driven
│                                          override cells + 3×5 scoring matrix template
│                                          + competitor-sourcing decision matrix)
│                                          + CS response library (12 scenarios × 5 voice
│                                          profiles = 56 paste-ready templates: WISMO /
│                                          shipping-delay / wrong-size / defective /
│                                          refund / NPS-detractor / loyalty-tier /
│                                          UGC-creator / B2B-AM / subscription / discount-
│                                          code / general + Gorgias macro + intent + tag +
│                                          voice-routing wiring + 10 pitfalls + 5
│                                          verification gates)
│                                          + impact reporting (6 pillars × 5 voices
│                                          = 30 override cells + 16-source data recipe)
│                                          + affiliate program playbook (6-path tool
│                                          decision + 7 dimensions × 5 voices = 35
│                                          override cells + 6-step build + 10 pitfalls
│                                          + 5 verification gates)
│                                          + CS-rep training program (12-scenario
│                                          curriculum × 5 voice-driven override columns
│                                          = 60 module/scenario pairings + 5-voice
│                                          selection heuristic + 4-week ramp
│                                          curriculum + 5 voice-driven override
│                                          profile cards + 5 measurement gates per
│                                          rep per week + 10 pitfalls + 5
│                                          verification gates)
└── docs/                                  ← journal + decision log
    └── journal.md                         ← every cron tick logs here (newest at top)
```

## Research principles

1. **Verified > directional > rule-of-thumb.** Every benchmark is tagged. We don't make decisions on uncited heuristics.
2. **The cheap stack wins first.** Tooling is a tax until $1M+ GMV. We optimize for time, not features.
3. **Email/SMS > paid social at the margin.** The #1 profit channel for DTC is retention automation.
4. **Mobile conversion is the largest unrealized lever.** 70% of traffic, ~50% the CVR. Mobile-first always.
5. **AI is table-stakes, not a moat.** Use AI for creative iteration, CS automation, and dynamic merchandising — not as a differentiator.

## Current status (2026-06-26)

**Operator phase — 16/10 top-10 leverage moves shipped + 5 follow-on moves + dashboard + synthesis.**

| Track | Status | Notes |
|---|---|---|
| **Research** | Complete (4 docs) | `00` landscape + `01` stack comparison + `02` top-10 + `03` 30-day synthesis |
| **Top-10 playbooks** | 10/10 shipped | #1–#10 all shipped with companion scripts where applicable (Abandoned cart / Post-purchase upsell / Checkout audit / Welcome series / Klaviyo+Postscript migration / Triple Whale / SMS / Loyalty / Mobile PDP / AI ad creative) |
| **Attribution quality stack** | 5/5 shipped | Move #6 Triple Whale + #6.5 Meta/Google/GA4 audit + #6.6 TikTok audit + #6.7 Snap+Pinterest audit + #6.8 cross-platform drift rollup |
| **Operator surfaces** | 3/3 shipped | `dashboards/unified-attribution-health.html` (static) + `dashboard/` (Next.js with 11 routes + CTA banner) + `research/03-30-day-rollout-plan.md` (synthesis) |
| **Tests** | 499/499 green | 440 Python (11 test files) + 59 JS (1 test file); `for t in scripts/tests/test_*.py; do python3 "$t"; done` + `node dashboards/tests/test_unified_attribution_health.js` |
| **Journal** | Live | Every cron tick logs to `docs/journal.md` with what shipped, why, files touched, verification, next action |
| **A/B testing** | 1 follow-up shipped | Move #9.5 PDP A/B testing program (companion to Move #9) |
| **Assets** | 11 shipped | `assets/01-copy-templates.md` (8 paste-ready Klaviyo email + Postscript SMS templates with compliance + decision matrix) + `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework + adaptation recipe for non-default brands) + `assets/03-ugc-brief.md` (3 sourcing model decision matrix + 1 commissioning template + 5 creator outreach emails + 3 contract templates for paid/gifted/affiliate + Klaviyo UGC segment wiring + cohort-LTV measurement) + `assets/04-promo-calendar.md` (12-month Default calendar + 4 voice-driven variant tables: Luxury / Sustainable / Gen-Z / B2B + 10 numbered pitfalls + 5 verification gates; compounds Asset 01 T1-T8 templates + Asset 02 voice framework + Asset 03 U1-U5 outreach emails) + `assets/05-retention-metrics.md` (12-metric retention reference card: CAC + LTV + LTV:CAC + retention rate D1/D7/D30/D90 + repeat purchase rate + churn rate + cohort LTV by source + payback period + email engagement + unsubscribe rate + NPS + cohort LTV by UGC vs paid-social vs organic — each with formula + Default benchmark + 4 voice-driven override columns + Klaviyo/Shopify/Triple Whale data source; compounds Asset 01 T1-T8 templates + Asset 02 voice framework + Asset 03 Klaviyo UGC segment + Asset 04 Q1-low/Q4-peak macro shape) + `assets/06-nps-survey-toolkit.md` (paste-ready NPS-survey program: Postscript 1-question + Wootric / Delighted 9-question + 5 frequency guardrails + Klaviyo NPS segment wiring + cohort-by-NPS-bucket LTV SQL + 5-voice-profile LTV multipliers Default 3–4× / Luxury 4–6× / Sustainable 3–4× / Gen-Z 3–4× / B2B 4–5× + 10 pitfalls + 5 verification gates; compounds Asset 01 T7 SMS Review Request + Asset 02 voice framework + Asset 03 UGC cohort NPS lift + Asset 04 quarterly cadence + Asset 05 Metric #11 NPS data-pipeline gap) + `assets/07-competitive-teardown.md` (8-dimension competitive-benchmarking framework: Positioning / Pricing / Retention and loyalty / Content / Shipping and fulfillment / Creator mix / Paid mix / Voice-and-tone — 8 dimensions × 5 voice profiles = 40 voice-driven override cells + paste-ready 3×5 scoring matrix template + 5-channel competitor-sourcing decision matrix for $0–$50k/$50k–$500k/$500k+ GMV tiers + 8 verification gates; compounds Asset 02's voice framework across 8 dimensions + Asset 06's NPS cohort + Asset 04's quarterly re-run cadence + the Meta Ad Library + TikTok Creative Center free-source set) + `assets/08-cs-response-library.md` (12-scenario customer-service response template library: WISMO + shipping-delay + wrong-size + defective + refund / NPS-detractor / loyalty-tier / UGC-creator / B2B-AM / subscription / discount-code / general × 5 voice profiles = 56 paste-ready templates with 5 voice-driven override columns (Default / Luxury / Sustainable / Gen-Z / B2B) + Gorgias macro + intent + tag + voice-routing wiring recipe + 10 numbered pitfalls + 5 verification gates (per-voice-density: Default=31 / Luxury=32 / Sustainable=26 / Gen-Z:24 / B2B:24 all ≥15); compounds Asset 06 Q7 NPS-detractor routing + Asset 02 voice framework across 12 post-purchase touchpoints + Move #8 loyalty tier-up + Asset 03 UGC creator inquiry + Asset 05 churn-RPR measurement + Asset 07 Dimension 8 Voice-and-tone) + `assets/09-impact-reporting.md` (6-pillar impact-reporting framework: Carbon / Materials / Labor / Packaging / Community / Certification — 6 pillars × 5 voice profiles = 30 voice-driven override cells + paste-ready 6-pillar reporting template + 16-source data-source wiring recipe with $0–$50k/$50k–$500k/$500k+ GMV default stacks + 10 numbered pitfalls + 5 verification gates (per-voice-density: Default=46 / Luxury=15 / Sustainable=18 / Gen-Z=15 / B2B=15 all ≥15); compounds Asset 02 voice framework across 6 sustainability pillars + Asset 03 UGC creator impact-mission alignment + Asset 04 Earth Day/B Corp month annual cadence + Asset 05 Metric #12 cohort LTV by impact-engagement overlay + Asset 06 Q9 sustainability-importance NPS signal + Asset 07 Dimensions 2/5/8 impact-claim benchmarking + Asset 08 Scenarios 5/10 post-purchase impact touchpoints + Move #3 checkout donation toggle + Move #6 Triple Whale impact-LTV measurement + Move #8 loyalty impact-rewards rule) + `assets/10-affiliate-program-playbook.md` (paste-ready affiliate program-management framework: 6-path tool decision matrix [GoAffPro / Refersion / Levanta / Refersion-non-Shopify / Aspire / GoAffPro-free] + 7 program-design dimensions [commission tier framework / payout schedule / cookie window / content requirements / FTC disclosure / cookie-deprecation mitigation / cohort-LTV measurement] × 5 voice profiles = 35 voice-driven override cells (Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8–12/12–15/15–20% commission tiers + per-voice payout schedules + per-voice cookie windows Default 30d / Luxury 60d / Gen-Z 7d / B2B 90d / Sustainable 30d + per-voice FTC disclosure language + 6-step cookie-deprecation mitigation recipe with Shopify CAPI + UTM fallback + 4-step cohort-LTV measurement SQL + 5-voice LTV:CAC benchmarks) + 6-step Week-1 build (pick path → install → configure → recruit first 10–20 affiliates via 3 channels + Default/Luxury/Sustainable/Gen-Z/B2B recruitment-email templates → launch → verify) + 10 numbered pitfalls with corrective `Fix:` lines (cookie-deprecation-naive iOS-14.5 trap / creator-volume trap / commission-too-low / commission-too-high / cookie-too-long / FTC-disclosure-missing / payment-processing-friction / no-cohort-LTV-measurement / no-signed-agreement / no-tier-promotion-SOP) + 5 verification gates (per-voice-density: Default=25 / Luxury=16 / Sustainable=19 / Gen-Z=17 / B2B=16 all ≥15); compounds Asset 03 C3 affiliate contract (the inbound counterparty agreement) + Asset 04 Q4-peak affiliate-promo cadence + Asset 06 Q9 sustainability-importance NPS signal for Sustainable-creator recruitment + Asset 07 Dimension 6 Creator-mix benchmarking + Asset 08 Scenario 8 UGC-creator-inquiry touchpoint + Asset 09 Pillar 5 Community impact-aligned creators) + `assets/11-cs-training-program.md` (paste-ready CS-rep onboarding training program: 12 training modules 1:1 with Asset 08's 12 scenarios [WISMO + shipping-delay + wrong-size + defective + refund + NPS-detractor + loyalty-tier + UGC-creator + B2B-AM + subscription + discount-code + general-inquiry] × 5 voice-driven override columns = 60 module/scenario pairings + 5-voice selection heuristic [Move #8 tier → Klaviyo segment → order history → default fallback, <30-second decision flow] + 4-week ramp curriculum [Week 1 ship 5 modules + train 2 reps / Week 2 ship Modules 5/6/7 / Week 3 ship Modules 8/9/10 / Week 4 ship Module 12 + measurement + continuous-improvement] + 5 voice-driven override profile cards laminated at every CS workstation [Default / Luxury / Sustainable / Gen-Z / B2B with 3 tone tells + 3 customer signals + 3 sample template pairings + 2 anti-pattern red flags per card] + 5 measurement gates per rep per week [tickets-resolved 25-40/day + first-response-time ≤4hr business / ≤12hr off-hours + CSAT ≥4.5/5 + NPS-detractor 48hr-SLA hit rate ≥95% + voice-override mis-application rate ≤5%] + 10 numbered pitfalls with corrective `Fix:` lines [templates-only-no-training / no-voice-override-heuristic / no-Gorgias-fluency-drill / no-NPS-detractor-SLA / no-measurement-gate / compressing-the-4-week-ramp / skipping-the-QA-review / no-Asset-08-cross-link / no-Move-#8-tier-routing / no-onboarding-for-new-hires] + 5 verification gates [module-coverage / 5-voice-profile-cards / Gorgias-fluency-drill / Klaviyo-NPS-detractor-routing-drill / 5-measurement-gates]; compounds Asset 08 12-scenario library by adding the adoption layer that ensures the library is actually USED by CS reps with the right tone + Asset 02 5-voice profiles as the canonical source of the override columns + Asset 06 Q7 NPS-detractor routing inbound to Module 6 + Asset 03 C1/C2/C3 contract templates inbound to Module 8 + Asset 10 Dimension 5 FTC-disclosure language inbound to Module 8 + Move #8 Smile.io tier-up routing to Module 7 + Move #4 welcome-series CS-rep bridge to 2nd-order conversion + Move #6 Triple Whale cohort-LTV as the canonical measurement source for the 5 measurement gates) |

**Where to start (new operator):** Open `research/03-30-day-rollout-plan.md` for the 4-week day-by-day plan, then jump to `dashboard/` (live operator dashboard, served at `http://127.0.0.1:8767/` after `cd dashboard && npx next dev`), then drill into any `playbooks/NN-*.md` for a specific move's runbook.

## How this folder is maintained

- The `improve-ecommerce-ops` cron job (every 6h) reads `/research` + `/playbooks` + the last journal entry, picks ONE bounded improvement, and ships it (a new playbook, a new script, an asset, a dashboard route, or a hygiene fix).
- Each tick produces a visible artifact + a journal entry to `/docs/journal.md` + a report at `/data/workspace/cron-reports/improve-ecommerce-ops_latest.{md,json}`. Never "just code" — always ship something an operator can run.
- **Bounded-fix discipline:** one fix per tick, TDD for code, content-only recipe for markdown/assets, commit locally, never push.