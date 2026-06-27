#!/usr/bin/env python3
"""
lifecycle_flow_health_check.py — Per-flow KPI health check for the lifecycle-
marketing track (Archetype C/D-light hybrid audit per playbook 12 + research/05).

Companion to:
- /research/05-lifecycle-marketing.md (5-pillar framework + 3 GMV-tier paths + 4 verification gates)
- /playbooks/12-lifecycle-flow-library.md (20-flow operator-build + per-tier verification)
- /assets/14-lifecycle-flow-templates.md (17 flows × 5 voices = 85 voice-variant templates)

This script takes per-flow KPI snapshots (one JSON per flow in a fixtures dir)
and scores each flow against the canonical KPI benchmarks from research/05
§Pillars (per-pillar canonical KPIs) + playbook 12 §Step-by-step (expected lift
bands). The 6 gates × N live flows = N*6 gate-flow combinations per
research/05 line 287. The script outputs a per-flow 0-100 score + a
prioritized fix-list (PASS / WARN / NEEDS_WORK / FAIL) that the operator can
act on after 30+ days of live flow data.

Canonical KPI benchmarks (pinned as module constants — verified by
test_canonical_thresholds_published):
- Gate A: open_rate >= 35%         (Klaviyo 2024 benchmark)
- Gate B: click_rate >= 4%         (Klaviyo 2024 benchmark)
- Gate C: cvr      >= 0.8%         (Klaviyo 2024 benchmark)
- Gate D: unsub    <= 0.3%         (deliverability floor per Klaviyo + Postscript)
- Gate E: revenue/1k >= pillar floor  (per-pillar floor: P1 $300-800, P2 $400-1200,
                                       P3 $500-1500, P4 $800-2500, P5 $200-800)
- Gate F: flow_attribution_match >= 60% (Triple Whale cohort-sync signal — per
                                          research/05 §Pillar 5 + playbook 12 §Step 2.4)

The script is hermetic — it reads operator-supplied JSON fixtures + applies the
local scoring rule; no Klaviyo / Postscript / Smile / Triple Whale API access
required. This matches the canonical recipe for Archetype C/D-light hybrid
audits: the 90% of install mistakes the operator actually makes (underperforming
flow that nobody noticed for 6 weeks; misaligned audience segment; silent
deliverability drift) don't require live API access; the local scoring rule
catches them at the 30-day-post-launch audit cadence.

Usage:
    # Default: bootstrap canonical-pass fixtures + score them all
    python3 lifecycle_flow_health_check.py --bootstrap --fixtures-dir ./lifecycle_fixtures/

    # Score a real fixtures dir (one *.json per live flow)
    python3 lifecycle_flow_health_check.py --fixtures-dir ./lifecycle_fixtures/

    # JSON output (for cron / CI / dashboard piping)
    python3 lifecycle_flow_health_check.py --fixtures-dir ./lifecycle_fixtures/ --json

    # Score a single flow (for ad-hoc per-flow audits)
    python3 lifecycle_flow_health_check.py --fixtures-dir ./lifecycle_fixtures/ \\
        --only-check 1.1_browse_abandon

Exit code 0 = all flows PASS or WARN. Exit code 1 = at least one flow FAIL or NEEDS_WORK.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface route → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule). Research
05, playbook 12, asset 14, and /lifecycle route shipped; this script is the
next-layer follow-up. It compounds Asset 14's 85 voice-variant templates by
automating the 30-day-post-launch per-flow KPI monitoring the operator
currently does manually in Klaviyo's flow-analytics dashboard.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Dict, List, Literal, Optional, Tuple

# ----- Canonical KPI thresholds (pinned — verified by test_canonical_thresholds_published) -----

# Per Klaviyo's 2024 benchmark report (research/05 §Sources line 369)
OPEN_RATE_FLOOR = 0.35
CLICK_RATE_FLOOR = 0.04
CVR_FLOOR = 0.008

# Per Klaviyo + Postscript deliverability benchmarks (research/05 §Sources)
UNSUBSCRIBE_RATE_CEIL = 0.003

# Per Triple Whale cohort-sync guidance (playbook 12 §Step 2.4 + research/05 §Pillar 5)
FLOW_ATTRIBUTION_MATCH_FLOOR = 0.60

# Per-pillar revenue floors in $/1k sent (research/05 §Pillar canonical KPI tables)
REVENUE_FLOORS_PER_PILLAR: Dict[str, Tuple[float, float]] = {
    "P1_browse_abandon": (300.0, 800.0),       # research/05 Pillar 1: $300-800/1k
    "P2_winback_sunset": (400.0, 1200.0),       # research/05 Pillar 2: $400-1,200/1k
    "P3_post_purchase_loyalty": (500.0, 1500.0),  # research/05 Pillar 3: $500-1,500/1k
    "P4_replenishment": (800.0, 2500.0),        # research/05 Pillar 4: $800-2,500/1k
    "P5_celebratory": (200.0, 800.0),           # research/05 Pillar 5: $200-800/1k (lower volume)
}

# The 13 Path-B live flows (research/05 §Path B — DEFAULT for $500k-$10M brands).
# Each tuple is (flow_id, flow_name, pillar, tier, channel).
PATH_B_FLOWS: List[Tuple[str, str, str, int, str]] = [
    # Tier 1 (5 flows)
    ("1.1_browse_abandon", "Browse-abandon", "P1_browse_abandon", 1, "email"),
    ("1.2_winback", "Customer winback", "P2_winback_sunset", 1, "email"),
    ("1.3_post_purchase_xsell", "Post-purchase cross-sell", "P3_post_purchase_loyalty", 1, "email"),
    ("1.4_sunset", "Sunset flow (subscriber-not-buyer)", "P2_winback_sunset", 1, "email"),
    ("1.5_shipping_confirmation", "Shipping confirmation + transit", "P3_post_purchase_loyalty", 1, "email"),
    # Tier 2 (5 flows)
    ("2.1_birthday", "Birthday", "P5_celebratory", 2, "email"),
    ("2.2_anniversary", "Anniversary", "P5_celebratory", 2, "email"),
    ("2.3_loyalty_tier_up_down", "Loyalty tier-up + tier-down", "P3_post_purchase_loyalty", 2, "email"),
    ("2.4_nps_detractor_followup", "NPS-detractor follow-up", "P3_post_purchase_loyalty", 2, "email"),
    ("2.5_subscription_dunning", "Subscription renewal + dunning", "P3_post_purchase_loyalty", 2, "email"),
    # Tier 3 subset for Path B (3 flows — replenishment deferred unless consumables)
    ("3.1_vip_early_access", "VIP early-access + product drops", "P3_post_purchase_loyalty", 3, "email"),
    ("3.2_replenishment", "Replenishment reminder (consumables)", "P4_replenishment", 3, "email"),
    ("3.4_account_never_purchased", "Account-created-but-never-purchased", "P1_browse_abandon", 3, "email"),
]

# Flow-id → pillar mapping (used by classify_flow)
FLOW_TO_PILLAR: Dict[str, str] = {fid: pillar for (fid, _, pillar, _, _) in PATH_B_FLOWS}


# ----- Dataclasses ------------------------------------------------------------

class FlowVerdict(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    NEEDS_WORK = "NEEDS_WORK"
    FAIL = "FAIL"


@dataclass
class FlowFixture:
    """One flow's last-30-days KPI snapshot, operator-supplied as JSON."""
    flow_id: str
    flow_name: str
    pillar: str
    tier: int
    channel: str
    kpis_30d: dict


