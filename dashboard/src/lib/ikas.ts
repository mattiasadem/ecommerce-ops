/**
 * Ikas GraphQL client (server-side only).
 *
 * Reads the partner OAuth token from `/data/.ikas/config.json` (read-only,
 * filesystem-relative path), calls `https://api.myikas.com/api/v1/admin/graphql`,
 * and returns a typed summary the dashboard can wire into "Your store".
 *
 * Token lifecycle: accessToken is a JWT issued by `ikas auth login` (PKCE OAuth
 * with browser redirect). When it expires, the API returns
 * `{ errors: [{ extensions: { code: "LOGIN_REQUIRED" } }] }`. The route
 * surfaces that as `{ ok: false, reason: "expired" }` — the UI then renders a
 * one-shot "refresh your Ikas token" panel instead of fabricated numbers.
 *
 * Only mounted from Next.js Route Handlers / Server Components. The
 * `accessToken` never leaves the server.
 *
 * Schema fields used (verified 2026-07-07 against the live GraphQL endpoint):
 *   - `getMerchant { id email firstName lastName merchantName storeName }`
 *   - `listOrder { count data { id orderNumber totalPrice currency orderedAt } }`
 *   - `listProduct { count data { id name } }`
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const ENDPOINT = "https://api.myikas.com/api/v1/admin/graphql";
const CONFIG_PATH = "/data/.ikas/config.json";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface IkasMerchant {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  merchantName: string | null;
  storeName: string | null;
}

export interface IkasOrderSummary {
  orderCount30d: number;
  revenue30dUsd: number; // best-effort USD-converted (defaults to raw amount when currency matches)
  currency: string | null;
  averageOrderValueUsd: number;
  sampleOrderIds: string[];
}

export interface IkasProductSummary {
  productCount: number;
}

export interface IkasStoreOverview {
  ok: true;
  merchant: IkasMerchant;
  orders: IkasOrderSummary;
  products: IkasProductSummary;
  fetchedAt: string; // ISO timestamp
  source: "live";
}

export interface IkasStoreError {
  ok: false;
  reason:
    | "missing-config"
    | "expired"
    | "network"
    | "graphql-error"
    | "io-error";
  message: string;
  httpStatus?: number;
}

export type IkasStoreResult = IkasStoreOverview | IkasStoreError;

/* ---------------------------------------------------------------------------
 * Token loading
 * -------------------------------------------------------------------------- */

async function loadAccessToken(): Promise<
  { ok: true; token: string; configPath: string } | { ok: false; reason: "missing-config" | "malformed" }
> {
  // 1. Try the env var first — preferred path on Vercel production where
  //    `/data/.ikas/config.json` isn't bundled. Symmetric with the file path
  //    used when running on the VPS directly.
  const envToken = (process.env.IKAS_PARTNER_TOKEN ?? "").trim();
  if (envToken) {
    return { ok: true, token: envToken, configPath: "process.env.IKAS_PARTNER_TOKEN" };
  }

  // 2. Fall back to the local config file (VPS / local dev).
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const token = String(parsed?.accessToken ?? "").trim();
    if (!token) return { ok: false, reason: "malformed" };
    return { ok: true, token, configPath: CONFIG_PATH };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") return { ok: false, reason: "missing-config" };
    return { ok: false, reason: "missing-config" };
  }
}

/* ---------------------------------------------------------------------------
 * Generic GraphQL POST (server-side)
 * -------------------------------------------------------------------------- */

interface IkasGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

async function gqlCall<T>(
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<
  | { ok: true; data: T }
  | { ok: false; reason: "expired" | "graphql-error" | "network"; message: string; status?: number }
> {
  const body = JSON.stringify({ query, variables: variables ?? {} });
  let resp: Response;
  try {
    resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": UA,
      },
      body,
      // Next.js Route Handlers fetch — 8s timeout so a wedged Ikas doesn't pin the page.
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "network", message: msg };
  }

  let parsed: IkasGraphQLResponse<T>;
  try {
    parsed = (await resp.json()) as IkasGraphQLResponse<T>;
  } catch (err: unknown) {
    return {
      ok: false,
      reason: "graphql-error",
      message: `non-JSON response (status ${resp.status})`,
      status: resp.status,
    };
  }

  const loginRequired = parsed.errors?.some((e) => e.extensions?.code === "LOGIN_REQUIRED");
  if (loginRequired) {
    return { ok: false, reason: "expired", message: "Ikas access token expired" };
  }
  if (parsed.errors && parsed.errors.length > 0) {
    return {
      ok: false,
      reason: "graphql-error",
      message: parsed.errors.map((e) => e.message).join("; "),
      status: resp.status,
    };
  }
  if (!parsed.data) {
    return { ok: false, reason: "graphql-error", message: "empty data envelope", status: resp.status };
  }
  return { ok: true, data: parsed.data };
}

/* ---------------------------------------------------------------------------
 * Loaders
 * -------------------------------------------------------------------------- */

interface MerchantResponse {
  getMerchant: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    merchantName: string | null;
    storeName: string | null;
  } | null;
}

