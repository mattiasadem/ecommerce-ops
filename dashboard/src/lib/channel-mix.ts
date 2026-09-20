/**
 * channel-mix.ts — Pure rule engine for the interactive Channel Mix Budget
 * Allocator on `/channels`.
 *
 * Mirrors the canonical channel ranking from `research/00-ecommerce-ops-landscape.md`
 * § 2 (Acquisition Channels Ranked by ROI) — 10 channels with 2025–26 US DTC
 * consumer blended-ROAS bands (low / high). Operator enters a monthly paid +
 * organic-channel budget, splits it across the 10 channels via percentage
 * sliders, and the panel outputs:
 *   - Per-channel $ allocation (constrained to total budget)
 *   - Per-channel estimated monthly revenue (low / high band × $ allocation)
 *   - Blended ROAS (total revenue ÷ total budget)
 *   - Personalized $ lift tied to Your-store's AOV/orders/margin (cross-page
 *     intelligence — the same store used by /cro checkout-audit +
 *     /retention retention-projection + /playbooks abandoned-cart-roi)
 *   - 2 presets (operator-default split + Meta-heavy split + Email-heavy
 *     split) — applies canonical weights from the research table
 *
 * Scoring math is intentionally hermetic (no API calls). All inputs are
 * operator-supplied. The blended-ROAS bands are static from research/00 § 2.
 *
 * Companion component: `dashboard/src/components/channel-mix-allocator.tsx`.
 * Mounted on `dashboard/app/channels/page.tsx` between the channel-ranking
 * Card and the per-channel benchmark Cards.
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";

export type ChannelId =
  | "email_sms"
  | "google_search"
  | "meta_ads"
  | "tiktok_ads"
  | "seo_content"
  | "influencer_creator"
  | "affiliate"
  | "reddit_pinterest_yt"
  | "display_programmatic"
  | "pr_founder_media";

export interface ChannelSpec {
  id: ChannelId;
  /** Display rank (1 = highest ROI per research/00 § 2). */
  rank: number;
  /** Display title shown in the form. */
  title: string;
  /** Operator-facing one-line "what good looks like" hint. */
  prompt: string;
  /**
   * Blended ROAS band (low / high). Sourced from research/00 § 2:
   *   Email+SMS: 36–40× / $1 (Omnisend 2026)
   *   Google Search: 4–8×
   *   Meta: 2.5–4×
   *   TikTok Ads: 2–3.5×
   *   SEO/Content: "free" but high NPV → 1.0–2.0× conservative direct ROI
   *     with a long payback (12–18 mo). The conservative band captures the
   *     direct-attribution lens that the operator will see in their channel
   *     P&L in month-1; long-term NPV is materially higher.
   *   Influencer/Creator: 1.5–3× direct, 3–5× with halo. We use the direct
   *     band by default since halo is platform-specific.
   *   Affiliate: 3–6× post-cookie deprecation.
   *   Reddit/Pinterest/YouTube: 1.5–2.5×.
   *   Display/Programmatic: 1.5–2.5×.
   *   PR/Founder-led media: unmeasurable. We default to 0–1× with a
   *     "halo-only — not measurable in channel P&L" tag.
   */
  roasLow: number;
  roasHigh: number;
  /**
   * "Risk band" label — drives the badge color in the form. Used to warn
   * operators who over-allocate to PR/founder-media (unmeasurable) or
   * display-programmatic (mostly dead top-funnel).
   */
  risk: "great" | "good" | "fair" | "speculative" | "halo";
}

export interface ChannelMixInput {
  /** USD / month — total budget the operator wants to allocate across channels. */
  monthlyBudget: number;
  /**
   * Per-channel share (0..100) — must sum to 100 at scoring time. The form
   * normalizes on every change so a sum ≠ 100 still produces a coherent
   * allocation (the budget is always split proportionally).
   */
  allocation: Record<ChannelId, number>;
}

export interface ChannelAllocationRow {
  channel: ChannelSpec;
  /** Per-channel $ allocation after normalization. */
  dollars: number;
  /** Per-channel estimated monthly revenue (low band). */
  revenueLow: number;
  /** Per-channel estimated monthly revenue (high band). */
  revenueHigh: number;
  /** Per-channel estimated monthly net margin ($). */
  marginLow: number;
  marginHigh: number;
}

