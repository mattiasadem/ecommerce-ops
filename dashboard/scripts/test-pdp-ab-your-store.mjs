import fs from "node:fs";
import assert from "node:assert/strict";

const sourcePath = new URL("../src/components/pdp-ab-test-calculator.tsx", import.meta.url);
const yourStorePath = new URL("../src/lib/your-store.ts", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const yourStoreSource = fs.readFileSync(yourStorePath, "utf8");

assert.match(
  source,
  /import\s+\{[\s\S]*loadYourStore[\s\S]*mergeFromYourStore[\s\S]*\}\s+from\s+"@\/lib\/your-store"/,
  "PDP calculator imports the canonical Your-store helpers",
);
assert.match(
  source,
  /const\s+\[fromYourStore,\s*setFromYourStore\]\s*=\s*useState\(false\)/,
  "PDP calculator tracks whether shared values supplied the defaults",
);
assert.match(
  source,
  /const\s+yourStore\s*=\s*loadYourStore\(\)/,
  "PDP calculator reads the shared Your-store key during hydration",
);
assert.match(
  source,
  /mergeFromYourStore<AbTestInputs>\(\s*PDP_AB_TEST_DEFAULTS,\s*yourStore,?\s*\)/,
  "PDP calculator maps AOV and margin through the canonical projection helper",
);
assert.match(
  source,
  /data-testid="pdp-ab-test-ys-badge"/,
  "PDP calculator exposes a hydration badge sentinel",
);
assert.match(
  source,
  /if\s*\(fromYourStore\)\s*setFromYourStore\(false\)/,
  "editing a field clears the Your-store provenance badge",
);
assert.match(
  source,
  /setFromYourStore\(false\);[\s\S]*setInputs\(PDP_AB_TEST_DEFAULTS\)/,
  "reset clears Your-store provenance before restoring canonical defaults",
);

const hydrationBlock = source.slice(
  source.indexOf("useEffect(() => {"),
  source.indexOf("// Persist after hydration"),
);
assert.ok(
  hydrationBlock.indexOf("loadStored()") < hydrationBlock.indexOf("loadYourStore()"),
  "calculator-specific stored inputs take precedence over shared Your-store defaults",
);
assert.match(
  hydrationBlock,
  /if\s*\(stored\)\s*\{[\s\S]*setInputs\(stored\)[\s\S]*return/,
  "stored PDP inputs short-circuit the shared-default projection",
);

assert.match(
  yourStoreSource,
  /if \("margin" in merged\) merged\.margin = yourStore\.grossMargin/,
  "canonical projection maps Your-store gross margin to the PDP margin field",
);

console.log("PASS pdp-ab-test Your-store cross-page integration contract");
