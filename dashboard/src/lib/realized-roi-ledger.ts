/**
 * `Realized ROI ledger` — operator-owned actual-revenue tracker per shipped
 * playbook (Move #N.7).
 *
 * The existing `projectRealizedRoi` in `realized-roi.ts` shows the operator's
 * PROJECTED annual lift based on their Your-store inputs + the canonical
 * per-move monthly-lift-band table. This module adds the operator's ACTUAL
 * tracked lift: a per-playbook log where the operator types in real numbers
 * from their own analytics ("we recovered $X from abandoned cart in March",
 * "we saw $Y lift from SMS welcome in April").
 *
 * Why a separate module: a project is a forecast, a ledger is a journal.
 * Mixing them collapses the "are we on track?" question (the operator
 * needs the gap, not the projection alone). The new state lives under its
 * own localStorage key so existing projected-ROI users see no breaking
 * change; the per-playbook panel only renders when both (a) the playbook
 * is flipped to shipped AND (b) the operator opts to log actual numbers.
 *
 * Storage key: `ecom-ops:realized-roi:v1`
 *   Schema: `Record<playbookId, RealizedRoiEntry>` where
 *     `RealizedRoiEntry = {
 *        actualMonthlyRevenueLift: number;   // $ recovered / month
 *        actualMonthlyCost: number;         // $ spent to run / month
 *        actualMonthlyOrdersLift: number;   // orders recovered / month
 *        measurementWindowDays: number;      // how long they measured
 *        confidence: 'low' | 'medium' | 'high';
 *        notes: string;
 *        loggedAt: ISOString;
 *        updatedAt: ISOString;
 *      }`
 *
 * Derived stats (computed per-call, not persisted):
 *   - `entryNetMonthlyLift(entry)` — revenue lift − cost
 *   - `entryAnnualizedLift(entry)` — net monthly × 12
 *   - `entryRoiMultiple(entry)` — net / cost (Infinity-guarded; +Inf → "∞×")
 *   - `aggregateLedger(ledger)` — fleet-wide rollup (totals + gap vs projected)
 *   - `gapVsProjected(entry, projectedMonthlyLiftLow, projectedMonthlyLiftHigh)`
 *     — signed delta: actualNet − projectedMidpoint, with classification
 *     (UNDERWIDE / UNDER / ON-TARGET / OVER)
 *
 * Cross-tab sync: writers dispatch
 * `ecom-ops:realized-roi:update` CustomEvent so same-tab listeners (the
 * compact summary on `/`) see updates without waiting for a remount.
 *
 * No deps. Pure-logic helpers; the React component handles storage,
 * hydration, and the synthesis with the shipped-playbooks map.
 */

export type ConfidenceLevel = "low" | "medium" | "high";

export interface RealizedRoiEntry {
  /** $/month actual incremental revenue the operator attributed to this playbook. */
  actualMonthlyRevenueLift: number;
  /** $/month actual incremental cost (tooling, creative, headcount-time cost). */
  actualMonthlyCost: number;
  /** Orders recovered / month. 0 means unmeasured. */
  actualMonthlyOrdersLift: number;
  /** How many days the operator measured for (e.g. 30, 60, 90). */
  measurementWindowDays: number;
  /** Self-reported confidence in the number. */
  confidence: ConfidenceLevel;
  /** Free-form notes: "we used a 14-day attribution window", "excluded returns", etc. */
  notes: string;
  /** ISO 8601 timestamp of the FIRST log entry for this playbook. */
  loggedAt: string;
  /** ISO 8601 timestamp of the most-recent update. */
  updatedAt: string;
}

export type RealizedRoiLedger = Record<string, RealizedRoiEntry>;

export const REALIZED_ROI_LEDGER_STORAGE_KEY = "ecom-ops:realized-roi:v1";
export const REALIZED_ROI_UPDATE_EVENT = "ecom-ops:realized-roi:update";

/** Empty entry factory. Caller still sets `loggedAt` + `updatedAt`. */
export function emptyEntry(now: string = new Date().toISOString()): RealizedRoiEntry {
  return {
    actualMonthlyRevenueLift: 0,
    actualMonthlyCost: 0,
    actualMonthlyOrdersLift: 0,
    measurementWindowDays: 30,
    confidence: "medium",
    notes: "",
    loggedAt: now,
    updatedAt: now,
  };
}

