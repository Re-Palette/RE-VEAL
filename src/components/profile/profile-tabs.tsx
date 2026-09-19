"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs({
  panes,
}: {
  panes: { value: string; label: string; count?: number; node: React.ReactNode }[];
}) {
  return (
    <Tabs defaultValue={panes[0]?.value}>
      <div className="hide-scrollbar -mx-1 mb-6 overflow-x-auto px-1">
        <TabsList>
          {panes.map((pane) => (
            <TabsTrigger key={pane.value} value={pane.value}>
              {pane.label}
              {pane.count !== undefined && <span className="opacity-50">{pane.count}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {panes.map((pane) => (
        <TabsContent key={pane.value} value={pane.value}>
          {pane.node}
        </TabsContent>
      ))}
    </Tabs>
  );
}
