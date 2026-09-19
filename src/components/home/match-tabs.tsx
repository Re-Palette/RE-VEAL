"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/context";

/**
 * "Your Match" — the answer to "who can I meet?" rather than "what can I read?".
 * Card markup is rendered on the server and handed in as children.
 */
export function HomeMatchTabs({
  people,
  brands,
  projects,
  events,
}: {
  people: React.ReactNode;
  brands: React.ReactNode;
  projects: React.ReactNode;
  events: React.ReactNode;
}) {
  const { t } = useI18n();

  const panes = [
    { value: "people", label: t("common.people"), href: "/people", node: people },
    { value: "brands", label: t("common.brands"), href: "/brands", node: brands },
    { value: "projects", label: t("common.projects"), href: "/projects", node: projects },
    { value: "events", label: t("common.events"), href: "/events", node: events },
  ];

  return (
    <Tabs defaultValue="people">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-30">
            Personalised for you
          </p>
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-[22px]">
            {t("home.yourMatch")}
          </h2>
        </div>
        <div className="hide-scrollbar -mx-1 max-w-full overflow-x-auto px-1">
          <TabsList>
            {panes.map((pane) => (
              <TabsTrigger key={pane.value} value={pane.value}>
                {pane.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {panes.map((pane) => (
        <TabsContent key={pane.value} value={pane.value}>
          {pane.node}
          <Link
            href={pane.href}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
          >
            {t("common.viewAll")} {pane.label.toLowerCase()}
            <ArrowRight className="size-4" />
          </Link>
        </TabsContent>
      ))}
    </Tabs>
  );
}
