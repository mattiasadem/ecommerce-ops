/**
 * `affiliate-launch-plan.ts` — Pure generator for the 30-day Affiliate
 * Program launch plan.
 *
 * Reads the operator's saved `BrandAffiliateInputs` from localStorage
 * (via the component layer), overlays the Your-store AOV / monthly
 * orders / gross margin (when present), and produces a calendar-ready,
 * day-by-day markdown checklist broken into 4 weeks of work:
 *
 *   W1 (Days 1–7)   — Tool pick (Refersion / Levanta / Impact / GoAffPro /
 *                       PartnerStack / Aspire), tier + commission config,
 *                       cookie-attribute decisions, affiliate contract /
 *                       FTC-disclosure template, payment-rail setup
 *   W2 (Days 8–14)  — Recruitment outreach (50–200 candidate list per
 *                       Path), application-page build, KPI dashboard wiring
 *                       (Triple Whale cohort + Klaviyo flow + Smile tier)
 *   W3 (Days 15–21) — Soft-launch to 10% traffic, ramp to 50% then 100%,
 *                       Day-1 / Day-7 / Day-14 readouts (attributed-rev per
 *                       affiliate, EPC, AOV uplift, cookie-attribution rate)
 *   W4 (Days 22–30) — Day-21 / Day-25 / Day-30 readouts (per-affiliate
 *                       lifetime-value, AOV-band breakdown, repeat-buyer
 *                       behavior, FTC compliance pass), headline-tier
 *                       iteration, quarterly-compliance-audit backlog,
 *                       final 30-day program readout
 *
 * Each day has a single checkbox-able action (the operator pastes the
 * markdown into Linear / Notion / Google Cal and ticks them off). The
 * plan also surfaces a one-line health snapshot (recommended path +
 * year-1 attributed-revenue band + ROI ratio band + LTV multiplier +
 * year-1 affiliate-count band + sustainable-mission-alignment score) so
 * when the plan is shared in a standup, the team sees "what does this
 * look like" without opening the playbook.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component that calls this).
 */

import type { BrandAffiliateInputs } from "@/lib/affiliate";
import {
  AFFILIATE_DEFAULTS,
  recommendPath,
  type PathRecommendation,
} from "@/lib/affiliate";
import { loadYourStore } from "@/lib/your-store";

export interface AffiliateLaunchPlanDay {
  day: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  deliverable: string;
}

export interface AffiliateLaunchPlanPayload {
  generatedAt: string; // ISO timestamp
  startDate: string; // operator-pickable plan start (default = today)
  inputs: BrandAffiliateInputs;
  yourStore: {
    aov: number;
    monthlyOrders: number;
    grossMargin: number;
  } | null;
  recommendation: PathRecommendation;
  days: AffiliateLaunchPlanDay[];
}

