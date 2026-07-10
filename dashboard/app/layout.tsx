import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
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
        <Sidebar />
        <div className="md:pl-64">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-8 pb-20 md:pb-8">
            {children}
          </main>
          <Separator />
          <footer className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>
              Sourced from /data/workspace/ecommerce-ops · static SSR · Next.js 15 + Tailwind v4
            </span>
            <span className="font-mono">v0.1.0 · {new Date().toISOString().slice(0, 10)}</span>
          </footer>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}