export function loadRealizedRoiLedger(): RealizedRoiLedger {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REALIZED_ROI_LEDGER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: RealizedRoiLedger = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const entry = v as Partial<RealizedRoiEntry>;
      // Minimum viability: at least loggedAt + a numeric revenue field.
      if (typeof entry.loggedAt !== "string") continue;
      if (typeof entry.actualMonthlyRevenueLift !== "number") continue;
      out[k] = {
        actualMonthlyRevenueLift: Number(entry.actualMonthlyRevenueLift) || 0,
        actualMonthlyCost:
          typeof entry.actualMonthlyCost === "number" ? entry.actualMonthlyCost : 0,
        actualMonthlyOrdersLift:
          typeof entry.actualMonthlyOrdersLift === "number"
            ? entry.actualMonthlyOrdersLift
            : 0,
        measurementWindowDays:
          typeof entry.measurementWindowDays === "number" &&
          entry.measurementWindowDays > 0
            ? Math.floor(entry.measurementWindowDays)
            : 30,
        confidence: (
          ["low", "medium", "high"] as ConfidenceLevel[]
        ).includes(entry.confidence as ConfidenceLevel)
          ? (entry.confidence as ConfidenceLevel)
          : "medium",
        notes: typeof entry.notes === "string" ? entry.notes : "",
        loggedAt: entry.loggedAt,
        updatedAt:
          typeof entry.updatedAt === "string" ? entry.updatedAt : entry.loggedAt,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveRealizedRoiLedger(ledger: RealizedRoiLedger): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REALIZED_ROI_LEDGER_STORAGE_KEY,
      JSON.stringify(ledger)
    );
  } catch {
    /* quota / private-mode */
  }
}

/** Dispatched after a save so same-tab listeners (e.g. the rollup on /) re-hydrate. */
export function emitRealizedRoiUpdate(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(REALIZED_ROI_UPDATE_EVENT));
  } catch {
    /* older browsers */
  }
}

/** Insert or update a single playbook's entry; preserves `loggedAt` on update. */
export function setRealizedRoiEntry(
  ledger: RealizedRoiLedger,
  playbookId: string,
  patch: Partial<RealizedRoiEntry>
): RealizedRoiLedger {
  const now = new Date().toISOString();
  const existing = ledger[playbookId];
  const base: RealizedRoiEntry = existing ?? emptyEntry(now);
  const next: RealizedRoiEntry = {
    ...base,
    ...patch,
    loggedAt: existing?.loggedAt ?? now,
    updatedAt: now,
  };
  // Sanitize numeric fields.
  next.actualMonthlyRevenueLift = sanitizeNumber(next.actualMonthlyRevenueLift);
  next.actualMonthlyCost = sanitizeNumber(next.actualMonthlyCost);
  next.actualMonthlyOrdersLift = sanitizeNumber(next.actualMonthlyOrdersLift);
  next.measurementWindowDays = Math.max(
    1,
    Math.floor(sanitizeNumber(next.measurementWindowDays) || 30)
  );
  return { ...ledger, [playbookId]: next };
}

export function clearRealizedRoiEntry(
  ledger: RealizedRoiLedger,
  playbookId: string
): RealizedRoiLedger {
  if (!(playbookId in ledger)) return ledger;
  const next = { ...ledger };
  delete next[playbookId];
  return next;
}

function sanitizeNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  // Cap absurd values to prevent typos from corrupting the rollup.
  return Math.min(n, 1_000_000_000);
}

/** Revenue lift − cost. NaN-guarded. */
export function entryNetMonthlyLift(entry: RealizedRoiEntry): number {
  return entry.actualMonthlyRevenueLift - entry.actualMonthlyCost;
}

/** Net monthly lift × 12. NaN-guarded. */
export function entryAnnualizedLift(entry: RealizedRoiEntry): number {
  return entryNetMonthlyLift(entry) * 12;
}

/**
 * ROI multiple (net / cost). Returns Infinity when cost is 0 and lift > 0
 * (rendered as `∞×`). Returns 0 when both are 0 (no signal yet).
 */
export function entryRoiMultiple(entry: RealizedRoiEntry): number {
  const net = entryNetMonthlyLift(entry);
  if (entry.actualMonthlyCost <= 0) {
    return net > 0 ? Infinity : 0;
  }
  return net / entry.actualMonthlyCost;
}

/**
 * Gap-vs-projected classification. Compares actual NET monthly lift to
 * the midpoint of the projected monthly-lift band.
 *
 *   UNDERWIDE  — actual is below 25% of the projected midpoint
 *   UNDER      — actual is below 75% of the projected midpoint
 *   ON-TARGET  — actual is between 75% and 125% of the projected midpoint
 *   OVER       — actual is above 125% of the projected midpoint
 *
 * If projectedLow == projectedHigh == 0 (no projected signal), returns
 * "UNMEASURED".
 */
export type GapClass = "UNDERWIDE" | "UNDER" | "ON-TARGET" | "OVER" | "UNMEASURED";