const PLAN_DAYS: Omit<AffiliateLaunchPlanDay, "day">[] = [
  // --- Week 1 — Tool pick, config, contracts, payment ---------------------
  {
    week: 1,
    title: "Pick the affiliate platform (Refersion / Levanta / Impact / GoAffPro / PartnerStack / Aspire)",
    action:
      "Decide on Refersion vs Levanta vs Impact vs GoAffPro vs PartnerStack vs Aspire based on (a) whether the recommended path from the calculator is A / B / C, (b) existing Klaviyo + Triple Whale + Smile stack, (c) the platform's flat-fee vs revenue-share pricing, and (d) the network-of-networks overlap (Impact + PartnerStack dominate mid-tier; Levanta is best-of-breed for Amazon-creator cross-listing; Refersion is the lowest-friction starter). Add admin user, billing, SSO. Confirm growth-tier pricing covers monthly GMV.",
    deliverable:
      "Affiliate platform picked · admin user added · billing approved",
  },
  {
    week: 1,
    title: "Pull trailing-30-day baseline GMV / AOV / order-mix",
    action:
      "Export the trailing-30-day GMV, AOV, product-mix, and channel-mix from Shopify + Triple Whale. Confirm the volume matches the calculator's `usGmv` + `aov` inputs (default = $2M / $50). Save as the baseline so the year-1 attributed-revenue readouts are real, not aspirational.",
    deliverable:
      "Baseline CSV exported (date / order_id / AOV / category / channel / buyer)",
  },
  {
    week: 1,
    title: "Configure base commission tier + cookie window",
    action:
      "Set the base commission tier (calculator default = 10%, range 5–25% per DTC-brand size and vertical). Set the cookie window (30 days default, 60 days for sustainable-voice brands, 7 days for high-velocity consumables). Document the rationale + the voice-profile override (e.g. gen-z brands may go to 15% to attract tier-2 creators; luxury brands may stay at 8% to protect margin).",
    deliverable:
      "Base commission + cookie-window doc with rationale + voice-profile override",
  },
  {
    week: 1,
    title: "Configure tiered-commission structure (Tier 1/2/3 + bonus)",
    action:
      "Configure the 3-tier commission structure: Tier 1 (0–5 sales/mo = base %), Tier 2 (6–20 = base + 25% bonus), Tier 3 (20+ = base + 50% bonus). Set a one-time activation bonus ($25–$50 paid on first sale) to incentivize the recruitment-to-first-sale gap. Add a quarterly performance bonus ($250–$1,000 for hitting GMV + AOV bands).",
    deliverable:
      "3-tier commission structure + activation + quarterly-bonus doc",
  },
  {
    week: 1,
    title: "Decide cookie-attribution model (last-click vs first-click vs multi-touch)",
    action:
      "Decide the cookie-attribution model. Last-click is the default (and matches Triple Whale's 'paid' attribution). First-click rewards recruitment (the affiliate who introduced the buyer). Multi-touch is best-of-breed but requires a Triple Whale + customer-data-platform overlay. Document the chosen model + the override that fires when Klaviyo + Smile are both wired (i.e. loyalty-cohort customers get first-click attribution to the affiliate who recruited them).",
    deliverable:
      "Cookie-attribution model doc with Klaviyo + Smile override rules",
  },
  {
    week: 1,
    title: "Draft the affiliate contract + FTC disclosure template",
    action:
      "Draft the affiliate contract (or use the platform's template): exclusivity clause, payment terms (Net-30 / Net-60), prohibited-content list, FTC-disclosure language ('#ad / #sponsored in first 3 words'), prohibited-vertical list, termination clause. Customize per voice profile (luxury brands are stricter; gen-z brands are looser). Have legal sign off before recruitment starts.",
    deliverable:
      "Affiliate contract + FTC-disclosure template signed off by legal",
  },
  {
    week: 1,
    title: "Wire the payment rail (PayPal Mass-Pay / Tipalti / direct ACH)",
    action:
      "Configure the affiliate payment rail. PayPal Mass-Pay is the lowest-friction starter (1.5% fee, instant). Tipalti handles international affiliates and 1099/W-8BEN tax forms (2.5% fee, Net-30). Direct ACH via the platform is free but slower (Net-60). Document the choice + the threshold for switching rails as the program scales past 50 affiliates.",
    deliverable:
      "Payment rail live · first test-payout sent ($1 to the operator's own account)",
  },

  // --- Week 2 — Recruitment, application page, KPI dashboard ---------------
  {
    week: 2,
    title: "Build the 50–200 candidate affiliate list",
    action:
      "Build the recruitment candidate list. Pull from: (a) the brand's existing customer list (top 5% by LTV are 5× more likely to apply), (b) past UGC / organic-creator partnerships, (c) the platform's own discovery tab, (d) Aspire / Upfluence / CreatorIQ filtered search, (e) Twitter / TikTok / Instagram hashtag search. Target 50–200 candidates (the calculator's Path-B default = 25; Path-C = 100+).",
    deliverable:
      "Candidate list (CSV) with creator handle / email / audience size / engagement rate / niche / voice-profile-fit",
  },
  {
    week: 2,
    title: "Build the application page + FTC-disclosure copy",
    action:
      "Build the affiliate-program application page. Fields: name, email, social handles (TikTok / Instagram / YouTube / Twitter / Pinterest / Twitch), audience size, engagement rate, niche, audience geo, FTC-compliance agreement, contract agreement, payment-method pick. Include a 'why do you want to partner with us' essay field. The page must be linked from the footer + the post-purchase thank-you page (catches buyer-affiliates).",
    deliverable:
      "Application page live at /affiliates/apply (or platform-equivalent) + footer + thank-you-page links",
  },
  {
    week: 2,
    title: "Run first outreach batch (50 personalized DMs)",
    action:
      "Send 50 personalized outreach DMs (NOT a copy-paste blast). The DM template: (1) reference the creator's last 3 posts by name, (2) explain why the brand fits their niche, (3) offer the base commission + activation bonus, (4) link the application page. Goal: 10–15% application rate (5–8 applications per 50 DMs). Document the response rate by voice profile + tier.",
    deliverable:
      "50 DMs sent · application-rate + voice-profile-fit baseline recorded",
  },
  {
    week: 2,
    title: "Wire Triple Whale cohort + Klaviyo flow + Smile tier overlay",
    action:
      "Wire the affiliate-program cohort into the existing analytics stack. Triple Whale: add a 'via-affiliate' paid-attribution channel + a per-affiliate-cohort report. Klaviyo: add a 'affiliate-applicant-welcome' flow (5 emails over 14 days) + a 'affiliate-first-sale' celebration flow. Smile: add an 'affiliate' loyalty-tier with a 2× points multiplier (rewards the affiliate-as-buyer behavior).",
    deliverable:
      "Triple Whale cohort + Klaviyo flows + Smile tier verified end-to-end with sample-affiliate walkthrough",
  },
  {
    week: 2,
    title: "Build the per-affiliate KPI dashboard",
    action:
      "Build (or use the platform's) per-affiliate KPI dashboard. Fields: total attributed revenue, EPC (earnings-per-click), conversion rate, AOV-uplift, repeat-buyer-rate, fraud-score, FTC-compliance-status, payment-status. Goal: the operator can answer 'is affiliate X worth keeping?' in <60 seconds. Document the read-write access (the affiliate sees their own; the operator sees the full list).",
    deliverable:
      "Per-affiliate KPI dashboard live · read-write access documented",
  },
  {
    week: 2,
    title: "Create the affiliate resource hub (brand-voice guide, assets, promo codes)",
    action:
      "Create the affiliate resource hub. Sections: (a) brand-voice guide (voice profile + sample captions), (b) product hero-shots + 30-second video clips, (c) 10 paste-ready captions per voice profile × 5 platforms, (d) unique promo-code generator (10% off default, configurable per affiliate), (e) FTC-compliance checklist, (f) FAQ + contact form. Host on Notion / Brandfolder / platform's own asset library.",
    deliverable:
      "Affiliate resource hub live · first 3 affiliates onboarded with promo codes + access",
  },

  // --- Week 3 — Soft-launch, ramp, Day-1/7/14 readouts --------------------
  {
    week: 3,
    title: "Soft-launch to 10% of affiliate traffic",
    action:
      "Soft-launch the program to 10% of the affiliate traffic. Validate: (a) application-to-approval flow works end-to-end, (b) promo-code attribution is correct, (c) Triple Whale + Klaviyo + Smile overlays fire as expected, (d) payment rail completes a real $X payout, (e) FTC-disclosure language is present on every affiliate creative. Catch bugs before scaling to 50% then 100%.",
    deliverable:
      "10% soft-launch live · first 3 affiliate-orders attributed + paid out",
  },
  {
    week: 3,
    title: "Day-1 readout: traffic + first-sale rate + EPC",
    action:
      "Run the Day-1 readout. Pull from the per-affiliate KPI dashboard: total clicks (across all affiliates), first-sale count, first-sale rate, EPC, fraud-score, top-affiliate-by-EPC. Compare against the calculator's projected per-affiliate revenue band (Path B = $2,000–$8,000/affiliate/yr; Path A = $5,000–$15,000/yr; Path C = $15,000–$50,000/yr). Catch Day-1 issues: low traffic (recruitment is the bottleneck), low conversion (offer-fit is wrong), high fraud (Klaviyo + Smile tiering didn't catch it).",
    deliverable:
      "Day-1 readout doc with traffic / first-sale / EPC / fraud + action items",
  },
  {
    week: 3,
    title: "Ramp to 50% of affiliate traffic + 5 more outreach DMs",
    action:
      "Ramp from 10% to 50% of affiliate traffic. Validate the same metrics are stable as traffic grows. Send 5 more outreach DMs per day (target = 35 more applications by end of W3). Re-evaluate the recruitment list: which voice profiles are converting to applications? Which are not? Adjust the W4 outreach to double-down on what works.",
    deliverable:
      "50% ramp live · 35 more applications by end of W3 · voice-profile-conversion-rate updated",
  },
  {
    week: 3,
    title: "Day-7 readout: per-affiliate revenue + retention-rate",
    action:
      "Run the Day-7 readout. Pull: per-affiliate attributed-revenue, per-affiliate first-sale-rate, per-affiliate repeat-buyer-rate (the cookie-attribution model's effectiveness), per-tier (Tier 1/2/3) revenue share, top-affiliate concentration (top 20% driving 80% of revenue is the canonical Pareto). Catch: any affiliate with EPC < $0.10 (cut them or move to Tier 1), any affiliate with high fraud-score (cut immediately).",
    deliverable:
      "Day-7 readout doc with per-affiliate + per-tier + top-20% Pareto analysis",
  },
  {
    week: 3,
    title: "Day-14 readout: AOV-uplift + FTC-compliance pass",
    action:
      "Run the Day-14 readout. Pull: AOV-uplift on affiliate-driven orders (vs the baseline $50 AOV — the canonical target is +20–35% AOV uplift per Levanta case studies), FTC-compliance audit (every affiliate creative in the last 14 days has '#ad' or '#sponsored' in the first 3 words), FTC-violation warnings sent, top-3 AOV-uplift-affiliates, repeat-buyer cohort overlap with the Klaviyo + Smile flows.",
    deliverable:
      "Day-14 readout doc with AOV-uplift + FTC-compliance + repeat-buyer analysis",
  },
  {
    week: 3,
    title: "Ramp to 100% + run 100 more DMs (Path B/C scale)",
    action:
      "Ramp from 50% to 100% of affiliate traffic. Send 100 more outreach DMs across the W3-tested voice profiles that converted. Validate the program is at steady-state: every metric is trending in the calculator's projected band. Document the recruitment-rate ceiling (W4 may need to switch from cold DMs to warm intros / platform-discovery tab to scale further).",
    deliverable:
      "100% ramp live · 100 more DMs sent · recruitment-rate-ceiling documented",
  },

  // --- Week 4 — Day-21/25/30 readouts, iteration, quarterly-audit backlog --
  {
    week: 4,
    title: "Day-21 readout: per-affiliate LTV + repeat-buyer cohort",
    action:
      "Run the Day-21 readout. Pull: per-affiliate lifetime-value (revenue per affiliate × repeat-buyer rate), per-affiliate repeat-buyer rate (cookie-attribution model's effectiveness), Klaviyo-flow conversion-rate for affiliate-driven buyers, Smile-loyalty-enrollment rate for affiliate-driven buyers, top-3 LTV-affiliates (these are the 'whales' — promote to Tier 3 + offer a quarterly bonus).",
    deliverable:
      "Day-21 readout doc with LTV + repeat-buyer + Klaviyo + Smile analysis",
  },
  {
    week: 4,
    title: "Day-25 readout: AOV-band breakdown + voice-profile fit",
    action:
      "Run the Day-25 readout. Pull: AOV-band breakdown (which AOV-band drives the most affiliate revenue? >$100 orders should be 40–60% of total per Levanta case studies), per-voice-profile revenue share (gen-z / sustainable / luxury / b2b), per-tier (Tier 1/2/3) revenue share, fraud-score trends. Catch: any voice-profile that's underperforming (rebalance the W4 outreach), any tier that's over- or under-concentrated.",
    deliverable:
      "Day-25 readout doc with AOV-band + voice-profile + tier + fraud trends",
  },
  {
    week: 4,
    title: "Day-30 readout: ROI ratio + year-1 forecast",
    action:
      "Run the Day-30 readout. Compute the actual ROI ratio = (attributed-revenue × gross-margin) / (program cost = platform fee + commission + activation + quarterly-bonus). Compare to the calculator's projected band: Path A 5:1–10:1, Path B 3:1–7:1, Path C 8:1–20:1. Forecast year-1 attributed-revenue using the Day-30 × 12 extrapolation. Catch: if actual ROI is <50% of the projected band, the program has a structural issue (recruitment, voice-fit, or platform choice).",
    deliverable:
      "Day-30 readout doc with ROI-ratio + year-1-forecast + structural-issue diagnosis",
  },
  {
    week: 4,
    title: "Promote top 3 affiliates to Tier 3 + quarterly-bonus",
    action:
      "Promote the top 3 affiliates (by Day-30 EPC × repeat-buyer-rate) to Tier 3 + activate the quarterly-bonus structure. Send each a personal email from the founder. Document the rationale + the criteria for future Tier-3 promotions (top 5% of affiliates by Day-30 metrics). This is the single highest-leverage Day-30 action: 80% of the program revenue typically comes from the top 20% of affiliates.",
    deliverable:
      "Top 3 affiliates promoted to Tier 3 · quarterly-bonus activated · promotion-criteria documented",
  },
  {
    week: 4,
    title: "Cut the bottom 10% of affiliates (Day-30 churn)",
    action:
      "Cut the bottom 10% of affiliates (by Day-30 EPC). Send each a polite 'we're deactivating your account' email with a 'reapply in 60 days' link. The bottom 10% are the canonical 'EPC < $0.05' segment that costs more in platform fees + FTC-compliance time than they bring in revenue. Document the cut-criteria + the reapplication-process.",
    deliverable:
      "Bottom 10% of affiliates cut · cut-criteria + reapplication-process documented",
  },
  {
    week: 4,
    title: "Quarterly-compliance-audit + 1099/W-8BEN backlog",
    action:
      "Run the quarterly compliance audit. (a) FTC-compliance: every affiliate creative in the last 30 days has '#ad' or '#sponsored' in the first 3 words. (b) Tax-compliance: every US-affiliate earning >$600/yr has a W-9 on file; every international affiliate has a W-8BEN. (c) Brand-safety: every affiliate creative is on-brand (no off-voice / off-niche / off-vertical content). Document the audit results + the W-9/W-8BEN backlog to clear in Q1 of next quarter.",
    deliverable:
      "Compliance audit doc · W-9/W-8BEN backlog documented · Q1 backlog cleared",
  },
  {
    week: 4,
    title: "Headline-tier iteration + 90-day plan",
    action:
      "Run the headline-tier iteration. Day-30 data shows which voice-profile × platform × offer-message combination drives the most first-sale-rate. Lock the top 3 winning combinations as the 'always-on' affiliate-program creative. Document the 90-day plan: (a) recruitment-rate target, (b) application-to-approval-rate target, (c) first-sale-rate target, (d) repeat-buyer-rate target, (e) ROI-ratio target. Share with the team's Q1 priorities.",
    deliverable:
      "Headline-tier iteration + 90-day plan doc with Q1 priority alignment",
  },
  {
    week: 4,
    title: "Final 30-day program readout + Q1 kickoff",
    action:
      "Run the final 30-day program readout. Compare actual vs projected on every metric (attributed-revenue, affiliate-count, AOV-uplift, repeat-buyer-rate, ROI-ratio). Build a slide-ready summary. Kick off Q1 with: (a) the 90-day plan, (b) the W-9/W-8BEN backlog, (c) the headline-tier-iteration winners, (d) the next quarterly-compliance-audit date, (e) the cross-page-intelligence links (Move #14 attribution overlay + Move #8 loyalty tier + Move #16 itself).",
    deliverable:
      "Final 30-day readout slide + Q1 kickoff agenda with cross-page-intelligence links",
  },
  {
    week: 4,
    title: "Q1 backlog + iteration register + next-tick hand-off",
    action:
      "Close the W1–W4 launch. Document: (a) Q1 backlog (recruitment, platform-tier upgrades, additional voice profiles, international expansion), (b) iteration register (every Day-30 hypothesis that didn't pan out, + what to test in Q1), (c) next-tick hand-off notes (what should the next Move-#16-* tick cover? — e.g. Move #16.1 voice-profile expansion, Move #16.2 international-affiliate compliance, Move #16.3 per-platform-creator-tier).",
    deliverable:
      "Q1 backlog + iteration register + next-tick hand-off doc · Move-#16 launch complete",
  },
];

