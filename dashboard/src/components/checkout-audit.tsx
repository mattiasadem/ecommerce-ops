"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AuditStatus,
  AuditResult,
  CHECKOUT_GUIDELINES,
  CheckoutFix,
  CheckoutGuideline,
  SECTION_TITLES,
  SEVERITY_WEIGHT,
  Severity,
  healthBandTag,
  scoreAudit,
} from "@/lib/checkout-audit";
import {
  YOUR_STORE_DEFAULTS,
  YOUR_STORE_STORAGE_KEY,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { formatUsd, formatInt, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Interactive Baymard 24-Guideline Checkout Audit.
 *
 * Operator walks all 24 Baymard guidelines, marks each as pass / partial /
 * fail / skip. Scoring runs on every change (instant feedback). State is
 * persisted to localStorage so the audit survives reloads. At the end, the
 * panel shows:
 *   - Baymard 0–100 score + health band
 *   - Per-severity CVR lift estimate (low..high, capped at +80%)
 *   - Prioritized fix-list (Severity L first)
 *   - Copy-paste Markdown report (for sharing with team)
 *
 * Scoring math is identical to `scripts/checkout_audit_score.py` so an
 * operator can hand off an in-browser audit and re-run it through the CLI.
 */

const STORAGE_KEY = "ecom-ops:cro:checkout-audit:v1";

type AuditInputs = Record<string, { status: AuditStatus; notes?: string }>;

const STATUS_OPTIONS: Array<{
  status: AuditStatus;
  label: string;
  tone: "pass" | "partial" | "fail" | "skip";
}> = [
  { status: "pass",    label: "Pass",    tone: "pass" },
  { status: "partial", label: "Partial", tone: "partial" },
  { status: "fail",    label: "Fail",    tone: "fail" },
  { status: "skip",    label: "Skip",    tone: "skip" },
];

const TONE_STYLES: Record<string, string> = {
  pass:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
  fail:    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20",
  skip:    "border-border bg-muted text-muted-foreground hover:bg-muted/80",
  activePass:    "border-emerald-500 bg-emerald-500 text-white shadow-sm",
  activePartial: "border-amber-500 bg-amber-500 text-white shadow-sm",
  activeFail:    "border-rose-500 bg-rose-500 text-white shadow-sm",
  activeSkip:    "border-foreground bg-foreground text-background shadow-sm",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  L: "L · ship first",
  M: "M · medium",
  S: "S · polish",
  E: "E · verify",
};

const SEVERITY_TONE: Record<Severity, string> = {
  L: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  M: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  S: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  E: "border-border bg-muted text-muted-foreground",
};

function loadStored(): AuditInputs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as AuditInputs;
  } catch {
    /* ignore */
  }
  return {};
}

function storeInputs(inputs: AuditInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private-mode */
  }
}

