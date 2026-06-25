import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtNumber(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(v)) return String(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString();
}

export function fmtUSD(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n.replace(/[\$,]/g, "")) : n;
  if (Number.isNaN(v)) return String(n);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}`;
  return `$${v.toFixed(0)}`;
}

export function badgeColor(level: string | undefined): string {
  const l = (level ?? "").toLowerCase();
  if (l.includes("verified")) return "bg-success/10 text-success border-success/30";
  if (l.includes("directional")) return "bg-warning/10 text-warning border-warning/30";
  if (l.includes("rule-of-thumb")) return "bg-muted text-muted-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
}

export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("shipped")) return "bg-success/10 text-success border-success/30";
  if (s.includes("pending")) return "bg-muted text-muted-foreground border-border";
  if (s.includes("blocked") || s.includes("failed")) return "bg-danger/10 text-danger border-danger/30";
  return "bg-muted text-muted-foreground border-border";
}