export interface ChannelMixResult {
  totalBudget: number;
  totalRevenueLow: number;
  totalRevenueHigh: number;
  blendedRoasLow: number;
  blendedRoasHigh: number;
  totalMarginLow: number;
  totalMarginHigh: number;
  /** Per-channel allocation rows (sorted by rank). */
  rows: ChannelAllocationRow[];
  /** Sum of allocation % before normalization — for the form's "X% allocated" hint. */
  allocationSum: number;
}

// ---------- Canonical channel specs (research/00 § 2) --------------------

export const CHANNEL_SPECS: ChannelSpec[] = [
  {
    id: "email_sms",
    rank: 1,
    title: "Email + SMS (retention)",
    prompt: "Highest-ROI channel — $36–$40 per $1 (Omnisend 2026). Already-acquired customers.",
    roasLow: 36,
    roasHigh: 40,
    risk: "great",
  },
  {
    id: "google_search",
    rank: 2,
    title: "Google Search (branded + non-branded)",
    prompt: "Higher-intent demand; protects brand SERP from competitors + Amazon.",
    roasLow: 4,
    roasHigh: 8,
    risk: "good",
  },
  {
    id: "meta_ads",
    rank: 3,
    title: "Meta (Facebook + Instagram) Ads",
    prompt: "Workhorse for $1–10M brands. CPMs up 20–40% YoY.",
    roasLow: 2.5,
    roasHigh: 4,
    risk: "good",
  },
  {
    id: "tiktok_ads",
    rank: 4,
    title: "TikTok Ads",
    prompt: "Lower CPMs, higher CTR, weaker CVR. Works for apparel/beauty/cosmetics.",
    roasLow: 2,
    roasHigh: 3.5,
    risk: "good",
  },
  {
    id: "seo_content",
    rank: 5,
    title: "SEO / Content / UGC",
    prompt: "Compounding; long payback (12–18 mo) but lowest marginal CAC at scale.",
    roasLow: 1,
    roasHigh: 2,
    risk: "fair",
  },
  {
    id: "influencer_creator",
    rank: 6,
    title: "Influencer / Creator",
    prompt: "1.5–3× direct, 3–5× with halo. Whitelisting/boosting is the unlock.",
    roasLow: 1.5,
    roasHigh: 3,
    risk: "fair",
  },
  {
    id: "affiliate",
    rank: 7,
    title: "Affiliate (post-cookie deprecation)",
    prompt: "Working again with creator-led models (Levanta, Refersion, Aspire).",
    roasLow: 3,
    roasHigh: 6,
    risk: "good",
  },
  {
    id: "reddit_pinterest_yt",
    rank: 8,
    title: "Reddit / Pinterest / YouTube",
    prompt: "Niche. Use only for clear vertical fit (e.g., Reddit for tech, Pinterest for home).",
    roasLow: 1.5,
    roasHigh: 2.5,
    risk: "fair",
  },
  {
    id: "display_programmatic",
    rank: 9,
    title: "Display / Programmatic (retargeting)",
    prompt: "Top-funnel display is mostly dead. Retargeting via Meta/Google is better.",
    roasLow: 1.5,
    roasHigh: 2.5,
    risk: "fair",
  },
  {
    id: "pr_founder_media",
    rank: 10,
    title: "PR / Founder-led media",
    prompt: "Unmeasurable in channel P&L. Build once, compounds for years (founder X, podcast circuit).",
    roasLow: 0,
    roasHigh: 1,
    risk: "halo",
  },
];

const SPEC_BY_ID: Record<ChannelId, ChannelSpec> = CHANNEL_SPECS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<ChannelId, ChannelSpec>,
);

// ---------- Presets ------------------------------------------------------

/**
 * Default allocation — calibrated to the canonical research/00 § 2 ranking
 * (Email+SMS gets the most weight, then Google Search, then Meta). Total = 100.
 */
