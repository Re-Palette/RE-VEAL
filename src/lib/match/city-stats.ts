import { BRANDS } from "@/lib/data/brands";
import { EVENTS } from "@/lib/data/events";
import { PEOPLE } from "@/lib/data/people";
import { PROJECTS } from "@/lib/data/projects";
import type { PersonView } from "@/lib/types";
import type { CityOpportunityCounts } from "@/lib/match/engine";

/**
 * Per-city opportunity counts, filtered to what is actually relevant to the
 * viewer. The map's headline numbers and the city match score both read from
 * here so they can never disagree with each other.
 */
export function cityOpportunityCounts(viewer: PersonView, cityId: string): CityOpportunityCounts {
  const v = viewer.profile;
  const roles = [v.role, ...v.secondaryRoles];

  const projects = PROJECTS.filter(
    (p) =>
      p.cityIds.includes(cityId) &&
      p.status !== "completed" &&
      (p.categories.some((c) => v.categories.includes(c)) ||
        p.roleSlots.some((s) => roles.includes(s.role) && s.filled < s.count)),
  ).length;

  const brands = BRANDS.filter(
    (b) =>
      (b.cityId === cityId || b.marketCityIds.includes(cityId)) &&
      (b.lookingFor.some((r) => roles.includes(r)) || b.categories.some((c) => v.categories.includes(c))),
  ).length;

  const events = EVENTS.filter(
    (e) => e.cityId === cityId && e.categories.some((c) => v.categories.includes(c)),
  ).length;

  const people = PEOPLE.filter(
    (p) =>
      p.id !== viewer.id &&
      p.profile.cityId === cityId &&
      p.profile.categories.some((c) => v.categories.includes(c)),
  ).length;

  return { projects, brands, events, people };
}

/** Unfiltered totals — what the map shows before any personalisation. */
export function cityTotals(cityId: string) {
  return {
    projects: PROJECTS.filter((p) => p.cityIds.includes(cityId)).length,
    brands: BRANDS.filter((b) => b.cityId === cityId || b.marketCityIds.includes(cityId)).length,
    events: EVENTS.filter((e) => e.cityId === cityId).length,
    people: PEOPLE.filter((p) => p.profile.cityId === cityId).length,
  };
}