@dataclass
class FlowScore:
    """The scoring result for one flow against the 6 canonical gates."""
    flow_id: str
    flow_name: str
    pillar: str
    tier: int
    channel: str
    verdict: FlowVerdict
    overall_score: int  # 0-100
    gates_passed: int
    gates_failed: int
    failed_gates: List[str]
    # Per-gate measured values (for the operator to see which bound tripped)
    open_rate: float
    click_rate: float
    cvr: float
    unsubscribe_rate: float
    revenue_per_1k: float
    flow_attribution_match: float


@dataclass
class OverallReport:
    fixture_dir: str
    scores: List[FlowScore]
    overall_passed: bool
    summary: Dict[str, object] 


# ----- Parsing + loading ------------------------------------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Per-flow KPI health check for the lifecycle-marketing track.",
    )
    parser.add_argument(
        "--fixtures-dir",
        default="./lifecycle_fixtures/",
        help="Directory containing one *.json per live flow (default: ./lifecycle_fixtures/)",
    )
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="Bootstrap the canonical-pass fixture set for the 13 Path-B flows "
             "into <fixtures-dir> and exit.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON output (for cron / CI / dashboard piping).",
    )
    parser.add_argument(
        "--only-check",
        metavar="FLOW_ID",
        help="Score only the named flow (e.g. 1.1_browse_abandon). "
             "Exit 0 if PASS/WARN; exit 1 if NEEDS_WORK/FAIL.",
    )
    return parser.parse_args(argv)


