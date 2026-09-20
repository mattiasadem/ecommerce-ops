/**
 * channel-mix.test.ts — Smoke test for the pure rule engine in
 * `dashboard/src/lib/channel-mix.ts`. Run via:
 *   `cd dashboard && npx jiti src/lib/__tests__/channel-mix.test.ts`
 *
 * Validates:
 *   - CHANNEL_SPECS has 10 entries (research/00 § 2 channel ranking)
 *   - Each spec has rank + roasLow + roasHigh + risk
 *   - Email+SMS has the highest ROAS band (36–40×)
 *   - normalizeAllocation handles zero-sum, sub-100, and over-100 sums
 *   - scoreChannelMix on $5k budget with default preset yields blended ROAS
 *     in the 2–8× band (consistent with research/00 § 2 ranking)
 *   - scoreChannelMix ties to Your-store gross margin
 *   - scoreChannelMix persists the dollar allocation per channel
 *   - channelMixHealthBand thresholds (none / weak / fair / good / healthy)
 *   - renderChannelMixMarkdown emits the 4 required headers and per-channel
 *     rows for non-zero allocations only
 */

import { strict as assert } from "node:assert";
import {
  CHANNEL_SPECS,
  emptyAllocation,
  normalizeAllocation,
  scoreChannelMix,
  channelMixHealthBand,
  renderChannelMixMarkdown,
  PRESET_DEFAULT,
  PRESET_META_HEAVY,
  PRESET_EMAIL_HEAVY,
  type ChannelId,
} from "../channel-mix";
import { YOUR_STORE_DEFAULTS } from "../your-store";

// ---------- Setup ----------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

console.log("channel-mix.test.ts");

// ---------- CHANNEL_SPECS ---------------------------------------------------

test("CHANNEL_SPECS has 10 entries matching research/00 § 2 ranking", () => {
  assert.equal(CHANNEL_SPECS.length, 10);
  assert.deepEqual(
    CHANNEL_SPECS.map((c) => c.id),
    [
      "email_sms",
      "google_search",
      "meta_ads",
      "tiktok_ads",
      "seo_content",
      "influencer_creator",
      "affiliate",
      "reddit_pinterest_yt",
      "display_programmatic",
      "pr_founder_media",
    ],
  );
});

test("Every spec has rank + roasLow + roasHigh + risk populated", () => {
  for (const c of CHANNEL_SPECS) {
    assert.ok(c.rank >= 1 && c.rank <= 10, `${c.id} rank`);
    assert.ok(c.roasHigh >= c.roasLow, `${c.id} high >= low`);
    assert.ok(c.roasLow >= 0, `${c.id} low >= 0`);
    assert.ok(
      ["great", "good", "fair", "speculative", "halo"].includes(c.risk),
      `${c.id} risk`,
    );
  }
});

test("Email + SMS has the highest ROAS band (Omnisend 2026)", () => {
  const email = CHANNEL_SPECS.find((c) => c.id === "email_sms")!;
  assert.equal(email.roasLow, 36);
  assert.equal(email.roasHigh, 40);
  assert.equal(email.risk, "great");
  // No other channel's high should exceed email's low
  for (const c of CHANNEL_SPECS) {
    if (c.id === "email_sms") continue;
    assert.ok(
      c.roasHigh <= email.roasLow,
      `${c.id}.roasHigh ${c.roasHigh} should be <= email low ${email.roasLow}`,
    );
  }
});

test("PR / founder-led media is flagged as halo (unmeasurable)", () => {
  const pr = CHANNEL_SPECS.find((c) => c.id === "pr_founder_media")!;
  assert.equal(pr.risk, "halo");
  assert.equal(pr.roasLow, 0);
});

test("Affiliates have ROAS band 3–6× per research/00 § 2", () => {
  const aff = CHANNEL_SPECS.find((c) => c.id === "affiliate")!;
  assert.equal(aff.roasLow, 3);
  assert.equal(aff.roasHigh, 6);
});

// ---------- normalizeAllocation --------------------------------------------

test("normalizeAllocation handles zero-sum → even 10/10 split", () => {
  const out = normalizeAllocation(emptyAllocation());
  // 10 channels × 10 = 100
  for (const c of CHANNEL_SPECS) {
    assert.ok(
      Math.abs(out[c.id] - 10) < 0.0001,
      `${c.id} should be 10, got ${out[c.id]}`,
    );
  }
});