export function CheckoutAudit() {
  const [inputs, setInputs] = useState<AuditInputs>({});
  const [hydrated, setHydrated] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [store, setStore] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [storeIsLive, setStoreIsLive] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setInputs(loadStored());
    const loadedStore = loadYourStore();
    if (loadedStore) {
      setStore(loadedStore);
      setStoreIsLive(true);
    }
    setHydrated(true);
  }, []);

  // Listen for cross-tab / cross-card edits to Your-store so the
  // personalized lift panel re-projects when the operator updates
  // their numbers on Overview.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === YOUR_STORE_STORAGE_KEY) {
        const refreshed = loadYourStore();
        if (refreshed) {
          setStore(refreshed);
          setStoreIsLive(true);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const result = useMemo(() => scoreAudit(inputs), [inputs]);

  const setStatus = (id: string, status: AuditStatus) => {
    setInputs((prev) => {
      const next = { ...prev };
      if (status === "fail" || status === undefined) {
        // Treat explicit fail as default — store the explicit status but
        // also allow "unset" semantics by removing the key on a fail click
        // that is the current status. We store explicit statuses only.
      }
      next[id] = { ...(next[id] ?? {}), status };
      return next;
    });
  };

  const setNotes = (id: string, notes: string) => {
    setInputs((prev) => {
      const next = { ...prev };
      next[id] = { ...(next[id] ?? { status: "fail" as AuditStatus }), notes };
      return next;
    });
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset all 24 audit answers? This clears your saved progress."
      );
      if (!ok) return;
    }
    setInputs({});
  };

  const fillAllPass = () => {
    const next: AuditInputs = {};
    for (const g of CHECKOUT_GUIDELINES) {
      next[g.id] = { status: "pass" };
    }
    setInputs(next);
  };

  const copyReport = async () => {
    const md = renderMarkdown(result, store, storeIsLive);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 1500);
    } catch {
      setReportCopied(false);
    }
  };

  // Group by section for the form.
  const grouped = useMemo(() => {
    const map: Record<string, CheckoutGuideline[]> = {};
    for (const g of CHECKOUT_GUIDELINES) {
      if (!map[g.section]) map[g.section] = [];
      map[g.section].push(g);
    }
    return map;
  }, []);

  const auditedCount = result.passCount + result.partialCount + result.failCount + result.skipCount;

  return (
    <div className="flex flex-col gap-4">
      <ScoreStrip result={result} auditedCount={auditedCount} />

      <PersonalizedLiftPanel result={result} store={store} storeIsLive={storeIsLive} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Reset all
        </button>
        <button
          type="button"
          onClick={fillAllPass}
          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Fill all-pass (smoke test)
        </button>
        <button
          type="button"
          onClick={copyReport}
          className={cn(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            reportCopied
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          {reportCopied ? "Copied report" : "Copy Markdown report"}
        </button>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
          Auto-saved · {hydrated ? `${auditedCount}/${result.totalGuidelines} audited` : "loading…"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {(["A", "B", "C", "D", "E"] as const).map((section) => (
          <section
            key={section}
            className="rounded-xl border border-border bg-card p-4"
          >
            <header className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Section {section} — {SECTION_TITLES[section]}
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {(grouped[section] ?? []).length} items
              </span>
            </header>
            <div className="flex flex-col gap-2.5">
              {(grouped[section] ?? []).map((g) => {
                const entry = inputs[g.id];
                const status = entry?.status;
                return (
                  <div
                    key={g.id}
                    className="rounded-lg border border-border bg-background/40 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                          SEVERITY_TONE[g.severity]
                        )}
                      >
                        {SEVERITY_LABEL[g.severity]}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium leading-tight">
                          {g.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {g.prompt}
                        </div>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
                        lift +{(g.liftLow * 100).toFixed(1)}–{(g.liftHigh * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {STATUS_OPTIONS.map((opt) => {
                        const active = status === opt.status;
                        const activeStyle =
                          opt.tone === "pass"    ? TONE_STYLES.activePass    :
                          opt.tone === "partial" ? TONE_STYLES.activePartial :
                          opt.tone === "fail"    ? TONE_STYLES.activeFail    :
                                                    TONE_STYLES.activeSkip;
                        return (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => setStatus(g.id, opt.status)}
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                              active ? activeStyle : TONE_STYLES[opt.tone]
                            )}
                            aria-pressed={active}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      <NotesField
                        id={g.id}
                        value={entry?.notes ?? ""}
                        onChange={(v) => setNotes(g.id, v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <FixList result={result} store={store} />
    </div>
  );
}

function PersonalizedLiftPanel({
  result,
  store,
  storeIsLive,
}: {
  result: AuditResult;
  store: YourStoreInputs;
  storeIsLive: boolean;
}) {
  const monthlyRevenue = store.aov * store.monthlyOrders;
  const dollarsLow = Math.round(monthlyRevenue * result.cvrLiftLow);
  const dollarsHigh = Math.round(monthlyRevenue * result.cvrLiftHigh);
  const annualDollarsLow = dollarsLow * 12;
  const annualDollarsHigh = dollarsHigh * 12;
  const marginDollarsLow = Math.round(dollarsLow * store.grossMargin);
  const marginDollarsHigh = Math.round(dollarsHigh * store.grossMargin);

  // A non-trivial personalized lift is anything ≥ $1,000/mo — below that the
  // percentage reads as noise and the operator's mental model ("this fix is
  // worth $X") is what carries the tick.
  const hasLift = storeIsLive && dollarsHigh >= 1000;

  return (
    <div
      id="personalized-lift"
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-3",
        hasLift
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-card"
      )}
    >
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">
            Personalized lift · tied to Your-store
          </h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
              hasLift
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            {hasLift ? "Live numbers" : "Industry-median default"}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Source · {hasLift ? "Your-store" : "YOUR_STORE_DEFAULTS"}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AOV × orders/mo
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            {formatUsd(store.aov)} × {formatInt(store.monthlyOrders)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            = {formatUsd(monthlyRevenue)}/mo gross
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            CVR lift band
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            +{(result.cvrLiftLow * 100).toFixed(1)}–{(result.cvrLiftHigh * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            capped at +80% per playbook
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Projected $ lift / mo
          </div>
          <div className="text-xl font-semibold tabular-nums text-accent mt-0.5">
            {formatUsd(dollarsLow)}–{formatUsd(dollarsHigh)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            / yr {formatUsd(annualDollarsLow)}–{formatUsd(annualDollarsHigh)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net margin $ / mo
          </div>
          <div className="text-xl font-semibold tabular-nums mt-0.5">
            {formatUsd(marginDollarsLow)}–{formatUsd(marginDollarsHigh)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            at {formatPercent(store.grossMargin, 0)} gross margin
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {hasLift ? (
          <>
            Apply the audit's{" "}
            <span className="text-foreground font-semibold">
              +{(result.cvrLiftLow * 100).toFixed(1)}–{(result.cvrLiftHigh * 100).toFixed(1)}% CVR lift band
            </span>{" "}
            to Your-store's{" "}
            <span className="text-foreground font-semibold">
              {formatUsd(monthlyRevenue)}/mo gross
            </span>{" "}
            (AOV {formatUsd(store.aov)} × {formatInt(store.monthlyOrders)} orders). Edit Your-store
            on Overview to see this number change in real time. Numbers project the
            audit's full cumulative lift — ship the Severity L fixes from the list
            below in order and re-audit in 30 days.
          </>
        ) : (
          <>
            The audit's projected CVR lift is currently below{" "}
            <span className="text-foreground font-semibold">$1,000/mo</span> on the
            defaults. Set Your-store on Overview (or run the audit on a non-pass
            item) to see the dollar projection. Industry medians: AOV{" "}
            {formatUsd(YOUR_STORE_DEFAULTS.aov)} ×{" "}
            {formatInt(YOUR_STORE_DEFAULTS.monthlyOrders)} orders/mo ×{" "}
            {formatPercent(YOUR_STORE_DEFAULTS.grossMargin, 0)} margin.
          </>
        )}
      </p>
    </div>
  );
}

function ScoreStrip({ result, auditedCount }: { result: AuditResult; auditedCount: number }) {
  const tag = healthBandTag(result.healthBand);
  const tone =
    tag === "top_tier" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
    tag === "great"    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" :
    tag === "good"     ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300" :
    tag === "fair"     ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" :
    tag === "weak"     ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300" :
                          "border-border bg-muted text-muted-foreground";

  const liftPctLow = (result.cvrLiftLow * 100).toFixed(1);
  const liftPctHigh = (result.cvrLiftHigh * 100).toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Baymard score
        </div>
        <div className="text-3xl font-semibold tabular-nums">
          {result.score}<span className="text-base text-muted-foreground">/100</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {auditedCount} of {result.totalGuidelines} audited
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Health band
        </div>
        <div className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-semibold mt-1", tone)}>
          {result.healthBand}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Pass / partial / fail
        </div>
        <div className="text-xl font-semibold tabular-nums mt-1">
          <span className="text-emerald-600 dark:text-emerald-400">{result.passCount}</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="text-amber-600 dark:text-amber-400">{result.partialCount}</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="text-rose-600 dark:text-rose-400">{result.failCount}</span>
          {result.skipCount > 0 && (
            <>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-muted-foreground">{result.skipCount} skip</span>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {result.weightedPoints.toFixed(1)} / {result.maxPossiblePoints.toFixed(1)} weighted pts
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Estimated CVR lift
        </div>
        <div className="text-2xl font-semibold tabular-nums text-accent mt-1">
          +{liftPctLow}–{liftPctHigh}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          capped at +80% (rest is cart/PDP work)
        </div>
      </div>
    </div>
  );
}

function NotesField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Notes (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ml-auto w-full max-w-[14rem] rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
      aria-label={`Notes for ${id}`}
    />
  );
}

function FixList({ result, store }: { result: AuditResult; store: YourStoreInputs }) {
  const monthlyRevenue = store.aov * store.monthlyOrders;
  const projectedDollars = (lift: number) => Math.round(monthlyRevenue * lift);

  if (result.prioritizedFixes.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
        <strong className="font-semibold">All audits pass.</strong>{" "}
        Your checkout is in Baymard best-in-class territory. Re-audit in 90 days or
        after any major checkout-flow change.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold">
          Prioritized fix-list ({result.prioritizedFixes.length})
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Severity L first
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            $ tied to {formatUsd(store.aov)} AOV × {formatInt(store.monthlyOrders)} orders/mo
          </span>
        </div>
      </header>
      <ol className="flex flex-col gap-2 list-none">
        {result.prioritizedFixes.map((fix, i) => {
          const dollarsLow = projectedDollars(fix.liftLow);
          const dollarsHigh = projectedDollars(fix.liftHigh);
          return (
            <li
              key={fix.id}
              className="rounded-lg border border-border bg-background/40 p-3 flex items-start gap-3"
            >
              <span className="text-[10px] tabular-nums font-semibold text-muted-foreground w-5 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                  SEVERITY_TONE[fix.severity]
                )}
              >
                {SEVERITY_LABEL[fix.severity]}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium leading-tight">
                  {fix.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{fix.id}</span>
                  {fix.notes ? (
                    <span className="ml-2 italic">— {fix.notes}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  +{(fix.liftLow * 100).toFixed(1)}–{(fix.liftHigh * 100).toFixed(1)}% lift
                </span>
                <span className="text-[11px] tabular-nums font-semibold text-accent">
                  {formatUsd(dollarsLow)}–{formatUsd(dollarsHigh)}/mo
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function renderMarkdown(
  result: AuditResult,
  store: YourStoreInputs = YOUR_STORE_DEFAULTS,
  storeIsLive: boolean = false
): string {
  const monthlyRevenue = store.aov * store.monthlyOrders;
  const dollarsLow = Math.round(monthlyRevenue * result.cvrLiftLow);
  const dollarsHigh = Math.round(monthlyRevenue * result.cvrLiftHigh);
  const marginDollarsLow = Math.round(dollarsLow * store.grossMargin);
  const marginDollarsHigh = Math.round(dollarsHigh * store.grossMargin);
  const storeSource = storeIsLive ? "Your-store" : "defaults";

  const lines: string[] = [];
  lines.push("# Checkout Audit — Baymard 24-Guideline Score");
  lines.push("");
  lines.push(`**Score:** ${result.score} / 100`);
  lines.push(`**Health band:** ${result.healthBand}`);
  lines.push(`**Counts:** pass=${result.passCount} partial=${result.partialCount} fail=${result.failCount} skip=${result.skipCount} missing=${result.missingCount}`);
  lines.push(`**Estimated CVR lift:** +${(result.cvrLiftLow * 100).toFixed(1)}–${(result.cvrLiftHigh * 100).toFixed(1)}% (capped at +80%)`);
  lines.push(`**Personalized $-lift (from ${storeSource}):** AOV $${store.aov} × ${store.monthlyOrders} orders/mo = $${monthlyRevenue.toLocaleString()}/mo gross → **+$${dollarsLow.toLocaleString()}–$${dollarsHigh.toLocaleString()}/mo** ($${marginDollarsLow.toLocaleString()}–$${marginDollarsHigh.toLocaleString()}/mo net at ${(store.grossMargin * 100).toFixed(0)}% margin)`);
  lines.push("");
  if (result.prioritizedFixes.length === 0) {
    lines.push("All audits pass — checkout is in Baymard best-in-class territory.");
  } else {
    lines.push("## Prioritized fix-list");
    result.prioritizedFixes.forEach((fix, i) => {
      const fixDollarsLow = Math.round(monthlyRevenue * fix.liftLow);
      const fixDollarsHigh = Math.round(monthlyRevenue * fix.liftHigh);
      lines.push(`${i + 1}. **[${fix.severity}] ${fix.title}** (\`${fix.id}\`) — +${(fix.liftLow * 100).toFixed(1)}–${(fix.liftHigh * 100).toFixed(1)}% lift · $${fixDollarsLow.toLocaleString()}–$${fixDollarsHigh.toLocaleString()}/mo · current=${fix.currentStatus}${fix.notes ? ` · "${fix.notes}"` : ""}`);
    });
  }
  lines.push("");
  lines.push(`_Generated ${new Date().toISOString()} from ecommerce-ops-dashboard /cro checkout audit._`);
  return lines.join("\n");
}