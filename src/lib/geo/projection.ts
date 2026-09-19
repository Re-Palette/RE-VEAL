/**
 * Equirectangular projection, matching scripts/generate-world-map.mjs exactly.
 *
 * Keeping the projection to two lines of arithmetic means marker positions and
 * the generated country paths can never drift apart, and the whole map runs
 * without a geo library at runtime.
 */
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

/** The visible window: Antarctica and the empty northern ice are cropped out. */
export const VIEW_MIN_LAT = -58;
export const VIEW_MAX_LAT = 84;

export interface Point {
  x: number;
  y: number;
}

export function project(lat: number, lng: number): Point {
  return {
    x: (MAP_WIDTH * (lng + 180)) / 360,
    y: (MAP_HEIGHT * (90 - lat)) / 180,
  };
}

export function unproject(x: number, y: number): { lat: number; lng: number } {
  return {
    lng: (x / MAP_WIDTH) * 360 - 180,
    lat: 90 - (y / MAP_HEIGHT) * 180,
  };
}

export const VIEWBOX = {
  x: 0,
  y: project(VIEW_MAX_LAT, 0).y,
  width: MAP_WIDTH,
  height: project(VIEW_MIN_LAT, 0).y - project(VIEW_MAX_LAT, 0).y,
};

export const VIEWBOX_STRING = `${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`;

/** Region framing used by the map's location filter. */
export const REGION_FOCUS: Record<string, { lat: number; lng: number; zoom: number }> = {
  worldwide: { lat: 20, lng: 20, zoom: 1 },
  asia: { lat: 25, lng: 115, zoom: 2.6 },
  europe: { lat: 50, lng: 10, zoom: 3.4 },
  "north-america": { lat: 40, lng: -100, zoom: 2.6 },
  "south-america": { lat: -20, lng: -60, zoom: 2.6 },
  oceania: { lat: -30, lng: 150, zoom: 2.8 },
  africa: { lat: 5, lng: 20, zoom: 2.4 },
};
