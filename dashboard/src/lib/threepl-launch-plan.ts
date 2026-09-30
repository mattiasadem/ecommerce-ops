/**
 * `threepl-launch-plan.ts` — Pure generator for the 30-day
 * 3PL Migration launch plan (Move #14 — in-house fulfillment → ShipBob
 * + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace
 * + Extensiv multi-3PL orchestration).
 *
 * Reads the operator's saved BrandOpsInputs from localStorage (via the
 * component layer), overlays the Your-store AOV / monthly orders /
 * gross margin (when present), and produces a calendar-ready,
 * day-by-day markdown checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1-7)   - RFQ + 8-prereq brief + 3PL shortlist (ShipBob / ShipMonk / Red Stag / SFN / Stord / Flowspace / Extensiv)
 *   W2 (Days 8-14)  - Contract + 8-SLA-defense clauses + WMS build + ERP bridge + Triple Whale ship-cost-cohort overlay
 *   W3 (Days 15-21) - Inventory pull + per-region 3PL inbound + soft-launch to 10% then 50% then 100%
 *   W4 (Days 22-30) - D-7 / D-14 / D-21 ship-cost + ship-time + NPS readouts + 30-day program readout + RFQ re-bid cycle
 *
 * Each day has a single checkbox-able action. The plan also surfaces
 * a one-line health snapshot (path verdict + Year-1 incremental net +
 * Year-1 ROI + ship-cost savings % + ship-time improvement days +
 * canonical build sequence) so when the plan is shared in a standup,
 * the team sees "what does this look like" without opening the
 * playbook.
 *
 * Pure - no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import {
  BrandOpsInputs,
  PathRecommendation,
  PathName,
  THREEPL_DEFAULTS,
  projectPerPathSavings,
  recommendPath,
} from "@/lib/threepl";
import { loadYourStore } from "@/lib/your-store";

export interface ThreeplLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface ThreeplLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string;   // operator-pickable plan start (default = today)
  inputs: BrandOpsInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  recommendation: PathRecommendation;
  /** Per-path annual savings projections, mirrors `projectPerPathSavings()`. */
  perPath: ReturnType<typeof projectPerPathSavings>;
  days: ThreeplLaunchPlanDay[];
}

