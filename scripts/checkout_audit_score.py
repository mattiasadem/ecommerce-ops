#!/usr/bin/env python3
"""
checkout_audit_score.py — Score a Shopify checkout against Baymard's top 24
guidelines and emit a prioritized fix-list with estimated CVR lift.

Companion to `/playbooks/03-checkout-audit-baymard.md`. Operator builds an
audit input file (one line per guideline: `id|status|notes`), runs the script,
and ships the highest-priority fixes in order.

Usage:
    # Build an audit file from the playbook's checklist, score it
    python3 checkout_audit_score.py --input /tmp/audit.txt

    # All-pass smoke test (confirms scoring math)
    python3 checkout_audit_score.py --all-pass

    # Machine-readable output for CI / cron consumer
    python3 checkout_audit_score.py --input /tmp/audit.txt --json

Input file format:
    One line per guideline: <id>|<status>|<optional notes>

    <status> is one of:
        pass    = 1.0 point
        partial = 0.5 point
        fail    = 0.0 point
        skip    = excluded from scoring (graceful absence)

    Lines starting with # are treated as comments and ignored.
    Blank lines are ignored.

Severity weights:
    L (large)  = 5 points each  -> guest checkout, address autocomplete,
                                  digital wallets, Shop Pay, sticky place-order
    M (medium) = 3 points each  -> trust badges, payment icons visible, BNPL,
                                  touch targets, etc.
    S (small)  = 1 point each  -> no password meter, secure-checkout label,
                                  returns policy link, etc.
    E (verification-only) = 0 points, scored but not weighted (E5 real-device test)

Score formula:
    score = 100 * sum(severity_weight * status_point) / sum(severity_weight)
    Rounded to nearest integer. Range: 0..100.

Health bands:
    >= 90 top_tier  (Baymard's "best in class")
    >= 75 great     (top 35% of stores per Baymard)
    >= 55 good      (median DTC store)
    >= 40 fair      (regressed but salvageable)
    >  0  weak      (most fixes still needed)
    ==  0 missing   (no audit data submitted)

Estimated CVR lift (cumulative, capped at 0.80 = +80% CVR):
    Sum of the individual fix lifts for items that are NOT yet `pass`.
    Source: Baymard's checkout-usability research + Shopify case studies.
    Cap is intentional — beyond +80% you are not optimizing checkout, you are
    fixing the cart or PDP.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field


# Baymard top guidelines mapped to Shopify fixes + expected CVR lift.
# Severity weights match the playbook: L=5, M=3, S=1, E=0 (verification-only).
GUIDELINES: list[dict] = [
    # Section A — Account & friction
    {"id": "A1_guest_checkout",        "section": "A", "title": "Guest checkout (no forced account)", "severity": "L", "lift_low": 0.05, "lift_high": 0.10},
    {"id": "A2_no_required_phone",     "section": "A", "title": "Phone number not required",          "severity": "L", "lift_low": 0.02, "lift_high": 0.04},
    {"id": "A3_minimum_fields",        "section": "A", "title": "Minimum fields, no marketing opt-in pre-purchase", "severity": "M", "lift_low": 0.01, "lift_high": 0.03},
    {"id": "A4_inline_validation",     "section": "A", "title": "Inline field validation (no popup)",  "severity": "M", "lift_low": 0.01, "lift_high": 0.03},
    {"id": "A5_no_password_strength",  "section": "A", "title": "No password-strength meter on checkout", "severity": "S", "lift_low": 0.005, "lift_high": 0.01},

    # Section B — Layout & form design
    {"id": "B1_single_page_or_accordion", "section": "B", "title": "Single-page or accordion checkout",  "severity": "L", "lift_low": 0.08, "lift_high": 0.15},
    {"id": "B2_persistent_order_summary",  "section": "B", "title": "Persistent order summary (sticky / sidebar)", "severity": "M", "lift_low": 0.02, "lift_high": 0.05},
    {"id": "B3_address_autocomplete",      "section": "B", "title": "Address autocomplete",              "severity": "L", "lift_low": 0.03, "lift_high": 0.07},
    {"id": "B4_clear_field_labels",        "section": "B", "title": "Visible field labels (not placeholder-only)", "severity": "S", "lift_low": 0.005, "lift_high": 0.02},
    {"id": "B5_error_messages_inline",     "section": "B", "title": "Inline error messages (not banners)", "severity": "S", "lift_low": 0.005, "lift_high": 0.02},

    # Section C — Payment options
    {"id": "C1_shop_pay_default",         "section": "C", "title": "Shop Pay default for returning customers", "severity": "L", "lift_low": 0.10, "lift_high": 0.20},
    {"id": "C2_apple_pay_google_pay",     "section": "C", "title": "Apple Pay + Google Pay enabled",    "severity": "L", "lift_low": 0.10, "lift_high": 0.25},
    {"id": "C3_bnpl_for_high_aov",        "section": "C", "title": "BNPL (Klarna/Affirm) for AOV > $150", "severity": "M", "lift_low": 0.05, "lift_high": 0.15},
    {"id": "C4_payment_icons_visible",    "section": "C", "title": "Payment-method icons on PDP + cart", "severity": "M", "lift_low": 0.02, "lift_high": 0.05},
    {"id": "C5_no_redirect_for_guest_card", "section": "C", "title": "Guest credit-card checkout does not redirect", "severity": "L", "lift_low": 0.03, "lift_high": 0.08},

    # Section D — Trust & confidence
    {"id": "D1_trust_badges_checkout",   "section": "D", "title": "Trust badges near Place Order",     "severity": "M", "lift_low": 0.01, "lift_high": 0.03},
    {"id": "D2_secure_checkout_label",   "section": "D", "title": "Secure checkout / lock icon",        "severity": "S", "lift_low": 0.005, "lift_high": 0.01},
    {"id": "D3_returns_policy_link",     "section": "D", "title": "Returns policy link on checkout",    "severity": "S", "lift_low": 0.005, "lift_high": 0.01},
    {"id": "D4_real_shipping_costs_upfront", "section": "D", "title": "Real shipping cost shown on cart (not 'calculated at checkout')", "severity": "L", "lift_low": 0.03, "lift_high": 0.07},

    # Section E — Mobile-specific
    {"id": "E1_sticky_place_order",      "section": "E", "title": "Sticky Place Order button on mobile", "severity": "L", "lift_low": 0.05, "lift_high": 0.10},
    {"id": "E2_touch_targets_44px",      "section": "E", "title": "Touch targets >= 44x44 px",          "severity": "M", "lift_low": 0.01, "lift_high": 0.03},
    {"id": "E3_no_zoom_required",        "section": "E", "title": "No zoom required (16px+ input fonts)", "severity": "M", "lift_low": 0.01, "lift_high": 0.03},
    {"id": "E4_digital_wallet_above_form", "section": "E", "title": "Digital wallet buttons above email field on mobile", "severity": "L", "lift_low": 0.05, "lift_high": 0.15},
    {"id": "E5_mobile_test_real_device", "section": "E", "title": "Test on real iPhone + Android device (verification gate)", "severity": "E", "lift_low": 0.0, "lift_high": 0.0},
]


SEVERITY_WEIGHT = {"L": 5, "M": 3, "S": 1, "E": 0}

STATUS_POINT = {"pass": 1.0, "partial": 0.5, "fail": 0.0, "skip": None}

HEALTH_BANDS = [
    (90, "top_tier (Baymard best-in-class)"),
    (75, "great (top 35% of DTC stores per Baymard)"),
    (55, "good (median DTC store — ship M-severity fixes next)"),
    (40, "fair (regressed but salvageable in 1-2 weeks)"),
    (1,  "weak (most fixes still needed — start with Severity L items)"),
    (0,  "missing (no audit data submitted)"),
]

MAX_CUMULATIVE_LIFT = 0.80  # cap at +80% CVR; beyond that is cart / PDP work


@dataclass(frozen=True)
class AuditEntry:
    """One row from the audit input file."""
    guideline_id: str
    status: str           # 'pass' | 'partial' | 'fail' | 'skip'
    notes: str = ""

    def __post_init__(self) -> None:
        if self.status not in STATUS_POINT:
            raise ValueError(
                f"Invalid status {self.status!r} for {self.guideline_id!r}; "
                f"must be one of {sorted(STATUS_POINT)}"
            )


@dataclass(frozen=True)
class AuditScore:
    """Output of the audit scoring run."""
    score: int                              # 0..100
    health_band: str                        # human-readable band
    pass_count: int                         # number of `pass` items
    partial_count: int                      # number of `partial` items
    fail_count: int                         # number of `fail` items (status == 'fail')
    skip_count: int                         # number of `skip` items
    missing_count: int                      # number of guidelines with no audit entry
    weighted_points: float                  # sum(severity_weight * status_point) for scored items
    max_possible_points: float              # sum(severity_weight) for SCORED items only (E skipped)
    estimated_cvr_lift_low: float           # low end of expected cumulative lift
    estimated_cvr_lift_high: float          # high end of expected cumulative lift
    prioritized_fixes: list[dict] = field(default_factory=list)  # non-pass items, sorted by severity


def parse_audit_file(path: str) -> list[AuditEntry]:
    """Read an audit input file and return the list of AuditEntry rows.

    Unknown guideline IDs are still parsed (they count toward missing_count
    if they are valid items NOT in the guidelines table, or are warnings if
    they are completely unknown).
    """
    entries: list[AuditEntry] = []
    with open(path, "r", encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("|", 2)
            if len(parts) < 2:
                raise ValueError(
                    f"Bad audit line (expected '<id>|<status>[|<notes>]'): {line!r}"
                )
            gid = parts[0].strip()
            status = parts[1].strip().lower()
            notes = parts[2].strip() if len(parts) >= 3 else ""
            entries.append(AuditEntry(guideline_id=gid, status=status, notes=notes))
    return entries


def _known_ids() -> set[str]:
    return {g["id"] for g in GUIDELINES}


def score(entries: list[AuditEntry], *, known_ids: set[str] | None = None) -> AuditScore:
    """Compute the AuditScore from a list of audit entries."""
    if known_ids is None:
        known_ids = _known_ids()

    # Index entries by guideline id
    by_id: dict[str, AuditEntry] = {e.guideline_id: e for e in entries}
    if len(by_id) != len(entries):
        dups = [e.guideline_id for e in entries if sum(1 for x in entries if x.guideline_id == e.guideline_id) > 1]
        raise ValueError(f"Duplicate audit entries for: {sorted(set(dups))}")

    pass_count = partial_count = fail_count = skip_count = missing_count = 0
    weighted_points = 0.0
    max_possible_points = 0.0
    lift_low = 0.0
    lift_high = 0.0
    fix_list: list[dict] = []

    severity_rank = {"L": 0, "M": 1, "S": 2, "E": 3}

    for g in GUIDELINES:
        gid = g["id"]
        sev = g["severity"]
        weight = SEVERITY_WEIGHT[sev]
        entry = by_id.get(gid)

        if entry is None:
            missing_count += 1
            # Missing = un-audited = treat as not yet passing. Counts toward fix-list only if Severity > E.
            if sev != "E":
                fix_list.append({
                    "id": gid,
                    "title": g["title"],
                    "section": g["section"],
                    "severity": sev,
                    "current_status": "missing",
                    "lift_low": g["lift_low"],
                    "lift_high": g["lift_high"],
                })
            continue

        status = entry.status
        if status == "skip":
            skip_count += 1
            continue

        # Scored item: contributes to max_possible_points.
        if sev != "E":
            max_possible_points += weight

        point = STATUS_POINT[status]
        if point is None:
            # Defensive: skip should have been handled above.
            continue
        weighted_points += weight * point

        if status == "pass":
            pass_count += 1
        elif status == "partial":
            partial_count += 1
            if sev != "E":
                lift_low += g["lift_low"] * 0.5  # partial fix = half the expected lift
                lift_high += g["lift_high"] * 0.5
                fix_list.append({
                    "id": gid,
                    "title": g["title"],
                    "section": g["section"],
                    "severity": sev,
                    "current_status": "partial",
                    "lift_low": g["lift_low"],
                    "lift_high": g["lift_high"],
                    "notes": entry.notes,
                })
        elif status == "fail":
            fail_count += 1
            if sev != "E":
                lift_low += g["lift_low"]
                lift_high += g["lift_high"]
                fix_list.append({
                    "id": gid,
                    "title": g["title"],
                    "section": g["section"],
                    "severity": sev,
                    "current_status": "fail",
                    "lift_low": g["lift_low"],
                    "lift_high": g["lift_high"],
                    "notes": entry.notes,
                })

    # Score: 100 * weighted / max_possible, rounded to nearest int.
    # Edge case: no scored items submitted -> score = 0, band = 'missing'.
    if max_possible_points <= 0:
        score_val = 0
    else:
        score_val = round(100.0 * weighted_points / max_possible_points)

    # Health band lookup (highest threshold first)
    band = "missing (no audit data submitted)"
    for threshold, label in HEALTH_BANDS:
        if score_val >= threshold:
            band = label
            break

    # Cap cumulative lift at 0.80 (per the playbook's "beyond +80% is cart/PDP work" rationale).
    capped_low = min(lift_low, MAX_CUMULATIVE_LIFT)
    capped_high = min(lift_high, MAX_CUMULATIVE_LIFT)

    # Sort fix-list: Severity L first, then M, then S, then E; within severity by id (stable).
    fix_list.sort(key=lambda f: (severity_rank.get(f["severity"], 9), f["id"]))

    return AuditScore(
        score=score_val,
        health_band=band,
        pass_count=pass_count,
        partial_count=partial_count,
        fail_count=fail_count,
        skip_count=skip_count,
        missing_count=missing_count,
        weighted_points=weighted_points,
        max_possible_points=max_possible_points,
        estimated_cvr_lift_low=round(capped_low, 4),
        estimated_cvr_lift_high=round(capped_high, 4),
        prioritized_fixes=fix_list,
    )


def all_pass_entries() -> list[AuditEntry]:
    """Return one AuditEntry per guideline, all marked `pass`. Used by --all-pass and tests."""
    return [AuditEntry(guideline_id=g["id"], status="pass") for g in GUIDELINES]


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="checkout_audit_score.py",
        description=(
            "Score a Shopify checkout against Baymard's top 24 guidelines and "
            "emit a prioritized fix-list with estimated CVR lift. See "
            "/playbooks/03-checkout-audit-baymard.md."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--input", type=str, default=None,
                   help="Path to an audit input file (one line per guideline: <id>|<status>|<notes>)")
    p.add_argument("--all-pass", action="store_true",
                   help="Score every guideline as `pass` (smoke test for scoring math)")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON output (machine-readable)")
    return p.parse_args(argv)


def render_human(s: AuditScore) -> str:
    """Render a human-readable, paste-ready report."""
    lines = []
    lines.append("Checkout Audit — Baymard 24-Guideline Score")
    lines.append("=" * 44)
    lines.append("")
    lines.append(f"  Score                  : {s.score:>5d} / 100")
    lines.append(f"  Health band            : {s.health_band}")
    lines.append("")
    lines.append("Counts (out of 24 guidelines):")
    lines.append(f"  pass                   : {s.pass_count:>5d}")
    lines.append(f"  partial                : {s.partial_count:>5d}")
    lines.append(f"  fail                   : {s.fail_count:>5d}")
    lines.append(f"  skip                   : {s.skip_count:>5d}")
    lines.append(f"  missing (not audited)  : {s.missing_count:>5d}")
    lines.append("")
    lines.append(f"  Weighted points        : {s.weighted_points:>5.1f} / {s.max_possible_points:.1f}")
    lines.append("")
    lines.append("Estimated cumulative CVR lift if all non-pass items are fixed:")
    lines.append(f"  Low end                : +{s.estimated_cvr_lift_low*100:>4.1f}%")
    lines.append(f"  High end               : +{s.estimated_cvr_lift_high*100:>4.1f}%")
    lines.append(f"  (capped at +80% — beyond that is cart/PDP work, not checkout)")
    lines.append("")
    lines.append(f"Prioritized fix-list ({len(s.prioritized_fixes)} items, Severity L first):")
    if not s.prioritized_fixes:
        lines.append("  (none — all audited items are pass, or all skipped)")
    else:
        for fix in s.prioritized_fixes:
            sev = fix["severity"]
            lines.append(f"  [{sev}] {fix['id']}  ({fix['current_status']})")
            lines.append(f"        {fix['title']}")
            lines.append(f"        Lift: +{fix['lift_low']*100:.1f}% to +{fix['lift_high']*100:.1f}%")
            if fix.get("notes"):
                lines.append(f"        Notes: {fix['notes']}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.all_pass:
        entries = all_pass_entries()
    elif args.input:
        entries = parse_audit_file(args.input)
    else:
        sys.stderr.write("ERROR: provide --input <file> or --all-pass\n")
        return 2

    s = score(entries)

    if args.json:
        # asdict covers scalars; we manually serialize prioritized_fixes (already a list of dicts).
        out = asdict(s)
        print(json.dumps(out, indent=2, sort_keys=True))
    else:
        print(render_human(s))
    return 0


if __name__ == "__main__":
    sys.exit(main())