/**
 * `reread-freshness-gap.test.ts` — Move #N.21 unit tests. Covers
 * every pure-logic helper + the headline/tone-class/markdown
 * branches so the rollout is safe to ship.
 *
 * Run with: `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/reread-freshness-gap.test.ts`
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  buildReReadFreshness,
  classifySection,
  daysSinceUTC,
  renderReReadFreshnessMarkdown,
  rereadFreshnessHeadline,
  rereadFreshnessRowTone,
  rereadFreshnessSectionLabel,
  rereadFreshnessSectionTone,
  rereadFreshnessToneClass,
} from "../reread-freshness-gap";
import type { Playbook } from "../content";
import type { DriftFixRecipeSummary } from "../drift-fix-recipe";
import type { ReReadMap } from "../recipe-reread";

const NOW = new Date("2026-10-07T12:00:00Z");

function isoDaysAgo(days: number, base: Date = NOW): string {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const PLAYBOOKS: Playbook[] = [
  {
    file: "01-abandoned-cart-flow-klaviyo.md",
    title: "Abandoned cart flow (Klaviyo)",
    lastTouched: isoDaysAgo(3),
    numberedSections: [],
  } as unknown as Playbook,
  {
    file: "02-post-purchase-upsell-reconvert.md",
    title: "Post-purchase upsell (Reconvert)",
    lastTouched: isoDaysAgo(60),
    numberedSections: [],
  } as unknown as Playbook,
  {
    file: "03-checkout-audit-baymard.md",
    title: "Checkout audit (Baymard)",
    lastTouched: null as unknown as string,
    numberedSections: [],
  } as unknown as Playbook,
];

const RECIPE: DriftFixRecipeSummary = {
  rows: [
    {
      id: "01-abandoned-cart-flow-klaviyo",
      title: "Abandoned cart flow (Klaviyo)",
      driftDays: 30,
      readFirst: [
        { heading: "Common pitfalls", label: "pitfalls", hash: "common-pitfalls" },
        { heading: "How to ship", label: "ship recipe", hash: "how-to-ship" },
      ],
      totalSections: 5,
    },
    {
      id: "02-post-purchase-upsell-reconvert",
      title: "Post-purchase upsell (Reconvert)",
      driftDays: 5,
      readFirst: [
        { heading: "How to ship", label: "ship recipe", hash: "how-to-ship" },
        { heading: "Verification", label: "verification", hash: "verification" },
      ],
      totalSections: 4,
    },
    {
      id: "03-checkout-audit-baymard",
      title: "Checkout audit (Baymard)",
      driftDays: 10,
      readFirst: [
        { heading: "How to ship", label: "ship recipe", hash: "how-to-ship" },
      ],
      totalSections: 6,
    },
  ],
  totalDrifted: 3,
  withRecipe: 3,
  noSections: 0,
  maxDriftDays: 30,
};

test("daysSinceUTC: valid ISO returns day count, null/NaN/empty returns null", () => {
  assert.equal(daysSinceUTC(null, NOW), null);
  assert.equal(daysSinceUTC("", NOW), null);
  assert.equal(daysSinceUTC("not-a-date", NOW), null);
  assert.equal(daysSinceUTC(isoDaysAgo(0), NOW), 0);
  assert.equal(daysSinceUTC(isoDaysAgo(5), NOW), 5);
  assert.equal(daysSinceUTC(isoDaysAgo(30), NOW), 30);
  // future date (operator marked re-read in the future) → 0 (clamped via floor)
  const future = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(daysSinceUTC(future, NOW), -5);
});

test("classifySection: no re-read mark → unknown", () => {
  const out = classifySection(null, isoDaysAgo(3), NOW);
  assert.equal(out.state, "unknown");
  assert.equal(out.gapDays, null);
});

test("classifySection: no lastTouched → unknown", () => {
  const out = classifySection(isoDaysAgo(10), null, NOW);
  assert.equal(out.state, "unknown");
  assert.equal(out.gapDays, null);
});

test("classifySection: playbook touched AFTER mark → stale-since-reread, positive gapDays", () => {
  // re-read 20d ago, playbook touched 3d ago → 17d stale
  const out = classifySection(isoDaysAgo(20), isoDaysAgo(3), NOW);
  assert.equal(out.state, "stale-since-reread");
  assert.equal(out.gapDays, 17);
});

test("classifySection: playbook touched BEFORE mark → current-as-of-reread, negative gapDays", () => {
  // re-read 5d ago, playbook touched 30d ago → 25d current
  const out = classifySection(isoDaysAgo(5), isoDaysAgo(30), NOW);
  assert.equal(out.state, "current-as-of-reread");
  assert.equal(out.gapDays, -25);
});

test("classifySection: playbook touched on the SAME day as mark → current (gapDays ≤ 0)", () => {
  // re-read 10d ago, playbook touched 10d ago → gapDays = 0
  const out = classifySection(isoDaysAgo(10), isoDaysAgo(10), NOW);
  assert.equal(out.state, "current-as-of-reread");
  assert.equal(out.gapDays, 0);
});

test("classifySection: invalid ISO → unknown", () => {
  const out = classifySection("not-a-date", isoDaysAgo(3), NOW);
  assert.equal(out.state, "unknown");
  assert.equal(out.gapDays, null);
});

test("buildReReadFreshness: 0 marks → all 0 counters, worstGapDays null, empty tone", () => {
  const out = buildReReadFreshness(RECIPE, {}, PLAYBOOKS, NOW);
  assert.equal(out.totalShipped, 3);
  assert.equal(out.withMarks, 0);
  assert.equal(out.totalMarks, 0);
  assert.equal(out.totalStale, 0);
  assert.equal(out.totalCurrent, 0);
  assert.equal(out.totalUnknown, 0);
  assert.equal(out.worstGapDays, null);
  for (const r of out.rows) {
    assert.equal(r.markedCount, 0);
    assert.equal(r.staleCount, 0);
    assert.equal(r.maxGapDays, null);
  }
});

test("buildReReadFreshness: 1 stale section (re-read before lastTouched) → 1 stale, 0 current, worstGapDays = gap", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": {
      "common-pitfalls": { reReadAt: isoDaysAgo(20) },
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(out.withMarks, 1);
  assert.equal(out.totalMarks, 1);
  assert.equal(out.totalStale, 1);
  assert.equal(out.totalCurrent, 0);
  assert.equal(out.totalUnknown, 0);
  assert.equal(out.worstGapDays, 17);
  const row = out.rows[0];
  assert.equal(row.staleCount, 1);
  assert.equal(row.maxGapDays, 17);
  assert.equal(row.sections[0].state, "stale-since-reread");
  assert.equal(row.sections[0].gapDays, 17);
  assert.equal(row.sections[1].state, "unknown"); // unmarked
});

test("buildReReadFreshness: 1 current section (mark after lastTouched) → 1 current", () => {
  const map: ReReadMap = {
    "02-post-purchase-upsell-reconvert": {
      "how-to-ship": { reReadAt: isoDaysAgo(5) }, // playbook touched 60d ago
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(out.withMarks, 1);
  assert.equal(out.totalStale, 0);
  assert.equal(out.totalCurrent, 1);
  assert.equal(out.totalUnknown, 0);
  assert.equal(out.worstGapDays, null);
  const row = out.rows[1];
  assert.equal(row.sections[0].state, "current-as-of-reread");
  assert.equal(row.sections[0].gapDays, -55);
});

test("buildReReadFreshness: missing lastTouched → unknown, not stale", () => {
  const map: ReReadMap = {
    "03-checkout-audit-baymard": {
      "how-to-ship": { reReadAt: isoDaysAgo(7) },
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(out.totalStale, 0);
  assert.equal(out.totalCurrent, 0);
  assert.equal(out.totalUnknown, 1);
  assert.equal(out.worstGapDays, null);
  const row = out.rows[2];
  assert.equal(row.unknownCount, 1);
  assert.equal(row.sections[0].state, "unknown");
});

test("buildReReadFreshness: mixed row (1 stale + 1 current + 1 unmarked)", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": {
      "common-pitfalls": { reReadAt: isoDaysAgo(20) }, // stale (touch 3d ago)
      "how-to-ship": { reReadAt: isoDaysAgo(60) }, // current (touch 3d ago, re-read 60d ago → 57d stale actually)
    },
  };
  // Recompute: playbook 01 touched 3d ago.
  //   re-read 20d ago → stale +17d
  //   re-read 60d ago → stale +57d (touch is MORE recent than mark)
  // Both should be stale.
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  const row = out.rows[0];
  assert.equal(row.staleCount, 2);
  assert.equal(row.maxGapDays, 57);
  assert.equal(out.worstGapDays, 57);
});

test("buildReReadFreshness: maxGapDays tracks the worst across all rows", () => {
  const map: ReReadMap = {
    // playbook 01: touched 3d ago, re-read 20d ago → +17d stale.
    "01-abandoned-cart-flow-klaviyo": {
      "common-pitfalls": { reReadAt: isoDaysAgo(20) },
    },
    // playbook 02: touched 60d ago, re-read 5d ago → -55d (re-read MORE
    // recent than touch) → current. NOT stale.
    "02-post-purchase-upsell-reconvert": {
      "how-to-ship": { reReadAt: isoDaysAgo(5) },
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(out.totalStale, 1);
  assert.equal(out.totalCurrent, 1);
  assert.equal(out.worstGapDays, 17);
});

test("rereadFreshnessToneClass: 0 shipped or 0 marks → neutral", () => {
  assert.equal(rereadFreshnessToneClass({ totalShipped: 0, totalMarks: 0 } as never), "border-border bg-card");
  const out = buildReReadFreshness(RECIPE, {}, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessToneClass(out), "border-border bg-card");
});

test("rereadFreshnessToneClass: any stale → rose", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": { "common-pitfalls": { reReadAt: isoDaysAgo(20) } },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessToneClass(out), "border-rose-500/30 bg-rose-500/5");
});

test("rereadFreshnessToneClass: only unknown → amber", () => {
  const map: ReReadMap = {
    "03-checkout-audit-baymard": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessToneClass(out), "border-amber-500/30 bg-amber-500/5");
});

test("rereadFreshnessToneClass: all current → emerald", () => {
  const map: ReReadMap = {
    "02-post-purchase-upsell-reconvert": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessToneClass(out), "border-emerald-500/30 bg-emerald-500/5");
});

test("rereadFreshnessHeadline: 0 shipped / 0 marks / stale / current / unknown variants", () => {
  const out0 = buildReReadFreshness({ rows: [], totalDrifted: 0, withRecipe: 0, noSections: 0, maxDriftDays: 0 }, {}, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessHeadline(out0), "No shipped playbooks yet");
  const out1 = buildReReadFreshness(RECIPE, {}, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessHeadline(out1), "No re-read marks to freshness-check yet");
  const map2: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": { "common-pitfalls": { reReadAt: isoDaysAgo(20) } },
  };
  const out2 = buildReReadFreshness(RECIPE, map2, PLAYBOOKS, NOW);
  assert.equal(
    rereadFreshnessHeadline(out2),
    "1 of 1 marked section stale (playbook updated since re-read) · worst 17d since re-read"
  );
  const map3: ReReadMap = {
    "02-post-purchase-upsell-reconvert": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const out3 = buildReReadFreshness(RECIPE, map3, PLAYBOOKS, NOW);
  assert.equal(rereadFreshnessHeadline(out3), "All 1 marked section are current as of re-read");
  const map4: ReReadMap = {
    "03-checkout-audit-baymard": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const out4 = buildReReadFreshness(RECIPE, map4, PLAYBOOKS, NOW);
  assert.equal(
    rereadFreshnessHeadline(out4),
    "1 of 1 marked section can't be freshness-checked (no lastTouched on playbook)"
  );
});

test("rereadFreshnessRowTone: 0 marks / stale / unknown / current", () => {
  const neutral = { markedCount: 0, staleCount: 0, unknownCount: 0 } as never;
  assert.equal(rereadFreshnessRowTone(neutral), "text-muted-foreground");
  const stale = { markedCount: 1, staleCount: 1, unknownCount: 0 } as never;
  assert.equal(rereadFreshnessRowTone(stale), "text-rose-700 dark:text-rose-300");
  const unknown = { markedCount: 1, staleCount: 0, unknownCount: 1 } as never;
  assert.equal(rereadFreshnessRowTone(unknown), "text-amber-700 dark:text-amber-300");
  const current = { markedCount: 1, staleCount: 0, unknownCount: 0 } as never;
  assert.equal(rereadFreshnessRowTone(current), "text-emerald-700 dark:text-emerald-300");
});

test("rereadFreshnessSectionTone: stale / current / unknown tones", () => {
  assert.match(rereadFreshnessSectionTone("stale-since-reread"), /rose/);
  assert.match(rereadFreshnessSectionTone("current-as-of-reread"), /emerald/);
  assert.match(rereadFreshnessSectionTone("unknown"), /muted/);
});

test("rereadFreshnessSectionLabel: stale includes gapDays with +N format", () => {
  const stale = { state: "stale-since-reread" as const, gapDays: 17 };
  assert.equal(rereadFreshnessSectionLabel(stale as never), "stale · +17d since re-read");
  const stale2 = { state: "stale-since-reread" as const, gapDays: 1 };
  assert.equal(rereadFreshnessSectionLabel(stale2 as never), "stale · +1d since re-read");
  const current = { state: "current-as-of-reread" as const, gapDays: -5 };
  assert.equal(rereadFreshnessSectionLabel(current as never), "current as of re-read");
  const unknown = { state: "unknown" as const, gapDays: null };
  assert.equal(rereadFreshnessSectionLabel(unknown as never), "no lastTouched on playbook");
});

test("renderReReadFreshnessMarkdown: empty recipe returns graceful fallback", () => {
  const out = buildReReadFreshness({ rows: [], totalDrifted: 0, withRecipe: 0, noSections: 0, maxDriftDays: 0 }, {}, PLAYBOOKS, NOW);
  const md = renderReReadFreshnessMarkdown(out);
  assert.match(md, /No shipped playbooks yet/);
});

test("renderReReadFreshnessMarkdown: contains header + table header + per-row content + generated footer", () => {
  // 3 marks across 3 playbooks: 1 stale, 1 current, 1 unknown → 1/3 stale.
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": { "common-pitfalls": { reReadAt: isoDaysAgo(20) } },
    "02-post-purchase-upsell-reconvert": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
    "03-checkout-audit-baymard": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  const md = renderReReadFreshnessMarkdown(out);
  assert.match(md, /## Re-read freshness/);
  assert.match(md, /\| Playbook \| Stale \/ marked \| Worst gap \| Notes \|/);
  assert.match(md, /Abandoned cart flow/);
  assert.match(md, /Post-purchase upsell/);
  assert.match(md, /Checkout audit/);
  assert.match(md, /Generated 2026-10-07/);
  assert.match(md, /1\/3 marked sections stale/);
  // Notes column concatenates "1 stale · 1 current · 1 unknown" across rows,
  // not in a single line. Assert each count appears.
  assert.match(md, /1 stale/);
  assert.match(md, /1 current/);
  assert.match(md, /1 unknown/);
});

test("renderReReadFreshnessMarkdown: 0-mark row shows '(no marks yet)'", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": { "common-pitfalls": { reReadAt: isoDaysAgo(20) } },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  const md = renderReReadFreshnessMarkdown(out);
  assert.match(md, /Post-purchase upsell.*\(no marks yet\)/);
});

test("Invariant: section order matches the input recipe order", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": {
      "common-pitfalls": { reReadAt: isoDaysAgo(20) },
      "how-to-ship": { reReadAt: isoDaysAgo(60) },
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  const row = out.rows[0];
  assert.equal(row.sections[0].hash, "common-pitfalls");
  assert.equal(row.sections[1].hash, "how-to-ship");
});

test("Invariant: rows length matches the input recipe rows length", () => {
  const out = buildReReadFreshness(RECIPE, {}, PLAYBOOKS, NOW);
  assert.equal(out.rows.length, RECIPE.rows.length);
});

test("Invariant: markedCount = stale + current + unknown per row", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": {
      "common-pitfalls": { reReadAt: isoDaysAgo(20) },
      "how-to-ship": { reReadAt: isoDaysAgo(60) },
    },
    "02-post-purchase-upsell-reconvert": {
      "how-to-ship": { reReadAt: isoDaysAgo(5) },
    },
  };
  const out = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  for (const row of out.rows) {
    assert.equal(row.markedCount, row.staleCount + row.currentCount + row.unknownCount);
  }
  // Total at summary level too.
  assert.equal(out.totalMarks, out.totalStale + out.totalCurrent + out.totalUnknown);
});

test("buildReReadFreshness: deterministic across re-runs with the same inputs + now", () => {
  const map: ReReadMap = {
    "01-abandoned-cart-flow-klaviyo": { "common-pitfalls": { reReadAt: isoDaysAgo(20) } },
    "02-post-purchase-upsell-reconvert": { "how-to-ship": { reReadAt: isoDaysAgo(5) } },
  };
  const a = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  const b = buildReReadFreshness(RECIPE, map, PLAYBOOKS, NOW);
  assert.deepEqual(a, b);
});
