// triple-whale-attribution.test.ts — Move #N.22.1 Triple Whale vs Polar
// Path A/B/C/D/E picker tests.
//
// Validates: defaults, pickStoreSize, recommendPath 5-way decision tree,
// capability matrix per platform, lift math sanity, validateInputs,
// renderAttributionMarkdown. All 60+ assertions PASS via `npx jiti`.

import {
  TRIPLE_WHALE_DEFAULTS,
  recommendPath,
  validateInputs,
  renderAttributionMarkdown,
  PLATFORM_COST,
  PATH_LABEL,
  type TripleWhaleAttributionInputs,
} from "../triple-whale-attribution";

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

function runTests(): void {
  let pass = 0;
  const check = (label: string, cond: unknown) => {
    if (!cond) throw new Error(`[FAIL] ${label}`);
    pass += 1;
  };

  // --- DEFAULTS ---
  check("default monthlyRevenue is 200k", TRIPLE_WHALE_DEFAULTS.monthlyRevenue === 200_000);
  check("default cartPlatform is shopify", TRIPLE_WHALE_DEFAULTS.cartPlatform === "shopify");
  check("default monthlyOrders is 1500", TRIPLE_WHALE_DEFAULTS.monthlyOrders === 1_500);
  check("default hasKlaviyo true", TRIPLE_WHALE_DEFAULTS.hasKlaviyo === true);
  check("default operatorCapacity 8hr/wk", TRIPLE_WHALE_DEFAULTS.operatorCapacityHoursPerWeek === 8);
  check("default needsMmm false", TRIPLE_WHALE_DEFAULTS.needsMmm === false);
  check("default needsPostPurchaseSurvey true", TRIPLE_WHALE_DEFAULTS.needsPostPurchaseSurvey === true);

  // --- PLATFORM_COST constants ---
  check("polar-starter costs $49/mo", PLATFORM_COST["polar-starter"] === 49);
  check("tw-starter costs $179/mo", PLATFORM_COST["tw-starter"] === 179);
  check("tw-pro costs $1290/mo", PLATFORM_COST["tw-pro"] === 1290);
  check("polar-pro costs $299/mo", PLATFORM_COST["polar-pro"] === 299);
  check("free costs $0/mo", PLATFORM_COST["free"] === 0);

  // --- PATH_LABEL keys ---
  check("PATH_LABEL has 5 paths", Object.keys(PATH_LABEL).length === 5);
  check("Path A label", PATH_LABEL.A.startsWith("Path A"));
  check("Path E label", PATH_LABEL.E.includes("Free"));

  // --- recommendPath: Path E for pre-revenue ---
  const tiny: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 5_000,
    monthlyPaidSpend: 500,
  };
  const recE = recommendPath(tiny);
  check("Path E: pre-revenue → path E", recE.path === "E");
  check("Path E: free platform", recE.platform === "free");
  check("Path E: $0/mo", recE.costMonthly === 0);
  // Path E lift is 0 because no attribution tool → no recovered paid spend
  // (liftMultiplier = 0); the cohort-LTV retention savings are also
  // nulled because Path E does not actually instrument cohort LTV.
  check("Path E: 0 lift", recE.attributionLiftLow === 0 && recE.attributionLiftHigh === 0);
  check("Path E: no MER capability", recE.capabilities.mer === false);
  check("Path E: no cohort LTV", recE.capabilities.cohortLtv === false);
  check("Path E: justification mentions free", recE.justification.includes("Free") || recE.justification.includes("free"));

  // --- recommendPath: Path A (Polar Starter) for Shopify small + <$5k paid ---
  const small: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 30_000,            // $360k/yr GMV
    monthlyPaidSpend: 3_000,
  };
  const recA = recommendPath(small);
  check("Path A: small Shopify + <$5k paid → path A", recA.path === "A");
  check("Path A: polar-starter platform", recA.platform === "polar-starter");
  check("Path A: $49/mo", recA.costMonthly === 49);
  check("Path A: year1Cost $588", recA.year1Cost === 588);
  check("Path A: has MER", recA.capabilities.mer === true);
  check("Path A: no MMM", recA.capabilities.mmmIncrementality === false);
  check("Path A: lift > 0", recA.attributionLiftHigh > 0);
  check("Path A: 5-step build sequence", recA.buildSequence.length === 5);
  check("Path A: 7 verification gates", recA.verificationGates.length === 7);

  // --- recommendPath: Path B (TW Starter) — DEFAULT ---
  const mid: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 200_000,           // $2.4M/yr GMV → mid tier
    monthlyPaidSpend: 20_000,
  };
  const recB = recommendPath(mid);
  check("Path B: mid Shopify → path B", recB.path === "B");
  check("Path B: tw-starter platform", recB.platform === "tw-starter");
  check("Path B: $179/mo", recB.costMonthly === 179);
  check("Path B: year1Cost $2,148", recB.year1Cost === 2148);
  check("Path B: has post-purchase survey", recB.capabilities.postPurchaseSurvey === true);
  check("Path B: no MMM (Starter tier)", recB.capabilities.mmmIncrementality === false);
  check("Path B: 5 build steps", recB.buildSequence.length === 5);
  check("Path B: 7 verification gates", recB.verificationGates.length === 7);
  check("Path B: lift > path A lift (higher tier)", recB.attributionLiftHigh > recA.attributionLiftHigh);

  // --- recommendPath: Path B for small + ≥$5k paid (rule 5) ---
  const smallButHighPaid: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 30_000,
    monthlyPaidSpend: 8_000,           // ≥$5k/mo paid → upgrade
  };
  const recBupgrade = recommendPath(smallButHighPaid);
  check("Path B-upgrade: small + ≥$5k paid → path B", recBupgrade.path === "B");
  check("Path B-upgrade: tw-starter", recBupgrade.platform === "tw-starter");

  // --- recommendPath: Path C (TW Pro) for large + needs MMM ---
  const largeMmm: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 1_000_000,         // $12M/yr GMV → large
    monthlyPaidSpend: 80_000,
    needsMmm: true,
  };
  const recC = recommendPath(largeMmm);
  check("Path C: large + needsMmm → path C", recC.path === "C");
  check("Path C: tw-pro platform", recC.platform === "tw-pro");
  check("Path C: $1290/mo", recC.costMonthly === 1290);
  check("Path C: has MMM", recC.capabilities.mmmIncrementality === true);
  check("Path C: 5 build steps", recC.buildSequence.length === 5);
  check("Path C: lift > path B (Pro lift = 20% vs Starter 15%)", recC.attributionLiftHigh > recB.attributionLiftHigh);

  // --- recommendPath: Path D (Polar Pro) for non-Shopify ---
  const woo: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 200_000,
    monthlyPaidSpend: 20_000,
    cartPlatform: "woocommerce",
  };
  const recD = recommendPath(woo);
  check("Path D: non-Shopify → path D", recD.path === "D");
  check("Path D: polar-pro platform", recD.platform === "polar-pro");
  check("Path D: $299/mo", recD.costMonthly === 299);
  check("Path D: no MMM (Polar Pro)", recD.capabilities.mmmIncrementality === false);
  check("Path D: justification mentions non-Shopify", recD.justification.includes("Shopify") || recD.justification.includes("non-Shopify"));

  const bigcommerce: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 200_000,
    monthlyPaidSpend: 20_000,
    cartPlatform: "bigcommerce",
  };
  check("Path D: bigcommerce → path D", recommendPath(bigcommerce).path === "D");

  const headless: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 200_000,
    monthlyPaidSpend: 20_000,
    cartPlatform: "headless",
  };
  check("Path D: headless → path D", recommendPath(headless).path === "D");

  // --- recommendPath: Path B for large without MMM (rule 6 — MMM optional below $50k paid) ---
  const largeNoMmm: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 1_000_000,
    monthlyPaidSpend: 40_000,         // <$50k paid → MMM not strictly needed
    needsMmm: false,
  };
  const recLargeNoMmm = recommendPath(largeNoMmm);
  check("Path B: large + no MMM + <$50k paid → path B (Starter)", recLargeNoMmm.path === "B");

  // --- validateInputs ---
  const baseInputs: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS };
  check("valid inputs → 0 errors", validateInputs(baseInputs).length === 0);
  const negRev: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS, monthlyRevenue: -1 };
  check("negative revenue → 1 error", validateInputs(negRev).length === 1);
  const negPaid: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS, monthlyPaidSpend: -1 };
  check("negative paid → 1 error", validateInputs(negPaid).length === 1);
  const negOrders: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS, monthlyOrders: -1 };
  check("negative orders → 1 error", validateInputs(negOrders).length === 1);
  const negHrs: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS, operatorCapacityHoursPerWeek: -1 };
  check("negative hours → 1 error", validateInputs(negHrs).length === 1);
  const hugeHrs: TripleWhaleAttributionInputs = { ...TRIPLE_WHALE_DEFAULTS, operatorCapacityHoursPerWeek: 50 };
  check(">40 hours → 1 error", validateInputs(hugeHrs).length === 1);
  const badRatio: TripleWhaleAttributionInputs = {
    ...TRIPLE_WHALE_DEFAULTS,
    monthlyRevenue: 1000,
    monthlyPaidSpend: 5000,           // 5× revenue — unrealistic
  };
  check("paid > 2× revenue → 1 error", validateInputs(badRatio).length === 1);

  // --- lift math sanity ---
  check("Path B lift: low <= high", recB.attributionLiftLow <= recB.attributionLiftHigh);
  check("Path A lift: low <= high", recA.attributionLiftLow <= recA.attributionLiftHigh);
  check("Path C lift: low <= high", recC.attributionLiftLow <= recC.attributionLiftHigh);
  check("Path B year1Net: high > low", recB.year1NetHigh > recB.year1NetLow);

  // --- year1Cost math ---
  check("Path A year1Cost = 49×12", recA.year1Cost === 49 * 12);
  check("Path B year1Cost = 179×12", recB.year1Cost === 179 * 12);
  check("Path C year1Cost = 1290×12", recC.year1Cost === 1290 * 12);
  check("Path D year1Cost = 299×12", recD.year1Cost === 299 * 12);
  check("Path E year1Cost = 0", recE.year1Cost === 0);

  // --- breakeven math sanity ---
  check("Path A breakeven: high >= low", recA.breakevenMonthsHigh >= recA.breakevenMonthsLow);
  check("Path B breakeven: high >= low", recB.breakevenMonthsHigh >= recB.breakevenMonthsLow);
  check("Path E breakeven: 0 (free)", recE.breakevenMonthsLow === 0 && recE.breakevenMonthsHigh === 0);

  // --- renderAttributionMarkdown ---
  const md = renderAttributionMarkdown(mid, recB);
  check("markdown has heading", md.includes("# Move #6 Attribution Tool Picker"));
  check("markdown has platform name", md.includes("Triple Whale Starter"));
  check("markdown has Path B label", md.includes(PATH_LABEL.B));
  check("markdown has cost", md.includes("$179"));
  check("markdown has capability matrix header", md.includes("## Capability matrix"));
  check("markdown has MER row", md.includes("MER"));
  check("markdown has MMM row", md.includes("MMM"));
  check("markdown has Year-1 ROI section", md.includes("## Year-1 ROI"));
  check("markdown has Build sequence", md.includes("## Build sequence"));
  check("markdown has 5 build steps", (md.match(/^- Step \d/mg) || []).length === 5);
  check("markdown has Verification gates", md.includes("## Verification gates"));
  check("markdown has 7 gates", (md.match(/^- Gate [A-G]/mg) || []).length === 7);
  check("markdown has generated-on footer", md.includes("Generated by Move #6"));
  check("markdown has operator inputs", md.includes("## Operator inputs"));
  check("markdown has cart platform", md.includes("shopify"));

  // --- Path E markdown ---
  const mdE = renderAttributionMarkdown(tiny, recE);
  check("Path E markdown has Path E label", mdE.includes(PATH_LABEL.E));
  check("Path E markdown has $0 cost", mdE.includes("$0"));

  // --- capability matrix coverage ---
  const allCapKeys = ["mer", "cohortLtv", "postPurchaseSurvey", "klaviyoSync", "metaGoogleTiktokSync", "mmmIncrementality"] as const;
  for (const k of allCapKeys) {
    check(`Path B capability ${k} defined`, typeof recB.capabilities[k] === "boolean");
    check(`Path E capability ${k} defined`, typeof recE.capabilities[k] === "boolean");
  }
  // Path E should have all capabilities false
  for (const k of allCapKeys) {
    check(`Path E ${k} is false`, recE.capabilities[k] === false);
  }
  // Path C should have all true
  for (const k of allCapKeys) {
    check(`Path C ${k} is true`, recC.capabilities[k] === true);
  }

  console.log(`[PASS] ${pass} assertions`);
}

runTests();
