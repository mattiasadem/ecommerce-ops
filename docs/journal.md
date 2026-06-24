# Ecommerce Ops — Improvement Journal

> **Purpose.** Chronological log of every bounded improvement the cron job makes to `/data/workspace/ecommerce-ops/`. Each entry is one tick — what shipped, why, what to do next. The next agent reads this on wakeup to pick up where the last tick left off.
>
> **Format.** Newest at top. Each tick gets a `## [YYYY-MM-DD HH:MM] <one-line title>` block with: what changed, files touched, TDD evidence, next-action.

---

<!-- new ticks insert here -->

## [2026-06-24 05:11] Move #2 — Post-purchase upsell (ReConvert/AfterSell) playbook + ROI script

- **What shipped:** `playbooks/02-post-purchase-upsell-reconvert.md` (paste-ready runbook — 7-step ramp from app selection to 10%→50%→100% rollout, 8-prereq gate, 12-pitfall list, 7-step verification, decision matrix for which app to pick at which volume) and `scripts/post_purchase_upsell_roi.py` + `scripts/tests/test_post_purchase_upsell_roi.py` (working ROI calculator with 26/26 tests green, --help, --json, --orders/--aov/--acceptance/--upsell-aov/--margin/--cost CLI args, validation, health-band classifier).
- **Why this move:** Move #2 from `research/02-top-10-leverage-moves.md` — lowest-friction AOV lift in DTC. ReConvert/AfterSell public benchmarks: 10–20% acceptance × $25–$50 upsell value × 50–80% incremental margin = 5–15% revenue lift at ~1 day of setup. Default inputs (1k orders, $80 AOV, 15% accept, $35 upsell, 70% margin, $0.10/order ReConvert) forecast $5,250 incremental revenue and $3,675 incremental margin per month against $100 platform cost = 35.7:1 net lift per $1 platform cost ("great" health band).
- **Files touched:** `playbooks/02-post-purchase-upsell-reconvert.md` (new, 197 lines), `scripts/post_purchase_upsell_roi.py` (new, ~170 lines), `scripts/tests/test_post_purchase_upsell_roi.py` (new, 26 tests across 5 test classes: import surface, validation, forecast math, render, CLI behavior), `research/02-top-10-leverage-moves.md` (status tracker: Move #2 → shipped).
- **Verification:** 26/26 new tests green; 15/15 abandoned-cart regression suite still green (no regressions). CLI runs end-to-end (`python3 scripts/post_purchase_upsell_roi.py` produces "Health band: great (>=30:1 net lift per $1 platform cost, 35.7:1)"). JSON output roundtrips through `json.loads`. Validation rejects negative AOV with exit=2 and clear stderr message. Playbook's embedded 7-step verification gate was executed and all 4 gates passed (default forecast matches docs, JSON OK, validation works, both test suites green).
- **Next action:** Move #3 (checkout audit + Baymard fix-list) is the natural next conversion-leverage move. Write `playbooks/03-checkout-audit-baymard.md` — a paste-ready audit checklist that maps each Baymard finding to a Shopify theme fix, a checklist of the 12 biggest checkout conversion leaks (guest checkout, address autocomplete, payment options, trust badges, etc.), and an expected CVR lift per fix. Optionally companion it with `scripts/checkout_audit_checklist.py` that takes a Shopify store URL and scores the checkout on a 0–100 scale against the Baymard findings. Estimated effort: 2–5 days per the research doc but the playbook itself can ship in 1 tick if scoped to the audit checklist + scoring script only (no theme fixes).

## [2026-06-23 23:10] Move #1 — Abandoned-cart Klaviyo + SMS playbook + ROI script

- **What shipped:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (paste-ready runbook, 9 numbered steps + verification gate + cost formula) and `scripts/abandoned_cart_roi.py` + `scripts/tests/test_abandoned_cart_roi.py` (working ROI calculator with 15/15 tests green, --help, --json, default-arg sanity case).
- **Why this move:** Highest-ROI flow in DTC (research/02-top-10-leverage-moves.md #1). Recovers 5–15% of abandoned carts; every $1 sent returns ~$36–$40 (Omnisend verified). Pays for itself within one week of meaningful traffic. No paid-tool credentials needed to write the playbook — operator runs it themselves.
- **Files touched:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (new), `scripts/abandoned_cart_roi.py` (new), `scripts/tests/test_abandoned_cart_roi.py` (new), `research/02-top-10-leverage-moves.md` (status tracker: Move #1 → shipped), `.gitignore` (new — __pycache__/).
- **Verification:** 15/15 TDD tests green; CLI runs end-to-end (`python3 scripts/abandoned_cart_roi.py` produces 1,063.8x ROI for default $1M-GMV inputs, JSON output roundtrips through `json.loads`). Read-back of playbook confirms every numbered step has a concrete action, value, command, or decision point (no "set up your account" hand-waving); 10 pitfalls documented; 7-step verification gate; cost formula present.
- **Next action:** Move #4 (welcome series) is the natural second flow — same Klaviyo infrastructure, same SMS infrastructure, same ROI band. Ship a parallel playbook `playbooks/02-welcome-series-klaviyo.md` and a `scripts/welcome_series_roi.py` companion, OR pivot to Move #2 (post-purchase upsell playbook + script) since the welcome series overlaps significantly with the abandoned-cart playbook just shipped.

## [2026-06-23 16:50] Workspace bootstrapped

- Created `/data/workspace/ecommerce-ops/` with subfolders: `research/`, `playbooks/`, `scripts/`, `assets/`, `dashboards/`, `docs/`.
- Wrote `research/00-ecommerce-ops-landscape.md` — DTC ops benchmarks 2025/2026 (CAC, LTV, AOV, channels, retention, CRO, AI). 593 lines, sourced.
- Wrote `research/01-tools-stack-comparison.md` — vendor matrix across 11 categories, three recommended stacks by budget (Starter / Scale / Pro).
- Wrote `research/02-top-10-leverage-moves.md` — ranked list of highest-ROI improvements.
- Wrote `README.md` and `docs/journal.md` (this file).
- Cron job `improve-ecommerce-ops` scheduled (every 6h) to drive continuous bounded improvements.

**Next action:** first scheduled tick picks Move #1 from `research/02-top-10-leverage-moves.md` and writes a playbook for the abandoned-cart email+SMS flow in Klaviyo.

---
