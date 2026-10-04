"use client";

import { useEffect, useMemo, useState } from "react";
import {
  affiliatePlanDayDate,
  affiliatePlanToMarkdown,
  buildAffiliateLaunchPlan,
  type AffiliateLaunchPlanPayload,
} from "@/lib/affiliate-launch-plan";
import {
  AFFILIATE_DEFAULTS,
  type BrandAffiliateInputs,
} from "@/lib/affiliate";
import { loadYourStore } from "@/lib/your-store";
import { CopyButton } from "@/components/copy-button";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:affiliate-path:v1";
const UPDATE_EVENT = "ecom-ops:affiliate-path:update";

/**
 * One-click "Generate 30-day Affiliate Program launch plan" button.
 *
 * Reads the operator's saved `BrandAffiliateInputs` from localStorage,
 * overlays the Your-store AOV/orders/margin when present, and produces a
 * paste-ready 30-day markdown checklist grouped into 4 weeks:
 *
 *   W1 — Platform pick (Refersion / Levanta / Impact / GoAffPro /
 *         PartnerStack / Aspire), tier + commission config, cookie
 *         attribution, affiliate contract + FTC-disclosure, payment rail
 *   W2 — Recruitment candidate list (50–200 per Path), application page,
 *         KPI dashboard wiring (Triple Whale + Klaviyo + Smile)
 *   W3 — Soft-launch to 10% / 50% / 100%, Day-1 / Day-7 / Day-14 readouts
 *         (traffic, first-sale rate, EPC, AOV-uplift, FTC-compliance)
 *   W4 — Day-21 / Day-25 / Day-30 readouts (per-affiliate LTV, AOV-band
 *         breakdown, repeat-buyer cohort, ROI ratio, year-1 forecast),
 *         Tier-3 promotion, bottom-10% cut, quarterly-compliance-audit,
 *         headline-tier iteration, final 30-day program readout
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * Cross-tab sync: listens to the standard `storage` event (so a flip in
 * another tab re-hydrates) and the custom `ecom-ops:affiliate-path:update`
 * event the path-calculator fires after each save (so same-tab edits
 * propagate without a manual reload).
 *
 * Storage keys:
 *   ecom-ops:affiliate-path:v1   -> BrandAffiliateInputs
 *   ecom-ops:your-store:v1       -> YourStoreInputs (read-only overlay)
 *
 * No new dependency.
 */
export function AffiliateLaunchPlanButton(props: {
  className?: string;
  /** Optional inline label override (default = "Generate 30-day launch plan"). */
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [storedInputs, setStoredInputs] = useState<BrandAffiliateInputs | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [plan, setPlan] = useState<AffiliateLaunchPlanPayload | null>(null);

  // Hydrate inputs from localStorage on mount; cross-tab sync via storage event.
  useEffect(() => {
    setMounted(true);
    function read() {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setStoredInputs(null);
          return;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          setStoredInputs(null);
          return;
        }
        // Minimal validation: usGmv + aov + commissionTier are numbers.
        if (
          typeof parsed.usGmv !== "number" ||
          typeof parsed.aov !== "number" ||
          typeof parsed.commissionTier !== "number"
        ) {
          setStoredInputs(null);
          return;
        }
        setStoredInputs(parsed as BrandAffiliateInputs);
      } catch {
        setStoredInputs(null);
      }
    }
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) read();
    };
    const onUpdate = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, onUpdate as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, onUpdate as EventListener);
    };
  }, []);

  // Whether the operator has touched the path calculator at all.
  const hasStoredInputs = storedInputs !== null;

  // Effective inputs = stored (preferred) or defaults. The pure generator
  // also accepts undefined → defaults, so we can pass `storedInputs ?? undefined`.
  const effectiveInputs = storedInputs ?? undefined;

  // Pre-compute the plan lazily — only when the modal opens (or when
  // re-rendering with newer inputs).
  function handleGenerate() {
    const next = buildAffiliateLaunchPlan({ inputs: effectiveInputs });
    setPlan(next);
    setModalOpen(true);
  }

  // Escape to close modal.
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const defaultSnapshot = useMemo(() => {
    if (!hasStoredInputs) return null;
    return buildAffiliateLaunchPlan({ inputs: effectiveInputs });
  }, [hasStoredInputs, effectiveInputs]);

  // What to show in the button label: "Generate 30-day launch plan"
  // with a "uses your Path X" hint when inputs are present.
  const storedPathLetter = defaultSnapshot?.recommendation.path;

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors",
          props.className
        )}
        aria-label="Generate 30-day Affiliate Program launch plan"
      >
        <span aria-hidden>📅</span>
        <span>{props.label ?? "Generate 30-day launch plan"}</span>
        {storedPathLetter && (
          <span className="ml-1 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            Path {storedPathLetter}
          </span>
        )}
      </button>

      {modalOpen && plan && (
        <Modal onClose={() => setModalOpen(false)}>
          <PlanModalBody plan={plan} />
        </Modal>
      )}
    </>
  );
}

