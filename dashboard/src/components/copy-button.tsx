"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "outline";
}

/**
 * Tiny client-only button that copies a string to the clipboard and shows
 * a 1.5s "Copied" confirmation. Used on the Playbooks + Assets cards to copy
 * the file ID (e.g. `01-abandoned-cart-flow-klaviyo`) for shell/pipeline use.
 */
export function CopyButton({
  value,
  label = "Copy ID",
  className,
  variant = "outline",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else if (typeof document !== "undefined") {
        // Fallback for environments without the Clipboard API (very old browsers).
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors";
  const styles =
    variant === "outline"
      ? "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}`}
      title={value}
      className={cn(base, styles, className)}
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}