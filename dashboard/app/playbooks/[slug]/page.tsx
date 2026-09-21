import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import { content, fmtDate, freshnessTier, freshnessLabel } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { PlaybookShippedToggle } from "@/components/playbook-shipped-toggle";

const ROOT = "/data/workspace/ecommerce-ops";
const BUILD_PLAYBOOKS = join(process.cwd(), "src/playbooks");

export const dynamic = "force-static";

export function generateStaticParams() {
  return content.playbooks.map((p) => ({
    slug: p.file.replace(/\.md$/, ""),
  }));
}

// Lightweight markdown → React rendering for playbook bodies.
// Mirrors the parser in app/skills/[slug]/page.tsx so both detail routes
// produce consistent layouts (H2/H3, lists, tables, blockquotes, code,
// paragraphs, bold/italic, inline links).
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip the H1 (rendered in the page header).
    if (/^#\s+/.test(line) && i === 0) {
      i++;
      continue;
    }

    // H2 / H3
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      out.push(
        <h2
          key={key++}
          className="text-base font-semibold tracking-tight border-b border-border pb-1 mt-6 first:mt-0 scroll-mt-24"
          id={slugify(h2[1])}
        >
          {h2[1]}
        </h2>
      );
      i++;
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3) {
      out.push(
        <h3 key={key++} id={slugify(h3[1])} className="text-sm font-semibold mt-4 scroll-mt-24">
          {h3[1]}
        </h3>
      );
      i++;
      continue;
    }

    // Code fence
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono"
        >
          {buf.join("\n")}
        </pre>
      );
      continue;
    }

    // Blockquote
    if (/^>\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s+/, ""));
        i++;
      }
      out.push(
        <blockquote
          key={key++}
          className="my-3 border-l-2 border-accent pl-3 italic text-muted-foreground text-sm"
        >
          {buf.join(" ")}
        </blockquote>
      );
      continue;
    }

    // Markdown table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|\s*-/.test(lines[i + 1])) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(
          lines[i]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );
        i++;
      }
      if (rows.length >= 2) {
        const [header, ...body] = rows;
        out.push(
          <div key={key++} className="my-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {header.map((h, j) => (
                    <th
                      key={j}
                      className="text-left font-medium p-1.5 border-b border-border bg-muted/50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, j) => (
                  <tr key={j} className="border-b border-border/50">
                    {r.map((c, k) => (
                      <td key={k} className="p-1.5 align-top">
                        {inline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={key++} className="my-2 space-y-1 list-disc pl-5 text-sm">
          {buf.map((b, j) => (
            <li key={j} className="leading-relaxed">
              {inline(b)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      out.push(
        <ol key={key++} className="my-2 space-y-1 list-decimal pl-5 text-sm">
          {buf.map((b, j) => (
            <li key={j} className="leading-relaxed">
              {inline(b)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^>\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\|/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push(
      <p key={key++} className="my-2 text-sm leading-relaxed text-foreground/90">
        {inline(buf.join(" "))}
      </p>
    );
  }
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(rest)) !== null) {
    if (m.index > last) parts.push(rest.slice(last, m.index));
    if (m[1]) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono"
        >
          {m[1].slice(1, -1)}
        </code>
      );
    } else if (m[2]) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {m[2].slice(2, -2)}
        </strong>
      );
    } else if (m[3]) {
      parts.push(
        <em key={key++}>{m[3].slice(1, -1)}</em>
      );
    } else if (m[4]) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(m[4]);
      if (lm) {
        const href = lm[2];
        const isExternal = /^https?:\/\//.test(href);
        parts.push(
          <a
            key={key++}
            href={href}
            className="underline hover:text-foreground"
            {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {lm[1]}
          </a>
        );
      }
    }
    last = m.index + m[0].length;
  }
  if (last < rest.length) parts.push(rest.slice(last));
  return <>{parts}</>;
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = content.playbooks.find((p) => p.file.replace(/\.md$/, "") === slug);
  if (!playbook) notFound();

  // Read raw markdown. Prefer the build-time copy (ships to Vercel); fall
  // back to the workspace source path (only available during local dev).
  let raw: string;
  try {
    raw = await readFile(join(BUILD_PLAYBOOKS, playbook.file), "utf8");
  } catch {
    raw = await readFile(join(ROOT, "playbooks", playbook.file), "utf8");
  }

  // Strip the leading H1 — the page header renders its own title.
  const body = raw.replace(/^#\s+.+?\n/, "");

  const tier = freshnessTier(playbook.lastTouched);
  const tierStyle =
    tier === "fresh"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tier === "aging"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : tier === "stale"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-border bg-muted text-muted-foreground";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link href="/playbooks" className="hover:text-foreground">
            Playbooks
          </Link>
          <span>/</span>
          <span className="font-mono">{playbook.file.replace(/\.md$/, "")}</span>
          {playbook.lastTouched ? (
            <>
              <span>·</span>
              <span>Updated {fmtDate(playbook.lastTouched)}</span>
            </>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{playbook.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${tierStyle}`}>
            {freshnessLabel(playbook.lastTouched)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {playbook.sectionCount} sections
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {(playbook.size / 1024).toFixed(1)}kb
          </Badge>
          <CopyButton
            value={`https://ecommerce-ops-iota.vercel.app/playbooks/${playbook.file.replace(/\.md$/, "")}`}
            label="Copy link"
          />
        </div>
      </header>

      <Separator />

      {/* Mark shipped — interactive one-click action that writes to the
          same localStorage key as the /playbooks index, so a toggle here
          instantly reflects on the index's tracker + the Overview card. */}
      <PlaybookShippedToggle
        playbookId={playbook.file.replace(/\.md$/, "")}
        playbookTitle={playbook.title}
      />

      {/* Goal / lead-block meta bullets (parsed by parse-content.mjs) */}
      {playbook.meta && playbook.meta.length > 0 ? (
        <Card>
          <CardContent className="pt-5">
            <ul className="space-y-1 text-sm leading-relaxed text-foreground/90 list-disc pl-5">
              {playbook.meta.slice(0, 8).map((m, j) => (
                <li key={j}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      {/* Rendered markdown body */}
      <article className="prose prose-sm max-w-none">
        {renderMarkdown(body)}
      </article>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/playbooks" className="hover:text-foreground">
          ← Back to all playbooks
        </Link>
        <span className="font-mono">
          {playbook.sectionCount} sections · {(playbook.size / 1024).toFixed(1)}kb
        </span>
      </div>
    </div>
  );
}
