"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Operate",
    items: [
      { href: "/", label: "Overview" },
      { href: "/top-10", label: "Top 10 Moves" },
      { href: "/playbooks", label: "Playbooks" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    label: "Levers",
    items: [
      { href: "/unit-economics", label: "Unit Economics" },
      { href: "/channels", label: "Acquisition" },
      { href: "/retention", label: "Retention" },
      { href: "/cro", label: "CRO" },
      { href: "/inventory", label: "Inventory" },
      { href: "/ai", label: "AI" },
    ],
  },
  {
    label: "Channels",
    items: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/subscriptions", label: "Subscriptions" },
      { href: "/affiliates", label: "Affiliates" },
      { href: "/b2b", label: "B2B" },
      { href: "/creators", label: "Creators" },
      { href: "/tiktok", label: "TikTok Shop" },
      { href: "/pinterest-seo", label: "Pinterest SEO" },
      { href: "/amazon-dsp-amazon-attribution-audit", label: "Amazon DSP" },
      { href: "/smsbump-postscript-channel-orchestration", label: "SMSBump SMS" },
      { href: "/international", label: "International" },
      { href: "/3pl", label: "3PL" },
      { href: "/lifecycle", label: "Lifecycle" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/assets", label: "Assets" },
      { href: "/30-day-plan", label: "30-day plan" },
    ],
  },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex items-center gap-1 mr-1">
          <span className="hidden lg:inline text-[9px] uppercase tracking-widest text-muted-foreground/60 mr-1">
            {group.label}
          </span>
          {group.items.map((item) => {
            const active =
              item.href === "/" ? path === "/" : path?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}