def build_fixtures_index(fixtures_dir: str) -> Dict[str, FlowFixture]:
    """Read every *.json in the dir; return dict keyed by flow_id.

    Each fixture must have: flow_id, flow_name, pillar, tier, channel, kpis_30d.
    kpis_30d must have keys: sent, opens, clicks, conversions, unsubscribes,
    revenue, flow_attributed.
    """
    if not os.path.isdir(fixtures_dir):
        raise SystemExit(f"Fixtures dir not found: {fixtures_dir}")

    idx: Dict[str, FlowFixture] = {}
    for fname in sorted(os.listdir(fixtures_dir)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(fixtures_dir, fname)) as f:
            data = json.load(f)
        fx = FlowFixture(
            flow_id=data["flow_id"],
            flow_name=data["flow_name"],
            pillar=data["pillar"],
            tier=data["tier"],
            channel=data["channel"],
            kpis_30d=data["kpis_30d"],
        )
        idx[fx.flow_id] = fx
    return idx


def summarize_fixtures(fixtures: List[FlowFixture]) -> Dict[str, int]:
    """Count total flows + per-pillar breakdown + per-tier breakdown."""
    by_pillar: Dict[str, int] = {}
    by_tier: Dict[str, int] = {}
    for fx in fixtures:
        by_pillar[fx.pillar] = by_pillar.get(fx.pillar, 0) + 1
        by_tier[f"T{fx.tier}"] = by_tier.get(f"T{fx.tier}", 0) + 1
    return {
        "total": len(fixtures),
        "by_pillar": by_pillar,
        "by_tier": by_tier,
    }


def classify_flow(flow_id: str) -> str:
    """Return the canonical pillar identifier for a flow_id."""
    if flow_id in FLOW_TO_PILLAR:
        return FLOW_TO_PILLAR[flow_id]
    # Fallback: derive from flow-id prefix (1.x = P1 / 2.x = P3 / 3.x = P4 / etc.)
    prefix = flow_id.split(".")[0]
    return {
        "1": "P1_browse_abandon",
        "2": "P3_post_purchase_loyalty",  # Tier 2 is mostly P3
        "3": "P4_replenishment",
        "4": "P4_replenishment",
        "5": "P5_celebratory",
    }.get(prefix, "P1_browse_abandon")


# ----- Scoring ----------------------------------------------------------------

def _safe_div(num: float, denom: float, default: float = 0.0) -> float:
    return default if denom == 0 else num / denom


def _evaluate_gates(fx: FlowFixture) -> Tuple[List[str], Dict[str, float]]:
    """Return (failed_gate_messages, measured_values_dict)."""
    k = fx.kpis_30d
    sent = float(k.get("sent", 0))
    opens = float(k.get("opens", 0))
    clicks = float(k.get("clicks", 0))
    conversions = float(k.get("conversions", 0))
    unsubscribes = float(k.get("unsubscribes", 0))
    revenue = float(k.get("revenue", 0.0))
    flow_attributed = float(k.get("flow_attributed", 0))

    open_rate = _safe_div(opens, sent)
    click_rate = _safe_div(clicks, sent)
    cvr = _safe_div(conversions, sent)
    unsubscribe_rate = _safe_div(unsubscribes, sent)
    revenue_per_1k = _safe_div(revenue, sent) * 1000.0
    flow_attribution_match = _safe_div(flow_attributed, conversions) if conversions > 0 else 0.0

    measured = {
        "open_rate": open_rate,
        "click_rate": click_rate,
        "cvr": cvr,
        "unsubscribe_rate": unsubscribe_rate,
        "revenue_per_1k": revenue_per_1k,
        "flow_attribution_match": flow_attribution_match,
    }

    failed: List[str] = []
    # Gate A — open_rate
    if open_rate < OPEN_RATE_FLOOR:
        failed.append(
            f"Gate A (open_rate): {open_rate:.1%} < {OPEN_RATE_FLOOR:.0%} floor "
            f"— check subject line + send-time"
        )
    # Gate B — click_rate
    if click_rate < CLICK_RATE_FLOOR:
        failed.append(
            f"Gate B (click_rate): {click_rate:.1%} < {CLICK_RATE_FLOOR:.0%} floor "
            f"— check CTA copy + product image"
        )
    # Gate C — cvr
    if cvr < CVR_FLOOR:
        failed.append(
            f"Gate C (cvr): {cvr:.2%} < {CVR_FLOOR:.1%} floor "
            f"— check product-page CVR + discount + urgency"
        )
    # Gate D — unsubscribe_rate
    if unsubscribe_rate > UNSUBSCRIBE_RATE_CEIL:
        failed.append(
            f"Gate D (unsub_rate): {unsubscribe_rate:.2%} > {UNSUBSCRIBE_RATE_CEIL:.2%} ceiling "
            f"— check frequency + list hygiene"
        )
    # Gate E — revenue_per_1k vs per-pillar floor
    floor_lo, _floor_hi = REVENUE_FLOORS_PER_PILLAR.get(fx.pillar, (300.0, 1000.0))
    if revenue_per_1k < floor_lo:
        failed.append(
            f"Gate E (revenue): ${revenue_per_1k:.0f}/1k < ${floor_lo:.0f}/1k floor for {fx.pillar} "
            f"— check AOV + discount depth + product-fit"
        )
    # Gate F — flow_attribution_match
    if conversions > 0 and flow_attribution_match < FLOW_ATTRIBUTION_MATCH_FLOOR:
        failed.append(
            f"Gate F (attribution): {flow_attribution_match:.0%} < {FLOW_ATTRIBUTION_MATCH_FLOOR:.0%} floor "
            f"— check Klaviyo+Triple Whale integration + UTM tw_camp tag"
        )

    return failed, measured


