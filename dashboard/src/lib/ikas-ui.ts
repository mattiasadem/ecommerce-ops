/**
 * Shared UI types for the Ikas live-overview card.
 *
 * Kept in a separate file from the server-only `ikas.ts` so we can import
 * the response shape into a `"use client"` component without dragging the
 * `node:fs` / `node:path` deps into the client bundle.
 */

export interface IkasMerchantUi {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  merchantName: string | null;
  storeName: string | null;
}

export interface IkasOrderSummaryUi {
  orderCount30d: number;
  revenue30dUsd: number;
  currency: string | null;
  averageOrderValueUsd: number;
  sampleOrderIds: string[];
}

export interface IkasProductSummaryUi {
  productCount: number;
}

export interface IkasStoreOverviewUi {
  ok: true;
  merchant: IkasMerchantUi;
  orders: IkasOrderSummaryUi;
  products: IkasProductSummaryUi;
  fetchedAt: string;
  source: "live";
}

export interface IkasStoreErrorUi {
  ok: false;
  reason: "missing-config" | "expired" | "network" | "graphql-error" | "io-error";
  message: string;
  httpStatus?: number;
}

export type IkasStoreResultUi = IkasStoreOverviewUi | IkasStoreErrorUi;

export function formatIkasRevenue(amount: number, currency: string | null): string {
  if (!Number.isFinite(amount)) return "—";
  if (amount >= 1_000_000) {
    return `${currency ? currency + " " : ""}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${currency ? currency + " " : ""}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${currency ? currency + " " : ""}${amount.toFixed(2)}`;
}