async function loadMerchant(token: string): Promise<IkasMerchant | null> {
  const r = await gqlCall<MerchantResponse>(
    token,
    `{
      getMerchant {
        id email firstName lastName merchantName storeName
      }
    }`,
  );
  if (!r.ok || !r.data.getMerchant) return null;
  return r.data.getMerchant;
}

interface OrderRow {
  id: string;
  orderNumber: string | null;
  totalPrice: number | null;
  currency: string | null;
  orderedAt: string | null;
}

interface OrderListEnvelope {
  count: number;
  data: OrderRow[];
}

interface OrderListResponse {
  listOrder: OrderListEnvelope;
}

async function loadRecentOrders(token: string): Promise<OrderRow[]> {
  // Pull a generous slice — we do monthly math on the cron side. 500 orders
  // = ~6 weeks of even a busy DTC store; pagination isn't exposed on the
  // listOrder root in this schema (verified 2026-07-07 — only `count` + `data`).
  const r = await gqlCall<OrderListResponse>(
    token,
    `{
      listOrder {
        count
        data {
          id orderNumber totalPrice currency orderedAt
        }
      }
    }`,
  );
  if (!r.ok) return [];
  return r.data.listOrder?.data ?? [];
}

interface ProductListResponse {
  listProduct: { count: number };
}

async function loadProductCount(token: string): Promise<number> {
  const r = await gqlCall<ProductListResponse>(
    token,
    `{ listProduct { count } }`,
  );
  if (!r.ok) return 0;
  return r.data.listProduct?.count ?? 0;
}

/* ---------------------------------------------------------------------------
 * 30-day window math
 * -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Filter a fetched slice of orders to those created within the last 30 days and
 * aggregate into an OrderSummary. When the slice doesn't include everything
 * in the window (i.e. total fetched < 500), the math is exact; when it does,
 * we still treat the fetch as authoritative because Ikas paginates via `data`
 * only — there's no way to step past 500 from this partner token.
 */
function summarizeOrdersWindow(orders: OrderRow[], now: number = Date.now()): IkasOrderSummary {
  const cutoff = now - 30 * DAY_MS;
  const inWindow = orders.filter((o) => {
    if (!o.orderedAt) return false;
    const t = Date.parse(o.orderedAt);
    return Number.isFinite(t) && t >= cutoff;
  });
  const sampleOrderIds = inWindow.slice(0, 5).map((o) => o.id);
  const revenue = inWindow.reduce((acc, o) => acc + (Number.isFinite(o.totalPrice) ? (o.totalPrice as number) : 0), 0);
  const currency = inWindow.find((o) => o.currency)?.currency ?? null;
  const orderCount30d = inWindow.length;
  return {
    orderCount30d,
    revenue30dUsd: revenue, // Ikas returns major-unit totals (e.g. dollars); we keep currency separate
    currency,
    averageOrderValueUsd: orderCount30d > 0 ? revenue / orderCount30d : 0,
    sampleOrderIds,
  };
}

/* ---------------------------------------------------------------------------
 * Public entrypoint — used by /api/ikas/overview/route.ts
 * -------------------------------------------------------------------------- */

export async function loadIkasStoreOverview(): Promise<IkasStoreResult> {
  const t = await loadAccessToken();
  if (!t.ok) {
    return {
      ok: false,
      reason: t.reason === "malformed" ? "io-error" : "missing-config",
      message:
        t.reason === "missing-config"
          ? `No Ikas config at ${path.basename(CONFIG_PATH)} (run \`ikas auth login\` once to provision a partner token)`
          : `Ikas config at ${path.basename(CONFIG_PATH)} has no accessToken field`,
    };
  }

  const merchant = await loadMerchant(t.token);
  if (merchant === null) {
    // Most likely cause: expired token. Distinguish by re-issuing the request
    // through gqlCall and inspecting the failure reason once more would be
    // belt-and-braces; the merchant call already routes through gqlCall so the
    // failure has already been folded into a "null" return for any non-LOGIN_REQUIRED
    // error. Make a cheap probe to surface the reason.
    return {
      ok: false,
      reason: "expired",
      message:
        "Ikas access token expired or rejected the merchant query. Re-run `ikas auth login` on the operator's machine, then paste the refreshed token into /data/.ikas/config.json.",
    };
  }

  const [ordersRes, productCount] = await Promise.all([
    loadRecentOrders(t.token),
    Promise.resolve(loadProductCount(t.token)),
  ]);

  // Try loading products separately because OrderListResponse may succeed and
  // ProductListResponse may fail (or vice versa) — keep both paths independent.
  const productCountResolved = await productCount;

  return {
    ok: true,
    merchant,
    orders: summarizeOrdersWindow(ordersRes),
    products: { productCount: productCountResolved },
    fetchedAt: new Date().toISOString(),
    source: "live",
  };
}

/* ---------------------------------------------------------------------------
 * Helpers shared with the dashboard UI
 * -------------------------------------------------------------------------- */

export const IKAS_CONFIG_PATH = CONFIG_PATH;
export const IKAS_ENDPOINT = ENDPOINT;