export const PRESET_DEFAULT: Record<ChannelId, number> = {
  email_sms: 25,
  google_search: 20,
  meta_ads: 20,
  tiktok_ads: 10,
  seo_content: 10,
  influencer_creator: 5,
  affiliate: 5,
  reddit_pinterest_yt: 3,
  display_programmatic: 2,
  pr_founder_media: 0,
};

/**
 * Meta-heavy preset — $1–10M brand that bets on paid acquisition.
 */
export const PRESET_META_HEAVY: Record<ChannelId, number> = {
  email_sms: 15,
  google_search: 15,
  meta_ads: 35,
  tiktok_ads: 15,
  seo_content: 5,
  influencer_creator: 10,
  affiliate: 3,
  reddit_pinterest_yt: 2,
  display_programmatic: 0,
  pr_founder_media: 0,
};

/**
 * Email-heavy preset — $1–3M retention-led brand that over-indexes on LTV.
 */
export const PRESET_EMAIL_HEAVY: Record<ChannelId, number> = {
  email_sms: 40,
  google_search: 15,
  meta_ads: 15,
  tiktok_ads: 5,
  seo_content: 10,
  influencer_creator: 5,
  affiliate: 5,
  reddit_pinterest_yt: 3,
  display_programmatic: 2,
  pr_founder_media: 0,
};

// ---------- Public helpers -----------------------------------------------

export function emptyAllocation(): Record<ChannelId, number> {
  return {
    email_sms: 0,
    google_search: 0,
    meta_ads: 0,
    tiktok_ads: 0,
    seo_content: 0,
    influencer_creator: 0,
    affiliate: 0,
    reddit_pinterest_yt: 0,
    display_programmatic: 0,
    pr_founder_media: 0,
  };
}

/**
 * Normalize an allocation record so it sums to 100. If the sum is 0, returns
 * an even 10/10-channel split (10 each across 10 channels). The form uses
 * this on every change so an operator with sliders in any state gets a
 * coherent dollar allocation.
 */
export function normalizeAllocation(
  raw: Record<ChannelId, number>,
): Record<ChannelId, number> {
  const sum = Object.values(raw).reduce((acc, n) => acc + Math.max(0, n), 0);
  if (sum <= 0) {
    // Even split: 100 / 10 = 10
    const even = 100 / CHANNEL_SPECS.length;
    const out = emptyAllocation();
    for (const c of CHANNEL_SPECS) {
      out[c.id] = even;
    }
    return out;
  }
  const out = emptyAllocation();
  for (const c of CHANNEL_SPECS) {
    out[c.id] = (Math.max(0, raw[c.id]) * 100) / sum;
  }
  return out;
}

export function getChannelSpec(id: ChannelId): ChannelSpec {
  return SPEC_BY_ID[id];
}

/**
 * Round to N decimal places (mirrors the round4 helper in checkout-audit.ts).
 */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Score a channel-mix input against Your-store's gross-margin % and produce
 * a full per-channel breakdown + blended ROAS + total margin $.
 *
 * If `store` is omitted the panel falls back to `YOUR_STORE_DEFAULTS` so a
 * brand that hasn't set AOV/orders/margin on Overview still gets a real
 * dollar projection.
 */
export function scoreChannelMix(
  input: ChannelMixInput,
  store: YourStoreInputs = YOUR_STORE_DEFAULTS,
): ChannelMixResult {
  const totalBudget = Math.max(0, input.monthlyBudget);
  const normalized = normalizeAllocation(input.allocation);
  const allocationSum = Object.values(input.allocation).reduce(
    (acc, n) => acc + Math.max(0, n),
    0,
  );

  let totalRevenueLow = 0;
  let totalRevenueHigh = 0;

  const rows: ChannelAllocationRow[] = CHANNEL_SPECS.map((c) => {
    const pct = normalized[c.id];
    const dollars = round4((pct * totalBudget) / 100);
    const revenueLow = dollars * c.roasLow;
    const revenueHigh = dollars * c.roasHigh;
    const marginLow = revenueLow * store.grossMargin;
    const marginHigh = revenueHigh * store.grossMargin;
    totalRevenueLow += revenueLow;
    totalRevenueHigh += revenueHigh;
    return {
      channel: c,
      dollars: Math.round(dollars),
      revenueLow: Math.round(revenueLow),
      revenueHigh: Math.round(revenueHigh),
      marginLow: Math.round(marginLow),
      marginHigh: Math.round(marginHigh),
    };
  });

  const blendedRoasLow =
    totalBudget > 0 ? round4(totalRevenueLow / totalBudget) : 0;
  const blendedRoasHigh =
    totalBudget > 0 ? round4(totalRevenueHigh / totalBudget) : 0;
  const totalMarginLow = Math.round(totalRevenueLow * store.grossMargin);
  const totalMarginHigh = Math.round(totalRevenueHigh * store.grossMargin);

  return {
    totalBudget: Math.round(totalBudget),
    totalRevenueLow: Math.round(totalRevenueLow),
    totalRevenueHigh: Math.round(totalRevenueHigh),
    blendedRoasLow,
    blendedRoasHigh,
    totalMarginLow,
    totalMarginHigh,
    rows,
    allocationSum: round4(allocationSum),
  };
}