const PLAN_DAYS: Omit<ThreeplLaunchPlanDay, "day">[] = [
  // --- Week 1 — RFQ + 8-prereq brief + 3PL shortlist ---------------------
  {
    week: 1,
    title: "Audit the trailing 90-day in-house fulfillment baseline",
    action:
      "Pull the trailing-90-day ship-cost / ship-time / RTO-volume / NPS-by-fulfillment-channel from Shopify (or Triple Whale Starter / Polar Analytics). Confirm the volume matches the calculator input (default = 2,500 orders/mo · $75 AOV · $8.50 current ship cost · 3.0 day ship time · 5% international). Save as the baseline so the 6-20% ship-cost savings + 0.5-1.5 day ship-time improvement are measured against a real number, not aspirational.",
    deliverable:
      "Trailing-90-day ship-cost / ship-time / RTO / NPS-by-channel CSV exported (date / order_id / ship_cost / ship_time_days / RTO_flag / NPS_score)",
  },
  {
    week: 1,
    title: "Confirm Move #6 (Triple Whale attribution) + Move #1 (Klaviyo/SMS) prereqs are live",
    action:
      "Verify Move #6 (Triple Whale Starter or Polar Analytics attribution) and Move #1 (Klaviyo cart-abandon) are both shipped before the 3PL migration. Without these, the per-region ship-cost attribution + the cross-region NPS-by-fulfillment-channel cohort cannot be measured. STOP and ship the prereqs first if either is missing - the calculator's deferral gate moves the migration to Path A only when both are live.",
    deliverable:
      "Prereq matrix doc with Move #6 / Move #1 status recorded + sign-off",
  },
  {
    week: 1,
    title: "Pick Path A / B / C from the calculator's verdict",
    action:
      "Open the 3PL Path calculator on /3pl and confirm the Path verdict matches your team reality. Path A = <500 orders/mo (DEFER; canonical 3PL break-even floor per research/07 §1). Path B = 500-5,000 orders/mo (ShipBob + ShipMonk + Red Stag $0 + $1k one-time; canonical 5:1 Year-2 steady-state ROI). Path C = 5,000+ orders/mo (ShipBob Pro + ShipMonk Pro + SFN + Stord + Flowspace + Extensiv $50k-$100k one-time; canonical 12:1 Year-2 ROI). The W2/W3 plan below re-shapes around your chosen path.",
    deliverable:
      "Path verdict recorded + 3PL shortlist + ops-lead sign-off",
  },
  {
    week: 1,
    title: "Build the 3PL shortlist (ShipBob / ShipMonk / Red Stag / SFN / Stord / Flowspace / Extensiv)",
    action:
      "Per the canonical 6-dimension per-3PL cost-comparison matrix in research/07 §Pillar 1 + the 8-prereq RFQ brief template in asset 15, score each 3PL on: (a) per-order ship cost (US ground + 2-day air), (b) per-SKU pick-pack fee + dimensional weight rules, (c) zone-skipping + regional inventory placement, (d) WMS integration with Shopify + Klaviyo + Triple Whale, (e) SLA ship time + damage rate + RTO rate, (f) international footprint (EU + UK + CA + AU + JP). If Path B: shortlist 3 (ShipBob + ShipMonk + Red Stag). If Path C: shortlist 4-6 (ShipBob Pro + ShipMonk Pro + SFN + Stord + Flowspace + Extensiv).",
    deliverable:
      "3PL shortlist + 6-dimension per-3PL cost-comparison matrix + 8-prereq RFQ brief",
  },
  {
    week: 1,
    title: "Send RFQ to shortlist (8-prereq brief + volume tiers + integration ask)",
    action:
      "Attach the 8-prereq RFQ brief template from asset 15 (order volume / SKU profile / international footprint / WMS integrations / SLA ship-time / SLA damage rate / SLA RTO rate / reporting cadence). Request: per-order ground + 2-day air + international pricing tiers (100-500 / 500-2k / 2k-10k / 10k+ orders/mo), pick-pack fees per SKU + dimensional-weight threshold, zone-skipping availability + WMS integration list + Shopify webhook support, monthly storage $/cubic-foot + overage fees + insurance + RMA handling, dedicated account manager availability + quarterly business review cadence. Get back written quotes + Tier-1 customer references.",
    deliverable:
      "RFQ brief sent to 3-6 3PLs · written pricing + SLA + WMS matrix back · 3 reference calls",
  },
  {
    week: 1,
    title: "Score the RFQ responses + pick the primary 3PL",
    action:
      "Score each RFQ response against the canonical 6-dimension matrix + the canonical 5-voice × 5-format = 25 voice-driven override cells in asset 15. The winning 3PL is the one that hits the lowest $/order ground + the lowest $/order 2-day air + has native WMS integration with Shopify + Triple Whale + Klaviyo + a damage rate < 0.3% + a ship-time P95 < 3 days + a published zone-skipping discount. If Path B: pick one primary + one backup (ShipBob + ShipMonk). If Path C: pick two primaries + one backup (ShipBob Pro + ShipMonk Pro + Stord).",
    deliverable:
      "3PL scoring doc + primary 3PL pick + backup 3PL pick + ops-lead sign-off",
  },
  {
    week: 1,
    title: "Lock the success metric + horizon + measurement cadence",
    action:
      "Decide the 30-day success metric: net savings / month (ship cost savings - 3PL recurring cost - WMS migration overhead - team training time). Capture the Year-1 incremental net + Year-2 ROI ratio from the calculator as the readout targets. Lock the cadence: daily ship-cost check, weekly ship-time P95 check + damage rate check, 30-day RTO volume + NPS-by-fulfillment-channel cohort readout. Confirm with the team before W2 so the contract + WMS build has a target.",
    deliverable:
      "Metric + horizon doc signed off · readout cadence locked with the team",
  },

  // --- Week 2 — Contract + WMS build + Triple Whale overlay ---------------
  {
    week: 2,
    title: "Negotiate the contract + 8 SLA-defense clauses",
    action:
      "Use the canonical 8-SLA-defense contract clauses from asset 15: (1) ship-time P95 SLA (≤3 days domestic, ≤5 days international) with monthly credits if missed, (2) damage-rate SLA (≤0.3%) with full-replacement credits, (3) RTO-rate SLA (≤5%) with reverse-logistics coverage, (4) dimensional-weight cap (≤150% of actual weight) with overweight-fee cap, (5) zone-skipping discount (≥15% off ground for zone-3+ shipments) with monthly usage report, (6) month-to-month renewal after Year-1 with no auto-renewal penalty, (7) data-portability clause (full SKU + customer + order export on exit), (8) dedicated account manager SLA (response <24 hr on integration tickets). Negotiate down the per-order pricing + lock the 12-month pricing tiers.",
    deliverable:
      "Signed 3PL contract + 8-SLA-defense clauses verified + 12-month pricing tier locked",
  },
  {
    week: 2,
    title: "Wire the WMS integration with Shopify + Klaviyo + Triple Whale",
    action:
      "If Path B: single primary 3PL (ShipBob + ShipMonk). Wire Shopify native WMS connector + Klaviyo ship-event webhook (delivered → review-request flow trigger) + Triple Whale ship-cost-cohort overlay (Cohorts → '3PL-fulfilled orders' → filter orders where fulfillment_channel = '3PL' → confirm nightly re-sync). If Path C: two primaries + Extensiv orchestration. Wire Extensiv WMS as the canonical multi-3PL orchestrator + native WMS connectors to all three 3PLs + Triple Whale multi-region-cohort overlay (per-region ship-cost + ship-time + RTO + NPS slice). Confirm all webhooks are end-to-end-testable with a single test order.",
    deliverable:
      "WMS wired Shopify + Klaviyo + Triple Whale · end-to-end test order verified · dashboard shows 3PL-fulfilled order in cohort",
  },
  {
    week: 2,
    title: "Build the per-region ship-cost monitoring dashboard",
    action:
      "Triple Whale → Reports → New report → name '3PL ship-cost-by-region' → pivot table with rows = region (US-Northeast / US-Southeast / US-Midwest / US-West / CA / EU / UK / AU / JP) × columns = ship_cost ($) / ship_time_days (P50, P95) / damage_rate (%) / RTO_rate (%) / NPS_score. Confirm the dashboard re-syncs nightly and the 3PL ship-cost-vs-in-house baseline delta is visible at a glance. Without this, the 6-20% ship-cost savings cannot be measured against the $8.50 in-house baseline.",
    deliverable:
      "Per-region ship-cost + ship-time + damage-rate + RTO + NPS dashboard live in Triple Whale",
  },
  {
    week: 2,
    title: "Configure 5-touch Klaviyo ship-event flows (delivered + review + NPS + RTO + win-back)",
    action:
      "Klaviyo → Flows → New flow → 5 events from the 3PL ship webhook: (1) Delivered → wait 3 days → Review request email (Yotpo or Loox embedded review widget) · wait 7 days → Replenishment reminder (if consumables SKU per Move #11 subscription-prereq) · wait 14 days → Win-back SMS if no second order (per Move #1 cart-abandon). (2) Ship-event → In-transit email with tracking link. (3) RTO event → Customer-care email + automatic refund trigger. (4) Damaged-on-arrival event → Replacement-shipment flow. (5) NPS-survey-email at 30 days post-delivery for top-quartile-AOV customers.",
    deliverable:
      "5-touch Klaviyo ship-event flows live + verified end-to-end with a test order",
  },
  {
    week: 2,
    title: "Train the team on the WMS + escalation matrix",
    action:
      "Run a 2-hour team training on the 3PL WMS dashboard + the canonical 8-SLA-defense escalation matrix. Cover: (a) how to read the per-region ship-cost dashboard in Triple Whale, (b) how to file a damage-rate or RTO-rate SLA credit claim, (c) how to add a new SKU to the 3PL pick-pack workflow, (d) how to handle a 3PL inventory discrepancy (cycle count + reconciliation + 3PL accountability per playbook 14 §Phase 3), (e) how to escalate a 3PL ship-time SLA miss to the account manager. Document the escalation matrix in the team wiki + record the training video for future hires.",
    deliverable:
      "Team trained on WMS + escalation matrix · 2-hour training video recorded · escalation matrix in team wiki",
  },
  {
    week: 2,
    title: "Wire the per-region international shipment request library",
    action:
      "If Path B with internationalVolumePct < 10%: ship international via a single 3PL (ShipBob's international or ShipMonk's international arm). If Path C or internationalVolumePct >= 10%: wire a multi-region 3PL stack (SFN for US + EU/UK + CA + AU + JP). For each international region, configure: (a) local-language tracking page (per the regional voice profile), (b) local-currency invoice + customs declaration, (c) regional ship-cost + ship-time + RTO + NPS cohort overlay in Triple Whale, (d) regional-specific Klaviyo flow with localized copy (per Move #11 international-prereq).",
    deliverable:
      "Per-region international 3PL stack wired + localized tracking page + Triple Whale regional cohort overlay live",
  },
  {
    week: 2,
    title: "Confirm inventory pull + cutover plan ready for W3",
    action:
      "Inventory reconciliation: full SKU count + per-SKU on-hand + per-SKU inbound-from-supplier. 3PL inbound schedule: per-region inbound dock + per-region cycle-count SOP + per-region 3PL FIFO. Cutover plan: D-Day cutoff for in-house fulfillment orders (3pm ET), D+1 first 3PL-fulfilled orders shipped from the new 3PL warehouse(s). Customer-comms: pre-cutover email announcing the migration + new ship-from-location + new tracking URL (Klaviyo flow). Confirm the cutover plan with the team + the 3PL account manager.",
    deliverable:
      "Inventory reconciled + 3PL inbound schedule + cutover plan + customer-comms email · team sign-off",
  },

  // --- Week 3 — Inventory pull + soft-launch + ramp -----------------------
  {
    week: 3,
    title: "Pull inventory to the 3PL warehouse(s) — per-region cycle-count SOP",
    action:
      "Day 15-16: full inventory pull from in-house warehouse to primary 3PL (ShipBob or ShipMonk or whatever won the RFQ). Per-region split: US-East orders → US-East 3PL, US-West orders → US-West 3PL, international → international 3PL arm. Per-SKU cycle-count SOP: count + reconcile + flag discrepancies + 3PL accountability per playbook 14 §Phase 3. Per-SKU pick-pack test: place 10 test orders across the SKU complexity spectrum (standard / fragile / hazmat / subscription / temperature-controlled) and verify each one ships with the right packaging + the right ship time + the right tracking.",
    deliverable:
      "Inventory pulled to 3PL warehouse(s) · per-SKU cycle-count reconciled · 10-SKU pick-pack test passed",
  },
  {
    week: 3,
    title: "Soft-launch to 10% of orders — D-1 first 3PL-fulfilled order ships",
    action:
      "Day 17: cutover the 3PL to receive 10% of new Shopify orders (route by region). Confirm: (a) orders are flowing from Shopify → 3PL WMS → 3PL warehouse → ship, (b) the 3PL ship-cost matches the RFQ pricing tier, (c) ship-time P95 is hitting the SLA, (d) Klaviyo ship-event webhook fires correctly, (e) Triple Whale 3PL-fulfilled-orders cohort is showing revenue. Watch the 3PL dashboard for 24 hr for any anomalies (missed pick-pack / wrong address / carrier mis-routing). Customer-comms: send the pre-cutover email + monitor inboxes for any 3PL-fulfillment feedback.",
    deliverable:
      "10% soft-launch live · first 3PL-fulfilled orders shipped · Klaviyo + Triple Whale webhooks firing",
  },
  {
    week: 3,
    title: "Ramp to 50% of orders — D-3 50/50 split with in-house",
    action:
      "Day 18: ramp to 50% of new orders (route by region + per-region 3PL split). Confirm: (a) ship-cost savings tracking toward the 6-20% range per the calculator, (b) ship-time P95 tracking toward the ≤3 day target, (c) damage rate tracking toward ≤0.3% SLA, (d) RTO rate tracking toward ≤5% SLA. Pull a D-3 readout: per-region ship-cost delta vs in-house + per-region ship-time delta + per-region NPS-by-fulfillment-channel cohort. If any region shows a regression vs the in-house baseline, escalate to the 3PL account manager before ramping further.",
    deliverable:
      "50% soft-launch live · D-3 per-region ship-cost + ship-time + NPS readout · team sign-off to ramp",
  },
  {
    week: 3,
    title: "Ramp to 100% — D-7 100% 3PL-fulfilled",
    action:
      "Day 21: ramp to 100% of new orders (all regions + all 3PLs). Confirm: (a) in-house warehouse is closed (or repurposed for returns-handling + kitting + special-handling SKUs), (b) all teams are trained on the 3PL escalation matrix, (c) the Triple Whale 3PL-fulfilled-orders cohort is showing 100% of revenue, (d) the per-region dashboards are clean. Pull a D-7 readout: ship-cost savings / month + ship-time improvement days + RTO rate + NPS-by-fulfillment-channel + WMS webhooks firing + Klaviyo ship-event flows triggering.",
    deliverable:
      "100% 3PL-fulfilled · D-7 readout · in-house warehouse closed · team running on 3PL escalation matrix",
  },
  {
    week: 3,
    title: "D-7 per-region ship-cost + ship-time + NPS-by-channel readout",
    action:
      "Pull the D-7 readout from Triple Whale: per-region ship-cost (delta vs in-house $8.50 baseline) + per-region ship-time P50 + P95 + per-region damage rate + per-region RTO rate + per-region NPS score. Compare to the canonical 6-20% ship-cost savings + 0.5-1.5 day ship-time improvement + 0.3% damage-rate SLA + 5% RTO-rate SLA. Surface any under-performance regions to the 3PL account manager + file SLA-credit claims for any missed SLAs. Document the D-7 readout in the team wiki.",
    deliverable:
      "D-7 per-region readout doc · SLA-credit claims filed for any misses · 3PL account manager briefed",
  },
  {
    week: 3,
    title: "Wire the in-house return-handling + kitting + special-SKU workflows",
    action:
      "If the in-house warehouse is repurposed for returns + kitting + special-SKU handling (Path C + high international volume), wire the workflows: (a) 3PL → in-house returns hub (Loop / Returnly / Narvar per Move #28 returns-portal) → customer-care team, (b) in-house kitting for subscription SKUs (per Move #11 subscription-prereq) → ship to 3PL, (c) in-house special-handling for fragile / hazmat / temperature-controlled SKUs (per Move #14 §Phase 2). Confirm the in-house team has the SOP + the warehouse space + the kitting-station equipment.",
    deliverable:
      "In-house returns + kitting + special-SKU workflows live · team trained · per-SKU routing rules in 3PL WMS",
  },
  {
    week: 3,
    title: "D-14 cross-region NPS-by-fulfillment-channel cohort snapshot",
    action:
      "Day 21: pull the D-14 cross-region NPS-by-fulfillment-channel cohort from Triple Whale. Compare to the baseline NPS at the start of the migration. If Path C with multi-region: expect a 0-2 point NPS drop in week 1 (customer-friction from new tracking URL + new ship-from-location) recovering by D-14. If the NPS drop is >2 points at D-14, escalate to the 3PL account manager + the Klaviyo customer-care team. If the NPS drop is <2 points at D-14, declare the migration a success and move to W4 final readout.",
    deliverable:
      "D-14 NPS-by-fulfillment-channel cohort snapshot · escalation matrix triggered if NPS drop > 2 pts",
  },

  // --- Week 4 — D-21 readout + 30-day readout + RFQ re-bid ----------------
  {
    week: 4,
    title: "D-21 ship-cost + ship-time + damage-rate + RTO-rate readout",
    action:
      "Day 22: pull the D-21 readout from Triple Whale + the per-region dashboards. Compare to the canonical 6-20% ship-cost savings + 0.5-1.5 day ship-time improvement + 0.3% damage-rate SLA + 5% RTO-rate SLA. Confirm the migration is hitting the calculator's Year-1 incremental net + Year-2 ROI projection. If any metric is under-target, file the SLA-credit claim + escalate to the 3PL account manager + iterate on the per-region routing rules.",
    deliverable:
      "D-21 ship-cost + ship-time + damage-rate + RTO-rate readout · SLA-credit claims filed · per-region routing rules iterated",
  },
  {
    week: 4,
    title: "Per-region ship-cost re-bid cycle (annual contract renegotiation)",
    action:
      "Day 23-24: armed with the D-21 per-region ship-cost + ship-time + damage-rate + RTO-rate + NPS data, run an annual contract re-bid cycle with the primary 3PL(s). Use the data as leverage to negotiate down the per-order pricing tier (canonical 5-15% annual reduction on the same volume tier). Use the data to renegotiate the dimensional-weight cap + the zone-skipping discount + the storage $/cubic-foot rate. If the primary 3PL won't budge, escalate the re-bid to the backup 3PL.",
    deliverable:
      "Annual contract re-bid · per-order pricing tier renegotiated · dimensional-weight cap + storage rate renegotiated",
  },
  {
    week: 4,
    title: "Quarterly Business Review (QBR) with primary 3PL",
    action:
      "Day 25: schedule a QBR with the primary 3PL account manager + the in-house supply-chain lead. Cover: (a) the 30-day ship-cost + ship-time + damage-rate + RTO-rate + NPS readout, (b) the re-bid pricing tier + dimensional-weight cap + zone-skipping discount, (c) the upcoming BFCM volume spike + the 3PL's surge-capacity plan + dedicated BFCM warehouse team, (d) the upcoming international growth + per-region 3PL expansion, (e) the canonical 12-month roadmap (Path B → Path C progression + multi-region 3PL orchestration + Extensiv WMS migration if volume warrants).",
    deliverable:
      "QBR held with primary 3PL · 12-month roadmap agreed · BFCM surge-capacity plan signed off",
  },
  {
    week: 4,
    title: "Wire the per-region international-shipment-request library v2",
    action:
      "Day 26: extend the per-region international-shipment-request library with the lessons learned from the first 30 days. For each region (CA / EU / UK / AU / JP): (a) localized tracking page in the local language, (b) local-currency invoice + customs declaration per regional rules, (c) regional ship-cost + ship-time + RTO + NPS cohort overlay in Triple Whale, (d) regional-specific Klaviyo flow with localized copy, (e) regional-specific customer-care email + chat widget language. If Path C + multi-region: ship from a regional 3PL arm (SFN-EU + SFN-UK + ShipBob-AU + ShipMonk-JP).",
    deliverable:
      "Per-region international-shipment-request library v2 live · regional 3PL stack extended",
  },
  {
    week: 4,
    title: "Build the 30-day program readout deck for the founder / CEO",
    action:
      "Day 27: assemble a 1-page 30-day program readout deck (Google Slides or Notion page) for the founder / CEO. Cover: (a) the canonical Path verdict (A / B / C) + the canonical Year-1 incremental net + Year-2 ROI + ship-cost savings % + ship-time improvement days, (b) the D-7 / D-14 / D-21 readout (ship-cost + ship-time + damage-rate + RTO-rate + NPS-by-channel), (c) the cross-region NPS-by-fulfillment-channel cohort snapshot, (d) the SLA-credit claims filed + resolved, (e) the annual contract re-bid cycle outcome + the new pricing tier, (f) the 12-month roadmap + the Path B → Path C progression decision gate.",
    deliverable:
      "1-page 30-day readout deck · shared with founder/CEO · archived in team's drive",
  },
  {
    week: 4,
    title: "Document the canonical 12-month roadmap + Path progression gates",
    action:
      "Day 28: document the canonical 12-month roadmap + the Path progression gates. If Path B + D-21 readout shows >5,000 orders/mo: start the Path C RFQ cycle (4-6 3PLs including SFN + Stord + Flowspace + Extensiv). If Path B + D-21 readout shows <5,000 orders/mo: stay on Path B + iterate on per-region routing + dimensional-weight cap + zone-skipping discount. Quarterly cadence (Q1 / Q2 / Q3 / Q4) for the next 12 months: re-bid cycle + QBR + cross-region NPS cohort readout + per-region international expansion decision. Archive the roadmap in the team wiki + share with the founder / CEO.",
    deliverable:
      "12-month roadmap + Path progression gates documented · archived in team wiki",
  },
  {
    week: 4,
    title: "Move #14 + Move #11 + Move #28 cross-roadmap integration",
    action:
      "Day 29: cross-wire Move #14 (3PL migration) with Move #11 (subscription replenishment) + Move #28 (returns portal orchestration). The 3PL's pick-pack workflow handles the subscription SKUs with the right kitting + ship-cadence. The returns portal (Loop / Returnly / Narvar per Move #28) handles the 3PL-fulfilled order returns + exchanges + store-credit. Confirm: (a) the 3PL WMS exposes the subscription-ship-cadence hook to Recharge / Skio / Bold (per Move #11), (b) the returns portal exposes the 3PL-fulfilled-return hook to Loop / Returnly / Narvar (per Move #28), (c) the Triple Whale cohorts show subscription-LTV × 3PL-region × return-rate × NPS slice.",
    deliverable:
      "Move #14 + Move #11 + Move #28 cross-roadmap integration verified · Triple Whale cohorts show subscription-LTV × 3PL-region × return-rate × NPS slice",
  },
  {
    week: 4,
    title: "Final 30-day readout + Path B → Path C decision + team retrospective",
    action:
      "Day 30: pull the final 30-day readout from Triple Whale + the per-region dashboards. Compute: ship-cost savings / month + ship-time improvement days + RTO rate + NPS-by-fulfillment-channel + Year-1 incremental net + Year-2 ROI ratio. Decide: (a) stay on Path B, (b) ramp to Path C (5,000+ orders/mo → 4-6 3PLs + Extensiv WMS), (c) pause + iterate. Run a 1-hour team retrospective: what surprised us, what we'd do differently, what the next 30 days look like, who owns which decision. Document the retrospective in the team wiki + share with the founder / CEO.",
    deliverable:
      "Final 30-day readout + Path B → Path C decision · 1-hour team retrospective · retrospective doc archived",
  },
];

