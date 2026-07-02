#!/usr/bin/env node
/**
 * Parse /data/workspace/ecommerce-ops/{research,playbooks}/*.md into a single
 * JSON dataset the dashboard reads at build time.
 *
 * Run: node scripts/parse-content.mjs
 * Output: src/lib/content.json
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "/data/workspace/ecommerce-ops";
const OUT = join(process.cwd(), "src/lib/content.json");

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function splitSections(md) {
  // Split on H2 / H3 lines.
  const lines = md.split(/\r?\n/);
  const sections = [];
  let current = { heading: null, level: 0, body: [] };
  for (const line of lines) {
    const h2 = /^## (?!#)(.+?)\s*$/.exec(line);
    const h3 = /^### (?!#)(.+?)\s*$/.exec(line);
    if (h2) {
      if (current.heading !== null) sections.push(current);
      current = { heading: h2[1].trim(), level: 2, body: [] };
    } else if (h3) {
      if (current.heading !== null) sections.push(current);
      current = { heading: h3[1].trim(), level: 3, body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.heading !== null) sections.push(current);
  return sections.filter((s) => s.heading !== null);
}

function parseMarkdownTable(lines) {
  // Returns array of row objects (first non-pipe row is header).
  const rows = lines
    .filter((l) => l.trim().startsWith("|"))
    .map((l) =>
      l
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim())
    );
  // First row = headers, second = separator (---|---), skip second.
  if (rows.length < 2) return [];
  const header = rows[0];
  const data = rows.slice(2);
  return data.map((cols) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = (cols[i] ?? "").replace(/\*\*/g, "").replace(/`/g, "");
    });
    return obj;
  });
}

function extractBullets(md) {
  const out = [];
  let inNum = false;
  for (const line of md.split(/\r?\n/)) {
    const m = /^\s*-\s+(.+)$/.exec(line);
    if (m) {
      out.push(m[1].trim().replace(/\*\*/g, "").replace(/`/g, ""));
      inNum = false;
      continue;
    }
    const nm = /^\s*(\d+)\.\s+(.+)$/.exec(line);
    if (nm) {
      out.push(nm[2].trim().replace(/\*\*/g, "").replace(/`/g, ""));
      inNum = true;
      continue;
    }
    if (inNum && line.trim() && !line.startsWith("#") && !line.startsWith("|")) {
      // continuation of numbered finding
      out.push(line.trim().replace(/\*\*/g, "").replace(/`/g, ""));
    } else {
      inNum = false;
    }
  }
  return out;
}

async function parseResearch() {
  const dir = join(ROOT, "research");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  const docs = [];
  for (const f of files) {
    const md = await readFile(join(dir, f), "utf8");
    const sections = splitSections(md);
    const doc = {
      file: f,
      title: null,
      sections: [],
      tables: [],
      findings: [],
    };
    for (const s of sections) {
      const body = (s.body || []).join("\n");
      if (!doc.title && s.level === 2) doc.title = s.heading;
      const tbl = parseMarkdownTable(s.body || []);
      const entry = {
        heading: s.heading,
        level: s.level,
        table: tbl.length ? tbl : null,
        body: body.length > 4000 ? body.slice(0, 4000) : body,
      };
      doc.sections.push(entry);
      if (tbl.length) doc.tables.push({ heading: s.heading, rows: tbl });
    }
    // Pull top-level bullets from "Findings" sections.
    const findSec = doc.sections.find((s) => s.heading && /^Findings$/i.test(s.heading));
    if (findSec) doc.findings = extractBullets(findSec.body || "");
    docs.push(doc);
  }
  return docs;
}

async function parsePlaybooks() {
  const dir = join(ROOT, "playbooks");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  } catch {
    return [];
  }
  const pbs = [];
  for (const f of files) {
    const md = await readFile(join(dir, f), "utf8");
    const sections = splitSections(md);
    const first = sections[0];
    const title = first?.heading ?? f.replace(/\.md$/, "");
    // First section is "Goal" — pull its bullet list as meta.
    const meta = extractBullets(first?.body.join("\n") ?? "");
    // Pull top-level findings/notes (first ~30 numbered sections).
    const numbered = [];
    for (const s of sections) {
      if (/^\d+\./.test(s.heading)) numbered.push({ heading: s.heading, body: s.body.join("\n").trim() });
    }
    // Last-touched mtime for freshness badge — ISO date (YYYY-MM-DD).
    let lastTouched = null;
    try {
      const st = await stat(join(dir, f));
      lastTouched = st.mtime.toISOString().slice(0, 10);
    } catch {}
    pbs.push({
      file: f,
      title,
      meta,
      sectionCount: sections.length,
      numberedSections: numbered.slice(0, 20),
      size: md.length,
      lastTouched,
    });
  }
  return pbs;
}

