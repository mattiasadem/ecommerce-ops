"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MoveRecommendation,
  NextMoveResult,
  pickNextMove,
} from "@/lib/next-move";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  ShippedMap,
  loadShippedPlaybooks,
  saveShippedPlaybooks,
  toggleShipped,
} from "@/lib/shipped-playbooks";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `Next-move recommendation` — cross-page-intelligence card on the
 * Overview page.
 *
 * Reads:
 *   - Your-store (AOV / monthly orders / gross margin) — projects $ lift
 *   - Shipped-playbooks — filters the Top-10 queue
 *   - Top-10 status (priority rank) — picks the #1 unblocked move
 *
 * Renders:
 *   - "Ship next: <Move #X>" headline (the canonical Top-10 priority)
 *   - Personalized $ lift per month (Your-store × move lift band)
 *   - Why-this-move rationale (1 sentence + optional prereq-skipped note)
 *   - Cost band ($/mo) + days-to-ship (for "this week" pacing)
 *   - One-click **Mark shipped** button (writes to the same localStorage
 *     key as the `/playbooks` tracker, so a click here propagates
 *     everywhere)
 *   - "View playbook →" deep link to `/playbooks#<id>`
 *   - Copy-paste summary block for handoff to the team
 *
 * Auto-refreshes when the operator toggles "Mark shipped" — the next-best
 * move slides into the slot. No new dependency, no server round-trip.
 */

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000).toLocaleString("en-US")}k`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtCost(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

function renderSummary(
  move: MoveRecommendation | null,
  result: NextMoveResult,
  store: YourStoreInputs,
  monthlyOrders: number
): string {
  const lines: string[] = [];
  lines.push("# Next-move recommendation");
  lines.push("");
  if (move) {
    lines.push(`**Ship next:** Move #${move.priorityRank} — ${move.name}`);
    lines.push(
      `**Personalized lift:** ${fmtMoney(result.projectedLiftDollarsLow)}–${fmtMoney(result.projectedLiftDollarsHigh)} / month`
    );
    lines.push(
      `**Lift band:** +${(move.liftLow * 100).toFixed(0)}% to +${(move.liftHigh * 100).toFixed(0)}% of monthly revenue`
    );
    lines.push(
      `**Days to ship:** ${move.daysToShip} · **Cost:** ${fmtCost(move.costLow)}–${fmtCost(move.costHigh)} / month`
    );
    lines.push("");
    lines.push("## Why this move");
    lines.push(result.rationale);
    lines.push("");
    lines.push("## Your-store inputs");
    lines.push(`- AOV: $${store.aov.toLocaleString("en-US")}`);
    lines.push(`- Monthly orders: ${monthlyOrders.toLocaleString("en-US")}`);
    lines.push(`- Gross margin: ${(store.grossMargin * 100).toFixed(0)}%`);
    lines.push(`- Monthly revenue: ${fmtMoney(result.monthlyRevenue)}`);
    lines.push("");
    if (result.shippedSkipped.length) {
      lines.push("## Already shipped (skipped)");
      for (const m of result.shippedSkipped) {
        lines.push(`- Move #${m.priorityRank} — ${m.name}`);
      }
      lines.push("");
    }
    if (result.prereqBlocked.length) {
      lines.push("## Blocked by missing prerequisite");
      for (const b of result.prereqBlocked) {
        lines.push(
          `- Move #${b.move.priorityRank} — ${b.move.name} (waiting on ${b.missingPrereq})`
        );
      }
      lines.push("");
    }
    lines.push("## Open the playbook");
    lines.push(`https://ecommerce-ops-iota.vercel.app/playbooks#${move.id}`);
  } else {
    lines.push("All Top-10 moves shipped. Audit quarterly or branch into Move #11+.");
  }
  lines.push("");
  lines.push(
    `_Generated ${new Date().toISOString()} from ecommerce-ops-dashboard / overview._`
  );
  return lines.join("\n");
}

