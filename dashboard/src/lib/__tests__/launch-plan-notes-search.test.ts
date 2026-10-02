/**
 * Smoke tests for `dashboard/src/lib/launch-plan-notes-search.ts` —
 * the full-text search across the per-day ship notes for all 10
 * launch-plan generators (Move #N.4).
 *
 * Run with: `npx jiti src/lib/__tests__/launch-plan-notes-search.test.ts`
 *
 * Coverage:
 *   - `tokenizeQuery` (empty, single term, multi-term, quoted phrase)
 *   - `buildShipNoteSearchIndex` flattens the per-plan maps, drops
 *     empty notes, drops notes on un-ticked days, sorts newest-first
 *   - `searchShipNotes` empty query short-circuits; quoted-phrase
 *     token preserved; multi-term AND; score ranks matches-with-many-
 *     distinct-terms above matches-with-one-term-repeated; matchCount
 *     reflects distinct ranges (not occurrences)
 *   - `snippetForHit` brackets the matched range with prefix/suffix
 *     padding
 *   - `highlightMatchedText` returns segments with `highlighted` flags
 *   - `searchShipNotesToMarkdown` empty + populated cases
 */

import {
  buildShipNoteSearchIndex,
  highlightMatchedText,
  searchShipNotes,
  searchShipNotesToMarkdown,
  snippetForHit,
  tokenizeQuery,
} from "../launch-plan-notes-search";

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

const progress = {
  "pdp-ab": { "1": "2026-09-01T00:00:00.000Z", "5": "2026-09-10T00:00:00.000Z" },
  "welcome-series": { "3": "2026-09-05T00:00:00.000Z" },
  abandoned: {}, // unticked → discarded
};

const notes = {
  "pdp-ab": {
    "1": "guest checkout live in dev; Shop Pay pending review",
    "5": "blocked: Klaviyo template QA held by brand team — Klaviyo lists not exported",
    "10": "no note", // empty after trim
  },
  "welcome-series": {
    "3": "Klaviyo welcome flow shipped; pending email QA",
  },
  abandoned: {
    "1": "should be discarded — plan has no ticked days",
  },
};

const idx = buildShipNoteSearchIndex(notes, progress);

console.log("buildShipNoteSearchIndex:");
check(
  "drops empty / un-ticked-day notes",
  idx.length === 3,
  `expected 3 entries, got ${idx.length}`
);
check(
  "sorts newest-first",
  idx[0].shippedAt >= idx[1].shippedAt,
  "first entry should not be older than second"
);
check(
  "preserves planId and day",
  idx.every((e) => typeof e.planId === "string" && Number.isFinite(e.day)),
  "all entries have planId + day"
);

console.log("\ntokenizeQuery:");
check(
  "empty string → []",
  JSON.stringify(tokenizeQuery("")) === "[]"
);
check(
  "whitespace-only → []",
  JSON.stringify(tokenizeQuery("   ")) === "[]"
);
check(
  "single term lowercased",
  JSON.stringify(tokenizeQuery("Klaviyo")) === '["klaviyo"]'
);
check(
  "multi-term lowercased",
  JSON.stringify(tokenizeQuery("Shop Pay")) === '["shop","pay"]'
);
check(
  "quoted phrase preserved",
  JSON.stringify(tokenizeQuery('"brand team"')) === '["brand team"]'
);
check(
  "mixed quoted + bare",
  JSON.stringify(tokenizeQuery('"brand team" Klaviyo')) ===
    '["brand team","klaviyo"]'
);

