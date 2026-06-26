# Ecommerce Ops Workspace

> **Mission.** Operate a profitable, AI-augmented direct-to-consumer ecommerce business. This folder is the single source of truth for research, playbooks, dashboards, scripts, and live operation notes.

## Folder map

```
ecommerce-ops/
├── README.md                              ← you are here
├── research/                              ← market intel + synthesis
│   ├── 00-ecommerce-ops-landscape.md      (unit econ, channels, retention, AI)
│   ├── 01-tools-stack-comparison.md       (vendor matrix, pricing, recommended stacks)
│   ├── 02-top-10-leverage-moves.md        (ranked playbook backlog with status tracker)
│   └── 03-30-day-rollout-plan.md          (synthesis: 4-week plan sequencing 16 shipped moves)
├── playbooks/                             ← step-by-step runbooks ("how do we actually do X")
│                                          (15 shipped: abandoned-cart / upsell / checkout /
│                                          welcome / Klaviyo+Postscript migration / Triple Whale /
│                                          SMS / loyalty / mobile PDP / PDP A/B / AI ad creative /
│                                          attribution-quality + TikTok + Snap+Pinterest +
│                                          cross-platform drift + unification)
├── scripts/                               ← executable code (cron + operator use)
│                                          (11 ROI/audit scripts + 11 matching test files,
│                                          440 TDD tests across 11 test classes)
├── dashboards/
│   └── unified-attribution-health.html    ← self-contained static dashboard (0 build step,
│                                          59 tests, loads 4 attribution-audit JSONs)
├── dashboard/                             ← Next.js 15 dashboard (operator-facing SPA)
│   ├── app/                               ← 11 routes: /, /top-10, /playbooks, /journal,
│   │                                       /30-day-plan, /ai, /channels, /cro, /inventory,
│   │                                       /retention, /unit-economics
│   └── src/lib/content.json               ← auto-generated index of research/ + playbooks/
├── assets/                                ← 3 shipped: copy templates (8 Klaviyo+Postscript
│                                          templates) + brand voice (5 profiles × 5 dimensions)
│                                          + UGC brief (5 outreach + 3 contracts + Klaviyo segment)
└── docs/                                  ← journal + decision log
    └── journal.md                         ← every cron tick logs here (newest at top)
```

## Research principles

1. **Verified > directional > rule-of-thumb.** Every benchmark is tagged. We don't make decisions on uncited heuristics.
2. **The cheap stack wins first.** Tooling is a tax until $1M+ GMV. We optimize for time, not features.
3. **Email/SMS > paid social at the margin.** The #1 profit channel for DTC is retention automation.
4. **Mobile conversion is the largest unrealized lever.** 70% of traffic, ~50% the CVR. Mobile-first always.
5. **AI is table-stakes, not a moat.** Use AI for creative iteration, CS automation, and dynamic merchandising — not as a differentiator.

## Current status (2026-06-26)

**Operator phase — 16/10 top-10 leverage moves shipped + 5 follow-on moves + dashboard + synthesis.**

| Track | Status | Notes |
|---|---|---|
| **Research** | Complete (4 docs) | `00` landscape + `01` stack comparison + `02` top-10 + `03` 30-day synthesis |
| **Top-10 playbooks** | 10/10 shipped | #1–#10 all shipped with companion scripts where applicable (Abandoned cart / Post-purchase upsell / Checkout audit / Welcome series / Klaviyo+Postscript migration / Triple Whale / SMS / Loyalty / Mobile PDP / AI ad creative) |
| **Attribution quality stack** | 5/5 shipped | Move #6 Triple Whale + #6.5 Meta/Google/GA4 audit + #6.6 TikTok audit + #6.7 Snap+Pinterest audit + #6.8 cross-platform drift rollup |
| **Operator surfaces** | 3/3 shipped | `dashboards/unified-attribution-health.html` (static) + `dashboard/` (Next.js with 11 routes + CTA banner) + `research/03-30-day-rollout-plan.md` (synthesis) |
| **Tests** | 499/499 green | 440 Python (11 test files) + 59 JS (1 test file); `for t in scripts/tests/test_*.py; do python3 "$t"; done` + `node dashboards/tests/test_unified_attribution_health.js` |
| **Journal** | Live | Every cron tick logs to `docs/journal.md` with what shipped, why, files touched, verification, next action |
| **A/B testing** | 1 follow-up shipped | Move #9.5 PDP A/B testing program (companion to Move #9) |
| **Assets** | 3 shipped | `assets/01-copy-templates.md` (8 paste-ready Klaviyo email + Postscript SMS templates with compliance + decision matrix) + `assets/02-brand-voice.md` (5 voice profiles × 5-dimension framework + adaptation recipe for non-default brands) + `assets/03-ugc-brief.md` (3 sourcing model decision matrix + 1 commissioning template + 5 creator outreach emails + 3 contract templates for paid/gifted/affiliate + Klaviyo UGC segment wiring + cohort-LTV measurement) |

**Where to start (new operator):** Open `research/03-30-day-rollout-plan.md` for the 4-week day-by-day plan, then jump to `dashboard/` (live operator dashboard, served at `http://127.0.0.1:8767/` after `cd dashboard && npx next dev`), then drill into any `playbooks/NN-*.md` for a specific move's runbook.

## How this folder is maintained

- The `improve-ecommerce-ops` cron job (every 6h) reads `/research` + `/playbooks` + the last journal entry, picks ONE bounded improvement, and ships it (a new playbook, a new script, an asset, a dashboard route, or a hygiene fix).
- Each tick produces a visible artifact + a journal entry to `/docs/journal.md` + a report at `/data/workspace/cron-reports/improve-ecommerce-ops_latest.{md,json}`. Never "just code" — always ship something an operator can run.
- **Bounded-fix discipline:** one fix per tick, TDD for code, content-only recipe for markdown/assets, commit locally, never push.