# Ecommerce Ops Workspace

> **Mission.** Operate a profitable, AI-augmented direct-to-consumer ecommerce business. This folder is the single source of truth for research, playbooks, dashboards, scripts, and live operation notes.

## Folder map

```
ecommerce-ops/
├── README.md                      ← you are here
├── research/                      ← market intel (source of truth for "what works")
│   ├── 00-ecommerce-ops-landscape.md    (unit econ, channels, retention, AI)
│   └── 01-tools-stack-comparison.md     (vendor matrix, pricing, recommended stacks)
├── playbooks/                     ← step-by-step runbooks ("how do we actually do X")
├── scripts/                       ← executable code (cron uses these)
├── dashboards/                    ← operational dashboards / metrics
├── assets/                        ← brand assets, copy templates, creative briefs
└── docs/                          ← meeting notes, decisions, retros, change log
```

## Research principles

1. **Verified > directional > rule-of-thumb.** Every benchmark is tagged. We don't make decisions on uncited heuristics.
2. **The cheap stack wins first.** Tooling is a tax until $1M+ GMV. We optimize for time, not features.
3. **Email/SMS > paid social at the margin.** The #1 profit channel for DTC is retention automation.
4. **Mobile conversion is the largest unrealized lever.** 70% of traffic, ~50% the CVR. Mobile-first always.
5. **AI is table-stakes, not a moat.** Use AI for creative iteration, CS automation, and dynamic merchandising — not as a differentiator.

## Current status

- **Research phase: complete (2026-06).** Two docs in `/research` cover the strategic landscape and tooling options.
- **Next phase: build a runnable MVP.** Cron-driven improvements every 6h.

## How this folder is maintained

- The `improve-ecommerce-ops` cron job (every 6h) reads `/research` + `/playbooks`, picks ONE bounded improvement, implements it (writes a playbook, script, or asset), and writes a journal entry to `/docs/journal.md`.
- Each tick produces a visible artifact + a short journal entry. Never "just code" — always ship something an operator can run.
