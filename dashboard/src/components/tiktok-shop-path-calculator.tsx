"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CREATOR_AFFILIATE_PAYOUT_MATRIX,
  LIVE_CAPACITY_GATE_HR_WK,
  MIN_CREATOR_AFFILIATE_POOL_SIZE,
  MIN_GROSS_MARGIN_PCT,
  MIN_SKU_COUNT,
  PATH_A_FLOOR,
  PATH_B_FLOOR,
  PATH_C_FLOOR,
  PATH_DEFAULT_PLATFORM_PICK,
  PATH_PLATFORMS,
  SKU_DISTRIBUTION_OPTIONS,
  TIKTOK_SHOP_DEFAULTS,
  VOICE_PROFILE_OPTIONS,
  recommendPath,
  renderTikTokShopMarkdown,
  type PathName,
  type SkuDistribution,
  type TikTokShopInputs,
  type VoiceProfile,
} from "@/lib/tiktok-shop-path";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { loadYourStore, mergeFromYourStore, YOUR_STORE_DEFAULTS } from "@/lib/your-store";

/**
 * Interactive TikTok Shop Path A/B/C scorer — Playbook 18 (Move #15.x) +
 * research/11 §GMV-tier paths.
 *
 * Direct browser port of `scripts/tiktok_shop_unit_economics.py`. The operator
 * enters 12 current-fit inputs (US DTC GMV / SKU count / SKU archetype
 * distribution / gross margin / TikTok Business Account / TikTok Shop Seller
 * Center / Shopify-TikTok-Channel / Klaviyo-TikTok-channel / Triple-Whale-
 * TikTok-attribution / creator-affiliate-pool size / voice profile / LIVE-
 * shopping-studio capacity hours per week) and the scorer picks one of:
 *
 *   Path A: creator-affiliate-only + shoppable-video-ads (3-6:1 Year-1 ROI)
 *   Path B: + LIVE-shopping 4-hour-week + Triple-Whale + Klaviyo (DEFAULT;
 *           6-12:1 Year-1 ROI default 8.5:1 at $2M US DTC base)
 *   Path C: full TikTok-Shop-orchestration (4-8:1 muted by 6-12-month
 *           build-cycle)
 *
 * 6 deferral gates fire from research/11 + playbook 18 + Jungle Scout 2024
 * canonical baselines (GMV <$100k / SKUs <10 / margin <25% / LIVE <4 hr/wk /
 * no TikTok-Business-Account / no Shopify-TikTok-Channel / creator-pool <10).
 * 4 downgrade gates refine the path (Triple-Whale / luxury+Klaviyo / B2B
 * creator-pool <50 / gen-z LIVE <8 / Path-C LIVE <8 hr/wk).
 *
 * State persists to localStorage (`ecom-ops:tiktok-shop-path:v1`) so the
 * operator's real inputs survive reloads. Cross-page-intelligence: AOV from
 * `ecom-ops:your-store:v1` is auto-mapped to a $2M default if the operator's
 * Your-store GMV is set higher than $5M (so Path C applies). Copy-report
 * emits a paste-ready markdown handoff for Klaviyo/Notion/Linear/Slack.
 *
 * Mounted on `/playbooks/18-tiktok-shop-live-launch` via the `CALCULATORS`
 * registry in `app/playbooks/[slug]/page.tsx` AND on `/tiktok` next to the
 * existing TiktokAttributionAudit.
 */

const STORAGE_KEY = "ecom-ops:tiktok-shop-path:v1";