/**
 * Build the 30-day launch plan from the operator's saved 3PL inputs.
 * Falls back to the canonical 2,500 orders/mo · $75 AOV · $8.50 ship
 * cost · 3.0 day ship time · 5% international Path B defaults if no
 * inputs are supplied.
 *
 * Reads Your-store from localStorage via `loadYourStore()`; if absent,
 * `yourStore` is null and the snapshot uses only the 3PL inputs.
 */
export function buildThreeplLaunchPlan(opts?: {
  inputs?: Partial<BrandOpsInputs>;
  startDate?: string;
}): ThreeplLaunchPlanPayload {
  const inputs: BrandOpsInputs = {
    ...THREEPL_DEFAULTS,
    ...(opts?.inputs ?? {}),
  };
  const yourStore = loadYourStore();
  const recommendation = recommendPath(inputs);
  const perPath = projectPerPathSavings(inputs, recommendation);

  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: ThreeplLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    inputs,
    yourStore,
    recommendation,
    perPath,
    days,
  };
}

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function threeplPlanDayDate(
  startIso: string,
  day: number
): string {
  return isoDateAt(new Date(startIso + "T00:00:00Z"), day - 1);
}

/**
 * Render the plan as a paste-ready markdown checklist. Each day has a
 * `- [ ] ` checkbox so when the operator pastes into Linear / Notion /
 * GitHub Issues / Google Tasks, ticks remain functional.
 */
