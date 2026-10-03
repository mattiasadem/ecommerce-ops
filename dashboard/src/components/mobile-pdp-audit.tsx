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
  AuditStatus,
  HEALTH_BANDS,
  MOBILE_PDP_DEFAULTS,
  MobilePdpAuditInputs,
  MobilePdpAuditResult,
  MobilePdpGuideline,
  MobilePdpRevenueForecast,
  MobilePdpStatusMap,
  MOBILE_PDP_GUIDELINES,
  Severity,
  STEP_LABELS,
  forecastMobilePdpRevenue,
  groupFixesByStep,
  renderMobilePdpAuditMarkdown,
  scoreMobilePdpAudit,
} from "@/lib/mobile-pdp-audit";
import { YOUR_STORE_DEFAULTS, YourStoreInputs, loadYourStore } from "@/lib/your-store";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:playbooks:mobile-pdp-audit:v1";
const INPUTS_KEY = "ecom-ops:playbooks:mobile-pdp-audit-inputs:v1";

const STATUS_OPTIONS: Array<{ status: AuditStatus; label: string; tone: string }> = [
  { status: "pass", label: "Pass", tone: "pass" },
  { status: "partial", label: "Partial", tone: "partial" },
  { status: "fail", label: "Fail", tone: "fail" },
  { status: "skip", label: "Skip", tone: "skip" },
];

const TONE_STYLES: Record<string, string> = {
  pass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
  fail: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20",
  skip: "border-border bg-muted text-muted-foreground hover:bg-muted/80",
  activePass: "border-emerald-500 bg-emerald-500 text-white shadow-sm",
  activePartial: "border-amber-500 bg-amber-500 text-white shadow-sm",
  activeFail: "border-rose-500 bg-rose-500 text-white shadow-sm",
  activeSkip: "border-foreground bg-foreground text-background shadow-sm",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  L: "L · ship first",
  M: "M · medium",
  S: "S · polish",
};

const SEVERITY_TONE: Record<Severity, string> = {
  L: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  M: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  S: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

type StatusMap = Record<string, { status: AuditStatus; notes?: string }>;

function loadStoredStatuses(): StatusMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as StatusMap;
  } catch {
    /* ignore */
  }
  return {};
}

function storeStatuses(s: StatusMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("ecom-ops:playbooks:mobile-pdp-audit:update"));
  } catch {
    /* quota / private-mode */
  }
}

function loadStoredInputs(): MobilePdpAuditInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INPUTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as MobilePdpAuditInputs;
  } catch {
    return null;
  }
}

function storeInputs(i: MobilePdpAuditInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INPUTS_KEY, JSON.stringify(i));
  } catch {
    /* quota / private-mode */
  }
}

function toStatusMap(s: StatusMap): MobilePdpStatusMap {
  const out: MobilePdpStatusMap = {};
  for (const [k, v] of Object.entries(s)) {
    if (v && typeof v === "object" && v.status) out[k] = v.status;
  }
  return out;
}

