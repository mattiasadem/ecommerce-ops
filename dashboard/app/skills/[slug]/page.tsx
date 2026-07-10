import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { content, fmtDate } from "@/lib/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const ROOT = "/data/workspace/ecommerce-ops";
const BUILD_SKILLS = join(process.cwd(), "src/skills");

export const dynamic = "force-static";

export function generateStaticParams() {
  return content.skills.map((s) => ({
    slug: s.file.replace(/\.md$/, ""),
  }));
}

function parseFrontmatter(md: string) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(md);
  if (!m) return { meta: {}, body: md };
  const meta: Record<string, any> = {};
  for (const line of m[1].split(/\r?\n/)) {
    // Quoted value (may contain colons)
    let kv = /^([a-z0-9_]+):\s*"([^"]*)"\s*$/.exec(line);
    if (kv) {
      meta[kv[1]] = kv[2];
      continue;
    }
    kv = /^([a-z0-9_]+):\s*'([^']*)'\s*$/.exec(line);
    if (kv) {
      meta[kv[1]] = kv[2];
      continue;
    }
    // Plain value
    kv = /^([a-z0-9_]+):\s*(.*)$/i.exec(line);
    if (!kv) continue;
    const key = kv[1];
    let val: any = kv[2].trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    else if (/^\[.*\]$/.test(val)) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((s: string) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

// Lightweight markdown → React rendering for skill bodies.
// Handles: H1, H2, H3, paragraphs, bullet lists, numbered lists, code fences,
// blockquotes, bold/italic, inline code, links, tables.
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip the H1 (already shown in the page header)
    if (/^#\s+/.test(line) && i === 0) {
      i++;
      continue;
    }

    // Headings
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      out.push(
        <h2
          key={key++}
          className="text-base font-semibold tracking-tight border-b border-border pb-1 mt-6 first:mt-0"
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
        <h3 key={key++} className="text-sm font-semibold mt-4">
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

    // Table (simple markdown table parser)
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

    // Empty line — skip
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

// Inline: bold, italic, inline code, links
function inline(s: string): React.ReactNode {
  // Tokenize via regex pass — keep it simple, no full AST.
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  // Order: code, bold, italic, link
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

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = content.skills.find((s) => s.file.replace(/\.md$/, "") === slug);
  if (!skill) notFound();

  // Read the raw markdown body for rendering
  // Prefer the build-time copy (ships to Vercel); fall back to the workspace source.
  let raw: string;
  try {
    raw = await readFile(join(BUILD_SKILLS, skill.file), "utf8");
  } catch {
    raw = await readFile(join(ROOT, "skills", skill.file), "utf8");
  }
  const { meta, body } = parseFrontmatter(raw);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link href="/skills" className="hover:text-foreground">
            Skills
          </Link>
          <span>/</span>
          <span>{meta.category || "general"}</span>
          <span className="ml-auto text-[10px] tabular-nums">
            Updated {skill.lastTouched}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{skill.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="danger" className="text-[10px]">
            {meta.priority || "P2"}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Move #{meta.default_move ?? "—"}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Tier {meta.tier ?? "—"}
          </Badge>
          {skill.smsFriendly && (
            <Badge variant="success" className="text-[10px]">
              SMS-friendly
            </Badge>
          )}
          {meta.year_1_roi_band && (
            <Badge variant="outline" className="text-[10px] font-mono">
              {meta.year_1_roi_band} ROI
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {skill.blurb}
        </p>
      </header>

      <Separator />

      {/* Rendered markdown body */}
      <article className="prose prose-sm max-w-none">
        {renderMarkdown(body)}
      </article>

      <Separator />

      {/* Sources */}
      {Array.isArray(meta.sources) && meta.sources.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
            Sources ({meta.sources.length})
          </h2>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {meta.sources.map((s: string, j: number) => (
              <li key={j}>· {s}</li>
            ))}
          </ul>
        </section>
      )}

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/skills" className="hover:text-foreground">
          ← Back to all skills
        </Link>
        <span className="font-mono">
          {skill.size}b · {skill.sectionCount} sections · {skill.pitfallCount}{" "}
          pitfalls
        </span>
      </div>
    </div>
  );
}