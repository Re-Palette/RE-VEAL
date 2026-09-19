"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PersonCard } from "@/components/cards/person-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import { LANGUAGE_LABELS } from "@/lib/i18n";
import { CITY_BY_ID } from "@/lib/data/geo";
import {
  AVAILABILITY,
  BEAUTY_CATEGORIES,
  LANGUAGES,
  OPEN_TO,
  REGIONS,
  ROLES,
  type Availability,
  type BeautyCategory,
  type ConnectionStatus,
  type LanguageCode,
  type MatchResult,
  type OpenTo,
  type PersonView,
  type Role,
} from "@/lib/types";

type SortKey = "match" | "followers" | "newest" | "name";

export function PeopleDirectory({
  people,
  matches,
  connections,
}: {
  people: PersonView[];
  matches: MatchResult[];
  connections: Record<string, ConnectionStatus>;
}) {
  const params = useSearchParams();
  const { t, L, skill: skillName, city: cityName } = useI18n();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [categories, setCategories] = useState<BeautyCategory[]>(() => {
    const initial = params.get("category") as BeautyCategory | null;
    return initial && BEAUTY_CATEGORIES.includes(initial) ? [initial] : [];
  });
  const [region, setRegion] = useState<string>("all");
  const [availability, setAvailability] = useState<Availability | "all">("all");
  const [languages, setLanguages] = useState<LanguageCode[]>([]);
  const [openTo, setOpenTo] = useState<OpenTo[]>([]);
  const [sort, setSort] = useState<SortKey>("match");

  const cityFilter = params.get("city") ?? undefined;
  const skillFilter = params.get("skill") ?? undefined;

  const scoreById = useMemo(() => new Map(matches.map((m) => [m.targetId, m])), [matches]);

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = people.filter((person) => {
      const p = person.profile;
      if (cityFilter && p.cityId !== cityFilter) return false;
      if (skillFilter && !p.skillIds.includes(skillFilter)) return false;
      if (role !== "all" && p.role !== role && !p.secondaryRoles.includes(role)) return false;
      if (categories.length > 0 && !p.categories.some((c) => categories.includes(c))) return false;
      if (region !== "all" && CITY_BY_ID.get(p.cityId)?.region !== region) return false;
      if (availability !== "all" && p.availability !== availability) return false;
      if (languages.length > 0 && !p.languages.some((l) => languages.includes(l))) return false;
      if (openTo.length > 0 && !p.openTo.some((o) => openTo.includes(o))) return false;
      if (q) {
        const haystack = [
          person.name,
          person.handle,
          p.headline,
          p.bio,
          L.role[p.role],
          cityName(p.cityId),
          ...p.skillIds.map((id) => skillName(id)),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "followers":
          return b.profile.followers - a.profile.followers;
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return (scoreById.get(b.id)?.score ?? 0) - (scoreById.get(a.id)?.score ?? 0);
      }
    });
  }, [people, query, role, categories, region, availability, languages, openTo, sort, scoreById, cityFilter, skillFilter]);

  const activeCount =
    (role !== "all" ? 1 : 0) +
    (categories.length > 0 ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (availability !== "all" ? 1 : 0) +
    (languages.length > 0 ? 1 : 0) +
    (openTo.length > 0 ? 1 : 0) +
    (query ? 1 : 0);

  const clear = () => {
    setQuery("");
    setRole("all");
    setCategories([]);
    setRegion("all");
    setAvailability("all");
    setLanguages([]);
    setOpenTo([]);
  };

  const contextLabel = [cityFilter ? cityName(cityFilter) : undefined, skillFilter ? skillName(skillFilter) : undefined]
    .filter(Boolean)
    .join(" · ");

  const SORTS: { value: SortKey; label: string }[] = [
    { value: "match", label: t("people.sort.match") },
    { value: "followers", label: t("people.sort.followers") },
    { value: "newest", label: t("people.sort.newest") },
    { value: "name", label: t("people.sort.name") },
  ];

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.connect")}
        title={t("people.title")}
        description={
          contextLabel
            ? t("people.descriptionFiltered", { context: contextLabel })
            : t("people.description")
        }
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder={t("people.searchPlaceholder")}
        resultCount={filtered.length}
        activeCount={activeCount}
        onClear={clear}
        advancedCount={
          (region !== "all" ? 1 : 0) +
          (availability !== "all" ? 1 : 0) +
          (languages.length > 0 ? 1 : 0) +
          (openTo.length > 0 ? 1 : 0)
        }
        advanced={
          <>
            <ChipGroup
              label={t("common.location")}
              tone="sky"
              value={region}
              onChange={setRegion}
              options={[
                { value: "all", label: t("common.worldwide") },
                ...REGIONS.map((r) => ({ value: r as string, label: L.region[r] })),
              ]}
            />
            <ChipGroup
              label={t("common.availability")}
              tone="lavender"
              value={availability}
              onChange={setAvailability}
              options={[
                { value: "all" as const, label: t("common.any") },
                ...AVAILABILITY.map((a) => ({ value: a, label: L.availability[a] })),
              ]}
            />
            <MultiChipGroup
              label={t("common.languages")}
              tone="mint"
              values={languages}
              onToggle={(value) => toggle(languages, value, setLanguages)}
              options={LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_LABELS[l] }))}
            />
            <MultiChipGroup
              label={t("common.openTo")}
              tone="sky"
              values={openTo}
              onToggle={(value) => toggle(openTo, value, setOpenTo)}
              options={OPEN_TO.map((o) => ({ value: o, label: L.openTo[o] }))}
            />
          </>
        }
      >
        <ChipGroup
          label={t("common.role")}
          value={role}
          onChange={setRole}
          options={[
            { value: "all" as const, label: t("people.allRoles") },
            ...ROLES.map((r) => ({ value: r, label: L.role[r] })),
          ]}
        />
        <MultiChipGroup
          label={t("common.beautyCategory")}
          values={categories}
          onToggle={(value) => toggle(categories, value, setCategories)}
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: L.category[c] }))}
        />
        <ChipGroup label={t("common.sort")} value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("people.empty.title")}
          description={t("people.empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              match={scoreById.get(person.id)}
              connection={connections[person.id] ?? "none"}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
