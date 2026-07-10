"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: "□" },
  { href: "/today", label: "Today", icon: "●" },
  { href: "/playbooks", label: "Playbooks", icon: "▦" },
  { href: "/standup", label: "Daily", icon: "◐" },
  { href: "/top-10", label: "Top 10", icon: "▤" },
  { href: "/settings", label: "Settings", icon: "✱" },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="grid grid-cols-6 h-14">
        {MOBILE_NAV.map((item) => {
          const active =
            item.href === "/"
              ? path === "/"
              : path === item.href || path?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-wider transition-colors",
                active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "text-base",
                  active && "text-emerald-600 dark:text-emerald-400"
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}