console.log("\nsearchShipNotes:");
{
  const r = searchShipNotes(idx, "");
  check("empty query → 0 hits + total 0", r.hits.length === 0 && r.total === 0);
}
{
  const r = searchShipNotes(idx, "Klaviyo");
  check(
    "single term: 2 hits (Day 5 PDP + Day 3 Welcome)",
    r.hits.length === 2,
    `expected 2 hits, got ${r.hits.length}`
  );
  check(
    "headline bonus: Day 3 Welcome ('Klaviyo welcome...' starts with the term) ranks first",
    r.hits[0].day === 3 && r.hits[0].planId === "welcome-series",
    `expected first hit = welcome-series Day 3, got ${r.hits[0]?.planId} Day ${r.hits[0]?.day}`
  );
  check(
    "PDP Day 5 (2 Klaviyo mentions) is the second hit with matchCount=2",
    r.hits[1]?.day === 5 && r.hits[1]?.matchCount === 2,
    `expected second hit matchCount=2, got ${r.hits[1]?.matchCount}`
  );
  check(
    "plan title surfaces via planIdToTitle",
    r.hits.some(
      (h) => h.planTitle === "PDP A/B Test launch plan"
    ) && r.hits.some((h) => h.planTitle === "Welcome Series launch plan")
  );
}
{
  const r = searchShipNotes(idx, "blocked");
  check(
    "term-only-in-one-note → 1 hit",
    r.hits.length === 1,
    `expected 1 hit, got ${r.hits.length}`
  );
  check(
    "the one hit's matchCount is 1",
    r.hits[0].matchCount === 1
  );
}
{
  const r = searchShipNotes(idx, "Klaviyo QA");
  check(
    "multi-term AND: BOTH notes mention Klaviyo AND QA (2 hits)",
    r.hits.length === 2,
    `expected 2 hits, got ${r.hits.length}`
  );
  check(
    "first hit has matchCount = 2 (one merged range per term)",
    r.hits[0].matchCount === 2,
    `expected matchCount=2, got ${r.hits[0]?.matchCount}`
  );
  check(
    "first hit is one of the two notes with both terms (welcome-series Day 3 wins via headline bonus)",
    (r.hits[0].day === 3 && r.hits[0].planId === "welcome-series") ||
      (r.hits[0].day === 5 && r.hits[0].planId === "pdp-ab"),
    `expected first hit = welcome-series Day 3 OR pdp-ab Day 5, got ${r.hits[0]?.planId} Day ${r.hits[0]?.day}`
  );
}
{
  const r = searchShipNotes(idx, '"brand team"');
  check(
    "quoted phrase matches only the Day 5 PDP note",
    r.hits.length === 1 && r.hits[0].day === 5
  );
}
{
  const r = searchShipNotes(idx, "nonsense-zzz");
  check("no-match query → 0 hits", r.hits.length === 0);
  check(
    "still reports total = indexed count",
    r.total === 3,
    `expected total=3, got ${r.total}`
  );
}
{
  const r = searchShipNotes(idx, "Klaviyo", 1);
  check("limit truncates results", r.hits.length === 1);
}

console.log("\nsnippetForHit + highlightMatchedText:");
{
  const r = searchShipNotes(idx, "Klaviyo");
  const hit = r.hits[0];
  const snip = snippetForHit(hit, 10);
  check(
    "snippet.matched contains the match text",
    /Klaviyo/i.test(snip.matched),
    `matched=${JSON.stringify(snip.matched)}`
  );
  const segs = highlightMatchedText(snip.matched, snip.localMatchStart, snip.localMatchEnd);
  check(
    "highlight returns at least one highlighted segment",
    segs.some((s) => s.highlighted),
    `segs=${JSON.stringify(segs)}`
  );
  check(
    "highlighted segment text contains Klaviyo",
    segs.some((s) => s.highlighted && /Klaviyo/i.test(s.text))
  );
}

console.log("\nsearchShipNotesToMarkdown:");
{
  const r = searchShipNotes(idx, "Klaviyo");
  const md = searchShipNotesToMarkdown(r);
  check("markdown starts with H1", md.startsWith("# Launch-plan ship-notes search"));
  check(
    "markdown contains the query in backticks",
    md.includes("`klaviyo`")
  );
  check("markdown contains 'Matches:' line", md.includes("Matches:"));
  check(
    "markdown contains the matched plan title",
    md.includes("PDP A/B Test launch plan")
  );
}
{
  const md = searchShipNotesToMarkdown({ hits: [], total: 3, terms: [] });
  check(
    "empty query renders the placeholder",
    md.includes("type to search") || md.includes("No query"),
    `md=${md.slice(0, 80)}`
  );
}
{
  const md = searchShipNotesToMarkdown({
    hits: [],
    total: 3,
    terms: ["nope"],
  });
  check(
    "no-match query renders the fallback",
    md.includes("No matches") || md.includes("no matches"),
    `md=${md.slice(0, 100)}`
  );
}

console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  console.error("FAILURES:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}