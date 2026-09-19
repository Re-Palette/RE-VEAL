"use client";

import { Sidebar, type SidebarCounts } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TooltipProvider } from "@/components/ui/misc";
import type { PersonView } from "@/lib/types";

/**
 * Desktop: persistent sidebar, as specified. Tablet and mobile: the sidebar
 * collapses into the top bar's drawer and a five-item bottom navigation.
 */
export function AppShell({
  viewer,
  counts,
  cityName,
  children,
}: {
  viewer: PersonView;
  counts: SidebarCounts;
  cityName: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex min-h-dvh">
        {/* Ambient field — the soft gradient wash the whole product sits on. */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-[12%] -top-[18%] size-[52vw] rounded-full bg-lavender-soft/70 blur-[110px] animate-drift" />
          <div className="absolute -right-[10%] top-[6%] size-[44vw] rounded-full bg-sky-soft/70 blur-[120px] animate-drift [animation-delay:-7s]" />
          <div className="absolute bottom-[-16%] left-[24%] size-[46vw] rounded-full bg-blush-soft/55 blur-[130px] animate-drift [animation-delay:-14s]" />
        </div>

        <div className="sticky top-0 h-dvh">
          <Sidebar viewer={viewer} counts={counts} cityName={cityName} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar viewer={viewer} counts={counts} />
          <main className="flex-1 pb-24 lg:pb-12">{children}</main>
        </div>

        <BottomNav counts={counts} />
      </div>
    </TooltipProvider>
  );
}
