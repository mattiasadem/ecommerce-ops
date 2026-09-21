/**
 * Move #3 contract test — verify parse-content.mjs splits research/00 § 2's
 * 6 per-channel H4 benchmark tables into their own tables[] entries instead
 * of mashing them into one 44-row blob keyed by the Meta header.
 *
 * Run from dashboard/ root:
 *   node --import tsx scripts/tests/parse-content-h4-tables.test.mjs
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import contentJson from "../../src/lib/content.json" with { type: "json" };

const research00 = contentJson.research.find((r) => r.file === "00-ecommerce-ops-landscape.md");
assert.ok(research00, "research/00-ecommerce-ops-landscape.md doc missing");

// 1. The 6 H4 tables now appear as their own tables[] entries.
const expectedChannels = [
  "Meta (Facebook + Instagram)",
  "Google Ads",
  "TikTok Ads",
  "Organic (SEO + UGC)",
  "Email + SMS",
  "Influencer / Creator",
];
for (const heading of expectedChannels) {
  const found = research00.tables.find((t) => t.heading === heading);
  assert.ok(found, `expected tables[] entry for H4 "${heading}" not found`);
  assert.ok(
    found.rows.length > 0,
    `H4 table "${heading}" must have at least 1 row, got 0`,
  );
}

// 2. Each channel's first row uses THAT channel's actual column header, not
//    Meta's (this is the exact bug Move #3 fixes — Google/TikTok rows were
//    previously labeled with Vertical/CPM/CTR/CPC/CVR from Meta's header).
const google = research00.tables.find((t) => t.heading === "Google Ads");
const googleCols = Object.keys(google.rows[0]);
assert.ok(
  googleCols.includes("Search CPC"),
  `Google table must have Search CPC column, got [${googleCols.join(", ")}]`,
);
assert.ok(
  googleCols.includes("Search CTR"),
  `Google table must have Search CTR column`,
);
assert.ok(
  !googleCols.includes("CPM (USD)"),
  `Google table must NOT have Meta's CPM (USD) column`,
);

const tiktok = research00.tables.find((t) => t.heading === "TikTok Ads");
const tiktokCols = Object.keys(tiktok.rows[0]);
assert.ok(
  tiktokCols.includes("2025 typical range"),
  `TikTok table must have '2025 typical range' column, got [${tiktokCols.join(", ")}]`,
);
assert.ok(
  tiktokCols.includes("Metric"),
  `TikTok table must have 'Metric' column`,
);

const organic = research00.tables.find((t) => t.heading === "Organic (SEO + UGC)");
const organicCols = Object.keys(organic.rows[0]);
assert.ok(
  organicCols.includes("2025 typical range"),
  `Organic table must have '2025 typical range' column, got [${organicCols.join(", ")}]`,
);

const email = research00.tables.find((t) => t.heading === "Email + SMS");
const emailCols = Object.keys(email.rows[0]);
assert.ok(
  emailCols.includes("Open rate"),
  `Email table must have Open rate column, got [${emailCols.join(", ")}]`,
);
assert.ok(
  emailCols.includes("CTOR"),
  `Email table must have CTOR column`,
);
assert.ok(
  !emailCols.includes("Tier"),
  `Email table must NOT have Influencer's 'Tier' column (proves split)`,
);

const influencer = research00.tables.find((t) => t.heading === "Influencer / Creator");
const influencerCols = Object.keys(influencer.rows[0]);
assert.ok(
  influencerCols.includes("Followers"),
  `Influencer table must have Followers column, got [${influencerCols.join(", ")}]`,
);
assert.ok(
  influencerCols.includes("Tier"),
  `Influencer table must have Tier column`,
);
assert.ok(
  !influencerCols.includes("CPM (USD)"),
  `Influencer table must NOT have Meta's CPM (USD) column`,
);

// 3. Total table count for research/00 increases by exactly 6 (was 12 → now 18)
//    — Move #3 ships 6 new H4 tables without losing the existing 12.
const totalTables = research00.tables.length;
const expectedMin = 18;
assert.ok(
  totalTables >= expectedMin,
  `research/00 expected ≥${expectedMin} tables after H4 split, got ${totalTables}`,
);
assert.equal(
  totalTables,
  18,
  `research/00 table count drifted from expected 18 (12 baseline + 6 H4) to ${totalTables}`,
);

// 4. The parent H3 "Channel benchmark numbers (2025/26)" section no longer
//    holds a merged 44-row table — entry.table is null when H4s are present.
const benchSection = research00.sections.find(
  (s) => s.heading === "Channel benchmark numbers (2025/26)",
);
assert.equal(
  benchSection.table,
  null,
  "parent H3 'Channel benchmark numbers' should drop merged table when H4s are present",
);

// 5. findTable() contract — exact regex match returns non-empty rows for all 6.
function findTable(rows, re) {
  for (const d of rows) {
    for (const t of d.tables) {
      if (re.test(t.heading)) return t.rows;
    }
  }
  return [];
}
const findResults = [
  [/^Meta \(Facebook/, 7],
  [/^Google Ads$/, 6],
  [/^TikTok Ads$/, 5],
  [/^Organic/, 5],
  [/^Email \+ SMS$/, 6],
  [/^Influencer/, 5],
];
for (const [re, expectedMinRows] of findResults) {
  const rows = findTable(contentJson.research, re);
  assert.ok(
    rows.length >= expectedMinRows,
    `findTable(${re}) expected ≥${expectedMinRows} rows, got ${rows.length}`,
  );
}

// 6. Backwards compat — other research docs are unchanged. research/05's
//    "Cost & ROI estimate" H2 section still appears as a tables[] entry
//    with the canonical cost-row data (≥1 row: default $5M Path B).
const research05 = contentJson.research.find((r) => r.file === "05-lifecycle-marketing.md");
assert.ok(research05, "research/05 missing");
const costRoi = research05.tables.find((t) => /Cost & ROI estimate/i.test(t.heading));
assert.ok(costRoi, "research/05 'Cost & ROI estimate' table missing");
assert.ok(
  costRoi.rows.length >= 1,
  `research/05 Cost & ROI rows=${costRoi.rows.length}, expected ≥1`,
);

// 7. Counts.tables ticks up by exactly 6 vs the pre-Move-#3 baseline of 56.
assert.equal(
  contentJson.counts.tables,
  62,
  `counts.tables expected 62 (56 baseline + 6 H4 channels), got ${contentJson.counts.tables}`,
);

console.log(
  `parse-content-h4-tables: ${expectedChannels.length} H4 channels × rows [${expectedChannels
    .map((c) => {
      const t = research00.tables.find((x) => x.heading === c);
      return `${c.replace(/\s*\(.+?\)\s*/, "")}=${t ? t.rows.length : 0}`;
    })
    .join(", ")}] — total research/00 tables=${totalTables} OK`,
);