/**
 * Health band for the blended ROAS — drives the badge color in the form.
 * Bands are calibrated against research/00 § 1 unit-economics findings
 * (MER / blended ROAS) and the channel-ROAS research/00 § 2 table.
 *   - healthy: ROAS ≥ 4× (research/00 "Top 20% 4.0×+")
 *   - good:    ROAS ≥ 2.5× (research/00 median)
 *   - fair:    ROAS ≥ 2.0×
 *   - weak:    ROAS > 0 (allocation has some signal)
 *   - none:    ROAS == 0 (zero budget or all PR-founder-media allocation)
 */
export type ChannelMixHealthBand =
  | "healthy"
  | "good"
  | "fair"
  | "weak"
  | "none";

export function channelMixHealthBand(roasLow: number): ChannelMixHealthBand {
  if (roasLow <= 0) return "none";
  if (roasLow >= 4) return "healthy";
  if (roasLow >= 2.5) return "good";
  if (roasLow >= 2) return "fair";
  return "weak";
}

/**
 * Render a markdown report summarizing the channel mix. Used by the
 * `Copy report` button — byte-for-byte compatible with the format the
 * operator can paste into a Slack handoff or operator-build runbook.
 */
export function renderChannelMixMarkdown(
  result: ChannelMixResult,
  budget: number,
  store: YourStoreInputs = YOUR_STORE_DEFAULTS,
  storeIsLive: boolean = false,
): string {
  const lines: string[] = [];
  const storeSource = storeIsLive ? "Your-store" : "defaults";
  const health = channelMixHealthBand(result.blendedRoasLow);
  lines.push("# Channel Mix — Budget Allocation");
  lines.push("");
  lines.push(`**Total monthly budget:** $${result.totalBudget.toLocaleString()} (input: $${budget.toLocaleString()})`);
  lines.push(`**Blended ROAS band:** ${result.blendedRoasLow.toFixed(2)}–${result.blendedRoasHigh.toFixed(2)}× (${health})`);
  lines.push(`**Estimated revenue / mo:** $${result.totalRevenueLow.toLocaleString()}–$${result.totalRevenueHigh.toLocaleString()}`);
  lines.push(`**Estimated net margin / mo:** $${result.totalMarginLow.toLocaleString()}–$${result.totalMarginHigh.toLocaleString()} (at ${(store.grossMargin * 100).toFixed(0)}% gross margin, source=${storeSource})`);
  lines.push("");
  lines.push("## Per-channel allocation (ranked by ROI)");
  result.rows.forEach((row) => {
    if (row.dollars <= 0) return;
    lines.push(
      `- **[${row.channel.rank}] ${row.channel.title}** — $${row.dollars.toLocaleString()}/mo · ROAS ${row.channel.roasLow.toFixed(1)}–${row.channel.roasHigh.toFixed(1)}× · est. revenue $${row.revenueLow.toLocaleString()}–$${row.revenueHigh.toLocaleString()}/mo`,
    );
  });
  lines.push("");
  lines.push(
    `_Generated ${new Date().toISOString()} from ecommerce-ops-dashboard /channels channel mix allocator.`,
  );
  return lines.join("\n");
}