export function NextMoveCard() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate both localStorage keys on mount. Server renders with empty
  // state so the markup matches the client first paint (no hydration
  // mismatch — important for the static / overview prerender).
  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Recompute the recommendation every time inputs or shipped change.
  const result = useMemo(
    () => pickNextMove(store, shipped),
    [store, shipped]
  );

  const usedDefaults = !store;
  const effectiveStore = store ?? YOUR_STORE_DEFAULTS;
  const summary = useMemo(
    () => renderSummary(result.move, result, effectiveStore, effectiveStore.monthlyOrders),
    [result, effectiveStore]
  );

  function handleMarkShipped() {
    if (!result.move) return;
    const next = toggleShipped(shipped, result.move.id);
    setShipped(next);
    saveShippedPlaybooks(next);
  }

  const isAllShipped =
    hydrated && result.move === null && result.shippedSkipped.length > 0;
  const isAllBlocked =
    hydrated &&
    result.move === null &&
    result.shippedSkipped.length === 0 &&
    result.prereqBlocked.length > 0;

  return (
    <div className="rounded-xl border-2 border-accent/40 bg-card p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Cross-page intelligence · what to ship TODAY
          </div>
          <h2 className="text-lg font-semibold mt-1">
            {isAllShipped
              ? "Top-10 queue: complete"
              : isAllBlocked
                ? "Top-10 queue: blocked by prereqs"
                : result.move
                  ? `Ship next: ${result.move.name}`
                  : "Loading recommendation…"}
          </h2>
          {usedDefaults && hydrated ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Using industry-median defaults ($75 AOV × 1k orders × 70% margin).
              Open <a href="/#your-store" className="underline">Your store</a> on this page to personalize.
            </p>
          ) : null}
        </div>
        {result.move ? (
          <span
            className="inline-flex shrink-0 items-center rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent"
            aria-label={`Move number ${result.move.priorityRank}`}
          >
            Move #{result.move.priorityRank}
          </span>
        ) : null}
      </header>

      {result.move ? (
        <>
          {/* 4-tile output strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Projected lift / mo
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1 text-emerald-700 dark:text-emerald-300">
                {fmtMoney(result.projectedLiftDollarsLow)}–{fmtMoney(result.projectedLiftDollarsHigh)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                +{(result.move.liftLow * 100).toFixed(0)}% to +{(result.move.liftHigh * 100).toFixed(0)}% of {fmtMoney(result.monthlyRevenue)}/mo
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Days to ship
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1">
                {result.daysToShip} day{result.daysToShip === 1 ? "" : "s"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Operator-paced, not a sprint
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Cost / month
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1">
                {fmtCost(result.costLow)}–{fmtCost(result.costHigh)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Tooling + ESP fees (excl. labor)
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Queue position
              </div>
              <div className="text-lg font-semibold tabular-nums mt-1">
                {result.move.priorityRank} <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {result.shippedSkipped.length} shipped · {result.prereqBlocked.length} prereq-blocked
              </div>
            </div>
          </div>

          {/* Rationale */}
          <p className="text-sm text-foreground leading-relaxed mb-4">
            {result.rationale}
          </p>

          {/* Prereq-blocked footer (only if any) */}
          {result.prereqBlocked.length ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-4 text-[11px] text-amber-700 dark:text-amber-300">
              <strong className="font-semibold">Skipped (prereq waiting):</strong>{" "}
              {result.prereqBlocked
                .map(
                  (b) =>
                    `Move #${b.move.priorityRank} ${b.move.name} (needs ${b.missingPrereq})`
                )
                .join(" · ")}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/playbooks#${result.move.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Open the playbook
              <span aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              onClick={handleMarkShipped}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <span aria-hidden="true">✓</span>
              Mark shipped
            </button>
            <CopyButton
              value={summary}
              label="Copy summary"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            />
          </div>

          {/* Already-shipped audit (only if any) */}
          {result.shippedSkipped.length ? (
            <details className="mt-4 text-[11px] text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                {result.shippedSkipped.length} move{result.shippedSkipped.length === 1 ? "" : "s"} already shipped (click to expand)
              </summary>
              <ol className="mt-2 list-decimal pl-5 space-y-0.5">
                {result.shippedSkipped.map((m) => (
                  <li key={m.id}>
                    <span className="font-medium text-foreground">Move #{m.priorityRank}</span>{" "}
                    {m.name}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </>
      ) : (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {isAllShipped
            ? "🎉 All Top-10 moves shipped. You are running a best-in-class stack — re-audit quarterly or branch into Move #11+ (affiliate / B2B / international)."
            : "Every remaining Top-10 move is blocked by a prerequisite. Open /playbooks#shipped-progress to confirm the prerequisite IDs are ticked."}
        </div>
      )}
    </div>
  );
}
