"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/unit-economics", label: "Unit Economics" },
  { href: "/channels", label: "Acquisition" },
  { href: "/retention", label: "Retention" },
  { href: "/cro", label: "CRO" },
  { href: "/inventory", label: "Inventory" },
  { href: "/ai", label: "AI / Automation" },
  { href: "/top-10", label: "Top 10 Moves" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/assets", label: "Assets" },
  { href: "/international", label: "International" },
  { href: "/lifecycle", label: "Lifecycle" },
  { href: "/3pl", label: "3PL" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/affiliates", label: "Affiliates" },
  { href: "/b2b", label: "B2B / Wholesale" },
  { href: "/tiktok", label: "TikTok Shop" },
  { href: "/creators", label: "Creator Economy" },
  { href: "/pinterest-seo", label: "Pinterest SEO" },
  { href: "/journal", label: "Journal" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {NAV.map((item) => {
        const active = item.href === "/" ? path === "/" : path?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}