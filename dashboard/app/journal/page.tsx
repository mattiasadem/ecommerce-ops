import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { content, fmtDate } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Journal — Ecommerce Ops" };

export default function JournalPage() {
  const { journal, generatedAt } = content;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          What the cron did, in order
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Each cron tick produces one bounded improvement and a journal entry.
          Synced from <code className="rounded bg-muted px-1">/docs/journal.md</code>{" "}
          on {fmtDate(generatedAt)}.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {journal.length === 0 && (
          <Card>
            <CardContent className="text-sm text-muted-foreground py-6">
              No journal entries yet.
            </CardContent>
          </Card>
        )}
        {journal.map((entry, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">{entry.heading}</CardTitle>
              <CardDescription>Tick {journal.length - i} (newest first)</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
                {entry.body || "(no body)"}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}