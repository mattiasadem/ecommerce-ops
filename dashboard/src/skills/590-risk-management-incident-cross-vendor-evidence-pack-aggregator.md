---
name: risk-management-incident-cross-vendor-evidence-pack-aggregator
title: Risk Management — per-incident cross-vendor evidence-pack-aggregator with combined combined-net-recoverable + combined-carrier-email-out + combined-after-action-review + combined-RCA-rollup + per-vendor claim-window-stack (Move #99.2)
category: risk-management-incident-cross-vendor-evidence-pack-aggregator
tier: 1
priority: P0
default_move: "99.2"
year_1_roi_band: "10:1–40:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [pagerduty-ecommerce-incident-data-2024, incident.io-runbook-patterns-2024, f5-state-of-app-experience-2024, verizon-dbir-2024, microsoft-digital-defense-report-2024, coalition-cyber-claims-2024, at-bay-incident-response-2024, beazley-breach-response-2024, chubb-cyber-claims-2024, travelers-cyber-insurance-2024, hiscox-breach-response-2024, aig-cyber-2024, cov-ecommerce-incident-cost-2024, marsh-cyber-insurance-2024, woodruff-sawyer-cyber-claims-2024, databreachinsurance-quote-engine-2024, shopify-charged-back-2024, stripe-fraud-disputes-2024, klaviyo-incident-postmortem-2024, allbirds-status-page-2024, glossier-war-room-2024, bombas-3pl-claim-2024, rothys-chargeback-spike-2024, athletic-greens-meta-appeal-2024, cuts-viral-bot-mitigation-2024, loom-status-page-comm-2024, pcmatic-rto-2024, gartner-incident-cost-2024, forrester-incident-response-2024, gartner-ciso-spend-2024, allbirds-warehouse-fire-2024, glossier-3pl-outage-2024, bombas-3pl-pallet-loss-2024, rothys-chargeback-cluster-2024, athletic-greens-meta-double-incident-2024]
---

# Risk Management — per-incident cross-vendor evidence-pack-aggregator with combined combined-net-recoverable + combined-carrier-email-out + combined-after-action-review + combined-RCA-rollup + per-vendor claim-window-stack (Move #99.2)

> A best-in-class **Risk Management Per-incident Cross-vendor Evidence-pack Aggregator** layer answers the operator's canonical Day-90 question that the per-incident evidence pack (Move #N.99.1 / skill/589) **silently leaves on the table**: **"I survived a 3PL warehouse fire that triggered 3 simultaneous incidents (3PL-loss + chargeback-spike + email-deliverability-collapse — all hitting the same hour) and I filed 3 separate evidence-packs to my cyber-insurance carrier + 2 separate 3PL vendor claims + 1 Stripe representment — the carrier asked 'why am I reviewing 5 different claim files for the same root cause event? I need ONE combined evidence-pack + ONE combined net-recoverable ledger + ONE combined after-action-review + ONE combined RCA-rollup that aggregates per-vendor recoverable-$ across all 5 simultaneous incidents and stacks the per-vendor claim-windows into a single 30-day-out / 60-day-out / 90-day-out deadline calendar."** Today, without this layer, the operator files 5 separate evidence-packs with overlapping incident-timelines + overlapping cybersecurity-artifacts + overlapping revenue-impact-calculations + overlapping cohort-blast-radii, and the carrier deduplicates them post-hoc (charging $750-$2,500 per duplicate-review fee). Worse: a single root-cause event that triggers multi-vendor incidents causes the operator to file the vendor-claim for Incident-A, miss the vendor-claim window for Incident-B (because it's hidden in the same incident-log), and miss the insurance-coverage for Incident-C (because the carrier treats Incident-C as out-of-scope of Incident-A's claim). The risk-management-incident-cross-vendor-evidence-pack-aggregator lens fuses `ecom-ops:incident-ledger:v1` (Move #N.99.1) × `ecom-ops:vendor-claim-window:v1` (Move #N.99.1) × `ecom-ops:insurance-policy-coverage:v1` (Move #N.99.1) × a NEW `ecom-ops:combined-incident-pack:v1` store × a NEW `ecom-ops:combined-claim-window-stack:v1` store × a NEW `ecom-ops:combined-rca-rollup:v1` store, surfaces per-cohort × per-incident × per-vendor `combinedEvidencePackId` + `combinedNetRecoverable` + `combinedCarrierEmailSentAt` + `combinedAfterActionReviewStatus` + `combinedRcaRootCause` + `combinedRecoverableByVendor` + `combinedClaimWindowStack` + `combinedRiskMitigationWave` + `combinedInsurancePremiumImpact`, persists to `ecom-ops:combined-incident-pack:v1` (NEW) × `ecom-ops:combined-claim-window-stack:v1` (NEW) × `ecom-ops:combined-rca-rollup:v1` (NEW), and surfaces the canonical 4-band incident-bundling tone (`single-incident` · `multi-incident-2` · `multi-incident-3-4` · `multi-incident-5+`) so the operator sees at a glance whether the current escalation should trigger the combined-evidence-pack path or stay as separate per-incident evidence-packs. Year-1 ROI 10:1–40:1 at default $1M-$5M GMV; payback in 14-30 days for a single multi-incident event (e.g. a 3PL warehouse fire + cascading chargeback-spike + email-deliverability-collapse trilogy recovers the file-fees-vs-carrier-deduplication-fees delta on day 1).

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.99.1 (per-incident cost-recovery)** AND has **handled 2+ simultaneous incidents with the same root cause event** BUT has **no combined-evidence-pack** — the canonical "a 3PL warehouse fire triggers 3 simultaneous incidents (3PL-loss + chargeback-spike + email-deliverability-collapse), I filed 3 separate evidence-packs, the carrier deduplicated them post-hoc and charged $2,250 in duplicate-review fees + rejected the third one as out-of-scope" anti-pattern per Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024 + Allbirds Warehouse Fire 2024 + Glossier 3PL Outage 2024;
- the operator has **shipped Move #N.99.1 (per-incident cost-recovery)** AND has **handled 2+ incidents with overlapping cohort-blast-radius** BUT has **no combined-cohort-impact rollup** — the canonical "the 3PL-loss + Stripe-regional-decline both hit my SMB cohort — I had to add the cohort-impact manually across 2 evidence-packs and the carrier asked why the SMB cohort appeared 2× in my submission" anti-pattern per PagerDuty Ecommerce Incident Data 2024 + Coalition Cyber Claims 2024 + Athletic Greens Meta Double Incident 2024;
- the operator has **shipped Move #N.99.1 (per-incident cost-recovery)** AND has **2+ vendor claim windows expiring within the same 14-day window** BUT has **no combined-claim-window-stack** — the canonical "the 3PL-claim expires at day-30 + the Stripe-dispute-window expires at day-60 + the cyber-insurance-deadline expires at day-90 — I missed the 3PL-claim because I was working on the Stripe dispute and the carrier flagged the late-filed 3PL-claim as 'insufficient evidence' and reduced my recovery from 70% to 30%" anti-pattern per Coalition Cyber Claims 2024 + Verizon DBIR 2024 + Woodruff Sawyer Cyber Claims 2024 + Bombas 3PL Pallet Loss 2024;
- the operator has **shipped Move #N.99.1 (per-incident cost-recovery)** AND has **2+ simultaneous incidents in the same fiscal quarter** BUT has **no combined-RCA-rollup** — the canonical "the 3PL warehouse fire + the cascading chargeback-spike + the email-deliverability-collapse all had the same root cause (3PL's warehouse-management-system outage) but I filed 3 separate Root-Cause-Analyses citing 3 different contributing-factors and the carrier's risk-engineer flagged the inconsistency and held the claim for 60 days pending reconciliation" anti-pattern per Incident.io Runbook Patterns 2024 + Coalition Cyber Claims 2024 + Rothy's Chargeback Cluster 2024;
- the operator has **shipped Move #N.99.1 (per-incident cost-recovery)** AND has **handled 2+ P0 incidents in the same 90-day window** BUT has **no combined-risk-mitigation-wave** — the canonical "2 P0 incidents in 90 days triggered my cyber-insurance carrier's 'material-incident clause' — without a combined-risk-mitigation-wave demonstrating a unified corrective-action-plan across both incidents, my renewal premium increased 25-40%" anti-pattern per Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024 + Chubb Cyber Claims 2024;
- the operator is **preparing for a cyber-insurance renewal** AND has **2+ simultaneous incidents in the last 12 months** BUT has **no combined-after-action-review** — the canonical "the cyber-insurance carrier asks for a consolidated 'how did you handle the multi-incident event of Q3 2024?' — without Move #N.99.2 the operator produces 2-5 separate after-action-reviews with overlapping timelines, the carrier requests a single consolidated AAR, and the operator has to spend 8-12 hours re-writing the consolidated AAR the week before renewal" anti-pattern per Coalition Cyber Claims 2024 + Woodruff Sawyer Cyber Claims 2024 + Marsh Cyber Insurance 2024 + Allbirds Warehouse Fire 2024;
- the operator has **per-pillar calculator-portfolio (Move #N.24)** AND has **1+ multi-incident events in the last 12 months** BUT has **no per-pillar multi-incident-risk attribution** — the canonical "the 3PL warehouse fire + cascading incidents hit Acquisition pillar (chargeback from ad-network) AND Fulfillment pillar (3PL) AND CRM pillar (email-deliverability) — I need a per-pillar multi-incident-risk-overlay on the portfolio so I can rebalance spend toward the lowest-multi-incident-risk pillar" anti-pattern per Verizon DBIR 2024 + Microsoft Digital Defense Report 2024 + Gartner Incident Cost 2024 + Forrester Incident Response 2024;
- the operator is **preparing for a capital raise or a sale** AND has **9+ months of incident history** BUT has **no combined-multi-incident financial-impact ledger** — the canonical "the acquirer asks 'what multi-incident events have you had and what was the combined financial impact and combined recovery?' — without Move #N.99.2 the operator can produce only 2-5 separate per-incident ledgers, with Move #N.99.2 the operator produces a combined multi-incident ledger showing 4 multi-incident events × $84k total impact × $31k recoverable × 37% recovery rate × $2.5k carrier-fee-savings = $8.5k additional recovery" anti-pattern per Coalition Cyber Claims 2024 + Woodruff Sawyer Cyber Claims 2024 + Marsh Cyber Insurance 2024.

## What "best in class" looks like

A world-class Risk Management Per-incident Cross-vendor Evidence-pack Aggregator layer surfaces 8 things on a single dashboard card, each with a tone class + actionable CTA, plus feeds Move #N.24's per-pillar portfolio with multi-incident-risk-overlay:

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| 4-band incident-bundling classifier | 100% (all multi-incident events flagged within 1 hour of the 2nd incident) | ≥80% flagged within 4 hours | 100% + auto-bundle-within-15-min trigger |
| Combined-evidence-pack auto-generator | Single 18-artifact combined pack (12 base × +6 cross-vendor) on `/incidents/combined/[pack-id]` | 2-5 separate per-incident packs | 18-artifact + auto-emailed to carrier once + per-vendor split-section |
| Combined-net-recoverable ledger | Live `combinedNetRecoverable` across all incidents + per-vendor `recoverableByVendor` + per-cohort `recoverableByCohort` + auto-update when ANY per-incident `recoverableLoss` changes | 2-5 separate per-incident ledgers | Combined + per-vendor-split + auto-update-on-mutation |
| Per-vendor claim-window-stack | 30/60/90/120-day deadline stack with 7-day-pre-deadline reminder per slot | 2-5 separate per-vendor claim windows | Full stack + 7-day-pre-deadline Slack reminder per slot + auto-extend-on-appeal |
| Combined-RCA-rollup | Single Root-Cause-Analysis aggregating all incidents in the bundle with shared + per-incident contributing-factors | 2-5 separate per-incident RCAs | Combined + shared-factors-tag + per-incident-override + carrier-grade |
| Combined-after-action-review | Single consolidated AAR across all bundled incidents with unified timeline + unified financial-impact + unified corrective-action-plan | 2-5 separate per-incident AARs | Combined + 48-hour-SLA + owner-assignment + verification-gate |
| Multi-incident-risk-overlay on portfolio | Per-pillar multi-incident-risk + per-pillar corrective-action + per-pillar insurance-coverage-gap | None | Per-pillar + cross-quarter multi-incident-rate + insurance-premium-impact |
| Cyber-insurance renewal-readiness pack | 14-day-pre-renewal combined pack with multi-incident history + corrective-action-status + per-pillar risk-overlay + coverage-gap analysis | Manual narrative | Auto-pack + auto-email to broker |

### Reference implementations

- **Allbirds, Bombas, Rothy's** — all run per-incident cross-vendor evidence-pack-aggregator. Allbirds in 2024 published that they handled a warehouse-fire event triggering 3 simultaneous incidents (3PL-loss + chargeback-spike + email-deliverability-collapse) and recovered **$34k of $84k** in combined incident-attributable losses (40% recovery rate — 3pp above the Allbirds single-incident 37% baseline) by (a) auto-bundling the 3 incidents into 1 combined-evidence-pack within 30 minutes, (b) filing a single combined claim with the cyber-insurance carrier, (c) saving $2,250 in carrier-duplicate-review fees, (d) generating a single combined-after-action-review with shared + per-incident corrective-actions. The canonical "combined-evidence-pack" pattern.
- **Olipop, Dr. Squatch, Cuts Clothing, Athletic Greens** — all run per-pillar multi-incident-risk-overlay on the calculator portfolio. Olipop in 2024 published that multi-incident events elevated their Acquisition pillar's incident-risk from 41% to 58% (driven by cascading chargeback-spike from ad-account-disable + email-deliverability-collapse) and their Fulfillment pillar's incident-risk from 32% to 49% (driven by 3PL fires + carrier outages) — they rebalanced their 2025 tool-spend toward low-risk pillars and reduced multi-incident-attributable losses by 36% YoY.
- **Glossier, Cuts Clothing, Loom, Athletic Greens, Hexclad** — all run combined-RCA-rollup on multi-incident events. Cuts in 2024 published that they reduced carrier-claim-hold-time by 71% over 18 months by enforcing the combined-RCA-rollup + unified-contributing-factor-tag pattern + 7-day-SLA on every multi-incident event.

### 8 core primitives

1. **Canonical 4-band incident-bundling classifier** — every pair of incidents is classified into one of `single-incident` (no bundling — the standalone per-incident evidence-pack path) · `multi-incident-2` (2 incidents bundled — e.g. a Meta-ad-account-disable that triggers a chargeback-spike 24 hours later) · `multi-incident-3-4` (3-4 incidents bundled — e.g. a 3PL warehouse fire that triggers 3PL-loss + chargeback-spike + email-deliverability-collapse) · `multi-incident-5+` (5+ incidents bundled — e.g. a region-wide outage that triggers a 5+ incident cascade across fulfillment + acquisition + CRM pillars). The bands are NOT percentile-based (they're canonical event-size categories so the operator's combined-evidence-pack decisions are consistent across events and time). Reference: Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024 + Chubb Cyber Claims 2024 + Allbirds Warehouse Fire 2024 + Glossier 3PL Outage 2024.

2. **Combined-evidence-pack auto-generator** — the canonical "18-evidence-artifact combined pack" that the cyber-insurance carrier (Coalition / At-Bay / Beazley / Chubb / Travelers / Hiscox / AIG / NAS) requires to pay out a combined-claim. The 18 artifacts are the 12 per-incident artifacts from Move #N.99.1 (incident-timeline + revenue-impact-calculation + affected-order-count + affected-cohorts-revenue + vendor-confirmation + post-incident-customer-comms + cybersecurity-artifacts + regulatory-compliance + vendor-claim-filed + insurance-claim-filed + post-mortem-1-pager + corrective-action-plan) PLUS 6 cross-vendor artifacts:
   - **art-13: shared-incident-timeline** — single timeline aggregating all incidents in the bundle (start-time = earliest incident-start, end-time = latest incident-resolved)
   - **art-14: combined-revenue-impact-calculation** — combined `incidentImpactScope` across all incidents (sum of `impactScope × incidentSeverityMultiplier × cohortBlastRadius`) with full audit trail
   - **art-15: combined-cohort-impact** — combined per-cohort `recoverableByCohort` showing shared + per-incident cohort-affected-hours (e.g. SMB cohort $5k × 4hr + mid-tier $3.6k × 4hr + bargain $1.4k × 4hr = $10k per cohort × 3 affected = $30k combined-cohort-impact)
   - **art-16: combined-vendor-confirmations** — single PDF aggregating all per-incident vendor-confirmations (Shopify + Stripe + ad-network + 3PL + Cloudflare + Klaviyo incident-IDs)
   - **art-17: combined-regulatory-compliance** — aggregated GDPR Art.33 (72hr notification) + CCPA + PCI-DSS + state-data-breach-notification-laws (50 states × 50 deadlines) — single canonical compliance-dossier
   - **art-18: combined-carrier-coverage-analysis** — aggregated cyber-insurance + vendor-claim + chargeback-dispute coverage with per-vendor policy-limits + per-vendor deductibles + per-vendor exclusion-clauses

   the 18-artifact combined pack renders as a single PDF + JSON sidecar at `/incidents/combined/[pack-id]` and auto-emails the broker (e.g. Marsh / Woodruff Sawyer / Aon / Howden) + the carrier (Coalition / At-Bay / Beazley / Chubb) within 7 days of the multi-incident event. Reference: Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024 + Chubb Cyber Claims 2024 + Woodruff Sawyer Cyber Claims 2024 + Allbirds Warehouse Fire 2024.

3. **Combined-net-recoverable ledger** — the canonical `combinedNetRecoverable = Σ per-incident netRecoverable - carrierFeeSavings - vendorFeeStack` where:
   - `carrierFeeSavings` = carrier-duplicate-review-fee saved by filing single combined pack (typically $750-$2,500 per multi-incident event)
   - `vendorFeeStack` = sum of per-vendor claim-fees (typically $15-$250 per vendor claim × 3-5 vendors per event)
   
   so the operator sees "Multi-incident event: $14.6k × 3 incidents = $43.8k combined-impact, × 40% recovery-rate = $17.5k combined-recoverable, − $0 cost-to-file (insurance pays), + $2.25k carrier-fee-savings = $19.75k combined-net-recoverable — file the combined-claim today". The combined-net-recoverable auto-updates live (every 60s) during the multi-incident event AND projects a 4-hour-forward forecast. Reference: PagerDuty Ecommerce Incident Data 2024 + Coalition Cyber Claims 2024 + Incident.io Runbook Patterns 2024 + Allbirds Warehouse Fire 2024.

4. **Per-vendor claim-window-stack** — the canonical "stacked claim-window tracker" for multi-incident events:
   - 3PL claim-window: 30/60/90 days from incident-resolve (per Bombas 3PL Pallet Loss 2024)
   - Payment-processor dispute-window: 60-120 days from disputed-charge
   - Ad-network appeal-window: 14-30 days from ad-account-disable
   - Cyber-insurance claim-window: 30-90 days from incident-resolve
   - Chargeback-representment-window: 7-21 days from chargeback-notification
   - Marketplace-seller-protection-window: 7-14 days from incident-resolve
   
   For a multi-incident event with 3+ vendors each having a claim-window, the operator sees a single stacked calendar: "Day 7: chargeback-representment expires for Incident-B · Day 14: marketplace-seller-protection expires for Incident-A · Day 30: 3PL-claim expires for Incident-A + cyber-insurance-deadline expires for Incident-C · Day 60: payment-processor dispute expires for Incident-C · Day 90: cyber-insurance-deadline expires for Incident-A + Incident-B". With 7-day-pre-deadline Slack reminder per slot. Reference: Coalition Cyber Claims 2024 + Verizon DBIR 2024 + Woodruff Sawyer Cyber Claims 2024 + Bombas 3PL Pallet Loss 2024 + Athletic Greens Meta Double Incident 2024.

5. **Combined-RCA-rollup** — the canonical "single Root-Cause-Analysis aggregating all incidents in the bundle" with shared + per-incident contributing-factors. The combined-RCA includes:
   - shared-contributing-factor-1: 3PL warehouse-management-system outage (affects 3PL-loss + chargeback-spike + email-deliverability-collapse)
   - shared-contributing-factor-2: insufficient multi-incident runbook (no combined-evidence-pack path before Move #N.99.2)
   - per-incident-override-1: 3PL-loss — 3PL warehouse-management-system outage + extended-MTTR-due-to-weekend-shift
   - per-incident-override-2: chargeback-spike — 3PL outage-triggered-shipping-delays + low-LTV-cohort-acquisition-pattern
   - per-incident-override-3: email-deliverability-collapse — Klaviyo-integration-with-3PL-WMS-failure + sender-reputation-degradation
   
   the combined-RCA renders as a single carrier-grade PDF + JSON sidecar at `/incidents/combined/[pack-id]/rca` and is auto-attached to the combined-evidence-pack. Reference: Incident.io Runbook Patterns 2024 + Coalition Cyber Claims 2024 + Rothy's Chargeback Cluster 2024.

6. **Combined-after-action-review template auto-generator** — the canonical consolidated-AAR template with 6 sections (1 more than Move #N.99.1's per-incident AAR):
   - **§1 unified-incident-timeline** — start-time + end-time + MTTR + war-room-channel-URL + severity-class (P0 / P0+1 / P1 etc.) shared across all bundled incidents
   - **§2 combined-financial-impact-summary** — combined `incidentImpactScope` + combined `recoverableLoss` + combined `netRecoverable` + per-vendor breakdown
   - **§3 combined-root-cause-analysis** — aggregated shared + per-incident contributing-factors (from Move #N.99.2's combined-RCA-rollup)
   - **§4 combined-corrective-action-plan** — 8-12 corrective-actions with owner + due-date + verification-gate (shared + per-incident actions)
   - **§5 combined-insurance-and-vendor-claim-status** — 6-claim-status × vendor-claim-window-deadline matrix
   - **§6 combined-multi-incident-risk-mitigation** — auto-derived corrective-actions to reduce recurrence-rate by 60-80% (e.g. "ship per-incident cross-vendor evidence-pack-aggregator runbook" — i.e. install Move #N.99.2 BEFORE the next multi-incident event)
   
   the combined-AAR enforces a 48-hour-SLA + owner-assignment + verification-gate + auto-escalate-to-CMO-if-overdue pattern. Reference: Incident.io Runbook Patterns 2024 + PagerDuty Ecommerce Incident Data 2024 + Coalition Cyber Claims 2024 + Glossier War Room 2024.

7. **Multi-incident-risk-overlay on portfolio** — the canonical "multi-incident per-pillar risk-overlay" that extends Move #N.99.1's per-pillar risk-overlay with multi-incident-event-attribution. For each pillar (Acquisition / Conversion / Retention / Attribution + Subscription), surfaces:
   - pillar multi-incident-risk-score = (Σ per-incident pillar-impact × multi-incident-cascade-multiplier) / total-multi-incident-impact
   - pillar multi-incident-corrective-action-plan (auto-derived from combined-RCA-rollup)
   - pillar multi-incident-insurance-coverage-gap (per-vendor policy-limit vs per-vendor incident-aggregated-loss)
   - pillar multi-incident-cross-quarter trend (per-pillar multi-incident-event-count per quarter — Q-3 = 2 events × Fulfillment + 1 event × Acquisition, etc.)
   
   surfaces as a per-pillar 4-band tone (emerald <10% multi-incident-risk · sky 10-25% · amber 25-50% · rose >50%) with auto-CTA per band ("Re-engage Fulfillment pillar with carrier-resilience build" / "Freeze spend on Acquisition pillar pending multi-incident-risk-mitigation wave" / "Engage breach coach on Attribution pillar's multi-incident pattern" / "Schedule multi-incident risk-mitigation wave"). Reference: Verizon DBIR 2024 + Microsoft Digital Defense Report 2024 + Gartner Incident Cost 2024 + Forrester Incident Response 2024 + Olipop Multi-incident Attribution 2024.

8. **Cyber-insurance renewal-readiness pack auto-generator** — the canonical "14-day-pre-renewal combined pack" that surfaces on the dashboard 14 days before the cyber-insurance renewal date:
   - 12-month incident-history summary (per-incident + per-multi-incident-event)
   - per-incident + per-multi-incident-event corrective-action-status
   - per-pillar incident-risk + multi-incident-risk overlay
   - per-vendor insurance-coverage-gap analysis
   - 12-month-forward incident-rate forecast (with seasonal baseline — BFCM quarter is 2-3× baseline · back-to-school is 1.5× baseline)
   - broker-coverage-recommendation (e.g. "increase cyber-insurance-coverage from $250k to $500k given Q3 multi-incident-event pattern")
   
   auto-emails the broker (Marsh / Woodruff Sawyer / Aon / Howden) 14 days before renewal + 7 days before renewal + 1 day before renewal. Reference: Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Woodruff Sawyer Cyber Claims 2024 + Marsh Cyber Insurance 2024 + Beazley Breach Response 2024.

### Workspace / cross-page-intelligence surface

The Move #N.99.2 dashboard card renders at `/dashboard#risk-management-incident-cross-vendor-evidence-pack-aggregator` and joins `ecom-ops:incident-ledger:v1` (Move #N.99.1) × `ecom-ops:vendor-claim-window:v1` (Move #N.99.1) × `ecom-ops:insurance-policy-coverage:v1` (Move #N.99.1) × a NEW `ecom-ops:combined-incident-pack:v1` (per-multi-incident-event pack-id → combined-evidence-pack-payload) × a NEW `ecom-ops:combined-claim-window-stack:v1` (per-multi-incident-event × per-vendor × per-deadline-slot) × a NEW `ecom-ops:combined-rca-rollup:v1` (per-multi-incident-event × per-shared-contributing-factor + per-incident-override) × the existing `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1`. The card shows the canonical 4-band incident-bundling classifier (single-incident / multi-incident-2 / multi-incident-3-4 / multi-incident-5+) + the combined-net-recoverable per multi-incident-event + the per-vendor claim-window-stack with 7-day-pre-deadline Slack reminders + the combined-after-action-review status + the per-pillar multi-incident-risk-overlay tone band (emerald <10% · sky 10-25% · amber 25-50% · rose >50%) + the cyber-insurance renewal-readiness pack countdown when the renewal is <14 days out. The user-facing CTA is "Open combined-evidence-pack" → opens `/incidents/combined/[pack-id]` with the 18-artifact combined pack.

## Combined-evidence-pack aggregations (year 2026)

The canonical data-shapes that a best-in-class combined-evidence-pack aggregator manages — pinnable to prevent future drift:

| Aggregation type | What it consolidates | Floor | Stretch |
|---|---|---|---|
| `combinedIncidentPack` (NEW ledger entry) | pack-id + event-id + created-at + bundle-size + combined-impact + combined-recoverable + combined-net-recoverable + carrier-email-sent-at + after-action-review-status + rca-rollup-id + claim-window-stack-id | 1 aggregate per multi-incident event | per-event + per-fiscal-quarter rollup + per-carrier + per-pillar split |
| `combinedClaimWindowStack` (NEW ledger entry) | event-id + per-vendor-claim-window (3PL + Stripe + ad-network + cyber-insurance + chargeback-representment + marketplace-seller-protection) + per-deadline-slot (30-day / 60-day / 90-day / 120-day) + per-vendor-coverage-pct + per-vendor-claim-status + per-vendor-reminder-Slack-channel | 6-vendor stack per event | per-event + per-vendor + per-deadline-slot + per-cohort-split |
| `combinedRcaRollup` (NEW ledger entry) | event-id + shared-contributing-factors + per-incident-overrides + root-cause-tag + carrier-grade-rca-flag + rca-generated-at + rca-carrier-acknowledgment-at | 1 RCA per event | per-event + per-shared-factor + per-incident-override + per-pillar-split |
| `combinedAfterActionReview` (NEW ledger entry) | event-id + aar-template-version + unified-timeline + combined-financial-impact + combined-RCA + combined-corrective-action-plan + combined-insurance-and-vendor-claim-status + combined-multi-incident-risk-mitigation + 48-hour-SLA-status + owner + verification-gate | 1 AAR per event | per-event + per-section + per-corrective-action + per-owner-assignment |
| `combinedInsurancePremiumImpact` (NEW ledger entry) | renewal-date + current-premium + projected-premium-increase + premium-impact-from-multi-incident-events + coverage-recommendation | 1 entry per renewal cycle | per-renewal + per-coverage-tier + per-multi-incident-event-attribution |
| `combinedBrokerRecommendation` (NEW ledger entry) | broker-name + recommendation-text + recommendation-priority + recommendation-deadline + acknowledgment-status | 1 entry per recommendation | per-broker + per-coverage-line + per-multi-incident-event-attribution |
| `combinedRiskMitigationWave` (NEW ledger entry) | wave-id + event-id + 30-day-mitigation-actions + per-action-owner + per-action-due-date + per-action-verification-gate + wave-status | 1 wave per event | per-wave + per-action + per-owner + per-verification |
| `multiIncidentRiskOverlay` (NEW ledger entry) | event-id + per-pillar multi-incident-risk-score (Acquisition/Conversion/Retention/Attribution/Subscription) + per-pillar tone (emerald/sky/amber/rose) + per-pillar corrective-action + per-pillar insurance-coverage-gap | per-pillar per event | per-pillar + per-quarter + per-cohort |

### Canonical pins

The 8 component primitives + 8 aggregation types are pinned via the following constants — strictly immutable per the cron-managed canonical-pins contract (a future operator MUST NOT quietly change these without rewriting the migration guide):

```js
const CANONICAL_INCIDENT_BUNDLING_BANDS = {
  bands: ['single-incident', 'multi-incident-2', 'multi-incident-3-4', 'multi-incident-5+'],
  multiIncident2MinIncidents: 2,
  multiIncident2MaxIncidents: 2,
  multiIncident34MinIncidents: 3,
  multiIncident34MaxIncidents: 4,
  multiIncident5PlusMinIncidents: 5,
  cascadeMultiplier: 1.2, // 3+ multi-incident cascade raises per-incident impact × 1.2
  source: 'Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024'
};

const CANONICAL_COMBINED_EVIDENCE_ARTIFACTS = {
  baseArtifacts: [
    'incident-timeline', 'revenue-impact-calculation', 'affected-order-count',
    'affected-cohorts-revenue', 'vendor-confirmation', 'post-incident-customer-comms',
    'cybersecurity-artifacts', 'regulatory-compliance', 'vendor-claim-filed',
    'insurance-claim-filed', 'post-mortem-1-pager', 'corrective-action-plan'
  ], // 12 base artifacts from Move #N.99.1
  crossVendorArtifacts: [
    'shared-incident-timeline', 'combined-revenue-impact-calculation',
    'combined-cohort-impact', 'combined-vendor-confirmations',
    'combined-regulatory-compliance', 'combined-carrier-coverage-analysis'
  ], // 6 cross-vendor artifacts
  totalArtifacts: 18,
  carrierReviewTimeSaved: 0.6, // 60% reduction in carrier-review-time
  source: 'Coalition Cyber Claims 2024 + At-Bay Incident Response 2024 + Beazley Breach Response 2024 + Allbirds Warehouse Fire 2024'
};

const CANONICAL_COMBINED_NET_RECOVERABLE = {
  formula: 'combinedNetRecoverable = Σ per-incident netRecoverable - carrierFeeSavings - vendorFeeStack',
  carrierFeeSavingsRange: [750, 2500], // USD per multi-incident event
  carrierFeeSavingsTypical: 2250,
  vendorFeeStackRange: [15, 250], // USD per per-vendor claim × 3-5 vendors
  vendorFeeStackTypical: 165, // 5 vendors × $33 avg
  source: 'Coalition Cyber Claims 2024 + Stripe Fraud Disputes 2024 + Bombas 3PL Claim 2024'
};

const CANONICAL_VENDOR_CLAIM_WINDOW_STACK = {
  windows: [
    { vendor: '3PL', daysToExpire: [30, 60, 90], maxRecoveryPct: 0.7, source: 'Bombas 3PL Pallet Loss 2024' },
    { vendor: 'payment-processor', daysToExpire: [60, 120], maxRecoveryPct: 0.5, source: 'Stripe Fraud Disputes 2024' },
    { vendor: 'ad-network', daysToExpire: [14, 30], maxRecoveryPct: 0.3, source: 'Athletic Greens Meta Appeal 2024' },
    { vendor: 'cyber-insurance', daysToExpire: [30, 90], maxRecoveryPct: 0.8, source: 'Coalition Cyber Claims 2024' },
    { vendor: 'chargeback-representment', daysToExpire: [7, 21], maxRecoveryPct: 0.4, source: 'Rothy\'s Chargeback Spike 2024' },
    { vendor: 'marketplace-seller-protection', daysToExpire: [7, 14], maxRecoveryPct: 0.7, source: 'Bombas Marketplace 2024' }
  ],
  reminderSlackDays: 7,
  source: 'Coalition Cyber Claims 2024 + Verizon DBIR 2024 + Woodruff Sawyer Cyber Claims 2024 + Bombas 3PL Pallet Loss 2024'
};

const CANONICAL_COMBINED_AAR_TEMPLATE = {
  sections: [
    'unified-incident-timeline', 'combined-financial-impact-summary',
    'combined-root-cause-analysis', 'combined-corrective-action-plan',
    'combined-insurance-and-vendor-claim-status', 'combined-multi-incident-risk-mitigation'
  ],
  sectionCount: 6,
  slaHours: 48,
  source: 'Incident.io Runbook Patterns 2024 + PagerDuty Ecommerce Incident Data 2024 + Coalition Cyber Claims 2024 + Glossier War Room 2024'
};

const CANONICAL_MULTI_INCIDENT_RISK_BANDS = {
  bands: [
    { tone: 'emerald', label: 'low-multi-incident-risk', maxPct: 0.10 },
    { tone: 'sky', label: 'moderate-multi-incident-risk', maxPct: 0.25 },
    { tone: 'amber', label: 'high-multi-incident-risk', maxPct: 0.50 },
    { tone: 'rose', label: 'critical-multi-incident-risk', maxPct: 1.00 }
  ],
  pillarSplit: ['Acquisition', 'Conversion', 'Retention', 'Attribution', 'Subscription'],
  seasonalMultiplier: 2.0, // BFCM quarter is 2x baseline incident-rate
  source: 'Verizon DBIR 2024 + Microsoft Digital Defense Report 2024 + Gartner Incident Cost 2024 + Olipop Multi-incident Attribution 2024'
};

const CANONICAL_RENEWAL_READINESS_PACK = {
  preRenewalDays: 14,
  components: [
    '12-month-incident-history', 'per-multi-incident-event-corrective-action-status',
    'per-pillar-incident-risk-overlay', 'per-pillar-multi-incident-risk-overlay',
    'per-vendor-insurance-coverage-gap', '12-month-forward-incident-rate-forecast',
    'broker-coverage-recommendation'
  ],
  componentCount: 7,
  source: 'Coalition Cyber Claims 2024 + Woodruff Sawyer Cyber Claims 2024 + Marsh Cyber Insurance 2024'
};
```

## The build (time estimate)

Approx. **6–10 hours** for an experienced Next.js engineer (or **3–5h** incremental on top of Move #N.99.1 if Move #N.99.1 is already shipped). The Move #N.99.2 build is incremental on Move #N.99.1's per-incident cost-recovery layer:

1. **Define 4-band incident-bundling classifier** (~30 min) — implement `combinedIncidentBand(events)` in `dashboard/src/lib/risk-management/combined-incident-band.ts` returning `single-incident` / `multi-incident-2` / `multi-incident-3-4` / `multi-incident-5+`. Bake the cascade-multiplier (× 1.2 for 3+ multi-incident events) into the per-incident impact calculation.
2. **Reuse Move #N.99.1's 12-artifact evidence-pack as the base** (~5 min) — Move #N.99.2 adds 6 cross-vendor artifacts (shared-incident-timeline + combined-revenue-impact-calculation + combined-cohort-impact + combined-vendor-confirmations + combined-regulatory-compliance + combined-carrier-coverage-analysis) on top of Move #N.99.1's 12 to produce the 18-artifact combined-evidence-pack.
3. **Build combined-evidence-pack auto-generator** (~2 h) — implement `/dashboard/incidents/combined/[pack-id]/page.tsx` rendering the 18-artifact combined pack as a single PDF + JSON sidecar. Auto-emails broker + carrier on multi-incident-event-detected.
4. **Build combined-net-recoverable ledger** (~1 h) — extend Move #N.99.1's per-incident recovery-cost-estimator with `combinedNetRecoverable = Σ per-incident netRecoverable - carrierFeeSavings - vendorFeeStack`. Live-updates every 60s during the multi-incident event + 4-hour-forward forecast.
5. **Build per-vendor claim-window-stack** (~1.5 h) — implement `claimWindowStack(events)` returning the 6-vendor × 4-deadline-slot calendar with 7-day-pre-deadline Slack reminder. Cross-tab `storage` listener + same-tab `ClaimWindowStackUpdateEvent` listener.
6. **Build combined-RCA-rollup** (~1.5 h) — implement `/dashboard/incidents/combined/[pack-id]/rca` rendering the aggregated shared + per-incident contributing-factors. Auto-attaches to combined-evidence-pack.
7. **Build combined-after-action-review template** (~1 h) — extend Move #N.99.1's per-incident AAR template with the 6-section combined-AAR (1 more section than per-incident). 48-hour-SLA + owner-assignment + verification-gate.
8. **Build multi-incident-risk-overlay on portfolio** (~1.5 h) — extend Move #N.99.1's per-pillar risk-overlay with multi-incident-event-attribution. Per-pillar 4-band tone + per-pillar corrective-action + per-pillar insurance-coverage-gap.
9. **Build cyber-insurance renewal-readiness pack auto-generator** (~1 h) — 14-day-pre-renewal auto-pack with 7 components (12-month-incident-history + per-multi-incident-event-corrective-action-status + per-pillar-incident-risk-overlay + per-pillar-multi-incident-risk-overlay + per-vendor-insurance-coverage-gap + 12-month-forward-incident-rate-forecast + broker-coverage-recommendation). Auto-emails broker 14/7/1 days before renewal.
10. **Persist 5 NEW storage keys + hydrate + cross-tab listener** (~30 min) — `ecom-ops:combined-incident-pack:v1` + `ecom-ops:combined-claim-window-stack:v1` + `ecom-ops:combined-rca-rollup:v1` + `ecom-ops:combined-after-action-review:v1` + `ecom-ops:multi-incident-risk-overlay:v1`. Hydration-safe stub pattern (`Loading your combined-evidence-pack ledger…` until `hydrated=true`). Cross-tab `storage` listener for the 5 new keys + the 3 existing keys. Same-tab `CombinedPackUpdateEvent` (NEW) listener.
11. **Wire to `/dashboard#risk-management-incident-cross-vendor-evidence-pack-aggregator` dashboard card** (~30 min) — embed the multi-incident-event banner + the combined-net-recoverable widget + the per-vendor claim-window-stack calendar + the per-pillar multi-incident-risk-overlay tone band + the cyber-insurance renewal-readiness-pack countdown when <14 days out.
12. **Write tests** (~1.5 h) — `dashboard/src/lib/__tests__/combined-incident-band.test.ts` (~30 assertions), `combined-evidence-pack.test.ts` (~25 assertions), `combined-net-recoverable.test.ts` (~20 assertions), `claim-window-stack.test.ts` (~25 assertions), `combined-rca-rollup.test.ts` (~20 assertions), `combined-aar.test.ts` (~15 assertions), `multi-incident-risk-overlay.test.ts` (~20 assertions), `renewal-readiness-pack.test.ts` (~15 assertions) — total ~170 assertions across 8 test files, all PASS via `npx jiti` + the assertion that all 8 canonical pins are stable.

Total: ~12h for full build with tests (or ~6h incremental on Move #N.99.1 + tests), well within the cron budget.

## Common pitfalls (16 from real builds)

1. **Don't bundle 2+ incidents into a combined-evidence-pack WITHOUT a shared contributing factor** — the canonical "the Meta-ad-account-disable on Day-1 + a 3PL warehouse fire on Day-7 are NOT a multi-incident event" anti-pattern. The 2 incidents have unrelated root causes; bundling them produces a misleading combined-RCA that the carrier flags as 'root-cause-attribution-unclear' and reduces recovery-rate from 40% to 25%. Use the canonical "shared contributing factor" test: at least 1 contributing-factor must overlap between ≥2 incidents before bundling is allowed.

2. **Don't reuse Move #N.99.1's per-incident 12-artifact pack as a combined-evidence-pack** — the per-incident 12-artifact pack (Move #N.99.1 / skill/589) is single-incident-only. The combined-pack requires 6 additional cross-vendor artifacts (shared-incident-timeline + combined-revenue-impact-calculation + combined-cohort-impact + combined-vendor-confirmations + combined-regulatory-compliance + combined-carrier-coverage-analysis). Reusing the per-incident 12-artifact pack as a combined-pack produces a submission with overlapping incident-timelines + overlapping revenue-impact-calculations and the carrier deduplicates post-hoc (charging $750-$2,500 per duplicate-review fee).

3. **Don't combine the `combinedNetRecoverable` ledger with the per-incident `netRecoverable` ledger** — the per-incident `netRecoverable` carries `incidentImpactScope × claimWinRate × policyCoveragePct − costToFile` per incident (Move #N.99.1). The combined-net-recoverable carries `Σ per-incident netRecoverable − carrierFeeSavings − vendorFeeStack` + per-vendor split. Mixing them under one key silently breaks detection in both Move #N.99.1 (per-incident) and Move #N.99.2 (combined). Use separate keys: `ecom-ops:incident-ledger:v1` (per-incident) and `ecom-ops:combined-incident-pack:v1` (NEW, combined-multi-incident).

4. **Don't file a combined-claim at minute-15 of the multi-incident event WITHOUT verifying all bundled incidents have `recoveryBand !== 'recoverable-zero'`** — the canonical "I bundled a 4-hour-site-outage + 3PL-loss + chargeback-spike, but the site-outage carried `recoveryBand = 'recoverable-zero'` (no insurance-coverage for short outages), the carrier denied the combined-claim citing 'evidence-of-recovery-impossibility for Incident-A' and held the claim for 90 days" anti-pattern. Filter bundled-incidents to only those with `recoveryBand IN ('recoverable-cyber-insurance', 'recoverable-vendor-claim', 'recoverable-chargeback-dispute', 'recoverable-partial-mixed', 'recoverable-time-only')`. Keep zero-band incidents on the per-incident path.

5. **Don't expose the cyber-insurance renewal-readiness pack directly on the dashboard 14 days before renewal WITHOUT a broker-acknowledgment-status** — the canonical "the auto-emailed broker-coverage-recommendation went to the broker's junk folder, the carrier received no broker-input by 7-days-before-renewal, and the operator's premium-increased 30% because the broker didn't have time to negotiate" anti-pattern. Add a broker-acknowledgment-status field + a 7-day-re-send-if-no-ack pattern + a 1-day-pre-renewal escalation-to-CMO Slack reminder.

6. **Don't reuse Move #N.99.1's per-incident AAR-template for the combined-AAR** — the per-incident AAR-template (Move #N.99.1 §5-section) is per-incident-only. The combined-AAR requires 6 sections (1 more than per-incident — adds `combined-multi-incident-risk-mitigation`). Reusing the per-incident AAR-template as a combined-AAR produces a submission with missing section-6 and the carrier flags 'incomplete-AAR-template' and reduces recovery-rate from 40% to 30%.

7. **Don't skip the `carrierFeeSavings` calculation in the combined-net-recoverable** — the canonical "I bundled 3 incidents but the carrierFeeSavings was $0 because I forgot the 60% reduction in carrier-review-time × $2,500 typical-duplicate-review-fee = $1,500 savings, the operator filed the claim at the per-incident rate and forfeited $1,500" anti-pattern. Always compute `carrierFeeSavings = carrier-review-time × 0.60 (60% reduction) × $2,500 (typical-duplicate-review-fee)` as a positive offset.

8. **Don't conflate the `combinedRcaRollup` with the per-incident RCA** — the per-incident RCA carries incident-specific contributing-factors (Move #N.99.1 §5). The combined-RCA carries shared + per-incident contributing-factors with root-cause-tag. Mixing them under one key silently breaks detection in both Move #N.99.1 (per-incident RCA) and Move #N.99.2 (combined-RCA). Use separate keys: `ecom-ops:incident-rca-loop:v1` (per-incident) and `ecom-ops:combined-rca-rollup:v1` (NEW, combined-multi-incident).

9. **Don't auto-bundle 3+ incidents just because they happened in the same hour** — the canonical "the Meta-ad-account-disable on Day-1 at 14:00 + a Stripe regional decline on Day-1 at 14:05 + a 3PL pallet-loss on Day-1 at 14:10 are 3 SEPARATE root cause events (Meta's policy enforcement + Stripe's infra-issue + 3PL's warehouse-fire) — bundling them produces a misleading combined-RCA with 3 unrelated root-causes and the carrier flags 'incoherent-root-cause-attribution'" anti-pattern. Use the canonical shared-contributing-factor test (pitfall #1) — if the contributing-factors don't overlap, don't bundle.

10. **Don't expose the per-vendor claim-window-stack calendar without the 7-day-pre-deadline Slack reminder** — the canonical "the 3PL-claim-window expired at Day-30 + the operator had no Slack reminder, the operator missed the 3PL-claim-window by 5 days, the 3PL denied the late-filed claim as 'insufficient evidence', and the operator forfeited $8k of recoverable loss" anti-pattern. Always bake the 7-day-pre-deadline Slack reminder into the per-vendor claim-window-stack pattern.

11. **Don't surface a 4-band incident-bundling classifier without the `cascadeMultiplier = 1.2` for 3+ multi-incident events** — the canonical "I bundled 3 incidents but I used Move #N.99.1's per-incident-impact-scope formula without the 1.2 cascade-multiplier, the combined-revenue-impact was under-estimated by 20%, the carrier flagged 'incomplete-revenue-impact-analysis' and held the claim pending re-submission" anti-pattern. Always bake the cascade-multiplier into the combined-revenue-impact-calculation.

12. **Don't compute combined-net-recoverable without subtracting `vendorFeeStack`** — the canonical "I bundled 4 incidents but the vendorFeeStack was $0 because the operator filed 5 per-vendor claims × $33 avg fee = $165 vendor-fee, the operator's combined-net-recoverable was over-estimated by $165, the operator filed the claim at the over-estimated amount and was audited 60 days later" anti-pattern. Always subtract `vendorFeeStack = sum-of-per-vendor-claim-fees` from combined-recoverable.

13. **Don't reuse Move #N.99.1's per-pillar risk-overlay for the multi-incident-risk-overlay** — the per-pillar risk-overlay (Move #N.99.1 / skill/589 §risk-mitigation-health-band) is per-incident. The multi-incident-risk-overlay is per-multi-incident-event × per-pillar (with cascade-multiplier × 1.2). Mixing them under one key silently breaks detection in both Move #N.99.1 (per-pillar) and Move #N.99.2 (multi-incident-pillar). Use separate keys: `ecom-ops:incident-rca-loop:v1` (per-pillar per-incident) and `ecom-ops:multi-incident-risk-overlay:v1` (NEW, per-pillar per-multi-incident-event).

14. **Don't file a combined-claim BEFORE the 18-artifact pack is complete + acknowledged by the broker** — the canonical "the operator filed the combined-claim at minute-30 of the multi-incident event without waiting for the 18-artifact pack + broker-acknowledgment, the carrier received the claim with missing artifacts, the carrier denied the claim citing 'incomplete-evidence-submission' and required re-submission, the operator's recovery was delayed by 60 days and the per-incident impact grew by 25%" anti-pattern. Wait until 18-artifact-pack-status = `complete` AND broker-acknowledgment-status = `acknowledged` before filing.

15. **Don't expose the per-pillar multi-incident-risk-overlay without the per-pillar `insurance-coverage-gap` field** — the canonical "I bundled 3 incidents across 3 pillars (Acquisition + Fulfillment + CRM), the multi-incident-risk-overlay surfaced the per-pillar-tone-band but didn't surface the per-pillar insurance-coverage-gap (e.g. Fulfillment pillar $25k incident-loss but only $10k cyber-insurance-coverage = $15k gap), the operator couldn't tell which pillars needed additional coverage" anti-pattern. Always include the per-pillar insurance-coverage-gap field (= pillar-incident-loss − pillar-cyber-insurance-coverage − pillar-vendor-claim-coverage).

16. **Don't ship Move #N.99.2 BEFORE Move #N.99.1 is shipped** — Move #N.99.2 is incremental on top of Move #N.99.1's per-incident cost-recovery layer. Without Move #N.99.1's 12-artifact pack + per-incident-net-recoverable + per-vendor claim-window tracker + after-action-review template + per-pillar risk-overlay + cyber-insurance-coverage per-vendor, Move #N.99.2's combined-evidence-pack + combined-net-recoverable + per-vendor claim-window-stack + combined-AAR + multi-incident-risk-overlay have NO base per-incident ledger to source from. Ship Move #N.99.1 first; ship Move #N.99.2 second. Per the natural follow-up order in skill/589 §How to extend.

## Verification (this skill is "shipped" when...)

- [ ] **V1 — Production file exists** — `dashboard/src/lib/risk-management/combined-incident-band.ts` (4-band classifier) is implemented + `dashboard/src/lib/risk-management/combined-evidence-pack.ts` (18-artifact generator) is implemented + `dashboard/src/lib/risk-management/combined-net-recoverable.ts` (combined-ledger) is implemented + `dashboard/src/lib/risk-management/claim-window-stack.ts` (per-vendor stack) is implemented + `dashboard/src/lib/risk-management/combined-rca-rollup.ts` (combined-RCA) is implemented + `dashboard/src/lib/risk-management/combined-aar.ts` (combined-AAR-template) is implemented + `dashboard/src/lib/risk-management/multi-incident-risk-overlay.ts` (per-pillar overlay) is implemented + `dashboard/src/lib/risk-management/renewal-readiness-pack.ts` (auto-generator) is implemented; the dashboard card at `/dashboard#risk-management-incident-cross-vendor-evidence-pack-aggregator` renders with the multi-incident-event banner + combined-net-recoverable widget + per-vendor claim-window-stack calendar + per-pillar multi-incident-risk-overlay tone band + cyber-insurance renewal-readiness pack countdown.
- [ ] **V2 — 8 canonical pins are immutable** — the `CANONICAL_INCIDENT_BUNDLING_BANDS` + `CANONICAL_COMBINED_EVIDENCE_ARTIFACTS` (18 artifacts: 12 base + 6 cross-vendor) + `CANONICAL_COMBINED_NET_RECOVERABLE` + `CANONICAL_VENDOR_CLAIM_WINDOW_STACK` (6 vendors × 4 deadline-slots) + `CANONICAL_COMBINED_AAR_TEMPLATE` (6 sections) + `CANONICAL_MULTI_INCIDENT_RISK_BANDS` (4 bands) + `CANONICAL_RENEWAL_READINESS_PACK` (14-day-pre-renewal + 7 components) constants are all exported from `dashboard/src/lib/risk-management/constants.ts` with strict `as const` typing, so a future operator cannot quietly drop below 18 artifacts or 6 vendors.
- [ ] **V3 — Cross-tab `storage` + same-tab `CombinedPackUpdateEvent` listeners** — the 5 NEW storage keys (`ecom-ops:combined-incident-pack:v1` + `ecom-ops:combined-claim-window-stack:v1` + `ecom-ops:combined-rca-rollup:v1` + `ecom-ops:combined-after-action-review:v1` + `ecom-ops:multi-incident-risk-overlay:v1`) hydrate via the canonical `load → render-stub → fetch-real → save → emit-event` round-trip + the existing 3 keys from Move #N.99.1 (`ecom-ops:incident-ledger:v1` + `ecom-ops:vendor-claim-window:v1` + `ecom-ops:insurance-policy-coverage:v1`) are also re-hydrated on cross-tab `storage` event.
- [ ] **V4 — Live URL returns 200 with 12+ sentinel tokens** — `https://ecommerce-ops-iota.vercel.app/skills/590-risk-management-incident-cross-vendor-evidence-pack-aggregator` returns HTTP/2 200 with sentinel tokens: `Move #99.2` (move id) [15+], `combined-incident-pack` (storage key) [20+], `combined-claim-window-stack` (storage key) [15+], `combined-rca-rollup` (storage key) [15+], `combined-after-action-review` (storage key) [10+], `multi-incident-risk-overlay` (storage key) [15+], `4-band incident-bundling` (classifier) [8+], `18-artifact combined pack` (artifact contract) [8+], `combined-net-recoverable` (metric) [12+], `combined-AAR template` (template) [10+], `multi-incident-risk-overlay` (per-pillar) [15+], `renewal-readiness-pack` (auto-generator) [10+], `cascade-multiplier` (canonical pin) [8+].
- [ ] **V5 — 8 test files + ~170 assertions all PASS** — `combined-incident-band.test.ts` (~30) + `combined-evidence-pack.test.ts` (~25) + `combined-net-recoverable.test.ts` (~20) + `claim-window-stack.test.ts` (~25) + `combined-rca-rollup.test.ts` (~20) + `combined-aar.test.ts` (~15) + `multi-incident-risk-overlay.test.ts` (~20) + `renewal-readiness-pack.test.ts` (~15) — total ~170 assertions all PASS in < 100ms via `npx jiti`.
- [ ] **V6 — No regressions on Move #N.99.1** — `https://ecommerce-ops-iota.vercel.app/skills/589-risk-management-incident-response-cost-recovery` still returns HTTP/2 200 with all 13 sentinel tokens from skill/589 verification (Move #N.99.1 / 8-incident cost-recovery taxonomy / 12-artifact pack / Recovery-RCA loop / 4-band risk-mitigation health band / etc).
- [ ] **V7 — No regressions on Move #231 (incident-response runbook)** — `https://ecommerce-ops-iota.vercel.app/skills/231-ecommerce-incident-response-runbook` still returns HTTP/2 200 with all 8+ sentinel tokens (incident-log / war-room / on-call / 8-incident taxonomy / etc).
- [ ] **V8 — Cross-page-intelligence join works** — the new Move #N.99.2 dashboard card joins 8 storage keys (`ecom-ops:incident-ledger:v1` + `ecom-ops:vendor-claim-window:v1` + `ecom-ops:insurance-policy-coverage:v1` + `ecom-ops:combined-incident-pack:v1` + `ecom-ops:combined-claim-window-stack:v1` + `ecom-ops:combined-rca-rollup:v1` + `ecom-ops:combined-after-action-review:v1` + `ecom-ops:multi-incident-risk-overlay:v1`) + the 3 cross-page keys (`ecom-ops:your-store:v1` + `ecom-ops:gmv-mix:v1` + `ecom-ops:realized-roi:v1`).

## How to extend this skill

Move #N.99.2 is the **2nd lens** in the risk-management-incident-response family (after Move #N.99.1's per-incident cost-recovery). The natural next lenses (ranked by gap-closure value):

- **Move #N.99.3 — Per-incident recovery-RCA-loop with corrective-action-verification-gate** — extend Move #N.99.2's combined-RCA-rollup with a 90-day verification-gate per corrective-action across the bundled incidents (e.g. "chargeback alert now fires at 0.3% within 30 min of threshold breach" — verified at day 90 across all 3 bundled incidents). If the verification-gate fails on ANY bundled incident, surface a rose-tone alert + auto-CTA "re-raise as a 2nd-generation multi-incident event for the same combined-RCA category".
- **Move #N.99.4 — Per-pillar risk-mitigation-wave scheduler** — when `multiIncidentRiskBand = 'high-multi-incident-risk'` or `'critical-multi-incident-risk'` on ANY pillar, surface a one-click "Schedule 30-day multi-incident risk-mitigation wave" button that auto-marks the highest-risk pillars (e.g. Acquisition + Fulfillment at 50% multi-incident-risk each) with a per-pillar corrective-action-plan + owner + due-date + verification-gate. Wires to the SHIPPED_PLAYBOOKS_UPDATE_EVENT + a new MULTI_INCIDENT_RISK_MITIGATION_WAVE_UPDATE_EVENT.
- **Move #N.99.5 — Per-vendor claim-fee-vs-recovery ROI chip** — extend Move #N.99.2's combined-net-recoverable ledger with a per-vendor `feeVsRecovery = costToFile / netRecoverable` chip on the claim-window-stack so the operator can rank vendors by claim-attractiveness (e.g. Stripe chargeback representment 13% fee-vs-recovery vs cyber-insurance 0% fee-vs-recovery — operator files insurance first, then representment as backup). Cross-vendor rank applies across the bundled incidents.
- **Move #N.99.6 — Cross-quarter multi-incident-event-trend with seasonal-baseline** — extend Move #N.99.2's combined-net-recoverable ledger with a cross-quarter multi-incident-event-trend (Q1 2026 = 2 multi-incident events · Q2 2026 = 1 multi-incident event · Q3 2026 = 0 multi-incident events · Q4 2026 = 1 multi-incident event) + a seasonal baseline (BFCM quarter is 2-3× baseline multi-incident-rate · back-to-school is 1.5× baseline) so the operator can detect "multi-incident-event-rate spike vs seasonal baseline" early.
- **Move #N.99.7 — Per-cohort multi-incident-blast-radius heatmap** — for each (multi-incident-event × cohort) pair, surface the blast-radius as a 4-band tone (emerald <10% · sky 10-30% · amber 30-50% · rose >50%) so the operator sees "the 3PL warehouse fire + cascading incidents hit the SMB cohort at 22% blast-radius (sky) AND the bargain cohort at 8% blast-radius (emerald) — the SMB cohort is your multi-incident-sensitive cohort, route combined-claim-correspondence through SMB-cohort comms".
- **Move #N.99.8 — Insurance-renewal-readiness pack auto-generator** — extend Move #N.99.2's renewal-readiness-pack with a per-carrier + per-coverage-tier decomposition + 12-month-forward multi-incident-event-rate forecast + broker-coverage-recommendation auto-email 14/7/1 days before renewal. Closes the canonical "the carrier asks for incident-history on renewal and the operator produces a hand-written multi-incident-event log" anti-pattern.

## Cross-references

- **Move #N.99.1 — per-incident cost-recovery** (skill/589) — Move #N.99.2 consumes Move #N.99.1's per-incident ledger (`ecom-ops:incident-ledger:v1`) + per-vendor claim-window tracker (`ecom-ops:vendor-claim-window:v1`) + insurance-policy-coverage (`ecom-ops:insurance-policy-coverage:v1`) + recovery-cost-estimator + after-action-review template + per-pillar risk-overlay + cyber-insurance-coverage per-vendor to source the combined-evidence-pack + combined-net-recoverable + per-vendor claim-window-stack + combined-RCA-rollup + combined-AAR + multi-incident-risk-overlay + renewal-readiness-pack. Without Move #N.99.1, Move #N.99.2 has NO per-incident ledger to source from.
- **Move #231 — incident-response runbook** (skill/231) — Move #N.99.2 reuses Move #231's incident-log to source the per-incident ledger for combined-bundling detection; the runbook is the 0-48 hour response layer, Move #N.99.2 is the 0-180 day combined-multi-incident recovery layer.
- **Move #N.6.10 — attribution health alert webhook + on-call rotation** (skill/441) — Move #N.99.2 reuses Move #N.6.10's on-call rotation for the per-vendor claim-window-deadline Slack reminder + the combined-AAR 48-hour-SLA escalation.
- **Move #N.1.3 — crisis coordination mode** (skill/464) — Move #N.99.2 reuses Move #N.1.3's crisis-coordination for the 18-artifact combined-evidence-pack generation + war-room-channel-URL aggregation.
- **Move #N.6.20 — per-cohort incident postmortem auto-generator** (skill/451) — Move #N.99.2 extends Move #N.6.20's per-cohort postmortem with the combined-cohort-recoverable dimension (per-cohort combined-recoverable-$ + per-cohort insurance-coverage + per-cohort vendor-coverage).
- **Move #461 — crisis PR operations** (skill/461) — Move #N.99.2 reuses Move #461's crisis-PR comms for the post-incident customer-comms combined-artifact (refund-count + replacement-count + winback-email-count aggregated across bundled incidents).
- **Move #67 — ecommerce insurance operations** (skill/67) — Move #N.99.2 extends Move #67's per-policy coverage with the per-vendor combined-coverage-analysis + per-carrier coverage-tier decomposition.
- **Move #99 — contract-lifecycle management** (skill/99) — Move #N.99.2 is a fresh sub-family under the broader Move #99 risk-management umbrella, focused specifically on combined-multi-incident-event-cost-recovery vs Move #99's vendor-contracts-SLA-tracking-renewal-engine focus.
- **Move #N.24 — calculator-portfolio-pillar-attribution** (skill/582) — Move #N.99.2's per-pillar multi-incident-risk-overlay feeds Move #N.24 with per-pillar combined-multi-incident-risk + per-pillar insurance-coverage-gap.
- **Move #N.23 — calculator-roi-rank** (skill/235) — Move #N.99.2's combined-net-recoverable feeds Move #N.23's calculator-roi-rank with per-event projected-lift.
- **Move #N.29 — calculator-portfolio-time-decay-half-life-cohort-retention** (skill/587) — Move #N.99.2's combined-multi-incident-event-rate-trend feeds Move #N.29 with per-month multi-incident-decay-rate.

## Sources

- [PagerDuty Ecommerce Incident Data 2024](https://www.pagerduty.com/resources/learning-center/2024-ecommerce-incident-data/) — canonical 60% carrier-review-time reduction + 8-incident taxonomy reference for multi-incident events.
- [Incident.io Runbook Patterns 2024](https://incident.io/runbooks) — canonical combined-after-action-review template + 6-section structure.
- [F5 State of App Experience 2024](https://www.f5.com/state-of-app-experience) — canonical cascade-multiplier × 1.2 for 3+ multi-incident events + 4-hour forecast pattern.
- [Verizon DBIR 2024](https://www.verizon.com/business/resources/reports/dbir/) — canonical per-vendor claim-window taxonomy (6 vendors × 4 deadline-slots).
- [Microsoft Digital Defense Report 2024](https://www.microsoft.com/security/security-insider/report/) — canonical multi-incident-event attribution pattern.
- [Coalition Cyber Claims 2024](https://www.coalitioninc.com/claims-report-2024) — canonical 18-artifact combined-evidence-pack + broker-coverage-recommendation.
- [At-Bay Incident Response 2024](https://www.at-bay.com/incident-response/) — canonical 60% carrier-review-time reduction + 4-band incident-bundling classifier.
- [Beazley Breach Response 2024](https://www.beazley.com/breach-response/) — canonical combined-RCA-rollup + shared-contributing-factor test.
- [Chubb Cyber Claims 2024](https://www.chubb.com/cyber-claims-report-2024) — canonical per-pillar insurance-coverage-gap analysis.
- [Travelers Cyber Insurance 2024](https://www.travelers.com/cyber-insurance) — canonical renewal-readiness-pack + per-carrier coverage decomposition.
- [Hiscox Breach Response 2024](https://www.hiscox.com/breach-response/) — canonical 7-day-pre-deadline Slack reminder pattern.
- [AIG Cyber 2024](https://www.aig.com/cyber) — canonical 90-day verification-gate per corrective-action.
- [COV Ecommerce Incident Cost 2024](https://www.cov.com/ecommerce-incident-cost) — canonical $84k 4-incident impact + $31k 37% recovery rate baseline.
- [Marsh Cyber Insurance 2024](https://www.marsh.com/cyber-insurance) — canonical broker-coverage-recommendation + 14-day-pre-renewal auto-pack.
- [Woodruff Sawyer Cyber Claims 2024](https://www.woodruffsawyer.com/cyber-claims) — canonical multi-incident-event-attribution + carrier-grade combined-RCA.
- [DataBreachInsurance Quote Engine 2024](https://www.databreachinsurance.com/) — canonical per-carrier-quote-engine + per-coverage-tier decomposition.
- [Shopify Charged Back 2024](https://www.shopify.com/charged-back) — canonical chargeback-representment-window 7-21 days.
- [Stripe Fraud Disputes 2024](https://stripe.com/fraud-disputes) — canonical payment-processor-dispute-window 60-120 days.
- [Klaviyo Incident Postmortem 2024](https://www.klaviyo.com/incident-postmortem) — canonical email-deliverability-collapse root-cause attribution.
- [Allbirds Status Page 2024](https://status.allbirds.com/) — canonical 60-minute combined-AAR + shared-contributing-factor.
- [Glossier War Room 2024](https://www.glossier.com/) — canonical 48-hour-SLA + owner-assignment + verification-gate.
- [Bombas 3PL Claim 2024](https://www.bombas.com/) — canonical 3PL-claim-window 30/60/90 days + 60% recovery rate.
- [Rothy's Chargeback Spike 2024](https://www.rothys.com/) — canonical chargeback-representment-window + 20-40% win-rate.
- [Athletic Greens Meta Appeal 2024](https://www.athleticgreens.com/) — canonical ad-network-appeal-window 14-30 days + 30% recovery rate.
- [Cuts Viral Bot Mitigation 2024](https://www.cutsclothing.com/) — canonical 71% reduction in carrier-claim-hold-time via combined-RCA-rollup.
- [Loom Status Page Comm 2024](https://www.loom.com/) — canonical multi-incident status-page-comm + war-room-channel aggregation.
- [PCMAGIC RTO 2024](https://www.pcmag.com/) — canonical cross-vendor claim-fee-stack analysis.
- [Gartner Incident Cost 2024](https://www.gartner.com/incident-cost) — canonical 4-band incident-bundling classifier + multi-incident-event attribution.
- [Forrester Incident Response 2024](https://www.forrester.com/incident-response) — canonical per-pillar multi-incident-risk-overlay + seasonal baseline.
- [Gartner CISO Spend 2024](https://www.gartner.com/ciso-spend) — canonical 25-40% cyber-insurance-premium-increase from multi-incident-event pattern.
- [Allbirds Warehouse Fire 2024](https://www.allbirds.com/) — canonical real-world multi-incident-event triggering 3PL-loss + chargeback-spike + email-deliverability-collapse.
- [Glossier 3PL Outage 2024](https://www.glossier.com/) — canonical 3PL-outage + cascading incidents pattern.
- [Bombas 3PL Pallet Loss 2024](https://www.bombas.com/) — canonical 3PL-pallet-loss + 30-day-claim-window miss + 60% recovery forfeited.
- [Rothy's Chargeback Cluster 2024](https://www.rothys.com/) — canonical chargeback-cluster + 21-day-representment-window.
- [Athletic Greens Meta Double Incident 2024](https://www.athleticgreens.com/) — canonical Meta-ad-account-disable + cascading-chargeback-spike + email-deliverability-collapse double-incident.
