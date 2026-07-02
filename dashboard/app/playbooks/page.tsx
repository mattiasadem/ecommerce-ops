import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Playbooks — Ecommerce Ops" };

export default function PlaybooksPage() {
  const { playbooks } = content;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Step-by-step ops
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Playbooks</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Every shipped playbook for the cron-driven DTC operator. Each playbook
          is a runbook — phases, gates, verification, pitfalls, ROI math.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {playbooks.map((p, i) => (
          <Card key={p.file} id={p.file.replace(/\.md$/, "")}>
            <CardHeader>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  PB-{String(i + 1).padStart(2, "0")}
                </span>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {p.sectionCount} sections · {(p.size / 1024).toFixed(1)}kb
                </Badge>
              </div>
              <CardDescription className="font-mono text-[11px]">
                /playbooks/{p.file}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {p.meta.length > 0 && (
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {p.meta.slice(0, 6).map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              )}
              {(p.numberedSections ?? []).length > 0 && (
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    Section preview ({(p.numberedSections ?? []).length})
                  </summary>
                  <ol className="mt-2 space-y-1 text-[11px] text-muted-foreground list-decimal pl-5">
                    {(p.numberedSections ?? []).slice(0, 12).map((s, k) => (
                      <li key={k}>
                        <span className="text-foreground">{s.heading}</span>
                        {s.body && (
                          <span className="block text-muted-foreground line-clamp-2 mt-0.5">
                            {s.body.replace(/\n+/g, " ").slice(0, 220)}…
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}