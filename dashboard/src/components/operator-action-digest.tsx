"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  OPERATOR_DIGEST_STORAGE_KEYS,
  OPERATOR_DIGEST_UPDATE_EVENTS,
  type DigestAction,
  type DigestResult,
  digestFromInputs,
  loadOperatorDigestInputs,
  type DigestInput,
} from "@/lib/operator-action-digest";

/**
 * `Operator action digest` — Move #N.9 — interactive cross-tool on `/today`.
 *
 * Renders an ordered checklist of prioritized actions synthesized from
 * four storage keys (shipped-playbooks / realized-roi / lifecycle / your-
 * store) plus the build-time Top-10 / playbook catalog.
 *
 * The 5 priority classes (lower number = more urgent):
 *
 *   P0 BLOCK  Lifecycle FAIL flow                  → /lifecycle#<flow-id>
 *   P0 BLOCK  Realized-ROI UNDERWIDE / UNMEASURED  → /playbooks/<id>
 *   P1 ACT    Lifecycle NEEDS_WORK flow            → /lifecycle#<flow-id>
 *   P1 ACT    Top-10 pending move                  → /top-10#move-N
 *   P2 LOG    Shipped, no actuals                  → /playbooks/<id>
 *   P2 LOG    Shipped, confidence=low actuals      → /playbooks/<id>
 *   P3 EDIT   Your-store still on defaults          → /settings
 *
 * Each row shows: kind-tinted dot · title · reason · metric chip ·
 *                 → anchor link.
 *
 * The card caps at 8 actions; the priority-counts strip (`2 BLOCK · 3 ACT ·
 * 1 LOG · 1 EDIT`) shows the true count even when capped, so the operator
 * can see "2 BLOCK actions remain" without scrolling through the whole
 * list.
 *
 * Cross-tab sync: listens to the underlying modules' storage events
 * (`storage` cross-tab) + their same-tab CustomEvents so edits on
 * `/lifecycle` / `/playbooks/[slug]` / `/` Overview propagate to `/today`
 * within ~1 second without a manual reload.
 *
 * Empty state: when the digest is empty AND the operator has touched at
 * least one storage key (everything's done!), the card renders a
 * "You're on track" success state with an "Open Next Move →" CTA — the
 * canonical "don't render an empty 0-todo widget" anti-pattern.
 *
 * Hydration: uses the standard `useState(false)` + `useEffect` mirror
 * so the SSR markup byte-matches the first client render. Pre-hydration
 * the card shows a skeleton of 4 stub rows (deterministic — same on
 * server + client).
 */

interface OperatorActionDigestProps {
  /** Build-time Top-10 pending moves — surfaced as P1 actions. */
  top10PendingMoves: { move: string; status: string }[];
  /** Build-time playbook catalog (id → title) for action labels. */
  playbookTitlesById: Record<string, string>;
}

const KIND_TONE: Record<DigestAction["kind"], { dot: string; chip: string; label: string }> = {
  block: {
    dot: "bg-red-500",
    chip: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    label: "BLOCK",
  },
  act: {
    dot: "bg-amber-500",
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    label: "ACT",
  },
  log: {
    dot: "bg-sky-500",
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    label: "LOG",
  },
  edit: {
    dot: "bg-violet-500",
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    label: "EDIT",
  },
};

const MAX_ACTIONS = 8;