export function threeplPlanToMarkdown(
  plan: ThreeplLaunchPlanPayload
): string {
  const r = plan.recommendation;
  const pathLabel = pathLongName(r.path);

  const roiLow = r.year1RoiLow;
  const roiHigh = r.year1RoiHigh;
  const roiStr =
    !Number.isFinite(roiLow) || !Number.isFinite(roiHigh)
      ? "—"
      : roiLow === roiHigh
        ? `${roiLow.toFixed(1)}:1`
        : `${roiLow.toFixed(1)}-${roiHigh.toFixed(1)}:1`;

  const shipSavingsLow = (r.shipCostSavingsPctLow * 100).toFixed(0);
  const shipSavingsHigh = (r.shipCostSavingsPctHigh * 100).toFixed(0);
  const shipTimeLow = r.shipTimeImprovementDaysLow.toFixed(1);
  const shipTimeHigh = r.shipTimeImprovementDaysHigh.toFixed(1);

  const lines: string[] = [];
  lines.push(`# 3PL Migration launch plan`);
  lines.push("");
  lines.push(
    `**Move #14 — ${pathLabel} · ${r.threeplDefault} · ${plan.days.length}-day checklist**`
  );
  lines.push("");
  lines.push(`**Plan start:** ${plan.startDate}`);
  lines.push(`**Generated:** ${plan.generatedAt}`);
  lines.push("");
  lines.push(`## Snapshot`);
  lines.push("");
  lines.push(`- **Path verdict:** Path ${r.path} — ${pathLabel}`);
  lines.push(
    `- **3PL stack:** ${r.warehouses.length} warehouse(s) · ${r.threeplDefault}`
  );
  lines.push(
    `- **Year-1 incremental net:** $${Math.round(r.year1IncrementalNetLow).toLocaleString("en-US")}–$${Math.round(r.year1IncrementalNetHigh).toLocaleString("en-US")}`
  );
  lines.push(`- **Year-1 ROI:** ${roiStr}`);
  lines.push(
    `- **Ship-cost savings:** ${shipSavingsLow}-${shipSavingsHigh}% (canonical 6-20%)`
  );
  lines.push(
    `- **Ship-time improvement:** ${shipTimeLow}-${shipTimeHigh} days (canonical 0.5-1.5)`
  );
  if (plan.yourStore) {
    lines.push(
      `- **Your store:** ${plan.yourStore.aov.toFixed(0)} AOV · ${plan.yourStore.monthlyOrders.toLocaleString("en-US")} orders/mo · ${(plan.yourStore.grossMargin * 100).toFixed(0)}% margin`
    );
  } else {
    lines.push(
      `- **Your store:** not set — the calculator used the canonical 2,500 orders/mo · $75 AOV defaults`
    );
  }
  lines.push("");
  lines.push("## Build sequence (canonical)");
  lines.push("");
  for (const step of r.buildSequence) {
    lines.push(`- ${step}`);
  }
  lines.push("");
  lines.push("## 30-day checklist");
  lines.push("");

  let currentWeek = 0;
  for (const d of plan.days) {
    if (d.week !== currentWeek) {
      currentWeek = d.week;
      lines.push(`### Week ${currentWeek} — ${weekTheme(currentWeek)}`);
      lines.push("");
    }
    const dateStr = threeplPlanDayDate(plan.startDate, d.day);
    lines.push(`- [ ] **Day ${d.day} (${dateStr}) — ${d.title}**`);
    lines.push(`  - Action: ${d.action}`);
    lines.push(`  - Deliverable: ${d.deliverable}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    `_Generated ${plan.generatedAt} from ecommerce-ops-dashboard / 3pl-launch-plan._`
  );
  lines.push("");
  lines.push(
    `_Same math as \`scripts/threepl_unit_economics.py\` + playbook 14 §Phase 1-4._`
  );
  return lines.join("\n");
}

function pathLongName(path: PathName): string {
  if (path === "A") return "Path A — Sub-500 orders/mo (DEFER; canonical 3PL break-even floor)";
  if (path === "B") return "Path B — 500-5,000 orders/mo (ShipBob + ShipMonk + Red Stag DEFAULT)";
  return "Path C — 5,000+ orders/mo (ShipBob Pro + ShipMonk Pro + SFN + Stord + Flowspace + Extensiv)";
}

function weekTheme(week: number): string {
  if (week === 1) return "RFQ + 8-prereq brief + 3PL shortlist";
  if (week === 2) return "Contract + 8-SLA-defense clauses + WMS build + Triple Whale overlay";
  if (week === 3) return "Inventory pull + per-region 3PL inbound + soft-launch 10% → 50% → 100%";
  return "D-21 readout + 30-day program readout + annual contract re-bid";
}