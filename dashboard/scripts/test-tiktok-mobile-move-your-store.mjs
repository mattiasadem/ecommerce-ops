// test-tiktok-mobile-move-your-store.mjs — RED-GREEN contract test for the
// TikTok-Path + Mobile-PDP-audit + Move-difficulty-impact calculators' new
// Your-store cross-page-intelligence wiring.
//
// Mirrors the canonical test-threepl-your-store.mjs / test-pdp-ab-your-store.mjs
// pattern (assert.match against the source) — the same template used by every
// calculator in the dashboard that inherits `ecom-ops:your-store:v1`.
//
// Sister-cron `improve-ecommerce-ops` (60m) shipped 3 untracked calculator
// files: tiktok-shop-path-calculator.tsx, mobile-pdp-audit.tsx,
// move-difficulty-impact.tsx. Each one read `loadYourStore()` but had no
// canonical `fromYourStore` badge / `mergeFromYourStore` projection /
// `setFromYourStore(false)` reset wiring. The dashboard-improver 6h tick
// completes that wiring so the operator's AOV + monthly-orders + gross-margin
// entered on Overview auto-prefills the 3 calculators the same way it
// already prefills abandoned-cart / welcome-series / post-purchase / 3PL /
// PDP A/B / creator-economy.
//
// Verifies (1) the helper imports are present, (2) each calculator tracks
// `fromYourStore`, (3) the wiring projects correctly, (4) the stored-inputs
// short-circuit prevents overwriting local edits, (5) the badge sentinel is
// emitted, (6) reset clears provenance, (7) the mergeFromYourStore helper
// itself maps the new TikTok-Shop fields (usDtcGmv + grossMarginPct).

import assert from "node:assert/strict";
import fs from "node:fs";

const tiktokSource = fs.readFileSync(
  new URL("../src/components/tiktok-shop-path-calculator.tsx", import.meta.url),
  "utf8",
);
const mobileSource = fs.readFileSync(
  new URL("../src/components/mobile-pdp-audit.tsx", import.meta.url),
  "utf8",
);
const moveSource = fs.readFileSync(
  new URL("../src/components/move-difficulty-impact.tsx", import.meta.url),
  "utf8",
);
const yourStoreSource = fs.readFileSync(
  new URL("../src/lib/your-store.ts", import.meta.url),
  "utf8",
);
const homeSource = fs.readFileSync(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);

