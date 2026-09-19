"use client";

import { SvgWorldMap } from "@/components/map/svg-world-map";
import type { MapEngineProps } from "@/components/map/types";

/**
 * The single place the map engine is chosen.
 *
 * Swapping to Mapbox or Google Maps means importing a different engine here —
 * every page keeps using <WorldMap /> with the same props.
 */
export function WorldMap(props: MapEngineProps) {
  return <SvgWorldMap {...props} />;
}

export type { MapEngineProps, MapMarker } from "@/components/map/types";