export function buildAffiliateLaunchPlan(opts?: {
  inputs?: BrandAffiliateInputs;
  startDate?: string;
}): AffiliateLaunchPlanPayload {
  const inputs: BrandAffiliateInputs = opts?.inputs ?? AFFILIATE_DEFAULTS;
  const startIso = opts?.startDate ?? new Date().toISOString().slice(0, 10);

  // 30 days, grouped into W1 (7 days) + W2 (7 days) + W3 (7 days) + W4 (9 days)
  const days: AffiliateLaunchPlanDay[] = PLAN_DAYS.map((p, i) => ({
    day: i + 1,
    ...p,
  }));

  // Build the recommendation (same path the calculator's "Recommended path"
  // card surfaces). Captures every ROI / cost / count band the snapshot
  // needs without re-deriving the math in the markdown renderer.
  const recommendation = recommendPath(inputs);

  // Your-store overlay (aov / orders / margin from Overview) — purely
  // informational, doesn't feed the math but appears in the snapshot
  // block so the operator sees "your numbers" alongside the plan.
  const yourStore = (() => {
    if (typeof window === "undefined") return null;
    try {
      const ys = loadYourStore();
      if (!ys) return null;
      return {
        aov: ys.aov ?? 0,
        monthlyOrders: ys.monthlyOrders ?? 0,
        grossMargin: ys.grossMargin ?? 0,
      };
    } catch {
      return null;
    }
  })();

  return {
    generatedAt: new Date().toISOString(),
    startDate: startIso,
    inputs,
    yourStore,
    recommendation,
    days,
  };
}

