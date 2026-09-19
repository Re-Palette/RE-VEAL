import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { cityOpportunityCounts, cityTotals } from "@/lib/match/city-stats";
import { BRAND_TYPE_LABELS, EVENT_TYPE_LABELS, PROJECT_TYPE_LABELS, ROLE_LABELS } from "@/lib/labels";
import { CITY_BY_ID } from "@/lib/data/geo";
import { scoreOf, type MapEntity } from "@/components/map/map-entities";
import { MapExplorer } from "@/app/map/map-explorer";

export const metadata: Metadata = {
  title: "Global Map",
  description: "Find people, brands, projects, events and opportunities anywhere in the world.",
};

export default async function MapPage() {
  const [viewer, people, brands, projects, events, cities] = await Promise.all([
    db.getCurrentUser(),
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
    db.listCities(),
  ]);

  const [personMatches, brandMatches, projectMatches, eventMatches, cityMatches] = await Promise.all([
    db.matchesFor("person", 200),
    db.matchesFor("brand", 200),
    db.matchesFor("project", 200),
    db.matchesFor("event", 200),
    db.matchesFor("city", 200),
  ]);

  const entities: MapEntity[] = [
    ...people
      .filter((p) => p.id !== viewer.id)
      .map<MapEntity>((person) => {
        const roles = [person.profile.role, ...person.profile.secondaryRoles];
        return {
          id: person.id,
          kind: "person",
          name: person.name,
          subtitle: ROLE_LABELS[person.profile.role],
          detail: person.profile.headline,
          href: `/people/${person.id}`,
          seed: person.avatarSeed,
          cityIds: [person.profile.cityId],
          categories: person.profile.categories,
          score: scoreOf(personMatches, person.id),
          isStudent: roles.includes("student"),
          isCreator: roles.includes("creator") || roles.includes("video-creator"),
          isProfessional:
            person.profile.experience === "established" || person.profile.experience === "expert",
          recruiting: person.profile.availability === "open-now",
        };
      }),
    ...brands.map<MapEntity>((brand) => ({
      id: brand.id,
      kind: "brand",
      name: brand.name,
      subtitle: BRAND_TYPE_LABELS[brand.type],
      detail: brand.tagline,
      href: `/brands/${brand.id}`,
      seed: brand.avatarSeed,
      cityIds: [brand.cityId, ...brand.marketCityIds],
      categories: brand.categories,
      score: scoreOf(brandMatches, brand.id),
      isStudent: brand.type === "student-brand",
      isCreator: false,
      isProfessional: true,
      recruiting: brand.openOpportunities.length > 0,
    })),
    ...projects.map<MapEntity>((project) => ({
      id: project.id,
      kind: "project",
      name: project.title,
      subtitle: PROJECT_TYPE_LABELS[project.type],
      detail: project.summary,
      href: `/projects/${project.id}`,
      seed: project.coverSeed,
      cityIds: project.cityIds,
      categories: project.categories,
      score: scoreOf(projectMatches, project.id),
      isStudent: false,
      isCreator: false,
      isProfessional: true,
      recruiting: project.status === "recruiting",
    })),
    ...events.map<MapEntity>((event) => ({
      id: event.id,
      kind: "event",
      name: event.title,
      subtitle: EVENT_TYPE_LABELS[event.type],
      detail: event.summary,
      href: `/events/${event.id}`,
      seed: event.coverSeed,
      cityIds: [event.cityId],
      categories: event.categories,
      score: scoreOf(eventMatches, event.id),
      isStudent: false,
      isCreator: false,
      isProfessional: true,
      recruiting: false,
    })),
  ];

  const cityInfo = cities.map((city) => ({
    city,
    match: cityMatches.find((m) => m.targetId === city.id),
    personalCounts: cityOpportunityCounts(viewer, city.id),
    totals: cityTotals(city.id),
  }));

  return (
    // The explorer reads ?city= from the URL, so it needs a boundary to stream past.
    <Suspense fallback={<MapSkeleton />}>
      <MapExplorer
        cities={cityInfo}
        entities={entities}
        viewerCityName={CITY_BY_ID.get(viewer.profile.cityId)?.name ?? ""}
        viewerRole={ROLE_LABELS[viewer.profile.role]}
        viewerCategories={viewer.profile.categories}
      />
    </Suspense>
  );
}

function MapSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="shimmer-line h-9 w-72 rounded-full" />
      <div className="mt-6 shimmer-line h-28 rounded-panel" />
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="shimmer-line h-[56vh] min-h-[340px] rounded-panel" />
        <div className="shimmer-line hidden h-[56vh] rounded-panel xl:block" />
      </div>
    </div>
  );
}
