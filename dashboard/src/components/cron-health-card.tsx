"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  lastUpdate: Date;
  playbooksCount: number;
  researchCount: number;
  assetsCount: number;
}

interface CronReport {
  ok: boolean;
  lastRun?: string;
  message?: string;
  fetchedAt: string;
}

export function CronHealthCard({
  lastUpdate,
  playbooksCount,
  researchCount,
  assetsCount,
}: Props) {
  const [report, setReport] = useState<CronReport | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // Tick the clock once a minute
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Try to fetch the latest cron report — best-effort, silent fail in prod
    fetch("/api/cron-health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.ok === "boolean") {
          setReport({ ...data, fetchedAt: new Date().toISOString() });
        }
      })
      .catch(() => {
        /* silent — component is best-effort */
      });
  }, []);

  const msSinceUpdate = now.getTime() - lastUpdate.getTime();
  const hoursSinceUpdate = msSinceUpdate / (1000 * 60 * 60);
  const stale = hoursSinceUpdate > 12;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cron health</CardTitle>
            <CardDescription className="text-xs">
              The improver runs every 6 hours. Last build, last run, status.
            </CardDescription>
          </div>
          <Badge
            variant={stale ? "danger" : "outline"}
            className="text-[10px]"
          >
            {stale ? "Stale" : "Healthy"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Last build
            </div>
            <div className="font-mono tabular-nums text-foreground">
              {lastUpdate.toISOString().slice(0, 16).replace("T", " ")} UTC
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hoursSinceUpdate < 1
                ? "just now"
                : hoursSinceUpdate < 24
                ? `${Math.floor(hoursSinceUpdate)}h ago`
                : `${Math.floor(hoursSinceUpdate / 24)}d ago`}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Last cron run
            </div>
            <div className="font-mono text-foreground">
              {report?.lastRun ?? "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {report?.message ?? (report === null ? "checking..." : "no data")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Catalog
            </div>
            <div className="text-foreground">
              {playbooksCount} playbooks · {researchCount} research
            </div>
            <div className="text-[10px] text-muted-foreground">
              {assetsCount} assets
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Schedule
            </div>
            <div className="text-foreground">every 6h</div>
            <div className="text-[10px] text-muted-foreground">
              next run auto
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}