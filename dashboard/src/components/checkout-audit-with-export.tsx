"use client";

import { useEffect, useState } from "react";
import { CheckoutAudit } from "@/components/checkout-audit";
import { CheckoutAuditExportButton } from "@/components/checkout-audit-export-button";
import type { CheckoutAuditInputs } from "@/lib/checkout-audit-export";

/**
 * `CheckoutAuditWithExport` — client wrapper that bridges the
 * `<CheckoutAudit />` panel (which owns the localStorage hydration of
 * `ecom-ops:cro:checkout-audit:v1`) and the new
 * `<CheckoutAuditExportButton />` (which builds CSV/JSON from the same
 * inputs map).
 *
 * Why this exists: the audit component is the single source of truth
 * for the 24-guideline inputs map in the browser. It loads from
 * localStorage on mount and re-renders on every input change. Mounting
 * the export button directly on the server page would force the page to
 * ship a second hydrating client component, doubling the network
 * round-trip and risking state drift between the two readers. This
 * wrapper loads the inputs map ONCE (in this client component) and
 * passes it to both children via props, so the export button always
 * reflects the exact state the audit is showing — no second
 * localStorage read, no drift.
 *
 * Cross-tab sync: listens to the standard `storage` event (so a flip in
 * another tab re-hydrates), and listens to the
 * `ecom-ops:cro:checkout-audit:update` custom event the audit fires
 * after each save (so the export button sees same-tab edits without
 * waiting for a remount).
 *
 * Mounted on `/cro` immediately below the static
 * "Baymard checkout audit — score your store in 2 minutes" card.
 */

const STORAGE_KEY = "ecom-ops:cro:checkout-audit:v1";
const UPDATE_EVENT = "ecom-ops:cro:checkout-audit:update";

function loadStored(): CheckoutAuditInputs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as CheckoutAuditInputs;
  } catch {
    /* ignore */
  }
  return {};
}

export function CheckoutAuditWithExport() {
  const [inputs, setInputs] = useState<CheckoutAuditInputs>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInputs(loadStored());
    setHydrated(true);
    function refresh() {
      setInputs(loadStored());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <CheckoutAudit />
      {hydrated && <CheckoutAuditExportButton inputs={inputs} />}
    </div>
  );
}