function Modal(props: { onClose: () => void; children: React.ReactNode }) {
  // Click-outside-to-close. The inner content is wrapped in a panel that
  // stops propagation.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="30-day Affiliate Program launch plan"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={props.onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
}

function PlanModalBody(props: { plan: AffiliateLaunchPlanPayload }) {
  const { plan } = props;
  const markdown = useMemo(() => affiliatePlanToMarkdown(plan), [plan]);
  const filename = `affiliate-program-launch-plan-${plan.startDate}.md`;

  const r = plan.recommendation;
  const yourStoreHasValues = plan.yourStore !== null;

  return (
    <div className="flex max-h-[90vh] flex-col">
      <header className="flex items-start gap-3 border-b border-border px-5 py-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold tracking-tight">
            Affiliate Program launch plan
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            30 days · {plan.days.length} checkbox-able actions · start{" "}
            <span className="font-mono">{plan.startDate}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton
            value={markdown}
            label="Copy markdown"
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
          />
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
            download={filename}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            <span aria-hidden>⬇</span>
            <span>Download .md</span>
          </a>
          <a
            href="/affiliate-program-launch-plan"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            <span aria-hidden>↗</span>
            <span>Open full page</span>
          </a>
          <button
            type="button"
            onClick={() => {
              const a = document.querySelector(
                "[role=dialog][aria-modal=true]"
              );
              if (a) (a as HTMLElement).click();
            }}
            className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* === Snapshot block === */}
        <section className="rounded-md border border-accent/30 bg-accent/5 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
            Snapshot · {plan.startDate}
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <SnapshotRow
              label="Recommended path"
              value={`${r.path} (${r.defaultPlatformPick})`}
            />
            <SnapshotRow
              label="Year-1 attributed-revenue"
              value={`$${formatInt(r.year1AttributedRevenueLow)} – $${formatInt(r.year1AttributedRevenueHigh)}`}
            />
            <SnapshotRow
              label="Year-1 program cost"
              value={`$${formatInt(r.year1CostLow)} – $${formatInt(r.year1CostHigh)}`}
            />
            <SnapshotRow
              label="Year-1 affiliate count"
              value={`${r.year1AffiliateCountLow} – ${r.year1AffiliateCountHigh}`}
            />
            <SnapshotRow
              label="LTV multiplier"
              value={`${r.ltvMultiplierLow.toFixed(2)}× – ${r.ltvMultiplierHigh.toFixed(2)}×`}
            />
            <SnapshotRow
              label="Cookie-deprecation recovery"
              value={`${(r.cookieDeprecationRecoveryPctLow * 100).toFixed(0)}% – ${(r.cookieDeprecationRecoveryPctHigh * 100).toFixed(0)}%`}
            />
            <SnapshotRow
              label="Sustainable-mission align score"
              value={`${r.sustainableMissionAlignScoreLow} – ${r.sustainableMissionAlignScoreHigh}`}
            />
            <SnapshotRow
              label="Justification"
              value={r.justification}
              fullWidth
            />
            {yourStoreHasValues && plan.yourStore && (
              <SnapshotRow
                label="Your-store overlay"
                value={`AOV ${formatUsd(plan.yourStore.aov)} · ${formatInt(plan.yourStore.monthlyOrders)} orders/mo · ${(plan.yourStore.grossMargin * 100).toFixed(1)}% GM`}
                fullWidth
              />
            )}
          </div>
        </section>

        {/* === Day-by-day checklist === */}
        <section className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            30-day checklist
          </h3>
          <ol className="mt-2 space-y-3">
            {plan.days.map((d) => (
              <li
                key={d.day}
                className="rounded-md border border-border bg-background p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-mono">
                    {d.day}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    W{d.week} · {affiliatePlanDayDate(plan.startDate, d.day)}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-medium text-foreground">
                  {d.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Action:</strong>{" "}
                  {d.action}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Deliverable:</strong>{" "}
                  {d.deliverable}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
        Generated by Ecommerce Ops · /affiliate-program-launch-plan · Move #16
        always-on Affiliate Program · same math as
        scripts/affiliate_unit_economics.py
      </footer>
    </div>
  );
}

function SnapshotRow(props: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", props.fullWidth && "md:col-span-2")}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {props.label}
      </span>
      <span className="font-medium tabular-nums text-foreground">
        {props.value}
      </span>
    </div>
  );
}
