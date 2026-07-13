import assert from "node:assert/strict";
import {
  SUBSCRIPTION_DEFAULTS,
  recommendSubscriptionPath,
  renderSubscriptionMarkdown,
} from "../../src/lib/subscription";

const pathB = recommendSubscriptionPath(SUBSCRIPTION_DEFAULTS);
assert.equal(pathB.path, "B");
assert.equal(pathB.isDeferred, false);
assert.deepEqual(pathB.year1Cost, [6488, 7988]);
assert.deepEqual(pathB.year1SubscriptionRevenue, [525000, 1050000]);
assert.deepEqual(pathB.year1SubscriberCount, [933, 1633]);
assert.deepEqual(pathB.canonicalRoi, [3.2, 25]);
assert.equal(pathB.midpoint.subscriptionRevenue, 787500);
assert.equal(pathB.midpoint.subscriberCount, 1283);
assert.equal(pathB.midpoint.mrr, 47631.375);

const pathA = recommendSubscriptionPath({
  ...SUBSCRIPTION_DEFAULTS,
  usGmv: 200000,
  monthlyOrders: 500,
});
assert.equal(pathA.path, "A");
assert.deepEqual(pathA.year1Cost, [1188, 2288]);
assert.deepEqual(pathA.year1SubscriptionRevenue, [21000, 42000]);
assert.deepEqual(pathA.year1SubscriberCount, [35, 70]);

const pathCInputs = {
  ...SUBSCRIPTION_DEFAULTS,
  usGmv: 15000000,
  aov: 60,
  monthlyOrders: 25000,
  consumablesRevenueSharePct: 80,
  subscriberConversionBaselinePct: 25,
  monthlyChurnBaselinePct: 5,
  platformPreference: "skio" as const,
  operatorCapacityHoursPerWeek: 12,
};
const pathC = recommendSubscriptionPath(pathCInputs);
assert.equal(pathC.path, "C");
assert.deepEqual(pathC.year1Cost, [14000, 70000]);
assert.deepEqual(pathC.year1SubscriptionRevenue, [4800000, 8400000]);
assert.deepEqual(pathC.year1SubscriberCount, [5000, 8000]);

const downgraded = recommendSubscriptionPath({
  ...pathCInputs,
  aov: 25,
  hasSubscriberAttribution: false,
});
assert.equal(downgraded.path, "A");
assert.equal(downgraded.downgrades.length, 2);

const deferred = recommendSubscriptionPath({
  ...SUBSCRIPTION_DEFAULTS,
  consumablesRevenueSharePct: 20,
  monthlyOrders: 100,
  hasReplenishmentCadence: false,
  subscriberConversionBaselinePct: 3,
  monthlyChurnBaselinePct: 18,
  operatorCapacityHoursPerWeek: 1,
});
assert.equal(deferred.isDeferred, true);
assert.equal(deferred.deferralReasons.length, 6);

const report = renderSubscriptionMarkdown(SUBSCRIPTION_DEFAULTS, pathB);
assert.match(report, /Subscription Path B recommendation/);
assert.match(report, /Year-1 subscription revenue:\*\* \$525,000–\$1,050,000/);
assert.match(report, /6-step build sequence/);

console.log("subscription-path parity: 6 scenarios passed");
