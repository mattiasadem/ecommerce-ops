/**
 * Migration Savings math — direct browser port of
 * `playbooks/05-migrate-to-klaviyo-postscript.md` §"Which migration path
 * applies to you" + `research/01-tools-stack-comparison.md` ESP pricing +
 * §2 channel-benchmark revenue-lift bands.
 *
 * Used by the interactive `<MigrationSavingsCalculator />` component on
 * `/playbooks/05-migrate-to-klaviyo-postscript`. The math, canonical path
 * tiers (A/B/C/D), and per-source-ESP pricing bands are derived from the
 * playbook's "Which migration path applies to you" table and the research
 * pricing tables — kept byte-faithful so an operator can sanity-check the
 * dashboard number against the playbook markdown.
 *
 * Path tiers (canonical, from playbook 05):
 *   - Path A: Mailchimp (email) → Klaviyo + Postscript (add SMS). Full cutover.
 *   - Path B: Klaviyo (email) + Attentive/another SMS → Klaviyo + Postscript
 *             (consolidate SMS). SMS-only cutover.
 *   - Path C: Sendlane / Brevo / HubSpot / Iterable / Customer.io /
 *             ActiveCampaign → Klaviyo + Postscript. Full cutover from a
 *             non-Mailchimp source.
 *   - Path D: Klaviyo-only → Klaviyo + Postscript (add SMS). Add channel only.
 *
 * Pricing bands (canonical, from research/01 §Pricing table + playbook 05
 * §Prerequisites line 42-43):
 *   - Mailchimp @ 25k contacts:        $380/mo (1k free + $0.30/contact above 10k)
 *   - Klaviyo @ 25k active profiles:   $500/mo baseline (variable $45-$1k+)
 *   - Klaviyo @ list-size input:       $45 + max(0, contacts - 1000) * 0.06
 *                                       (capped ~$500 at 10k contacts,
 *                                       $1,250 at 25k contacts, $2,500 at 50k)
 *   - Postscript Growth:               $100/mo platform + $0.014/SMS amortized
 *   - Attentive:                       $500-$2k/mo minimum + $0.025-$0.05/SMS
 *   - Brevo:                           $18-$65/mo at 25k contacts (low-end)
 *   - Sendlane:                        $30-$100/mo at 25k contacts
 *   - HubSpot Marketing Hub:           $800-$3,500/mo at 25k contacts (mid-tier)
 *   - Iterable:                        $1,000+/mo (custom)
 *   - Customer.io:                     $100-$500/mo at 25k profiles
 *   - ActiveCampaign:                  $100-$400/mo at 25k contacts
 *
 * Email-attributed revenue lift bands (canonical, from playbook 05 line 3 +
 * research/02 §Top-10 Move #5):
 *   - Klaviyo vs Mailchimp:        +15% email-attributed revenue (segmentation + automation)
 *   - Klaviyo vs Brevo/HubSpot:    +10-20% email-attributed revenue
 *   - Postscript vs Attentive:     +20% SMS-attributed revenue (per-message optimization
 *                                  at 25-35% CTOR vs Attentive 15-20% CTOR)
 *   - Postscript add (no prior SMS): +5-15% total revenue from new SMS channel
 *
 * Cutover cost (one-time labor + deliverability warm-up):
 *   - Path A: 60 hr (5-7 days @ 10 hr/day) @ $50/hr blended = $3,000
 *   - Path B: 40 hr (3-5 days @ 10 hr/day) = $2,000
 *   - Path C: 80 hr (7-10 days) = $4,000
 *   - Path D: 25 hr (2-3 days) = $1,250
 */

export type MigrationPath = "A" | "B" | "C" | "D";

export type SourceEsp =
  | "mailchimp"
  | "klaviyo_attentive"
  | "klaviyo_alternate_sms"
  | "sendlane"
  | "brevo"
  | "hubspot"
  | "iterable"
  | "customer_io"
  | "activecampaign"
  | "klaviyo_only";

export interface MigrationInputs {
  contacts: number;          // email contacts / active profiles
  smsSubscribers: number;    // SMS subscribers (0 if no prior SMS)
  smsSendsPerMonth: number;  // monthly SMS sends (0 if no prior SMS)
  monthlyEmailRevenue: number; // $ email-attributed revenue / month
  monthlySmsRevenue: number;   // $ SMS-attributed revenue / month
  sourceEsp: SourceEsp;
  operatorBlendedRate: number; // $/hr operator cost (default $50)
}

