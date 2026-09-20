/**
 * Smoke tests for `dashboard/src/lib/channel-benchmark-export.ts` — the
 * one-click CSV bundle builder for the 6 channel benchmark tables on
 * `/channels`.
 *
 * Run with: `npx jiti src/lib/__tests__/channel-benchmark-export.test.ts`
 *
 * Coverage:
 *   - `buildChannelBenchmarkCsv` metadata header (schema, version, exportedAt,
 *     label, source, channel_count, total_rows)
 *   - per-channel sub-heading + column header line + data rows
 *   - empty-block fallback ("# (no rows)" sentinel)
 *   - `csvEscape` round-trips commas, newlines, and double-quote characters
 *   - `validateChannelBenchmarkBundle` accepts a populated bundle, refuses an
 *     empty array, refuses an all-empty bundle
 *   - `channelBenchmarkFilename` always returns a stable, dated filename
 */

import {
  buildChannelBenchmarkCsv,
  channelBenchmarkFilename,
  validateChannelBenchmarkBundle,
  type ChannelBenchmarkBlock,
} from "../channel-benchmark-export";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function block(overrides: Partial<ChannelBenchmarkBlock>): ChannelBenchmarkBlock {
  return {
    id: "meta",
    title: "Meta (Facebook + Instagram) benchmarks",
    headers: ["Channel", "2025 typical range", "Source"],
    rows: [
      {
        Channel: "Meta",
        "2025 typical range": "2.5–4×",
        Source: "[verified]",
      },
    ],
    ...overrides,
  };
}

const META_BLOCK = block({});
const GOOGLE_BLOCK = block({
  id: "google",
  title: "Google Ads benchmarks",
  headers: ["Channel", "CPC", "CTR", "Source"],
  rows: [
    { Channel: "Google Search", CPC: "$1.20", CTR: "3.5%", Source: "[verified]" },
    { Channel: "Google Shopping", CPC: "$0.80", CTR: "1.2%", Source: "[verified]" },
  ],
});
const EMPTY_BLOCK = block({
  id: "tiktok",
  title: "TikTok Ads",
  headers: ["Channel", "CPM"],
  rows: [],
});

console.log("channel-benchmark-export.test.ts");

// --- buildChannelBenchmarkCsv metadata header ----------------------------------
{
  const csv = buildChannelBenchmarkCsv([META_BLOCK], {
    exportedAt: "2026-09-20",
  });

  check(
    "metadata header includes schema line",
    csv.startsWith("# ecommerce-ops-channel-benchmarks"),
  );
  check(
    "metadata header includes schema key/value",
    csv.includes("# schema,ecommerce-ops-channel-benchmarks"),
  );
  check(
    "metadata header includes version line",
    csv.includes("# version,1"),
  );
  check(
    "metadata header includes exported_at",
    csv.includes("# exported_at,2026-09-20"),
  );
  check(
    "metadata header includes default label",
    csv.includes("# label,Channel benchmarks bundle"),
  );
  check(
    "metadata header cites research/00 source",
    csv.includes(
      "# source,research/00-ecommerce-ops-landscape.md § 2 (Acquisition Channels Ranked by ROI)",
    ),
  );
  check(
    "metadata header includes channel_count",
    csv.includes("# channel_count,1"),
  );
  check(
    "metadata header includes total_rows",
    csv.includes("# total_rows,1"),
  );
}

// --- per-channel block rendering --------------------------------------------
{
  const csv = buildChannelBenchmarkCsv([META_BLOCK, GOOGLE_BLOCK], {
    exportedAt: "2026-09-20",
    label: "Custom label",
  });

  check(
    "custom label is reflected in header",
    csv.includes("# label,Custom label"),
  );
  check(
    "per-channel sub-heading for Meta is present",
    csv.includes("# --- Channel: Meta (Facebook + Instagram) benchmarks (meta) ---"),
  );
  check(
    "per-channel sub-heading for Google is present",
    csv.includes("# --- Channel: Google Ads benchmarks (google) ---"),
  );
  check(
    "Meta block row_count line",
    csv.includes("# row_count,1"),
  );
  check(
    "Google block row_count line",
    csv.includes("# row_count,2"),
  );
  check(
    "Meta column header line",
    csv.includes("Channel,2025 typical range,Source"),
  );
  check(
    "Meta data row",
    csv.includes("Meta,2.5–4×,[verified]"),
  );
  check(
    "Google data row 1",
    csv.includes("Google Search,$1.20,3.5%,[verified]"),
  );
  check(
    "Google data row 2",
    csv.includes("Google Shopping,$0.80,1.2%,[verified]"),
  );
  check(
    "trailing CRLF per RFC 4180",
    csv.endsWith("\r\n"),
  );
}

// --- empty block sentinel ---------------------------------------------------
{
  const csv = buildChannelBenchmarkCsv([EMPTY_BLOCK], {
    exportedAt: "2026-09-20",
  });
  check(
    "empty block includes '# (no rows)' sentinel",
    csv.includes("# row_count,0") && csv.includes("# (no rows)"),
  );
  check(
    "empty block still emits the sub-heading",
    csv.includes("# --- Channel: TikTok Ads (tiktok) ---"),
  );
}

// --- csvEscape round-trips ---------------------------------------------------
{
  // Indirect test: invoke buildChannelBenchmarkCsv with a row containing
  // every CSV-special character.
  const tricky = block({
    headers: ["Channel", "Notes"],
    rows: [
      {
        Channel: 'Quote "test"',
        Notes: "Multi\nline, comma",
      },
    ],
  });
  const csv = buildChannelBenchmarkCsv([tricky], {
    exportedAt: "2026-09-20",
  });
  check(
    "double-quote escaped as \"\"",
    csv.includes('"Quote ""test"""'),
  );
  check(
    "newline + comma forces quoted cell",
    csv.includes('"Multi\nline, comma"'),
  );
}

// --- validateChannelBenchmarkBundle -----------------------------------------
{
  check(
    "validate accepts a populated bundle",
    validateChannelBenchmarkBundle([META_BLOCK]) === null,
  );
  check(
    "validate refuses an empty array",
    validateChannelBenchmarkBundle([]) ===
      "No channel benchmarks available — content bundle is empty.",
  );
  check(
    "validate refuses an all-empty bundle",
    validateChannelBenchmarkBundle([EMPTY_BLOCK]) ===
      "All channel benchmarks are empty — nothing to export.",
  );
  check(
    "validate accepts a mixed bundle (some empty + some populated)",
    validateChannelBenchmarkBundle([META_BLOCK, EMPTY_BLOCK]) === null,
  );
}

// --- channelBenchmarkFilename ------------------------------------------------
{
  const fname = channelBenchmarkFilename({ exportedAt: "2026-09-20" });
  check(
    "filename embeds the export date",
    fname === "ecom-ops-channel-benchmarks-2026-09-20.csv",
  );
  check(
    "fallback filename uses today's date when exportedAt is empty",
    channelBenchmarkFilename({ exportedAt: "" }).startsWith(
      "ecom-ops-channel-benchmarks-",
    ),
  );
}

// --- summary ------------------------------------------------------------------
console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}