/**
 * `Unified progress import — markdown variant` panel.
 *
 * Closes the third restore path on the operator-handoff side. The
 * Move #128.af ship (earlier) gave operators a JSON download + Move #128.ag
 * a JSON-import panel — but many teammates communicate via plain
 * markdown (Notion tables, Slack threads, GitHub issues, Linear docs).
 * This panel accepts a markdown paste, recognizes playbook-bullet /
 * move-bullet / override-line patterns, and writes the same 3 trackers
 * to localStorage via the canonical `saveTop10Shipped` /
 * `saveShippedPlaybooks` / `saveNextMoveOverride` APIs.
 *
 * Mirrors `progress-import-button.tsx` line-for-line so a future reader
 * who learns one side learns the other. The two panels share the same
 * `<details>` open/close behavior, the same green ✓ / red ✗ badges, the
 * same MERGE-vs-REPLACE radio picker, and the same Restore-with-confirm
 * flow. Difference: this one shows the markdown parser's per-block row
 * counts (playbook bullets vs Move #N bullets vs override line) in the
 * preview.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  parseProgressMarkdownImport,
  type ProgressMarkdownImportSummary,
} from "@/lib/progress-import-markdown";
import { applyProgressImport } from "@/lib/progress-import";
import { resolvePlaybookLinksForMove } from "@/lib/top10-playbook-mapping";
import type { Playbook, Top10Status } from "@/lib/content";

interface ProgressImportMarkdownButtonProps {
  /** Playbooks from content.json — used to validate markdown slug rows
   *  + to render preview titles. */
  playbooks: Playbook[];
  /** Top-10 status rows from content.json — used to map rank → canonical
   *  "N. Name" display string the JSON exporter uses. */
  top10Status: Top10Status[];
}

const STORAGE_KEY_TOP10 = "ecom-ops:top10-shipped:v1";
const STORAGE_KEY_SHIPPED = "ecom-ops:shipped-playbooks:v1";

function loadTop10Shipped(): Record<string, { shippedAt: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_TOP10);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, { shippedAt: string }> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (!v || typeof v !== "object") continue;
      const shippedAt = (v as { shippedAt?: unknown }).shippedAt;
      if (typeof shippedAt !== "string") continue;
      out[k] = { shippedAt };
    }
    return out;
  } catch {
    return {};
  }
}

function saveTop10Shipped(map: Record<string, { shippedAt: string }>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_TOP10, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent("ecom-ops:top10-shipped:update", { detail: map }),
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY_TOP10,
        newValue: JSON.stringify(map),
      }),
    );
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function loadShippedPlaybooks(): Record<
  string,
  { shippedAt: string; notes?: string }
> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SHIPPED);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, { shippedAt: string; notes?: string }> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (!v || typeof v !== "object") continue;
      const shippedAt = (v as { shippedAt?: unknown }).shippedAt;
      if (typeof shippedAt !== "string") continue;
      out[k] = {
        shippedAt,
        notes: typeof (v as { notes?: unknown }).notes === "string"
          ? (v as { notes: string }).notes
          : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

function saveShippedPlaybooks(
  map: Record<string, { shippedAt: string; notes?: string }>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SHIPPED, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent("ecom-ops:shipped-playbooks:update", { detail: map }),
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY_SHIPPED,
        newValue: JSON.stringify(map),
      }),
    );
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function saveOverride(moveId: string, reason: string | undefined): void {
  if (typeof window === "undefined") return;
  const value = {
    moveId,
    setAt: new Date().toISOString(),
    reason: reason && reason.trim() ? reason.trim() : undefined,
  };
  try {
    window.localStorage.setItem(
      "ecom-ops:next-move-override:v1",
      JSON.stringify(value),
    );
    window.dispatchEvent(
      new CustomEvent("ecom-ops:next-move-override:update", {
        detail: value,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function ProgressImportMarkdownButton(props: ProgressImportMarkdownButtonProps) {
  const { playbooks, top10Status } = props;
  const playbookSlugSet = useMemo(() => {
    const out = new Set<string>();
    for (const p of playbooks) {
      const slug = p.file.replace(/\.md$/, "");
      out.add(slug);
    }
    return out;
  }, [playbooks]);

  // Build the rank → "N. Name" map the markdown parser needs so the
  // constructed payload's `move` field uses the same shape the JSON
  // exporter uses (and that TOP10_PLAYBOOK_MAP keys against). Each row
  // in content.top10.status has `move` like "1. Abandoned cart flow".
  const top10Names = useMemo(() => {
    const out: Record<number, string> = {};
    for (const s of top10Status) {
      const m = /^(\d+)\.\s*/.exec(s.move);
      if (m && m[1]) {
        const rank = parseInt(m[1], 10);
        out[rank] = s.move;
      }
    }
    return out;
  }, [top10Status]);

  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [restored, setRestored] = useState<null | {
    top10Changed: number;
    shippedPlaybooksChanged: number;
    overrideReplaced: boolean;
  }>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Live validation — runs on every keystroke against the canonical
  // catalog. Mirrors `progress-import-button.tsx`'s pattern so the UI
  // updates identically.
  const summary: ProgressMarkdownImportSummary = useMemo(
    () =>
      parseProgressMarkdownImport({
        text,
        knownPlaybookSlugs: playbookSlugSet,
        top10Names,
      }),
    [text, playbookSlugSet, top10Names],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  const onRestore = () => {
    if (!summary.ok || !summary.payload) return;
    const cur10 = loadTop10Shipped();
    const curSp = loadShippedPlaybooks();
    const result = applyProgressImport({
      payload: summary.payload,
      currentTop10Shipped: cur10,
      currentShippedPlaybooks: curSp,
      replace: mode === "replace",
    });
    saveTop10Shipped(result.nextTop10Shipped);
    saveShippedPlaybooks(result.nextShippedPlaybooks);
    if (result.nextOverride && summary.overrideValidAgainstCurrent) {
      saveOverride(result.nextOverride.moveId, result.nextOverride.reason);
    }
    setRestored({
      top10Changed: result.top10Changed,
      shippedPlaybooksChanged: result.shippedPlaybooksChanged,
      overrideReplaced: result.overrideReplaced,
    });
    setText("");
    setOpen(false);
  };

  // Compute playbook-title preview for the top10 rows so the operator
  // sees what each Move #N resolves to in the live catalog. The payload
  // already stores the canonical "N. Name" string (looked up from
  // content.top10.status at parse time), so `resolvePlaybookLinksForMove`
  // hits the TOP10_PLAYBOOK_MAP directly.
  const top10PreviewTitles = useMemo(() => {
    if (!summary.ok || !summary.payload) return [];
    return summary.payload.top10.rows.map((r) => ({
      moveName: r.move,
      links: resolvePlaybookLinksForMove(r.move),
    }));
  }, [summary]);

  // Sample markdown — shown as a "fill in like this" hint when the
  // textarea is empty. Matches what the operator would paste from
  // Notion / Slack / a teammate's GitHub issue.
  const sampleMarkdown = `# Ecom-ops handoff — ${new Date().toISOString().slice(0, 10)}
## Shipped playbooks
- [x] 01-abandoned-cart-flow-klaviyo — 2026-09-10 — live for 2 weeks
- [x] 04-welcome-series-klaviyo — 2026-09-12
## Shipped Top-10 moves
- [x] Move #1 — abandoned cart flow
- [x] Move #3 — checkout audit baymard
## Override
Pinned Move #2 instead of #1 — checkout audit is more urgent this week`;

  return (
    <div className="rounded border border-dashed border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            Markdown
          </Badge>
          <h3 className="text-sm font-semibold">Import handoff from markdown</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setRestored(null);
          }}
          aria-expanded={open}
          aria-controls="progress-import-markdown-panel"
          data-testid="progress-import-markdown-toggle"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
        >
          {open ? "× Close" : "↓ Paste markdown"}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Restore your Top-10 shipped + shipped-playbooks + override from a
        pasted Notion table / Slack thread / GitHub issue. Recognizes{" "}
        <code className="rounded bg-muted px-1 py-0.5">- [x] slug</code>{" "}
        playbook bullets, <code className="rounded bg-muted px-1 py-0.5">- [x] Move #N</code>{" "}
        move bullets, and an optional{" "}
        <code className="rounded bg-muted px-1 py-0.5">## Override</code> block.
      </p>

      {restored ? (
        <div
          data-testid="progress-import-markdown-restored"
          className="rounded border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 text-xs"
        >
          ✓ Restored{" "}
          <span className="font-medium tabular-nums">
            {restored.top10Changed} Top-10
          </span>{" "}
          +{" "}
          <span className="font-medium tabular-nums">
            {restored.shippedPlaybooksChanged} playbooks
          </span>
          {restored.overrideReplaced ? " + override" : ""}
          {mode === "replace" ? " (replace mode)" : " (merge mode)"}.
          All cross-page widgets have re-synced.
        </div>
      ) : null}

      {open && hydrated ? (
        <details
          id="progress-import-markdown-panel"
          data-testid="progress-import-markdown-panel"
          open
          className="rounded border border-border/60 bg-background/60 p-3"
        >
          <summary className="text-xs font-medium cursor-pointer">
            Paste a markdown handoff below
          </summary>

          <div className="mt-3 space-y-3">
            <textarea
              ref={textareaRef}
              data-testid="progress-import-markdown-textarea"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setRestored(null);
              }}
              rows={8}
              placeholder={sampleMarkdown}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              spellCheck={false}
            />

            {text.trim().length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                Empty — paste a markdown table, bullet list, or Slack thread above.
                Sample template:{" "}
                <button
                  type="button"
                  onClick={() => setText(sampleMarkdown)}
                  className="underline hover:text-foreground"
                  data-testid="progress-import-markdown-fill-sample"
                >
                  fill sample
                </button>
                .
              </p>
            ) : summary.ok ? (
              <div
                data-testid="progress-import-markdown-validation"
                className="rounded border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    ✓ Markdown parsed
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {summary.playbookRows} playbook{summary.playbookRows === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {summary.top10Rows} Move{summary.top10Rows === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    override:{" "}
                    {summary.overrideRow
                      ? summary.overrideValidAgainstCurrent
                        ? "✓ valid"
                        : "✗ retired move — will be skipped"
                      : "—"}
                  </Badge>
                </div>
                {summary.previewLines.length > 0 ? (
                  <ul className="list-disc pl-4 text-[11px] text-foreground/80 space-y-0.5 max-h-40 overflow-y-auto">
                    {summary.previewLines.map((line, i) => (
                      <li key={i}>
                        <code className="rounded bg-muted px-1 py-0.5">{line}</code>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {top10PreviewTitles.length > 0 ? (
                  <div className="rounded border border-border/60 bg-background/60 p-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Move resolution preview
                    </div>
                    <ul className="mt-1 list-disc pl-4 text-[11px] space-y-0.5">
                      {top10PreviewTitles.map((t, i) => (
                        <li key={i}>
                          <code className="rounded bg-muted px-1 py-0.5">
                            {t.moveName}
                          </code>{" "}
                          → {t.links.length > 0 ? (
                            <span>
                              {t.links.map((l) => l.title).join(" · ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              (no playbook linked)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {summary.skippedLines.length > 0 ? (
                  <details className="rounded border border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 p-2">
                    <summary className="text-[11px] font-medium cursor-pointer">
                      ⚠ {summary.skippedLines.length} skipped line
                      {summary.skippedLines.length === 1 ? "" : "s"}
                    </summary>
                    <ul className="mt-1 list-disc pl-4 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5">
                      {summary.skippedLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : (
              <div
                data-testid="progress-import-markdown-validation"
                className="rounded border border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20 p-2 text-xs"
              >
                <span className="font-semibold text-rose-700 dark:text-rose-300">
                  ✗ {summary.error}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <fieldset className="flex items-center gap-2 text-xs">
                <legend className="sr-only">Import mode</legend>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="progress-import-markdown-mode"
                    value="merge"
                    checked={mode === "merge"}
                    onChange={() => setMode("merge")}
                    data-testid="progress-import-markdown-mode-merge"
                  />
                  <span>Merge (add to existing)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="progress-import-markdown-mode"
                    value="replace"
                    checked={mode === "replace"}
                    onChange={() => setMode("replace")}
                    data-testid="progress-import-markdown-mode-replace"
                  />
                  <span>Replace (overwrite)</span>
                </label>
              </fieldset>

              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(
                      `Restore ${summary.playbookRows} playbook${
                        summary.playbookRows === 1 ? "" : "s"
                      } + ${summary.top10Rows} move${
                        summary.top10Rows === 1 ? "" : "s"
                      }${
                        summary.overrideRow && summary.overrideValidAgainstCurrent
                          ? " + override"
                          : ""
                      } in ${mode} mode?`,
                    )
                  ) {
                    onRestore();
                  }
                }}
                disabled={!summary.ok}
                data-testid="progress-import-markdown-restore"
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
              >
                Restore markdown
              </button>

              <button
                type="button"
                onClick={() => {
                  setText("");
                  setRestored(null);
                }}
                data-testid="progress-import-markdown-clear"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
}