export function MobilePdpAudit() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [inputs, setInputs] = useState<MobilePdpAuditInputs>(MOBILE_PDP_DEFAULTS);
  const [store, setStore] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [storeIsLive, setStoreIsLive] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount + listen for cross-tab edits.
  // Stored inputs (operator's local edits) win over Your-store defaults
  // so explicit edits survive reloads — same canonical pattern as the
  // abandoned-cart / welcome-series / 3PL / PDP A/B / TikTok calculators.
  useEffect(() => {
    const loadedStatuses = loadStoredStatuses();
    setStatuses(loadedStatuses);
    const loadedInputs = loadStoredInputs();
    if (loadedInputs) {
      setInputs(loadedInputs);
      setFromYourStore(false);
    } else {
      const loadedStore = loadYourStore();
      if (loadedStore) {
        setStore(loadedStore);
        setStoreIsLive(true);
        setFromYourStore(true);
      }
    }
    setHydrated(true);

    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStatuses(loadStoredStatuses());
      } else if (e.key === INPUTS_KEY) {
        const i = loadStoredInputs();
        if (i) {
          setInputs(i);
          setFromYourStore(false);
        }
      } else if (e.key === "ecom-ops:your-store:v1") {
        const refreshed = loadYourStore();
        if (refreshed) {
          setStore(refreshed);
          setStoreIsLive(true);
          if (!loadStoredInputs()) setFromYourStore(true);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    storeStatuses(statuses);
  }, [statuses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const result: MobilePdpAuditResult = useMemo(
    () => scoreMobilePdpAudit(toStatusMap(statuses)),
    [statuses],
  );

  const forecast: MobilePdpRevenueForecast = useMemo(
    () => forecastMobilePdpRevenue(inputs, result),
    [inputs, result],
  );

  const setStatus = (id: string, status: AuditStatus) => {
    setStatuses((prev) => {
      const next = { ...prev };
      const prevEntry = next[id];
      // If clicking the currently-active status, clear it (toggle off).
      if (prevEntry?.status === status) {
        delete next[id];
      } else {
        next[id] = { ...(prevEntry ?? {}), status };
      }
      return next;
    });
  };

  const setNotes = (id: string, notes: string) => {
    setStatuses((prev) => {
      const next = { ...prev };
      next[id] = { ...(next[id] ?? { status: "fail" as AuditStatus }), notes };
      return next;
    });
  };

  const setInput = (key: keyof MobilePdpAuditInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(value) ? value : 0 }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset all 18 audit answers + inputs? This clears your saved progress.",
      );
      if (!ok) return;
    }
    setStatuses({});
    setInputs(MOBILE_PDP_DEFAULTS);
    setFromYourStore(false);
  };

  const fillAllPass = () => {
    const next: StatusMap = {};
    for (const g of MOBILE_PDP_GUIDELINES) {
      next[g.id] = { status: "pass" };
    }
    setStatuses(next);
  };

  const copyReport = async () => {
    const md = renderMobilePdpAuditMarkdown(result, inputs, forecast);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
    } catch {
      /* silent */
    }
  };

  // Group guidelines by step for the form.
  const groupedByStep = useMemo(() => {
    const map: Record<number, MobilePdpGuideline[]> = {};
    for (const g of MOBILE_PDP_GUIDELINES) {
      if (!map[g.step]) map[g.step] = [];
      map[g.step].push(g);
    }
    return map;
  }, []);

  const auditedCount =
    result.passCount + result.partialCount + result.failCount + result.skipCount;
  const fixGroups = groupFixesByStep(result.prioritizedFixes);

  // Health band color
  const bandInfo = HEALTH_BANDS.find((b) => b.short === result.healthBandShort);

  return (
    <div className="flex flex-col gap-4">
      <ScoreStrip result={result} auditedCount={auditedCount} />

      {fromYourStore && hydrated && (
        <div
          data-testid="mobile-pdp-audit-ys-badge"
          className="inline-flex items-center gap-1 self-start rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Prefilled from Your store on Overview
        </div>
      )}

      <OperatorInputsPanel
        inputs={inputs}
        onChange={setInput}
        store={store}
        storeIsLive={storeIsLive}
      />

      <ForecastPanel result={result} forecast={forecast} />

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
          className="inline-flex items-center rounded-md border border-accent bg-accent text-accent-foreground hover:bg-accent/90 px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Copy Markdown report
        </button>
        <CopyButton
          value={renderMobilePdpAuditMarkdown(result, inputs, forecast)}
          label="Copy report"
          className="hidden"
        />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
          Auto-saved · {hydrated ? `${auditedCount}/${result.totalGuidelines} audited` : "loading…"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {([1, 2, 3, 4, 5, 6, 7] as const).map((step) => {
          const items = groupedByStep[step] ?? [];
          return (
            <section
              key={step}
              className="rounded-xl border border-border bg-card p-4"
            >
              <header className="flex items-baseline justify-between mb-3">
                <h3 className="text-sm font-semibold">{STEP_LABELS[step]}</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </header>
              <div className="flex flex-col gap-2.5">
                {items.map((g) => {
                  const entry = statuses[g.id];
                  const status = entry?.status;
                  return (
                    <GuidelineRow
                      key={g.id}
                      guideline={g}
                      status={status}
                      notes={entry?.notes}
                      onStatus={(s) => setStatus(g.id, s)}
                      onNotes={(n) => setNotes(g.id, n)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {result.prioritizedFixes.length > 0 && (
        <FixListPanel fixGroups={fixGroups} />
      )}

      <BandDescription bandInfo={bandInfo} score={result.score} />
    </div>
  );
}

function ScoreStrip({
  result,
  auditedCount,
}: {
  result: MobilePdpAuditResult;
  auditedCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Mobile-PDP readiness score
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {result.score}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/100</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{result.healthBand}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Counts
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {result.passCount}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {auditedCount}/{result.totalGuidelines}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {result.partialCount} partial · {result.failCount} fail · {result.skipCount} skip
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Projected absolute mobile CVR lift
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            +{result.cvrLiftLowPct.toFixed(2)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              to +{result.cvrLiftHighPct.toFixed(2)} pts
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            capped at +1.5 pts (beyond is checkout, not PDP)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-[10px] uppercase tracking-wider">
            Weighted points
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {result.weightedPoints.toFixed(0)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {result.maxPossiblePoints.toFixed(0)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            L=5 · M=3 · S=1 severity weighting
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OperatorInputsPanel({
  inputs,
  onChange,
  store,
  storeIsLive,
}: {
  inputs: MobilePdpAuditInputs;
  onChange: (key: keyof MobilePdpAuditInputs, value: number) => void;
  store: YourStoreInputs;
  storeIsLive: boolean;
}) {
  const useStore = storeIsLive && store.aov > 0;
  const effectiveAov = useStore ? store.aov : inputs.aov;
  const effectiveMargin = useStore ? store.grossMargin : inputs.grossMargin;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Your numbers</CardTitle>
        <CardDescription className="text-xs">
          Inputs personalize the projected $ impact.{" "}
          {storeIsLive ? (
            <span className="text-emerald-700 dark:text-emerald-300">
              AOV + margin auto-loaded from Your-store on Overview
            </span>
          ) : (
            <span>
              Visit{" "}
              <a className="underline" href="/">
                Overview
              </a>{" "}
              to auto-fill AOV + margin from Your-store.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <NumberField
            label="Current mobile CVR (%)"
            value={inputs.currentMobileCvr * 100}
            step={0.01}
            min={0}
            max={20}
            onChange={(v) => onChange("currentMobileCvr", v / 100)}
            hint="Triple Whale Devices → Mobile"
          />
          <NumberField
            label="Monthly mobile sessions"
            value={inputs.monthlyMobileSessions}
            step={500}
            min={0}
            onChange={(v) => onChange("monthlyMobileSessions", v)}
            hint="PDP-traffic only"
          />
          <NumberField
            label="AOV ($)"
            value={effectiveAov}
            step={1}
            min={0}
            onChange={(v) => onChange("aov", v)}
            hint={useStore ? "From Your-store" : "Operator-entered"}
          />
          <NumberField
            label="Gross margin (%)"
            value={effectiveMargin * 100}
            step={1}
            min={0}
            max={100}
            onChange={(v) => onChange("grossMargin", v / 100)}
            hint={useStore ? "From Your-store" : "Operator-entered"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function NumberField({
  label,
  value,
  step,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ForecastPanel({
  result,
  forecast,
}: {
  result: MobilePdpAuditResult;
  forecast: MobilePdpRevenueForecast;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Projected $ impact</CardTitle>
        <CardDescription className="text-xs">
          Personalized against your mobile-session volume, AOV, and margin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="New mobile CVR"
            value={`${(forecast.newMobileCvrLow * 100).toFixed(2)}% → ${(forecast.newMobileCvrHigh * 100).toFixed(2)}%`}
            sub={`+${(forecast.relativeLiftLowPct * 100).toFixed(0)}% → +${(forecast.relativeLiftHighPct * 100).toFixed(0)}% relative`}
          />
          <Stat
            label="Incremental monthly revenue"
            value={`$${Math.round(forecast.incrementalMonthlyRevenueLow).toLocaleString()} → $${Math.round(forecast.incrementalMonthlyRevenueHigh).toLocaleString()}`}
            sub="Before margin"
          />
          <Stat
            label="Incremental monthly margin"
            value={`$${Math.round(forecast.incrementalMonthlyMarginLow).toLocaleString()} → $${Math.round(forecast.incrementalMonthlyMarginHigh).toLocaleString()}`}
            sub="After gross margin"
          />
          <Stat
            label="Annual incremental revenue"
            value={`$${Math.round(forecast.annualRevenueLow / 1000).toLocaleString()}k → $${Math.round(forecast.annualRevenueHigh / 1000).toLocaleString()}k`}
            sub="12-month steady-state"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

function GuidelineRow({
  guideline,
  status,
  notes,
  onStatus,
  onNotes,
}: {
  guideline: MobilePdpGuideline;
  status: AuditStatus | undefined;
  notes: string | undefined;
  onStatus: (s: AuditStatus) => void;
  onNotes: (n: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0", SEVERITY_TONE[guideline.severity])}
        >
          {SEVERITY_LABEL[guideline.severity]}
        </Badge>
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-sm font-medium text-foreground leading-tight">
            {guideline.title}
          </span>
          <span className="text-xs text-muted-foreground leading-snug">
            {guideline.prompt}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Lift +{guideline.liftLowPct.toFixed(2)} to +{guideline.liftHighPct.toFixed(2)} pts
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.status;
          const activeClass = `active${opt.tone.charAt(0).toUpperCase()}${opt.tone.slice(1)}`;
          return (
            <button
              key={opt.status}
              type="button"
              onClick={() => onStatus(opt.status)}
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                isActive ? TONE_STYLES[activeClass] : TONE_STYLES[opt.tone],
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {(status === "fail" || status === "partial") && (
        <input
          type="text"
          placeholder="Optional: what needs to ship for this to pass?"
          value={notes ?? ""}
          onChange={(e) => onNotes(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
      )}
    </div>
  );
}

function FixListPanel({ fixGroups }: { fixGroups: Record<number, ReturnType<typeof groupFixesByStep>[1]> }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Prioritized fix-list</CardTitle>
        <CardDescription className="text-xs">
          Severity L first, then M, then S. Ship in this order to maximize mobile CVR lift.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {([1, 2, 3, 4, 5, 6, 7] as const).map((step) => {
            const fixes = fixGroups[step] ?? [];
            if (fixes.length === 0) return null;
            return (
              <div key={step} className="flex flex-col gap-1.5">
                <h4 className="text-xs font-semibold text-foreground">{STEP_LABELS[step]}</h4>
                <ul className="flex flex-col gap-1">
                  {fixes.map((fix) => (
                    <li key={fix.id} className="flex items-start gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] shrink-0", SEVERITY_TONE[fix.severity])}
                      >
                        {fix.severity}
                      </Badge>
                      <span className="flex-1">
                        <span className="text-foreground">{fix.title}</span>
                        <span className="text-muted-foreground ml-1">
                          ({fix.currentStatus} · lift +{fix.liftLowPct.toFixed(2)} to +{fix.liftHighPct.toFixed(2)} pts)
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BandDescription({
  bandInfo,
  score,
}: {
  bandInfo: ReturnType<typeof HEALTH_BANDS.find>;
  score: number;
}) {
  if (!bandInfo) return null;
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Score {score} → {bandInfo.label}.</strong>{" "}
          {bandInfo.description}. The 7-gate playbook verification (PageSpeed ≥ 90, CrUX, sticky ATC test, ATC visibility, mobile CVR delta ≥ +20%, desktop CVR preserved, gallery swipe) must all be GREEN before declaring the redesign &quot;shipped&quot;.
        </p>
      </CardContent>
    </Card>
  );
}