export function OperatorActionDigest({
  top10PendingMoves,
  playbookTitlesById,
}: OperatorActionDigestProps) {
  const [inputs, setInputs] = useState<DigestInput | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    const base = loadOperatorDigestInputs();
    if (base) {
      setInputs({
        ...base,
        top10PendingMoves,
        playbookTitlesById,
      });
    } else {
      setInputs({
        shipped: {},
        realizedRoi: {},
        lifecycleKpis: {},
        yourStore: null,
        top10PendingMoves,
        playbookTitlesById,
      });
    }
    setHydrated(true);
  }, [top10PendingMoves, playbookTitlesById]);

  // Cross-tab sync via `storage` event.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      if (
        e.key === OPERATOR_DIGEST_STORAGE_KEYS.shipped ||
        e.key === OPERATOR_DIGEST_STORAGE_KEYS.realizedRoi ||
        e.key === OPERATOR_DIGEST_STORAGE_KEYS.lifecycle ||
        e.key === OPERATOR_DIGEST_STORAGE_KEYS.yourStore
      ) {
        const base = loadOperatorDigestInputs();
        if (base) {
          setInputs({
            ...base,
            top10PendingMoves,
            playbookTitlesById,
          });
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [top10PendingMoves, playbookTitlesById]);

  // Same-tab sync via the four module-specific CustomEvents.
  useEffect(() => {
    function refresh() {
      const base = loadOperatorDigestInputs();
      if (base) {
        setInputs({
          ...base,
          top10PendingMoves,
          playbookTitlesById,
        });
      }
    }
    const events = [
      OPERATOR_DIGEST_UPDATE_EVENTS.shipped,
      OPERATOR_DIGEST_UPDATE_EVENTS.realizedRoi,
      OPERATOR_DIGEST_UPDATE_EVENTS.lifecycle,
      OPERATOR_DIGEST_UPDATE_EVENTS.yourStore,
    ];
    for (const evt of events) {
      window.addEventListener(evt, refresh);
    }
    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, refresh);
      }
    };
  }, [top10PendingMoves, playbookTitlesById]);

  const digest: DigestResult | null = useMemo(() => {
    if (!inputs) return null;
    return digestFromInputs(inputs);
  }, [inputs]);

  // Pre-hydration stub: deterministic 4-row skeleton so SSR markup
  // matches first client render (no hydration mismatch warning).
  if (!hydrated || !inputs || !digest) {
    return (
      <Card id="operator-action-digest" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />
              <CardTitle className="text-sm font-semibold">
                Operator action digest
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Move #N.9
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            Prioritized actions synthesized from your shipped playbooks,
            realized ROI, lifecycle audit, and Your-store inputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2" data-testid="operator-action-digest-stub">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md border border-border/50 px-3 py-2"
            >
              <span className="mt-1 inline-block h-2 w-2 rounded-sm bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-2/3 rounded bg-muted/50 animate-pulse" />
                <div className="h-2.5 w-1/2 rounded bg-muted/30 animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="operator-action-digest" className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />
            <CardTitle className="text-sm font-semibold">
              Operator action digest
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Move #N.9
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
            <span data-testid="operator-action-digest-block-count" className="text-red-600 dark:text-red-400">
              {digest.blockCount} BLOCK
            </span>
            <span aria-hidden="true">·</span>
            <span data-testid="operator-action-digest-act-count" className="text-amber-600 dark:text-amber-400">
              {digest.actCount} ACT
            </span>
            <span aria-hidden="true">·</span>
            <span data-testid="operator-action-digest-log-count" className="text-sky-600 dark:text-sky-400">
              {digest.logCount} LOG
            </span>
            <span aria-hidden="true">·</span>
            <span data-testid="operator-action-digest-edit-count" className="text-violet-600 dark:text-violet-400">
              {digest.editCount} EDIT
            </span>
          </div>
        </div>
        <CardDescription className="text-xs">
          What to work on next, ordered by urgency. Synthesized from your
          shipped playbooks, realized ROI, lifecycle audit, and Your-store
          inputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {digest.actions.length === 0 ? (
          digest.isAllClean ? (
            <div
              data-testid="operator-action-digest-clean"
              className="flex flex-col items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  You&apos;re on track.
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lifecycle flows are healthy, realized ROI is logged, Your-
                store is set, and no Top-10 moves are pending. Open Next
                Move for the next play.
              </p>
              <Link
                href="/top-10"
                className="text-[10px] uppercase tracking-wider text-foreground hover:underline"
              >
                Open Next Move →
              </Link>
            </div>
          ) : (
            <div
              data-testid="operator-action-digest-empty"
              className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground"
            >
              Start by shipping a playbook and connecting Your-store.
              This digest fills up as your state grows.
            </div>
          )
        ) : (
          <ul
            data-testid="operator-action-digest-list"
            className="flex flex-col gap-2"
          >
            {digest.actions.map((action, idx) => {
              const tone = KIND_TONE[action.kind];
              return (
                <li
                  key={action.id}
                  data-testid="operator-action-digest-item"
                  data-action-kind={action.kind}
                  data-action-priority={action.priority}
                  className="rounded-md border border-border/60 px-3 py-2"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={cn("mt-1.5 inline-block h-2 w-2 rounded-sm", tone.dot)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          data-testid="operator-action-digest-kind-chip"
                          className={cn(
                            "rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider tabular-nums",
                            tone.chip
                          )}
                        >
                          {tone.label}
                        </span>
                        <Link
                          href={action.href}
                          className="text-sm font-medium text-foreground hover:underline"
                          data-testid="operator-action-digest-title"
                        >
                          {action.title}
                        </Link>
                        <Badge
                          variant="outline"
                          className="ml-auto text-[10px] tabular-nums"
                        >
                          {action.metricLabel}: {action.metricValue}
                        </Badge>
                      </div>
                      <p
                        data-testid="operator-action-digest-reason"
                        className="text-xs text-muted-foreground leading-snug"
                      >
                        {action.reason}
                      </p>
                    </div>
                  </div>
                  {idx < digest.actions.length - 1 && (
                    <Separator className="mt-2 hidden" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex items-center justify-between gap-2 pt-2 text-[10px] text-muted-foreground">
          <span className="font-mono">
            storage: {Object.values(OPERATOR_DIGEST_STORAGE_KEYS).length} keys ·
            shows top {Math.min(digest.actions.length, MAX_ACTIONS)} of{" "}
            {digest.blockCount + digest.actCount + digest.logCount + digest.editCount}
          </span>
          <CopyButton
            value={digestToMarkdown(digest)}
            label="Copy as Slack"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Serialize the digest to a Slack-paste-friendly markdown block.
 * Operator pastes this into #team-marketing for a daily check-in.
 */
function digestToMarkdown(digest: DigestResult): string {
  if (digest.actions.length === 0) {
    return digest.isAllClean
      ? "_Operator action digest · no blockers · everything on track._"
      : "_Operator action digest · empty · ship a playbook + set Your-store to start._";
  }
  const lines: string[] = ["**Operator action digest** · Move #N.9", ""];
  for (const action of digest.actions) {
    lines.push(`- **[${action.kind.toUpperCase()}]** ${action.title} — ${action.metricLabel}: ${action.metricValue} — ${action.href}`);
    lines.push(`  ${action.reason}`);
  }
  lines.push("");
  lines.push(
    `_${digest.blockCount} BLOCK · ${digest.actCount} ACT · ${digest.logCount} LOG · ${digest.editCount} EDIT_`
  );
  return lines.join("\n");
}