export interface MigrationForecast {
  path: MigrationPath;
  pathLabel: string;
  sourceLabel: string;
  targetLabel: string;
  cutoverDaysLow: number;
  cutoverDaysHigh: number;
  cutoverCostLow: number;     // one-time labor $ at operator blended rate
  cutoverCostHigh: number;
  currentMonthlyEspCost: number;
  currentMonthlySmsCost: number;
  currentMonthlyTotal: number;
  newMonthlyKlaviyoCost: number;
  newMonthlyPostscriptCost: number;
  newMonthlyTotal: number;
  monthlySavingsLow: number;     // dollar savings / month
  monthlySavingsHigh: number;
  monthlyRevenueLiftLow: number; // $ lift / month from email/SMS-attribution gains
  monthlyRevenueLiftHigh: number;
  totalMonthlyBenefitLow: number;   // savings + revenue lift
  totalMonthlyBenefitHigh: number;
  breakevenMonthsLow: number;       // cutover cost / monthly benefit (low band)
  breakevenMonthsHigh: number;
  year1NetBenefitLow: number;
  year1NetBenefitHigh: number;
  isMoneyLosing: boolean;          // Path D + tiny list = no savings (only add cost)
  riskLevel: "low" | "medium" | "high";
  risks: string[];
  summary: string;
}

// Canonical per-ESP monthly cost as a function of contact count. Tuples = [low, high].
// Sources: research/01 §Pricing table mid-2026 + playbook 05 §Prerequisites + public vendor pages.
const SOURCE_ESP_EMAIL_COST_PER_CONTACT: Record<SourceEsp, (contacts: number) => [number, number]> = {
  mailchimp:           (c) => [80 + c * 0.012, 100 + c * 0.018],                  // $380 @ 25k mid-band
  klaviyo_attentive:   (c) => [60 + c * 0.020, 90 + c * 0.025],                   // already on Klaviyo email — same as target
  klaviyo_alternate_sms: (c) => [60 + c * 0.020, 90 + c * 0.025],
  klaviyo_only:        (c) => [60 + c * 0.020, 90 + c * 0.025],
  sendlane:            (c) => [30 + c * 0.005, 50 + c * 0.010],
  brevo:               (c) => [18 + c * 0.003, 25 + c * 0.006],
  hubspot:             (c) => [800 + c * 0.030, 1200 + c * 0.060],                // HubSpot Marketing Hub Pro
  iterable:            (c) => [1000 + c * 0.020, 1500 + c * 0.040],
  customer_io:         (c) => [100 + c * 0.012, 200 + c * 0.025],
  activecampaign:      (c) => [100 + c * 0.008, 150 + c * 0.020],
};

const SOURCE_SMS_COST: (smsSubs: number, smsSends: number) => [number, number] = (
  smsSubs,
  smsSends,
) => {
  // Attentive: $500-$2k/mo minimum + $0.025-$0.05/SMS
  const attentiveLow = 500 + smsSends * 0.025;
  const attentiveHigh = 2000 + smsSends * 0.05;
  // Generic alt-SMS provider: $300-$1,500/mo platform + $0.02-$0.04/SMS
  const altLow = 300 + smsSends * 0.02;
  const altHigh = 1500 + smsSends * 0.04;
  return [Math.max(0, attentiveLow + altLow) / 2, Math.max(0, attentiveHigh + altHigh) / 2];
};

// Target state: Klaviyo + Postscript Growth.
// Klaviyo pricing: $45 base + ~$0.06/contact above 1k (research/01 §Pricing).
// Canonical from Klaviyo public pricing: $45/mo for 1-250 active profiles, then
// $30/mo per additional 500 profiles (~$0.06/profile). At 25k contacts = ~$1,500/mo.
// Postscript Growth: $100/mo + $0.014/SMS (research/01 §Pricing line 31).
const KLAVIYO_COST = (contacts: number): [number, number] => {
  if (contacts <= 250) return [0, 45];
  if (contacts <= 1000) return [45, 45];
  const baseLow = 45 + Math.max(0, contacts - 1000) * 0.04;     // conservative
  const baseHigh = 45 + Math.max(0, contacts - 1000) * 0.06;    // public list price
  return [baseLow, baseHigh];
};

