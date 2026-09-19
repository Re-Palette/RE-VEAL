"use client";

import { useRouter } from "next/navigation";
import { WorldMap } from "@/components/map/world-map";
import type { City } from "@/lib/types";

/** A single-pin map for detail pages. Clicking the pin opens the full map. */
export function CityMap({ city, className }: { city: City; className?: string }) {
  const router = useRouter();
  return (
    <WorldMap
      markers={[{ city, count: 1, breakdown: { projects: 0, brands: 0, events: 1, people: 0 } }]}
      selectedCityId={city.id}
      onSelectCity={() => router.push(`/map?city=${city.id}`)}
      focus={city.region}
      personalised={false}
      className={className}
    />
  );
}
