import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Ecommerce Ops Dashboard — DTC, 2026",
  description:
    "Sourced benchmarks, playbook status, and operator levers for $1M–$50M DTC ecommerce.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold tracking-tight">Ecommerce Ops</span>
                <span className="text-xs text-muted-foreground">
                  DTC operating system · $1M–$50M GMV · 2025/26 vintage
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                Live · research synced from /research & /playbooks
              </div>
            </div>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <Separator />
        <footer className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground">
          Sourced from /data/workspace/ecommerce-ops · static SSR · Next.js 15 + Tailwind v4
        </footer>
      </body>
    </html>
  );
}