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
  // Naming a role means people are wanted, even when the sentence also names a
  // brand or a project — "students to build a cosmetics brand with" is a
  // request for students, not only for brands.
  const requested = intent.roles.length > 0 ? [...kinds, "person" as const] : kinds;
  const targetKinds = requested.length > 0 ? Array.from(new Set(requested)) : ALL_KINDS;

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

  const hasIntent = wantedCities.size > 0 || intent.categories.length > 0 || intent.roles.length > 0;

  const scored = batches.flat().map((result) => {
    let bonus = 0;
    // How many facets of what the user actually asked for this result satisfies.
    let hits = 0;
    const extra: MatchResult["reasons"] = [];

    if (wantedCities.size > 0) {
      const cities = cityOf.get(result.targetId) ?? [];
      const named = cities.find((c) => wantedCities.has(c));
      if (named) {
        bonus += 9;
        hits += 1;
        extra.push({
          kind: "location",
          label: `Matches "${CITY_BY_ID.get(named)?.name ?? "your location"}"`,
          weight: 99,
        });
      }
    }

    if (intent.categories.length > 0) {
      const cats = categoriesOf.get(result.targetId) ?? [];
      const matched = intent.categories.filter((c) => cats.includes(c));
      if (matched.length > 0) {
        bonus += 6 * matched.length;
        hits += 1;
        extra.push({ kind: "category", label: `You asked for ${matched.join(", ")}`, weight: 98 });
      }
    }

    if (intent.roles.length > 0) {
      const roles = rolesOf.get(result.targetId) ?? [];
      const matched = intent.roles.filter((r) => roles.includes(r));
      if (matched.length > 0) {
        bonus += 7;
        hits += 1;
        extra.push({ kind: "opportunity", label: `Role you asked for: ${matched[0]}`, weight: 97 });
      }
    }

    // Diminishing returns near the ceiling: a flat bonus would push every strong
    // baseline match to 99 and flatten the ranking the user actually asked for.
    const score = Math.min(99, Math.round(result.score + bonus * ((100 - result.score) / 45)));

    return { hits, result: { ...result, score, reasons: [...extra, ...result.reasons].slice(0, 6) } };
  });

  // What was asked for outranks what merely scores well: a strong baseline match
  // that satisfies none of the stated facets belongs below a weaker one that does.
  scored.sort((a, b) => (hasIntent ? b.hits - a.hits : 0) || b.result.score - a.result.score);

  const results = scored.map((entry) => entry.result).slice(0, 18);
  return NextResponse.json({ intent, results, interpreter: "rule-based" });
}
