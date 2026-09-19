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
import { CITY_BY_ID } from "@/lib/data/geo";
import { CATEGORY_LABELS, EVENT_TYPE_LABELS, REGION_LABELS } from "@/lib/labels";
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

const SORTS: { value: SortKey; label: string }[] = [
  { value: "date", label: "Soonest" },
  { value: "match", label: "Best match" },
  { value: "attending", label: "Most attending" },
];

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
  const cityParam = params.get("city") ?? undefined;

  const [query, setQuery] = useState("");
  const [type, setType] = useState<EventType | "all">("all");
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [region, setRegion] = useState<string>("all");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [city, setCity] = useState<string | undefined>(cityParam);
  const [sort, setSort] = useState<SortKey>("date");
  const [showMap, setShowMap] = useState(true);

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
        const haystack = [event.title, event.summary, event.venue, event.hostName, CITY_BY_ID.get(event.cityId)?.name ?? ""]
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
        eyebrow="Connect"
        title="Events"
        description="POPUPs, exhibitions, conferences, meetups, workshops and competitions — plotted on the same map as everything else."
        action={
          <Button variant="outline" size="sm" onClick={() => setShowMap((open) => !open)}>
            <MapIcon />
            {showMap ? "Hide map" : "Show map"}
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
              Showing events in <span className="font-semibold text-ink">{cityById.get(city)?.name}</span>.{" "}
              <button
                onClick={() => {
                  setCity(undefined);
                  router.replace("/events", { scroll: false });
                }}
                className="font-medium text-lavender hover:underline"
              >
                Show every city
              </button>
            </p>
          )}
        </div>
      )}

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder="Search events by title, host or venue…"
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
              label="Attendance"
              tone="lavender"
              value={onlineOnly ? "online" : "any"}
              onChange={(value) => setOnlineOnly(value === "online")}
              options={[
                { value: "any", label: "In person and online" },
                { value: "online", label: "Online available" },
              ]}
            />
          </>
        }
      >
        <ChipGroup
          label="Event type"
          value={type}
          onChange={setType}
          options={[
            { value: "all" as const, label: "All events" },
            ...EVENT_TYPES.map((t) => ({ value: t, label: EVENT_TYPE_LABELS[t] })),
          ]}
        />
        <MultiChipGroup
          label="Beauty category"
          values={categories}
          onToggle={(value) =>
            setCategories((current) =>
              current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
            )
          }
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        />
        <ChipGroup label="Sort" value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing scheduled with those filters"
          description="Try another region or clear the city selection on the map above."
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
