import type { City } from "@/lib/types";

/**
 * The contract every map engine implements.
 *
 * `SvgWorldMap` is the current engine. A Mapbox or Google Maps engine only has
 * to accept these props — no consumer of <WorldMap> changes.
 */
export interface MapMarker {
  city: City;
  /** Headline number shown on the marker. */
  count: number;
  /** Optional match score — when present the marker is drawn as a match pin. */
  score?: number;
  breakdown: { projects: number; brands: number; events: number; people: number };
}

export interface MapEngineProps {
  markers: MapMarker[];
  selectedCityId?: string;
  onSelectCity: (cityId: string | undefined) => void;
  /** Region key from REGION_FOCUS; the engine frames itself to it. */
  focus: string;
  /** Highlights match scores rather than raw counts. */
  personalised: boolean;
  className?: string;
}

export type MapEngine = React.ComponentType<MapEngineProps>;