def score_flow(fx: FlowFixture) -> FlowScore:
    """Score one flow against the 6 canonical gates; return FlowScore."""
    failed, measured = _evaluate_gates(fx)
    gates_failed = len(failed)
    gates_passed = 6 - gates_failed
    # 6 gates → 100 points → ~16.67 pts per gate (rounded down to 16)
    overall_score = int(round(gates_passed * 100 / 6))
    verdict = score_to_verdict(overall_score)

    return FlowScore(
        flow_id=fx.flow_id,
        flow_name=fx.flow_name,
        pillar=fx.pillar,
        tier=fx.tier,
        channel=fx.channel,
        verdict=verdict,
        overall_score=overall_score,
        gates_passed=gates_passed,
        gates_failed=gates_failed,
        failed_gates=failed,
        open_rate=measured["open_rate"],
        click_rate=measured["click_rate"],
        cvr=measured["cvr"],
        unsubscribe_rate=measured["unsubscribe_rate"],
        revenue_per_1k=measured["revenue_per_1k"],
        flow_attribution_match=measured["flow_attribution_match"],
    )


def score_to_verdict(overall_score: int) -> FlowVerdict:
    """Map overall_score → verdict (PASS / WARN / NEEDS_WORK / FAIL)."""
    if overall_score >= 90:
        return FlowVerdict.PASS
    if overall_score >= 75:
        return FlowVerdict.WARN
    if overall_score >= 50:
        return FlowVerdict.NEEDS_WORK
    return FlowVerdict.FAIL


# ----- Rendering + main -------------------------------------------------------

