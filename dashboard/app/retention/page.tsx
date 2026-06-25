import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResearchTable } from "@/components/research-table";
import { content, findTable } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Retention Stack — Ecommerce Ops" };

export default function RetentionPage() {
  const research = content.research;
  const stack = findTable(research, /order of build/);
  const flows = findTable(research, /Email flows you must have/);
  const playbooks = content.playbooks.filter((p) =>
    /(cart|welcome|sms|loyalty|klaviyo|postscript|smile)/i.test(p.file)
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Lever 3 of 10
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Retention Stack</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          The 2026 retention system — order of build, table-stakes flows, and the
          seven shipped playbooks for Klaviyo, Postscript, and Smile.io.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The stack — order of build</CardTitle>
          <CardDescription>Default 2026 tool per category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={stack} highlightColumns={["Price range"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The table-stakes six flows</CardTitle>
          <CardDescription>
            These six flows are the operating floor for any $1M+ brand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchTable rows={flows} highlightColumns={["Typical CVR", "Typical revenue contribution"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipped retention playbooks</CardTitle>
          <CardDescription>{playbooks.length} playbooks · click to read</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {playbooks.map((p) => (
              <a
                key={p.file}
                href={`/playbooks#${p.file.replace(/\.md$/, "")}`}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
              >
                <span className="text-xs font-medium">{p.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {p.file} · {(p.size / 1024).toFixed(1)}kb · {p.sectionCount} sections
                </span>
                {p.meta[0] && (
                  <span className="text-[11px] text-muted-foreground line-clamp-2">
                    {p.meta[0]}
                  </span>
                )}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}