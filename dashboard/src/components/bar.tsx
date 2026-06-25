import * as React from "react";
import { cn } from "@/lib/utils";

interface BarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
  intent?: "accent" | "success" | "warning" | "danger";
}

export function Bar({ value, label, className, intent = "accent" }: BarProps) {
  const colors = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  } as const;
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium tabular-nums">{value.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colors[intent])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}