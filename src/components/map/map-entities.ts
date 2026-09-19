import type { BeautyCategory, MatchResult } from "@/lib/types";

/**
 * A flattened, serialisable view of everything the map can plot.
 *
 * The map page filters across four entity types at once, so rather than send
 * four full datasets to the client we project them into one shape carrying only
 * what the filters, markers and city panel need.
 */
export interface MapEntity {
  id: string;
  kind: "person" | "brand" | "project" | "event";
  name: string;
  subtitle: string;
  detail: string;
  href: string;
  seed: string;
  cityIds: string[];
  categories: BeautyCategory[];
  score: number;
  /** Audience flags, so the People-side filters stay a single pass. */
  isStudent: boolean;
  isCreator: boolean;
  isProfessional: boolean;
  /** True when this entity is actively looking for people. */
  recruiting: boolean;
}

export const AUDIENCE_FILTERS = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "creators", label: "Creators" },
  { id: "brands", label: "Brands" },
  { id: "projects", label: "Projects" },
  { id: "events", label: "Events" },
  { id: "students", label: "Students" },
  { id: "professionals", label: "Professionals" },
] as const;

export type AudienceFilter = (typeof AUDIENCE_FILTERS)[number]["id"];

export function matchesAudience(entity: MapEntity, audience: AudienceFilter): boolean {
  switch (audience) {
    case "all":
      return true;
    case "people":
      return entity.kind === "person";
    case "creators":
      return entity.kind === "person" && entity.isCreator;
    case "students":
      return entity.kind === "person" && entity.isStudent;
    case "professionals":
      return entity.kind === "person" && entity.isProfessional;
    case "brands":
      return entity.kind === "brand";
    case "projects":
      return entity.kind === "project";
    case "events":
      return entity.kind === "event";
    default:
      return true;
  }
}

export function scoreOf(matches: MatchResult[], id: string, fallback = 70): number {
  return matches.find((m) => m.targetId === id)?.score ?? fallback;
}