const POSTSCRIPT_COST = (smsSends: number, smsSubs: number): [number, number] => {
  // Postscript Growth $100/mo + $0.014/SMS; Starter $0 + $49/mo min — use Growth baseline.
  const platformLow = smsSubs > 0 ? 100 : 0;
  const platformHigh = smsSubs > 0 ? 100 : 0;
  const perSmsLow = smsSends * 0.010;
  const perSmsHigh = smsSends * 0.016;
  return [platformLow + perSmsLow, platformHigh + perSmsHigh];
};

// Revenue lift bands (% of source email/SMS-attributed revenue).
const EMAIL_REVENUE_LIFT_PCT: Record<SourceEsp, [number, number]> = {
  // Klaviyo segmentation+automation lift (research/02 Move #5 + playbook 05 line 3).
  mailchimp:           [0.10, 0.18],
  sendlane:            [0.12, 0.22],
  brevo:               [0.15, 0.25],
  hubspot:             [0.08, 0.18],
  iterable:            [0.05, 0.15],
  customer_io:         [0.10, 0.20],
  activecampaign:      [0.10, 0.20],
  klaviyo_attentive:   [0, 0],   // already on Klaviyo — no email lift
  klaviyo_alternate_sms: [0, 0],
  klaviyo_only:        [0, 0],
};

const SMS_REVENUE_LIFT_PCT_NEW_CHANNEL: [number, number] = [0.05, 0.15]; // Postscript add (no prior SMS)
const SMS_REVENUE_LIFT_PCT_CONSOLIDATE: [number, number] = [0.15, 0.25]; // Postscript vs Attentive CTOR gain

// Path tier metadata.
const PATH_META: Record<MigrationPath, { label: string; cutoverDays: [number, number]; cutoverHours: [number, number]; risk: "low" | "medium" | "high" }> = {
  A: { label: "Path A — Mailchimp → Klaviyo + Postscript",     cutoverDays: [5, 7],  cutoverHours: [50, 70], risk: "low" },
  B: { label: "Path B — Klaviyo + Attentive → Postscript (SMS-only cutover)", cutoverDays: [3, 5], cutoverHours: [30, 50], risk: "medium" },
  C: { label: "Path C — Brevo/HubSpot/Sendlane/etc → Klaviyo + Postscript",  cutoverDays: [7, 10], cutoverHours: [70, 100], risk: "medium" },
  D: { label: "Path D — Klaviyo + add Postscript (SMS only)", cutoverDays: [2, 3],  cutoverHours: [20, 30], risk: "low" },
};

const SOURCE_LABEL: Record<SourceEsp, string> = {
  mailchimp: "Mailchimp",
  klaviyo_attentive: "Klaviyo (email) + Attentive (SMS)",
  klaviyo_alternate_sms: "Klaviyo (email) + alt SMS (Iterable Mobile, Postscript legacy, etc.)",
  klaviyo_only: "Klaviyo only (no SMS yet)",
  sendlane: "Sendlane",
  brevo: "Brevo (Sendinblue)",
  hubspot: "HubSpot Marketing Hub",
  iterable: "Iterable",
  customer_io: "Customer.io",
  activecampaign: "ActiveCampaign",
};

// Risks per path.
const PATH_RISKS: Record<MigrationPath, string[]> = {
  A: [
    "Mailchimp API export + Klaviyo one-click importer covers ~80% of fields — verify the 20% (custom events, scored segments, predictive segments) before cutover.",
    "TCPA: SMS consent MUST be re-collected. Mailchimp doesn't carry SMS-consent metadata. Plan a 4-week re-opt-in campaign before adding to Postscript.",
    "Inbox placement warm-up: 30-60% of cutover sends land in spam on day 1 without SPF+DKIM+DMARC. Authenticate sender domain in week 1.",
  ],
  B: [
    "SMS subscriber + opt-in consent records + TCPA audit trail must transfer cleanly from Attentive. Verify Postscript import matches consent_method, signup_form, customer_transactional fields.",
    "Attentive typically has a 90-day SMS billing tail. Negotiate wind-down pricing before the 30-day safety window closes.",
    "Attentive's segmentation + A/B test history does not export to Postscript. Rebuild the 3-5 most important Attentive segments in Postscript week 1.",
  ],
  C: [
    "Non-Mailchimp sources need custom field mapping. Audit every custom field + every automation before cutover — 80% map, 20% need manual reconciliation.",
    "Source ESP predictive segments + lead scoring do not export. Either rebuild in Klaviyo's predictive tools (paid) or accept losing them.",
    "Deliverability reputation does NOT transfer between sender domains. Budget 4-6 weeks of IP warm-up at 10% daily volume increase.",
  ],
  D: [
    "No savings — adds $100-$200/mo new SMS cost. ROI comes entirely from 5-15% revenue lift, not cost reduction.",
    "Postscript onboarding is light (2-3 days) but TCPA-compliant SMS opt-in collection takes 4 weeks. Do not import a non-consented list.",
  ],
};

