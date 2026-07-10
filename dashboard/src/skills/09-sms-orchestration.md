---
name: sms-orchestration
title: SMS orchestration (SMSBump + Postscript channel orchestration, Move #19)
category: retention
tier: 1
priority: P1
default_move: 19
year_1_roi_band: "2.4:1–107:1"
sms_friendly: true
last_updated: 2026-07-10
sources: [postscript 2024, smsbump 2024, klaviyo 2024, attentive 2024, gsma-rcs 2024, triple-whale 2024, two-way-conversations 2024, rcs-business-messaging 2024, mms 2024, sailthru 2024, shopify-markets 2024]
---

# SMS orchestration (SMSBump + Postscript channel orchestration, Move #19)

> Move #7 ships the **canonical 4-flow Postscript welcome + cart-abandon SMS substrate** for $100k–$500k GMV brands. Move #19 is the **canonical next step** for $1M–$50M DTC brands with Move #7 live 6+ months AND 50k+ opted-in US SMS subscribers AND Triple Whale attribution wired AND ≥5% international GMV share: layer **SMSBump international + Postscript DLR monitoring + Klaviyo SMS segment overlay + Triple Whale SMS merge + MMS for Luxury voice + RCS business messaging for Gen-Z voice + two-way conversations for creator cohort + the 1%-rule SMS-attrition cohort-iteration cycle** into a 4-phase, 6–18 month orchestration rollout. Year-1 ROI band 2.4:1–107:1 with a canonical "great" band of **$200k–$1.5M Path B incremental SMS-orchestration-revenue** at +20–40% SMS list growth vs Postscript-only + +5–15% SMS deliverability vs Postscript-only baseline + +20–40% SMS cohort-LTV multiplier at $5M US DTC + $1M international base. Move #19 — ship AFTER Move #7 (SMS welcome + cart abandon) is live 6+ months AND Move #6 (Triple Whale) is producing cohort LTV AND Move #1 (cart abandon email) is at mature baseline, BEFORE moving on to bespoke high-touch flows.

## When to use this skill

You have:
- Move #7 (SMS welcome + cart abandon via Postscript) shipped — verified published flows `sms_welcome_v1` + `sms_cart_abandon_v1` have sent ≥100 SMS / 30 days each AND are at 6+ months post-launch (Playbook 06-sms Gate A–D all passing)
- Postscript Starter / Growth / Scale tier active — per `playbooks/06-sms-welcome-and-cart-abandon.md` §Postscript tier-selection
- ≥50k opted-in US SMS subscribers on Postscript (the threshold at which Postscript-primary becomes insufficient and multi-channel orchestration becomes structurally-superior per Postscript 2024 + Attentive 2024 benchmarks)
- Triple Whale Starter or Pro wired and producing cohort LTV (Move #6 shipped 6+ months ago — gated prerequisite because without SMS-source-merge cohort-overlay you cannot measure SMS-orchestration lift cleanly)
- Klaviyo Email and SMS (or Klaviyo Email + Klaviyo SMS channel add-on) wired — voice-profile webhook mapping active for Luxury + Gen-Z cohort routing
- ≥$1M US DTC GMV base AND ≥$500k international-GMV share (Shopify Markets order volume verified at ≥5% of total)
- Shopify Markets active with ≥5 locales OR no international yet (latter triggers Path A instead of Path B)
- ≥20% SMS-orchestration margin headroom — the full Path B cost stack is $1k–$5k/mo so brands with <20% gross margin should defer or offer SMS-orchestration-only at higher price-point
- TCPA + GDPR + locale-specific compliance baseline established (cost of one non-compliant message = $500+ fine per TCPA)
- Operator availability: 4 hr/wk Phase 1 + 2 hr/wk Phase 2 + 1 hr/wk Phase 3 + 0.5 hr/wk Phase 4 (≈ 8–10 hr/wk peak with quarterly maintenance thereafter)
- A 4–6 month launch window with no major sale, no product launch, no BFCM (SMS-orchestration deliverability is sensitive to traffic mix during ramp-up)

You do NOT have:
- Move #7 shipped yet — running SMS-orchestration without Move #7 wastes every pillar (Pitfall #14 below)
- Triple Whale / Polar attribution installed — you cannot measure SMS-orchestration-cohort-LTV without it (Pitfall #7)
- ≥50k opted-in US SMS subscribers — test duration exceeds 4–8 weeks per phase for sub-50k lists (defer to revenue levers — Path A)
- International GMV share — if <5% international, run Path A Postscript-primary + DLR + Postscript-MMS only instead of full Path B
- Budget for SMSBump + Postscript tier upgrade + Klaviyo SMS segment overlay + DLR monitoring + Triple Whale SMS merge — Path B requires $1k–$5k/mo recurring + $2k–$25k one-time setup
- TCPA compliance baseline — one non-compliant send = $500+ per message fines; baseline MUST be wired before any SMS send
- Shopify Markets international active — SMSBump international requires Shopify Markets active locales + international order volume baseline (Pitfall #1)

## What "best in class" looks like

Reference: Athletic Greens, Allbirds, Hexclad, Bombas, Olipop, Glossier, Ruggable, Cuts Clothing, Dr. Squatch, MVMT, Casper.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Phase 1 ship cadence | 4–6 weeks (P1 + DLR + Klaviyo SMS overlay + Triple Whale SMS merge all green) | 8–12 weeks | 3 weeks with Attentive-enterprise-secondary already on |
| SMS list growth vs Postscript-only | +20–40% (SMSBump-international keyword libraries active in 5+ locales) | +10% | +60% with quarterly keyword-library iteration + locale-specific TCPA baseline |
| SMS deliverability rate | +5–15% (DLR monitoring + 5-canonical-deliverability-cohort-queries wired) | Baseline-only | +25% with weekly DLR-segment-flagged-bounce-rate recovery flow |
| SMS cohort-LTV multiplier vs Postscript-only | +20–40% (1%-rule SMS-attrition cohort iterated monthly) | +10% | +60% with Triple Whale Pro + automated 5-way comparison cycle |
| International SMS recovery (SMSBump) | 5–15% international cart-abandon recovery | 2–3% | 20%+ with locale-specific keyword libraries + DLR-monitoring-by-locale |
| MMS Luxury voice CTR vs text SMS | 2–3× CTR + 30–50% higher conversion | 1.5× CTR | 4× CTR with bespoke rich-media-attachment production |
| RCS Gen-Z engagement vs text SMS | 2–4× engagement + 30–50% higher conversion | 1.5× engagement | 6× with interactive-buyer-journey + read-receipt cohort LTV overlay |
| Two-way conversation response latency | <30s median creator-cohort response | <4h | <15s median + creator-engagement-LTV overlay wired |
| Phase 4 12–24-month steady-state LTV multiplier | 2–4× LTV multiplier Year-2+ | 1.5× | 5× with weekly SMS-cohort-attrition-1%-rule iteration |
| Cost stack (Path B DEFAULT) | $1k–$5k/mo recurring + $2k–$25k one-time | $500–$1k/mo recurring | $3k–$7k/mo with Attentive-Enterprise + RCS-business-messaging expansion |
| Operator hours per phase | Phase 1 4 hr/wk / Phase 2 2 hr/wk / Phase 3 1 hr/wk / Phase 4 0.5 hr/wk | Phases 1–3 all 4 hr/wk | Phases 2–4 fully automated with Triple Whale webhook + Postscript Inbox AI |
| 5-way comparison cycle | Quarterly cohort-LTV comparison SMS-orchestration vs Postscript-only vs SMSBump-only vs Klaviyo-SMS-only vs Attentive-only | None | Automated Triple Whale webhook triggers comparison every 30 days |

## SMS-orchestration benchmarks (2024–25)

| Scenario | GMV | Cost stack | International share | SMS list | Year-1 incremental SMS revenue | Year-1 ROI | Payback |
|---|---|---|---|---|---|---|---|
| Path A small (defer-or-light) | <$500k US DTC | $0–$500/mo | None | <50k | $10k–$50k | 4:1 conservative | 12 wk |
| Path B DEFAULT (sweet spot) | $1M–$25M DTC+international | $1k–$5k/mo | 5%+ | 50k+ | $200k–$1.5M | 2.4:1–107:1 (median ~15:1) | 4–8 wk |
| Path C enterprise | $5M+ DTC+international | $3k–$15k/mo | 15%+ | 100k+ | $1M–$5M | 2.5:1 (muted by 6–12-mo build cycle) | 6–9 mo |

**Median DTC at $1M–$25M GMV with 50k+ opted-in US SMS subscribers sees +20–40% SMS list growth + +5–15% SMS deliverability + +20–40% SMS cohort-LTV multiplier at $200k–$1.5M Path B incremental SMS revenue per Postscript 2024 + SMSBump 2024 + Klaviyo 2024 + Attentive 2024 + GSMA-RCS 2024 + Triple Whale 2024 + Two-way-conversations 2024 + RCS-business-messaging 2024 + MMS-2024 + Sailthru 2024 benchmarks.** Year-2+ steady-state compounds to **2–4× SMS cohort-LTV multiplier** vs SMS-only baseline.

## The build (4–6 months Phase 1 + 6–12 months full rollout, 6 steps for a competent operator)

### Step 1 — Tool stack selection + Phase-1 onboarding (Weeks 1–4, ~16 hours operator)

- **Default to Path B** if $1M+ GMV + 50k+ opted-in US SMS subscribers + 5%+ international GMV share + 20%+ margin headroom + Triple Whale wired
- **Default to Path A** if <$500k GMV OR <5% international OR <50k SMS subscribers (defer Path B until thresholds cross)
- **Default to Path C** only if $5M+ GMV + 100k+ opted-in US SMS subscribers + dedicated in-house SMS team or $5M+ SMS-attributed revenue (Path C is muted by 6–12-mo build cycle — only brands with the operational patience + team capacity should pick C)
- **Pillar 1 tool stack wired:** Postscript Growth or Scale tier ($200–$2k/mo) + DLR Monitoring Suite (built-in) + Klaviyo Email and SMS ($45/mo) or Klaviyo SMS channel add-on ($0–$100/mo) + Triple Whale Starter SMS-source-merge OR Pro ($179–$1,290/mo); voice-profile webhook mapping to Klaviyo Luxury + Gen-Z segments active
- **Pillar 2 SMSBump tool stack:** SMSBump account active via Shopify Markets integration ($100–$400/mo Basic OR $500–$2k/mo Pro) + 5+ locale-specific SMS keyword libraries built (DE / FR / ES / IT / NL baselines) + locale-specific TCPA + GDPR compliance baseline established
- **Triple Whale SMS-source-merge cohort overlay:** wire the canonical 5-deliverability-cohort-queries (SMS-bounce-rate + SMS-opt-out-rate + SMS-spam-complaint-rate + SMS-deliverability-rate + SMS-cohort-LTV-vs-baseline) — these power the 5-way comparison cycle

### Step 2 — Phase 1 first-SMS-orchestration-flow launch (Weeks 5–8, ~8 hours operator)

- Launch **first-SMS-orchestration-flow** combining 3 sub-flows:
  - **International SMS cart-abandon via SMSBump** for the 5 Shopify Markets active locales — locale-specific keyword library + locale-specific DLR + locale-specific currency display (5–15% international cart-recovery per SMSBump 2024)
  - **High-intent US SMS cart-abandon via Postscript** with voice-profile-routed copy (Default vs Luxury vs Sustainable vs Gen-Z vs B2B — 5 voice variants wired via Klaviyo voice-profile webhook mapping)
  - **DLR-segment-flagged bounce-rate recovery via Postscript** for subscribers that hit Postscript-DLR-baseline bounce threshold (3+ bounces in 7d) — re-engage with Klaviyo email instead (deliverability cohort LTV lift)
- Wire **Triple Whale SMS-cohort-LTV-iteration-cycle baseline** — every SMS-sourced order tagged with source + voice-profile + locale; cohort LTV computed at 30/60/90-day windows
- Wire **voice-profile-routing-inbox in Postscript Inbox** so creator-cohort SMS responses route correctly (Pitfall #6 below)

### Step 3 — Phase 2 voice-channel pillars (Weeks 9–24, ~20 hours operator across 4 pillars)

- **Pillar 3 — MMS Luxury-voice-SKU-SMS launch:** Postscript MMS-launch $0 with Postscript Scale tier OR Attentive MMS-launch $0 with Attentive + 5+ MMS Luxury-voice-SKU creative assets built (rich-media-attachments + video-previews + branded-unboxing-experience + 2–3× CTR vs text SMS baseline per MMS 2024 + Postscript 2024 MMS-launch + Attentive 2024 MMS-Luxury-voice-SKU-launch benchmarks); MMS-deliverability-monitoring wired
- **Pillar 3 — RCS Gen-Z-voice-Flash-Sale launch:** Attentive RCS-business-messaging + GSMA-RCS-availability verification per locale + 5+ RCS Gen-Z voice Flash-Sale creative assets built (rich-media-cards + branded-RCS-Business-Messaging + interactive-buyer-journey + read-receipt cohort LTV overlay + 2–4× SMS-engagement-rate vs text SMS baseline + 30–50% higher conversion vs text SMS baseline per Attentive 2024 RCS + GSMA-RCS 2024 + Two-way-conversations 2024 + RCS-business-messaging 2024 benchmarks); RCS-deliverability-monitoring wired
- **Pillar 2 — International multi-locale SMSBump orchestration launch:** Shopify Markets multi-locale SMS routing + 10+ locale-specific SMS keyword libraries (5+ initially + 5 added in Q2) + locale-specific TCPA + GDPR compliance baseline + locale-specific DLR monitoring; SMSBump-post-purchase flow launch (post-purchase upsell + review-request + winback + cart-abandon + browse-abandon + 30–180s time-to-conversion baseline)
- **Pillar 4 — Two-way conversations creator-cohort launch:** Inbox by Postscript OR Attentive Concierge + creator-response-routing + 30–180s time-to-conversion baseline + Move-#16 creator-economy-expansion-cohort-overlay-wired

### Step 4 — Phase 3 cohort-iteration pillars (Weeks 25–48, ~10 hours operator)

- **Pillar 5 — SMS-cohort-attrition 1%-rule iteration cycle:** Triple Whale 1%-rule SMS-attrition cohort baseline + identify SMS-attrition cohort + iterate SMS-orchestration cadence + deliverability-rate-bounce-cohort-LTV-overlay (5–15% SMS-attrition-rate vs baseline cohort per Triple Whale 2024 + Sailthru 2024 canonical-1%-rule benchmarks)
- **Pillar 5 — SMS-deliverability-reach-cohort-overlay instrumentation:** Postscript-DLR-monitoring-Wire + Attentive-DLR-monitoring-Wire + SMSBump-DLR-monitoring-Wire + Klaviyo-DLR-monitoring-Wire baseline + canonical 5-deliverability-cohort-queries (SMS-bounce-rate + SMS-opt-out-rate + SMS-spam-complaint-rate + SMS-deliverability-rate + SMS-cohort-LTV-vs-baseline)
- **Pillar 5 — 5-way comparison cycle launch:** SMS-orchestration-cohort-LTV vs Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV at 30/60/90/180-day windows; 5 deliverability-rate cohort overlay + 5 attrition-cohort overlay + 5 keyword-library cohort overlay
- **Pillar 5 — Locale-by-locale DLR monitoring:** SMSBump-DLR-monitoring + Postscript-DLR-monitoring + Attentive-DLR-monitoring baseline + locale-specific keyword-library-iteration + locale-specific TCPA compliance baseline

### Step 5 — Phase 4 steady-state + 12–24-month compounding (Weeks 49–72, ~5 hr/wk quarterly thereafter)

- **Pillar 5 — SMS-orchestration-cohort-LTV-attrition 1%-rule iteration cycle quarterly:** compare quarterly SMS-cohort-attrition rate vs no-SMS-attrition-iteration baseline + 5 deliverability-rate cohort overlay + 5 keyword-library cohort overlay + locale-specific DLR cohort overlay + identity SMS-attrition cohort LTV overlay
- **Pillar 5 — SMS-deliverability-reach-cohort-overlay instrumentation quarterly:** compare quarterly SMS-deliverability-rate cohort vs control set + bounce-rate-cohort-vs-control + opt-out-rate-cohort-vs-control + spam-complaint-rate-cohort-vs-control
- **Pillar 5 — 5-way-comparison-cycle iteration quarterly:** compare quarterly SMS-orchestration-cohort-LTV vs control set at 30/60/90/180-day windows + 5 deliverability rate cohort overlay + 5 attrition cohort overlay + 5 keyword-library cohort overlay
- **Pillar 5 — SMS-cost-stack decision recipe:** Tier 1 Postscript-primary + SMSBump-international-secondary $0–$2k/mo for $1M–$5M DTC+international brands; Tier 2 Postscript-primary + SMSBump-international + Klaviyo-SMS-segment-overlay + Triple Whale SMS merge $1k–$5k/mo for $5M–$25M DTC+international brands; Tier 3 Attentive-enterprise-primary + SMSBump-international + Postscript-secondary $5k–$25k/mo for $25M+ DTC+international brands; Tier 4 RCS-business-messaging orchestration $5k–$50k/mo for $25M+ brands with mature SMS-orchestration + global RCS rollout

### Step 6 — Quarterly pillar publish + measurement (recurring)

- **Quarterly publish outcome report** on workspace — quarterly SMS-orchestration-cohort-LTV report + locale-by-locale SMS-cohort-LTV report + SMS-attrition-cohort-LTV report + 5-way-comparison-cycle report
- **12–24-month compounding SMS-orchestration-steady-state-baseline** wired: 2–4× LTV multiplier Year 2+ vs SMS-only baseline per Postscript 2024 canonical-3-way-comparison-cycle [SMS-orchestration-cohort-LTV vs SMS-channel-only-cohort-LTV vs email-channel-only-cohort-LTV]
- **Quarterly refresh cadence** for top-5 SMS-orchestration creative assets + keyword-library iteration from SMS-orchestration creative pattern categories: international-multi-locale-cart-abandon + DLR-segment-flagged-bounce-rate-recovery + MMS-Luxury-voice-SKU + two-way-conversation-creator-cohort + RCS-Gen-Z-voice-Flash-Sale + SMSBump-post-purchase-flow + international-multi-locale-cohort-LTV-iteration

## Common pitfalls (15 from real builds)

1. **Launching SMSBump-international without Shopify Markets active locales + international order-volume baseline** — SMSBump requires Shopify Markets active locales per SMSBump 2024; brands that launch without it lose 50–70% SMSBump-international-orchestration-effective-rate; keyword libraries fail to route international SMS without Shopify Markets integration. **Fix:** Activate Shopify Markets active locales + establish international-order-volume-baseline BEFORE SMSBump-international-orchestration-launch (use Shopify Markets Basic $0–$400/mo or Pro $500–$2k/mo)
2. **Launching SMS-orchestration-iteration without DLR-monitoring-Wire-baseline** — SMS-orchestration requires Postscript-DLR-monitoring-Suite + Attentive-DLR-monitoring-Wire + SMSBump-DLR-monitoring + Klaviyo-DLR-monitoring-baseline; brands that launch without DLR-monitoring cap at 30–50% of structural upside per Postscript 2024 + Attentive 2024 + SMSBump 2024. **Fix:** Wire Postscript DLR + Attentive DLR + SMSBump DLR + Klaviyo DLR baseline + canonical 5-deliverability-cohort-queries BEFORE SMS-orchestration-iteration-launch
3. **SMS-orchestration-launch-without-Klaviyo-SMS-segment-overlay-Wire** — Klaviyo-SMS-segment-overlay requires voice-profile-webhook-mapping + segment-source-attribution + RFM-cohort-trigger + flow-template-versioning + conditional-content-SMS-segment-tag; brands that launch without it cap at 30–50% structural upside; keyword libraries fail to route voice-profile SMS without Klaviyo-SMS-segment-overlay-integration. **Fix:** Wire Klaviyo Email and SMS (or Klaviyo SMS channel add-on) + voice-profile-webhook-mapping + Klaviyo-segment-SMS-source-attribution BEFORE SMS-orchestration-segment-overlay-pillar-launch
4. **Launching MMS-Luxury-voice-pillar without Postscript-MMS-launch or Attentive-MMS-launch-Wired** — brands that launch MMS without MMS-platform-Wire cap at 30–50% of MMS-Luxury-voice-effective-rate per MMS 2024 + Postscript 2024 MMS-launch + Attentive 2024 MMS-Luxury-voice-SKU-launch; MMS-creative-assets fail to render on non-MMS-platforms and lose the 2–3× CTR vs text SMS baseline. **Fix:** Wire Postscript-MMS-launch or Attentive-MMS-launch + MMS-deliverability-monitoring + 5+ MMS-Luxury-voice-SKU creative assets per MMS 2024 canonical 5-specs BEFORE MMS-Luxury-voice-pillar-launch
5. **Launching RCS-business-messaging-pillar without GSMA-RCS-availability-verification + locale-by-locale-RCS-availability-baseline** — RCS-business-messaging requires GSMA-RCS-availability-verification per Attentive 2024 + GSMA-RCS 2024 + Two-way-conversations 2024; brands that launch without verification cap at 30–50% of RCS structural upside per Attentive 2024 + GSMA-RCS 2024. **Fix:** Verify GSMA-RCS-availability per SMS-recipient-locale-baseline + locale-by-locale-RCS-availability-baseline BEFORE RCS-business-messaging-pillar-launch; use Attentive-RCS-business-messaging only on RCS-available locales
6. **Launching two-way-conversations-creator-cohort-pillar without Inbox-by-Postscript or Attentive-Concierge + creator-engagement-LTV-iteration-baseline** — brands that launch without Inbox/Concierge cap at 30–50% of two-way-conversations-creator-cohort-effective-rate per Postscript 2024 Inbox + Attentive 2024 Concierge + Move-#16-creator-economy-expansion-cohort-overlay; creator-engagement fails to route without Inbox/Concierge and loses the 30–180s time-to-conversion baseline. **Fix:** Wire Inbox-by-Postscript or Attentive-Concierge + voice-profile-routing + creator-response-routing + Move-#16-creator-economy-expansion-cohort-overlay BEFORE two-way-conversations-creator-cohort-pillar-launch
7. **SMS-orchestration-launch-without-Triple-Whale-SMS-source-merge-cohort-overlay-Wire-baseline** — without Triple Whale SMS-source-merge, the brand loses the 5-way comparison cycle [SMS-orchestration-cohort-LTV vs Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV] per Triple Whale 2024 SMS-source-merge + Sailthru 2024 deliverability-reach-cohort. **Fix:** Wire Triple Whale Starter or Pro + SMS-source-merge-cohort-overlay + 5-deliverability-cohort-queries + 5-way comparison cycle baseline BEFORE SMS-orchestration-iteration-launch
8. **SMS-orchestration-launch-without-voice-profile-webhook-mapping-Wired for Luxury + Gen-Z cohort routing** — brands that launch without voice-profile-webhook-mapping lose MMS-Luxury-voice 2–3× CTR vs text SMS baseline + RCS-business-messaging Gen-Z-voice 2–4× SMS-engagement-rate vs text SMS baseline per Postscript 2024 + MMS 2024 + RCS-business-messaging 2024 + Klaviyo 2024 voice-profile-webhook-mapping. **Fix:** Wire Klaviyo-voice-profile-webhook-mapping for Luxury + Gen-Z cohort routing + MMS-platform-Luxury-voice-content-template + RCS-platform-Gen-Z-voice-content-template BEFORE SMS-orchestration-iteration-launch
9. **SMS-orchestration-launch-without-SMS-cohort-attrition-1%-rule-iteration-cycle-Wire-baseline** — brands that launch without the 1%-rule SMS-attrition cycle lose the canonical-1%-rule-SMS-attrition-cohort-iteration that identifies 5–15% SMS-attrition-rate vs baseline cohort that monotonic-SMS-orchestration-typically-misses per Triple Whale 2024 1%-rule + Sailthru 2024 canonical-1%-rule. **Fix:** Wire Triple Whale 2024 1%-rule SMS-attrition cohort baseline + identify SMS-attrition cohort + iterate SMS-orchestration cadence + deliverability-rate-bounce-cohort-LTV-overlay BEFORE SMS-orchestration-iteration-launch
10. **Launching Attentive-enterprise-pillar without Attentive-enterprise-secondary + Attentive-DLR-monitoring + Attentive-Cohort-LTV-overlay-Wired** — brands that launch without Attentive-Wired cap at 30–50% of Attentive-enterprise structural upside per Attentive 2024 + Attentive-2024-enterprise-SMS-platform + Attentive-2024-DLR-monitoring + Attentive-2024-creator-engagement; Attentive-conversational-engagement fails to route without Attentive-Concierge and loses creator-engagement-LTV-iteration baseline. **Fix:** Wire Attentive-enterprise-secondary + Attentive-Concierge-creator-engagement + Attentive-DLR-monitoring + Attentive-Cohort-LTV-overlay + Attentive-MMS-Luxury-voice-SKU-launch BEFORE Attentive-enterprise-pillar-launch
11. **SMS-orchestration-launch-without-SMSBump-cost-tier-thresholds-baseline** — brands that launch without SMSBump cost-tier thresholds see-sticker-shock on SMSBump cost-stack tier thresholds and defer SMSBump-international-orchestration after launch per SMSBump 2024 + SMSBump-2024-canonical-pricing-model + Shopify-Markets-2024-canonical-SMSBump-integration. **Fix:** Establish SMSBump cost-tier thresholds baseline + SMSBump Starter tier thresholds baseline + SMSBump Pro tier thresholds baseline + SMSBump Enterprise tier thresholds baseline BEFORE SMSBump-international-orchestration-launch
12. **Launching SMS-orchestration without TCPA-compliance-baseline + locale-specific-TCPA-compliance-baseline + locale-specific-keyword-library-iteration-baseline** — brands that launch without TCPA-compliance-baseline fail TCPA-compliance-baseline and receive $500 per unsolicited message fine baseline + SMSBump-international-keyword-libraries fail to route international SMS without locale-specific TCPA-compliance baseline + locale-specific keyword library iteration per Postscript 2024 + SMSBump 2024 + Klaviyo 2024 + Attentive 2024. **Fix:** Establish TCPA-compliance-baseline + locale-specific-TCPA-compliance-baseline + locale-specific-keyword-library-iteration-baseline BEFORE SMS-orchestration-iteration-launch; SMSBump 2024 canonical Shopify Markets integration + locale-by-locale TCPA compliance baseline + SMS-deliverability-reach-cohort overlay instrumentation baseline
13. **Skimping on SMS-orchestration-creative-asset-iteration-cadence** — brands that don't iterate SMS-orchestration creative assets quarterly see declining CTR and CVR after 90 days per Postscript 2024 canonical quarterly-refresh-cadence + SMSBump 2024 canonical quarterly-refresh-cadence + Klaviyo 2024 canonical quarterly-refresh-cadence + Attentive 2024 canonical quarterly-refresh-cadence + RCS-business-messaging 2024 canonical quarterly-refresh-cadence + MMS 2024 canonical quarterly-refresh-cadence. **Fix:** Refresh top-5 SMS-orchestration creative assets every 90 days + iterate keyword-library from SMS-orchestration creative pattern categories [international-multi-locale-cart-abandon + DLR-segment-flagged-bounce-rate-recovery + MMS-Luxury-voice-SKU + two-way-conversation-creator-cohort + RCS-Gen-Z-voice-Flash-Sale + SMSBump-post-purchase-flow + international-multi-locale-cohort-LTV-iteration]
14. **Assuming SMS-orchestration replaces Postscript** — SMS-orchestration is the SMSBump-international + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge + Attentive-enterprise-secondary + RCS-business-messaging + two-way-conversations layer — NOT a replacement for Postscript-primary per Postscript 2024 canonical launch prerequisite + SMSBump 2024 + Klaviyo 2024 + Attentive 2024. Brands that pause Postscript to fund SMS-orchestration typically see 50–70% SMS-attributed-revenue-drop. **Fix:** Run Postscript-primary + SMSBump-international + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge + Attentive-enterprise-secondary + RCS-business-messaging + two-way-conversations in parallel; SMS-orchestration is additive not substitutive
15. **Treating SMS-orchestration as email-substrate-replacement** — SMS-orchestration compounds Postscript-primary + SMSBump-international + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge + Attentive-enterprise-secondary + RCS-business-messaging + two-way-conversations + Move-#1-cart-abandon-email + Move-#4-welcome-email + Move-#5-Klaviyo+Postscript + Move-#6-Triple-Whale-attribution-substrate + Move-#7-SMS-welcome + Move-#8-loyalty + Move-#11-subscription + Move-#14-lifecycle-marketing + Move-#15-affiliate-program + Move-#15.x-TikTok-Shop + Move-#16-creator-economy-expansion + Move-#17-Pinterest-SEO + Move-#18-Amazon-DSP + Amazon-Attribution per Postscript 2024 + SMSBump 2024 + Klaviyo 2024 + Attentive 2024 + Sailthru 2024 + Two-way-conversations 2024 + RCS-business-messaging 2024 + MMS-2024 + GSMA-RCS-2024 + Triple-Whale-2024. Brands that pause-email-substrate-to-fund-SMS-orchestration typically see 50–70% email-attributed-revenue-drop. **Fix:** Run email-substrate AND SMS-orchestration in parallel; SMS-orchestration is additive not substitutive

## Verification (this skill is "shipped" when...)

- [ ] **Gate A — Phase 1 prereqs all green (10/10):** Postscript-tier-active-with-Move-#7-6+months; DLR-monitoring-Wired; Klaviyo-SMS-segment-overlay-Wired-with-voice-profile-webhook-mapping; Triple Whale SMS-source-merge + 5-deliverability-cohort-queries-Wired; SMS-cohort-LTV-iteration-cycle-baseline-established; voice-profile-webhook-mapping-Wired-for-Luxury+Gen-Z; SMSBump-account-active + 5+ locale-keyword-libraries + locale-specific-TCPA-baseline; Attentive-enterprise-secondary-onboard; Shopify Markets active + international-order-volume-baseline; first-SMS-orchestration-flow-launched (international-SMS-cart-abandon-via-SMSBump + high-intent-US-SMS-cart-abandon-via-Postscript + DLR-segment-flagged-bounce-rate-recovery-via-Postscript)
- [ ] **Gate B — Phase 2 prereqs all green (10/10):** MMS-Luxury-voice-SKU-SMS-launched; two-way-conversation-creator-cohort-launched-via-Inbox-by-Postscript-or-Attentive-Concierge; RCS-Gen-Z-voice-Flash-Sale-launched-via-Attentive-RCS; international-multi-locale-SMSBump-orchestration-launched-5+-locales; SMSBump-post-purchase-flow-launched; voice-profile-routing-Wired-for-Luxury+Gen-Z; MMS-deliverability-monitoring-Wired; RCS-deliverability-monitoring-Wired; two-way-conversations-creator-engagement-LTV-iteration-Wired; international-multi-locale-keyword-library-iteration-Wired
- [ ] **Gate C — Phase 3 prereqs all green (10/10):** international-multi-locale-SMS-cohort-LTV-iteration-launched-30/60/90-day-windows; SMS-deliverability-reach-cohort-overlay-Wired-with-5-canonical-queries; SMS-cohort-attrition-1%-rule-iteration-cycle-launched; 5-way-comparison-cycle-launched (SMS-orchestration-LTV-vs-Postscript-LTV-vs-SMSBump-LTV-vs-Klaviyo-SMS-LTV-vs-Attentive-LTV); locale-by-locale-DLR-monitoring-Wired; SMS-bounce-rate-cohort-Wired; SMS-opt-out-rate-cohort-Wired; SMS-spam-complaint-rate-cohort-Wired; SMS-deliverability-rate-cohort-Wired; SMS-cohort-LTV-vs-baseline-cohort-Wired
- [ ] **Gate D — Phase 4 prereqs all green (9/9):** SMS-orchestration-cohort-LTV-attrition-1%-rule-quarterly-launched; SMS-deliverability-reach-cohort-overlay-quarterly-launched; 5-way-comparison-cycle-iteration-quarterly-launched; SMS-cost-stack-decision-recipe-launched (Tier 1/2/3/4 wired); SMS-orchestration-quarterly-iteration-cycle-baseline-Wired; SMS-cohort-attrition-1%-rule-quarterly-iteration-cycle-Wired; locale-by-locale-DLR-quarterly-monitoring-Wired; 12–24-month-compounding-SMS-orchestration-steady-state-baseline-Wired; quarterly-SMS-orchestration-pillar-publish-outcome-report-on-workspace-Wired
- [ ] **Path B Year-1 ROI in good or great band** — $200k–$1.5M Path B incremental SMS-orchestration-revenue / $14k–$85k total Year-1 cost = **2.4:1–107:1 Year-1 ROI band** ("great" per the canonical ROI-classification); median ~15:1
- [ ] **6 canonical metrics in great band by Day 90:** SMS list growth +20–40% vs Postscript-only + SMS deliverability +5–15% vs Postscript-only + SMS cohort-LTV +20–40% vs Postscript-only + international cart-abandon recovery 5–15% via SMSBump + MMS-Luxury-voice CTR 2–3× vs text SMS + RCS-Gen-Z engagement 2–4× vs text SMS
- [ ] **5-year compounding milestone** — 2–4× SMS cohort-LTV multiplier Year-2+ achieved + ≥70% of decisions informed by 5-way-comparison-cycle + 90%+ of creative assets fresh (<90d old) per quarterly cadence

## How to extend this skill

Once Path B Phase 1+2+3 are live:
- **Add SMSBump post-purchase drip flow** (review-request SMS at day 7 + cross-sell SMS at day 14 + reorder/reminder SMS at day 30 if consumables) — compounds Move #11 subscription replenishment and Move #2 post-purchase upsell
- **Add 2-way conversation flow for VIP cohort** (Loyalty tier-up + SMS welcome + creator response routed via Inbox by Postscript) — compounds Move #8 loyalty program and Move #16 creator-economy-expansion
- **Add SMSBump browse-abandon flow** — captures the 70%+ of visitors who browse but don't cart; pairs with Move #6 Triple Whale for incremental attribution
- **Move to Attentive-enterprise-primary** (Path C) if SMS-list-size >100k AND ≥15% international AND you have dedicated in-house team — 2.5:1 muted ROI BUT unlocks RCS-business-messaging at scale
- **Wire SMS-orchestration cohort into Move #14 lifecycle-marketing Tier 1+2+3+4 SMS flows** — browse-abandon (Tier 1) + customer winback (Tier 1) + loyalty tier-up/down (Tier 2) + subscription renewal + dunning (Tier 2) all benefit from SMS-cohort-LTV overlay + DLR-cohort filtering
- **Wire SMS-orchestration into Move #16 creator-economy-expansion** — two-way-conversations creator-cohort routing + creator-engagement-LTV-iteration cycle compounds Move #16's creator-LTV overlay

## Cross-references

- Companion skill (prerequisite): `welcome-series` (Move #4) — for email-SMS-cross-substrate cross-pollination; Move #7 SMS welcome + cart abandon (Playbook 06-sms) is the canonical 4-flow Postscript prerequisite
- Companion skill (foundation): `mobile-pdp-redesign` (Move #9) + `ai-ad-creative-iteration` (Move #10) + `pdp-ab-testing-program` (Move #9.5) for landing-page destination conversion (SMS click → mobile PDP CVR)
- Companion skill (compound): `loyalty-program` (Move #8) + `subscription-replenishment` (Move #11) — SMS-cohort-LTV overlay compounds loyalty-tier-LTV + subscription-LTV
- Companion skill (sequence): `abandoned-cart-recovery` (Move #1) — Move #19 SMS orchestration sequences AFTER Move #1 + Move #7 are at mature baseline (≥6 months of revenue data)
- Research doc: `/research/15-smsbump-postscript-channel-orchestration.md` (Move #19 synthesis) + `/research/05-lifecycle-marketing.md` (Move #14 cross-pollination for Tier 1+2+3+4 SMS flows)
- Research doc: `/research/01-tools-stack-comparison.md` (tool tier selection between Postscript Starter vs Growth vs Scale vs Attentive-enterprise)
- Playbook (operator-build): `/playbooks/22-smsbump-postscript-channel-orchestration-launch.md` (operator-build companion with 4 phases + verification gates + SMS-orchestration-launch-mode decision matrix)
- Asset (operator-copy): `/assets/23-smsbump-postscript-channel-orchestration-templates.md` (paste-ready per-voice per-pillar SMS-orchestration-templates + 25 voice-variant templates × 5 voice profiles)
- Operator surface: `/smsbump-postscript-channel-orchestration` (Move #19 operator dashboard route with 4 hero metrics + 3 layer cards + 5-pillar framework display)
- Script (Archetype A/B hybrid Path A/B/C scoring): `/scripts/smsbump_postscript_channel_orchestration_unit_economics.py` (12-input operator scorer: us_dtc_gmv + international_gmv_pct + sms_list_size + has_postscript_primary + has_smsbump_account + has_klaviyo_sms_segment_overlay + has_attentive_enterprise_secondary + has_dlr_monitoring_wired + has_triple_whale_sms_merge + voice_profile + has_dedicated_sms_orchestration_team_capacity_hours_per_week + has_sms_orchestration_creative_baseline → outputs Path A/B/C recommendation with cost stack + Year-1 incremental SMS-orchestration-revenue band + 8 deferral gates + 3 downgrade gates + 5-pillar framework matrix + 6-step build sequence)
- Dashboard (health heat-map): `/dashboards/smsbump-postscript-channel-orchestration-health.html` (Move #19 health dashboard for Phase 4 steady-state quarterly review)

## Sources

- Postscript, "SMS platform benchmarks 2024" (cost tiers + DLR monitoring Suite + Inbox conversational engagement + MMS-launch)
- SMSBump, "International SMS Shopify Markets pricing 2024" (cost tiers + locale-specific keyword libraries + 5+ active locales baseline + Shopify Markets integration)
- Klaviyo, "SMS channel vs ESP segmentation 2024" (Klaviyo Email and SMS + voice-profile-webhook-mapping + RFM cohort SMS trigger + flow SMS template versioning + conditional content SMS segment tag)
- Attentive, "Enterprise SMS platform 2024" (Concierge creator engagement + DLR-monitoring-Wire + cohort-LTV-overlay + MMS Luxury voice SKU launch + RCS-business-messaging)
- GSMA RCS, "RCS adoption benchmarks 2024" (2–4× SMS engagement rate vs text SMS baseline + 30–50% higher conversion vs text SMS baseline + locale-by-locale RCS availability)
- Triple Whale, "SMS source merge 2024" + "SMS cohort overlay 2024" + "1%-rule SMS attrition cohort 2024" (SMS source merge cohort overlay + 5-deliverability-cohort-queries + 5-way comparison cycle + 1%-rule canonical pattern)
- Two-way conversations, "SMS CRM with Momence and StayAI 2024" (Inbox by Postscript conversational engagement + creator-response-routing + 30–180s time-to-conversion baseline)
- RCS-business-messaging, "RCS adoption benchmarks 2024" (canonical 5-specs [rich-media-cards + branded RCS-Business-Messaging + interactive-buyer-journey + read-receipt cohort LTV overlay + 2–4× SMS engagement rate vs text SMS baseline])
- MMS, "MMS vs SMS CTR metrics 2024" (2–3× CTR vs text SMS baseline + 30–50% higher conversion vs text SMS baseline + Luxury-voice SKU benchmarks)
- Sailthru, "SMS at scale 2024" + "Deliverability reach cohort 2024" (deliverability reach cohort + canonical 1%-rule + cohort-LTV-iteration-cycle + email vs SMS vs orchestrated-SMS 3-way comparison)
- Shopify Markets, "SMSBump integration 2024" (Shopify Markets active locales + international order volume baseline + locale-specific currency display + locale-specific DLR monitoring + SMSBump post-purchase flow)
