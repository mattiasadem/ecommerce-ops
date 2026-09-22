import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content, freshnessLabel, freshnessTier } from "@/lib/content";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = { title: "Research — Ecommerce Ops" };

const TIER_STYLES: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  aging: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  stale: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function ResearchIndexPage() {
  const docs = content.research;
  // Sort by file number (00, 01, …) so the reader sees them in the canonical
  // numbered order.
  const sorted = [...docs].sort((a, b) => a.file.localeCompare(b.file));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          The raw, sourced research
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Research docs</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          {docs.length} long-form research briefs. Each one drives one or more
          pages on the dashboard (channels, lifecycle, 3PL, etc.). Click any
          card to open the full SSR-rendered document with a permanent URL
          you can share.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sorted.map((doc) => {
          const slug = doc.file.replace(/\.md$/, "");
          const tier = freshnessTier(doc.lastTouched ?? undefined);
          const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.unknown;
          const sectionCount = doc.sections?.length ?? 0;
          const tableCount = doc.tables?.length ?? 0;
          const title =
            doc.title ??
            doc.file.replace(/\.md$/, "").replace(/^\d+-/, "").replace(/-/g, " ");
          return (
            <Link
              key={doc.file}
              href={`/research/${slug}`}
              className="block group rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <Card className="h-full transition-colors group-hover:border-accent/40">
                <CardHeader>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${tierStyle}`}
                    >
                      {freshnessLabel(doc.lastTouched ?? undefined) ?? "—"}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-[10px]">
                    research/{doc.file}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{sectionCount} sections</span>
                    {tableCount > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {tableCount} {tableCount === 1 ? "table" : "tables"}
                        </span>
                      </>
                    )}
                    {(doc.findings?.length ?? 0) > 0 && (
                      <>
                        <span>·</span>
                        <span>{doc.findings?.length} findings</span>
                      </>
                    )}
                  </div>
                  {doc.findings && doc.findings.length > 0 ? (
                    <ul className="space-y-1 text-xs text-foreground/80 list-disc pl-4 line-clamp-3">
                      {doc.findings.slice(0, 3).map((f, j) => (
                        <li key={j} className="leading-snug">
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