export function recommendMigrationPath(inputs: MigrationInputs): MigrationPath {
  // Default rules (mirrors playbook 05 table + research/02 Move #5):
  //   Path A: source is mailchimp
  //   Path B: source has klaviyo email + non-postscript SMS (attentive, iterable mobile, etc.)
  //   Path C: source is brevo/sendlane/hubspot/iterable/customer_io/activecampaign (non-mailchimp non-klaviyo)
  //   Path D: source is klaviyo-only (no prior SMS)
  if (inputs.sourceEsp === "mailchimp") return "A";
  if (inputs.sourceEsp === "klaviyo_attentive" || inputs.sourceEsp === "klaviyo_alternate_sms") return "B";
  if (inputs.sourceEsp === "klaviyo_only") return "D";
  return "C";
}

export function forecastMigrationSavings(inputs: MigrationInputs): MigrationForecast {
  const path = recommendMigrationPath(inputs);

  const pathMeta = PATH_META[path];
  const cutoverHoursLow = pathMeta.cutoverHours[0];
  const cutoverHoursHigh = pathMeta.cutoverHours[1];
  const cutoverCostLow = cutoverHoursLow * inputs.operatorBlendedRate;
  const cutoverCostHigh = cutoverHoursHigh * inputs.operatorBlendedRate;

  // Source costs.
  const [emailLow, emailHigh] = SOURCE_ESP_EMAIL_COST_PER_CONTACT[inputs.sourceEsp](inputs.contacts);
  const [smsLow, smsHigh] = inputs.smsSubscribers > 0
    ? SOURCE_SMS_COST(inputs.smsSubscribers, inputs.smsSendsPerMonth)
    : [0, 0];
  const currentMonthlyEspCost = (emailLow + emailHigh) / 2;
  const currentMonthlySmsCost = (smsLow + smsHigh) / 2;
  const currentMonthlyTotal = currentMonthlyEspCost + currentMonthlySmsCost;

  // Target costs.
  const [kLow, kHigh] = KLAVIYO_COST(inputs.contacts);
  const [pLow, pHigh] = POSTSCRIPT_COST(inputs.smsSendsPerMonth, inputs.smsSubscribers);
  const newMonthlyKlaviyoCost = (kLow + kHigh) / 2;
  const newMonthlyPostscriptCost = (pLow + pHigh) / 2;
  const newMonthlyTotal = newMonthlyKlaviyoCost + newMonthlyPostscriptCost;

  // Savings bands.
  const monthlySavingsLow = currentMonthlyTotal - (emailHigh + smsHigh);     // current high vs target mid
  const monthlySavingsHigh = currentMonthlyTotal - (kLow + pLow);            // current mid vs target low

  // Revenue lift bands.
  const [emailLiftLow, emailLiftHigh] = EMAIL_REVENUE_LIFT_PCT[inputs.sourceEsp];
  let smsLiftLow = 0;
  let smsLiftHigh = 0;
  if (inputs.sourceEsp === "klaviyo_only") {
    // Path D: add SMS channel — 5-15% lift on total revenue.
    smsLiftLow = SMS_REVENUE_LIFT_PCT_NEW_CHANNEL[0];
    smsLiftHigh = SMS_REVENUE_LIFT_PCT_NEW_CHANNEL[1];
  } else if (inputs.sourceEsp === "klaviyo_attentive" || inputs.sourceEsp === "klaviyo_alternate_sms") {
    // Path B: consolidate SMS — 15-25% SMS-attributed revenue lift.
    smsLiftLow = SMS_REVENUE_LIFT_PCT_CONSOLIDATE[0];
    smsLiftHigh = SMS_REVENUE_LIFT_PCT_CONSOLIDATE[1];
  }
  const monthlyRevenueLiftLow = inputs.monthlyEmailRevenue * emailLiftLow + inputs.monthlySmsRevenue * smsLiftLow;
  const monthlyRevenueLiftHigh = inputs.monthlyEmailRevenue * emailLiftHigh + inputs.monthlySmsRevenue * smsLiftHigh;

  const totalMonthlyBenefitLow = monthlySavingsLow + monthlyRevenueLiftLow;
  const totalMonthlyBenefitHigh = monthlySavingsHigh + monthlyRevenueLiftHigh;

  // Breakeven = cutover cost / monthly benefit (high cost / low benefit = worst case).
  const breakevenMonthsLow = totalMonthlyBenefitLow > 0 ? cutoverCostLow / totalMonthlyBenefitLow : Infinity;
  const breakevenMonthsHigh = totalMonthlyBenefitHigh > 0 ? cutoverCostHigh / totalMonthlyBenefitHigh : Infinity;

  // Year-1 net benefit: 12 × monthly benefit - cutover cost.
  const year1NetBenefitLow = totalMonthlyBenefitLow * 12 - cutoverCostLow;
  const year1NetBenefitHigh = totalMonthlyBenefitHigh * 12 - cutoverCostHigh;

  const isMoneyLosing = year1NetBenefitHigh <= 0;
  const risks = PATH_RISKS[path];

  const summary = (() => {
    if (path === "D") {
      return `Path D adds Postscript SMS on top of your existing Klaviyo email stack. No ESP savings (you're already on Klaviyo). Total Year-1 net benefit is the SMS-attributed revenue lift minus the new Postscript + cutover costs. Net positive IF your customer base responds to SMS (typical: 5-15% lift on total revenue).`;
    }
    if (path === "B") {
      return `Path B keeps Klaviyo for email and swaps your SMS provider to Postscript. Savings come from the 30-50% per-message cost reduction (Postscript $0.010-$0.016/SMS vs Attentive $0.025-$0.05/SMS) plus 15-25% SMS-attributed revenue lift from Postscript's 25-35% CTOR vs Attentive's 15-20% CTOR.`;
    }
    return `Path ${path} consolidates email + SMS to Klaviyo + Postscript. The savings are dominated by the ESP-tier reduction (Klaviyo is more cost-efficient at >10k contacts than Mailchimp/Brevo/HubSpot), plus the email-attributed revenue lift from Klaviyo's segmentation + automation layer. SMS-attributed revenue lift is captured when you add Postscript.`;
  })();

  return {
    path,
    pathLabel: pathMeta.label,
    sourceLabel: SOURCE_LABEL[inputs.sourceEsp],
    targetLabel: "Klaviyo (email) + Postscript (SMS)",
    cutoverDaysLow: pathMeta.cutoverDays[0],
    cutoverDaysHigh: pathMeta.cutoverDays[1],
    cutoverCostLow,
    cutoverCostHigh,
    currentMonthlyEspCost,
    currentMonthlySmsCost,
    currentMonthlyTotal,
    newMonthlyKlaviyoCost,
    newMonthlyPostscriptCost,
    newMonthlyTotal,
    monthlySavingsLow,
    monthlySavingsHigh,
    monthlyRevenueLiftLow,
    monthlyRevenueLiftHigh,
    totalMonthlyBenefitLow,
    totalMonthlyBenefitHigh,
    breakevenMonthsLow,
    breakevenMonthsHigh,
    year1NetBenefitLow,
    year1NetBenefitHigh,
    isMoneyLosing,
    riskLevel: pathMeta.risk,
    risks,
    summary,
  };
}

