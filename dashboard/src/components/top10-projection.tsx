"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  projectTop10Rollout,
  PROJECTION_FORMATTERS,
  Top10Projection,
} from "@/lib/top10-projection";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `Top-10 rollout projection` — interactive panel on `/top-10`.
 *
 * Cross-page-intelligence + interactive-tool:
 *   - Reads Your-store (AOV / monthly orders / gross margin) from the
 *     canonical shared key — same source the abandoned-cart /
 *     post-purchase / welcome-series / unit-economics-personalizer
 *     calculators read from.
 *   - Reads shipped-playbooks from the canonical tracker key.
 *   - On every input change, re-projects the cumulative annual lift,
 *     cost stack, and ROI band across the remaining Top-10 moves.
 *
 * Renders 6 stat tiles (annual lift band / annual cost / Year-1 ROI /
 * monthly lift / months-to-ship / revenue base) plus a per-move
 * breakdown table (with 🔒 markers for prereq-blocked moves) plus a
 * copy-to-clipboard Markdown summary for handoff to the team.
 *
 * State:
 *   - Your-store inputs live in `ecom-ops:your-store:v1` (shared).
 *   - Shipped-playbooks live in `ecom-ops:shipped-playbooks:v1` (shared).
 *   - This component stores NO additional local state — every dial the
 *     operator might want lives in another canonical calculator. This
 *     keeps the "single source of truth" promise.
 *
 * Edge cases handled:
 *   - All moves shipped → "everything shipped" card + empty table.
 *   - Your-store never set → defaults render with a "Defaults · edit on
 *     Overview to personalize" chip.
 *   - Cross-tab sync via `storage` event.
 */

export function Top10ProjectionPanel() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [storeHydrated, setStoreHydrated] = useState(false);

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setStoreHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "ecom-ops:your-store:v1" ||
        e.key === "ecom-ops:shipped-playbooks:v1"
      ) {
        setStore(loadYourStore());
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const projection: Top10Projection = useMemo(
    () => projectTop10Rollout(store, shipped),
    [store, shipped]
  );

  const { fmtMoney, fmtRoi } = PROJECTION_FORMATTERS;
  const storeForDisplay = store ?? YOUR_STORE_DEFAULTS;
  const usingDefaults = store === null;

  return (
    <Card className="border-2" id="top-10-projection">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              Top-10 rollout projection — your store, year 1
            </CardTitle>
            <CardDescription className="text-xs">
              {projection.headline}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {usingDefaults && storeHydrated && (
              <Badge variant="outline" className="text-[10px]">
                Defaults · edit on Overview to personalize
              </Badge>
            )}
            <CopyButton
              value={projection.summaryMarkdown}
              label="Copy report"
              className="text-[10px]"
            />
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          AOV {fmtMoney(storeForDisplay.aov)} ×{" "}
          {storeForDisplay.monthlyOrders.toLocaleString("en-US")} orders/mo ×{" "}
          {(storeForDisplay.grossMargin * 100).toFixed(0)}% margin ={" "}
          <span className="text-foreground">
            {fmtMoney(projection.monthlyRevenue)}/mo
          </span>{" "}
          revenue base
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* === STAT TILES === */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile
            label="Annual lift"
            value={`${fmtMoney(projection.annualLiftLow)}-${fmtMoney(projection.annualLiftHigh)}`}
            sub={`${fmtMoney(projection.monthlyLiftLow)}-${fmtMoney(projection.monthlyLiftHigh)} / mo`}
            tone="accent"
          />
          <StatTile
            label="Annual cost stack"
            value={`${fmtMoney(projection.annualCostLow)}-${fmtMoney(projection.annualCostHigh)}`}
            sub={`${fmtMoney(projection.monthlyCostLow)}-${fmtMoney(projection.monthlyCostHigh)} / mo`}
            tone="muted"
          />
          <StatTile
            label="Year-1 ROI"
            value={`${fmtRoi(projection.annualRoiLow)} – ${fmtRoi(projection.annualRoiHigh)}`}
            sub="annual lift ÷ annual cost (high side)"
            tone={
              projection.annualRoiHigh >= 5
                ? "good"
                : projection.annualRoiHigh >= 2
                ? "fair"
                : "red-flag"
            }
          />
          <StatTile
            label="Moves remaining"
            value={`${projection.movesRemaining}`}
            sub={`${projection.movesShipped} shipped · ${projection.movesPrereqBlocked} blocked`}
            tone="muted"
          />
          <StatTile
            label="Days to ship all"
            value={`${projection.totalDaysToShip}d`}
            sub={`≈ ${Math.ceil(projection.totalDaysToShip / 30)} months at 1 move/week`}
            tone="muted"
          />
          <StatTile
            label="Revenue base"
            value={fmtMoney(projection.monthlyRevenue)}
            sub={`${fmtMoney(projection.annualRevenue)} / yr`}
            tone="muted"
          />
        </div>

        {/* === PER-MOVE TABLE === */}
        {projection.perMove.length > 0 ? (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Move</th>
                  <th className="px-3 py-2 text-right font-medium">Lift / mo</th>
                  <th className="px-3 py-2 text-right font-medium">Cost / mo</th>
                  <th className="px-3 py-2 text-right font-medium">Days</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projection.perMove.map((pm) => {
                  const blocked = pm.move.prereqIds.some(
                    (pid) => !Object.prototype.hasOwnProperty.call(shipped, pid)
                  );
                  const missing = pm.move.prereqIds.find(
                    (pid) => !Object.prototype.hasOwnProperty.call(shipped, pid)
                  );
                  return (
                    <tr
                      key={pm.move.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {pm.move.priorityRank}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pm.move.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmtMoney(pm.monthlyLiftLow)}-
                        {fmtMoney(pm.monthlyLiftHigh)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {fmtMoney(pm.monthlyCostLow)}-
                        {fmtMoney(pm.monthlyCostHigh)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {pm.daysToShip}d
                      </td>
                      <td className="px-3 py-2">
                        {blocked ? (
                          <Badge variant="outline" className="text-[10px]">
                            🔒 needs {humanizeMissingPrereq(missing)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Ready to ship
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            Every Top-10 move is already shipped. You're running a best-in-class
            stack — re-audit quarterly or branch into Move #11+.
          </div>
        )}

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Lift bands are additive on the operator's monthly revenue and taken
          verbatim from each move's playbook ROI band. Costs are summed on the
          high side (operator realistically budgets the upper band). Per-move
          🔒 markers indicate remaining moves whose prereq hasn't shipped yet —
          ship the prereq first to unlock them. Math lives in{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            dashboard/src/lib/top10-projection.ts
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "accent" | "muted" | "good" | "fair" | "red-flag";
}) {
  const toneClass =
    tone === "accent"
      ? "text-foreground"
      : tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "fair"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "red-flag"
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 flex flex-col gap-1"
      )}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-lg font-semibold tabular-nums", toneClass)}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground leading-snug">
        {sub}
      </span>
    </div>
  );
}

function humanizeMissingPrereq(prereqId: string | undefined): string {
  if (!prereqId) return "prereq";
  // Map a few canonical IDs to a friendly label.
  const map: Record<string, string> = {
    "05-migrate-to-klaviyo-postscript": "Migrate to Klaviyo+Postscript",
    "06-install-attribution-triplewhale-or-polar":
      "Triple Whale / Polar attribution",
  };
  return map[prereqId] ?? prereqId.replace(/^\d+-/, "").replace(/-/g, " ");
}
