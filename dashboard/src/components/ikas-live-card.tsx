/**
 * "Live Ikas — your store at a glance" card on `/`.
 *
 * Reads the live store overview from `/api/ikas/overview` and surfaces:
 *   - Store identity (merchant name, store name, email)
 *   - Last-30-day order count, revenue, average order value
 *   - Active product count
 *   - One-click "Apply live numbers to Your-store" → writes AOV + monthly
 *     orders into the same `ecom-ops:your-store:v1` localStorage key the
 *     rest of the dashboard already reads (no schema change required).
 *   - On expired / missing-config errors, renders a copy-pasteable refresh
 *     recipe instead of fabricated numbers.
 *
 * Storage key: reuses `ecom-ops:your-store:v1` from `your-store.ts`.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  YOUR_STORE_STORAGE_KEY,
  YOUR_STORE_DEFAULTS,
  loadYourStore,
  saveYourStore,
  type YourStoreInputs,
} from "@/lib/your-store";
import type {
  IkasStoreResultUi,
  IkasStoreOverviewUi,
  IkasStoreErrorUi,
} from "@/lib/ikas-ui";
import { formatIkasRevenue } from "@/lib/ikas-ui";

type FetchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "live"; data: IkasStoreOverviewUi }
  | { kind: "error"; error: IkasStoreErrorUi };

function ReloadButton(props: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label="Reload Ikas overview"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
    >
      ↻ Reload
    </button>
  );
}

export function IkasLiveCard() {
  const [state, setState] = useState<FetchState>({ kind: "idle" });
  const [yourStore, setYourStore] = useState<YourStoreInputs | null>(null);
  const [applied, setApplied] = useState(false);

  const fetchOverview = async () => {
    setState({ kind: "loading" });
    setApplied(false);
    try {
      const r = await fetch("/api/ikas/overview", { cache: "no-store" });
      const json = (await r.json()) as IkasStoreResultUi;
      if (json.ok) {
        setState({ kind: "live", data: json });
      } else {
        setState({ kind: "error", error: json });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState({
        kind: "error",
        error: { ok: false, reason: "network", message },
      });
    }
  };

  useEffect(() => {
    setYourStore(loadYourStore());
    void fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive the projected feed into Your-store — clamped the same way Your-store
  // expects (aov >= 1, orders >= 1, margin 0.05..0.95). Margin defaults to the
  // canonical 70% when not present in the live data (grossMargin isn't on the
  // Admin GraphQL `Order` fields, so we ask the operator later).
  const projectedForYourStore = useMemo<YourStoreInputs | null>(() => {
    if (state.kind !== "live") return null;
    const { averageOrderValueUsd, orderCount30d } = state.data.orders;
    const aov = Math.max(1, Math.round(averageOrderValueUsd));
    const monthlyOrders = Math.max(1, Math.round(orderCount30d));
    return {
      aov,
      monthlyOrders,
      grossMargin: yourStore?.grossMargin ?? YOUR_STORE_DEFAULTS.grossMargin,
    };
  }, [state, yourStore]);

  const applyToYourStore = () => {
    if (!projectedForYourStore) return;
    try {
      saveYourStore(projectedForYourStore);
      setYourStore(projectedForYourStore);
      setApplied(true);
      // Broadcast a `storage` event so other open tabs pick up the change too.
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: YOUR_STORE_STORAGE_KEY,
          newValue: JSON.stringify(projectedForYourStore),
        }),
      );
    } catch {
      /* ignore quota / private-mode errors */
    }
  };

  const merchantLabel = (d: IkasStoreOverviewUi["merchant"]) =>
    d.merchantName || d.storeName || d.email;

  return (
    <Card id="ikas-live" className="border-dashed border-success/40 bg-success/5">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Live Ikas data</span>
            <Separator orientation="vertical" className="h-3" />
            <span className="text-foreground">read from /data/.ikas/config.json on the VPS</span>
          </div>
          <CardTitle className="mt-2 text-lg">Your store at a glance</CardTitle>
          <CardDescription>
            Live numbers pulled from the Ikas Admin GraphQL — order count, revenue, average
            order value, and product count for the last 30 days. Click{" "}
            <span className="font-medium text-foreground">Apply to Your-store</span> to feed
            every ROI calculator on the dashboard in one click.
          </CardDescription>
        </div>
        <ReloadButton
          onClick={() => void fetchOverview()}
          disabled={state.kind === "loading"}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {state.kind === "loading" || state.kind === "idle" ? (
          <div className="rounded border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            Contacting <code className="rounded bg-muted px-1 py-0.5">api.myikas.com</code>…
          </div>
        ) : state.kind === "live" ? (
          <LiveSummary
            data={state.data}
            projected={projectedForYourStore}
            applied={applied}
            onApply={applyToYourStore}
            merchantLabel={merchantLabel(state.data.merchant)}
          />
        ) : (
          <ErrorPanel
            error={state.error}
            onRetry={() => void fetchOverview()}
            yourStore={yourStore}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Live summary
 * -------------------------------------------------------------------------- */

interface LiveSummaryProps {
  data: IkasStoreOverviewUi;
  projected: YourStoreInputs | null;
  applied: boolean;
  onApply: () => void;
  merchantLabel: string;
}

function LiveSummary(props: LiveSummaryProps) {
  const { data, projected, applied, onApply, merchantLabel } = props;
  const aov = Math.round(data.orders.averageOrderValueUsd);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-semibold">{merchantLabel}</h3>
        <Badge variant="success" className="text-[10px] uppercase tracking-wide">
          Live
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums">
          refreshed {new Date(data.fetchedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label="Orders · 30d"
          value={data.orders.orderCount30d.toLocaleString()}
          hint={data.orders.orderCount30d === 0 ? "no orders in window" : "last 30 days"}
        />
        <StatTile
          label="Revenue · 30d"
          value={formatIkasRevenue(data.orders.revenue30dUsd, data.orders.currency)}
          hint={data.orders.currency ? `currency ${data.orders.currency}` : "currency unknown"}
        />
        <StatTile
          label="Avg order value"
          value={`${data.orders.currency ? data.orders.currency + " " : ""}${aov.toLocaleString()}`}
          hint={aov > 0 ? `${data.orders.orderCount30d} orders` : "—"}
        />
        <StatTile
          label="Active products"
          value={data.products.productCount.toLocaleString()}
          hint={data.products.productCount === 0 ? "no products" : "catalog count"}
        />
      </div>

      <div className="rounded border border-border/60 bg-background/60 p-3">
        <div className="text-xs text-muted-foreground">Apply live numbers</div>
        <p className="mt-1 text-sm text-foreground">
          Feed every ROI calculator (abandoned-cart, post-purchase upsell, welcome series,
          30-day plan, next-move) with the live AOV and 30-day order count from your Ikas
          store. Gross margin defaults to the canonical <span className="font-medium">70%</span>
          — edit it on the Your-store card afterwards if your business unit economics differ.
        </p>
        {projected ? (
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>
              AOV <span className="font-medium text-foreground tabular-nums">${projected.aov}</span>
            </span>
            <span>
              Orders/mo <span className="font-medium text-foreground tabular-nums">{projected.monthlyOrders}</span>
            </span>
            <span>
              Margin <span className="font-medium text-foreground tabular-nums">{Math.round(projected.grossMargin * 100)}%</span>
            </span>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={applied || !projected}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            aria-label="Apply live Ikas numbers to Your store"
          >
            {applied ? "✓ Applied to Your-store" : "Apply to Your-store"}
          </button>
          {applied ? (
            <span className="text-xs text-muted-foreground">
              Saved to <code className="rounded bg-muted px-1 py-0.5">{YOUR_STORE_STORAGE_KEY}</code>. All
              ROI calculators on /playbooks already pick this up.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatTile(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded border border-border/60 bg-background/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{props.value}</div>
      {props.hint ? (
        <div className="text-[10px] text-muted-foreground">{props.hint}</div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Error / expired / missing-config panel
 * -------------------------------------------------------------------------- */

function ErrorPanel(props: {
  error: IkasStoreErrorUi;
  onRetry: () => void;
  yourStore: YourStoreInputs | null;
}) {
  const { error, onRetry } = props;
  const recipe = refreshRecipe(error.reason);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-semibold text-foreground">Ikas data unavailable</h3>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
          {labelForReason(error.reason)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="rounded border border-border/60 bg-background/60 p-3">
        <div className="text-xs font-medium text-foreground">Refresh recipe</div>
        <ol className="mt-2 list-decimal pl-5 text-xs text-muted-foreground space-y-1">
          {recipe.map((line, i) => (
            <li key={i}>
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">{line}</code>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[10px] text-muted-foreground">
          The route is{" "}
          <a className="underline hover:text-foreground" href="/api/ikas/overview">
            <code>/api/ikas/overview</code>
          </a>{" "}
          — it re-attempts the GraphQL call on every refresh, so once the new
          token is in place, click ↻ Reload and the numbers light up.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
      >
        ↻ Retry
      </button>
    </div>
  );
}

function labelForReason(reason: IkasStoreErrorUi["reason"]): string {
  switch (reason) {
    case "expired":
      return "Token expired";
    case "missing-config":
      return "No config";
    case "network":
      return "Network error";
    case "graphql-error":
      return "API error";
    case "io-error":
      return "File error";
    default:
      return "Error";
  }
}

function refreshRecipe(reason: IkasStoreErrorUi["reason"]): string[] {
  switch (reason) {
    case "expired":
      return [
        `ikas auth login          # on the operator's machine; completes PKCE browser OAuth`,
        `cp /data/.ikas/config.json /tmp/ikas-config.bak`,
        `# paste the refreshed accessToken into /data/.ikas/config.json`,
        `# reload the dashboard — the card auto-refreshes the live numbers`,
      ];
    case "missing-config":
      return [
        `ikas auth login          # one-time OAuth; writes /data/.ikas/config.json`,
        `# reload the dashboard — the card will read the new partner token`,
      ];
    case "network":
      return [
        `# confirm outbound network from the VPS`,
        `curl -sS https://api.myikas.com/api/v1/admin/graphql -d '{"query":"{ __typename }"}'`,
        `# retry the card once connectivity is restored`,
      ];
    case "graphql-error":
      return [
        `# inspect the route response for the underlying GraphQL error`,
        `curl -sS https://api.myikas.com/api/v1/admin/graphql \\`,
        `  -H 'Authorization: Bearer $(jq -r .accessToken /data/.ikas/config.json)' \\`,
        `  -d '{"query":"{ listOrder { count } }"}'`,
      ];
    case "io-error":
      return [
        `# verify the config file is well-formed JSON`,
        `jq . /data/.ikas/config.json`,
        `# expected: { "accessToken": "eyJhb...", "refreshToken": "..." }`,
      ];
    default:
      return ["# click ↻ Retry after fixing the upstream cause"];
  }
}
