"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ConfidenceLevel,
  entryAnnualizedLift,
  entryNetMonthlyLift,
  entryRoiMultiple,
  RealizedRoiEntry,
  RealizedRoiLedger,
  classifyGapVsProjected,
  clearRealizedRoiEntry,
  daysSince,
  emitRealizedRoiUpdate,
  formatRoiMultiple,
  confidenceLabel,
  loadRealizedRoiLedger,
  saveRealizedRoiLedger,
  setRealizedRoiEntry,
} from "@/lib/realized-roi-ledger";
import { loadShippedPlaybooks, ShippedMap } from "@/lib/shipped-playbooks";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `Realized ROI ledger` — per-playbook actual-revenue tracker (Move #N.7).
 *
 * Mounted on `/playbooks/[slug]` below the `PlaybookShippedToggle`. The
 * panel renders three states:
 *
 *   1. **Unshipped** → "Mark shipped above to start tracking actuals." (the
 *      point is moot until the playbook is shipped; we don't nag)
 *   2. **Shipped + no entry** → a guided input form so the operator can
 *      type in actual $/month revenue lift, $/month cost, orders
 *      recovered, measurement window, confidence, and a free-form note
 *   3. **Shipped + entry** → read-only summary tile with the net
 *      monthly lift, ROI multiple, days-since-update, confidence, and
 *      Edit / Clear buttons
 *
 * Companion state on `/`: `<RealizedRoiLedgerRollup />` aggregates all
 * entries across the operator's shipped playbooks and renders a compact
 * "Actuals vs Projected" widget on the Overview.
 *
 * State-persistence: writes to `ecom-ops:realized-roi:v1` (separate from
 * the projected ROI board's `ecom-ops:shipped-playbooks:v1`).
 *
 * Cross-tab sync: listens to both `storage` event and the
 * `ecom-ops:realized-roi:update` CustomEvent so edits in another tab /
 * same-tab listener reflect immediately.
 *
 * Cross-page-intelligence: when the playbook is flipped from shipped
 * → not shipped, the entry is preserved (operator may have shipped,
 * measured, then realized they hadn't fully rolled out — don't destroy
 * their work). The UI shows a "playbook not currently marked shipped"
 * notice but the data remains.
 */

interface RealizedRoiLedgerPanelProps {
  playbookId: string;
  playbookTitle: string;
  /** Optional projection band from the playbook's canonical monthly-lift table. */
  projectedMonthlyLiftLow?: number;
  projectedMonthlyLiftHigh?: number;
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["low", "medium", "high"];

export function RealizedRoiLedgerPanel({
  playbookId,
  playbookTitle,
  projectedMonthlyLiftLow = 0,
  projectedMonthlyLiftHigh = 0,
}: RealizedRoiLedgerPanelProps) {
  const [ledger, setLedger] = useState<RealizedRoiLedger>({});
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);

  // Hydrate on mount. Server has no localStorage → render empty stub.
  useEffect(() => {
    setLedger(loadRealizedRoiLedger());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Cross-tab sync via storage event.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "ecom-ops:realized-roi:v1") {
        setLedger(loadRealizedRoiLedger());
      } else if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab listener — re-hydrate when the form saves (so the rollup
  // on `/` updates without a remount).
  useEffect(() => {
    function onUpdate() {
      setLedger(loadRealizedRoiLedger());
    }
    window.addEventListener("ecom-ops:realized-roi:update", onUpdate);
    return () =>
      window.removeEventListener("ecom-ops:realized-roi:update", onUpdate);
  }, []);

  // Persist on every change (after hydration) + emit the same-tab event.
  useEffect(() => {
    if (!hydrated) return;
    saveRealizedRoiLedger(ledger);
    emitRealizedRoiUpdate();
  }, [ledger, hydrated]);

  const entry = ledger[playbookId];
  const isShipped = Boolean(shipped[playbookId]);

  const handleSave = useCallback(
    (patch: Partial<RealizedRoiEntry>) => {
      setLedger((l) => setRealizedRoiEntry(l, playbookId, patch));
      setEditing(false);
    },
    [playbookId]
  );

  const handleClear = useCallback(() => {
    setLedger((l) => clearRealizedRoiEntry(l, playbookId));
  }, [playbookId]);

  // State 1: pre-hydration stub. Server has no localStorage so we render
  // the "loading" skeleton to keep SSR markup identical to first client
  // render (avoids React hydration mismatch).
  if (!hydrated) {
    return (
      <Card id="realized-roi-ledger" className="border-dashed">
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <CardTitle className="text-base">Log actual revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Loading actuals…
        </CardContent>
      </Card>
    );
  }

  // State 2: unshipped — show the nudge but no form (don't nag).
  if (!isShipped && !entry) {
    return (
      <Card id="realized-roi-ledger" className="border-dashed">
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <CardTitle className="text-base">Log actual revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Mark this playbook as shipped above to start tracking actual
          revenue lift. The ledger persists per-browser to{" "}
          <code className="rounded bg-muted px-1">
            ecom-ops:realized-roi:v1
          </code>{" "}
          and rolls up into the Overview widget.
        </CardContent>
      </Card>
    );
  }

  // State 3: shipped + entry exists + not editing → summary tile.
  if (entry && !editing) {
    return (
      <EntrySummary
        playbookId={playbookId}
        playbookTitle={playbookTitle}
        entry={entry}
        isShipped={isShipped}
        projectedMonthlyLiftLow={projectedMonthlyLiftLow}
        projectedMonthlyLiftHigh={projectedMonthlyLiftHigh}
        onEdit={() => setEditing(true)}
        onClear={handleClear}
      />
    );
  }

  // State 4: shipped + (no entry / editing) → input form.
  return (
    <EntryForm
      playbookId={playbookId}
      playbookTitle={playbookTitle}
      entry={entry}
      isShipped={isShipped}
      projectedMonthlyLiftLow={projectedMonthlyLiftLow}
      projectedMonthlyLiftHigh={projectedMonthlyLiftHigh}
      onSave={handleSave}
      onCancel={
        // Cancel only makes sense when there IS an existing entry to cancel to.
        entry ? () => setEditing(false) : undefined
      }
    />
  );
}

// === Summary tile ============================================================

interface EntrySummaryProps {
  playbookId: string;
  playbookTitle: string;
  entry: RealizedRoiEntry;
  isShipped: boolean;
  projectedMonthlyLiftLow: number;
  projectedMonthlyLiftHigh: number;
  onEdit: () => void;
  onClear: () => void;
}

function EntrySummary({
  playbookId,
  playbookTitle,
  entry,
  isShipped,
  projectedMonthlyLiftLow,
  projectedMonthlyLiftHigh,
  onEdit,
  onClear,
}: EntrySummaryProps) {
  const net = entryNetMonthlyLift(entry);
  const annual = entryAnnualizedLift(entry);
  const roi = entryRoiMultiple(entry);
  const roiLabel = formatRoiMultiple(roi);
  const gap = classifyGapVsProjected(
    entry,
    projectedMonthlyLiftLow,
    projectedMonthlyLiftHigh
  );
  const updatedDaysAgo = daysSince(entry.updatedAt);
  const loggedDaysAgo = daysSince(entry.loggedAt);

  const gapBadge = renderGapBadge(gap);
  const confidenceBadge = renderConfidenceBadge(entry.confidence);

  return (
    <Card id="realized-roi-ledger" className="border-emerald-500/30">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            {gapBadge}
            {confidenceBadge}
          </div>
        </div>
        <CardTitle className="text-base">Actual revenue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isShipped ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            <strong className="font-semibold">Heads up:</strong> this playbook
            is not currently marked shipped on the toggle above, but actuals
            are still preserved. Flip the toggle to keep the canonical
            shipped-state in sync.
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            label="Net monthly lift"
            value={formatUsd(net)}
            tone={net > 0 ? "positive" : net < 0 ? "negative" : "neutral"}
          />
          <StatTile label="Annualized" value={formatUsd(annual)} />
          <StatTile
            label="ROI multiple"
            value={roiLabel}
            tone={Number.isFinite(roi) && roi >= 3 ? "positive" : "neutral"}
          />
          <StatTile
            label="Orders recovered / mo"
            value={
              entry.actualMonthlyOrdersLift > 0
                ? entry.actualMonthlyOrdersLift.toLocaleString("en-US")
                : "—"
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground md:grid-cols-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider">Revenue</div>
            <div className="font-mono text-foreground">
              {formatUsd(entry.actualMonthlyRevenueLift)}/mo
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider">Cost</div>
            <div className="font-mono text-foreground">
              {formatUsd(entry.actualMonthlyCost)}/mo
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider">
              Window
            </div>
            <div className="font-mono text-foreground">
              {entry.measurementWindowDays} days
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider">Updated</div>
            <div className="font-mono text-foreground">
              {updatedDaysAgo === 0
                ? "today"
                : `${updatedDaysAgo}d ago`}
            </div>
          </div>
        </div>

        {entry.notes ? (
          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-foreground/90">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Notes
            </div>
            <div className="mt-1 whitespace-pre-wrap leading-relaxed">
              {entry.notes}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit actuals for ${playbookTitle}`}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            Edit actuals
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Clear actuals for ${playbookTitle}`}
          >
            Clear entry
          </button>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
            Storage: <code className="rounded bg-muted px-1">ecom-ops:realized-roi:v1</code>
            {" · "}
            First logged {loggedDaysAgo === 0 ? "today" : `${loggedDaysAgo}d ago`}
            {" · "}
            <code className="rounded bg-muted px-1">{playbookId}</code>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// === Input form ==============================================================

interface EntryFormProps {
  playbookId: string;
  playbookTitle: string;
  entry: RealizedRoiEntry | undefined;
  isShipped: boolean;
  projectedMonthlyLiftLow: number;
  projectedMonthlyLiftHigh: number;
  onSave: (patch: Partial<RealizedRoiEntry>) => void;
  onCancel?: () => void;
}

function EntryForm({
  playbookId,
  playbookTitle,
  entry,
  isShipped,
  projectedMonthlyLiftLow,
  projectedMonthlyLiftHigh,
  onSave,
  onCancel,
}: EntryFormProps) {
  const [revenue, setRevenue] = useState<string>(
    entry ? String(entry.actualMonthlyRevenueLift) : ""
  );
  const [cost, setCost] = useState<string>(
    entry ? String(entry.actualMonthlyCost) : ""
  );
  const [orders, setOrders] = useState<string>(
    entry ? String(entry.actualMonthlyOrdersLift) : ""
  );
  const [windowDays, setWindowDays] = useState<string>(
    entry ? String(entry.measurementWindowDays) : "30"
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    entry?.confidence ?? "medium"
  );
  const [notes, setNotes] = useState<string>(entry?.notes ?? "");
  const [error, setError] = useState<string>("");

  function reset() {
    setRevenue(entry ? String(entry.actualMonthlyRevenueLift) : "");
    setCost(entry ? String(entry.actualMonthlyCost) : "");
    setOrders(entry ? String(entry.actualMonthlyOrdersLift) : "");
    setWindowDays(entry ? String(entry.measurementWindowDays) : "30");
    setConfidence(entry?.confidence ?? "medium");
    setNotes(entry?.notes ?? "");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const revNum = Number(revenue);
    const costNum = Number(cost);
    const ordNum = Number(orders);
    const winNum = Number(windowDays);
    if (!Number.isFinite(revNum) || revNum < 0) {
      setError("Revenue lift must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(costNum) || costNum < 0) {
      setError("Cost must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(ordNum) || ordNum < 0) {
      setError("Orders recovered must be a non-negative number (0 if unmeasured).");
      return;
    }
    if (!Number.isFinite(winNum) || winNum < 1) {
      setError("Measurement window must be at least 1 day.");
      return;
    }
    if (notes.length > 500) {
      setError("Notes capped at 500 characters.");
      return;
    }
    onSave({
      actualMonthlyRevenueLift: revNum,
      actualMonthlyCost: costNum,
      actualMonthlyOrdersLift: ordNum,
      measurementWindowDays: Math.floor(winNum),
      confidence,
      notes: notes.trim(),
    });
  }

  const projectedMid =
    projectedMonthlyLiftLow > 0 || projectedMonthlyLiftHigh > 0
      ? (projectedMonthlyLiftLow + projectedMonthlyLiftHigh) / 2
      : 0;

  return (
    <Card
      id="realized-roi-ledger"
      className={cn("border-dashed", !isShipped && "border-amber-500/40")}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-[10px] uppercase tracking-wider">
          Realized ROI ledger · Move #N.7
        </CardDescription>
        <CardTitle className="text-base">
          {entry ? "Edit actuals" : "Log actual revenue"}
        </CardTitle>
        {!isShipped ? (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Playbook is not currently marked shipped — actuals will still
            save, but consider re-flipping the toggle above.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {projectedMid > 0 ? (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Projected (canonical)
              </div>
              <div className="mt-1 font-mono text-foreground">
                {formatUsd(projectedMonthlyLiftLow)} –{" "}
                {formatUsd(projectedMonthlyLiftHigh)}/mo · midpoint{" "}
                {formatUsd(projectedMid)}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <NumberField
              label="Revenue lift ($/mo)"
              hint="Incremental revenue recovered per month"
              value={revenue}
              onChange={setRevenue}
              step="50"
              placeholder="0"
            />
            <NumberField
              label="Cost ($/mo)"
              hint="Tooling + creative + headcount-time / month"
              value={cost}
              onChange={setCost}
              step="10"
              placeholder="0"
            />
            <NumberField
              label="Orders recovered / mo"
              hint="0 if unmeasured"
              value={orders}
              onChange={setOrders}
              step="1"
              placeholder="0"
            />
            <NumberField
              label="Measurement window (days)"
              hint="How long you measured for (e.g. 30, 60, 90)"
              value={windowDays}
              onChange={setWindowDays}
              step="1"
              placeholder="30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" htmlFor="confidence">
              Confidence
            </label>
            <div className="flex flex-wrap gap-2">
              {CONFIDENCE_LEVELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfidence(c)}
                  aria-pressed={confidence === c}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                    confidence === c
                      ? "border-foreground/40 bg-foreground/5 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" htmlFor="realized-notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="realized-notes"
              className="min-h-[80px] rounded-md border border-border bg-background p-2 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Klaviyo + Postscript, 14-day attribution window, excluded returns"
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="text-[10px] text-muted-foreground">
              {notes.length}/500
            </div>
          </div>

          {error ? (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90"
              aria-label={entry ? "Save actuals" : "Log actual revenue"}
            >
              {entry ? "Save actuals" : "Log actual revenue"}
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={() => {
                  reset();
                  onCancel();
                }}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
            ) : null}
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              Saves to{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:realized-roi:v1
              </code>{" "}
              · playbook{" "}
              <code className="rounded bg-muted px-1">{playbookId}</code>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// === Sub-components ==========================================================

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  placeholder?: string;
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  step = "1",
  placeholder = "0",
}: NumberFieldProps) {
  const id = `num-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {hint ? (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-sm",
          tone === "positive" && "text-emerald-700 dark:text-emerald-300",
          tone === "negative" && "text-red-700 dark:text-red-300",
          tone === "neutral" && "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function renderGapBadge(gap: ReturnType<typeof classifyGapVsProjected>) {
  switch (gap) {
    case "UNDERWIDE":
      return (
        <Badge variant="danger" className="text-[10px]">
          Underperforming (&lt;25%)
        </Badge>
      );
    case "UNDER":
      return (
        <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300">
          Under (25–75%)
        </Badge>
      );
    case "ON-TARGET":
      return (
        <Badge variant="outline" className="border-emerald-500/40 text-[10px] text-emerald-700 dark:text-emerald-300">
          On-target (75–125%)
        </Badge>
      );
    case "OVER":
      return (
        <Badge variant="outline" className="border-blue-500/40 text-[10px] text-blue-700 dark:text-blue-300">
          Outperforming (&gt;125%)
        </Badge>
      );
    case "UNMEASURED":
    default:
      return (
        <Badge variant="secondary" className="text-[10px]">
          No projection set
        </Badge>
      );
  }
}

function renderConfidenceBadge(conf: ConfidenceLevel) {
  return (
    <Badge variant="secondary" className="text-[10px]">
      {confidenceLabel(conf)}
    </Badge>
  );
}

// === Compact rollup (mounted on /) ===========================================

/**
 * `<RealizedRoiLedgerRollup />` — compact summary on `/` showing total
 * entries logged, total net monthly lift, total annualized, average ROI
 * multiple, and a 3-tile breakdown of underperforming / on-target /
 * outperforming. Operator clicks "Open ledger" to expand the full list
 * (the per-playbook detail page is the canonical entry surface; the rollup
 * is read-only).
 *
 * State-persistence: reads `ecom-ops:realized-roi:v1` on mount, listens
 * to `ecom-ops:realized-roi:update` + `storage` events. SSR renders the
 * empty stub (the operator will see a real number after first interaction).
 */
export function RealizedRoiLedgerRollup() {
  const [ledger, setLedger] = useState<RealizedRoiLedger>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLedger(loadRealizedRoiLedger());
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "ecom-ops:realized-roi:v1") {
        setLedger(loadRealizedRoiLedger());
      }
    }
    function onUpdate() {
      setLedger(loadRealizedRoiLedger());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:realized-roi:update", onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:realized-roi:update", onUpdate);
    };
  }, []);

  const ids = useMemo(() => Object.keys(ledger), [ledger]);
  const total = ids.length;

  // Pre-hydration stub — keeps SSR markup stable across the boundary.
  if (!hydrated) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <CardTitle className="text-base">Actuals log</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Loading actuals…
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <CardTitle className="text-base">Actuals log</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          No actuals logged yet. Ship a playbook, then open it and click{" "}
          <strong className="font-semibold text-foreground">
            Log actual revenue
          </strong>{" "}
          to start tracking. Each entry persists to{" "}
          <code className="rounded bg-muted px-1">ecom-ops:realized-roi:v1</code>
          .
        </CardContent>
      </Card>
    );
  }

  // Compute aggregate
  let totalNet = 0;
  let totalAnnual = 0;
  let totalOrders = 0;
  let roiSum = 0;
  let roiCount = 0;
  let underperforming = 0;
  let onTarget = 0;
  let overperforming = 0;
  for (const id of ids) {
    const e = ledger[id];
    totalNet += entryNetMonthlyLift(e);
    totalAnnual += entryAnnualizedLift(e);
    totalOrders += e.actualMonthlyOrdersLift;
    const r = entryRoiMultiple(e);
    if (Number.isFinite(r)) {
      roiSum += r;
      roiCount += 1;
    }
    const g = classifyGapVsProjected(e, 0, 0);
    if (g === "UNDERWIDE" || g === "UNDER") underperforming += 1;
    else if (g === "ON-TARGET") onTarget += 1;
    else if (g === "OVER") overperforming += 1;
  }
  const avgRoi = roiCount > 0 ? roiSum / roiCount : 0;
  const avgRoiLabel = formatRoiMultiple(avgRoi);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Realized ROI ledger · Move #N.7
          </CardDescription>
          <Badge variant="outline" className="text-[10px]">
            {total} {total === 1 ? "playbook" : "playbooks"} logged
          </Badge>
        </div>
        <CardTitle className="text-base">Actuals log</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Net monthly" value={formatUsd(totalNet)} tone={totalNet > 0 ? "positive" : totalNet < 0 ? "negative" : "neutral"} />
          <StatTile label="Annualized" value={formatUsd(totalAnnual)} />
          <StatTile
            label="Avg ROI multiple"
            value={avgRoiLabel}
            tone={
              Number.isFinite(avgRoi) && avgRoi >= 3 ? "positive" : "neutral"
            }
          />
          <StatTile
            label="Orders recovered / mo"
            value={totalOrders > 0 ? totalOrders.toLocaleString("en-US") : "—"}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <UnderOnOverTile label="Underperforming" count={underperforming} tone="amber" />
          <UnderOnOverTile label="On-target" count={onTarget} tone="emerald" />
          <UnderOnOverTile label="Outperforming" count={overperforming} tone="blue" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Open any shipped playbook on{" "}
          <a href="/playbooks" className="text-foreground hover:underline">
            /playbooks
          </a>{" "}
          to log or edit actuals. Each entry persists to{" "}
          <code className="rounded bg-muted px-1">ecom-ops:realized-roi:v1</code>
          .
        </div>
      </CardContent>
    </Card>
  );
}

interface UnderOnOverTileProps {
  label: string;
  count: number;
  tone: "amber" | "emerald" | "blue";
}

function UnderOnOverTile({ label, count, tone }: UnderOnOverTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-md border p-2",
        tone === "amber" && "border-amber-500/30 bg-amber-500/5",
        tone === "emerald" && "border-emerald-500/30 bg-emerald-500/5",
        tone === "blue" && "border-blue-500/30 bg-blue-500/5"
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-base",
          tone === "amber" && "text-amber-700 dark:text-amber-300",
          tone === "emerald" && "text-emerald-700 dark:text-emerald-300",
          tone === "blue" && "text-blue-700 dark:text-blue-300"
        )}
      >
        {count}
      </div>
    </div>
  );
}