/**
 * `Your store` — cross-page-intelligence shared inputs.
 *
 * The operator's AOV, monthly orders, and gross margin live here once
 * (entered on the Overview page). Every interactive ROI calculator on
 * `/playbooks` (abandoned-cart, post-purchase upsell, welcome series) reads
 * from this same key on mount and projects the operator's numbers onto its
 * own defaults, so a single edit propagates across all three tools.
 *
 * Storage key: `ecom-ops:your-store:v1`.  Bump the suffix when the schema
 * changes incompatibly — old keys naturally fall through to `null` and the
 * calculators stay on their canonical defaults until the operator opens
 * Overview again.
 *
 * Schema is intentionally small (3 numbers). Anything richer should ship as
 * its own tool, not get bolted onto this card.
 */

export interface YourStoreInputs {
  aov: number;              // USD — average order value
  monthlyOrders: number;    // orders / month
  grossMargin: number;      // 0..1 — gross margin fraction
}

export const YOUR_STORE_DEFAULTS: YourStoreInputs = {
  aov: 75,
  monthlyOrders: 1000,
  grossMargin: 0.70,
};

export const YOUR_STORE_STORAGE_KEY = "ecom-ops:your-store:v1";

export function loadYourStore(): YourStoreInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(YOUR_STORE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const aov = Number((parsed as YourStoreInputs).aov);
    const monthlyOrders = Number((parsed as YourStoreInputs).monthlyOrders);
    const grossMargin = Number((parsed as YourStoreInputs).grossMargin);
    if (!Number.isFinite(aov) || !Number.isFinite(monthlyOrders) || !Number.isFinite(grossMargin)) {
      return null;
    }
    return {
      aov: Math.max(1, aov),
      monthlyOrders: Math.max(1, Math.round(monthlyOrders)),
      grossMargin: Math.min(0.95, Math.max(0.05, grossMargin)),
    };
  } catch {
    /* ignore parse errors */
  }
  return null;
}

export function saveYourStore(s: YourStoreInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(YOUR_STORE_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota / private-mode */
  }
}

export function clearYourStore(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(YOUR_STORE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Project a `YourStoreInputs` onto another defaults object, picking the
 * field names that overlap. This is the single source of truth for how a
 * cross-page AOV / orders / margin maps onto per-calculator defaults —
 * calculators don't have to know which keys they share, they just call
 * `mergeFromYourStore(DEFAULTS, yourStore)`.
 *
 * The shared key map:
 *   aov           -> .aov (ac/ws) | .baseAov (ppu)
 *   monthlyOrders -> .checkoutsPerMonth (ac) | .ordersPerMonth (ppu/ws optins)
 *   grossMargin   -> .grossMargin (ws) | .margin (PDP A/B) | .upsellMargin (ppu, falls back)
 *
 * `extra` lets a calculator map additional fields (e.g. ws reads optins).
 */
export function mergeFromYourStore<T>(
  defaults: T,
  yourStore: YourStoreInputs,
  extra?: Partial<T>,
): T {
  const merged = { ...(defaults as Record<string, unknown>) } as Record<string, unknown>;
  // AOV — abandoned-cart + welcome-series use `aov`; post-purchase uses `baseAov`.
  if ("aov" in merged) merged.aov = yourStore.aov;
  if ("baseAov" in merged) merged.baseAov = yourStore.aov;
  // Monthly orders — abandoned-cart uses `checkoutsPerMonth`; post-purchase uses `ordersPerMonth`.
  if ("checkoutsPerMonth" in merged) merged.checkoutsPerMonth = yourStore.monthlyOrders;
  if ("ordersPerMonth" in merged) merged.ordersPerMonth = yourStore.monthlyOrders;
  // Welcome series reads opt-ins (a flow-volume proxy); if the operator only
  // has orders to hand, fall back to orders and let them override inline.
  if ("optinsPerMonth" in merged && !("ordersPerMonth" in merged)) {
    merged.optinsPerMonth = yourStore.monthlyOrders;
  }
  // Gross margin — welcome-series uses `grossMargin`; PDP A/B uses `margin`;
  // post-purchase uses `upsellMargin`.
  if ("grossMargin" in merged) merged.grossMargin = yourStore.grossMargin;
  if ("margin" in merged) merged.margin = yourStore.grossMargin;
  if ("upsellMargin" in merged) merged.upsellMargin = yourStore.grossMargin;
  if (extra) {
    for (const [k, v] of Object.entries(extra as Record<string, unknown>)) {
      if (v !== undefined) merged[k] = v;
    }
  }
  return merged as T;
}