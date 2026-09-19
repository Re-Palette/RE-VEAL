"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Search, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LanguageSelector } from "@/components/layout/language-selector";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { GlobalSearch } from "@/components/search/global-search";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { PersonView } from "@/lib/types";
import type { SidebarCounts } from "@/components/layout/sidebar";
import { usePathname } from "next/navigation";

export function TopBar({ viewer, counts }: { viewer: PersonView; counts: SidebarCounts }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cmd/Ctrl-K opens search from anywhere — this is a tool, not a feed.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-08 glass-strong">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="-ml-1 flex size-9 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08 lg:hidden"
            aria-label={t("topbar.openNav")}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link href="/" className="lg:hidden">
            <Logo compact />
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="group hidden h-10 min-w-0 max-w-xl flex-1 items-center gap-2.5 rounded-full border border-ink-15 bg-white/70 px-4 text-sm text-ink-30 transition-all hover:border-lavender/40 hover:bg-white sm:flex"
          >
            <Search className="size-4 shrink-0 transition-colors group-hover:text-lavender" />
            <span className="truncate">{t("search.placeholder")}</span>
            <kbd className="ml-auto hidden shrink-0 rounded-md border border-ink-15 px-1.5 py-0.5 text-[10px] font-medium md:block">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08 sm:hidden"
              aria-label={t("topbar.searchLabel")}
            >
              <Search className="size-5" />
            </button>

            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <Link href="/match?ai=1">
                <Sparkles />
                {t("topbar.aiMatch")}
              </Link>
            </Button>

            <LanguageSelector compact />

            <Link
              href="/notifications"
              className="relative flex size-9 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08"
              aria-label={t("topbar.notifications")}
            >
              <Bell className="size-5" />
              {counts.notifications > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-accent px-1 text-[9px] font-semibold text-white">
                  {counts.notifications}
                </span>
              )}
            </Link>

            <Link href="/profile" className="lg:hidden" aria-label={t("topbar.myProfile")}>
              <Avatar seed={viewer.avatarSeed} name={viewer.name} size="sm" />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-ink-08 bg-white/95 px-4 py-4 lg:hidden">
            {NAV_GROUPS.map((group) => (
              <div key={group.labelKey} className="mb-4">
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-30">
                  {t(group.labelKey)}
                </p>
                <ul className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => {
                    const active =
                      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            active ? "bg-lavender-soft text-ink" : "text-ink-70 hover:bg-ink-08/60",
                          )}
                        >
                          <item.icon className="size-[18px] text-ink-30" />
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
