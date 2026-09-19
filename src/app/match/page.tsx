import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { MatchBoard } from "@/app/match/match-board";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Match",
  description: "Beauty collaboration matching across people, brands, projects and events.",
};

export default async function MatchPage() {
  const i18n = await getI18n();
  const [viewer, people, brands, projects, events] = await Promise.all([
    db.getCurrentUser(),
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const [person, brand, project, event] = await Promise.all([
    db.matchesFor("person", 24, i18n.language),
    db.matchesFor("brand", 16, i18n.language),
    db.matchesFor("project", 16, i18n.language),
    db.matchesFor("event", 16, i18n.language),
  ]);

  const others = people.filter((p) => p.id !== viewer.id);

  return (
    <Suspense fallback={<ListingSkeleton />}>
      <MatchBoard
        people={others}
        brands={brands}
        projects={projects}
        events={events}
        matches={{ person, brand, project, event }}
        connections={await db.connectionStatuses()}
      />
    </Suspense>
  );
}
