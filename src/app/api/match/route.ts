import { NextResponse } from "next/server";
import { db } from "@/lib/data-source";
import { interpretSync } from "@/lib/match/interpret";
import { CITY_BY_ID } from "@/lib/data/geo";
import type { MatchResult, MatchTargetKind } from "@/lib/types";

const ALL_KINDS: MatchTargetKind[] = ["person", "brand", "project", "event"];

/**
 * AI Match endpoint.
 *
 * Today: intent extraction plus rule-based re-ranking. The request and response
 * shapes are already the ones an LLM-backed implementation would use, so
 * swapping the interpreter for a model call is a change inside this file.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { prompt?: string };
  const prompt = (body.prompt ?? "").trim();
  const intent = interpretSync(prompt);

  const kinds = intent.kinds.filter((k): k is MatchTargetKind => k !== "city");
  const targetKinds = kinds.length > 0 ? kinds : ALL_KINDS;

  const [people, brands, projects, events] = await Promise.all([
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const cityOf = new Map<string, string[]>();
  people.forEach((p) => cityOf.set(p.id, [p.profile.cityId, ...p.profile.targetCityIds]));
  brands.forEach((b) => cityOf.set(b.id, [b.cityId, ...b.marketCityIds]));
  projects.forEach((p) => cityOf.set(p.id, p.cityIds));
  events.forEach((e) => cityOf.set(e.id, [e.cityId]));

  const categoriesOf = new Map<string, string[]>();
  people.forEach((p) => categoriesOf.set(p.id, p.profile.categories));
  brands.forEach((b) => categoriesOf.set(b.id, b.categories));
  projects.forEach((p) => categoriesOf.set(p.id, p.categories));
  events.forEach((e) => categoriesOf.set(e.id, e.categories));

  const rolesOf = new Map<string, string[]>();
  people.forEach((p) => rolesOf.set(p.id, [p.profile.role, ...p.profile.secondaryRoles]));
  brands.forEach((b) => rolesOf.set(b.id, b.lookingFor));
  projects.forEach((p) => rolesOf.set(p.id, p.roleSlots.map((s) => s.role)));

  const wantedCities = new Set(intent.cityIds);
  intent.countryIds.forEach((countryId) => {
    CITY_BY_ID.forEach((city) => {
      if (city.countryId === countryId) wantedCities.add(city.id);
    });
  });

  const batches = await Promise.all(targetKinds.map((kind) => db.matchesFor(kind, 40)));

  const boosted: MatchResult[] = batches.flat().map((result) => {
    let bonus = 0;
    const extra: MatchResult["reasons"] = [];

    if (wantedCities.size > 0) {
      const cities = cityOf.get(result.targetId) ?? [];
      if (cities.some((c) => wantedCities.has(c))) {
        bonus += 9;
        const named = cities.find((c) => wantedCities.has(c));
        extra.push({ kind: "location", label: `Matches "${CITY_BY_ID.get(named ?? "")?.name ?? "your location"}"`, weight: 99 });
      }
    }
    if (intent.categories.length > 0) {
      const cats = categoriesOf.get(result.targetId) ?? [];
      const hit = intent.categories.filter((c) => cats.includes(c));
      if (hit.length > 0) {
        bonus += 6 * hit.length;
        extra.push({ kind: "category", label: `You asked for ${hit.join(", ")}`, weight: 98 });
      }
    }
    if (intent.roles.length > 0) {
      const roles = rolesOf.get(result.targetId) ?? [];
      if (intent.roles.some((r) => roles.includes(r))) {
        bonus += 7;
        extra.push({ kind: "opportunity", label: `Role you asked for`, weight: 97 });
      }
    }

    return {
      ...result,
      score: Math.min(99, result.score + bonus),
      reasons: [...extra, ...result.reasons].slice(0, 6),
    };
  });

  const results = boosted.sort((a, b) => b.score - a.score).slice(0, 18);
  return NextResponse.json({ intent, results, interpreter: "rule-based" });
}