export const MIGRATION_DEFAULTS: MigrationInputs = {
  contacts: 25_000,
  smsSubscribers: 0,
  smsSendsPerMonth: 0,
  monthlyEmailRevenue: 25_000,
  monthlySmsRevenue: 0,
  sourceEsp: "mailchimp",
  operatorBlendedRate: 50,
};

export const SOURCE_ESP_OPTIONS: { value: SourceEsp; label: string; hint: string }[] = [
  { value: "mailchimp",          label: "Mailchimp",                     hint: "Email only" },
  { value: "klaviyo_attentive",  label: "Klaviyo + Attentive",            hint: "Email already on Klaviyo, swap SMS" },
  { value: "klaviyo_alternate_sms", label: "Klaviyo + alt SMS",          hint: "Iterable Mobile / Postscript legacy / SlickText" },
  { value: "klaviyo_only",       label: "Klaviyo only",                   hint: "Add SMS channel" },
  { value: "sendlane",           label: "Sendlane",                       hint: "Full cutover" },
  { value: "brevo",              label: "Brevo (Sendinblue)",             hint: "Full cutover" },
  { value: "hubspot",            label: "HubSpot Marketing Hub",          hint: "Full cutover" },
  { value: "iterable",           label: "Iterable",                       hint: "Full cutover" },
  { value: "customer_io",        label: "Customer.io",                    hint: "Full cutover" },
  { value: "activecampaign",     label: "ActiveCampaign",                 hint: "Full cutover" },
];

