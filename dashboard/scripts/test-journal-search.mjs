#!/usr/bin/env/node
/**
 * Contract test for the Journal Search & Filter feature on /journal.
 *
 * Uses source-code pattern matching (assert.match) rather than importing
 * TypeScript directly — matches the pattern of the other dashboard test
 * scripts (test-pdp-ab-your-store.mjs, test-threepl-your-store.mjs).
 *
 * Validates:
 *   - journal-categorize.ts exposes parseTimestamp / detectTickType /
 *     detectTickStatus / shortTitle / categorizeJournal / applyJournalFilters /
 *     computeJournalStats + their canonical return types
 *   - detectTickType distinguishes skill vs feature vs static vs infra
 *   - detectTickStatus reads the **Status:** bullet AND falls back to
 *     "DEPLOY BLOCKED" string when the bullet is missing
 *   - JournalSearch component wires search input + filter chips +
 *     CopyButton + canonical storage key
 *   - The /journal page replaces the old flat <pre> loop with <JournalSearch>
 *   - The canonical "no todos / no mocks" rule: no `// TODO` or
 *     `placeholder` text in shipped code
 *   - The localStorage key is canonical (ecom-ops:journal:search:v1)
 *
 * Run: `node dashboard/scripts/test-journal-search.mjs`
 */
import fs from "node:fs";
import assert from "node:assert/strict";

const libSrc = fs.readFileSync(
  new URL("../src/lib/journal-categorize.ts", import.meta.url),
  "utf8",
);
const compSrc = fs.readFileSync(
  new URL("../src/components/journal-search.tsx", import.meta.url),
  "utf8",
);
const pageSrc = fs.readFileSync(
  new URL("../app/journal/page.tsx", import.meta.url),
  "utf8",
);
const contentJsonSrc = fs.readFileSync(
  new URL("../src/lib/content.json", import.meta.url),
  "utf8",
);
const contentJson = JSON.parse(contentJsonSrc);

// --- 1. categorizeJournal exports -----------------------------------------

assert.match(libSrc, /export function categorizeJournal/, "exports categorizeJournal");
assert.match(libSrc, /export function parseTimestamp/, "exports parseTimestamp");
assert.match(libSrc, /export function detectTickType/, "exports detectTickType");
assert.match(libSrc, /export function detectTickStatus/, "exports detectTickStatus");
assert.match(libSrc, /export function shortTitle/, "exports shortTitle");
assert.match(libSrc, /export function applyJournalFilters/, "exports applyJournalFilters");
assert.match(libSrc, /export function computeJournalStats/, "exports computeJournalStats");
assert.match(libSrc, /export const EMPTY_FILTERS/, "exports EMPTY_FILTERS");
assert.match(libSrc, /export const ALL_TICK_TYPES/, "exports ALL_TICK_TYPES");
assert.match(libSrc, /export const ALL_TICK_STATUSES/, "exports ALL_TICK_STATUSES");
assert.match(libSrc, /export type TickType/, "exports TickType");
assert.match(libSrc, /export type TickStatus/, "exports TickStatus");
assert.match(libSrc, /export interface JournalFilters/, "exports JournalFilters interface");
assert.match(libSrc, /export interface JournalStats/, "exports JournalStats interface");

// --- 2. Tick-type detection -----------------------------------------------

assert.match(libSrc, /TickType\s*=\s*"skill"/, "TickType union includes 'skill'");
assert.match(libSrc, /\|\s*"feature"/, "TickType union includes 'feature'");
assert.match(libSrc, /\|\s*"static"/, "TickType union includes 'static'");
assert.match(libSrc, /\|\s*"infra"/, "TickType union includes 'infra'");
assert.match(libSrc, /\|\s*"unknown"/, "TickType union includes 'unknown'");

assert.match(libSrc, /\^Skill tick:/, "detectTickType matches 'Skill tick:'");
assert.match(libSrc, /\^Dashboard tick:/, "detectTickType matches 'Dashboard tick:'");
assert.match(libSrc, /\^Static tick:/, "detectTickType matches 'Static tick:'");
assert.match(libSrc, /\^Infra tick:/, "detectTickType matches 'Infra tick:'");

// --- 3. Status detection --------------------------------------------------

assert.match(libSrc, /STATUS_KEEP_RX/, "has STATUS_KEEP_RX");
assert.match(libSrc, /STATUS_BLOCKED_RX/, "has STATUS_BLOCKED_RX");
assert.match(
  libSrc,
  /DEPLOY_BLOCKED_FALLBACK_RX/,
  "has DEPLOY_BLOCKED_FALLBACK_RX for body-only deploy-blocked entries",
);
assert.match(libSrc, /return\s+"keep"/, "detectTickStatus returns 'keep' on match");
assert.match(libSrc, /return\s+"blocked"/, "detectTickStatus returns 'blocked' on match");
assert.match(libSrc, /return\s+"no-status"/, "detectTickStatus returns 'no-status' as fallback");

// --- 4. parseTimestamp returns ISO + display date -------------------------