// ========== TikTok Shop Path A/B/C scorer ==========
assert.match(
  tiktokSource,
  /import\s+\{[\s\S]*loadYourStore[\s\S]*mergeFromYourStore[\s\S]*\}\s+from\s+"@\/lib\/your-store"/,
  "TikTok calculator imports the canonical Your-store helpers",
);
assert.match(
  tiktokSource,
  /const\s+\[fromYourStore,\s*setFromYourStore\]\s*=\s*useState\(false\)/,
  "TikTok calculator tracks whether shared values supplied the defaults",
);
assert.match(
  tiktokSource,
  /mergeFromYourStore\(\s*TIKTOK_SHOP_DEFAULTS,\s*yourStore\s*\)/,
  "TikTok calculator maps Your-store through the canonical projection helper",
);
assert.match(
  tiktokSource,
  /data-testid="tiktok-shop-path-ys-badge"/,
  "TikTok calculator exposes a hydration badge sentinel",
);
assert.match(
  tiktokSource,
  /if\s*\(stored\)\s*\{[\s\S]*setInputs\(stored\)[\s\S]*setFromYourStore\(false\)/,
  "TikTok stored inputs short-circuit the shared-default projection and clear provenance",
);
assert.match(
  tiktokSource,
  /Prefilled from Your store on Overview/,
  "TikTok calculator renders the canonical Your-store prefilled banner",
);

// ========== Mobile-PDP audit ==========
assert.match(
  mobileSource,
  /import\s+\{[\s\S]*loadYourStore[\s\S]*\}\s+from\s+"@\/lib\/your-store"/,
  "Mobile-PDP audit imports the canonical Your-store helper",
);
assert.match(
  mobileSource,
  /const\s+\[fromYourStore,\s*setFromYourStore\]\s*=\s*useState\(false\)/,
  "Mobile-PDP audit tracks whether shared values supplied the defaults",
);
assert.match(
  mobileSource,
  /data-testid="mobile-pdp-audit-ys-badge"/,
  "Mobile-PDP audit exposes a hydration badge sentinel",
);
assert.match(
  mobileSource,
  /setFromYourStore\(true\)/,
  "Mobile-PDP audit sets the fromYourStore flag on Your-store hydration",
);
assert.match(
  mobileSource,
  /setInputs\(MOBILE_PDP_DEFAULTS\)[\s\S]*setFromYourStore\(false\)/,
  "Mobile-PDP audit reset clears Your-store provenance before restoring canonical defaults",
);
assert.match(
  mobileSource,
  /Prefilled from Your store on Overview/,
  "Mobile-PDP audit renders the canonical Your-store prefilled banner",
);

// ========== Move-difficulty × impact map ==========
assert.match(
  moveSource,
  /import\s+\{[\s\S]*loadYourStore[\s\S]*\}\s+from\s+"@\/lib\/your-store"/,
  "Move-difficulty-impact imports the canonical Your-store helper",
);
assert.match(
  moveSource,
  /data-testid="move-difficulty-impact-ys-badge"/,
  "Move-difficulty-impact exposes a hydration badge sentinel",
);
assert.match(
  moveSource,
  /const\s+fromYourStore\s*=\s*store\s*!==\s*null/,
  "Move-difficulty-impact derives fromYourStore from the loaded store presence",
);
assert.match(
  moveSource,
  /Prefilled from Your store on Overview/,
  "Move-difficulty-impact renders the canonical Your-store prefilled banner",
);

// ========== Canonical field map extension (your-store.ts) ==========
assert.match(
  yourStoreSource,
  /if\s*\(\s*("|')usDtcGmv\1\s+in\s+merged\s*\)/,
  "canonical projection maps Your-store AOV + monthlyOrders to the TikTok Path usDtcGmv",
);
assert.match(
  yourStoreSource,
  /merged\.usDtcGmv\s*=\s*Math\.max\(0,\s*yourStore\.aov\s*\*\s*yourStore\.monthlyOrders\s*\*\s*12\)/,
  "canonical projection computes usDtcGmv = aov * monthlyOrders * 12",
);
assert.match(
  yourStoreSource,
  /if\s*\(\s*("|')grossMarginPct\1\s+in\s+merged\s*\)[\s\S]*merged\.grossMarginPct\s*=\s*yourStore\.grossMargin\s*\*\s*100/,
  "canonical projection maps Your-store grossMargin to the TikTok Path grossMarginPct (×100)",
);

// ========== Overview cross-link strip ==========
assert.match(
  homeSource,
  /id="your-store-personalizes"/,
  "Overview page renders the 'Personalize with Your store' cross-link strip",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-tt"/,
  "Overview cross-link strip links to /tiktok",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-mpdp"/,
  "Overview cross-link strip links to mobile-PDP playbook",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-top10"/,
  "Overview cross-link strip links to /top-10 move-difficulty-impact",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-ac"/,
  "Overview cross-link strip links to abandoned-cart ROI",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-3pl"/,
  "Overview cross-link strip links to /3pl",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-pdp"/,
  "Overview cross-link strip links to PDP A/B testing",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-ce"/,
  "Overview cross-link strip links to /creators",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-ws"/,
  "Overview cross-link strip links to welcome-series ROI",
);
assert.match(
  homeSource,
  /data-testid="ys-cta-ppu"/,
  "Overview cross-link strip links to post-purchase-upsell ROI",
);

console.log(
  "PASS tiktok-shop-path + mobile-pdp-audit + move-difficulty-impact Your-store cross-page integration contract",
);
