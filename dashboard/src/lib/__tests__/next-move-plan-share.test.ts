/**
 * Move #N.15 — `next-move-plan-share.ts` test suite.
 *
 * Verifies the URL-hash encode / decode + auto-import flow for the
 * what-if plan share-link feature.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

// Direct source import — bypasses the @/lib/... alias so `npx jiti` works
// from any cwd.
import {
  describeSharedPlan,
  encodePlanShareHash,
  parsePlanShareHash,
  planShareBannerToneClass,
  resolveSharedPlan,
  PLAN_SHARE_HASH_KEY,
  PLAN_SHARE_LAST_IMPORTED_EVENT,
  PLAN_SHARE_LAST_IMPORTED_KEY,
  PLAN_SHARE_START_KEY,
  whatIfFromSharedPlan,
} from "../next-move-plan-share";

test("encodePlanShareHash: empty plan returns empty string", () => {
  assert.equal(encodePlanShareHash({}), "");
});

test("encodePlanShareHash: one-move plan encodes CSV", () => {
  const hash = encodePlanShareHash({ "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-08T00:00:00Z" } });
  assert.ok(
    hash.startsWith(`${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo`)
  );
  assert.ok(hash.includes(`&${PLAN_SHARE_START_KEY}=`));
  assert.ok(hash.endsWith(new Date().toISOString().slice(0, 10)));
});

test("encodePlanShareHash: preserves insertion order", () => {
  const hash = encodePlanShareHash({
    c: { addedAt: "2026-10-08T00:00:00Z" },
    a: { addedAt: "2026-10-08T00:00:00Z" },
    b: { addedAt: "2026-10-08T00:00:00Z" },
  });
  // Order should be c,a,b (insertion order of the JS object).
  assert.ok(hash.includes("c,a,b"));
});

test("encodePlanShareHash: uses provided startDate when valid", () => {
  const hash = encodePlanShareHash(
    { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-08T00:00:00Z" } },
    "2026-12-25"
  );
  assert.ok(hash.endsWith(`&${PLAN_SHARE_START_KEY}=2026-12-25`));
});

test("encodePlanShareHash: falls back to today when startDate is invalid", () => {
  const hash = encodePlanShareHash(
    { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-08T00:00:00Z" } },
    "not-a-date"
  );
  assert.ok(!hash.includes("not-a-date"));
});

test("parsePlanShareHash: empty hash is invalid", () => {
  const out = parsePlanShareHash("");
  assert.equal(out.valid, false);
  assert.equal(out.moveIds.length, 0);
});

test("parsePlanShareHash: missing plan= prefix is invalid", () => {
  const out = parsePlanShareHash("#some-other-thing");
  assert.equal(out.valid, false);
});

test("parsePlanShareHash: plan= with empty CSV is invalid", () => {
  const out = parsePlanShareHash(`#${PLAN_SHARE_HASH_KEY}=`);
  assert.equal(out.valid, false);
});

test("parsePlanShareHash: single-move plan", () => {
  const out = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo`
  );
  assert.equal(out.valid, true);
  assert.deepEqual(out.moveIds, ["01-abandoned-cart-flow-klaviyo"]);
});

test("parsePlanShareHash: multi-move CSV", () => {
  const out = parsePlanShareHash(`#${PLAN_SHARE_HASH_KEY}=a,b,c`);
  assert.deepEqual(out.moveIds, ["a", "b", "c"]);
});

test("parsePlanShareHash: tolerates stray whitespace", () => {
  const out = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}= a , b ,  c `
  );
  assert.deepEqual(out.moveIds, ["a", "b", "c"]);
});

test("parsePlanShareHash: parses start date", () => {
  const out = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=a,b&${PLAN_SHARE_START_KEY}=2026-12-25`
  );
  assert.equal(out.startDate, "2026-12-25");
});

test("parsePlanShareHash: invalid start date falls back to today", () => {
  const out = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=a,b&${PLAN_SHARE_START_KEY}=not-a-date`
  );
  assert.match(out.startDate, /^\d{4}-\d{2}-\d{2}$/);
});

test("parsePlanShareHash: tolerates leading #", () => {
  const a = parsePlanShareHash(`#${PLAN_SHARE_HASH_KEY}=x`);
  const b = parsePlanShareHash(`${PLAN_SHARE_HASH_KEY}=x`);
  assert.equal(a.valid, true);
  assert.equal(b.valid, true);
  assert.deepEqual(a.moveIds, ["x"]);
});

test("parsePlanShareHash: tolerates co-existing flow-id hash fragment", () => {
  // The lifecycle page uses #1.1_browse_abandon — we tolerate extra bits.
  const out = parsePlanShareHash(
    `#1.1_browse_abandon&${PLAN_SHARE_HASH_KEY}=a,b&${PLAN_SHARE_START_KEY}=2026-12-25`
  );
  assert.deepEqual(out.moveIds, ["a", "b"]);
  assert.equal(out.startDate, "2026-12-25");
});

test("roundtrip: encode → parse preserves ids + start date", () => {
  const original = {
    "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-08T00:00:00Z" },
    "03-checkout-audit-baymard": { addedAt: "2026-10-09T00:00:00Z" },
    "04-welcome-series-klaviyo": { addedAt: "2026-10-10T00:00:00Z" },
  };
  const hash = encodePlanShareHash(original, "2026-11-01");
  const parsed = parsePlanShareHash(`#${hash}`);
  assert.equal(parsed.valid, true);
  assert.deepEqual(parsed.moveIds, [
    "01-abandoned-cart-flow-klaviyo",
    "03-checkout-audit-baymard",
    "04-welcome-series-klaviyo",
  ]);
  assert.equal(parsed.startDate, "2026-11-01");
});

test("resolveSharedPlan: known moves get priority rank + name", () => {
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo,unknown-id`
  );
  const { moves, unknownMoveIds } = resolveSharedPlan(parsed);
  assert.equal(moves.length, 1);
  assert.equal(moves[0].id, "01-abandoned-cart-flow-klaviyo");
  assert.equal(moves[0].priorityRank, 1);
  assert.ok(moves[0].name.includes("Abandoned"));
  assert.deepEqual(unknownMoveIds, ["unknown-id"]);
});

test("resolveSharedPlan: unknown id only — moves=[], unknownMoveIds=[id]", () => {
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=unknown-only`
  );
  const { moves, unknownMoveIds } = resolveSharedPlan(parsed);
  assert.equal(moves.length, 0);
  assert.deepEqual(unknownMoveIds, ["unknown-only"]);
});

test("whatIfFromSharedPlan: builds map with monotone addedAt", () => {
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=a,b,c`
  );
  const map = whatIfFromSharedPlan(parsed);
  // Only known move IDs survive; "a"/"b"/"c" aren't in MOVE_RECOMMENDATIONS
  // — let's use a real id.
  const real = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo,03-checkout-audit-baymard`
  );
  const realMap = whatIfFromSharedPlan(real);
  assert.equal(Object.keys(realMap).length, 2);
  const t1 = new Date(realMap["01-abandoned-cart-flow-klaviyo"].addedAt).getTime();
  const t2 = new Date(realMap["03-checkout-audit-baymard"].addedAt).getTime();
  assert.ok(t2 > t1, "second move should have strictly later timestamp");
});

test("describeSharedPlan: empty plan → 'Empty plan'", () => {
  const parsed = parsePlanShareHash("#something-else");
  assert.equal(describeSharedPlan(parsed), "Empty plan");
});

test("describeSharedPlan: 1 known move → 'Move #N'", () => {
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo`
  );
  assert.equal(describeSharedPlan(parsed), "Move #1");
});

test("describeSharedPlan: 4 known moves → 'Move #1, Move #2, Move #3 +1 more'", () => {
  // Use 4 distinct real moves to exceed the inline cap.
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=01-abandoned-cart-flow-klaviyo,03-checkout-audit-baymard,04-welcome-series-klaviyo,02-post-purchase-upsell-reconvert`
  );
  const desc = describeSharedPlan(parsed);
  assert.match(desc, /Move #1/);
  assert.match(desc, /\+1 more$/);
});

test("describeSharedPlan: unknown IDs are shown verbatim", () => {
  const parsed = parsePlanShareHash(
    `#${PLAN_SHARE_HASH_KEY}=totally-unknown`
  );
  // Should fall through and show the raw id since it's not in MOVE_RECOMMENDATIONS.
  assert.equal(describeSharedPlan(parsed), "totally-unknown");
});

test("planShareBannerToneClass: returns sky tone", () => {
  const tone = planShareBannerToneClass();
  assert.match(tone, /sky/);
});

test("PLAN_SHARE_HASH_KEY / PLAN_SHARE_START_KEY: stable format", () => {
  assert.equal(PLAN_SHARE_HASH_KEY, "plan");
  assert.equal(PLAN_SHARE_START_KEY, "start");
});

test("PLAN_SHARE_LAST_IMPORTED_KEY / EVENT: stable format", () => {
  assert.equal(
    PLAN_SHARE_LAST_IMPORTED_KEY,
    "ecom-ops:next-move-plan-share:last-imported:v1"
  );
  assert.equal(
    PLAN_SHARE_LAST_IMPORTED_EVENT,
    "ecom-ops:next-move-plan-share:last-imported:update"
  );
});