test("normalizeAllocation scales a partial-sum allocation to sum=100", () => {
  const raw: Record<ChannelId, number> = {
    email_sms: 50,
    meta_ads: 30,
    google_search: 20,
    tiktok_ads: 0,
    seo_content: 0,
    influencer_creator: 0,
    affiliate: 0,
    reddit_pinterest_yt: 0,
    display_programmatic: 0,
    pr_founder_media: 0,
  };
  const out = normalizeAllocation(raw);
  assert.ok(Math.abs(out.email_sms - 50) < 0.0001);
  assert.ok(Math.abs(out.meta_ads - 30) < 0.0001);
  assert.ok(Math.abs(out.google_search - 20) < 0.0001);
  // Sum should be 100
  const sum = Object.values(out).reduce((acc, n) => acc + n, 0);
  assert.ok(Math.abs(sum - 100) < 0.0001, `sum=${sum}`);
});

test("normalizeAllocation scales an over-100 allocation to sum=100", () => {
  const raw: Record<ChannelId, number> = {
    email_sms: 200,
    meta_ads: 200,
    google_search: 200,
    tiktok_ads: 0,
    seo_content: 0,
    influencer_creator: 0,
    affiliate: 0,
    reddit_pinterest_yt: 0,
    display_programmatic: 0,
    pr_founder_media: 0,
  };
  const out = normalizeAllocation(raw);
  const sum = Object.values(out).reduce((acc, n) => acc + n, 0);
  assert.ok(Math.abs(sum - 100) < 0.0001, `sum=${sum}`);
  // Each ~33.33
  assert.ok(Math.abs(out.email_sms - 100 / 3) < 0.01);
});

test("normalizeAllocation ignores negative values", () => {
  const raw: Record<ChannelId, number> = {
    email_sms: 50,
    meta_ads: -10,
    google_search: 50,
    tiktok_ads: 0,
    seo_content: 0,
    influencer_creator: 0,
    affiliate: 0,
    reddit_pinterest_yt: 0,
    display_programmatic: 0,
    pr_founder_media: 0,
  };
  const out = normalizeAllocation(raw);
  // -10 should be ignored → only 100 positive → all preserved
  assert.ok(Math.abs(out.email_sms - 50) < 0.0001);
  assert.ok(Math.abs(out.google_search - 50) < 0.0001);
  assert.equal(out.meta_ads, 0);
});

// ---------- scoreChannelMix -----------------------------------------------

test("scoreChannelMix on $5000 + default preset yields blended ROAS in 5–20× band", () => {
  const result = scoreChannelMix({
    monthlyBudget: 5000,
    allocation: PRESET_DEFAULT,
  });
  assert.equal(result.totalBudget, 5000);
  // Default preset puts 25% in Email+SMS (36-40×) + 20% Google Search (4-8×)
  // → blended ROAS low is ~10×, high is ~15×. Bound kept conservative.
  assert.ok(
    result.blendedRoasLow >= 5 && result.blendedRoasLow <= 20,
    `low ${result.blendedRoasLow}`,
  );
  assert.ok(
    result.blendedRoasHigh >= 5 && result.blendedRoasHigh <= 25,
    `high ${result.blendedRoasHigh}`,
  );
  assert.ok(result.totalRevenueLow >= 10000);
  assert.ok(result.totalRevenueHigh <= 200000);
});

test("scoreChannelMix ties to Your-store gross margin (default 70%)", () => {
  const result = scoreChannelMix({
    monthlyBudget: 10000,
    allocation: PRESET_DEFAULT,
  });
  // Net margin should be ~70% of revenue
  const expectedLow = Math.round(result.totalRevenueLow * 0.7);
  const expectedHigh = Math.round(result.totalRevenueHigh * 0.7);
  assert.ok(Math.abs(result.totalMarginLow - expectedLow) <= 1);
  assert.ok(Math.abs(result.totalMarginHigh - expectedHigh) <= 1);
});

test("scoreChannelMix on $0 budget returns 0 revenue + 0 margin", () => {
  const result = scoreChannelMix({
    monthlyBudget: 0,
    allocation: PRESET_DEFAULT,
  });
  assert.equal(result.totalBudget, 0);
  assert.equal(result.totalRevenueLow, 0);
  assert.equal(result.totalRevenueHigh, 0);
  assert.equal(result.totalMarginLow, 0);
  assert.equal(result.totalMarginHigh, 0);
  assert.equal(result.blendedRoasLow, 0);
  assert.equal(result.blendedRoasHigh, 0);
});