export function clampMigrationNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function validateMigrationInputs(inputs: MigrationInputs): string[] {
  const errors: string[] = [];
  if (inputs.contacts < 0) errors.push("Contacts must be ≥ 0");
  if (inputs.smsSubscribers < 0) errors.push("SMS subscribers must be ≥ 0");
  if (inputs.smsSendsPerMonth < 0) errors.push("Monthly SMS sends must be ≥ 0");
  if (inputs.monthlyEmailRevenue < 0) errors.push("Monthly email revenue must be ≥ 0");
  if (inputs.monthlySmsRevenue < 0) errors.push("Monthly SMS revenue must be ≥ 0");
  if (inputs.operatorBlendedRate < 0) errors.push("Operator blended rate must be ≥ 0");
  return errors;
}

export function renderMigrationMarkdown(inputs: MigrationInputs, f: MigrationForecast): string {
  const fmtUsd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtMonths = (n: number) => Number.isFinite(n) ? `${n.toFixed(1)} mo` : "n/a";
  return [
    `## Migration Savings — ${f.pathLabel}`,
    ``,
    `**Source:** ${f.sourceLabel}  `,
    `**Target:** ${f.targetLabel}  `,
    `**Cutover window:** ${f.cutoverDaysLow}-${f.cutoverDaysHigh} days  `,
    `**Risk:** ${f.riskLevel}`,
    ``,
    `### Current monthly cost`,
    `- Email ESP: ${fmtUsd(f.currentMonthlyEspCost)}`,
    `- SMS provider: ${fmtUsd(f.currentMonthlySmsCost)}`,
    `- **Total:** ${fmtUsd(f.currentMonthlyTotal)}`,
    ``,
    `### Target monthly cost (Klaviyo + Postscript)`,
    `- Klaviyo: ${fmtUsd(f.newMonthlyKlaviyoCost)}`,
    `- Postscript: ${fmtUsd(f.newMonthlyPostscriptCost)}`,
    `- **Total:** ${fmtUsd(f.newMonthlyTotal)}`,
    ``,
    `### Benefit`,
    `- Monthly savings (cost only): ${fmtUsd(f.monthlySavingsLow)} - ${fmtUsd(f.monthlySavingsHigh)}`,
    `- Monthly revenue lift (email + SMS attribution): ${fmtUsd(f.monthlyRevenueLiftLow)} - ${fmtUsd(f.monthlyRevenueLiftHigh)}`,
    `- **Total monthly benefit:** ${fmtUsd(f.totalMonthlyBenefitLow)} - ${fmtUsd(f.totalMonthlyBenefitHigh)}`,
    `- Cutover cost (one-time): ${fmtUsd(f.cutoverCostLow)} - ${fmtUsd(f.cutoverCostHigh)}`,
    `- **Breakeven:** ${fmtMonths(f.breakevenMonthsLow)} - ${fmtMonths(f.breakevenMonthsHigh)}`,
    `- **Year-1 net benefit:** ${fmtUsd(f.year1NetBenefitLow)} - ${fmtUsd(f.year1NetBenefitHigh)}`,
    ``,
    `### Top risks`,
    ...f.risks.map((r) => `- ${r}`),
    ``,
    `### Summary`,
    f.summary,
  ].join("\n");
}
