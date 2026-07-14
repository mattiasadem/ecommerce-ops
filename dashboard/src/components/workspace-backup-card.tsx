"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildWorkspaceBackup,
  parseWorkspaceBackup,
  restoreWorkspaceBackup,
} from "@/lib/workspace-backup";

type Status =
  | { tone: "success"; message: string }
  | { tone: "error"; message: string }
  | null;

export function WorkspaceBackupCard() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);

  function downloadBackup() {
    if (typeof window === "undefined") return;
    const backup = buildWorkspaceBackup(window.localStorage);
    const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecommerce-ops-workspace-${backup.exportedAt.slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({
      tone: "success",
      message: `Downloaded ${Object.keys(backup.data).length} saved workspace values.`,
    });
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || typeof window === "undefined") return;

    try {
      const backup = parseWorkspaceBackup(await file.text());
      const count = Object.keys(backup.data).length;
      const ok = window.confirm(
        `Restore ${count} saved Ecommerce Ops values from ${new Date(backup.exportedAt).toLocaleString()}? Existing values with the same names will be replaced.`,
      );
      if (!ok) return;
      restoreWorkspaceBackup(window.localStorage, backup);
      setStatus({ tone: "success", message: `Restored ${count} values. Reloading…` });
      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not import this backup.",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Backup or move your workspace</CardTitle>
        <CardDescription className="text-xs">
          Download every saved Ecommerce Ops input, calculator state, audit, and
          progress marker as one JSON file. Import it on another browser to continue
          with the same workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadBackup}
            className="inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Download workspace JSON
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            Import workspace JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={importBackup}
            className="sr-only"
            aria-label="Choose Ecommerce Ops workspace backup"
          />
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Only keys beginning with <code className="rounded bg-muted px-1">ecom-ops:</code>{" "}
          are exported or restored. Store tokens and server credentials are never included.
        </p>
        {status && (
          <p
            role="status"
            className={
              status.tone === "success"
                ? "text-xs font-medium text-emerald-600 dark:text-emerald-400"
                : "text-xs font-medium text-destructive"
            }
          >
            {status.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
