"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "@/components/layout/nav-config";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { SidebarCounts } from "@/components/layout/sidebar";

export function BottomNav({ counts }: { counts: SidebarCounts }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-08 bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex items-stretch">
        {MOBILE_NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const count = item.badge ? counts[item.badge] : 0;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-30",
                )}
              >
                <span className="relative">
                  <item.icon className={cn("size-[21px]", active && "text-lavender")} />
                  {count > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full gradient-accent px-1 text-[9px] font-semibold text-white">
                      {count}
                    </span>
                  )}
                </span>
                {t(item.labelKey)}
                {active && <span className="absolute -top-px h-[2px] w-8 rounded-full gradient-accent" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