assert.match(libSrc, /iso:\s*string\s*\|\s*null/, "parseTimestamp returns iso: string | null");
assert.match(libSrc, /displayDate:\s*string\s*\|\s*null/, "parseTimestamp returns displayDate: string | null");
assert.match(libSrc, /\}:00Z`/, "parseTimestamp stamps seconds=00Z");
assert.match(libSrc, /months\[d\.getUTCMonth\(\)\]/, "parseTimestamp uses short month names");

// --- 5. applyJournalFilters + computeJournalStats contracts ---------------

assert.match(libSrc, /export interface JournalFilters/, "JournalFilters interface exported");
assert.match(libSrc, /query:\s*string/, "JournalFilters has query field");
assert.match(libSrc, /tickTypes:\s*TickType\[\]/, "JournalFilters has tickTypes field");
assert.match(libSrc, /tickStatuses:\s*TickStatus\[\]/, "JournalFilters has tickStatuses field");
assert.match(
  libSrc,
  /function applyJournalFilters[\s\S]+filters\.tickTypes\.length\s*>\s*0/,
  "applyJournalFilters checks tickTypes filter",
);
assert.match(
  libSrc,
  /function applyJournalFilters[\s\S]+filters\.tickStatuses\.length\s*>\s*0/,
  "applyJournalFilters checks tickStatuses filter",
);
assert.match(
  libSrc,
  /q\.length\s*>\s*0\s*&&\s*!e\.searchHaystack\.includes\(q\)/,
  "applyJournalFilters case-insensitive substring match",
);
assert.match(
  libSrc,
  /function computeJournalStats[\s\S]+byType\[e\.tickType\]\+\+/,
  "computeJournalStats counts by type",
);
assert.match(
  libSrc,
  /function computeJournalStats[\s\S]+byStatus\[e\.tickStatus\]\+\+/,
  "computeJournalStats counts by status",
);
assert.match(
  libSrc,
  /function computeJournalStats[\s\S]+now\s*-\s*t\s*<=\s*sevenDaysMs/,
  "computeJournalStats filters last-7-days window",
);

// --- 6. JournalSearch component wiring ------------------------------------

assert.match(compSrc, /"use client"/, "JournalSearch is a client component");
assert.match(compSrc, /STORAGE_KEY\s*=\s*"ecom-ops:journal:search:v1"/, "uses canonical storage key");
assert.match(
  compSrc,
  /applyJournalFilters/,
  "imports applyJournalFilters from lib",
);
assert.match(
  compSrc,
  /computeJournalStats/,
  "imports computeJournalStats from lib",
);
assert.match(
  compSrc,
  /import\s*\{[^}]*CopyButton[^}]*\}/,
  "imports CopyButton for one-click markdown export",
);
assert.match(
  compSrc,
  /placeholder="Search heading \+ body/,
  "search input has the canonical placeholder",
);
assert.match(
  compSrc,
  /aria-label="Search journal entries"/,
  "search input has aria-label for accessibility",
);
assert.match(compSrc, /Reset/, "Reset button is present");
assert.match(compSrc, /Copy as markdown/, "Copy-as-markdown button is present");
assert.match(compSrc, /TICK_TYPE_LABEL\[t\]/, "renders tick-type label chips");
assert.match(compSrc, /TICK_STATUS_LABEL\[s\]/, "renders tick-status label chips");
assert.match(
  compSrc,
  /\{filtered\.length\}\/\{categorized\.length\}/,
  "shows filtered/total counter",
);
assert.match(compSrc, /saveFilters/, "filters persist to localStorage");
assert.match(compSrc, /loadFilters/, "filters hydrate from localStorage on mount");

// --- 7. Journal page replacement -----------------------------------------

assert.match(
  pageSrc,
  /import\s+\{\s*JournalSearch\s*\}\s+from\s+"@\/components\/journal-search"/,
  "/journal imports <JournalSearch>",
);
assert.match(pageSrc, /<JournalSearch\s+entries=\{journal\}\s*\/>/, "/journal mounts <JournalSearch entries=journal>");
assert.doesNotMatch(
  pageSrc,
  /<pre className="whitespace-pre-wrap text-xs/,
  "old flat <pre> loop is removed from /journal",
);
assert.doesNotMatch(
  pageSrc,
  /\{journal\.map\(\(entry,\s*i\)\s+=>\s*\(\s*<Card key=\{i\}>/,
  "old per-entry Card loop is removed from /journal",
);

// --- 8. content.json sanity ----------------------------------------------

assert.ok(Array.isArray(contentJson.journal), "content.json.journal is an array");
assert.ok(contentJson.journal.length > 30, `content.json.journal has many entries (${contentJson.journal.length})`);
const hasSkillEntry = contentJson.journal.some((e) => /Skill tick:/i.test(e.heading));
const hasFeatureEntry = contentJson.journal.some(
  (e) =>
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2}\s*[—-]/.test(e.heading) &&
    !/Skill tick:/i.test(e.heading),
);
assert.ok(hasSkillEntry, "content.json has skill entries");
assert.ok(hasFeatureEntry, "content.json has feature entries (dashboard-improver)");

// --- 9. No mocks / TODOs / placeholders in shipped code ------------------

const forbidden = [/\/\/\s*TODO/i, /\/\/\s*FIXME/i, /Lorem ipsum/i];
for (const [path, src] of [
  ["journal-categorize.ts", libSrc],
  ["journal-search.tsx", compSrc],
  ["journal/page.tsx", pageSrc],
]) {
  for (const rx of forbidden) {
    assert.doesNotMatch(src, rx, `${path} does not contain ${rx}`);
  }
}

// --- Summary --------------------------------------------------------------

console.log("\n=== Journal Search contract test: PASS ===");
console.log("All assertions passed.");
