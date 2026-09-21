"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShippedMap,
  formatShippedAt,
  loadShippedPlaybooks,
  saveShippedPlaybooks,
  setShippedNotes,
  toggleShipped,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

/**
 * `Mark playbook as shipped` — interactive one-click action + state-
 * persistence toggle on the `/playbooks/[slug]` detail page.
 *
 * Reads + writes the same `ecom-ops:shipped-playbooks:v1` localStorage key
 * the `/playbooks` index tracker + `/` "Recently shipped" card already
 * use. Click the button → immediately reflects on the index (no page
 * navigation required). Notes field lets the operator record a one-line
 * outcome ("shipped to dev store 2026-08-01; Klaviyo flow live; first 18%
 * lift in week 1") that surfaces back on the index tracker.
 *
 * Cross-component sync via the "ecom-ops:shipped-playbooks:update" custom
 * event so any open `/playbooks` tab refreshes its badge the moment the
 * toggle flips here.
 */

interface PlaybookShippedToggleProps {
  playbookId: string;
  playbookTitle: string;
}

export function PlaybookShippedToggle({
  playbookId,
  playbookTitle,
}: PlaybookShippedToggleProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount so the SSR markup matches the first client render
  // (server has no localStorage → renders the "not shipped" empty state).
  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Persist + cross-component notify on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    saveShippedPlaybooks(shipped);
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("ecom-ops:shipped-playbooks:update", {
            detail: { count: Object.keys(shipped).length },
          })
        );
      } catch {
        /* ignore */
      }
    }
  }, [shipped, hydrated]);

  const entry = shipped[playbookId];

  function handleToggle() {
    setShipped((m) => toggleShipped(m, playbookId));
  }

  function handleNotesChange(value: string) {
    setShipped((m) => setShippedNotes(m, playbookId, value));
  }

  return (
    <Card className={cn(
      "transition-colors",
      entry
        ? "border-emerald-500/40 bg-emerald-500/5"
        : "border-dashed"
    )}>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={Boolean(entry)}
            aria-label={entry ? "Mark as not shipped" : "Mark as shipped"}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              entry
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "border border-border bg-background hover:bg-muted"
            )}
          >
            <span aria-hidden="true">{entry ? "✓" : "○"}</span>
            <span>{entry ? "Shipped" : "Mark as shipped"}</span>
          </button>
          {entry ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              Shipped {formatShippedAt(entry.shippedAt)}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              Records date + optional notes to <code className="rounded bg-muted px-1">localStorage</code>{" "}
              — survives reloads and is visible on the /playbooks index.
            </span>
          )}
        </div>
        {entry ? (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Notes (optional)
            </span>
            <textarea
              value={entry.notes ?? ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`e.g. "shipped to dev store 2026-08-01; ${playbookTitle.slice(0, 40)}… live; first 18% lift in week 1"`}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs leading-relaxed outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
          </label>
        ) : null}
      </CardContent>
    </Card>
  );
}
