import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { content, fmtDate } from "@/lib/content";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Skills — Ecommerce Ops",
  description: "Best-practice playbooks for every DTC operator skill.",
};

const CATEGORY_LABELS: Record<string, string> = {
  retention: "Retention",
  acquisition: "Acquisition",
  conversion: "Conversion",
  fulfillment: "Fulfillment",
  branding: "Branding",
  analytics: "Analytics",
  ai: "AI / Automation",
  subscription: "Subscription",
  international: "International",
  marketplace: "Marketplace",
  affiliate: "Affiliate",
  b2b: "B2B",
  creator: "Creator",
  social: "Social",
  search: "Search",
  ads: "Paid Ads",
  general: "General",
};

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — ship first",
  2: "Tier 2 — after the foundation",
  3: "Tier 3 — advanced",
};

const PRIORITY_TONE: Record<string, string> = {
  P0: "danger",
  P1: "warning",
  P2: "secondary",
  P3: "outline",
};

export default function SkillsPage() {
  const { skills, counts, generatedAt } = content;

  // Group by category
  const byCategory = new Map<string, typeof skills>();
  for (const s of skills) {
    const cat = s.category || "general";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }
  const categories = Array.from(byCategory.keys()).sort();

  // Stats
  const tier1 = skills.filter((s) => s.tier === 1).length;
  const p0 = skills.filter((s) => s.priority === "P0").length;
  const withSms = skills.filter((s) => s.smsFriendly).length;
  const totalPitfalls = skills.reduce((n, s) => n + s.pitfallCount, 0);
  const totalSources = skills.reduce((n, s) => n + s.sourceCount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Skill library</span>
          <span>·</span>
          <span>{counts.skills} skills</span>
          <span className="ml-auto text-[10px] tabular-nums">
            Updated {fmtDate(generatedAt)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Best-practice playbooks for every operator skill. Each skill is sourced
          from vendor benchmarks and operator data, with a numbered build
          sequence, common pitfalls, and a verification checklist.
        </p>
      </header>

      {/* Top stat row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {counts.skills}
            </div>
            <div className="text-[10px] text-muted-foreground">
              skills in library
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Tier 1
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{tier1}</div>
            <div className="text-[10px] text-muted-foreground">
              ship first
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              P0
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{p0}</div>
            <div className="text-[10px] text-muted-foreground">
              highest-leverage
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] uppercase tracking-wider">
              Catalog depth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {totalSources}
            </div>
            <div className="text-[10px] text-muted-foreground">
              sources · {totalPitfalls} pitfalls
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter bar */}
      <section className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Categories
        </span>
        {categories.map((cat) => (
          <Badge key={cat} variant="outline" className="text-[10px]">
            {CATEGORY_LABELS[cat] || cat} · {byCategory.get(cat)!.length}
          </Badge>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {withSms} skills are SMS-friendly
        </span>
      </section>

      {/* Skills by category */}
      {categories.map((cat) => (
        <section key={cat} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between border-b border-border pb-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
              {CATEGORY_LABELS[cat] || cat}
            </h2>
            <span className="text-[10px] text-muted-foreground">
              {byCategory.get(cat)!.length} skill
              {byCategory.get(cat)!.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {byCategory.get(cat)!.map((skill) => (
              <Link
                key={skill.file}
                href={`/skills/${skill.file.replace(/\.md$/, "")}`}
                className="block"
              >
                <Card className="h-full transition-colors hover:border-foreground/30 hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-snug">
                        {skill.title}
                      </CardTitle>
                      <Badge
                        variant={
                          (PRIORITY_TONE[skill.priority] as
                            | "danger"
                            | "warning"
                            | "secondary"
                            | "outline"
                            | "default") || "outline"
                        }
                        className="text-[10px] flex-shrink-0"
                      >
                        {skill.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px] font-mono">
                      Move #{skill.defaultMove ?? "—"} · Tier {skill.tier}
                      {skill.smsFriendly ? " · SMS ✓" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3.6em]">
                      {skill.blurb}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {skill.pitfallCount} pitfalls · {skill.sourceCount}{" "}
                        sources
                      </span>
                      <span className="font-mono tabular-nums">
                        {skill.yearOneRoiBand || "—"}
                      </span>
                    </div>
                    {skill.lastTouched && (
                      <div className="mt-1 text-[9px] text-muted-foreground/60 tabular-nums">
                        last updated {skill.lastTouched}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {skills.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No skills shipped yet. The skill-builder cron will populate this
              page within the next hour.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}