function clampNum(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function clampInt(n: number, lo: number, hi: number): number {
  return Math.round(clampNum(n, lo, hi));
}

function loadStored(): TikTokShopInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usDtcGmv: clampNum(Number(parsed.usDtcGmv) || 0, 0, 1_000_000_000),
      skuCount: clampInt(Number(parsed.skuCount) || 0, 0, 100_000),
      skuArchetypeDistribution:
        (parsed.skuArchetypeDistribution as SkuDistribution) ??
        TIKTOK_SHOP_DEFAULTS.skuArchetypeDistribution,
      grossMarginPct: clampNum(Number(parsed.grossMarginPct) || 0, 0, 100),
      hasTiktokBusinessAccount:
        typeof parsed.hasTiktokBusinessAccount === "boolean"
          ? parsed.hasTiktokBusinessAccount
          : TIKTOK_SHOP_DEFAULTS.hasTiktokBusinessAccount,
      hasTiktokShopSellerCenter:
        typeof parsed.hasTiktokShopSellerCenter === "boolean"
          ? parsed.hasTiktokShopSellerCenter
          : TIKTOK_SHOP_DEFAULTS.hasTiktokShopSellerCenter,
      hasShopifyTiktokChannel:
        typeof parsed.hasShopifyTiktokChannel === "boolean"
          ? parsed.hasShopifyTiktokChannel
          : TIKTOK_SHOP_DEFAULTS.hasShopifyTiktokChannel,
      hasKlaviyoTiktokChannel:
        typeof parsed.hasKlaviyoTiktokChannel === "boolean"
          ? parsed.hasKlaviyoTiktokChannel
          : TIKTOK_SHOP_DEFAULTS.hasKlaviyoTiktokChannel,
      hasTripleWhaleTiktokAttribution:
        typeof parsed.hasTripleWhaleTiktokAttribution === "boolean"
          ? parsed.hasTripleWhaleTiktokAttribution
          : TIKTOK_SHOP_DEFAULTS.hasTripleWhaleTiktokAttribution,
      creatorAffiliatePoolSize: clampInt(
        Number(parsed.creatorAffiliatePoolSize) || 0,
        0,
        100_000,
      ),
      voiceProfile:
        (parsed.voiceProfile as VoiceProfile) ?? TIKTOK_SHOP_DEFAULTS.voiceProfile,
      hasLiveShoppingStudioCapacityHoursPerWeek: clampInt(
        Number(parsed.hasLiveShoppingStudioCapacityHoursPerWeek) || 0,
        0,
        80,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: TikTokShopInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function fmtUsdShort(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtRoi(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}×`;
}

function pathBadgeClasses(path: PathName): string {
  switch (path) {
    case "A":
      return "bg-accent/15 text-accent border-accent/30";
    case "B":
      return "bg-positive/15 text-positive border-positive/30";
    case "C":
      return "bg-warning/15 text-warning border-warning/30";
  }
}

const PATH_NAMES: Record<PathName, string> = {
  A: "Path A · Creator-affiliate-only",
  B: "Path B · + LIVE-shopping (DEFAULT)",
  C: "Path C · Full TikTok-Shop orchestration",
};

interface BoolChipProps {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

function BoolChip({ label, value, onChange }: BoolChipProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
        value
          ? "border-positive/40 bg-positive/10 text-positive"
          : "border-border bg-card text-muted-foreground hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "w-3 h-3 rounded-sm flex items-center justify-center text-[9px] font-bold",
          value ? "bg-positive text-positive-foreground" : "bg-muted",
        )}
      >
        {value ? "✓" : "·"}
      </span>
      {label}
    </button>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="text-[9px] text-muted-foreground/70">{hint}</span>}
    </label>
  );
}

export function TikTokShopPathCalculator() {
  const [inputs, setInputs] = useState<TikTokShopInputs>(() => TIKTOK_SHOP_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);

  // Hydrate from localStorage on mount. Stored inputs win over Your-store
  // so operator edits are preserved across reloads.
  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setFromYourStore(false);
    } else {
      // Fall back to the operator's cross-page Your-store inputs (AOV →
      // usDtcGmv, grossMargin → grossMarginPct, monthlyOrders → usDtcGmv
      // scaling via the canonical projection in lib/your-store.ts).
      const yourStore = loadYourStore();
      if (yourStore) {
        setInputs(mergeFromYourStore(TIKTOK_SHOP_DEFAULTS, yourStore));
        setFromYourStore(true);
      }
    }
    setHydrated(true);
  }, []);

  // Persist on changes (only after hydration).
  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  // Cross-tab Your-store sync — if the operator updates AOV/margin/orders on
  // Overview in another tab and has NOT yet committed local TikTok edits,
  // re-hydrate from the refreshed Your-store.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "ecom-ops:your-store:v1" || !e.newValue) return;
      if (loadStored()) return;
      try {
        const refreshed = loadYourStore();
        if (refreshed) {
          setInputs(mergeFromYourStore(TIKTOK_SHOP_DEFAULTS, refreshed));
          setFromYourStore(true);
        }
      } catch {
        /* ignore parse errors */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rec = useMemo(() => recommendPath(inputs), [inputs]);

  const tierFloorLabel =
    inputs.usDtcGmv < PATH_A_FLOOR
      ? `< $${PATH_A_FLOOR.toLocaleString("en-US")} (defer)`
      : inputs.usDtcGmv < PATH_B_FLOOR
        ? `$${PATH_A_FLOOR.toLocaleString("en-US")} – $${PATH_B_FLOOR.toLocaleString("en-US")}`
        : inputs.usDtcGmv < PATH_C_FLOOR
          ? `$${PATH_B_FLOOR.toLocaleString("en-US")} – $${PATH_C_FLOOR.toLocaleString("en-US")}`
          : `≥ $${PATH_C_FLOOR.toLocaleString("en-US")}`;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Playbook 18 · Move #15.x · research/11 §GMV-tier paths
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-semibold">
            TikTok Shop Path A/B/C scorer
          </h3>
          {fromYourStore && hydrated && (
            <span
              data-testid="tiktok-shop-path-ys-badge"
              className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Prefilled from Your store on Overview
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl">
          Pick your brand's current-fit inputs (US DTC GMV / SKU count /
          margin / TikTok Business Account / TikTok Shop Seller Center /
          Shopify-TikTok-Channel / Klaviyo-TikTok-channel / Triple-Whale-
          TikTok-attribution / creator-affiliate-pool size / voice profile /
          LIVE-shopping-studio capacity hours per week) → see the canonical
          Path A / B / C recommendation with cost stack, Year-1 incremental
          GMV band, ROI band, LIVE-cohort LTV multiplier, Spark-Ads ROAS, the
          5-voice creator-affiliate payout matrix, and the 6-step build
          sequence per playbook 18.
        </p>
      </header>

      {/* === PATH BANNER === */}
      <div
        className={cn(
          "rounded-md border-2 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3",
          pathBadgeClasses(rec.path),
        )}
      >
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {rec.path}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider">
              {PATH_NAMES[rec.path]}
            </span>
            {rec.downgraded && (
              <span className="text-[10px] rounded bg-warning/30 text-warning-foreground px-1.5 py-0.5 ml-1">
                downgraded from {rec.basePath}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {PATH_DEFAULT_PLATFORM_PICK[rec.path]}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 md:min-w-[24rem]">
          <div className="rounded bg-background/40 px-2 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-wider opacity-80">
              Year-1 ROI
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtRoi(rec.year1RoiLow)}–{fmtRoi(rec.year1RoiHigh)}
            </div>
          </div>
          <div className="rounded bg-background/40 px-2 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-wider opacity-80">
              Year-1 GMV
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalGmvLow)}–
              {fmtUsdShort(rec.year1IncrementalGmvHigh)}
            </div>
          </div>
          <div className="rounded bg-background/40 px-2 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-wider opacity-80">
              Year-1 cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsd(rec.year1CostLow)}–{fmtUsd(rec.year1CostHigh)}
            </div>
          </div>
        </div>
      </div>

      {/* === INPUTS === */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="US DTC GMV (USD)"
          hint={`Path band: ${tierFloorLabel}`}
        >
          <input
            type="number"
            min={0}
            step={10_000}
            value={inputs.usDtcGmv}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                usDtcGmv: Math.max(0, Number(e.target.value) || 0),
              }))
            }
            className="rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums"
          />
        </Field>

        <Field
          label="SKU count"
          hint={`Floor: ${MIN_SKU_COUNT} (Jungle Scout 2024 baseline)`}
        >
          <input
            type="number"
            min={0}
            step={1}
            value={inputs.skuCount}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                skuCount: Math.max(0, Math.round(Number(e.target.value) || 0)),
              }))
            }
            className={cn(
              "rounded border bg-background px-2 py-1.5 text-sm tabular-nums",
              inputs.skuCount < MIN_SKU_COUNT
                ? "border-danger/40 text-danger"
                : "border-border",
            )}
          />
        </Field>

        <Field
          label="Gross margin %"
          hint={`Floor: ${MIN_GROSS_MARGIN_PCT}% (margin headroom for TikTok-Shop cost-stack)`}
        >
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={inputs.grossMarginPct}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                grossMarginPct: Math.max(
                  0,
                  Math.min(100, Number(e.target.value) || 0),
                ),
              }))
            }
            className={cn(
              "rounded border bg-background px-2 py-1.5 text-sm tabular-nums",
              inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT
                ? "border-danger/40 text-danger"
                : "border-border",
            )}
          />
        </Field>

        <Field label="SKU archetype distribution">
          <select
            value={inputs.skuArchetypeDistribution}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                skuArchetypeDistribution: e.target.value as SkuDistribution,
              }))
            }
            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            {SKU_DISTRIBUTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Voice profile">
          <select
            value={inputs.voiceProfile}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                voiceProfile: e.target.value as VoiceProfile,
              }))
            }
            className="rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            {VOICE_PROFILE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="LIVE-shopping-studio capacity (hr/wk)"
          hint={`Floor: ${LIVE_CAPACITY_GATE_HR_WK} (TikTok-LIVE 2024) / Path-C requires ≥8 (daily cadence)`}
        >
          <input
            type="number"
            min={0}
            max={80}
            step={1}
            value={inputs.hasLiveShoppingStudioCapacityHoursPerWeek}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                hasLiveShoppingStudioCapacityHoursPerWeek: Math.max(
                  0,
                  Math.min(80, Math.round(Number(e.target.value) || 0)),
                ),
              }))
            }
            className={cn(
              "rounded border bg-background px-2 py-1.5 text-sm tabular-nums",
              inputs.hasLiveShoppingStudioCapacityHoursPerWeek <
              LIVE_CAPACITY_GATE_HR_WK
                ? "border-danger/40 text-danger"
                : "border-border",
            )}
          />
        </Field>

        <Field
          label="Creator-affiliate pool size"
          hint={`Floor: ${MIN_CREATOR_AFFILIATE_POOL_SIZE} (Path-B baseline 30-50; Path-C ≥100)`}
        >
          <input
            type="number"
            min={0}
            step={1}
            value={inputs.creatorAffiliatePoolSize}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                creatorAffiliatePoolSize: Math.max(
                  0,
                  Math.round(Number(e.target.value) || 0),
                ),
              }))
            }
            className={cn(
              "rounded border bg-background px-2 py-1.5 text-sm tabular-nums",
              inputs.creatorAffiliatePoolSize < MIN_CREATOR_AFFILIATE_POOL_SIZE
                ? "border-danger/40 text-danger"
                : "border-border",
            )}
          />
        </Field>

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
          <BoolChip
            label="TikTok Business Account"
            value={inputs.hasTiktokBusinessAccount}
            onChange={(v) =>
              setInputs((p) => ({ ...p, hasTiktokBusinessAccount: v }))
            }
          />
          <BoolChip
            label="TikTok Shop Seller Center"
            value={inputs.hasTiktokShopSellerCenter}
            onChange={(v) =>
              setInputs((p) => ({ ...p, hasTiktokShopSellerCenter: v }))
            }
          />
          <BoolChip
            label="Shopify-TikTok-Channel"
            value={inputs.hasShopifyTiktokChannel}
            onChange={(v) =>
              setInputs((p) => ({ ...p, hasShopifyTiktokChannel: v }))
            }
          />
          <BoolChip
            label="Klaviyo-TikTok-channel"
            value={inputs.hasKlaviyoTiktokChannel}
            onChange={(v) =>
              setInputs((p) => ({ ...p, hasKlaviyoTiktokChannel: v }))
            }
          />
          <BoolChip
            label="Triple-Whale-TikTok-attribution"
            value={inputs.hasTripleWhaleTiktokAttribution}
            onChange={(v) =>
              setInputs((p) => ({ ...p, hasTripleWhaleTiktokAttribution: v }))
            }
          />
        </div>
      </section>

      {/* === DEFERRAL + DOWNGRADE REASONS === */}
      {(rec.deferReasons.length > 0 || rec.downgradeReasons.length > 0) && (
        <section className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs space-y-1">
          <h4 className="font-semibold text-warning-foreground">
            ⚠ Deferral / downgrade gates fired
          </h4>
          {rec.deferReasons.map((r, i) => (
            <div key={`d-${i}`} className="text-warning-foreground/90">
              <span className="font-mono text-[10px] mr-1">DEFER</span>
              {r}
            </div>
          ))}
          {rec.downgradeReasons.map((r, i) => (
            <div key={`dg-${i}`} className="text-warning-foreground/90">
              <span className="font-mono text-[10px] mr-1">DOWNGRADE</span>
              {r}
            </div>
          ))}
        </section>
      )}

      {/* === COST STACK + KEY METRICS === */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-card px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            One-time
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {fmtUsd(rec.costOneTimeLow)} – {fmtUsd(rec.costOneTimeHigh)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Recurring (/mo)
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {fmtUsd(rec.costRecurringLow)} – {fmtUsd(rec.costRecurringHigh)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            LIVE-cohort LTV multiplier
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {rec.liveCohortLtvMultiplierLow.toFixed(1)}–
            {rec.liveCohortLtvMultiplierHigh.toFixed(1)}×
          </div>
        </div>
        <div className="rounded-md border border-border bg-card px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Spark-Ads ROAS
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {rec.sparkAdsRoasLow.toFixed(1)}–{rec.sparkAdsRoasHigh.toFixed(1)}×
          </div>
        </div>
      </section>

      {/* === PLATFORMS === */}
      <section>
        <h4 className="text-xs font-semibold mb-2">Platform scope</h4>
        <div className="flex flex-wrap gap-1.5">
          {rec.platforms.map((p) => (
            <span
              key={p}
              className="rounded border border-border bg-muted/40 px-2 py-1 text-[10px] font-mono"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* === PAYOUT MATRIX === */}
      <section>
        <h4 className="text-xs font-semibold mb-2">
          Creator-affiliate payout matrix (per voice profile)
        </h4>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-2 py-1.5">Voice</th>
                <th className="text-left px-2 py-1.5">Tier 1 / 2 / 3 CPS</th>
                <th className="text-left px-2 py-1.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(rec.creatorAffiliatePayoutMatrix) as VoiceProfile[]).map(
                (voice) => (
                  <tr
                    key={voice}
                    className={cn(
                      "border-t border-border",
                      inputs.voiceProfile === voice && "bg-accent/5",
                    )}
                  >
                    <td className="px-2 py-1.5 font-medium">{voice}</td>
                    <td className="px-2 py-1.5">
                      {rec.creatorAffiliatePayoutMatrix[voice]}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground text-[10px]">
                      {voice === "luxury"
                        ? "MAP-policy-guarded"
                        : voice === "gen_z"
                          ? "highest CPS — premium audience"
                          : voice === "sustainable"
                            ? "mission-driven premium tier"
                            : voice === "b2b"
                              ? "tiered-volume — wholesale-cannibalization-guarded"
                              : "TikTok-Shop-canonical baseline"}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* === BUILD SEQUENCE === */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="text-xs font-semibold">
            6-step build sequence (Path {rec.path})
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputs(TIKTOK_SHOP_DEFAULTS)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Reset defaults
            </button>
            <CopyButton
              label="Copy report"
              value={renderTikTokShopMarkdown(rec)}
              className="text-[10px] h-6 px-2"
            />
          </div>
        </div>
        <ol className="space-y-1.5 text-xs">
          {rec.buildSequence.map((step, i) => (
            <li
              key={i}
              className="flex gap-2 rounded border border-border bg-card px-2 py-1.5"
            >
              <span className="text-[10px] font-mono text-muted-foreground w-6 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-[10px] text-muted-foreground">
        Storage: <code className="rounded bg-muted px-1">ecom-ops:tiktok-shop-path:v1</code> ·
        Math mirrors <code className="rounded bg-muted px-1">scripts/tiktok_shop_unit_economics.py</code> ·
        6 deferral + 4 downgrade gates (research/11 + playbook 18 + Jungle Scout 2024 + TikTok-LIVE 2024)
      </p>
    </div>
  );
}
