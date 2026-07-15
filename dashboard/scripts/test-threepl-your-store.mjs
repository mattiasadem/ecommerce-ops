import fs from "node:fs";
import assert from "node:assert/strict";

const sourcePath = new URL("../src/components/threepl-path-calculator.tsx", import.meta.url);
const yourStorePath = new URL("../src/lib/your-store.ts", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const yourStoreSource = fs.readFileSync(yourStorePath, "utf8");

assert.match(
  source,
  /import\s+\{[\s\S]*loadYourStore[\s\S]*mergeFromYourStore[\s\S]*\}\s+from\s+"@\/lib\/your-store"/,
  "3PL calculator imports the canonical Your-store helpers",
);
assert.match(
  source,
  /const\s+\[fromYourStore,\s*setFromYourStore\]\s*=\s*useState\(false\)/,
  "3PL calculator tracks whether shared values supplied the defaults",
);
assert.match(
  source,
  /const\s+yourStore\s*=\s*loadYourStore\(\)/,
  "3PL calculator reads the shared Your-store key during hydration",
);
assert.match(
  source,
  /mergeFromYourStore\(\s*THREEPL_DEFAULTS,\s*yourStore\)/,
  "3PL calculator maps AOV and orders/mo through the canonical projection helper",
);
assert.match(
  source,
  /Prefilled from Your store on Overview/,
  "3PL calculator exposes a hydration badge sentinel",
);
assert.match(
  source,
  /setInputs\(THREEPL_DEFAULTS\)[\s\S]*setFromYourStore\(false\)/,
  "reset clears Your-store provenance before restoring canonical defaults",
);

const hydrationBlock = source.slice(
  source.indexOf("useEffect(() => {", source.indexOf("export function ThreeplPathCalculator")),
  source.indexOf("// Persist on every change", source.indexOf("export function ThreeplPathCalculator")),
);
assert.ok(
  hydrationBlock.indexOf("loadStored()") < hydrationBlock.indexOf("loadYourStore()"),
  "calculator-specific stored inputs take precedence over shared Your-store defaults",
);
assert.match(
  hydrationBlock,
  /if\s*\(stored\)\s*\{[\s\S]*setInputs\(stored\)[\s\S]*return/,
  "stored 3PL inputs short-circuit the shared-default projection",
);

assert.match(
  yourStoreSource,
  /if \(("|')aov\1 in merged\) merged\.aov = yourStore\.aov/,
  "canonical projection maps Your-store AOV to the calculator's aov field",
);
assert.match(
  yourStoreSource,
  /if \(("|')ordersPerMonth\1 in merged\) merged\.ordersPerMonth = yourStore\.monthlyOrders/,
  "canonical projection maps Your-store monthly orders to ordersPerMonth",
);

console.log("PASS threepl-path Your-store cross-page integration contract");
