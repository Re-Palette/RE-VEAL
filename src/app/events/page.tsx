import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { EventsDirectory } from "@/app/events/events-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Events",
  description: "Beauty POPUPs, exhibitions, conferences, meetups, workshops and competitions worldwide.",
};

export default async function EventsPage() {
  const i18n = await getI18n();
  const [events, matches, cities] = await Promise.all([
    db.listEvents(),
    db.matchesFor("event", 200, i18n.language),
    db.listCities(),
  ]);
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <EventsDirectory events={events} matches={matches} cities={cities} />
    </Suspense>
  );
}