def render_human(report: OverallReport) -> str:
    """Render the OverallReport as a human-readable text block."""
    lines: List[str] = []
    lines.append("=" * 72)
    lines.append(f"LIFECYCLE FLOW HEALTH CHECK — {report.fixture_dir}")
    lines.append("=" * 72)
    lines.append("")
    lines.append(f"Total flows scored: {report.summary['total']}")
    lines.append(f"  By pillar: {report.summary['by_pillar']}")
    lines.append(f"  By tier:   {report.summary['by_tier']}")
    lines.append("")

    # Group scores by verdict (worst first)
    by_verdict: Dict[FlowVerdict, List[FlowScore]] = {
        FlowVerdict.FAIL: [],
        FlowVerdict.NEEDS_WORK: [],
        FlowVerdict.WARN: [],
        FlowVerdict.PASS: [],
    }
    for s in report.scores:
        by_verdict[s.verdict].append(s)

    for verdict in (FlowVerdict.FAIL, FlowVerdict.NEEDS_WORK, FlowVerdict.WARN, FlowVerdict.PASS):
        scores = by_verdict[verdict]
        if not scores:
            continue
        lines.append(f"--- {verdict.value} ({len(scores)}) ---")
        for s in scores:
            lines.append(
                f"  [{s.verdict.value}] {s.flow_id} ({s.flow_name}) "
                f"pillar={s.pillar} tier={s.tier} score={s.overall_score}/100 "
                f"open={s.open_rate:.1%} click={s.click_rate:.1%} "
                f"cvr={s.cvr:.2%} unsub={s.unsubscribe_rate:.2%} "
                f"rev/1k=${s.revenue_per_1k:.0f} att={s.flow_attribution_match:.0%}"
            )
            for fg in s.failed_gates:
                lines.append(f"        - {fg}")
        lines.append("")

    lines.append("=" * 72)
    lines.append(
        f"OVERALL: {report.summary.get('PASS', 0)} PASS + "
        f"{report.summary.get('WARN', 0)} WARN + "
        f"{report.summary.get('NEEDS_WORK', 0)} NEEDS_WORK + "
        f"{report.summary.get('FAIL', 0)} FAIL"
    )
    if report.overall_passed:
        lines.append("ALL FLOWS AT OR ABOVE WARN FLOOR — health check passed.")
    else:
        lines.append("AT LEAST ONE FLOW BELOW WARN FLOOR — see fix-list above.")
    lines.append("=" * 72)
    return "\n".join(lines)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    if args.bootstrap:
        return _do_bootstrap(args.fixtures_dir)

    idx = build_fixtures_index(args.fixtures_dir)
    fixtures = list(idx.values())

    if args.only_check:
        # Single-flow mode
        if args.only_check not in idx:
            print(f"Flow {args.only_check!r} not found in {args.fixtures_dir}")
            return 1
        score = score_flow(idx[args.only_check])
        scores = [score]
    else:
        scores = [score_flow(fx) for fx in fixtures]

    # Summarize per verdict
    summary: Dict[str, int] = {v.value: 0 for v in FlowVerdict}
    for s in scores:
        summary[s.verdict.value] += 1

    overall_passed = all(
        s.verdict in (FlowVerdict.PASS, FlowVerdict.WARN) for s in scores
    )

    report = OverallReport(
        fixture_dir=args.fixtures_dir,
        scores=scores,
        overall_passed=overall_passed,
        summary={**summarize_fixtures(fixtures), **summary},
    )

    if args.json:
        # JSON-serializable: convert enum → str, dataclasses → dict
        out = {
            "fixture_dir": report.fixture_dir,
            "overall": {
                "passed": report.overall_passed,
                "summary": report.summary,
            },
            "scores": [
                {**asdict(s), "verdict": s.verdict.value} for s in report.scores
            ],
        }
        print(json.dumps(out, indent=2, default=str))
    else:
        print(render_human(report))

    return 0 if overall_passed else 1


def _do_bootstrap(fixtures_dir: str) -> int:
    """Write canonical-pass fixture JSONs for the 13 Path-B flows."""
    os.makedirs(fixtures_dir, exist_ok=True)
    for flow_id, flow_name, pillar, tier, channel in PATH_B_FLOWS:
        # Per-pillar revenue target (mid-floor for the canonical pass)
        floor_lo, floor_hi = REVENUE_FLOORS_PER_PILLAR[pillar]
        target_rev_per_1k = (floor_lo + floor_hi) / 2.0

        # Canonical-pass KPIs scaled per pillar
        sent = 2000
        opens = int(sent * 0.42)             # 42% open rate > 35% floor
        clicks = int(sent * 0.06)            # 6% click rate > 4% floor
        conversions = int(sent * 0.012)      # 1.2% CVR > 0.8% floor
        unsubscribes = int(sent * 0.0015)    # 0.15% < 0.3% ceiling
        revenue = target_rev_per_1k * sent / 1000.0
        flow_attributed = int(conversions * 0.70)  # 70% > 60% floor

        fixture = {
            "flow_id": flow_id,
            "flow_name": flow_name,
            "pillar": pillar,
            "tier": tier,
            "channel": channel,
            "kpis_30d": {
                "sent": sent,
                "opens": opens,
                "clicks": clicks,
                "conversions": conversions,
                "unsubscribes": unsubscribes,
                "revenue": round(revenue, 2),
                "flow_attributed": flow_attributed,
            },
        }
        out_path = os.path.join(fixtures_dir, f"{flow_id}.json")
        with open(out_path, "w") as f:
            json.dump(fixture, f, indent=2)
        print(f"  wrote {out_path}")

    print(f"\nBootstrapped {len(PATH_B_FLOWS)} canonical-pass fixtures into {fixtures_dir}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
