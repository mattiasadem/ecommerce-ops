"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildDriftRollup,
  CANONICAL_DRIFT_THRESHOLDS,
  DriftRollupInputs,
  PlatformDriftInput,
  RecentChange,
  renderDriftRollupMarkdown,
} from "@/lib/attribution-drift-rollup";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:attribution-drift-rollup:v1";
const META_SOURCE_KEY = "ecom-ops:attribution-quality-audit:v1";
const TIKTOK_SOURCE_KEY = "ecom-ops:tiktok-attribution-audit:v1";
const SNAP_SOURCE_KEY = "ecom-ops:snap-pinterest-attribution-audit:v1";
const SOURCE_KEYS = [META_SOURCE_KEY, TIKTOK_SOURCE_KEY, SNAP_SOURCE_KEY];

function emptyInputs(): DriftRollupInputs {
  return {
    platforms: [
      { id: "meta", label: "Meta + Google + GA4", currentMatchRate: 0, previousMatchRate: 0, currentCoverage: 0, previousCoverage: 0 },
      { id: "tiktok", label: "TikTok", currentMatchRate: 0, previousMatchRate: 0, currentCoverage: 0, previousCoverage: 0 },
      { id: "snap", label: "Snap + Pinterest", currentMatchRate: 0, previousMatchRate: 0, currentCoverage: 0, previousCoverage: 0 },
    ],
    recentChange: "none",
  };
}