test("scoreChannelMix per-channel dollars sum to totalBudget", () => {
  const result = scoreChannelMix({
    monthlyBudget: 12345,
    allocation: PRESET_META_HEAVY,
  });
  const sum = result.rows.reduce((acc, r) => acc + r.dollars, 0);
  assert.ok(
    Math.abs(sum - result.totalBudget) <= 1,
    `sum ${sum} should match totalBudget ${result.totalBudget}`,
  );
});

test("scoreChannelMix sorts rows by rank (research/00 § 2)", () => {
  const result = scoreChannelMix({
    monthlyBudget: 5000,
    allocation: PRESET_DEFAULT,
  });
  for (let i = 1; i < result.rows.length; i += 1) {
    assert.ok(result.rows[i].channel.rank > result.rows[i - 1].channel.rank);
  }
});

test("scoreChannelMix reflects META-heavy preset bias toward Meta", () => {
  const defaultResult = scoreChannelMix({
    monthlyBudget: 10000,
    allocation: PRESET_DEFAULT,
  });
  const metaResult = scoreChannelMix({
    monthlyBudget: 10000,
    allocation: PRESET_META_HEAVY,
  });
  const defaultMeta = defaultResult.rows.find(
    (r) => r.channel.id === "meta_ads",
  )!;
  const metaHeavyMeta = metaResult.rows.find(
    (r) => r.channel.id === "meta_ads",
  )!;
  // META_HEAVY has 35% Meta vs 20% in DEFAULT → higher $ allocation
  assert.ok(metaHeavyMeta.dollars > defaultMeta.dollars);
});

test("scoreChannelMix reflects EMAIL-heavy preset bias toward Email+SMS", () => {
  const defaultResult = scoreChannelMix({
    monthlyBudget: 10000,
    allocation: PRESET_DEFAULT,
  });
  const emailResult = scoreChannelMix({
    monthlyBudget: 10000,
    allocation: PRESET_EMAIL_HEAVY,
  });
  const defaultEmail = defaultResult.rows.find(
    (r) => r.channel.id === "email_sms",
  )!;
  const emailHeavyEmail = emailResult.rows.find(
    (r) => r.channel.id === "email_sms",
  )!;
  assert.ok(emailHeavyEmail.dollars > defaultEmail.dollars);
  // And email-heavy should yield higher blended ROAS low (Email+SMS has the
  // highest band at 36–40×).
  assert.ok(
    emailResult.blendedRoasLow > defaultResult.blendedRoasLow,
    `email-heavy roasLow ${emailResult.blendedRoasLow} should exceed default ${defaultResult.blendedRoasLow}`,
  );
});

// ---------- channelMixHealthBand ------------------------------------------

test("channelMixHealthBand thresholds (none / weak / fair / good / healthy)", () => {
  assert.equal(channelMixHealthBand(0), "none");
  assert.equal(channelMixHealthBand(1.5), "weak");
  assert.equal(channelMixHealthBand(2.0), "fair");
  assert.equal(channelMixHealthBand(2.5), "good");
  assert.equal(channelMixHealthBand(4.0), "healthy");
  assert.equal(channelMixHealthBand(8.5), "healthy");
});

// ---------- renderChannelMixMarkdown --------------------------------------

test("renderChannelMixMarkdown emits the 4 required headers + non-zero rows only", () => {
  const result = scoreChannelMix({
    monthlyBudget: 5000,
    allocation: PRESET_DEFAULT,
  });
  const md = renderChannelMixMarkdown(result, 5000, YOUR_STORE_DEFAULTS, false);
  assert.ok(md.includes("# Channel Mix — Budget Allocation"));
  assert.ok(md.includes("**Total monthly budget:**"));
  assert.ok(md.includes("**Blended ROAS band:**"));
  assert.ok(md.includes("**Estimated revenue / mo:**"));
  assert.ok(md.includes("**Estimated net margin / mo:**"));
  assert.ok(md.includes("## Per-channel allocation (ranked by ROI)"));
  // PR has 0 allocation in default preset → should not appear
  assert.ok(!md.includes("PR / Founder-led media"));
  // Email+SMS has 25% in default preset → should appear
  assert.ok(md.includes("Email + SMS (retention)"));
});

test("renderChannelMixMarkdown surfaces Your-store source when storeIsLive=true", () => {
  const result = scoreChannelMix({
    monthlyBudget: 5000,
    allocation: PRESET_DEFAULT,
  });
  const md = renderChannelMixMarkdown(
    result,
    5000,
    { aov: 120, monthlyOrders: 2000, grossMargin: 0.6 },
    true,
  );
  assert.ok(md.includes("source=Your-store"));
  assert.ok(md.includes("60%"));
});

// ---------- Done ----------------------------------------------------------

console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}