export function classifyGapVsProjected(
  entry: RealizedRoiEntry,
  projectedMonthlyLiftLow: number,
  projectedMonthlyLiftHigh: number
): GapClass {
  const mid =
    projectedMonthlyLiftLow > 0 || projectedMonthlyLiftHigh > 0
      ? (projectedMonthlyLiftLow + projectedMonthlyLiftHigh) / 2
      : 0;
  if (mid <= 0) return "UNMEASURED";
  const net = entryNetMonthlyLift(entry);
  const ratio = net / mid;
  if (ratio < 0.25) return "UNDERWIDE";
  if (ratio < 0.75) return "UNDER";
  if (ratio <= 1.25) return "ON-TARGET";
  return "OVER";
}

/** Signed gap: actualNet − projectedMidpoint. NaN-guarded. */
export function gapVsProjected(
  entry: RealizedRoiEntry,
  projectedMonthlyLiftLow: number,
  projectedMonthlyLiftHigh: number
): number {
  const mid =
    projectedMonthlyLiftLow > 0 || projectedMonthlyLiftHigh > 0
      ? (projectedMonthlyLiftLow + projectedMonthlyLiftHigh) / 2
      : 0;
  return entryNetMonthlyLift(entry) - mid;
}

export interface AggregateLedgerStats {
  entriesLogged: number;
  totalMonthlyRevenueLift: number;
  totalMonthlyCost: number;
  totalNetMonthlyLift: number;
  totalAnnualizedLift: number;
  totalOrdersLift: number;
  /** Average ROI multiple across entries with cost > 0. */
  avgRoiMultiple: number;
  byConfidence: Record<ConfidenceLevel, number>;
  byGap: Record<GapClass, number>;
  /** Sum of absolute gaps (operator-vs-project difference). */
  totalGapMagnitude: number;
}

export function aggregateLedger(
  ledger: RealizedRoiLedger
): AggregateLedgerStats {
  const entries = Object.values(ledger);
  const stats: AggregateLedgerStats = {
    entriesLogged: entries.length,
    totalMonthlyRevenueLift: 0,
    totalMonthlyCost: 0,
    totalNetMonthlyLift: 0,
    totalAnnualizedLift: 0,
    totalOrdersLift: 0,
    avgRoiMultiple: 0,
    byConfidence: { low: 0, medium: 0, high: 0 },
    byGap: { UNDERWIDE: 0, UNDER: 0, "ON-TARGET": 0, OVER: 0, UNMEASURED: 0 },
    totalGapMagnitude: 0,
  };
  if (entries.length === 0) return stats;
  let roiSum = 0;
  let roiCount = 0;
  for (const e of entries) {
    stats.totalMonthlyRevenueLift += e.actualMonthlyRevenueLift;
    stats.totalMonthlyCost += e.actualMonthlyCost;
    stats.totalNetMonthlyLift += entryNetMonthlyLift(e);
    stats.totalAnnualizedLift += entryAnnualizedLift(e);
    stats.totalOrdersLift += e.actualMonthlyOrdersLift;
    stats.byConfidence[e.confidence] += 1;
    const multiple = entryRoiMultiple(e);
    if (Number.isFinite(multiple)) {
      roiSum += multiple;
      roiCount += 1;
    }
  }
  stats.avgRoiMultiple = roiCount > 0 ? roiSum / roiCount : 0;
  return stats;
}

export interface FormattedLedgerEntry {
  playbookId: string;
  netMonthly: number;
  annualized: number;
  roiMultipleLabel: string; // "8.4×" or "∞×"
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  updatedDaysAgo: number;
  loggedDaysAgo: number;
  windowDays: number;
}

/** Render-side labels for the ROI multiple — handles Infinity cleanly. */
export function formatRoiMultiple(multiple: number): string {
  if (!Number.isFinite(multiple)) return multiple > 0 ? "∞×" : "—";
  if (multiple < 0) return `${multiple.toFixed(1)}×`;
  return `${multiple.toFixed(1)}×`;
}

