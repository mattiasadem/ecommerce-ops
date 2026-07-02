import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Ecommerce Ops — DTC operating system",
  description:
    "Sourced 2025–26 DTC benchmarks, shipped playbooks, and a cron-driven improvement queue for $1M–$50M brands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-semibold">
                  E
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold tracking-tight">Ecommerce Ops</span>
                  <span className="hidden md:inline text-xs text-muted-foreground">
                    DTC operating system
                  </span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span>Cron running · every 6h</span>
                </span>
                <span className="text-border">·</span>
                <a
                  href="https://github.com/mattiasadem/ecommerce-ops"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  github.com/mattiasadem/ecommerce-ops
                </a>
              </div>
            </div>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <Separator />
        <footer className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            Sourced from /data/workspace/ecommerce-ops · static SSR · Next.js 15 + Tailwind v4
          </span>
          <span className="font-mono">v0.1.0 · {new Date().toISOString().slice(0, 10)}</span>
        </footer>
      </body>
    </html>
  );
}