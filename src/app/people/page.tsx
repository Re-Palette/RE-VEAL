import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { connectionStatusFor } from "@/lib/data/social";
import { PeopleDirectory } from "@/app/people/people-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "People",
  description: "Beauty students, creators, artists and professionals from around the world.",
};

export default async function PeoplePage() {
  const [viewer, people, matches] = await Promise.all([
    db.getCurrentUser(),
    db.listPeople(),
    db.matchesFor("person", 500),
  ]);

  const others = people.filter((p) => p.id !== viewer.id);
  const connections = Object.fromEntries(others.map((p) => [p.id, connectionStatusFor(p.id)]));

  return (
    <Suspense fallback={<ListingSkeleton />}>
      <PeopleDirectory people={others} matches={matches} connections={connections} />
    </Suspense>
  );
}
