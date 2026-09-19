"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PersonCard } from "@/components/cards/person-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { CITY_BY_ID } from "@/lib/data/geo";
import { SKILL_BY_ID } from "@/lib/data/taxonomy";
import {
  AVAILABILITY_LABELS,
  CATEGORY_LABELS,
  LANGUAGE_LABELS,
  OPEN_TO_LABELS,
  REGION_LABELS,
  ROLE_LABELS,
} from "@/lib/labels";
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

const SORTS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "followers", label: "Most followed" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "A–Z" },
];

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
          ROLE_LABELS[p.role],
          CITY_BY_ID.get(p.cityId)?.name ?? "",
          ...p.skillIds.map((id) => SKILL_BY_ID.get(id)?.label ?? ""),
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

  const contextLabel = [
    cityFilter ? CITY_BY_ID.get(cityFilter)?.name : undefined,
    skillFilter ? SKILL_BY_ID.get(skillFilter)?.label : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Connect"
        title="People"
        description={
          contextLabel
            ? `Filtered to ${contextLabel}. Every profile is a working portfolio, not a follower count.`
            : "Beauty students, creators, artists and professionals across 34 cities. Every profile is a working portfolio, not a follower count."
        }
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name, skill, city or what they want to build…"
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
              label="Location"
              tone="sky"
              value={region}
              onChange={setRegion}
              options={[
                { value: "all", label: "Worldwide" },
                ...REGIONS.map((r) => ({ value: r as string, label: REGION_LABELS[r] })),
              ]}
            />
            <ChipGroup
              label="Availability"
              tone="lavender"
              value={availability}
              onChange={setAvailability}
              options={[
                { value: "all" as const, label: "Any" },
                ...AVAILABILITY.map((a) => ({ value: a, label: AVAILABILITY_LABELS[a] })),
              ]}
            />
            <MultiChipGroup
              label="Language"
              tone="mint"
              values={languages}
              onToggle={(value) => toggle(languages, value, setLanguages)}
              options={LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_LABELS[l] }))}
            />
            <MultiChipGroup
              label="Open to"
              tone="sky"
              values={openTo}
              onToggle={(value) => toggle(openTo, value, setOpenTo)}
              options={OPEN_TO.map((o) => ({ value: o, label: OPEN_TO_LABELS[o] }))}
            />
          </>
        }
      >
        <ChipGroup
          label="Role"
          value={role}
          onChange={setRole}
          options={[{ value: "all" as const, label: "All roles" }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
        />
        <MultiChipGroup
          label="Beauty category"
          values={categories}
          onToggle={(value) => toggle(categories, value, setCategories)}
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        />
        <ChipGroup label="Sort" value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nobody matches those filters yet"
          description="RE:VEAL is global but not infinite. Widen the category, region or availability and try again."
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
