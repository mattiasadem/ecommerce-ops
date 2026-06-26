import Link from "next/link";
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

export const metadata = {
  title: "30-day rollout plan — Ecommerce Ops",
};

const DAY_TABLE_HEADINGS = [
  /Week 1/,
  /Week 2/,
  /Week 3/,
  /Week 4/,
];

export default function RolloutPlanPage() {
  const rollout = content.research.find((r) =>
    r.file.startsWith("03-30-day")
  );

  if (!rollout) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            30-day rollout plan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Synthesis doc not found. Run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              node scripts/parse-content.mjs
            </code>{" "}
            from the dashboard folder to regenerate{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              src/lib/content.json
            </code>
            .
          </p>
        </header>
      </div>
    );
  }

  const tldrSection = rollout.sections.find((s) => s.heading === "TL;DR");
  const whoSection = rollout.sections.find((s) => s.heading === "Who this is for");
  const prereqSection = rollout.sections.find(
    (s) => s.heading === "Prerequisites"
  );
  const deviationSection = rollout.sections.find((s) =>
    s.heading.startsWith("When to deviate")
  );
  const costSection = rollout.tables.find((t) =>
    /Cost & ROI/i.test(t.heading)
  );
  const decisionMatrix = rollout.tables.find((t) =>
    /When to deviate/i.test(t.heading)
  );

  const dayTables = rollout.tables.filter((t) =>
    DAY_TABLE_HEADINGS.some((rx) => rx.test(t.heading))
  );

  const pitfallsSection = rollout.sections.find((s) =>
    s.heading.startsWith("Common pitfalls")
  );
  const verificationSection = rollout.sections.find((s) =>
    s.heading.startsWith("Verification gates")
  );
  const nextMovesSection = rollout.sections.find((s) =>
    s.heading.startsWith("Next moves")
  );

  // Pull numbered pitfall lines from the pitfalls body.
  // Each pitfall starts at a line beginning with "N. **Pitfall ...**" or
  // simply "N. **<title>**" (the synthesis doc uses both forms).
  const pitfalls = (pitfallsSection?.body ?? "")
    .split(/\n(?=\d+\.\s+\*\*)/)
    .map((s) => s.trim())
    .filter((s) => /^\d+\.\s+\*\*/.test(s));

  // Pull verification gate lines from the verification body.
  // Gates appear as "- **Gate A: <title>** ..." list items.
  const gates = (verificationSection?.body ?? "")
    .split(/\n(?=-\s+\*\*Gate\s+[A-Z]:)/i)
    .map((s) => s.replace(/^-\s+/, "").trim())
    .filter((s) => /^\*\*Gate\s+[A-Z]:/i.test(s));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:underline">
            Overview
          </Link>
          <span>/</span>
          <span className="text-foreground">30-day rollout plan</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            30-day rollout plan
          </h1>
          <Badge variant="accent">synthesis</Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Sequences all <strong>16 shipped moves</strong> into a day-by-day plan
          for a brand starting from zero. Each move&apos;s prerequisite ships in
          the prior week — no tool without its measurement first.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          /research/{rollout.file}
        </p>
      </header>

      {tldrSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TL;DR</CardTitle>
            <CardDescription>The 4-week rhythm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p className="whitespace-pre-line">
              {tldrSection.body
                .replace(/^\s*\*\*The 4-week rhythm:\*\*\s*/i, "")
                .trim()}
            </p>
          </CardContent>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          The 30-day plan
        </h2>
        {dayTables.map((t, idx) => (
          <Card key={t.heading}>
            <CardHeader>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle className="text-base">{t.heading}</CardTitle>
                <Badge variant="outline">Week {idx + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Day</th>
                      <th className="py-2 pr-3 font-medium">Move</th>
                      <th className="py-2 pr-3 font-medium">Why first</th>
                      <th className="py-2 pr-3 font-medium">Time</th>
                      <th className="py-2 font-medium">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {t.rows.map((row, ri) => (
                      <tr key={ri} className="align-top">
                        <td className="py-2 pr-3 font-mono tabular-nums whitespace-nowrap">
                          {String(row["Day"] ?? "")}
                        </td>
                        <td className="py-2 pr-3 font-medium">
                          {String(row["Move"] ?? "")}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {String(row["Why first"] ?? "")}
                        </td>
                        <td className="py-2 pr-3 font-mono tabular-nums whitespace-nowrap">
                          {String(row["Time"] ?? "")}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {String(row["Verification"] ?? "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {deviationSection && decisionMatrix && decisionMatrix.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              When to deviate (decision matrix)
            </CardTitle>
            <CardDescription>
              {decisionMatrix.rows.length} branches off the default Shopify
              $1M–$5M plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    {Object.keys(decisionMatrix.rows[0]).map((k) => (
                      <th key={k} className="py-2 pr-3 font-medium">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {decisionMatrix.rows.map((row, ri) => (
                    <tr key={ri} className="align-top">
                      {Object.keys(decisionMatrix.rows[0]).map((k) => (
                        <td
                          key={k}
                          className="py-2 pr-3 text-muted-foreground"
                        >
                          {String(row[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {pitfalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Common pitfalls (top {pitfalls.length})
            </CardTitle>
            <CardDescription>
              What derails a 30-day rollout — and the corrective Fix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            {pitfalls.map((p, i) => {
              // Extract first bolded "Pitfall #N — title" as the heading.
              const m = /^\d+\.\s+\*\*(.+?)\*\*/.exec(p);
              const title = m?.[1] ?? `Pitfall ${i + 1}`;
              // Strip the heading line + any leading whitespace.
              const rest = p.replace(/^\d+\.\s+\*\*[^*]+\*\*\s*/, "").trim();
              return (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="text-sm font-medium">
                    Pitfall {i + 1}: {title.replace(/^Pitfall\s+#?\d+\s*[—:-]\s*/i, "")}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line">
                    {rest}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {gates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Verification gates ({gates.length})
            </CardTitle>
            <CardDescription>
              End-of-month checks — pass all of these before calling the rollout done
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            {gates.map((g, i) => {
              const m = /^\*\*Gate\s+([A-Z]):\s*([^*]+)\*\*/i.exec(g);
              const letter = m?.[1] ?? String.fromCharCode(65 + i);
              const title = m?.[2]?.trim() ?? `Gate ${letter}`;
              const rest = g
                .replace(/^\*\*Gate\s+[A-Z]:\s*[^*]+\*\*\s*/i, "")
                .trim();
              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background font-mono text-xs">
                    {letter}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium">{title}</div>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                      {rest}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {costSection && costSection.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {costSection.heading}
            </CardTitle>
            <CardDescription>
              Default Shopify $1M–$5M GMV case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    {Object.keys(costSection.rows[0]).map((k) => (
                      <th key={k} className="py-2 pr-3 font-medium">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {costSection.rows.map((row, ri) => (
                    <tr key={ri} className="align-top">
                      {Object.keys(costSection.rows[0]).map((k) => (
                        <td
                          key={k}
                          className="py-2 pr-3 text-muted-foreground"
                        >
                          {String(row[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(whoSection || prereqSection) && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {whoSection && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Who this is for</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {whoSection.body.trim()}
              </CardContent>
            </Card>
          )}
          {prereqSection && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {prereqSection.body.trim()}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {nextMovesSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next moves after 30 days</CardTitle>
            <CardDescription>
              The roadmap past the first month
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
            {nextMovesSection.body.trim()}
          </CardContent>
        </Card>
      )}

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jump back</CardTitle>
            <CardDescription>Open the source doc or the live dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              ← Overview
            </Link>
            <Link
              href="/playbooks"
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              All playbooks
            </Link>
            <Link
              href="/top-10"
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              Top 10 ranking
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
