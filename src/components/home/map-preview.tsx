"use client";

import { useRouter } from "next/navigation";
import { WorldMap } from "@/components/map/world-map";
import type { MapMarker } from "@/components/map/types";

/** Home's map is a real map, not a picture of one — clicking a city opens it. */
export function MapPreview({ markers }: { markers: MapMarker[] }) {
  const router = useRouter();
  return (
    <WorldMap
      markers={markers}
      focus="worldwide"
      personalised
      onSelectCity={(cityId) => {
        if (cityId) router.push(`/map?city=${cityId}`);
      }}
      className="aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[4/3]"
    />
  );
}
