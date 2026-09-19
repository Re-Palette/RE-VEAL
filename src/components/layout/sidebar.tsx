"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { useI18n } from "@/lib/i18n/context";
import { ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { PersonView } from "@/lib/types";

export interface SidebarCounts {
  messages: number;
  notifications: number;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  viewer,
  counts,
  cityName,
}: {
  viewer: PersonView;
  counts: SidebarCounts;
  cityName: string;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden h-dvh w-[264px] shrink-0 flex-col border-r border-ink-08 bg-white/70 backdrop-blur-xl lg:flex xl:w-[276px]">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="rounded-lg">
          <Logo />
        </Link>
      </div>

      <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-30">
              {t(group.labelKey)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badge ? counts[item.badge] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-white text-ink shadow-soft"
                          : "text-ink-50 hover:bg-white/70 hover:text-ink",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full gradient-accent" />
                      )}
                      <item.icon
                        className={cn(
                          "size-[18px] transition-colors",
                          active ? "text-lavender" : "text-ink-30 group-hover:text-ink-50",
                        )}
                      />
                      <span className="flex-1 truncate">{t(item.labelKey)}</span>
                      {count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full gradient-accent px-1.5 text-[10px] font-semibold text-white">
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-08 p-3">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/80"
        >
          <Avatar seed={viewer.avatarSeed} name={viewer.name} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{viewer.name}</span>
            <span className="block truncate text-xs text-ink-50">
              {ROLE_LABELS[viewer.profile.role]} · {cityName}
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-ink-30" />
        </Link>
      </div>
    </aside>
  );
}
