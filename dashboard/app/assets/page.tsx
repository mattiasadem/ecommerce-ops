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

export const metadata = { title: "Assets — Ecommerce Ops" };

export default function AssetsPage() {
  const { assets, counts } = content;

  const voiceGated = assets.filter((a) => a.voiceGated).length;
  const totalSize = assets.reduce((n, a) => n + a.size, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Paste-ready content library
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          {counts.assets} paste-ready artifacts — copy templates, brand-voice
          framework, UGC briefs, promo calendar, retention reference card, NPS
          toolkit, competitive teardown, CS response library, impact-reporting
          framework, affiliate-program playbook, CS training program, and
          impact-data pipeline. Each ships with a 5-voice override column so the
          same artifact adapts to Default / Luxury / Sustainable / Gen-Z / B2B
          brand profiles.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total assets</CardTitle>
            <CardDescription>On-disk paste-ready artifacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {counts.assets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice-gated</CardTitle>
            <CardDescription>
              All 5 voice profiles clear the ≥15 density threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {voiceGated}
              <span className="text-base text-muted-foreground font-normal ml-1">
                / {counts.assets}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total size</CardTitle>
            <CardDescription>
              Combined markdown content (no build step)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {(totalSize / 1024).toFixed(0)}
              <span className="text-base text-muted-foreground font-normal ml-1">
                KB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {assets.map((a) => (
          <Card key={a.file} id={a.file.replace(/\.md$/, "")}>
            <CardHeader>
              <div className="flex flex-wrap items-baseline gap-3">
                {a.assetNumber !== null && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    AS-{String(a.assetNumber).padStart(2, "0")}
                  </span>
                )}
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="ml-auto flex flex-wrap gap-1">
                  <Badge variant="outline">
                    {a.sectionCount} sections · {(a.size / 1024).toFixed(1)}kb
                  </Badge>
                  {a.voiceGated && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    >
                      5-voice gated
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="font-mono text-[11px]">
                /assets/{a.file}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.meta.length > 0 && (
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                  {a.meta.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              )}
              {a.voiceGated && a.voiceCounts && (
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {Object.entries(a.voiceCounts).map(([voice, count]) => (
                    <span
                      key={voice}
                      className={
                        count >= 15
                          ? "rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400"
                          : "rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400"
                      }
                    >
                      {voice}: {count}
                    </span>
                  ))}
                </div>
              )}
              {a.numberedSections.length > 0 && (
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    Section preview ({a.numberedSections.length})
                  </summary>
                  <ol className="mt-2 space-y-1 text-[11px] text-muted-foreground list-decimal pl-5">
                    {a.numberedSections.slice(0, 12).map((s, k) => (
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