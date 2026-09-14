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
  ShippedMap,
  formatShippedAt,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

/**
 * `Recently shipped playbooks` — cross-page intelligence card on `/`.
 *
 * Mirrors the `Top10ShippedOverviewCard` pattern: reads the canonical
 * `ecom-ops:shipped-playbooks:v1` localStorage key that the tracker on
 * `/playbooks` writes to, and surfaces the operator's last 3 shipped
 * playbooks as a compact card on the home page.
 *
 * Why this matters: the operator now sees their shipped work without
 * leaving the home page. The Realized ROI panel already shows the
 * dollar value; this card shows the human context (which playbooks,
 * when, what they learned from shipping them).
 *
 * Sync:
 *   - `storage` event → cross-tab (open `/playbooks` in tab A, mark
 *     shipped, the home page in tab B updates).
 *   - Custom DOM event `ecom-ops:shipped-playbooks:update` →
 *     same-tab (the user toggles a row in the same browser tab).
 *     (Emitted by the writer; we listen for it here.)
 *
 * Tone:
 *   - 1 shipped → muted dashed border (just getting started).
 *   - 2–4 → sky (rolling).
 *   - 5+ → emerald (scaling).
 *   - 0 → component renders nothing (no empty state pollution).
 */

interface PlaybookRow {
  id: string;
  title: string;
}

interface RecentlyShippedPlaybooksCardProps {
  playbooks: PlaybookRow[];
  /** Max rows to render in the card body. Default 3. */
  maxRows?: number;
}

const STORAGE_KEY = "ecom-ops:shipped-playbooks:v1";
const UPDATE_EVENT = "ecom-ops:shipped-playbooks:update";

function shippedTone(count: number): {
  tone: string;
  label: string;
  intent: "starter" | "rolling" | "scaling";
} {
  if (count >= 5) {
    return {
      tone: "border-emerald-500/40 bg-emerald-500/5",
      label: "scaling",
      intent: "scaling",
    };
  }
  if (count >= 2) {
    return {
      tone: "border-sky-500/40 bg-sky-500/5",
      label: "rolling",
      intent: "rolling",
    };
  }
  return {
    tone: "border-dashed bg-muted/30",
    label: "just starting",
    intent: "starter",
  };
}

function relativeDay(iso: string): string {
  const shipped = new Date(iso);
  if (Number.isNaN(shipped.getTime())) return "";
  const now = Date.now();
  const diffMs = now - shipped.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function RecentlyShippedPlaybooksCard({
  playbooks,
  maxRows = 3,
}: RecentlyShippedPlaybooksCardProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setShipped(loadShippedPlaybooks());
      }
    };
    const onUpdate = () => {
      setShipped(loadShippedPlaybooks());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, onUpdate);
    };
  }, []);

  const titleById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of playbooks) m[p.id] = p.title;
    return m;
  }, [playbooks]);

  const recent = useMemo(() => {
    const ids = Object.keys(shipped);
    return ids
      .map((id) => ({
        id,
        title: titleById[id] ?? id,
        shippedAt: shipped[id].shippedAt,
        notes: shipped[id].notes,
      }))
      .sort((a, b) => (a.shippedAt < b.shippedAt ? 1 : -1))
      .slice(0, maxRows);
  }, [shipped, titleById, maxRows]);

  // Don't render at all until hydrated AND there is at least 1 shipped.
  if (!hydrated || recent.length === 0) return null;

  const totalShipped = Object.keys(shipped).length;
  const tone = shippedTone(totalShipped);

  return (
    <Card
      id="recently-shipped-playbooks"
      className={cn("border-2 transition-colors", tone.tone)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-base">
              Recently shipped playbooks
            </CardTitle>
            <CardDescription>
              Your last {recent.length} shipped {recent.length === 1 ? "playbook" : "playbooks"} from{" "}
              <a className="underline hover:text-foreground" href="/playbooks#shipped-progress">
                /playbooks
              </a>
              . {totalShipped > recent.length && (
                <span className="text-muted-foreground">
                  {" "}({totalShipped - recent.length} older shipped)
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {totalShipped} total · {tone.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {recent.map((row, i) => (
            <li
              key={row.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-card p-3",
              )}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] tabular-nums">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <a
                    href={`/playbooks#${row.id}`}
                    className="text-sm font-medium leading-tight underline-offset-2 hover:underline"
                  >
                    {row.title}
                  </a>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
                    {formatShippedAt(row.shippedAt)} · {relativeDay(row.shippedAt)}
                  </span>
                </div>
                {row.notes ? (
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {row.notes}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic leading-snug">
                    No note — click to add one on /playbooks.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Synced from your browser — toggle on{" "}
            <a className="underline hover:text-foreground" href="/playbooks#shipped-progress">
              /playbooks
            </a>
            .
          </p>
          <a
            href="/playbooks#shipped-progress"
            className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
          >
            Open tracker <span aria-hidden="true">→</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
