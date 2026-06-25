import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  intent?: "neutral" | "positive" | "warning" | "danger" | "accent";
  className?: string;
}

export function MetricCard({ label, value, sub, intent = "neutral", className }: MetricCardProps) {
  const intentColors = {
    neutral: "text-foreground",
    positive: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    accent: "text-accent",
  } as const;
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-1",
        className
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", intentColors[intent])}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}