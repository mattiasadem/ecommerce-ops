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
import { Bar } from "@/components/bar";
import {
  projectRealizedRoi,
  REALIZED_ROI_FORMATTERS,
  RealizedRoi,
} from "@/lib/realized-roi";
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
 * `Realized ROI` — cross-page-intelligence panel on `/`.
 *
 * Combines the operator's Your-store inputs + shipped-playbooks tracker to
 * answer the operator's "have I captured enough yet?" question:
 *
 *   - **Realized %** — fraction of total potential annual lift shipped so far.
 *   - **Captured lift** — annualized lift from shipped playbooks.
 *   - **Lift remaining (ready)** — annualized lift from ready-to-ship moves.
 *   - **Lift remaining (blocked)** — annualized lift blocked by unshipped
 *     prereqs.
 *
 * Renders:
 *   - 4 stat tiles (Realized %, Captured, Ready, Blocked)
 *   - A horizontal progress bar at the top of the card that fills
 *     proportional to the realized percentage.
 *   - A per-shipped-move breakdown showing each move's individual
 *     annualized lift contribution.
 *   - A copy-to-clipboard Markdown summary for handoff to the team.
 *
 * Edge cases handled:
 *   - No shipped moves → "no moves shipped yet" headline + zero realized.
 *   - All moves shipped → "best-in-class" headline + 100% realized.
 *   - Your-store never set → defaults render with a
 *     "Defaults · edit on Overview to personalize" chip.
 *   - Cross-tab sync via `storage` event.
 */
export function RealizedRoiPanel() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadYourStore();
    setStore(loaded ?? YOUR_STORE_DEFAULTS);
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore() ?? YOUR_STORE_DEFAULTS);
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const projection: RealizedRoi | null = useMemo(
    () => (hydrated ? projectRealizedRoi(store, shipped) : null),
    [hydrated, store, shipped],
  );

  const storePersonalized =
    typeof window !== "undefined" &&
    window.localStorage.getItem("ecom-ops:your-store:v1") !== null;

  const bandTone =
    !projection
      ? "border-border bg-muted text-muted-foreground"
      : projection.realizedPct >= 50
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : projection.realizedPct >= 25
          ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : projection.realizedPct > 0
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-border bg-muted text-muted-foreground";

  return (
    <Card id="realized-roi" className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Realized ROI — your store</CardTitle>
            <CardDescription>
              How much of the canonical Top-10 potential lift you have
              captured by shipping playbooks. Reads Your-store + shipped
              playbooks from the canonical shared keys.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {storePersonalized ? (
              <Badge variant="success" className="text-[10px]">
                Your-store · live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Defaults · edit on Overview to personalize
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn("text-[10px]", bandTone)}
              aria-label="Realized ROI band"
            >
              {projection
                ? `${REALIZED_ROI_FORMATTERS.pct(projection.realizedPct)} realized`
                : "—"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!projection ? (
          <p className="text-sm text-muted-foreground">
            Loading your shipped-playbooks state…
          </p>
        ) : (
          <>
            {/* Headline + rationale */}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-snug">
                {projection.headline}
              </p>
              <p className="text-xs text-muted-foreground">
                {projection.rationale}
              </p>
            </div>

            {/* Top progress bar — % of potential realized */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Captured {projection.shipped.moves.length} of {projection.shipped.moves.length + projection.ready.moves.length + projection.blocked.moves.length} moves</span>
                <span className="tabular-nums">
                  {REALIZED_ROI_FORMATTERS.pct(projection.realizedPct)}
                </span>
              </div>
              <Bar value={projection.realizedPct} intent="accent" />
            </div>

            {/* 4 stat tiles */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-border p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Captured
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {REALIZED_ROI_FORMATTERS.money(projection.shipped.annualLiftLow)}–
                  {REALIZED_ROI_FORMATTERS.money(projection.shipped.annualLiftHigh)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Annual lift from {projection.shipped.moves.length} shipped
                  {projection.shipped.moves.length === 1 ? " move" : " moves"}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ready to ship
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {REALIZED_ROI_FORMATTERS.money(projection.ready.annualLiftLow)}–
                  {REALIZED_ROI_FORMATTERS.money(projection.ready.annualLiftHigh)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Annual lift from {projection.ready.moves.length} ready
                  {projection.ready.moves.length === 1 ? " move" : " moves"}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Blocked
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {REALIZED_ROI_FORMATTERS.money(projection.blocked.annualLiftLow)}–
                  {REALIZED_ROI_FORMATTERS.money(projection.blocked.annualLiftHigh)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Annual lift from {projection.blocked.moves.length} blocked
                  {projection.blocked.moves.length === 1 ? " move" : " moves"} (unshipped prereqs)
                </div>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Revenue base
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {REALIZED_ROI_FORMATTERS.money(projection.monthlyRevenue)}/mo
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Annual: {REALIZED_ROI_FORMATTERS.money(projection.annualRevenue)}
                  {!storePersonalized && projection && (
                    <>
                      {" "}
                      · {YOUR_STORE_DEFAULTS.aov} AOV ·{" "}
                      {YOUR_STORE_DEFAULTS.monthlyOrders} orders/mo ·{" "}
                      {Math.round(YOUR_STORE_DEFAULTS.grossMargin * 100)}%
                      margin (defaults)
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Per-shipped-move breakdown */}
            {projection.shipped.moves.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Shipped moves — annualized lift contributions
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {projection.shipped.moves
                    .slice()
                    .sort((a, b) => a.priorityRank - b.priorityRank)
                    .map((m) => {
                      const monthly = m.liftLow * projection.monthlyRevenue;
                      const monthlyHigh = m.liftHigh * projection.monthlyRevenue;
                      return (
                        <div
                          key={m.id}
                          className="flex items-start gap-3 rounded-lg border border-border p-3"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] tabular-nums">
                            ✓
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="text-sm font-medium leading-tight">
                              {m.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground tabular-nums">
                              Move #{m.priorityRank} ·{" "}
                              {REALIZED_ROI_FORMATTERS.money(monthly)}–
                              {REALIZED_ROI_FORMATTERS.money(monthlyHigh)}/mo ·{" "}
                              {REALIZED_ROI_FORMATTERS.money(monthly * 12)}–
                              {REALIZED_ROI_FORMATTERS.money(monthlyHigh * 12)}/yr
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Markdown export */}
            <div className="flex items-center justify-end pt-1">
              <CopyButton
                value={projection.summaryMarkdown}
                label="Copy summary"
                className="text-[11px]"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