export function confidenceLabel(conf: ConfidenceLevel): string {
  switch (conf) {
    case "low":
      return "Low conf.";
    case "medium":
      return "Medium conf.";
    case "high":
      return "High conf.";
    default:
      return conf;
  }
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  const diffMs = now.getTime() - t;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Markdown export — paste-ready standup block. One line per logged entry,
 * grouped by gap classification (under-at-risk first → on-target → over).
 *
 * Format:
 *   # Realized ROI ledger — <ISO date>
 *   X entries · $Y net monthly · Z× average ROI
 *   ## UNDERWIDE (N)
 *   - <playbookId> — $net/mo · Z× · <conf> · updated N d ago
 *   ...
 */
export function ledgerToMarkdown(
  ledger: RealizedRoiLedger,
  now: Date = new Date(),
  resolveTitle?: (playbookId: string) => string | undefined
): string {
  const ids = Object.keys(ledger);
  if (ids.length === 0) {
    return `# Realized ROI ledger — ${now.toISOString().slice(0, 10)}\n\nNo actuals logged yet. Log per-playbook revenue lift on each shipped playbook page.`;
  }
  const stats = aggregateLedger(ledger);
  const lines: string[] = [];
  lines.push(`# Realized ROI ledger — ${now.toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push(
    `${stats.entriesLogged} entries · $${formatThousands(
      stats.totalNetMonthlyLift
    )} net monthly · ${formatThousands(stats.totalAnnualizedLift)} annualized`
  );
  lines.push("");
  const groups: GapClass[] = ["UNDERWIDE", "UNDER", "ON-TARGET", "OVER", "UNMEASURED"];
  for (const g of groups) {
    const entries = ids
      .filter((id) => stats.byGap[g] !== undefined)
      .map((id) => ({ id, entry: ledger[id] }))
      .filter((row) => classifyGapVsProjected(row.entry, 0, 0) === g);
    if (entries.length === 0) continue;
    lines.push(`## ${g} (${entries.length})`);
    for (const { id, entry } of entries) {
      const title = resolveTitle?.(id) ?? id;
      const roi = formatRoiMultiple(entryRoiMultiple(entry));
      const updated = daysSince(entry.updatedAt, now);
      lines.push(
        `- **${title}** (\`${id}\`) — $${formatThousands(
          entryNetMonthlyLift(entry)
        )}/mo · ${roi} · ${confidenceLabel(entry.confidence)} · updated ${updated}d ago`
      );
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}

function formatThousands(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  return rounded.toLocaleString("en-US");
}

/**
 * CSV export — paste-ready for spreadsheet import.
 * Columns: playbook_id, actual_monthly_revenue_lift, actual_monthly_cost,
 * actual_monthly_orders_lift, measurement_window_days, confidence,
 * net_monthly_lift, annualized_lift, roi_multiple, notes (quoted),
 * logged_at, updated_at.
 */
export function ledgerToCsv(
  ledger: RealizedRoiLedger,
  resolveTitle?: (playbookId: string) => string | undefined
): string {
  const header = [
    "playbook_id",
    "playbook_title",
    "actual_monthly_revenue_lift_usd",
    "actual_monthly_cost_usd",
    "actual_monthly_orders_lift",
    "measurement_window_days",
    "confidence",
    "net_monthly_lift_usd",
    "annualized_lift_usd",
    "roi_multiple",
    "notes",
    "logged_at",
    "updated_at",
  ];
  const rows: string[][] = [header];
  for (const id of Object.keys(ledger)) {
    const e = ledger[id];
    const net = entryNetMonthlyLift(e);
    const annual = entryAnnualizedLift(e);
    const roi = entryRoiMultiple(e);
    rows.push([
      id,
      resolveTitle?.(id) ?? "",
      e.actualMonthlyRevenueLift.toFixed(2),
      e.actualMonthlyCost.toFixed(2),
      e.actualMonthlyOrdersLift.toFixed(0),
      e.measurementWindowDays.toFixed(0),
      e.confidence,
      net.toFixed(2),
      annual.toFixed(2),
      Number.isFinite(roi) ? roi.toFixed(2) : "inf",
      csvEscape(e.notes),
      e.loggedAt,
      e.updatedAt,
    ]);
  }
  return rows.map((r) => r.join(",")).join("\n") + "\n";
}

function csvEscape(s: string): string {
  if (!s) return "";
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Snapshot — for the compact rollup on `/`. */
export interface LedgerSnapshot {
  entriesLogged: number;
  netMonthly: number;
  annualized: number;
  roiMultipleLabel: string;
  underperforming: number;
  onTarget: number;
  overperforming: number;
}

export function ledgerSnapshot(
  ledger: RealizedRoiLedger
): LedgerSnapshot {
  const stats = aggregateLedger(ledger);
  // Use 0/0 projected so UNMEASURED doesn't dominate; use the per-entry
  // gap classification instead via classifyGapVsProjected with sentinel 0/0.
  let underperforming = 0;
  let onTarget = 0;
  let overperforming = 0;
  for (const id of Object.keys(ledger)) {
    const g = classifyGapVsProjected(ledger[id], 0, 0);
    if (g === "UNDERWIDE" || g === "UNDER") underperforming += 1;
    else if (g === "ON-TARGET") onTarget += 1;
    else if (g === "OVER") overperforming += 1;
    // UNMEASURED entries don't move the count — they have no projection to gap against.
  }
  return {
    entriesLogged: stats.entriesLogged,
    netMonthly: stats.totalNetMonthlyLift,
    annualized: stats.totalAnnualizedLift,
    roiMultipleLabel: formatRoiMultiple(stats.avgRoiMultiple),
    underperforming,
    onTarget,
    overperforming,
  };
}