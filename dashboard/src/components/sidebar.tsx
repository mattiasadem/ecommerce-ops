"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { content } from "@/lib/content";

const NAV_GROUPS = [
  {
    label: "Operate",
    items: [
      { href: "/", label: "Overview", icon: "□" },
      { href: "/today", label: "Today", icon: "●", highlight: true },
      { href: "/standup", label: "Daily standup", icon: "◐" },
      { href: "/top-10", label: "Top 10 moves", icon: "▤" },
      { href: "/playbooks", label: "Playbooks", icon: "▦" },
      { href: "/journal", label: "Journal", icon: "▣" },
    ],
  },
  {
    label: "Levers",
    items: [
      { href: "/unit-economics", label: "Unit economics", icon: "Σ" },
      { href: "/channels", label: "Acquisition", icon: "↗" },
      { href: "/retention", label: "Retention", icon: "↻" },
      { href: "/cro", label: "Conversion (CRO)", icon: "✓" },
      { href: "/inventory", label: "Inventory", icon: "▥" },
      { href: "/ai", label: "AI / Automation", icon: "✦" },
    ],
  },
  {
    label: "Channels",
    items: [
      { href: "/marketplace", label: "Marketplace", icon: "▢" },
      { href: "/subscriptions", label: "Subscriptions", icon: "↺" },
      { href: "/affiliates", label: "Affiliates", icon: "✪" },
      { href: "/b2b", label: "B2B / Wholesale", icon: "▤" },
      { href: "/creators", label: "Creators", icon: "✧" },
      { href: "/tiktok", label: "TikTok Shop", icon: "♪" },
      { href: "/pinterest-seo", label: "Pinterest + SEO", icon: "✿" },
      { href: "/amazon-dsp-amazon-attribution-audit", label: "Amazon DSP", icon: "◈" },
      { href: "/attribution-health-alert-archive", label: "Attribution alerts", icon: "⚠" },
      { href: "/smsbump-postscript-channel-orchestration", label: "SMSBump SMS", icon: "✉" },
      { href: "/generative-ai-engine", label: "AI engine", icon: "✺" },
      { href: "/international", label: "International", icon: "◯" },
      { href: "/3pl", label: "3PL / Fulfillment", icon: "▥" },
      { href: "/lifecycle", label: "Lifecycle", icon: "↺" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/assets", label: "Assets", icon: "▤" },
      { href: "/30-day-plan", label: "30-day plan", icon: "▦" },
      { href: "/settings", label: "Settings", icon: "✱" },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const { counts } = content;

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:z-40 md:bg-card md:border-r md:border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-semibold">
          E
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">Ecommerce Ops</span>
          <span className="text-[10px] text-muted-foreground">DTC operating system</span>
        </div>
      </div>

      {/* Cron status pill */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cron running · every 6h</span>
        </div>
        <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/70 tabular-nums">
          {counts.playbooks} playbooks · {counts.researchDocs} research · {counts.assets} assets
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-2 mb-2 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-medium">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? path === "/"
                    : path === item.href || path?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-foreground text-background font-medium"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted",
                      item.highlight && !active && "text-foreground font-medium"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block w-4 text-center text-[11px] tabular-nums",
                        active ? "text-background" : "text-muted-foreground/70"
                      )}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !active && (
                      <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border text-[10px] text-muted-foreground">
        <a
          href="https://github.com/mattiasadem/ecommerce-ops"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          github.com/mattiasadem/ecommerce-ops
        </a>
      </div>
    </aside>
  );
}