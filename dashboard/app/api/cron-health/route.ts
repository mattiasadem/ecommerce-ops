import { NextResponse } from "next/server";
import { readFile, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const REPORTS_DIR = "/data/workspace/cron-reports";
const JOURNAL_PATH = "/data/workspace/ecommerce-ops/docs/journal.md";
const PROJECT_DIR = "/data/workspace/ecommerce-ops";

interface HealthPayload {
  ok: boolean;
  lastRun?: string;
  message?: string;
  lastJournalEntry?: string;
  counts: {
    playbooks: number;
    research: number;
    assets: number;
    scripts: number;
  };
  builtAt: string;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function safeCount(dir: string, ext?: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  try {
    const files = await readdir(dir);
    if (!ext) return files.length;
    return files.filter((f) => f.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    // Find the latest cron report for the dashboard improver
    let lastRun: string | undefined;
    let lastReport: string | undefined;
    if (existsSync(REPORTS_DIR)) {
      const files = await readdir(REPORTS_DIR);
      const dashboardReports = files
        .filter(
          (f) =>
            f.includes("dashboard") ||
            f.includes("improver") ||
            f.includes("real-feature")
        )
        .filter((f) => f.endsWith(".md") || f.endsWith(".json"));
      if (dashboardReports.length > 0) {
        // Sort by filename (most cron reports embed ISO date in name)
        const sorted = dashboardReports.sort().reverse();
        const latest = sorted[0];
        const fullPath = join(REPORTS_DIR, latest);
        const st = await stat(fullPath);
        lastRun = st.mtime.toISOString();
        try {
          const content = await readFile(fullPath, "utf8");
          lastReport = content.split("\n").slice(0, 5).join("\n").slice(0, 200);
        } catch {
          /* skip */
        }
      }
    }

    // Last journal entry timestamp
    let lastJournalEntry: string | undefined;
    if (await fileExists(JOURNAL_PATH)) {
      const j = await readFile(JOURNAL_PATH, "utf8");
      const m = /^\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/.exec(j);
      if (m) lastJournalEntry = `${m[1]} ${m[2]} UTC`;
    }

    const counts = {
      playbooks: await safeCount(join(PROJECT_DIR, "playbooks"), ".md"),
      research: await safeCount(join(PROJECT_DIR, "research"), ".md"),
      assets: await safeCount(join(PROJECT_DIR, "assets"), ".md"),
      scripts: await safeCount(join(PROJECT_DIR, "scripts"), ".py"),
    };

    const payload: HealthPayload = {
      ok: true,
      lastRun,
      lastJournalEntry,
      counts,
      builtAt: new Date().toISOString(),
    };

    // Add the report content as a message (truncated)
    if (lastReport) {
      payload.message = lastReport
        .replace(/[#*`]/g, "")
        .replace(/\n+/g, " ")
        .slice(0, 180);
    }

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "unknown error",
        counts: { playbooks: 0, research: 0, assets: 0, scripts: 0 },
        builtAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}