function parseStored(key: string): Record<string, unknown> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function numberFrom(record: unknown, path: string[]): number {
  let value: unknown = record;
  for (const key of path) {
    if (!value || typeof value !== "object") return 0;
    value = (value as Record<string, unknown>)[key];
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function ratio(numerator: number, denominator: number): number {
  if (numerator <= 0 || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function readSourceCurrent(): Partial<Record<PlatformDriftInput["id"], { match: number; coverage: number }>> {
  const meta = parseStored(META_SOURCE_KEY);
  const tiktok = parseStored(TIKTOK_SOURCE_KEY);
  const snap = parseStored(SNAP_SOURCE_KEY);
  const output: Partial<Record<PlatformDriftInput["id"], { match: number; coverage: number }>> = {};

  if (meta) {
    const matched = numberFrom(meta, ["meta_capi", "matched_events"]);
    output.meta = {
      match: ratio(matched, numberFrom(meta, ["meta_capi", "expected_orders_last_7d"])),
      coverage: ratio(
        numberFrom(meta, ["meta_pixel", "pixel_fired_count"]),
        numberFrom(meta, ["meta_pixel", "expected_pageviews"]),
      ),
    };
  }
  if (tiktok) {
    const matched = numberFrom(tiktok, ["eapi", "matched_events"]);
    output.tiktok = {
      match: ratio(matched, numberFrom(tiktok, ["eapi", "expected_orders_last_7d"])),
      coverage: ratio(
        numberFrom(tiktok, ["pixel", "pixel_fired_count"]),
        numberFrom(tiktok, ["pixel", "expected_pageviews"]),
      ),
    };
  }
  if (snap) {
    const matched = numberFrom(snap, ["snapCapi", "matched_events"]);
    output.snap = {
      match: ratio(matched, numberFrom(snap, ["snapCapi", "expected_orders_last_7d"])),
      coverage: ratio(
        numberFrom(snap, ["snapPixel", "pixel_fired_count"]),
        numberFrom(snap, ["snapPixel", "expected_pageviews"]),
      ),
    };
  }
  return output;
}

function mergePersisted(value: unknown): DriftRollupInputs {
  const base = emptyInputs();
  if (!value || typeof value !== "object") return base;
  const persisted = value as Partial<DriftRollupInputs>;
  const platforms = Array.isArray(persisted.platforms) ? persisted.platforms : [];
  base.platforms = base.platforms.map((platform) => ({
    ...platform,
    ...(platforms.find((candidate) => candidate?.id === platform.id) ?? {}),
    id: platform.id,
    label: platform.label,
  }));
  if (persisted.recentChange) base.recentChange = persisted.recentChange;
  return base;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (next: number) => void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          value={value}
          onChange={(event) => onChange(Math.max(0, Math.min(100, Number(event.target.value) || 0)))}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="text-[10px] text-muted-foreground font-mono">%</span>
      </div>
    </label>
  );
}

export function AttributionDriftRollup() {
  const [inputs, setInputs] = useState<DriftRollupInputs>(() => emptyInputs());
  const [hydrated, setHydrated] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const importCurrentAudits = (base: DriftRollupInputs, overwrite = false) => {
    const current = readSourceCurrent();
    let count = 0;
    const platforms = base.platforms.map((platform) => {
      const source = current[platform.id];
      if (!source || source.match <= 0 || source.coverage <= 0) return platform;
      count += 1;
      if (!overwrite && platform.currentMatchRate > 0 && platform.currentCoverage > 0) return platform;
      return { ...platform, currentMatchRate: source.match, currentCoverage: source.coverage };
    });
    setImportedCount(count);
    return { ...base, platforms };
  };

  useEffect(() => {
    const persisted = mergePersisted(parseStored(STORAGE_KEY));
    setInputs(importCurrentAudits(persisted));
    setHydrated(true);

    const onStorage = (event: StorageEvent) => {
      if (!event.key || !SOURCE_KEYS.includes(event.key)) return;
      setInputs((previous) => importCurrentAudits(previous, true));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      /* private mode / quota */
    }
  }, [hydrated, inputs]);

  const result = useMemo(() => buildDriftRollup(inputs), [inputs]);

  const setPlatform = (id: PlatformDriftInput["id"], patch: Partial<PlatformDriftInput>) => {
    setInputs((previous) => ({
      ...previous,
      platforms: previous.platforms.map((platform) =>
        platform.id === id ? { ...platform, ...patch } : platform,
      ),
    }));
  };

  const useCurrentAsBaseline = () => {
    setInputs((previous) => ({
      ...previous,
      platforms: previous.platforms.map((platform) => ({
        ...platform,
        previousMatchRate: platform.currentMatchRate,
        previousCoverage: platform.currentCoverage,
      })),
    }));
  };

  const seedIncident = () => {
    setInputs({
      platforms: [
        { id: "meta", label: "Meta + Google + GA4", currentMatchRate: 86, previousMatchRate: 94, currentCoverage: 88, previousCoverage: 96 },
        { id: "tiktok", label: "TikTok", currentMatchRate: 78, previousMatchRate: 88, currentCoverage: 84, previousCoverage: 93 },
        { id: "snap", label: "Snap + Pinterest", currentMatchRate: 82, previousMatchRate: 84, currentCoverage: 89, previousCoverage: 90 },
      ],
      recentChange: "theme_liquid_update",
    });
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(renderDriftRollupMarkdown(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const statusClass =
    result.completePlatformCount === 0
      ? "border-border bg-card"
      : result.driftDetected
        ? "border-rose-500/40 bg-rose-500/5"
        : "border-emerald-500/40 bg-emerald-500/5";

  return (
    <section id="attribution-drift-rollup" className={cn("rounded-xl border p-5 flex flex-col gap-4", statusClass)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Interactive scorer · Move #6.8</span>
          <h2 className="text-base font-semibold">Cross-platform attribution drift rollup</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            One D1/D2/D3 incident score across Meta, TikTok, and Snap. Current metrics import from the
            persisted Move #6.5/6.6/6.7 audit cards; enter the previous weekly baseline once, then copy
            one prioritized incident report instead of triaging three alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setInputs((previous) => importCurrentAudits(previous, true))} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted">Import current audits</button>
          <button type="button" onClick={useCurrentAsBaseline} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted">Save current as baseline</button>
          <button type="button" onClick={seedIncident} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-500/20">Seed shared incident</button>
          <button type="button" onClick={copyReport} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted">{copied ? "Copied ✓" : "Copy incident report"}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-5">
        <div><span className="text-[10px] uppercase text-muted-foreground">Health score</span><div className="text-xl font-semibold tabular-nums">{result.healthScore ?? "—"}{result.healthScore !== null && <span className="text-xs font-normal text-muted-foreground">/100</span>}</div></div>
        <div><span className="text-[10px] uppercase text-muted-foreground">Status</span><div className={cn("text-xl font-semibold", result.driftDetected ? "text-rose-600" : result.completePlatformCount ? "text-emerald-600" : "text-muted-foreground")}>{result.completePlatformCount === 0 ? "INCOMPLETE" : result.driftDetected ? "DRIFT" : "STABLE"}</div></div>
        <div><span className="text-[10px] uppercase text-muted-foreground">Max match drift</span><div className="text-xl font-semibold tabular-nums">{result.maxMatchRateDriftPp.toFixed(1)}pp</div></div>
        <div><span className="text-[10px] uppercase text-muted-foreground">Max coverage drift</span><div className="text-xl font-semibold tabular-nums">{result.maxCoverageDriftPp.toFixed(1)}pp</div></div>
        <div><span className="text-[10px] uppercase text-muted-foreground">Source imports</span><div className="text-xl font-semibold tabular-nums">{importedCount}/3</div><span className="text-[10px] text-muted-foreground">audit snapshots found</span></div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {result.gates.map((gate) => (
          <div key={gate.id} className={cn("rounded-lg border p-3", gate.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5")}>
            <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-semibold">{gate.id}</span><span className={cn("text-[10px] font-semibold", gate.passed ? "text-emerald-600" : "text-rose-600")}>{gate.passed ? "PASS" : "FAIL"}</span></div>
            <p className="mt-1 text-xs font-medium">{gate.label}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Observed {gate.value.toFixed(1)}{gate.unit === "pp" ? "pp" : ""} · threshold ≤ {gate.threshold}{gate.unit === "pp" ? "pp" : " platform"}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
        {inputs.platforms.map((platform) => {
          const scored = result.platforms.find((candidate) => candidate.id === platform.id)!;
          return (
            <div key={platform.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm">{platform.label}</strong>
                <span className={cn("font-mono text-[10px]", scored.complete ? scored.matchRateBreach || scored.coverageBreach ? "text-rose-600" : "text-emerald-600" : "text-muted-foreground")}>{scored.complete ? `Δ match ${scored.matchRateDelta > 0 ? "+" : ""}${scored.matchRateDelta.toFixed(1)}pp · Δ coverage ${scored.coverageDelta > 0 ? "+" : ""}${scored.coverageDelta.toFixed(1)}pp` : "needs 4 values"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <NumberInput label="Current match rate" value={platform.currentMatchRate} onChange={(value) => setPlatform(platform.id, { currentMatchRate: value })} />
                <NumberInput label="Previous match rate" value={platform.previousMatchRate} onChange={(value) => setPlatform(platform.id, { previousMatchRate: value })} />
                <NumberInput label="Current coverage" value={platform.currentCoverage} onChange={(value) => setPlatform(platform.id, { currentCoverage: value })} />
                <NumberInput label="Previous coverage" value={platform.previousCoverage} onChange={(value) => setPlatform(platform.id, { previousCoverage: value })} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 border-t border-border/60 pt-4 md:grid-cols-[minmax(220px,0.35fr)_1fr]">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Most recent shared change</span>
          <select value={inputs.recentChange} onChange={(event) => setInputs((previous) => ({ ...previous, recentChange: event.target.value as RecentChange }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs">
            <option value="none">Unknown / none selected</option>
            <option value="theme_liquid_update">theme.liquid snippet update</option>
            <option value="capi_token_rotation">CAPI token rotation</option>
            <option value="ios_consent_banner">iOS consent banner change</option>
            <option value="app_uninstall">App uninstall or conflict</option>
            <option value="advanced_matching_toggle">Advanced Matching / EMQ toggle</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Used only to prioritize the shared-root-cause remediation.</span>
        </label>
        <div className="rounded-lg border border-border/60 bg-background p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prioritized incident fixes</span>
          <ol className="mt-1 flex list-decimal flex-col gap-1 pl-4 text-xs leading-relaxed">
            {result.prioritizedFixes.slice(0, 5).map((fix) => <li key={fix}>{fix}</li>)}
          </ol>
        </div>
      </div>

      <p className="border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
        Canonical pins from <code>scripts/attribution_cross_platform_rollup.py</code>: D1 match-rate drift ≤ {CANONICAL_DRIFT_THRESHOLDS.MATCH_RATE_DRIFT_PP}pp · D2 coverage drift ≤ {CANONICAL_DRIFT_THRESHOLDS.COVERAGE_DRIFT_PP}pp · D3 simultaneous drops ≤ {CANONICAL_DRIFT_THRESHOLDS.MULTI_PLATFORM_DROP_MAX} platform. Values stay in this browser only.
      </p>
    </section>
  );
}
