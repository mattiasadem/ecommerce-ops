import { content, fmtDate } from "@/lib/content";
import { JournalSearch } from "@/components/journal-search";
import { GitChangeLog } from "@/components/git-change-log";

export const dynamic = "force-static";

export const metadata = { title: "Journal — Ecommerce Ops" };

export default function JournalPage() {
  const { journal, gitCommits, generatedAt } = content;
  const commitCount = content.counts.gitCommits ?? gitCommits?.length ?? 0;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          What the cron did, in order
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Every cron tick produces one bounded improvement and a journal entry.
          Searchable and filterable by tick type + status. Synced from{" "}
          <code className="rounded bg-muted px-1">/docs/journal.md</code> on{" "}
          {fmtDate(generatedAt)}. Below the journal sits a{" "}
          <strong>real change log</strong> — the live git history of the
          dashboard subtree, captured at build time and filterable by author
          and conventional-commit prefix.
        </p>
      </header>

      <JournalSearch entries={journal} />

      <GitChangeLog
        commits={gitCommits ?? []}
        repoUrl="https://github.com/mattiasadem/ecommerce-ops"
      />

      <footer className="text-xs text-muted-foreground">
        {commitCount} commits captured at {fmtDate(generatedAt)}.
      </footer>
    </div>
  );
}