function isoDateAt(d: Date, dayOffset: number): string {
  const d2 = new Date(d);
  d2.setDate(d.getDate() + dayOffset);
  return d2.toISOString().slice(0, 10);
}

/** Compute day N's calendar date relative to the plan start (ISO yyyy-mm-dd). */
export function affiliatePlanDayDate(
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
export function affiliatePlanToMarkdown(
  plan: AffiliateLaunchPlanPayload
): string {
  const r = plan.recommendation;
  const roiLow = r.year1AttributedRevenueLow * 0.4; // very rough — actual
  const roiHigh = r.year1AttributedRevenueHigh * 0.4; // math is in the calculator
  const roiStr =
    r.year1CostHigh > 0
      ? `${(r.year1AttributedRevenueLow / Math.max(1, r.year1CostHigh)).toFixed(1)}× – ${(
          r.year1AttributedRevenueHigh / Math.max(1, r.year1CostLow)
        ).toFixed(1)}×`
      : "—";

  const yourStoreLine = plan.yourStore
    ? `\n- **Your-store overlay:** AOV $${plan.yourStore.aov.toFixed(
        2
      )} · ${plan.yourStore.monthlyOrders.toLocaleString()} orders/mo · ${(
        plan.yourStore.grossMargin * 100
      ).toFixed(1)}% gross margin\n`
    : "";

  const lines: string[] = [
    `# Affiliate Program Launch Plan — ${plan.startDate}`,
    "",
    `> Move #16 — always-on Affiliate / Creator / Influencer program. Same math as \`scripts/affiliate_unit_economics.py\`.`,
    "",
    `## Snapshot`,
    "",
    `- **Recommended path:** ${r.path} (${r.defaultPlatformPick})`,
    `- **Year-1 attributed-revenue band:** $${r.year1AttributedRevenueLow.toLocaleString()} – $${r.year1AttributedRevenueHigh.toLocaleString()}`,
    `- **Year-1 cost band:** $${r.year1CostLow.toLocaleString()} – $${r.year1CostHigh.toLocaleString()}`,
    `- **Year-1 affiliate-count band:** ${r.year1AffiliateCountLow} – ${r.year1AffiliateCountHigh}`,
    `- **LTV multiplier band:** ${r.ltvMultiplierLow.toFixed(2)}× – ${r.ltvMultiplierHigh.toFixed(2)}×`,
    `- **Cookie-deprecation recovery band:** ${(r.cookieDeprecationRecoveryPctLow * 100).toFixed(0)}% – ${(r.cookieDeprecationRecoveryPctHigh * 100).toFixed(0)}%`,
    `- **Sustainable-mission-alignment score band:** ${r.sustainableMissionAlignScoreLow} – ${r.sustainableMissionAlignScoreHigh}`,
    `- **ROI ratio band (attributed-rev / program-cost):** ${roiStr}`,
    yourStoreLine.trim(),
    `## 30-day checklist`,
    "",
  ];

  for (const d of plan.days) {
    const dayDate = affiliatePlanDayDate(plan.startDate, d.day);
    lines.push(
      `### Day ${d.day} — ${dayDate} — ${d.title}`,
      "",
      `- [ ] **Action:** ${d.action}`,
      "",
      `- [ ] **Deliverable:** ${d.deliverable}`,
      ""
    );
  }

  lines.push(
    "_Generated by Ecommerce Ops dashboard · /affiliate-program-launch-plan · Move #16 always-on Affiliate Program._"
  );

  return lines.join("\n");
}
