// test-creator-economy-your-store.mjs — RED-GREEN contract test for the
// creator-economy Path A / B / C scorer's cross-page Your-store wiring.
// Mirrors the canonical test-threepl-your-store.mjs pattern (assert.match
// against the source) — the same template used by every calculator in the
// dashboard that inherits `ecom-ops:your-store:v1`.
//
// The Move #19 creator-economy track is the canonical Path B DEFAULT for
// $500k-$5M GMV brands. The Your-store cross-page-intelligence pattern lets
// the operator enter AOV + monthly orders + gross margin ONCE on the Overview
// page and have those numbers propagate to creator-economy's `usDtcGmv`
// (monthlyOrders × aov × 12) and `grossMarginPct` (grossMargin × 100) when
// the operator first lands on /creators — so the recommendation immediately
// reflects the operator's real GMV scale instead of the $2M canonical default.
//
// Verifies (1) the wiring exists in the component, (2) the wiring projects
// correctly, (3) the stored-inputs short-circuit prevents overwriting local
// edits, (4) the storage-event listener fires on cross-tab edits, and
// (5) the mergeFromYourStore helper is invoked with the canonical field map.

import assert from "node:assert/strict";
import fs from "node:fs";

const componentPath = new URL(
  "../src/components/creator-economy-path-calculator.tsx",
  import.meta.url,
);
const yourStorePath = new URL(
  "../src/lib/your-store.ts",
  import.meta.url,
);
const libPath = new URL(
  "../src/lib/creator-economy.ts",
  import.meta.url,
);

assert.ok(
  fs.existsSync(componentPath),
  "RED: Move #19 creator-economy-path-calculator component must exist",
);
assert.ok(
  fs.existsSync(yourStorePath),
  "RED: dashboard/src/lib/your-store.ts must exist",
);
assert.ok(
  fs.existsSync(libPath),
  "RED: dashboard/src/lib/creator-economy.ts must exist",
);

const componentSource = fs.readFileSync(componentPath, "utf8");
const yourStoreSource = fs.readFileSync(yourStorePath, "utf8");
const libSource = fs.readFileSync(libPath, "utf8");

// ===== Your-store helper exports =====
assert.match(
  yourStoreSource,
  /export\s+function\s+loadYourStore\b/,
  "loadYourStore must be exported from your-store.ts",
);
assert.match(
  yourStoreSource,
  /export\s+function\s+mergeFromYourStore\b/,
  "mergeFromYourStore must be exported from your-store.ts",
);
assert.match(
  yourStoreSource,
  /export\s+const\s+YOUR_STORE_STORAGE_KEY\s*=\s*"ecom-ops:your-store:v1"/,
  "YOUR_STORE_STORAGE_KEY must be pinned to ecom-ops:your-store:v1",
);

// ===== Component imports the Your-store helper =====
assert.match(
  componentSource,
  /import\s*\{\s*loadYourStore,\s*mergeFromYourStore,\s*YOUR_STORE_STORAGE_KEY\s*\}\s*from\s*"@\/lib\/your-store"/,
  "component must import loadYourStore + mergeFromYourStore + YOUR_STORE_STORAGE_KEY from @/lib/your-store",
);

// ===== Component uses the canonical localStorage key for the calculator =====
assert.match(
  componentSource,
  /STORAGE_KEY\s*=\s*"ecom-ops:creator-economy-path:v1"/,
  "component must pin its local storage key to ecom-ops:creator-economy-path:v1",
);

// ===== Component tracks fromYourStore state + badge =====
assert.match(
  componentSource,
  /const\s+\[fromYourStore,\s*setFromYourStore\]\s*=\s*useState\(false\)/,
  "component must track fromYourStore boolean state",
);
assert.match(
  componentSource,
  /Prefilled from Your store on Overview/,
  "component must show 'Prefilled from Your store on Overview' badge when fromYourStore is true",
);

// ===== Component reads Your-store on mount (with stored-inputs short-circuit) =====
assert.match(
  componentSource,
  /loadStored\(\)/,
  "component must check loadStored() before reading Your-store (stored-inputs short-circuit)",
);
assert.match(
  componentSource,
  /const\s+yourStore\s*=\s*loadYourStore\(\)/,
  "component must call loadYourStore() to read cross-page Your-store inputs",
);

// ===== Component projects Your-store onto creator-economy defaults =====
assert.match(
  componentSource,
  /usDtcGmv:\s*Math\.max\(0,\s*Math\.round\(yourStore\.monthlyOrders\s*\*\s*yourStore\.aov\s*\*\s*12\)\)/,
  "component must project usDtcGmv = monthlyOrders × aov × 12",
);
assert.match(
  componentSource,
  /grossMarginPct:\s*Math\.round\(yourStore\.grossMargin\s*\*\s*100\s*\*\s*10\)\s*\/\s*10/,
  "component must project grossMarginPct = grossMargin × 100 (rounded to 1 decimal)",
);

// ===== Component registers a cross-tab storage listener =====
assert.match(
  componentSource,
  /window\.addEventListener\("storage",\s*handler\)/,
  "component must listen for cross-tab storage events on the Your-store key",
);
assert.match(
  componentSource,
  /e\.key\s*!==\s*YOUR_STORE_STORAGE_KEY/,
  "storage handler must filter by YOUR_STORE_STORAGE_KEY",
);

// ===== Reset clears the fromYourStore flag =====
assert.match(
  componentSource,
  /function\s+resetDefaults\(\)\s*\{[^}]*setFromYourStore\(false\)/s,
  "resetDefaults must clear fromYourStore flag",
);

// ===== Lib exposes the field names we project onto =====
assert.match(
  libSource,
  /usDtcGmv:\s*2_000_000/,
  "CREATOR_ECONOMY_DEFAULTS must include usDtcGmv default",
);
assert.match(
  libSource,
  /grossMarginPct:\s*50\.0/,
  "CREATOR_ECONOMY_DEFAULTS must include grossMarginPct default",
);

console.log(
  "PASS creator-economy Path A/B/C scorer Your-store cross-page integration contract",
);
