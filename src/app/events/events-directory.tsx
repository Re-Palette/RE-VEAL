"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Map as MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { EventCard } from "@/components/cards/event-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { WorldMap } from "@/components/map/world-map";
import { useI18n } from "@/lib/i18n/context";
import { CITY_BY_ID } from "@/lib/data/geo";
import {
  BEAUTY_CATEGORIES,
  EVENT_TYPES,
  REGIONS,
  type BeautyEvent,
  type BeautyCategory,
  type City,
  type EventType,
  type MatchResult,
} from "@/lib/types";
import type { MapMarker } from "@/components/map/types";

type SortKey = "date" | "match" | "attending";

export function EventsDirectory({
  events,
  matches,
  cities,
}: {
  events: BeautyEvent[];
  matches: MatchResult[];
  cities: City[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const { t, L, city: cityLabel } = useI18n();
  const cityParam = params.get("city") ?? undefined;

  const [query, setQuery] = useState("");
  const [type, setType] = useState<EventType | "all">("all");
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [region, setRegion] = useState<string>("all");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [city, setCity] = useState<string | undefined>(cityParam);
  const [sort, setSort] = useState<SortKey>("date");
  const [showMap, setShowMap] = useState(true);

  const SORTS: { value: SortKey; label: string }[] = [
    { value: "date", label: t("events.sort.date") },
    { value: "match", label: t("people.sort.match") },
    { value: "attending", label: t("events.sort.attending") },
  ];

  const scoreById = useMemo(() => new Map(matches.map((m) => [m.targetId, m])), [matches]);
  const cityById = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = events.filter((event) => {
      if (city && event.cityId !== city) return false;
      if (type !== "all" && event.type !== type) return false;
      if (categories.length > 0 && !event.categories.some((c) => categories.includes(c))) return false;
      if (region !== "all" && CITY_BY_ID.get(event.cityId)?.region !== region) return false;
      if (onlineOnly && !event.online) return false;
      if (q) {
        const haystack = [event.title, event.summary, event.venue, event.hostName, cityLabel(event.cityId)]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "match":
          return (scoreById.get(b.id)?.score ?? 0) - (scoreById.get(a.id)?.score ?? 0);
        case "attending":
          return b.attending - a.attending;
        default:
          return a.startDate.localeCompare(b.startDate);
      }
    });
  }, [events, query, type, categories, region, onlineOnly, city, sort, scoreById]);

  // The events map is the same engine as the global map, fed a narrower set.
  const markers: MapMarker[] = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((event) => counts.set(event.cityId, (counts.get(event.cityId) ?? 0) + 1));
    return Array.from(counts.entries()).flatMap(([cityId, count]) => {
      const found = cityById.get(cityId);
      if (!found) return [];
      return [{ city: found, count, breakdown: { projects: 0, brands: 0, events: count, people: 0 } }];
    });
  }, [filtered, cityById]);

  const activeCount =
    (type !== "all" ? 1 : 0) +
    (categories.length > 0 ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (onlineOnly ? 1 : 0) +
    (city ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.connect")}
        title={t("events.title")}
        description={t("events.description")}
        action={
          <Button variant="outline" size="sm" onClick={() => setShowMap((open) => !open)}>
            <MapIcon />
            {showMap ? t("events.hideMap") : t("events.showMap")}
          </Button>
        }
      />

      {showMap && (
        <div className="mb-6">
          <WorldMap
            markers={markers}
            selectedCityId={city}
            onSelectCity={(next) => {
              setCity(next);
              router.replace(next ? `/events?city=${next}` : "/events", { scroll: false });
            }}
            focus={region === "all" ? "worldwide" : region}
            personalised={false}
            className="aspect-[4/3] w-full sm:aspect-[2.4/1]"
          />
          {city && (
            <p className="mt-3 text-sm text-ink-50">
              {t("events.showingIn", { city: cityLabel(city) })}{" "}
              <button
                onClick={() => {
                  setCity(undefined);
                  router.replace("/events", { scroll: false });
                }}
                className="font-medium text-lavender hover:underline"
              >
                {t("events.showAllCities")}
              </button>
            </p>
          )}
        </div>
      )}

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder={t("events.searchPlaceholder")}
        resultCount={filtered.length}
        activeCount={activeCount}
        onClear={() => {
          setQuery("");
          setType("all");
          setCategories([]);
          setRegion("all");
          setOnlineOnly(false);
          setCity(undefined);
          router.replace("/events", { scroll: false });
        }}
        advancedCount={(region !== "all" ? 1 : 0) + (onlineOnly ? 1 : 0)}
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
              label={t("events.filter.attendance")}
              tone="lavender"
              value={onlineOnly ? "online" : "any"}
              onChange={(value) => setOnlineOnly(value === "online")}
              options={[
                { value: "any", label: t("events.filter.inPersonOnline") },
                { value: "online", label: t("events.filter.onlineAvailable") },
              ]}
            />
          </>
        }
      >
        <ChipGroup
          label={t("events.filter.type")}
          value={type}
          onChange={setType}
          options={[
            { value: "all" as const, label: t("events.filter.allEvents") },
            ...EVENT_TYPES.map((type) => ({ value: type, label: L.eventType[type] })),
          ]}
        />
        <MultiChipGroup
          label={t("common.beautyCategory")}
          values={categories}
          onToggle={(value) =>
            setCategories((current) =>
              current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
            )
          }
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: L.category[c] }))}
        />
        <ChipGroup label={t("common.sort")} value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t("events.empty.title")}
          description={t("events.empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} match={scoreById.get(event.id)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
