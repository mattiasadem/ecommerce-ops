"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LOCALSTORAGE_KEYS = [
  "ecom-ops:your-store:v1",
  "ecom-ops:shipped-playbooks:v1",
  "ecom-ops:playbooks:ac-roi:v1",
  "ecom-ops:playbooks:ppu-roi:v1",
  "ecom-ops:playbooks:ws-roi:v1",
];

export function WorkspaceResetCard() {
  const [cleared, setCleared] = useState(false);

  function reset() {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "Reset workspace? This clears your-store inputs and the shipped-playbooks tracker. Calculator defaults will return."
    );
    if (!ok) return;
    for (const k of LOCALSTORAGE_KEYS) {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
    setCleared(true);
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Reset workspace</CardTitle>
            <CardDescription className="text-xs">
              Clears your-store inputs and the shipped-playbooks tracker from
              this browser.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Clears these keys
          </div>
          <ul className="text-xs text-muted-foreground font-mono space-y-0.5">
            {LOCALSTORAGE_KEYS.map((k) => (
              <li key={k}>· {k}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={reset}
            className="mt-3 self-start inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            {cleared ? "Cleared. Reloading…" : "Reset workspace"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}