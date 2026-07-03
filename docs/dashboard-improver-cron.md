# Dashboard Improver Cron

> **Job:** `f8f5958c18d2` · **Schedule:** every 6h · **Workdir:** `/data/workspace/ecommerce-ops`

## What it does

Every 6 hours, picks ONE bounded improvement that makes the Next.js dashboard
under `dashboard/` feel less like a research report and more like a product a
real DTC operator would use. Ships the change, deploys to Vercel, appends a
journal entry, commits + pushes to GitHub.

## What it does NOT do

- Does not add new research docs / playbooks / assets — that's `improve-ecommerce-ops` (every 60m)
- Does not refactor architecture
- Does not run more than twice if a build fails

## Stack

- Next.js 15.5.19 + Tailwind v4 + shadcn-style UI (Card, Table, Tabs, Badge, Separator)
- Static SSG — every page prerendered to HTML
- Deployed to Vercel at **https://ecommerce-ops-iota.vercel.app**
- Content parsed from `/research/*.md`, `/playbooks/*.md`, `/assets/*.md` via `dashboard/scripts/parse-content.mjs`

## Per-tick workflow

1. Read last journal entry → pick a non-duplicate improvement
2. `cd dashboard && node scripts/parse-content.mjs`
3. Make the smallest change that satisfies the improvement
4. `cd dashboard && npm run build` (must succeed)
5. Deploy via vercel CLI using `VERCEL_TOKEN` from `/data/workspace/env`
6. Append journal entry to `docs/journal.md`
7. `git add -A && git commit && git push`
8. End with: "Reload — you will now see X."

## Current inventory (as of 2026-06-25)

- **22 routes** in Next.js dashboard
- **14 research docs** (canonical landscape + 13 deep-dives)
- **25 playbooks** shipped
- **22 assets** (copy templates, brand voice, UGC briefs, etc.)
- **56 tables** parsed
- **Vercel alias:** `ecommerce-ops-iota.vercel.app`

## Ideas for future ticks (un-prioritized)

- Live Ikas data on Overview (requires OAuth — see `docs/ikas-integration-discovery.md`)
- 1-click "copy playbook markdown" button on /playbooks
- Per-playbook progress bar (% sections done)
- Searchable / collapsible nav (22 routes is past the comfort line)
- Share buttons (Twitter, copy link) on each page
- Dark mode toggle
- PDF export of any page
- "Last touched X days ago" badges on stale playbook rows
- Empty-state polish on /journal when count < 3
- Sticky "next move" sidebar on every page
- Inline copy-to-clipboard for every code block

## How to inspect what a tick shipped

```bash
# Latest journal entry
tail -40 /data/workspace/ecommerce-ops/docs/journal.md

# Latest commit on master
cd /data/workspace/ecommerce-ops && git log --oneline -5

# Cron output (if delivered locally)
ls /data/workspace/cron-reports/ | tail
```
## 2026-07-03 00:07 UTC — Welcome-series ROI calculator on /playbooks (P0+P1 interactive-tool + state-persistence).