// Assets = the paste-ready content library (copy templates, brand-voice, UGC briefs,
// promo calendar, retention metrics, NPS surveys, competitive teardown, CS responses,
// impact reporting, affiliate program, CS training, impact-data pipeline).
// Mirrors parsePlaybooks but also extracts the Goal bullet-list as the asset's
// "what this is" blurb and tags voice-density for the override-gated assets.
async function parseAssets() {
  const dir = join(ROOT, "assets");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  } catch {
    return [];
  }
  const assets = [];
  for (const f of files) {
    const md = await readFile(join(dir, f), "utf8");
    const sections = splitSections(md);
    const first = sections[0];
    const title = first?.heading ?? f.replace(/\.md$/, "");
    // Goal section is the canonical "what this is" blurb — pull first 6 bullets.
    const goalSection = sections.find((s) => /^goal$/i.test(s.heading));
    const meta = goalSection
      ? extractBullets(goalSection.body.join("\n") ?? "").slice(0, 6)
      : extractBullets(first?.body.join("\n") ?? "").slice(0, 6);
    // Voice-density count: how many of the 5 canonical voice profiles appear ≥15 times.
    const voices = ["Default", "Luxury", "Sustainable", "Gen-Z", "B2B"];
    const voiceCounts = {};
    for (const v of voices) {
      const re = new RegExp(`\\b${v}\\b`, "g");
      voiceCounts[v] = (md.match(re) || []).length;
    }
    const voiceGated = voices.every((v) => voiceCounts[v] >= 15);
    // Pull top-level numbered sections (for the section preview)
    const numbered = [];
    for (const s of sections) {
      if (/^\d+\./.test(s.heading)) numbered.push({ heading: s.heading, body: s.body.join("\n").trim() });
    }
    // Asset number (for the AS-NN badge)
    const numMatch = /^(\d+)-/.exec(f);
    const assetNumber = numMatch ? parseInt(numMatch[1], 10) : null;
    assets.push({
      file: f,
      title,
      meta,
      sectionCount: sections.length,
      numberedSections: numbered.slice(0, 20),
      size: md.length,
      assetNumber,
      voiceGated,
      voiceCounts,
    });
  }
  return assets;
}

async function parseTop10() {
  const md = await readFile(join(ROOT, "research/02-top-10-leverage-moves.md"), "utf8");
  const tables = [];
  for (const s of splitSections(md)) {
    const t = parseMarkdownTable(s.body);
    if (t.length) tables.push({ heading: s.heading, rows: t });
  }
  // Extract "Status tracker" rows specifically.
  const status = [];
  const trackerSection = tables.find((t) => /status tracker/i.test(t.heading));
  if (trackerSection) {
    for (const row of trackerSection.rows) {
      const move = row["Move"];
      const status2 = row["Status"] ?? "";
      const owner = row["Owner"] ?? "";
      const touched = row["Last touched"] ?? "";
      if (!move) continue;
      status.push({
        move,
        status: status2,
        owner,
        touched,
        shipped: /shipped/i.test(status2),
        pending: /pending/i.test(status2),
      });
    }
  }
  return { tables, status };
}

async function parseJournal() {
  const md = await readFile(join(ROOT, "docs/journal.md"), "utf8");
  const lines = md.split(/\r?\n/);
  const entries = [];
  let cur = null;
  for (const line of lines) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) {
      if (cur) entries.push(cur);
      cur = { heading: h[1].trim(), body: [] };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) entries.push(cur);
  return entries.map((e) => ({
    heading: e.heading,
    body: e.body.join("\n").trim().slice(0, 800),
  }));
}

(async () => {
  const [research, playbooks, assets, top10, journal] = await Promise.all([
    parseResearch(),
    parsePlaybooks(),
    parseAssets(),
    parseTop10(),
    parseJournal(),
  ]);
  const out = {
    generatedAt: new Date().toISOString(),
    research,
    playbooks,
    assets,
    top10,
    journal,
    counts: {
      researchDocs: research.length,
      playbooks: playbooks.length,
      assets: assets.length,
      tables: research.reduce((n, r) => n + r.tables.length, 0),
      findings: research.reduce((n, r) => n + r.findings.length, 0),
      journalEntries: journal.length,
    },
  };
  await writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(
    `wrote ${OUT} — ${out.counts.researchDocs} research docs, ${out.counts.playbooks} playbooks, ${out.counts.assets} assets, ${out.counts.tables} tables, ${out.counts.findings} findings`
  );
})();