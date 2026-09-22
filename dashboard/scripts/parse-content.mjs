#!/usr/bin/env node
/**
 * Parse /data/workspace/ecommerce-ops/{research,playbooks}/*.md into a single
 * JSON dataset the dashboard reads at build time. Also shells out to
 * `git log` to capture the real dashboard-subtree commit history into
 * `gitCommits[]` so the `/journal` page can render a live changelog
 * without needing git to be available at runtime (Vercel-side builds do
 * not get the parent repo's `.git`).
 *
 * Run: node scripts/parse-content.mjs
 * Output: src/lib/content.json
 */
import { readdir, readFile, writeFile, stat, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = "/data/workspace/ecommerce-ops";
const OUT = join(process.cwd(), "src/lib/content.json");

// Build-time copy of `playbooks/*.md` so detail routes can read raw markdown.
// Mirrors the `src/skills/` copy pattern — see parseSkills() below. We clear
// the directory first so deletes in /playbooks/ propagate to the bundle.
const BUILD_PLAYBOOKS = join(process.cwd(), "src/playbooks");
async function syncPlaybookCopies(sourceFiles) {
  await rm(BUILD_PLAYBOOKS, { recursive: true, force: true });
  await mkdir(BUILD_PLAYBOOKS, { recursive: true });
  for (const f of sourceFiles) {
    const md = await readFile(join(ROOT, "playbooks", f), "utf8");
    await writeFile(join(BUILD_PLAYBOOKS, f), md);
  }
}

// Build-time copy of `research/*.md` so `/research/[slug]` detail route can
// read raw markdown. Same shape as syncPlaybookCopies — declared just above.
// We clear the directory first so deletes in /research/ propagate to the
// bundle. Move #259-aware tick: needed by the new research detail route.
const BUILD_RESEARCH = join(process.cwd(), "src/research");
async function syncResearchCopies(sourceFiles) {
  await rm(BUILD_RESEARCH, { recursive: true, force: true });
  await mkdir(BUILD_RESEARCH, { recursive: true });
  for (const f of sourceFiles) {
    const md = await readFile(join(ROOT, "research", f), "utf8");
    await writeFile(join(BUILD_RESEARCH, f), md);
  }
}

// Build-time copy of `assets/*.md` so `/assets/[slug]` detail route can
// read raw markdown. Same shape as syncPlaybookCopies / syncResearchCopies.
// Move #259-aware tick: completes the detail-route trio (skills / playbooks
// / research / assets). We clear the directory first so deletes in /assets/
// propagate to the bundle.
const BUILD_ASSETS = join(process.cwd(), "src/assets");
async function syncAssetCopies(sourceFiles) {
  await rm(BUILD_ASSETS, { recursive: true, force: true });
  await mkdir(BUILD_ASSETS, { recursive: true });
  for (const f of sourceFiles) {
    const md = await readFile(join(ROOT, "assets", f), "utf8");
    await writeFile(join(BUILD_ASSETS, f), md);
  }
}

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

// Split a section's body lines into per-H4 sub-blocks. When a body contains
// `#### <heading>` lines, return one sub-block per H4 (heading + the lines
// that follow until the next H4 or end). When there are no H4 lines, return
// a single null-headed block holding the full body. This lets callers emit
// one tables[] entry per H4 instead of mashing multiple tables into one row
// set with the wrong header (Move #3 — fixes the /channels empty-table bug
// where research/00 § 2's 6 per-channel benchmark tables were collapsed into
// one 44-row blob keyed by the Meta header).
function splitBodyByH4(lines) {
  const blocks = [];
  let current = null;
  for (const line of lines || []) {
    const h4 = /^#### (?!#)(.+?)\s*$/.exec(line);
    if (h4) {
      if (current) blocks.push(current);
      current = { h4Heading: h4[1].trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    } else {
      // Pre-H4 prose goes into a sentinel null-headed block so top-level
      // tables (those above any ####) are still parsed normally.
      if (!blocks.length || blocks[0].h4Heading !== null) {
        blocks.unshift({ h4Heading: null, bodyLines: [line] });
      } else {
        blocks[0].bodyLines.push(line);
      }
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

async function parseResearch() {
  const dir = join(ROOT, "research");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  const docs = [];
  for (const f of files) {
    const md = await readFile(join(dir, f), "utf8");
    const sections = splitSections(md);
    let lastTouched = null;
    try {
      const st = await stat(join(dir, f));
      lastTouched = st.mtime.toISOString().slice(0, 10);
    } catch {}
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
      const subBlocks = splitBodyByH4(s.body || []);
      const hasH4 = subBlocks.some((b) => b.h4Heading !== null);
      // Top-level (non-H4) tables: only parse them when there ARE H4 sub-blocks,
      // in which case the merged-table problem is real and we want to skip the
      // cross-table merge entirely. Otherwise (no H4s anywhere), keep the legacy
      // single-table-per-section behavior so existing pages don't regress.
      const topTable = hasH4
        ? []
        : parseMarkdownTable(s.body || []);
      const entry = {
        heading: s.heading,
        level: s.level,
        table: topTable.length ? topTable : null,
        body: body.length > 4000 ? body.slice(0, 4000) : body,
      };
      doc.sections.push(entry);
      if (topTable.length) {
        doc.tables.push({ heading: s.heading, rows: topTable });
      }
      // Emit one tables[] entry per H4 sub-block, keyed by the H4 heading,
      // so findTable(research, /^Meta \(Facebook/) resolves to the right rows.
      for (const b of subBlocks) {
        if (b.h4Heading === null) continue;
        const h4Tbl = parseMarkdownTable(b.bodyLines);
        if (h4Tbl.length) {
          doc.tables.push({ heading: b.h4Heading, rows: h4Tbl });
        }
      }
    }
    // Pull top-level bullets from "Findings" sections.
    const findSec = doc.sections.find((s) => s.heading && /^Findings$/i.test(s.heading));
    if (findSec) doc.findings = extractBullets(findSec.body || "");
    doc.lastTouched = lastTouched;
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
    // Last-touched mtime for freshness badge — ISO date (YYYY-MM-DD).
    let lastTouched = null;
    try {
      const st = await stat(join(dir, f));
      lastTouched = st.mtime.toISOString().slice(0, 10);
    } catch {}
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
      lastTouched,
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

// Skills = best-practice playbooks for the operator.
// Frontmatter is YAML at the top (between `---` fences).
// Body starts with `# <title>` (H1) and uses ## for sections.
// Schema (canonical 9 fields): name, title, category, tier, priority,
//   default_move, year_1_roi_band, sms_friendly, last_updated.
// Plus a free-form "sources" array in frontmatter.
function parseFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(md);
  if (!m) return { meta: {}, body: md };
  const yamlBlock = m[1];
  const meta = {};
  // Tiny YAML parser — handles the 9 canonical fields + sources list.
  // Sufficient for the frontmatter shape we author; rejects at write time if wrong.
  // Handles quoted values that may contain colons (e.g. "25:1–60:1").
  for (const line of yamlBlock.split(/\r?\n/)) {
    let kv;
    // Try quoted value first: key: "value with : colons"
    kv = /^([a-z0-9_]+):\s*"([^"]*)"\s*$/.exec(line);
    if (kv) {
      meta[kv[1]] = kv[2];
      continue;
    }
    // Try single-quoted: key: 'value'
    kv = /^([a-z0-9_]+):\s*'([^']*)'\s*$/.exec(line);
    if (kv) {
      meta[kv[1]] = kv[2];
      continue;
    }
    // Plain: key: value (no colons allowed in value)
    kv = /^([a-z0-9_]+):\s*(.*)$/i.exec(line);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    else if (/^\[.*\]$/.test(val)) {
      // naive inline list — strip brackets, split on comma, trim quotes
      val = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

function firstSentence(s, max = 200) {
  if (!s) return "";
  const cleaned = s.replace(/\s+/g, " ").trim();
  const m = /^([^.]+[.!?])(\s|$)/.exec(cleaned);
  const candidate = m ? m[1] : cleaned;
  return candidate.length > max ? candidate.slice(0, max - 3) + "..." : candidate;
}

async function parseSkills() {
  // Read from both the workspace source of truth AND the build-time copy.
  // The workspace path is the canonical source for the cron's writes.
  // The dashboard/src/skills copy ships with the build to Vercel.
  const sources = [join(ROOT, "skills"), join(process.cwd(), "src/skills")];
  const seen = new Set();
  const skills = [];
  for (const dir of sources) {
    let files = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    } catch {
      continue;
    }
    for (const f of files) {
      if (seen.has(f)) continue;
      seen.add(f);
    const md = await readFile(join(dir, f), "utf8");
    const { meta, body } = parseFrontmatter(md);
    // Title: H1 (# <title>) right after frontmatter
    const h1 = /^#\s+(.+?)\s*$/m.exec(body);
    const title = h1 ? h1[1].trim() : meta.title || f.replace(/\.md$/, "");
    // Pull the lead blurb. Prefer the first blockquote after the H1
    // (canonical "this skill in one sentence"). Fall back to first paragraph.
    const afterH1 = h1 ? body.slice(h1.index + h1[0].length) : body;
    let blurb = "";
    const blockquoteMatch = /^>\s+(.+?)$/m.exec(afterH1);
    if (blockquoteMatch) {
      blurb = firstSentence(blockquoteMatch[1].trim(), 220);
    } else {
      const firstPara = afterH1
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find(
          (l) =>
            l &&
            !l.startsWith("#") &&
            !l.startsWith(">") &&
            !l.startsWith("-") &&
            !l.startsWith("*") &&
            !/^\d+\./.test(l)
        );
      blurb = firstSentence((firstPara || "").trim(), 220);
    }
    // Count sections (H2) for the depth badge
    const sectionMatches = body.match(/^##\s+/gm) || [];
    // Last-touched mtime for freshness badge
    let lastTouched = null;
    try {
      const st = await stat(join(dir, f));
      lastTouched = st.mtime.toISOString().slice(0, 10);
    } catch {}
    // Pull pitfall count from the "Common pitfalls" section if present
    let pitfallCount = 0;
    const pitSec = body.match(/^##\s+Common pitfalls[\s\S]*?(?=^##\s+)/m);
    if (pitSec) {
      pitfallCount = (pitSec[0].match(/^\d+\.\s/gm) || []).length;
    }
    // Pull source count from frontmatter
    const sourceCount = Array.isArray(meta.sources) ? meta.sources.length : 0;
    skills.push({
      file: f,
      name: meta.name || f.replace(/\.md$/, ""),
      title,
      category: meta.category || "general",
      tier: meta.tier || 3,
      priority: meta.priority || "P2",
      defaultMove: meta.default_move || null,
      yearOneRoiBand: meta.year_1_roi_band || null,
      smsFriendly: meta.sms_friendly === true,
      lastUpdated: meta.last_updated || lastTouched,
      sources: meta.sources || [],
      blurb,
      sectionCount: sectionMatches.length,
      pitfallCount,
      sourceCount,
      size: md.length,
      lastTouched,
    });
    }
  }
  return skills;
}

async function parseGitLog() {
  /**
   * Capture the dashboard-subtree commit history at build time.
   *
   * Format chosen for compactness: one commit per object, fields:
   *   - sha       (7 chars) — short hash, link-friendly
   *   - date      (ISO)     — when the commit landed
   *   - author    (string)  — git author name (e.g. "hermesagent")
   *   - subject   (first line of commit message, ≤240 chars)
   *   - body      (remaining lines, ≤2000 chars total)
   *
   * Output is sorted newest-first by git. We cap at 200 commits so the
   * static bundle stays small — operators almost always want the last
   * 30-50 anyway.
   *
   * Graceful failure: if git isn't available, .git is missing, or
   * we're not in a checkout, return an empty array. The UI then renders
   * an empty-state message instead of crashing the build.
   */
  const fmt = "%H%n%h%n%aI%n%an%n%s%n--END-SUBJECT--%n%b%n--END-COMMIT--";
  const res = spawnSync(
    "git",
    [
      "-C",
      ROOT,
      "log",
      "--no-color",
      "-n",
      "200",
      `--pretty=format:${fmt}`,
      "--",
      "dashboard/",
      "docs/journal.md",
    ],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }
  );
  if (res.status !== 0 || !res.stdout) return [];

  const out = [];
  const blocks = res.stdout.split("--END-COMMIT--");
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n");
    if (lines.length < 5) continue;
    const [fullSha, shortSha, date, author, ...rest] = lines;
    const sepIdx = rest.indexOf("--END-SUBJECT--");
    const subject =
      sepIdx >= 0 ? rest.slice(0, sepIdx).join("\n") : rest.join("\n");
    const body = sepIdx >= 0 ? rest.slice(sepIdx + 1).join("\n").trim() : "";
    out.push({
      sha: shortSha || fullSha?.slice(0, 7) || "",
      date: date || "",
      author: author || "",
      subject: (subject || "").slice(0, 240),
      body: body.slice(0, 2000),
    });
  }
  return out;
}

(async () => {
  const [research, playbooks, assets, top10, journal, skills, gitCommits] =
    await Promise.all([
      parseResearch(),
      parsePlaybooks(),
      parseAssets(),
      parseTop10(),
      parseJournal(),
      parseSkills(),
      parseGitLog(),
    ]);
  // Mirror playbooks/*.md into src/playbooks/ so /playbooks/[slug] can read
  // raw markdown at build time without depending on the workspace path.
  await syncPlaybookCopies(playbooks.map((p) => p.file));
  // Mirror research/*.md into src/research/ so /research/[slug] can read
  // raw markdown at build time without depending on the workspace path.
  await syncResearchCopies(research.map((r) => r.file));
  // Mirror assets/*.md into src/assets/ so /assets/[slug] can read raw
  // markdown at build time without depending on the workspace path.
  await syncAssetCopies(assets.map((a) => a.file));
  const out = {
    generatedAt: new Date().toISOString(),
    research,
    playbooks,
    assets,
    top10,
    journal,
    skills,
    gitCommits,
    counts: {
      researchDocs: research.length,
      playbooks: playbooks.length,
      assets: assets.length,
      tables: research.reduce((n, r) => n + r.tables.length, 0),
      findings: research.reduce((n, r) => n + r.findings.length, 0),
      journalEntries: journal.length,
      skills: skills.length,
      gitCommits: gitCommits.length,
    },
  };
  await writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(
    `wrote ${OUT} — ${out.counts.researchDocs} research docs, ${out.counts.playbooks} playbooks, ${out.counts.assets} assets, ${out.counts.tables} tables, ${out.counts.findings} findings, ${out.counts.skills} skills`
  );
})();