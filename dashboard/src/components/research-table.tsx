"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { badgeColor, cn } from "@/lib/utils";

interface ResearchTableProps {
  rows: Array<Record<string, string>>;
  sourceColumn?: string;
  highlightColumns?: string[];
  /**
   * Optional human-readable title shown in the export header and used as the
   * filename for the `.csv` download. Defaults to the first row's first key,
   * or `research-table` when no rows are present.
   */
  exportTitle?: string;
}

/**
 * Escape a cell for CSV (RFC 4180):
 *   - Wrap in double-quotes if it contains `,`, `"`, `\n`, or `\r`.
 *   - Escape inner `"` as `""`.
 */
function csvEscape(value: string): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers: string[], rows: Array<Record<string, string>>): string {
  const headerLine = headers.map(csvEscape).join(",");
  const bodyLines = rows.map((r) =>
    headers.map((h) => csvEscape(r[h] ?? "")).join(",")
  );
  return [headerLine, ...bodyLines].join("\r\n") + "\r\n";
}

function rowsToMarkdown(
  title: string,
  headers: string[],
  rows: Array<Record<string, string>>
): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(
    `> Exported from Ecommerce Ops dashboard on ${new Date().toISOString().slice(0, 10)} · ${rows.length} row${rows.length === 1 ? "" : "s"}`
  );
  lines.push("");
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const r of rows) {
    lines.push(
      `| ${headers.map((h) => (r[h] ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ")).join(" | ")} |`
    );
  }
  lines.push("");
  return lines.join("\n");
}

function safeFilename(title: string, ext: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "research-table";
  return `${slug}.${ext}`;
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  // Fallback for environments without the async Clipboard API.
  if (typeof document !== "undefined") {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}

function downloadBlob(filename: string, mime: string, content: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Action = "copy" | "csv" | "md";

export function ResearchTable({
  rows,
  sourceColumn,
  highlightColumns = [],
  exportTitle,
}: ResearchTableProps) {
  const headers = useMemo(
    () =>
      Array.from(
        rows.reduce<Set<string>>((set, r) => {
          Object.keys(r).forEach((k) => set.add(k));
          return set;
        }, new Set())
      ),
    [rows]
  );
  // Detect "Source" column to render as a badge.
  const sourceKey = sourceColumn ?? headers.find((h) => /source/i.test(h));

  const title = exportTitle ?? headers[0] ?? "research-table";
  const csvText = useMemo(
    () => rowsToCsv(headers, rows),
    [headers, rows]
  );
  const mdText = useMemo(
    () => rowsToMarkdown(title, headers, rows),
    [title, headers, rows]
  );

  const [confirmation, setConfirmation] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (action: Action) => {
    setConfirmation(action);
    setError(null);
    window.setTimeout(() => setConfirmation(null), 1500);
  };

  const onCopy = async () => {
    // Tab-separated values paste cleanly into Google Sheets + Excel + Notion
    // tables without quoting artifacts. Default to TSV — operators live in
    // spreadsheets, not CSV-aware tooling.
    const tsv = headers.join("\t") + "\n" +
      rows.map((r) => headers.map((h) => (r[h] ?? "").replace(/\t/g, " ")).join("\t")).join("\n");
    const ok = await writeToClipboard(tsv);
    if (ok) flash("copy");
    else setError("Clipboard blocked — try the CSV download instead.");
  };

  const onCsv = () => {
    downloadBlob(safeFilename(title, "csv"), "text/csv", csvText);
    flash("csv");
  };

  const onMd = () => {
    downloadBlob(safeFilename(title, "md"), "text/markdown", mdText);
    flash("md");
  };

  if (!rows.length) return null;

  const baseButton =
    "inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {rows.length} row{rows.length === 1 ? "" : "s"} · {headers.length} column{headers.length === 1 ? "" : "s"}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy ${title} as tab-separated values`}
            title="Paste straight into Google Sheets / Excel / Notion tables"
            className={cn(
              baseButton,
              confirmation === "copy"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span aria-hidden="true">{confirmation === "copy" ? "✓" : "⧉"}</span>
            <span>{confirmation === "copy" ? "Copied TSV" : "Copy"}</span>
          </button>
          <button
            type="button"
            onClick={onCsv}
            aria-label={`Download ${title} as CSV`}
            title="RFC-4180 CSV — opens in Excel, Google Sheets, Numbers"
            className={cn(
              baseButton,
              confirmation === "csv"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span aria-hidden="true">{confirmation === "csv" ? "✓" : "↓"}</span>
            <span>{confirmation === "csv" ? "Downloaded" : "CSV"}</span>
          </button>
          <button
            type="button"
            onClick={onMd}
            aria-label={`Download ${title} as Markdown`}
            title="Markdown table — paste into Notion, Slack, GitHub"
            className={cn(
              baseButton,
              confirmation === "md"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span aria-hidden="true">{confirmation === "md" ? "✓" : "↓"}</span>
            <span>{confirmation === "md" ? "Downloaded" : "Markdown"}</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="text-[10px] text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </div>
      )}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {headers.map((h) => {
                  const cell = r[h] ?? "";
                  if (h === sourceKey) {
                    // Extract confidence tag in [brackets].
                    const m = /\[(verified|directional|rule-of-thumb)\]/i.exec(cell);
                    const tag = m?.[1] ?? cell;
                    return (
                      <TableCell key={h} className="text-xs">
                        <Badge variant="outline" className={badgeColor(tag)}>
                          {tag}
                        </Badge>
                      </TableCell>
                    );
                  }
                  if (highlightColumns.includes(h)) {
                    return (
                      <TableCell key={h} className="font-mono tabular-nums text-xs">
                        {cell}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={h} className="text-xs leading-snug">
                      {cell}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
