import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { EventsDirectory } from "@/app/events/events-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Events",
  description: "Beauty POPUPs, exhibitions, conferences, meetups, workshops and competitions worldwide.",
};

export default async function EventsPage() {
  const [events, matches, cities] = await Promise.all([
    db.listEvents(),
    db.matchesFor("event", 200),
    db.listCities(),
  ]);
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <EventsDirectory events={events} matches={matches} cities={cities} />
    </Suspense>
  );
}
